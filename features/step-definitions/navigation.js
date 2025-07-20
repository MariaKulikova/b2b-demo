import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// Контекст
Given('что сайт автосалона {string} доступен', async function (siteName) {
  this.siteName = siteName;
});

Given('development сервер запущен на {string}', async function (url) {
  this.baseUrl = url;
  // Устанавливаем baseUrl глобально для других step definitions
  global.baseUrl = url;
});

Given('что я нахожусь на главной странице', async function () {
  await this.goto(this.baseUrl);
});

// Действия
When('я открываю главную страницу', async function () {
  await this.goto(this.baseUrl);
});

When('я нажимаю на ссылку {string} в навигации', async function (linkText) {
  const link = this.page.locator(`nav a:has-text("${linkText}"), header a:has-text("${linkText}")`);
  await link.click();
  await this.page.waitForLoadState('networkidle');
});

When('я нажимаю на ссылку {string}', async function (linkText) {
  // Используем более специфичный селектор - навигационные ссылки в header
  const link = this.page.locator(`nav a:has-text("${linkText}"), header nav a:has-text("${linkText}")`);
  await link.first().click();
  await this.page.waitForLoadState('networkidle');
});

// Проверки
Then('я вижу заголовок страницы {string}', async function (expectedTitle) {
  const title = await this.page.title();
  expect(title).toBe(expectedTitle);
});

Then('я вижу навигационное меню с разделами:', async function (dataTable) {
  const expectedSections = dataTable.raw().flat();
  
  for (const section of expectedSections) {
    if (section === 'Раздел') continue; // Пропускаем заголовок таблицы
    
    const link = this.page.locator(`nav a:has-text("${section}"), header a:has-text("${section}")`);
    await expect(link).toBeVisible();
  }
});

Then('я вижу карточки автомобилей на главной странице', async function () {
  const carCards = this.page.locator('.car-card, [data-testid="car-card"]');
  await expect(carCards.first()).toBeVisible();
  
  const count = await carCards.count();
  expect(count).toBeGreaterThan(0);
});

Then('я перехожу на страницу каталога автомобилей', async function () {
  await expect(this.page).toHaveURL(/.*#\/cars.*/);
});

Then('я вижу список доступных автомобилей', async function () {
  const carCards = this.page.locator('.car-card');
  await expect(carCards.first()).toBeVisible();
});

Then('количество автомобилей больше {int}', async function (minCount) {
  const carCards = this.page.locator('.car-card');
  const count = await carCards.count();
  expect(count).toBeGreaterThan(minCount);
});

Then('я перехожу на страницу {string}', async function (pageName) {
  // Проверяем, что мы находимся на нужной странице по содержимому или URL
  if (pageName === 'О нас') {
    await expect(this.page).toHaveURL(/.*#\/about.*/);
  } else if (pageName === 'контактов') {
    await expect(this.page).toHaveURL(/.*#\/contact.*/);
  }
});

Then('я вижу информацию о компании', async function () {
  const content = this.page.locator('h1, h2, p');
  await expect(content.first()).toBeVisible();
});

Then('я вижу контактную форму', async function () {
  const form = this.page.locator('form, input, textarea');
  await expect(form.first()).toBeVisible();
});

Then('я вижу поля для ввода данных', async function () {
  const inputs = this.page.locator('input, textarea, select');
  const count = await inputs.count();
  expect(count).toBeGreaterThan(0);
});