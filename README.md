## Prerequisites

- [Node.js](https://nodejs.org) 20 or newer and npm
- Free accounts (only needed when configuring your own environment):
  - [Neon](https://neon.tech) — PostgreSQL database
  - [Sanity](https://www.sanity.io) — content CMS
  - [Stripe](https://stripe.com) — payments (test mode)
  - [Resend](https://resend.com) — transactional email

## Quick Start (using the provided environment)

A configured `.env` file is included in this submission for evaluation purposes.

```bash
npm install          # also runs "prisma generate" automatically
npx prisma db push   # create tables in the database
npm run dev
```
Open http://localhost:3000. The Sanity Studio is available at http://localhost:3000/studio.

For live demonstration of the application deployed in Vercel, visit the link: https://tudong.vercel.app/


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
