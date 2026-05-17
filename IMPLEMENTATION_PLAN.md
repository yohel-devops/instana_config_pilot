# Plan de Implementación - Instana Config Pilot

## 📋 Resumen Ejecutivo

Este documento detalla el plan de implementación paso a paso para el proyecto **Instana Config Pilot**. Cada fase incluye tareas específicas, dependencias y criterios de aceptación.

---

## 🎯 Fase 1: Configuración Inicial del Proyecto

### 1.1 Estructura de Carpetas

**Objetivo**: Crear la estructura base del proyecto con carpetas separadas para frontend y backend.

**Tareas**:
- [ ] Crear carpeta `/frontend` con estructura React + Vite
- [ ] Crear carpeta `/backend` con estructura FastAPI
- [ ] Configurar `.gitignore` para ambos proyectos
- [ ] Crear archivos de configuración base

**Entregables**:
```
instana_config_pilot/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── .gitignore
└── README.md
```

**Tiempo estimado**: 1 hora

---

## 🔧 Fase 2: Backend - API con FastAPI

### 2.1 Configuración Base del Backend

**Objetivo**: Configurar FastAPI con estructura modular y dependencias necesarias.

**Tareas**:
- [ ] Crear `requirements.txt` con todas las dependencias
- [ ] Configurar `main.py` con FastAPI app
- [ ] Configurar CORS para desarrollo
- [ ] Crear estructura de carpetas (models, services, routers, utils)
- [ ] Configurar variables de entorno

**Dependencias**:
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pyyaml==6.0.1
python-multipart==0.0.6
aiofiles==23.2.1
```

**Tiempo estimado**: 2 horas

### 2.2 Modelos Pydantic

**Objetivo**: Definir modelos de datos para sensores y configuraciones.

**Tareas**:
- [ ] Crear `models/sensor.py` con modelo base de sensor
- [ ] Crear `models/config.py` con modelo de configuración completa
- [ ] Definir tipos para campos comunes (enabled, poll_rate, etc.)
- [ ] Crear modelos para respuestas API

**Archivos a crear**:
- `backend/app/models/sensor.py`
- `backend/app/models/config.py`
- `backend/app/models/responses.py`

**Tiempo estimado**: 3 horas

### 2.3 Parser YAML

**Objetivo**: Implementar parser para leer y analizar archivos configuration.yaml.

**Tareas**:
- [ ] Crear `services/parser.py`
- [ ] Implementar función para parsear YAML completo
- [ ] Extraer sensores individuales con sus configuraciones
- [ ] Identificar categorías de sensores
- [ ] Manejar comentarios y documentación inline
- [ ] Detectar sensores habilitados vs deshabilitados

**Funciones principales**:
```python
def parse_yaml_file(file_content: str) -> Dict
def extract_sensors(yaml_data: Dict) -> List[Sensor]
def categorize_sensors(sensors: List[Sensor]) -> Dict[str, List[Sensor]]
def extract_comments(yaml_content: str) -> Dict[str, str]
```

**Tiempo estimado**: 4 horas

### 2.4 Validador de Configuración

**Objetivo**: Validar estructura y valores de configuraciones de sensores.

**Tareas**:
- [ ] Crear `services/validator.py`
- [ ] Definir schema de validación para campos comunes
- [ ] Implementar validación de tipos de datos
- [ ] Validar rangos de valores (ej: poll_rate 1-3600)
- [ ] Detectar campos requeridos faltantes
- [ ] Generar mensajes de error descriptivos

**Funciones principales**:
```python
def validate_sensor_config(sensor: Sensor) -> ValidationResult
def validate_field_type(field: str, value: Any, expected_type: Type) -> bool
def validate_field_range(field: str, value: int, min_val: int, max_val: int) -> bool
def get_validation_errors(sensor: Sensor) -> List[ValidationError]
```

**Tiempo estimado**: 4 horas

### 2.5 Comparador de Archivos

**Objetivo**: Comparar dos archivos YAML y generar diff estructurado.

**Tareas**:
- [ ] Crear `services/comparator.py`
- [ ] Implementar comparación línea por línea
- [ ] Identificar sensores añadidos, eliminados y modificados
- [ ] Generar diff en formato JSON para frontend
- [ ] Calcular estadísticas de cambios

**Funciones principales**:
```python
def compare_yaml_files(original: str, modified: str) -> ComparisonResult
def find_added_sensors(original: Dict, modified: Dict) -> List[str]
def find_removed_sensors(original: Dict, modified: Dict) -> List[str]
def find_modified_sensors(original: Dict, modified: Dict) -> List[SensorDiff]
def generate_diff_stats(comparison: ComparisonResult) -> DiffStats
```

**Tiempo estimado**: 5 horas

### 2.6 Generador de .env

**Objetivo**: Detectar y generar variables de entorno para credenciales.

**Tareas**:
- [ ] Crear `services/env_generator.py`
- [ ] Definir lista de campos sensibles
- [ ] Detectar campos que requieren variables de entorno
- [ ] Generar nombres de variables siguiendo convención
- [ ] Crear archivo .env con comentarios descriptivos
- [ ] Manejar configuraciones de Vault (no generar .env)

**Funciones principales**:
```python
def detect_sensitive_fields(sensor_config: Dict) -> List[str]
def generate_env_var_name(sensor_name: str, field_name: str) -> str
def generate_env_file(sensors: List[Sensor]) -> str
def is_using_vault(field_config: Any) -> bool
```

**Tiempo estimado**: 3 horas

### 2.7 Generador de YAML

**Objetivo**: Generar archivo configuration.yaml válido desde configuración editada.

**Tareas**:
- [ ] Crear `services/yaml_generator.py`
- [ ] Generar YAML con formato correcto
- [ ] Mantener comentarios originales
- [ ] Aplicar indentación correcta
- [ ] Ordenar sensores por categoría
- [ ] Reemplazar valores sensibles con referencias a .env

**Funciones principales**:
```python
def generate_yaml(sensors: List[Sensor], include_comments: bool = True) -> str
def format_sensor_config(sensor: Sensor) -> str
def apply_env_variables(config: Dict, env_vars: Dict) -> Dict
def preserve_comments(original: str, generated: str) -> str
```

**Tiempo estimado**: 4 horas

### 2.8 Endpoints API

**Objetivo**: Crear endpoints REST para todas las operaciones.

**Tareas**:
- [ ] Crear `routers/upload.py` - Carga de archivos
- [ ] Crear `routers/sensors.py` - CRUD de sensores
- [ ] Crear `routers/compare.py` - Comparación de archivos
- [ ] Crear `routers/generate.py` - Generación de archivos
- [ ] Implementar manejo de errores global
- [ ] Agregar logging

**Endpoints a implementar**:

```python
# Upload
POST /api/upload - Subir y parsear archivo YAML
GET /api/sensors - Listar todos los sensores parseados
GET /api/sensors/{sensor_id} - Obtener sensor específico

