import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { api } from './api';
import './App.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const marqueurAgence = L.divIcon({
  className: '',
  html: '<div class="pastille"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const marqueurMoi = L.divIcon({
  className: '',
  html: '<div class="pastille-moi"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const DOUALA = [4.0511, 9.7043];

export default function Carte({ surRetour }) {
  const [position, setPosition] = useState(null);
  const [locaux, setLocaux] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  function localiser() {
    setErreur(null);
    setChargement(true);

    if (!navigator.geolocation) {
      setErreur('Votre navigateur ne permet pas la geolocalisation.');
      setPosition(DOUALA);
      charger(DOUALA[0], DOUALA[1]);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        charger(coords[0], coords[1]);
      },
      () => {
        setErreur('Position indisponible. Recherche depuis le centre de Douala.');
        setPosition(DOUALA);
        charger(DOUALA[0], DOUALA[1]);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function charger(lat, lon) {
    try {
      setLocaux(await api.locauxProches(lat, lon, 20000));
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  if (!position) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="bloc">
          <h2>Agences pres de vous</h2>
          <p className="bloc-soustitre">
            Nous utilisons votre position pour trouver les points de depart
            les plus proches et leurs coordonnees.
          </p>
          {erreur && <p className="erreur">{erreur}</p>}
          <button className="bouton large" onClick={localiser} disabled={chargement}>
            {chargement ? 'Localisation...' : 'Me localiser'}
          </button>
          <button className="lien" onClick={surRetour}
                  style={{ display: 'block', margin: '12px auto 0' }}>
            Retour a la recherche
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="titre-page">Agences pres de vous</h1>

      {erreur && <p className="erreur">{erreur}</p>}

      <div className="zone-carte">
        <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={position}
            icon={marqueurMoi}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                setPosition([p.lat, p.lng]);
                charger(p.lat, p.lng);
              },
            }}
          >
            <Popup>Deplacez ce point pour ajuster votre position</Popup>
          </Marker>
          {(locaux || []).map((l) => (
            <Marker key={l.id} position={[l.latitude, l.longitude]} icon={marqueurAgence}>
              <Popup>
                <strong>{l.agence}</strong><br />
                {l.quartier}, {l.ville}<br />
                <span style={{ color: '#0a7d3f', fontWeight: 600 }}>
                  {formaterDistance(l.distanceMetres)}
                </span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p className="info" style={{ textAlign: 'center', marginTop: -8, marginBottom: 20 }}>
        Position approximative ? Deplacez le point bleu sur la carte.
      </p>

      {locaux && locaux.length > 0 && (
        <>
          <div className="entete-resultats" style={{ marginTop: 8 }}>
            <h2>Points de depart</h2>
            <span className="compteur">{locaux.length} trouve(s)</span>
          </div>
          <ul className="liste">
            {locaux.map((l) => (
              <li key={l.id} className="agence-proche">
                <div>
                  <strong>{l.agence}</strong>
                  <span>{l.quartier}, {l.ville}</span>
                </div>
                <span className="distance">{formaterDistance(l.distanceMetres)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {locaux && locaux.length === 0 && (
        <p className="vide">Aucune agence dans un rayon de 20 km.</p>
      )}

      <button className="lien" onClick={surRetour}
              style={{ display: 'block', margin: '24px auto 0' }}>
        Retour a la recherche
      </button>
    </>
  );
}

function formaterDistance(metres) {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}