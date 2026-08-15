import { notFound } from "next/navigation";
import { getClientBySlug } from "@/lib/data/clients";
import { ClientForm } from "../../client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">
          Edit {client.firstName} {client.lastName}
        </h1>
      </div>
      <ClientForm clientId={client.id} initial={client} />
    </div>
  );
}
