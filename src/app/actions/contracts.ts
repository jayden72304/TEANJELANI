"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ContractFormSchema } from "@/lib/validation/contract";

export type ContractActionState = { error?: string } | undefined;

function formToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createContract(
  _prevState: ContractActionState,
  formData: FormData
): Promise<ContractActionState> {
  await verifySession();
  const parsed = ContractFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let clientSlug: string;
  try {
    const client = await prisma.client.findUniqueOrThrow({
      where: { id: parsed.data.clientId },
      select: { slug: true },
    });
    clientSlug = client.slug;
    await prisma.contract.create({ data: parsed.data });
  } catch {
    return { error: "Failed to save contract. Please try again." };
  }

  revalidatePath("/contracts");
  revalidatePath(`/clients/${clientSlug}/contracts`);
  redirect(`/clients/${clientSlug}/contracts`);
}

export async function updateContract(
  contractId: string,
  _prevState: ContractActionState,
  formData: FormData
): Promise<ContractActionState> {
  await verifySession();
  const parsed = ContractFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let clientSlug: string;
  try {
    const client = await prisma.client.findUniqueOrThrow({
      where: { id: parsed.data.clientId },
      select: { slug: true },
    });
    clientSlug = client.slug;
    await prisma.contract.update({
      where: { id: contractId },
      data: parsed.data,
    });
  } catch {
    return { error: "Failed to save contract. Please try again." };
  }

  revalidatePath("/contracts");
  revalidatePath(`/clients/${clientSlug}/contracts`);
  redirect(`/clients/${clientSlug}/contracts`);
}

export async function deleteContract(contractId: string) {
  await verifySession();
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { client: { select: { slug: true } } },
  });
  await prisma.contract.delete({ where: { id: contractId } });
  revalidatePath("/contracts");
  if (contract?.client) {
    revalidatePath(`/clients/${contract.client.slug}/contracts`);
  }
}
