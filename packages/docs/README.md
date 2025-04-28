# @pfda/docs

This is a Next.js application using the [Fumadocs](https://github.com/fuma-nama/fumadocs) library.

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:4040 with your browser to see the result.

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Fumadocs](https://fumadocs.vercel.app) - learn about Fumadocs

---
## Deployment

There are two workflows available for deploying the FumaDocs ECS service:

1. **Dev Workflow**  
   - **File**: `dev-8517-deploy-fumadocs.yml`  
   - This workflow is manually triggered and does not require any inputs.  
   - It builds a Docker image and tags it using the branch name and short commit SHA.  
   - The image is pushed to the ECR repository in the orchestration account.  
   - The image tag is displayed in the GitHub Actions summary.  
   - Once the image is built, a new version of the ECS service is deployed automatically.

2. **Test/Staging/Production Workflow**  
   - **File**: `test-staging-prod-deploy-fumadocs.yml`  
   - This workflow is also manually triggered.  
   - The user must select the deployment environment (`test`, `staging`, or `prod`) and provide the `IMAGE_ID` to update the ECS service.  
   - For **production deployments**, an approval step is required, which can only be approved by the configured approvers.  
   - **Important**: Before deploying to `staging` or `prod`, ensure that the code is merged into the `master` branch.