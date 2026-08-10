import { useEffect, useState } from 'react';
import { api } from './api';

export default function BackOffice({ surDeconnexion }) {
  const [onglet, setOnglet] = useState('tableau');

  return (
    <div>
      <nav className="onglets">
        <button className={onglet === 'tableau' ? 'actif' : ''}
                onClick={() => setOnglet('tableau')}>Tableau de bord</button>
        <button className={onglet === 'departs' ? 'actif' : ''}
                onClick={() => setOnglet('departs')}>Departs</button>
        <button className={onglet === 'offre' ? 'actif' : ''}
                onClick={() => setOnglet('offre')}>Mon offre</button>
      </nav>

      {onglet === 'tableau' && <Tableau />}
      {onglet === 'departs' && <Departs />}
      {onglet === 'offre' && <Offre />}
    </div>
  );
}

function Tableau() {
  const [chiffres, setChiffres] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.tableauDeBord().then(setChiffres).catch((e) => setErreur(e.message));
  }, []);

  if (erreur) return <p className="erreur">{erreur}</p>;
  if (!chiffres) return <p className="vide">Chargement...</p>;

  return (
    <>
      <h2 className="titre-section">{chiffres.agence}</h2>
      <div className="chiffres">
        <Chiffre valeur={chiffres.recettesFCFA.toLocaleString('fr-FR')}
                 unite="FCFA" libelle="Recettes encaissees" />
        <Chiffre valeur={chiffres.placesPayees} libelle="Places vendues" />
        <Chiffre valeur={chiffres.departsAVenir} libelle="Departs a venir" />
        <Chiffre valeur={chiffres.tauxRemplissage} unite="%" libelle="Taux de remplissage" />
      </div>
    </>
  );
}

function Chiffre({ valeur, unite, libelle }) {
  return (
    <div className="chiffre">
      <div className="valeur">
        {valeur}{unite && <span className="unite"> {unite}</span>}
      </div>
      <div className="libelle">{libelle}</div>
    </div>
  );
}

function Departs() {
  const [departs, setDeparts] = useState(null);
  const [ouvert, setOuvert] = useState(null);
  const [passagers, setPassagers] = useState({});
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.mesDeparts().then(setDeparts).catch((e) => setErreur(e.message));
  }, []);

  async function voirPassagers(departId) {
    if (ouvert === departId) {
      setOuvert(null);
      return;
    }
    setOuvert(departId);
    if (!passagers[departId]) {
      try {
        const liste = await api.passagers(departId);
        setPassagers((p) => ({ ...p, [departId]: liste }));
      } catch (e) {
        setErreur(e.message);
      }
    }
  }

  if (erreur) return <p className="erreur">{erreur}</p>;
  if (!departs) return <p className="vide">Chargement...</p>;

  return (
    <>
      <h2 className="titre-section">Departs a venir</h2>
      <ul className="resultats">
        {departs.map((d) => {
          const vendues = d.placesTotal - d.placesDispo;
          return (
            <li key={d.departId} className="billet">
              <div className="billet-entete">
                <span className="code">{d.dateDepart} · {d.heure.slice(0, 5)}</span>
                <span className="etat">{d.villeArrivee}</span>
              </div>
              <p className="details-billet">
                {vendues} / {d.placesTotal} place(s) — {d.tarif.toLocaleString('fr-FR')} FCFA
              </p>
              <div className="jauge">
                <div className="remplissage"
                     style={{ width: `${(vendues / d.placesTotal) * 100}%` }} />
              </div>

              <button className="lien" onClick={() => voirPassagers(d.departId)}>
                {ouvert === d.departId ? 'Masquer' : 'Voir les passagers'}
              </button>

              {ouvert === d.departId && (
                <ul className="passagers">
                  {(passagers[d.departId] || []).length === 0 ? (
                    <li className="vide">Aucun passager pour l'instant.</li>
                  ) : (
                    passagers[d.departId].map((p) => (
                      <li key={p.reservationId}>
                        <strong>{p.nom}</strong> — {p.telephone}
                        <span className={`etat ${p.statut}`}>{p.statut}</span>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Offre() {
  const [liaisons, setLiaisons] = useState([]);
  const [horaires, setHoraires] = useState([]);
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  async function recharger() {
    try {
      setLiaisons(await api.mesLiaisons());
      setHoraires(await api.mesHoraires());
    } catch (e) {
      setErreur(e.message);
    }
  }

  useEffect(() => { recharger(); }, []);

  async function genererDeparts() {
    setMessage(null);
    setErreur(null);
    setChargement(true);
    try {
      const r = await api.genererDeparts();
      setMessage(`${r.crees} depart(s) genere(s) pour les 14 prochains jours.`);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <>
      <h2 className="titre-section">Mes liaisons</h2>
      {liaisons.length === 0 ? (
        <p className="vide">Aucune liaison declaree.</p>
      ) : (
        <ul className="resultats">
          {liaisons.map((l) => (
            <li key={l.id} className="depart">
              <div className="details">
                <strong>{l.quartierDepart}, {l.villeDepart} → {l.villeArrivee}</strong>
                <span>{l.dureeEstimee ? `${l.dureeEstimee} min estimees` : 'duree non precisee'}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="titre-section" style={{ marginTop: 28 }}>Mes horaires</h2>
      {horaires.length === 0 ? (
        <p className="vide">Aucun horaire declare.</p>
      ) : (
        <ul className="resultats">
          {horaires.map((h) => (
            <li key={h.id} className="depart">
              <div className="heure">{h.heure.slice(0, 5)}</div>
              <div className="details">
                <strong>{h.villeArrivee}</strong>
                <span>{h.jours === 'tous' ? 'tous les jours' : h.jours}</span>
                <span className="places">{h.places} place(s) par depart</span>
              </div>
              <div className="tarif">{h.tarif.toLocaleString('fr-FR')} FCFA</div>
            </li>
          ))}
        </ul>
      )}

      <div className="carte" style={{ marginTop: 24 }}>
        <p className="info">
          Les departs des prochains jours sont generes automatiquement
          chaque nuit a partir de vos horaires.
        </p>
        <button onClick={genererDeparts} disabled={chargement}>
          {chargement ? 'Generation...' : 'Generer maintenant'}
        </button>
      </div>

      {message && <p className="succes">{message}</p>}
      {erreur && <p className="erreur">{erreur}</p>}
    </>
  );
}