import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — CalmPilot",
  description: "Terms of Service for CalmPilot, the AI-powered digital proxy.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-12"
        >
          ← Back to CalmPilot
        </Link>

        <h1 className="text-4xl font-serif font-semibold text-white mb-2 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-500 mb-12">
          Last updated: March 2025
        </p>

        <div className="space-y-10 text-[15px] leading-relaxed text-zinc-400">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using CalmPilot (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              CalmPilot is an AI-powered productivity assistant that connects to third-party applications via OAuth to automate tasks, generate briefings, and execute workflows on your behalf. The AI agent within CalmPilot acts only based on your explicit instructions or pre-configured automations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Eligibility</h2>
            <p>
              You must be at least 18 years old and capable of forming a binding contract to use the Service. By using CalmPilot, you represent that you meet these requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Your Account</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Third-Party Integrations</h2>
            <p>
              CalmPilot connects to third-party services (such as Gmail, Slack, GitHub, and others) using OAuth. By connecting these services, you grant CalmPilot permission to access and act on your data within those services according to your instructions. We are not responsible for the actions, content, or policies of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Acceptable Use</h2>
            <p className="mb-3">You agree not to use CalmPilot to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-500">
              <li>Violate any applicable law or regulation</li>
              <li>Send unsolicited communications (spam)</li>
              <li>Impersonate any person or entity</li>
              <li>Attempt to gain unauthorized access to any system</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Subscriptions and Billing</h2>
            <p>
              CalmPilot offers free and paid subscription plans. Paid plans are billed monthly via our payment processor Dodo Payments. Each plan includes a set number of messages per month. Once your monthly limit is reached, messaging is paused until the next billing cycle. Subscriptions can be cancelled at any time. We reserve the right to modify pricing with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, CalmPilot and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. CalmPilot is a tool that acts on your instructions — you are responsible for reviewing and approving significant actions before they are executed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time for violations of these terms or for any other reason with reasonable notice. You may delete your account at any time from the Settings page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by email or via the Service. Continued use after changes take effect constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a
                href="mailto:support@calmpilot.app"
                className="text-zinc-300 underline underline-offset-2 hover:text-white transition-colors"
              >
                support@calmpilot.app
              </a>
              .
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800 flex gap-6 text-sm text-zinc-600">
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-zinc-400 transition-colors">Back to CalmPilot</Link>
        </div>
      </div>
    </div>
  );
}
