import { getClientNameMap, clientDisplayName } from "@/lib/data/clients";
import { LeadForm } from "../lead-form";

export const metadata = { title: "New lead" };

export default async function NewLeadPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const clients = await getClientNameMap();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">New lead</h1>
      </div>
      <LeadForm
        clients={clients.map((c) => ({ id: c.id, name: clientDisplayName(c) }))}
        defaultClientId={clientId}
      />
    </div>
  );
}
