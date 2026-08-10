// Toutes les communications avec le back-end passent par ici.
// Un seul endroit a modifier le jour ou l'adresse change.

const BASE = '/api';

async function appeler(chemin, options = {}) {
  const jeton = localStorage.getItem('merombe_jeton');

  const reponse = await fetch(BASE + chemin, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
      ...options.headers,
    },
  });

  // 204 : reponse sans contenu
  const contenu = reponse.status === 204 ? null : await reponse.json().catch(() => null);

  if (!reponse.ok) {
    throw new Error(contenu?.erreur || `Erreur ${reponse.status}`);
  }
  return contenu;
}

// Lit le role et l'identifiant depuis le jeton, sans appeler le serveur.
// La signature n'est pas verifiee ici : c'est le back-end qui fait foi.
export function lireJeton() {
  const jeton = localStorage.getItem('merombe_jeton');
  if (!jeton) return null;
  try {
    const charge = JSON.parse(atob(jeton.split('.')[1]));
    return { id: charge.id, telephone: charge.sub, role: charge.role };
  } catch {
    return null;
  }
}

export const api = {
  villes: () => appeler('/villes'),

  rechercher: (villeDepart, villeArrivee, date, places = 1) =>
    appeler(`/recherche/departs?villeDepart=${villeDepart}&villeArrivee=${villeArrivee}&date=${date}&places=${places}`),

  locauxProches: (latitude, longitude, rayon = 10000) =>
    appeler(`/locaux/proches?latitude=${latitude}&longitude=${longitude}&rayon=${rayon}`),

  demanderCode: (telephone) =>
    appeler('/auth/demander-code', {
      method: 'POST',
      body: JSON.stringify({ telephone }),
    }),

  verifierCode: (telephone, code) =>
    appeler('/auth/verifier-code', {
      method: 'POST',
      body: JSON.stringify({ telephone, code }),
    }),

  reserver: (departId, nbPlaces) =>
    appeler('/reservations', {
      method: 'POST',
      body: JSON.stringify({ departId, nbPlaces }),
    }),

  payer: (reservationId, moyen) =>
    appeler('/paiements', {
      method: 'POST',
      body: JSON.stringify({ reservationId, moyen }),
    }),

  mesBillets: () => appeler('/billets/mes-billets'),

  // --- back-office agence ---
  mesLiaisons: () => appeler('/agence/liaisons'),

  creerLiaison: (localDepartId, villeArriveeId, dureeEstimee) =>
    appeler('/agence/liaisons', {
      method: 'POST',
      body: JSON.stringify({ localDepartId, villeArriveeId, dureeEstimee }),
    }),

  mesHoraires: () => appeler('/agence/horaires'),

  creerHoraire: (donnees) =>
    appeler('/agence/horaires', {
      method: 'POST',
      body: JSON.stringify(donnees),
    }),

  mesDeparts: () => appeler('/agence/departs'),

  passagers: (departId) => appeler(`/agence/departs/${departId}/passagers`),

  tableauDeBord: () => appeler('/agence/tableau-de-bord'),

  genererDeparts: () => appeler('/agence/generer-departs', { method: 'POST' }),

  mesLocaux: () => appeler('/agence/locaux'),
};