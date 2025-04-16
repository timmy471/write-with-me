export function cn(
  ...classes: (string | undefined | { [key: string]: boolean })[]
): string {
  return classes
    .filter(Boolean)
    .map((c) =>
      typeof c === "object"
        ? Object.entries(c)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(" ")
        : c
    )
    .join(" ")
    .trim();
}
