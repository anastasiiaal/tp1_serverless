const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    endpoint: process.env.AWS_ENDPOINT_URL || "http://localhost.localstack.cloud:4566",
    region: 'eu-west-1',
    forcePathStyle: true,
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});

exports.handler = async (event) => {
    const { name, content } = event;

    if (!name || !content) {
        return { statusCode: 400, body: 'Missing name or content' };
    }

    await s3.send(new PutObjectCommand({
        Bucket: 'mon-bucket-tp',
        Key: name,
        Body: content
    }));

    console.log(`File "${name}" uploaded to S3`);
    return { statusCode: 200, body: `File "${name}" uploaded to S3` };
};