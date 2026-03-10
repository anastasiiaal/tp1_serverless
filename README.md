# ⚡ TP 1 - Serverless & Object Storage : Azure Functions vs AWS Lambda 


## Architecture générale

Ce TP implémente une architecture événementielle identique sur deux plateformes cloud :
- **Azure** : Azure Functions + Blob Storage + Table Storage (émulés via Azurite)
- **AWS** : AWS Lambda + S3 + DynamoDB (émulés via LocalStack)

---

## Partie Azure

### Architecture
```
HTTP POST /api/uploadBlob
        │
        ▼
┌─────────────────┐
│   uploadBlob    │  ← Azure Function (HTTP Trigger)
│                 │  reçoit {name, content}
└────────┬────────┘
         │ écrit le fichier
         ▼
┌─────────────────┐
│  Blob Storage   │  ← Azurite (container "uploads")
│  (Azurite)      │
└────────┬────────┘
         │ déclenche automatiquement
         ▼
┌─────────────────┐
│  processBlob    │  ← Azure Function (Blob Trigger)
│                 │  lit le blob, écrit dans Table Storage
└────────┬────────┘
         │ écrit l'enregistrement
         ▼
┌─────────────────┐
│  Table Storage  │  ← Azurite (table "results")
│  (Azurite)      │  fileName, processedAt, size, excerpt
└─────────────────┘
```

### Rôle de chaque fonction

#### `uploadBlob` (HTTP Trigger)
- **Fichier** : `azure/src/functions/uploadBlob.js`
- **Déclenchement** : requête HTTP POST sur `/api/uploadBlob`
- **Entrée** : JSON `{ "name": "fichier.txt", "content": "contenu" }`
- **Rôle** : dépose le fichier dans le container `uploads` du Blob Storage Azurite
- **Sortie** : réponse HTTP 200 avec confirmation

#### `processBlob` (Blob Trigger)
- **Fichier** : `azure/src/functions/processBlob.js`
- **Déclenchement** : automatique à chaque ajout de blob dans le container `uploads`
- **Rôle** : lit le contenu du blob et écrit un enregistrement dans Table Storage
- **Données écrites** : `fileName`, `processedAt`, `size`, `excerpt` (100 premiers caractères)

### Prérequis

- Node.js 18+
- Azure Functions Core Tools v4 : `npm install -g azure-functions-core-tools@4`
- Extension VS Code **Azurite**

### Pour lancer la partie Azure en local

**1. Démarrer Azurite**
Dans VS Code : `Ctrl+Shift+P` → `Azurite: Start`

![Azurite running](image-1.png)

**2. Installer les dépendances**
```bash
cd azure
npm install
```

**3. Lancer les fonctions**
```bash
func start
```

![Func start lancé](image.png)

**4. Tester**

Créer un fichier `body.json` :
```json
{ "name": "test.txt", "content": "Hello Azure Serverless!" }
```

Envoyer la requête :
```bash
curl -X POST http://localhost:7071/api/uploadBlob \
  -H "Content-Type: application/json" \
  -d @body.json
```
![requete via dit bash](image-2.png)
