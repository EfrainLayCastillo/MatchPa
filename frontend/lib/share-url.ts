import { SITE_URL } from "./config";
import { toMatchImage, type MatchImage } from "./match-images";

type ShareContent = "link" | "copy" | "story";

export function shareUrl(code: string, content: ShareContent, image?: MatchImage, campaign = "partido"): string {
  const params = new URLSearchParams();
  if (image && image !== toMatchImage(null)) params.set("img", image);
  params.set("utm_source", "matchpa");
  params.set("utm_medium", "share");
  params.set("utm_campaign", campaign);
  params.set("utm_content", content);
  return `${SITE_URL}/partidos/${code}?${params.toString()}`;
}
