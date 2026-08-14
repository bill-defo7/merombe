import { useEffect, useState } from 'react';
import { api } from './api';
import './App.css';

export default function Inscription({ surRetour }) {
  const [villes, setVilles] = useState([]);
  const [nom, setNom] = useState('');
  const [villeId, setVilleId] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [nomResponsable, setNomResponsable] = useState('');
  const [telephoneResponsable, setTelephoneResponsable] = useState('');
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.villes().then(setVilles).catch((e) => setErreur(e.message));
  }, []);

  async function soumettre(e) {
    e.preventDefault();
    setErreur(null);

    if (!nom.trim() || !villeId || !nomResponsable.trim() || !telephoneResponsable.trim()) {
      setErreur('Merci de remplir tous les champs obligatoires.');
      return;
    }

    setEnvoi(true);
    try {
      const r = await api.inscrireAgence({
        nom: nom.trim(),
        villeId: Number(villeId),
        contact: contact.trim() || null,
        description: description.trim() || null,
        nomResponsable: nomResponsable.trim(),
        telephoneResponsable: telephoneResponsable.trim(),
      });
      setSucces(r.message);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  }

  if (succes) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="bloc">
          <h2>Demande envoyee</h2>
          <p className="succes">{succes}</p>
          <p className="bloc-soustitre">
            Vous pourrez vous connecter avec le numero du responsable
            des que votre agence sera activee.
          </p>
          <button className="bouton large" onClick={surRetour}>
            Retour a l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="bloc">
        <h2>Devenir partenaire MeRoMbe</h2>
        <p className="bloc-soustitre">
          Inscrivez votre agence de voyage. Apres verification, vous
          pourrez gerer vos liaisons, vos horaires et votre equipe.
        </p>

        <form onSubmit={soumettre} className="formulaire">
          <label>
            Nom de l'agence
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                   placeholder="ex : Voyages Express" />
          </label>

          <label>
            Ville principale
            <select value={villeId} onChange={(e) => setVilleId(e.target.value)}>
              <option value="">-- choisir --</option>
              {villes.map((v) => (
                <option key={v.id} value={v.id}>{v.nom}</option>
              ))}
            </select>
          </label>

          <label>
            Contact (telephone ou email, facultatif)
            <input type="text" value={contact} onChange={(e) => setContact(e.target.value)}
                   placeholder="ex : +237677000000" />
          </label>

          <label>
            Description (facultatif)
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      rows={3} placeholder="Presentez votre agence en quelques mots" />
          </label>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '4px 0' }} />

          <label>
            Nom du responsable
            <input type="text" value={nomResponsable}
                   onChange={(e) => setNomResponsable(e.target.value)}
                   placeholder="ex : Paul Ngono" />
          </label>

          <label>
            Telephone du responsable
            <input type="tel" value={telephoneResponsable}
                   onChange={(e) => setTelephoneResponsable(e.target.value)}
                   placeholder="ex : +237677000000" />
            <span style={{ fontSize: 12, color: 'var(--gris)' }}>
              Ce numero servira a se connecter a l'espace agence.
            </span>
          </label>

          {erreur && <p className="erreur">{erreur}</p>}

          <button type="submit" className="bouton large" disabled={envoi}>
            {envoi ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </form>

        <button className="lien" onClick={surRetour}
                style={{ display: 'block', margin: '12px auto 0' }}>
          Retour a l'accueil
        </button>
      </div>
    </div>
  );
}