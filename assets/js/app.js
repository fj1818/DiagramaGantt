/**
 * DiagramaGanttCustom - Aplicación Principal
 * 
 * @description Punto de entrada principal que inicializa y coordina todos los componentes
 * @author DiagramaGanttCustom Team
 * @version 1.0.0
 */

import Toolbar from './components/Toolbar.js';
import TaskTableModal from './components/TaskTableModal.js';

class DiagramaGanttApp {
    constructor() {
        // Estado global de la aplicación
        this.state = {
            isInitialized: false,
            currentProject: null,

            // Estado persistente (guardado en localStorage)
            persistent: {
                tasks: [],
                headers: {
                    proyecto: 'Proyecto',
                    tarea: 'Tarea'
                },
                settings: this.getDefaultSettings(),
                view: {
                    type: 'daily',
                    scale: 1,
                    startDate: null,
                    endDate: null
                }
            },

            // Estado de sesión (temporal durante la sesión)
            session: {
                tasks: [],
                headers: {
                    proyecto: 'Proyecto',
                    tarea: 'Tarea'
                },
                hasChanges: false
            }
        };

        // Componentes de la aplicación
        this.components = {
            toolbar: null,
            taskTableModal: null,
            taskTable: null,
            canvasRenderer: null,
            viewManager: null,
            styleManager: null,
            exportManager: null
        };

        // Configuración de la aplicación
        this.config = {
            version: '1.0.0',
            autoSaveInterval: 300000, // 5 minutos
            maxTasksPerProject: 1000,
            supportedFormats: ['json'],
            canvas: {
                minWidth: 800,
                minHeight: 400,
                maxZoom: 3,
                minZoom: 0.5
            }
        };

        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            console.log('🚀 Iniciando DiagramaGanttCustom...');

            // Mostrar loading
            this.showLoadingScreen(true);

            // Verificar soporte del navegador
            this.checkBrowserSupport();

            // Inicializar componentes
            await this.initializeComponents();

            // Configurar comunicación entre componentes
            this.setupComponentCommunication();

            // Configurar estado inicial
            this.setupInitialState();

            // Ocultar loading
            this.showLoadingScreen(false);

            // Marcar como inicializada
            this.state.isInitialized = true;

            console.log('✅ DiagramaGanttCustom inicializada correctamente');
            this.showNotification('Aplicación lista para usar', 'success');

        } catch (error) {
            this.handleCriticalError('Error crítico al inicializar aplicación', error);
        }
    }

    /**
     * Verifica soporte del navegador
     */
    checkBrowserSupport() {
        const requiredFeatures = {
            'Canvas HTML5': () => {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext && canvas.getContext('2d'));
            },
            'ES6 Modules': () => 'noModule' in HTMLScriptElement.prototype,
            'File API': () => 'FileReader' in window,
            'Local Storage': () => 'localStorage' in window,
            'CSS Grid': () => CSS.supports('display', 'grid'),
            'CSS Custom Properties': () => CSS.supports('color', 'var(--test)')
        };

        const unsupported = [];
        for (const [feature, test] of Object.entries(requiredFeatures)) {
            if (!test()) {
                unsupported.push(feature);
            }
        }

        if (unsupported.length > 0) {
            throw new Error(`Navegador no compatible. Funciones faltantes: ${unsupported.join(', ')}`);
        }
    }

    /**
     * Inicializa todos los componentes
     */
    async initializeComponents() {
        console.log('🔧 Inicializando componentes...');

        // Inicializar Toolbar (ya implementado)
        this.components.toolbar = new Toolbar();

        // Inicializar TaskTableModal (FASE 2)
        this.components.taskTableModal = new TaskTableModal({
            onGenerate: this.handleGenerateDiagram.bind(this),
            onCancel: this.handleTaskModalCancel.bind(this),
            onTaskAdd: this.handleTaskAdd.bind(this),
            onTaskDelete: this.handleTaskDelete.bind(this),
            onTaskUpdate: this.handleTaskUpdate.bind(this),
            onTemporaryChange: this.handleModalChanges.bind(this) // Nuevo callback para cambios temporales
        });

        // TODO: Inicializar otros componentes cuando estén implementados
        /*
        this.components.taskTable = new TaskTable();
        this.components.canvasRenderer = new CanvasRenderer();
        this.components.viewManager = new ViewManager();
        this.components.styleManager = new StyleManager();
        this.components.exportManager = new ExportManager();
        */

        console.log('✅ Componentes inicializados');
    }

    /**
     * Configura comunicación entre componentes
     */
    setupComponentCommunication() {
        console.log('🔗 Configurando comunicación entre componentes...');

        // Configurar callbacks del Toolbar
        this.components.toolbar.setCallbacks({
            onAddTask: this.handleOpenTaskModal.bind(this),
            onSave: this.handleSave.bind(this),
            onLoad: this.handleLoad.bind(this),
            onViewChange: this.handleViewChange.bind(this),
            onCustomizationChange: this.handleCustomizationChange.bind(this)
        });

        // TODO: Configurar comunicación con otros componentes

        console.log('✅ Comunicación configurada');
    }

    /**
     * Configura estado inicial de la aplicación
     */
    setupInitialState() {
        console.log('⚙️ Configurando estado inicial...');

        // Establecer fechas por defecto
        const now = new Date();
        this.state.persistent.view.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        this.state.persistent.view.endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);

        // Solo cargar localStorage si hay tareas válidas (no cargar automáticamente para evitar cache persistente)
        this.loadFromLocalStorageIfValid();

        // Configurar auto-guardado
        this.setupAutoSave();

        // Inicializar estado de sesión con estado persistente
        this.initializeSessionState();

        console.log('✅ Estado inicial configurado');
    }

    /**
     * Abre el modal de gestión de tareas
     */
    async handleOpenTaskModal() {
        try {
            console.log('📋 Abriendo modal de gestión de tareas...');
            console.log('🔄 Estado de sesión actual:', {
                tasks: this.state.session.tasks.length,
                hasChanges: this.state.session.hasChanges
            });

            // Abrir modal con estado de sesión (cambios temporales durante la sesión)
            await this.components.taskTableModal.open(this.state.session.tasks, this.state.session.headers);

            return { success: true };
        } catch (error) {
            console.error('Error al abrir modal de tareas:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Maneja la generación del diagrama desde el modal
     */
    async handleGenerateDiagram(tasks, headers = null) {
        try {
            console.log('🚀 Generando diagrama con tareas:', tasks);
            if (headers) {
                console.log('📋 Headers personalizados:', headers);
            }

            // Actualizar estado de sesión
            this.state.session.tasks = [...tasks];
            if (headers) {
                this.state.session.headers = {...headers };
            }
            this.state.session.hasChanges = false; // Se acaba de guardar

            // Actualizar estado persistente (se guardará en localStorage)
            this.state.persistent.tasks = [...tasks];
            if (headers) {
                this.state.persistent.headers = {...headers };
            }
            this.state.currentProject = this.generateProjectData();

            // Marcar como modificado para el toolbar
            this.components.toolbar.state.hasUnsavedChanges = true;
            this.components.toolbar.updateButtonStates();

            // Guardar en localStorage
            await this.saveToLocalStorage();

            // TODO: Actualizar canvas y vista cuando estén implementados
            this.updateAllComponents();

            // Notificar éxito
            const headerInfo = headers ? ` (${headers.proyecto}: ${headers.tarea})` : '';
            this.showNotification(`Diagrama generado con ${tasks.length} tareas${headerInfo}`, 'success');

            return { success: true };
        } catch (error) {
            console.error('Error al generar diagrama:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Maneja cancelación del modal de tareas (usuario confirmó cancelar)
     */
    async handleTaskModalCancel() {
        console.log('❌ Modal de tareas cancelado por el usuario');
        // Los cambios temporales se mantienen para la próxima apertura del modal en la misma sesión
        // No necesitamos hacer nada aquí, los cambios se quedan en session
        return { success: true };
    }

    /**
     * Maneja adición de tarea en el modal
     */
    handleTaskAdd(task) {
        console.log('➕ Tarea agregada en modal:', task.id);
    }

    /**
     * Maneja eliminación de tarea en el modal
     */
    handleTaskDelete(task) {
        console.log('🗑️ Tarea eliminada en modal:', task.id);
    }

    /**
     * Maneja actualización de tarea en el modal
     */
    handleTaskUpdate(task, field, oldValue, newValue) {
        console.log(`📝 Tarea ${task.id} actualizada: ${field} = ${newValue}`);
    }

    /**
     * Genera datos del proyecto basado en las tareas (usa estado de sesión)
     */
    generateProjectData() {
        const projects = {};

        this.state.session.tasks.forEach(task => {
            if (!projects[task.proyecto]) {
                projects[task.proyecto] = {
                    nombre: task.proyecto,
                    tareas: [],
                    fechaInicio: task.fechaInicio,
                    fechaFin: task.fechaFin
                };
            }

            projects[task.proyecto].tareas.push(task);

            // Actualizar fechas del proyecto
            if (task.fechaInicio < projects[task.proyecto].fechaInicio) {
                projects[task.proyecto].fechaInicio = task.fechaInicio;
            }
            if (task.fechaFin > projects[task.proyecto].fechaFin) {
                projects[task.proyecto].fechaFin = task.fechaFin;
            }
        });

        return Object.values(projects);
    }

    /**
     * Maneja guardado de diagrama
     */
    async handleSave() {
        try {
            console.log('💾 Guardando diagrama...');

            const data = this.exportData();
            this.downloadJSON(data, `diagrama-gantt-${Date.now()}.json`);

            await this.saveToLocalStorage();

            return { success: true };
        } catch (error) {
            console.error('Error al guardar:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Maneja carga de diagrama
     */
    async handleLoad(data) {
        try {
            console.log('📁 Cargando diagrama...');

            // Validar estructura de datos
            this.validateImportData(data);

            // Importar datos
            this.importData(data);

            // Guardar en localStorage
            await this.saveToLocalStorage();

            // Actualizar vista
            this.updateAllComponents();

            return { success: true };
        } catch (error) {
            console.error('Error al cargar:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Maneja cambio de vista
     */
    async handleViewChange(viewType, sprintStartDate = null) {
        try {
            console.log(`🔄 Cambiando vista a: ${viewType}`);

            this.state.persistent.view.type = viewType;

            if (viewType === 'sprint' && sprintStartDate) {
                this.state.persistent.view.sprintStart = sprintStartDate;
            }

            // TODO: Actualizar canvas y componentes relacionados
            this.updateAllComponents();

            return { success: true };
        } catch (error) {
            console.error('Error al cambiar vista:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Maneja cambios de personalización
     */
    async handleCustomizationChange(settings) {
        try {
            console.log('🎨 Aplicando personalización...');

            this.state.persistent.settings = {...this.state.persistent.settings, ...settings };

            // TODO: Aplicar estilos a componentes
            this.updateAllComponents();

            return { success: true };
        } catch (error) {
            console.error('Error al aplicar personalización:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza todos los componentes
     */
    updateAllComponents() {
        // TODO: Implementar actualización de componentes
        console.log('🔄 Actualizando componentes...');
    }

    /**
     * Exporta datos de la aplicación (usa estado persistente para archivos JSON)
     */
    exportData() {
        return {
            version: this.config.version,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            projects: this.getProjectsData(),
            tasks: this.state.persistent.tasks,
            headers: this.state.persistent.headers,
            settings: this.state.persistent.settings,
            view: this.state.persistent.view
        };
    }

    /**
     * Importa datos a la aplicación (actualiza tanto estado persistente como de sesión)
     */
    importData(data) {
        // Validar versión
        if (data.version && this.isVersionCompatible(data.version)) {
            // Actualizar estado persistente
            this.state.persistent.tasks = data.tasks || [];
            this.state.persistent.headers = data.headers || { proyecto: 'Proyecto', tarea: 'Tarea' };
            this.state.persistent.settings = {...this.getDefaultSettings(), ...data.settings };
            this.state.persistent.view = {...this.state.persistent.view, ...data.view };

            // Sincronizar estado de sesión con los datos importados
            this.syncSessionWithPersistent();
        } else {
            throw new Error('Versión de archivo no compatible');
        }
    }

    /**
     * Valida datos de importación
     */
    validateImportData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Archivo JSON inválido');
        }

        if (data.tasks && !Array.isArray(data.tasks)) {
            throw new Error('Formato de tareas inválido');
        }

        // Validar estructura de tareas
        if (data.tasks) {
            for (const task of data.tasks) {
                this.validateTask(task);
            }
        }
    }

    /**
     * Valida estructura de tarea
     */
    validateTask(task) {
        const required = ['id', 'proyecto', 'tarea', 'fechaInicio', 'fechaFin', 'color'];
        for (const field of required) {
            if (!task[field]) {
                throw new Error(`Campo requerido faltante en tarea: ${field}`);
            }
        }

        // Validar formato de fechas
        if (!/^\d{4}-\d{2}-\d{2}$/.test(task.fechaInicio) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(task.fechaFin)) {
            throw new Error('Formato de fecha inválido en tarea');
        }

        // Validar color hexadecimal
        if (!/^#[0-9A-Fa-f]{6}$/.test(task.color)) {
            throw new Error('Formato de color inválido en tarea');
        }
    }

    /**
     * Obtiene configuración por defecto
     */
    getDefaultSettings() {
        return {
            colores: {
                fondoDiagrama: "#FFFFFF",
                encabezados: "#2196F3",
                bordes: "#E0E0E0",
                celdas: "#F5F5F5"
            },
            fuentes: {
                encabezados: { tipo: "Arial", tamaño: 14 },
                proyectos: { tipo: "Arial", tamaño: 12 },
                tareas: { tipo: "Arial", tamaño: 12 }
            }
        };
    }

    /**
     * Obtiene datos de proyectos (usa estado de sesión)
     */
    getProjectsData() {
        const projects = {};
        this.state.session.tasks.forEach(task => {
            if (!projects[task.proyecto]) {
                projects[task.proyecto] = {
                    nombre: task.proyecto,
                    tareas: []
                };
            }
            projects[task.proyecto].tareas.push(task);
        });
        return Object.values(projects);
    }

    /**
     * Verifica compatibilidad de versión
     */
    isVersionCompatible(version) {
        // Implementar lógica de compatibilidad
        return version === this.config.version;
    }

    /**
     * Genera ID único
     */
    generateId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Descarga archivo JSON
     */
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }

    /**
     * Guarda en localStorage
     */
    async saveToLocalStorage() {
        try {
            const data = this.exportData();
            localStorage.setItem('diagramaGantt_data', JSON.stringify(data));
            localStorage.setItem('diagramaGantt_lastSave', new Date().toISOString());
        } catch (error) {
            console.warn('Error al guardar en localStorage:', error);
        }
    }

    /**
     * Carga desde localStorage
     */
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('diagramaGantt_data');
            if (data) {
                const parsed = JSON.parse(data);
                this.importData(parsed);
                console.log('✅ Datos cargados desde localStorage');
            }
        } catch (error) {
            console.warn('Error al cargar desde localStorage:', error);
        }
    }

    /**
     * Carga desde localStorage solo si hay tareas válidas (evita cache vacío persistente)
     */
    loadFromLocalStorageIfValid() {
        try {
            const data = localStorage.getItem('diagramaGantt_data');
            if (data) {
                const parsed = JSON.parse(data);

                // Solo cargar si hay tareas reales, no solo configuración vacía
                if (parsed.tasks && parsed.tasks.length > 0 && parsed.tasks.some(task =>
                        task.proyecto && task.proyecto.trim().length > 0
                    )) {
                    this.importData(parsed);
                    console.log('✅ Datos válidos cargados desde localStorage:', parsed.tasks.length, 'tareas');
                } else {
                    console.log('📝 Iniciando con estado limpio (sin tareas previas válidas)');
                    // Limpiar localStorage si solo tiene datos vacíos
                    localStorage.removeItem('diagramaGantt_data');
                    localStorage.removeItem('diagramaGantt_lastSave');
                }
            } else {
                console.log('📝 Iniciando con estado limpio (primera vez)');
            }
        } catch (error) {
            console.warn('Error al validar localStorage, iniciando limpio:', error);
            // En caso de error, limpiar localStorage corrupto
            localStorage.removeItem('diagramaGantt_data');
            localStorage.removeItem('diagramaGantt_lastSave');
        }
    }

    /**
     * Inicializa el estado de sesión SIEMPRE VACÍO (sin importar localStorage)
     */
    initializeSessionState() {
        // El estado de sesión SIEMPRE inicia vacío
        this.state.session.tasks = [];
        this.state.session.headers = {
            proyecto: 'Proyecto',
            tarea: 'Tarea'
        };
        this.state.session.hasChanges = false;

        console.log('🔄 Estado de sesión inicializado VACÍO:', {
            tasks: this.state.session.tasks.length,
            headers: this.state.session.headers,
            persistent_tasks: this.state.persistent.tasks.length
        });
    }

    /**
     * Maneja cambios temporales en el modal (sin guardar)
     */
    handleModalChanges(tasks, headers) {
        console.log('📝 Actualizando estado temporal de sesión');
        this.state.session.tasks = [...tasks];
        this.state.session.headers = {...headers };
        this.state.session.hasChanges = true;
    }

    /**
     * Sincroniza estado de sesión con estado persistente (usado después de cargar archivos)
     */
    syncSessionWithPersistent() {
        console.log('🔄 Sincronizando sesión con estado persistente');
        this.state.session.tasks = [...this.state.persistent.tasks];
        this.state.session.headers = {...this.state.persistent.headers };
        this.state.session.hasChanges = false;
    }

    /**
     * Descarta cambios temporales y restaura estado persistente
     */
    discardSessionChanges() {
        console.log('🔄 Descartando cambios de sesión, restaurando estado persistente');
        this.syncSessionWithPersistent();
    }

    /**
     * Configura auto-guardado
     */
    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.state.isInitialized) {
                this.saveToLocalStorage();
            }
        }, this.config.autoSaveInterval);
    }

    /**
     * Muestra/oculta pantalla de carga
     */
    showLoadingScreen(show) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            if (show) {
                loadingScreen.classList.remove('hidden');
            } else {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 300);
            }
        }
    }

    /**
     * Muestra notificación
     */
    showNotification(message, type = 'info') {
        // TODO: Implementar sistema de notificaciones completo
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    /**
     * Maneja errores críticos
     */
    handleCriticalError(context, error) {
        console.error(`💥 ${context}:`, error);

        // Mostrar mensaje de error al usuario
        const errorMessage = `${context}: ${error.message}`;

        // Crear elemento de error si no existe
        let errorContainer = document.getElementById('critical-error');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'critical-error';
            errorContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(244, 67, 54, 0.9);
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: system-ui, -apple-system, sans-serif;
                text-align: center;
                padding: 2rem;
            `;
            document.body.appendChild(errorContainer);
        }

        errorContainer.innerHTML = `
            <h1>💥 Error Crítico</h1>
            <p>${errorMessage}</p>
            <p><small>Por favor, recarga la página para intentar nuevamente.</small></p>
            <button onclick="location.reload()" style="
                background: white;
                color: #f44336;
                border: none;
                padding: 1rem 2rem;
                border-radius: 0.5rem;
                cursor: pointer;
                font-weight: bold;
                margin-top: 1rem;
            ">Recargar Página</button>
        `;
    }

    /**
     * Obtiene estado de la aplicación
     */
    getState() {
        return {...this.state };
    }

    /**
     * Destruye la aplicación
     */
    destroy() {
        // Limpiar intervalos
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // Destruir componentes
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        console.log('🧹 Aplicación destruida');
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.diagramaGanttApp = new DiagramaGanttApp();
});

// Manejar errores globales
window.addEventListener('error', (event) => {
    console.error('Error global capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rechazada no manejada:', event.reason);
});

export default DiagramaGanttApp;