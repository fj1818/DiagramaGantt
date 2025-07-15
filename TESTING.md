# Guía de Testing - DiagramaGanttCustom

## 🧪 Verificación de Funcionalidad - Fase 1 y 2

### ✅ Lista de Verificación de la Barra Superior

#### **Pruebas Visuales**
- [ ] La barra superior se muestra correctamente al cargar la página
- [ ] El título "DiagramaGanttCustom" aparece con el icono 📊
- [ ] Los 4 botones principales están visibles: ➕ Agregar, 💾 Guardar, 📁 Cargar, 🎨 Personalización
- [ ] Los botones de vista están visibles: 📅 Diaria, 📆 Semanal, 🗓️ Mensual, 🚀 Sprint
- [ ] La vista "Semanal" aparece como activa por defecto

#### **Pruebas de Interacción**
- [ ] **Botón Agregar**: Al hacer clic muestra notificación de "Nueva tarea agregada"
- [ ] **Botón Guardar**: Al hacer clic descarga un archivo JSON de ejemplo
- [ ] **Botón Cargar**: Al hacer clic abre el selector de archivos
- [ ] **Botón Personalización**: Al hacer clic abre/cierra el panel desplegable
- [ ] **Botones de Vista**: Al hacer clic cambian el estado activo

#### **Pruebas de Carga de Archivos**
- [ ] Seleccionar archivo .json válido: Muestra mensaje de éxito
- [ ] Seleccionar archivo no .json: Muestra error "Solo se permiten archivos JSON"
- [ ] Seleccionar archivo muy grande: Muestra error de tamaño máximo

#### **Pruebas de Accesibilidad**
- [ ] **Navegación por teclado**: Tab navega por todos los botones
- [ ] **Enter/Space**: Activa los botones correctamente
- [ ] **Escape**: Cierra el panel de personalización
- [ ] **ARIA labels**: Screenreaders pueden leer la funcionalidad

#### **Pruebas de Responsive**
- [ ] **Desktop (>1200px)**: Todos los elementos visibles en una línea
- [ ] **Tablet (768-991px)**: Botones se adaptan, texto más pequeño
- [ ] **Móvil (≤767px)**: Layout vertical, solo iconos visibles
- [ ] **Móvil landscape**: Diseño compacto horizontal

#### **Pruebas de Estados**
- [ ] **Estados hover**: Botones cambian color al pasar mouse
- [ ] **Estados loading**: Aparece spinner al procesar acciones
- [ ] **Estados disabled**: Botones se deshabilitan cuando es necesario
- [ ] **Panel personalización**: Se abre/cierra suavemente

### 🎨 Verificación de Design System

#### **Variables CSS**
- [ ] Colores consistentes en toda la aplicación
- [ ] Espaciado uniforme entre elementos
- [ ] Tipografía coherente (Segoe UI fallback)
- [ ] Transiciones suaves (0.15s-0.3s)

#### **Responsive Breakpoints**
- [ ] **xs (0-575px)**: Layout ultra compacto
- [ ] **sm (576-767px)**: Layout móvil
- [ ] **md (768-991px)**: Layout tablet
- [ ] **lg (992-1199px)**: Layout desktop
- [ ] **xl (1200px+)**: Layout desktop expandido

### 🛠️ Verificación Técnica

#### **Consola del Navegador**
- [ ] No hay errores de JavaScript al cargar
- [ ] Se muestra "🚀 Iniciando DiagramaGanttCustom..."
- [ ] Se muestra "✅ DiagramaGanttCustom inicializada correctamente"
- [ ] Los clicks en botones generan logs apropiados

#### **Funcionalidades Implementadas**
- [ ] **Auto-guardado**: localStorage se actualiza cada 5 minutos
- [ ] **Recuperación**: Al recargar página mantiene estado (si hay datos)
- [ ] **Validaciones**: Archivos y datos son validados correctamente
- [ ] **Error handling**: Errores se manejan graciosamente

#### **Soporte de Navegador**
- [ ] **Chrome**: Funciona completamente
- [ ] **Firefox**: Funciona completamente  
- [ ] **Safari**: Funciona completamente
- [ ] **Edge**: Funciona completamente

### 🔧 Pruebas de Atajos de Teclado

#### **Atajos Principales**
- [ ] **Ctrl+N**: Agregar nueva tarea
- [ ] **Ctrl+S**: Guardar diagrama
- [ ] **Ctrl+O**: Cargar diagrama
- [ ] **Ctrl+K**: Abrir/cerrar personalización
- [ ] **Escape**: Cerrar panel de personalización

### 📱 Pruebas Específicas Móviles

#### **Táctil**
- [ ] Área de toque mínima 44px en botones
- [ ] Gestos swipe funcionan en botones de vista
- [ ] Panel personalización ocupa pantalla completa
- [ ] Scroll horizontal en botones de vista

