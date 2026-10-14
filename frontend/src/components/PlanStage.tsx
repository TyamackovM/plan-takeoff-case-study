import type { Plan } from "../types.ts";

type PlanStageProps = {
  plan: Plan | null;
  message: string | null;
};

export function PlanStage({ plan, message }: PlanStageProps) {
  return (
    <section className="plan-stage" aria-label="Plan">
      <div className="board">
        <div className="board-copy">
          {message ? <p className="board-message">{message}</p> : null}
          {plan ? (
            <>
              <h1>{plan.name}</h1>
              <p>{plan.description}</p>
              <p className="board-note">
                Draw this plan to scale. The measurement convention should be readable on the
                drawing, not only in the cost lines.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
