import type { LucideIcon } from "lucide-react";

type ContactMethodProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
};

export function ContactMethod({ icon: Icon, label, value, href }: ContactMethodProps) {
  return (
    <div className="contact-method">
      <span className="contact-method-icon">
        <Icon size={16} strokeWidth={2} />
      </span>
      <div>
        <p className="contact-method-label">{label}</p>
        {href ? (
          <a href={href} className="contact-method-value">
            {value}
          </a>
        ) : (
          <p className="contact-method-value">{value}</p>
        )}
      </div>
    </div>
  );
}
