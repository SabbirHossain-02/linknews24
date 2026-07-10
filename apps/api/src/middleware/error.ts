import type { Request, Response, NextFunction } from "express";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);
  const status =
    typeof err === "object" && err && "status" in err
      ? Number((err as { status: number }).status)
      : 500;
  const message =
    typeof err === "object" && err && "message" in err
      ? String((err as { message: string }).message)
      : "Server error";
  res.status(status || 500).json({ error: message });
}
