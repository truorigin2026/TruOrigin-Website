-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "brandNumber" INTEGER,
ADD COLUMN     "productSequence" INTEGER NOT NULL DEFAULT 0;

-- Backfill: assign every existing brand a permanent brandNumber, in
-- createdAt order, starting at 1001. One-time and idempotent (the WHERE
-- clause means re-running this finds nothing left to update). Must run
-- before the unique index below, since brandNumber starts out NULL for
-- every existing row.
UPDATE "Brand" b
SET "brandNumber" = sub.rn + 1000
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
  FROM "Brand"
  WHERE "brandNumber" IS NULL
) sub
WHERE b.id = sub.id;

-- CreateIndex
CREATE UNIQUE INDEX "Brand_brandNumber_key" ON "Brand"("brandNumber");
