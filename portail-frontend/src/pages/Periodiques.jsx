import React, { useEffect } from 'react';
import Layout from '../components/layout/Layout';

export default function Periodiques() {
  useEffect(() => { document.title = 'Périodiques électroniques - BC-UYI'; }, []);

  return (
    <Layout>
      <main className="container" style={{ padding: '24px 0' }}>
        <article style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1>Les périodiques électroniques accessibles à la BC-UYI</h1>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <caption><strong>Liste des périodiques électroniques par discipline</strong></caption>
            <thead>
              <tr style={{ background: '#666', color: 'white' }}>
                <th style={{ padding: 8 }}>Disciplines</th>
                <th style={{ padding: 8 }}>Liens</th>
                <th style={{ padding: 8 }}>Commentaires</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={5}><strong>Périodiques de santé et de Médecine</strong></td>
                <td><a href="http://www.who.int/bulletin" target="_blank" rel="noreferrer">http://www.who.int/bulletin</a></td>
                <td><strong>Bulletin OMS</strong></td>
              </tr>
              <tr>
                <td><a href="http://www.pathexo.fr/1301-presentation-bulletin.html" target="_blank" rel="noreferrer">http://www.pathexo.fr/1301-presentation-bulletin.html</a></td>
                <td><strong>Bulletin de la SPE</strong></td>
              </tr>
              <tr>
                <td><a href="http://www.hsd-fmsb.org" target="_blank" rel="noreferrer">http://www.hsd-fmsb.org</a></td>
                <td><strong>Health sciences and disease</strong></td>
              </tr>
              <tr>
                <td><a href="http://www.nejm.org" target="_blank" rel="noreferrer">http://www.nejm.org</a></td>
                <td><strong>The New England Journal of Medicine</strong></td>
              </tr>
              <tr>
                <td><a href="http://www.panafrican-med-journal.com" target="_blank" rel="noreferrer">http://www.panafrican-med-journal.com</a></td>
                <td><strong>The Pan African Medical Journal</strong></td>
              </tr>

              <tr>
                <td><strong>Sciences de l'information, communication et documentation</strong></td>
                <td><a href="http://www.archimag.com/" target="_blank" rel="noreferrer">http://www.archimag.com/</a></td>
                <td><strong>Magazine des professionnels de l'information</strong></td>
              </tr>
              <tr>
                <td></td>
                <td><a href="http://www.asis.org/bulletin.html" target="_blank" rel="noreferrer">http://www.asis.org/bulletin.html</a></td>
                <td><strong>The bulletin of the association for information science and technology</strong></td>
              </tr>
              <tr>
                <td></td>
                <td><a href="http://communication.revues.org" target="_blank" rel="noreferrer">http://communication.revues.org</a></td>
                <td><strong>Communication</strong></td>
              </tr>
              <tr>
                <td><strong>Mathématiques</strong></td>
                <td><a href="https://fr.wikipedia.org/wiki/Liste_des_journaux_scientifiques_en_math%C3%A9matiques" target="_blank" rel="noreferrer">Liste des journaux scientifiques en mathématiques - Wikipédia</a></td>
                <td><strong>Liste (incomplète) de revues scientifiques</strong></td>
              </tr>
            </tbody>
          </table>

          <p style={{ marginTop: 16 }}>
            <strong>
              <a href="/E_ressources1.html">Chimie et bois</a> / <a href="/E_ressources2.html">Sciences de l'éducation</a> / <a href="/E_ressources3.html">Sports et Jeunesse</a> /
              <a href="/E_ressources4.html">Sciences Humaines</a> / <a href="/E_ressources5.html">Sciences polytechniques</a> /
              <a href="/E_ressources6.html">Biologie</a> / <a href="/E_ressources7.html">Arts et lettres</a> / <a href="/E_ressources8.html">Environnement et Agriculture</a>
            </strong>
          </p>
        </article>
      </main>
    </Layout>
  );
}
