import Link from "next/link";
import { ReactNode } from "react";

type PillButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "outline" | "white" | "dark";
  className?: string;
  icon?: ReactNode;
};

const variantClasses = {
  primary: "saas-btn-primary",
  outline: "saas-btn-outline",
  white: "saas-btn-white",
  dark: "saas-btn-dark",
};

export function PillButton({
  href,
  onClick,
  children,
  variant = "primary",
  className = "",
  icon,
}: PillButtonProps) {
  const classes = `${variantClasses[variant]} ${className}`;

  const content = (
    <>
      <span>{children}</span>
      {icon ? <span className="saas-btn-icon">{icon}</span> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

export function ArrowIcon({ inverted = false }: { inverted?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 7h8M8 4l3 3-3 3"
        stroke={inverted ? "#fff" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