#### **Orientación**
- [ ] **Portrait**: Layout vertical funcional
- [ ] **Landscape**: Layout horizontal compacto
- [ ] **Rotación**: Se adapta sin errores

### 🚨 Casos Edge a Probar

#### **Errores Simulados**
- [ ] Archivo JSON malformado: Muestra error específico
- [ ] Archivo demasiado grande: Previene carga
- [ ] Sin localStorage: Aplicación funciona igualmente
- [ ] JavaScript deshabilitado: Muestra fallback

#### **Límites**
- [ ] Muchos clicks rápidos: No se rompe la aplicación
- [ ] Panel personalización abierto + resize: Se adapta correctamente
- [ ] Cambios de vista rápidos: No causan conflictos

---

## 🎯 Criterios de Éxito

### ✅ Mínimos Requeridos
- Barra superior funcional con todos los botones
- Diseño responsive perfecto
- Sin errores de JavaScript
- Accesibilidad básica funcionando

### 🌟 Excelencia
- Todas las animaciones suaves
- Manejo de errores robusto
- Experiencia móvil optimizada
- Performance rápida en todas las acciones

---

## 🐛 Registro de Issues Encontrados

### Template para Reportar Bugs:
```
**Fecha**: [YYYY-MM-DD]
**Navegador**: [Chrome/Firefox/Safari/Edge + versión]
**Dispositivo**: [Desktop/Tablet/Móvil]
**Descripción**: [Qué pasó exactamente]
**Pasos para Reproducir**: [1. Hacer esto, 2. Luego esto...]
**Resultado Esperado**: [Qué debería pasar]
**Resultado Actual**: [Qué realmente pasó]
**Severidad**: [Alta/Media/Baja]
```

---

## 📈 Métricas de Performance

### Tiempos de Carga
- [ ] **Inicial**: < 2 segundos
- [ ] **Interacción**: < 100ms
- [ ] **Animaciones**: 60fps consistente

### Tamaños de Archivo
- [ ] **HTML**: ~10KB
- [ ] **CSS Total**: ~80KB (incluyendo modal.css)
- [ ] **JS Total**: ~60KB (incluyendo Modal.js y TaskTableModal.js)
- [ ] **Sin librerías externas aún**

---

## 📋 **FASE 2: Verificación del Modal de Gestión de Tareas**

### ✅ **Lista de Verificación del Modal**

#### **Apertura y Cierre del Modal**
- [ ] **Botón Agregar Tarea**: Abre el modal correctamente
- [ ] **Modal se muestra**: Aparece con animación suave
- [ ] **Focus trap**: Tab navega solo dentro del modal
- [ ] **Botón X**: Cierra el modal
- [ ] **Escape**: Cierra el modal
- [ ] **Click fuera**: Cierra el modal (backdrop)
- [ ] **Confirmación**: Pregunta al cerrar con cambios sin guardar

#### **Botón Agregar Elemento**
- [ ] **Click funcional**: Agrega nueva fila a la tabla
- [ ] **Estado vacío**: Se oculta cuando hay tareas, se muestra cuando está vacío
- [ ] **Focus automático**: Se enfoca en el primer input de la nueva fila
- [ ] **Icono y texto**: Muestra ➕ y "Agregar Elemento"

#### **Tabla de Tareas - Campos de Entrada**
- [ ] **Proyecto**: Input text funcional con placeholder
- [ ] **Tarea**: Input text funcional con placeholder  
- [ ] **Fecha Inicio**: Input date con valor por defecto (hoy)
- [ ] **Fecha Fin**: Input date con valor por defecto (+7 días)
- [ ] **Color**: Selector funcional (picker + hexadecimal)
- [ ] **Acciones**: Botón eliminar (🗑️) en cada fila

#### **Selector de Color**
- [ ] **Preview visual**: Muestra el color seleccionado
- [ ] **Color picker**: Abre selector nativo del navegador
- [ ] **Input hexadecimal**: Acepta códigos #RRGGBB
- [ ] **Sincronización**: Cambios en picker actualizan input y viceversa
- [ ] **Hover effect**: Preview se agranda al pasar mouse
- [ ] **Validación**: Rechaza códigos hexadecimales inválidos

#### **Validaciones en Tiempo Real**
- [ ] **Campos requeridos**: Proyecto y Tarea marcan error si están vacíos
- [ ] **Validación de fechas**: Fecha fin debe ser posterior a fecha inicio
- [ ] **Formato de color**: Solo acepta #RRGGBB válidos
- [ ] **Feedback visual**: Inputs con error muestran borde rojo
- [ ] **Validación al escribir**: Se valida durante input y al perder focus

