import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPassword } from "@/components/auth/reset-password";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
