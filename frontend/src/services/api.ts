import axios from 'axios';
import type { ParsedConfiguration, Sensor, ComparisonResult } from '../types/instana';

// Use relative URL in production (Docker), absolute URL in development
const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? 'http://localhost:8000' : ''
);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDefaultConfig = async (): Promise<ParsedConfiguration> => {
  const response = await api.get<ParsedConfiguration>('/api/default-config/');
  return response.data;
};

export const uploadFile = async (file: File): Promise<ParsedConfiguration> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<ParsedConfiguration>('/api/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const validateYaml = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/upload/validate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const storeSensors = async (sensors: Sensor[]): Promise<void> => {
  await api.post('/api/sensors/store', sensors);
};

export const getSensors = async (): Promise<Sensor[]> => {
  const response = await api.get<Sensor[]>('/api/sensors/');
  return response.data;
};

export const getSensor = async (sensorId: string): Promise<Sensor> => {
  const response = await api.get<Sensor>(`/api/sensors/${sensorId}`);
  return response.data;
};

export const updateSensor = async (sensorId: string, update: Partial<Sensor>): Promise<Sensor> => {
  const response = await api.put<Sensor>(`/api/sensors/${sensorId}`, update);
  return response.data;
};

export const validateSensor = async (sensorId: string): Promise<any> => {
  const response = await api.post(`/api/sensors/validate/${sensorId}`);
  return response.data;
};

export const getSensorsByCategory = async (category: string): Promise<Sensor[]> => {
  const response = await api.get<Sensor[]>(`/api/sensors/category/${category}`);
  return response.data;
};

export const searchSensors = async (query: string): Promise<Sensor[]> => {
  const response = await api.get<Sensor[]>(`/api/sensors/search/${query}`);
  return response.data;
};

export const compareYaml = async (original: File, modified: File): Promise<ComparisonResult> => {
  const formData = new FormData();
  formData.append('original', original);
  formData.append('modified', modified);
  const response = await api.post<ComparisonResult>('/api/compare/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const generateYaml = async (sensors: Sensor[]): Promise<Blob> => {
  const response = await api.post('/api/generate/yaml', sensors, {
    responseType: 'blob',
  });
  return response.data;
};

export const generateYamlMinimal = async (sensors: Sensor[]): Promise<Blob> => {
  const response = await api.post('/api/generate/yaml/minimal', sensors, {
    responseType: 'blob',
  });
  return response.data;
};

export const generateYamlWithEnv = async (sensors: Sensor[]): Promise<Blob> => {
  const response = await api.post('/api/generate/yaml/with-env', sensors, {
    responseType: 'blob',
  });
  return response.data;
};

export const generateEnv = async (sensors: Sensor[]): Promise<Blob> => {
  const response = await api.post('/api/generate/env', sensors, {
    responseType: 'blob',
  });
  return response.data;
};

export const generateBundle = async (sensors: Sensor[]): Promise<Blob> => {
  const response = await api.post('/api/generate/bundle', sensors, {
    responseType: 'blob',
  });
  return response.data;
};

export const previewYaml = async (sensors: Sensor[]): Promise<any> => {
  const response = await api.post('/api/generate/preview/yaml', sensors);
  return response.data;
};

export const previewEnv = async (sensors: Sensor[]): Promise<any> => {
  const response = await api.post('/api/generate/preview/env', sensors);
  return response.data;
};

// Helper function to download blob
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Default export
const apiService = {
  getDefaultConfig,
  uploadFile,
  validateYaml,
  storeSensors,
  getSensors,
  getSensor,
  updateSensor,
  validateSensor,
  getSensorsByCategory,
  searchSensors,
  compareYaml,
  generateYaml,
  generateYamlMinimal,
  generateYamlWithEnv,
  generateEnv,
  generateBundle,
  previewYaml,
  previewEnv,
  downloadBlob,
};

export default apiService;

// Made with Bob
