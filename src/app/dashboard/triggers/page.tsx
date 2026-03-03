"use client";

import { Sheet } from "@/components/ui/Sheet";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  Info,
  Loader2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────── */

interface TriggerConfigProperty {
  title?: string;
  description?: string;
  type?: string;
  default?: unknown;
  enum?: string[];
}

interface TriggerConfigSchema {
  properties?: Record<string, TriggerConfigProperty>;
  required?: string[];
}

interface AvailableTrigger {
  slug: string;
  displayName: string;
  description?: string;
  type?: "webhook" | "poll" | string;
  instructions?: string;
  config?: TriggerConfigSchema;
  payload?: Record<string, unknown>;
  toolkit?: string;
  toolkitName?: string;
  toolkitLogo?: string;
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
  displayName?: string;
  logo?: string;
  status: string;
}

interface TriggerStats {
  total: number;
  active: number;
  paused: number;
  totalEvents: number;
  totalErrors: number;
}

interface TriggerEvent {
  id: string;
  trigger_id: string;
  event_type: string;
  trigger_slug: string;
  status: string;
  error: string | null;
  processing_time_ms: number | null;
  created_at: string;
}

/* ─── Constants ──────────────────────────────────────────────────── */

const PLATFORM_LOGOS: Record<string, string> = {
  gmail:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%23f2f2f2' x='2' y='4' width='20' height='16' rx='2'/%3E%3Cpath fill='%23ea4335' d='M2 6l10 7 10-7'/%3E%3Cpath fill='%23ea4335' d='M2 4l10 8 10-8' stroke='%23ea4335' stroke-width='1.5' fill='none'/%3E%3C/svg%3E",
  googlecalendar:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%234285f4' x='2' y='2' width='20' height='20' rx='3'/%3E%3Crect fill='%23fff' x='5' y='7' width='14' height='13' rx='1'/%3E%3Crect fill='%23ea4335' x='5' y='7' width='14' height='3'/%3E%3Crect fill='%234285f4' x='8' y='12' width='3' height='2' rx='.5'/%3E%3Crect fill='%234285f4' x='13' y='12' width='3' height='2' rx='.5'/%3E%3Crect fill='%234285f4' x='8' y='16' width='3' height='2' rx='.5'/%3E%3Crect fill='%234285f4' x='13' y='16' width='3' height='2' rx='.5'/%3E%3C/svg%3E",
  slack:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle fill='%23e01e5a' cx='6' cy='15' r='2'/%3E%3Crect fill='%23e01e5a' x='8' y='13' width='4' height='4' rx='2'/%3E%3Ccircle fill='%2336c5f0' cx='9' cy='6' r='2'/%3E%3Crect fill='%2336c5f0' x='7' y='8' width='4' height='4' rx='2'/%3E%3Ccircle fill='%232eb67d' cx='18' cy='9' r='2'/%3E%3Crect fill='%232eb67d' x='12' y='7' width='4' height='4' rx='2'/%3E%3Ccircle fill='%23ecb22e' cx='15' cy='18' r='2'/%3E%3Crect fill='%23ecb22e' x='13' y='12' width='4' height='4' rx='2'/%3E%3C/svg%3E",
  github:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z'/%3E%3C/svg%3E",
  notion:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' fill-rule='evenodd' d='M4 3.5C4 2.672 4.56 2 5.25 2h9.792L20.25 7v13.5c0 .828-.56 1.5-1.25 1.5H5.25C4.56 22 4 21.328 4 20.5zM6 5.5v15h12v-11h-4.5a.5.5 0 01-.5-.5V5.5zm9 .707V9h2.793zM7.5 12a.5.5 0 01.5-.5h8a.5.5 0 010 1H8a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h8a.5.5 0 010 1H8a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h5a.5.5 0 010 1H8a.5.5 0 01-.5-.5z'/%3E%3C/svg%3E",
  twitter:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E",
};

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

/* ─── Trigger Type Badge ─────────────────────────────────────────── */

