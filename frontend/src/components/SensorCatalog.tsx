import { useState } from 'react';
import { Search, X, Check, AlertCircle } from 'lucide-react';
import type { Sensor } from '../types/instana';

interface SensorCatalogProps {
  sensors: Sensor[];
  selectedSensors: Sensor[];
  onSensorToggle: (sensor: Sensor) => void;
  onSensorUpdate: (sensor: Sensor) => void;
  onSensorRemove: (sensorId: string) => void;
}

export default function SensorCatalog({
  sensors,
  selectedSensors,
  onSensorToggle,
  onSensorUpdate,
  onSensorRemove,
}: SensorCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, any>>({});

  const categories = ['All categories', ...Array.from(new Set(sensors.map((s: Sensor) => s.category)))];

  const filteredSensors = sensors.filter((sensor: Sensor) => {
    const matchesSearch = sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sensor.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All categories' || sensor.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const isSelected = (sensorId: string) => selectedSensors.some((s: Sensor) => s.id === sensorId);

  const getSensorStatus = (sensor: Sensor) => {
    const selected = selectedSensors.find((s: Sensor) => s.id === sensor.id);
    if (!selected) return null;
    
    const hasErrors = selected.validation_results?.some((v) => v.level === 'ERROR');
    const missingFields = selected.credentials?.filter((c) => c.required && !c.value).length || 0;
    
    if (hasErrors || missingFields > 0) {
      return { status: 'Missing', count: missingFields, color: 'text-yellow-400', icon: AlertCircle };
    }
    return { status: 'Ready', count: 0, color: 'text-green-400', icon: Check };
  };

  const handleEditSensor = (sensor: Sensor) => {
    setEditingSensor(sensor);
    // Initialize form with current configuration
    const initialConfig: Record<string, any> = {
      enabled: sensor.enabled ?? true,
      ...sensor.configuration,
    };
    
    // Add credential values
    sensor.credentials?.forEach((cred) => {
      initialConfig[cred.field] = cred.value || '';
    });
    
    setConfigForm(initialConfig);
  };

  const handleSaveConfiguration = () => {
    if (!editingSensor) return;

    const updatedSensor: Sensor = {
      ...editingSensor,
      enabled: configForm.enabled ?? true,
      configuration: { ...configForm },
      credentials: editingSensor.credentials?.map((cred) => ({
        ...cred,
        value: configForm[cred.field] || cred.value,
      })),
    };

    onSensorUpdate(updatedSensor);
    setEditingSensor(null);
    setConfigForm({});
  };

  const renderConfigField = (field: string) => {
    const label = field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    
    // Special handling for common fields
    if (field === 'enabled') {
      return (
        <div key={field} className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          <input
            type="checkbox"
            checked={configForm[field] ?? true}
            onChange={(e) => setConfigForm({ ...configForm, [field]: e.target.checked })}
            className="w-4 h-4 text-primary bg-dark-hover border-dark-border rounded focus:ring-primary focus:ring-2"
          />
        </div>
      );
    }

    if (field === 'poll_rate' || field === 'pollRate') {
      return (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
          <select
            value={configForm[field] || '60'}
            onChange={(e) => setConfigForm({ ...configForm, [field]: e.target.value })}
            className="w-full bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="10">10 seconds</option>
            <option value="30">30 seconds</option>
            <option value="60">60 seconds</option>
            <option value="120">2 minutes</option>
            <option value="300">5 minutes</option>
          </select>
        </div>
      );
    }

    if (field.toLowerCase().includes('tls') || field.toLowerCase().includes('ssl')) {
      return (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
          <select
            value={configForm[field] || 'false'}
            onChange={(e) => setConfigForm({ ...configForm, [field]: e.target.value })}
            className="w-full bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="false">Disabled</option>
            <option value="true">Enabled</option>
          </select>
        </div>
      );
    }

    if (field.toLowerCase().includes('port')) {
      return (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
          <input
            type="number"
            value={configForm[field] || ''}
            onChange={(e) => setConfigForm({ ...configForm, [field]: e.target.value })}
            placeholder="e.g., 3306, 5432, 27017"
            className="w-full bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      );
    }

    // Default text input
    return (
      <div key={field}>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
          type="text"
          value={configForm[field] || ''}
          onChange={(e) => setConfigForm({ ...configForm, [field]: e.target.value })}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column: Available Sensors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Available sensors from template</h4>
          </div>
          <p className="text-sm text-gray-400">
            Searchable list for large YAML sources. Policies.
          </p>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sensor or YAML key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((cat: string) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sensor List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {filteredSensors.map((sensor: Sensor) => {
              const selected = isSelected(sensor.id);
              const envCount = sensor.credentials?.length || 0;
              
              return (
                <div
                  key={sensor.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    selected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-dark-hover border-dark-border hover:border-dark-hover'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-semibold text-white truncate">{sensor.name}</h5>
                      {selected && (
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full flex-shrink-0">
                          On
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{sensor.key}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{sensor.category}</span>
                      {envCount > 0 && (
                        <span className="text-xs text-gray-500">{envCount} env</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onSensorToggle(sensor)}
                    className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors flex-shrink-0 ml-2 ${
                      selected
                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                        : 'bg-dark-border text-white hover:bg-dark-hover'
                    }`}
                  >
                    {selected ? 'On' : 'Add'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Enabled Sensors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Enabled sensors in generated YAML</h4>
            {selectedSensors.length > 0 && (
              <button
                onClick={() => selectedSensors.forEach((s: Sensor) => onSensorRemove(s.id))}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Clear all
              </button>
            )}
          </div>
          <p className="text-sm text-gray-400">
            Blocks that will be written to configuration.yaml
          </p>

          {selectedSensors.length === 0 ? (
            <div className="bg-dark-hover rounded-lg p-8 text-center border border-dark-border mt-3">
              <p className="text-gray-400">No sensors selected</p>
              <p className="text-sm text-gray-500 mt-1">
                Pick a sensor from the left catalog. The YAML output will update immediately.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {selectedSensors.map((sensor: Sensor) => {
                const status = getSensorStatus(sensor);
                const StatusIcon = status?.icon;
                
                return (
                  <div
                    key={sensor.id}
                    className="flex items-center justify-between p-3 bg-dark-hover rounded-lg border border-dark-border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-white truncate">{sensor.name}</h5>
                        {status && StatusIcon && (
                          <div className={`flex items-center gap-1 ${status.color} flex-shrink-0`}>
                            <StatusIcon className="w-3 h-3" />
                            <span className="text-xs font-medium">
                              {status.status} {status.count > 0 && `(${status.count})`}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {sensor.enabled ? 'Written to YAML' : 'Disabled'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <button
                        onClick={() => handleEditSensor(sensor)}
                        className="px-3 py-1.5 bg-dark-border hover:bg-primary/20 hover:text-primary text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onSensorRemove(sensor.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Sensor Configuration Form - Always Visible */}
      <div className="bg-dark-card rounded-lg border border-dark-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Sensor configuration</h3>
            <p className="text-sm text-gray-400">
              {editingSensor
                ? `${editingSensor.key} - fields below are generated from the sensor definition`
                : 'Select a sensor and click Edit to configure it'}
            </p>
          </div>
          {editingSensor && (
            <button
              onClick={() => {
                setEditingSensor(null);
                setConfigForm({});
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
          
        {editingSensor ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Common fields */}
              {renderConfigField('enabled')}
              
              {/* Configuration fields */}
              {editingSensor.configuration && Object.entries(editingSensor.configuration).map(([key]) =>
                renderConfigField(key)
              )}
              
              {/* Credential fields */}
              {editingSensor.credentials?.map((cred) => (
                <div key={cred.field}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {cred.field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    {cred.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input
                    type={cred.field.toLowerCase().includes('password') || cred.field.toLowerCase().includes('token') ? 'password' : 'text'}
                    value={configForm[cred.field] || ''}
                    onChange={(e) => setConfigForm({ ...configForm, [cred.field]: e.target.value })}
                    placeholder={cred.env_var ? `${cred.env_var}` : `Enter ${cred.field}`}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {cred.env_var && (
                    <p className="text-xs text-gray-500 mt-1">Environment variable: {cred.env_var}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingSensor(null);
                  setConfigForm({});
                }}
                className="px-4 py-2 bg-dark-hover hover:bg-dark-border text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfiguration}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Save changes
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No sensor selected for configuration</p>
            <p className="text-sm mt-2">Click "Edit" on an enabled sensor to configure its settings</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob