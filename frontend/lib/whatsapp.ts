const digitsOf = (phone: string) => phone.replace(/\D/g, "");

export const whatsappUrl = (phone: string) => `https://wa.me/${digitsOf(phone)}`;

/** Panama mobiles are 8 digits starting with 6; 7-digit landlines have no WhatsApp. */
export const isPanamaMobile = (phone: string) => /^(507)?6\d{7}$/.test(digitsOf(phone));
