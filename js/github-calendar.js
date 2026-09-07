/**
 * github-calendar.js
 * Fetches and renders the GitHub contribution graph with tooltips and pagination.
 */

const GITHUB_USERNAME = 'NekuLp';
const YEARS = [2024, 2023, 2022, 2021, 2020];
let currentYear = 2024;

async function loadContributions(year) {
    const container = document.getElementById('github-chart-container');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="fa fa-spinner fa-spin fa-3x" style="color: #2ce574;"></i>
            <p class="mt-3 glow-text" style="font-size: 0.9rem;">Cargando commits del ${year}...</p>
        </div>
    `;
    
    try {
        const githubUrl = `https://github.com/users/${GITHUB_USERNAME}/contributions?to=${year}-12-31`;
        // Using allOrigins to bypass CORS safely
        const url = `https://api.allorigins.win/get?url=${encodeURIComponent(githubUrl)}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        const text = data.contents;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const grid = doc.querySelector('.ContributionCalendar-grid');
        if (!grid) {
            throw new Error('Grid not found in response');
        }
        
        // Remove github's inline styles from the grid to use our own
        grid.removeAttribute('style');
        
        // Extract tooltip data
        const tooltips = doc.querySelectorAll('tool-tip');
        const tooltipData = {};
        tooltips.forEach(tt => {
            // format: "No contributions on Sunday, Jan 1"
            tooltipData[tt.getAttribute('for')] = tt.textContent.trim();
        });
        
        // Build the HTML with paginator
        let html = `
            <div class="github-calendar-wrapper">
                ${grid.outerHTML}
            </div>
            <div class="github-calendar-years mt-4 text-center">
                ${YEARS.map(y => `<button class="year-btn ${y === year ? 'active' : ''}" onclick="window.changeGithubYear(${y})">${y}</button>`).join('')}
            </div>
        `;
        
        container.innerHTML = html;
        
        // Setup tooltips
        const days = container.querySelectorAll('.ContributionCalendar-day');
        const tooltipEl = document.getElementById('gh-tooltip') || createTooltipEl();
        
        days.forEach(day => {
            day.addEventListener('mouseenter', (e) => {
                const id = day.getAttribute('id');
                if (id && tooltipData[id]) {
                    tooltipEl.innerHTML = tooltipData[id];
                    tooltipEl.style.opacity = 1;
                    const rect = day.getBoundingClientRect();
                    tooltipEl.style.top = (rect.top + window.scrollY - 35) + 'px';
                    tooltipEl.style.left = (rect.left + window.scrollX + (rect.width/2) - (tooltipEl.offsetWidth/2)) + 'px';
                }
            });
            day.addEventListener('mouseleave', () => {
                tooltipEl.style.opacity = 0;
            });
        });
        
    } catch(err) {
        console.error(err);
        container.innerHTML = `
            <div class="text-center py-5">
                <p class="text-danger">Error cargando contribuciones. Por favor intenta más tarde.</p>
                <div class="github-calendar-years mt-4 text-center">
                    ${YEARS.map(y => `<button class="year-btn ${y === year ? 'active' : ''}" onclick="window.changeGithubYear(${y})">${y}</button>`).join('')}
                </div>
            </div>
        `;
    }
}

function createTooltipEl() {
    const el = document.createElement('div');
    el.id = 'gh-tooltip';
    el.className = 'gh-tooltip';
    document.body.appendChild(el);
    return el;
}

window.changeGithubYear = function(year) {
    currentYear = year;
    loadContributions(year);
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('github-chart-container')) {
        loadContributions(currentYear);
    }
});
