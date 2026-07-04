import io
import logging
from typing import Optional
from PIL import Image

logger = logging.getLogger(__name__)

def bytes_to_pil_image(image_bytes: bytes) -> Optional[Image.Image]:
    """
    Converts raw image bytes from an uploaded file into a PIL Image object.
    Ensures that the image data is valid and readable.
    """
    if not image_bytes:
        logger.warning("Empty bytes passed to bytes_to_pil_image helper.")
        return None
        
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Optional: Force loading the pixel data to catch corrupted image uploads early
        image.verify() 
        
        # re-open because verify() closes or invalidates the stream file pointer
        image = Image.open(io.BytesIO(image_bytes))
        return image
    except Exception as e:
        logger.error(f"Failed to process image bytes into PIL Image: {str(e)}")
        return None


def resize_image_if_large(image: Image.Image, max_size: int = 2048) -> Image.Image:
    """
    Resizes large images down to a maximum bounding box size while preserving aspect ratio.
    This saves API bandwidth and improves processing speeds for massive mobile uploads.
    """
    try:
        width, height = image.size
        if width > max_size or height > max_size:
            if width > height:
                new_width = max_size
                new_height = int((height / width) * max_size)
            else:
                new_height = max_size
                new_width = int((width / height) * max_size)
                
            logger.info(f"Resizing image from {width}x{height} to {new_width}x{new_height}")
            # Use Resampling.LANCZOS or Image.LANCZOS depending on Pillow version
            return image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    except Exception as e:
        logger.warning(f"Could not resize image, returning original. Error: {e}")
        
    return image


def pil_image_to_bytes(image: Image.Image, format: str = "JPEG") -> bytes:
    """
    Converts a PIL Image object back into raw bytes.
    Useful if you need to pass raw bytes downstream or save it cache-side.
    """
    img_byte_arr = io.BytesIO()
    # If image is RGBA (like PNG with transparency) and converting to JPEG, convert to RGB first
    if format.upper() == "JPEG" and image.mode in ("RGBA", "P"):
        image = image.convert("RGB")
        
    image.save(img_byte_arr, format=format)
    return img_byte_arr.getvalue()