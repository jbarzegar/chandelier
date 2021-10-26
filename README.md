This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!


> ⚠ Note on layers!!! I'm working on this framework of development and learning more about DDD so bare with how poor the explanations are ⚠

## App layer
> Note this is all a work in progress

The `/app` dir contains all logic/dependancies/code/sandwhiches that is entirely dedicated to application level code.

### App structure

- `/entities`
  - Stores all top-level (global) entities
  
  
- `/[LayerName]`
  Layers are a subset of the application that may have its own entities however layers have usecases.  Which shouldn't exist on the top-level app layer

  - `/entities`
    - Like global entities but scoped to a specific layer
  - `/useCases`
    - Determines the possible actions a layer can perform

