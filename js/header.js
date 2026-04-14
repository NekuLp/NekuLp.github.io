/**
 * header.js
 * Renders the site-wide <nav> into #site-header and handles:
 *  - Active link detection based on current URL
 *  - Mobile burger button toggle with fade-in/out animation
 */

(function () {
    const NAV_LINKS = [
        { href: 'index.html',      labelKey: 'nav.home',       label: 'Inicio'    },
        { href: 'generative.html', labelKey: 'nav.generative',  label: 'Generative'},
        { href: 'about.html',      labelKey: 'nav.about',       label: 'About'     },
    ];

    /** Detect which page we are on by matching the filename */
    function getActivePage() {
        const path = window.location.pathname;
        const file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        return file;
    }

    /** Build desktop <ul class="nav-links"> */
    function buildDesktopLinks(activePage) {
        return `<ul class="nav-links d-none d-md-flex">
            ${NAV_LINKS.map(l => `
            <li><a href="${l.href}" class="nav-link glow-text${activePage === l.href ? ' active' : ''}"
                   data-i18n="${l.labelKey}">${l.label}</a></li>`).join('')}
            <li class="lang-picker">
                <select id="lang-switch" class="lang-select">
                    <option value="es">ESP</option>
                    <option value="en">ENG</option>
                </select>
            </li>
        </ul>`;
    }

    /** Build mobile <ul> inside .menu-mobile */
    function buildMobileLinks(activePage) {
        return NAV_LINKS.map(l => `
            <li><a href="${l.href}" class="nav-link glow-text${activePage === l.href ? ' active' : ''}"
                   data-i18n="${l.labelKey}">${l.label}</a></li>`).join('');
    }

    /** Render the full nav HTML */
    function renderHeader() {
        const activePage = getActivePage();

        const html = `
        <nav class="neon-navbar">
            <div class="nav-container">
                <a href="index.html" class="nav-logo glow-text">Pashekun</a>

                ${buildDesktopLinks(activePage)}

                <!-- Burger button: only on mobile -->
                <button class="burger-btn d-md-none" id="burger-btn" aria-label="Menú" aria-expanded="false">
                    <span class="burger-line"></span>
                    <span class="burger-line"></span>
                    <span class="burger-line"></span>
                </button>
            </div>

            <!-- Mobile dropdown menu -->
            <div class="menu-mobile" id="menu-mobile" role="navigation" aria-label="Menú mobile">
                <ul class="menu-mobile__list">
                    ${buildMobileLinks(activePage)}
                    <li class="lang-picker lang-picker--mobile">
                        <select id="lang-switch-mobile" class="lang-select">
                            <option value="es">ESP</option>
                            <option value="en">ENG</option>
                        </select>
                    </li>
                </ul>
            </div>
        </nav>`;

        const target = document.getElementById('site-header');
        if (target) {
            target.innerHTML = html;
        } else {
            // fallback: insert before <main>
            const main = document.querySelector('main');
            if (main) main.insertAdjacentHTML('beforebegin', html);
        }

        initBurger();
        syncMobileLangPicker();
    }

    /** Burger toggle logic */
    function initBurger() {
        const btn   = document.getElementById('burger-btn');
        const menu  = document.getElementById('menu-mobile');
        if (!btn || !menu) return;

        btn.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('show');
            btn.classList.toggle('is-open', isOpen);
            btn.setAttribute('aria-expanded', isOpen);
        });

        // Close on link click
        menu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('show');
                btn.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /** Keep the mobile lang picker in sync with the desktop one (and vice-versa) */
    function syncMobileLangPicker() {
        const desktop = document.getElementById('lang-switch');
        const mobile  = document.getElementById('lang-switch-mobile');
        if (!desktop || !mobile) return;

        // Mirror current value
        mobile.value = desktop.value;

        desktop.addEventListener('change', () => { mobile.value = desktop.value; });
        mobile.addEventListener('change', () => {
            desktop.value = mobile.value;
            // Fire change event so selectize / i18n picks it up
            desktop.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    // Run as soon as possible
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderHeader);
    } else {
        renderHeader();
    }
})();
