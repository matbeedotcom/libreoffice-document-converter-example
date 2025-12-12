# Document Converter Lambda

AWS Lambda container image for document conversion using LibreOffice WASM.

## Prerequisites

- Docker
- AWS CLI configured
- AWS ECR repository

## Build & Deploy

### 1. Build the Docker image

```bash
cd converter-lambda
docker build -t converter-lambda .
```

### 2. Test locally

```bash
# Start the container
docker run -p 9000:8080 converter-lambda

# In another terminal, test the health endpoint
curl http://localhost:9000/2015-03-31/functions/function/invocations \
  -d '{"requestContext":{"http":{"method":"GET"}}}'
```

### 3. Push to ECR

```bash
# Create ECR repository (one-time)
aws ecr create-repository --repository-name converter-lambda

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 711387104327.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag converter-lambda:latest 711387104327.dkr.ecr.us-east-1.amazonaws.com/converter-lambda:latest
docker push 711387104327.dkr.ecr.us-east-1.amazonaws.com/converter-lambda:latest
```

### 4. Create Lambda function

```bash
aws lambda create-function  --function-name document-converter  --package-type Image  --code ImageUri=711387104327.dkr.ecr.us-east-1.amazonaws.com/converter-lambda:latest  --role arn:aws:iam::711387104327:role/lambda-execution-role  --timeout 300  --memory-size 2048
```

### 5. Create Function URL (for HTTP access)

```bash
aws lambda create-function-url-config  --function-name document-converter  --auth-type NONE  --cors '{"AllowOrigins": ["*"],"AllowMethods": ["POST", "GET", "OPTIONS"],"AllowHeaders": ["Content-Type"]}'
```

## API Usage

### Health Check
```bash
curl https://<function-url>/
```

### Convert Documents
```bash
curl -X POST https://<function-url>/  -F "outputFormat=pdf"  -F "files=@document.docx"  -o converted.zip
```

## Configuration

- **Memory**: 2048 MB recommended (WASM needs memory)
- **Timeout**: 300 seconds (5 minutes) for batch conversions
- **Architecture**: x86_64 (required for WASM)

## Updating the Function

```bash
# Rebuild and push
docker build -t converter-lambda .
docker tag converter-lambda:latest 711387104327.dkr.ecr.us-east-1.amazonaws.com/converter-lambda:latest
docker push 711387104327.dkr.ecr.us-east-1.amazonaws.com/converter-lambda:latest

# Update Lambda to use new image
aws lambda update-function-code  --function-name document-converter  --image-uri 711387104327.dkr.ecr.us-east-1.amazonaws.com/converter-lambda:latest
```
