import os

# Update DepotPage.jsx
depot_path = '/home/john-nguembu/portail_bu/portail-frontend/src/pages/DepotPage.jsx'
with open(depot_path, 'r') as f:
    depot_content = f.read()

depot_addition = """
          {/* ── Contenu principal ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 40, padding: 24, background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: 'var(--bleu-nuit)' }}>Dépôt institutionnel de l'UYI!</h2>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Qu'est ce qu'un Dépôt institutionnel</h3>
              <p style={{ marginBottom: 16, fontSize: 15, lineHeight: 1.7 }}>Un dépôt (ou répertoire) institutionnel vise à recueillir en texte intégral la production scientifique d'une Institution et à la rendre librement accessible via Internet afin d'en augmenter la visibilité et l'impact. Il offre un ensemble de services permettant d'enregistrer, préserver et diffuser des documents numériques. Les chercheurs peuvent y archiver eux-mêmes leurs travaux (auto-archivage).</p>
              
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Quels avantages pour le chercheur?</h3>
              <p style={{ fontSize: 15 }}>Un dépôt institutionnel permet notamment :</p>
              <ul style={{ marginBottom: 16, paddingLeft: 20, fontSize: 15, lineHeight: 1.7 }}>
                <li>une valorisation et une diffusion accrues de la recherche à un niveau mondial ;</li>
                <li>un accès plus rapide à la production scientifique ;</li>
                <li>une garantie de pérennité des dépôts réalisés et de leur accès ;</li>
                <li>un renforcement du prestige de l'Institution et du rayonnement de ses chercheurs.</li>
              </ul>
              <p style={{ marginBottom: 16, fontSize: 15 }}>Plus d'informations : <a href="#" style={{ color: 'var(--or)' }}>Dépôt institutionne en libre accès.</a></p>
              
              <p style={{ marginBottom: 16, fontSize: 15, lineHeight: 1.7 }}>la Bibliothèque Centrale de l'Université de Yaoundé I, à travers son portail Web donne accès à ses utilisateurs aux travaux universitaires des autres, et possibilité de recherche dans des dépôt institutionnels grâce à des outils de recherche simultanée</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Outils de recherche simultanée dans les dépôts d'archives</h3>
              <ul style={{ marginBottom: 24, paddingLeft: 20, fontSize: 15, lineHeight: 1.7 }}>
                <li style={{ marginBottom: 10 }}><strong>Google Scholar :</strong> permet de découvrir des travaux universitaires dans toutes les disciplines, avec un accès intégral lorsque c'est possible. Ces travaux peuvent provenir de sources telles que des éditeurs scientifiques, des sociétés savantes, des référentiels de prépublication, des universités et d'autres organisations de recherche. <a href="#" style={{ color: 'var(--or)' }}>connexion à google scholar</a></li>
                <li style={{ marginBottom: 10 }}><strong>OAISter :</strong> propose une recherche simultanée dans 680 dépôts très variés, contenant des articles, des thèses, des rapports, des documents numérisés,... et disponibles gratuitement. <a href="#" style={{ color: 'var(--or)' }}>Connexion à OAISter</a></li>
                <li><strong>Base :</strong> BASE (Bielefield Academic Search Engine) est l'un des moteurs de recherche les plus volumineux du monde, en particulier pour les ressources universitaires en Open Access. BASE dispose de plus de 65 millions de documents provenant de plus de 3200 sources . <a href="#" style={{ color: 'var(--or)' }}>connexion à Base</a></li>
              </ul>
            </div>
"""

depot_content = depot_content.replace(
    "          {/* ── Contenu principal ── */}\n          <div style={{ flex: 1, minWidth: 0 }}>",
    depot_addition
)

with open(depot_path, 'w') as f:
    f.write(depot_content)

print("DepotPage.jsx updated.")
