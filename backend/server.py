from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, HttpUrl
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import requests
from bs4 import BeautifulSoup
from readability import Document


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="InstaRead API")
api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class URLExtractRequest(BaseModel):
    url: str


class URLExtractResponse(BaseModel):
    title: Optional[str] = None
    text: str
    source_url: str
    word_count: int


class ShareCreate(BaseModel):
    text: str
    title: Optional[str] = None
    source: Optional[str] = None


class ShareDoc(BaseModel):
    id: str
    text: str
    title: Optional[str] = None
    source: Optional[str] = None
    created_at: str
    word_count: int


@api_router.get("/")
async def root():
    return {"message": "InstaRead API online"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.post("/extract-url", response_model=URLExtractResponse)
async def extract_url(payload: URLExtractRequest):
    """Fetch a webpage and extract clean readable article text."""
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml",
        }
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
    except requests.exceptions.RequestException as exc:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {exc}") from exc

    html = resp.text

    # Extract readable content
    try:
        doc = Document(html)
        title = (doc.short_title() or "").strip() or None
        summary_html = doc.summary(html_partial=True)
        soup = BeautifulSoup(summary_html, "lxml")
    except Exception:
        soup = BeautifulSoup(html, "lxml")
        title_tag = soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else None

    for tag in soup(["script", "style", "noscript", "nav", "footer", "header", "aside", "form"]):
        tag.decompose()

    # Preserve paragraph structure
    blocks = []
    for el in soup.find_all(["p", "h1", "h2", "h3", "h4", "li", "blockquote"]):
        text = el.get_text(" ", strip=True)
        if text and len(text) > 1:
            blocks.append(text)

    if not blocks:
        raw = soup.get_text(" ", strip=True)
        blocks = [raw] if raw else []

    text = "\n\n".join(blocks).strip()
    if not text:
        raise HTTPException(status_code=422, detail="Could not extract readable text from URL")

    word_count = len([w for w in text.split() if w])
    return URLExtractResponse(
        title=title,
        text=text,
        source_url=url,
        word_count=word_count,
    )


@api_router.post("/share")
async def create_share(payload: ShareCreate):
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    if len(text) > 500_000:
        raise HTTPException(status_code=413, detail="text is too large (max 500KB)")
    share_id = uuid.uuid4().hex[:10]
    doc = {
        "id": share_id,
        "text": text,
        "title": (payload.title or "").strip() or None,
        "source": (payload.source or "").strip() or None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "word_count": len([w for w in text.split() if w]),
    }
    await db.shares.insert_one(doc)
    return {"id": share_id}


@api_router.get("/share/{share_id}", response_model=ShareDoc)
async def get_share(share_id: str):
    doc = await db.shares.find_one({"id": share_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="share not found")
    return ShareDoc(**doc)



app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
