"use server";

import { updateTag } from "next/cache";
import { matchTag } from "@/lib/public-match";

const CODE_FORMAT = /^[A-Za-z0-9_-]{1,32}$/;

export async function refreshMatchPage(code: string): Promise<void> {
  if (!CODE_FORMAT.test(code)) return;
  updateTag(matchTag(code));
}
