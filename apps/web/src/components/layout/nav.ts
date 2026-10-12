export type NavItem = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

export const primaryNav: NavItem[] = [
  { href: "/discover", label: "Tìm nhau", match: "prefix" },
  { href: "/likes", label: "Kết nối", match: "prefix" },
  { href: "/chat", label: "Trò chuyện", match: "prefix" },
  { href: "/couple", label: "Chúng mình", match: "prefix" },
  { href: "/lifestyle", label: "Lifestyle", match: "prefix" },
  { href: "/services", label: "Đồng hành", match: "prefix" },
  { href: "/me", label: "Cá nhân", match: "prefix" },
];

export const mobileNav: NavItem[] = [
  { href: "/discover", label: "Tìm nhau", match: "prefix" },
  { href: "/chat", label: "Chat", match: "prefix" },
  { href: "/lifestyle", label: "Lifestyle", match: "prefix" },
  { href: "/couple", label: "Đôi", match: "prefix" },
  { href: "/me", label: "Cá nhân", match: "prefix" },
];

export function isNavActive(pathname: string, item: NavItem) {
  if (item.match === "exact") return pathname === item.href;
  if (item.href === "/me") {
    return pathname === "/me" || pathname.startsWith("/me/");
  }
  if (item.href === "/couple") {
    return pathname === "/couple" || pathname.startsWith("/couple/");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export const titles: Record<string, string> = {
  "/discover": "Tìm nhau",
  "/likes": "Kết nối",
  "/chat": "Trò chuyện",
  "/couple": "Chúng mình",
  "/couple/map": "Bản đồ kỷ niệm",
  "/couple/memories": "Dòng thời gian",
  "/couple/add": "Thêm kỷ niệm",
  "/couple/promises": "Hẹn ước",
  "/couple/us": "Hai đứa",
  "/couple/invite": "Lời mời cặp đôi",
  "/services": "Đồng hành",
  "/bookings": "Lịch hẹn",
  "/lifestyle": "Lifestyle DEMO",
  "/ai": "AI Hub",
  "/me": "Bảng cá nhân",
  "/me/edit": "Chỉnh sửa hồ sơ",
  "/me/deep": "Hồ sơ chuyên sâu",
  "/me/privacy": "Quyền riêng tư",
  "/me/account": "Tài khoản & thiết bị",
  "/me/history": "Lịch sử kết nối",
  "/onboarding": "Nhập môn",
};

export function pageTitle(pathname: string) {
  if (titles[pathname]) return titles[pathname];
  const hit = Object.keys(titles)
    .filter((k) => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return hit ? titles[hit] : "DeepMatch";
}
