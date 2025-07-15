# DiagramaGanttCustom

## 📋 Descripción
Herramienta web para generar diagramas de Gantt personalizables con múltiples vistas (diaria, semanal, mensual, sprint) y capacidades de exportación.

## 🏗️ Arquitectura del Proyecto

```
DiagramaGanttCustom/
├── index.html                  # Archivo principal de la aplicación
├── README.md                   # Documentación del proyecto
├── PlantillaConfig.txt         # Configuración y requerimientos
├── assets/                     # Recursos estáticos
│   ├── css/
│   │   ├── main.css           # Estilos principales
│   │   ├── toolbar.css        # Estilos de barra superior
│   │   └── responsive.css     # Estilos responsivos
│   ├── js/
│   │   ├── modules/           # Módulos principales
│   │   │   ├── DataManager.js       # Gestión de datos
│   │   │   ├── CanvasRenderer.js    # Renderizado Canvas
│   │   │   ├── ViewManager.js       # Gestión de vistas
│   │   │   ├── StyleManager.js      # Personalización visual
│   │   │   ├── ExportManager.js     # Exportación archivos
│   │   │   └── UIController.js      # Control interfaz
│   │   ├── components/        # Componentes UI
│   │   │   ├── Toolbar.js           # Barra superior
│   │   │   ├── TaskTable.js         # Tabla de tareas
│   │   │   ├── CustomizationPanel.js # Panel personalización
│   │   │   └── ViewButtons.js       # Botones de vista
│   │   ├── utils/             # Utilidades
│   │   │   ├── validators.js        # Validaciones
│   │   │   ├── formatters.js        # Formateo datos
│   │   │   └── errorHandler.js      # Manejo errores
│   │   └── app.js             # Aplicación principal
│   └── icons/                 # Iconos SVG
├── libs/                      # Librerías externas
│   ├── jsPDF/
│   ├── html2canvas/
│   └── FileSaver/
└── tests/                     # Pruebas unitarias
    ├── modules/
    └── components/
```

## 🎯 Módulos Principales

### 1. **DataManager** - Gestión de datos
- Manejo de proyectos y tareas
- Validación de datos
- Exportación/importación JSON

### 2. **UIController** - Control de interfaz
- Manejo de eventos
- Actualización DOM
- Coordinación entre componentes

### 3. **CanvasRenderer** - Renderizado visual
- Dibujo del diagrama Gantt
- Gestión de coordenadas
- Optimización de rendimiento

### 4. **StyleManager** - Personalización
- Gestión de temas
- Configuración visual
- Aplicación dinámica de estilos

### 5. **ViewManager** - Gestión de vistas
- Cálculo de escalas temporales
- Generación de encabezados
- Transformación entre vistas

### 6. **ExportManager** - Exportación
- Generación PDF/JPG/PNG
- Exportación JSON
- Manejo de descargas

## 🚀 Tecnologías
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Gráficos**: HTML5 Canvas
- **Exportación**: jsPDF, html2canvas, FileSaver.js
- **Arquitectura**: Modular ES6+

## 🎨 Principios UX/UI Implementados
- **Responsive Design**: Adaptable a diferentes pantallas
- **Accesibilidad**: Navegación por teclado y ARIA labels
- **Feedback Visual**: Estados hover, loading y confirmación
- **Consistencia**: Design system unificado
- **Performance**: Lazy loading y optimización de Canvas

## 🛡️ Manejo de Errores
- Validación de datos en tiempo real
- Recuperación automática de estado
- Mensajes de error amigables
- Logging detallado para debugging

## 🧪 Testing
- Pruebas unitarias para cada módulo
- Validación de integración Canvas
- Testing de exportación de archivos
- Pruebas de responsividad

## 📝 Guía de Desarrollo
1. Cada módulo es independiente y reutilizable
2. Usar ES6+ modules y async/await
3. Implementar error boundaries en cada componente
4. Mantener separación clara entre lógica y UI
5. Documentar funciones complejas con JSDoc 