import { ClerkProvider } from "@clerk/clerk-react";
import { Outlet } from "react-router-dom";

const clerkStudentPublishableKey = import.meta.env.VITE_CLERK_STUDENT_PUBLISHABLE_KEY;

if (!clerkStudentPublishableKey) {
  throw new Error("VITE_CLERK_STUDENT_PUBLISHABLE_KEY is not set");
}

export function StudentClerkProvider() {
  return (
    <ClerkProvider publishableKey={clerkStudentPublishableKey} signInUrl="/" signUpUrl="/">
      <Outlet />
    </ClerkProvider>
  );
}
