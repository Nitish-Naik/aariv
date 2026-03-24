"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { useLogo } from "@/context/LogoContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { formatTriggerSlug, getTriggerDescription } from "@/lib/appMeta";
import {
    Activity,
    ArrowRight,
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
    Zap
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
  for (const [, val] of Object.entries(payload)) {
    if (val && typeof val === "string" && val.trim().length > 2) {
      const trimmed = val.trim();
      return trimmed.length > 80 ? trimmed.slice(0, 77) + "…" : trimmed;
    }
  }
  return null;
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
    <Badge
      variant="outline"
      className={`text-[10px] ${isWebhook ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}
    >
      {isWebhook ? (
        <Globe strokeWidth={1.5} size={9} />
      ) : (
        <RefreshCw strokeWidth={1.5} size={9} />
      )}
      {isWebhook ? "Webhook" : "Poll"}
    </Badge>
  );
}

/* ─── App Logo Component ─────────────────────────────────────────── */

function AppLogo({
  logo,
  appKey,
  displayName,
  size = "md",
  className,
}: {
  logo?: string;
  appKey: string;
  displayName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const dims =
    size === "sm" ? "w-5 h-5" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const textSz =
    size === "sm" ? "text-[8px]" : size === "lg" ? "text-sm" : "text-xs";
  const rounded = size === "sm" ? "rounded" : "rounded-lg";
  const resolvedLogo = !failed ? logo : undefined;

  if (resolvedLogo) {
    return (
      <img
        src={resolvedLogo}
        alt={displayName}
        className={`${dims} ${rounded} object-contain bg-muted ${className || ""}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${dims} ${rounded} flex items-center justify-center text-foreground font-bold ${textSz} bg-muted ${className || ""}`}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── Config Form Modal (shadcn Dialog) ──────────────────────────── */

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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Zap strokeWidth={1.5} size={16} className="text-foreground" />
            </div>
            <div>
              <DialogTitle>{trigger.displayName}</DialogTitle>
              <div className="mt-1">
                <TriggerTypeBadge type={trigger.type} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {trigger.description && (
            <DialogDescription>{trigger.description}</DialogDescription>
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

          {fields.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Configuration
              </p>
              {fields.map(([key, prop]) => {
                const isRequired = required.includes(key);
                const val = values[key] || "";
                return (
                  <div key={key} className="space-y-1.5">
                    <Label>
                      {prop.title || key}
                      {isRequired && (
                        <span className="text-destructive ml-0.5">*</span>
                      )}
                    </Label>
                    {prop.description && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {prop.description}
                      </p>
                    )}
                    {prop.enum ? (
                      <select
                        value={val}
                        onChange={(e) =>
                          setValues((s) => ({ ...s, [key]: e.target.value }))
                        }
                        className="flex h-8 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="">Select</option>
                        {prop.enum!.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        value={val}
                        onChange={(e) =>
                          setValues((s) => ({ ...s, [key]: e.target.value }))
                        }
                        placeholder={prop.placeholder || ""}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <p
              className={`text-sm ${error === "INSUFFICIENT_CREDITS" ? "text-amber-400" : "text-destructive"}`}
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
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2
                    strokeWidth={1.5}
                    size={14}
                    className="animate-spin"
                  />{" "}
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Page Component ─────────────────────────────────────────────── */

export default function TriggersPage() {
  const { user } = useAuth();
  const { getLogo } = useLogo();
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
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    if (user?.id) loadData();
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
      showToastMsg("Failed to load triggers for this app", "error");
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
      return showToastMsg(
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
      showToastMsg(`${trigger.displayName} trigger created`, "success");
      setConfiguringTrigger(null);
      setSelectedToolkit(null);
      setAvailableTriggers([]);
      setShowCreatePanel(false);
      loadData();
    } catch (e: any) {
      showToastMsg(e?.message || "Failed to create trigger", "error");
    } finally {
      setCreating(null);
    }
  };

  const handleToggle = async (trigger: UserTrigger) => {
    try {
      setTogglingId(trigger.id);
      await api.post(
        trigger.is_enabled ? "/triggers/disable" : "/triggers/enable",
        { triggerId: trigger.id },
      );
      setUserTriggers((prev) =>
        prev.map((t) =>
          t.id === trigger.id ? { ...t, is_enabled: !t.is_enabled } : t,
        ),
      );
      showToastMsg(
        `Trigger ${trigger.is_enabled ? "paused" : "resumed"}`,
        "success",
      );
    } catch (e: any) {
      showToastMsg(e?.message || "Failed to update trigger", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (triggerId: string) => {
    try {
      setDeletingId(triggerId);
      await api.post("/triggers/delete", { triggerId });
      setUserTriggers((prev) => prev.filter((t) => t.id !== triggerId));
      showToastMsg("Trigger removed", "success");
    } catch (e: any) {
      showToastMsg(e?.message || "Failed to delete trigger", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const showToastMsg = (message: string, type: "success" | "error") => {
    if (type === "success") toastSuccess(message);
    else toastError(message);
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
    } catch {
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
    } catch {
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
        {/* Config Modal — shadcn Dialog */}
        {configuringTrigger && (
          <ConfigFormModal
            trigger={configuringTrigger}
            onSubmit={(config) => handleCreate(configuringTrigger, config)}
            onClose={() => setConfiguringTrigger(null)}
            isSubmitting={creating === configuringTrigger.slug}
          />
        )}

        {/* Pause Warning — shadcn Dialog */}
        <Dialog
          open={!!pauseWarningTrigger}
          onOpenChange={(open) => {
            if (!open) setPauseWarningTrigger(null);
          }}
        >
          <DialogContent showCloseButton={false} className="sm:max-w-sm">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Pause
                    strokeWidth={1.5}
                    size={16}
                    className="text-amber-400"
                  />
                </div>
                <DialogTitle>Pause this automation?</DialogTitle>
              </div>
              <DialogDescription>
                <span className="font-medium text-foreground">
                  {pauseWarningTrigger?.trigger_name ||
                    formatTriggerSlug(pauseWarningTrigger?.trigger_slug || "")}
                </span>{" "}
                runs automatically to keep your daily briefings updated. Pausing
                it will stop new events from appearing in your briefing until
                you resume.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPauseWarningTrigger(null)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                onClick={() => {
                  if (pauseWarningTrigger) handleToggle(pauseWarningTrigger);
                  setPauseWarningTrigger(null);
                }}
              >
                Pause anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Page header */}
        <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Automations
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Triggers that watch for events across your connected apps
            </p>
          </div>
          {!loading && integrations.length > 0 && (
            <Button
              size="sm"
              onClick={() => setShowCreatePanel(!showCreatePanel)}
            >
              <Plus strokeWidth={1.5} size={14} />
              New
            </Button>
          )}
        </div>

        {/* View tabs */}
        {!loading && userTriggers.length > 0 && (
          <div className="px-4 sm:px-6 border-b border-border flex items-center gap-1">
            {(["triggers", "activity"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setViewTab(tab)}
                className={`px-3 py-3 text-xs font-medium transition-colors border-b-2 -mb-px ${viewTab === tab ? "text-foreground border-foreground" : "text-muted-foreground hover:text-foreground/80 border-transparent"}`}
              >
                {tab === "triggers" ? "Triggers" : "Activity Log"}
              </button>
            ))}
          </div>
        )}

        {/* Stats strip */}
        {stats && stats.total > 0 && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-border">
            {[
              {
                label: "Active",
                value: stats.active,
                color: "text-emerald-400",
              },
              {
                label: "Paused",
                value: stats.paused,
                color: "text-muted-foreground",
              },
              {
                label: "Events",
                value: stats.totalEvents,
                color: "text-foreground",
              },
              {
                label: "Errors",
                value: stats.totalErrors,
                color:
                  stats.totalErrors > 0
                    ? "text-destructive"
                    : "text-muted-foreground",
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`px-6 py-4 ${i < 3 ? "border-r border-border" : ""}`}
              >
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  {s.label}
                </p>
                <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 px-4 sm:px-6 py-4">
          {/* Loading */}
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-36 mb-2" />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-border rounded-xl px-4 sm:px-5 py-4"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <div className="flex-1 space-y-2 pt-0.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Create Panel */}
              <Sheet
                isOpen={showCreatePanel}
                onClose={() => setShowCreatePanel(false)}
                title="Create Automation"
                description="Choose an app to set up a trigger"
              >
                <div className="space-y-3 pb-8">
                  <div className="space-y-2">
                    {integrations.map((integration) => {
                      const displayName =
                        integration.displayName || integration.appName;
                      const isExpanded =
                        selectedToolkit === integration.appName;
                      return (
                        <div key={integration.id}>
                          <button
                            onClick={() =>
                              loadAvailableTriggers(integration.appName)
                            }
                            className="w-full flex items-center gap-3 border border-border rounded-xl px-4 py-3 hover:bg-muted/50 transition-colors"
                          >
                            <AppLogo
                              logo={
                                integration.logo ||
                                getLogo(integration.appName.toLowerCase()) ||
                                undefined
                              }
                              appKey={integration.appName}
                              displayName={displayName}
                              size="md"
                            />
                            <span className="flex-1 text-left text-sm font-medium text-foreground">
                              {displayName}
                            </span>
                            {isExpanded ? (
                              <ChevronDown
                                strokeWidth={1.5}
                                size={16}
                                className="text-muted-foreground"
                              />
                            ) : (
                              <ChevronRight
                                strokeWidth={1.5}
                                size={16}
                                className="text-muted-foreground"
                              />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="ml-4 mt-2 space-y-1.5">
                              {loadingTriggers ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2
                                    strokeWidth={1.5}
                                    size={16}
                                    className="animate-spin text-muted-foreground"
                                  />
                                </div>
                              ) : availableTriggers.length > 0 ? (
                                availableTriggers.map((trigger) => (
                                  <div
                                    key={trigger.slug}
                                    className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-3 py-2.5"
                                  >
                                    <Zap
                                      strokeWidth={1.5}
                                      size={14}
                                      className="text-muted-foreground flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm text-foreground truncate">
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
                                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                                            {desc}
                                          </p>
                                        ) : null;
                                      })()}
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => openConfigModal(trigger)}
                                      disabled={creating === trigger.slug}
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
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground py-3 px-2">
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

              {/* Suggested Templates */}
              {!searchQuery && userTriggers.length < 5 && (
                <div className="mb-10 space-y-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                        className="text-left border border-border rounded-xl p-4 hover:bg-muted/50 lift pressable group"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex -space-x-2">
                            {tmpl.apps.map((app, j) => {
                              const logo = getLogo(
                                app.toLowerCase().replace(/\s+/g, ""),
                              );
                              return (
                                <AppLogo
                                  key={j}
                                  logo={logo || undefined}
                                  appKey={app}
                                  displayName={app}
                                  size="sm"
                                  className="w-6 h-6 border-2 border-background bg-background relative z-10"
                                />
                              );
                            })}
                          </div>
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus
                              strokeWidth={1.5}
                              size={16}
                              className="text-foreground"
                            />
                          </div>
                        </div>
                        <h4 className="text-sm font-medium text-foreground mb-1">
                          {tmpl.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tmpl.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {viewTab === "activity" && userTriggers.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Recent Events
                  </p>
                  {loadingActivity ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2
                        strokeWidth={1.5}
                        className="animate-spin text-muted-foreground"
                        size={20}
                      />
                    </div>
                  ) : activityEvents.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-xl">
                      <Clock
                        strokeWidth={1.5}
                        size={24}
                        className="mx-auto text-muted-foreground mb-2"
                      />
                      <p className="text-sm text-muted-foreground">
                        No trigger events recorded yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activityEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.status === "processed" ? "bg-emerald-500" : ev.status === "error" ? "bg-destructive" : ev.status === "skipped" ? "bg-amber-500" : "bg-muted-foreground"}`}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {formatTriggerSlug(
                                  ev.trigger_slug || ev.event_type,
                                )}
                              </p>
                              {ev.error && (
                                <p className="text-[11px] text-destructive truncate">
                                  {ev.error}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {ev.processing_time_ms != null && (
                              <span className="text-[11px] text-muted-foreground tabular-nums">
                                {ev.processing_time_ms}ms
                              </span>
                            )}
                            <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Active Triggers */}
              {viewTab === "triggers" && userTriggers.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Active Automations
                    </p>
                    <div className="relative w-full sm:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Search strokeWidth={1.5} size={14} />
                      </div>
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search triggers..."
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {filteredTriggers.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm text-muted-foreground">
                        No active triggers match your search.
                      </p>
                    </div>
                  ) : (
                    filteredTriggers.map((trigger) => {
                      const toolkitKey = trigger.toolkit?.toLowerCase() || "";
                      const toolkitName = trigger.toolkit;
                      const isToggling = togglingId === trigger.id;
                      const isDeleting = deletingId === trigger.id;

                      return (
                        <div
                          key={trigger.id}
                          className={`border border-border rounded-xl px-4 sm:px-5 py-4 lift hover:border-foreground/20 ${!trigger.is_enabled ? "opacity-60 grayscale-[0.5]" : ""}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0 flex flex-col gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-semibold text-foreground">
                                  {trigger.trigger_name ||
                                    formatTriggerSlug(trigger.trigger_slug)}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={
                                    trigger.is_enabled
                                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                      : "bg-muted text-muted-foreground border-border"
                                  }
                                >
                                  {trigger.is_enabled ? "Active" : "Paused"}
                                </Badge>
                                {trigger.is_auto && (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  >
                                    Auto
                                  </Badge>
                                )}
                                {getTriggerDescription(
                                  trigger.trigger_slug,
                                ) && (
                                  <p className="text-xs text-muted-foreground">
                                    {getTriggerDescription(
                                      trigger.trigger_slug,
                                    )}
                                  </p>
                                )}
                              </div>

                              {/* Visual Flow */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted border border-border">
                                  {(() => {
                                    const logo =
                                      integrations.find(
                                        (i) =>
                                          i.appName.toLowerCase() ===
                                          toolkitKey,
                                      )?.logo ||
                                      getLogo(toolkitKey) ||
                                      undefined;
                                    return (
                                      <AppLogo
                                        logo={logo}
                                        appKey={toolkitKey}
                                        displayName={toolkitName || "App"}
                                        size="sm"
                                        className="w-4 h-4"
                                      />
                                    );
                                  })()}
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {toolkitName}
                                  </span>
                                </div>
                                <ArrowRight
                                  strokeWidth={1.5}
                                  size={14}
                                  className="text-muted-foreground"
                                />
                                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted border border-border">
                                  <Zap
                                    strokeWidth={1.5}
                                    size={14}
                                    className="text-foreground"
                                  />
                                  <span className="text-xs font-medium text-foreground">
                                    CalmPilot
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                              <div className="flex items-center gap-1 bg-muted border border-border rounded-lg p-0.5">
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => {
                                        if (
                                          trigger.is_enabled &&
                                          trigger.is_auto
                                        )
                                          setPauseWarningTrigger(trigger);
                                        else handleToggle(trigger);
                                      }}
                                      disabled={isToggling}
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
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {trigger.is_enabled ? "Pause" : "Resume"}
                                  </TooltipContent>
                                </Tooltip>
                                <div className="w-px h-4 bg-border" />
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() =>
                                        setConfirmDeleteId(trigger.id)
                                      }
                                      disabled={isDeleting}
                                      className="hover:text-destructive"
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
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="text-[11px]"
                                >
                                  <Activity strokeWidth={1.5} size={12} />
                                  {trigger.event_count || 0}
                                </Badge>
                                {trigger.error_count > 0 && (
                                  <Link
                                    href={`/dashboard/feed?q=${encodeURIComponent(trigger.trigger_slug)}`}
                                  >
                                    <Badge
                                      variant="destructive"
                                      className="text-[11px]"
                                    >
                                      <X strokeWidth={1.5} size={12} />
                                      {trigger.error_count} error
                                      {trigger.error_count !== 1 ? "s" : ""}
                                    </Badge>
                                  </Link>
                                )}
                                <Button
                                  variant={
                                    expandedTriggerId === trigger.id
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  size="xs"
                                  onClick={() => {
                                    if (expandedTriggerId === trigger.id)
                                      setExpandedTriggerId(null);
                                    else {
                                      setExpandedTriggerId(trigger.id);
                                      loadTriggerEvents(trigger.id);
                                    }
                                  }}
                                >
                                  <Clock strokeWidth={1.5} size={12} />
                                  Events
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Event Log */}
                          {expandedTriggerId === trigger.id && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Recent Events
                              </p>
                              {loadingEvents ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2
                                    strokeWidth={1.5}
                                    className="animate-spin text-muted-foreground"
                                    size={14}
                                  />
                                </div>
                              ) : triggerEvents.length === 0 ? (
                                <p className="text-[11px] text-muted-foreground py-2">
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
                                        className="flex flex-col gap-0.5 text-[11px] px-2.5 py-2 rounded-md bg-muted"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2 min-w-0">
                                            <div
                                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ev.status === "processed" ? "bg-emerald-500" : ev.status === "error" ? "bg-destructive" : ev.status === "skipped" ? "bg-amber-500" : "bg-muted-foreground"}`}
                                            />
                                            <span className="font-medium text-muted-foreground">
                                              {ev.status}
                                            </span>
                                          </div>
                                          <span className="text-muted-foreground tabular-nums ml-2 flex-shrink-0">
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
                                          <p className="text-destructive truncate pl-3.5">
                                            {ev.error}
                                          </p>
                                        ) : preview ? (
                                          <p className="text-muted-foreground truncate pl-3.5">
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
                /* Empty State */
                !showCreatePanel && (
                  <div className="text-center py-20 px-4 border border-dashed border-border rounded-xl relative overflow-hidden">
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
                            <stop
                              offset="1"
                              stopColor="white"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                        <Zap
                          strokeWidth={1.5}
                          size={20}
                          className="text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2 max-w-md mx-auto">
                        <h3 className="text-lg font-medium text-foreground">
                          Build your first automation
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Triggers quietly watch for events across your
                          connected apps and execute workflows automatically.
                        </p>
                      </div>
                      {integrations.length > 0 ? (
                        <Button onClick={() => setShowCreatePanel(true)}>
                          <Plus strokeWidth={1.5} size={16} />
                          Create Trigger
                        </Button>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border text-sm text-muted-foreground">
                          <span>Connect an app in</span>
                          <a
                            href="/dashboard/integrations"
                            className="text-foreground font-medium hover:underline"
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
        onConfirm={() => {
          if (confirmDeleteId) handleDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}
