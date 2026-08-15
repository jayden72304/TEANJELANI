-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "team" TEXT,
    "league" TEXT,
    "position" TEXT,
    "jerseyNumber" TEXT,
    "birthday" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "photoUrl" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ClientPhone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'MOBILE',
    "number" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "ClientPhone_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'PERSONAL',
    "email" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "ClientEmail_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    CONSTRAINT "FamilyContact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClothingSize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "ClothingSize_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialHandle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "url" TEXT,
    "followers" INTEGER,
    "notes" TEXT,
    CONSTRAINT "SocialHandle_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "counterparty" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "value" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "signedDate" DATETIME,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "terms" TEXT,
    "documentUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "industry" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "estimatedValue" REAL,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonitoredKeyword" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'CLIENT_MENTION',
    "clientId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MonitoredKeyword_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebMention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scope" TEXT NOT NULL,
    "clientId" TEXT,
    "brandName" TEXT,
    "signalType" TEXT,
    "title" TEXT NOT NULL,
    "snippet" TEXT,
    "url" TEXT NOT NULL,
    "sourceName" TEXT,
    "publishedAt" DATETIME,
    "matchedKeywordId" TEXT,
    "sentiment" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "discoveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebMention_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WebMention_matchedKeywordId_fkey" FOREIGN KEY ("matchedKeywordId") REFERENCES "MonitoredKeyword" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");

-- CreateIndex
CREATE INDEX "ClientPhone_clientId_idx" ON "ClientPhone"("clientId");

-- CreateIndex
CREATE INDEX "ClientEmail_clientId_idx" ON "ClientEmail"("clientId");

-- CreateIndex
CREATE INDEX "FamilyContact_clientId_idx" ON "FamilyContact"("clientId");

-- CreateIndex
CREATE INDEX "ClothingSize_clientId_idx" ON "ClothingSize"("clientId");

-- CreateIndex
CREATE INDEX "SocialHandle_clientId_idx" ON "SocialHandle"("clientId");

-- CreateIndex
CREATE INDEX "Contract_clientId_idx" ON "Contract"("clientId");

-- CreateIndex
CREATE INDEX "Contract_type_idx" ON "Contract"("type");

-- CreateIndex
CREATE INDEX "Lead_clientId_idx" ON "Lead"("clientId");

-- CreateIndex
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");

-- CreateIndex
CREATE INDEX "MonitoredKeyword_clientId_idx" ON "MonitoredKeyword"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "WebMention_url_key" ON "WebMention"("url");

-- CreateIndex
CREATE INDEX "WebMention_clientId_idx" ON "WebMention"("clientId");

-- CreateIndex
CREATE INDEX "WebMention_scope_idx" ON "WebMention"("scope");
