# GitHub Pages Setup Instructions

## ✅ ИСПРАВЛЕНО: MIME Type Error

**Проблема была в том, что:**
- В CI не было переменной окружения `GITHUB_PAGES=true`
- Из-за этого Vite собирал проект с неправильным base path
- GitHub Pages получал файлы с путями `/assets/...` вместо `/b2b-demo/assets/...`

**Исправление:**
- Добавлена переменная `GITHUB_PAGES: true` в CI workflow
- Теперь сборка использует правильный base path `/b2b-demo/`

## Настройка в GitHub (если еще не сделано)

1. **Перейти в Settings репозитория**:
   https://github.com/MariaKulikova/b2b-demo/settings/pages

2. **Настроить Source**:
   - Source: "GitHub Actions"
   - НЕ "Deploy from a branch"

3. **Проверить Environment**:
   - Убедиться что environment "github-pages" создан
   - Или Settings → Environments → New environment → "github-pages"

## Альтернативное решение

Если настройка через Settings недоступна, можно использовать простой workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run build
      env:
        GITHUB_PAGES: true
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## ✅ НАСТРОЕН КАСТОМНЫЙ ДОМЕН

Сайт настроен на кастомный домен: **https://demo.shiftgears.ai/**

**Конфигурация:**
- Добавлен файл `public/CNAME` с доменом `demo.shiftgears.ai`
- Base path установлен в `/` (корень домена)
- Удалена переменная `GITHUB_PAGES` из CI (больше не нужна)

**Проверка:**
Сайт доступен по адресу: https://demo.shiftgears.ai/