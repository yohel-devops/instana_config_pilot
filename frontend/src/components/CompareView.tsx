import { useState } from 'react';
import { GitCompare } from 'lucide-react';
import { compareYaml } from '../services/api';

export default function CompareView() {
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCompare = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const original = formData.get('original') as File;
    const modified = formData.get('modified') as File;

    if (!original || !modified) return;

    setComparing(true);
    try {
      const comparison = await compareYaml(original, modified);
      setResult(comparison);
    } catch (error) {
      alert('Comparison failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <GitCompare className="w-6 h-6" />
          Compare Configuration Files
        </h2>
        
        <form onSubmit={handleCompare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original File
            </label>
            <input
              type="file"
              name="original"
              accept=".yaml,.yml"
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modified File
            </label>
            <input
              type="file"
              name="modified"
              accept=".yaml,.yml"
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={comparing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {comparing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Comparing...
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" />
                Compare Files
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Comparison Results</h3>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{result.stats.added}</div>
              <div className="text-sm text-green-700">Added</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{result.stats.removed}</div>
              <div className="text-sm text-red-700">Removed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{result.stats.modified}</div>
              <div className="text-sm text-yellow-700">Modified</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{result.stats.unchanged}</div>
              <div className="text-sm text-gray-700">Unchanged</div>
            </div>
          </div>

          {result.added_sensors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-green-700 mb-2">Added Sensors</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {result.added_sensors.map((s: string) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}

          {result.removed_sensors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-red-700 mb-2">Removed Sensors</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {result.removed_sensors.map((s: string) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Made with Bob
