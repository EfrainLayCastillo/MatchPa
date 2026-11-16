const KEY = "matchpa:invitee";

export interface Invitee {
  id: number;
  name: string;
}

export function stashInvitee(invitee: Invitee) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(invitee));
  } catch {}
}

export function clearInvitee() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

export function readInvitee(): Invitee | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Invitee) : null;
    return parsed && Number.isInteger(parsed.id) && typeof parsed.name === "string" ? parsed : null;
  } catch {
    return null;
  }
}
