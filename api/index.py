from fastapi import FastAPI, Request

app = FastAPI()

@app.get("/api/v1/hello")
async def hello():
    return {"message": "Hello from Vercel"}

@app.post("/api/v1/auth/login")
async def login(request: Request):
    return {"success": False, "message": "DEBUG MODE: Backend isolation test"}

@app.get("/")
async def root():
    return {"message": "Root handler"}
