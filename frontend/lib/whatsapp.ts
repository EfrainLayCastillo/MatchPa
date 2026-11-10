const digitsOf = (phone: string) => phone.replace(/\D/g, "");

export function whatsappUrl(phone: string, text?: string): string {
  const base = `https://wa.me/${digitsOf(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
