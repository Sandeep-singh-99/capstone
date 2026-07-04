from app.graph.state import AgentState

def route_planner(state: AgentState) -> str:
    """
    Conditional edge router that reads next_node and sends execution to the target node.
    """
    next_node = state.get("next_node")
    print(f"Routing edge evaluation: next_node = {next_node}")
    
    if next_node in ["image_reader", "report_reader", "symptom_reader", "chat"]:
        return next_node
        
    return "chat" # default fallback
