from fastmcp import FastMCP
from app.mcp.medical_server import medical_term_lookup, search_medical_information, explain_lab_result
from app.mcp.history_server import save_history, get_history, compare_reports
from app.mcp.recommendation_server import recommend_specialist, create_followup_reminder, list_specialists

mcp = FastMCP("MediGuide Combined Server")

# Register medical tools
mcp.tool()(medical_term_lookup)
mcp.tool()(search_medical_information)
mcp.tool()(explain_lab_result)

# Register history tools
mcp.tool()(save_history)
mcp.tool()(get_history)
mcp.tool()(compare_reports)

# Register recommendation tools
mcp.tool()(recommend_specialist)
mcp.tool()(create_followup_reminder)
mcp.tool()(list_specialists)

if __name__ == "__main__":
    # Runs the server in stdio mode (standard for MCP clients)
    mcp.run()
