import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — CalmPilot",
  description: "Privacy Policy for CalmPilot, the AI-powered digital proxy.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 mb-12">
          Last updated: March 2025
        </p>

        <div className="space-y-10 text-[15px] leading-relaxed text-zinc-400">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Overview</h2>
            <p>
              CalmPilot (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Data We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium text-zinc-300 mb-2">Account Information</h3>
                <p>When you sign in with Google, we receive your name, email address, and profile picture. This is used to create and identify your account.</p>
              </div>
              <div>
                <h3 className="text-base font-medium text-zinc-300 mb-2">Third-Party Integration Data</h3>
                <p>When you connect apps (Gmail, Slack, GitHub, etc.), we access data from those services only as needed to execute your instructions. OAuth tokens are stored securely and never shared.</p>
              </div>
              <div>
                <h3 className="text-base font-medium text-zinc-300 mb-2">Conversation History</h3>
                <p>Your chat messages with CalmPilot are stored to provide context for ongoing conversations. You can configure automatic deletion or delete your history at any time from Settings.</p>
              </div>
              <div>
                <h3 className="text-base font-medium text-zinc-300 mb-2">Usage Data</h3>
                <p>We collect information about how you use the Service (actions taken, messages sent, features accessed) to improve the product and manage your subscription.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-500">
              <li>To authenticate you and maintain your account</li>
              <li>To execute AI automations and tasks on your behalf</li>
              <li>To generate daily briefings and summaries</li>
              <li>To manage your subscription and track usage</li>
              <li>To improve the reliability and performance of the Service</li>
              <li>To communicate important updates about your account or the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Sharing</h2>
            <p className="mb-3">
              We do not sell your personal data. We share data only in the following limited circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-500">
              <li><span className="text-zinc-400">Third-party apps you connect:</span> Data is passed to these services as required to complete your instructions</li>
              <li><span className="text-zinc-400">AI model providers:</span> Your prompts are processed by AI providers (e.g., OpenAI) subject to their privacy policies</li>
              <li><span className="text-zinc-400">Legal compliance:</span> We may disclose data if required by law or to protect the rights and safety of users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Data Retention</h2>
            <p>
              You control how long your conversation history is retained. You can set automatic deletion (7 days, 30 days, 90 days) or keep it indefinitely — all from the Settings page. You can delete your account and all associated data at any time from Settings &rarr; Advanced &rarr; Delete Account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Security</h2>
            <p>
              We use industry-standard security practices including encrypted connections (HTTPS/TLS), secure token storage, and row-level security on our database. OAuth tokens are encrypted at rest. We never store your passwords.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-500">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Revoke OAuth access to any connected app at any time</li>
              <li>Export your data (contact us to request)</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:support@calmpilot.app"
                className="text-zinc-300 underline underline-offset-2 hover:text-white transition-colors"
              >
                support@calmpilot.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Cookies</h2>
            <p>
              We use essential session cookies required for authentication. We do not use advertising or tracking cookies. No third-party analytics scripts are loaded without your knowledge.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Children&apos;s Privacy</h2>
            <p>
              CalmPilot is not intended for users under 18 years of age. We do not knowingly collect personal data from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by email or via the Service. Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact</h2>
            <p>
              For privacy-related questions or requests, contact us at{" "}
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
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-zinc-400 transition-colors">Back to CalmPilot</Link>
        </div>
      </div>
    </div>
  );
}
