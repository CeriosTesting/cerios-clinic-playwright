import { test as base } from '@playwright/test';
import { MenuPage } from '../pageObjects/menu-page';
import { HomePage } from '../pageObjects/home-page';
import { LoginPage } from '../pageObjects/login-page';
import { DoctorsPage } from '../pageObjects/doctors-page';

type MyFixtures = {
    menuPage: MenuPage;
    homePage: HomePage;
    loginPage: LoginPage;
    doctorsPage: DoctorsPage;
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
    },
    doctorsPage: async ({ page }, use) => {
        await use(new DoctorsPage(page));
    }
});
export { expect } from '@playwright/test';