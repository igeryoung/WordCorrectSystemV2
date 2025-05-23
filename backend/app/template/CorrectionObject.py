from pydantic import BaseModel
from typing import List, Optional

class CorrectionRequest(BaseModel):
    raw_code: str
    raw_text: str

class CorrectionResponse(BaseModel):
    codes: List[str]
    names: List[str]
    error: Optional[str]