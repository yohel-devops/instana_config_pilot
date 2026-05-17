import { useState } from 'react';
import { Upload } from 'lucide-react';
import type { ParsedConfiguration } from '../types/instana';

interface TemplateSectionProps {
  onFileUpload: (file: File) => void;
  onUseDefault: () => void;
  config: ParsedConfiguration | null;
  tags: Record<string, string>;
  onTagsChange: (tags: Record<string, string>) => void;
  additionalTags: Array<{ key: string; value: string }>;
  onAdditionalTagsChange: (tags: Array<{ key: string; value: string }>) => void;
}

export default function TemplateSection({
  onFileUpload,
  onUseDefault,
  config,
  tags,
  onTagsChange,
  additionalTags,
  onAdditionalTagsChange,
}: TemplateSectionProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleAddTag = () => {
    onAdditionalTagsChange([...additionalTags, { key: '', value: '' }]);
  };

  const handleRemoveTag = (index: number) => {
    onAdditionalTagsChange(additionalTags.filter((_, i) => i !== index));
  };

  const handleTagChange = (index: number, field: 'key' | 'value', value: string) => {
    const newTags = [...additionalTags];
    newTags[index][field] = value;
    onAdditionalTagsChange(newTags);
  };

  return (
    <div className="space-y-6">
      {/* START HERE Section */}
      <div className="bg-dark-card rounded-lg border border-dark-border p-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
          START HERE
        </h2>
        <h3 className="text-lg font-bold text-white mb-2">Template & Tags</h3>

        {/* Step 1: Choose YAML source */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              1
            </div>
            <h4 className="font-semibold text-white">Choose the YAML source</h4>
          </div>
          <p className="text-sm text-gray-400 mb-3 ml-8">
            This is the Instana base file used to discover available sensor blocks.
          </p>

          <div className="flex gap-2 ml-8">
            <button
              onClick={onUseDefault}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              Default
            </button>
            <label className="flex-1">
              <input
                type="file"
                accept=".yaml,.yml"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="px-4 py-2 bg-dark-hover hover:bg-dark-border text-white rounded-lg font-medium transition-colors cursor-pointer text-center">
                Upload
              </div>
            </label>
          </div>

          {/* Drag and drop area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`mt-3 ml-8 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/10'
                : 'border-dark-border hover:border-dark-hover'
            }`}
          >
            <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-400">
              Drag and drop YAML file here
            </p>
          </div>
        </div>

        {/* Current Source */}
        {config && (
          <div className="mb-6 ml-8">
            <div className="bg-dark-hover rounded-lg p-3 border border-dark-border">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                CURRENT SOURCE
              </div>
              <div className="font-semibold text-white">{config.source_file || 'Default Instana template v2026.05'}</div>
              <div className="text-sm text-gray-400 mt-1">
                Default · {config.total_sensors} sensor blocks found
              </div>
            </div>

            {/* Version and Environment selectors */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <select className="bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option>v2026.05</option>
                <option>v2025.12</option>
                <option>v2025.09</option>
              </select>
              <select className="bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option>PROD</option>
                <option>DEV</option>
                <option>QA</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Define agent tags */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              2
            </div>
            <h4 className="font-semibold text-white">Define agent tags</h4>
          </div>
          <p className="text-sm text-gray-400 mb-3 ml-8">
            These tags are written to the host section. Add more tags if your company needs them.
          </p>

          <div className="space-y-2 ml-8">
            {/* Required tags */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="client"
                value={tags.client}
                onChange={(e) => onTagsChange({ ...tags, client: e.target.value })}
                className="bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="environment"
                value={tags.environment}
                onChange={(e) => onTagsChange({ ...tags, environment: e.target.value })}
                className="bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="zone"
                value={tags.zone}
                onChange={(e) => onTagsChange({ ...tags, zone: e.target.value })}
                className="bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="owner"
                value={tags.owner}
                onChange={(e) => onTagsChange({ ...tags, owner: e.target.value })}
                className="bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Additional tags */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold text-white">Additional tags</h5>
                <button
                  onClick={handleAddTag}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  Add tag
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-2">Optional key/value tags</p>

              {additionalTags.length === 0 ? (
                <div className="text-sm text-gray-500 italic">No additional tags yet.</div>
              ) : (
                <div className="space-y-2">
                  {additionalTags.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="key"
                        value={tag.key}
                        onChange={(e) => handleTagChange(index, 'key', e.target.value)}
                        className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="text"
                        placeholder="value"
                        value={tag.value}
                        onChange={(e) => handleTagChange(index, 'value', e.target.value)}
                        className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        onClick={() => handleRemoveTag(index)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Select and configure sensors */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              3
            </div>
            <h4 className="font-semibold text-white">Select and configure sensors</h4>
          </div>
          <p className="text-sm text-gray-400 ml-8">
            Use the center panel. Search, enable and configure only the sensor blocks you need.
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob