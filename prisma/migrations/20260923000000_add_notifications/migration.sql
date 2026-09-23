-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PRODUCT_REJECTED', 'PRODUCT_APPROVED', 'ADMIN_MESSAGE');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "detail" TEXT,
    "href" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_brandId_createdAt_idx" ON "Notification"("brandId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_brandId_read_idx" ON "Notification"("brandId", "read");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

