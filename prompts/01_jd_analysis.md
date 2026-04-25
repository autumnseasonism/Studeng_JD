# Prompt: JD Analysis

## 输入

目标岗位：
{{job_target}}

JD 内容：
{{job_description}}

求职类型：
{{job_type}}

## 任务

分析目标岗位和 JD。若 JD 为空或有效信息少于 30 个中文字符，返回 `has_jd=false`。

若 JD 有效，提取以下内容：

- 岗位名称
- 岗位类型
- 硬技能要求
- 软技能要求
- 业务或行业关键词
- 优先级最高的 5 个匹配点
- 简历应重点呈现的经历类型
- 大学生可用来证明匹配度的素材方向

## 输出格式

只输出 JSON：

{
  "has_jd": true,
  "job_title": "",
  "job_category": "",
  "hard_skills": [],
  "soft_skills": [],
  "industry_keywords": [],
  "top_match_points": [],
  "recommended_resume_focus": [],
  "student_evidence_suggestions": [],
  "unknowns": []
}

JD 无效时输出：

{
  "has_jd": false,
  "reason": "未提供目标岗位或 JD 信息不足，无法判断岗位匹配度。",
  "unknowns": ["目标岗位", "岗位职责", "任职要求"]
}
