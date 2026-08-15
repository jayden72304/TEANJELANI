import { getKeywords } from "@/lib/data/keywords";
import { clientDisplayName } from "@/lib/data/clients";
import { createKeyword, deleteKeyword } from "@/app/actions/keywords";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function KeywordManager({
  categories,
  clients,
  fixedClientId,
  title,
  description,
}: {
  categories: string[];
  clients?: { id: string; name: string }[];
  fixedClientId?: string;
  title: string;
  description?: string;
}) {
  const allKeywords = (
    await Promise.all(categories.map((c) => getKeywords({ category: c })))
  ).flat();
  const keywords = fixedClientId
    ? allKeywords.filter((k) => k.clientId === fixedClientId)
    : allKeywords;

  return (
    <Card>
      <CardHeader title={title} description={description} />
      <form action={createKeyword} className="mb-4 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[10rem]">
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Keyword or phrase
          </label>
          <input
            name="keyword"
            required
            placeholder='e.g. "signature shoe deal"'
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
          />
        </div>
        {categories.length > 1 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Type</label>
            <select
              name="category"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        )}
        {fixedClientId ? (
          <input type="hidden" name="clientId" value={fixedClientId} />
        ) : (
          clients && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Client</label>
              <select
                name="clientId"
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                <option value="">Global (all clients)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )
        )}
        <button
          type="submit"
          className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-400"
        >
          + Add
        </button>
      </form>

      {keywords.length === 0 ? (
        <p className="text-sm text-slate-500">No keywords configured yet.</p>
      ) : (
        <ul className="space-y-2">
          {keywords.map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <Badge tone="orange">{k.keyword}</Badge>
                <span className="text-xs text-slate-500">
                  {k.category.replace("_", " ")}
                  {k.client ? ` · ${clientDisplayName(k.client)}` : ""}
                </span>
              </div>
              <form action={deleteKeyword.bind(null, k.id)}>
                <button
                  type="submit"
                  className="text-xs font-medium text-red-500/80 hover:text-red-400"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
