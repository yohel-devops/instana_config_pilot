import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadFile, storeSensors } from '../services/api';
import type { ParsedConfiguration } from '../types/instana';

interface FileUploaderProps {
  onUploadSuccess: (config: ParsedConfiguration) => void;
}

export default function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await uploadFile(file);
      await storeSensors(result.sensors);
      setSuccess(true);
      setTimeout(() => {
        onUploadSuccess(result);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/yaml': ['.yaml', '.yml']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: uploading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${success ? 'border-green-500 bg-green-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              <p className="text-gray-600 font-medium">Uploading and parsing...</p>
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-lg font-medium text-green-700">File uploaded successfully!</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop your configuration.yaml'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to select file (max 5MB)
                </p>
              </div>
              <FileText className="w-8 h-8 text-gray-300" />
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Supported File</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Instana configuration.yaml file</li>
          <li>• Maximum file size: 5MB</li>
          <li>• UTF-8 encoding required</li>
        </ul>
      </div>
    </div>
  );
}

// Made with Bob
