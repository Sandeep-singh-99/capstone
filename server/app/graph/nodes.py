from app.graph.state import AgentState
from app.agents.planner_agent import run_planner_agent
from app.agents.image_reader_agent import run_image_reader_agent
from app.agents.report_reader_agent import run_report_reader_agent
from app.agents.symptom_reader_agent import run_symptom_reader_agent
from app.agents.medical_knowledge_agent import run_medical_knowledge_agent
from app.agents.doctor_recommendation_agent import run_doctor_recommendation_agent
from app.agents.history_agent import run_history_agent
from app.agents.chat_agent import run_chat_agent

def planner_node(state: AgentState) -> AgentState:
    return run_planner_agent(state)

def image_reader_node(state: AgentState) -> AgentState:
    return run_image_reader_agent(state)

def report_reader_node(state: AgentState) -> AgentState:
    return run_report_reader_agent(state)

def symptom_reader_node(state: AgentState) -> AgentState:
    return run_symptom_reader_agent(state)

def medical_knowledge_node(state: AgentState) -> AgentState:
    return run_medical_knowledge_agent(state)

def doctor_recommendation_node(state: AgentState) -> AgentState:
    return run_doctor_recommendation_agent(state)

def history_node(state: AgentState) -> AgentState:
    return run_history_agent(state)

def chat_node(state: AgentState) -> AgentState:
    return run_chat_agent(state)
