// slider-library.js

class Slider {
    constructor(selector, options = {}) {
        // Configuración por defecto
        this.defaults = {
            images: [],
            autoplay: true,
            delay: 5000,
            transitionDuration: 500,
            arrowSize: 50,
            arrowMargin: 20,
            pagination: true
        };

        // Combinar opciones proporcionadas con los defaults
        this.config = { ...this.defaults, ...options };
        this.container = document.querySelector(selector);
        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.userInteracted = false;
        this.interactionTimeout = null;

        // Inicializar el slider
        this.init();
    }

    init() {
        // Verificar que el contenedor exista
        if (!this.container) {
            console.error('Slider container not found');
            return;
        }

        // Verificar que hay imágenes
        if (this.config.images.length === 0) {
            console.error('No images provided for the slider');
            return;
        }

        this.container.classList.add('aele__slider-container');

        // Crear estructura HTML
        this.createStructure();

        // Configurar eventos
        this.setupEventListeners();

        // Iniciar autoplay si está configurado
        if (this.config.autoplay) {
            this.startAutoplay();
        }
    }

    createStructure() {
        // Limpiar contenedor
        this.container.innerHTML = '';

        // Crear wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'aele__slider-wrapper';
        this.container.appendChild(wrapper);

        // Crear slides
        this.config.images.forEach((img, index) => {
            const slide = document.createElement('div');
            slide.className = `aele__slider-item ${index === 0 ? 'active' : ''}`;
            slide.dataset.index = index;
            slide.setAttribute('aria-hidden', index !== 0);

            const imgElement = document.createElement('img');
            imgElement.src = img;
            imgElement.alt = `Slide ${index + 1}`;
            imgElement.loading = 'lazy';

            slide.appendChild(imgElement);
            wrapper.appendChild(slide);
        });

        // Crear flechas de navegación
        const prevArrow = document.createElement('div');
        prevArrow.className = 'aele__slider-arrow aele__prev';
        prevArrow.style.width = `${this.config.arrowSize}px`;
        prevArrow.style.height = `${this.config.arrowSize}px`;
        prevArrow.innerHTML = `<span style="font-size: ${this.config.arrowSize / 2.5}px;">&lsaquo;</span>`;
        prevArrow.setAttribute('aria-label', 'Previous slide');
        wrapper.appendChild(prevArrow);

        const nextArrow = document.createElement('div');
        nextArrow.className = 'aele__slider-arrow aele__next';
        nextArrow.innerHTML = `<span style="font-size: ${this.config.arrowSize / 2.5}px;">&rsaquo;</span>`;
        nextArrow.style.width = `${this.config.arrowSize}px`;
        nextArrow.style.height = `${this.config.arrowSize}px`;
        nextArrow.setAttribute('aria-label', 'Next slide');
        wrapper.appendChild(nextArrow);

        // Crear paginación si está habilitada
        if (this.config.pagination) {
            const pagination = document.createElement('div');
            pagination.className = 'aele__slider-pagination';

            this.config.images.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = `aele__slider-dot ${index === 0 ? 'active' : ''}`;
                dot.dataset.index = index;
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                pagination.appendChild(dot);
            });

            wrapper.appendChild(pagination);
        }

        // Guardar referencias a los elementos
        this.wrapper = wrapper;
        this.slides = this.container.querySelectorAll('.aele__slider-item');
        this.prevArrow = this.container.querySelector('.aele__prev');
        this.nextArrow = this.container.querySelector('.aele__next');
        this.dots = this.container.querySelectorAll('.aele__slider-dot');
    }

    setupEventListeners() {
        // Eventos para flechas
        if (this.prevArrow) {
            this.prevArrow.addEventListener('click', () => this.prev());
        }

        if (this.nextArrow) {
            this.nextArrow.addEventListener('click', () => this.next());
        }

        // Eventos para dots de paginación
        if (this.dots) {
            this.dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const index = parseInt(dot.dataset.index);
                    this.goTo(index);
                });
            });
        }

        // Pausar autoplay al hacer hover
        this.container.addEventListener('mouseenter', () => this.pause());
        this.container.addEventListener('mouseleave', () => {
            if (!this.userInteracted) this.startAutoplay();
        });


    }

    updateSlide(index) {
        // Validar índice
        if (index < 0) index = this.slides.length - 1;
        if (index >= this.slides.length) index = 0;

        // Actualizar slides
        this.slides.forEach((slide, i) => {
            const isActive = i === index;
            slide.classList.toggle('active', isActive);
            slide.setAttribute('aria-hidden', !isActive);
        });

        // Actualizar paginación
        if (this.dots) {
            this.dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        // Actualizar índice actual
        this.currentIndex = index;
    }

    next() {
        this.updateSlide(this.currentIndex + 1);
        this.handleUserInteraction();
    }

    prev() {
        this.updateSlide(this.currentIndex - 1);
        this.handleUserInteraction();
    }

    goTo(index) {
        this.updateSlide(index);
        this.handleUserInteraction();
    }

    startAutoplay() {
        this.pause(); // Limpiar cualquier intervalo existente
        this.autoplayInterval = setInterval(() => {
            if (!this.userInteracted) this.next();
        }, this.config.delay);
    }

    pause() {
        clearInterval(this.autoplayInterval);
    }

    handleUserInteraction() {
        this.userInteracted = true;
        this.pause();

        clearTimeout(this.interactionTimeout);
        this.interactionTimeout = setTimeout(() => {
            this.userInteracted = false;
            if (this.config.autoplay) this.startAutoplay();
        }, this.config.delay * 2);
    }

    destroy() {
        this.pause();
        this.container.innerHTML = '';
    }
}