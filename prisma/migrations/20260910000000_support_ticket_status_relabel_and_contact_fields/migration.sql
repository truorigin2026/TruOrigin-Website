-- AlterEnum: relabel SupportTicketStatus (OPEN->NEW, RESOLVED->REPLIED, add READ)
-- Data-preserving remap (not a plain cast) since live SupportTicket rows exist.
BEGIN;
CREATE TYPE "SupportTicketStatus_new" AS ENUM ('NEW', 'READ', 'IN_PROGRESS', 'REPLIED', 'CLOSED');
ALTER TABLE "public"."SupportTicket" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SupportTicket" ALTER COLUMN "status" TYPE "SupportTicketStatus_new" USING (
  CASE "status"::text
    WHEN 'OPEN' THEN 'NEW'
    WHEN 'IN_PROGRESS' THEN 'IN_PROGRESS'
    WHEN 'RESOLVED' THEN 'REPLIED'
    WHEN 'CLOSED' THEN 'CLOSED'
    ELSE 'NEW'
  END::"SupportTicketStatus_new"
);
ALTER TYPE "SupportTicketStatus" RENAME TO "SupportTicketStatus_old";
ALTER TYPE "SupportTicketStatus_new" RENAME TO "SupportTicketStatus";
DROP TYPE "public"."SupportTicketStatus_old";
ALTER TABLE "SupportTicket" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN "phone" TEXT,
ADD COLUMN "repliedAt" TIMESTAMP(3);
