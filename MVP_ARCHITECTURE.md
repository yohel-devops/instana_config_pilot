# Documento de Arquitectura de Software: Instana ConfigPilot (MVP)

## 1. Resumen Ejecutivo
El proyecto ha sido pivotado hacia una arquitectura **100% Frontend (Client-Side / Serverless)**. Se ha determinado que la inclusión de un backend en Python (FastAPI) añade complejidad innecesaria, aumenta los costos de despliegue y añade latencia sin aportar valor al caso de uso. Toda la lógica de procesamiento de plantillas YAML y generación de configuraciones debe ejecutarse localmente en el navegador del usuario utilizando React.

## 2. Decisiones Arquitectónicas
- **Frontend Framework:** React 18 con Vite.
- **Estilos:** TailwindCSS y Vanilla CSS (heredados del prototipo original) para asegurar un diseño responsivo y moderno.
- **Procesamiento de Datos:** Funciones puras de Javascript/TypeScript para manipular cadenas YAML (basado en el patrón de expresiones regulares y parseo de bloques).
- **Despliegue:** Contenedor Docker estático utilizando Nginx (Zero API Overhead).

## 3. Lógica Core (El Motor)
La lógica de negocio reside en una capa aislada (`src/lib/`) que no depende de la UI, lo cual permite pruebas unitarias aisladas y alta cohesión.

### 3.1. `sensorCatalog.ts/js`
Actúa como la base de datos estática de la aplicación. Contiene los metadatos de todos los sensores de Instana soportados. Cada sensor define:
- `yamlKey`: La ruta en el YAML de Instana.
- `defaults`: Valores por defecto.
- `fields`: Definición de campos para el UI.
- `env`: Lista de variables de entorno requeridas (credenciales).

### 3.2. `sensorDetector.ts/js`
El motor de parseo. Extrae bloques de configuración de una plantilla YAML en bruto.
- Utiliza expresiones regulares para aislar componentes.
- Detecta qué sensores están presentes en la plantilla provista.
- Si detecta un sensor que no está en el catálogo, genera un "Sensor Desconocido" dinámicamente para asegurar resiliencia.

### 3.3. `yamlGenerator.ts/js`
El motor de compilación final. Toma el estado de React (Sensores activos + Etiquetas personalizadas) y genera el archivo `configuration.yaml` válido para Instana.

### 3.4. `envGenerator.ts/js`
Busca iterativamente en los sensores seleccionados las dependencias de credenciales y genera una plantilla `.env` con las claves necesarias vacías.

## 4. Gestión de Estado (UI)
El estado de la aplicación es efímero y se maneja mediante hooks de React (`useState`, `useMemo`).
1. **Initial Load:** Se carga una plantilla YAML por defecto (`default-template.yaml`).
2. **Parsing:** El texto pasa por `detectSensors`, lo que genera un `catalog` enriquecido y una lista de sensores activos.
3. **User Interaction:** El usuario interactúa con la UI (marca checkboxes, edita valores). Estos cambios mutan el estado local de los sensores.
4. **Preview & Export:** Al presionar "Previsualizar" o "Descargar", se llama a `yamlGenerator` con el estado actual, el cual retorna el texto final de forma inmediata.

## 5. Justificación del Pivote para el Hackathon
Adoptar esta arquitectura permite cumplir con el objetivo de entregar un demo completamente funcional con recursos limitados. Un backend solo es necesario si se requiere acceso a bases de datos o servicios secretos; dado que `Instana ConfigPilot` es fundamentalmente una herramienta de configuración de plantillas, el procesamiento en el cliente (Browser) es la solución de ingeniería más eficiente y económica.
