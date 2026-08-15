"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { KeywordCategory } from "@/generated/prisma/enums";

export async function createKeyword(formData: FormData) {
  await verifySession();
  const keyword = String(formData.get("keyword") ?? "").trim();
  const category = String(formData.get("category") ?? "CLIENT_MENTION");
  const clientId = String(formData.get("clientId") ?? "").trim() || null;

  if (!keyword) return;

  await prisma.monitoredKeyword.create({
    data: {
      keyword,
      category: category as (typeof KeywordCategory)[keyof typeof KeywordCategory],
      clientId,
    },
  });

  revalidatePath("/monitoring");
  revalidatePath("/analytics");
}

export async function deleteKeyword(keywordId: string) {
  await verifySession();
  await prisma.monitoredKeyword.delete({ where: { id: keywordId } });
  revalidatePath("/monitoring");
  revalidatePath("/analytics");
}

export async function toggleKeyword(keywordId: string, isActive: boolean) {
  await verifySession();
  await prisma.monitoredKeyword.update({
    where: { id: keywordId },
    data: { isActive },
  });
  revalidatePath("/monitoring");
  revalidatePath("/analytics");
}
