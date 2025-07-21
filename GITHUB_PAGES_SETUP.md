# GitHub Pages Setup Instructions

## Проблема
GitHub Actions workflow настроен, но GitHub Pages не работает.

## Решение

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

## Проверка

После настройки сайт будет доступен по адресу:
https://mariakulikova.github.io/b2b-demo/