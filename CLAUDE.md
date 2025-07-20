# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Use pnpm as the package manager:

- `pnpm install` - Install dependencies  
- `pnpm dev` - Start development server on port 5173
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build on port 4173
- `pnpm lint` - Run ESLint on all JS/JSX files

## Architecture

This is a React + Vite car dealer demo website for "Cool Cars Amsterdam" with the following structure:

### Tech Stack
- **Framework**: React 18 with Vite 7
- **Routing**: React Router DOM with HashRouter for static hosting
- **Styling**: Tailwind CSS 4 with @tailwindcss/vite plugin
- **Icons**: Lucide React
- **Testing**: Playwright (installed but no test files present)

### Project Structure
- `src/pages/` - Page components (HomePage, CarsPage, CarDetailPage, AboutPage, ContactPage)
- `src/components/` - Shared components including CarCard, Header, Footer, ChatWidget, TestDriveModal
- `src/components/ui/` - Reusable UI components (button, card, input, etc.)
- `src/data/cars.js` - Car inventory data with utilities (getHotOffers, getCarById, getAllCars)
- `public/assets/cars/` - Car images directory

### Key Features
- Car browsing with filtering and search
- Individual car detail pages with image galleries
- Test drive booking modal
- Contact integration (phone, WhatsApp)
- "Hot offers" highlighting system
- Responsive design with mobile-first approach

### Alias Configuration
- `@/` maps to `./src/` for clean imports

### Data Model
Cars have properties: id, make, model, year, price, mileage, images[], description, features[], fuelType, transmission, color, isHotOffer

### Contact Information
- Phone: +31201234567
- WhatsApp: Same number with pre-filled messages for car inquiries

## Language Guidelines

**ВАЖНО**: All file names, code, variable names, function names, and website content MUST be in English. Russian is only permitted in comments.

Examples:
- ✅ `navigation.feature`, `car-catalog.js`, `testDriveModal.jsx`
- ❌ `навигация.feature`, `каталог-автомобилей.js`
- ✅ `const userName = "John";` 
- ❌ `const имяПользователя = "John";`
- ✅ `// Получаем данные пользователя` (Russian comment is OK)

## Testing

BDD testing setup with Cucumber + Playwright:
- `pnpm test` or `pnpm test:bdd:basic` - Run basic BDD test
- `pnpm test:bdd` - Run all BDD tests 
- `pnpm test:e2e` - Run Playwright E2E tests
- `features/` - Cucumber feature files (use English file names)
- `features/step-definitions/` - Step definitions in JavaScript  
- `features/support/` - Test support files and world configuration

**Note**: Make sure dev server is running (`pnpm dev`) before running BDD tests.

Feature files are in Russian (with #language: ru) but use English file names.
Step definitions support Russian Gherkin keywords but variable names are in English.