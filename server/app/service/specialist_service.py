from sqlalchemy.orm import Session
from app.repositories.db_repositories import SpecialistRepository
from app.mcp.recommendation_server import recommend_specialist

class SpecialistService:
    @staticmethod
    def list_specialties(db: Session):
        repo = SpecialistRepository(db)
        return repo.get_all()

    @staticmethod
    def recommend_specialist_by_symptoms(db: Session, symptoms: list[str]):
        """
        Invokes Recommendation MCP logic to map symptoms to doctor specialties.
        """
        recommendation = recommend_specialist(symptoms)
        
        # Extract specialist name
        spec_name = "General Practitioner"
        for line in recommendation.split("\n"):
            if "Recommended Specialist:" in line:
                spec_name = line.replace("Recommended Specialist:", "").strip()
                break
                
        # Fetch the specialist details from database
        repo = SpecialistRepository(db)
        specialist = repo.get_by_name(spec_name)
        
        return {
            "specialist": specialist,
            "recommendation_text": recommendation
        }
