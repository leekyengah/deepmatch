export type NavItem = {
  href: string;
  label: string;
};

export const adminNav: NavItem[] = [
  { href: "/", label: "Tổng quan" },
  { href: "/users", label: "Người dùng" },
  { href: "/moderation", label: "Kiểm duyệt" },
  { href: "/matching", label: "Ghép đôi" },
  { href: "/safety", label: "An toàn chat" },
  { href: "/services", label: "Dịch vụ" },
  { href: "/billing", label: "Thanh toán CK" },
  { href: "/catalog", label: "Catalog DEMO" },
  { href: "/cms", label: "Nội dung" },
  { href: "/analytics", label: "KPI" },
  { href: "/flags", label: "Cấu hình" },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const adminTitles: Record<string, string> = {
  "/": "Bảng điều hành",
  "/users": "Người dùng",
  "/moderation": "Kiểm duyệt",
  "/matching": "Vận hành ghép đôi",
  "/safety": "An toàn trò chuyện",
  "/services": "Dịch vụ & chuyên viên",
  "/billing": "Thanh toán chuyển khoản",
  "/catalog": "Catalog DEMO",
  "/cms": "Quản lý nội dung",
  "/analytics": "Báo cáo KPI",
  "/flags": "Cờ tính năng",
};

export function adminPageTitle(pathname: string) {
  return adminTitles[pathname] ?? "DeepMatch Admin";
}
