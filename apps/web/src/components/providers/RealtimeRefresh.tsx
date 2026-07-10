"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";

// Listens for content changes from the API and soft-refreshes the current
// page (re-runs server components) — new/updated content appears live,
// without a manual browser refresh.
export function RealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    const socket = getSocket();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onChange = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 400);
    };
    socket.on("content:changed", onChange);
    return () => {
      socket.off("content:changed", onChange);
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  return null;
}
