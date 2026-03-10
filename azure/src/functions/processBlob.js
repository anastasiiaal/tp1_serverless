const { app } = require('@azure/functions');
const { TableClient } = require('@azure/data-tables');

app.storageBlob('processBlob', {
    path: 'uploads/{name}',
    connection: 'AzureWebJobsStorage',
    handler: async (blob, context) => {
        context.log(`Blob trigger fired for: ${context.triggerMetadata.name}`);

        const blobName = context.triggerMetadata.name;
        const content = blob.toString('utf8');

        // Connexion au Table Storage Azurite
        const tableClient = TableClient.fromConnectionString(
            "UseDevelopmentStorage=true",
            "results"
        );

        // Crée la table si elle n'existe pas
        await tableClient.createTable();

        // Écrit un enregistrement
        await tableClient.createEntity({
            partitionKey: "blobs",
            rowKey: blobName,
            fileName: blobName,
            processedAt: new Date().toISOString(),
            size: blob.length,
            excerpt: content.substring(0, 100)
        });

        context.log(`Record written to Table Storage for: ${blobName}`);
    }
});