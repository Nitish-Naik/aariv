"use client";

import { motion } from "framer-motion";
import { Layers, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function IntegrationsShowcase() {
    return (
        <section className="py-24 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Left Card: Integrations */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-background border border-border rounded-xl p-8 lg:p-12 hover:bg-muted transition-colors flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mb-8">
                                <Layers strokeWidth={1.5} className="text-muted-foreground w-5 h-5" />
                            </div>

                            <h3 className="text-xl font-semibold text-foreground mb-3">1000+ Integrations</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
                                Connect to all of your favourite apps in a single click.
                            </p>
                        </div>

                        {/* Integration Grid Icon Wall */}
                        <div className="grid grid-cols-5 gap-3">
                            {/* Row 1 */}
                            <div className="aspect-square bg-card rounded-xl border border-border flex items-center justify-center p-3"><Image src="/images/google-drive-svgrepo-com.svg" width={24} height={24} alt="Drive" /></div>
                            <div className="aspect-square bg-card rounded-xl border border-border flex items-center justify-center p-3"><Image src="/images/github-142-svgrepo-com.svg" width={24} height={24} alt="GitHub" /></div>
                            <div className="aspect-square bg-card rounded-xl border border-border flex items-center justify-center p-3"><Image src="/images/notion-svgrepo-com.svg" width={24} height={24} alt="Notion" /></div>
                            <div className="aspect-square bg-card rounded-xl border border-border flex items-center justify-center p-3 opacity-80"><Image src="/images/stripe-v2-svgrepo-com.svg" width={24} height={24} alt="Stripe" /></div>
                            <div className="aspect-square bg-muted/50 rounded-xl border border-border flex items-center justify-center p-4 opacity-40"><Image src="/images/asana-svgrepo-com.svg" width={24} height={24} alt="Asana" /></div>

                            {/* Row 2 */}
                            <div className="aspect-square bg-muted/50 rounded-xl border border-border flex items-center justify-center p-4 opacity-40"><Image src="/images/linear-svgrepo-com.svg" width={24} height={24} alt="Linear" /></div>
                            <div className="aspect-square bg-card rounded-xl border border-border flex items-center justify-center p-3"><Image src="/images/slack-svgrepo-com.svg" width={24} height={24} alt="Slack" /></div>
                            <div className="aspect-square bg-card rounded-xl border border-border flex items-center justify-center p-3"><Image src="/images/airtable-svgrepo-com.svg" width={24} height={24} alt="Airtable" /></div>
                            <div className="aspect-square bg-card rounded-xl border border-border flex items-center justify-center p-3"><Image src="/images/google-calendar-svgrepo-com.svg" width={24} height={24} alt="Calendar" /></div>
                            <div className="aspect-square bg-muted/50 rounded-xl border border-border flex items-center justify-center p-4 opacity-40"><Image src="/images/hubspot-svgrepo-com.svg" width={24} height={24} alt="Hubspot" /></div>

                            {/* Row 3 */}
                            <div className="aspect-square bg-muted/50 rounded-xl border border-border flex items-center justify-center p-4 opacity-40"><Image src="/images/discord-icon-svgrepo-com.svg" width={24} height={24} alt="Discord" /></div>
                            <div className="aspect-square bg-card rounded-xl border border-border flex items-center justify-center p-3"><Image src="/images/trello-svgrepo-com.svg" width={24} height={24} alt="Trello" /></div>
                            <div className="aspect-square bg-card rounded-xl border border-border flex items-center justify-center p-3"><Image src="/images/todoist-svgrepo-com.svg" width={24} height={24} alt="Todoist" /></div>
                            <div className="aspect-square bg-muted/50 rounded-xl border border-border flex items-center justify-center p-4 opacity-40"><Image src="/images/google-gmail-svgrepo-com.svg" width={24} height={24} alt="Gmail" /></div>
                            <div className="aspect-square bg-muted/50 rounded-xl border border-border flex items-center justify-center p-4 opacity-40"><Image src="/images/atlassian-svgrepo-com.svg" width={24} height={24} alt="Atlassian" /></div>
                        </div>

                        <div className="mt-4 text-center">
                            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">+ 985 more</span>
                        </div>
                    </motion.div>

                    {/* Right Card: Messaging Apps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-background border border-border rounded-xl p-8 lg:p-12 hover:bg-muted transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mb-8">
                            <MessageCircle strokeWidth={1.5} className="text-muted-foreground w-5 h-5" />
                        </div>

                        <h3 className="text-xl font-semibold text-foreground mb-3">Every Messaging App</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
                            Chat with your AI on Telegram, WhatsApp, Discord, or Slack.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-500">✈️</span>
                                    <span className="text-sm font-medium text-foreground">Telegram</span>
                                </div>
                            </div>
                            <div className="bg-muted/50 border border-border rounded-xl p-3 flex items-center justify-between opacity-50">
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-500">💬</span>
                                    <span className="text-sm font-medium text-muted-foreground">WhatsApp</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">Soon</span>
                            </div>
                            <div className="bg-muted/50 border border-border rounded-xl p-3 flex items-center justify-between opacity-50">
                                <div className="flex items-center gap-2">
                                    <span className="text-indigo-500">🎮</span>
                                    <span className="text-sm font-medium text-muted-foreground">Discord</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">Soon</span>
                            </div>
                            <div className="bg-muted/50 border border-border rounded-xl p-3 flex items-center justify-between opacity-50">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#E01E5A]">#</span>
                                    <span className="text-sm font-medium text-muted-foreground">Slack</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">Soon</span>
                            </div>
                        </div>

                        <div className="mt-4 bg-muted/50 border border-border rounded-xl p-3 text-center opacity-60">
                            <span className="text-xs text-muted-foreground font-medium">More coming soon</span>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
