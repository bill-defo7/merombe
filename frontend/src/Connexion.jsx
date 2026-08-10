import { useState } from 'react';
import { api } from './api';

/**
 * Connexion en deux temps : on demande un code par SMS,
 * puis on le verifie. Le jeton obtenu est conserve dans le navigateur.
 */
export default function Connexion({ surConnexion, surAnnulation }) {
  const [etape, setEtape] = useState('telephone');
  const [telephone, setTelephone] = useState('');
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  async function envoyerCode(e) {
    e.preventDefault();
    setErreur(null);
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
    <div className="carte">
      <h2>Connexion</h2>

      {etape === 'telephone' ? (
        <form onSubmit={envoyerCode} className="recherche">
          <label>
            Numero de telephone
            <input
              type="tel"
              placeholder="+237690000000"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={chargement}>
            {chargement ? 'Envoi...' : 'Recevoir un code'}
          </button>
        </form>
      ) : (
        <form onSubmit={validerCode} className="recherche">
          <p className="info">
            Un code a ete envoye au {telephone}.
          </p>
          <label>
            Code a 6 chiffres
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={chargement}>
            {chargement ? 'Verification...' : 'Se connecter'}
          </button>
          <button type="button" className="lien" onClick={() => setEtape('telephone')}>
            Changer de numero
          </button>
        </form>
      )}

      {erreur && <p className="erreur">{erreur}</p>}

      <button type="button" className="lien" onClick={surAnnulation}>
        Retour a la recherche
      </button>
    </div>
  );
}