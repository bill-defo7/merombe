import { useEffect, useState } from 'react';
import { api } from './api';
import './App.css';

export default function Admin() {
  const [onglet, setOnglet] = useState('synthese');

  return (
    <div>
      <nav className="onglets">
        <button className={onglet === 'synthese' ? 'actif' : ''}
                onClick={() => setOnglet('synthese')}>Synthese</button>
        <button className={onglet === 'agences' ? 'actif' : ''}
                onClick={() => setOnglet('agences')}>Agences</button>
        <button className={onglet === 'litiges' ? 'actif' : ''}
                onClick={() => setOnglet('litiges')}>Litiges paiement</button>
      </nav>

      {onglet === 'synthese' && <Synthese />}
      {onglet === 'agences' && <Agences />}
      {onglet === 'litiges' && <Litiges />}
    </div>
  );
}

/* ==================== Synthese ==================== */

function Synthese() {
  const [chiffres, setChiffres] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.synthese().then(setChiffres).catch((e) => setErreur(e.message));
  }, []);

  if (erreur) return <p className="erreur">{erreur}</p>;
  if (!chiffres) return <p className="chargement">Chargement...</p>;

  return (
    <>
      <h1 className="titre-page">Vue d'ensemble</h1>
      <div className="chiffres">
        <Chiffre valeur={chiffres.agencesActives} libelle="Agences actives" />
        <Chiffre valeur={chiffres.agencesEnAttente} libelle="Agences en attente" />
        <Chiffre valeur={chiffres.voyageurs} libelle="Voyageurs inscrits" />
        <Chiffre valeur={chiffres.departsAVenir} libelle="Departs a venir" />
        <Chiffre valeur={chiffres.billetsEmis} libelle="Billets emis" />
        <Chiffre valeur={chiffres.paiementsALitiger} libelle="Paiements a litiger" />
      </div>
    </>
  );
}

function Chiffre({ valeur, libelle }) {
  return (
    <div className="chiffre">
      <div className="valeur">{valeur}</div>
      <div className="libelle">{libelle}</div>
    </div>
  );
}

/* ==================== Agences ==================== */

function Agences() {
  const [filtre, setFiltre] = useState('en_attente');
  const [agences, setAgences] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);

  async function charger() {
    try {
      setAgences(await api.agencesAdmin(filtre));
    } catch (e) {
      setErreur(e.message);
    }
  }

  useEffect(() => { setAgences(null); charger(); }, [filtre]);

  async function changerStatut(id, statut) {
    setErreur(null);
    setEnCours(id);
    try {
      await api.changerStatutAgence(id, statut);
      charger();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnCours(null);
    }
  }

  return (
    <>
      <div className="entete-resultats" style={{ marginTop: 0 }}>
        <h2>Agences</h2>
        <span className="compteur">{agences ? agences.length : ''}</span>
      </div>

      <div className="onglets" style={{ marginBottom: 20 }}>
        <button className={filtre === 'en_attente' ? 'actif' : ''}
                onClick={() => setFiltre('en_attente')}>En attente</button>
        <button className={filtre === 'active' ? 'actif' : ''}
                onClick={() => setFiltre('active')}>Actives</button>
        <button className={filtre === 'suspendue' ? 'actif' : ''}
                onClick={() => setFiltre('suspendue')}>Suspendues</button>
      </div>

      {erreur && <p className="erreur">{erreur}</p>}

      {!agences && <p className="chargement">Chargement...</p>}

      {agences && agences.length === 0 && (
        <p className="vide">Aucune agence dans cette categorie.</p>
      )}

      {agences && agences.length > 0 && (
        <ul className="liste">
          {agences.map((a) => (
            <li key={a.id} className="ligne-offre">
              <div>
                <strong>{a.nom}</strong>
                <span>{a.ville} {a.contact && `· ${a.contact}`}</span>
                {a.description && (
                  <span style={{ display: 'block', fontSize: 13, marginTop: 4 }}>
                    {a.description}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {a.statut !== 'active' && (
                  <button className="bouton discret" disabled={enCours === a.id}
                          onClick={() => changerStatut(a.id, 'active')}>
                    Activer
                  </button>
                )}
                {a.statut !== 'suspendue' && (
                  <button className="lien" disabled={enCours === a.id}
                          onClick={() => changerStatut(a.id, 'suspendue')}>
                    Suspendre
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ==================== Litiges de paiement ==================== */

function Litiges() {
  const [litiges, setLitiges] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);

  async function charger() {
    try {
      setLitiges(await api.litiges());
    } catch (e) {
      setErreur(e.message);
    }
  }

  useEffect(() => { charger(); }, []);

  async function trancher(reference, decision) {
    setErreur(null);
    setEnCours(reference);
    try {
      await api.trancherLitige(reference, decision);
      charger();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnCours(null);
    }
  }

  if (erreur) return <p className="erreur">{erreur}</p>;
  if (!litiges) return <p className="chargement">Chargement...</p>;

  return (
    <>
      <div className="entete-resultats" style={{ marginTop: 0 }}>
        <h2>Paiements a litiger</h2>
        <span className="compteur">{litiges.length}</span>
      </div>

      {litiges.length === 0 ? (
        <p className="vide">Aucun litige en attente.</p>
      ) : (
        <ul className="liste">
          {litiges.map((p) => (
            <li key={p.paiementId} className="ligne-offre">
              <div>
                <strong>{p.voyageur}</strong>
                <span>{p.telephone} · {p.montant.toLocaleString('fr-FR')} FCFA · {p.moyen}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--gris)' }}>
                  Ref. {p.reference}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="bouton discret" disabled={enCours === p.reference}
                        onClick={() => trancher(p.reference, 'REUSSI')}>
                  Reussi
                </button>
                <button className="lien" disabled={enCours === p.reference}
                        onClick={() => trancher(p.reference, 'ECHOUE')}>
                  Echoue
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}