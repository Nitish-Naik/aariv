"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "What is CalmPilot?",
    answer:
      "CalmPilot is an AI-powered digital proxy that connects to over 1000 apps through secure OAuth integrations and quietly handles your work 24/7. It automates workflows, sends daily briefings, manages smart triggers, and provides an AI chat assistant — all while keeping you in control with human-in-the-loop approval for sensitive actions.",
  },
  {
    question: "How does CalmPilot differ from Zapier or Make?",
    answer:
      "Unlike Zapier or Make which require you to build workflows manually step by step, CalmPilot uses natural language AI to understand what you need and orchestrate complex multi-step workflows automatically. Just describe what you want in plain English and CalmPilot handles the rest across 1000+ OAuth integrations.",
  },
  {
    question: "What apps does CalmPilot integrate with?",
    answer:
      "CalmPilot integrates with 1000+ apps including Gmail, Slack, Notion, GitHub, Linear, Jira, Google Calendar, Google Drive, Stripe, Airtable, Asana, Trello, Discord, HubSpot, Todoist, and many more. All integrations use OAuth for secure, password-free connections you can revoke at any time.",
  },
  {
    question: "Is CalmPilot secure?",
    answer:
      "Yes. CalmPilot uses OAuth-only authentication — your passwords are never stored or shared. All code execution happens in isolated sandboxed cloud environments, and CalmPilot always pauses for your approval before taking any sensitive or destructive action.",
  },
  {
    question: "How is CalmPilot different from ChatGPT or Claude?",
    answer:
      "While ChatGPT and Claude are conversational AI models that generate text, CalmPilot is an AI agent that takes real action on your behalf. It connects directly to your apps via OAuth and can send emails, create tasks, update databases, and run complex multi-app workflows autonomously — not just generate responses.",
  },
  {
    question: "Can CalmPilot run tasks while I sleep?",
    answer:
      "Yes. CalmPilot runs 24/7 and can execute scheduled tasks, respond to triggers, and handle incoming work at any time. Wake up to prepared summaries, triaged inboxes, drafted replies, and completed workflows.",
  },
  {
    question: "What are smart triggers in CalmPilot?",
    answer:
      "Smart triggers are automated rules that tell CalmPilot to take action when specific events occur across your connected apps. For example: when a customer email arrives in Gmail, automatically draft a reply and log it in Notion. Triggers can chain multiple apps together in a single workflow.",
  },
  {
    question: "Is CalmPilot free to use?",
    answer:
      "CalmPilot offers a free tier to get started with core automation and integrations. Premium plans are available for power users who need advanced features, more triggers, and higher usage limits.",
  },
];

export default function FAQ() {
  return (
    <section className="py-24 lg:py-32 bg-black border-t border-white/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-zinc-400 font-light">
            Everything you need to know about CalmPilot.
          </p>
        </motion.div>

        <Accordion
          multiple
          defaultValue={["item-0", "item-3"]}
          className="w-full space-y-3"
        >
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
            >
              <AccordionItem
                value={`item-${idx}`}
                className="border border-white/10 rounded-xl overflow-hidden bg-black px-1 data-[state=open]:bg-neutral-900 transition-colors"
              >
                <AccordionTrigger className="w-full text-left px-5 py-5 text-white font-medium hover:no-underline [&[data-state=open]]:text-indigo-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 text-neutral-400 leading-relaxed text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
