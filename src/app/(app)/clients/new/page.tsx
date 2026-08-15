import { ClientForm } from "../client-form";

export const metadata = { title: "New client" };

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">New client</h1>
        <p className="text-sm text-slate-400">
          Add a client profile with contact and personal information.
        </p>
      </div>
      <ClientForm />
    </div>
  );
}
