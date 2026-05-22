import { STORAGE_STATE } from '../playwright.config';
import { test as setup, expect } from './my-test';

setup('authenticate', async ({ page, loginPage }) => {
    await loginPage.navigateTo();
    await loginPage.login();

    await expect(page).not.toHaveURL(/login/);
    await page.waitForLoadState('domcontentloaded');

    await page.context().storageState({ path: STORAGE_STATE });
});