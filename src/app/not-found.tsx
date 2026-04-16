import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you are looking for does not exist. Return to CalmPilot to continue automating your work.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-200">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-zinc-600">404</h1>
        <h2 className="text-2xl font-semibold text-white">Page not found</h2>
        <p className="text-zinc-400 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-6 py-3 rounded-full font-medium transition-all text-sm border border-zinc-700"
        >
          Back to CalmPilot
        </Link>
      </div>
    </div>
  );
}
