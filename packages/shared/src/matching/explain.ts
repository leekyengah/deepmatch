export function buildReasons(input: {
  sharedInterests: string[];
  sharedValues: string[];
  sharedGoals: string[];
  sameRegion: boolean;
}): string[] {
  const reasons: string[] = [];
  if (input.sharedGoals.length) {
    reasons.push(`Cùng mục tiêu: ${input.sharedGoals.slice(0, 3).join(", ")}`);
  }
  if (input.sharedValues.length) {
    reasons.push(`Chia sẻ giá trị: ${input.sharedValues.slice(0, 3).join(", ")}`);
  }
  if (input.sharedInterests.length) {
    reasons.push(
      `Sở thích chung: ${input.sharedInterests.slice(0, 3).join(", ")}`,
    );
  }
  if (input.sameRegion) {
    reasons.push("Cùng khu vực (ước lượng)");
  }
  if (reasons.length === 0) {
    reasons.push("Phù hợp bộ lọc cơ bản của bạn");
  }
  // Never imply scientific love probability
  return reasons.filter((r) => !/%|xác suất yêu|EQ/i.test(r));
}
