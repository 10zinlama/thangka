import { test, expect } from "@playwright/test";

test("public pages render without hydration errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /bring home/i })).toBeVisible();
  expect(errors.filter((message) => /hydrated|hydration/i.test(message))).toEqual([]);
});

test("contact form handles successful EmailJS delivery", async ({ page }) => {
  await page.route("https://api.emailjs.com/api/v1.0/email/send", async (route) => {
    await route.fulfill({ status: 200, body: "OK" });
  });
  await page.goto("http://localhost:3000/contact", { waitUntil: "networkidle" });
  await page.getByLabel("Full name").fill("ST Thangka automated verification");
  await page.getByLabel("Email address").fill("st-thangka-check@example.com");
  await page.getByLabel("I am interested in").selectOption({ label: "Order support" });
  await page.getByLabel("Message").fill("Automated delivery check from the local ST Thangka contact form.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("heading", { name: "Message received." })).toBeVisible({ timeout: 30000 });
});

test("unverified success pages do not claim payment", async ({ page }) => {
  await page.goto("http://localhost:3000/success");
  await expect(page.getByRole("heading", { name: "Payment not confirmed" })).toBeVisible();
});
