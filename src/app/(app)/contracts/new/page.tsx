import { getClientNameMap, clientDisplayName } from "@/lib/data/clients";
import { ContractForm } from "../contract-form";

export const metadata = { title: "New contract" };

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const clients = await getClientNameMap();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">New contract</h1>
      </div>
      <ContractForm
        clients={clients.map((c) => ({ id: c.id, name: clientDisplayName(c) }))}
        defaultClientId={clientId}
      />
    </div>
  );
}