# Sensors
PUT /api/sensors/{sensor_id} - Actualizar configuración de sensor
POST /api/sensors/validate - Validar configuración

# Compare
POST /api/compare - Comparar dos archivos YAML
GET /api/compare/{comparison_id} - Obtener resultado de comparación

# Generate
POST /api/generate/yaml - Generar archivo YAML
POST /api/generate/env - Generar archivo .env
POST /api/generate/bundle - Generar ZIP con ambos archivos
```

**Tiempo estimado**: 6 horas

### 2.9 Utilidades Backend

**Objetivo**: Crear utilidades y helpers para el backend.

**Tareas**:
- [ ] Crear `utils/sensor_schema.py` - Schema de sensores conocidos
- [ ] Crear `utils/env_detector.py` - Detector de variables
- [ ] Crear `utils/file_handler.py` - Manejo de archivos
- [ ] Crear `utils/logger.py` - Configuración de logging

**Tiempo estimado**: 2 horas

---

## 🎨 Fase 3: Frontend - React + TypeScript

### 3.1 Configuración Base del Frontend

**Objetivo**: Configurar proyecto React con Vite, TypeScript y Tailwind.

**Tareas**:
- [ ] Inicializar proyecto con Vite + React + TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar React Router
- [ ] Configurar Axios para API calls
- [ ] Crear estructura de carpetas

**Dependencias**:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "react-dropzone": "^14.2.3",
    "react-diff-viewer-continued": "^3.3.1",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

**Tiempo estimado**: 2 horas

### 3.2 Tipos TypeScript

**Objetivo**: Definir tipos e interfaces para toda la aplicación.

**Tareas**:
- [ ] Crear `types/instana.ts` con tipos de sensores
- [ ] Crear `types/api.ts` con tipos de respuestas API
- [ ] Crear `types/ui.ts` con tipos de componentes

**Archivos a crear**:
```typescript
// types/instana.ts
export interface Sensor {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface SensorConfig {
  enabled?: boolean;
  poll_rate?: number;
  [key: string]: any;
}

// types/api.ts
export interface UploadResponse {
  sensors: Sensor[];
  total: number;
  categories: string[];
}

export interface ComparisonResult {
  added: string[];
  removed: string[];
  modified: SensorDiff[];
  stats: DiffStats;
}
```

**Tiempo estimado**: 2 horas

### 3.3 Servicio API

**Objetivo**: Crear cliente Axios para comunicación con backend.

**Tareas**:
- [ ] Crear `services/api.ts` con configuración Axios
- [ ] Implementar funciones para cada endpoint
- [ ] Manejar errores y timeouts
- [ ] Agregar interceptores para logging

**Funciones principales**:
```typescript
export const api = {
  upload: (file: File) => Promise<UploadResponse>,
  getSensors: () => Promise<Sensor[]>,
  getSensor: (id: string) => Promise<Sensor>,
  updateSensor: (id: string, config: SensorConfig) => Promise<Sensor>,
  compare: (original: File, modified: File) => Promise<ComparisonResult>,
  generateYaml: (sensors: Sensor[]) => Promise<Blob>,
  generateEnv: (sensors: Sensor[]) => Promise<Blob>,
  generateBundle: (sensors: Sensor[]) => Promise<Blob>
}
```

**Tiempo estimado**: 3 horas

### 3.4 Componente FileUploader

**Objetivo**: Componente para cargar archivos YAML con drag & drop.

**Tareas**:
- [ ] Crear componente con react-dropzone
- [ ] Validar tipo de archivo (solo .yaml/.yml)
- [ ] Mostrar preview del archivo
- [ ] Manejar errores de carga
- [ ] Mostrar progreso de upload

**Características**:
- Drag & drop
- Click para seleccionar
- Validación de tamaño (max 5MB)
- Preview del contenido
- Indicador de progreso

**Tiempo estimado**: 4 horas

### 3.5 Componente SensorList

**Objetivo**: Lista de sensores con filtrado y búsqueda.

**Tareas**:
- [ ] Crear lista con todos los sensores
- [ ] Implementar filtrado por categoría
- [ ] Implementar búsqueda por nombre
- [ ] Mostrar estado (enabled/disabled)
- [ ] Agregar paginación
- [ ] Agregar ordenamiento

**Características**:
- Filtros por categoría
- Búsqueda en tiempo real
- Indicadores visuales de estado
- Paginación (20 items por página)
- Ordenar por nombre/categoría/estado

**Tiempo estimado**: 5 horas

### 3.6 Componente SensorEditor

**Objetivo**: Editor visual para configuración de sensores.

**Tareas**:
- [ ] Crear formulario dinámico basado en schema
- [ ] Implementar validación en tiempo real
- [ ] Mostrar ayuda contextual
- [ ] Manejar diferentes tipos de campos
- [ ] Guardar cambios automáticamente

**Tipos de campos a soportar**:
- Boolean (enabled)
- Number (poll_rate, port)
- String (host, user, password)
- Array (tags, databases)
- Object (nested configs)

**Tiempo estimado**: 6 horas

### 3.7 Componente DiffViewer

**Objetivo**: Visualizador de diferencias entre archivos.

**Tareas**:
- [ ] Integrar react-diff-viewer-continued
- [ ] Mostrar diff lado a lado
- [ ] Resaltar cambios (añadido/eliminado/modificado)
- [ ] Agregar navegación entre cambios
- [ ] Mostrar estadísticas de cambios

**Características**:
- Vista split (lado a lado)
- Resaltado de sintaxis
- Navegación por cambios
- Estadísticas (líneas añadidas/eliminadas)
- Opción de vista unificada

**Tiempo estimado**: 4 horas

### 3.8 Componente ConfigDownloader

**Objetivo**: Descarga de archivos generados.

**Tareas**:
- [ ] Crear interfaz de descarga
- [ ] Preview de archivos antes de descargar
- [ ] Opción de descargar individual o bundle
- [ ] Mostrar tamaño de archivos
- [ ] Historial de descargas

**Opciones de descarga**:
- configuration.yaml solo
- .env solo
- ZIP con ambos archivos
- Preview antes de descargar

**Tiempo estimado**: 3 horas

### 3.9 Layout y Navegación

**Objetivo**: Crear layout principal y sistema de navegación.

**Tareas**:
- [ ] Crear componente Layout con header/sidebar/content
- [ ] Implementar navegación con React Router
- [ ] Crear breadcrumbs
- [ ] Agregar menú lateral
- [ ] Implementar tema claro/oscuro (opcional)

**Rutas**:
```
/ - Dashboard
/upload - Carga de archivos
/sensors - Lista de sensores
/sensors/:id - Editor de sensor
/compare - Comparador
/generate - Generador
```

**Tiempo estimado**: 4 horas

### 3.10 Estado Global

**Objetivo**: Gestionar estado de la aplicación.

**Tareas**:
- [ ] Configurar Context API o Zustand
- [ ] Crear store para sensores
- [ ] Crear store para UI state
- [ ] Implementar persistencia local (localStorage)

**Estados a gestionar**:
- Sensores cargados
- Sensor actualmente editado
- Archivos para comparar
- Configuración de UI

**Tiempo estimado**: 3 horas

---

## 🐳 Fase 4: Docker y Deployment

### 4.1 Dockerfile Backend

**Objetivo**: Crear imagen Docker para el backend.

**Tareas**:
- [ ] Crear Dockerfile multi-stage
- [ ] Optimizar tamaño de imagen
- [ ] Configurar variables de entorno
- [ ] Agregar healthcheck

**Dockerfile**:
```dockerfile
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY ./app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Tiempo estimado**: 2 horas

### 4.2 Dockerfile Frontend

**Objetivo**: Crear imagen Docker para el frontend.

**Tareas**:
- [ ] Crear Dockerfile multi-stage con build
- [ ] Usar nginx para servir archivos estáticos
- [ ] Configurar nginx.conf
- [ ] Optimizar para producción

**Dockerfile**:
```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Tiempo estimado**: 2 horas

### 4.3 Docker Compose

**Objetivo**: Orquestar frontend y backend con docker-compose.

**Tareas**:
- [ ] Crear docker-compose.yml
- [ ] Configurar networking entre servicios
- [ ] Configurar volúmenes para desarrollo
- [ ] Agregar variables de entorno

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend/app:/app/app
      - ./instana_docs:/app/docs
    environment:
      - CORS_ORIGINS=http://localhost:3000
      - LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:8000
```

**Tiempo estimado**: 2 horas

---

## 📚 Fase 5: Documentación

### 5.1 README Principal

**Objetivo**: Documentar el proyecto completo.

**Tareas**:
- [ ] Descripción del proyecto
- [ ] Características principales
- [ ] Requisitos previos
- [ ] Instrucciones de instalación
- [ ] Guía de uso
- [ ] Troubleshooting
- [ ] Contribución

**Tiempo estimado**: 3 horas

### 5.2 Documentación API

**Objetivo**: Documentar todos los endpoints de la API.

**Tareas**:
- [ ] Configurar Swagger/OpenAPI en FastAPI
- [ ] Documentar cada endpoint
- [ ] Agregar ejemplos de request/response
- [ ] Documentar códigos de error

**Tiempo estimado**: 2 horas

### 5.3 Guía de Usuario

**Objetivo**: Crear guía paso a paso para usuarios finales.

**Tareas**:
- [ ] Crear USER_GUIDE.md
- [ ] Agregar screenshots
- [ ] Documentar casos de uso comunes
- [ ] Agregar FAQs

**Tiempo estimado**: 3 horas

---

## 🧪 Fase 6: Testing

### 6.1 Tests Backend

**Objetivo**: Crear tests unitarios y de integración para backend.

**Tareas**:
- [ ] Configurar pytest
- [ ] Tests para parser YAML
- [ ] Tests para validador
- [ ] Tests para comparador
- [ ] Tests para generadores
- [ ] Tests de endpoints API

**Cobertura objetivo**: >80%

**Tiempo estimado**: 8 horas

### 6.2 Tests Frontend

**Objetivo**: Crear tests para componentes React.

**Tareas**:
- [ ] Configurar Vitest + React Testing Library
- [ ] Tests para componentes principales
- [ ] Tests para servicios API
- [ ] Tests de integración

**Cobertura objetivo**: >70%

**Tiempo estimado**: 6 horas

---

## 📊 Resumen de Tiempos

| Fase | Descripción | Tiempo Estimado |
|------|-------------|-----------------|
| 1 | Configuración Inicial | 1 hora |
| 2 | Backend - FastAPI | 33 horas |
| 3 | Frontend - React | 36 horas |
| 4 | Docker y Deployment | 6 horas |
| 5 | Documentación | 8 horas |
| 6 | Testing | 14 horas |
| **TOTAL** | | **98 horas** |

## 🎯 Hitos del Proyecto

### Hito 1: Backend Funcional (Semana 1-2)
- ✅ Parser YAML completo
- ✅ API REST funcionando
- ✅ Validación básica

### Hito 2: Frontend MVP (Semana 3-4)
- ✅ Carga de archivos
- ✅ Lista de sensores
- ✅ Editor básico

### Hito 3: Funcionalidades Avanzadas (Semana 5)
- ✅ Comparador de archivos
- ✅ Generación de .env
- ✅ Descarga de archivos

### Hito 4: Deployment y Testing (Semana 6)
- ✅ Docker configurado
- ✅ Tests implementados
- ✅ Documentación completa

## 🚀 Próximos Pasos

1. **Revisar y aprobar este plan** con el equipo
2. **Configurar repositorio Git** y estructura de branches
3. **Comenzar con Fase 1**: Configuración inicial
4. **Implementar iterativamente** siguiendo el orden de fases
5. **Realizar demos** al final de cada hito

## 📝 Notas Importantes

- Cada tarea debe incluir tests
- Commits frecuentes con mensajes descriptivos
- Code review antes de merge a main
- Documentar decisiones técnicas importantes
- Mantener CHANGELOG.md actualizado