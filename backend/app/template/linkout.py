from pydantic import BaseModel

# Response model：每条 link 的字段
class LinkOut(BaseModel):
    group: int
    digit: int
    code: str
    name: str
    child_group: int
    child_digit: int
    child_code: str
    child_name: str