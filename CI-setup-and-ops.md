# CI 部署与操作指南（GitHub Actions + Jenkins 分片合并）

## 概览
- 代码仓库：`https://github.com/abenguan/playwright_workers.git`
- 测试框架：Playwright Test（TypeScript），并发与分片执行，合并 HTML 报告
- CI 目标：
  - 代码推送到 GitHub 后，Jenkins 拉取最新代码
  - Jenkins 并行分片执行用例，生成 `blob` 报告
  - 合并所有分片报告为统一的 `playwright-report`（HTML 报告），归档与查看

## 关键文件与位置
- GitHub Actions 工作流：`/.github/workflows/playwright.yml`
- Jenkins Pipeline：`/Jenkinsfile`
- Playwright 配置：`/playwright.config.ts`
- 测试与页面对象：`/tests`、`/pages`

## GitHub Actions（云端参考方案）
- 分片数：2
- 报告合并采用“单目录参数”变体，兼容只接受单目录的 `merge-reports`
- 主要步骤：
  - `actions/checkout`、`actions/setup-node@v4` 安装 Node 20
  - `npm ci`、`npx playwright install --with-deps`
  - 分片执行：`npx playwright test --shard=${{ matrix.shard }}/2 --workers=100% --reporter=blob`
  - 下载两个分片工件后，移动 `*.zip` 到 `blob-all/` 并合并：
    - `npx playwright merge-reports --reporter=html blob-all`
  - 上传 `playwright-report` 为工件

## Jenkins（本地内网 CI）
### 作业配置
- 类型：Pipeline（从 SCM 读取 Jenkinsfile）
- SCM：Git
  - Repository URL：`https://github.com/abenguan/playwright_workers.git`
  - Branch：`main` 或指定分支（示例为 `V20251114`）
  - Script Path：`Jenkinsfile`
- 触发器：Poll SCM（轮询 Git 变更）
  - 在 Jenkinsfile 中配置：`pollSCM('H/5 * * * *')`（每 5 分钟）
- 环境 PATH 注入（macOS）：
  - `environment { PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}" }`
  - 说明：确保 Jenkins 的非交互 shell 能找到 `node/npm`

### Pipeline 阶段说明
- Install 阶段：
  - `echo $PATH && node -v && npm -v` 表示输出路径与版本信息
  - `npm ci` 表示安装项目依赖
  - `npx playwright install --with-deps` 表示安装浏览器与依赖
- Test Shards 阶段（并行 2 片，降低资源争抢）：
  - 分片 1：`npx playwright test --project=chromium --shard=1/2 --workers=50% --reporter=blob`
  - 分片 2：`npx playwright test --project=chromium --shard=2/2 --workers=50% --reporter=blob`
  - 生成的 `blob-report/*.zip` 复制到各自目录并 `stash`：
    - `mkdir -p blob-zip-1 && cp blob-report/*.zip blob-zip-1/`
    - `stash includes: 'blob-zip-1/**', name: 'blob-zip-1'`
    - `mkdir -p blob-zip-2 && cp blob-report/*.zip blob-zip-2/`
    - `stash includes: 'blob-zip-2/**', name: 'blob-zip-2'`
- Merge Report 阶段（合并单目录变体）：
  - `mkdir -p blob-all` 表示创建合并目录
  - `unstash 'blob-zip-1'` 与 `unstash 'blob-zip-2'` 表示取回分片工件
  - `mv blob-zip-1/*.zip blob-all/ || true` 与 `mv blob-zip-2/*.zip blob-all/ || true` 表示移动 zip 文件到单目录
  - `npx playwright merge-reports --reporter=html blob-all` 表示基于单目录合并为 HTML 报告
  - `archiveArtifacts artifacts: 'playwright-report/**'` 表示归档报告

## 端到端流程（从代码提交到报告）
1. 开发者将代码提交到 GitHub 仓库（`main` 或指定分支）
2. Jenkins 通过 Poll SCM 在 5 分钟内检测到变更并触发构建
3. Jenkins 拉取仓库并执行 Pipeline：
   - Install 阶段安装依赖与浏览器运行时
   - Test Shards 阶段并行运行两片测试并生成 `blob-report` zip
   - Merge Report 阶段合并 zip 为 `playwright-report`（HTML 报告）
4. 构建完成后，Jenkins 构建详情的 Artifacts 中可下载或查看报告目录

## 本地验证命令与说明
- 生成分片报告（示例两片）：
  - `npx playwright test --project=chromium --workers=2 --reporter=blob -g "Login scenarios"` 表示运行登录套件并生成 `blob-report`
  - `mv blob-report blob-report-1` 表示保存为第一片报告
  - `npx playwright test --project=chromium --workers=2 --reporter=blob -g "Checkout flows"` 表示运行结算用例并生成 `blob-report`
  - `mv blob-report blob-report-2` 表示保存为第二片报告
- 合并为 HTML 报告（单目录参数）：
  - `mkdir -p blob-all && mv blob-report-1/*.zip blob-all/ && mv blob-report-2/*.zip blob-all/` 表示汇总 zip 到单目录
  - `npx playwright merge-reports --reporter=html blob-all` 表示合并为 `playwright-report`
  - `npx playwright show-report` 表示预览最新报告（默认端口 `http://localhost:9323/`）

## 常见问题与排查
- `npm: command not found`：
  - 原因：Jenkins 非交互环境未加载用户 PATH；解决：在 Jenkinsfile 注入 `/opt/homebrew/bin:/usr/local/bin` 至 PATH
- 合并失败“未找到报告文件”：
  - 原因：分片未生成 zip 或移动路径错误；解决：检查分片日志有无 `blob-report/report-*.zip`，确保移动到 `blob-all/`
- 分片资源争抢导致波动：
  - 建议：分片数与 `--workers` 与机器核数匹配（例如 2 片，`--workers=50%`）

## 成功日志示例（摘要）
- 分片执行：
  - `Running 4 tests using 4 workers, shard 1 of 2`
  - `Running 4 tests using 4 workers, shard 2 of 2`
  - `4 passed`（两片均通过）
- 合并报告：
  - `npx playwright merge-reports --reporter=html blob-all`
  - `building final report`
  - `finished building report`
- 构建结果：`Finished: SUCCESS`

## 建议与扩展
- 若后续需要更实时触发，考虑为 Jenkins 配置公开 Webhook；或使用云端 Actions 直接并行分片与合并
- 如需限制浏览器项目，命令中添加 `--project=chromium --project=firefox` 等过滤
- 如需发布报告到静态站点（GitHub Pages/Jenkins HTML Publisher），在合并后增加发布步骤
