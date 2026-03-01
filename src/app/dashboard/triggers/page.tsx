"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
    Activity,
    Check,
    ChevronDown,
    ChevronRight,
    Loader2,
    Pause,
    Play,
    Plus,
    Trash2,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────── */

interface AvailableTrigger {
    name: string;
    displayName: string;
    description?: string;
    appName: string;
    logo?: string;
    type?: string;
}

interface UserTrigger {
    id: string;
    user_id: string;
    connected_account_id: string;
    toolkit: string;
    trigger_slug: string;
    trigger_name?: string;
    trigger_config: Record<string, unknown>;
    is_enabled: boolean;
    event_count: number;
    last_event_at?: string;
    error_count: number;
    created_at: string;
}

interface Integration {
    id: string;
    appName: string;
    status: string;
}

/* ─── Constants ──────────────────────────────────────────────────── */

const TOOLKIT_COLORS: Record<string, string> = {
    github: "#24292e",
    gmail: "#EA4335",
    googlecalendar: "#8b95b0",
    slack: "#ECB22E",
    notion: "#000000",
    linear: "#5E6AD2",
    discord: "#5865F2",
    twitter: "#1DA1F2",
};

const TOOLKIT_DISPLAY: Record<string, string> = {
    github: "GitHub",
    gmail: "Gmail",
    googlecalendar: "Google Calendar",
    slack: "Slack",
    notion: "Notion",
    linear: "Linear",
    discord: "Discord",
    twitter: "Twitter",
};

/* ─── Page Component ─────────────────────────────────────────────── */

