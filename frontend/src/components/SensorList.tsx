import { useState, useMemo } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import type { Sensor } from '../types/instana';

interface SensorListProps {
  sensors: Sensor[];
  onSensorSelect: (sensor: Sensor) => void;
  selectedSensorId?: string;
}

export default function SensorList({ sensors, onSensorSelect, selectedSensorId }: SensorListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(sensors.map(s => s.category));
    return Array.from(cats);
  }, [sensors]);

  const filteredSensors = useMemo(() => {
    return sensors.filter(sensor => {
      const matchesSearch = sensor.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sensor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || sensor.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sensors, searchTerm, selectedCategory]);

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-[calc(100vh-250px)]">
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sensors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredSensors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No sensors found
          </div>
        ) : (
          <div className="divide-y">
            {filteredSensors.map(sensor => (
              <button
                key={sensor.id}
                onClick={() => onSensorSelect(sensor)}
                className={`w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-center justify-between group ${
                  selectedSensorId === sensor.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{sensor.display_name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      sensor.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {sensor.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{sensor.name}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Showing {filteredSensors.length} of {sensors.length}
          </span>
          <span className="text-gray-600">
            {sensors.filter(s => s.enabled).length} enabled
          </span>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
