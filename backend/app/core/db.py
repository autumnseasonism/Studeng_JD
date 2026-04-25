import sqlite3
import os
from app.core.config import settings

def init_db():
    # 确保上传目录存在
    os.makedirs(settings.upload_dir, exist_ok=True)
    
    # 连接数据库
    conn = sqlite3.connect(settings.db_path)
    cursor = conn.cursor()
    
    # 创建IP额度表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS ip_quota (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT UNIQUE,
        analysis_count INTEGER DEFAULT 0,
        chat_count INTEGER DEFAULT 0,
        last_analysis_time TEXT,
        reset_time TEXT
    )
    ''')
    
    # 创建分析任务表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS analysis_task (
        task_id TEXT PRIMARY KEY,
        ip TEXT,
        status TEXT,
        stage TEXT,
        created_at TEXT,
        error_code TEXT,
        error_message TEXT
    )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    return sqlite3.connect(settings.db_path)