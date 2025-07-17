/**
 * TaskTableModal Component - Gestión de Tabla de Tareas en Modal
 * 
 * @description Componente especializado para la gestión CRUD de tareas dentro del modal
 * @author DiagramaGanttCustom Team
 * @version 1.0.0
 */

import Modal from './Modal.js';

class TaskTableModal {
    constructor(options = {}) {
        // Configuración
        this.config = {
            maxTasks: options.maxTasks || 100,
            defaultColor: options.defaultColor || '#4CAF50',
            validateDates: options.validateDates !== false,
            autoSave: options.autoSave !== false,
            ...options
        };

        // Estado
        this.state = {
            tasks: [],
            isModified: false,
            validationErrors: {},
            headers: {
                proyecto: 'Proyecto',
                tarea: 'Tarea'
            },
            // Estado inicial para comparar cambios
            initialState: {
                tasks: [],
                headers: {
                    proyecto: 'Proyecto',
                    tarea: 'Tarea'
                }
            }
        };

        // Callbacks
        this.callbacks = {
            onTaskAdd: options.onTaskAdd || null,
            onTaskDelete: options.onTaskDelete || null,
            onTaskUpdate: options.onTaskUpdate || null,
            onGenerate: options.onGenerate || null,
            onCancel: options.onCancel || null,
            onTemporaryChange: options.onTemporaryChange || null
        };

        // Crear modal
        this.modal = new Modal({
            id: 'task-table-modal',
            title: 'Gestión de Tareas y Proyectos',
            titleIcon: '📋',
            size: 'large',
            closable: true,
            keyboard: true,
            focus: true,
            onClose: this.handleModalClose.bind(this)
        });

        this.init();
    }

    /**
     * Inicializa el componente
     */
    init() {
        try {
            this.createModalContent();
            this.setupFooterButtons();
            console.log('✅ TaskTableModal inicializado');
        } catch (error) {
            this.handleError('Error al inicializar TaskTableModal', error);
        }
    }

    /**
     * Crea el contenido del modal
     */
    createModalContent() {
        const content = document.createElement('div');
        content.innerHTML = `
            <!-- Botón Agregar Elemento -->
            <button 
                id="add-element-btn" 
                class="add-element-btn"
                type="button"
                aria-label="Agregar nueva tarea">
                <span>➕</span>
                Agregar Elemento
            </button>

            <!-- Contenedor de la Tabla -->
            <div class="task-table-container">
                <table class="task-table" role="table" aria-label="Tabla de tareas y proyectos">
                    <thead class="task-table-header">
                        <tr role="row">
                            <th scope="col" id="header-proyecto">Proyecto</th>
                            <th scope="col" id="header-tarea">Tarea</th>
                            <th scope="col">Fecha Inicio</th>
                            <th scope="col">Fecha Fin</th>
                            <th scope="col">Color</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="task-table-body" id="task-table-body">
                        <!-- Las filas se generarán dinámicamente -->
                    </tbody>
                </table>
            </div>

            <!-- Estado Vacío (inicial) -->
            <div id="empty-state" class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p class="empty-state-text">No hay tareas agregadas</p>
                <p class="empty-state-subtext">Usa el botón "Agregar Elemento" para comenzar</p>
            </div>
        `;

        this.modal.setBody(content);
        this.setupEditableHeaders();
        this.setupEventListeners();
        this.updateEmptyState();
    }

    /**
     * Configura los botones del footer
     */
    setupFooterButtons() {
        const buttons = [{
                text: 'Cancelar',
                type: 'tertiary',
                position: 'left',
                icon: '❌',
                onClick: this.handleCancel.bind(this),
                ariaLabel: 'Cancelar y cerrar modal'
            },
            {
                text: 'Generar Diagrama',
                type: 'primary',
                position: 'right',
                icon: '🚀',
                onClick: this.handleGenerate.bind(this),
                ariaLabel: 'Generar diagrama con las tareas configuradas'
            }
        ];

        this.modal.addFooterButtons(buttons);
    }

    /**
     * Configura los encabezados editables
     */
    setupEditableHeaders() {
        const proyectoHeader = this.modal.getElements().body.querySelector('#header-proyecto');
        const tareaHeader = this.modal.getElements().body.querySelector('#header-tarea');

        // Convertir encabezados a editables
        this.makeHeaderEditable(proyectoHeader, 'proyecto', this.state.headers.proyecto);
        this.makeHeaderEditable(tareaHeader, 'tarea', this.state.headers.tarea);
    }

