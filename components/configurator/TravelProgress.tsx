const STEPS = ["Durée", "Envies", "Russe", "Confort"];

/**
 * Configurator progress: four striped segments, one per verste. Completed
 * segments are filled, the current one carries the route colour.
 */
export function TravelProgress({ step }: { step: number }) {
  return (
    <div>
      <p className="label text-fg-2">
        <span lang="ru" className="text-route">
          Верста {step}
        </span>{" "}
        / 4 · {STEPS[step - 1]}
      </p>
      <ol aria-label="Étapes du configurateur" className="mt-4 grid grid-cols-4 gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "todo";
          return (
            <li key={label} aria-current={state === "current" ? "step" : undefined}>
              <span
                aria-hidden="true"
                className={`block h-2 border border-fg ${state === "todo" ? "opacity-25" : ""} ${
                  state === "current" ? "border-route bg-route" : ""
                }`}
                style={
                  state === "done"
                    ? { background: "repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 12px)" }
                    : undefined
                }
              />
              <span className={`label mt-2 block ${state === "todo" ? "text-fg-2/60" : "text-fg-2"}`}>
                {label}
                <span className="sr-only">{state === "done" ? " (fait)" : state === "current" ? " (en cours)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
