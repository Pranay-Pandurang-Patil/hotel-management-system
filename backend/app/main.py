from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .models import Base
from .routers.billing import router as billing_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="HotelOS API",
    version="1.0.0",
    description="Billing-first Hotel Management System API",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://hotel-management-system-chi-drab.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(billing_router)


@app.get("/")
def root():
    return {
        "name": "HotelOS",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected",
    }