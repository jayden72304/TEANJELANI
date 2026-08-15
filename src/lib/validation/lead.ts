import * as z from "zod";
import { LeadStage } from "@/generated/prisma/enums";

const enumValues = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [T[keyof T], ...T[keyof T][]];

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const optionalNumber = z
  .string()
  .optional()
  .transform((v) => {
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  });

export const LeadFormSchema = z.object({
  clientId: optionalString,
  companyName: z.string().trim().min(1, "Company name is required"),
  contactName: optionalString,
  contactEmail: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email")
    .transform((v) => (v ? v : undefined)),
  contactPhone: optionalString,
  industry: optionalString,
  stage: z.enum(enumValues(LeadStage)).default("NEW"),
  estimatedValue: optionalNumber,
  source: optionalString,
  notes: optionalString,
});

export type LeadFormInput = z.infer<typeof LeadFormSchema>;
