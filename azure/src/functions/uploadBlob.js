const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

app.http('uploadBlob', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('uploadBlob function triggered');

        const body = await request.json();
        const { name, content } = body;

        if (!name || !content) {
            return { status: 400, body: 'Missing name or content' };
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(
            "UseDevelopmentStorage=true"
        );
        const containerClient = blobServiceClient.getContainerClient('uploads');

        // Crée le container s'il n'existe pas
        await containerClient.createIfNotExists();

        const blockBlobClient = containerClient.getBlockBlobClient(name);
        await blockBlobClient.upload(content, Buffer.byteLength(content));

        context.log(`Blob "${name}" uploaded successfully`);
        return { status: 200, body: `File "${name}" uploaded to Blob Storage` };
    }
});