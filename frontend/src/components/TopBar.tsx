import type { LibrarySummary, PlanSummary } from "../types.ts";

type TopBarProps = {
  plans: PlanSummary[];
  selectedPlanId: string | null;
  onSelectPlan: (id: string) => void;
  libraries: LibrarySummary[];
  selectedVersion: string | null;
  onSelectVersion: (version: string) => void;
};

export function TopBar({
  plans,
  selectedPlanId,
  onSelectPlan,
  libraries,
  selectedVersion,
  onSelectVersion,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-name">Plan takeoff</span>
      </div>

      <nav className="plan-switch" aria-label="Plans">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className="choice"
            aria-pressed={plan.id === selectedPlanId}
            onClick={() => onSelectPlan(plan.id)}
          >
            {plan.name}
          </button>
        ))}
      </nav>

      <div className="library-switch">
        <span className="switch-label" id="library-version-label">
          Library
        </span>
        <div className="choice-row" role="group" aria-labelledby="library-version-label">
          {libraries.map((library) => (
            <button
              key={library.version}
              type="button"
              className="choice"
              aria-pressed={library.version === selectedVersion}
              onClick={() => onSelectVersion(library.version)}
            >
              {library.version}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
