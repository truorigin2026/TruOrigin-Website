import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogArticleBody } from "@/components/brands/blog-article-body";
import { RelatedBlogPosts } from "@/components/brands/related-blog-posts";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getBlogPostBySlug, getBlogPosts, getRelatedBlogPosts } from "@/lib/data/blog-data";

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: `/for-brands/resources/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.metaDescription,
      url: absoluteUrl(`/for-brands/resources/blog/${post.slug}`),
      images: [{ url: post.image }],
      publishedTime: post.isoDate,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(slug, 4);

  return (
    <div className="saas-page blog-post-page">
      <JsonLd
        data={blogPostingJsonLd({
          title: post.title,
          slug: post.slug,
          description: post.metaDescription,
          image: post.image,
          datePublished: post.isoDate,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Blog", path: "/for-brands/resources/blog" },
          { name: post.title, path: `/for-brands/resources/blog/${post.slug}` },
        ])}
      />

      <article>
        <header className="blog-post-header">
          <div className="container-shell blog-post-header-inner">
            <p className="blog-post-eyebrow">{post.category}</p>
            <h1 className="blog-post-title">{post.title}</h1>
            <p className="blog-post-excerpt">{post.excerpt}</p>
            <div className="blog-post-meta-row">
              <span>{post.date}</span>
              <span aria-hidden="true">&middot;</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </header>

        <div className="container-shell blog-post-cover-wrap">
          <div className="blog-post-cover">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1023px) 100vw, 900px"
            />
          </div>
        </div>

        <div className="container-shell">
          <div className="blog-post-content-wrap">
            <BlogArticleBody content={post.content} />
          </div>
        </div>
      </article>

      <div className="container-shell">
        <RelatedBlogPosts posts={relatedPosts} />
      </div>
    </div>
  );
}
