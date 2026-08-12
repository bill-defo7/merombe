import { useState } from 'react';
import { api } from './api';
import './App.css';

/**
 * Ecran de l'agent au moment de l'embarquement.
 * Saisie manuelle du code lisible ; le scan du QR viendra
 * avec la version mobile.
 */
export default function Embarquement() {
  const [code, setCode] = useState('');
  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [historique, setHistorique] = useState([]);

  async function controler(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setChargement(true);
    setResultat(null);

    try {
      const r = await api.controlerBillet(code.trim().toUpperCase());
      setResultat({ ok: true, ...r });
      setHistorique((h) => [{ code: r.code, heure: maintenant(), ok: true }, ...h].slice(0, 8));
    } catch (e) {
      setResultat({ ok: false, motif: e.message });
      setHistorique((h) => [{ code: code.toUpperCase(), heure: maintenant(), ok: false }, ...h].slice(0, 8));
    } finally {
      setChargement(false);
      setCode('');
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 className="titre-page">Controle des billets</h1>

      <div className="bloc">
        <form onSubmit={controler}>
          <label className="champ" style={{ marginBottom: 16 }}>
            <span>Code du billet</span>
            <input
              type="text"
              placeholder="MRB-XXXXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoFocus
              style={{
                fontSize: '1.15rem',
                fontFamily: 'ui-monospace, monospace',
                letterSpacing: '0.08em',
                textAlign: 'center',
              }}
            />
          </label>
          <button type="submit" className="bouton large" disabled={chargement}>
            {chargement ? 'Verification...' : 'Controler'}
          </button>
        </form>
      </div>

      {resultat && (
        <div className={`verdict ${resultat.ok ? 'accepte' : 'refuse'}`}>
          <div className="verdict-icone">{resultat.ok ? '✓' : '✕'}</div>
          {resultat.ok ? (
            <>
              <strong>Billet valide</strong>
              <p>{resultat.destination} · {resultat.heure?.slice(0, 5)}</p>
              <p>{resultat.nbPlaces} place(s) — {resultat.code}</p>
            </>
          ) : (
            <>
              <strong>Billet refuse</strong>
              <p>{resultat.motif}</p>
            </>
          )}
        </div>
      )}

      {historique.length > 0 && (
        <>
          <div className="entete-resultats">
            <h2>Derniers controles</h2>
          </div>
          <ul className="liste">
            {historique.map((h, i) => (
              <li key={i} className="ligne-controle">
                <span className={h.ok ? 'point-ok' : 'point-ko'} />
                <span className="controle-code">{h.code}</span>
                <span className="controle-heure">{h.heure}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function maintenant() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}