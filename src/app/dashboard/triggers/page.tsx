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
import { useEffect, useMemo, useState } from "react";

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
  trigger_slug: string;
  trigger_name?: string;
  toolkit?: string;
  is_enabled: boolean;
  is_auto?: boolean;
  event_count: number;
  error_count: number;
  last_event_at?: string;
  created_at: string;
}

interface Integration {
  id: string;
  appName: string;
  displayName?: string;
  logo?: string;
  status?: string;
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
  trigger_slug?: string;
  status: string;
  error?: string;
  processing_time_ms?: number;
  created_at: string;
}

/* ─── App-grouped structure ──────────────────────────────────────── */

interface AppGroup {
  appKey: string;
  displayName: string;
  logo?: string;
  connectionId: string;
  triggers: UserTrigger[];
  totalEvents: number;
  totalErrors: number;
}

// --- Helpers ---
function formatSlug(slug: string): string {
  return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
type FilterMode = "all" | "active" | "paused" | "auto";

/* ─── Trigger Type Badge ─────────────────────────────────────────── */

function TriggerTypeBadge({ type }: { type?: string }) {
  const isWebhook = type === "webhook";
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${
        isWebhook
          ? "bg-emerald-500/10 text-emerald-500"
          : "bg-blue-500/10 text-blue-500"
      }`}
    >
      {isWebhook ? <Globe size={9} /> : <RefreshCw size={9} />}
      {isWebhook ? "Webhook" : "Poll"}
    </span>
  );
}

/* ─── App Logo Component ─────────────────────────────────────────── */

function AppLogo({
  logo,
  appKey,
  displayName,
  size = "md",
}: {
  logo?: string;
  appKey: string;
  displayName: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "sm" ? "w-5 h-5" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const textSz =
    size === "sm" ? "text-[8px]" : size === "lg" ? "text-sm" : "text-xs";
  const rounded = size === "sm" ? "rounded" : "rounded-lg";
  const color = typeof logo === "string" && logo ? undefined : "#8b95b0";

  if (logo) {
    return (
      <img
        src={logo}
        alt={displayName}
        className={`${dims} ${rounded} object-contain bg-[var(--bg-elevated)]`}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const parent = e.currentTarget.parentElement;
          if (parent) {
            const fb = document.createElement("div");
            fb.className = `${dims} ${rounded} flex items-center justify-center text-white font-bold ${textSz}`;
            fb.style.backgroundColor = color || "#8b95b0";
            fb.textContent = displayName.charAt(0).toUpperCase();
            parent.prepend(fb);
          }
        }}
      />
    );
  }

  return (
    <div
      className={`${dims} ${rounded} flex items-center justify-center text-white font-bold ${textSz}`}
      style={{ backgroundColor: color || "#8b95b0" }}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
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
  onSubmit: (config: Record<string, string>) => void | Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}) {
  const schema = trigger.config || { properties: {}, required: [] };
  const fields = Object.entries(schema.properties || {});
  const required = schema.required || [];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const [k, v] of fields) {
      if (v.default && typeof v.default === "string")
        init[k] = v.default as string;
      else init[k] = "";
    }
    return init;
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, val: string) => {
    setValues((s) => ({ ...s, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    for (const r of required) {
      if (!values[r] || !values[r].trim()) {
        setError(`Please fill ${r}`);
        return;
      }
    }
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

          {fields.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Configuration
              </p>
              {fields.map(([key, prop]) => {
                const isRequired = required.includes(key);
                const val = values[key] || "";
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
                        value={val}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full rounded-md border px-3 py-2 bg-[var(--bg-elevated)] text-sm"
                      >
                        <option value="">Select</option>
                        {prop.enum!.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={val}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={(prop as any).placeholder || ""}
                        className="w-full rounded-md border px-3 py-2 bg-[var(--bg-elevated)] text-sm"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          {error && <div className="text-sm text-red-400">{error}</div>}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-sm bg-[var(--bg-elevated)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Page Component (Redesigned) ─────────────────────────────── */

export default function TriggersPage() {
  const { user } = useAuth();
  // State
  const [userTriggers, setUserTriggers] = useState<UserTrigger[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [availableTriggers, setAvailableTriggers] = useState<
    AvailableTrigger[]
  >([]);
  const [stats, setStats] = useState<TriggerStats | null>(null);
  const [expandedTriggerId, setExpandedTriggerId] = useState<string | null>(
    null,
  );
  const [triggerEvents, setTriggerEvents] = useState<TriggerEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [viewTab, setViewTab] = useState<"triggers" | "activity">("triggers");
  const [activityEvents, setActivityEvents] = useState<TriggerEvent[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Load initial data
  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trigsRes, appsRes, statsRes] = await Promise.all([
        api.get(`/triggers?userId=${user!.id}`),
        api.get(`/triggers/trigger-apps?userId=${user!.id}`),
        api.get(`/triggers/stats?userId=${user!.id}`).catch(() => null),
      ]);
      setUserTriggers(trigsRes.triggers || []);
      setIntegrations(appsRes.apps || []);
      if (statsRes) setStats(statsRes);
    } catch (e) {
      console.error("Failed to load triggers", e);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTriggers = async (appName: string) => {
    if (selectedToolkit === appName) {
      setSelectedToolkit(null);
      setAvailableTriggers([]);
      return;
    }
    try {
      setSelectedToolkit(appName);
      setLoadingTriggers(true);
      const data = await api.get(
        `/triggers/available?appName=${encodeURIComponent(appName)}&userId=${user!.id}`,
      );
      setAvailableTriggers(data.triggers || []);
    } catch (e) {
      console.error(e);
      showToast("Failed to load triggers for this app", "error");
    } finally {
      setLoadingTriggers(false);
    }
  };

  const openConfigModal = (trigger: AvailableTrigger) => {
    const hasConfig =
      trigger.config?.properties &&
      Object.keys(trigger.config.properties).length > 0;
    if (hasConfig) setConfiguringTrigger(trigger);
    else handleCreate(trigger, {});
  };

  const handleCreate = async (
    trigger: AvailableTrigger,
    config: Record<string, string>,
  ) => {
    if (!user?.id) return;
    const connection = integrations.find(
      (i) =>
        i.appName.toLowerCase() ===
        (trigger.toolkit || trigger.toolkitName || "").toLowerCase(),
    );
    if (!connection)
      return showToast(
        "Please connect this app first in Integrations",
        "error",
      );
    try {
      setCreating(trigger.slug);
      await api.post("/triggers/create", {
        userId: user.id,
        connectedAccountId: connection.id,
        triggerName: trigger.slug,
        toolkit: connection.appName,
        config,
      });
      showToast(`${trigger.displayName} trigger created`, "success");
      setConfiguringTrigger(null);
      setSelectedToolkit(null);
      setAvailableTriggers([]);
      setShowCreatePanel(false);
      loadData();
    } catch (e: any) {
      showToast(e?.message || "Failed to create trigger", "error");
    } finally {
      setCreating(null);
    }
  };

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
      showToast(e?.message || "Failed to update trigger", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (triggerId: string) => {
    try {
      setDeletingId(triggerId);
      await api.post("/triggers/delete", { triggerId });
      setUserTriggers((prev) => prev.filter((t) => t.id !== triggerId));
      showToast("Trigger removed", "success");
    } catch (e: any) {
      showToast(e?.message || "Failed to delete trigger", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadTriggerEvents = async (triggerId: string) => {
    if (expandedTriggerId === triggerId) {
      setExpandedTriggerId(null);
      setTriggerEvents([]);
      return;
    }
    try {
      setExpandedTriggerId(triggerId);
      setLoadingEvents(true);
      const data = await api.get(
        `/triggers/events?userId=${user!.id}&triggerId=${triggerId}&limit=10`,
      );
      setTriggerEvents(data.events || []);
    } catch (e) {
      setTriggerEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadActivity = async () => {
    if (!user?.id) return;
    try {
      setLoadingActivity(true);
      const data = await api.get(`/triggers/events?userId=${user.id}&limit=30`);
      setActivityEvents(data.events || []);
    } catch (e) {
      setActivityEvents([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (viewTab === "activity") loadActivity();
  }, [viewTab]);

  const filteredTriggers = useMemo(() => {
    if (!searchQuery) return userTriggers;
    const q = searchQuery.toLowerCase();
    return userTriggers.filter((t) => {
      const name = (t.trigger_name || formatSlug(t.trigger_slug)).toLowerCase();
      const app = (t.toolkit || "").toLowerCase();
      return name.includes(q) || app.includes(q);
    });
  }, [userTriggers, searchQuery]);
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top fade-in duration-300 ${
            toast.type === "success"
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
            {
              label: "Events",
              value: stats.totalEvents,
              color: "text-[var(--accent)]",
            },
            {
              label: "Errors",
              value: stats.totalErrors,
              color: stats.totalErrors > 0 ? "text-red-400" : "text-zinc-500",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3"
            >
              <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                {s.label}
              </p>
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
                  const color = "#8b95b0";
                  const displayName =
                    integration.displayName || integration.appName;
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
                        {integration.logo ? (
                          <img
                            src={integration.logo}
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
                        )}
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
                          const logo = undefined;
                          const color = "#8b95b0";
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
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Recent Events
              </p>
              {loadingActivity ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2
                    className="animate-spin text-[var(--text-muted)]"
                    size={20}
                  />
                </div>
              ) : activityEvents.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl">
                  <Clock
                    size={24}
                    className="mx-auto text-[var(--text-muted)] mb-2"
                  />
                  <p className="text-sm text-[var(--text-muted)]">
                    No trigger events recorded yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activityEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            ev.status === "processed"
                              ? "bg-emerald-500"
                              : ev.status === "error"
                                ? "bg-red-500"
                                : ev.status === "skipped"
                                  ? "bg-amber-500"
                                  : "bg-zinc-500"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {formatSlug(ev.trigger_slug || ev.event_type)}
                          </p>
                          {ev.error && (
                            <p className="text-[11px] text-red-400 truncate">
                              {ev.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {ev.processing_time_ms != null && (
                          <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                            {ev.processing_time_ms}ms
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                          {new Date(ev.created_at).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
                  <p className="text-sm text-[var(--text-muted)]">
                    No active triggers match your search.
                  </p>
                </div>
              ) : (
                filteredTriggers.map((trigger) => {
                  const toolkitKey = trigger.toolkit?.toLowerCase() || "";
                  const color = "#8b95b0";
                  const toolkitName = trigger.toolkit;
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
                              {trigger.trigger_name ||
                                formatSlug(trigger.trigger_slug)}
                            </h3>
                            <div
                              className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase ${trigger.is_enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"}`}
                            >
                              {trigger.is_enabled ? "Active" : "Paused"}
                            </div>
                            {trigger.is_auto && (
                              <div className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase bg-blue-500/10 text-blue-400">
                                Auto
                              </div>
                            )}
                          </div>

                          {/* Visual Flow Map */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                              {(() => {
                                const logo =
                                  integrations.find(
                                    (i) =>
                                      i.appName.toLowerCase() === toolkitKey,
                                  )?.logo || undefined;
                                return logo ? (
                                  <img
                                    src={logo}
                                    alt={toolkitName}
                                    className="w-4 h-4 rounded object-contain"
                                  />
                                ) : (
                                  <div
                                    className="w-4 h-4 rounded flex items-center justify-center text-white font-bold text-[8px]"
                                    style={{ backgroundColor: color }}
                                  >
                                    {(toolkitName || "").charAt(0)}
                                  </div>
                                );
                              })()}
                              <span className="text-xs font-medium text-[var(--text-secondary)]">
                                {toolkitName}
                              </span>
                            </div>
                            <ArrowRight
                              size={14}
                              className="text-[var(--text-muted)]"
                            />
                            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                              <Zap size={14} className="text-[var(--accent)]" />
                              <span className="text-xs font-medium text-[var(--accent)]">
                                Aariv
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions & Stats */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-0.5">
                            <button
                              onClick={() => handleToggle(trigger)}
                              disabled={isToggling}
                              className={`p-1.5 rounded-md transition-colors ${trigger.is_enabled ? "hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500" : "hover:bg-emerald-500/10 text-[var(--text-muted)] hover:text-emerald-500"}`}
                              title={trigger.is_enabled ? "Pause" : "Resume"}
                            >
                              {isToggling ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : trigger.is_enabled ? (
                                <Pause size={14} />
                              ) : (
                                <Play size={14} />
                              )}
                            </button>
                            <div className="w-px h-4 bg-[var(--border)]" />
                            <button
                              onClick={() => handleDelete(trigger.id)}
                              disabled={isDeleting}
                              className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-[var(--text-muted)] hover:text-red-500"
                              title="Delete"
                            >
                              {isDeleting ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
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
                                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
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
                            <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                              Recent Events
                            </p>
                          </div>
                          {loadingEvents ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2
                                className="animate-spin text-[var(--text-muted)]"
                                size={14}
                              />
                            </div>
                          ) : triggerEvents.length === 0 ? (
                            <p className="text-[11px] text-[var(--text-muted)] py-2">
                              No events recorded for this trigger.
                            </p>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {triggerEvents.map((ev) => (
                                <div
                                  key={ev.id}
                                  className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-md bg-[var(--bg-elevated)]"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                        ev.status === "processed"
                                          ? "bg-emerald-500"
                                          : ev.status === "error"
                                            ? "bg-red-500"
                                            : ev.status === "skipped"
                                              ? "bg-amber-500"
                                              : "bg-zinc-500"
                                      }`}
                                    />
                                    <span className="font-medium text-[var(--text-secondary)] truncate">
                                      {ev.status}
                                    </span>
                                    {ev.error && (
                                      <span className="text-red-400 truncate">
                                        {" "}
                                        — {ev.error}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[var(--text-muted)] tabular-nums ml-2 flex-shrink-0">
                                    {new Date(ev.created_at).toLocaleString(
                                      undefined,
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
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
                <div
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md opacity-20 pointer-events-none"
                >
                  <svg
                    viewBox="0 0 400 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M50 50h100c20 0 20-30 40-30s20 30 40 30h120"
                      stroke="url(#dash-gradient)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <defs>
                      <linearGradient
                        id="dash-gradient"
                        x1="0"
                        y1="0"
                        x2="400"
                        y2="0"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="var(--accent)" stopOpacity="0" />
                        <stop offset="0.5" stopColor="var(--accent)" />
                        <stop
                          offset="1"
                          stopColor="var(--accent)"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#24292e] border border-white/10 flex items-center justify-center shadow-lg transform -rotate-6">
                      <img
                        src="/images/github-142-svgrepo-com.svg"
                        alt="GitHub"
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shadow-[0_0_30px_var(--accent-soft)]">
                      <Zap size={24} className="text-[var(--accent)]" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#ECB22E] border border-white/10 flex items-center justify-center shadow-lg transform rotate-6">
                      <img
                        src="/images/slack-svgrepo-com.svg"
                        alt="Slack"
                        className="w-6 h-6 object-contain grayscale-[0.2]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-xl font-medium text-[var(--text-primary)]">
                      Build your first automation
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      Triggers quietly watch for events across your connected
                      apps and execute workflows automatically. Set one up to
                      get started.
                    </p>
                  </div>

                  {integrations.length > 0 ? (
                    <button
                      onClick={() => setShowCreatePanel(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                      <Plus size={16} />
                      Create Trigger
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-muted)]">
                      <span>Connect an app in</span>
                      <a
                        href="/dashboard/integrations"
                        className="text-[var(--text-primary)] font-medium hover:underline"
                      >
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
