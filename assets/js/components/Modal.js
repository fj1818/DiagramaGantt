/**
 * Modal Component - Sistema de Ventanas Emergentes
 * 
 * @description Componente modal reutilizable con accesibilidad completa
 * @author DiagramaGanttCustom Team
 * @version 1.0.0
 */

class Modal {
    constructor(options = {}) {
        // Configuración por defecto
        this.config = {
            id: options.id || `modal-${Date.now()}`,
            title: options.title || 'Modal',
            titleIcon: options.titleIcon || '📋',
            size: options.size || 'medium', // small, medium, large, full
            closable: options.closable !== false,
            backdrop: options.backdrop !== false,
            keyboard: options.keyboard !== false,
            focus: options.focus !== false,
            animation: options.animation !== false,
            zIndex: options.zIndex || 2000,
            ...options
        };

        // Estado del modal
        this.state = {
            isOpen: false,
            isLoading: false,
            focusedElementBeforeModal: null,
            focusableElements: []
        };

        // Callbacks
        this.callbacks = {
            onOpen: options.onOpen || null,
            onClose: options.onClose || null,
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null
        };

        // Referencias DOM
        this.elements = {
            overlay: null,
            modal: null,
            header: null,
            title: null,
            closeBtn: null,
            body: null,
            footer: null
        };

        this.init();
    }

    /**
     * Inicializa el modal
     */
    init() {
        try {
            this.createModal();
            this.attachEventListeners();
            this.setupAccessibility();
            console.log(`✅ Modal "${this.config.id}" inicializado`);
        } catch (error) {
            this.handleError('Error al inicializar modal', error);
        }
    }

    /**
     * Crea la estructura HTML del modal
     */
    createModal() {
        // Crear overlay
        this.elements.overlay = document.createElement('div');
        this.elements.overlay.className = 'modal-overlay';
        this.elements.overlay.id = `${this.config.id}-overlay`;
        this.elements.overlay.style.zIndex = this.config.zIndex;

        // Crear contenedor modal
        this.elements.modal = document.createElement('div');
        this.elements.modal.className = `modal modal-${this.config.size}`;
        this.elements.modal.setAttribute('role', 'dialog');
        this.elements.modal.setAttribute('aria-modal', 'true');
        this.elements.modal.setAttribute('aria-labelledby', `${this.config.id}-title`);

        // Crear header
        this.createHeader();

        // Crear body
        this.elements.body = document.createElement('div');
        this.elements.body.className = 'modal-body';
        this.elements.body.id = `${this.config.id}-body`;

        // Crear footer
        this.elements.footer = document.createElement('div');
        this.elements.footer.className = 'modal-footer';
        this.elements.footer.id = `${this.config.id}-footer`;

        // Ensamblar modal
        this.elements.modal.appendChild(this.elements.header);
        this.elements.modal.appendChild(this.elements.body);
        this.elements.modal.appendChild(this.elements.footer);
        this.elements.overlay.appendChild(this.elements.modal);

        // Agregar al DOM pero oculto
        document.body.appendChild(this.elements.overlay);
    }

    /**
     * Crea el header del modal
     */
    createHeader() {
        this.elements.header = document.createElement('div');
        this.elements.header.className = 'modal-header';

        // Título
        this.elements.title = document.createElement('h2');
        this.elements.title.className = 'modal-title';
        this.elements.title.id = `${this.config.id}-title`;
        this.elements.title.innerHTML = `
            <span class="modal-title-icon">${this.config.titleIcon}</span>
            ${this.config.title}
        `;

        // Botón cerrar
        if (this.config.closable) {
            this.elements.closeBtn = document.createElement('button');
            this.elements.closeBtn.className = 'modal-close';
            this.elements.closeBtn.type = 'button';
            this.elements.closeBtn.innerHTML = '×';
            this.elements.closeBtn.setAttribute('aria-label', 'Cerrar modal');
        }

        this.elements.header.appendChild(this.elements.title);
        if (this.elements.closeBtn) {
            this.elements.header.appendChild(this.elements.closeBtn);
        }
    }

    /**
     * Adjunta event listeners
     */
    attachEventListeners() {
        // Botón cerrar
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }

        // Click en backdrop
        if (this.config.backdrop) {
            this.elements.overlay.addEventListener('click', (e) => {
                if (e.target === this.elements.overlay) {
                    this.close();
                }
            });
        }

        // Tecla Escape
        if (this.config.keyboard) {
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
        }

        // Prevenir scroll del body cuando modal está abierto, pero permitir scroll dentro del modal
        this.elements.overlay.addEventListener('wheel', (e) => {
            if (this.state.isOpen) {
                // Solo prevenir scroll si NO está dentro del modal-body
                const modalBody = this.elements.modal.querySelector('.modal-body');
                const isInsideModalBody = modalBody && modalBody.contains(e.target);

                if (!isInsideModalBody) {
                    e.preventDefault();
                }
            }
        }, { passive: false });

