import os

file_path = '/home/john-nguembu/portail_bu/portail-frontend/src/pages/StaticPages.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update ServicesPage
services_addition = """
    consultation: {
      title: 'Espace consultation',
      icon: '📖',
      desc: 'La bibliothèque dispose de plusieurs salles de lecture climatisées offrant plus de 500 places assises réparties sur 3 niveaux. Chaque niveau est dédié à des disciplines spécifiques.',
      details: [
        'Niveau 1 : Accueil, prêt/retour, salle de consultation générale',
        'Niveau 2 : Sciences exactes, Technologies, Médecine',
        'Niveau 3 : Sciences humaines, Lettres, Droit, Sciences sociales',
        'Salle de lecture silencieuse (50 places) — Niveau 2',
        'Accès PMR (Personnes à Mobilité Réduite)',
      ],
      hours: '07h30 – 15h30 (Lun–Ven) | 08h00 – 13h00 (Sam)',
      content: (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 22, color: 'var(--bleu-nuit)', marginBottom: 12 }}>Consultation des ouvrages à la Bibliothèque Centrale de l'UYI!</h3>
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Consultation des ouvrages</h4>
          <p style={{ lineHeight: 1.7 }}>La Bibliothèque Centrale de l'UYI dispose un important fonds documentaire constitué de monographies, mémoires et thèses, journaux et ressources numériques disponibles dans son catalogue informatisé.<br/>Des journaux de différents pays et des périodiques imprimés (revues & annales) qu'il est possible de consulter sur place dans un espace convivial. Toutes ces ressources sont consultables dans notre catalogue informatisé.<br/><Link to="/catalogue" style={{ color: 'var(--or)', fontWeight: 600 }}>Consulter notre catalogue</Link></p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Consultation des Mémoires et Thèses</h4>
          <p style={{ lineHeight: 1.7 }}>La Bibliothèque Centrale de l'UYI reçoit des mémoires et thèses soutenus dans les différents département et Ecole de l'Université de Yaoundé I. Par ailleurs chaque grandes école dispose d'un répertoire de mémoires et thèses accessibles via leur site web.<br/><Link to="/theses" style={{ color: 'var(--or)', fontWeight: 600 }}>Consulter les mémoires et thèses disponibles à la BC-UYI</Link></p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Consultation des périodiques</h4>
          <p style={{ lineHeight: 1.7 }}>La Bibliothèque Centrale de l'UYI reçoit les journaux de différents pays et des périodiques imprimés (revues & annales) qu'il est possible de consulter sur place à la section des périodiques dans un espace convivial. Tous les journaux, revues et microformes disponibles à la BC-UYI seront bientôt répertoriés dans notre catalogue informatisé et pourront être consultés à l'aide du moteur de recherche de PMB.<br/>Comment s'y retrouver? Se rendre directement à la section des périodique au rez-de-chaussé.</p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Consultation des Bases de données</h4>
          <p style={{ lineHeight: 1.7 }}>La Bibliothèque Centrale de l'UYI met à la disposition de ses usagers d'importantes bases de données couvrant toutes les disciplines enseignées à l'Université de Yaoundé I. Grâce à sa coopération avec de nombreux éditeurs et partenaires spécialisé dans la promotion des ressources numériques, de nombreuses bases de données thèmatiques sont accessibles via le portail de la bibliothèque.</p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Quelques Bases de données de ressources accessibles via le portail de la BC-UYI</h4>
          <ul style={{ lineHeight: 1.7, paddingLeft: 20 }}>
            <li>Base de données des documents numériques de la BC-UYI</li>
            <li>Base de données des données bibliographiques disponibles à la BC-UYI</li>
            <li>Base de données du programme HINARI disponibles à la BC-UYI</li>
            <li>Les ressources d'EIFL.net pour le Cameroun disponibles à la BC-UYI</li>
          </ul>

          <h3 style={{ fontSize: 22, color: 'var(--bleu-nuit)', marginTop: 40, marginBottom: 12 }}>Les Espaces de lecture de la Bibliothèque Centrale de l'UYI!</h3>
          <p style={{ lineHeight: 1.7 }}>Après les gros travaux de renovation, la capacité d'accueil de la BC-UYI a été portée à plus de 1000places assises. Des nouveaux espace de lecture ont été aménagés pour rendre acceptable le travail des étudiants en bibliothèque. seuls les usagers munis d'une carte d'accès bénéficie de ces espaces et d'un accès au Wifi.</p>
          <p style={{ fontWeight: 600, marginTop: 10 }}>les salles de lecture en image</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 10 }}>
            <div>
              <img src={salleLect} alt="Salle lecture" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius)' }} />
              <p style={{ textAlign: 'center', fontSize: 13, marginTop: 6, color: 'var(--texte-muted)' }}>Salle lecture Niveau 1</p>
            </div>
            <div>
              <img src={photo14} alt="Salle lecture 2" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius)' }} />
              <p style={{ textAlign: 'center', fontSize: 13, marginTop: 6, color: 'var(--texte-muted)' }}>Salle lecture Niveau 1 b</p>
            </div>
          </div>
          
          <h4 style={{ fontWeight: 700, marginTop: 30 }}>Quelques consignes à observer dans les salles de lecture</h4>
          <p style={{ lineHeight: 1.7 }}>Pour éviter tout désagrement pouvant conduire à une expulsion de la bibliothèque, les usagers doivent respecter les consignes suivantes:</p>
          <ul style={{ lineHeight: 1.7, paddingLeft: 20 }}>
            <li>Ne pas entrer avec le sac à l'intérieur de la bibliothèque</li>
            <li>Ne pas entrer avec de la nourriture ou de la boisson</li>
            <li>Ne pas téléphoner</li>
            <li>Ne pas faire de bruit</li>
            <li>Ne pas accéder aux ouvrages sans autorisation</li>
          </ul>

          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Quelques avantages à l'intérieur de la bibliothèque</h4>
          <p style={{ lineHeight: 1.7 }}>une fois à l'intérieur et si vous disposez d'un ordinateur portable:</p>
          <ul style={{ lineHeight: 1.7, paddingLeft: 20 }}>
            <li>Vous avez la possibilité d'accéder à notre Wifi</li>
            <li>Vous avez la possibilité d'accéder aux ressources numériques consultables uniquement sur place</li>
            <li>Vous avez la possibilité d'accéder aux ressources en intranet</li>
            <li>Ne avez la possibilité de bénéficier d'une assistance informatique et technique</li>
          </ul>

          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Règlement de la Bibliothèque</h4>
          <p style={{ lineHeight: 1.7 }}>La Bibliothèque Centrale (BC) est un centre spécialisé de l’université de Yaoundé I qui a pour vocation de répondre aux besoins documentaires des étudiants, enseignants, chercheurs et personnels de l’institution ainsi qu'aux personnes extérieures, dument autorisées par les autorités responsables et dont la recherche documentaire justifie la fréquentation d'une bibliothèque universitaire. Le présent règlement intérieur a pour objet de préciser les droits et les devoirs des usagers sus cités.</p>
          <p style={{ marginTop: 10 }}><a href="#" className="btn btn-outline-white" style={{ borderColor: 'var(--border)', color: 'var(--bleu-nuit)' }}>📄 Télécharger le règlement Règlement intérieur</a></p>
        </div>
      )
    },
    wifi: {
      title: 'Accès WiFi Campus',
      icon: '📶',
      desc: 'La bibliothèque offre un accès WiFi haut débit de 200 Mbps avec couverture totale sur l\'ensemble des 3 niveaux et des espaces extérieurs.',
      details: [
        'Débit : 200 Mbps symétrique',
        'Couverture : 100% des espaces intérieurs',
        'Connexion : Identifiants SIGB ou réseau universitaire',
        'Accès aux bases de données en ligne inclus',
        'Filtrage respectueux de la vie privée',
      ],
      hours: 'Disponible 24h/24 dans les zones couvertes',
      content: (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 22, color: 'var(--bleu-nuit)', marginBottom: 12 }}>le WIFI s'intalle à la Bibliothèque Centrale de l'UYI!</h3>
          <p style={{ lineHeight: 1.7 }}>La bibliothèque Centrale de l'Université de Yaoundé I donne un accès gratuit et sécurisé au Web et à des logiciels (traitement de texte, retouche de photographie), adaptés à l’usager Le service de réservation des postes n'a plus court dans la bibliothèque, des quotas d'utilisation sont appliqués par usager et par jour également en fonction de leur niveau.</p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>l'accès au WIFI est désormais disponible à la bibliothèque</h4>
          <p style={{ lineHeight: 1.7 }}>La consultation d’Internet est libre et gratuite. Elle est régie par une charte qui en définit l’utilisation. Les usagers doivent posséder une carte de lecteur ou de consultation ou être accompagnés d’un adulte pour y accéder. Les conditions d'accès et d'utilisation Toutes les fonctionnalités d'Internet sont accessibles mais, dans le souci de respecter les missions qui incombent aux bibliothèques, l'usage de la discussion en ligne (Chat) et de la messagerie est seulement toléré. En cas d'abus, la bibliothèque se réserve le droit de suspendre la connexion.</p>
          <p style={{ lineHeight: 1.7 }}>Le téléchargement et l'enregistrement de données sur disque dur ou disquette ne sont pas autorisés pour des raisons techniques liées à la gestion du réseau.<br/>Il est interdit de pénétrer dans des systèmes autres que ceux dont l'accès est prévu, d'entraver le système, de porter atteinte aux données et de tenter d'accéder au disque dur. La loi du 1er juillet 1992 relative à la propriété intellectuelle réprime la contrefaçon de logiciels.</p>
          <p style={{ lineHeight: 1.7 }}>Pour les moins de 18 ans, la consultation d'Internet est réservée aux détenteurs d'une carte d'abonnement à la Bibliothèque.<br/>La Bibliothèque Centrale de l'Université de Yaoundé 1 propose à présent un accès Wi-Fi (Internet sans fil). Dans les zones couvertes par ce réseau, vous pouvez donc travailler sur votre ordinateur portable tout en disposant d'un accès à Internet (à condition que votre portable dispose d'une connexion Wi-Fi).</p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Se connecter au réseau Wi-Fi</h4>
          <p style={{ lineHeight: 1.7 }}>Afin que votre portable puisse se connecter à Internet via le réseau Wi-Fi, il doit disposer des connexions nécessaires (support Wi-Fi intégré ou carte Wi-Fi supplémentaire). Les portables ne disposant pas de connexion Wi-Fi ne pourront se connecter au réseau dans les Bibliothèques. Si le support Wi-Fi de votre portable est activé, celui-ci détectera automatiquement le réseau sans fil "NETWORK_UY1" disponible à la bibliothèque et dans le campus. Attention : une authentification est nécessaire pour accéder à Internet. Cette authentification se fait sur base des login et mot de passe. La connexion WiFi disponible à la Bibliothèque et sur le campus de l'Université en général est gérée par le service réseau de l'Université (Resbcuy1) et le CUTI. En cas de problème, veuillez contacter directement Resbcuy1 ou le Cuti par e-mail ou par téléphone.</p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Sécurité informatique</h4>
          <p style={{ lineHeight: 1.7 }}>La sécurité informatique de votre matériel repose entièrement sur vous. Nous vous conseillons donc vivement d'équiper votre ordinateur des protections nécessaires contre les virus, intrusions et autres programmes espions.</p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Charte de l'utilisateur du réseau et du site web de la Bibliothèque</h4>
          <p style={{ lineHeight: 1.7 }}>Les membres de la communauté universitaire entendent réaffirmer, par le présent document, leur souci de n'utiliser les nouvelles techniques de l'information... <a href="#" style={{ color: 'var(--or)', fontWeight: 600 }}>Lire la suite</a></p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Alimentation électrique</h4>
          <p style={{ lineHeight: 1.7 }}>Vous êtes autorisés à raccorder votre PC à l'alimentation électrique, dans la mesure des prises disponibles. Ceci ne doit cependant pas être une source de gêne ou de danger pour les autres utilisateurs de la bibliothèque. Il est ainsi interdit de débrancher les ordinateurs publics ou d'autres appareils, de tendre des câbles en travers des passages et dans tous les endroits où ils seraient incommodes ou dangereux. Merci de respecter les instructions que pourraient vous donner les membres du personnel.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 20 }}>
            <div><img src={wifiImage} alt="WiFi 1" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius)' }} /></div>
            <div><img src={wifiImage2} alt="WiFi 2" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius)' }} /></div>
          </div>
        </div>
      )
    },
    reliure: {
      title: 'Service reliure',
      icon: '📋',
      desc: 'Le service de reliure propose plusieurs types de reliures pour vos mémoires, thèses et documents. Service rapide et professionnel.',
      details: [
        'Reliure thermique (couverture rigide)',
        'Reliure spirale plastique',
        'Reliure spirale métallique',
        'Reliure manuelle et dos carré collé',
        'Délai standard : 24 à 48h ouvrées',
      ],
      hours: '08h00 – 17h00 (Lun–Ven)',
      content: (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 22, color: 'var(--bleu-nuit)', marginBottom: 12 }}>Atélier de reluire à la Bibliothèque Centrale de l'UYI!</h3>
          <p style={{ lineHeight: 1.7 }}>La section reluire et équipée d'un atelier en charge de protéger le livre, d'augmenter sa stabilité et sa durée de vie.</p>
          <p style={{ lineHeight: 1.7 }}>Il existe deux types de reliure :</p>
          <ul style={{ lineHeight: 1.7, paddingLeft: 20 }}>
            <li>la reliure courante, travail sobre en toile, en caron ou en cuir et qui ne fait pas appel à la créativité. Ce type de reliure s’adresse à tous</li>
            <li>la reliure d'art ou de création s'adresse essentiellement aux particuliers, bibliophiles, et collectionneurs. La reliure d'art représente une partie de la reliure artisanale, elle s'applique à des ouvrages précieux et le plus souvent à des exemplaires uniques.</li>
          </ul>
          <p style={{ lineHeight: 1.7 }}>Si vous avez des documents à relier, plusieurs possibilités s'offrent à vous selon le type de document et sa destination.<br/>Notre vocation est de vous aider à faire le tri entre les différentes méthodes de reliure et les différentes machines à relier utilisables en fonction de vos besoins.</p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>La reliure manuelle sans machine</h4>
          <p style={{ lineHeight: 1.7 }}>Vous pouvez déjà relier des documents au format A4 sans perforation ni machines : Grâce aux baquettes à relier Relido. On n'y pense pas forcément, mais c'est le système le plus simple, le plus rapide et le moins cher pour relier des documents de 2 à 130 feuilles. Ces baguettes coulissantes sont équipée d'un coin arrondi qui facilite l’insertion des feuilles.Cette méthode convient parfaitement aux dossiers qui ne doivent pas être manipulés trop souvent, ce type de reliure étant un peu moins solide que la reliure mécanique ou thermique.</p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>La reliure mécanique avec machine</h4>
          <p style={{ lineHeight: 1.7 }}>Ensuite vous pouvez relier vos documents selon le principe de la reliure mécanique (une perforation suivie du montage d'une reliure) en choisissant la reliure par anneaux plastique, la reliure par anneau métallique ou encore la reliure par spirale plastique ou spirale métallique. Les reliures par anneaux plastiques et métalliques peuvent être réalisées soit par une perforelieuse spécifique, soit par un perforelieur multifonctions (qui combinent les deux systèmes de reliure).</p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>La reliure par Anneau plastique</h4>
          <p style={{ lineHeight: 1.7 }}>La reliure par anneau plastique 21 trous (Pas américain) est incontestablement la plus utilisée, tant pour sa simplicité que pour son excellent rapport qualité/prix. Cette méthode de reliure mécanique nécessite d'utiliser une perforelieuse anneau plastique (ou multifonctions) pour perforer les feuilles avant de les relier avec des baguettes (peignes) anneaux plastiques de différents diamètres (selon l'épaisseur) et couleurs.</p>

          <h4 style={{ fontWeight: 700, marginTop: 20 }}>La reliure thermique (thermoreliure)</h4>
          <p style={{ lineHeight: 1.7 }}>Le système de thermo-reliure (appelé aussi reliure thermique), consiste à coller à chaud du papier dans des chemises dont le dos cartonné est pré-collé. On obtient ainsi des dossiers, des mémoires et des thèses de haute qualité, qui ont l'apparence d'un livre à couverture souple, le tout impeccablement relié en quelques secondes.</p>
        </div>
      )
    },
    mediation: {
      title: 'Médiation documentaire',
      icon: '🤝',
      desc: 'Le service de médiation aide les usagers à optimiser leur recherche documentaire et à exploiter au mieux les ressources de la bibliothèque.',
      details: [
        'Assistance à la recherche bibliographique',
        'Aide à l\'utilisation du catalogue PMB',
        'Initiation aux bases de données en ligne',
        'Rédaction de bibliographies',
        'Rendez-vous individuels sur réservation',
      ],
      hours: '09h00 – 17h00 (Lun–Ven) — Sur rendez-vous',
    },
    formation: {
      title: 'Formation documentaire',
      icon: '🎓',
      desc: 'Formations collectives et individuelles à la maîtrise de l\'information scientifique, organisées tout au long de l\'année universitaire.',
      details: [
        'Formation L1-L2 : Introduction à la bibliothèque (2h)',
        'Formation Master : Méthodologie de la recherche (4h)',
        'Atelier : Rédiger une bibliographie normalisée',
        'Atelier : Utiliser Research4Life et les bases données',
        'Chaque jeudi à 14h00 — Salle B12',
      ],
      hours: 'Jeudi 14h00 (session libre) + sessions programmées',
      content: (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 22, color: 'var(--bleu-nuit)', marginBottom: 12 }}>Produits documentaires de la Bibliothèque Centrale de l'UYI!</h3>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Produits documentaires</h4>
          <p style={{ lineHeight: 1.7 }}>Afin de répondre au mieux à vos besoins d’information, la bibliothèque centrale de l'Université de Yaoundé I élabore pour vous, des produits documentaires.<br/>Ce besoin d’information peut être exprimé directement par le public auprès de la bibliothèque ou repéré par elle-même. En réalisant des produits documentaires, la BC-UYI s’inscrit aussi dans cette logique de répondre aux besoins informationnels de ses usagers et de la communauté en s'imposant une démarche qualité rigoureuse.<br/>Un produit documentaire peut s'entendre comme un Document secondaire ou tertiaire, conçu pour répondre à des besoins d'information, sous des formes diverses : bibliographie, bulletin bibliographique ou de liaison, bulletin de sommaires, dossier documentaire, dossier de presse, DSI, revue de presse, état de la question, synthèse documentaire, etc.</p>
          
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Quelques Produits documentaires réalisés à la BC-UYI</h4>
          <ul style={{ lineHeight: 1.7, paddingLeft: 20 }}>
            <li style={{ marginBottom: 10 }}><strong>Dossier documentaire :</strong> "Produit documentaire constitué d'un ensemble de documents de sources diverse, choisis et réunis sur une question donnée, et organisé de façon à faciliter l'accès à l'information rassemblée. Les éléments qui le composent peuvent être de nature et de support très variés : photographies, articles de revues, brochures, etc. Il peut donner lieu à des mises à jour régulières au fur et à mesure de la parution de nouvelles informations ; sa durée de vie est limitée dans le temps. Il peut être constitué ponctuellement à la demande ou systématiquement sur des thèmes précis. Un dossier documentaire peut être sur support papier ou électronique"</li>
            <li style={{ marginBottom: 10 }}><strong>Bibliographie :</strong> "Liste de notices bibliographiques classées selon certains critères pour en permettre le repérage. Elle peut parfois indiquer la localisation des documents recensés. Elle peut être : signalétique (titre, auteurs, etc.) ou analytique (avec un résumé) ; actuelle ou rétrospective ; exhaustive ou sélective. Une bibliographie peut se présenter soit sous la forme d'un document autonome (" répertoire bibliographique "), soit sous la forme d'une annexe à un document ou à une partie de document (elle est alors dite " bibliographie cachée "). Sur le modèle de bibliographie, avec le suffixe " graphie ", on peut composer un certain nombre de termes désignant des répertoires propres à un type de documents : disques (discographie), films (filmographie), etc"</li>
            <li style={{ marginBottom: 10 }}><strong>Lettre d'information électronique :</strong> "Publication périodique, sur tout support, de faible volume, diffusant en primeur des informations à des abonnés ou à un public préférentiel [par voie internet]. "</li>
            <li style={{ marginBottom: 10 }}><strong>Bulletin/lettre d'information :</strong> "Revue éditée par une association, une administration ou un organisme. "</li>
            <li style={{ marginBottom: 10 }}><strong>Repertoire :</strong> "Liste présentant des informations, quel qu'en soit le support, classées par ordre alphabétique, numérique, chronologique ou systématique pour l'identification, la description ou la localisation de personnes, de documents, d'organismes, de lieux, de ressources Internet ou d'objets. Aussi appelé catalogue ou, en informatique, dossier."</li>
            <li style={{ marginBottom: 10 }}><strong>Produit de veille: blog :</strong> "Espace individuel d’expression, créé pour délivrer des informations diverses et/ou donner la parole à tous les internautes sur une thématique particulière (la veille documentaire par exemple)."</li>
            <li style={{ marginBottom: 10 }}><strong>Panorama de presse :</strong> "Produit documentaire à parution périodique (quotidien, hebdomadaire) constitué d'un ensemble d'extraits de presse, sur support papier ou électronique. Il peut porter sur l'actualité d'un secteur ou d'un domaine, sur une manifestation, sur l'image d'un organisme à travers la presse. Il peut être diffusé sous forme de dossier, de bulletin, ou exposé sur des panneaux."</li>
            <li style={{ marginBottom: 10 }}><strong>Catalogue :</strong> "Liste ordonnée de notices d'objets ou de documents (notice bibliographique, notice catalographique) d'une collection permanente ou temporaire, réelle ou fictive, constituant un instrument de recherche (identification et localisation de documents) et de gestion pour les utilisateurs. Un catalogue peut être consultable sur différents supports_: fiches papier, catalogues imprimés, microforme, banque de données informatisée quel que soit son accès. L'ordonnancement ou l'accès peut être_: chronologique ; topographique (par ordre de classement sur les rayons ou de cote de rangement) ; systématique ou alphabétique par titre, par auteur (catalogue-auteurs) ou par matière (catalogue- matières, catalogue-sujets). "</li>
            <li style={{ marginBottom: 10 }}><strong>Bulletin d'acquisition :</strong> "Bulletin à parution périodique contenant une bibliographie signalétique ou analytique des dernières acquisitions d'un centre documentaire ou du dépouillement des dernières revues reçues."</li>
            <li style={{ marginBottom: 10 }}><strong>Synthèse documentaire :</strong> "Produit documentaire se présentant sous différentes formes (texte, exposé oral, image, panneaux d'exposition, etc.) et nécessitant la constitution d'un corpus d'informations écrites, orales ou audiovisuelles, l'analyse, la condensation et la reformulation des informations contenues dans ce corpus, et leur mise en forme en un tout original et cohérent."</li>
          </ul>
        </div>
      )
    },
"""

