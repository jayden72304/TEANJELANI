import "dotenv/config";
import { runFullIngestion } from "../src/lib/ingest";

async function main() {
  console.log("Starting media & brand monitoring scan…");
  const result = await runFullIngestion();
  console.log(
    `Done. Added ${result.clientMentions} new client mention(s) and ${result.brandSignals} new brand signal(s).`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
