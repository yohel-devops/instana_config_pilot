import { Download, FileText, File } from 'lucide-react';
import { generateYaml, generateEnv, generateBundle, downloadBlob } from '../services/api';
import type { Sensor } from '../types/instana';

interface GenerateViewProps {
  sensors: Sensor[];
}

export default function GenerateView({ sensors }: GenerateViewProps) {
  const handleGenerateYaml = async () => {
    try {
      const blob = await generateYaml(sensors);
      downloadBlob(blob, 'configuration.yaml');
    } catch (error) {
      alert('Failed to generate YAML: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleGenerateEnv = async () => {
    try {
      const blob = await generateEnv(sensors);
      downloadBlob(blob, '.env.example');
    } catch (error) {
      alert('Failed to generate .env: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleGenerateBundle = async () => {
    try {
      const blob = await generateBundle(sensors);
      downloadBlob(blob, 'instana-config.zip');
    } catch (error) {
      alert('Failed to generate bundle: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const enabledSensors = sensors.filter(s => s.enabled);
  const sensorsWithEnv = sensors.filter(s => s.enabled && s.env_variables.length > 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Download className="w-6 h-6" />
          Generate Configuration Files
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{sensors.length}</div>
            <div className="text-sm text-blue-700">Total Sensors</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{enabledSensors.length}</div>
            <div className="text-sm text-green-700">Enabled</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{sensorsWithEnv.length}</div>
            <div className="text-sm text-yellow-700">Need Env Vars</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGenerateYaml}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Download configuration.yaml
          </button>

          <button
            onClick={handleGenerateEnv}
            disabled={sensorsWithEnv.length === 0}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <File className="w-5 h-5" />
            Download .env.example
          </button>

          <button
            onClick={handleGenerateBundle}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Complete Bundle (ZIP)
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">What's Included</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>configuration.yaml</strong> - Complete Instana agent configuration</li>
          <li>• <strong>.env.example</strong> - Environment variables template for credentials</li>
          <li>• <strong>Bundle (ZIP)</strong> - Both files plus README with instructions</li>
        </ul>
      </div>
    </div>
  );
}

// Made with Bob
