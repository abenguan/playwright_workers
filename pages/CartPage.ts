import { Page, expect } from '@playwright/test';

/**
 * 购物车页 POM：封装购物车商品列表、移除与返回库存页操作
 */
export class CartPage {
  constructor(private readonly page: Page) {}

  /**
   * 断言当前在购物车页（/cart.html）
   */
  async expectOnCart(): Promise<void> {
    await expect(this.page).toHaveURL(/.*cart\.html$/);
  }

  /**
   * 返回购物车中商品名称列表
   */
  async listItems(): Promise<string[]> {
    const items = this.page.locator('.cart_item .inventory_item_name');
    const count = await items.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push((await items.nth(i).innerText()).trim());
    }
    return result;
  }

  /**
   * 断言购物车包含指定商品名
   */
  async expectItemPresent(name: string): Promise<void> {
    const item = this.page.locator('.cart_item').filter({ hasText: name });
    await expect(item).toBeVisible();
  }

  /**
   * 从购物车移除指定商品（卡片内的“Remove”按钮）
   */
  async removeItemByName(name: string): Promise<void> {
    const item = this.page.locator('.cart_item').filter({ hasText: name });
    await expect(item).toBeVisible();
    const removeBtn = item.getByRole('button', { name: /Remove/i });
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();
  }

  /**
   * 继续购物（返回库存页）
   */
  async continueShopping(): Promise<void> {
    const btn = this.page.getByRole('button', { name: /Continue Shopping/i });
    await expect(btn).toBeVisible();
    await btn.click();
  }

  /**
   * 获取购物车中商品数量
   */
  async getCartItemsCount(): Promise<number> {
    return await this.page.locator('.cart_item').count();
  }

  /**
   * 断言购物车中商品数量
   */
  async expectCartItemsCount(expected: number): Promise<void> {
    const count = await this.getCartItemsCount();
    expect(count).toBe(expected);
  }

  /**
   * 获取购物车中指定商品的价格（数字）
   */
  async getCartItemPriceByName(name: string): Promise<number> {
    const item = this.page.locator('.cart_item').filter({ hasText: name });
    await expect(item).toBeVisible();
    const priceText = (await item.locator('.inventory_item_price').innerText()).trim();
    return Number(priceText.replace(/[^0-9.]/g, ''));
  }

  /**
   * 断言购物车中指定商品的价格
   */
  async expectCartItemPrice(name: string, expected: number): Promise<void> {
    const actual = await this.getCartItemPriceByName(name);
    expect(actual).toBeCloseTo(expected, 2);
  }

  /**
   * 点击结算按钮，进入结算信息页
   */
  async proceedToCheckout(): Promise<void> {
    const btn = this.page.getByRole('button', { name: /Checkout/i });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(this.page).toHaveURL(/.*checkout-step-one\.html$/);
  }

  /**
   * 填写结算信息（第一步），并继续到概览页
   */
  async fillCheckoutInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.page.getByTestId('firstName').fill(firstName);
    await this.page.getByTestId('lastName').fill(lastName);
    await this.page.getByTestId('postalCode').fill(postalCode);
    await this.page.getByTestId('continue').click();
    await expect(this.page).toHaveURL(/.*checkout-step-two\.html$/);
  }

  /**
   * 读取概览页的小计、税额与总计
   */
  async getSummaryPrices(): Promise<{ subtotal: number; tax: number; total: number }> {
    const subText = (await this.page.locator('.summary_subtotal_label').innerText()).trim();
    const taxText = (await this.page.locator('.summary_tax_label').innerText()).trim();
    const totalText = (await this.page.locator('.summary_total_label').innerText()).trim();
    const parseNum = (t: string) => Number(t.replace(/[^0-9.]/g, ''));
    return { subtotal: parseNum(subText), tax: parseNum(taxText), total: parseNum(totalText) };
  }

  /**
   * 断言总计数值
   */
  async expectSummaryTotal(expected: number): Promise<void> {
    const { total } = await this.getSummaryPrices();
    expect(total).toBeCloseTo(expected, 2);
  }

  /**
   * 完成结算并断言完成页
   */
  async finishCheckout(): Promise<void> {
    await this.page.getByTestId('finish').click();
    await expect(this.page).toHaveURL(/.*checkout-complete\.html$/);
    await expect(this.page.locator('.complete-header')).toHaveText(/Thank you for your order!/i);
  }
}
