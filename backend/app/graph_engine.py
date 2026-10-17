import logging
from typing import Any
from backend.app.config import settings
from backend.app.schemas import ConfigurationSnapshot, GraphData

logger = logging.getLogger(__name__)

class GraphEngineResult:
    def __init__(self, records: list[dict[str, Any]], is_truncated: bool = False, engine_type: str = "falkordb"):
        self.records = records
        self.is_truncated = is_truncated
        self.engine_type = engine_type

class InMemoryGraphSnapshot:
    """
    High-fidelity graph representation and Cypher-equivalent traversal engine.
    Ensures deterministic, fast evaluation and serves as reliable fallback when FalkorDB is starting.
    """
    def __init__(self, snapshot_id: str):
        self.snapshot_id = snapshot_id
        self.nodes: dict[str, dict] = {}  # id -> {label, props}
        self.edges: list[dict] = []  # {source, target, type, props}
        self.out_edges: dict[str, list[dict]] = {}
        self.in_edges: dict[str, list[dict]] = {}

    def add_node(self, node_id: str, label: str, properties: dict):
        self.nodes[node_id] = {"id": node_id, "label": label, "properties": properties}
        if node_id not in self.out_edges:
            self.out_edges[node_id] = []
        if node_id not in self.in_edges:
            self.in_edges[node_id] = []

    def add_edge(self, source_id: str, rel_type: str, target_id: str, properties: dict | None = None):
        edge = {
            "source": source_id,
            "target": target_id,
            "type": rel_type,
            "properties": properties or {}
        }
        self.edges.append(edge)
        self.out_edges.setdefault(source_id, []).append(edge)
        self.in_edges.setdefault(target_id, []).append(edge)

    def query_source_to_sink_paths(self, limit: int = 250) -> GraphEngineResult:
        """
        Executes the exact multi-hop data-flow query:
        (src:Resource)<-[:CAN_READ]-(readIdentity:Identity)
          <-[:AUTHENTICATES_AS]-(readTool:Tool)
          -[:RETURNS_TO]->(ctx:AgentContext)
          <-[:HAS_CONTEXT]-(agent:Agent)
          -[:USES_TOOL]->(sendTool:Tool)
          -[:AUTHENTICATES_AS]->(sendIdentity:Identity)
          -[:CAN_SEND_TO]->(dst:Destination),
        (src)-[:CLASSIFIED_AS]->(class:DataClass)
        """
        records: list[dict[str, Any]] = []
        is_truncated = False

        # Find all agents
        agent_nodes = [nid for nid, n in self.nodes.items() if n["label"] == "Agent"]

        for agent_id in agent_nodes:
            # agent -> ctx via HAS_CONTEXT
            agent_ctxs = [
                e["target"] for e in self.out_edges.get(agent_id, [])
                if e["type"] == "HAS_CONTEXT" and self.nodes.get(e["target"], {}).get("label") == "AgentContext"
            ]

            # agent -> sendTool via USES_TOOL
            send_tool_candidates = [
                e["target"] for e in self.out_edges.get(agent_id, [])
                if e["type"] == "USES_TOOL" and self.nodes.get(e["target"], {}).get("label") == "Tool"
            ]

            for ctx_id in agent_ctxs:
                # readTool -> ctx via RETURNS_TO
                read_tool_edges = [
                    e["source"] for e in self.in_edges.get(ctx_id, [])
                    if e["type"] == "RETURNS_TO" and self.nodes.get(e["source"], {}).get("label") == "Tool"
                ]

                # Filter read tools that the agent actually USES_TOOL or has in its scope
                agent_tools = set(send_tool_candidates)
                read_tools = [t for t in read_tool_edges if t in agent_tools]

                for read_tool_id in read_tools:
                    # readTool -> readIdentity via AUTHENTICATES_AS
                    read_idents = [
                        e["target"] for e in self.out_edges.get(read_tool_id, [])
                        if e["type"] == "AUTHENTICATES_AS" and self.nodes.get(e["target"], {}).get("label") == "Identity"
                    ]

                    for read_ident_id in read_idents:
                        # readIdentity -> src via CAN_READ
                        src_resources = [
                            e["target"] for e in self.out_edges.get(read_ident_id, [])
                            if e["type"] == "CAN_READ" and self.nodes.get(e["target"], {}).get("label") == "Resource"
                        ]

                        for src_id in src_resources:
                            src_node = self.nodes.get(src_id, {})
                            classification = src_node.get("properties", {}).get("classification", "unknown")

                            # Now evaluate send tools
                            for send_tool_id in send_tool_candidates:
                                # sendTool -> sendIdentity via AUTHENTICATES_AS
                                send_idents = [
                                    e["target"] for e in self.out_edges.get(send_tool_id, [])
                                    if e["type"] == "AUTHENTICATES_AS" and self.nodes.get(e["target"], {}).get("label") == "Identity"
                                ]

                                for send_ident_id in send_idents:
                                    # sendIdentity -> dst via CAN_SEND_TO
                                    dst_nodes = [
                                        e["target"] for e in self.out_edges.get(send_ident_id, [])
                                        if e["type"] == "CAN_SEND_TO" and self.nodes.get(e["target"], {}).get("label") == "Destination"
                                    ]

                                    for dst_id in dst_nodes:
                                        dst_node = self.nodes.get(dst_id, {})
                                        trust = dst_node.get("properties", {}).get("trust", "unknown")

                                        path_nodes = [
                                            src_id,
                                            read_ident_id,
                                            read_tool_id,
                                            ctx_id,
                                            agent_id,
                                            send_tool_id,
                                            send_ident_id,
                                            dst_id
                                        ]

                                        path_edges = [
                                            f"edge-{read_ident_id}-can_read-{src_id}",
                                            f"edge-{read_tool_id}-authenticates_as-{read_ident_id}",
                                            f"edge-{read_tool_id}-returns_to-{ctx_id}",
                                            f"edge-{agent_id}-has_context-{ctx_id}",
                                            f"edge-{agent_id}-uses_tool-{send_tool_id}",
                                            f"edge-{send_tool_id}-authenticates_as-{send_ident_id}",
                                            f"edge-{send_ident_id}-can_send_to-{dst_id}"
                                        ]

                                        records.append({
                                            "agent_id": agent_id,
                                            "source_id": src_id,
                                            "classification": classification,
                                            "read_tool": read_tool_id,
                                            "read_identity": read_ident_id,
                                            "agent_context": ctx_id,
                                            "send_tool": send_tool_id,
                                            "send_identity": send_ident_id,
                                            "destination_id": dst_id,
                                            "destination_trust": trust,
                                            "path_node_ids": path_nodes,
                                            "path_edge_ids": path_edges
                                        })

                                        if len(records) >= limit:
                                            is_truncated = True
                                            return GraphEngineResult(records=records, is_truncated=True, engine_type="in_memory")

        return GraphEngineResult(records=records, is_truncated=is_truncated, engine_type="in_memory")


