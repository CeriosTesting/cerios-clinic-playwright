import { Locator, expect } from "@playwright/test";

export class DoctorComponent {
    private readonly _doctorCard: Locator;

    constructor(componentBase: Locator) {
        this._doctorCard = componentBase.locator('.card');
    }

    async assertDoctorCount(amount: number) {
        await expect(this._doctorCard).toHaveCount(amount);
    }

    async assertDoctorSpecialization(name: string, specialization: string) {
        await expect(this.getDoctorLocator(name).getByText(specialization)).toBeVisible();
    }

    async clickDoctor(name: string) {
        await this.getDoctorLocator(name).click();
    }

    private getDoctorLocator(name: string): Locator {
        return this._doctorCard.filter({ hasText: name });
    }
}
