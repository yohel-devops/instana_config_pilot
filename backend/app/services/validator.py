"""Sensor configuration validator"""
from typing import List, Dict, Any
from app.models.sensor import Sensor
from app.models.validation import ValidationResult, ValidationIssue, ValidationLevel


class SensorValidator:
    """Validate sensor configurations"""

    VALIDATION_RULES = {
        'poll_rate': {
            'type': int,
            'min': 1,
            'max': 3600,
            'message': 'poll_rate must be between 1 and 3600 seconds'
        },
        'enabled': {
            'type': bool,
            'message': 'enabled must be a boolean value'
        },
        'port': {
            'type': int,
            'min': 1,
            'max': 65535,
            'message': 'port must be between 1 and 65535'
        },
        'httpPort': {
            'type': int,
            'min': 1,
            'max': 65535,
            'message': 'httpPort must be between 1 and 65535'
        },
        'restApiPort': {
            'type': int,
            'min': 1,
            'max': 65535,
            'message': 'restApiPort must be between 1 and 65535'
        }
    }

    def validate_sensor(self, sensor: Sensor) -> ValidationResult:
        """
        Validate a sensor configuration

        Args:
            sensor: Sensor to validate

        Returns:
            ValidationResult with any issues found
        """
        issues = []

        # Validate common fields
        issues.extend(self._validate_common_fields(sensor))

        # Validate specific fields based on rules
        issues.extend(self._validate_config_fields(sensor.config))

        # Check for required credentials
        if sensor.requires_credentials:
            issues.extend(self._validate_credentials(sensor))

        # Check for best practices
        issues.extend(self._check_best_practices(sensor))

        return ValidationResult(
            is_valid=not any(i.level == ValidationLevel.ERROR for i in issues),
            issues=issues,
            sensor_id=sensor.id
        )

    def _validate_common_fields(self, sensor: Sensor) -> List[ValidationIssue]:
        """Validate common sensor fields"""
        issues = []

        if sensor.enabled and not sensor.config:
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                field='config',
                message='Sensor is enabled but has no configuration',
                suggestion='Add configuration or disable the sensor'
            ))

        return issues

    def _validate_config_fields(self, config: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate configuration fields against rules"""
        issues = []

        def validate_dict(d: Dict[str, Any], prefix: str = ""):
            for field, value in d.items():
                current_field = f"{prefix}.{field}" if prefix else field

                if field in self.VALIDATION_RULES:
                    rule = self.VALIDATION_RULES[field]

                    # Type validation
                    if not isinstance(value, rule['type']):
                        issues.append(ValidationIssue(
                            level=ValidationLevel.ERROR,
                            field=current_field,
                            message=rule['message'],
                            suggestion=f"Value should be of type {rule['type'].__name__}"
                        ))
                        continue

                    # Range validation for integers
                    if rule['type'] == int and 'min' in rule and 'max' in rule:
                        if not (rule['min'] <= value <= rule['max']):
                            issues.append(ValidationIssue(
                                level=ValidationLevel.ERROR,
                                field=current_field,
                                message=rule['message'],
                                suggestion=f"Set {field} to a value between {rule['min']} and {rule['max']}"
                            ))

                # Recursively validate nested dicts
                elif isinstance(value, dict):
                    validate_dict(value, current_field)

        validate_dict(config)
        return issues

    def _validate_credentials(self, sensor: Sensor) -> List[ValidationIssue]:
        """Validate credential configuration"""
        issues = []

        config = sensor.config

        # Check if using Vault
        def has_vault_config(d: Dict) -> bool:
            for value in d.values():
                if isinstance(value, dict):
                    if 'configuration_from' in value:
                        return True
                    if has_vault_config(value):
                        return True
            return False

        has_vault = has_vault_config(config)

        if not has_vault and sensor.env_variables:
            issues.append(ValidationIssue(
                level=ValidationLevel.INFO,
                field='credentials',
                message='Credentials should be externalized',
                suggestion='Consider using Vault or environment variables for sensitive data'
            ))

        # Check for hardcoded passwords
        def check_hardcoded(d: Dict, path: str = ""):
            for key, value in d.items():
                current_path = f"{path}.{key}" if path else key
                if isinstance(value, str) and any(field in key.lower() for field in ['password', 'secret', 'token']):
                    if value and value != '':
                        issues.append(ValidationIssue(
                            level=ValidationLevel.WARNING,
                            field=current_path,
                            message='Hardcoded credential detected',
                            suggestion='Use environment variables or Vault for credentials'
                        ))
                elif isinstance(value, dict):
                    check_hardcoded(value, current_path)

        check_hardcoded(config)

        return issues

    def _check_best_practices(self, sensor: Sensor) -> List[ValidationIssue]:
        """Check for best practices"""
        issues = []

        # Check poll_rate
        if 'poll_rate' in sensor.config:
            poll_rate = sensor.config['poll_rate']
            if isinstance(poll_rate, int):
                if poll_rate < 5:
                    issues.append(ValidationIssue(
                        level=ValidationLevel.WARNING,
                        field='poll_rate',
                        message='Very low poll_rate may impact performance',
                        suggestion='Consider using poll_rate >= 5 seconds'
                    ))
                elif poll_rate > 300:
                    issues.append(ValidationIssue(
                        level=ValidationLevel.INFO,
                        field='poll_rate',
                        message='High poll_rate may delay metric collection',
                        suggestion='Consider using a lower poll_rate for more frequent updates'
                    ))

        # Check tags
        if sensor.enabled and 'tags' not in sensor.config:
            issues.append(ValidationIssue(
                level=ValidationLevel.INFO,
                field='tags',
                message='No tags configured',
                suggestion='Add tags for better organization and filtering'
            ))

        return issues

# Made with Bob
