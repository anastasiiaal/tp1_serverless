#!/bin/bash
set -e

ENDPOINT="http://localhost:4566"
REGION="eu-west-1"
ACCOUNT="000000000000"
BUCKET="mon-bucket-tp"
TABLE="tp-results"

echo "🧹 Nettoyage des anciens zips..."
rm -f uploadS3.zip processS3.zip

echo "📦 Zipping functions with Node..."
node zip.js

echo "🪣 Création du bucket..."
aws --endpoint-url=$ENDPOINT s3 mb s3://$BUCKET --region $REGION || true

echo "🗄️ Création de la table DynamoDB..."
aws --endpoint-url=$ENDPOINT dynamodb create-table \
  --table-name $TABLE \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION || true

echo "🚀 Création de uploadS3..."
aws --endpoint-url=$ENDPOINT lambda create-function \
  --function-name uploadS3 \
  --runtime nodejs18.x \
  --handler uploadS3.handler \
  --role arn:aws:iam::$ACCOUNT:role/lambda-role \
  --zip-file fileb://uploadS3.zip \
  --region $REGION || true

echo "🚀 Création de processS3..."
aws --endpoint-url=$ENDPOINT lambda create-function \
  --function-name processS3 \
  --runtime nodejs18.x \
  --handler processS3.handler \
  --role arn:aws:iam::$ACCOUNT:role/lambda-role \
  --zip-file fileb://processS3.zip \
  --region $REGION || true

echo "🔐 Permission S3 -> processS3..."
aws --endpoint-url=$ENDPOINT lambda add-permission \
  --function-name processS3 \
  --statement-id s3-trigger \
  --action lambda:InvokeFunction \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::$BUCKET \
  --region $REGION || true

echo "🔔 Notification S3..."
aws --endpoint-url=$ENDPOINT s3api put-bucket-notification-configuration \
  --bucket $BUCKET \
  --notification-configuration "{\"LambdaFunctionConfigurations\":[{\"LambdaFunctionArn\":\"arn:aws:lambda:$REGION:$ACCOUNT:function:processS3\",\"Events\":[\"s3:ObjectCreated:*\"]}]}"

echo "✅ Done!"