import sys
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
    print("\n" + "=" * 65)
    print("  🚀 GraphGate CI — Starting Server on http://127.0.0.1:8000")
    print("  📊 Dashboard: http://127.0.0.1:8000")
    print("  🔍 API Docs:  http://127.0.0.1:8000/docs")
    print("=" * 65 + "\n")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
