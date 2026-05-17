"""Upload router for configuration files"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.sensor import ParsedConfiguration
from app.services.parser import YAMLParser

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/", response_model=ParsedConfiguration)
async def upload_yaml_file(file: UploadFile = File(...)):
    """
    Upload and parse a configuration.yaml file
    
    Args:
        file: YAML file to upload
        
    Returns:
        ParsedConfiguration with all sensors and metadata
        
    Raises:
        HTTPException: If file is invalid or parsing fails
    """
    # Validate file type
    if not file.filename or not file.filename.endswith(('.yaml', '.yml')):
        raise HTTPException(
            status_code=400,
            detail="Only YAML files (.yaml, .yml) are allowed"
        )
    
    # Read file content
    try:
        content = await file.read()
        yaml_content = content.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File must be UTF-8 encoded"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read file: {str(e)}"
        )
    
    # Parse YAML
    try:
        parser = YAMLParser()
        result = parser.parse(yaml_content)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid YAML: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse YAML: {str(e)}"
        )


@router.post("/validate")
async def validate_yaml_file(file: UploadFile = File(...)):
    """
    Validate a configuration.yaml file without full parsing
    
    Args:
        file: YAML file to validate
        
    Returns:
        Validation result
    """
    if not file.filename or not file.filename.endswith(('.yaml', '.yml')):
        raise HTTPException(
            status_code=400,
            detail="Only YAML files (.yaml, .yml) are allowed"
        )
    
    try:
        content = await file.read()
        yaml_content = content.decode('utf-8')
        
        parser = YAMLParser()
        result = parser.parse(yaml_content)
        
        return {
            "valid": True,
            "message": "YAML file is valid",
            "sensors_found": result.total_sensors,
            "enabled_sensors": result.enabled_sensors
        }
    except Exception as e:
        return {
            "valid": False,
            "message": str(e),
            "sensors_found": 0,
            "enabled_sensors": 0
        }

# Made with Bob
