from fastapi import APIRouter, Request, UploadFile, File, Form
from pydantic import BaseModel
import uuid
from datetime import datetime
from app.core.db import get_db_connection
from app.core.config import settings
from app.services.file_parser import parse_file
from app.services.deepseek import analyze_resume
import os

router = APIRouter()

class AnalysisRequest(BaseModel):
    resume_text: str = None
    job_target: str = None
    job_description: str = None
    job_type: str = "实习"

class AnalysisTask(BaseModel):
    task_id: str
    status: str
    stage: str
    created_at: str
    error_code: str = None
    error_message: str = None

@router.post("/analysis/start", response_model=AnalysisTask)
async def start_analysis(
    request: Request,
    resume_text: str = Form(None),
    job_target: str = Form(None),
    job_description: str = Form(None),
    job_type: str = Form("实习"),
    file: UploadFile = File(None)
):
    # 获取客户端IP
    client_ip = request.client.host
    
    # 连接数据库
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 检查IP额度
    cursor.execute("SELECT * FROM ip_quota WHERE ip = ?", (client_ip,))
    result = cursor.fetchone()
    
    now = datetime.now()
    reset_time = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
    
    if not result:
        # 新IP，初始化记录
        cursor.execute(
            "INSERT INTO ip_quota (ip, analysis_count, chat_count, reset_time) VALUES (?, ?, ?, ?)",
            (client_ip, 0, 0, reset_time.isoformat())
        )
        conn.commit()
        analysis_count = 0
        last_analysis_time = None
    else:
        # 检查是否需要重置
        reset_time_db = datetime.fromisoformat(result[5])
        if now >= reset_time_db:
            # 重置额度
            cursor.execute(
                "UPDATE ip_quota SET analysis_count = 0, chat_count = 0, reset_time = ? WHERE ip = ?",
                (reset_time.isoformat(), client_ip)
            )
            conn.commit()
            analysis_count = 0
            last_analysis_time = None
        else:
            analysis_count = result[2]
            last_analysis_time = result[4]
    
    # 检查分析次数限制
    if analysis_count >= settings.max_analysis_per_day:
        conn.close()
        raise HTTPException(status_code=429, detail="今日分析次数已用完")
    
    # 检查每分钟分析限制
    if last_analysis_time:
        last_time = datetime.fromisoformat(last_analysis_time)
        if (now - last_time).total_seconds() < 60:
            conn.close()
            raise HTTPException(status_code=429, detail="请每分钟只提交一次分析")
    
    # 解析文件或使用文本
    extracted_text = resume_text
    file_type = "text"
    warnings = []
    
    if file:
        # 保存文件
        file_path = os.path.join(settings.upload_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        # 解析文件
        try:
            result = parse_file(file_path)
            extracted_text = result["text"]
            file_type = result["file_type"]
            warnings = result.get("warnings", [])
        finally:
            # 删除上传文件
            if os.path.exists(file_path):
                os.remove(file_path)
    
    # 创建任务
    task_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO analysis_task (task_id, ip, status, stage, created_at) VALUES (?, ?, ?, ?, ?)",
        (task_id, client_ip, "pending", "extracting", now.isoformat())
    )
    
    # 更新IP额度
    cursor.execute(
        "UPDATE ip_quota SET analysis_count = analysis_count + 1, last_analysis_time = ? WHERE ip = ?",
        (now.isoformat(), client_ip)
    )
    
    conn.commit()
    conn.close()
    
    # 异步处理分析任务
    import asyncio
    asyncio.create_task(process_analysis_task(task_id, extracted_text, job_target, job_description, job_type))
    
    return AnalysisTask(
        task_id=task_id,
        status="pending",
        stage="extracting",
        created_at=now.isoformat()
    )

@router.get("/analysis/{task_id}", response_model=AnalysisTask)
async def get_analysis_task(task_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM analysis_task WHERE task_id = ?", (task_id,))
    result = cursor.fetchone()
    
    conn.close()
    
    if not result:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    return AnalysisTask(
        task_id=result[0],
        status=result[2],
        stage=result[3],
        created_at=result[4],
        error_code=result[5],
        error_message=result[6]
    )

async def process_analysis_task(task_id, resume_text, job_target, job_description, job_type):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 更新任务状态
        cursor.execute(
            "UPDATE analysis_task SET status = ?, stage = ? WHERE task_id = ?",
            ("processing", "jd_analysis", task_id)
        )
        conn.commit()
        
        # 调用DeepSeek分析
        analysis_result = await analyze_resume(
            resume_text=resume_text,
            job_target=job_target,
            job_description=job_description,
            job_type=job_type
        )
        
        # 更新任务状态为成功
        cursor.execute(
            "UPDATE analysis_task SET status = ?, stage = ? WHERE task_id = ?",
            ("succeeded", "completed", task_id)
        )
        conn.commit()
        
    except Exception as e:
        # 更新任务状态为失败
        cursor.execute(
            "UPDATE analysis_task SET status = ?, stage = ?, error_message = ? WHERE task_id = ?",
            ("failed", "error", str(e), task_id)
        )
        conn.commit()
    finally:
        conn.close()

# 导入缺失的模块
from datetime import timedelta
from fastapi import HTTPException