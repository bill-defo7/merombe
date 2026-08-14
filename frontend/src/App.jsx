import { useEffect, useState } from 'react';
import { api, lireJeton } from './api';
import Connexion from './Connexion';
import BackOffice from './BackOffice';
import Carte from './Carte';
import Billets from './Billets';
import './App.css';
import Logo from './Logo';
import Embarquement from './Embarquement';
import Inscription from './Inscription';

export default function App() {
  const [ecran, setEcran] = useState('accueil');
  const [jeton, setJeton] = useState(localStorage.getItem('merombe_jeton'));
  const [apresConnexion, setApresConnexion] = useState(null);

  const utilisateur = jeton ? lireJeton() : null;
  const estAgence = utilisateur && ['guichetier', 'agent', 'responsable', 'admin'].includes(utilisateur.role);

  const [choisi, setChoisi] = useState(null);
  const [reservation, setReservation] = useState(null);

  function connecter(nouveauJeton) {
    setJeton(nouveauJeton);
    setEcran(apresConnexion || 'accueil');
    setApresConnexion(null);
  }

  function deconnecter() {
    localStorage.removeItem('merombe_jeton');
    localStorage.removeItem('merombe_telephone');
    setJeton(null);
    setChoisi(null);
    setReservation(null);
    setEcran('accueil');
  }

  function demanderConnexion(destination) {
    setApresConnexion(destination);
    setEcran('connexion');
  }

  // --- espace agence : interface entierement distincte ---
 const estGuichet = utilisateur && ['guichetier', 'responsable', 'admin'].includes(utilisateur.role);
 const estAgent = utilisateur && utilisateur.role === 'agent';

  if (estGuichet || estAgent) {
    return (
      <div className="appli">
        <header className="barre">
          <div className="barre-contenu">
            <div className="marque"><Logo taille={30} /></div>
            <nav className="navigation">
              <span className="nav-lien">{utilisateur.telephone}</span>
              <button className="nav-lien" onClick={deconnecter}>Deconnexion</button>
            </nav>
          </div>
        </header>
        <div className="contenu">
          {estAgent ? <Embarquement /> : <BackOffice />}
        </div>
      </div>
    );
  }

  return (
    <div className="appli">
      <header className="barre">
        <div className="barre-contenu">
          <div className="marque" onClick={() => setEcran('accueil')}>
            <Logo />
          </div>
          <nav className="navigation">
            <button className="nav-lien" onClick={() => setEcran('carte')}>
              Agences proches
            </button>
            <button className="nav-lien" onClick={() => setEcran('inscription')}>
              Devenir partenaire
            </button>
            {jeton ? (
              <>
                <button className="nav-lien" onClick={() => setEcran('billets')}>
                  Mes billets
                </button>
                <button className="nav-lien" onClick={deconnecter}>
                  Deconnexion
                </button>
              </>
            ) : (
              <button className="nav-lien principal"
                      onClick={() => demanderConnexion('accueil')}>
                Se connecter
              </button>
            )}
          </nav>
        </div>
      </header>

      {ecran === 'accueil' && (
        <Accueil
          connecte={!!jeton}
          surChoix={(d) => {
            setChoisi(d);
            if (!jeton) {
              demanderConnexion('reservation');
            } else {
              setEcran('reservation');
            }
          }}
        />
      )}

      {ecran === 'connexion' && (
        <div className="contenu-etroit">
          <Connexion surConnexion={connecter}
                     surAnnulation={() => setEcran('accueil')} />
        </div>
      )}

      {ecran === 'reservation' && choisi && (
        <div className="contenu-etroit">
          <Reservation
            depart={choisi}
            surReserve={(r) => { setReservation(r); setEcran('paiement'); }}
            surRetour={() => setEcran('accueil')} />
        </div>
      )}

      {ecran === 'paiement' && reservation && (
        <div className="contenu-etroit">
          <Paiement reservation={reservation}
                    surTermine={() => setEcran('billets')} />
        </div>
      )}

      {ecran === 'billets' && (
        <div className="contenu-etroit">
          <Billets surRetour={() => setEcran('accueil')} />
        </div>
      )}

      {ecran === 'carte' && (
        <div className="contenu">
          <Carte surRetour={() => setEcran('accueil')} />
        </div>
      )}

      {ecran === 'inscription' && (
        <div className="contenu">
          <Inscription surRetour={() => setEcran('accueil')} />
        </div>
      )}
    </div>
  );
}

/* ==================== Accueil et recherche ==================== */

