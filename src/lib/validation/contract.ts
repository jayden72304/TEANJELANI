import * as z from "zod";
import { ContractType, ContractStatus } from "@/generated/prisma/enums";

const enumValues = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [T[keyof T], ...T[keyof T][]];

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : undefined));

const optionalNumber = z
  .string()
  .optional()
  .transform((v) => {
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  });

export const ContractFormSchema = z.object({
  clientId: z.string().min(1, "Select a client"),
  type: z.enum(enumValues(ContractType)),
  title: z.string().trim().min(1, "Title is required"),
  counterparty: z.string().trim().min(1, "Counterparty is required"),
  category: optionalString,
  status: z.enum(enumValues(ContractStatus)).default("DRAFT"),
  value: optionalNumber,
  currency: z.string().trim().min(1).default("USD"),
  signedDate: optionalDate,
  startDate: optionalDate,
  endDate: optionalDate,
  terms: optionalString,
  documentUrl: optionalString,
  notes: optionalString,
});

export type ContractFormInput = z.infer<typeof ContractFormSchema>;
