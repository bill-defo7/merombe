import { useEffect, useState } from 'react';
import { api } from './api';
import './App.css';

export default function BackOffice() {
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

/* ==================== Tableau de bord ==================== */

function Tableau() {
  const [chiffres, setChiffres] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.tableauDeBord().then(setChiffres).catch((e) => setErreur(e.message));
  }, []);

  if (erreur) return <p className="erreur">{erreur}</p>;
  if (!chiffres) return <p className="chargement">Chargement...</p>;

  return (
    <>
      <h1 className="titre-page">{chiffres.agence}</h1>

      <div className="chiffres">
        <Chiffre valeur={chiffres.recettesFCFA.toLocaleString('fr-FR')}
                 unite="FCFA" libelle="Recettes encaissees" />
        <Chiffre valeur={chiffres.placesPayees} libelle="Places vendues" />
        <Chiffre valeur={chiffres.departsAVenir} libelle="Departs a venir" />
        <Chiffre valeur={chiffres.tauxRemplissage} unite="%" libelle="Taux de remplissage" />
      </div>

      <div className="bloc">
        <h2>Vos prochaines echeances</h2>
        <p className="bloc-soustitre">
          {chiffres.reservationsConfirmees} reservation(s) confirmee(s) a ce jour.
          Les departs se generent automatiquement chaque nuit a partir de vos horaires.
        </p>
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

/* ==================== Departs et passagers ==================== */

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
  if (!departs) return <p className="chargement">Chargement...</p>;
  if (departs.length === 0) {
    return (
      <div className="bloc">
        <h2>Aucun depart</h2>
        <p className="bloc-soustitre">
          Declarez vos liaisons et horaires dans l'onglet « Mon offre »,
          puis generez les departs.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="entete-resultats" style={{ marginTop: 0 }}>
        <h2>Departs a venir</h2>
        <span className="compteur">{departs.length} programme(s)</span>
      </div>

      <ul className="liste">
        {departs.map((d) => {
          const vendues = d.placesTotal - d.placesDispo;
          const taux = Math.round((vendues / d.placesTotal) * 100);
          return (
            <li key={d.departId} className="depart-agence">
              <div className="depart-agence-haut">
                <div>
                  <div className="depart-date">{formaterDate(d.dateDepart)}</div>
                  <div className="depart-info">
                    {d.heure.slice(0, 5)} · {d.villeArrivee}
                  </div>
                </div>
                <div className="depart-prix">
                  {d.tarif.toLocaleString('fr-FR')} F
                </div>
              </div>

              <div className="depart-remplissage">
                <span>{vendues} / {d.placesTotal} places</span>
                <span className={taux >= 80 ? 'fort' : ''}>{taux} %</span>
              </div>
              <div className="jauge">
                <div className="remplissage" style={{ width: `${taux}%` }} />
              </div>

              <button className="lien" onClick={() => voirPassagers(d.departId)}
                      style={{ padding: '8px 0' }}>
                {ouvert === d.departId ? 'Masquer la liste' : 'Voir les passagers'}
              </button>

              {ouvert === d.departId && (
                <ul className="passagers">
                  {(passagers[d.departId] || []).length === 0 ? (
                    <li style={{ color: 'var(--gris)', borderBottom: 'none' }}>
                      Aucun passager pour l'instant.
                    </li>
                  ) : (
                    passagers[d.departId].map((p) => (
                      <li key={p.reservationId}>
                        <strong style={{ flex: 1 }}>{p.nom}</strong>
                        <span style={{ color: 'var(--gris)' }}>{p.telephone}</span>
                        <span>{p.nbPlaces} pl.</span>
                        <span className={`badge-statut ${p.statut}`}>{p.statut}</span>
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

/* ==================== Offre ==================== */

function Offre() {
  const [liaisons, setLiaisons] = useState(null);
  const [horaires, setHoraires] = useState(null);
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
      setMessage(r.crees === 0
        ? 'Vos departs sont deja a jour pour les 14 prochains jours.'
        : `${r.crees} depart(s) genere(s) pour les 14 prochains jours.`);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  if (!liaisons || !horaires) return <p className="chargement">Chargement...</p>;

  return (
    <>
      <div className="entete-resultats" style={{ marginTop: 0 }}>
        <h2>Vos liaisons</h2>
        <span className="compteur">{liaisons.length} declaree(s)</span>
      </div>

      {liaisons.length === 0 ? (
        <p className="vide">Aucune liaison declaree.</p>
      ) : (
        <ul className="liste">
          {liaisons.map((l) => (
            <li key={l.id} className="ligne-offre">
              <div>
                <strong>{l.villeDepart} → {l.villeArrivee}</strong>
                <span>Depart de {l.quartierDepart}</span>
              </div>
              <span className="duree">
                {l.dureeEstimee ? `${Math.floor(l.dureeEstimee / 60)}h${String(l.dureeEstimee % 60).padStart(2, '0')}` : '—'}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="entete-resultats">
        <h2>Vos horaires</h2>
        <span className="compteur">{horaires.length} declare(s)</span>
      </div>

      {horaires.length === 0 ? (
        <p className="vide">Aucun horaire declare.</p>
      ) : (
        <ul className="liste">
          {horaires.map((h) => (
            <li key={h.id} className="ligne-horaire">
              <div className="horaire-heure">{h.heure.slice(0, 5)}</div>
              <div>
                <strong>{h.villeArrivee}</strong>
                <span>{h.jours === 'tous' ? 'Tous les jours' : h.jours}</span>
              </div>
              <div className="horaire-droite">
                <div className="horaire-tarif">{h.tarif.toLocaleString('fr-FR')} F</div>
                <span>{h.places} places</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="bloc" style={{ marginTop: 28 }}>
        <h2>Generation des departs</h2>
        <p className="bloc-soustitre">
          Les departs des 14 prochains jours sont crees automatiquement
          chaque nuit a partir de vos horaires. Vous pouvez aussi les
          generer maintenant.
        </p>
        {message && <p className="succes">{message}</p>}
        {erreur && <p className="erreur">{erreur}</p>}
        <button className="bouton discret large" onClick={genererDeparts} disabled={chargement}>
          {chargement ? 'Generation...' : 'Generer maintenant'}
        </button>
      </div>
    </>
  );
}

function formaterDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}