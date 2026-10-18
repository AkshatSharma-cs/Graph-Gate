import sys
import os
from pathlib import Path
import uvicorn

# Ensure project root and backend dir are in sys.path
root_dir = Path(__file__).resolve().parent
if root_dir.name == "backend":
    sys.path.insert(0, str(root_dir.parent))
    sys.path.insert(0, str(root_dir))
else:
    sys.path.insert(0, str(root_dir))
    sys.path.insert(0, str(root_dir / "backend"))

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    print("\n" + "=" * 65)
    print(f"  🚀 GraphGate CI — Starting Server on http://{host}:{port}")
    print(f"  📊 Dashboard: http://127.0.0.1:{port}")
    print(f"  🔍 API Docs:  http://127.0.0.1:{port}/docs")
    print("=" * 65 + "\n")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=True)
