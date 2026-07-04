import logging
import sys

def setup_structured_logging():
    """
    Sets up a structured log format for console and file logging.
    """
    logger = logging.getLogger("MediGuide")
    logger.setLevel(logging.INFO)
    
    # Check if handlers already exist to avoid adding duplicates
    if not logger.handlers:
        # Create formatter
        formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s in %(module)s (Line %(lineno)d): %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Console Handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        # Prevent double logging to root logger
        logger.propagate = False
        
    print("Structured logging configured successfully.")
    return logger

# Singleton logger instance
logger = setup_structured_logging()
