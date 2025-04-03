// slider-library.js

class Slider {

    constructor(selector, options = {}) {
        this.defaults = {
            images: [],
            autoplay: true,
            delay: 3000,
            transitionDuration: 1000,
            arrows: true,
            arrowSize: 50,
            arrowMargin: 20,
            pagination: true,

            slideSelector: '.aele__slider-item',
            imageSelector: 'img',
            userInteractionOver: true,
            paginationDots: 10,
        };

        this.config = { ...this.defaults, ...options };
        this.container = document.querySelector(selector);

        this.slides = [];
        this.autoplayInterval = null;
        this.interactionTimeout = null;
        this.currentIndex = 0;
        this.userInteracted = false;
        this.mouseIsOver = false;

        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Slider container not found');
            return;
        }

        const existingSlides = this.container.querySelectorAll(this.config.slideSelector) ?? [];

        if (existingSlides.length > 0) {
            this.slides = existingSlides;
            this.setupExistingSlides();
        }

        if (this.config.images && this.config.images.length > 0) {
            this.createSlidesFromArray();
        }

        if (this.slides.length === 0) {
            console.error('No slides or images provided for the slider');
            return;
        }



        this.container.classList.add('aele__slider-container');

        this.createNavigation();
        this.setupEventListeners();

        if (this.config.autoplay) {
            this.startAutoplay();
        }
    }

    setupExistingSlides() {
        this.slides.forEach((slide, index) => {
            slide.dataset.index = index;
            slide.classList.add('aele__slider-item');

            slide.style.transitionDuration = `${this.config.transitionDuration}ms`;

            slide.classList.toggle('active', index === 0);
            slide.setAttribute('aria-hidden', index !== 0);

            const img = slide.querySelector(this.config.imageSelector);
            if (img && !img.loading) img.loading = 'lazy';
        });
    }

    createSlidesFromArray() {
        const wrapper = document.createElement('div');
        wrapper.className = 'aele__slider-wrapper';

        const slides = this.config.images.map((img, i) => {
            const index = i + this.slides.length;

            const slide = document.createElement('div');
            slide.className = `aele__slider-item ${index === 0 ? 'active' : ''}`;
            slide.dataset.index = index;
            slide.setAttribute('aria-hidden', index !== 0);

            const imgElement = document.createElement('img');
            imgElement.src = img;
            imgElement.alt = `Slide ${index + 1}`;
            imgElement.loading = 'lazy';
            imgElement.className = 'aele__slider-image';

            slide.appendChild(imgElement);
            wrapper.appendChild(slide);
            return slide;
        });

        this.slides = [...this.slides, ...slides];

        this.container.appendChild(wrapper);
    }

    createNavigation() {
        if (this.config.arrows) {
            if (!this.container.querySelector('.aele__slider-arrow.aele__prev')) {
                this.prevArrow = document.createElement('div');
                this.prevArrow.style.width = `${this.config.arrowSize}px`;
                this.prevArrow.style.height = `${this.config.arrowSize}px`;
                this.prevArrow.className = 'aele__slider-arrow aele__prev';
                this.prevArrow.innerHTML = `<span style="font-size: ${this.config.arrowSize / 2.5}px;">&lsaquo;</span>`;
                this.container.appendChild(this.prevArrow);
            }

            if (!this.container.querySelector('.aele__slider-arrow.aele__next')) {
                this.nextArrow = document.createElement('div');
                this.nextArrow.style.width = `${this.config.arrowSize}px`;
                this.nextArrow.style.height = `${this.config.arrowSize}px`;
                this.nextArrow.className = 'aele__slider-arrow aele__next';
                this.nextArrow.innerHTML = `<span style="font-size: ${this.config.arrowSize / 2.5}px;">&rsaquo;</span>`;
                this.container.appendChild(this.nextArrow);
            }
        }

        if (this.config.pagination && !this.container.querySelector('.aele__slider-pagination')) {
            const pagination = document.createElement('div');
            pagination.className = 'aele__slider-pagination';

            Array.from(this.slides).forEach((_, index) => {
                if (index < this.config.paginationDots) {
                    const dot = document.createElement('div');
                    dot.className = `aele__slider-dot ${index === 0 ? 'active' : ''}`;
                    dot.dataset.index = index;
                    pagination.appendChild(dot);
                }
            });

            this.container.appendChild(pagination);
            this.dots = this.container.querySelectorAll('.aele__slider-dot');
        }
    }

    setupEventListeners() {
        if (this.prevArrow) {
            this.prevArrow.addEventListener('click', () => this.prev(true));
        }

        if (this.nextArrow) {
            this.nextArrow.addEventListener('click', () => this.next(true));
        }

        if (this.dots) {
            this.dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const index = parseInt(dot.dataset.index);
                    this.goTo(index);
                });
            });
        }

        if (this.config.userInteractionOver) {
            this.container.addEventListener('mouseenter', () => {
                this.pause();
                this.mouseIsOver = true;
            });

            this.container.addEventListener('mouseleave', () => {
                if (!this.userInteracted) this.startAutoplay();
                this.mouseIsOver = false;
            });
        }
    }

    updateSlide(index) {
        if (index < 0) index = this.slides.length - 1;
        if (index >= this.slides.length) index = 0;

        this.slides.forEach((slide, i) => {
            const isActive = i === index;
            slide.classList.toggle('active', isActive);
            slide.setAttribute('aria-hidden', !isActive);
        });

        this.currentIndex = index;

        this.updatePagination();
    }

    updatePagination() {
        if (this.dots) {
            const current = Number(this.currentIndex);

            if (current >= this.config.paginationDots) {
                const startIndex = current - this.config.paginationDots + 1;
                
                this.dots.forEach((dot, i) => {
                    const newIndex = startIndex + i;
                    dot.dataset.index = newIndex.toString();
                });
            }

            if (current == 0) {
                this.dots.forEach((dot, i) => {
                    dot.dataset.index = (i ).toString();
                });
            }

            this.dots.forEach(dot => {
                const dotIndex = parseInt(dot.dataset.index); 
                dot.classList.toggle('active', dotIndex === current);
            });

        }
    }

    next(eventUser = false) {
        this.updateSlide(this.currentIndex + 1);
        if (eventUser) this.handleUserInteraction();
    }

    prev(eventUser = false) {
        this.updateSlide(this.currentIndex - 1);
        if (eventUser) this.handleUserInteraction();
    }

    goTo(index) {
        this.updateSlide(index);
        this.handleUserInteraction();
    }

    startAutoplay() {
        this.pause();
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