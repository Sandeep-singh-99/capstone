from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
    status,
    Request,
    File,
    Form,
    UploadFile,
)
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.service.auth import AuthService
from app.models.auth import User, UserRole
from app.schema.auth import createUser, userSignIn , userResponse, MessageResponse
from app.dependencies.dependencies import get_current_user

router = APIRouter()


@router.post(
    "/register",
    response_model=MessageResponse[userResponse],
    status_code=status.HTTP_201_CREATED,
)
async def register_user(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    create_user: createUser = Depends(createUser.as_form),
    image: UploadFile = File(None),
):
    """Endpoint to register a new user."""
    user, access_token = AuthService.register_user(
        db=db,
        full_name=create_user.full_name,
        email=create_user.email,
        hashed_password=create_user.hashed_password,
        role=create_user.role,
        image=image,
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60 * 60 * 24 * 15,  # 15 days
        secure=True,  # Set to True in production
        samesite="none",
    )

    return MessageResponse(message="User registered successfully", data=user)


@router.post("/login", status_code=status.HTTP_200_OK)
async def login_user(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    user_sign_in: userSignIn = Depends(userSignIn.as_form),
):
    """Endpoint to authenticate a user and provide an access token."""
    _, access_token = AuthService.authenticate_user(
        db=db, email=user_sign_in.email, hashed_password=user_sign_in.password
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60 * 60 * 24 * 15,  # 15 days
        secure=True,  # Set to True in production
        samesite="none",
    )

    return MessageResponse(message="Login successful")


@router.get("/me", response_model=userResponse, status_code=status.HTTP_200_OK)
async def me(request: Request, current_user: User = Depends(get_current_user)):
    """Endpoint to get the current authenticated user's details."""
    return current_user


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout_user(
    request: Request, response: Response, current_user: User = Depends(get_current_user)
):
    """Endpoint to log out the current user by clearing the access token cookie."""
    response.delete_cookie(
        key="access_token", httponly=True, secure=True, samesite="none"
    )
    return MessageResponse(message="Logout successful")
