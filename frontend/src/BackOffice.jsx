import { useEffect, useState } from 'react';
import './App.css';
import { api, lireJeton } from './api';

export default function BackOffice() {
  const [onglet, setOnglet] = useState('tableau');
  const utilisateur = lireJeton();
  const estResponsable = utilisateur?.role === 'responsable';

  return (
    <div>
      <nav className="onglets">
        <button className={onglet === 'tableau' ? 'actif' : ''}
                onClick={() => setOnglet('tableau')}>Tableau de bord</button>
        <button className={onglet === 'departs' ? 'actif' : ''}
                onClick={() => setOnglet('departs')}>Departs</button>
        <button className={onglet === 'offre' ? 'actif' : ''}
                onClick={() => setOnglet('offre')}>Mon offre</button>
        {estResponsable && (
          <button className={onglet === 'equipe' ? 'actif' : ''}
                  onClick={() => setOnglet('equipe')}>Equipe</button>
        )}
      </nav>

      {onglet === 'tableau' && <Tableau />}
      {onglet === 'departs' && <Departs />}
      {onglet === 'offre' && <Offre />}
      {onglet === 'equipe' && estResponsable && <Equipe />}
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
  const [locaux, setLocaux] = useState([]);
  const [villes, setVilles] = useState([]);
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  async function recharger() {
    try {
      setLiaisons(await api.mesLiaisons());
      setHoraires(await api.mesHoraires());
      setLocaux(await api.mesLocaux());
      setVilles(await api.villes());
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

      <FormulaireLiaison locaux={locaux} villes={villes} onCree={recharger} />

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

      <FormulaireHoraire liaisons={liaisons} onCree={recharger} />

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

/* ---- formulaire : declarer une liaison ---- */

function FormulaireLiaison({ locaux, villes, onCree }) {
  const [localDepartId, setLocalDepartId] = useState('');
  const [villeArriveeId, setVilleArriveeId] = useState('');
  const [dureeEstimee, setDureeEstimee] = useState('');
  const [erreur, setErreur] = useState(null);
  const [message, setMessage] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e) {
    e.preventDefault();
    setErreur(null);
    setMessage(null);

    if (!localDepartId || !villeArriveeId) {
      setErreur('Choisissez un local de depart et une ville d\'arrivee.');
      return;
    }

    setEnvoi(true);
    try {
      await api.creerLiaison(
        Number(localDepartId),
        Number(villeArriveeId),
        dureeEstimee ? Number(dureeEstimee) : null
      );
      setMessage('Liaison declaree avec succes.');
      setLocalDepartId('');
      setVilleArriveeId('');
      setDureeEstimee('');
      onCree();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="bloc" style={{ marginTop: 12 }}>
      <h2>Declarer une nouvelle liaison</h2>
      <form onSubmit={soumettre} className="formulaire">
        <label>
          Local de depart
          <select value={localDepartId} onChange={(e) => setLocalDepartId(e.target.value)}>
            <option value="">-- choisir --</option>
            {locaux.map((l) => (
              <option key={l.id} value={l.id}>{l.ville} · {l.quartier}</option>
            ))}
          </select>
        </label>

        <label>
          Ville d'arrivee
          <select value={villeArriveeId} onChange={(e) => setVilleArriveeId(e.target.value)}>
            <option value="">-- choisir --</option>
            {villes.map((v) => (
              <option key={v.id} value={v.id}>{v.nom}</option>
            ))}
          </select>
        </label>

        <label>
          Duree estimee (en minutes, facultatif)
          <input type="number" min="0" value={dureeEstimee}
                 onChange={(e) => setDureeEstimee(e.target.value)}
                 placeholder="ex : 240" />
        </label>

        {message && <p className="succes">{message}</p>}
        {erreur && <p className="erreur">{erreur}</p>}

        <button type="submit" className="bouton discret large" disabled={envoi}>
          {envoi ? 'Envoi...' : 'Declarer la liaison'}
        </button>
      </form>
    </div>
  );
}

/* ---- formulaire : declarer un horaire ---- */

function FormulaireHoraire({ liaisons, onCree }) {
  const [liaisonId, setLiaisonId] = useState('');
  const [heure, setHeure] = useState('');
  const [jours, setJours] = useState('tous');
  const [places, setPlaces] = useState('');
  const [tarif, setTarif] = useState('');
  const [heureGarantie, setHeureGarantie] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [message, setMessage] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e) {
    e.preventDefault();
    setErreur(null);
    setMessage(null);

    if (!liaisonId || !heure || !places || !tarif) {
      setErreur('Remplissez tous les champs obligatoires.');
      return;
    }

    setEnvoi(true);
    try {
      await api.creerHoraire({
        liaisonId: Number(liaisonId),
        heure: heure.length === 5 ? `${heure}:00` : heure,
        jours,
        places: Number(places),
        tarif: Number(tarif),
        heureGarantie,
      });
      setMessage('Horaire declare avec succes.');
      setHeure('');
      setPlaces('');
      setTarif('');
      onCree();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="bloc" style={{ marginTop: 12 }}>
      <h2>Declarer un nouvel horaire</h2>
      <form onSubmit={soumettre} className="formulaire">
        <label>
          Liaison
          <select value={liaisonId} onChange={(e) => setLiaisonId(e.target.value)}>
            <option value="">-- choisir --</option>
            {liaisons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.villeDepart} → {l.villeArrivee} ({l.quartierDepart})
              </option>
            ))}
          </select>
        </label>

        <label>
          Heure de depart
          <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} />
        </label>

        <label>
          Jours
          <select value={jours} onChange={(e) => setJours(e.target.value)}>
            <option value="tous">Tous les jours</option>
            <option value="ouvres">Jours ouvres (lun-ven)</option>
            <option value="weekend">Week-end (sam-dim)</option>
          </select>
        </label>

        <label>
          Places disponibles
          <input type="number" min="1" value={places}
                 onChange={(e) => setPlaces(e.target.value)} placeholder="ex : 30" />
        </label>

        <label>
          Tarif (FCFA)
          <input type="number" min="0" value={tarif}
                 onChange={(e) => setTarif(e.target.value)} placeholder="ex : 5000" />
        </label>

        <label className="ligne-case">
          <input type="checkbox" checked={heureGarantie}
                 onChange={(e) => setHeureGarantie(e.target.checked)} />
          Heure garantie (le depart a lieu meme sans plein)
        </label>

        {message && <p className="succes">{message}</p>}
        {erreur && <p className="erreur">{erreur}</p>}

        <button type="submit" className="bouton discret large" disabled={envoi}>
          {envoi ? 'Envoi...' : 'Declarer l\'horaire'}
        </button>
      </form>
    </div>
  );
}

