# app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from postgrest import APIError
from app.supabase_client import supabase

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChapterOut(BaseModel):
    chapter: str
    name: str

@app.get("/chapters", response_model=list[ChapterOut])
async def get_chapters():
    try:
        # execute() 出错时会抛 APIError
        resp = (
            supabase
            .table("chapter")
            .select("chapter, name")
            .order("chapter")   # 单参数默认升序
            .execute()
        )
        return resp.data   # 直接返回 data 列表
    except APIError as e:
        # 捕获 Supabase/Postgrest 的错误并转成 HTTP 500
        raise HTTPException(status_code=500, detail=str(e))
