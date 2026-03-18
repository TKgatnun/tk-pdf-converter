import httpx
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# This is the magic that tells your browser "Yes, React is allowed to talk to me"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your live Koyeb PDF Engine
GOTENBERG_URL = "https://worrying-letti-kulture-c4e80d8a.koyeb.app/forms/libreoffice/convert"

@app.post("/convert")
async def convert_files(files: list[UploadFile] = File(...)):
    # 1. Format the uploaded files so Gotenberg can read them
    files_data = [("files", (f.filename, f.file, f.content_type)) for f in files]
    
    # 2. Forward the batch of files to your Gotenberg engine
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(GOTENBERG_URL, files=files_data)
        
    # 3. Stream the result (either a .pdf or a .zip) directly back to React
    return StreamingResponse(
        response.iter_bytes(), 
        media_type=response.headers.get("content-type"),
        headers={
            "Content-Disposition": response.headers.get(
                "content-disposition", 
                "attachment; filename=TK_Converted_Batch.zip"
            )
        }
    )