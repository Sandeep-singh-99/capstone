from fastapi import APIRouter
from app.api.v1.endpoints import auth, reports, chat, history, specialists, reminders

app_router = APIRouter()

app_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app_router.include_router(reports.router, prefix="/reports", tags=["Medical Reports"])
app_router.include_router(chat.router, prefix="/chat", tags=["Consultation Chat"])
app_router.include_router(history.router, prefix="/history", tags=["Health History"])
app_router.include_router(specialists.router, prefix="/specialists", tags=["Specialist Recommendations"])
app_router.include_router(reminders.router, prefix="/reminders", tags=["Patient Reminders"])
