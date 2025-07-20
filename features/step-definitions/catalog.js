import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// Контекст
Given('что я нахожусь на странице каталога автомобилей', async function () {
  const baseUrl = this.baseUrl || global.baseUrl || 'http://localhost:5173';
  await this.goto(`${baseUrl}/#/cars`);
});

Given('в каталоге есть автомобили', async function () {
  const carCards = this.page.locator('.car-card');
  await expect(carCards.first()).toBeVisible();
  this.carsCount = await carCards.count();
  expect(this.carsCount).toBeGreaterThan(0);
});

Given('что я нахожусь на странице детали автомобиля', async function () {
  // Сначала идем в каталог
  const baseUrl = this.baseUrl || global.baseUrl || 'http://localhost:5173';
  await this.goto(`${baseUrl}/#/cars`);
  
  // Затем кликаем на ссылку "View Details" первого автомобиля
  const firstCarCard = this.page.locator('.car-card').first();
  await expect(firstCarCard).toBeVisible();
  
  const viewDetailsLink = firstCarCard.locator('a:has-text("View Details")');
  await viewDetailsLink.click();
  await this.page.waitForLoadState('networkidle');
  
  // Проверяем, что мы на странице детали
  await expect(this.page).toHaveURL(/.*#\/car\/\d+.*/);
});

// Действия
When('я нажимаю на карточку автомобиля', async function () {
  // Кликаем по ссылке "View Details" внутри карточки
  const viewDetailsLink = this.page.locator('.car-card a:has-text("View Details")').first();
  await viewDetailsLink.click();
  await this.page.waitForLoadState('networkidle');
});

When('в каталоге есть автомобили с меткой {string}', async function (label) {
  const hotOfferCards = this.page.locator('.car-card:has-text("' + label + '")');
  this.hotOffersCount = await hotOfferCards.count();
});

// Проверки
Then('я вижу карточки автомобилей', async function () {
  const carCards = this.page.locator('.car-card');
  await expect(carCards.first()).toBeVisible();
  
  const count = await carCards.count();
  expect(count).toBeGreaterThan(0);
});

Then('каждая карточка содержит:', async function (dataTable) {
  const expectedElements = dataTable.raw().flat();
  const firstCard = this.page.locator('.car-card').first();
  
  // Проверяем наличие основных элементов в карточке
  await expect(firstCard.locator('img')).toBeVisible(); // Изображение
  
  // Проверяем текстовое содержимое
  const cardText = await firstCard.textContent();
  
  // Проверяем, что в карточке есть цена (содержит € или знак валюты)
  expect(cardText).toMatch(/€|price/i);
  
  // Проверяем наличие информации о годе/пробеге/типе топлива
  expect(cardText).toMatch(/\d{4}|\d+\s*(km|miles)/i);
});

Then('я вижу кнопки для взаимодействия с автомобилем', async function () {
  const firstCard = this.page.locator('.car-card').first();
  const buttons = firstCard.locator('button, a[role="button"]');
  
  const buttonCount = await buttons.count();
  expect(buttonCount).toBeGreaterThan(0);
});

Then('я вижу специальную метку на карточках этих автомобилей', async function () {
  if (this.hotOffersCount > 0) {
    // Более точный селектор для HOT OFFER badge
    const hotOfferBadge = this.page.locator('.car-card .absolute.top-2.left-2:has-text("HOT OFFER")');
    await expect(hotOfferBadge.first()).toBeVisible();
  }
});

Then('hot offers выделяются визуально', async function () {
  if (this.hotOffersCount > 0) {
    // Проверяем что HOT OFFER badge имеет красный фон
    const hotOfferBadge = this.page.locator('.car-card .bg-red-500:has-text("HOT OFFER")');
    await expect(hotOfferBadge.first()).toBeVisible();
  }
});

Then('я перехожу на страницу с детальной информацией об этом автомобиле', async function () {
  await expect(this.page).toHaveURL(/.*#\/car\/\d+.*/);
});

Then('вижу расширенную информацию:', async function (dataTable) {
  const expectedInfo = dataTable.raw().flat();
  
  // Проверяем наличие множественных изображений
  const images = this.page.locator('img');
  const imageCount = await images.count();
  expect(imageCount).toBeGreaterThan(1);
  
  // Проверяем наличие описания
  const description = this.page.locator('p, .description');
  await expect(description.first()).toBeVisible();
  
  // Проверяем наличие технических данных
  const pageText = await this.page.textContent('body');
  expect(pageText).toMatch(/transmission|fuel|year|mileage/i);
});

Then('я вижу кнопки для действий:', async function (dataTable) {
  const expectedActions = dataTable.raw().flat();
  
  // Проверяем наличие кнопок действий
  const buttons = this.page.locator('button, a[href^="tel:"], a[href^="https://wa.me"]');
  const buttonCount = await buttons.count();
  expect(buttonCount).toBeGreaterThan(0);
  
  // Проверяем конкретные типы кнопок
  const pageContent = await this.page.textContent('body');
  
  // Проверяем наличие кнопки тест-драйва
  if (expectedActions.includes('Записаться на тест-драйв')) {
    expect(pageContent).toMatch(/test.*drive|тест.*драйв/i);
  }
});