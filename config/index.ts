export const locales = ['en', 'ar'];

export const baseURL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/api`
  : "/api";