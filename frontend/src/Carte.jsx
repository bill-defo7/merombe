import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { api } from './api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet cherche ses icones a un chemin qui n'existe pas avec Vite :
// on les remplace par un marqueur dessine a la main.
const marqueur = L.divIcon({
  className: 'marqueur',
  html: '<div class="pastille"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// centre par defaut : Douala
const DOUALA = [4.0511, 9.7043];

export default function Carte({ surRetour }) {
  const [position, setPosition] = useState(null);
  const [locaux, setLocaux] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  async function localiser() {
    setErreur(null);
    setChargement(true);

    if (!navigator.geolocation) {
      setErreur("Votre navigateur ne permet pas la geolocalisation");
      setChargement(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        await charger(coords[0], coords[1]);
      },
      () => {
        // refus ou echec : on se rabat sur le centre de Douala
        setErreur("Position indisponible, recherche depuis le centre de Douala");
        setPosition(DOUALA);
        charger(DOUALA[0], DOUALA[1]);
      }
    );
  }

  async function charger(lat, lon) {
    try {
      setLocaux(await api.locauxProches(lat, lon, 15000));
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div>
      <h2 className="titre-section">Agences proches de moi</h2>

      {!position && (
        <div className="carte">
          <p className="info">
            Nous utilisons votre position pour trouver les agences
            les plus proches de vous.
          </p>
          <button onClick={localiser} disabled={chargement}>
            {chargement ? 'Localisation...' : 'Me localiser'}
          </button>
          <button className="lien" onClick={surRetour}>Retour</button>
        </div>
      )}

      {erreur && <p className="erreur">{erreur}</p>}

      {position && (
        <>
          <div className="zone-carte" style={{ height: '340px', marginBottom: '20px',
                                                borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Circle center={position} radius={300}
                      pathOptions={{ color: '#0a7d3f', fillOpacity: 0.25 }} />
              {(locaux || []).map((l) => (
                <Marker key={l.id} position={[l.latitude ?? position[0], l.longitude ?? position[1]]}
                        icon={marqueur}>
                  <Popup>
                    <strong>{l.agence}</strong><br />
                    {l.quartier}, {l.ville}<br />
                    {formaterDistance(l.distanceMetres)}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {locaux && locaux.length > 0 && (
            <ul className="resultats">
              {locaux.map((l) => (
                <li key={l.id} className="depart">
                  <div className="details">
                    <strong>{l.agence}</strong>
                    <span>{l.quartier}, {l.ville}</span>
                  </div>
                  <div className="tarif">{formaterDistance(l.distanceMetres)}</div>
                </li>
              ))}
            </ul>
          )}

          {locaux && locaux.length === 0 && (
            <p className="vide">Aucune agence dans un rayon de 15 km.</p>
          )}

          <button className="lien" onClick={surRetour}>Retour a la recherche</button>
        </>
      )}
    </div>
  );
}

function formaterDistance(metres) {
  if (metres < 1000) return `${metres} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}