#### **Botón Eliminar Fila**
- [ ] **Confirmación**: Pregunta antes de eliminar (si tiene contenido)
- [ ] **Eliminación directa**: No pregunta si la fila está vacía
- [ ] **Actualización**: Tabla se actualiza inmediatamente
- [ ] **Estado vacío**: Muestra mensaje cuando no quedan tareas
- [ ] **Focus**: Mantiene focus apropiado después de eliminar

#### **Botones del Footer**
- [ ] **Cancelar**: Cierra modal con confirmación si hay cambios
- [ ] **Generar Diagrama**: Valida antes de proceder
- [ ] **Validación completa**: No permite generar con errores
- [ ] **Validación de contenido**: Requiere al menos una tarea
- [ ] **Estados loading**: Muestra spinner durante procesamiento

#### **Estados del Modal**
- [ ] **Estado vacío**: Muestra icono 📝 y mensaje apropiado
- [ ] **Estado con tareas**: Muestra tabla con todas las tareas
- [ ] **Estado de error**: Feedback claro para errores de validación
- [ ] **Estado de carga**: Spinner y mensaje durante operaciones async

### 🎨 **Verificación UX/UI del Modal**

#### **Responsive Design**
- [ ] **Desktop (>1200px)**: Modal 900px ancho máximo, centrado
- [ ] **Tablet (768-991px)**: Modal 95% ancho con márgenes
- [ ] **Móvil (≤767px)**: Modal pantalla completa sin bordes
- [ ] **Scroll horizontal**: Tabla scrolleable en pantallas pequeñas
- [ ] **Orientación**: Funciona en portrait y landscape

#### **Animaciones y Transiciones**
- [ ] **Apertura**: Modal escala de 0.9 a 1.0 con fade in
- [ ] **Cierre**: Fade out suave y escala down
- [ ] **Hover states**: Botones y inputs reaccionan al mouse
- [ ] **Focus states**: Outline azul visible en navegación por teclado
- [ ] **Disabled states**: Botones deshabilitados visualmente claros

#### **Accesibilidad**
- [ ] **Screen readers**: ARIA labels en todos los elementos
- [ ] **Role attributes**: Table, row, gridcell apropiados
- [ ] **Tab order**: Navegación lógica por todos los elementos
- [ ] **Focus trap**: No se puede salir del modal con Tab
- [ ] **Escape handling**: Cierra modal apropiadamente
- [ ] **Required fields**: Marcados como required en HTML

### 🔧 **Verificación Técnica**

#### **Funciones JavaScript**
- [ ] **addTask()**: Agrega tarea con ID único y valores por defecto
- [ ] **deleteTask()**: Elimina tarea del estado y DOM
- [ ] **updateTask()**: Actualiza propiedades de tarea
- [ ] **validateTask()**: Valida todos los campos de una tarea
- [ ] **renderTasks()**: Re-dibuja tabla completa correctamente

#### **Integración con App**
- [ ] **Estado global**: Cambios se reflejan en app.js state
- [ ] **LocalStorage**: Datos persisten al recargar página
- [ ] **Callbacks**: Todos los eventos notifican a la aplicación principal
- [ ] **Error handling**: Errores se manejan graciosamente
- [ ] **Memory leaks**: Modal se destruye correctamente

#### **Validación de Datos**
- [ ] **Formato de fechas**: YYYY-MM-DD estricto
- [ ] **XSS Prevention**: Escapado de HTML en contenido de usuario
- [ ] **Límites de entrada**: Campos no exceden límites razonables
- [ ] **Datos coherentes**: Estado interno siempre consistente

### 🧪 **Casos de Prueba Específicos**

#### **Escenario 1: Usuario nuevo (primer uso)**
1. Abrir modal → Debe mostrar estado vacío
2. Click "Agregar Elemento" → Nueva fila con valores por defecto
3. Llenar todos los campos → Sin errores de validación
4. Click "Generar Diagrama" → Éxito y cierre de modal

#### **Escenario 2: Edición de tareas existentes**
1. Abrir modal con tareas previas → Tabla pre-poblada
2. Modificar fechas → Validación en tiempo real
3. Cambiar color → Preview se actualiza instantáneamente
4. Eliminar tarea intermedia → Tabla se reorganiza correctamente

#### **Escenario 3: Manejo de errores**
1. Dejar campos vacíos → Errores visibles
2. Fecha fin anterior a inicio → Error mostrado
3. Color inválido → Feedback de error
4. Intentar generar con errores → Bloqueado con mensaje

#### **Escenario 4: Responsive y accesibilidad**
1. Redimensionar ventana → Modal se adapta suavemente
2. Navegación solo con teclado → Funcional al 100%
3. Cambiar orientación móvil → Sin pérdida de funcionalidad 