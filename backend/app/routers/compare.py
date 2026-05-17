"""Compare router for comparing configuration files"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.comparison import ComparisonResult
from app.services.comparator import YAMLComparator

router = APIRouter(prefix="/api/compare", tags=["compare"])


@router.post("/", response_model=ComparisonResult)
async def compare_yaml_files(
    original: UploadFile = File(..., description="Original configuration file"),
    modified: UploadFile = File(..., description="Modified configuration file")
):
    """
    Compare two configuration.yaml files
    
    Args:
        original: Original YAML file
        modified: Modified YAML file
        
    Returns:
        Detailed comparison with added, removed, and modified sensors
        
    Raises:
        HTTPException: If files are invalid or comparison fails
    """
    # Validate file types
    if not original.filename or not original.filename.endswith(('.yaml', '.yml')):
        raise HTTPException(
            status_code=400,
            detail="Original file must be a YAML file (.yaml, .yml)"
        )
    
    if not modified.filename or not modified.filename.endswith(('.yaml', '.yml')):
        raise HTTPException(
            status_code=400,
            detail="Modified file must be a YAML file (.yaml, .yml)"
        )
    
    # Read file contents
    try:
        original_content = (await original.read()).decode('utf-8')
        modified_content = (await modified.read()).decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Files must be UTF-8 encoded"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read files: {str(e)}"
        )
    
    # Compare files
    try:
        comparator = YAMLComparator()
        result = comparator.compare(original_content, modified_content)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid YAML: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compare files: {str(e)}"
        )

# Made with Bob
