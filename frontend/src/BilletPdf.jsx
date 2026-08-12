import { QRCodeSVG } from 'qrcode.react';
import Logo from './Logo';

/**
 * Mise en page du titre de transport, telle qu'elle sera
 * capturee dans le PDF. Rendue hors ecran puis photographiee.
 */
export default function BilletPdf({ billet, reference }) {
  const arrivee = heureArrivee(billet.heure, billet.dureeEstimee);

  return (
    <div ref={reference} className="titre-transport">
      <div className="tt-entete">
        <Logo taille={30} clair />
        <div className="tt-type">
          <span>Titre de transport</span>
          <strong>{libelleGamme(billet.categorie)}</strong>
        </div>
      </div>

      <div className="tt-trajet">
        <div className="tt-ville">
          <span>Depart</span>
          <strong>{billet.villeDepart}</strong>
          <em>{billet.heure.slice(0, 5)}</em>
        </div>
        <div className="tt-fleche">
          <div className="tt-ligne" />
          <span>{formaterDuree(billet.dureeEstimee)}</span>
        </div>
        <div className="tt-ville tt-droite">
          <span>Arrivee</span>
          <strong>{billet.destination}</strong>
          <em>{arrivee || '—'}</em>
        </div>
      </div>

      <div className="tt-date">
        {formaterDate(billet.dateDepart)}
        {!billet.heureGarantie && <span> · depart au remplissage</span>}
      </div>

      <div className="tt-corps">
        <div className="tt-infos">
          <Ligne libelle="Voyageur" valeur={billet.voyageur} />
          <Ligne libelle="Telephone" valeur={billet.telephoneVoyageur} />
          <Ligne libelle="Agence" valeur={billet.agence} />
          <Ligne libelle="Point de depart"
                 valeur={`${billet.quartierDepart}${billet.adresseDepart ? ', ' + billet.adresseDepart : ''}`} />
          {billet.telephoneLocal && (
            <Ligne libelle="Contact agence" valeur={billet.telephoneLocal} />
          )}
          <Ligne libelle="Places" valeur={`${billet.nbPlaces}`} />
          <Ligne libelle="Prix unitaire"
                 valeur={`${billet.tarifUnitaire.toLocaleString('fr-FR')} FCFA`} />
          <Ligne libelle="Reserve le" valeur={formaterHorodatage(billet.reserveLe)} />
        </div>

        <div className="tt-qr">
          <QRCodeSVG value={billet.qr} size={124} level="M" />
          <span className="tt-code">{billet.code}</span>
        </div>
      </div>

      <div className="tt-total">
        <span>Total paye</span>
        <strong>{billet.montant.toLocaleString('fr-FR')} FCFA</strong>
      </div>

      <div className="tt-pied">
        <p>
          <strong>Presentez ce billet a l'embarquement.</strong> Il n'est
          valable que pour le depart indique et ne peut servir qu'une seule fois.
          Presentez-vous 20 minutes avant l'heure de depart.
        </p>
        <p className="tt-mention">
          Billet non remboursable. Non cessible.
          Emis par MeRoMbe pour le compte de {billet.agence}.
        </p>
      </div>
    </div>
  );
}

function Ligne({ libelle, valeur }) {
  return (
    <div className="tt-ligne-info">
      <span>{libelle}</span>
      <strong>{valeur}</strong>
    </div>
  );
}

function libelleGamme(c) {
  if (c === 'vip') return 'VIP';
  if (c === 'confort') return 'Confort';
  return 'Classique';
}

function formaterDuree(minutes) {
  if (!minutes) return '';
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
}

function heureArrivee(heure, duree) {
  if (!duree) return null;
  const [h, m] = heure.split(':').map(Number);
  const total = h * 60 + m + duree;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function formaterDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formaterHorodatage(iso) {
  return new Date(iso).toLocaleString('fr-FR',
    { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}