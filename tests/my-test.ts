import { test as base } from '@playwright/test';
import { MenuPage } from '../pageObjects/menu-page';
import { HomePage } from '../pageObjects/home-page';
import { LoginPage } from '../pageObjects/login-page';
import { DoctorsPage } from '../pageObjects/doctors-page';
import { RegisterPage } from '../pageObjects/register-page';

type MyFixtures = {
    menuPage: MenuPage;
    homePage: HomePage;
    loginPage: LoginPage;
    doctorsPage: DoctorsPage;
    registerPage: RegisterPage;
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
    },
    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page));
    },
});
export { expect } from '@playwright/test';