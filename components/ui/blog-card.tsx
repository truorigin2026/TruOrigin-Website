import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion";
import type { BlogPost } from "@/lib/data/blog-data";

type BlogCardProps = {
  post: BlogPost;
  delay?: number;
};

export function BlogCard({ post, delay = 0 }: BlogCardProps) {
  return (
    <FadeIn delay={delay}>
      <Link href={`/for-brands/resources/blog/${post.slug}`} className="blog-tile">
        <div className="blog-tile-image">
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1023px) 50vw, 33vw"
          />
        </div>
        <div className="blog-tile-body">
          <p className="blog-tile-meta">
            <span>{post.category}</span>
            <span>{post.readTime}</span>
          </p>
          <h3 className="blog-tile-title">{post.title}</h3>
          <p className="blog-tile-excerpt">{post.excerpt}</p>
          <p className="blog-tile-date">{post.date}</p>
        </div>
      </Link>
    </FadeIn>
  );
}
