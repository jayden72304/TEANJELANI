import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientBySlug, clientDisplayName } from "@/lib/data/clients";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ClientTabs } from "./tabs";

const statusTone: Record<string, BadgeTone> = {
  ACTIVE: "green",
  PROSPECT: "blue",
  FORMER: "slate",
};

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/clients"
            className="mb-2 inline-block text-xs font-medium text-slate-500 hover:text-slate-300"
          >
            ← All clients
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">
              {clientDisplayName(client)}
            </h1>
            <Badge tone={statusTone[client.status] ?? "slate"}>{client.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {[client.position, client.team, client.league].filter(Boolean).join(" · ") ||
              "No team information yet"}
          </p>
        </div>
        <Link
          href={`/clients/${client.slug}/edit`}
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700"
        >
          Edit profile
        </Link>
      </div>

      <ClientTabs slug={client.slug} />

      {children}
    </div>
  );
}
