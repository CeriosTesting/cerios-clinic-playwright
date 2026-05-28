import { expect, Locator, Page } from "@playwright/test";

export class RegisterPage {
    private readonly _firstNameInput: Locator;
    private readonly _lastNameInput: Locator;
    private readonly _emailInput: Locator;
    private readonly _passwordInput: Locator;
    private readonly _confirmPasswordInput: Locator;
    private readonly _submitButton: Locator;

    constructor(private readonly _page: Page) {
        this._firstNameInput = this._page.locator('#firstName');
        this._lastNameInput = this._page.locator('#lastName');
        this._emailInput = this._page.locator('#email');
        this._passwordInput = this._page.locator('#password');
        this._confirmPasswordInput = this._page.locator('#confirmPassword');
        this._submitButton = this._page.locator('button[type="submit"]');
    }

    async navigateTo() {
        await this._page.goto('/register');
    }

    async register(firstName: string, lastName: string, email: string, password: string) {
        await this._firstNameInput.fill(firstName);
        await this._lastNameInput.fill(lastName);
        await this._emailInput.fill(email);
        await this._passwordInput.fill(password);
        await this._confirmPasswordInput.fill(password);
        await this._submitButton.click();
    }

    async assertSuccessEmailVisible(email: string) {
        await expect(this._page.getByText(email)).toBeVisible();
    }
}
