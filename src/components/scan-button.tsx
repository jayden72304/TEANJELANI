"use client";

import { useState, useTransition } from "react";
import { triggerIngestion } from "@/app/actions/ingestion";
import { Button } from "@/components/ui/button";

export function ScanButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | undefined>();

  function handleClick() {
    setMessage(undefined);
    startTransition(async () => {
      const result = await triggerIngestion();
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage(
          `Scan complete — ${result.clientMentions} new mention(s), ${result.brandSignals} new brand signal(s).`
        );
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button type="button" variant="secondary" onClick={handleClick} disabled={pending}>
        {pending ? "Scanning…" : "Run scan now"}
      </Button>
      {message && <p className="max-w-xs text-right text-xs text-slate-400">{message}</p>}
    </div>
  );
}
