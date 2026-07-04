from fastmcp import FastMCP
from app.rag.retriever import retrieve_medical_context

mcp = FastMCP("Medical")

# A dictionary of common medical terms for quick offline lookup
MEDICAL_DICTIONARY = {
    "anemia": "A condition in which the blood doesn't have enough healthy red blood cells, leading to reduced oxygen flow.",
    "arrhythmia": "An irregular, too fast, or too slow heartbeat.",
    "hypertension": "High blood pressure, typically defined as blood pressure above 130/80 mmHg.",
    "gerd": "Gastroesophageal reflux disease, a chronic digestive disease where stomach acid flows back into the food pipe.",
    "leukopenia": "A reduction in the number of white blood cells in the blood, making it harder to fight infections.",
    "thrombocytopenia": "A low blood platelet count, which can lead to easy bruising or bleeding.",
    "hba1c": "Glycated hemoglobin, a test that measures average blood sugar levels over the past three months.",
    "cholesterol": "A waxy substance found in your blood, needed to build healthy cells, but high levels can increase heart disease risk."
}

@mcp.tool()
def medical_term_lookup(term: str) -> str:
    """
    Look up a common medical term and get its definition in simple, easy-to-understand language.
    """
    term_lower = term.strip().lower()
    if term_lower in MEDICAL_DICTIONARY:
        return f"{term}: {MEDICAL_DICTIONARY[term_lower]}\n\nDisclaimer: This info is for educational purposes only."
        
    # If not in simple dictionary, retrieve from RAG
    context = retrieve_medical_context(term_lower, k=1)
    if "No specific educational resources found" in context:
        return f"Term '{term}' not found in simple dictionary. Try search_medical_information."
    return f"Definition/Context found for '{term}':\n{context}\n\nDisclaimer: For educational purposes only."

@mcp.tool()
def search_medical_information(query: str) -> str:
    """
    Search the trusted medical knowledge base for clinical educational information matching a query.
    """
    context = retrieve_medical_context(query, k=3)
    return f"Trusted educational clinical info matching your query:\n\n{context}\n\nDisclaimer: Educational only. Consult a doctor."

@mcp.tool()
def explain_lab_result(lab_name: str, value: float) -> str:
    """
    Provide an educational explanation of common lab test results (e.g. Total Cholesterol, HbA1c, WBC) and state standard ranges.
    """
    lab_lower = lab_name.strip().lower()
    
    explanation = ""
    # Glucose check
    if "glucose" in lab_lower:
        if value < 70:
            explanation = f"Glucose value ({value} mg/dL) is low (Hypoglycemia). Symptoms include shakiness, dizziness, sweating, and confusion."
        elif value <= 99:
            explanation = f"Glucose value ({value} mg/dL) is within the normal fasting range (70–99 mg/dL)."
        elif value <= 125:
            explanation = f"Glucose value ({value} mg/dL) is in the Prediabetes range (100–125 mg/dL)."
        else:
            explanation = f"Glucose value ({value} mg/dL) is in the Diabetes range (126 mg/dL or higher on fasting)."
            
    # HbA1c check
    elif "hba1c" in lab_lower or "a1c" in lab_lower:
        if value < 5.7:
            explanation = f"HbA1c value ({value}%) is in the normal range (under 5.7%)."
        elif value <= 6.4:
            explanation = f"HbA1c value ({value}%) is in the Prediabetes range (5.7%–6.4%)."
        else:
            explanation = f"HbA1c value ({value}%) is in the Diabetes range (6.5% or higher)."
            
    # Total Cholesterol check
    elif "cholesterol" in lab_lower:
        if value < 200:
            explanation = f"Total Cholesterol value ({value} mg/dL) is desirable (under 200 mg/dL)."
        elif value <= 239:
            explanation = f"Total Cholesterol value ({value} mg/dL) is borderline high (200–239 mg/dL)."
        else:
            explanation = f"Total Cholesterol value ({value} mg/dL) is high (240 mg/dL or higher)."
            
    # WBC check
    elif "wbc" in lab_lower or "white blood" in lab_lower:
        if value < 4.5:
            explanation = f"White Blood Cell count ({value}k/mcL) is low (Leukopenia), which can increase infection susceptibility."
        elif value <= 11.0:
            explanation = f"White Blood Cell count ({value}k/mcL) is in the normal range (4.5–11.0k/mcL)."
        else:
            explanation = f"White Blood Cell count ({value}k/mcL) is elevated (Leukocytosis), often due to inflammation, infection, or stress."
            
    else:
        # Generic query to RAG
        context = retrieve_medical_context(lab_name, k=1)
        explanation = f"Lab test '{lab_name}' with value {value} was looked up in medical database:\n{context}"
        
    return f"{explanation}\n\nDisclaimer: This explanation is educational only. It is not a diagnosis. Please verify with your doctor."
