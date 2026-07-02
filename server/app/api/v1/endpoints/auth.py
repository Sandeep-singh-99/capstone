from fastapi import APIRouter, Depends, HTTPException, Response, status, Request, Form
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.service.auth import AuthService
from app.models.auth import User, UserRole