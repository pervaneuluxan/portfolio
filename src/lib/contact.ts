export interface ContactValues {
  name: string;
  email: string;
  message: string;
  /** Honeypot: real visitors never see or fill this field. */
  company: string;
}

export type ContactErrors = Partial<Record<'name' | 'email' | 'message', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(v: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (v.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(v.email.trim())) errors.email = 'Please enter a valid email address.';
  const len = v.message.trim().length;
  if (len < 10) errors.message = 'A few more words, please — at least 10 characters.';
  else if (len > 2000) errors.message = 'Please keep it under 2000 characters.';
  return errors;
}

/**
 * Sends the message. With VITE_CONTACT_ENDPOINT set (e.g. a Formspree or Web3Forms URL) it POSTs JSON;
 * without it, it opens the visitor's email app with the message pre-filled.
 * Returns how the message was delivered.
 */
export async function sendContact(v: ContactValues, to: string): Promise<'sent' | 'mailto'> {
  if (v.company) return 'sent'; // bot filled the honeypot — pretend success, send nothing

  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name: v.name.trim(), email: v.email.trim(), message: v.message.trim() }),
    });
    if (!res.ok) throw new Error(`Request failed with ${res.status}`);
    return 'sent';
  }

  const subject = encodeURIComponent(`Portfolio enquiry from ${v.name.trim()}`);
  const body = encodeURIComponent(`${v.message.trim()}\n\n— ${v.name.trim()} (${v.email.trim()})`);
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  return 'mailto';
}
