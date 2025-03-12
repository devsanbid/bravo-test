"use client";

import { XCircle } from "lucide-react";

export function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
      <XCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
}