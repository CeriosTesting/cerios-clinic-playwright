import { expect, Page } from "@playwright/test";
import { DoctorComponent } from "./componentObjects/doctor-component";
import AxeBuilder from "@axe-core/playwright";

export class HomePage {
    private readonly _doctors: DoctorComponent;

    constructor(private readonly _page: Page) {
        this._doctors = new DoctorComponent(this._page.locator('.max-w-3xl'));
    }

    public get doctors(): DoctorComponent {
        return this._doctors;
    }

    async navigateTo() {
        await this._page.goto('/');
    }

    async navigateToDoctors() {
        await this._page.goto('/doctors');
    }

    async assertGreeting() {
        await expect(this._page.getByRole('heading', { level: 1 })).toContainText('Good day,');
    }

    async assertQuickActionCount(amount: number) {
        await expect(this._page.locator('.card')).toHaveCount(amount);
    }

    async assertAccessibility() {
        const accessibilityScanResults = await new AxeBuilder({ page: this._page })
            .disableRules(['color-contrast'])
            .analyze();
        expect(accessibilityScanResults.violations).toEqual([]);
    }
}