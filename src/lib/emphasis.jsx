/**
 * Tiny markup for copy in content.js:  "build *nations.*"
 * Words wrapped in *asterisks* render as <em> in the italic display style.
 */
export function emphasis(text, className = 'italic-wonk') {
  return String(text)
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith('*') && part.endsWith('*') ? (
        <em key={i} className={className}>
          {part.slice(1, -1)}
        </em>
      ) : (
        part
      ),
    )
}

/** Plain-text version (for aria-labels, meta, etc.). */
export const plain = (text) => String(text).replace(/\*/g, '')
