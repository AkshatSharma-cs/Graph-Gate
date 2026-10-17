from typing import Any
from backend.app.schemas import PathWitnessStep

CYPHER_DATAFLOW_QUERY = """
MATCH
  (src:Resource)<-[:CAN_READ]-(readIdentity:Identity)
    <-[:AUTHENTICATES_AS]-(readTool:Tool)
    -[:RETURNS_TO]->(ctx:AgentContext)
    <-[:HAS_CONTEXT]-(agent:Agent)
    -[:USES_TOOL]->(sendTool:Tool)
    -[:AUTHENTICATES_AS]->(sendIdentity:Identity)
    -[:CAN_SEND_TO]->(dst:Destination),
  (src)-[:CLASSIFIED_AS]->(class:DataClass)
WHERE (agent)-[:USES_TOOL]->(readTool)
RETURN DISTINCT
  agent.id AS agent_id,
  src.id AS source_id,
  class.level AS classification,
  readTool.id AS read_tool,
  readIdentity.id AS read_identity,
  ctx.id AS agent_context,
  sendTool.id AS send_tool,
  sendIdentity.id AS send_identity,
  dst.id AS destination_id,
  dst.trust AS destination_trust
LIMIT $limit
"""

def build_witness_steps(record: dict[str, Any]) -> tuple[list[PathWitnessStep], str, list[str], list[str]]:
    """
    Constructs an explicit, human-readable witness trail and the sequence of node and edge IDs.
    """
    src = record["source_id"]
    cls_level = record["classification"].upper()
    r_id = record["read_identity"]
    r_tool = record["read_tool"]
    ctx = record["agent_context"]
    agent = record["agent_id"]
    s_tool = record["send_tool"]
    s_id = record["send_identity"]
    dst = record["destination_id"]
    dst_trust = record["destination_trust"].upper()

    steps = [
        PathWitnessStep(
            step_number=1,
            from_node=r_id,
            from_type="Identity",
            relationship="CAN_READ",
            to_node=src,
            to_type="Resource",
            detail=f"Identity '{r_id}' possesses read privilege for resource '{src}' [{cls_level}]."
        ),
        PathWitnessStep(
            step_number=2,
            from_node=r_tool,
            from_type="Tool",
            relationship="AUTHENTICATES_AS",
            to_node=r_id,
            to_type="Identity",
            detail=f"Tool '{r_tool}' operates under identity '{r_id}'."
        ),
        PathWitnessStep(
            step_number=3,
            from_node=r_tool,
            from_type="Tool",
            relationship="RETURNS_TO",
            to_node=ctx,
            to_type="AgentContext",
            detail=f"Tool '{r_tool}' returns read payloads directly into shared context '{ctx}'."
        ),
        PathWitnessStep(
            step_number=4,
            from_node=agent,
            from_type="Agent",
            relationship="HAS_CONTEXT",
            to_node=ctx,
            to_type="AgentContext",
            detail=f"Agent '{agent}' actively reads and processes state within '{ctx}'."
        ),
        PathWitnessStep(
            step_number=5,
            from_node=agent,
            from_type="Agent",
            relationship="USES_TOOL",
            to_node=s_tool,
            to_type="Tool",
            detail=f"Agent '{agent}' is configured with invocation access to tool '{s_tool}'."
        ),
        PathWitnessStep(
            step_number=6,
            from_node=s_tool,
            from_type="Tool",
            relationship="AUTHENTICATES_AS",
            to_node=s_id,
            to_type="Identity",
            detail=f"Tool '{s_tool}' authenticates through identity '{s_id}'."
        ),
        PathWitnessStep(
            step_number=7,
            from_node=s_id,
            from_type="Identity",
            relationship="CAN_SEND_TO",
            to_node=dst,
            to_type="Destination",
            detail=f"Identity '{s_id}' is permitted to send external payloads to '{dst}' [{dst_trust}]."
        ),
    ]

    path_nodes = [src, r_id, r_tool, ctx, agent, s_tool, s_id, dst]
    path_edges = [
        f"edge-{r_id}-can_read-{src}",
        f"edge-{r_tool}-authenticates_as-{r_id}",
        f"edge-{r_tool}-returns_to-{ctx}",
        f"edge-{agent}-has_context-{ctx}",
        f"edge-{agent}-uses_tool-{s_tool}",
        f"edge-{s_tool}-authenticates_as-{s_id}",
        f"edge-{s_id}-can_send_to-{dst}"
    ]

    description = (
        f"Data from {cls_level} resource '{src}' is readable by identity '{r_id}' via tool '{r_tool}', "
        f"fed into context '{ctx}' used by agent '{agent}', and transmitted via egress tool '{s_tool}' "
        f"authenticating as '{s_id}' out to {dst_trust} sink '{dst}'."
    )

    return steps, description, path_nodes, path_edges

def execute_falkordb_path_query(graph: Any, limit: int = 250) -> Any:
    """
    Executes the parameterized Cypher query on FalkorDB.
    """
    from backend.app.graph_engine import GraphEngineResult

    result = graph.query(CYPHER_DATAFLOW_QUERY, {"limit": limit})
    records: list[dict[str, Any]] = []

    # FalkorDB result rows
    header = result.header
    col_names = [col[1].decode("utf-8") if isinstance(col[1], bytes) else str(col[1]) for col in header]

    for row in result.result_set:
        rec = {}
        for idx, col in enumerate(col_names):
            val = row[idx]
            if isinstance(val, bytes):
                val = val.decode("utf-8")
            rec[col] = val

        steps, desc, path_nodes, path_edges = build_witness_steps(rec)
        rec["path_node_ids"] = path_nodes
        rec["path_edge_ids"] = path_edges
        records.append(rec)

    is_truncated = len(records) >= limit
    return GraphEngineResult(records=records, is_truncated=is_truncated, engine_type="falkordb")
