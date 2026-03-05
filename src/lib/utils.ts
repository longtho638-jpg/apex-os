import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USDT'): string {
  return `${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Use USD formatting for USDT
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('$', '')} ${currency}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
