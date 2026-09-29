import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xs font-sans font-medium whitespace-nowrap " +
  "transition-[background-color,color,border-color,transform,filter] duration-fast ease-verste active:translate-y-px";

const variants: Record<Variant, string> = {
  primary: "bg-route text-on-route hover:brightness-110",
  secondary: "border border-fg/35 text-fg hover:border-fg hover:bg-fg/5",
  quiet: "text-fg underline decoration-fg/30 underline-offset-[6px] hover:decoration-route",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-6 text-[0.95rem]",
  sm: "min-h-10 px-4 text-[0.875rem]",
};

type Common = { variant?: Variant; size?: Size; children: ReactNode; className?: string };

export function buttonClass({ variant = "primary", size = "md", className = "" }: Omit<Common, "children">) {
  return `${base} ${variants[variant]} ${variant === "quiet" ? "" : sizes[size]} ${className}`;
}

export function ButtonLink({
  variant,
  size,
  className,
  children,
  ...props
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link className={buttonClass({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...props
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClass({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}
