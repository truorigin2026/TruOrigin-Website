type ContactMethodProps = {
  label: string;
  value: string;
  href?: string;
};

export function ContactMethod({ label, value, href }: ContactMethodProps) {
  return (
    <div className="contact-method">
      <p className="contact-method-label">{label}:</p>
      {href ? (
        <a href={href} className="contact-method-value">
          {value}
        </a>
      ) : (
        <p className="contact-method-value">{value}</p>
      )}
    </div>
  );
}
