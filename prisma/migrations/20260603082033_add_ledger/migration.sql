-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('SAVING', 'EXPENSE', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "ledger" (
    "id" TEXT NOT NULL,
    "type" "LedgerType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ledger_type_idx" ON "ledger"("type");
