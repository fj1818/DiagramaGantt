/**
 * Toolbar Component - Manejo de la Barra Superior
 * 
 * @description Controla todos los eventos y estados de la barra superior
 * @author DiagramaGanttCustom Team
 * @version 1.0.0
 */

class Toolbar {
    constructor() {
        // Referencias a elementos DOM
        this.elements = {
            addTaskBtn: null,
            saveBtn: null,
            loadBtn: null,
            customizeBtn: null,
            closePanel: null,
            fileInput: null,
            customizationPanel: null,
            viewSelect: null,
            sprintDateInput: null
        };

        // Estado del componente
        this.state = {
            isCustomizationOpen: false,
            currentView: 'daily',
            isLoading: false,
            hasUnsavedChanges: false
        };

        // Configuración
        this.config = {
            notifications: {
                duration: 3000,
                maxVisible: 3
            },
            fileTypes: {
                allowed: ['.json'],
                maxSize: 10 * 1024 * 1024 // 10MB
            }
        };

        // Callbacks - se configurarán desde app.js
        this.callbacks = {
            onAddTask: null,
            onSave: null,
            onLoad: null,
            onViewChange: null,
            onCustomizationChange: null
        };

        this.init();
    }

    /**
     * Inicializa el componente
     */
    init() {
        try {
            this.bindElements();
            this.attachEventListeners();
            this.setupKeyboardNavigation();
            this.initializeState();
            this.showNotification('Toolbar inicializada correctamente', 'success');
        } catch (error) {
            this.handleError('Error al inicializar Toolbar', error);
        }
    }

    /**
     * Vincula referencias a elementos DOM
     */
    bindElements() {
        const requiredElements = {
            addTaskBtn: '#btn-add-task',
            saveBtn: '#btn-save',
            loadBtn: '#btn-load',
            customizeBtn: '#btn-customize',
            closePanel: '#btn-close-panel',
            fileInput: '#file-input',
            customizationPanel: '#customization-panel'
        };

        for (const [key, selector] of Object.entries(requiredElements)) {
            this.elements[key] = document.querySelector(selector);
            if (!this.elements[key]) {
                throw new Error(`Elemento requerido no encontrado: ${selector}`);
            }
        }

        // Elementos opcionales
        this.elements.viewSelect = document.querySelector('#view-select');
        this.elements.sprintDateInput = document.querySelector('#sprint-date');
    }

