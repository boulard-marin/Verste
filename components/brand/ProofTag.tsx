import type { VerificationStatus } from "@/lib/travel/types";

import { formatDate } from "@/lib/format";

const label: Record<VerificationStatus, string> = {
  verifie: "Officiel",
  observe: "Terrain",
  "a-verifier": "À confirmer",
  contradictoire: "Sources divergentes",
};

/**
 * Says how solid the information next to it is. Four shapes, so the
 * distinction never relies on colour: filled square (official source,
 * checked), hollow circle (lived on the ground), dashed square (to confirm),
 * half-filled square (sources disagree).
 */
export function ProofTag({ status, checkedAt, className = "" }: { status: VerificationStatus; checkedAt?: string; className?: string }) {
  const date = checkedAt ? (status === "observe" ? "septembre 2026" : `vérifié le ${formatDate(checkedAt)}`) : null;
  return (
    <span className={`label inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-fg-2 ${className}`}>
      {status === "verifie" && <span aria-hidden="true" className="size-2 bg-current" />}
      {status === "observe" && <span aria-hidden="true" className="size-2 rounded-full border border-current" />}
      {status === "a-verifier" && <span aria-hidden="true" className="size-2 border border-dashed border-current" />}
      {status === "contradictoire" && (
        <span aria-hidden="true" className="size-2 border border-current" style={{ background: "linear-gradient(135deg, currentColor 50%, transparent 50%)" }} />
      )}
      {label[status]}
      {date && status !== "a-verifier" && <span className="normal-case tracking-normal opacity-80">· {date}</span>}
    </span>
  );
}
