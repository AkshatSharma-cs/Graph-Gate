import sys
from pathlib import Path

# Add project root so 'backend.app' can be imported anywhere
root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root))
