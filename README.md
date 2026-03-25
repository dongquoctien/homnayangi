# Hom Nay An Gi? (What to Eat Today?)

A Vietnamese recipe discovery app built with Astro, React, and TypeScript.

## Features

- Vietnamese recipe discovery
- Multi-language support (Vietnamese & English)
- Fast, SEO-optimized static site
- Deployed on Vercel

## Tech Stack

- [Astro](https://astro.build/) - Static Site Generator
- [React](https://react.dev/) - UI Components
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Vercel](https://vercel.com/) - Hosting & Deployment

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/dongquoctien/homnayangi.git
cd homnayangi

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run check` | Run Astro type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |

## Project Structure

```
src/
├── components/    # Reusable UI components
├── data/          # Static data (menus, recipes)
├── layouts/       # Page layouts
├── lib/           # Utility libraries
├── pages/         # Astro pages
│   ├── index.astro
│   └── en/        # English pages
├── styles/        # Global styles
├── types/         # TypeScript types
└── utils/         # Helper functions
```

## Deployment

This project is configured for deployment on Vercel. Push to the `main` branch to trigger automatic deployment.

## License

MIT License