export default function TriggersPage() {
    const { user } = useAuth();

    // Data
    const [userTriggers, setUserTriggers] = useState<UserTrigger[]>([]);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [availableTriggers, setAvailableTriggers] = useState<AvailableTrigger[]>([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [showCreatePanel, setShowCreatePanel] = useState(false);
    const [selectedToolkit, setSelectedToolkit] = useState<string | null>(null);
    const [loadingTriggers, setLoadingTriggers] = useState(false);
    const [creating, setCreating] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    /* ─── Load Data ──────────────────────────────────────────────── */

    useEffect(() => {
        if (!user?.id) return;
        loadData();
    }, [user?.id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [triggersRes, integrationsRes] = await Promise.all([
                api.get(`/triggers?userId=${user!.id}`),
                api.get(`/integrations?userId=${user!.id}`),
            ]);
            setUserTriggers(triggersRes.triggers || []);
            setIntegrations(
                (integrationsRes.integrations || []).filter(
                    (i: Integration) => i.status === "connected" || i.status === "ACTIVE"
                )
            );
        } catch (e: any) {
            console.error("Failed to load triggers:", e.message);
        } finally {
            setLoading(false);
        }
    };

    /* ─── Load Available Triggers for a Toolkit ────────────────── */

    const loadAvailableTriggers = async (appName: string) => {
        if (selectedToolkit === appName) {
            setSelectedToolkit(null);
            setAvailableTriggers([]);
            return;
        }

        try {
            setSelectedToolkit(appName);
            setLoadingTriggers(true);
            const data = await api.get(`/triggers/available?appName=${appName}`);
            setAvailableTriggers(data.triggers || []);
        } catch (e: any) {
            console.error("Failed to load triggers:", e.message);
            showToast("Failed to load triggers for this app", "error");
        } finally {
            setLoadingTriggers(false);
        }
    };

    /* ─── Create Trigger ───────────────────────────────────────── */

    const handleCreate = async (trigger: AvailableTrigger) => {
        if (!user?.id || !selectedToolkit) return;

        // Find the connected account for this toolkit
        const connection = integrations.find(
            (i) => i.appName.toLowerCase() === selectedToolkit.toLowerCase()
        );

        if (!connection) {
            showToast("Please connect this app first in Integrations", "error");
            return;
        }

        try {
            setCreating(trigger.name);
            await api.post("/triggers/create", {
                userId: user.id,
                connectedAccountId: connection.id,
                triggerName: trigger.name,
                toolkit: selectedToolkit,
                config: {},
            });

            showToast(`${trigger.displayName} trigger created`, "success");
            setShowCreatePanel(false);
            setSelectedToolkit(null);
            setAvailableTriggers([]);
            loadData();
        } catch (e: any) {
            showToast(e.message || "Failed to create trigger", "error");
        } finally {
            setCreating(null);
        }
    };

    /* ─── Toggle Trigger ───────────────────────────────────────── */

    const handleToggle = async (trigger: UserTrigger) => {
        try {
            setTogglingId(trigger.id);
            const endpoint = trigger.is_enabled ? "/triggers/disable" : "/triggers/enable";
            await api.post(endpoint, { triggerId: trigger.id });

            setUserTriggers((prev) =>
                prev.map((t) =>
                    t.id === trigger.id ? { ...t, is_enabled: !t.is_enabled } : t
                )
            );

            showToast(
                `Trigger ${trigger.is_enabled ? "paused" : "resumed"}`,
                "success"
            );
        } catch (e: any) {
            showToast(e.message || "Failed to update trigger", "error");
        } finally {
            setTogglingId(null);
        }
    };

    /* ─── Delete Trigger ───────────────────────────────────────── */

    const handleDelete = async (triggerId: string) => {
        try {
            setDeletingId(triggerId);
            await api.post("/triggers/delete", { triggerId });
            setUserTriggers((prev) => prev.filter((t) => t.id !== triggerId));
            showToast("Trigger removed", "success");
        } catch (e: any) {
            showToast(e.message || "Failed to delete trigger", "error");
        } finally {
            setDeletingId(null);
        }
    };

    /* ─── Toast Helper ─────────────────────────────────────────── */

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    /* ─── Format Helpers ───────────────────────────────────────── */

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatSlug = (slug: string) =>
        slug
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    /* ─── Render ───────────────────────────────────────────────── */

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top fade-in duration-300 ${toast.type === "success"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-red-500/90 text-white"
                        }`}
                >
                    {toast.type === "success" ? <Check size={16} /> : <Zap size={16} />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-semibold text-[var(--text-primary)]">
                        Triggers
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Automations that watch for events across your connected apps
                    </p>
                </div>

                {!loading && integrations.length > 0 && (
                    <button
                        onClick={() => setShowCreatePanel(!showCreatePanel)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        <Plus size={16} />
                        New
                    </button>
                )}
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
                </div>
            ) : (
                <>
                    {/* ─── Create Panel ─────────────────────────────────── */}
                    {showCreatePanel && (
                        <div className="mb-8 space-y-3">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">
                                Choose an app to set up a trigger
                            </p>

                            {/* Connected apps list */}
                            <div className="space-y-2">
                                {integrations.map((integration) => {
                                    const appKey = integration.appName.toLowerCase();
                                    const color = TOOLKIT_COLORS[appKey] || "#8b95b0";
                                    const displayName = TOOLKIT_DISPLAY[appKey] || integration.appName;
                                    const isExpanded = selectedToolkit === integration.appName;

                                    return (
                                        <div key={integration.id}>
                                            {/* App row */}
                                            <button
                                                onClick={() => loadAvailableTriggers(integration.appName)}
                                                className="w-full flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 hover:border-[var(--accent)]/30 transition-colors"
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {displayName.charAt(0)}
                                                </div>
                                                <span className="flex-1 text-left text-sm font-medium text-[var(--text-primary)]">
                                                    {displayName}
                                                </span>
                                                {isExpanded ? (
                                                    <ChevronDown size={16} className="text-[var(--text-muted)]" />
                                                ) : (
                                                    <ChevronRight size={16} className="text-[var(--text-muted)]" />
                                                )}
                                            </button>

                                            {/* Expanded: available triggers */}
                                            {isExpanded && (
                                                <div className="ml-4 mt-2 space-y-1.5">
                                                    {loadingTriggers ? (
                                                        <div className="flex items-center justify-center py-4">
                                                            <Loader2
                                                                size={16}
                                                                className="animate-spin text-[var(--text-muted)]"
                                                            />
                                                        </div>
                                                    ) : availableTriggers.length > 0 ? (
                                                        availableTriggers.map((trigger) => (
                                                            <div
                                                                key={trigger.name}
                                                                className="flex items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2.5"
                                                            >
                                                                <Zap
                                                                    size={14}
                                                                    className="text-[var(--text-muted)] flex-shrink-0"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm text-[var(--text-primary)] truncate">
                                                                        {trigger.displayName}
                                                                    </p>
                                                                    {trigger.description && (
                                                                        <p className="text-xs text-[var(--text-muted)] truncate">
                                                                            {trigger.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleCreate(trigger)}
                                                                    disabled={creating === trigger.name}
                                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                                                >
                                                                    {creating === trigger.name ? (
                                                                        <Loader2 size={12} className="animate-spin" />
                                                                    ) : (
                                                                        <Plus size={12} />
                                                                    )}
                                                                    Add
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-[var(--text-muted)] py-3 px-2">
                                                            No triggers available for this app
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ─── Active Triggers ──────────────────────────────── */}
                    {userTriggers.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                Active Automations
                            </p>

                            {userTriggers.map((trigger) => {
                                const toolkitKey = trigger.toolkit?.toLowerCase() || "";
                                const color = TOOLKIT_COLORS[toolkitKey] || "#8b95b0";
                                const toolkitName = TOOLKIT_DISPLAY[toolkitKey] || trigger.toolkit;
                                const isToggling = togglingId === trigger.id;
                                const isDeleting = deletingId === trigger.id;

                                return (
                                    <div
                                        key={trigger.id}
                                        className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 sm:px-5 py-4 transition-opacity ${!trigger.is_enabled ? "opacity-60" : ""
                                            }`}
                                    >
                                        {/* Top row */}
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs mt-0.5"
                                                style={{ backgroundColor: color }}
                                            >
                                                {toolkitName.charAt(0)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                                                    {trigger.trigger_name || formatSlug(trigger.trigger_slug)}
                                                </h3>
                                                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                                    {toolkitName} · {trigger.is_enabled ? "Active" : "Paused"}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleToggle(trigger)}
                                                    disabled={isToggling}
                                                    className="p-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                    title={trigger.is_enabled ? "Pause" : "Resume"}
                                                >
                                                    {isToggling ? (
                                                        <Loader2 size={15} className="animate-spin" />
                                                    ) : trigger.is_enabled ? (
                                                        <Pause size={15} />
                                                    ) : (
                                                        <Play size={15} />
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(trigger.id)}
                                                    disabled={isDeleting}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-[var(--text-muted)] hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    {isDeleting ? (
                                                        <Loader2 size={15} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={15} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Stats row */}
                                        <div className="flex items-center gap-4 mt-3 ml-12">
                                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                                <Activity size={12} />
                                                <span>{trigger.event_count || 0} events</span>
                                            </div>
                                            {trigger.last_event_at && (
                                                <span className="text-xs text-[var(--text-muted)]">
                                                    Last: {formatDate(trigger.last_event_at)}
                                                </span>
                                            )}
                                            {trigger.error_count > 0 && (
                                                <span className="text-xs text-red-400">
                                                    {trigger.error_count} errors
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* ─── Empty State ──────────────────────────────── */
                        !showCreatePanel && (
                            <div className="text-center py-16 space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mx-auto">
                                    <Zap size={24} className="text-[var(--accent)]" />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                                        No triggers yet
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                                        Triggers watch for events in your connected apps and can
                                        automate responses. Set one up to get started.
                                    </p>
                                </div>
                                {integrations.length > 0 ? (
                                    <button
                                        onClick={() => setShowCreatePanel(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                                    >
                                        <Plus size={16} />
                                        Create your first trigger
                                    </button>
                                ) : (
                                    <p className="text-xs text-[var(--text-muted)]">
                                        Connect an app in{" "}
                                        <a
                                            href="/dashboard/integrations"
                                            className="text-[var(--accent)] underline"
                                        >
                                            Integrations
                                        </a>{" "}
                                        first
                                    </p>
                                )}
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}
