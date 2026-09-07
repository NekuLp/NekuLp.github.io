/**
 * js/projects.js
 * Vanilla JS implementation of a Projects Gallery with a Modal
 * Mimics React component behavior using Template Literals
 */

const projectsData = [
    {
        id: 'racelab',
        title: 'Racelab',
        role: 'Frontend & Backend',
        company: 'Anagrama Studio',
        tech: ['HTML', 'CSS', 'JS', 'Backend'],
        img: 'img/projects/racelab.png',
        desc: 'Desarrollo completo de frontend y backend para la plataforma Racelab, enfocada en rendimiento y experiencia de usuario.',
        link: 'https://racelab.mx/'
    },
    {
        id: 'sanmarino',
        title: 'San Marino',
        role: 'Frontend & Backend',
        company: 'Anagrama Studio',
        tech: ['HTML', 'CSS', 'JS', 'Backend'],
        img: 'img/projects/sanmarino.jpg',
        desc: 'Mantenimiento y corrección de bugs (Fixed things) en Frontend y Backend para el proyecto San Marino.',
        link: 'https://sanmarinoacapulco.com/'
    },
    {
        id: 'elims',
        title: 'Elims',
        role: 'Frontend & Shopify Backend',
        company: 'Anagrama Studio',
        tech: ['Shopify', 'Liquid', 'JS', 'CSS'],
        img: 'img/projects/elims.jpg',
        desc: 'Implementación de tienda en línea usando Shopify, desarrollando tanto la interfaz de usuario como la lógica del backend.',
        link: 'https://elims.com.mx/'
    },
    {
        id: 'momijius',
        title: 'Momiji US',
        role: 'Frontend & Backend',
        company: 'Anagrama Studio',
        tech: ['Frontend', 'Backend', 'API'],
        img: 'img/projects/momijius.gif',
        desc: 'Proyecto de cliente desarrollando soluciones integrales de Frontend y Backend.',
        link: 'https://anagrama.com/project/momiji'
    },
    {
        id: 'coonoor',
        title: 'Coonoor Estates',
        role: 'Frontend & Backend',
        company: 'Anagrama Studio',
        tech: ['Frontend', 'Backend', 'API'],
        img: 'img/projects/coonoor.png',
        desc: 'Proyecto de cliente desarrollando soluciones integrales de Frontend y Backend.',
        link: 'https://coonoorestates.com/'
    },
    {
        id: 'metalsa',
        title: 'Metalsa On',
        role: 'Frontend & Backend',
        company: 'Anagrama Studio',
        tech: ['Frontend', 'Backend', 'API'],
        img: 'img/projects/metalsaon.png',
        desc: 'Proyecto de cliente desarrollando soluciones integrales de Frontend y Backend.',
        link: 'https://metalsaon.com.mx/'
    },
    {
        id: 'mediabar',
        title: 'The Media Bar',
        role: 'Frontend & Backend',
        company: 'Anagrama Studio',
        tech: ['Web', 'Backend', 'UI/UX'],
        img: 'img/projects/tmb.png',
        desc: 'Desarrollo full stack de portfolio interactivo.',
        link: 'https://themediabar.com/home'
    },
    {
        id: 'strahyd',
        title: 'Strahyd',
        role: 'Frontend & Shopify Dev',
        company: 'Anagrama Studio',
        tech: ['Shopify', 'Liquid', 'Frontend'],
        img: 'img/projects/strahyd.png',
        desc: 'Correcciones de frontend y desarrollo en plataforma Shopify.',
        link: 'https://anagrama.com/project/strahyd'
    },
    {
        id: 'yeya',
        title: 'Yeya Kids',
        role: 'Frontend & Shopify Dev',
        company: 'Anagrama Studio',
        tech: ['Shopify', 'Liquid', 'JS'],
        img: 'img/projects/yeya.png',
        desc: 'Desarrollo de e-commerce enfocado en productos infantiles sobre Shopify.',
        link: 'https://www.yeyakids.com/'
    },
    {
        id: 'oakwise',
        title: 'Oakwise',
        role: 'Backend & Shopify',
        company: 'Espina Studio',
        tech: ['Shopify', 'Backend', 'API'],
        img: 'img/projects/oakwise.jpg',
        desc: 'Desarrollo avanzado de backend.',
        link: 'https://oakwise.com.mx/'
    },
    {
        id: 'curiosity',
        title: 'Curiosity Division',
        role: 'Backend',
        company: 'Espina Studio',
        tech: ['Node.js', 'Backend', 'API'],
        img: 'img/projects/curiosity.jpg',
        desc: 'Arquitectura y desarrollo de procesos backend eficientes.',
        link: 'https://curiositydivision.com/'
    }
];

