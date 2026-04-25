import os
import json
import aiohttp
from app.core.config import settings

async def analyze_resume(
    resume_text: str,
    job_target: str = None,
    job_description: str = None,
    job_type: str = "实习"
) -> dict:
    """使用DeepSeek分析简历
    
    Args:
        resume_text: 简历文本
        job_target: 目标岗位
        job_description: 岗位描述
        job_type: 求职类型
    
    Returns:
        dict: 分析结果
    """
    try:
        # 读取prompt模板
        prompts_dir = "/workspace/prompts"
        
        # 系统提示
        with open(os.path.join(prompts_dir, "00_system_resume_coach.md"), "r", encoding="utf-8") as f:
            system_prompt = f.read()
        
        # 构建messages
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # JD分析（如果有JD）
        if job_description:
            with open(os.path.join(prompts_dir, "01_jd_analysis.md"), "r", encoding="utf-8") as f:
                jd_prompt = f.read()
            
            jd_prompt = jd_prompt.replace("{{job_description}}", job_description)
            jd_prompt = jd_prompt.replace("{{job_target}}", job_target or "")
            jd_prompt = jd_prompt.replace("{{job_type}}", job_type)
            
            messages.append({"role": "user", "content": jd_prompt})
        
        # 简历诊断
        with open(os.path.join(prompts_dir, "02_resume_diagnosis.md"), "r", encoding="utf-8") as f:
            diagnosis_prompt = f.read()
        
        diagnosis_prompt = diagnosis_prompt.replace("{{resume_text}}", resume_text)
        diagnosis_prompt = diagnosis_prompt.replace("{{job_target}}", job_target or "")
        diagnosis_prompt = diagnosis_prompt.replace("{{job_type}}", job_type)
        
        messages.append({"role": "user", "content": diagnosis_prompt})
        
        # 模块审计
        with open(os.path.join(prompts_dir, "03_module_audit.md"), "r", encoding="utf-8") as f:
            audit_prompt = f.read()
        
        audit_prompt = audit_prompt.replace("{{resume_text}}", resume_text)
        audit_prompt = audit_prompt.replace("{{job_target}}", job_target or "")
        audit_prompt = audit_prompt.replace("{{job_type}}", job_type)
        
        messages.append({"role": "user", "content": audit_prompt})
        
        # 简历改写
        with open(os.path.join(prompts_dir, "04_resume_rewrite_markdown.md"), "r", encoding="utf-8") as f:
            rewrite_prompt = f.read()
        
        rewrite_prompt = rewrite_prompt.replace("{{resume_text}}", resume_text)
        rewrite_prompt = rewrite_prompt.replace("{{job_target}}", job_target or "")
        rewrite_prompt = rewrite_prompt.replace("{{job_type}}", job_type)
        
        messages.append({"role": "user", "content": rewrite_prompt})
        
        # 版本对比
        with open(os.path.join(prompts_dir, "05_version_compare.md"), "r", encoding="utf-8") as f:
            compare_prompt = f.read()
        
        compare_prompt = compare_prompt.replace("{{resume_text}}", resume_text)
        compare_prompt = compare_prompt.replace("{{job_target}}", job_target or "")
        compare_prompt = compare_prompt.replace("{{job_type}}", job_type)
        
        messages.append({"role": "user", "content": compare_prompt})
        
        # 调用DeepSeek API
        response = await call_deepseek_api(messages)
        
        # 解析响应
        analysis_result = {
            "has_jd": bool(job_description),
            "jd_analysis": {},
            "diagnosis_report": {},
            "module_audit": {},
            "optimized_resume": {},
            "version_compare": {}
        }
        
        # 这里需要根据实际的API响应格式进行解析
        # 暂时返回模拟数据
        analysis_result["optimized_resume"] = {
            "markdown": f"# 优化后的简历\n\n## 基本信息\n\n## 教育背景\n\n## 实习经历\n\n## 项目经历\n\n## 技能证书\n\n## 个人总结"
        }
        
        return analysis_result
        
    except Exception as e:
        raise Exception(f"DeepSeek分析失败: {str(e)}")

async def chat_with_deepseek(
    message: str,
    analysis_result: dict = None,
    resume_markdown: str = None
) -> str:
    """与DeepSeek进行后续追问
    
    Args:
        message: 用户问题
        analysis_result: 分析结果
        resume_markdown: 优化后的简历Markdown
    
    Returns:
        str: 回答
    """
    try:
        # 读取prompt模板
        prompts_dir = "/workspace/prompts"
        
        # 系统提示
        with open(os.path.join(prompts_dir, "00_system_resume_coach.md"), "r", encoding="utf-8") as f:
            system_prompt = f.read()
        
        # 后续追问提示
        with open(os.path.join(prompts_dir, "06_followup_chat.md"), "r", encoding="utf-8") as f:
            followup_prompt = f.read()
        
        # 构建messages
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # 构建用户消息
        user_message = followup_prompt
        user_message = user_message.replace("{{user_question}}", message)
        user_message = user_message.replace("{{resume_markdown}}", resume_markdown or "")
        
        messages.append({"role": "user", "content": user_message})
        
        # 调用DeepSeek API
        response = await call_deepseek_api(messages)
        
        # 解析响应
        return response
        
    except Exception as e:
        raise Exception(f"DeepSeek聊天失败: {str(e)}")

async def call_deepseek_api(messages: list) -> str:
    """调用DeepSeek API
    
    Args:
        messages: 消息列表
    
    Returns:
        str: API响应
    """
    if not settings.deepseek_api_key:
        # 模拟响应，实际部署时需要设置API Key
        return "这是一个模拟的DeepSeek API响应。在实际部署时，请在环境变量中设置DEEPSEEK_API_KEY。"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.deepseek_api_key}"
    }
    
    data = {
        "model": "deepseek-chat",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2000
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            settings.deepseek_api_url,
            headers=headers,
            json=data,
            timeout=aiohttp.ClientTimeout(total=60)
        ) as response:
            if response.status != 200:
                raise Exception(f"API调用失败: {await response.text()}")
            
            result = await response.json()
            return result["choices"][0]["message"]["content"]