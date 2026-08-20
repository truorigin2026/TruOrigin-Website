import { prisma } from "./lib/prisma";
async function main() {
  const brand = await prisma.brand.create({
    data: {
      name: "QA Card Logo Brand",
      slug: "qa-card-logo-brand-" + Date.now(),
      status: "ACTIVE",
      logoUrl: "https://tc9yjm3tnytutuew.public.blob.vercel-storage.com/brands/qa-blob-test/logo-test.png",
    },
  });
  const category = await prisma.category.upsert({
    where: { name: "QA Verify Category" },
    update: {},
    create: { name: "QA Verify Category" },
  });
  const withLogo = await prisma.product.create({
    data: {
      slug: "qa-card-with-logo-" + Date.now(),
      name: "QA Card With Logo",
      brand: { connect: { id: brand.id } },
      category: { connect: { id: category.id } },
      status: "APPROVED",
      serialNumber: "TO-QA-LOGO-" + Date.now(),
    },
  });

  const brandNoLogo = await prisma.brand.create({
    data: {
      name: "QA Card No Logo Brand",
      slug: "qa-card-no-logo-brand-" + Date.now(),
      status: "ACTIVE",
    },
  });
  const withoutLogo = await prisma.product.create({
    data: {
      slug: "qa-card-without-logo-" + Date.now(),
      name: "QA Card Without Logo",
      brand: { connect: { id: brandNoLogo.id } },
      category: { connect: { id: category.id } },
      status: "APPROVED",
      serialNumber: "TO-QA-NOLOGO-" + Date.now(),
    },
  });

  console.log(JSON.stringify({ brandId: brand.id, brandNoLogoId: brandNoLogo.id, withLogoSlug: withLogo.slug, withoutLogoSlug: withoutLogo.slug, categoryId: category.id }));
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
