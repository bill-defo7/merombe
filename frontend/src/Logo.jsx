/**
 * Marque MeRoMbe : une route qui file vers l'horizon,
 * dessinee en SVG pour rester nette a toutes les tailles.
 */
export default function Logo({ taille = 34, clair = false }) {
  const encre = clair ? '#ffffff' : '#0f5132';
  const accent = '#e8a33d';

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={taille} height={taille} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="11" fill={encre} />
        {/* la route */}
        <path d="M13 31 L18 12 L22 12 L27 31 Z" fill="white" fillOpacity="0.16" />
        {/* les bandes centrales */}
        <rect x="19" y="14" width="2" height="4" rx="1" fill={accent} />
        <rect x="19" y="20" width="2" height="4" rx="1" fill={accent} />
        <rect x="19" y="26" width="2" height="4" rx="1" fill={accent} />
        {/* l'horizon */}
        <circle cx="20" cy="10" r="2.5" fill={accent} />
      </svg>
      <span style={{
        fontFamily: 'Sora, system-ui, sans-serif',
        fontSize: taille * 0.55,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: clair ? '#ffffff' : encre,
      }}>
        MeRoMbe
      </span>
    </span>
  );
}