function TriggerTypeBadge({ type }: { type?: string }) {
  const isWebhook = type === "webhook";
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${isWebhook
        ? "bg-emerald-500/10 text-emerald-500"
        : "bg-blue-500/10 text-blue-500"
        }`}
    >
      {isWebhook ? <Globe size={9} /> : <RefreshCw size={9} />}
      {isWebhook ? "Webhook" : "Poll"}
    </span>
  );
}

/* ─── Config Form Modal ──────────────────────────────────────────── */

function ConfigFormModal({
  trigger,
  onSubmit,
  onClose,
  isSubmitting,
}: {
  trigger: AvailableTrigger;
  onSubmit: (config: Record<string, string>) => void;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const props = trigger.config?.properties || {};
  const required = trigger.config?.required || [];
  const fields = Object.entries(props);
  const hasFields = fields.length > 0;

  const [values, setValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const [key, prop] of fields) {
      if (prop.default !== undefined && prop.default !== null) {
        defaults[key] = String(prop.default);
      } else if (prop.type === "number" || prop.type === "integer") {
        // Sensible default for numeric fields like polling interval
        defaults[key] = "1";
      }
    }
    return defaults;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only send non-empty values
    const config: Record<string, string> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val.trim()) config[key] = val.trim();
    }
    onSubmit(config);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
              <Zap size={16} className="text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {trigger.displayName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <TriggerTypeBadge type={trigger.type} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-muted)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        >
          {trigger.description && (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {trigger.description}
            </p>
          )}

          {trigger.instructions && (
            <div className="flex items-start gap-2 bg-blue-500/8 border border-blue-500/15 rounded-lg px-3 py-2.5">
              <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-200 leading-relaxed">
                {trigger.instructions}
              </p>
            </div>
          )}

          {hasFields ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Configuration
              </p>
              {fields.map(([key, prop]) => {
                const isRequired = required.includes(key);
                return (
                  <div key={key} className="space-y-1">
                    <label className="flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)]">
                      {prop.title || key}
                      {isRequired && <span className="text-red-400">*</span>}
                    </label>
                    {prop.description && (
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        {prop.description}
                      </p>
                    )}
                    {prop.enum ? (
                      <select
                        value={values[key] || ""}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [key]: e.target.value }))
                        }
                        required={isRequired}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      >
                        <option value="">Select...</option>
                        {prop.enum.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={
                          prop.type === "number" || prop.type === "integer"
                            ? "number"
                            : "text"
                        }
                        min={
                          prop.type === "number" || prop.type === "integer"
                            ? 1
                            : undefined
                        }
                        placeholder={
                          prop.default !== undefined && prop.default !== ""
                            ? `Default: ${prop.default}`
                            : `Enter ${(prop.title || key).toLowerCase()}…`
                        }
                        value={values[key] || ""}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [key]: e.target.value }))
                        }
                        required={isRequired}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic">
              This trigger requires no additional configuration.
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Zap size={14} />
            )}
            Create Trigger
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page Component ─────────────────────────────────────────────── */

export default function TriggersPage() {
  const { user } = useAuth();

  // Data
  const [userTriggers, setUserTriggers] = useState<UserTrigger[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [availableTriggers, setAvailableTriggers] = useState<
    AvailableTrigger[]
  >([]);

  // Stats & events
  const [stats, setStats] = useState<TriggerStats | null>(null);
  const [expandedTriggerId, setExpandedTriggerId] = useState<string | null>(null);
  const [triggerEvents, setTriggerEvents] = useState<TriggerEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [viewTab, setViewTab] = useState<"triggers" | "activity">("triggers");
  const [activityEvents, setActivityEvents] = useState<TriggerEvent[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTriggers = useMemo(() => {
    if (!searchQuery) return userTriggers;
    const q = searchQuery.toLowerCase();
    return userTriggers.filter((t) => {
      const name = (t.trigger_name || formatSlug(t.trigger_slug)).toLowerCase();
      const app = (TOOLKIT_DISPLAY[t.toolkit?.toLowerCase() || ""] || t.toolkit).toLowerCase();
      return name.includes(q) || app.includes(q);
    });
  }, [userTriggers, searchQuery]);
  const [selectedToolkit, setSelectedToolkit] = useState<string | null>(null);
  const [loadingTriggers, setLoadingTriggers] = useState(false);
  const [configuringTrigger, setConfiguringTrigger] =
    useState<AvailableTrigger | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  /* ─── Load Data ──────────────────────────────────────────────── */

  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [triggersRes, triggerAppsRes, statsRes] = await Promise.all([
        api.get(`/triggers?userId=${user!.id}`),
        api.get(`/triggers/trigger-apps?userId=${user!.id}`),
        api.get(`/triggers/stats?userId=${user!.id}`).catch(() => null),
      ]);
      setUserTriggers(triggersRes.triggers || []);
      setIntegrations(triggerAppsRes.apps || []);
      if (statsRes) setStats(statsRes);
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

  /* ─── Create Trigger (with config) ─────────────────────────── */

  const openConfigModal = (trigger: AvailableTrigger) => {
    const hasConfig =
      trigger.config?.properties &&
      Object.keys(trigger.config.properties).length > 0;

    if (hasConfig) {
      setConfiguringTrigger(trigger);
    } else {
      // No config needed — create immediately
      handleCreate(trigger, {});
    }
  };

  const handleCreate = useCallback(
    async (trigger: AvailableTrigger, config: Record<string, string>) => {
      if (!user?.id || !selectedToolkit) return;

      const connection = integrations.find(
        (i) => i.appName.toLowerCase() === selectedToolkit.toLowerCase(),
      );

      if (!connection) {
        showToast("Please connect this app first in Integrations", "error");
        return;
      }

      try {
        setCreating(trigger.slug);
        await api.post("/triggers/create", {
          userId: user.id,
          connectedAccountId: connection.id,
          triggerName: trigger.slug,
          toolkit: selectedToolkit,
          config,
        });

        showToast(`${trigger.displayName} trigger created`, "success");
        setShowCreatePanel(false);
        setSelectedToolkit(null);
        setAvailableTriggers([]);
        setConfiguringTrigger(null);
        loadData();
      } catch (e: any) {
        showToast(e.message || "Failed to create trigger", "error");
      } finally {
        setCreating(null);
      }
    },
    [user?.id, selectedToolkit, integrations],
  );

  /* ─── Toggle Trigger ───────────────────────────────────────── */

  const handleToggle = async (trigger: UserTrigger) => {
    try {
      setTogglingId(trigger.id);
      const endpoint = trigger.is_enabled
        ? "/triggers/disable"
        : "/triggers/enable";
      await api.post(endpoint, { triggerId: trigger.id });

      setUserTriggers((prev) =>
        prev.map((t) =>
          t.id === trigger.id ? { ...t, is_enabled: !t.is_enabled } : t,
        ),
      );

      showToast(
        `Trigger ${trigger.is_enabled ? "paused" : "resumed"}`,
        "success",
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

  /* ─── Load Events for a Trigger ─────────────────────────── */

  const loadTriggerEvents = async (triggerId: string) => {
    if (expandedTriggerId === triggerId) {
      setExpandedTriggerId(null);
      setTriggerEvents([]);
      return;
    }
    try {
      setExpandedTriggerId(triggerId);
      setLoadingEvents(true);
      const data = await api.get(`/triggers/events?userId=${user!.id}&triggerId=${triggerId}&limit=10`);
      setTriggerEvents(data.events || []);
    } catch {
      setTriggerEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  /* ─── Load Global Activity ─────────────────────────────── */

  const loadActivity = async () => {
    if (!user?.id) return;
    try {
      setLoadingActivity(true);
      const data = await api.get(`/triggers/events?userId=${user.id}&limit=30`);
      setActivityEvents(data.events || []);
    } catch {
      setActivityEvents([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (viewTab === "activity") loadActivity();
  }, [viewTab]);

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
    slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

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

      {/* Config Modal */}
      {configuringTrigger && (
        <ConfigFormModal
          trigger={configuringTrigger}
          onSubmit={(config) => handleCreate(configuringTrigger, config)}
          onClose={() => setConfiguringTrigger(null)}
          isSubmitting={creating === configuringTrigger.slug}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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

      {/* Stats Cards */}
      {stats && stats.total > 0 && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Active", value: stats.active, color: "text-emerald-500" },
            { label: "Paused", value: stats.paused, color: "text-zinc-400" },
            { label: "Events", value: stats.totalEvents, color: "text-[var(--accent)]" },
            { label: "Errors", value: stats.totalErrors, color: stats.totalErrors > 0 ? "text-red-400" : "text-zinc-500" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3">
              <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* View Tabs */}
      {!loading && userTriggers.length > 0 && (
        <div className="flex items-center gap-1 mb-6 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-1 w-fit">
          {(["triggers", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setViewTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
                viewTab === tab
                  ? "bg-[rgba(255,255,255,0.08)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab === "triggers" ? "Triggers" : "Activity Log"}
            </button>
          ))}
        </div>
      )}

      {/* Loading — skeleton cards */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 w-36 rounded bg-[var(--bg-surface)] animate-pulse mb-2" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 sm:px-5 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--border)] animate-pulse" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="h-3.5 w-40 rounded bg-[var(--border)] animate-pulse" />
                  <div className="h-3 w-24 rounded bg-[var(--border)] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ─── Create Panel ─────────────────────────────────── */}
          <Sheet
            isOpen={showCreatePanel}
            onClose={() => setShowCreatePanel(false)}
            title="Create Automation"
            description="Choose an app to set up a trigger"
          >
            <div className="space-y-3 pb-8">

              {/* Connected apps list */}
              <div className="space-y-2">
                {integrations.map((integration) => {
                  const appKey = integration.appName.toLowerCase();
                  const color = TOOLKIT_COLORS[appKey] || "#8b95b0";
                  const displayName =
                    integration.displayName ||
                    TOOLKIT_DISPLAY[appKey] ||
                    integration.appName;
                  const isExpanded = selectedToolkit === integration.appName;

                  return (
                    <div key={integration.id}>
                      {/* App row */}
                      <button
                        onClick={() =>
                          loadAvailableTriggers(integration.appName)
                        }
                        className="w-full flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 hover:border-[var(--accent)]/30 transition-colors"
                      >
                        {(() => {
                          const logoSrc =
                            integration.logo || PLATFORM_LOGOS[appKey];
                          return logoSrc ? (
                            <img
                              src={logoSrc}
                              alt={displayName}
                              className="w-8 h-8 rounded-lg object-contain"
                              onError={(e) => {
                                // Hide broken image, show letter fallback
                                const parent = e.currentTarget.parentElement;
                                e.currentTarget.style.display = "none";
                                if (parent) {
                                  const fb = document.createElement("div");
                                  fb.className =
                                    "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs";
                                  fb.style.backgroundColor = color;
                                  fb.textContent = displayName.charAt(0);
                                  parent.prepend(fb);
                                }
                              }}
                            />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                              style={{ backgroundColor: color }}
                            >
                              {displayName.charAt(0)}
                            </div>
                          );
                        })()}
                        <span className="flex-1 text-left text-sm font-medium text-[var(--text-primary)]">
                          {displayName}
                        </span>
                        {isExpanded ? (
                          <ChevronDown
                            size={16}
                            className="text-[var(--text-muted)]"
                          />
                        ) : (
                          <ChevronRight
                            size={16}
                            className="text-[var(--text-muted)]"
                          />
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
                                key={trigger.slug}
                                className="flex items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2.5"
                              >
                                <Zap
                                  size={14}
                                  className="text-[var(--text-muted)] flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-[var(--text-primary)] truncate">
                                      {trigger.displayName}
                                    </p>
                                    <TriggerTypeBadge type={trigger.type} />
                                  </div>
                                  {trigger.description && (
                                    <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                                      {trigger.description}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => openConfigModal(trigger)}
                                  disabled={creating === trigger.slug}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                  {creating === trigger.slug ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
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
          </Sheet>

          {/* ─── Suggested Templates (1-Click) ────────────────── */}
          {!searchQuery && userTriggers.length < 5 && (
            <div className="mb-10 space-y-4">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Start with a Template
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Slack on new PR",
                    desc: "Notify a channel when a GitHub Pull Request is opened.",
                    apps: ["github", "slack"],
                  },
                  {
                    title: "Notion release notes",
                    desc: "Draft a document when Linear issues are marked 'Done'.",
                    apps: ["linear", "notion"],
                  },
                  {
                    title: "Gmail triage",
                    desc: "Auto-label and summarize high-priority incoming emails.",
                    apps: ["gmail"],
                  },
                ].map((tmpl, i) => (
                  <button
                    key={i}
                    onClick={() => setShowCreatePanel(true)}
                    className="text-left bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex -space-x-2">
                        {tmpl.apps.map((app, j) => {
                          const logo = PLATFORM_LOGOS[app];
                          const color = TOOLKIT_COLORS[app] || "#8b95b0";
                          return logo ? (
                            <img
                              key={j}
                              src={logo}
                              alt={app}
                              className="w-6 h-6 rounded border-2 border-[var(--bg-surface)] bg-[var(--bg-surface)] object-contain relative z-10"
                            />
                          ) : (
                            <div
                              key={j}
                              className="w-6 h-6 rounded border-2 border-[var(--bg-surface)] flex items-center justify-center text-[10px] font-bold text-white relative z-10"
                              style={{ backgroundColor: color }}
                            >
                              {app.charAt(0).toUpperCase()}
                            </div>
                          );
                        })}
                      </div>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={16} className="text-[var(--accent)]" />
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                      {tmpl.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {tmpl.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Activity Tab ───────────────────────────────── */}
          {viewTab === "activity" && userTriggers.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Recent Events</p>
              {loadingActivity ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-[var(--text-muted)]" size={20} />
                </div>
              ) : activityEvents.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl">
                  <Clock size={24} className="mx-auto text-[var(--text-muted)] mb-2" />
                  <p className="text-sm text-[var(--text-muted)]">No trigger events recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activityEvents.map((ev) => (
                    <div key={ev.id} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          ev.status === 'processed' ? 'bg-emerald-500' :
                          ev.status === 'error' ? 'bg-red-500' :
                          ev.status === 'skipped' ? 'bg-amber-500' : 'bg-zinc-500'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {formatSlug(ev.trigger_slug || ev.event_type)}
                          </p>
                          {ev.error && (
                            <p className="text-[11px] text-red-400 truncate">{ev.error}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {ev.processing_time_ms != null && (
                          <span className="text-[11px] text-[var(--text-muted)] tabular-nums">{ev.processing_time_ms}ms</span>
                        )}
                        <span className="text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                          {new Date(ev.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Active Triggers Header ──────────────────────── */}
          {viewTab === "triggers" && userTriggers.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Active Automations
                </p>
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Search size={14} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search triggers..."
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all"
                  />
                </div>
              </div>

              {filteredTriggers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-[var(--text-muted)]">No active triggers match your search.</p>
                </div>
              ) : (
                filteredTriggers.map((trigger) => {
                  const toolkitKey = trigger.toolkit?.toLowerCase() || "";
                  const color = TOOLKIT_COLORS[toolkitKey] || "#8b95b0";
                  const toolkitName = TOOLKIT_DISPLAY[toolkitKey] || trigger.toolkit;
                  const isToggling = togglingId === trigger.id;
                  const isDeleting = deletingId === trigger.id;

                  return (
                    <div
                      key={trigger.id}
                      className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 sm:px-5 py-4 transition-all hover:border-[var(--border-strong)] ${!trigger.is_enabled ? "opacity-60 grayscale-[0.5]" : ""}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left: Trigger Info & Visual Flow */}
                        <div className="flex-1 min-w-0 flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                              {trigger.trigger_name || formatSlug(trigger.trigger_slug)}
                            </h3>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase ${trigger.is_enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                              {trigger.is_enabled ? "Active" : "Paused"}
                            </div>
                          </div>

                          {/* Visual Flow Map */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                              {(() => {
                                const logo = integrations.find((i) => i.appName.toLowerCase() === toolkitKey)?.logo || PLATFORM_LOGOS[toolkitKey];
                                return logo ? (
                                  <img src={logo} alt={toolkitName} className="w-4 h-4 rounded object-contain" />
                                ) : (
                                  <div className="w-4 h-4 rounded flex items-center justify-center text-white font-bold text-[8px]" style={{ backgroundColor: color }}>
                                    {toolkitName.charAt(0)}
                                  </div>
                                );
                              })()}
                              <span className="text-xs font-medium text-[var(--text-secondary)]">{toolkitName}</span>
                            </div>
                            <ArrowRight size={14} className="text-[var(--text-muted)]" />
                            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                              <Zap size={14} className="text-[var(--accent)]" />
                              <span className="text-xs font-medium text-[var(--accent)]">Aariv</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions & Stats */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-0.5">
                            <button
                              onClick={() => handleToggle(trigger)}
                              disabled={isToggling}
                              className={`p-1.5 rounded-md transition-colors ${trigger.is_enabled ? 'hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500' : 'hover:bg-emerald-500/10 text-[var(--text-muted)] hover:text-emerald-500'}`}
                              title={trigger.is_enabled ? "Pause" : "Resume"}
                            >
                              {isToggling ? <Loader2 size={14} className="animate-spin" /> : trigger.is_enabled ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                            <div className="w-px h-4 bg-[var(--border)]" />
                            <button
                              onClick={() => handleDelete(trigger.id)}
                              disabled={isDeleting}
                              className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-[var(--text-muted)] hover:text-red-500"
                              title="Delete"
                            >
                              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-1 rounded-md">
                              <Activity size={12} />
                              <span>{trigger.event_count || 0}</span>
                            </div>
                            {trigger.error_count > 0 && (
                              <div className="flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 px-2 py-1 rounded-md">
                                <X size={12} />
                                <span>{trigger.error_count}</span>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                if (expandedTriggerId === trigger.id) {
                                  setExpandedTriggerId(null);
                                } else {
                                  setExpandedTriggerId(trigger.id);
                                  loadTriggerEvents(trigger.id);
                                }
                              }}
                              className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors ${
                                expandedTriggerId === trigger.id
                                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                              }`}
                              title="View events"
                            >
                              <Clock size={12} />
                              <span>Events</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Event Log */}
                      {expandedTriggerId === trigger.id && (
                        <div className="mt-3 pt-3 border-t border-[var(--border)]">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Recent Events</p>
                          </div>
                          {loadingEvents ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="animate-spin text-[var(--text-muted)]" size={14} />
                            </div>
                          ) : triggerEvents.length === 0 ? (
                            <p className="text-[11px] text-[var(--text-muted)] py-2">No events recorded for this trigger.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {triggerEvents.map((ev) => (
                                <div key={ev.id} className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-md bg-[var(--bg-elevated)]">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                      ev.status === 'processed' ? 'bg-emerald-500' :
                                      ev.status === 'error' ? 'bg-red-500' :
                                      ev.status === 'skipped' ? 'bg-amber-500' : 'bg-zinc-500'
                                    }`} />
                                    <span className="font-medium text-[var(--text-secondary)] truncate">{ev.status}</span>
                                    {ev.error && <span className="text-red-400 truncate"> — {ev.error}</span>}
                                  </div>
                                  <span className="text-[var(--text-muted)] tabular-nums ml-2 flex-shrink-0">
                                    {new Date(ev.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : viewTab === "triggers" ? (
            /* ─── Empty State ──────────────────────────────── */
            !showCreatePanel && (
              <div className="text-center py-20 px-4 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-surface)]/50 relative overflow-hidden">
                <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md opacity-20 pointer-events-none">
                  <svg viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 50h100c20 0 20-30 40-30s20 30 40 30h120" stroke="url(#dash-gradient)" strokeWidth="2" strokeDasharray="4 4" />
                    <defs>
                      <linearGradient id="dash-gradient" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--accent)" stopOpacity="0" />
                        <stop offset="0.5" stopColor="var(--accent)" />
                        <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#24292e] border border-white/10 flex items-center justify-center shadow-lg transform -rotate-6">
                      <img src="/images/github-142-svgrepo-com.svg" alt="GitHub" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shadow-[0_0_30px_var(--accent-soft)]">
                      <Zap size={24} className="text-[var(--accent)]" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#ECB22E] border border-white/10 flex items-center justify-center shadow-lg transform rotate-6">
                      <img src="/images/slack-svgrepo-com.svg" alt="Slack" className="w-6 h-6 object-contain grayscale-[0.2]" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-xl font-medium text-[var(--text-primary)]">
                      Build your first automation
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      Triggers quietly watch for events across your connected apps and execute workflows automatically. Set one up to get started.
                    </p>
                  </div>

                  {integrations.length > 0 ? (
                    <button
                      onClick={() => setShowCreatePanel(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-base)] text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                      <Plus size={16} />
                      Create Trigger
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-muted)]">
                      <span>Connect an app in</span>
                      <a href="/dashboard/integrations" className="text-[var(--text-primary)] font-medium hover:underline">
                        Integrations
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : null}
        </>
      )}
    </div>
  );
}
