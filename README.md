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


## Partie AWS

### Architecture
```
Event JSON (CLI)
        │
        ▼
┌─────────────────┐
│   uploadS3      │  ← AWS Lambda (invocation directe CLI)
│                 │  reçoit {name, content}
└────────┬────────┘
         │ écrit le fichier
         ▼
┌─────────────────┐
│   Bucket S3     │  ← LocalStack (bucket "mon-bucket-tp")
└────────┬────────┘
         │ déclenche automatiquement (S3 Event Notification)
         ▼
┌─────────────────┐
│   processS3     │  ← AWS Lambda (S3 Trigger)
│                 │  lit l'objet S3, écrit dans DynamoDB
└────────┬────────┘
         │ écrit l'enregistrement
         ▼
┌─────────────────┐
│    DynamoDB     │  ← LocalStack (table "tp-results")
│                 │  id, fileName, processedAt, size, excerpt
└─────────────────┘
```

### Prérequis

- Docker Desktop
- AWS CLI v2
- Node.js 18+

### Lancer la partie AWS en local

**1. Démarrer LocalStack**
```bash
cd aws
docker compose up
```
![Docker first up](image-3.png)
![alt text](image-4.png)

**2. Créer les ressources AWS (première fois uniquement)**
```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://mon-bucket-tp

aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name tp-results \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```
![alt text](image-5.png)