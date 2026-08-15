"use client";

import { useTransition } from "react";
import { LeadStage } from "@/generated/prisma/enums";
import { updateLeadStage } from "@/app/actions/leads";

export function LeadStageSelect({
  leadId,
  stage,
}: {
  leadId: string;
  stage: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={stage}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => {
          updateLeadStage(leadId, next);
        });
      }}
      className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white outline-none focus:border-orange-500"
    >
      {Object.values(LeadStage).map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
