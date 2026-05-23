import { expect, Page } from "@playwright/test";

export class DoctorsPage {
    private readonly _doctorCard;

    constructor(private readonly _page: Page) {
        this._doctorCard = this._page.locator('.card');
    }

    async assertDoctorCount(amount: number) {
        await expect(this._doctorCard).toHaveCount(amount);
    }

    async assertDoctorSpecialization(name: string, specialization: string) {
        await expect(this._doctorCard.filter({ hasText: name }).getByText(specialization)).toBeVisible();
    }
}
