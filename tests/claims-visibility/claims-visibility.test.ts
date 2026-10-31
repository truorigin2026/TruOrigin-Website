// Regression coverage for the Phase D.2 fix: an approved PRODUCT does not
// mean every CLAIM on it has itself been reviewed. Runs against a real,
// disposable Postgres (see run.mts) seeded with one claim of each
// ClaimStatus on the same product, so "is X claim publicly visible" can
// be answered precisely rather than relying on whatever happens to exist
// in the shared dev database right now.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma";
import { getProductBySlug, getProductBySerial } from "../../lib/data/repository";

// Unique per run so a false "not present" could never be explained by a
// previous run's leftover row instead of the fix actually working.
const LABEL = {
  verified: `ZZZ-TEST-VERIFIED-${randomUUID()}`,
  unverified: `ZZZ-TEST-UNVERIFIED-${randomUUID()}`,
  rejected: `ZZZ-TEST-REJECTED-${randomUUID()}`,
  partial: `ZZZ-TEST-PARTIAL-${randomUUID()}`,
};

const slug = `zzz-test-claims-visibility-${randomUUID()}`;
const serialNumber = `ZZZTEST${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;

let productId: string;
let brandId: string;
let categoryId: string;

before(async () => {
  const category = await prisma.category.create({
    data: { name: `ZZZ Test Category ${randomUUID()}` },
  });
  categoryId = category.id;

  const brand = await prisma.brand.create({
    data: { slug: `zzz-test-brand-${randomUUID()}`, name: "ZZZ Test Brand", status: "ACTIVE" },
  });
  brandId = brand.id;

  const product = await prisma.product.create({
    data: {
      slug,
      name: "ZZZ Test Product",
      brandId,
      categoryId,
      status: "APPROVED",
      hidden: false,
      archived: false,
      serialNumber,
      claims: {
        create: [
          { label: LABEL.verified, status: "VERIFIED" },
          { label: LABEL.unverified, status: "UNVERIFIED" },
          { label: LABEL.rejected, status: "REJECTED", reviewNote: "Evidence did not support this claim." },
          { label: LABEL.partial, status: "PARTIALLY_VERIFIED" },
        ],
      },
    },
  });
  productId = product.id;
});

after(async () => {
  // Disposable database -- cleanup isn't required for correctness, but a
  // local interactive run reuses the same persistent data dir across
  // invocations (see run.mts), so leaving this out would pile up rows.
  // Claim.productId has no cascade (confirmed directly: deleting the
  // product first fails with a RESTRICT foreign-key violation), so
  // claims must go first.
  await prisma.claim.deleteMany({ where: { productId } }).catch(() => {});
  await prisma.product.delete({ where: { id: productId } }).catch(() => {});
  await prisma.brand.delete({ where: { id: brandId } }).catch(() => {});
  await prisma.category.delete({ where: { id: categoryId } }).catch(() => {});
  await prisma.$disconnect();
});

describe("public claim visibility — getProductBySlug (what the public product page renders)", () => {
  test("only the VERIFIED claim is present; UNVERIFIED/REJECTED/PARTIALLY_VERIFIED are absent from every field", async () => {
    const result = await getProductBySlug(slug);
    assert.ok(result, "expected the seeded product to resolve by slug");

    const labels = result.claims.map((c) => c.text);
    assert.ok(labels.includes(LABEL.verified), "the VERIFIED claim must be publicly visible");
    assert.ok(!labels.includes(LABEL.unverified), "an UNVERIFIED claim must not be publicly visible");
    assert.ok(!labels.includes(LABEL.rejected), "a REJECTED claim must not be publicly visible");
    assert.ok(
      !labels.includes(LABEL.partial),
      "PARTIALLY_VERIFIED has no distinct public UI treatment today, so it must stay private",
    );

    // Not just the `text` field -- the whole serialized result, so a leak
    // through evidence, requiredEvidence, or any other field is still caught.
    const serialized = JSON.stringify(result);
    assert.ok(!serialized.includes(LABEL.unverified), "UNVERIFIED claim text must not leak through any field");
    assert.ok(!serialized.includes(LABEL.rejected), "REJECTED claim text must not leak through any field");
    assert.ok(!serialized.includes(LABEL.partial), "PARTIALLY_VERIFIED claim text must not leak through any field");
  });
});

describe("public claim visibility — getProductBySerial (the data /api/verify returns verbatim)", () => {
  test("returns the identical claim set as the slug-based lookup", async () => {
    const bySlug = await getProductBySlug(slug);
    const bySerial = await getProductBySerial(serialNumber);
    assert.ok(bySerial, "expected the seeded product to resolve by serial number");

    const slugLabels = bySlug!.claims.map((c) => c.text).sort();
    const serialLabels = bySerial.claims.map((c) => c.text).sort();
    assert.deepEqual(serialLabels, slugLabels, "slug-based and serial-based lookups must agree on the claim set");
    assert.deepEqual(serialLabels, [LABEL.verified], "only the VERIFIED claim should be present");

    const serialized = JSON.stringify(bySerial);
    assert.ok(!serialized.includes(LABEL.unverified), "/api/verify's data must not leak the UNVERIFIED claim");
    assert.ok(!serialized.includes(LABEL.rejected), "/api/verify's data must not leak the REJECTED claim");
    assert.ok(!serialized.includes(LABEL.partial), "/api/verify's data must not leak the PARTIALLY_VERIFIED claim");
  });
});

describe("admin and brand-management claim visibility is unaffected", () => {
  test("a direct, unfiltered claims query -- the shape the admin review page/route and the brand claims page use -- still returns every status", async () => {
    const claims = await prisma.claim.findMany({ where: { productId } });
    const statuses = claims.map((c) => c.status).sort();
    assert.deepEqual(
      statuses,
      ["PARTIALLY_VERIFIED", "REJECTED", "UNVERIFIED", "VERIFIED"],
      "admin's and the brand's own unfiltered query path must still see all four statuses",
    );

    const rejected = claims.find((c) => c.status === "REJECTED");
    assert.equal(rejected?.reviewNote, "Evidence did not support this claim.", "admin review notes must still be readable on this path");
  });
});

describe("existing approved-product behavior is unchanged", () => {
  test("a product whose claims are ALL already verified keeps showing every one of them", async () => {
    const allVerifiedSlug = `zzz-test-all-verified-${randomUUID()}`;
    const allVerifiedSerial = `ZZZTEST${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
    const product = await prisma.product.create({
      data: {
        slug: allVerifiedSlug,
        name: "ZZZ All Verified Product",
        brandId,
        categoryId,
        status: "APPROVED",
        hidden: false,
        archived: false,
        serialNumber: allVerifiedSerial,
        claims: {
          create: [
            { label: "ZZZ Claim A", status: "VERIFIED" },
            { label: "ZZZ Claim B", status: "VERIFIED" },
          ],
        },
      },
    });

    try {
      const result = await getProductBySlug(allVerifiedSlug);
      assert.equal(result?.claims.length, 2, "a product with only verified claims must keep showing all of them");
    } finally {
      await prisma.claim.deleteMany({ where: { productId: product.id } }).catch(() => {});
      await prisma.product.delete({ where: { id: product.id } }).catch(() => {});
    }
  });
});
