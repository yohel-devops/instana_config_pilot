"""YAML file comparator"""
import difflib
from typing import Dict, Any, Set
from app.models.comparison import ComparisonResult, SensorDiff, DiffStats, ChangeType
from app.services.parser import YAMLParser


class YAMLComparator:
    """Compare two Instana configuration YAML files"""

    def __init__(self):
        self.parser = YAMLParser()

    def compare(self, original_content: str, modified_content: str) -> ComparisonResult:
        """
        Compare two YAML configuration files

        Args:
            original_content: Original YAML content
            modified_content: Modified YAML content

        Returns:
            ComparisonResult with detailed differences
        """
        # Parse both files
        original_config = self.parser.parse(original_content)
        modified_config = self.parser.parse(modified_content)

        # Create sensor maps for easy lookup
        original_sensors = {s.name: s for s in original_config.sensors}
        modified_sensors = {s.name: s for s in modified_config.sensors}

        # Find added, removed, and modified sensors
        original_names = set(original_sensors.keys())
        modified_names = set(modified_sensors.keys())

        added = list(modified_names - original_names)
        removed = list(original_names - modified_names)
        common = original_names & modified_names

        # Check for modifications in common sensors
        modified_diffs = []
        for name in common:
            orig_sensor = original_sensors[name]
            mod_sensor = modified_sensors[name]

            if self._sensors_differ(orig_sensor.config, mod_sensor.config):
                diff = self._create_sensor_diff(orig_sensor, mod_sensor)
                modified_diffs.append(diff)

        # Generate unified diff text
        diff_text = self._generate_diff_text(original_content, modified_content)

        # Calculate statistics
        stats = DiffStats(
            total_sensors=len(modified_sensors),
            added=len(added),
            removed=len(removed),
            modified=len(modified_diffs),
            unchanged=len(common) - len(modified_diffs)
        )

        return ComparisonResult(
            added_sensors=sorted(added),
            removed_sensors=sorted(removed),
            modified_sensors=modified_diffs,
            stats=stats,
            diff_text=diff_text
        )

    def _sensors_differ(self, config1: Dict[str, Any], config2: Dict[str, Any]) -> bool:
        """Check if two sensor configurations are different"""
        return config1 != config2

    def _create_sensor_diff(self, original, modified) -> SensorDiff:
        """Create detailed diff for a modified sensor"""
        field_changes = {}

        # Compare all fields
        all_keys = set(original.config.keys()) | set(modified.config.keys())

        for key in all_keys:
            orig_value = original.config.get(key)
            mod_value = modified.config.get(key)

            if orig_value != mod_value:
                field_changes[key] = {
                    'old': orig_value,
                    'new': mod_value
                }

        return SensorDiff(
            sensor_id=original.id,
            sensor_name=original.name,
            change_type=ChangeType.MODIFIED,
            original_config=original.config,
            modified_config=modified.config,
            field_changes=field_changes
        )

    def _generate_diff_text(self, original: str, modified: str) -> str:
        """Generate unified diff text"""
        original_lines = original.splitlines(keepends=True)
        modified_lines = modified.splitlines(keepends=True)

        diff = difflib.unified_diff(
            original_lines,
            modified_lines,
            fromfile='original.yaml',
            tofile='modified.yaml',
            lineterm=''
        )

        return ''.join(diff)

# Made with Bob
