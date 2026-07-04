from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import app_router
from app.core.errors import register_error_handlers
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
register_error_handlers(app)


origins = os.getenv("CORS_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(app_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def read_root():
    return {
        "message": "Capstone"
    }