import re
content = re.sub(r"consultation:\s*\{.*?hours:\s*\'[^\']+\',\s*\},[\s\S]*?formation:\s*\{.*?hours:\s*\'[^\']+\',\s*\},", services_addition, content, flags=re.DOTALL)

# Insert the {s.content} correctly in ServicesPage
content = content.replace(
    '''<Link to="/contact" className="btn btn-bleu">Nous contacter pour plus d'informations</Link>
        </div>
      </div>
    </Layout>''',
    '''<Link to="/contact" className="btn btn-bleu">Nous contacter pour plus d'informations</Link>
        </div>
        {s.content && (
          <div style={{ marginTop: 40, paddingTop: 40, borderTop: '1px solid var(--border)' }}>
            {s.content}
          </div>
        )}
      </div>
    </Layout>'''
)

# 2. Update PresentationPage
presentation_hist = """
        <div style={{ marginTop: 60, padding: 32, background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 22, color: 'var(--bleu-nuit)', marginBottom: 16 }}>Bienvenu à la Bibliothèque Centrale de l'UYI!</h3>
          <h4 style={{ fontWeight: 700, marginTop: 20 }}>Historique</h4>
          <p style={{ lineHeight: 1.7, marginBottom: 12 }}>créée par décret n° 62/DFD/289 du 26/07/1962, l’Université Fédérale du Cameroun (UFC) trouve son origine dans le décret n° 61/55 du 25 Avril 1961 qui crée l’Institut National des Etudes Universitaires (INEU) sur la route d’Akonolinga. Elle emprunte des locaux forces Armées et à l’Ecole Camerounaise d’Administration. Sa bibliothèque fonctionne de manière très embryonnaire, sans véritable structuration.</p>
          <p style={{ lineHeight: 1.7, marginBottom: 12 }}>Avec l’accroissement des effectifs, l’Université dispose de ses propres locaux dans l’enceinte du Lycée Leclerc. Le décret n° 62/DF/289 du 26 Juillet 1962 qui crée l’UFC, lui accorde par celui n° 62/DF/372 tous les établissements d’enseignement supérieur existant et à créer. Dès 1965, les facultés, la chancellerie, la bibliothèque centrale,la résidence des étudiants, les installations sportives rejoignent progressivement le campus de Ngoa-Ekele su le plateau Atemengue, essentiellement financé par le Fond d’Aide à la Coopération (FAC).</p>
          <p style={{ lineHeight: 1.7, marginBottom: 12 }}>C’est en 1967 que la bibliothèque financée par la Fondation Française de l’Enseignement Supérieur au Cameroun rejoint effectivement l’enceinte de Ngoa-Ekele avec une superficie de 12000m², 360 places assises, un fonds de 47000ouvrages et 819 périodiques. 1967 marque une étape charnière dans le développement de la recherche à l’université. Les premières annales (Annales de la Faculté des Sciences) , les premiers résultats des recherches entreprises par le corps enseignant sont diffusés. Les primes de recherche sont instituées.</p>
          <p style={{ lineHeight: 1.7, marginBottom: 12 }}>Dès Janvier 1968 la bibliothèque publie ses premières listes des acquisitions et en 1980, elle dispose d’un fonds de 100000 ouvrages. L’organisation administrative primitive lui accorde le 3°rang après le Secrétariat Général et l’intendance. Son organisation administrative comprend le service d’acquisition le service des périodiques. Elle ouvre ses portes de 08h à 12h et de 14h30 à 22h tous les jours ouvrables et ferme le samedi à 17h30.</p>
          
          <h4 style={{ fontWeight: 700, marginTop: 30 }}>les différents responsables</h4>
          <p style={{ lineHeight: 1.7, marginBottom: 8 }}>Elle est successivement administrée par :</p>
          <ul style={{ lineHeight: 1.7, paddingLeft: 20, marginBottom: 16 }}>
            <li>Le Professeur MBEDE enseignant, 1963-1966 ;</li>
            <li>Madame Michel conservateur, 1967-1969 ;</li>
            <li>Mademoiselle DANJOU bibliothècaire, 1969-1971 ;</li>
            <li>Mademoiselle Françoise MAHIEU conservateur assistée de mademoiselle Laurence PERRON bibliothècaire, 1971-1974;</li>
            <li>Peter CHATEH NKANGANFACK conservateur, 1974-1994 fut le premier camerounais à administrer réellement la bibliothèque; De 1983 à 1992, la bibliothèque bénéficie d’une extension pour devenir, suite au décret au décret n°93/026 du 19 Janvier 1993 qui crée les universités d’Etat au Cameroun, Bibliothèque Centrale de l’Université de Yaoundé 1 (BCUY1); Peter CHATEH NKANGANFACK modifie les horaires et ouvre le lundi à 10h et ferme le samedi à 17h.</li>
          </ul>
          <p style={{ lineHeight: 1.7, marginBottom: 8 }}>La BCUY1 voit défiler à sa tête :</p>
          <ul style={{ lineHeight: 1.7, paddingLeft: 20 }}>
            <li>Peter CHATEH NKANGANFACK , 1974-1994 ;</li>
            <li>NEGAH Jacques assure l’intérim de 1994 à 1999 ;</li>
            <li>Dr Alexis EYANGO MOUEN , Août 1999-Juin 2013 ;</li>
            <li>Dr ESSI Marie José , du O3 Juillet 2013 à nos jours.</li>
          </ul>
        </div>
"""
content = content.replace(
    '''          ))}
        </div>
      </div>
    </Layout>''',
    '''          ))}
        </div>''' + presentation_hist + '''      </div>
    </Layout>'''
)

