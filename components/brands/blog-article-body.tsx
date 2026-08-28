import Link from "next/link";
import type { BlogContentBlock, BlogSegment } from "@/lib/data/blog-data";

function renderSegments(segments: BlogSegment[]) {
  return segments.map((segment, index) => {
    if (typeof segment === "string") {
      return <span key={index}>{segment}</span>;
    }

    if (segment.external) {
      return (
        <a key={index} href={segment.href} target="_blank" rel="noopener noreferrer" className="blog-article-link">
          {segment.text}
        </a>
      );
    }

    return (
      <Link key={index} href={segment.href} className="blog-article-link">
        {segment.text}
      </Link>
    );
  });
}

export function BlogArticleBody({ content }: { content: BlogContentBlock[] }) {
  return (
    <div className="blog-article-body">
      {content.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2 key={index} className="blog-article-heading">
              {block.text}
            </h2>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index} className="blog-article-list">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderSegments(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "cta") {
          return (
            <div key={index} className="blog-article-cta">
              <p>{block.text}</p>
              <Link href={block.href} className="btn-primary">
                {block.linkText} &rarr;
              </Link>
            </div>
          );
        }

        return (
          <p key={index} className="blog-article-paragraph">
            {renderSegments(block.segments)}
          </p>
        );
      })}
    </div>
  );
}
