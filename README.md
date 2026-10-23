# ChainNote

MVP de preuve horodatée sur BNB Smart Chain Testnet (chain ID 97). L’application enregistre publiquement un texte (2 000 octets UTF-8 maximum), son empreinte SHA-256, l’auteur et l’heure du bloc. Une capture facultative de 4 Mo maximum est envoyée à Pinata/IPFS ; seul son CID est inscrit dans le contrat.

## Prérequis

- Node.js 20.9 ou plus récent et npm
- Foundry (`forge`, `cast`)
- MetaMask configuré avec BNB Smart Chain Testnet et un peu de tBNB
- Un compte Pinata et un JWT avec permission d’épingler des fichiers (facultatif, uniquement pour les captures)

## Démarrer le frontend

```sh
npm install
cp .env.example .env.local
npm run dev
```

Ouvrez `http://localhost:3000`. L’interface peut être parcourue sans contrat ; publier et consulter nécessitent son déploiement et l’adresse associée. Pour les captures, renseignez `PINATA_JWT` dans `.env.local`. Cette variable est uniquement utilisée par le Route Handler serveur ; ne la préfixez jamais par `NEXT_PUBLIC_`.

## Contrat

Compiler et exécuter les tests Foundry :

```sh
forge build
forge test
```

Déployer sur le testnet. La clé privée ne doit pas être enregistrée dans le dépôt ni dans une variable `NEXT_PUBLIC_*` :

```sh
export BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
export DEPLOYER_PRIVATE_KEY=0x... # portefeuille de test uniquement
forge script script/Deploy.s.sol:DeployScript --rpc-url "$BSC_TESTNET_RPC_URL" --private-key "$DEPLOYER_PRIVATE_KEY" --broadcast
```

Copiez l’adresse affichée du contrat dans `NEXT_PUBLIC_CONTRACT_ADDRESS` de `.env.local`, puis redémarrez Next.js. Foundry permet aussi de vérifier le déploiement avec `cast call <ADRESSE> "noteCount()(uint256)" --rpc-url "$BSC_TESTNET_RPC_URL"`.

## Réseau et vérification

- RPC par défaut : `https://data-seed-prebsc-1-s1.bnbchain.org:8545`
- Explorateur : [BscScan Testnet](https://testnet.bscscan.com/)
- Faucet : [BNB Chain Testnet Faucet](https://www.bnbchain.org/en/testnet-faucet)
- Dans `/verify`, saisissez l’ID affiché après publication. Le SHA-256 porte sur les octets UTF-8 exacts du texte ; le contrat vérifie l’empreinte à la publication et conserve le texte pour qu’un tiers puisse la recalculer.

## Limites du MVP

- Les textes et les CIDs sont publics et permanents sur une blockchain publique. Les fichiers IPFS sont publics ; leur disponibilité dépend de l’épinglage Pinata.
- La clé Pinata est protégée côté serveur, mais une politique de quotas/rate limiting reste à ajouter avant un déploiement public.
- Aucun contrat n’est livré pré-déployé. L’adresse du contrat doit être configurée après le déploiement sur le testnet.
- Le MVP ne gère pas l’indexation globale, les publications sponsorisées, ni la vérification d’images par téléversement côté page de vérification.
- Les tests Foundry ne constituent pas un audit de sécurité. Ne déployez pas ce contrat comme service de production sans revue dédiée.

## Variables d’environnement

Voir `.env.example`. `BSC_TESTNET_RPC_URL` est utilisé par Foundry ; `NEXT_PUBLIC_BSC_TESTNET_RPC_URL` configure le RPC navigateur ; `PINATA_JWT` reste côté serveur.
