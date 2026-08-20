-- CreateEnum
CREATE TYPE "BrandRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');

-- AlterTable
ALTER TABLE "OriginCard" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "brandRole" "BrandRole";
