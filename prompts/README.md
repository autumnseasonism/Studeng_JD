# AI Prompt 模板说明

这些文件是「大学生求职陪跑助手」第一版的 AI 工作流提示词模板，供后端 DeepSeek 调用。

## 调用顺序

1. `00_system_resume_coach.md`：所有调用共用系统角色。
2. `01_jd_analysis.md`：分析 JD；JD 为空时返回 `has_jd=false`。
3. `02_resume_diagnosis.md`：生成整体诊断。
4. `03_module_audit.md`：生成模块化建议。
5. `04_resume_rewrite_markdown.md`：生成 Markdown 简历。
6. `05_version_compare.md`：生成版本对比说明。
7. `06_followup_chat.md`：处理后续追问。

## 变量约定

- `{{resume_text}}`：提取出的简历文本。
- `{{job_description}}`：用户填写的 JD，可为空。
- `{{job_target}}`：目标岗位，可为空。
- `{{job_type}}`：实习、校招、转专业、早期求职。
- `{{jd_analysis}}`：JD 分析 JSON。
- `{{diagnosis_report}}`：整体诊断 JSON。
- `{{module_audit}}`：模块建议 JSON。
- `{{optimized_resume_markdown}}`：优化后的 Markdown 简历。
- `{{version_compare}}`：版本对比 JSON。
- `{{conversation_history}}`：本地历史中的追问记录。
- `{{user_message}}`：用户当前追问。

## 输出规则

- JSON 类 prompt 只输出 JSON，不包裹 Markdown 代码块。
- Markdown 类 prompt 只输出指定 Markdown，不附加无关解释。
- 缺失事实必须写为 `[待补充：说明需要补充的信息]`。
- 不生成虚构经历、公司、奖项、成绩、证书、数据。
- 未提供 JD 时，不输出岗位匹配度。
