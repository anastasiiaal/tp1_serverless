const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const s3 = new S3Client({
    endpoint: process.env.AWS_ENDPOINT_URL || "http://localhost.localstack.cloud:4566",
    region: 'eu-west-1',
    forcePathStyle: true,
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});

const dynamo = new DynamoDBClient({
    endpoint: process.env.AWS_ENDPOINT_URL || "http://localhost.localstack.cloud:4566",
    region: 'eu-west-1',
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});

exports.handler = async (event) => {
    const record = event.Records[0];
    const bucketName = record.s3.bucket.name;
    const fileName = record.s3.object.key;
    const fileSize = record.s3.object.size;

    // Lit le contenu du fichier S3
    const s3Response = await s3.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName
    }));

    const content = await s3Response.Body.transformToString();

    // Écrit dans DynamoDB
    await dynamo.send(new PutItemCommand({
        TableName: 'tp-results',
        Item: {
            id: { S: `${Date.now()}-${fileName}` },
            fileName: { S: fileName },
            processedAt: { S: new Date().toISOString() },
            size: { N: String(fileSize) },
            excerpt: { S: content.substring(0, 100) }
        }
    }));

    console.log(`Record written to DynamoDB for: ${fileName}`);
    return { statusCode: 200 };
};