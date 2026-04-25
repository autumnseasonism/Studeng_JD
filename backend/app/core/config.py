from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # 应用设置
    app_name: str = "大学生求职陪跑助手"
    debug: bool = True
    
    # API 配置
    api_prefix: str = "/api"
    
    # 数据库配置
    db_path: str = "./data.db"
    
    # DeepSeek API 配置
    deepseek_api_key: Optional[str] = None
    deepseek_api_url: str = "https://api.deepseek.com/v1/chat/completions"
    
    # 文件配置
    upload_dir: str = "./uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_extensions: list = [".pdf", ".docx", ".txt", ".md"]
    
    # 额度配置
    max_analysis_per_day: int = 1
    max_chat_per_day: int = 20
    max_analysis_per_minute: int = 1
    
    # 任务配置
    task_timeout: int = 300  # 5分钟
    task_cleanup_hours: int = 24
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()