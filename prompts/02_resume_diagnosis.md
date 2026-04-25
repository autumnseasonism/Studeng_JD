# Prompt: Resume Diagnosis

## 输入

简历文本：
{{resume_text}}

JD 分析结果：
{{jd_analysis}}

求职类型：
{{job_type}}

## 任务

生成整体诊断。诊断必须包含：

- 整体竞争力评分，0-100。
- 竞争力等级，取值为：需要补强、基础可用、具备竞争力、表现突出。
- 100 字以内总结。
- 主要亮点。
- 主要风险。
- 信息完整度评分与说明。
- 经历表达质量评分与说明。
- 可信度评分与说明。
- 3 个优先修改动作。

若 `jd_analysis.has_jd=true`，必须输出岗位匹配度、已覆盖关键词、缺失关键词、主要差距。

若 `jd_analysis.has_jd=false`，`job_alignment` 必须为 `null`，并在 `summary` 中说明当前为通用校招/实习诊断。

## 输出格式

只输出 JSON：

{
  "has_jd": false,
  "overall_score": 0,
  "competitiveness_level": "",
  "summary": "",
  "strengths": [],
  "risks": [],
  "completeness": {
    "score": 0,
    "comment": ""
  },
  "expression_quality": {
    "score": 0,
    "comment": ""
  },
  "credibility": {
    "score": 0,
    "comment": ""
  },
  "job_alignment": null,
  "priority_actions": [],
  "unknowns": []
}

有 JD 时，`job_alignment` 使用：

{
  "score": 0,
  "comment": "",
  "covered_keywords": [],
  "missing_keywords": [],
  "main_gaps": []
}
