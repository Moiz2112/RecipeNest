
# RecipeNest

![GitHub Stars](https://img.shields.io/github/stars/Moiz2112/RecipeNest?style=social)
![GitHub Forks](https://img.shields.io/github/forks/Moiz2112/RecipeNest?style=social)
![License](https://img.shields.io/github/license/Moiz2112/RecipeNest)
![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-green)

RecipeNest is an AI-powered cooking app that generates recipes from selected ingredients, supports detailed step-by-step instructions with quantities, and now includes a full smart grocery inventory system for tracking stock, expiry, consumption, alerts, shopping lists, and analytics.

The app supports configurable text generation backends through `OPENAI_TEXT_MODEL` and can run against Groq/Grok-compatible or OpenAI-compatible endpoints depending on your API key. Recipe images, narration, tags, and chat assistance are also supported.

🌐 Live demo: https://smart-recipe-generator.vercel.app/

---

## What's New

- Smart Grocery Inventory Management with dashboard, items, expiry tracking, alerts, shopping list, categories, and analytics.
- Recipe generation prompts that ask the model for distinct, inventive recipes with exact ingredient quantities.
- Recipe cooking flow support that can deduct ingredients from inventory when a recipe is cooked.
- Inventory alerts and shopping list automation based on low stock and expiry dates.

---

## Features

### AI Cooking
- Generate 3 distinct recipes from selected ingredients and dietary preferences.
- Produce detailed instructions that include exact quantities for each step.
- Generate recipe images for saved recipes.
- Narrate recipes with text-to-speech.
- Ask the chat assistant recipe-specific cooking questions.

### Inventory Management
- Add, edit, search, filter, and delete inventory items.
- Track quantity, unit, storage location, purchase date, expiry date, and minimum threshold.
- View dashboard analytics for stock, spending, consumption, and expiry.
- Auto-generate low-stock alerts and shopping list items.
- Track recipe-driven consumption and manual consumption entries.

### Core App Features
- Google sign-in through NextAuth.
- Browse recipes with likes, saves, tags, and notifications.
- Infinite scrolling and sort options.
- Mobile-friendly UI with the existing RecipeNest theme.

---

## Tech Stack

- Next.js 14, React 18, TypeScript
- MongoDB with Mongoose
- NextAuth.js
- Tailwind CSS
- AWS S3 for image storage
- OpenAI-compatible text and image APIs
- Docker for local MongoDB

---

## Prerequisites

- Node.js 18 or newer
- Docker Desktop or a local MongoDB instance
- A valid API key for your configured text model provider
- Google OAuth credentials for login

---

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/Moiz2112/RecipeNest.git
cd RecipeNest/smart-recipe-generator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start MongoDB with Docker
```bash
docker compose up -d
```

### 4. Create `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-api-key
OPENAI_TEXT_MODEL=llama-3.3-70b-versatile
OPENAI_IMAGE_MODEL=dall-e-3
CLOUDFLARE_API_KEY=your-cloudflare-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
USE_MOCK_RECIPES=false
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
MONGO_URI=mongodb://root:123456@localhost:27018/smart-recipe-generator?authSource=admin
S3_BUCKET_NAME=your-s3-bucket-name
API_REQUEST_LIMIT=50
ALLOW_PUBLIC_RECIPES=false
```

### 5. Run the app
```bash
npm run dev
```

The app will be available at http://localhost:3000.

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Run the production server
npm run compileTS # TypeScript checks
npm run test      # Jest watch mode
npm run coverage  # Jest coverage report
npm run cy:run    # Cypress headless tests
```

---

## Testing

- Unit tests: `npm run coverage`
- Type checks: `npm run compileTS`
- End-to-end tests: `npm run test:e2e`

---

## Contributing

Pull requests are welcome. If you plan a larger change, open an issue first so it can be discussed.

---

## Acknowledgements

- Next.js
- MongoDB
- Vercel
- OpenAI-compatible APIs
