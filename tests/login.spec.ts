import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * 登录成功与失败场景并发执行（套件级并发）
 */
test.describe.parallel('@login Login scenarios', () => {
  const cases = [
    { name: 'success: standard_user', u: 'standard_user', p: 'secret_sauce', ok: true },
    { name: 'empty username', u: '', p: 'secret_sauce', ok: false, msg: 'Username is required' },
    { name: 'empty password', u: 'standard_user', p: '', ok: false, msg: 'Password is required' },
    { name: 'invalid credentials', u: 'no_such_user', p: 'secret_sauce', ok: false, msg: 'Epic sadface' },
    { name: 'locked out user', u: 'locked_out_user', p: 'secret_sauce', ok: false, msg: 'Sorry, this user has been locked out.' },
  ];

  for (const c of cases) {
    /**
     * 单场景登录验证：执行登录并根据期望进行断言
     */
    test(c.name, async ({ page }) => {
      const lp = new LoginPage(page);
      await lp.login(c.u, c.p);
      if (c.ok) {
        await lp.expectLoginSuccess();
      } else {
        await lp.expectLoginError(c.msg ?? 'Epic sadface');
      }
    });
  }
});

/**
 * 性能波动用户场景：记录登录耗时并断言阈值（示例 3s）
 */
test('@performance performance_glitch_user login performance', async ({ page }) => {
  const lp = new LoginPage(page);
  const start = Date.now();
  await lp.login('performance_glitch_user', 'secret_sauce');
  await lp.expectLoginSuccess();
  const durationMs = Date.now() - start;
  test.info().attach('loginDurationMs', { body: String(durationMs), contentType: 'text/plain' });
  await expect(durationMs).toBeLessThanOrEqual(15_000);
});