/* ==================== Equipe (reserve au responsable) ==================== */

function Equipe() {
  const [membres, setMembres] = useState(null);
  const [erreur, setErreur] = useState(null);

  async function recharger() {
    try {
      setMembres(await api.mesMembres());
    } catch (e) {
      setErreur(e.message);
    }
  }

  useEffect(() => { recharger(); }, []);

  async function retirer(id, nom) {
    if (!window.confirm(`Retirer ${nom} de l'equipe ?`)) return;
    try {
      await api.supprimerMembre(id);
      recharger();
    } catch (e) {
      setErreur(e.message);
    }
  }

  if (erreur) return <p className="erreur">{erreur}</p>;
  if (!membres) return <p className="chargement">Chargement...</p>;

  return (
    <>
      <div className="entete-resultats" style={{ marginTop: 0 }}>
        <h2>Votre equipe</h2>
        <span className="compteur">{membres.length} membre(s)</span>
      </div>

      {membres.length === 0 ? (
        <p className="vide">Aucun membre pour l'instant.</p>
      ) : (
        <ul className="liste">
          {membres.map((m) => (
            <li key={m.id} className="ligne-offre">
              <div>
                <strong>{m.nom}</strong>
                <span>{m.telephone} · {libelleRole(m.role)}</span>
              </div>
              {m.role !== 'responsable' && (
                <button className="lien" onClick={() => retirer(m.id, m.nom)}>
                  Retirer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <FormulaireMembre onCree={recharger} />
    </>
  );
}

function libelleRole(role) {
  if (role === 'guichetier') return 'Guichetier';
  if (role === 'agent') return 'Agent d\'embarquement';
  if (role === 'responsable') return 'Responsable';
  return role;
}

/* ---- formulaire : ajouter un membre ---- */

function FormulaireMembre({ onCree }) {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [role, setRole] = useState('guichetier');
  const [erreur, setErreur] = useState(null);
  const [message, setMessage] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e) {
    e.preventDefault();
    setErreur(null);
    setMessage(null);

    if (!nom.trim() || !telephone.trim()) {
      setErreur('Le nom et le telephone sont obligatoires.');
      return;
    }

    setEnvoi(true);
    try {
      await api.creerMembre(nom.trim(), telephone.trim(), role);
      setMessage('Membre ajoute avec succes.');
      setNom('');
      setTelephone('');
      onCree();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="bloc" style={{ marginTop: 28 }}>
      <h2>Ajouter un membre</h2>
      <form onSubmit={soumettre} className="formulaire">
        <label>
          Nom complet
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                 placeholder="ex : Paul Ngono" />
        </label>

        <label>
          Telephone
          <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)}
                 placeholder="ex : +237677000000" />
        </label>

        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="guichetier">Guichetier</option>
            <option value="agent">Agent d'embarquement</option>
          </select>
        </label>

        {message && <p className="succes">{message}</p>}
        {erreur && <p className="erreur">{erreur}</p>}

        <button type="submit" className="bouton discret large" disabled={envoi}>
          {envoi ? 'Envoi...' : 'Ajouter le membre'}
        </button>
      </form>
    </div>
  );
}

function formaterDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}


