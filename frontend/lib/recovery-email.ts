const KEY = "matchpa:recovery-email";

export function stashRecoveryEmail(email: string) {
  try {
    if (email) sessionStorage.setItem(KEY, email);
  } catch {}
}

export function takeRecoveryEmail(): string {
  try {
    const email = sessionStorage.getItem(KEY) ?? "";
    sessionStorage.removeItem(KEY);
    return email;
  } catch {
    return "";
  }
}
