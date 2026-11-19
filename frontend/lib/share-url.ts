import { SITE_URL } from "./config";

type ShareContent = "link" | "copy" | "story";

export function shareUrl(code: string, content: ShareContent, campaign = "partido"): string {
  const params = new URLSearchParams();
  params.set("utm_source", "matchpa");
  params.set("utm_medium", "share");
  params.set("utm_campaign", campaign);
  params.set("utm_content", content);
  return `${SITE_URL}/partidos/${code}?${params.toString()}`;
}
