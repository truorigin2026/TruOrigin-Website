import { notFound, permanentRedirect } from "next/navigation";
import { getProductBySerial, getProductBySlug } from "@/lib/data/repository";

export default async function ProductCodeRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const product = (await getProductBySerial(code)) ?? (await getProductBySlug(code));

  if (!product) {
    notFound();
  }

  permanentRedirect(`/p/${product.slug}`);
}
