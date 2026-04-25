# 开发说明

## 1. 任务目标

请开发一款名为「大学生求职陪跑助手」的 Web 应用。该应用面向泛大学生，提供简历上传、JD 可选输入、AI 诊断报告、模块化修改建议、Markdown 优化简历、本地历史和后续追问能力。

材料是自包含的。无需读取任何外部工作流、聊天记录或其他附件。

## 2. 必读文件

1. `docs/PRODUCT_SPEC.md`：完整产品需求。
2. `docs/IMPLEMENTATION_CHECKLIST.md`：验收清单。
3. `prompts/README.md`：AI prompt 调用顺序。
4. `prompts/*.md`：DeepSeek 调用模板。

## 3. 已确认决策

- 产品名称：大学生求职陪跑助手。
- 前端：Next.js。
- 后端：FastAPI。
- AI：DeepSeek API。
- 频控和临时任务存储：SQLite。
- 本地历史：浏览器 IndexedDB。
- 文件格式：PDF、DOCX、TXT、MD、文本粘贴。
- 单文件最大：10MB。
- 单次分析：1 份简历 + 1 个 JD。
- JD：建议填写但不强制。
- 展示方式：进度页展示阶段，完成后一次性展示报告。
- 导出：复制 Markdown、复制纯文本、下载 `.md`。
- 不做：PDF 导出、会员、后台、云端账号、OCR。

## 4. 后端必须实现

- `GET /api/quota`：返回当前 IP 剩余额度。
- `POST /api/analysis/start`：创建完整分析任务。
- `GET /api/analysis/{task_id}`：查询任务状态和结果。
- `POST /api/chat`：后续追问。
- 文件解析服务：输出 `{ text, file_type, warnings }`。
- DeepSeek 代理服务：读取 prompt 模板，替换变量，调用 DeepSeek。
- IP 频控：
  - 每 IP 每天 1 次完整分析。
  - 每 IP 每天 20 次追问。
  - 每 IP 每分钟 1 次完整分析提交。
- 临时清理：
  - 上传文件分析完成后立即删除。
  - 异常任务 24 小时清理。

## 5. 前端必须实现

- 上传页：文件上传、文本粘贴、目标岗位、JD、求职类型、额度展示。
- 分析进度页：阶段状态、失败重试、完成跳转。
- 审计报告页：总览、评分、模块建议、有 JD/无 JD 差异展示。
- 改写编辑器页：Markdown 编辑、实时预览、本地版本保存。
- 版本对比页：原始内容、优化内容、修改原因。
- 导出页：复制 Markdown、复制纯文本、下载 `.md`。
- 本地历史：IndexedDB 保存、打开、删除、清空。
- 后续追问：额度检查、发送问题、保存记录。

## 6. 安全约束

- DeepSeek API Key 只能存在后端环境变量 `DEEPSEEK_API_KEY`。
- 前端不得直接调用 DeepSeek API。
- 前端不得使用 `NEXT_PUBLIC_*` 保存任何 AI API Key。
- 浏览器开发者工具中不能看到 DeepSeek API Key。
- 日志、接口响应、错误信息中不能输出 API Key。
- Git 仓库中不能出现真实密钥或真实密钥样例。

## 7. 验收标准

- 支持 DOCX/TXT/MD 和文本型 PDF 的文字提取。
- 扫描版 PDF 解析失败时给出明确提示。
- 无 JD 时能生成通用校招/实习诊断，不展示岗位匹配度。
- 有 JD 时能展示岗位匹配度、关键词覆盖和岗位差距。
- 能生成 Markdown 优化简历并预览。
- 能复制 Markdown、复制纯文本、下载 `.md`。
- IP 频控生效。
- 额度用完后仍可查看本地历史。
- AI 输出不编造经历、成绩、公司、奖项、证书或数据。
- Prompt 模板集中管理在 `prompts/`。
