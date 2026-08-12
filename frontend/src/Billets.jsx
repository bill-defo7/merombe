import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from './api';
import './App.css';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/** Capture le billet affiche et l'enregistre en PDF. */
async function telecharger(element, code) {
  const image = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
  const pdf = new jsPDF({ unit: 'mm', format: [100, 150] });
  const largeur = 90;
  const hauteur = (image.height / image.width) * largeur;
  pdf.addImage(image.toDataURL('image/png'), 'PNG', 5, 8, largeur, hauteur);
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
              <div className="billet-trajet">{b.destination}</div>
              <div className="billet-detail">
                {formaterDate(b.dateDepart)} a {b.heure.slice(0, 5)}
              </div>
              <div className="billet-detail">
                {b.nbPlaces} place(s) — {b.montant.toLocaleString('fr-FR')} FCFA
              </div>

              {b.statut === 'valide' && (
                ouvert === b.code ? (
                  <>
                    <div className="qr-zone" ref={(el) => (zones.current[b.code] = el)}>
                      <QRCodeSVG value={b.qr} size={190} level="M" />
                      <p className="qr-aide">Presentez ce code a l'embarquement</p>
                      <p className="qr-aide" style={{ fontWeight: 600, color: 'var(--encre)' }}>
                        {b.code} · {b.destination} · {b.dateDepart}
                      </p>
                    </div>
                    <button className="bouton discret large" style={{ marginTop: 12 }}
                            onClick={() => telecharger(zones.current[b.code], b.code)}>
                      Telecharger le billet
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
    </>
  );
}

function formaterDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}