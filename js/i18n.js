import { translations } from './translations.js';

class I18nManager {
    constructor() {
        // Read preference from localStorage or default to 'es'
        this.currentLang = localStorage.getItem('site_lang') || 'es';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupDropdown();
            this.translatePage();
            
            // Expose a global method to translate strings dynamically from JS (used in generative.html)
            window.t = (key) => this.translateString(key);
        });
    }

    setupDropdown() {
        const langSelect = $('#lang-switch');
        if (!langSelect.length) return;

        // Ensure the correct default value is set before initializing selectize
        langSelect.val(this.currentLang);

        langSelect.selectize({
            create: false,
            onChange: (value) => {
                if (value) {
                    this.setLanguage(value);
                }
            },
            onInitialize: function() {
                const self = this;
                let isOpenBefore = false;
                
                // Mousedown capta el estado ANTES de que selectize dispare sus eventos nativos
                
            }
        });


        const langSelect2 = $('#lang-switch-mobile');
        if (!langSelect2.length) return;

        // Ensure the correct default value is set before initializing selectize
        langSelect2.val(this.currentLang);

        langSelect2.selectize({
            create: false,
            onChange: (value) => {
                if (value) {
                    this.setLanguage(value);
                }
            },
            onInitialize: function() {
                const self = this;
                let isOpenBefore = false;
                
                // Mousedown capta el estado ANTES de que selectize dispare sus eventos nativos
                
            }
        });
    }

    setLanguage(lang) {
        if (!translations[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('site_lang', lang);
        this.translatePage();
        
        // Dispatch a custom event in case other scripts need to re-render something (like generative.html tooltips)
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
    }

    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        const dict = translations[this.currentLang];
        
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            // Support text content and some placeholders if needed
            if (dict[key]) {
                // If it's an element that might contain inner HTML we need to keep, we can do textContent,
                // but since we wrap specific text nodes, textContent is usually safe and preferred.
                // However glowing icons inside buttons might be wiped if doing textContent. 
                // Let's use innerHTML but be careful not to put user input in translations.
                el.innerHTML = dict[key];
            }
        });
    }

    translateString(key) {
        const dict = translations[this.currentLang];
        return dict ? dict[key] || key : key;
    }
}

// Instantiate to run on page load
const i18n = new I18nManager();
