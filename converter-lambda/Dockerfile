# AWS Lambda Container Image for Document Conversion
FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:20

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy application code
COPY index.mjs ./

# Set the handler
CMD ["index.handler"]
