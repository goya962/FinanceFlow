import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as formatDateFns } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return formatDateFns(dateObj, "PPP")
}

export function generateNumericId<T extends { id: string }>(items: T[], prefix: string): string {
  const existingIds = items.map(item => {
    const match = item.id.match(new RegExp(`^${prefix}-(\\d+)$`));
    return match ? parseInt(match[1], 10) : 0;
  });
  const maxId = Math.max(0, ...existingIds);
  return `${prefix}-${maxId + 1}`;
}
