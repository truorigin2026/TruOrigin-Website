import type { Metadata } from "next";
import { BrandLoginForm } from "@/components/auth/brand-login-form";

export const metadata: Metadata = {
  title: "Brand Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <BrandLoginForm />;
}
