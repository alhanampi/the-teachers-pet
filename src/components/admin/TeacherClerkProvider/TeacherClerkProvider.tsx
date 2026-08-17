import { ClerkProvider } from "@clerk/clerk-react";
import { Outlet } from "react-router-dom";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("VITE_CLERK_PUBLISHABLE_KEY is not set");
}

export function TeacherClerkProvider() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} signInUrl="/auth" afterSignOutUrl="/auth">
      <Outlet />
    </ClerkProvider>
  );
}
