import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

/**
 * 结算业务流：价格校验、结算流程与总价断言（仅调用 POM API）
 */
test.describe.parallel('Checkout flows', () => {
  /**
   * 添加两件商品，校验库存价与购物车价一致；结算并校验总价为小计+税额；完成订单
   */
  test('add two items and checkout with price assertions', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login('standard_user', 'secret_sauce');

    const inv = new InventoryPage(page);
    await inv.expectOnInventory();

    const items = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
    await inv.addItemsByNames(items);
    await inv.expectCartCount(2);

    const priceInv1 = await inv.getItemPriceByName(items[0]);
    const priceInv2 = await inv.getItemPriceByName(items[1]);

    await inv.openCart();

    const cart = new CartPage(page);
    await cart.expectOnCart();
    await cart.expectCartItemsCount(2);

    await cart.expectItemPresent(items[0]);
    await cart.expectItemPresent(items[1]);

    await cart.expectCartItemPrice(items[0], priceInv1);
    await cart.expectCartItemPrice(items[1], priceInv2);

    await cart.proceedToCheckout();
    await cart.fillCheckoutInformation('John', 'Doe', '12345');

    const { subtotal, tax, total } = await cart.getSummaryPrices();
    const computed = priceInv1 + priceInv2 + tax;
    expect(total).toBeCloseTo(computed, 2);

    await cart.finishCheckout();
  });
});
