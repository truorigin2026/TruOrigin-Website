import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Package,
  ClipboardCheck,
  IdCard,
  QrCode,
  FileText,
  BarChart3,
  CreditCard,
  Layers,
  Users,
  LifeBuoy,
  FileEdit,
  Settings,
  History,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";

export type NavLink = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { group: string; links: NavLink[] };

export const adminNavGroups: NavGroup[] = [
  { group: "Overview", links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "Brands", links: [{ href: "/admin/brands", label: "Brand Management", icon: Building2 }] },
  {
    group: "Products",
    links: [
      { href: "/admin/products", label: "All Products", icon: Package },
      { href: "/admin/review", label: "Review Queue", icon: ClipboardCheck },
      { href: "/admin/origincards", label: "OriginCards", icon: IdCard },
    ],
  },
  {
    group: "QR & Documents",
    links: [
      { href: "/admin/qr", label: "QR Management", icon: QrCode },
      { href: "/admin/documents", label: "Documents", icon: FileText },
    ],
  },
  { group: "Analytics", links: [{ href: "/admin/analytics", label: "Analytics", icon: BarChart3 }] },
  {
    group: "Billing",
    links: [
      { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/admin/subscriptions/plans", label: "Plans", icon: Layers },
    ],
  },
  { group: "Users", links: [{ href: "/admin/users", label: "Users", icon: Users }] },
  { group: "Support", links: [{ href: "/admin/support", label: "Support", icon: LifeBuoy }] },
  { group: "CMS", links: [{ href: "/admin/cms", label: "CMS", icon: FileEdit }] },
  {
    group: "Settings",
    links: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/audit-log", label: "Audit Log", icon: History },
    ],
  },
];

export const brandNavLinks: NavLink[] = [
  { href: "/brand/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/brand/products", label: "Products", icon: Package },
  { href: "/brand/products/new", label: "Add Product", icon: PlusCircle },
  { href: "/brand/claims", label: "Claims", icon: ShieldCheck },
  { href: "/brand/documents", label: "Documents", icon: FileText },
  { href: "/brand/origincards", label: "OriginCards", icon: IdCard },
  { href: "/brand/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/brand/team", label: "Team", icon: Users },
  { href: "/brand/settings", label: "Settings", icon: Settings },
];
