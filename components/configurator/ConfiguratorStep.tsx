export type StepOption = { value: string; label: string; help?: string; ru?: string; big?: string };

type Props = {
  name: string;
  type: "single" | "multi";
  legend: string;
  help: string;
  options: StepOption[];
  selected: string[];
  error?: string;
};

/**
 * One verste of the configurator: a native fieldset of radios or checkboxes,
 * styled as large tappable cards. Keyboard, screen readers and no-JS all work
 * because the controls are real inputs; the look follows :checked via :has().
 */
export function ConfiguratorStep({ name, type, legend, help, options, selected, error }: Props) {
  const helpId = `${name}-aide`;
  const errorId = `${name}-erreur`;
  return (
    <fieldset aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`} className="min-w-0">
      <legend className="max-w-[18ch] font-display font-semicond text-h1 font-medium">{legend}</legend>
      <p id={helpId} className="mt-5 max-w-[56ch] text-lead text-fg-2">
        {help}
      </p>
      {error && (
        <p id={errorId} role="alert" className="mt-5 border-l-2 border-route pl-4 text-[0.98rem] text-fg">
          {error}
        </p>
      )}

      <div className={`mt-10 grid gap-3 ${options.length > 5 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className="group relative flex min-h-[5.5rem] cursor-pointer flex-col justify-center gap-1 border border-line bg-snow/70 py-4 pr-14 pl-5 transition-[border-color,background-color,box-shadow] duration-fast ease-verste hover:border-fg/40 has-[:checked]:border-route has-[:checked]:bg-snow has-[:checked]:shadow-[inset_4px_0_0_var(--route)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-route"
          >
            <input
              type={type === "single" ? "radio" : "checkbox"}
              name={name}
              value={option.value}
              defaultChecked={selected.includes(option.value)}
              required={type === "single"}
              className="peer sr-only"
            />
            {option.big && (
              <span className="font-display font-cond text-[3rem] leading-none font-medium tabular">{option.big}</span>
            )}
            <span className="font-display text-h3">{option.label}</span>
            {option.ru && (
              <span lang="ru" className="label text-fg-2 group-has-[:checked]:text-route">
                {option.ru}
              </span>
            )}
            {option.help && <span className="text-[0.92rem] leading-snug text-fg-2">{option.help}</span>}
            <span
              aria-hidden="true"
              className={`absolute top-1/2 right-5 size-5 -translate-y-1/2 border border-fg/40 transition-colors duration-fast peer-checked:border-route peer-checked:bg-route ${
                type === "single" ? "rounded-full" : ""
              }`}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
