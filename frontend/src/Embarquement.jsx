import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from './api';
import './App.css';

/**
 * Controle a l'embarquement.
 * Le scan du QR verifie la signature : un billet recopie ou
 * modifie est rejete. La saisie manuelle du code lisible reste
 * possible si la camera ne fonctionne pas.
 */
export default function Embarquement() {
  const [mode, setMode] = useState('scan');
  const [code, setCode] = useState('');
  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [historique, setHistorique] = useState([]);
  const [erreurCamera, setErreurCamera] = useState(null);

  const lecteur = useRef(null);
  const enCours = useRef(false);

  useEffect(() => {
    if (mode !== 'scan') return;

    let instance = null;
    let annule = false;

    const demarrer = async () => {
      try {
        instance = new Html5Qrcode('zone-scan');
        await instance.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (texte) => {
            if (enCours.current) return;
            enCours.current = true;
            controlerQr(texte);
          },
          () => {}   // silence sur les images sans QR
        );
        // le composant a ete demonte pendant le demarrage
        if (annule) {
          await instance.stop().catch(() => {});
          instance.clear();
          return;
        }
        lecteur.current = instance;
      } catch (e) {
        if (!annule) {
          setErreurCamera(
            "Camera indisponible. Verifiez l'autorisation ou utilisez la saisie manuelle."
          );
        }
      }
    };

    demarrer();

    return () => {
      annule = true;
      const courant = lecteur.current;
      lecteur.current = null;
      if (!courant) return;
      try {
        // getState() : 2 = en cours de lecture
        if (courant.getState() === 2) {
          courant.stop().then(() => courant.clear()).catch(() => {});
        } else {
          courant.clear();
        }
      } catch {
        /* le lecteur etait deja arrete */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function controlerQr(qr) {
    setChargement(true);
    setResultat(null);
    try {
      const r = await api.controlerQr(qr);
      afficher({ ok: true, ...r }, r.code);
    } catch (e) {
      afficher({ ok: false, motif: e.message }, 'QR refuse');
    } finally {
      setChargement(false);
      setTimeout(() => { enCours.current = false; }, 2000);
    }
  }

  async function controlerCode(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setChargement(true);
    setResultat(null);
    try {
      const r = await api.controlerBillet(code.trim().toUpperCase());
      afficher({ ok: true, ...r }, r.code);
    } catch (e) {
      afficher({ ok: false, motif: e.message }, code.toUpperCase());
    } finally {
      setChargement(false);
      setCode('');
    }
  }

  function afficher(r, codeAffiche) {
    setResultat(r);
    setHistorique((h) =>
      [{ code: codeAffiche, heure: maintenant(), ok: r.ok }, ...h].slice(0, 10));
    if (navigator.vibrate) navigator.vibrate(r.ok ? 100 : [80, 60, 80]);
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 className="titre-page">Controle des billets</h1>

      <div className="bascule">
        <button className={mode === 'scan' ? 'actif' : ''} onClick={() => setMode('scan')}>
          Scanner le QR
        </button>
        <button className={mode === 'code' ? 'actif' : ''} onClick={() => setMode('code')}>
          Saisir le code
        </button>
      </div>

      {mode === 'scan' ? (
        <div className="bloc" style={{ padding: 16 }}>
          <div id="zone-scan" className="zone-scan" />
          {erreurCamera ? (
            <p className="erreur" style={{ marginBottom: 0 }}>{erreurCamera}</p>
          ) : (
            <p className="info" style={{ textAlign: 'center', margin: '14px 0 0' }}>
              Presentez le QR code du voyageur devant la camera
            </p>
          )}
        </div>
      ) : (
        <div className="bloc">
          <form onSubmit={controlerCode}>
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
      )}

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
            <span className="compteur">
              {historique.filter((h) => h.ok).length} accepte(s)
            </span>
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