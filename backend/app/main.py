# app/main.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from postgrest import APIError
from app.supabase_client import supabase
from app.template.linkout import LinkOut

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

@app.get("/chapters/{chapter_code}/links", response_model=list[LinkOut])
async def get_links(chapter_code: str):
    """
    根据 chapter_code 查询所有 link 记录。
    例如：chapter_code = "03050"
    """
    try:
        resp = (
            supabase
            .table("link")
            .select("group, digit, code, name, child_group, child_digit, child_code, child_name")
            .eq("chapter", chapter_code)
            .execute()
        )
        return resp.data
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Supabase 查询失败: {e}")


@app.get("/chapters/{chapter_code}/links", response_model=list[LinkOut])
async def get_links(
    chapter_code: str,
    parent_code: str | None = Query(
        None,
        description="If provided, filters links by code==parent_code; otherwise code==chapter_code"
    )
):
    """
    Fetch all link records under the given chapter, or under a specific parent code.
    - If parent_code is None: returns links where code == chapter_code
    - If parent_code is provided: returns links where code == parent_code
    """
    try:
        builder = (
            supabase
            .table("link")
            .select("group, digit, code, name, child_group, child_digit, child_code, child_name")
        )
        # always scope to the chapter table
        builder = builder.eq("chapter", chapter_code)

        # then filter by either chapter_code or parent_code
        if parent_code:
            builder = builder.eq("code", parent_code)
        else:
            builder = builder.eq("code", chapter_code)

        resp = builder.execute()
        return resp.data
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Supabase 查询失败: {e}")