class ProjectsGallery {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.modal = null;
        this.init();
    }

    init() {
        this.renderGrid();
        this.createModal();
        this.attachEventListeners();
    }

    renderGrid() {
        const gridHtml = projectsData.map(project => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="project-card" data-id="${project.id}">
                    <div class="project-card-img">
                        <img src="${project.img}" alt="${project.title}" loading="lazy">
                        <div class="project-card-overlay">
                            <span class="view-btn">Ver Detalles</span>
                        </div>
                    </div>
                    <div class="project-card-body">
                        <h3 class="project-title">${project.title}</h3>
                        <p class="project-role">${project.role}</p>
                        <div class="project-tech">
                            ${project.tech.slice(0, 3).map(t => `<span>${t}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        this.container.innerHTML = `<div class="row">${gridHtml}</div>`;
    }

    createModal() {
        const modalHtml = `
            <div id="project-modal" class="custom-modal fade-hidden">
                <div class="custom-modal-backdrop"></div>
                <div class="custom-modal-content">
                    <button class="custom-modal-close">&times;</button>
                    <div class="custom-modal-body" id="project-modal-body">
                        <!-- Content injected dynamically -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('project-modal');
    }

    attachEventListeners() {
        // Open Modal
        this.container.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (card) {
                const id = card.getAttribute('data-id');
                this.openModal(id);
            }
        });

        // Close Modal via button
        const closeBtn = this.modal.querySelector('.custom-modal-close');
        closeBtn.addEventListener('click', () => this.closeModal());

        // Close Modal via backdrop
        const backdrop = this.modal.querySelector('.custom-modal-backdrop');
        backdrop.addEventListener('click', () => this.closeModal());
        
        // Close via Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('fade-hidden')) {
                this.closeModal();
            }
        });
    }

    openModal(id) {
        const project = projectsData.find(p => p.id === id);
        if (!project) return;

        const modalBody = document.getElementById('project-modal-body');
        
        let companyHtml = `<strong>${project.company}</strong>`;
        if (project.company.toLowerCase().includes('anagrama')) {
            companyHtml = `<a href="https://www.anagrama.com/" target="_blank" style="color: #2ce574; text-decoration: none; border-bottom: 1px dashed #2ce574;"><strong>${project.company}</strong></a>`;
        } else if (project.company.toLowerCase().includes('espina')) {
            companyHtml = `<a href="https://espina.studio/" target="_blank" style="color: #2ce574; text-decoration: none; border-bottom: 1px dashed #2ce574;"><strong>${project.company}</strong></a>`;
        }

        const projectLinkHtml = (project.link && project.link !== '#') 
            ? `<a href="${project.link}" target="_blank" class="modal-action-btn" style="text-decoration: none; display: inline-block;">Ver Proyecto</a>`
            : `<button class="modal-action-btn" onclick="alert('Falta agregar el link a project.link en js/projects.js')">Ver Proyecto</button>`;

        modalBody.innerHTML = `
            <img src="${project.img}" alt="${project.title}" class="modal-img">
            <h2 class="modal-title glow-text">${project.title}</h2>
            <p class="modal-company">${companyHtml} | ${project.role}</p>
            <div class="modal-tech mb-3">
                ${project.tech.map(t => `<span>${t}</span>`).join('')}
            </div>
            <p class="modal-desc">${project.desc}</p>
            <div class="mt-4">
                ${projectLinkHtml}
            </div>
        `;

        this.modal.classList.remove('fade-hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    closeModal() {
        this.modal.classList.add('fade-hidden');
        document.body.style.overflow = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('projects-grid')) {
        new ProjectsGallery('projects-grid');
    }
});
