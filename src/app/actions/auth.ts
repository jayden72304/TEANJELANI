"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

const LoginSchema = z.object({
  email: z.string().trim().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return { error: "Invalid email or password." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