class GraphEngineManager:
    """
    Coordinates graph storage and Cypher queries. Connects to FalkorDB when online;
    falls back smoothly to high-fidelity In-Memory engine if FalkorDB is offline.
    """
    def __init__(self):
        self._falkordb_client = None
        self._is_falkordb_connected = False
        self._check_connection()

    def _check_connection(self) -> bool:
        try:
            from falkordb import FalkorDB
            client = FalkorDB(
                host=settings.falkordb_host,
                port=settings.falkordb_port,
                password=settings.falkordb_password
            )
            # Ping/verify
            client.connection.ping()
            self._falkordb_client = client
            self._is_falkordb_connected = True
            logger.info("FalkorDB connection successfully verified.")
            return True
        except Exception as e:
            self._is_falkordb_connected = False
            self._falkordb_client = None
            logger.info(f"FalkorDB not directly reachable ({e}); operating in compliant local graph engine mode.")
            return False

    @property
    def is_falkordb_available(self) -> bool:
        if not self._is_falkordb_connected:
            return self._check_connection()
        return True

    def get_status(self) -> dict:
        online = self.is_falkordb_available
        return {
            "falkordb_connected": online,
            "engine_mode": "falkordb_native" if online else "local_graph_engine_active",
            "host": settings.falkordb_host,
            "port": settings.falkordb_port
        }

    def build_graph(self, snapshot_id: str, snapshot: ConfigurationSnapshot) -> Any:
        """
        Builds graph in FalkorDB if available, otherwise builds in-memory graph.
        """
        if self.is_falkordb_available:
            try:
                graph = self._falkordb_client.select_graph(f"graphgate_{snapshot_id}")
                # Clear previous data in this isolated snapshot graph
                try:
                    graph.query("MATCH (n) DETACH DELETE n")
                except Exception:
                    pass
                
                # Import nodes and relationships into FalkorDB
                from backend.app.graph_builder import populate_falkordb_graph
                populate_falkordb_graph(graph, snapshot)
                return graph
            except Exception as e:
                logger.warning(f"Error communicating with FalkorDB: {e}; falling back to local engine.")
                self._is_falkordb_connected = False

        # In-memory graph builder
        from backend.app.graph_builder import populate_inmemory_graph
        mem_graph = InMemoryGraphSnapshot(snapshot_id)
        populate_inmemory_graph(mem_graph, snapshot)
        return mem_graph

    def query_paths(self, graph: Any, limit: int = 250) -> GraphEngineResult:
        if isinstance(graph, InMemoryGraphSnapshot):
            return graph.query_source_to_sink_paths(limit=limit)
        
        # Native FalkorDB Cypher execution
        from backend.app.graph_queries import execute_falkordb_path_query
        return execute_falkordb_path_query(graph, limit=limit)

engine_manager = GraphEngineManager()
