# Spécification : Aide à la reconnexion pour les discussions liées

## Aperçu
Actuellement, si un utilisateur tente d'accéder à une discussion via un lien AgregLLM alors qu'il n'est pas connecté au bon compte LLM, il rencontre une erreur "lien non trouvé" ou "404". Ce track vise à capturer l'e-mail du compte actif lors de la sauvegarde d'une discussion et à proposer une aide à la reconnexion si l'accès échoue ultérieurement.

## Exigences Fonctionnelles
1.  **Capture du compte** : Lors de l'acquisition d'un nouveau lien par l'extension, l'adresse e-mail du compte LLM actuellement connecté doit être sauvegardée avec les métadonnées de la discussion.
2.  **Stockage Cloud** : Cette information (association URL <-> Email) doit être synchronisée via **Google Drive** (via le mécanisme existant de la Webapp).
3.  **Détection d'erreur** : L'extension doit détecter si une page de discussion LLM affiche une erreur de type "Lien non trouvé" ou "404".
4.  **Interface de reconnexion** : En cas d'erreur, si un e-mail est associé au lien, une fenêtre modale injectée dans la page doit informer l'utilisateur qu'il doit probablement se connecter avec l'adresse e-mail spécifique (ex: "Ce lien appartient au compte user@example.com. Veuillez vous reconnecter avec ce compte.").

## Exigences Non Fonctionnelles
- **Confidentialité** : Seul l'e-mail est stocké. Aucun mot de passe ou jeton de session n'est sauvegardé.
- **Légèreté** : L'injection de la modale ne doit pas impacter les performances de navigation.

## Critères d'Acceptation
- [ ] L'extension enregistre l'e-mail lors d'une nouvelle capture.
- [ ] La Webapp synchronise ce champ `accountEmail` avec Google Drive.
- [ ] Lors de l'ouverture d'un lien sauvegardé avec un compte différent (ou déconnecté), la modale d'aide s'affiche si le LLM renvoie une erreur.
- [ ] La modale disparaît ou n'apparaît pas si l'utilisateur est déjà sur le bon compte.

## Hors de portée
- Connexion automatique (le processus de connexion reste manuel pour des raisons de sécurité).
- Support de plusieurs comptes simultanés dans une même fenêtre de navigateur (limitation inhérente aux navigateurs).
