# Prompt: Version Compare

## 输入

原始简历：
{{resume_text}}

优化后 Markdown 简历：
{{optimized_resume_markdown}}

模块化建议：
{{module_audit}}

## 任务

生成版本对比说明。说明必须覆盖：

- 哪些表达从职责描述改成了成果描述。
- 哪些地方补充了场景、动作、结果。
- 哪些地方加入 `[待补充：...]`，以及需要补充的原因。
- 有 JD 时，哪些调整服务于岗位匹配。
- 无 JD 时，哪些调整服务于通用校招/实习表达。

## 输出格式

只输出 JSON：

{
  "summary": "",
  "changes": [
    {
      "section": "",
      "before": "",
      "after": "",
      "reason": "",
      "impact": ""
    }
  ],
  "remaining_todos": []
}
