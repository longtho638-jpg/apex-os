from fastapi import Request, Response
from backend.main import app
from mangum import Mangum

# Mangum adapter for AWS Lambda/Vercel compatibility
handler = Mangum(app, lifespan="off")
