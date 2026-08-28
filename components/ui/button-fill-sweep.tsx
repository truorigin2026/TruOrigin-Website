"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ButtonFillSweepProps = {
  href: string;
  children: string;
  className?: string;
};

export function ButtonFillSweep({ href, children, className = "" }: ButtonFillSweepProps) {
  return (
    <Link href={href} className={`btn-fill-sweep ${className}`.trim()}>
      <span className="btn-fill-sweep-fill" aria-hidden="true" />
      <span className="btn-fill-sweep-label btn-fill-sweep-label-dark">
        {children}
        <ArrowRight size={16} aria-hidden="true" />
      </span>
      <span className="btn-fill-sweep-label btn-fill-sweep-label-light" aria-hidden="true">
        {children}
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}