function Accueil({ surChoix }) {
  const [villes, setVilles] = useState([]);
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [date, setDate] = useState(demain());
  const [resultats, setResultats] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    api.villes().then(setVilles).catch((e) => setErreur(e.message));
  }, []);

  async function chercher(e) {
    e?.preventDefault();
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

  function choisirDestination(nomVille) {
    const v = villes.find((x) => x.nom === nomVille);
    const douala = villes.find((x) => x.nom === 'Douala');
    if (v && douala) {
      setDepart(String(douala.id));
      setArrivee(String(v.id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <>
      <section className="banniere">
        <div className="banniere-image" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600&q=80)',
        }} />
        <div className="banniere-voile" />
        <div className="banniere-texte">
          <h1>Le Cameroun,<br />d'une ville a <em>l'autre</em></h1>
          <p>
            Comparez les agences, choisissez votre place,
            payez par Mobile Money. Sans faire la queue.
          </p>
        </div>
      </section>

      <div className="sous-banniere">
        <form onSubmit={chercher} className="bloc-recherche">
          <div className="champs">
            <label className="champ">
              <span>Depart</span>
              <select value={depart} onChange={(e) => setDepart(e.target.value)} required>
                <option value="">Ville de depart</option>
                {villes.map((v) => <option key={v.id} value={v.id}>{v.nom}</option>)}
              </select>
            </label>
            <label className="champ">
              <span>Arrivee</span>
              <select value={arrivee} onChange={(e) => setArrivee(e.target.value)} required>
                <option value="">Ville d'arrivee</option>
                {villes.map((v) => <option key={v.id} value={v.id}>{v.nom}</option>)}
              </select>
            </label>
            <label className="champ">
              <span>Date</span>
              <input type="date" value={date} min={aujourdhui()}
                     onChange={(e) => setDate(e.target.value)} required />
            </label>
            <button type="submit" className="bouton" disabled={chargement}>
              {chargement ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </form>
      </div>

      <div className="contenu">
        {erreur && <p className="erreur">{erreur}</p>}

        {resultats && resultats.length === 0 && (
          <p className="vide">
            Aucun depart ce jour-la sur ce trajet.<br />
            Essayez une autre date.
          </p>
        )}

        {resultats && resultats.length > 0 && (
          <>
            <div className="entete-resultats">
              <h2>{resultats[0].villeDepart} → {resultats[0].villeArrivee}</h2>
              <span className="compteur">
                {resultats.length} depart{resultats.length > 1 ? 's' : ''}
              </span>
            </div>
            <ul className="liste">
              {resultats.map((d) => (
                <CarteTrajet key={d.departId} depart={d} surChoix={() => surChoix(d)} />
              ))}
            </ul>
          </>
        )}
         
        {/* <img 
          src={d.image} 
          alt={d.nom} 
          loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=80'; }}
        />  */}

        {!resultats && (
          <>
            <div className="arguments">
              <div className="argument">
                <div className="argument-icone">🎫</div>
                <h3>Votre place est reservee</h3>
                <p>Plus d'attente au guichet, plus de bus complet a l'arrivee.</p>
              </div>
              <div className="argument">
                <div className="argument-icone">📱</div>
                <h3>Payez depuis votre telephone</h3>
                <p>MTN Mobile Money ou Orange Money, en quelques secondes.</p>
              </div>
              <div className="argument">
                <div className="argument-icone">📍</div>
                <h3>Trouvez l'agence la plus proche</h3>
                <p>Toutes les agences geolocalisees, avec les distances reelles.</p>
              </div>
            </div>

            <section className="destinations">
              <h2>Destinations populaires</h2>
              <div className="grille-destinations">
                {DESTINATIONS.map((d) => (
                  <div key={d.nom} className="destination"
                       onClick={() => choisirDestination(d.nom)}>
                    <img src={d.image} alt={d.nom} loading="lazy" />
                    <div className="destination-voile" />
                    <div className="destination-nom">
                      <strong>{d.nom}</strong>
                      <span>{d.accroche}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}

const DESTINATIONS = [
  { nom: 'Yaounde', accroche: 'La capitale, 3h de route',
    image: 'https://images.unsplash.com/photo-1486487687687-e105fd869528?w=600&q=80' },
  { nom: 'Kribi', accroche: 'Plages et chutes, 2h30',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
  { nom: 'Bafoussam', accroche: 'Les hauts plateaux, 5h',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80' },
  { nom: 'Buea', accroche: 'Au pied du mont, 1h30',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80' },
];

function CarteTrajet({ depart, surChoix }) {
  const arrivee = heureArrivee(depart.heure, depart.dureeEstimee);
  const peu = depart.placesDispo <= 3;

  return (
    <li className="trajet" onClick={surChoix}>
      {depart.photoBus && (
        <img className="trajet-photo" src={depart.photoBus} alt="" loading="lazy" />
      )}

      <div className="trajet-heure">
        <strong>{depart.heure.slice(0, 5)}</strong>
        <small>{arrivee ? `arr. ${arrivee}` : ''}</small>
      </div>

      <div className="trajet-corps">
        <div className="trajet-agence">
          <strong>{depart.agence}</strong>
          {depart.note && <span className="note">★ {depart.note}</span>}
        </div>
        <div className="trajet-lieu">
          {depart.quartierDepart}
          {depart.adresseDepart && ` · ${depart.adresseDepart}`}
        </div>
        <div className="etiquettes">
          <span className={`etiquette gamme-${depart.categorie}`}>
            {libelleGamme(depart.categorie)}
          </span>
          {depart.climatise && <span className="etiquette">Climatise</span>}
          {depart.wifi && <span className="etiquette">Wifi</span>}
          {depart.priseUsb && <span className="etiquette">Prise USB</span>}
          {!depart.heureGarantie && <span className="etiquette">Depart au remplissage</span>}
          {peu && <span className="etiquette alerte">Plus que {depart.placesDispo} place(s)</span>}
        </div>
      </div>

      <div className="trajet-prix">
        <div className="prix">
          {depart.tarif.toLocaleString('fr-FR')} F
          <small>{depart.placesDispo} place(s)</small>
        </div>
      </div>
    </li>
  );
}

/* ==================== Reservation ==================== */

function Reservation({ depart, surReserve, surRetour }) {
  const [nbPlaces, setNbPlaces] = useState(1);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);
  const total = depart.tarif * nbPlaces;

  async function reserver() {
    setErreur(null);
    setChargement(true);
    try {
      surReserve(await api.reserver(depart.departId, nbPlaces));
    } catch (e) {
      setErreur(e.message);
      setChargement(false);
    }
  }

  return (
    <div className="bloc">
      <h2>Votre voyage</h2>
      {depart.photoBus && (
        <img className="photo-voyage" src={depart.photoBus} alt="" />
      )}
      <p className="bloc-soustitre">Verifiez les informations avant de reserver</p>

      <div className="recapitulatif">
        <div className="recap-ligne">
          <span>Agence</span><span>{depart.agence}</span>
        </div>
        <div className="recap-ligne">
          <span>Trajet</span>
          <span>{depart.villeDepart} → {depart.villeArrivee}</span>
        </div>
        <div className="recap-ligne">
          <span>Depart</span>
          <span>{formaterDate(depart.dateDepart)} a {depart.heure.slice(0, 5)}</span>
        </div>
        <div className="recap-ligne">
          <span>Lieu</span>
          <span>{depart.quartierDepart}{depart.adresseDepart && `, ${depart.adresseDepart}`}</span>
        </div>
        <div className="recap-ligne">
          <span>Confort</span><span>{libelleGamme(depart.categorie)}</span>
        </div>
      </div>

      <label className="champ" style={{ marginBottom: 20 }}>
        <span>Nombre de places</span>
        <select value={nbPlaces} onChange={(e) => setNbPlaces(Number(e.target.value))}>
          {Array.from({ length: Math.min(depart.placesDispo, 8) }, (_, i) => i + 1)
            .map((n) => <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>)}
        </select>
      </label>

      <div className="total-ligne">
        <span>Total a payer</span>
        <strong>{total.toLocaleString('fr-FR')} FCFA</strong>
      </div>

      {erreur && <p className="erreur">{erreur}</p>}

      <button className="bouton large" onClick={reserver} disabled={chargement}>
        {chargement ? 'Reservation...' : 'Reserver ma place'}
      </button>
      <button className="lien" onClick={surRetour}
              style={{ display: 'block', margin: '10px auto 0' }}>
        Retour aux resultats
      </button>
    </div>
  );
}

/* ==================== Paiement ==================== */

function Paiement({ reservation, surTermine }) {
  const [paiement, setPaiement] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  async function payer(moyen) {
    setErreur(null);
    setChargement(true);
    try {
      setPaiement(await api.payer(reservation.id, moyen));
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  if (paiement) {
    return (
      <div className="bloc">
        <h2>Confirmez sur votre telephone</h2>
        <p className="bloc-soustitre">
          Une demande de paiement a ete envoyee. Saisissez votre code secret
          pour valider la transaction.
        </p>
        <div className="recapitulatif">
          <div className="recap-ligne">
            <span>Reference</span><span>{paiement.reference}</span>
          </div>
          <div className="recap-ligne">
            <span>Montant</span>
            <span>{paiement.montant.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
        <p className="info">
          Votre billet sera disponible des la confirmation du paiement.
        </p>
        <button className="bouton large" onClick={surTermine}>
          Voir mes billets
        </button>
      </div>
    );
  }

  return (
    <div className="bloc">
      <h2>Paiement</h2>
      <p className="bloc-soustitre">
        Vos places sont bloquees pendant {reservation.delaiMinutes} minutes
      </p>

      <div className="total-ligne">
        <span>Montant</span>
        <strong>{reservation.montant.toLocaleString('fr-FR')} FCFA</strong>
      </div>

      {erreur && <p className="erreur">{erreur}</p>}

      <div className="moyens">
        <button className="moyen" onClick={() => payer('mtn_momo')} disabled={chargement}>
          <span className="pastille-moyen mtn">MTN</span>
          MTN Mobile Money
        </button>
        <button className="moyen" onClick={() => payer('orange_money')} disabled={chargement}>
          <span className="pastille-moyen orange">OM</span>
          Orange Money
        </button>
      </div>
    </div>
  );
}

/* ==================== utilitaires ==================== */

function libelleGamme(categorie) {
  if (categorie === 'vip') return 'VIP';
  if (categorie === 'confort') return 'Confort';
  return 'Classique';
}

function heureArrivee(heure, dureeMinutes) {
  if (!dureeMinutes) return null;
  const [h, m] = heure.split(':').map(Number);
  const total = h * 60 + m + dureeMinutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formaterDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function aujourdhui() {
  return new Date().toISOString().slice(0, 10);
}

function demain() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}