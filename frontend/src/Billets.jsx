import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { api } from './api';
import BilletPdf from './BilletPdf';
import './App.css';

/** Capture le titre de transport et l'enregistre en PDF A5. */
async function telecharger(element, code) {
  if (!element) return;
  const image = await html2canvas(element, {
    scale: 2.5,
    backgroundColor: '#ffffff',
    useCORS: true,
  });
  const pdf = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });
  const marge = 10;
  const largeur = 148 - marge * 2;
  const hauteur = (image.height / image.width) * largeur;
  pdf.addImage(image.toDataURL('image/png'), 'PNG', marge, marge, largeur, hauteur);
  pdf.save(`billet-${code}.pdf`);
}

export default function Billets({ surRetour }) {
  const [billets, setBillets] = useState(null);
  const [ouvert, setOuvert] = useState(null);
  const [erreur, setErreur] = useState(null);
  const zones = useRef({});

  useEffect(() => {
    api.mesBillets().then(setBillets).catch((e) => setErreur(e.message));
  }, []);

  if (erreur) return <p className="erreur">{erreur}</p>;
  if (!billets) return <p className="chargement">Chargement de vos billets...</p>;

  if (billets.length === 0) {
    return (
      <div className="bloc">
        <h2>Mes billets</h2>
        <p className="vide">
          Vous n'avez pas encore de billet.<br />
          Reservez un trajet pour commencer.
        </p>
        <button className="bouton large" onClick={surRetour}>
          Rechercher un trajet
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="titre-page">Mes billets</h1>

      <ul className="liste">
        {billets.map((b) => (
          <li key={b.code} className="billet">
            <div className={`billet-haut ${b.statut === 'utilise' ? 'est-utilise' : ''}`}>
              <span className="billet-code">{b.code}</span>
              <span className="billet-etat">{b.statut}</span>
            </div>
            <div className="billet-corps">
              <div className="billet-trajet">{b.villeDepart} → {b.destination}</div>
              <div className="billet-detail">
                {formaterDate(b.dateDepart)} a {b.heure.slice(0, 5)}
              </div>
              <div className="billet-detail">
                {b.agence} · {b.nbPlaces} place(s) — {b.montant.toLocaleString('fr-FR')} FCFA
              </div>

              {b.statut === 'valide' && (
                ouvert === b.code ? (
                  <>
                    <div className="qr-zone">
                      <QRCodeSVG value={b.qr} size={190} level="M" />
                      <p className="qr-aide">Presentez ce code a l'embarquement</p>
                    </div>
                    <button className="bouton discret large" style={{ marginTop: 12 }}
                            onClick={() => telecharger(zones.current[b.code], b.code)}>
                      Telecharger le billet
                    </button>
                    <button className="lien" onClick={() => setOuvert(null)}
                            style={{ display: 'block', margin: '8px auto 0' }}>
                      Masquer
                    </button>
                  </>
                ) : (
                  <button className="bouton discret large" style={{ marginTop: 14 }}
                          onClick={() => setOuvert(b.code)}>
                    Afficher le QR code
                  </button>
                )
              )}
            </div>
          </li>
        ))}
      </ul>

      <button className="lien" onClick={surRetour}
              style={{ display: 'block', margin: '20px auto 0' }}>
        Rechercher un autre trajet
      </button>

      {/* Rendu hors ecran : c'est cette mise en page qui part dans le PDF */}
      <div className="tt-hors-ecran">
        {billets.map((b) => (
          <BilletPdf key={b.code} billet={b}
                     reference={(el) => (zones.current[b.code] = el)} />
        ))}
      </div>
    </>
  );
}

function formaterDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}