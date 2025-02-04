from fastapi import FastAPI, Form, HTTPException
import re
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from .text_processor import TextProcessor
import tempfile
import os

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = FastAPI(title="Text Processor API")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process-text")
async def process_text(text: str = Form(...), email: str = Form(...)):
    try:
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            raise HTTPException(status_code=400, detail="Invalid email format")
            
        logging.info(f"Processing text input of length: {len(text)} for email: {email}")
        processor = TextProcessor()
        
        try:
            processed_text = processor.process_long_text(text)
            logging.info("Text processing completed successfully")
        except Exception as e:
            logging.error(f"Error in text processing: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
        
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt', encoding='utf-8') as temp_file:
            temp_file.write(processed_text)
            temp_path = temp_file.name
            logging.info(f"Created temporary file: {temp_path}")
        
        # TODO: Implement email sending
        # For now, just return success message
        return JSONResponse(
            status_code=200,
            content={"message": "文本处理请求已接收，处理完成后结果将发送到您的邮箱"}
        )
    except Exception as e:
        error_msg = f"Error processing text input: {str(e)}"
        logging.error(error_msg, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": "处理文本时出错，请查看服务器日志了解详情"}
        )





@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
