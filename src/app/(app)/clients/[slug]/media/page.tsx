import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientBySlug } from "@/lib/data/clients";
import { getClientMentions } from "@/lib/data/mentions";
import { getKeywords } from "@/lib/data/keywords";
import { ScanButton } from "@/components/scan-button";
import { MentionCard } from "@/components/mention-card";
import { KeywordManager } from "@/components/keyword-manager";
import { Card, CardHeader } from "@/components/ui/card";

export default async function ClientMediaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client) notFound();

  const [mentions] = await Promise.all([
    getClientMentions(client.id),
    getKeywords({ category: "CLIENT_MENTION", clientId: client.id }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <p className="max-w-xl text-sm text-slate-400">
          Everything published online about {client.firstName} — automatically tracked
          via a live news search for their name, plus any custom keywords below.
        </p>
        <ScanButton />
      </div>

      <KeywordManager
        categories={["CLIENT_MENTION"]}
        fixedClientId={client.id}
        title={`Custom keywords for ${client.firstName}`}
        description='Beyond the automatic name search, add nicknames or specific phrases to watch for.'
      />

      <Card>
        <CardHeader title="Mentions" />
        {mentions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No mentions found yet. Click “Run scan now,” or manage global keyword
            tracking from{" "}
            <Link href="/monitoring" className="text-orange-400 hover:text-orange-300">
              Media Monitoring
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-3">
            {mentions.map((m) => (
              <MentionCard key={m.id} mention={m} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
