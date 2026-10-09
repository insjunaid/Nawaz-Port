import Star from './Star'

/**
 * Numbered section eyebrow:  02 ──────── ✦ About
 * The hairline draws in on scroll (data-rule, see useSectionReveals).
 */
export default function SectionHead({ index, label, total = '08', className = '' }) {
  return (
    <div className={`section-head ${className}`}>
      <span className="section-head__index" aria-hidden="true">
        {index}
        <span className="section-head__total">/{total}</span>
      </span>
      <span className="section-head__rule" data-rule aria-hidden="true" />
      <Star size={11} filled className="section-head__star" />
      <span className="section-head__label">{label}</span>
    </div>
  )
}
