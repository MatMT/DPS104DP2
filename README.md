# Segundo Desafío Práctico: Auditoría y Control de Inventario en Bodega

**Universidad Don Bosco — Escuela de Computación**  
**Materia:** Desarrollo de Aplicaciones Móviles (DPS)  
**Modalidad Seleccionada:** **Opción 1:** App de Auditoría y Control de Inventario en Bodega  

---

## 📱 Descripción de la Solución

Asistente digital móvil diseñado para operarios de almacén que permite auditar stock físico, verificar productos mediante lectura óptica de código de barras, registrar incidencias georreferenciadas con captura automática de coordenadas GPS y adjuntar notas de voz como evidencia multimedia.

---

## 🚀 Características Implementadas (Cumplimiento de Rúbrica)

| Funcionalidad | Módulo / Hardware | Descripción |
| :--- | :--- | :--- |
| **Catálogo y Búsqueda** | `FlatList` + `SearchBar` | Catálogo de 16 productos con imágenes HTTPS, métricas de stock, precios y filtrado en tiempo real insensible a mayúsculas/minúsculas. |
| **Escáner de Código de Barras** | `expo-camera` (`CameraView`) | Visor de cámara trasera con mira láser interactiva, control de linterna y vinculación automática al catálogo al decodificar el código de producto. |
| **Auditoría Georreferenciada** | `expo-location` | Captura automática de latitud y longitud en tiempo real al momento de levantar una auditoría o incidencia. |
| **Notas de Voz Multimedia** | `expo-audio` | Grabación y reproducción integrada de notas de voz descriptivas asociadas a cada registro de auditoría. |
| **Bitácora de Movimientos** | `AuditLogItem` + `FlatList` | Historial persistido con formato legible de fecha/hora, estado de acción, coordenadas exactas y reproductor de audio nativo. |
| **Mapa Interactivo** | `LocationMap` (OpenStreetMap) | Visualización georreferenciada con pines personalizados (🟢 Conteo Normal, 🔴 Incidencia) y tarjeta flotante con información de cada auditoría. |
| **Estado Global y Persistencia** | `Context API` + `AsyncStorage` | `AuditContext` que preserva y sincroniza los datos entre pestañas y reinicios de la aplicación. |
| **Navegación por Pestañas** | `expo-router` (`Tabs`) | Estructura modular basada en archivos (`src/app/(tabs)`) con badge numérico en tiempo real en la pestaña de Bitácora. |

---

## 🗺️ Justificación Técnica de la Solución de Mapa (OpenStreetMap)

Debido a las recientes políticas de Google Cloud Platform que exigen un depósito obligatorio por adelantado de **$30.00 USD** para activar la consola de facturación y el SDK de Google Maps, se optó por implementar una solución arquitectónica abierta:

- **Componente:** `src/components/LocationMap.tsx`
- **Tecnología:** **Leaflet.js + OpenStreetMap** embebido mediante `react-native-webview`.
- **Beneficios:**
  - **Costo $0.00:** Sin dependencia de tarjetas de crédito ni barreras de facturación de terceros.
  - **100% Funcional en Expo Go:** Soporte multiplataforma garantizado en Android e iOS.
  - **Cumplimiento Total:** Representación visual con marcadores georreferenciados, interactividad con popups, auto-encuadre (`fitBounds`) y botón de ubicación actual del operario.

---

## 📦 Estructura del Proyecto

El código está organizado manteniendo estrictamente la arquitectura solicitada en el desafío:

```text
src/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Configuración de pestañas con estilos e iconos
│   │   ├── index.tsx           # Catálogo de Inventario con búsqueda dinámica
│   │   ├── scanner.tsx         # Escáner de Código de Barras con cámara
│   │   ├── audit-log.tsx       # Bitácora de Movimientos y Registro
│   │   └── map.tsx             # Mapa de Movimientos / Ubicación de Eventos
│   ├── _layout.tsx             # Layout raíz con AuditProvider
│   └── index.tsx               # Redirección a la ruta de pestañas
├── components/
│   ├── ProductCard.tsx         # Tarjeta de producto con indicadores de stock
│   ├── SearchBar.tsx           # Barra de búsqueda reactiva
│   ├── CameraScanner.tsx       # Visor de cámara con visor láser y linterna
│   ├── AuditLogItem.tsx        # Ficha de auditoría con reproductor de audio
│   ├── LocationMap.tsx         # Mapa interactivo Leaflet / OpenStreetMap
│   ├── AudioRecorder.tsx       # Grabador de audio con temporizador y preview
│   └── AuditModal.tsx          # Modal de registro con GPS automático
├── context/
│   └── AuditContext.tsx        # Estado global y persistencia con AsyncStorage
├── data/
│   ├── products.ts             # Catálogo semilla de 16 productos
│   └── seedAudits.ts           # Auditorías georreferenciadas de demostración
└── types/
    ├── Product.ts              # Interfaz TypeScript estricta de Producto
    └── AuditEntry.ts           # Interfaz TypeScript estricta de Auditoría
```

---

## 📋 Códigos de Barras para la Demostración Práctica

Puedes escanear estos códigos directamente desde la pantalla de tu computadora o dispositivo secundario durante la defensa en vivo:

| Producto | Código de Barras | Categoría | Stock Esperado |
| :--- | :--- | :--- | :--- |
| Monitor Gamer 27" QHD 165Hz IPS | `7501031311301` | Electrónica | 45 uds |
| Teclado Mecánico RGB Switch Red | `7501031311302` | Accesorios | 120 uds |
| Ratón Inalámbrico Ergonómico | `7501031311303` | Accesorios | 80 uds |
| Auriculares Noise Cancelling | `7501031311304` | Audio | 65 uds |
| SSD NVMe PCIe 4.0 1TB 7000MB/s | `7501031311305` | Almacenamiento | 200 uds |
| Router Wi-Fi 6 Mesh Gigabit AX3000 | `7501031311307` | Redes | 35 uds |
| Cámara de Seguridad IP Wi-Fi 2K | `7501031311309` | Seguridad | 50 uds |
| Hub USB-C 8 en 1 con HDMI 4K | `7501031311316` | Accesorios | 85 uds |

> **Nota:** La pantalla del escáner también cuenta con un botón de *"Probar en Emulador"* que permite seleccionar productos o códigos no registrados para realizar pruebas sin necesidad de una cámara física.

---

## 🛠️ Instrucciones de Ejecución

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/MatMT/DPS104DP2.git
   cd DPS104DP2
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo de Expo:
   ```bash
   npx expo start
   ```

4. Abrir la app:
   - **Dispositivo físico:** Escanear el código QR con la app **Expo Go** (Android) o la app de Cámara (iOS).
   - **Emulador Android:** Presionar `a` en la terminal.
   - **Simulador iOS:** Presionar `i` en la terminal.
