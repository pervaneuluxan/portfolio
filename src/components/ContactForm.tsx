import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { profile } from '../data/profile';
import { sendContact, validateContact, type ContactErrors, type ContactValues } from '../lib/contact';
import { ArrowRight, Check, Spinner } from './Icons';

type Status = 'idle' | 'submitting' | 'sent' | 'mailto' | 'error';
const EMPTY: ContactValues = { name: '', email: '', message: '', company: '' };

export function ContactForm() {
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    if (touched[e.target.name]) setErrors(validateContact(next));
  };

  const onBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validateContact(values));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    const firstInvalid = (['name', 'email', 'message'] as const).find((k) => found[k]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    setStatus('submitting');
    try {
      const result = await sendContact(values, profile.email);
      setStatus(result);
      if (result === 'sent') setValues(EMPTY);
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent' || status === 'mailto') {
    return (
      <div className="card flex flex-col items-start gap-4 p-7" role="status">
        <span className="grid size-11 place-items-center rounded-full bg-ok/15 text-ok">
          <Check width={20} height={20} />
        </span>
        <h3 className="text-xl font-semibold">{status === 'sent' ? 'Message sent — thank you!' : 'Your email app is ready.'}</h3>
        <p className="text-muted">
          {status === 'sent'
            ? 'Thanks for reaching out — I’ll reply as soon as I can.'
            : `A draft addressed to ${profile.email} should have opened. Press send there to deliver it.`}
        </p>
        <button type="button" className="btn-ghost" onClick={() => setStatus('idle')}>
          Write another message
        </button>
      </div>
    );
  }

  const field = (name: 'name' | 'email' | 'message') => ({
    name,
    id: `contact-${name}`,
    value: values[name],
    onChange,
    onBlur,
    'aria-invalid': !!(touched[name] && errors[name]),
    'aria-describedby': touched[name] && errors[name] ? `contact-${name}-error` : undefined,
    className: `field ${touched[name] && errors[name] ? '!border-danger focus:!ring-danger/25' : ''}`,
  });

  const errorFor = (name: 'name' | 'email' | 'message') =>
    touched[name] && errors[name] ? (
      <p id={`contact-${name}-error`} className="mt-1.5 text-sm text-danger">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="card space-y-5 p-6 sm:p-7" aria-describedby="contact-form-note">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">Name</label>
          <input type="text" autoComplete="name" placeholder="Your name" {...field('name')} />
          {errorFor('name')}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">Email</label>
          <input type="email" autoComplete="email" inputMode="email" placeholder="you@company.com" {...field('email')} />
          {errorFor('email')}
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">Message</label>
        <textarea rows={5} placeholder="What are you building, and how can I help?" {...field('message')} />
        {errorFor('message')}
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={onChange} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <p id="contact-form-note" className="text-xs text-muted">All fields are required.</p>
        <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Spinner /> Sending…
            </>
          ) : (
            <>
              Send message <ArrowRight />
            </>
          )}
        </button>
      </div>

      <p role="alert" className={status === 'error' ? 'rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger' : 'sr-only'}>
        {status === 'error' ? `Something went wrong sending your message. Please try again or email ${profile.email} directly.` : ''}
      </p>
    </form>
  );
}
