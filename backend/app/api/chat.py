from fastapi import APIRouter, Request
from pydantic import BaseModel
from datetime import datetime
from app.core.db import get_db_connection
from app.core.config import settings
from app.services.deepseek import chat_with_deepseek

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    analysis_result: dict = None
    resume_markdown: str = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: Request,
    chat_request: ChatRequest
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
        chat_count = 0
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
            chat_count = 0
        else:
            chat_count = result[3]
    
    # 检查聊天次数限制
    if chat_count >= settings.max_chat_per_day:
        conn.close()
        raise HTTPException(status_code=429, detail="今日追问次数已用完")
    
    # 调用DeepSeek聊天
    response = await chat_with_deepseek(
        message=chat_request.message,
        analysis_result=chat_request.analysis_result,
        resume_markdown=chat_request.resume_markdown
    )
    
    # 更新IP额度
    cursor.execute(
        "UPDATE ip_quota SET chat_count = chat_count + 1 WHERE ip = ?",
        (client_ip,)
    )
    
    conn.commit()
    conn.close()
    
    return ChatResponse(
        response=response,
        timestamp=now.isoformat()
    )

# 导入缺失的模块
from datetime import timedelta
from fastapi import HTTPException