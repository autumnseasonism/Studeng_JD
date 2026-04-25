# Prompt: Resume Rewrite Markdown

## 输入

简历文本：
{{resume_text}}

JD 分析结果：
{{jd_analysis}}

整体诊断：
{{diagnosis_report}}

模块化建议：
{{module_audit}}

## 任务

生成一份 Markdown 简历。必须满足：

- 只使用用户原始简历和用户已提供的信息。
- 缺失但影响表达的信息写为 `[待补充：说明要补什么]`。
- 使用清晰的简历结构。
- 将流水账表达改写为“场景/任务 + 动作 + 结果”的表达。
- 有 JD 时优先呈现与 JD 相关的经历和关键词。
- 无 JD 时按通用校招/实习标准组织内容。

默认结构：

# 姓名

电话｜邮箱｜城市｜作品集/GitHub/个人主页

## 求职目标

## 教育背景

## 实习经历

## 项目经历

## 校园/竞赛/科研经历

## 技能与证书

## 其他补充

## 输出格式

只输出 JSON：

{
  "markdown": "",
  "placeholders": [
    {
      "placeholder": "[待补充：...]",
      "why_needed": ""
    }
  ],
  "rewrite_notes": []
}
