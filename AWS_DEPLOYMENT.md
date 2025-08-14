# AWS Deployment Guide

## Environment Variables in AWS

When deploying to AWS, you need to securely manage environment variables. Here are the recommended approaches:

### Option 1: AWS Parameter Store (Recommended)

[AWS Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) is a secure service to store configuration data including API keys, database strings, and other sensitive information.

1. Store each environment variable in Parameter Store:
   ```bash
   aws ssm put-parameter --name "/api_rgram/MONGODB_URI" --value "your-mongodb-uri" --type "SecureString"
   aws ssm put-parameter --name "/api_rgram/JWT_SECRET" --value "your-jwt-secret" --type "SecureString"
   # Repeat for other environment variables
   ```

2. In your application, use the AWS SDK to retrieve these parameters:
   ```javascript
   const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
   
   const ssmClient = new SSMClient({ region: "your-aws-region" });
   
   async function getParameter(name) {
     const command = new GetParameterCommand({
       Name: name,
       WithDecryption: true
     });
     const response = await ssmClient.send(command);
     return response.Parameter.Value;
   }
   
   // Example usage
   async function loadEnvironmentVariables() {
     process.env.MONGODB_URI = await getParameter("/api_rgram/MONGODB_URI");
     process.env.JWT_SECRET = await getParameter("/api_rgram/JWT_SECRET");
     // Load other environment variables
   }
   ```

### Option 2: Environment Variables in AWS Services

You can also set environment variables directly in various AWS services:

#### EC2
- Set environment variables in the user data script or in the systemd service file

#### ECS
- Define environment variables in your task definition

#### Lambda
- Configure environment variables in the Lambda function configuration

#### Elastic Beanstalk
- Use the Elastic Beanstalk console or EB CLI to set environment properties

## Security Best Practices

1. **Never hardcode sensitive information** in your application code
2. **Use encryption** for all sensitive data (Parameter Store SecureString type)
3. **Implement least privilege access** - only give services the permissions they need
4. **Rotate secrets regularly** - implement a process for updating credentials
5. **Monitor access** to your sensitive parameters

## Local Development

For local development:

1. Continue using `.env.local` for local environment variables
2. Make sure `.env.local` is in your `.gitignore` file
3. Use the provided `.env.example` as a template for required variables

## Deployment Process

1. Set up your environment variables in AWS using one of the methods above
2. Deploy your application code without any sensitive information
3. Configure your application to load environment variables from AWS
4. Test the deployment to ensure environment variables are correctly loaded