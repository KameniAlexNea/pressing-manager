from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app import models
from app.database import engine
from app.routes import router

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gestion Pressing", description="Service de gestion pour pressing")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routes
app.include_router(router)