    /**
     * Convierte un header en editable
     */
    makeHeaderEditable(headerElement, headerType, initialValue) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'header-input';
        input.value = initialValue;
        input.setAttribute('data-header', headerType);
        input.setAttribute('aria-label', `Nombre del encabezado de ${headerType}`);
        input.setAttribute('placeholder', initialValue);

        // Event listener para actualizar estado
        input.addEventListener('input', (e) => {
            this.updateHeader(headerType, e.target.value);
        });

        input.addEventListener('blur', (e) => {
            // Si queda vacío, restaurar valor por defecto
            if (!e.target.value.trim()) {
                const defaultValue = headerType === 'proyecto' ? 'Proyecto' : 'Tarea';
                e.target.value = defaultValue;
                this.updateHeader(headerType, defaultValue);
            }
        });

        // Reemplazar contenido del header
        headerElement.innerHTML = '';
        headerElement.appendChild(input);
    }

    /**
     * Actualiza el valor de un header
     */
    updateHeader(headerType, value) {
        this.state.headers[headerType] = value.trim() || (headerType === 'proyecto' ? 'Proyecto' : 'Tarea');
        this.state.isModified = true;

        // Notificar cambios temporales
        this.notifyTemporaryChanges();

        console.log(`📝 Header ${headerType} actualizado:`, this.state.headers[headerType]);
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botón agregar elemento
        const addBtn = this.modal.getElements().body.querySelector('#add-element-btn');
        addBtn.addEventListener('click', this.addTask.bind(this));
    }

    /**
     * Abre el modal
     */
    async open(initialTasks = [], initialHeaders = null) {
        try {
            // Cargar tareas iniciales
            this.state.tasks = [...initialTasks];

            // Cargar headers iniciales si se proporcionan
            if (initialHeaders) {
                this.state.headers = {...initialHeaders };
                // Actualizar los headers editables con los valores cargados
                setTimeout(() => {
                    const proyectoInput = this.modal.getElements().body.querySelector('input[data-header="proyecto"]');
                    const tareaInput = this.modal.getElements().body.querySelector('input[data-header="tarea"]');

                    if (proyectoInput) proyectoInput.value = this.state.headers.proyecto;
                    if (tareaInput) tareaInput.value = this.state.headers.tarea;
                }, 50);
            }

            // Guardar estado inicial para comparar cambios
            this.state.initialState.tasks = [...initialTasks];
            this.state.initialState.headers = initialHeaders ? {...initialHeaders } : {...this.state.headers };

            this.renderTasks();

            // Abrir modal
            await this.modal.open();

            // Focus en botón agregar
            setTimeout(() => {
                const addBtn = this.modal.getElements().body.querySelector('#add-element-btn');
                if (addBtn) addBtn.focus();
            }, 100);

        } catch (error) {
            this.handleError('Error al abrir modal', error);
        }
    }

    /**
     * Cierra el modal
     */
    async close() {
        await this.modal.close();
    }

    /**
     * Agrega una nueva tarea
     */
    addTask() {
        try {
            const isFirstTask = this.state.tasks.length === 0;
            const newTask = this.createNewTask();
            this.state.tasks.push(newTask);
            this.state.isModified = true;

            this.renderTasks();
            this.updateEmptyState();
            this.notifyTemporaryChanges();

            // Focus en el primer input de la nueva fila
            setTimeout(() => {
                const newRow = this.modal.getElements().body.querySelector(`[data-task-id="${newTask.id}"]`);
                if (newRow) {
                    const firstInput = newRow.querySelector('input');
                    if (firstInput) firstInput.focus();
                }
            }, 100);

            // Callback
            if (this.callbacks.onTaskAdd) {
                this.callbacks.onTaskAdd(newTask);
            }

            if (isFirstTask) {
                console.log('🎉 Primera tarea agregada - tabla inicializada:', newTask.id);
            } else {
                console.log('➕ Nueva tarea agregada:', newTask.id);
            }

        } catch (error) {
            this.handleError('Error al agregar tarea', error);
        }
    }

    /**
     * Crea una nueva tarea con valores por defecto
     */
    createNewTask() {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        return {
            id: this.generateTaskId(),
            proyecto: '',
            tarea: '',
            fechaInicio: today,
            fechaFin: nextWeek,
            color: this.config.defaultColor
        };
    }

    /**
     * Elimina una tarea
     */
    deleteTask(taskId) {
        try {
            const taskIndex = this.state.tasks.findIndex(task => task.id === taskId);
            if (taskIndex === -1) return;

            const task = this.state.tasks[taskIndex];

            // Confirmar eliminación
            if (task.proyecto || task.tarea) {
                if (!confirm(`¿Estás seguro de eliminar la tarea "${task.tarea || 'Sin nombre'}"?`)) {
                    return;
                }
            }

            this.state.tasks.splice(taskIndex, 1);
            this.state.isModified = true;

            this.renderTasks();
            this.updateEmptyState();
            this.notifyTemporaryChanges();

            // Callback
            if (this.callbacks.onTaskDelete) {
                this.callbacks.onTaskDelete(task);
            }

            console.log('🗑️ Tarea eliminada:', taskId);

        } catch (error) {
            this.handleError('Error al eliminar tarea', error);
        }
    }

    /**
     * Actualiza una tarea
     */
    updateTask(taskId, field, value) {
        try {
            const task = this.state.tasks.find(t => t.id === taskId);
            if (!task) return;

            const oldValue = task[field];
            task[field] = value;
            this.state.isModified = true;

            // Validar el campo actualizado
            this.validateTask(task);

            // Notificar cambios temporales
            this.notifyTemporaryChanges();

            // Callback
            if (this.callbacks.onTaskUpdate) {
                this.callbacks.onTaskUpdate(task, field, oldValue, value);
            }

            console.log(`📝 Tarea ${taskId} actualizada: ${field} = ${value}`);

        } catch (error) {
            this.handleError('Error al actualizar tarea', error);
        }
    }

    /**
     * Renderiza todas las tareas
     */
    renderTasks() {
        const tbody = this.modal.getElements().body.querySelector('#task-table-body');
        tbody.innerHTML = '';

        this.state.tasks.forEach(task => {
            const row = this.createTaskRow(task);
            tbody.appendChild(row);
        });

        // Reconfigurar focus trap y scroll
        if (this.modal.state.isOpen) {
            this.modal.setupFocusTrap();
            this.modal.setupModalBodyScroll();
        }
    }

    /**
     * Crea una fila de tarea
     */
    createTaskRow(task) {
        const row = document.createElement('tr');
        row.setAttribute('data-task-id', task.id);
        row.setAttribute('role', 'row');

        const errorClass = this.state.validationErrors[task.id] ? 'has-error' : '';

        row.innerHTML = `
            <td role="gridcell">
                <input 
                    type="text" 
                    class="task-input ${errorClass}"
                    value="${this.escapeHtml(task.proyecto)}"
                    placeholder="Nombre del proyecto"
                    data-field="proyecto"
                    aria-label="Nombre del proyecto"
                    required>
            </td>
            <td role="gridcell">
                <input 
                    type="text" 
                    class="task-input ${errorClass}"
                    value="${this.escapeHtml(task.tarea)}"
                    placeholder="Nombre de la tarea"
                    data-field="tarea"
                    aria-label="Nombre de la tarea"
                    required>
            </td>
            <td role="gridcell">
                <input 
                    type="date" 
                    class="task-input ${errorClass}"
                    value="${task.fechaInicio}"
                    data-field="fechaInicio"
                    aria-label="Fecha de inicio"
                    required>
            </td>
            <td role="gridcell">
                <input 
                    type="date" 
                    class="task-input ${errorClass}"
                    value="${task.fechaFin}"
                    data-field="fechaFin"
                    aria-label="Fecha de fin"
                    required>
            </td>
            <td role="gridcell">
                <div class="color-selector">
                    <div class="color-preview" style="background-color: ${task.color}">
                        <input 
                            type="color" 
                            class="color-input"
                            value="${task.color}"
                            data-field="color"
                            aria-label="Color de la tarea">
                    </div>
                    <input 
                        type="text" 
                        class="color-text"
                        value="${task.color.toUpperCase()}"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        placeholder="#4CAF50"
                        data-field="color"
                        aria-label="Código hexadecimal del color">
                </div>
            </td>
            <td role="gridcell">
                <button 
                    type="button" 
                    class="delete-row-btn"
                    data-task-id="${task.id}"
                    aria-label="Eliminar tarea">
                    🗑️
                </button>
            </td>
        `;

        // Agregar event listeners a los inputs
        this.attachRowEventListeners(row, task);

        return row;
    }

    /**
     * Adjunta event listeners a una fila
     */
    attachRowEventListeners(row, task) {
        // Inputs de texto y fecha
        const inputs = row.querySelectorAll('.task-input');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.updateTask(task.id, e.target.dataset.field, e.target.value);
            });

            input.addEventListener('blur', (e) => {
                this.validateField(task, e.target.dataset.field, e.target.value);
            });
        });

        // Color picker
        const colorInput = row.querySelector('.color-input');
        colorInput.addEventListener('change', (e) => {
            this.updateTaskColor(task.id, e.target.value);
        });

        // Color text input
        const colorText = row.querySelector('.color-text');
        colorText.addEventListener('input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                this.updateTaskColor(task.id, color);
            }
        });

        // Botón eliminar
        const deleteBtn = row.querySelector('.delete-row-btn');
        deleteBtn.addEventListener('click', () => {
            this.deleteTask(task.id);
        });
    }

    /**
     * Actualiza el color de una tarea
     */
    updateTaskColor(taskId, color) {
        try {
            // Validar formato hexadecimal
            if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
                throw new Error('Formato de color inválido');
            }

            this.updateTask(taskId, 'color', color);

            // Actualizar preview visual
            const row = this.modal.getElements().body.querySelector(`[data-task-id="${taskId}"]`);
            if (row) {
                const preview = row.querySelector('.color-preview');
                const textInput = row.querySelector('.color-text');
                const colorInput = row.querySelector('.color-input');

                preview.style.backgroundColor = color;
                textInput.value = color.toUpperCase();
                colorInput.value = color;
            }

        } catch (error) {
            this.handleError('Error al actualizar color', error);
        }
    }

    /**
     * Valida una tarea completa
     */
    validateTask(task) {
        const errors = [];

        // Validar campos requeridos
        if (!task.proyecto.trim()) {
            errors.push('El nombre del proyecto es requerido');
        }

        if (!task.tarea.trim()) {
            errors.push('El nombre de la tarea es requerido');
        }

        // Validar fechas
        if (this.config.validateDates) {
            const startDate = new Date(task.fechaInicio);
            const endDate = new Date(task.fechaFin);

            if (endDate <= startDate) {
                errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
            }
        }

        // Validar color
        if (!/^#[0-9A-Fa-f]{6}$/.test(task.color)) {
            errors.push('El color debe ser un código hexadecimal válido');
        }

        // Actualizar errores
        if (errors.length > 0) {
            this.state.validationErrors[task.id] = errors;
        } else {
            delete this.state.validationErrors[task.id];
        }

        return errors.length === 0;
    }

    /**
     * Valida un campo específico
     */
    validateField(task, field, value) {
        const input = this.modal.getElements().body.querySelector(
            `[data-task-id="${task.id}"] input[data-field="${field}"]`
        );

        let isValid = true;

        switch (field) {
            case 'proyecto':
            case 'tarea':
                isValid = value.trim().length > 0;
                break;

            case 'fechaInicio':
            case 'fechaFin':
                if (this.config.validateDates && field === 'fechaFin') {
                    const startDate = new Date(task.fechaInicio);
                    const endDate = new Date(value);
                    isValid = endDate > startDate;
                }
                break;

            case 'color':
                isValid = /^#[0-9A-Fa-f]{6}$/.test(value);
                break;
        }

        // Actualizar clase de error
        if (input) {
            input.classList.toggle('error', !isValid);
        }

        return isValid;
    }

    /**
     * Actualiza el estado vacío
     */
    updateEmptyState() {
        const emptyState = this.modal.getElements().body.querySelector('#empty-state');
        const tableContainer = this.modal.getElements().body.querySelector('.task-table-container');

        if (this.state.tasks.length === 0) {
            emptyState.style.display = 'block';
            tableContainer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            tableContainer.style.display = 'block';
        }
    }

    /**
     * Maneja el botón Cancelar
     */
    async handleCancel() {
        try {
            let shouldClose = true;

            // Solo confirmar si hay cambios reales vs el estado inicial
            if (this.hasRealChanges()) {
                shouldClose = confirm('¿Estás seguro de cancelar? Se perderán los cambios realizados.');
            }

            if (shouldClose) {
                // Callback
                if (this.callbacks.onCancel) {
                    await this.callbacks.onCancel();
                }

                await this.close();
            }

        } catch (error) {
            this.handleError('Error al cancelar', error);
        }
    }

    /**
     * Maneja el botón Generar Diagrama
     */
    async handleGenerate() {
        try {
            // Validar todas las tareas
            const hasErrors = this.validateAllTasks();

            if (hasErrors) {
                alert('Por favor, corrige los errores en las tareas antes de generar el diagrama.');
                return;
            }

            if (this.state.tasks.length === 0) {
                alert('Agrega al menos una tarea antes de generar el diagrama.');
                return;
            }

            // Callback
            if (this.callbacks.onGenerate) {
                const completeData = this.getCompleteData();
                const result = await this.callbacks.onGenerate(completeData.tasks, completeData.headers);

                if (result !== false) {
                    await this.close();
                }
            } else {
                console.log('🚀 Generar diagrama:', this.state.tasks);
                console.log('📋 Headers:', this.state.headers);
                alert('Función de generar diagrama no implementada aún');
            }

        } catch (error) {
            this.handleError('Error al generar diagrama', error);
        }
    }

    /**
     * Valida todas las tareas
     */
    validateAllTasks() {
        let hasErrors = false;

        this.state.tasks.forEach(task => {
            if (!this.validateTask(task)) {
                hasErrors = true;
            }
        });

        // Re-renderizar para mostrar errores
        if (hasErrors) {
            this.renderTasks();
        }

        return hasErrors;
    }

    /**
     * Maneja cierre del modal
     */
    async handleModalClose() {
        if (this.hasRealChanges()) {
            const shouldClose = confirm('¿Estás seguro de cerrar? Se perderán los cambios realizados.');
            return shouldClose;
        }
        return true;
    }

    /**
     * Genera ID único para tarea
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Obtiene las tareas actuales
     */
    getTasks() {
        return [...this.state.tasks];
    }

    /**
     * Obtiene los datos completos (tareas + headers)
     */
    getCompleteData() {
        return {
            tasks: [...this.state.tasks],
            headers: {...this.state.headers }
        };
    }

    /**
     * Establece las tareas
     */
    setTasks(tasks) {
        this.state.tasks = [...tasks];
        this.renderTasks();
        this.updateEmptyState();
        this.state.isModified = false;
    }

    /**
     * Detecta si hay cambios reales comparando con el estado inicial
     */
    hasRealChanges() {
        // Comparar headers
        if (this.state.headers.proyecto !== this.state.initialState.headers.proyecto ||
            this.state.headers.tarea !== this.state.initialState.headers.tarea) {
            return true;
        }

        // Comparar número de tareas
        if (this.state.tasks.length !== this.state.initialState.tasks.length) {
            return true;
        }

        // Comparar cada tarea
        for (let i = 0; i < this.state.tasks.length; i++) {
            const current = this.state.tasks[i];
            const initial = this.state.initialState.tasks[i];

            if (!initial ||
                current.proyecto !== initial.proyecto ||
                current.tarea !== initial.tarea ||
                current.fechaInicio !== initial.fechaInicio ||
                current.fechaFin !== initial.fechaFin ||
                current.color !== initial.color) {
                return true;
            }
        }

        return false;
    }

    /**
     * Notifica cambios temporales a la aplicación principal
     */
    notifyTemporaryChanges() {
        if (this.callbacks.onTemporaryChange) {
            this.callbacks.onTemporaryChange(this.state.tasks, this.state.headers);
        }
    }

    /**
     * Maneja errores
     */
    handleError(context, error) {
        console.error(`${context}:`, error);
        alert(`${context}: ${error.message}`);
    }

    /**
     * Destruye el componente
     */
    destroy() {
        if (this.modal) {
            this.modal.destroy();
        }
        this.state = {};
        this.callbacks = {};
        console.log('🗑️ TaskTableModal destruido');
    }
}

export default TaskTableModal;
