/** Client-side DEMO cart — sandbox only, never claims real checkout. */

export type DemoCartLine = {
  productId: string;
  mockId: string;
  title: string;
  category: string;
  priceVnd: number;
  qty: number;
};

const KEY = "dm_demo_cart_v1";

export function readDemoCart(): DemoCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DemoCartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeDemoCart(lines: DemoCartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
}

export function addDemoCartLine(line: Omit<DemoCartLine, "qty">, qty = 1) {
  const cart = readDemoCart();
  const idx = cart.findIndex((l) => l.productId === line.productId);
  if (idx >= 0) {
    cart[idx] = { ...cart[idx], qty: cart[idx].qty + qty };
  } else {
    cart.push({ ...line, qty });
  }
  writeDemoCart(cart);
  return cart;
}

export function removeDemoCartLine(productId: string) {
  const next = readDemoCart().filter((l) => l.productId !== productId);
  writeDemoCart(next);
  return next;
}

export function clearDemoCart() {
  writeDemoCart([]);
}

export function cartTotalVnd(lines: DemoCartLine[]) {
  return lines.reduce((sum, l) => sum + l.priceVnd * l.qty, 0);
}
