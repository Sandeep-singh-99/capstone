from langgraph.graph import StateGraph, START, END
from app.graph.state import AgentState
from app.graph.nodes import (
    planner_node,
    image_reader_node,
    report_reader_node,
    symptom_reader_node,
    medical_knowledge_node,
    doctor_recommendation_node,
    history_node,
    chat_node
)
from app.graph.edges import route_planner

def route_after_knowledge(state: AgentState) -> str:
    """Routes after the Medical Knowledge agent based on the flow context."""
    flow = state.get("next_node")
    if flow == "image_reader":
        return "doctor_recommendation"
    elif flow == "report_reader":
        return "history"
    elif flow == "symptom_reader":
        return "doctor_recommendation"
    return "chat"

def route_after_recommendation(state: AgentState) -> str:
    """Routes after the Doctor Recommendation agent based on the flow context."""
    flow = state.get("next_node")
    if flow == "image_reader":
        return "history"
    elif flow == "symptom_reader":
        return "chat"
    return END

def route_after_history(state: AgentState) -> str:
    """Routes after the History agent based on the flow context."""
    flow = state.get("next_node")
    if flow == "report_reader":
        return "chat"
    return END

# 1. Initialize StateGraph
builder = StateGraph(AgentState)

# 2. Add Nodes
builder.add_node("planner", planner_node)
builder.add_node("image_reader", image_reader_node)
builder.add_node("report_reader", report_reader_node)
builder.add_node("symptom_reader", symptom_reader_node)
builder.add_node("medical_knowledge", medical_knowledge_node)
builder.add_node("doctor_recommendation", doctor_recommendation_node)
builder.add_node("history", history_node)
builder.add_node("chat", chat_node)

# 3. Add Edges and Routing
builder.add_edge(START, "planner")

# Conditional routing from Planner
builder.add_conditional_edges(
    "planner",
    route_planner,
    {
        "image_reader": "image_reader",
        "report_reader": "report_reader",
        "symptom_reader": "symptom_reader",
        "chat": "chat"
    }
)

# Flows converge on Medical Knowledge
builder.add_edge("image_reader", "medical_knowledge")
builder.add_edge("report_reader", "medical_knowledge")
builder.add_edge("symptom_reader", "medical_knowledge")

# Conditional edges after Medical Knowledge
builder.add_conditional_edges(
    "medical_knowledge",
    route_after_knowledge,
    {
        "doctor_recommendation": "doctor_recommendation",
        "history": "history",
        "chat": "chat"
    }
)

# Conditional edges after Doctor Recommendation
builder.add_conditional_edges(
    "doctor_recommendation",
    route_after_recommendation,
    {
        "history": "history",
        "chat": "chat",
        END: END
    }
)

# Conditional edges after History
builder.add_conditional_edges(
    "history",
    route_after_history,
    {
        "chat": "chat",
        END: END
    }
)

# Chat always ends the flow
builder.add_edge("chat", END)

# 4. Compile the Graph
# Using simple in-memory checkpointer for thread memory (session state persistence)
from langgraph.checkpoint.memory import MemorySaver
checkpointer = MemorySaver()
compiled_graph = builder.compile(checkpointer=checkpointer)
