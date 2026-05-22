import { Locator, Page, expect } from "@playwright/test";

export class ProductComponent {
    private readonly _componentBase: Locator;
    private readonly _product: Locator;
    private readonly _productDescription: Locator;
    private readonly _productPrice: Locator;
    
    constructor(componentBase: Locator) {
        const page = componentBase.page();
        this._componentBase = componentBase;
        this._product = page.locator('article');
        this._productDescription = page.locator('.product-description');
        this._productPrice = page.locator('.price');
    }

    async clickProduct(name: string) {
        const product = this.getProductLocator(name);
        await product.click();
    }

    async assertNumberOfProducts(amount: number) {
         await expect(this._componentBase.locator(this._product)).toHaveCount(amount);
    }

    async assertProductPrice(name: string, price: string) {
        await expect(this.getProductLocator(name).locator(this._productPrice)).toHaveText(price);
    }

    private getProductLocator(name: string): Locator {
        return this._componentBase.locator(this._product).filter({ has: this._productDescription.filter({ hasText: name }) });
    }
}