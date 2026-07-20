import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function getAdminIdentifiers() {
  return `${process.env.ADMIN_EMAILS ?? ""},${process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? ""}`
    .split(",")
    .map((identifier) => identifier.trim().toLowerCase())
    .filter(Boolean);
}

function getPrimaryEmail(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) {
    return null;
  }

  return user.emailAddresses
    .find((email: { id: string; emailAddress: string }) => email.id === user.primaryEmailAddressId)
    ?.emailAddress.toLowerCase() ?? null;
}

function isAdminUser(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) {
    return false;
  }

  const primaryEmail = getPrimaryEmail(user);
  const isAdminByRole = user.publicMetadata.role === "admin";
  const identifiers = getAdminIdentifiers();
  const emailUsername = primaryEmail?.split("@")[0] ?? null;
  const isAdminByEmail = primaryEmail
    ? identifiers.includes(primaryEmail) || Boolean(emailUsername && identifiers.includes(emailUsername))
    : false;

  return isAdminByRole || isAdminByEmail;
}

export async function getAdminViewer() {
  const user = await currentUser();
  const primaryEmail = getPrimaryEmail(user);
  const displayName =
    user?.firstName ||
    user?.fullName ||
    primaryEmail?.split("@")[0] ||
    "User";

  return {
    displayName,
    isAdmin: isAdminUser(user),
    isSignedIn: Boolean(user),
  };
}

export async function requireAdmin() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!isAdminUser(user)) {
    redirect("/");
  }

  return user;
}

