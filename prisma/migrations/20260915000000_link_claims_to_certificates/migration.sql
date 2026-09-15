-- AlterTable: new Certificate fields for the claim/document detail views
ALTER TABLE "Certificate" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "testDate" TIMESTAMP(3),
ADD COLUMN     "testScope" TEXT,
ADD COLUMN     "testType" TEXT;

-- CreateTable: implicit many-to-many between Claim and Certificate
CREATE TABLE "_CertificateToClaim" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CertificateToClaim_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CertificateToClaim_B_index" ON "_CertificateToClaim"("B");

-- AddForeignKey
ALTER TABLE "_CertificateToClaim" ADD CONSTRAINT "_CertificateToClaim_A_fkey" FOREIGN KEY ("A") REFERENCES "Certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CertificateToClaim" ADD CONSTRAINT "_CertificateToClaim_B_fkey" FOREIGN KEY ("B") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
