import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

/**
 * 库存与购物车业务流：添加/移除商品与购物车清单校验
 */
test.describe.parallel('Inventory & Cart flows', () => {
  /**
   * 标准用户：添加两件商品、校验徽章数量、进入购物车校验后移除一件，再返回库存页复核徽章数量
   */
  test('add two items then remove one', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login('standard_user', 'secret_sauce');

    const inv = new InventoryPage(page);
    await inv.expectOnInventory();

    await inv.addItemByName('Sauce Labs Backpack');
    await inv.addItemByName('Sauce Labs Bike Light');
    await inv.expectCartCount(2);

    await inv.openCart();

    const cart = new CartPage(page);
    await cart.expectOnCart();
    await cart.expectItemPresent('Sauce Labs Backpack');
    await cart.expectItemPresent('Sauce Labs Bike Light');

    await cart.removeItemByName('Sauce Labs Bike Light');
    await cart.continueShopping();

    await inv.expectOnInventory();
    await inv.expectCartCount(1);
  });

  /**
   * 标准用户：只添加一件商品并校验购物车清单
   */
  test('add single item and verify cart list', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login('standard_user', 'secret_sauce');

    const inv = new InventoryPage(page);
    await inv.expectOnInventory();

    await inv.addItemByName('Sauce Labs Fleece Jacket');
    await inv.expectCartCount(1);
    await inv.openCart();

    const cart = new CartPage(page);
    await cart.expectOnCart();
    await cart.expectItemPresent('Sauce Labs Fleece Jacket');
  });
});
