export const MIN_AGE_DEFAULT = 18;

export function isAgeEligible(
  birthDateIso: string,
  minAge = MIN_AGE_DEFAULT,
  now = new Date(),
): boolean {
  const birth = new Date(birthDateIso);
  if (Number.isNaN(birth.getTime())) return false;
  const age =
    now.getFullYear() -
    birth.getFullYear() -
    (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
      ? 1
      : 0);
  return age >= minAge;
}
