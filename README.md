# ⚡ TP 1 - Serverless & Object Storage : Azure Functions vs AWS Lambda 

## Azure

### Fonction 1 : uploadBlob (HTTP Trigger)
- Déclenchement : requête HTTP POST
- Rôle : reçoit un JSON {name, content} et dépose un fichier dans le Blob Storage (container "uploads")
- Test : `curl -X POST http://localhost:7071/api/uploadBlob -H "Content-Type: application/json" -d @body.json`