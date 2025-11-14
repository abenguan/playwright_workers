import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test 全局配置：并发、重试、报告、项目与通用浏览器参数
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  workers: '50%',
  retries: 1,
  reporter: [['html'], ['junit', { outputFile: 'test-results/results.xml' }]],
  use: {
    baseURL: 'https://www.saucedemo.com/',
    testIdAttribute: 'data-test',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    /**
     * Chromium 项目（桌面 Chrome 设备配置）
     */
    //grep：包含；grepInver: 不包含；利用标签做用例过滤
    //{ name: 'chromium', use: { ...devices['Desktop Chrome'] },grep:/@login|@performance/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, grepInvert: /@performance/ },
    /**
     * Firefox 项目（桌面 Firefox 设备配置）
     */
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    /**
     * WebKit 项目（桌面 Safari 设备配置）
     */
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // 移动端（Android Chrome）
    //{ name: 'mobile-chromium', use: { ...devices['Pixel 5'] }, grep: /@mobile/ },
    // 移动端（iOS Safari）
    //{ name: 'mobile-webkit', use: { ...devices['iPhone 12'] }, grep: /@mobile/ },
  ],
});
