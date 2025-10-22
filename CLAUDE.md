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
- `src/services/api.js` - API service for fetching car inventory from backend
- `src/context/CarsContext.jsx` - React Context for car data management (getHotOffers, getCarById, getAllCars)
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
- Phone: +447418613962
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

## CI/CD Pipeline

GitHub Actions автоматизация настроена для обеспечения качества кода и автоматического деплоя:

### Основной Pipeline (CI/CD)
- **Триггеры**: Push в main/develop, Pull Requests в main
- **Этапы**: 
  1. Tests & Linting - линтинг и базовые BDD тесты
  2. Build Project - сборка проекта
  3. Deploy to GitHub Pages - автоматический деплой на GitHub Pages (только main branch)

### Полное тестирование 
- **Триггеры**: Push/PR в main/develop
- **Браузеры**: Chromium, Firefox, WebKit (matrix strategy)
- **Lighthouse аудит**: Performance, Accessibility, Best Practices, SEO
- **Ручной запуск**: Доступен через GitHub Actions UI

### Команды для CI/CD
- Workflows автоматически используют `pnpm` для всех операций
- Артефакты тестов сохраняются на 7 дней
- Скриншоты при ошибках автоматически загружаются
- Production сборка включает 404.html для GitHub Pages routing

### GitHub Pages
- **URL**: https://demo.shiftgears.ai/ (кастомный домен)
- **Обновления**: При каждом push в main branch
- **Конфигурация**: HashRouter для совместимости со статическим хостингом
- **CNAME**: Настроен на demo.shiftgears.ai

## Browser Control & Voice Assistant

This application integrates with ElevenLabs Voice AI and MCP (Model Context Protocol) for browser control.

### Key Components
- `src/services/browserControlWebSocket.js` - WebSocket connection to backend for browser control
- `src/services/commandExecutor.js` - Centralized command execution logic
- `src/services/commandGenerator.js` - Generates available commands based on current page/route
- `src/components/VoiceAssistant.jsx` - Voice AI interface component
- `src/hooks/useCommands.js` - React hook for command management

### Available Commands
Commands are dynamically generated based on the current route:
- **Navigation**: `go_home`, `go_cars`, `go_about`, `go_contact`, `go_back_cars`
- **Filters**: `set_filter` (single), `set_filters` (multiple), `clear_filters`
- **Actions**: `view_cars`, `scroll_top`, `scroll_bottom`

### Filter System
- **Categorical filters** (make, bodyType, fuelType, transmission): Support multi-select via comma-separated URL params (e.g., `?make=Audi,Kia`)
- **Range filters** (price, mileage): Use min/max URL params (e.g., `?minPrice=10000&maxPrice=50000`)

### Debugging

#### 1. Browser Control Commands
Test commands directly in browser console:

```javascript
// Execute single filter
window.browserControl.execute('set_filter', {
  filterType: 'make',
  values: ['Audi']
});

// Execute multiple filters
window.browserControl.execute('set_filters', {
  filters: {
    make: ['Audi', 'Kia'],
    fuelType: ['Electric', 'Hybrid'],
    price: { min: 20000, max: 50000 }
  }
});

// Clear filters
window.browserControl.execute('clear_filters', {
  filterTypes: ['all']
});

// View available commands
window.browserControl.help();
```

#### 2. Playwright MCP Tools
When debugging with Claude Code, use MCP Playwright tools:

```javascript
// Take a snapshot to see page state and available elements
mcp__playwright__browser_snapshot()

// Execute JavaScript to test functionality
mcp__playwright__browser_evaluate({
  function: "() => { return window.location.href; }"
})

// Check console logs
mcp__playwright__browser_console_messages({ onlyErrors: false })

// Navigate and test
mcp__playwright__browser_navigate({ url: "http://localhost:5173/#/cars" })
```

#### 3. Common Debugging Scenarios

**Problem**: Filters not applying after code changes
**Solution**:
1. Ensure dev server reloaded: Check `pnpm dev` output for HMR updates
2. Hard refresh browser: Clear cache or use `window.location.reload()`
3. Test command directly: Use `window.browserControl.execute()` in console
4. Check console logs: Look for `[CommandExecutor]` messages

**Problem**: Multi-select filter shows only one value
**Solution**:
1. Verify URL format: Should be `?make=Audi,Kia` (comma-separated)
2. Check parsing logic: `searchParams.get('make').split(',')`
3. Test in console: Execute filter and check URL updates

**Problem**: WebSocket not connecting
**Solution**:
1. Check backend is running: `VITE_BROWSER_CONTROL_WS_URL` in `.env`
2. Verify session ID: Check console for `[BrowserControl]` messages
3. Test connection: `browserControlWS.isConnected()`

#### 4. Logging Best Practices
All browser control operations are logged with prefixes:
- `[BrowserControl]` - WebSocket and registration events
- `[CommandExecutor]` - Command execution and filter operations
- `[CommandGenerator]` - Available commands generation
- `[VoiceAssistant]` - Voice AI session lifecycle

Filter console by these prefixes to debug specific subsystems.