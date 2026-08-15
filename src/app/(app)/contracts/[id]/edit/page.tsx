import { notFound } from "next/navigation";
import { getContractById } from "@/lib/data/contracts";
import { getClientNameMap, clientDisplayName } from "@/lib/data/clients";
import { ContractForm } from "../../contract-form";

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contract, clients] = await Promise.all([
    getContractById(id),
    getClientNameMap(),
  ]);
  if (!contract) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Edit contract</h1>
      </div>
      <ContractForm
        contractId={contract.id}
        clients={clients.map((c) => ({ id: c.id, name: clientDisplayName(c) }))}
        initial={contract}
      />
    </div>
  );
}
