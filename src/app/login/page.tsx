import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("crm_session")?.value);
  if (session?.userId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white">
            CRM
          </div>
          <h1 className="text-xl font-semibold text-white">
            Agent Client Hub
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to manage your clients
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
