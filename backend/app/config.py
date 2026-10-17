import os
from pathlib import Path
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "GraphGate CI"
    app_version: str = "0.1.0"
    falkordb_host: str = os.getenv("FALKORDB_HOST", "localhost")
    falkordb_port: int = int(os.getenv("FALKORDB_PORT", "6379"))
    falkordb_password: str | None = os.getenv("FALKORDB_PASSWORD") or None
    max_path_traversal_limit: int = int(os.getenv("MAX_PATH_TRAVERSAL_LIMIT", "250"))
    
    # Paths
    base_dir: Path = Path(__file__).resolve().parent
    fixtures_dir: Path = Path(__file__).resolve().parent / "fixtures"

settings = Settings()
