import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.core.database import SessionLocal, get_db
from app.models.auth import User
from app.models.medical_report import MedicalReport
from app.models.conversation import Conversation
from app.models.chat_history import ChatHistory
from app.models.reminder import Reminder
from app.models.audit_log import AuditLog
from app.models.health_history import HealthHistory

client = TestClient(app)

def test_integration_flow():
    print("\n==================================================")
    print("STARTING INTEGRATION TEST FLOW FOR MEDIGUIDE AI")
    print("==================================================")
    
    # Setup test DB cleanup
    db: Session = SessionLocal()
    try:
        # Delete previous test user if exists
        user = db.query(User).filter(User.email == "test_patient@mediguide.ai").first()
        if user:
            print("Cleaning up existing test user data...")
            db.query(Reminder).filter(Reminder.user_id == user.id).delete()
            db.query(ChatHistory).filter(ChatHistory.user_id == user.id).delete()
            db.query(Conversation).filter(Conversation.user_id == user.id).delete()
            db.query(MedicalReport).filter(MedicalReport.user_id == user.id).delete()
            db.query(AuditLog).filter(AuditLog.user_id == user.id).delete()
            db.query(HealthHistory).filter(HealthHistory.user_id == user.id).delete() # Added: Delete health history
            db.query(User).filter(User.id == user.id).delete()
            db.commit()
            print("Cleanup successful.")
    except Exception as e:
        db.rollback()
        print(f"Cleanup failed: {e}")
    finally:
        db.close()

    # 1. Register User
    print("\n[Step 1] Registering a new Patient...")
    reg_response = client.post(
        "/api/v1/auth/register",
        data={
            "full_name": "Alice Cooper",
            "email": "test_patient@mediguide.ai",
            "hashed_password": "securepassword123",
            "role": "patient"
        }
    )
    print(f"Status: {reg_response.status_code}")
    assert reg_response.status_code == 201 or reg_response.status_code == 215, f"Failed registration: {reg_response.text}"
    print(f"Response: {reg_response.json()}")

    # Extract secure cookie and create manual Cookie header for test requests
    token = reg_response.cookies.get("access_token")
    headers = {"Cookie": f"access_token={token}"}
    
    # 2. Get Profile
    print("\n[Step 2] Retrieving Profile ('/me')...")
    me_response = client.get("/api/v1/auth/me", headers=headers)
    print(f"Status: {me_response.status_code}")
    assert me_response.status_code == 200
    user_data = me_response.json()
    print(f"Patient profile: {user_data}")
    user_id = user_data["id"]

    # 3. List Specialties
    print("\n[Step 3] Querying Specialties Catalog...")
    spec_response = client.get("/api/v1/specialists/", headers=headers)
    print(f"Status: {spec_response.status_code}")
    assert spec_response.status_code == 200
    print(f"Available Specialties: {len(spec_response.json()['data'])} found.")

    # 4. Recommend Specialist
    print("\n[Step 4] Querying Specialist Recommendation for Symptoms...")
    rec_response = client.post(
        "/api/v1/specialists/recommend",
        json={"symptoms": ["chest pain", "shortness of breath"]},
        headers=headers
    )
    print(f"Status: {rec_response.status_code}")
    assert rec_response.status_code == 200
    print(f"Recommended Specialist response:\n{rec_response.json()['data']['recommendation_text']}")

    # 5. Upload Medical Report (Tiny valid PNG image)
    print("\n[Step 5] Uploading a Mock PNG Medical Report Image...")
    from PIL import Image
    import io
    img = Image.new('RGB', (10, 10), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()
    files = {"file": ("report.png", img_bytes, "image/png")}
    
    upload_response = client.post(
        "/api/v1/reports/upload",
        files=files,
        headers=headers
    )
    print(f"Status: {upload_response.status_code}")
    assert upload_response.status_code == 201, f"Upload failed: {upload_response.text}"
    upload_data = upload_response.json()["data"]
    report_id = upload_data["report"]["id"]
    print(f"Report uploaded successfully! ID: {report_id}")
    print(f"AI Summary:\n{upload_data['analysis']}")

    # 6. Start Conversation Session
    print("\n[Step 6] Starting Chat Conversation...")
    start_response = client.post(
        "/api/v1/chat/start",
        json={"report_id": report_id, "title": "Explain my Blood Report"},
        headers=headers
    )
    print(f"Status: {start_response.status_code}")
    assert start_response.status_code == 201
    convo_data = start_response.json()["data"]
    conversation_id = convo_data["id"]
    print(f"Conversation Session Started. ID: {conversation_id}")

    # 7. Send Follow-up Message
    print("\n[Step 7] Sending Chat Message (Asking for clarification)...")
    msg_response = client.post(
        f"/api/v1/chat/{conversation_id}/message",
        json={"message": "Can you explain what my HbA1c level means in simple terms?"},
        headers=headers
    )
    print(f"Status: {msg_response.status_code}")
    assert msg_response.status_code == 200
    print(f"AI Chat Response:\n{msg_response.json()['data']['response']}")

    # 8. Check Health History Logs
    print("\n[Step 8] Retrieving Patient Health History...")
    hist_response = client.get("/api/v1/history/", headers=headers)
    print(f"Status: {hist_response.status_code}")
    assert hist_response.status_code == 200
    history_records = hist_response.json()["data"]
    print(f"Retrieved {len(history_records)} health history milestone logs:")
    for rec in history_records:
        print(f"- {rec['title']}: {rec['description']}")

    # 9. Create Reminder
    print("\n[Step 9] Creating a Follow-up Reminder...")
    rem_response = client.post(
        "/api/v1/reminders/",
        json={
            "title": "Check blood sugar level",
            "description": "Fasting check in the morning",
            "reminder_date": "2026-08-01T08:00:00"
        },
        headers=headers
    )
    print(f"Status: {rem_response.status_code}")
    assert rem_response.status_code == 201
    reminder_id = rem_response.json()["data"]["id"]
    print(f"Reminder created! ID: {reminder_id}")

    # 10. Get Reminders List
    print("\n[Step 10] Retrieving Reminders...")
    list_rem_response = client.get("/api/v1/reminders/", headers=headers)
    print(f"Status: {list_rem_response.status_code}")
    assert list_rem_response.status_code == 200
    print(f"Patient has {len(list_rem_response.json()['data'])} active reminders.")

    # 11. Delete Reminder
    print("\n[Step 11] Deleting the Reminder...")
    del_response = client.delete(f"/api/v1/reminders/{reminder_id}", headers=headers)
    print(f"Status: {del_response.status_code}")
    assert del_response.status_code == 200

    print("\n==================================================")
    print("INTEGRATION TEST PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    test_integration_flow()
