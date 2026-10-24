-- CreateEnum
CREATE TYPE "NotificationAudience" AS ENUM ('BRAND', 'ADMIN');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('BRAND', 'ADMIN');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NEW_MESSAGE';

-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "reviewNote" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "audience" "NotificationAudience" NOT NULL DEFAULT 'BRAND',
ALTER COLUMN "brandId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderType" "MessageSenderType" NOT NULL,
    "senderUserId" TEXT,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_brandId_key" ON "Conversation"("brandId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_senderType_readAt_idx" ON "Message"("conversationId", "senderType", "readAt");

-- CreateIndex
CREATE INDEX "Notification_audience_createdAt_idx" ON "Notification"("audience", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_audience_read_idx" ON "Notification"("audience", "read");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
