import re

def remove_first_english_char(s):
    """
    Removes the first character if it is an English letter (A-Z or a-z).
    
    :param s: Input string
    :return: Modified string with the first English letter removed (if applicable)
    """
    if re.match(r'^[A-Za-z]', s):
        s = s[1:]
    # 前置補零到長度 10
    s = s.zfill(10)
    return s


def GetChapterInfoByCode(supabase, test_code):
    try:
        raw_code = test_code[:5]
        response = supabase.table("chapter").select("*").eq("chapter", raw_code).execute()
        
        if not response.data:
            raise ValueError(f"No data found for chapter code: {raw_code}")
        
        data = response.data[0]
        return data
    except Exception as e:
        print("An error occurred:", e)
        return None
    
def GetChapterInfoByText(supabase, text):
    try:
        response = supabase.table("chapter").select("*").eq("name", text).execute()
        
        if not response.data:
            raise ValueError(f"No data found for chapter text: {text}")
        
        data = response.data[0]
        return data
    except Exception as e:
        print("An error occurred:", e)
        return None
    
def TestCommaExist(raw_text):
    if '，' in raw_text:
        data = raw_text.split('，')
        return "comma", data
    else:
        return "no_comma", raw_text
    
def TestChapterCodeConsistency(supabase, raw_code, raw_text):
    try:
        info_from_code = GetChapterInfoByCode(supabase, raw_code)
        info_from_text = GetChapterInfoByText(supabase, raw_text[0])
    except Exception as e:
        pass
    # handle case : chapter name not found in raw text
    if info_from_text is None:
        return info_from_code, [info_from_code['name']] + raw_text

    return info_from_code, raw_text

def QueryNthCandidateByParentCode(supabase, digit, parentCode, chapter, col = None):

    try:
        if col:
            select_col = ", ".join(col)
        else:
            select_col = "*"
        
        response = supabase.table("link").select(select_col).match({
            "chapter": chapter,
            "digit": digit,
            "code": parentCode
        }).execute()

        if not response.data:
            raise ValueError(f"No data found for parent code: {parentCode}")
        return response.data
    except Exception as e:
        print("An error occurred:", e)
        return []
    
def jsonl_to_list(data):
    data_dict = {}
    for row in data:
        for key, value in row.items():
            if key not in data_dict:
                data_dict[key] = []
            data_dict[key].append(value)
    return data_dict

def QueryAllChapterItemByChapterCode(supabase, test_code):
    try:
        raw_code = test_code[:5]
        response = supabase.table("link").select("child_name").eq("chapter", raw_code).execute()
        unique_values = list(set(item["child_name"] for item in response.data))
        return unique_values
    
    except Exception as e:
        print("An error occurred:", e)
        return None