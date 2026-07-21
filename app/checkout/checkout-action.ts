"use server";

import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getProduct } from "@/lib/products";

type CheckoutItem = { id: string; quantity: number };

export const checkoutAction = async (formData: FormData): Promise<void> => {
  let checkoutUrl: string;

  try {
    const user = await currentUser();
    if (!user) {
      redirect("/sign-in");
    }

    const requestHeaders = await headers();
    assertSameOrigin(requestHeaders);

    const rawItems = formData.get("items");
    if (typeof rawItems !== "string") throw new CheckoutProblem("Your cart could not be read.");

    let items: CheckoutItem[];
    try {
      items = JSON.parse(rawItems) as CheckoutItem[];
    } catch {
      throw new CheckoutProblem("Your cart contains invalid data.");
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
      throw new CheckoutProblem("Your cart is empty or contains too many items.");
    }

    const stripe = getStripe();
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const quantity = Math.max(1, Math.min(10, Math.floor(Number(item.quantity))));
      if (typeof item.id !== "string" || !Number.isFinite(quantity)) {
        throw new CheckoutProblem("One of the cart items is invalid.");
      }

      const catalogProduct = await getProduct(item.id);
      if (
        !catalogProduct ||
        !catalogProduct.active ||
        catalogProduct.unitAmount === null ||
        catalogProduct.availability === "out_of_stock" ||
        !catalogProduct.stripeProductId.startsWith("prod_")
      ) {
        throw new CheckoutProblem("One of the cart items is no longer available.");
      }

      const product = await stripe.products.retrieve(catalogProduct.stripeProductId, {
        expand: ["default_price"],
      });
      const price = product.default_price;
      if (!product.active || !price || typeof price === "string" || !price.active) {
        throw new CheckoutProblem(`${product.name} is not currently available for checkout.`);
      }

      const checkoutPrice = await getPaymentPrice(stripe, product, price);
      lineItems.push({ price: checkoutPrice.id, quantity });
    }

    const baseUrl = getCheckoutBaseUrl(requestHeaders);

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      client_reference_id: user.id,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        source: "st_thangka_store",
      },
    });

    if (!session.url) throw new CheckoutProblem("Stripe did not return a checkout URL.");
    checkoutUrl = session.url;
  } catch (error) {
    if (error instanceof CheckoutProblem) {
      redirect(`/checkout?checkout_error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect(checkoutUrl);
};

class CheckoutProblem extends Error {}

function assertSameOrigin(requestHeaders: Headers) {
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("host");
  if (!origin || !host) return;

  try {
    if (new URL(origin).host !== host) {
      throw new CheckoutProblem("Checkout request origin could not be verified.");
    }
  } catch {
    throw new CheckoutProblem("Checkout request origin could not be verified.");
  }
}

function getCheckoutBaseUrl(requestHeaders: Headers) {
  const configuredOrigin = process.env.NEXT_PUBLIC_BASE_URL;
  const fallbackHost = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const fallbackProtocol = requestHeaders.get("x-forwarded-proto") || "https";
  const candidate = configuredOrigin || (fallbackHost ? `${fallbackProtocol}://${fallbackHost}` : "http://localhost:3000");

  try {
    const url = new URL(candidate);
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
      throw new Error("Production checkout must use HTTPS.");
    }
    return url.origin;
  } catch {
    throw new CheckoutProblem("Checkout URL is not configured correctly.");
  }
}

function isPaymentPrice(price: Stripe.Price) {
  return price.active && price.type === "one_time" && !price.recurring;
}

async function getPaymentPrice(stripe: Stripe, product: Stripe.Product, defaultPrice: Stripe.Price) {
  if (isPaymentPrice(defaultPrice)) return defaultPrice;

  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });
  const oneTimePrices = existingPrices.data.filter(isPaymentPrice);
  const matchingOneTimePrice =
    oneTimePrices.find(
      (price) =>
        price.currency === defaultPrice.currency &&
        price.unit_amount === defaultPrice.unit_amount
    ) ?? oneTimePrices[0];

  if (matchingOneTimePrice) {
    await stripe.products.update(product.id, { default_price: matchingOneTimePrice.id });
    return matchingOneTimePrice;
  }

  const amount =
    defaultPrice.unit_amount !== null
      ? { unit_amount: defaultPrice.unit_amount }
      : defaultPrice.unit_amount_decimal
        ? { unit_amount_decimal: defaultPrice.unit_amount_decimal }
        : null;

  if (!amount) {
    throw new CheckoutProblem(`${product.name} needs a one-time Stripe price before checkout.`);
  }

  const oneTimePrice = await stripe.prices.create(
    {
      ...amount,
      currency: defaultPrice.currency,
      product: product.id,
      metadata: {
        created_by: "st_thangka_checkout_repair",
        replaced_recurring_price: defaultPrice.id,
      },
      nickname: defaultPrice.nickname || `${product.name} checkout price`,
    },
    { idempotencyKey: `st-thangka-one-time-${defaultPrice.id}` }
  );

  await stripe.products.update(product.id, { default_price: oneTimePrice.id });
  return oneTimePrice;
}
