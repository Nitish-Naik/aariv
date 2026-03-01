"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Activity,
  Check,
  ChevronDown,
  ChevronRight,
  Globe,
  Info,
  Loader2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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

  // UI state
  const [loading, setLoading] = useState(true);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
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
      const [triggersRes, triggerAppsRes] = await Promise.all([
        api.get(`/triggers?userId=${user!.id}`),
        api.get(`/triggers/trigger-apps?userId=${user!.id}`),
      ]);
      setUserTriggers(triggersRes.triggers || []);
      setIntegrations(triggerAppsRes.apps || []);
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
                const toolkitName =
                  TOOLKIT_DISPLAY[toolkitKey] || trigger.toolkit;
                const isToggling = togglingId === trigger.id;
                const isDeleting = deletingId === trigger.id;

                return (
                  <div
                    key={trigger.id}
                    className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 sm:px-5 py-4 transition-opacity ${
                      !trigger.is_enabled ? "opacity-60" : ""
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start gap-3">
                      {(() => {
                        const logo =
                          integrations.find(
                            (i) => i.appName.toLowerCase() === toolkitKey,
                          )?.logo || PLATFORM_LOGOS[toolkitKey];
                        return logo ? (
                          <img
                            src={logo}
                            alt={toolkitName}
                            className="w-9 h-9 rounded-lg object-contain mt-0.5"
                            onError={(e) => {
                              const parent = e.currentTarget.parentElement;
                              e.currentTarget.style.display = "none";
                              if (parent) {
                                const fb = document.createElement("div");
                                fb.className =
                                  "w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs mt-0.5";
                                fb.style.backgroundColor = color;
                                fb.textContent = toolkitName.charAt(0);
                                parent.prepend(fb);
                              }
                            }}
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs mt-0.5"
                            style={{ backgroundColor: color }}
                          >
                            {toolkitName.charAt(0)}
                          </div>
                        );
                      })()}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[var(--text-primary)]">
                          {trigger.trigger_name ||
                            formatSlug(trigger.trigger_slug)}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {toolkitName} ·{" "}
                          {trigger.is_enabled ? "Active" : "Paused"}
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
