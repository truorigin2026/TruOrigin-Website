"use client";

import Link from "next/link";

type ButtonHoverUnderlineProps = {
  href: string;
  children: string;
  className?: string;
};

export function ButtonHoverUnderline({ href, children, className = "" }: ButtonHoverUnderlineProps) {
  return (
    <Link href={href} className={`btn-hover-underline ${className}`.trim()}>
      {children}
    </Link>
  );
}
