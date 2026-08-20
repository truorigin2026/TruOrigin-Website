import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { slugify } from "@/lib/auth";

type CmsType = "INDUSTRY" | "RESOURCE" | "FAQ" | "BLOG_POST" | "CONTENT_BLOCK";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        type?: CmsType;
        slug?: string;
        title?: string;
        subtitle?: string;
        excerpt?: string;
        body?: string;
        category?: string;
      }
    | null;

  if (!body?.type || !body?.title?.trim()) {
    return NextResponse.json({ error: "Type and title are required" }, { status: 400 });
  }

  const slug = body.slug?.trim() ? slugify(body.slug) : slugify(body.title);

  const content = await prisma.cmsContent.create({
    data: {
      type: body.type,
      slug,
      title: body.title.trim(),
      subtitle: body.subtitle,
      excerpt: body.excerpt,
      body: body.body,
      category: body.category,
      authorId: session.sub,
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.CMS_CREATE,
    targetType: "CmsContent",
    targetId: content.id,
    targetLabel: content.title,
    request,
  });

  return NextResponse.json({ ok: true, content });
}
