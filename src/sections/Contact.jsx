import { useId, useRef, useState } from 'react'
import { emphasis } from '../lib/emphasis'
import { useSectionReveals } from '../lib/useSectionReveals'
import { contact as copy } from '../content'
import SectionHead from '../components/SectionHead'
import Magnetic from '../components/Magnetic'
import Star from '../components/Star'

/**
 * 08 — Contact.
 * A huge typographic CTA, the contact channels as ledger rows, and a
 * "ledger slip" form. The form is front-end only: on submit it validates,
 * then drafts the message and offers to send it via email or WhatsApp —
 * so it genuinely works without a server.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Field({ id, name, label, index, error, multiline, ...props }) {
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div className={`slip-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="slip-field__label">
        <span className="slip-field__no" aria-hidden="true">
          {index}
        </span>
        {label}
      </label>
      <Tag
        id={id}
        name={name}
        className="slip-field__input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        rows={multiline ? 4 : undefined}
        {...props}
      />
      <p id={`${id}-err`} className="slip-field__error" aria-live="polite">
        {error || ''}
      </p>
    </div>
  )
}

function ContactForm() {
  const uid = useId()
  const f = copy.form
  const [values, setValues] = useState({ name: '', email: '', company: '', message: '', interests: [] })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const successRef = useRef(null)
  const formRef = useRef(null)

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))
  const toggle = (interest) =>
    setValues((v) => ({
      ...v,
      interests: v.interests.includes(interest) ? v.interests.filter((i) => i !== interest) : [...v.interests, interest],
    }))

  const validate = () => {
    const e = {}
    if (!values.name.trim()) e.name = f.fields.name.error
    if (!EMAIL_RE.test(values.email.trim())) e.email = f.fields.email.error
    if (values.message.trim().length < 4) e.message = f.fields.message.error
    return e
  }

  const onSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      formRef.current?.querySelector(`[name="${Object.keys(e)[0]}"]`)?.focus()
      return
    }
    setSent(true)
    requestAnimationFrame(() => successRef.current?.focus())
  }

  const body = [
    values.message.trim(),
    '',
    `— ${values.name.trim()}${values.company.trim() ? `, ${values.company.trim()}` : ''}`,
    values.email.trim(),
    values.interests.length ? `Interested in: ${values.interests.join(', ')}` : '',
  ]
    .filter((l, i) => l || i === 1)
    .join('\n')
  const email = copy.channels.find((c) => c.key === 'email')
  const whatsapp = copy.channels.find((c) => c.key === 'whatsapp')
  const mailto = `${email.href}?subject=${encodeURIComponent(f.success.subject)}&body=${encodeURIComponent(body)}`
  const wa = `${whatsapp.href}?text=${encodeURIComponent(body)}`

  if (sent) {
    return (
      <div className="slip slip--done" ref={successRef} tabIndex={-1} aria-live="polite">
        <Star size={46} detail className="slip-done__star" />
        <p className="slip-done__title">{f.success.title}</p>
        <p className="slip-done__body">{f.success.body}</p>
        <div className="slip-done__actions">
          <a className="btn btn--gold" href={mailto}>
            <span>{f.success.email}</span>
          </a>
          <a className="btn btn--ghost" href={wa} target="_blank" rel="noopener noreferrer">
            <span>{f.success.whatsapp}</span>
          </a>
        </div>
        <button type="button" className="link-underline slip-done__again" onClick={() => setSent(false)}>
          {f.success.again}
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} className="slip" onSubmit={onSubmit} noValidate aria-labelledby={`${uid}-title`}>
      <p className="slip__head" id={`${uid}-title`}>
        <span>{f.title}</span>
        <span className="mono-dim" aria-hidden="true">
          Nº 08 — {new Date().getFullYear()}
        </span>
      </p>
      <div className="slip__row">
        <Field
          id={`${uid}-name`}
          name="name"
          index="01"
          label={f.fields.name.label}
          placeholder={f.fields.name.placeholder}
          autoComplete="name"
          value={values.name}
          onChange={set('name')}
          error={errors.name}
          required
        />
        <Field
          id={`${uid}-email`}
          name="email"
          type="email"
          index="02"
          label={f.fields.email.label}
          placeholder={f.fields.email.placeholder}
          autoComplete="email"
          value={values.email}
          onChange={set('email')}
          error={errors.email}
          required
        />
      </div>
      <Field
        id={`${uid}-company`}
        name="company"
        index="03"
        label={f.fields.company.label}
        placeholder={f.fields.company.placeholder}
        autoComplete="organization"
        value={values.company}
        onChange={set('company')}
      />
      <fieldset className="slip-chips">
        <legend className="slip-field__label">
          <span className="slip-field__no" aria-hidden="true">
            04
          </span>
          {f.interestLegend}
        </legend>
        <div className="slip-chips__list">
          {f.interests.map((interest) => (
            <label key={interest} className="chip">
              <input type="checkbox" checked={values.interests.includes(interest)} onChange={() => toggle(interest)} />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field
        id={`${uid}-message`}
        name="message"
        index="05"
        multiline
        label={f.fields.message.label}
        placeholder={f.fields.message.placeholder}
        value={values.message}
        onChange={set('message')}
        error={errors.message}
        required
      />
      <div className="slip__submit">
        <Magnetic>
          <button type="submit" className="btn btn--gold btn--lg">
            <span data-magnetic-text>{f.submit}</span>
            <Star size={12} filled className="btn__star" />
          </button>
        </Magnetic>
      </div>
    </form>
  )
}

export default function Contact() {
  const root = useRef(null)
  useSectionReveals(root)
  const primary = copy.channels[0]

  return (
    <section id="contact" ref={root} className="section contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionHead index={copy.index} label={copy.label} />

        <h2 id="contact-title" className="contact__headline">
          {copy.headline.map((line, i) => (
            <span key={line} data-split className={`block contact__line contact__line--${i}`}>
              {emphasis(line)}
            </span>
          ))}
        </h2>

        <div className="contact__grid">
          <div className="contact__left">
            <p className="contact__sub" data-reveal>
              {copy.sub}
            </p>
            <div className="contact__primary" data-reveal>
              <Magnetic strength={0.18}>
                <a href={primary.href} className="contact__email" data-cursor="Write">
                  <span data-magnetic-text>{primary.value}</span>
                </a>
              </Magnetic>
            </div>
            <ul className="channels">
              {copy.channels.map((c, i) => (
                <li key={c.key} data-reveal>
                  <a
                    href={c.href}
                    className="channels__row"
                    {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span className="channels__no" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="channels__label">{c.label}</span>
                    <span className="channels__leader" aria-hidden="true" />
                    <span className="channels__value">{c.value}</span>
                    <span className="channels__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="contact__right" data-reveal>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
