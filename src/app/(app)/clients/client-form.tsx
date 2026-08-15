"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ClientStatus,
  PhoneLabel,
  EmailLabel,
  FamilyRelationship,
  ClothingCategory,
  SocialPlatform,
} from "@/generated/prisma/enums";
import type { ClientFormInput } from "@/lib/validation/client";
import { createClient, updateClient } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

type Phone = ClientFormInput["phones"][number];
type EmailRow = ClientFormInput["emails"][number];
type Family = ClientFormInput["familyContacts"][number];
type Clothing = ClientFormInput["clothingSizes"][number];
type Social = ClientFormInput["socialHandles"][number];

// Loose shape matching what Prisma returns (nullable fields) rather than the
// stricter zod-inferred form type (optional fields), so client records can be
// passed straight into the edit form without remapping every field.
export type ClientInitialData = {
  firstName?: string | null;
  lastName?: string | null;
  team?: string | null;
  league?: string | null;
  position?: string | null;
  jerseyNumber?: string | null;
  birthday?: string | Date | null;
  status?: string | null;
  photoUrl?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  notes?: string | null;
  phones?: {
    id?: string;
    label: string;
    number: string;
    notes?: string | null;
  }[];
  emails?: {
    id?: string;
    label: string;
    email: string;
    notes?: string | null;
  }[];
  familyContacts?: {
    id?: string;
    relationship: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
  }[];
  clothingSizes?: {
    id?: string;
    category: string;
    size: string;
    notes?: string | null;
  }[];
  socialHandles?: {
    id?: string;
    platform: string;
    handle: string;
    url?: string | null;
    followers?: number | null;
    notes?: string | null;
  }[];
};

function toDateInputValue(value?: string | Date | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

const emptyPhone: Phone = { label: "MOBILE", number: "", notes: "" };
const emptyEmail: EmailRow = { label: "PERSONAL", email: "", notes: "" };
const emptyFamily: Family = {
  relationship: "OTHER",
  name: "",
  phone: "",
  email: "",
  notes: "",
};
const emptyClothing: Clothing = { category: "OTHER", size: "", notes: "" };
const emptySocial: Social = {
  platform: "INSTAGRAM",
  handle: "",
  url: "",
  followers: undefined,
  notes: "",
};

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg px-2 py-2 text-xs font-medium text-slate-500 hover:bg-red-950 hover:text-red-400"
      aria-label="Remove"
    >
      Remove
    </button>
  );
}

