import time
from typing import Dict, Tuple
from fastapi import UploadFile, HTTPException, status, Request
import redis

# Redis rate limiter configuration
REDIS_URL = "redis://localhost:6379/0"
MAX_REQUESTS_PER_MINUTE = 60

# In-memory token bucket fallback (IP -> (tokens, last_update_time))
_rate_limit_cache: Dict[str, Tuple[float, float]] = {}

def check_rate_limit(request: Request):
    """
    Checks the request rate limit.
    Attempts connection to Redis first, then falls back to in-memory tracking.
    """
    client_ip = request.client.host if request.client else "unknown"
    
    # 1. Attempt using Redis
    try:
        r = redis.Redis.from_url(REDIS_URL, socket_timeout=1.0)
        key = f"rate_limit:{client_ip}"
        requests = r.incr(key)
        if requests == 1:
            r.expire(key, 60) # 1 minute window
            
        if requests > MAX_REQUESTS_PER_MINUTE:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Maximum 60 requests per minute."
            )
        return
    except (redis.ConnectionError, redis.TimeoutError):
        # Fallback to in-memory if Redis is not running
        pass
        
    # 2. In-memory Token Bucket Limiter fallback
    now = time.time()
    rate = MAX_REQUESTS_PER_MINUTE / 60.0 # tokens per second
    capacity = MAX_REQUESTS_PER_MINUTE
    
    tokens, last_check = _rate_limit_cache.get(client_ip, (capacity, now))
    
    # Add tokens elapsed since last check
    elapsed = now - last_check
    tokens = min(capacity, tokens + elapsed * rate)
    
    if tokens < 1.0:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please slow down."
        )
        
    _rate_limit_cache[client_ip] = (tokens - 1.0, now)

def validate_uploaded_file(file: UploadFile):
    """
    Validates uploaded file size and content type.
    Limit: 10MB
    Supported types: PNG, JPEG, JPG, PDF
    """
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "application/pdf"]
    max_size_bytes = 10 * 1024 * 1024 # 10MB
    
    # Check mime type
    if file.content_type not in allowed_types:
        # Fallback check file extension if MIME type is generic
        ext = file.filename.lower().split('.')[-1]
        if ext not in ['png', 'jpg', 'jpeg', 'pdf']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {file.content_type}. Only PDF and images (PNG, JPEG) are allowed."
            )
            
    # Check file size
    try:
        # Move cursor to end of file to read length
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0) # Reset cursor to beginning of file
        
        if size > max_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds 10MB limit. Uploaded file is {size / (1024*1024):.2f}MB."
            )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating file size: {str(e)}"
        )
