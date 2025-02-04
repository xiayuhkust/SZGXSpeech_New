import re
import openai
import logging
import tiktoken
from typing import List
from dotenv import load_dotenv
import os

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class TextProcessor:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key not found in environment variables")
        openai.api_key = self.api_key
        self.max_chunk_size = 1000

    def split_text(self, text: str) -> List[str]:
        paragraphs = re.split(r'\n\n+', text)
        chunks = []
        current_chunk = []
        current_length = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            para_length = len(para)
            if current_length + para_length > self.max_chunk_size:
                chunks.append("\n\n".join(current_chunk))
                current_chunk = [para]
                current_length = para_length
            else:
                current_chunk.append(para)
                current_length += para_length
        
        if current_chunk:
            chunks.append("\n\n".join(current_chunk))
        
        return chunks

    def count_tokens(self, text, model="gpt-4"):
        encoding = tiktoken.encoding_for_model(model)
        tokens = encoding.encode(text)
        return len(tokens)

    def process_chunk(self, chunk: str) -> str:
        prompt = """请按照以下要求处理文本：
1. **保持原文情感不变**：确保修改后的文本情感与原文一致。
2.  口语化清理规则  
    a. **强制删除以下词汇**：  
    - 冗余词：这个、那个、然后、就是、呃、啊、对吧  
    - 重复强调：非常非常、真的真的、实在是  
    b. **合并规则**：  
    - "像那个…一样" → "如…一般"  
    - "就是说要…" → "要…"  
    c. **例外保留**：  
    - 情感强化词：何等、惟独、唯有  
    - 呼召用语：你们要听、阿们  
3. **修改语病和语法错误，但保持原文完整性**：
   - 修正明显的语病和语法错误。
   - 尽量保留原文的句子结构和用词，不要删减内容。
4. **合理分段**：每段 3-5 行，确保段落逻辑清晰。
5. **标注圣经引用**：
   - 识别并标注所有圣经引用。
   - 使用《和合本》标准，格式示例：（创1:1）。
6. **输出直接返回处理后的文本**：无需额外解释，直接返回修改后的文本。

待处理文本：
""" + chunk
        
        max_tokens = 4096
        
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=max_tokens
        )
        
        if not response.choices:
            return ""
        result = response.choices[0].message.content or ""
        logging.info(f"Initial chunk:\n{chunk}\nFinal processed chunk:\n{result}\n")
        return result.strip()

    def process_long_text(self, text: str) -> str:
        chunks = self.split_text(text)
        processed_chunks = []
        
        for i, chunk in enumerate(chunks, 1):
            logging.info(f"Processing chunk {i}/{len(chunks)}...")
            processed = self.process_chunk(chunk)
            processed_chunks.append(processed)
        
        logging.info("Merging chunks...")
        final_text = "\n\n".join(processed_chunks)
        return final_text
