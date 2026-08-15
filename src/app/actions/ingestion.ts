"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { runFullIngestion } from "@/lib/ingest";

export type IngestionResult = {
  clientMentions: number;
  brandSignals: number;
  error?: string;
};

export async function triggerIngestion(): Promise<IngestionResult> {
  await verifySession();
  try {
    const result = await runFullIngestion();
    revalidatePath("/monitoring");
    revalidatePath("/analytics");
    revalidatePath("/clients/[slug]/media", "page");
    return result;
  } catch {
    return {
      clientMentions: 0,
      brandSignals: 0,
      error: "Scan failed. Check the server logs and try again.",
    };
  }
}
