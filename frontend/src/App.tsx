import { useEffect, useState } from "react";
import { getHealth, getLibraries, getLibrary, getPlan, getPlans } from "./api.ts";
import { OptionsTray } from "./components/OptionsTray.tsx";
import { PlanStage } from "./components/PlanStage.tsx";
import { StatusBar } from "./components/StatusBar.tsx";
import { TakeoffPanel } from "./components/TakeoffPanel.tsx";
import { VolumeView } from "./components/VolumeView.tsx";
import { TopBar } from "./components/TopBar.tsx";
import type { Health, Library, LibrarySummary, Plan, PlanSummary, RequestState } from "./types.ts";

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Request failed";
}

export default function App() {
  const [healthAttempt, setHealthAttempt] = useState(0);
  const [health, setHealth] = useState<RequestState<Health>>({ status: "loading" });
  const [plans, setPlans] = useState<RequestState<PlanSummary[]>>({ status: "loading" });
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [plan, setPlan] = useState<RequestState<Plan>>({ status: "loading" });
  const [libraries, setLibraries] = useState<RequestState<LibrarySummary[]>>({ status: "loading" });
  const [version, setVersion] = useState<string | null>(null);
  const [library, setLibrary] = useState<RequestState<Library>>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setHealth({ status: "loading" });
    getHealth(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setHealth({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setHealth({ status: "error", message: messageOf(error) });
      });
    return () => controller.abort();
  }, [healthAttempt]);

  useEffect(() => {
    const controller = new AbortController();
    setPlans({ status: "loading" });
    getPlans(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setPlans({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setPlans({ status: "error", message: messageOf(error) });
      });
    return () => controller.abort();
  }, [healthAttempt]);

  useEffect(() => {
    if (plans.status !== "ready" || selectedPlanId !== null) return;
    const preferred = plans.data.find((item) => item.id === "rectangle") ?? plans.data[0];
    if (preferred) setSelectedPlanId(preferred.id);
  }, [plans, selectedPlanId]);

  useEffect(() => {
    if (selectedPlanId === null) return;
    const controller = new AbortController();
    setPlan({ status: "loading" });
    getPlan(selectedPlanId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setPlan({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setPlan({ status: "error", message: messageOf(error) });
      });
    return () => controller.abort();
  }, [selectedPlanId, healthAttempt]);

  useEffect(() => {
    const controller = new AbortController();
    setLibraries({ status: "loading" });
    getLibraries(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setLibraries({ status: "ready", data });
        setVersion((current) => current ?? data[0]?.version ?? null);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLibraries({ status: "error", message: messageOf(error) });
        }
      });
    return () => controller.abort();
  }, [healthAttempt]);

  useEffect(() => {
    if (version === null) return;
    const controller = new AbortController();
    setLibrary({ status: "loading" });
    getLibrary(version, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setLibrary({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLibrary({ status: "error", message: messageOf(error) });
      });
    return () => controller.abort();
  }, [version, healthAttempt]);

  const planMessage =
    plans.status === "error"
      ? plans.message
      : plan.status === "error"
        ? plan.message
        : plan.status === "loading"
          ? "Loading plan…"
          : null;

  const libraryMessage =
    libraries.status === "error"
      ? libraries.message
      : library.status === "error"
        ? library.message
        : library.status === "loading"
          ? "Loading library…"
          : null;

  const healthLabel =
    health.status === "ready"
      ? health.data.status
      : health.status === "error"
        ? health.message
        : "checking";

  return (
    <div className="app">
      <TopBar
        plans={plans.status === "ready" ? plans.data : []}
        selectedPlanId={selectedPlanId}
        onSelectPlan={setSelectedPlanId}
        libraries={libraries.status === "ready" ? libraries.data : []}
        selectedVersion={version}
        onSelectVersion={setVersion}
      />
      <div className="workspace">
        <div className="stage">
          <PlanStage plan={plan.status === "ready" ? plan.data : null} message={planMessage} />
          <VolumeView plan={plan.status === "ready" ? plan.data : null} />
          <OptionsTray />
        </div>
        <TakeoffPanel library={library.status === "ready" ? library.data : null} message={libraryMessage} />
      </div>
      <StatusBar
        health={healthLabel}
        failed={
          health.status === "error" ||
          plans.status === "error" ||
          libraries.status === "error" ||
          plan.status === "error" ||
          library.status === "error"
        }
        onRetry={() => setHealthAttempt((attempt) => attempt + 1)}
      />
    </div>
  );
}
