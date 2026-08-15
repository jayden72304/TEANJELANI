"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { LeadFormSchema } from "@/lib/validation/lead";

export type LeadActionState = { error?: string } | undefined;

function formToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createLead(
  _prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  await verifySession();
  const parsed = LeadFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await prisma.lead.create({
      data: { ...parsed.data, clientId: parsed.data.clientId || null },
    });
  } catch {
    return { error: "Failed to save lead. Please try again." };
  }

  revalidatePath("/leads");
  redirect("/leads");
}

export async function updateLead(
  leadId: string,
  _prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  await verifySession();
  const parsed = LeadFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { ...parsed.data, clientId: parsed.data.clientId || null },
    });
  } catch {
    return { error: "Failed to save lead. Please try again." };
  }

  revalidatePath("/leads");
  redirect("/leads");
}

export async function updateLeadStage(leadId: string, stage: string) {
  await verifySession();
  await prisma.lead.update({ where: { id: leadId }, data: { stage: stage as never } });
  revalidatePath("/leads");
}

export async function deleteLead(leadId: string) {
  await verifySession();
  await prisma.lead.delete({ where: { id: leadId } });
  revalidatePath("/leads");
}
