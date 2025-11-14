import { Page, expect } from '@playwright/test';

/**
 * 库存页 POM：封装商品添加/移除、徽章数量与进入购物车等操作
 */
export class InventoryPage {
  constructor(private readonly page: Page) {}

  /**
   * 断言当前在库存页（/inventory.html）
   */
  async expectOnInventory(): Promise<void> {
    await expect(this.page).toHaveURL(/.*inventory\.html$/);
  }

  /**
   * 根据商品名添加到购物车（卡片内的“Add to cart”按钮）
   */
  async addItemByName(name: string): Promise<void> {
    const card = this.page.locator('.inventory_item').filter({ hasText: name });
    await expect(card).toBeVisible();
    const addBtn = card.getByRole('button', { name: /Add to cart/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();
  }

  /**
   * 根据商品名从库存页移除（卡片内的“Remove”按钮）
   */
  async removeItemByName(name: string): Promise<void> {
    const card = this.page.locator('.inventory_item').filter({ hasText: name });
    await expect(card).toBeVisible();
    const removeBtn = card.getByRole('button', { name: /Remove/i });
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();
  }

  /**
   * 获取购物车徽章数量（无徽章返回 0）
   */
  async getCartCount(): Promise<number> {
    const badge = this.page.locator('.shopping_cart_badge');
    const visible = await badge.isVisible();
    if (!visible) return 0;
    const text = (await badge.innerText()).trim();
    const n = Number(text);
    return Number.isFinite(n) ? n : 0;
  }

  /**
   * 断言购物车徽章数量为期望值
   */
  async expectCartCount(expected: number): Promise<void> {
    const actual = await this.getCartCount();
    expect(actual).toBe(expected);
  }

  /**
   * 打开购物车页
   */
  async openCart(): Promise<void> {
    const cartLink = this.page.locator('.shopping_cart_link');
    await expect(cartLink).toBeVisible();
    await cartLink.click();
  }

  /**
   * 获取指定商品在库存卡片上的价格（以数字返回，如 29.99）
   */
  async getItemPriceByName(name: string): Promise<number> {
    const card = this.page.locator('.inventory_item').filter({ hasText: name });
    await expect(card).toBeVisible();
    const priceText = (await card.locator('.inventory_item_price').innerText()).trim();
    return Number(priceText.replace(/[^0-9.]/g, ''));
  }

  /**
   * 断言指定商品在库存卡片上的价格
   */
  async expectItemPrice(name: string, expected: number): Promise<void> {
    const actual = await this.getItemPriceByName(name);
    expect(actual).toBeCloseTo(expected, 2);
  }

  /**
   * 批量添加商品到购物车（按商品名）
   */
  async addItemsByNames(names: string[]): Promise<void> {
    for (const n of names) {
      await this.addItemByName(n);
    }
  }

  /**
   * 批量从库存页移除商品（按商品名）
   */
  async removeItemsByNames(names: string[]): Promise<void> {
    for (const n of names) {
      await this.removeItemByName(n);
    }
  }
}
