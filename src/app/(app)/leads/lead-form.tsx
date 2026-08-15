"use client";

import { useActionState } from "react";
import { LeadStage } from "@/generated/prisma/enums";
import { createLead, updateLead } from "@/app/actions/leads";
import type { LeadActionState } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

export function LeadForm({
  leadId,
  clients,
  defaultClientId,
  initial,
}: {
  leadId?: string;
  clients: { id: string; name: string }[];
  defaultClientId?: string;
  initial?: {
    clientId?: string | null;
    companyName?: string;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    industry?: string | null;
    stage?: string;
    estimatedValue?: number | null;
    source?: string | null;
    notes?: string | null;
  };
}) {
  const action = leadId ? updateLead.bind(null, leadId) : createLead;
  const [state, formAction, pending] = useActionState<LeadActionState, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader title="Lead details" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company name" className="sm:col-span-2">
            <Input
              name="companyName"
              required
              defaultValue={initial?.companyName ?? ""}
            />
          </Field>
          <Field label="Client (optional)" hint="Leave blank for a general company lead not yet tied to a client">
            <Select name="clientId" defaultValue={initial?.clientId ?? defaultClientId ?? ""}>
              <option value="">Unassigned</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Stage">
            <Select name="stage" defaultValue={initial?.stage ?? "NEW"}>
              {Object.values(LeadStage).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Contact name">
            <Input name="contactName" defaultValue={initial?.contactName ?? ""} />
          </Field>
          <Field label="Contact email">
            <Input type="email" name="contactEmail" defaultValue={initial?.contactEmail ?? ""} />
          </Field>
          <Field label="Contact phone">
            <Input name="contactPhone" defaultValue={initial?.contactPhone ?? ""} />
          </Field>
          <Field label="Industry">
            <Input name="industry" defaultValue={initial?.industry ?? ""} />
          </Field>
          <Field label="Estimated value ($)">
            <Input
              type="number"
              step="0.01"
              min={0}
              name="estimatedValue"
              defaultValue={initial?.estimatedValue ?? ""}
            />
          </Field>
          <Field label="Source" hint="e.g. referral, inbound, cold outreach, brand analytics">
            <Input name="source" defaultValue={initial?.source ?? ""} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Notes" />
        <Textarea name="notes" rows={4} defaultValue={initial?.notes ?? ""} />
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : leadId ? "Save changes" : "Create lead"}
        </Button>
      </div>
    </form>
  );
}
