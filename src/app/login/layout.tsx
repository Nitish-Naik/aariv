import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — CalmPilot",
  description: "Sign in to your CalmPilot account to access your AI work assistant.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://calmpilot.app/login" },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