    /**
     * Adjunta event listeners
     */
    attachEventListeners() {
        // Botones principales
        this.elements.addTaskBtn.addEventListener('click', (e) => this.handleAddTask(e));
        this.elements.saveBtn.addEventListener('click', (e) => this.handleSave(e));
        this.elements.loadBtn.addEventListener('click', (e) => this.handleLoad(e));
        this.elements.customizeBtn.addEventListener('click', (e) => this.toggleCustomization(e));
        this.elements.closePanel.addEventListener('click', (e) => this.closeCustomization(e));

        // Input de archivo
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Cambio de vista
        if (this.elements.viewSelect) {
            this.elements.viewSelect.addEventListener('change', (e) => this.handleViewChange(e));
        }
        if (this.elements.sprintDateInput) {
            this.elements.sprintDateInput.addEventListener('change', () => {
                if (this.state.currentView === 'sprint') {
                    this.handleViewChange();
                }
            });
        }

        // Eventos globales
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Eventos de ventana
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Configura navegación por teclado
     */
    setupKeyboardNavigation() {
        // Atajos de teclado
        const shortcuts = {
            'Ctrl+N': () => this.handleAddTask(),
            'Ctrl+S': () => this.handleSave(),
            'Ctrl+O': () => this.handleLoad(),
            'Ctrl+K': () => this.toggleCustomization(),
            'Escape': () => this.closeCustomization()
        };

        document.addEventListener('keydown', (e) => {
            const key = e.ctrlKey ? `Ctrl+${e.key.toUpperCase()}` : e.key;
            if (shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        });
    }

    /**
     * Inicializa el estado del componente
     */
    initializeState() {
        // Establece vista por defecto
        this.setActiveView(this.state.currentView);
        if (this.elements.viewSelect) {
            this.elements.viewSelect.value = this.state.currentView;
        }
        this.toggleSprintDateInput(this.state.currentView === 'sprint');

        // Oculta panel de personalización
        this.closeCustomization();

        // Establece estados iniciales de botones
        this.updateButtonStates();
    }

    /**
     * Maneja clic en Agregar Tarea/Proyecto
     */
    async handleAddTask(event) {
        try {
            this.setButtonLoading(this.elements.addTaskBtn, true);

            if (this.callbacks.onAddTask) {
                await this.callbacks.onAddTask();
            } else {
                this.showNotification('Abriendo ventana de gestión de tareas...', 'info');
            }
        } catch (error) {
            this.handleError('Error al abrir ventana de tareas', error);
        } finally {
            this.setButtonLoading(this.elements.addTaskBtn, false);
        }
    }

    /**
     * Maneja clic en Guardar Diagrama
     */
    async handleSave(event) {
        try {
            this.setButtonLoading(this.elements.saveBtn, true);

            if (this.callbacks.onSave) {
                const result = await this.callbacks.onSave();

                if (result.success) {
                    this.state.hasUnsavedChanges = false;
                    this.updateButtonStates();
                    this.showNotification('Diagrama guardado correctamente', 'success');
                } else {
                    throw new Error(result.error || 'Error desconocido al guardar');
                }
            } else {
                // Funcionalidad temporal
                this.downloadSampleJSON();
                this.showNotification('Archivo JSON de ejemplo descargado', 'info');
            }
        } catch (error) {
            this.handleError('Error al guardar diagrama', error);
        } finally {
            this.setButtonLoading(this.elements.saveBtn, false);
        }
    }

    /**
     * Maneja clic en Cargar Diagrama
     */
    handleLoad(event) {
        try {
            // Abre el selector de archivos
            this.elements.fileInput.click();
        } catch (error) {
            this.handleError('Error al abrir selector de archivos', error);
        }
    }

    /**
     * Maneja selección de archivo
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            this.setButtonLoading(this.elements.loadBtn, true);

            // Validar archivo
            this.validateFile(file);

            // Leer archivo
            const content = await this.readFile(file);
            const data = JSON.parse(content);

            if (this.callbacks.onLoad) {
                const result = await this.callbacks.onLoad(data);

                if (result.success) {
                    this.state.hasUnsavedChanges = false;
                    this.updateButtonStates();
                    this.showNotification(`Diagrama "${file.name}" cargado correctamente`, 'success');
                } else {
                    throw new Error(result.error || 'Error al procesar archivo');
                }
            } else {
                this.showNotification('Función de carga no implementada aún', 'warning');
            }
        } catch (error) {
            this.handleError('Error al cargar archivo', error);
        } finally {
            this.setButtonLoading(this.elements.loadBtn, false);
            // Limpiar input
            this.elements.fileInput.value = '';
        }
    }

    /**
     * Maneja cambio de vista
     */
    async handleViewChange() {
        const viewType = this.elements.viewSelect ? this.elements.viewSelect.value : null;
        if (!viewType) return;

        const sprintStartDate = viewType === 'sprint' && this.elements.sprintDateInput
            ? this.elements.sprintDateInput.value || new Date().toISOString().split('T')[0]
            : null;

        if (viewType === this.state.currentView && viewType !== 'sprint') {
            return;
        }

        try {
            if (this.callbacks.onViewChange) {
                const result = await this.callbacks.onViewChange(viewType, sprintStartDate);

                if (result.success) {
                    this.setActiveView(viewType);
                    this.showNotification(`Vista cambiada a ${this.getViewDisplayName(viewType)}`, 'success');
                } else {
                    throw new Error(result.error || 'Error al cambiar vista');
                }
            } else {
                this.setActiveView(viewType);
                this.showNotification(`Vista cambiada a ${this.getViewDisplayName(viewType)}`, 'info');
            }
        } catch (error) {
            this.handleError('Error al cambiar vista', error);
        }
    }

    /**
     * Alterna panel de personalización
     */
    toggleCustomization(event) {
        if (this.state.isCustomizationOpen) {
            this.closeCustomization();
        } else {
            this.openCustomization();
        }
    }

    /**
     * Abre panel de personalización
     */
    openCustomization() {
        this.state.isCustomizationOpen = true;
        this.elements.customizationPanel.hidden = false;
        this.elements.customizeBtn.setAttribute('aria-expanded', 'true');

        // Focus en el panel para accesibilidad
        setTimeout(() => {
            this.elements.closePanel.focus();
        }, 100);

        this.showNotification('Panel de personalización abierto', 'info');
    }

    /**
     * Cierra panel de personalización
     */
    closeCustomization() {
        this.state.isCustomizationOpen = false;
        this.elements.customizationPanel.hidden = true;
        this.elements.customizeBtn.setAttribute('aria-expanded', 'false');

        // Retornar focus al botón
        this.elements.customizeBtn.focus();
    }

    /**
     * Maneja clics fuera del panel
     */
    handleOutsideClick(event) {
        if (this.state.isCustomizationOpen &&
            !this.elements.customizationPanel.contains(event.target) &&
            !this.elements.customizeBtn.contains(event.target)) {
            this.closeCustomization();
        }
    }

    /**
     * Maneja teclas globales
     */
    handleKeyDown(event) {
        if (event.key === 'Escape' && this.state.isCustomizationOpen) {
            this.closeCustomization();
        }
    }

    /**
     * Maneja evento antes de cerrar ventana
     */
    handleBeforeUnload(event) {
        if (this.state.hasUnsavedChanges) {
            event.preventDefault();
            event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
            return event.returnValue;
        }
    }

    /**
     * Maneja redimensionamiento de ventana
     */
    handleResize() {
        // Cerrar panel en móvil si está abierto
        if (window.innerWidth <= 767 && this.state.isCustomizationOpen) {
            this.closeCustomization();
        }
    }

    /**
     * Establece vista activa
     */
    setActiveView(viewType) {
        this.state.currentView = viewType;
        this.toggleSprintDateInput(viewType === 'sprint');
        if (this.elements.viewSelect) {
            this.elements.viewSelect.value = viewType;
        }
    }

    /**
     * Muestra u oculta el campo de fecha para sprint
     */
    toggleSprintDateInput(show) {
        if (!this.elements.sprintDateInput) return;
        if (show) {
            if (!this.elements.sprintDateInput.value) {
                this.elements.sprintDateInput.value = new Date().toISOString().split('T')[0];
            }
            this.elements.sprintDateInput.hidden = false;
        } else {
            this.elements.sprintDateInput.hidden = true;
        }
    }

    /**
     * Actualiza estados de botones
     */
    updateButtonStates() {
        // Botón guardar - habilitado si hay cambios
        this.elements.saveBtn.disabled = !this.state.hasUnsavedChanges;

        // Indicador visual de cambios
        if (this.state.hasUnsavedChanges) {
            this.elements.saveBtn.classList.add('has-changes');
        } else {
            this.elements.saveBtn.classList.remove('has-changes');
        }
    }

    /**
     * Establece estado de carga en botón
     */
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    /**
     * Valida archivo seleccionado
     */
    validateFile(file) {
        // Verificar tipo
        if (!file.name.toLowerCase().endsWith('.json')) {
            throw new Error('Solo se permiten archivos JSON');
        }

        // Verificar tamaño
        if (file.size > this.config.fileTypes.maxSize) {
            throw new Error(`El archivo es demasiado grande. Máximo: ${this.config.fileTypes.maxSize / 1024 / 1024}MB`);
        }
    }

    /**
     * Lee archivo como texto
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Error al leer archivo'));
            reader.readAsText(file);
        });
    }

    /**
     * Obtiene nombre de vista para mostrar
     */
    getViewDisplayName(viewType) {
        const names = {
            daily: 'Diaria',
            weekly: 'Semanal',
            monthly: 'Mensual',
            sprint: 'Sprint'
        };
        return names[viewType] || viewType;
    }

    /**
     * Descarga JSON de ejemplo (funcionalidad temporal)
     */
    downloadSampleJSON() {
        const sampleData = {
            version: "1.0.0",
            created: new Date().toISOString(),
            projects: [],
            settings: {
                colors: {
                    background: "#FFFFFF",
                    headers: "#2196F3",
                    borders: "#E0E0E0"
                },
                fonts: {
                    headers: { family: "Arial", size: 14 },
                    tasks: { family: "Arial", size: 12 }
                }
            }
        };

        const blob = new Blob([JSON.stringify(sampleData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagrama-gantt-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Muestra notificación
     */
    showNotification(message, type = 'info') {
        // Se implementará con el sistema de notificaciones
        console.log(`[${type.toUpperCase()}] ${message}`);

        // TODO: Integrar con NotificationManager cuando esté disponible
    }

    /**
     * Maneja errores
     */
    handleError(context, error) {
        console.error(`${context}:`, error);
        this.showNotification(`${context}: ${error.message}`, 'error');
    }

    /**
     * Configura callbacks desde la aplicación principal
     */
    setCallbacks(callbacks) {
        this.callbacks = {...this.callbacks, ...callbacks };
    }

    /**
     * Obtiene estado actual
     */
    getState() {
        return {...this.state };
    }

    /**
     * Destruye el componente
     */
    destroy() {
        // Remover event listeners
        // TODO: Implementar cleanup completo
        console.log('Toolbar destruido');
    }
}

export default Toolbar;