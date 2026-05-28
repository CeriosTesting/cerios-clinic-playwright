import { Locator, Page, expect } from "@playwright/test";
import { MenuItem } from "../enums/MenuItem";

export class MenuPage {
    private readonly _nav: Locator;

    constructor(private readonly _page: Page) {
        this._nav = this._page.getByRole('navigation');
    }

    async navigateTo() {
        await this._page.goto('/');
    }

    async navigateToByMenu(menu: MenuItem) {
        await this._nav.getByRole('link', { name: menu.toString(), exact: true }).click();
    }

    async assertUrlAndTitle(menu: MenuItem) {
        switch (menu) {
            case MenuItem.MyAppointments:
                await expect(this._page).toHaveURL("/appointments");
                break;
            case MenuItem.MedicalHistory:
                await expect(this._page).toHaveURL("/medical-history");
                break;
            case MenuItem.Prescriptions:
                await expect(this._page).toHaveURL("/prescriptions");
                break;
            case MenuItem.OurDoctors:
                await expect(this._page).toHaveURL("/doctors");
                break;
            case MenuItem.Profile:
                await expect(this._page).toHaveURL("/profile");
                break;
        }

        await expect(this._page.locator('h1')).toContainText(menu.toString());
    }
}