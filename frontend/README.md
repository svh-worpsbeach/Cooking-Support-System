# Cookies Support System - Frontend

React + TypeScript frontend for the Cooking Management System.

## Tech Stack

- **React 18+** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **react-i18next** - Internationalization (English & German)
- **React Hook Form** - Form handling

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
```

### Preview Production Build

```bash
# Preview production build locally
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Shared components (Layout, etc.)
│   │   ├── recipes/     # Recipe-specific components
│   │   ├── events/      # Event-specific components
│   │   ├── tools/       # Tool-specific components
│   │   └── storage/     # Storage-specific components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React contexts
│   ├── types/           # TypeScript type definitions
│   ├── locales/         # Translation files (en.json, de.json)
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   ├── i18n.ts          # i18n configuration
│   └── index.css        # Global styles
├── .env                 # Environment variables
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Features

### Multi-language Support

The app supports English and German. Switch languages using the button in the navigation bar.

### API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000` by default. Configure this in `.env`:

```
VITE_API_URL=http://localhost:8000
```

### Responsive Design

Mobile-first responsive design optimized for:
- Desktop browsers
- Tablets
- Mobile devices (iOS Safari optimized)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:8000
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari (optimized)
- Mobile browsers

## Development Guidelines

### Component Structure

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for type safety
- Follow the existing naming conventions

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Ensure touch-friendly UI (44x44px minimum tap targets)

### State Management

- Use React Query for server state
- Use React Context for global UI state
- Use local state for component-specific state

### API Calls

- Use the centralized API client in `src/services/api.ts`
- Use React Query hooks for data fetching
- Handle errors appropriately

## Next Steps

1. Implement recipe management UI
2. Implement event management UI
3. Implement tools management UI
4. Implement storage management UI
5. Add image upload functionality
6. Add form validation
7. Add loading states and error handling
8. Add tests

## License

This project is part of the Cookies Support System.