export function ClientForm({
  clientId,
  initial,
}: {
  clientId?: string;
  initial?: ClientInitialData;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [team, setTeam] = useState(initial?.team ?? "");
  const [league, setLeague] = useState(initial?.league ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [jerseyNumber, setJerseyNumber] = useState(initial?.jerseyNumber ?? "");
  const [birthday, setBirthday] = useState(toDateInputValue(initial?.birthday));
  const [status, setStatus] = useState(initial?.status ?? "ACTIVE");
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [addressLine1, setAddressLine1] = useState(initial?.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(initial?.addressLine2 ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [zip, setZip] = useState(initial?.zip ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const [phones, setPhones] = useState<Phone[]>(
    (initial?.phones ?? []).map((p) => ({
      id: p.id,
      label: p.label as Phone["label"],
      number: p.number,
      notes: p.notes ?? "",
    }))
  );
  const [emails, setEmails] = useState<EmailRow[]>(
    (initial?.emails ?? []).map((e) => ({
      id: e.id,
      label: e.label as EmailRow["label"],
      email: e.email,
      notes: e.notes ?? "",
    }))
  );
  const [familyContacts, setFamilyContacts] = useState<Family[]>(
    (initial?.familyContacts ?? []).map((f) => ({
      id: f.id,
      relationship: f.relationship as Family["relationship"],
      name: f.name,
      phone: f.phone ?? "",
      email: f.email ?? "",
      notes: f.notes ?? "",
    }))
  );
  const [clothingSizes, setClothingSizes] = useState<Clothing[]>(
    (initial?.clothingSizes ?? []).map((c) => ({
      id: c.id,
      category: c.category as Clothing["category"],
      size: c.size,
      notes: c.notes ?? "",
    }))
  );
  const [socialHandles, setSocialHandles] = useState<Social[]>(
    (initial?.socialHandles ?? []).map((s) => ({
      id: s.id,
      platform: s.platform as Social["platform"],
      handle: s.handle,
      url: s.url ?? "",
      followers: s.followers ?? undefined,
      notes: s.notes ?? "",
    }))
  );

  function updateRow<T>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    patch: Partial<T>
  ) {
    setter((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) {
    setter((rows) => rows.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    const payload: ClientFormInput = {
      firstName,
      lastName,
      team: team || undefined,
      league: league || undefined,
      position: position || undefined,
      jerseyNumber: jerseyNumber || undefined,
      birthday: birthday || undefined,
      status: status as ClientFormInput["status"],
      photoUrl: photoUrl || undefined,
      addressLine1: addressLine1 || undefined,
      addressLine2: addressLine2 || undefined,
      city: city || undefined,
      state: state || undefined,
      zip: zip || undefined,
      country: country || undefined,
      notes: notes || undefined,
      phones: phones.filter((p) => p.number.trim()),
      emails: emails.filter((e) => e.email.trim()),
      familyContacts: familyContacts.filter((f) => f.name.trim()),
      clothingSizes: clothingSizes.filter((c) => c.size.trim()),
      socialHandles: socialHandles.filter((s) => s.handle.trim()),
    };

    startTransition(async () => {
      const result = clientId
        ? await updateClient(clientId, payload)
        : await createClient(payload);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <Card>
        <CardHeader title="Basic information" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name">
            <Input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field>
          <Field label="Last name">
            <Input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field>
          <Field label="Team">
            <Input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="e.g. Los Angeles Lakers" />
          </Field>
          <Field label="League">
            <Input value={league} onChange={(e) => setLeague(e.target.value)} placeholder="e.g. NBA" />
          </Field>
          <Field label="Position">
            <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Point Guard" />
          </Field>
          <Field label="Jersey #">
            <Input value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)} />
          </Field>
          <Field label="Birthday">
            <Input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              {Object.values(ClientStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Photo URL" className="sm:col-span-2">
            <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Home address" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Address line 1" className="sm:col-span-2">
            <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
          </Field>
          <Field label="Address line 2" className="sm:col-span-2">
            <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
          </Field>
          <Field label="City">
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
          <Field label="State / Province">
            <Input value={state} onChange={(e) => setState(e.target.value)} />
          </Field>
          <Field label="ZIP / Postal code">
            <Input value={zip} onChange={(e) => setZip(e.target.value)} />
          </Field>
          <Field label="Country">
            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Phone numbers"
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPhones((p) => [...p, { ...emptyPhone }])}
            >
              + Add phone
            </Button>
          }
        />
        <div className="space-y-3">
          {phones.length === 0 && (
            <p className="text-sm text-slate-500">No phone numbers added.</p>
          )}
          {phones.map((row, i) => (
            <div key={i} className="flex items-end gap-2">
              <Field label="Label" className="w-32 shrink-0">
                <Select
                  value={row.label}
                  onChange={(e) => updateRow(setPhones, i, { label: e.target.value as Phone["label"] })}
                >
                  {Object.values(PhoneLabel).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Number" className="flex-1">
                <Input
                  value={row.number}
                  onChange={(e) => updateRow(setPhones, i, { number: e.target.value })}
                  placeholder="(555) 555-5555"
                />
              </Field>
              <RemoveButton onClick={() => removeRow(setPhones, i)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Email addresses"
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEmails((e) => [...e, { ...emptyEmail }])}
            >
              + Add email
            </Button>
          }
        />
        <div className="space-y-3">
          {emails.length === 0 && (
            <p className="text-sm text-slate-500">No email addresses added.</p>
          )}
          {emails.map((row, i) => (
            <div key={i} className="flex items-end gap-2">
              <Field label="Label" className="w-32 shrink-0">
                <Select
                  value={row.label}
                  onChange={(e) => updateRow(setEmails, i, { label: e.target.value as EmailRow["label"] })}
                >
                  {Object.values(EmailLabel).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Email" className="flex-1">
                <Input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateRow(setEmails, i, { email: e.target.value })}
                  placeholder="name@example.com"
                />
              </Field>
              <RemoveButton onClick={() => removeRow(setEmails, i)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Family & spouse contacts"
          description="Parents, guardians, spouse, or partner"
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFamilyContacts((f) => [...f, { ...emptyFamily }])}
            >
              + Add contact
            </Button>
          }
        />
        <div className="space-y-4">
          {familyContacts.length === 0 && (
            <p className="text-sm text-slate-500">No family contacts added.</p>
          )}
          {familyContacts.map((row, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-800 p-3 sm:grid-cols-12">
              <Field label="Relationship" className="sm:col-span-2">
                <Select
                  value={row.relationship}
                  onChange={(e) =>
                    updateRow(setFamilyContacts, i, {
                      relationship: e.target.value as Family["relationship"],
                    })
                  }
                >
                  {Object.values(FamilyRelationship).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Name" className="sm:col-span-3">
                <Input
                  value={row.name}
                  onChange={(e) => updateRow(setFamilyContacts, i, { name: e.target.value })}
                />
              </Field>
              <Field label="Phone" className="sm:col-span-3">
                <Input
                  value={row.phone}
                  onChange={(e) => updateRow(setFamilyContacts, i, { phone: e.target.value })}
                />
              </Field>
              <Field label="Email" className="sm:col-span-3">
                <Input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateRow(setFamilyContacts, i, { email: e.target.value })}
                />
              </Field>
              <div className="flex items-end justify-end sm:col-span-1">
                <RemoveButton onClick={() => removeRow(setFamilyContacts, i)} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Clothing sizes"
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => setClothingSizes((c) => [...c, { ...emptyClothing }])}
            >
              + Add size
            </Button>
          }
        />
        <div className="space-y-3">
          {clothingSizes.length === 0 && (
            <p className="text-sm text-slate-500">No sizes recorded.</p>
          )}
          {clothingSizes.map((row, i) => (
            <div key={i} className="flex items-end gap-2">
              <Field label="Category" className="w-40 shrink-0">
                <Select
                  value={row.category}
                  onChange={(e) =>
                    updateRow(setClothingSizes, i, { category: e.target.value as Clothing["category"] })
                  }
                >
                  {Object.values(ClothingCategory).map((c) => (
                    <option key={c} value={c}>
                      {c.replace("_", " / ")}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Size" className="flex-1">
                <Input
                  value={row.size}
                  onChange={(e) => updateRow(setClothingSizes, i, { size: e.target.value })}
                  placeholder='e.g. 15, XXL, 42R'
                />
              </Field>
              <RemoveButton onClick={() => removeRow(setClothingSizes, i)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Social media handles"
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSocialHandles((s) => [...s, { ...emptySocial }])}
            >
              + Add handle
            </Button>
          }
        />
        <div className="space-y-3">
          {socialHandles.length === 0 && (
            <p className="text-sm text-slate-500">No social handles added.</p>
          )}
          {socialHandles.map((row, i) => (
            <div key={i} className="flex items-end gap-2">
              <Field label="Platform" className="w-36 shrink-0">
                <Select
                  value={row.platform}
                  onChange={(e) =>
                    updateRow(setSocialHandles, i, { platform: e.target.value as Social["platform"] })
                  }
                >
                  {Object.values(SocialPlatform).map((p) => (
                    <option key={p} value={p}>
                      {p.replace("_", " ")}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Handle" className="flex-1">
                <Input
                  value={row.handle}
                  onChange={(e) => updateRow(setSocialHandles, i, { handle: e.target.value })}
                  placeholder="@handle"
                />
              </Field>
              <Field label="Followers" className="w-28 shrink-0">
                <Input
                  type="number"
                  min={0}
                  value={row.followers ?? ""}
                  onChange={(e) =>
                    updateRow(setSocialHandles, i, {
                      followers: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </Field>
              <RemoveButton onClick={() => removeRow(setSocialHandles, i)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Notes" />
        <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : clientId ? "Save changes" : "Create client"}
        </Button>
      </div>
    </form>
  );
}
