/** Formats an amount stored in kobo (NGN smallest unit) as a Naira string, e.g. 250000 -> "₦2,500". */
export const formatKobo = (kobo: number): string => `₦${(kobo / 100).toLocaleString('en-NG')}`;
