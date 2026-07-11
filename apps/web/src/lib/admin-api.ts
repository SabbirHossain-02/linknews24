// Base URL of the LinkNews24 API. Overridable at build time via
// NEXT_PUBLIC_API_URL; falls back to the current VPS API.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://144.79.249.242:4100";

export async function apiFetch<T = unknown>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.error) || `Error ${res.status}`);
  }
  return data as T;
}

export async function uploadFile(file: File): Promise<string> {
  return uploadTo("/api/admin/media/upload", file);
}

export async function uploadPdf(file: File): Promise<string> {
  return uploadTo("/api/admin/epaper/upload", file);
}

async function uploadTo(path: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.error) || "আপলোড ব্যর্থ");
  return (data as { url: string }).url;
}
