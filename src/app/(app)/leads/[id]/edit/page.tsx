import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/data/leads";
import { getClientNameMap, clientDisplayName } from "@/lib/data/clients";
import { LeadForm } from "../../lead-form";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, clients] = await Promise.all([getLeadById(id), getClientNameMap()]);
  if (!lead) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Edit lead</h1>
      </div>
      <LeadForm
        leadId={lead.id}
        clients={clients.map((c) => ({ id: c.id, name: clientDisplayName(c) }))}
        initial={lead}
      />
    </div>
  );
}
