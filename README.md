# Portail BCU UYI

Portail de la Bibliothèque Centrale de l'Université de Yaoundé I.

## Stack

- **Frontend** : React + Vite + Nginx
- **Backend** : Django + DRF + PostgreSQL
- **Docker** : Docker Compose

## Lancement

```bash
docker compose up -d
Frontend : http://localhost

Backend API : http://localhost:8000/api/

Admin Django : http://localhost:8000/admin/

Swagger : http://localhost:8000/api/schema/swagger-ui/
```

## Fonds physique des mémoires et thèses

Le classeur Excel du fonds physique est monté dans le conteneur backend sous
`/app/Documents`. La variable `PHYSICAL_ARCHIVE_FILES` de `docker-compose.yml`
indique les fichiers `.xlsx` ou `.csv` à importer. Après les migrations, le
conteneur importe ces sources au démarrage ; chaque source est suivie par
feuille et numéro de ligne, de sorte qu'un nouvel import actualise ses notices
sans effacer celles provenant d'autres fichiers.

Pour valider manuellement le classeur depuis le conteneur backend démarré,
sans écrire en base :

```bash
docker compose exec backend python manage.py import_physical_archives \
  --file "/app/Documents/Fichier_Description_Theses & Mémoires_V2 (Enregistré automatiquement).xlsx" \
  --dry-run
```

Pour ajouter d'autres fichiers, ajoutez leurs chemins à la liste JSON
`PHYSICAL_ARCHIVE_FILES` dans `docker-compose.yml`, puis reconstruisez ou
redémarrez le backend. L'import manuel peut aussi être lancé ainsi :

```bash
docker compose exec backend python manage.py import_physical_archives \
  --file "/app/Documents/nom-du-fichier.xlsx"
```

La recherche publique du fonds physique est disponible à
`/api/catalog/physical-archives/?q=mot-cle`. Elle recherche dans le titre,
l'auteur, les mots-clés, la cote et le numéro d'exemplaire, avec pagination.
Les résultats sont présentés dans la section « Fonds physique » de la page
Archives ; le catalogue PMB reste une source distincte.
