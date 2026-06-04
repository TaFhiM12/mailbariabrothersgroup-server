-- Remove duplicate saving rows before enforcing one saving per member per month.
-- Priority keeps approved rows first, then pending, then the newest rejected row.
WITH ranked_savings AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "month"
      ORDER BY
        CASE "status"
          WHEN 'APPROVED' THEN 1
          WHEN 'PENDING' THEN 2
          ELSE 3
        END,
        "createdAt" DESC
    ) AS row_number
  FROM "savings"
)
DELETE FROM "savings"
WHERE "id" IN (
  SELECT "id"
  FROM ranked_savings
  WHERE row_number > 1
);

-- Remove duplicate reminders before enforcing one reminder per member per month.
WITH ranked_reminders AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "month"
      ORDER BY
        CASE "status"
          WHEN 'SENT' THEN 1
          WHEN 'PENDING' THEN 2
          ELSE 3
        END,
        "createdAt" DESC
    ) AS row_number
  FROM "payment_reminders"
)
DELETE FROM "payment_reminders"
WHERE "id" IN (
  SELECT "id"
  FROM ranked_reminders
  WHERE row_number > 1
);

-- Remove duplicate ledger entries for the same source record before enforcing idempotency.
WITH ranked_ledger AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "type", "referenceId"
      ORDER BY "createdAt" DESC
    ) AS row_number
  FROM "ledger"
  WHERE "referenceId" IS NOT NULL
)
DELETE FROM "ledger"
WHERE "id" IN (
  SELECT "id"
  FROM ranked_ledger
  WHERE row_number > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "savings_userId_month_key" ON "savings"("userId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payment_reminders_userId_month_key" ON "payment_reminders"("userId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_type_referenceId_key" ON "ledger"("type", "referenceId");
