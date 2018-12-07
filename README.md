# Chatbot

Projet réalisé en NodeJS.

## Généralités

L'application est hébergée à l'adresse http://54.36.115.121:8080, sinon vous pouvez la déployer en local via Docker en suivant la procédure ci-dessous.

## Installation et dépendances

Pour installer les dépendances et l'application, allez dans app et lancez la commande `npm install`.

## Build Docker

Pour build le projet via l'image Docker, utilisez la commande `docker build -t chatbot .`.

## Déploiement Docker

Une fois build, vous pouvez déployer l'application via l'image docker avec la commande `docker run -d -p 8080:8080 chatbot`. Vous pouvez ensuite consulter l'application dans votre navigateur à l'adresse http://localhost:8080/.

## Tests

Le bot est paramétré pour une centaine d'échange possible, quelques pistes, essayez :
* température
* google
* heure
* cosmos
* etc...