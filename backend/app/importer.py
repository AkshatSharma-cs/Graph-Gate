import json
from pathlib import Path
from backend.app.schemas import (
    ConfigurationSnapshot,
    AgentConfig,
    ToolConfig,
    IdentityConfig,
    ResourceConfig,
    DestinationConfig,
    ContextConfig,
    PolicyConfig,
)
from backend.app.config import settings

def load_snapshot_from_file(file_path: Path | str) -> ConfigurationSnapshot:
    """Load and validate a ConfigurationSnapshot from a JSON file."""
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"Snapshot file not found: {path}")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return ConfigurationSnapshot.model_validate(data)

def parse_mcp_config(mcp_json_str_or_dict: str | dict) -> ConfigurationSnapshot:
    """
    Adapter that parses an MCP (Model Context Protocol) configuration JSON
    and projects it into normalized entities (Agents, Tools, Identities, Destinations).
    """
    if isinstance(mcp_json_str_or_dict, str):
        data = json.loads(mcp_json_str_or_dict)
    else:
        data = mcp_json_str_or_dict

    mcp_servers = data.get("mcpServers", {})
    
    agent = AgentConfig(
        id="mcp-client-agent",
        name="MCP Host Agent",
        framework="mcp",
        tools=[],
        context_id="ctx-mcp-client"
    )
    
    tools: list[ToolConfig] = []
    identities: list[IdentityConfig] = []
    resources: list[ResourceConfig] = []
    destinations: list[DestinationConfig] = []
    contexts: list[ContextConfig] = [
        ContextConfig(id="ctx-mcp-client", name="MCP Host Context", is_shared=True)
    ]
    
    for server_name, server_def in mcp_servers.items():
        server_tools = server_def.get("tools", [])
        env = server_def.get("env", {})
        identity_id = f"id-{server_name}"
        
        can_read: list[str] = []
        can_send_to: list[str] = []
        
        for tool in server_tools:
            tool_id = tool.get("name", f"{server_name}-tool")
            tool_kind = tool.get("kind", "read")
            agent.tools.append(tool_id)
            
            tool_resources = tool.get("resources", [])
            for r_id in tool_resources:
                can_read.append(r_id)
                if not any(r.id == r_id for r in resources):
                    # default classification heuristics
                    classification = "restricted" if "payroll" in r_id.lower() or "secret" in r_id.lower() else "internal"
                    resources.append(ResourceConfig(id=r_id, name=r_id, classification=classification))
                    
            tool_destinations = tool.get("destinations", [])
            for d_id in tool_destinations:
                can_send_to.append(d_id)
                if not any(d.id == d_id for d in destinations):
                    trust = "external" if "external" in d_id.lower() or "webhook" in d_id.lower() else "internal"
                    destinations.append(DestinationConfig(id=d_id, name=d_id, trust=trust))
                    
            tools.append(ToolConfig(
                id=tool_id,
                name=f"{server_name}: {tool_id}",
                kind=tool_kind,
                identity_id=identity_id,
                context_id="ctx-mcp-client"
            ))
            
        identities.append(IdentityConfig(
            id=identity_id,
            name=f"Identity for {server_name}",
            principal_type="mcp_env_token",
            can_read=can_read,
            can_send_to=can_send_to
        ))

    default_policies = [
        PolicyConfig(
            id="POL-001",
            name="Restricted Egress Prohibition",
            severity="critical",
            description="Restricted classification data must never flow to external or untrusted destinations."
        ),
        PolicyConfig(
            id="POL-002",
            name="Confidential Egress Guardrail",
            severity="high",
            description="Confidential data may only flow to internal or explicitly approved external destinations."
        ),
        PolicyConfig(
            id="POL-003",
            name="Unknown Entity Boundary Audit",
            severity="medium",
            description="Entities with unknown classification or trust levels must trigger manual security review."
        )
    ]

    return ConfigurationSnapshot(
        agents=[agent],
        tools=tools,
        identities=identities,
        resources=resources,
        destinations=destinations,
        contexts=contexts,
        policies=default_policies
    )

def get_fixture_snapshot(fixture_name: str) -> ConfigurationSnapshot:
    """Retrieve one of the standard fixtures (baseline, candidate-risky, candidate-safe)."""
    file_path = settings.fixtures_dir / f"{fixture_name}.json"
    return load_snapshot_from_file(file_path)