# 3. Update RessourcesPage
ressources_table = """
        <div style={{ marginTop: 60, padding: 32, background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Les périodiques électroniques accessibles à la BC-UYI</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--beige)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>Disciplines</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>Liens</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>Commentaires</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>Périodiques de santé et de Médecine</td>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border)', verticalAlign: 'top', lineHeight: 1.8 }}>
                    <a href="http://www.who.int/bulletin" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://www.who.int/bulletin</a><br/>
                    <a href="http://www.pathexo.fr/1301-presentation-bulletin.html" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://www.pathexo.fr/...</a><br/>
                    <a href="http://www.hsd-fmsb.org" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://www.hsd-fmsb.org</a><br/>
                    <a href="http://www.nejm.org" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://www.nejm.org</a><br/>
                    <a href="http://www.panafrican-med-journal.com" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://www.panafrican-med-journal.com</a>
                  </td>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border)', verticalAlign: 'top', lineHeight: 1.8 }}>
                    Bulletin OMS<br/>
                    Bulletin de la SPE<br/>
                    Health sciences and didease<br/>
                    The new England Journal of Medicine<br/>
                    The Pan African Medical Journal
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>Sciences de l'information de la communication et de la documentation</td>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border)', verticalAlign: 'top', lineHeight: 1.8 }}>
                    <a href="http://www.archimag.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://www.archimag.com/</a><br/>
                    <a href="http://www.asis.org/bulletin.html" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://www.asis.org/bulletin.html</a><br/>
                    <a href="http://www.adbs.fr/documentaliste-sciences-de-l-information-136069.htm" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://www.adbs.fr/...</a><br/>
                    <a href="http://communication.revues.org" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://communication.revues.org</a><br/>
                    <a href="http://www.enssib.fr/bibliotheque-numerique/documents/" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://www.enssib.fr/...</a><br/>
                    <a href="http://ressi.ch/" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://ressi.ch/</a><br/>
                    <a href="http://edc.revues.org" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://edc.revues.org</a><br/>
                    <a href="http://communicationorganisation.revues.org" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://communicationorganisation...</a><br/>
                    <a href="http://www.livreshebdo.fr" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://www.livreshebdo.fr</a><br/>
                    <a href="http://www.cairn.info/revue-document-numerique.htm" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>http://www.cairn.info/...</a><br/>
                    <a href="https://documentation.erudit.org/" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>https://documentation.erudit.org/</a>
                  </td>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border)', verticalAlign: 'top', lineHeight: 1.8 }}>
                    Magazine des professionnels de l'information<br/>
                    The bulletin of the association for information science and technology<br/>
                    Documentaliste-sciences de l’information<br/>
                    Communication<br/>
                    Revue de l’enssib<br/>
                    RESSI : Revue électronique Suisse des sciences de l’information<br/>
                    Etudes de communication : langages, information<br/>
                    La revue communication et organisation<br/>
                    Livres hebdo : magazine des professionnels du livre-édition, bibliothèque<br/>
                    Revue document numérique<br/>
                    Documentation et bibliothèques
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>Mathématiques</td>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border)', verticalAlign: 'top', lineHeight: 1.8 }}>
                    <a href="#" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>Liste des journaux scientifiques en mathématiques - Wikipédia</a><br/>
                    <a href="#" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>Catégorie:Revue de mathématiques — Wikipédia</a><br/>
                    <a href="#" target="_blank" rel="noreferrer" style={{ color: 'var(--or)' }}>Journal de Mathématiques Pures et Appliquées - Elsevier</a>
                  </td>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border)', verticalAlign: 'top', lineHeight: 1.8 }}>
                    Liste (incomplète) de revues scientifiques, qui publient des articles dans le domaine des mathématiques
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" style={{ padding: 12, borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--bleu-nuit)', background: 'var(--beige)' }}>
                    Chimie et bois / Sciences de l'éducation / Sports et Jeunesse /Sciences Humaines /Sciences polytechniques/ Biologie /Arts et lettres / Environnement et Agricultutre
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
"""
content = content.replace(
    '''          ))}
        </div>
      </div>
    </Layout>''',
    '''          ))}
        </div>''' + ressources_table + '''      </div>
    </Layout>'''
)

