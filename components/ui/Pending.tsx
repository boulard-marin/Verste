import type { ReactNode } from "react";

/** True outside production builds: placeholders for missing founder content are shown. */
export const showPending = process.env.NODE_ENV !== "production";

/**
 * Marks content the founder has not provided yet. Visible in development so
 * the gap is obvious; never rendered in production.
 */
export function Pending({ children, className = "" }: { children: ReactNode; className?: string }) {
  if (!showPending) return null;
  return (
    <span
      className={`label inline-flex items-center gap-2 border border-dashed border-current/50 px-2 py-1 text-fg-2 normal-case ${className}`}
    >
      À compléter · {children}
    </span>
  );
}
