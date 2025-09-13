from fastapi import FastAPI
from typing import Callable
from contextlib import asynccontextmanager

# --- ADD THIS IMPORT ---
from fastapi.middleware.cors import CORSMiddleware

from app import routes
from core.config import settings


@asynccontextmanager
async def default_lifespan(app: FastAPI):
    """Initialize application services."""
    # Process Like Consumers and CronJobs
    yield
    # Finishing that Process


def create_app(lifespan: Callable = default_lifespan) -> FastAPI:
    """Creating FastAPI application."""
    app = FastAPI(
        title=settings.API_TITLE,
        description=settings.DESCRIPTION,
        docs_url=settings.DOCS_URL,
        lifespan=lifespan,
    )

    # --- ADD THIS ENTIRE BLOCK ---
    # This is where we add the CORS middleware to allow our frontend to talk to the API.
    # The frontend URL must be in this list.
    origins = [
        "http://localhost:3000",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins, # Allows requests from the origins list.
        allow_credentials=True, # Allows cookies and authorization headers.
        allow_methods=["*"], # Allows all HTTP methods (GET, POST, etc.).
        allow_headers=["*"], # Allows all headers.
    )
    # --- END OF ADDED BLOCK ---

    routes.init_routes(app)
    routes.add_exception_handlers(app)

    return app