# 4. Update ThesesPage
theses_addition = """
        <div style={{ marginTop: 60, textAlign: 'left', padding: 32, background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: 'var(--bleu-nuit)' }}>Thèses et mémoires disponibles à la Bibliothèque Centrale de l'UYI!</h3>
          
          <h4 style={{ fontWeight: 700, marginTop: 24, fontSize: 18 }}>Catalogue des thèses et mémoires de l'Université de Yaoundé I</h4>
          <p style={{ lineHeight: 1.7 }}>Notre catalogue comporte une base de données bibliographiques des mémoires et thèses soutenus dans les différentes filères des facultés de notre université ces mémoires et thèses sont consultables en ligne. <Link to="/catalogue" style={{ color: 'var(--or)', fontWeight: 600 }}>Consulter les thèses</Link></p>
          
          <h4 style={{ fontWeight: 700, marginTop: 24, fontSize: 18 }}>Répertoire des Thèses de Doctorat de l'UYI de 2000 à 2012</h4>
          <p style={{ lineHeight: 1.7 }}>La bibliothèque Centrale dispose d'un répertoire collectif des Thèses de doctorat soutenues à l'Université de Yaoundé de 2000 à 2012. Ces thèses sont accessibles directement dans les différentes facuktés de l'Université <a href="#" style={{ color: 'var(--or)', fontWeight: 600 }}>Télécharger le répertoire</a></p>
          
          <h4 style={{ fontWeight: 700, marginTop: 24, fontSize: 18 }}>Archive ouverte de HAL</h4>
          <p style={{ lineHeight: 1.7 }}>L'archive ouverte pluridisciplinaire HAL, est destinée au dépôt et à la diffusion d'articles scientifiques de niveau recherche, publiés ou non, et de thèses, émanant des établissements d'enseignement et de recherche français ou étrangers, des laboratoires publics ou privés. <a href="#" style={{ color: 'var(--or)', fontWeight: 600 }}>Consulter l'archive</a></p>
          
          <h4 style={{ fontWeight: 700, marginTop: 24, fontSize: 18 }}>Serveur de thèses multidisciplinaires</h4>
          <p style={{ lineHeight: 1.7 }}>Le serveur TEL (thèses-en-ligne) a pour objectif de promouvoir l'auto-archivage en ligne des thèses de doctorat et habilitations à diriger des recherches (HDR), qui sont des documents importants pour la communication scientifique entre chercheurs. TEL est un environnement particulier de HAL et permet donc, comme HAL, de rendre rapidement et gratuitement disponibles des documents scientifiques, mais en se spécialisant aux thèses de doctorat et HDR. <a href="#" style={{ color: 'var(--or)', fontWeight: 600 }}>Consulter les thèses de Tel</a></p>
          
          <h4 style={{ fontWeight: 700, marginTop: 24, fontSize: 18 }}>Les signets de la BNF</h4>
          <p style={{ lineHeight: 1.7 }}>Les signets de la BNF offre un répertoire de ressources documentaires sur les thèses et les mémoires des grandes écoles de France <a href="#" style={{ color: 'var(--or)', fontWeight: 600 }}>Consulter les signets</a></p>
        </div>
"""
content = content.replace(
    '''          <Link to="/catalogue?type=memoire" className="btn btn-outline-white btn-lg" style={{ background: 'var(--bleu-nuit)', color: 'white', border: '2px solid var(--or)' }}>📄 Parcourir les mémoires</Link>
        </div>
      </div>
    </Layout>''',
    '''          <Link to="/catalogue?type=memoire" className="btn btn-outline-white btn-lg" style={{ background: 'var(--bleu-nuit)', color: 'white', border: '2px solid var(--or)' }}>📄 Parcourir les mémoires</Link>
        </div>''' + theses_addition + '''      </div>
    </Layout>'''
)

