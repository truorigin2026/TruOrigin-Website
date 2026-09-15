import Image from "next/image";
import Link from "next/link";
import { socialLinks } from "@/lib/data/frontend-data";

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={`contact-social-row${className ? ` ${className}` : ""}`}>
      {socialLinks.map((item) => (
        <Link key={item.label} href={item.href} aria-label={item.label} className="contact-social-icon">
          <Image src={item.icon} alt="" width={16} height={16} />
        </Link>
      ))}
    </div>
  );
}
