export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // JSON.stringify doesn't escape angle brackets, so a field like a
  // brand-submitted product name containing a literal script-close
  // sequence would end this tag early and let the rest run as HTML.
  // Replacing every "<" with its unicode-escaped form keeps the JSON
  // valid while making that breakout impossible.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