# 5. Append CoordinationPage, SectionsPage, PolitiquePage
new_pages = """

export function CoordinationPage() {
  return (
    <Layout>
      <div style={{ background: 'var(--bleu-nuit)', padding: '48px 0 32px' }}>
        <div className="container">
          <h1 className="font-serif" style={{ fontSize: 40, color: 'white', fontWeight: 400, marginBottom: 8 }}>
            La <span style={{ color: 'var(--or)' }}>Coordination</span>
          </h1>
        </div>
      </div>
      <div className="container-sm" style={{ padding: '56px 24px' }}>
        <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 32 }}>
          <p style={{ lineHeight: 1.7, marginBottom: 16 }}>Suite à son réaménagement et sa nouvelle orientation stratégique, la Bibliothèque Centrale a procédé à une réorganisation structurelle pour lui permettre de remplir convenablement ses nouvelles missions.</p>
          <p style={{ lineHeight: 1.7, marginBottom: 16 }}>La Coordination comporte à sa tête Pr Marie-José ESSI.</p>
          <p style={{ lineHeight: 1.7, marginBottom: 8 }}>Elle compte quatre(04) sections à savoir :</p>
          <ul style={{ lineHeight: 1.7, paddingLeft: 20, marginBottom: 24 }}>
            <li><strong>La Section Planification:</strong> elle s’occupe du management et de la coordination des projets initiés au sein des autres départements ;</li>
            <li><strong>La Section relations institutionnelles :</strong> elle s’occupe d’établir les relations avec d’autres institutions diverses et par là promouvoir la constitution du dépôt institutionnel ;</li>
            <li><strong>Section en charge de COCUREL :</strong> elle définie les orientations pour la mutualisation des ressources des bibliothèques de l'UYI</li>
            <li><strong>La Section du suivi du programme:</strong> elle veille au suivi et à la coordination des activités de la bibliothèque.</li>
          </ul>
          
          <div style={{ marginTop: 40, paddingTop: 30, borderTop: '1px solid var(--border)' }}>
            <h4 style={{ fontWeight: 700, fontSize: 18, color: 'var(--bleu-nuit)' }}>Planification</h4>
            <p style={{ lineHeight: 1.7, marginTop: 8 }}>La Planification est assurée par Pr Marie-José ESSI</p>
            
            <h4 style={{ fontWeight: 700, fontSize: 18, color: 'var(--bleu-nuit)', marginTop: 24 }}>Section Relations Institutionnelles</h4>
            <p style={{ lineHeight: 1.7, marginTop: 8 }}>La Section Relations institutionnelles est coordonnée par Mme Bawack Roseline</p>
            
            <h4 style={{ fontWeight: 700, fontSize: 18, color: 'var(--bleu-nuit)', marginTop: 24 }}>Section COCUREL</h4>
            <p style={{ lineHeight: 1.7, marginTop: 8 }}>La Section COCUREL est coordonnée par Mme Léonie Virago Kenne. et comporte les Unités suivantes:</p>
            
            <h4 style={{ fontWeight: 700, fontSize: 18, color: 'var(--bleu-nuit)', marginTop: 24 }}>Suivi du programme</h4>
            <p style={{ lineHeight: 1.7, marginTop: 8 }}>Suivi du programme est assuré par Mme Péguy TASSAPO POUOKAM</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function SectionsPage() {
  return (
    <Layout>
      <div style={{ background: 'var(--bleu-nuit)', padding: '48px 0 32px' }}>
        <div className="container">
          <h1 className="font-serif" style={{ fontSize: 40, color: 'white', fontWeight: 400, marginBottom: 8 }}>
            Sections de <span style={{ color: 'var(--or)' }}>Bibliothèque</span>
          </h1>
        </div>
      </div>
      <div className="container-sm" style={{ padding: '56px 24px' }}>
        <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 32 }}>
          <h3 style={{ fontSize: 24, color: 'var(--bleu-nuit)', marginBottom: 16 }}>Les sections de la Coordination de la BC-UYI</h3>
          <p style={{ lineHeight: 1.7, marginBottom: 24 }}>Pour une meilleure efficacité dans l'offre des services aux usagers, la BC-UYI s'est réorganisée en Départements et chaque Départements est composé de plusieurs sections avec des missions précises qui ne visent qu'un seul objectif: améliorer la qualité d'offre de service à toute la communauté universitaire et faire de la Bibliothèque un pôle d'excellence.</p>
          
          <div style={{ padding: 24, background: 'var(--beige)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ fontWeight: 700, fontSize: 20, color: 'var(--bleu-nuit)', marginBottom: 16 }}>Coordination</h4>
            
            <h5 style={{ fontWeight: 700, fontSize: 16, marginTop: 16 }}>Planification</h5>
            <p style={{ lineHeight: 1.7 }}>La Planification est assurée par Pr Marie-José ESSI</p>

            <h5 style={{ fontWeight: 700, fontSize: 16, marginTop: 16 }}>Section Relations Institutionnelles</h5>
            <p style={{ lineHeight: 1.7 }}>La Section Relations institutionnelles est coordonnée par Mme.Bawack Roseline</p>

            <h5 style={{ fontWeight: 700, fontSize: 16, marginTop: 16 }}>Section COCUREL</h5>
            <p style={{ lineHeight: 1.7 }}>La Section Mutualisation des BU est coordonnée par Mme Léonie Virago Kenne.</p>

            <h5 style={{ fontWeight: 700, fontSize: 16, marginTop: 16 }}>Section Suivi du Programme</h5>
            <p style={{ lineHeight: 1.7 }}>Le Suivi du programme est assuré par Mme Péguy TASSAPO POUOKAM</p>
          </div>
          
          <p style={{ marginTop: 24, fontWeight: 600, color: 'var(--or)' }}>Accéder aux autres Sections: &gt;&gt; 1 2 3 4 5 6 &gt;&gt;</p>
        </div>
      </div>
    </Layout>
  );
}

export function PolitiquePage() {
  return (
    <Layout>
      <div style={{ background: 'var(--bleu-nuit)', padding: '48px 0 32px' }}>
        <div className="container">
          <h1 className="font-serif" style={{ fontSize: 40, color: 'white', fontWeight: 400, marginBottom: 8 }}>
            Politique <span style={{ color: 'var(--or)' }}>Documentaire</span>
          </h1>
        </div>
      </div>
      <div className="container-sm" style={{ padding: '56px 24px' }}>
        <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 32 }}>
          <h3 style={{ fontSize: 24, color: 'var(--bleu-nuit)', marginBottom: 16 }}>Politique Documentaire de la Bibliothèque Centrale de l'UYI!</h3>
          <p style={{ lineHeight: 1.7, marginBottom: 24 }}>La charte documentaire de la BC-UYI vise à garantir l’adéquation de l’action universitaire, en conformité avec les orientations académiques et de recherche. Elle délimite clairement les compétences et le rayon d’action des bibliothèques de l’Université et définie les grands axes de l’offre documentaire sur différents supports et les nouveaux services en réponses aux besoins des usagers. Elle correspond à la lisibilité, visibilité et accessibilité des collections, explicite la façon dont les bibliothèques de notre institution entendent garantir la meilleure adéquation entre leurs actions et les besoins des usagers. Sont aussi décrites les principales articulations entre les collections, publics, les services documentaires locaux.</p>

          <h4 style={{ fontWeight: 700, marginTop: 32, fontSize: 18 }}>Lignes directrices des la politique documentaire de la BC-UYI</h4>
          <p style={{ lineHeight: 1.7, marginBottom: 8 }}>Au regard de ces différents éléments les grands axes de la politique de la BC-UYI apparaissent clairement :</p>
          <ul style={{ lineHeight: 1.7, paddingLeft: 20, marginBottom: 24 }}>
            <li>Mettre à la disposition de la communauté universitaire de l’Université de Yaoundé I une documentation de qualité adaptée à ses besoins ;</li>
            <li>Faciliter l’accès à cette documentation en formant les utilisateurs à la recherche documentaire, dans une perspective de formation tout au long de la vie ;</li>
            <li>Développer le parc informatique et l’offre en documentation électronique ;</li>
            <li>Soutenir activement la recherche à l’Université de Yaoundé I ;</li>
            <li>S’insérer dans un réseau documentaire de plus en plus dense en cherchant à développer des partenariats locaux, nationaux et internationaux afin d’élargir les services rendus aux publics et faire connaître ses collections et son savoir-faire ;</li>
            <li>Participer à la vie du campus et à l’action culturelle universitaire.</li>
          </ul>
          <p style={{ marginBottom: 32 }}><a href="#" className="btn btn-outline-white" style={{ borderColor: 'var(--border)', color: 'var(--bleu-nuit)' }}>📄 Consulter notre Politique Documentaire ici</a></p>

          <div style={{ padding: 24, background: 'var(--beige)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ fontWeight: 700, fontSize: 18, color: 'var(--bleu-nuit)' }}>Consultation des ouvrages</h4>
            <p style={{ lineHeight: 1.7, marginTop: 8 }}>La Bibliothèque Centrale de l'UYI dispose un important fonds documentaire constitué de monographies, mémoires et thèses, journaux et ressources numériques disponibles dans son catalogue informatisé.<br/>Des journaux de différents pays et des périodiques imprimés (revues & annales) qu'il est possible de consulter sur place dans un espace convivial. Toutes ces ressources sont consultables dans notre catalogue informatisé.<br/><Link to="/catalogue" style={{ color: 'var(--or)', fontWeight: 600 }}>Consulter notre catalogue</Link></p>
            
            <h4 style={{ fontWeight: 700, fontSize: 18, color: 'var(--bleu-nuit)', marginTop: 24 }}>Quelques Bases de données de ressources accessibles via le portail de la BC-UYI</h4>
            <ul style={{ lineHeight: 1.7, paddingLeft: 20, marginTop: 8 }}>
              <li>Base de données des documents numériques de la BC-UYI</li>
              <li>Base de données des données bibliographiques disponibles à la BC-UYI</li>
              <li>Base de données du programme HINARI disponibles à la BC-UYI</li>
              <li>Les ressources d'EIFL.net pour le Cameroun disponibles à la BC-UYI</li>
            </ul>

            <h4 style={{ fontWeight: 700, fontSize: 18, color: 'var(--bleu-nuit)', marginTop: 24 }}>Consultation des Mémoires et Thèses</h4>
            <p style={{ lineHeight: 1.7, marginTop: 8 }}>La Bibliothèque Centrale de l'UYI reçoit des mémoires et thèses soutenus dans les différents département et Ecole de l'Université de Yaoundé I. Par ailleurs chaque grandes école dispose d'un répertoire de mémoires et thèses accessibles via leur site web.<br/><Link to="/theses" style={{ color: 'var(--or)', fontWeight: 600 }}>Consulter les mémoires et thèses disponibles à la BC-UYI</Link></p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
"""

content = content + new_pages

with open(file_path, 'w') as f:
    f.write(content)

print("StaticPages.jsx updated.")
