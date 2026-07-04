import os
import json
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.specialist import Specialist

DEFAULT_SPECIALISTS = [
    {
        "name": "Cardiologist",
        "description": "Specialist in heart diseases and cardiovascular health.",
        "symptoms": [
            "chest pain", "palpitations", "shortness of breath", 
            "dizziness on exertion", "irregular heartbeat", "high blood pressure"
        ]
    },
    {
        "name": "Dermatologist",
        "description": "Specialist in skin, hair, and nail conditions.",
        "symptoms": [
            "skin rash", "itching", "acne", "dry skin", "hives", 
            "eczema", "skin lesion", "mole change", "dandruff"
        ]
    },
    {
        "name": "Ophthalmologist",
        "description": "Specialist in eye and vision care, including surgeries.",
        "symptoms": [
            "eye pain", "blurry vision", "double vision", "eye redness", 
            "vision loss", "sensitivity to light", "dry eyes"
        ]
    },
    {
        "name": "Neurologist",
        "description": "Specialist in brain, spinal cord, and nervous system disorders.",
        "symptoms": [
            "severe headache", "migraine", "numbness", "tingling", 
            "frequent dizziness", "seizures", "memory loss", "tremor"
        ]
    },
    {
        "name": "Orthopedist",
        "description": "Specialist in bone, joint, ligament, and muscle issues.",
        "symptoms": [
            "joint pain", "bone fracture", "back pain", "neck pain", 
            "muscle strain", "swollen joints", "arthritis"
        ]
    },
    {
        "name": "Gastroenterologist",
        "description": "Specialist in the digestive system and gastrointestinal tract.",
        "symptoms": [
            "abdominal pain", "persistent nausea", "acid reflux", "bloating", 
            "heartburn", "constipation", "diarrhea", "indigestion"
        ]
    },
    {
        "name": "Endocrinologist",
        "description": "Specialist in hormones, diabetes, and endocrine glands.",
        "symptoms": [
            "chronic fatigue", "rapid weight loss", "rapid weight gain", 
            "excessive thirst", "frequent urination", "heat intolerance"
        ]
    },
    {
        "name": "General Practitioner",
        "description": "Family doctor providing primary care for general symptoms.",
        "symptoms": [
            "fever", "sore throat", "cough", "runny nose", "body aches", 
            "mild fatigue", "sneezing", "congestion"
        ]
    }
]

def seed_specialists():
    db: Session = SessionLocal()
    try:
        print("Seeding specialists...")
        for spec_data in DEFAULT_SPECIALISTS:
            existing = db.query(Specialist).filter(Specialist.name == spec_data["name"]).first()
            if not existing:
                specialist = Specialist(
                    name=spec_data["name"],
                    description=spec_data["description"],
                    symptoms=spec_data["symptoms"]
                )
                db.add(specialist)
                print(f"Added specialist: {spec_data['name']}")
            else:
                existing.description = spec_data["description"]
                existing.symptoms = spec_data["symptoms"]
                print(f"Updated specialist: {spec_data['name']}")
        db.commit()
        print("Seeding complete successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_specialists()
