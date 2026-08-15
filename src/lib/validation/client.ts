import * as z from "zod";
import {
  ClientStatus,
  PhoneLabel,
  EmailLabel,
  FamilyRelationship,
  ClothingCategory,
  SocialPlatform,
} from "@/generated/prisma/enums";

const enumValues = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [T[keyof T], ...T[keyof T][]];

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

export const PhoneSchema = z.object({
  id: z.string().optional(),
  label: z.enum(enumValues(PhoneLabel)).default("MOBILE"),
  number: z.string().trim().min(1, "Phone number is required"),
  notes: optionalString,
});

export const EmailSchema = z.object({
  id: z.string().optional(),
  label: z.enum(enumValues(EmailLabel)).default("PERSONAL"),
  email: z.email("Enter a valid email"),
  notes: optionalString,
});

export const FamilyContactSchema = z.object({
  id: z.string().optional(),
  relationship: z.enum(enumValues(FamilyRelationship)).default("OTHER"),
  name: z.string().trim().min(1, "Name is required"),
  phone: optionalString,
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email")
    .transform((v) => (v ? v : undefined)),
  notes: optionalString,
});

export const ClothingSizeSchema = z.object({
  id: z.string().optional(),
  category: z.enum(enumValues(ClothingCategory)).default("OTHER"),
  size: z.string().trim().min(1, "Size is required"),
  notes: optionalString,
});

export const SocialHandleSchema = z.object({
  id: z.string().optional(),
  platform: z.enum(enumValues(SocialPlatform)).default("INSTAGRAM"),
  handle: z.string().trim().min(1, "Handle is required"),
  url: optionalString,
  followers: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return undefined;
      const n = typeof v === "string" ? Number(v) : v;
      return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : undefined;
    }),
  notes: optionalString,
});

export const ClientFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  team: optionalString,
  league: optionalString,
  position: optionalString,
  jerseyNumber: optionalString,
  birthday: optionalString,
  status: z.enum(enumValues(ClientStatus)).default("ACTIVE"),
  photoUrl: optionalString,
  addressLine1: optionalString,
  addressLine2: optionalString,
  city: optionalString,
  state: optionalString,
  zip: optionalString,
  country: optionalString,
  notes: optionalString,
  phones: z.array(PhoneSchema).default([]),
  emails: z.array(EmailSchema).default([]),
  familyContacts: z.array(FamilyContactSchema).default([]),
  clothingSizes: z.array(ClothingSizeSchema).default([]),
  socialHandles: z.array(SocialHandleSchema).default([]),
});

export type ClientFormInput = z.infer<typeof ClientFormSchema>;
