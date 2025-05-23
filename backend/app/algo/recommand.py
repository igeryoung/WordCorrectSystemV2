import os
from dotenv import load_dotenv
from supabase import create_client
import torch
from sentence_transformers import SentenceTransformer
import onnxruntime as ort
from .utils import (
    TestChapterCodeConsistency,
    QueryNthCandidateByParentCode,
    jsonl_to_list,
    GetChapterInfoByCode,
    QueryAllChapterItemByChapterCode,
    TestCommaExist,
    remove_first_english_char,
)

# suppress ONNX Runtime logs
ort.set_default_logger_severity(3)


class CodeCorrector:
    def __init__(
        self,
        supabase_url: str = None,
        supabase_key: str = None,
        model_name: str = "shibing624/text2vec-base-chinese",
        onnx_file: str = "model_qint8_avx512_vnni.onnx",
    ):
        """Load environment, connect to Supabase, and init the sentence-transformer model."""
        load_dotenv()
        url = supabase_url or os.getenv("SUPABASE_URL")
        key = supabase_key or os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY in your .env")
        self.supabase = create_client(url, key)

        self.model = SentenceTransformer(
            model_name,
            backend="onnx",
            model_kwargs={"file_name": onnx_file},
        )

    def correct(self, raw_code: str, raw_text: str):
        """
        Given a raw_code string and a raw_text string,
        returns (corrected_code_list, corrected_name_list, error).
        """
        # 1) sanitize the code
        code = remove_first_english_char(raw_code)
        # 2) detect comma mode and split text
        mode, texts = TestCommaExist(raw_text)

        if mode == "comma":
            return self._has_comma(code, texts)
        elif mode == "no_comma":
            return self._no_comma(code, texts)
        else:
            return [], [], Exception(f"Unknown mode: {mode!r}")

    def _has_comma(self, code: str, texts: list[str]):
        corrected_code = []
        corrected_name = []

        chapter_info, lines = TestChapterCodeConsistency(
            self.supabase, code, texts
        )

        corrected_code.append(chapter_info["chapter"])
        corrected_name.append(chapter_info["name"])

        chapter = chapter_info["chapter"]
        cur_digit = 5
        cur_code = chapter

        # iterate the remaining text segments
        for text in lines[1:]:
            resp = QueryNthCandidateByParentCode(
                self.supabase,
                digit=cur_digit,
                parentCode=cur_code,
                chapter=chapter,
                col=["child_code", "child_name"],
            )
            candidates = jsonl_to_list(resp)
            names = candidates["child_name"]
            codes = candidates["child_code"]

            if not names:
                break

            if text in names:
                idx = names.index(text)
            else:
                embs = self.model.encode([text] + names)
                sims = self.model.similarity(embs, embs)
                idx = torch.argmax(sims[0][1:]).item()

            corrected_code.append(codes[idx])
            corrected_name.append(names[idx])

            cur_digit += 1
            cur_code = codes[idx]
            if cur_digit == 9:
                break

        return corrected_code, corrected_name, None

    def _no_comma(self, code: str, texts: list[str]):
        corrected_code = []
        corrected_name = []

        info = GetChapterInfoByCode(self.supabase, code)
        # attempt to match chapter name in text
        if info["name"] in texts:
            chap = info["chapter"]
        else:
            items = QueryAllChapterItemByChapterCode(self.supabase, info["chapter"])
            for itm in items:
                if itm in texts:
                    chap = info["chapter"]
                    break
            else:
                return [], [], Exception("Chapter inconsistent")

        # (extend here with your no-comma logic, e.g. querying children one by one)

        return corrected_code, corrected_name, None


if __name__ == "__main__":

    corrector = CodeCorrector()
    codes, names, error = corrector.correct(raw_code, raw_text)

    print("Codes:", codes)
    print("Names:", names)
    if error:
        print("Error:", error)
