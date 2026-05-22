import { Locator, Page } from "@playwright/test";

export class LoginPage {
    private readonly _signInButton: Locator;
    private readonly _keycloakUsername: Locator;
    private readonly _keycloakPassword: Locator;
    private readonly _keycloakSubmit: Locator;

    constructor(private readonly _page: Page) {
        this._signInButton = this._page.getByRole('button', { name: 'Sign in' });
        this._keycloakUsername = this._page.locator('#username');
        this._keycloakPassword = this._page.locator('#password');
        this._keycloakSubmit = this._page.locator('#kc-login');
    }

    async navigateTo() {
        await this._page.goto('/login');
    }

    async login() {
        const email = process.env.PATIENT_EMAIL;
        if (!email) {
            throw new Error("Missing PATIENT_EMAIL environment variable");
        }
        const password = process.env.PATIENT_PASSWORD;
        if (!password) {
            throw new Error("Missing PATIENT_PASSWORD environment variable");
        }

        await this._signInButton.click();
        await this._keycloakUsername.fill(email);
        await this._keycloakPassword.fill(password);
        await this._keycloakSubmit.click();
    }
}