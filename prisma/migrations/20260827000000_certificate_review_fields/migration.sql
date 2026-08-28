-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
