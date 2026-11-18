export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://matchpa.app";
export const CONTACT_EMAIL = "hola@matchpa.app";
export const INSTAGRAM_URL = "https://www.instagram.com/matchpa.app/";
export const GOOGLE_AUTH_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
export const SIMULATED_OUTAGE = (["waking", "failed"] as const).find((mode) => mode === process.env.NEXT_PUBLIC_SIMULATE_OUTAGE);
