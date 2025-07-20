import { setWorldConstructor, Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';

class CustomWorld {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
  }

  async openBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ 
        headless: false,
        slowMo: 100 
      });
    }
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async closeBrowser() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
  }

  async goto(url) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }
}

setWorldConstructor(CustomWorld);

BeforeAll(async function() {
  console.log('🚀 Запуск BDD тестов для Cool Cars Amsterdam');
});

Before(async function() {
  await this.openBrowser();
});

After(async function() {
  await this.closeBrowser();
});

AfterAll(async function() {
  console.log('✅ BDD тесты завершены');
});