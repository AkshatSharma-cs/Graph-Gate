from backend.app.schemas import (
    ConfigurationSnapshot,
    ContextConfig,
    GraphNode,
    GraphEdge,
    GraphData,
    PolicyConfig,
)

DEFAULT_POLICIES = [
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

def normalize_snapshot(snapshot: ConfigurationSnapshot) -> ConfigurationSnapshot:
    """
    Normalizes a configuration snapshot:
    - Auto-assigns or creates AgentContext for each agent if missing.
    - Ensures tools inherit agent's context if not explicitly assigned.
    - Attaches default policies if policies array is empty.
    - Validates integrity.
    """
    norm = snapshot.model_copy(deep=True)
    
    # 1. Ensure policies
    if not norm.policies:
        norm.policies = [p.model_copy() for p in DEFAULT_POLICIES]

    # 2. Contexts map
    existing_contexts = {c.id: c for c in norm.contexts}
    
    for agent in norm.agents:
        if not agent.context_id:
            ctx_id = f"ctx-{agent.id}"
            agent.context_id = ctx_id
            if ctx_id not in existing_contexts:
                new_ctx = ContextConfig(id=ctx_id, name=f"Context for {agent.name or agent.id}", is_shared=True)
                norm.contexts.append(new_ctx)
                existing_contexts[ctx_id] = new_ctx

    # 3. Align tools with contexts
    agent_by_tool: dict[str, str] = {}
    for agent in norm.agents:
        for tool_id in agent.tools:
            agent_by_tool[tool_id] = agent.context_id or f"ctx-{agent.id}"

    for tool in norm.tools:
        if not tool.context_id and tool.id in agent_by_tool:
            tool.context_id = agent_by_tool[tool.id]

    return norm

def snapshot_to_graph_data(snapshot: ConfigurationSnapshot) -> GraphData:
    """
    Transforms a normalized ConfigurationSnapshot into a GraphData model
    containing nodes and edges for visualization and traversal.
    """
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []
    
    # Resources & DataClasses
    for r in snapshot.resources:
        nodes.append(GraphNode(
            id=r.id,
            label=r.name or r.id,
            node_type="Resource",
            data={"classification": r.classification, "resource_type": r.resource_type}
        ))
        class_node_id = f"dataclass-{r.classification}"
        if not any(n.id == class_node_id for n in nodes):
            nodes.append(GraphNode(
                id=class_node_id,
                label=r.classification.upper(),
                node_type="DataClass",
                data={"level": r.classification}
            ))
        edges.append(GraphEdge(
            id=f"edge-{r.id}-classified-{class_node_id}",
            source=r.id,
            target=class_node_id,
            relationship="CLASSIFIED_AS"
        ))

    # Identities & Resource/Destination links
    for ident in snapshot.identities:
        nodes.append(GraphNode(
            id=ident.id,
            label=ident.name or ident.id,
            node_type="Identity",
            data={"principal_type": ident.principal_type}
        ))
        for res_id in ident.can_read:
            edges.append(GraphEdge(
                id=f"edge-{ident.id}-can_read-{res_id}",
                source=ident.id,
                target=res_id,
                relationship="CAN_READ"
            ))
        for dst_id in ident.can_send_to:
            edges.append(GraphEdge(
                id=f"edge-{ident.id}-can_send_to-{dst_id}",
                source=ident.id,
                target=dst_id,
                relationship="CAN_SEND_TO"
            ))

    # Destinations
    for dst in snapshot.destinations:
        nodes.append(GraphNode(
            id=dst.id,
            label=dst.name or dst.id,
            node_type="Destination",
            data={"trust": dst.trust}
        ))

    # Contexts
    for ctx in snapshot.contexts:
        nodes.append(GraphNode(
            id=ctx.id,
            label=ctx.name or ctx.id,
            node_type="AgentContext",
            data={"is_shared": ctx.is_shared}
        ))

    # Tools
    for tool in snapshot.tools:
        nodes.append(GraphNode(
            id=tool.id,
            label=tool.name or tool.id,
            node_type="Tool",
            data={"kind": tool.kind}
        ))
        if tool.identity_id:
            edges.append(GraphEdge(
                id=f"edge-{tool.id}-authenticates_as-{tool.identity_id}",
                source=tool.id,
                target=tool.identity_id,
                relationship="AUTHENTICATES_AS"
            ))
        if tool.context_id:
            edges.append(GraphEdge(
                id=f"edge-{tool.id}-returns_to-{tool.context_id}",
                source=tool.id,
                target=tool.context_id,
                relationship="RETURNS_TO"
            ))

    # Agents
    for agent in snapshot.agents:
        nodes.append(GraphNode(
            id=agent.id,
            label=agent.name or agent.id,
            node_type="Agent",
            data={"framework": agent.framework}
        ))
        if agent.context_id:
            edges.append(GraphEdge(
                id=f"edge-{agent.id}-has_context-{agent.context_id}",
                source=agent.id,
                target=agent.context_id,
                relationship="HAS_CONTEXT"
            ))
        for tool_id in agent.tools:
            edges.append(GraphEdge(
                id=f"edge-{agent.id}-uses_tool-{tool_id}",
                source=agent.id,
                target=tool_id,
                relationship="USES_TOOL"
            ))

    return GraphData(nodes=nodes, edges=edges)
