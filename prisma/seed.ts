import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "agent@example.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Agent Admin",
      email: adminEmail,
      passwordHash,
      role: "AGENT",
    },
  });
  console.log(`✓ Admin user ready: ${admin.email}`);

  const existing = await prisma.client.findUnique({ where: { slug: "malik-bridges" } });
  if (existing) {
    console.log("✓ Demo client already exists, skipping.");
  } else {
    const client = await prisma.client.create({
      data: {
        firstName: "Malik",
        lastName: "Bridges",
        slug: "malik-bridges",
        team: "Portland Trail Blazers",
        league: "NBA",
        position: "Shooting Guard",
        jerseyNumber: "23",
        birthday: new Date("1999-04-12"),
        status: "ACTIVE",
        addressLine1: "1420 SW Yamhill St",
        addressLine2: "Unit 8B",
        city: "Portland",
        state: "OR",
        zip: "97205",
        country: "USA",
        notes:
          "Demo client seeded for illustration purposes — replace or delete before real use.",
        phones: {
          create: [
            { label: "MOBILE", number: "(503) 555-0142" },
            { label: "AGENCY", number: "(503) 555-0199", notes: "Front desk" },
          ],
        },
        emails: {
          create: [
            { label: "PERSONAL", email: "malik.bridges@example.com" },
            { label: "AGENCY", email: "malik@agentclienthub.example" },
          ],
        },
        familyContacts: {
          create: [
            {
              relationship: "MOTHER",
              name: "Denise Bridges",
              phone: "(503) 555-0110",
              email: "denise.bridges@example.com",
            },
            {
              relationship: "SPOUSE",
              name: "Ariana Bridges",
              phone: "(503) 555-0177",
              email: "ariana.bridges@example.com",
            },
          ],
        },
        clothingSizes: {
          create: [
            { category: "SHOE", size: "15 US" },
            { category: "SHIRT", size: "XXL" },
            { category: "JACKET_SUIT", size: "48L" },
            { category: "HAT", size: "7 5/8" },
          ],
        },
        socialHandles: {
          create: [
            {
              platform: "INSTAGRAM",
              handle: "@malikbridges",
              url: "https://instagram.com/malikbridges",
              followers: 842000,
            },
            {
              platform: "TWITTER_X",
              handle: "@malikbridges",
              url: "https://x.com/malikbridges",
              followers: 315000,
            },
          ],
        },
        contracts: {
          create: [
            {
              type: "LEAGUE",
              title: "4-Year Veteran Contract",
              counterparty: "Portland Trail Blazers",
              category: "Veteran Extension",
              status: "ACTIVE",
              value: 68000000,
              currency: "USD",
              signedDate: new Date("2024-07-01"),
              startDate: new Date("2024-10-01"),
              endDate: new Date("2028-06-30"),
              terms: "4-year, $68M veteran extension with a 15% trade kicker.",
            },
            {
              type: "MARKETING",
              title: "Regional Footwear Endorsement",
              counterparty: "Pacific Trail Athletics",
              category: "Shoe Deal",
              status: "ACTIVE",
              value: 1200000,
              currency: "USD",
              signedDate: new Date("2025-02-15"),
              startDate: new Date("2025-03-01"),
              endDate: new Date("2027-02-28"),
              terms: "Annual footwear + apparel endorsement with performance bonuses.",
            },
          ],
        },
        leads: {
          create: [
            {
              companyName: "Northwest Coffee Roasters",
              contactName: "Jamie Chen",
              contactEmail: "jamie@nwcoffee.example",
              industry: "Food & Beverage",
              stage: "CONTACTED",
              estimatedValue: 75000,
              source: "Inbound",
              notes: "Interested in a local ambassador campaign.",
            },
            {
              companyName: "Summit Financial Group",
              contactName: "Pat O'Malley",
              contactEmail: "pomalley@summitfg.example",
              industry: "Finance",
              stage: "NEW",
              estimatedValue: 150000,
              source: "Referral",
            },
          ],
        },
        keywords: {
          create: [{ keyword: "\"Bridges\" jersey", category: "CLIENT_MENTION" }],
        },
      },
    });
    console.log(`✓ Demo client created: ${client.firstName} ${client.lastName}`);
  }

  const brandWatchCount = await prisma.monitoredKeyword.count({
    where: { category: { in: ["BRAND_WATCH", "INDUSTRY"] } },
  });
  if (brandWatchCount === 0) {
    await prisma.monitoredKeyword.create({
      data: { keyword: "athleisure brand NBA sponsorship", category: "INDUSTRY" },
    });
    console.log("✓ Seeded a starter brand-watch keyword.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
