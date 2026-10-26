/** Public receiving account for manual bank transfer. */
export const PREMIUM_PRICE_VND = Number(
  process.env.NEXT_PUBLIC_PREMIUM_PRICE_VND ?? "99000",
);

export function bankTransferInfo() {
  return {
    bankName:
      process.env.NEXT_PUBLIC_BILLING_BANK_NAME ?? "HD Bank",
    accountNumber:
      process.env.NEXT_PUBLIC_BILLING_BANK_ACCOUNT ?? "0964859937",
    accountHolder:
      process.env.NEXT_PUBLIC_BILLING_BANK_HOLDER ?? "NGUYEN THI TUYET NHUNG",
    priceVnd: PREMIUM_PRICE_VND,
  };
}

export function formatVnd(amount: number) {
  return `${amount.toLocaleString("vi-VN")}₫`;
}
