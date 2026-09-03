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

For live demonstration of the application deployed in Vercel, visit the link: (https://temu2-self.vercel.app/)

