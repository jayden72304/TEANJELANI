"use client";

import { useActionState } from "react";
import { ContractType, ContractStatus } from "@/generated/prisma/enums";
import { createContract, updateContract } from "@/app/actions/contracts";
import type { ContractActionState } from "@/app/actions/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

function toDateInputValue(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function ContractForm({
  contractId,
  clients,
  defaultClientId,
  initial,
}: {
  contractId?: string;
  clients: { id: string; name: string }[];
  defaultClientId?: string;
  initial?: {
    clientId?: string;
    type?: string;
    title?: string;
    counterparty?: string;
    category?: string | null;
    status?: string;
    value?: number | null;
    currency?: string;
    signedDate?: Date | string | null;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    terms?: string | null;
    documentUrl?: string | null;
    notes?: string | null;
  };
}) {
  const action = contractId
    ? updateContract.bind(null, contractId)
    : createContract;
  const [state, formAction, pending] = useActionState<
    ContractActionState,
    FormData
  >(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader title="Contract details" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Client" className="sm:col-span-2">
            <Select
              name="clientId"
              required
              defaultValue={initial?.clientId ?? defaultClientId ?? ""}
            >
              <option value="" disabled>
                Select a client…
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Type">
            <Select name="type" defaultValue={initial?.type ?? "LEAGUE"}>
              {Object.values(ContractType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={initial?.status ?? "DRAFT"}>
              {Object.values(ContractStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Title" className="sm:col-span-2">
            <Input
              name="title"
              required
              defaultValue={initial?.title ?? ""}
              placeholder="e.g. 4-Year Veteran Extension"
            />
          </Field>
          <Field label="Counterparty">
            <Input
              name="counterparty"
              required
              defaultValue={initial?.counterparty ?? ""}
              placeholder="Team or brand name"
            />
          </Field>
          <Field label="Category" hint="e.g. Endorsement, Shoe Deal, Rookie Scale">
            <Input name="category" defaultValue={initial?.category ?? ""} />
          </Field>
          <Field label="Value">
            <Input
              type="number"
              step="0.01"
              min={0}
              name="value"
              defaultValue={initial?.value ?? ""}
            />
          </Field>
          <Field label="Currency">
            <Input name="currency" defaultValue={initial?.currency ?? "USD"} />
          </Field>
          <Field label="Signed date">
            <Input
              type="date"
              name="signedDate"
              defaultValue={toDateInputValue(initial?.signedDate)}
            />
          </Field>
          <Field label="Start date">
            <Input
              type="date"
              name="startDate"
              defaultValue={toDateInputValue(initial?.startDate)}
            />
          </Field>
          <Field label="End date">
            <Input
              type="date"
              name="endDate"
              defaultValue={toDateInputValue(initial?.endDate)}
            />
          </Field>
          <Field label="Document URL" className="sm:col-span-2">
            <Input name="documentUrl" defaultValue={initial?.documentUrl ?? ""} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Terms" />
        <Textarea name="terms" rows={4} defaultValue={initial?.terms ?? ""} />
      </Card>

      <Card>
        <CardHeader title="Notes" />
        <Textarea name="notes" rows={3} defaultValue={initial?.notes ?? ""} />
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : contractId ? "Save changes" : "Create contract"}
        </Button>
      </div>
    </form>
  );
}
