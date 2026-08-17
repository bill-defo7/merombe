import { useState } from 'react';
import { api } from './api';
import './App.css';

export default function Connexion({ surConnexion, surAnnulation }) {
  const [etape, setEtape] = useState('telephone');
  const [numeroLocal, setNumeroLocal] = useState('');
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  const telephone = '+237' + numeroLocal;

  async function envoyerCode(e) {
    e.preventDefault();
    setErreur(null);
    if (numeroLocal.length !== 9) {
      setErreur('Le numero doit comporter 9 chiffres.');
      return;
    }
    setChargement(true);
    try {
      await api.demanderCode(telephone);
      setEtape('code');
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  async function validerCode(e) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    try {
      const reponse = await api.verifierCode(telephone, code);
      localStorage.setItem('merombe_jeton', reponse.jeton);
      localStorage.setItem('merombe_telephone', telephone);
      surConnexion(reponse.jeton);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="bloc">
      {etape === 'telephone' ? (
        <>
          <h2>Connexion</h2>
          <p className="bloc-soustitre">
            Entrez votre numero, nous vous enverrons un code de verification
          </p>

          <form onSubmit={envoyerCode}>
            <label className="champ" style={{ marginBottom: 18 }}>
              <span>Numero de telephone</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{
                  padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8,
                  background: '#f5f5f5', fontWeight: 600,
                }}>
                  +237
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="6XX XX XX XX"
                  maxLength={9}
                  value={numeroLocal}
                  onChange={(e) => setNumeroLocal(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  autoFocus
                  required
                  style={{ flex: 1 }}
                />
              </div>
            </label>

            {erreur && <p className="erreur">{erreur}</p>}

            <button type="submit" className="bouton large" disabled={chargement}>
              {chargement ? 'Envoi en cours...' : 'Recevoir mon code'}
            </button>
          </form>

          <p className="info" style={{ marginTop: 18, marginBottom: 0, fontSize: '0.82rem' }}>
            Premiere visite ? Votre compte est cree automatiquement.
          </p>
        </>
      ) : (
        <>
          <h2>Verification</h2>
          <p className="bloc-soustitre">
            Un code a 6 chiffres a ete envoye au {telephone}
          </p>

          <form onSubmit={validerCode}>
            <label className="champ" style={{ marginBottom: 18 }}>
              <span>Code de verification</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
                style={{
                  fontSize: '1.5rem',
                  letterSpacing: '0.5em',
                  textAlign: 'center',
                  fontFamily: 'ui-monospace, monospace',
                }}
              />
            </label>

            {erreur && <p className="erreur">{erreur}</p>}

            <button type="submit" className="bouton large" disabled={chargement}>
              {chargement ? 'Verification...' : 'Se connecter'}
            </button>
          </form>

          <button className="lien" onClick={() => { setEtape('telephone'); setCode(''); }}
                  style={{ display: 'block', margin: '12px auto 0' }}>
            Changer de numero
          </button>
        </>
      )}

      <button className="lien" onClick={surAnnulation}
              style={{ display: 'block', margin: '6px auto 0', color: 'var(--gris)' }}>
        Retour
      </button>
    </div>
  );
}