#!/usr/bin/env python
"""
Export OpenAPI specification to openapi.yaml
Usage: python scripts/export_openapi.py
"""
import json
import yaml
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app


def export_openapi():
    """Export the OpenAPI spec to YAML and JSON formats."""
    # Get OpenAPI schema
    openapi_schema = app.openapi()
    
    # Export as YAML
    yaml_path = Path(__file__).parent.parent / "openapi.yaml"
    with open(yaml_path, "w") as f:
        yaml.dump(openapi_schema, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
    print(f"✅ Exported OpenAPI spec to: {yaml_path}")
    
    # Export as JSON
    json_path = Path(__file__).parent.parent / "openapi.json"
    with open(json_path, "w") as f:
        json.dump(openapi_schema, f, indent=2)
    print(f"✅ Exported OpenAPI spec to: {json_path}")
    
    # Print summary
    paths = openapi_schema.get("paths", {})
    print(f"\n📊 API Summary:")
    print(f"   Title: {openapi_schema.get('info', {}).get('title', 'N/A')}")
    print(f"   Version: {openapi_schema.get('info', {}).get('version', 'N/A')}")
    print(f"   Endpoints: {len(paths)}")
    
    # Count by method
    methods = {}
    for path, ops in paths.items():
        for method in ops:
            if method in ['get', 'post', 'put', 'delete', 'patch']:
                methods[method.upper()] = methods.get(method.upper(), 0) + 1
    
    for method, count in sorted(methods.items()):
        print(f"   - {method}: {count}")


if __name__ == "__main__":
    export_openapi()
