from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import quota, analysis, chat
from app.core.config import settings
from app.core.db import init_db

app = FastAPI(
    title="大学生求职陪跑助手 API",
    description="简历分析与改写服务",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quota.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "大学生求职陪跑助手 API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)