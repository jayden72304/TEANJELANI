"use client";

import { useTransition } from "react";
import { deleteClient } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";

export function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        `Delete ${clientName}? This removes their contracts, leads, and monitoring data. This cannot be undone.`
      )
    ) {
      return;
    }
    startTransition(() => {
      deleteClient(clientId);
    });
  }

  return (
    <Button type="button" variant="danger" onClick={handleClick} disabled={pending}>
      {pending ? "Deleting…" : "Delete client"}
    </Button>
  );
}
