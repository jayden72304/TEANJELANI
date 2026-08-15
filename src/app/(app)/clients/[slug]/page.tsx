import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getClientBySlug } from "@/lib/data/clients";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteClientButton } from "./delete-button";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client) notFound();

  const address = [
    client.addressLine1,
    client.addressLine2,
    [client.city, client.state, client.zip].filter(Boolean).join(", "),
    client.country,
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader title="Contact information" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone numbers
              </h3>
              {client.phones.length === 0 ? (
                <p className="text-sm text-slate-500">None on file</p>
              ) : (
                <ul className="space-y-1.5">
                  {client.phones.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm">
                      <Badge>{p.label}</Badge>
                      <span className="text-slate-200">{p.number}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Emails
              </h3>
              {client.emails.length === 0 ? (
                <p className="text-sm text-slate-500">None on file</p>
              ) : (
                <ul className="space-y-1.5">
                  {client.emails.map((e) => (
                    <li key={e.id} className="flex items-center gap-2 text-sm">
                      <Badge>{e.label}</Badge>
                      <span className="text-slate-200">{e.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Home address" />
          {address.length === 0 ? (
            <p className="text-sm text-slate-500">No address on file</p>
          ) : (
            <address className="text-sm not-italic text-slate-200">
              {address.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </address>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Family & spouse"
            description="Parents, guardians, spouse, or partner"
          />
          {client.familyContacts.length === 0 ? (
            <p className="text-sm text-slate-500">No family contacts on file</p>
          ) : (
            <div className="space-y-3">
              {client.familyContacts.map((f) => (
                <div
                  key={f.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-800 px-3 py-2 text-sm"
                >
                  <Badge tone="purple">{f.relationship}</Badge>
                  <span className="font-medium text-white">{f.name}</span>
                  {f.phone && <span className="text-slate-400">{f.phone}</span>}
                  {f.email && <span className="text-slate-400">{f.email}</span>}
                </div>
              ))}
            </div>
          )}
        </Card>

        {client.notes && (
          <Card>
            <CardHeader title="Notes" />
            <p className="whitespace-pre-wrap text-sm text-slate-300">{client.notes}</p>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Player details" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Team</dt>
              <dd className="text-slate-200">{client.team ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">League</dt>
              <dd className="text-slate-200">{client.league ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Position</dt>
              <dd className="text-slate-200">{client.position ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Jersey #</dt>
              <dd className="text-slate-200">{client.jerseyNumber ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Birthday</dt>
              <dd className="text-slate-200">
                {client.birthday ? format(client.birthday, "MMMM d, yyyy") : "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Clothing sizes" />
          {client.clothingSizes.length === 0 ? (
            <p className="text-sm text-slate-500">No sizes on file</p>
          ) : (
            <dl className="space-y-2 text-sm">
              {client.clothingSizes.map((c) => (
                <div key={c.id} className="flex justify-between">
                  <dt className="text-slate-500">{c.category.replace("_", " / ")}</dt>
                  <dd className="text-slate-200">{c.size}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>

        <Card>
          <CardHeader title="Social media" />
          {client.socialHandles.length === 0 ? (
            <p className="text-sm text-slate-500">No handles on file</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {client.socialHandles.map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <span className="text-slate-200">
                    <Badge tone="blue" className="mr-2">
                      {s.platform.replace("_", " ")}
                    </Badge>
                    {s.handle}
                  </span>
                  {s.followers != null && (
                    <span className="text-xs text-slate-500">
                      {s.followers.toLocaleString()} followers
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="border-red-900/50">
          <CardHeader title="Danger zone" />
          <p className="mb-3 text-sm text-slate-400">
            Permanently delete this client and all associated records.
          </p>
          <DeleteClientButton clientId={client.id} clientName={`${client.firstName} ${client.lastName}`} />
        </Card>
      </div>
    </div>
  );
}
