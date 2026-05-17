from fastapi import APIRouter, HTTPException
from pathlib import Path
from app.services.parser import YAMLParser
from app.models.sensor import ParsedConfiguration

router = APIRouter(prefix="/api/default-config", tags=["default-config"])

@router.get("/", response_model=ParsedConfiguration)
async def get_default_configuration():
    """
    Load and parse the default Instana configuration.yaml file
    """
    try:
        # Path to the default configuration file
        config_path = Path(__file__).parent.parent.parent.parent / "instana_docs" / "configuration.yaml"
        
        if not config_path.exists():
            raise HTTPException(status_code=404, detail="Default configuration file not found")
        
        # Read the YAML file
        with open(config_path, 'r', encoding='utf-8') as f:
            yaml_content = f.read()
        
        # Parse the configuration
        parser = YAMLParser()
        parsed_config = parser.parse(yaml_content)
        
        return parsed_config
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load default configuration: {str(e)}")

# Made with Bob