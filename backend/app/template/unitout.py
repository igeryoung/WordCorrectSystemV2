from pydantic import BaseModel

# Response model：每条 link 的字段
class UnitOut(BaseModel):
    name: str
    code: str