        // Configurar scroll handling para modal-body (se ejecutará cuando se abra el modal)
        this.setupModalBodyScroll = () => {
            const modalBody = this.elements.modal.querySelector('.modal-body');
            if (modalBody && !modalBody.hasAttribute('data-scroll-setup')) {
                // Forzar scroll behavior para el modal-body
                modalBody.style.overflowY = 'auto';
                modalBody.style.scrollBehavior = 'smooth';

                // Event listener específico para wheel en modal-body
                modalBody.addEventListener('wheel', (e) => {
                    // Permitir que el evento se propague normalmente dentro del modal-body
                    e.stopPropagation();
                }, { passive: true });

                // Marcar como configurado para evitar duplicados
                modalBody.setAttribute('data-scroll-setup', 'true');
                console.log('📜 Scroll configurado para modal-body');
            }
        };
    }

    /**
     * Configura accesibilidad
     */
    setupAccessibility() {
        // Configurar ARIA
        this.elements.modal.setAttribute('aria-describedby', `${this.config.id}-body`);

        // Si no es closable, remover botón cerrar del tab order
        if (!this.config.closable && this.elements.closeBtn) {
            this.elements.closeBtn.tabIndex = -1;
        }
    }

    /**
     * Abre el modal
     */
    async open() {
        try {
            if (this.state.isOpen) return;

            // Guardar elemento con foco actual
            this.state.focusedElementBeforeModal = document.activeElement;

            // Callback antes de abrir
            if (this.callbacks.onOpen) {
                const result = await this.callbacks.onOpen();
                if (result === false) return; // Cancelar apertura
            }

            // Mostrar modal
            this.elements.overlay.classList.add('active');
            this.state.isOpen = true;

            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';

            // Configurar scroll del modal-body
            this.setupModalBodyScroll();

            // Configurar focus trap
            if (this.config.focus) {
                this.setupFocusTrap();
                this.focusFirstElement();
            }

            // Configurar atributos ARIA
            this.elements.overlay.setAttribute('data-focus-trap', 'true');

            console.log(`🔍 Modal "${this.config.id}" abierto`);

        } catch (error) {
            this.handleError('Error al abrir modal', error);
        }
    }

    /**
     * Cierra el modal
     */
    async close() {
        try {
            if (!this.state.isOpen) return;

            // Callback antes de cerrar
            if (this.callbacks.onClose) {
                const result = await this.callbacks.onClose();
                if (result === false) return; // Cancelar cierre
            }

            // Ocultar modal
            this.elements.overlay.classList.remove('active');
            this.state.isOpen = false;

            // Restaurar scroll del body
            document.body.style.overflow = '';

            // Restaurar foco
            if (this.state.focusedElementBeforeModal && this.config.focus) {
                this.state.focusedElementBeforeModal.focus();
            }

            // Limpiar focus trap
            this.elements.overlay.removeAttribute('data-focus-trap');

            console.log(`🔒 Modal "${this.config.id}" cerrado`);

        } catch (error) {
            this.handleError('Error al cerrar modal', error);
        }
    }

    /**
     * Alterna estado del modal
     */
    toggle() {
        if (this.state.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Establece el contenido del body
     */
    setBody(content) {
        if (typeof content === 'string') {
            this.elements.body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.elements.body.innerHTML = '';
            this.elements.body.appendChild(content);
        } else {
            throw new Error('El contenido debe ser string o HTMLElement');
        }

        // Reconfigurar focus trap si está abierto
        if (this.state.isOpen && this.config.focus) {
            this.setupFocusTrap();
        }
    }

    /**
     * Establece el contenido del footer
     */
    setFooter(content) {
        if (typeof content === 'string') {
            this.elements.footer.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.elements.footer.innerHTML = '';
            this.elements.footer.appendChild(content);
        } else {
            throw new Error('El contenido debe ser string o HTMLElement');
        }

        // Reconfigurar focus trap si está abierto
        if (this.state.isOpen && this.config.focus) {
            this.setupFocusTrap();
        }
    }

    /**
     * Agrega botones al footer
     */
    addFooterButtons(buttons) {
        const leftContainer = document.createElement('div');
        leftContainer.className = 'modal-footer-left';

        const rightContainer = document.createElement('div');
        rightContainer.className = 'modal-footer-right';

        buttons.forEach(btn => {
            const button = this.createButton(btn);

            if (btn.position === 'left') {
                leftContainer.appendChild(button);
            } else {
                rightContainer.appendChild(button);
            }
        });

        this.elements.footer.innerHTML = '';
        this.elements.footer.appendChild(leftContainer);
        this.elements.footer.appendChild(rightContainer);

        // Reconfigurar focus trap si está abierto
        if (this.state.isOpen && this.config.focus) {
            this.setupFocusTrap();
        }
    }

    /**
     * Crea un botón para el modal
     */
    createButton(config) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `modal-btn modal-btn-${config.type || 'tertiary'}`;
        button.innerHTML = `${config.icon || ''} ${config.text || 'Botón'}`;

        if (config.id) button.id = config.id;
        if (config.disabled) button.disabled = true;
        if (config.ariaLabel) button.setAttribute('aria-label', config.ariaLabel);

        if (config.onClick) {
            button.addEventListener('click', config.onClick.bind(this));
        }

        return button;
    }

    /**
     * Configura focus trap
     */
    setupFocusTrap() {
        // Buscar elementos enfocables
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        this.state.focusableElements = Array.from(
            this.elements.modal.querySelectorAll(focusableSelectors)
        );
    }

    /**
     * Enfoca el primer elemento
     */
    focusFirstElement() {
        setTimeout(() => {
            if (this.state.focusableElements.length > 0) {
                this.state.focusableElements[0].focus();
            } else if (this.elements.closeBtn) {
                this.elements.closeBtn.focus();
            }
        }, 100);
    }

    /**
     * Maneja eventos de teclado
     */
    handleKeyDown(event) {
        if (!this.state.isOpen) return;

        switch (event.key) {
            case 'Escape':
                if (this.config.keyboard && this.config.closable) {
                    event.preventDefault();
                    this.close();
                }
                break;

            case 'Tab':
                if (this.config.focus) {
                    this.handleTabKey(event);
                }
                break;
        }
    }

    /**
     * Maneja navegación con Tab (focus trap)
     */
    handleTabKey(event) {
        if (this.state.focusableElements.length === 0) return;

        const firstElement = this.state.focusableElements[0];
        const lastElement = this.state.focusableElements[this.state.focusableElements.length - 1];

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Establece estado de carga
     */
    setLoading(isLoading, message = 'Cargando...') {
        this.state.isLoading = isLoading;

        if (isLoading) {
            // Deshabilitar botones
            const buttons = this.elements.modal.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.disabled = true;
                if (btn.classList.contains('modal-btn-primary')) {
                    btn.classList.add('loading');
                }
            });

            // Mostrar mensaje de carga
            const loadingDiv = document.createElement('div');
            loadingDiv.id = `${this.config.id}-loading`;
            loadingDiv.innerHTML = `
                <div style="text-align: center; padding: var(--spacing-md);">
                    <div class="loading-spinner" style="margin: 0 auto var(--spacing-sm);"></div>
                    <p>${message}</p>
                </div>
            `;
            this.elements.body.appendChild(loadingDiv);
        } else {
            // Habilitar botones
            const buttons = this.elements.modal.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('loading');
            });

            // Remover mensaje de carga
            const loadingDiv = document.getElementById(`${this.config.id}-loading`);
            if (loadingDiv) {
                loadingDiv.remove();
            }
        }
    }

    /**
     * Actualiza el título del modal
     */
    setTitle(title, icon = null) {
        this.config.title = title;
        if (icon) this.config.titleIcon = icon;

        this.elements.title.innerHTML = `
            <span class="modal-title-icon">${this.config.titleIcon}</span>
            ${this.config.title}
        `;
    }

    /**
     * Obtiene el estado actual
     */
    getState() {
        return {...this.state };
    }

    /**
     * Obtiene referencias a elementos DOM
     */
    getElements() {
        return {...this.elements };
    }

    /**
     * Maneja errores
     */
    handleError(context, error) {
        console.error(`${context}:`, error);

        // Mostrar error en el modal si está abierto
        if (this.state.isOpen) {
            this.setBody(`
                <div style="color: var(--error-color); text-align: center; padding: var(--spacing-lg);">
                    <h3>⚠️ Error</h3>
                    <p>${context}</p>
                    <p><small>${error.message}</small></p>
                </div>
            `);
        }
    }

    /**
     * Destruye el modal
     */
    destroy() {
        try {
            // Cerrar si está abierto
            if (this.state.isOpen) {
                this.close();
            }

            // Remover event listeners
            document.removeEventListener('keydown', this.handleKeyDown.bind(this));

            // Remover del DOM
            if (this.elements.overlay && this.elements.overlay.parentNode) {
                this.elements.overlay.parentNode.removeChild(this.elements.overlay);
            }

            // Limpiar referencias
            this.elements = {};
            this.state = {};
            this.callbacks = {};

            console.log(`🗑️ Modal "${this.config.id}" destruido`);

        } catch (error) {
            console.error('Error al destruir modal:', error);
        }
    }
}

export default Modal;