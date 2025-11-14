import { Page, expect } from '@playwright/test';

/**
 * 登录页面 POM，对登录流程、元素操作与断言进行封装
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  /**
   * 进入登录页（使用全局 baseURL 的根路径）
   */
  async goto(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  /**
   * 填写用户名
   */
  async fillUsername(username: string): Promise<void> {
    await this.page.getByTestId('username').fill(username);
  }

  /**
   * 填写密码
   */
  async fillPassword(password: string): Promise<void> {
    await this.page.getByTestId('password').fill(password);
  }

  /**
   * 点击登录按钮
   */
  async submit(): Promise<void> {
    const btn = this.page.getByTestId('login-button');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await btn.click();
  }

  /**
   * 执行完整登录流程
   */
  async login(username: string, password: string): Promise<void> {
    await this.goto();
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }

  /**
   * 断言登录成功（跳转到库存页 inventory.html）
   */
  async expectLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/.*inventory\.html$/);
  }

  /**
   * 断言登录失败错误文案包含期望文本
   */
  async expectLoginError(expectedMsg: string): Promise<void> {
    const error = this.page.locator('[data-test="error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText(expectedMsg);
  }
}
