/**
 * footer.js
 * Injects a global footer into all pages
 */

(function () {
    function renderFooter() {
        const html = `
        <footer class="site-footer">
            <div class="container text-center">
                <div class="row align-items-center justify-content-between">
                    
                    <div class="col-md-4 mb-3 mb-md-0">
                        <a href="Luis_Gerardo_Pacheco_Morales_CV.pdf" target="_blank" class="download-cv-btn">
                            <i class="fa fa-file-pdf-o me-2"></i> Ver / Descargar CV
                        </a>
                    </div>

                    <div class="col-md-4 text-md-end">
                        <ul class="footer-social-links m-0 p-0">
                            <li><a href="https://github.com/NekuLp" target="_blank" title="GitHub"><i class="fa fa-github"></i></a></li>
                            <li><a href="https://www.linkedin.com/in/luispacm/" target="_blank" title="LinkedIn"><i class="fa fa-linkedin"></i></a></li>
                            <li><a href="mailto:luis_gerardo_pacheco@hotmail.com" title="Email"><i class="fa fa-envelope"></i></a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>`;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderFooter);
    } else {
        renderFooter();
    }
})();
