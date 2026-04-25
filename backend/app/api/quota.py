from fastapi import APIRouter, Request
from datetime import datetime, timedelta
from app.core.db import get_db_connection
from app.core.config import settings

router = APIRouter()

@router.get("/quota")
async def get_quota(request: Request):
    # 获取客户端IP
    client_ip = request.client.host
    
    # 连接数据库
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 检查IP是否存在
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
        analysis_remaining = settings.max_analysis_per_day
        chat_remaining = settings.max_chat_per_day
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
            analysis_remaining = settings.max_analysis_per_day
            chat_remaining = settings.max_chat_per_day
        else:
            # 计算剩余额度
            analysis_remaining = max(0, settings.max_analysis_per_day - result[2])
            chat_remaining = max(0, settings.max_chat_per_day - result[3])
    
    conn.close()
    
    return {
        "ip": client_ip,
        "analysis_remaining_today": analysis_remaining,
        "chat_remaining_today": chat_remaining,
        "next_reset_at": reset_time.isoformat()
    }