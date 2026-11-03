import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmail } from "@/components/auth/verify-email";

export const metadata: Metadata = {
  title: "Verifica tu correo",
  robots: { index: false },
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
