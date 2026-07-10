export const CAN_WRITE = ["REPORTER", "EDITOR", "ADMIN", "SUPER_ADMIN"];
export const CAN_PUBLISH = ["EDITOR", "ADMIN", "SUPER_ADMIN"];
export const CAN_MANAGE = ["ADMIN", "SUPER_ADMIN"];

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ঀ-৿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "post";
}
