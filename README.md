# 项目总结：Playwright Test 并发 + POM 登录自动化

## 项目概述
- 技术栈：Playwright Test（TypeScript），直接使用内置并发与隔离能力；POM 页面对象模型。
- 目标：针对 `https://www.saucedemo.com/` 实现登录功能的多场景自动化验证，框架强调可扩展、可维护、稳定性。

## 目录结构
- `pages/`：页面对象层（封装元素操作与断言），例如 `LoginPage.ts`。
- `tests/`：测试用例层（仅调用 POM API），例如 `login.spec.ts`。
- `playwright.config.ts`：全局配置（并发、重试、报告、多浏览器项目与通用超时）。
- `package.json`：项目定义与脚本。
- 产物目录：`test-results/`（原始结果）、`playwright-report/`（HTML 报告）。

## 并发与稳定性策略
- 并发：`workers: '50%'`（可用 CLI `--workers=<n>` 覆盖）；默认每个测试独立浏览器上下文，天然隔离。
- 重试：`retries: 1` 提升在网络或渲染波动下的稳定性。
- 统一等待与超时：`actionTimeout: 15000`、`navigationTimeout: 30000`；避免固定延时。
- 溯源：失败保留 `trace / screenshot / video`，便于问题定位。

## POM 设计（LoginPage）
- 稳定选择器：统一使用 `data-test` 与 `getByTestId('username'|'password'|'login-button')`；错误文案定位 `[data-test="error"]`。
- 主要方法（均含函数级注释）：
  - `goto()`：进入登录页并等待 `domcontentloaded`。
  - `fillUsername(username)` / `fillPassword(password)`：输入凭证。
  - `submit()`：显式等待登录按钮可见/可用后点击。
  - `login(username, password)`：完整登录流程。
  - `expectLoginSuccess()`：断言跳转到 `inventory.html`。
  - `expectLoginError(expectedMsg)`：断言错误文案包含期望文本。

## 用例设计与覆盖
- 套件并行：`Login scenarios`（`test.describe.parallel`）包含 5 个场景：
  - 成功登录：`standard_user + secret_sauce` 跳转到 `inventory.html`。
  - 用户名为空：提示 `Username is required`。
  - 密码为空：提示 `Password is required`。
  - 错误凭证：提示以 `Epic sadface` 开头的错误信息。
  - 锁定用户：提示 `Sorry, this user has been locked out.`。
- 性能场景：`performance_glitch_user` 登录耗时采集并断言不超过 `15000ms`。
- 站点可接受用户名：`standard_user`、`locked_out_user`、`problem_user`、`performance_glitch_user`、`error_user`、`visual_user`。
- 说明：站点真实密码为 `secret_sauce`（为保证成功登录场景通过，测试使用该值；如需改回您最初的口令值，请同步更新用例数据）。

## 配置要点（playwright.config.ts）
- 全局 `use`：
  - `baseURL: 'https://www.saucedemo.com/'`
  - `testIdAttribute: 'data-test'`
  - `actionTimeout: 15000`、`navigationTimeout: 30000`
  - 产物：`trace: 'retain-on-failure'`、`screenshot: 'only-on-failure'`、`video: 'retain-on-failure'`
- 并发与重试：`workers: '50%'`、`retries: 1`。
- 报告：`html` + `junit`（输出至 `test-results/results.xml`）。
- 多浏览器项目：`chromium`、`firefox`、`webkit` 并行。

## 安装与运行
- `npm i -D @playwright/test` 表示安装 Playwright Test 开发依赖。
- `npx playwright install` 表示安装浏览器二进制。
- `npx playwright test --workers=4` 表示以 4 并发运行全部用例。
- `npx playwright test --project=chromium --workers=2 -g "Login scenarios"` 表示在 Chromium 下只运行登录套件。
- `npx playwright test --project=chromium --workers=2 -g "Login scenarios" --reporter=line` 生成行为式报告
- `npx playwright test --project=chromium --workers=2 -g "Login scenarios" --reporter=line,html` 生成行为式报告和html报告
- `npx playwright test --project=chromium --project=firefox --workers=4 -g "Inventory & Cart flows" --reporter=line,html` 表示在 Chromium 和 Firefox 下并发执行库存与购物车套件。
- `npx playwright show-report` 表示打开最新 HTML 报告。

## 验证结果（本地）
- Chromium 下并发执行登录套件：5 用例全部通过。
- 性能用例在本机网络环境下通过，耗时附件可在报告中查看。

## 后续扩展建议
- 扩展 POM：新增库存页、购物车页与业务流用例，测试层仅调用 POM API。
- CI 并发与分片：使用 `--shard=X/Y` 与多项目并行，提高执行吞吐。
- 性能统计：细化耗时阈值并做历史趋势上报，识别性能回归。
