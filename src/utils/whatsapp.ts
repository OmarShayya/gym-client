// Utilities for WhatsApp click-to-chat expiry reminders (no external API).

/**
 * Strip all non-digit characters from a phone number so it can be used in a
 * wa.me link (drops leading `+`, spaces, dashes, parentheses, etc.).
 */
export const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

/**
 * Build a WhatsApp click-to-chat URL with a pre-filled message.
 */
export const buildWhatsAppUrl = (phone: string, message: string): string => {
  const digits = normalizePhone(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

/**
 * Friendly membership expiry reminder message for a member.
 */
export const expiryReminderMessage = (
  firstName: string,
  membershipEndDate: string
): string => {
  const formattedDate = new Date(membershipEndDate).toLocaleDateString();
  return `Hi ${firstName}, your 270 Fitness membership expires on ${formattedDate}. Renew now to keep training with us! 💪`;
};
