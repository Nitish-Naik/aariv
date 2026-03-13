"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Sheet } from "@/components/ui/Sheet";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatTriggerSlug, getTriggerDescription } from "@/lib/appMeta";
import { motion } from "framer-motion";
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
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────── */

interface TriggerConfigProperty {
  title?: string;
  description?: string;
  type?: string;
  default?: unknown;
  enum?: string[];
  placeholder?: string;
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
  payload?: Record<string, unknown>;
  created_at: string;
}

function extractPayloadPreview(
  payload?: Record<string, unknown>,
): string | null {
  if (!payload || typeof payload !== "object") return null;
  const PREVIEW_KEYS = [
    "subject",
    "title",
    "name",
    "from",
    "sender",
    "message",
    "text",
    "body",
    "description",
    "summary",
    "content",
    "label",
    "action",
  ];
  for (const key of PREVIEW_KEYS) {
    const val = payload[key];
    if (val && typeof val === "string" && val.trim()) {
      const trimmed = val.trim();
      return trimmed.length > 80 ? trimmed.slice(0, 77) + "…" : trimmed;
    }
  }
  // Fallback: first string-valued key
  for (const [, val] of Object.entries(payload)) {
    if (val && typeof val === "string" && val.trim().length > 2) {
      const trimmed = val.trim();
      return trimmed.length > 80 ? trimmed.slice(0, 77) + "…" : trimmed;
    }
  }
  return null;
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
      {isWebhook ? (
        <Globe strokeWidth={1.5} size={9} />
      ) : (
        <RefreshCw strokeWidth={1.5} size={9} />
      )}
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
        className={`${dims} ${rounded} object-contain bg-neutral-900`}
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
      <div className="bg-black border border-white/10 rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Zap strokeWidth={1.5} size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {trigger.displayName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <TriggerTypeBadge type={trigger.type} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-900 transition-colors text-neutral-500"
          >
            <X strokeWidth={1.5} size={16} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        >
          {trigger.description && (
            <p className="text-xs text-neutral-400 leading-relaxed">
              {trigger.description}
            </p>
          )}

          {trigger.instructions && (
            <div className="flex items-start gap-2 bg-blue-500/8 border border-blue-500/15 rounded-lg px-3 py-2.5">
              <Info
                strokeWidth={1.5}
                size={14}
                className="text-blue-400 mt-0.5 flex-shrink-0"
              />
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
                    <label className="flex items-center gap-1 text-xs font-semibold text-white">
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
                        className="w-full rounded-md border px-3 py-2 bg-neutral-900 text-sm"
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
                        placeholder={prop.placeholder || ""}
                        className="w-full rounded-md border px-3 py-2 bg-neutral-900 text-sm"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          {error && (
            <div
              className={`text-sm ${error === "INSUFFICIENT_CREDITS" ? "text-amber-400" : "text-red-400"}`}
            >
              {error === "INSUFFICIENT_CREDITS" ? (
                <>
                  You&apos;re out of credits.{" "}
                  <a
                    href="/dashboard/settings"
                    className="underline hover:text-amber-300"
                  >
                    Add Credits →
                  </a>
                </>
              ) : (
                error
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-sm bg-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-white text-white text-sm"
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pauseWarningTrigger, setPauseWarningTrigger] =
    useState<UserTrigger | null>(null);
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
        api.get(`/triggers`),
        api.get(`/triggers/trigger-apps`),
        api.get(`/triggers/stats`).catch(() => null),
      ]);
      setUserTriggers(trigsRes.triggers || []);
      setIntegrations(appsRes.apps || []);
      if (statsRes) setStats(statsRes);
    } catch {
      // Non-fatal: user will see empty state
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
        `/triggers/available?appName=${encodeURIComponent(appName)}`,
      );
      setAvailableTriggers(data.triggers || []);
    } catch {
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
        `/triggers/events?triggerId=${triggerId}&limit=10`,
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
      const data = await api.get(`/triggers/events?limit=30`);
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
      const name = (
        t.trigger_name || formatTriggerSlug(t.trigger_slug)
      ).toLowerCase();
      const app = (t.toolkit || "").toLowerCase();
      return name.includes(q) || app.includes(q);
    });
  }, [userTriggers, searchQuery]);
  return (
    <>
    <div className="flex flex-col min-h-screen">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top fade-in duration-300 ${
            toast.type === "success"
              ? "bg-emerald-500/90 text-white"
              : "bg-red-500/90 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <Check strokeWidth={1.5} size={16} />
          ) : (
            <Zap strokeWidth={1.5} size={16} />
          )}
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

        {/* Pause Warning Modal */}
        {pauseWarningTrigger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPauseWarningTrigger(null)}
            />
            <div className="relative w-full max-w-sm bg-black border border-amber-500/20 rounded-xl shadow-xl overflow-hidden p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Pause
                    strokeWidth={1.5}
                    size={16}
                    className="text-amber-400"
                  />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Pause this automation?
                </h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-1">
                <span className="font-medium text-white">
                  {pauseWarningTrigger.trigger_name ||
                    formatTriggerSlug(pauseWarningTrigger.trigger_slug)}
                </span>{" "}
                runs automatically to keep your daily briefings updated.
              </p>
              <p className="text-xs text-amber-400/80 leading-relaxed mb-5">
                Pausing it will stop new events from appearing in your briefing
                until you resume.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setPauseWarningTrigger(null)}
                  className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleToggle(pauseWarningTrigger);
                    setPauseWarningTrigger(null);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl transition-colors"
                >
                  Pause anyway
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Page header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-white">Automations</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Triggers that watch for events across your connected apps
          </p>
        </div>
        {!loading && integrations.length > 0 && (
          <button
            onClick={() => setShowCreatePanel(!showCreatePanel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-black text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus strokeWidth={1.5} size={14} />
            New
          </button>
        )}
      </div>

      {/* View tabs */}
      {!loading && userTriggers.length > 0 && (
        <div className="px-6 border-b border-white/[0.06] flex items-center gap-1">
          {(["triggers", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setViewTab(tab)}
              className={`px-3 py-3 text-xs font-medium transition-colors border-b-2 -mb-px ${
                viewTab === tab
                  ? "text-white border-white"
                  : "text-neutral-500 hover:text-neutral-300 border-transparent"
              }`}
            >
              {tab === "triggers" ? "Triggers" : "Activity Log"}
            </button>
          ))}
        </div>
      )}

      {/* Stats strip */}
      {stats && stats.total > 0 && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/[0.06]">
          {[
            { label: "Active", value: stats.active, color: "text-emerald-400" },
            { label: "Paused", value: stats.paused, color: "text-neutral-400" },
            { label: "Events", value: stats.totalEvents, color: "text-white" },
            { label: "Errors", value: stats.totalErrors, color: stats.totalErrors > 0 ? "text-red-400" : "text-neutral-500" },
          ].map((s, i) => (
            <div key={s.label} className={`px-6 py-4 ${i < 3 ? "border-r border-white/[0.06]" : ""}`}>
              <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 px-6 py-6">

        {/* Loading — skeleton cards */}
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-36 rounded bg-black animate-pulse mb-2" />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-black border border-white/10 rounded-xl px-4 sm:px-5 py-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 animate-pulse" />
                  <div className="flex-1 space-y-2 pt-0.5">
                    <div className="h-3.5 w-40 rounded bg-white/10 animate-pulse" />
                    <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
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
                          className="w-full flex items-center gap-3 bg-black border border-white/10 rounded-xl px-4 py-3 hover:border-white/30/30 transition-colors"
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
                          <span className="flex-1 text-left text-sm font-medium text-white">
                            {displayName}
                          </span>
                          {isExpanded ? (
                            <ChevronDown
                              strokeWidth={1.5}
                              size={16}
                              className="text-neutral-500"
                            />
                          ) : (
                            <ChevronRight
                              strokeWidth={1.5}
                              size={16}
                              className="text-neutral-500"
                            />
                          )}
                        </button>

                        {/* Expanded: available triggers */}
                        {isExpanded && (
                          <div className="ml-4 mt-2 space-y-1.5">
                            {loadingTriggers ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2
                                  strokeWidth={1.5}
                                  size={16}
                                  className="animate-spin text-neutral-500"
                                />
                              </div>
                            ) : availableTriggers.length > 0 ? (
                              availableTriggers.map((trigger) => (
                                <div
                                  key={trigger.slug}
                                  className="flex items-center gap-3 bg-neutral-900 border border-white/10 rounded-lg px-3 py-2.5"
                                >
                                  <Zap
                                    strokeWidth={1.5}
                                    size={14}
                                    className="text-neutral-500 flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm text-white truncate">
                                        {formatTriggerSlug(trigger.slug) ||
                                          trigger.displayName}
                                      </p>
                                      <TriggerTypeBadge type={trigger.type} />
                                    </div>
                                    {(() => {
                                      const desc =
                                        getTriggerDescription(trigger.slug) ||
                                        trigger.description;
                                      return desc ? (
                                        <p className="text-xs text-neutral-400 truncate mt-0.5">
                                          {desc}
                                        </p>
                                      ) : null;
                                    })()}
                                  </div>
                                  <button
                                    onClick={() => openConfigModal(trigger)}
                                    disabled={creating === trigger.slug}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                  >
                                    {creating === trigger.slug ? (
                                      <Loader2
                                        strokeWidth={1.5}
                                        size={12}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Plus strokeWidth={1.5} size={12} />
                                    )}
                                    Add
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-neutral-500 py-3 px-2">
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
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
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
                      className="text-left bg-black border border-white/10 rounded-xl p-4 hover:border-white/30/40 hover:bg-neutral-900 transition-all group"
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
                                className="w-6 h-6 rounded border-2 border-black bg-black object-contain relative z-10"
                              />
                            ) : (
                              <div
                                key={j}
                                className="w-6 h-6 rounded border-2 border-black flex items-center justify-center text-[10px] font-bold text-white relative z-10"
                                style={{ backgroundColor: color }}
                              >
                                {app.charAt(0).toUpperCase()}
                              </div>
                            );
                          })}
                        </div>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus
                            strokeWidth={1.5}
                            size={16}
                            className="text-white"
                          />
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">
                        {tmpl.title}
                      </h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
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
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Recent Events
                </p>
                {loadingActivity ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2
                      strokeWidth={1.5}
                      className="animate-spin text-neutral-500"
                      size={20}
                    />
                  </div>
                ) : activityEvents.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                    <Clock
                      strokeWidth={1.5}
                      size={24}
                      className="mx-auto text-neutral-500 mb-2"
                    />
                    <p className="text-sm text-neutral-500">
                      No trigger events recorded yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activityEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-black border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
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
                                    : "bg-neutral-500"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {formatTriggerSlug(
                                ev.trigger_slug || ev.event_type,
                              )}
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
                            <span className="text-[11px] text-neutral-500 tabular-nums">
                              {ev.processing_time_ms}ms
                            </span>
                          )}
                          <span className="text-[11px] text-neutral-500 tabular-nums whitespace-nowrap">
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
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Active Automations
                  </p>
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <Search strokeWidth={1.5} size={14} />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search triggers..."
                      className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-white text-white placeholder-neutral-600 transition-all"
                    />
                  </div>
                </div>

                {filteredTriggers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-neutral-500">
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
                        className={`bg-black border border-white/10 rounded-xl px-4 sm:px-5 py-4 transition-all hover:border-white/20 ${!trigger.is_enabled ? "opacity-60 grayscale-[0.5]" : ""}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Left: Trigger Info & Visual Flow */}
                          <div className="flex-1 min-w-0 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-white">
                                {trigger.trigger_name ||
                                  formatTriggerSlug(trigger.trigger_slug)}
                              </h3>
                              <div
                                className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase ${trigger.is_enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-neutral-500/10 text-neutral-500"}`}
                              >
                                {trigger.is_enabled ? "Active" : "Paused"}
                              </div>
                              {trigger.is_auto && (
                                <div className="relative group/auto">
                                  <div className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase bg-blue-500/10 text-blue-400 cursor-default flex items-center gap-1">
                                    Auto
                                  </div>
                                </div>
                              )}
                              {getTriggerDescription(trigger.trigger_slug) && (
                                <p className="text-xs text-neutral-500">
                                  {getTriggerDescription(trigger.trigger_slug)}
                                </p>
                              )}
                            </div>

                            {/* Visual Flow Map */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10">
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
                                <span className="text-xs font-medium text-neutral-400">
                                  {toolkitName}
                                </span>
                              </div>
                              <ArrowRight
                                strokeWidth={1.5}
                                size={14}
                                className="text-neutral-500"
                              />
                              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/30/20">
                                <Zap
                                  strokeWidth={1.5}
                                  size={14}
                                  className="text-white"
                                />
                                <span className="text-xs font-medium text-white">
                                  CalmPilot
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions & Stats */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                            <div className="flex items-center gap-1 bg-neutral-900 border border-white/10 rounded-lg p-0.5">
                              <button
                                onClick={() => {
                                  if (trigger.is_enabled && trigger.is_auto) {
                                    setPauseWarningTrigger(trigger);
                                  } else {
                                    handleToggle(trigger);
                                  }
                                }}
                                disabled={isToggling}
                                className={`p-1.5 rounded-md transition-colors ${trigger.is_enabled ? "hover:bg-amber-500/10 text-neutral-500 hover:text-amber-500" : "hover:bg-emerald-500/10 text-neutral-500 hover:text-emerald-500"}`}
                                title={trigger.is_enabled ? "Pause" : "Resume"}
                              >
                                {isToggling ? (
                                  <Loader2
                                    strokeWidth={1.5}
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : trigger.is_enabled ? (
                                  <Pause strokeWidth={1.5} size={14} />
                                ) : (
                                  <Play strokeWidth={1.5} size={14} />
                                )}
                              </button>
                              <div className="w-px h-4 bg-white/10" />
                              <button
                                onClick={() => setConfirmDeleteId(trigger.id)}
                                disabled={isDeleting}
                                className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-neutral-500 hover:text-red-500"
                                title="Delete"
                              >
                                {isDeleting ? (
                                  <Loader2
                                    strokeWidth={1.5}
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 strokeWidth={1.5} size={14} />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 bg-neutral-900 px-2 py-1 rounded-md">
                                <Activity strokeWidth={1.5} size={12} />
                                <span>{trigger.event_count || 0}</span>
                              </div>
                              {trigger.error_count > 0 && (
                                <Link
                                  href={`/dashboard/feed?q=${encodeURIComponent(trigger.trigger_slug)}`}
                                  className="flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-md transition-colors"
                                  title="View errors in Feed"
                                >
                                  <X strokeWidth={1.5} size={12} />
                                  <span>
                                    {trigger.error_count} error
                                    {trigger.error_count !== 1 ? "s" : ""}
                                  </span>
                                </Link>
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
                                    ? "bg-white/10 text-white"
                                    : "bg-neutral-900 text-neutral-500 hover:text-neutral-400"
                                }`}
                                title="View events"
                              >
                                <Clock strokeWidth={1.5} size={12} />
                                <span>Events</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Event Log */}
                        {expandedTriggerId === trigger.id && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                                Recent Events
                              </p>
                            </div>
                            {loadingEvents ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2
                                  strokeWidth={1.5}
                                  className="animate-spin text-neutral-500"
                                  size={14}
                                />
                              </div>
                            ) : triggerEvents.length === 0 ? (
                              <p className="text-[11px] text-neutral-500 py-2">
                                No events recorded for this trigger.
                              </p>
                            ) : (
                              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {triggerEvents.map((ev) => {
                                  const preview = extractPayloadPreview(
                                    ev.payload,
                                  );
                                  return (
                                    <div
                                      key={ev.id}
                                      className="flex flex-col gap-0.5 text-[11px] px-2.5 py-2 rounded-md bg-neutral-900"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                              ev.status === "processed"
                                                ? "bg-emerald-500"
                                                : ev.status === "error"
                                                  ? "bg-red-500"
                                                  : ev.status === "skipped"
                                                    ? "bg-amber-500"
                                                    : "bg-neutral-500"
                                            }`}
                                          />
                                          <span className="font-medium text-neutral-400">
                                            {ev.status}
                                          </span>
                                        </div>
                                        <span className="text-neutral-500 tabular-nums ml-2 flex-shrink-0">
                                          {new Date(
                                            ev.created_at,
                                          ).toLocaleString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                      {ev.error ? (
                                        <p className="text-red-400 truncate pl-3.5">
                                          {ev.error}
                                        </p>
                                      ) : preview ? (
                                        <p className="text-neutral-500 truncate pl-3.5">
                                          {preview}
                                        </p>
                                      ) : null}
                                    </div>
                                  );
                                })}
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
                <div className="text-center py-20 px-4 border border-dashed border-white/10 rounded-xl bg-black/50 relative overflow-hidden">
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
                          <stop stopColor="white" stopOpacity="0" />
                          <stop offset="0.5" stopColor="white" />
                          <stop offset="1" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#24292e] border border-white/10 flex items-center justify-center shadow-lg transform -rotate-6">
                        <img
                          src="/images/github-142-svgrepo-com.svg"
                          alt="GitHub"
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/30/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Zap
                          strokeWidth={1.5}
                          size={24}
                          className="text-white"
                        />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-[#ECB22E] border border-white/10 flex items-center justify-center shadow-lg transform rotate-6">
                        <img
                          src="/images/slack-svgrepo-com.svg"
                          alt="Slack"
                          className="w-6 h-6 object-contain grayscale-[0.2]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                      <h3 className="text-xl font-medium text-white">
                        Build your first automation
                      </h3>
                      <p className="text-sm text-neutral-500 leading-relaxed">
                        Triggers quietly watch for events across your connected
                        apps and execute workflows automatically. Set one up to
                        get started.
                      </p>
                    </div>

                    {integrations.length > 0 ? (
                      <button
                        onClick={() => setShowCreatePanel(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-white text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg"
                      >
                        <Plus strokeWidth={1.5} size={16} />
                        Create Trigger
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-neutral-500">
                        <span>Connect an app in</span>
                        <a
                          href="/dashboard/integrations"
                          className="text-white font-medium hover:underline"
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
    </div>

    <ConfirmDialog
      open={!!confirmDeleteId}
      title="Delete trigger?"
      description="This trigger will be permanently removed and any active automations relying on it will stop working immediately."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="danger"
      onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); setConfirmDeleteId(null); }}
      onCancel={() => setConfirmDeleteId(null)}
    />
    </>
  );
}
