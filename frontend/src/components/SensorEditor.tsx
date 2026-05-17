import { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { Sensor } from '../types/instana';

interface SensorEditorProps {
  sensor: Sensor;
  onUpdate: (sensor: Sensor) => void;
  onCancel: () => void;
}

export default function SensorEditor({ sensor, onUpdate, onCancel }: SensorEditorProps) {
  const [enabled, setEnabled] = useState(sensor.enabled);
  const [config, setConfig] = useState(JSON.stringify(sensor.config, null, 2));

  const handleSave = () => {
    try {
      const parsedConfig = JSON.parse(config);
      onUpdate({
        ...sensor,
        enabled,
        config: parsedConfig
      });
    } catch (error) {
      alert('Invalid JSON configuration');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{sensor.display_name}</h2>
          <p className="text-sm text-gray-500 mt-1">{sensor.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="font-medium">Enabled</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Configuration (JSON)
          </label>
          <textarea
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            className="w-full h-96 px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
          />
        </div>

        {sensor.description && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">{sensor.description}</p>
          </div>
        )}

        {sensor.env_variables.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">Environment Variables Required</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              {sensor.env_variables.map(v => (
                <li key={v} className="font-mono">{v}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
