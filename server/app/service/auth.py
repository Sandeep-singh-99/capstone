from sqlalchemy.orm import Session
from app.models.auth import User
from app.utils.utils import hash_password, verify_password, create_access_token, decode_access_token
from fastapi import HTTPException, status

class AuthService:
    @staticmethod
    def register_user(db: Session, full_name: str, email: str, hashed_password: str):
        if db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
        hashed_password = hash_password(hashed_password)

        new_user = User(
            full_name=full_name,
            email=email,
            hashed_password=hashed_password
        )

        db.add(new_user)

        try:
            db.commit()
            db.refresh(new_user)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating user")
        
        access_token = create_access_token({"sub": new_user.id})
        return {"user": new_user, "access_token": access_token}
    

    @staticmethod
    def authenticate_user(db: Session, email: str, hashed_password: str):
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(hashed_password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
        access_token = create_access_token({"sub": user.id})
        return {"user": user, "access_token": access_token}