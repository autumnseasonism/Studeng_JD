# Prompt: Module Audit

## 输入

简历文本：
{{resume_text}}

JD 分析结果：
{{jd_analysis}}

整体诊断：
{{diagnosis_report}}

## 任务

按模块审查简历。可识别模块包括：

- 基本信息
- 教育背景
- 实习经历
- 项目经历
- 科研或竞赛经历
- 校园、社团或志愿经历
- 技能证书
- 个人总结

不存在的模块不得编造内容。可建议新增模块，并说明新增原因。

每条建议必须包含：

- `module`：模块名称。
- `original_text`：原始片段；无法定位时为空字符串。
- `issue`：问题。
- `impact`：该问题对简历效果的影响。
- `suggestion`：修改方向。
- `rewrite_example`：忠于原始信息的示例改写。
- `missing_info`：用户需要补充的信息。
- `priority`：high、medium、low。

## 输出格式

只输出 JSON：

{
  "items": [
    {
      "module": "",
      "original_text": "",
      "issue": "",
      "impact": "",
      "suggestion": "",
      "rewrite_example": "",
      "missing_info": [],
      "priority": "medium"
    }
  ],
  "suggested_new_sections": [],
  "global_notes": []
}
