import { useEffect, useState } from 'react';
import { api } from './api';
import './App.css';

export default function App() {
  const [villes, setVilles] = useState([]);
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [date, setDate] = useState(demain());
  const [resultats, setResultats] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  // charge la liste des villes au premier affichage
  useEffect(() => {
    api.villes()
      .then(setVilles)
      .catch((e) => setErreur('Impossible de charger les villes : ' + e.message));
  }, []);

  async function chercher(e) {
    e.preventDefault();
    setErreur(null);
    setResultats(null);
    setChargement(true);
    try {
      const reponse = await api.rechercher(depart, arrivee, date);
      setResultats(reponse.departs);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="page">
      <header>
        <h1>MeRoMbe</h1>
        <p className="sous-titre">Reservez votre place, sans faire la queue</p>
      </header>

      <form onSubmit={chercher} className="recherche">
        <label>
          Depart
          <select value={depart} onChange={(e) => setDepart(e.target.value)} required>
            <option value="">Choisir une ville</option>
            {villes.map((v) => (
              <option key={v.id} value={v.id}>{v.nom}</option>
            ))}
          </select>
        </label>

        <label>
          Arrivee
          <select value={arrivee} onChange={(e) => setArrivee(e.target.value)} required>
            <option value="">Choisir une ville</option>
            {villes.map((v) => (
              <option key={v.id} value={v.id}>{v.nom}</option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input type="date" value={date} min={aujourdhui()}
                 onChange={(e) => setDate(e.target.value)} required />
        </label>

        <button type="submit" disabled={chargement}>
          {chargement ? 'Recherche...' : 'Rechercher'}
        </button>
      </form>

      {erreur && <p className="erreur">{erreur}</p>}

      {resultats && resultats.length === 0 && (
        <p className="vide">Aucun depart ce jour-la sur ce trajet.</p>
      )}

      {resultats && resultats.length > 0 && (
        <ul className="resultats">
          {resultats.map((d) => (
            <li key={d.departId} className="depart">
              <div className="heure">
                {d.heure.slice(0, 5)}
                {!d.heureGarantie && <span className="indicatif">au remplissage</span>}
              </div>
              <div className="details">
                <strong>{d.agence}</strong>
                <span>{d.quartierDepart}, {d.villeDepart} → {d.villeArrivee}</span>
                <span className="places">{d.placesDispo} place(s) disponible(s)</span>
              </div>
              <div className="tarif">{d.tarif.toLocaleString('fr-FR')} FCFA</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function aujourdhui() {
  return new Date().toISOString().slice(0, 10);
}

function demain() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}