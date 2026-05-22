import { test as base } from '@playwright/test';
import { MenuPage } from '../pageObjects/menu-page';
import { HomePage } from '../pageObjects/home-page';
import { LoginPage } from '../pageObjects/login-page';

type MyFixtures = {
    menuPage: MenuPage;
    homePage: HomePage;
    loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
    menuPage: async ({ page }, use) => {
        await use(new MenuPage(page));
    },
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    }
});
export { expect } from '@playwright/test';