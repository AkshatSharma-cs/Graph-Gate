from typing import Any
from backend.app.schemas import ConfigurationSnapshot
from backend.app.normalize import normalize_snapshot

def populate_inmemory_graph(mem_graph: Any, snapshot: ConfigurationSnapshot) -> None:
    norm = normalize_snapshot(snapshot)

    # 1. Resources & DataClasses
    for r in norm.resources:
        mem_graph.add_node(r.id, "Resource", {
            "name": r.name or r.id,
            "classification": r.classification,
            "resource_type": r.resource_type
        })
        class_id = f"dataclass-{r.classification}"
        mem_graph.add_node(class_id, "DataClass", {"level": r.classification})
        mem_graph.add_edge(r.id, "CLASSIFIED_AS", class_id)

    # 2. Destinations
    for d in norm.destinations:
        mem_graph.add_node(d.id, "Destination", {
            "name": d.name or d.id,
            "trust": d.trust
        })

    # 3. Identities & Access edges
    for ident in norm.identities:
        mem_graph.add_node(ident.id, "Identity", {
            "name": ident.name or ident.id,
            "principal_type": ident.principal_type
        })
        for r_id in ident.can_read:
            mem_graph.add_edge(ident.id, "CAN_READ", r_id)
        for d_id in ident.can_send_to:
            mem_graph.add_edge(ident.id, "CAN_SEND_TO", d_id)

    # 4. Contexts
    for ctx in norm.contexts:
        mem_graph.add_node(ctx.id, "AgentContext", {
            "name": ctx.name or ctx.id,
            "is_shared": ctx.is_shared
        })

    # 5. Tools
    for t in norm.tools:
        mem_graph.add_node(t.id, "Tool", {
            "name": t.name or t.id,
            "kind": t.kind
        })
        if t.identity_id:
            mem_graph.add_edge(t.id, "AUTHENTICATES_AS", t.identity_id)
        if t.context_id:
            mem_graph.add_edge(t.id, "RETURNS_TO", t.context_id)

    # 6. Agents
    for a in norm.agents:
        mem_graph.add_node(a.id, "Agent", {
            "name": a.name or a.id,
            "framework": a.framework
        })
        if a.context_id:
            mem_graph.add_edge(a.id, "HAS_CONTEXT", a.context_id)
        for t_id in a.tools:
            mem_graph.add_edge(a.id, "USES_TOOL", t_id)

def populate_falkordb_graph(graph: Any, snapshot: ConfigurationSnapshot) -> None:
    norm = normalize_snapshot(snapshot)

    # 1. Resources and DataClasses
    for r in norm.resources:
        graph.query(
            "MERGE (r:Resource {id: $id}) SET r.name = $name, r.classification = $classification, r.resource_type = $res_type",
            {"id": r.id, "name": r.name or r.id, "classification": r.classification, "res_type": r.resource_type}
        )
        class_id = f"dataclass-{r.classification}"
        graph.query(
            "MERGE (c:DataClass {id: $id}) SET c.level = $level",
            {"id": class_id, "level": r.classification}
        )
        graph.query(
            "MATCH (r:Resource {id: $rid}), (c:DataClass {id: $cid}) MERGE (r)-[:CLASSIFIED_AS]->(c)",
            {"rid": r.id, "cid": class_id}
        )

    # 2. Destinations
    for d in norm.destinations:
        graph.query(
            "MERGE (dst:Destination {id: $id}) SET dst.name = $name, dst.trust = $trust",
            {"id": d.id, "name": d.name or d.id, "trust": d.trust}
        )

    # 3. Identities
    for ident in norm.identities:
        graph.query(
            "MERGE (i:Identity {id: $id}) SET i.name = $name, i.principal_type = $ptype",
            {"id": ident.id, "name": ident.name or ident.id, "ptype": ident.principal_type}
        )
        for r_id in ident.can_read:
            graph.query(
                "MATCH (i:Identity {id: $iid}), (r:Resource {id: $rid}) MERGE (i)-[:CAN_READ]->(r)",
                {"iid": ident.id, "rid": r_id}
            )
        for d_id in ident.can_send_to:
            graph.query(
                "MATCH (i:Identity {id: $iid}), (dst:Destination {id: $did}) MERGE (i)-[:CAN_SEND_TO]->(dst)",
                {"iid": ident.id, "did": d_id}
            )

    # 4. AgentContexts
    for ctx in norm.contexts:
        graph.query(
            "MERGE (ctx:AgentContext {id: $id}) SET ctx.name = $name, ctx.is_shared = $is_shared",
            {"id": ctx.id, "name": ctx.name or ctx.id, "is_shared": ctx.is_shared}
        )

    # 5. Tools
    for t in norm.tools:
        graph.query(
            "MERGE (t:Tool {id: $id}) SET t.name = $name, t.kind = $kind",
            {"id": t.id, "name": t.name or t.id, "kind": t.kind}
        )
        if t.identity_id:
            graph.query(
                "MATCH (t:Tool {id: $tid}), (i:Identity {id: $iid}) MERGE (t)-[:AUTHENTICATES_AS]->(i)",
                {"tid": t.id, "iid": t.identity_id}
            )
        if t.context_id:
            graph.query(
                "MATCH (t:Tool {id: $tid}), (ctx:AgentContext {id: $cid}) MERGE (t)-[:RETURNS_TO]->(ctx)",
                {"tid": t.id, "cid": t.context_id}
            )

    # 6. Agents
    for a in norm.agents:
        graph.query(
            "MERGE (a:Agent {id: $id}) SET a.name = $name, a.framework = $framework",
            {"id": a.id, "name": a.name or a.id, "framework": a.framework}
        )
        if a.context_id:
            graph.query(
                "MATCH (a:Agent {id: $aid}), (ctx:AgentContext {id: $cid}) MERGE (a)-[:HAS_CONTEXT]->(ctx)",
                {"aid": a.id, "cid": a.context_id}
            )
        for t_id in a.tools:
            graph.query(
                "MATCH (a:Agent {id: $aid}), (t:Tool {id: $tid}) MERGE (a)-[:USES_TOOL]->(t)",
                {"aid": a.id, "tid": t_id}
            )
