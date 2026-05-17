# Instana Config Pilot 🚀

Una herramienta web para facilitar la creación, comparación y validación de archivos de configuración YAML de IBM Instana.

## 📋 Descripción

Instana Config Pilot resuelve los problemas comunes al gestionar archivos `configuration.yaml` de IBM Instana:

- ❌ **Errores de sintaxis** y problemas de identación
- ❌ **Campos incompletos** o configuraciones inconsistentes
- ❌ **Credenciales hardcodeadas** en archivos de configuración
- ❌ **Cambios difíciles de revisar** antes de aplicar a producción

### ✨ Características

- 📤 **Carga y análisis** de archivos configuration.yaml existentes
- 🔍 **Detección automática** de 184+ sensores de Instana
- ✏️ **Editor visual** para configurar sensores sin editar YAML manualmente
- 🔄 **Comparación de archivos** con diff visual y estadísticas
- 🔐 **Generación automática** de archivos .env para credenciales
- ✅ **Validación en tiempo real** con sugerencias de mejores prácticas
- 📦 **Descarga de bundle** completo (YAML + .env + documentación)

## 🏗️ Arquitectura

```
instana_config_pilot/
├── frontend/          # React + TypeScript + Vite + Tailwind CSS
├── backend/           # FastAPI + Python
├── instana_docs/      # Documentación de IBM Instana
├── docker-compose.yml # Orquestación de contenedores
└── README.md
```

### Stack Tecnológico

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Dropzone
- Lucide React (iconos)

**Backend:**
- Python 3.11+
- FastAPI
- Pydantic
- PyYAML
- difflib

**Deployment:**
- Docker
- Docker Compose
- Nginx

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker 20.10+
- Docker Compose 2.0+

### Instalación con Docker (Recomendado)

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd instana_config_pilot
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env según sea necesario
```

3. **Construir y ejecutar los contenedores:**
```bash
docker-compose up --build
```

4. **Acceder a la aplicación:**
- Frontend: http://localhost:80
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Instalación Manual (Desarrollo)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📖 Uso

### 1. Cargar Archivo de Configuración

- Arrastra y suelta un archivo `configuration.yaml` o haz clic para seleccionarlo
- El sistema analizará automáticamente todos los sensores configurados

### 2. Editar Configuración

- Navega por la lista de sensores detectados
- Usa el editor JSON para modificar configuraciones
- Las validaciones se ejecutan en tiempo real

### 3. Comparar Archivos

- Carga dos archivos configuration.yaml
- Visualiza diferencias con código de colores
- Revisa estadísticas de cambios (añadidos, eliminados, modificados)

### 4. Generar Archivos

- Descarga el nuevo `configuration.yaml`
- Obtén el archivo `.env.example` con variables de entorno
- Descarga un bundle ZIP con todo incluido

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Backend
ENVIRONMENT=development
LOG_LEVEL=info
BACKEND_PORT=8000

# Frontend
VITE_API_URL=http://localhost:8000

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:80

# File Upload
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=.yaml,.yml
```

## 📚 API Documentation

La documentación interactiva de la API está disponible en:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Endpoints Principales

#### Upload & Parse
- `POST /api/upload/` - Cargar y analizar archivo YAML

#### Sensors
- `GET /api/sensors/` - Listar todos los sensores
- `GET /api/sensors/{sensor_id}` - Obtener sensor específico
- `PUT /api/sensors/{sensor_id}` - Actualizar sensor
- `DELETE /api/sensors/{sensor_id}` - Eliminar sensor

#### Compare
- `POST /api/compare/` - Comparar dos archivos YAML

#### Generate
- `POST /api/generate/yaml` - Generar configuration.yaml
- `POST /api/generate/env` - Generar .env.example
- `POST /api/generate/bundle` - Generar bundle ZIP

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Producción con Docker

```bash
# Construir imágenes
docker-compose build

# Ejecutar en modo detached
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Health Checks

- Backend: http://localhost:8000/health
- Frontend: http://localhost:80

## 🔐 Seguridad

- Las credenciales nunca se almacenan en el servidor
- Los archivos temporales se eliminan automáticamente
- Soporte para variables de entorno y HashiCorp Vault
- Validación de archivos antes de procesamiento

## 📝 Documentación Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Plan de implementación
- [TECHNICAL_SPECS.md](./TECHNICAL_SPECS.md) - Especificaciones técnicas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Yohel** - *Desarrollo inicial*

## 🙏 Agradecimientos

- IBM Instana por la documentación
- Comunidad de FastAPI y React
- Todos los contribuidores del proyecto

## 📞 Soporte

Para reportar bugs o solicitar features, por favor abre un issue en GitHub.

---

**Nota:** Este proyecto está en desarrollo activo. Las características y la API pueden cambiar.