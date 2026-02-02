import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';

  // Using UTC to ensure day doesn't shift due to timezone offsets when parsing "YYYY-MM-DD"
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();

  return `${day}-${month}-${year}`;
}
