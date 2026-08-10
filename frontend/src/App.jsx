import { useEffect, useState } from 'react';
import { api } from './api';
import Connexion from './Connexion';
import './App.css';

export default function App() {
  const [ecran, setEcran] = useState('recherche');
  const [jeton, setJeton] = useState(localStorage.getItem('merombe_jeton'));

  // etat de la recherche
  const [villes, setVilles] = useState([]);
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [date, setDate] = useState(demain());
  const [resultats, setResultats] = useState(null);

  // etat du parcours de reservation
  const [choisi, setChoisi] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [paiement, setPaiement] = useState(null);
  const [billets, setBillets] = useState(null);

  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    api.villes().then(setVilles).catch((e) => setErreur(e.message));
  }, []);

  async function chercher(e) {
    e.preventDefault();
    setErreur(null);
    setResultats(null);
    setChargement(true);
    try {
      const r = await api.rechercher(depart, arrivee, date);
      setResultats(r.departs);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  function choisirDepart(d) {
    if (!jeton) {
      setChoisi(d);
      setEcran('connexion');
      return;
    }
    setChoisi(d);
    setEcran('reservation');
  }

  async function confirmerReservation(nbPlaces) {
    setErreur(null);
    setChargement(true);
    try {
      const r = await api.reserver(choisi.departId, nbPlaces);
      setReservation(r);
      setEcran('paiement');
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  async function lancerPaiement(moyen) {
    setErreur(null);
    setChargement(true);
    try {
      const p = await api.payer(reservation.id, moyen);
      setPaiement(p);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  async function voirBillets() {
    setErreur(null);
    setChargement(true);
    try {
      setBillets(await api.mesBillets());
      setEcran('billets');
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  function deconnecter() {
    localStorage.removeItem('merombe_jeton');
    localStorage.removeItem('merombe_telephone');
    setJeton(null);
    setEcran('recherche');
    setChoisi(null);
    setReservation(null);
    setPaiement(null);
  }

  function recommencer() {
    setChoisi(null);
    setReservation(null);
    setPaiement(null);
    setResultats(null);
    setEcran('recherche');
  }

  return (
    <div className="page">
      <header className="entete">
        <div>
          <h1 onClick={recommencer} style={{ cursor: 'pointer' }}>MeRoMbe</h1>
          <p className="sous-titre">Reservez votre place, sans faire la queue</p>
        </div>
        {jeton && (
          <div className="compte">
            <button className="lien" onClick={voirBillets}>Mes billets</button>
            <button className="lien" onClick={deconnecter}>Deconnexion</button>
          </div>
        )}
      </header>

      {erreur && <p className="erreur">{erreur}</p>}

      {ecran === 'connexion' && (
        <Connexion
          surConnexion={(j) => {
            setJeton(j);
            setEcran(choisi ? 'reservation' : 'recherche');
          }}
          surAnnulation={() => setEcran('recherche')}
        />
      )}

      {ecran === 'recherche' && (
        <>
          <form onSubmit={chercher} className="recherche">
            <label>
              Depart
              <select value={depart} onChange={(e) => setDepart(e.target.value)} required>
                <option value="">Choisir une ville</option>
                {villes.map((v) => <option key={v.id} value={v.id}>{v.nom}</option>)}
              </select>
            </label>
            <label>
              Arrivee
              <select value={arrivee} onChange={(e) => setArrivee(e.target.value)} required>
                <option value="">Choisir une ville</option>
                {villes.map((v) => <option key={v.id} value={v.id}>{v.nom}</option>)}
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

          {resultats && resultats.length === 0 && (
            <p className="vide">Aucun depart ce jour-la sur ce trajet.</p>
          )}

          {resultats && resultats.length > 0 && (
            <ul className="resultats">
              {resultats.map((d) => (
                <li key={d.departId} className="depart" onClick={() => choisirDepart(d)}>
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
        </>
      )}

      {ecran === 'reservation' && choisi && (
        <Reservation depart={choisi} chargement={chargement}
                     surConfirmation={confirmerReservation}
                     surRetour={() => setEcran('recherche')} />
      )}

      {ecran === 'paiement' && reservation && (
        <Paiement reservation={reservation} paiement={paiement} chargement={chargement}
                  surPaiement={lancerPaiement} surBillets={voirBillets} />
      )}

      {ecran === 'billets' && (
        <MesBillets billets={billets} surRetour={recommencer} />
      )}
    </div>
  );
}

function Reservation({ depart, chargement, surConfirmation, surRetour }) {
  const [nbPlaces, setNbPlaces] = useState(1);
  const total = depart.tarif * nbPlaces;

  return (
    <div className="carte">
      <h2>Confirmer la reservation</h2>
      <div className="recapitulatif">
        <p><strong>{depart.agence}</strong></p>
        <p>{depart.quartierDepart}, {depart.villeDepart} → {depart.villeArrivee}</p>
        <p>{depart.dateDepart} a {depart.heure.slice(0, 5)}</p>
      </div>

      <label className="champ">
        Nombre de places
        <select value={nbPlaces} onChange={(e) => setNbPlaces(Number(e.target.value))}>
          {Array.from({ length: Math.min(depart.placesDispo, 6) }, (_, i) => i + 1)
            .map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>

      <p className="total">Total : <strong>{total.toLocaleString('fr-FR')} FCFA</strong></p>

      <button onClick={() => surConfirmation(nbPlaces)} disabled={chargement}>
        {chargement ? 'Reservation...' : 'Reserver'}
      </button>
      <button className="lien" onClick={surRetour}>Retour</button>
    </div>
  );
}

function Paiement({ reservation, paiement, chargement, surPaiement, surBillets }) {
  if (paiement) {
    return (
      <div className="carte">
        <h2>Paiement en cours</h2>
        <p className="info">
          Confirmez le paiement sur votre telephone.
          Reference : <strong>{paiement.reference}</strong>
        </p>
        <p className="info">
          Une fois confirme, votre billet sera disponible.
        </p>
        <button onClick={surBillets}>Voir mes billets</button>
      </div>
    );
  }

  return (
    <div className="carte">
      <h2>Paiement</h2>
      <p className="total">
        Montant : <strong>{reservation.montant.toLocaleString('fr-FR')} FCFA</strong>
      </p>
      <p className="info">
        Vos places sont bloquees pendant {reservation.delaiMinutes} minutes.
      </p>

      <div className="moyens">
        <button onClick={() => surPaiement('mtn_momo')} disabled={chargement}>
          MTN Mobile Money
        </button>
        <button onClick={() => surPaiement('orange_money')} disabled={chargement}>
          Orange Money
        </button>
      </div>
    </div>
  );
}

function MesBillets({ billets, surRetour }) {
  if (!billets) return <p className="vide">Chargement...</p>;
  if (billets.length === 0) {
    return (
      <div className="carte">
        <h2>Mes billets</h2>
        <p className="vide">Aucun billet pour le moment.</p>
        <button className="lien" onClick={surRetour}>Rechercher un trajet</button>
      </div>
    );
  }

  return (
    <>
      <h2 className="titre-section">Mes billets</h2>
      <ul className="resultats">
        {billets.map((b) => (
          <li key={b.code} className="billet">
            <div className="billet-entete">
              <span className="code">{b.code}</span>
              <span className={`etat ${b.statut}`}>{b.statut}</span>
            </div>
            <p>{b.destination} — {b.dateDepart} a {b.heure.slice(0, 5)}</p>
            <p className="details-billet">
              {b.nbPlaces} place(s) — {b.montant.toLocaleString('fr-FR')} FCFA
            </p>
          </li>
        ))}
      </ul>
      <button className="lien" onClick={surRetour}>Rechercher un trajet</button>
    </>
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