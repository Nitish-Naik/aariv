"use client";

import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

interface Step {
  label: string;
  durationMs: number;
}

const STEPS_BY_APP: Record<string, Step[]> = {
  gmail: [
    { label: "Connecting Gmail", durationMs: 800 },
    { label: "Fetching your recent emails", durationMs: 1800 },
    { label: "Analysing what matters", durationMs: 1600 },
    { label: "Building your first briefing", durationMs: 1400 },
  ],
  googlecalendar: [
    { label: "Connecting Google Calendar", durationMs: 800 },
    { label: "Reading your upcoming events", durationMs: 1400 },
    { label: "Mapping out your day", durationMs: 1200 },
    { label: "Building your first briefing", durationMs: 1000 },
  ],
  slack: [
    { label: "Connecting Slack", durationMs: 800 },
    { label: "Scanning your channels", durationMs: 1600 },
    { label: "Finding messages that need you", durationMs: 1400 },
    { label: "Building your first briefing", durationMs: 1200 },
  ],
  default: [
    { label: "Connecting your app", durationMs: 800 },
    { label: "Fetching recent activity", durationMs: 1600 },
    { label: "Analysing what matters", durationMs: 1400 },
    { label: "Building your first briefing", durationMs: 1200 },
  ],
};

const APP_LABELS: Record<string, string> = {
  gmail: "Gmail",
  googlecalendar: "Google Calendar",
  slack: "Slack",
};

function SetupContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appSlug = searchParams.get("app") ?? "default";

  const steps = STEPS_BY_APP[appSlug] ?? STEPS_BY_APP.default;
  const appLabel = APP_LABELS[appSlug] ?? "your app";

  const [currentStep, setCurrentStep] = useState(0); // index of step currently running
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  // Run through steps sequentially
  useEffect(() => {
    if (!user || started.current) return;
    started.current = true;

    let stepIndex = 0;

    const runStep = () => {
      if (stepIndex >= steps.length) {
        setDone(true);
        setTimeout(() => router.replace("/dashboard"), 1600);
        return;
      }
      setCurrentStep(stepIndex);
      const duration = steps[stepIndex].durationMs;
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, stepIndex]);
        stepIndex++;
        runStep();
      }, duration);
    };

    runStep();
  }, [user, steps, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-white/[0.025] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center shadow-xl">
            <span className="text-white text-xl font-bold tracking-tight">A</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          {done ? (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 strokeWidth={1.5} size={36} className="text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                You&apos;re all set.
              </h1>
              <p className="text-neutral-500 text-sm">
                Opening your briefing…
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                Setting up CalmPilot
              </h1>
              <p className="text-neutral-500 text-sm">
                Pulling in your {appLabel} data — just a moment.
              </p>
            </>
          )}
        </div>

        {/* Steps */}
        {!done && (
          <div className="space-y-3">
            {steps.map((step, i) => {
              const isCompleted = completedSteps.includes(i);
              const isActive = currentStep === i && !isCompleted;
              const isPending = i > currentStep;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 transition-opacity duration-300 ${
                    isPending ? "opacity-30" : "opacity-100"
                  }`}
                >
                  {/* Status icon */}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {isCompleted ? (
                      <CheckCircle2
                        strokeWidth={1.5}
                        size={16}
                        className="text-emerald-500"
                      />
                    ) : isActive ? (
                      <Loader2
                        size={16}
                        className="text-white/60 animate-spin"
                      />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      isCompleted
                        ? "text-neutral-400 line-through decoration-neutral-700"
                        : isActive
                        ? "text-white font-medium"
                        : "text-neutral-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Progress bar */}
        {!done && (
          <div className="mt-8 h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/20 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.round(
                  ((completedSteps.length) / steps.length) * 100,
                )}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  );
}
