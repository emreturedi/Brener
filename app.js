/* ==========================================================================
   BRENER GROUP - MAIN APP CONTROLLER & STATE MANAGEMENT
   ========================================================================== */

// Establish global namespace
window.BrenerApp = {
    // Application State
    state: {
        projects: [],
        currentProjectId: null,
        reminders: [],
        timesheet: {}, // { date: { employeeId: status } }
        employees: [],
        materials: [],
        hseIncidents: [],
        concretePours: [],
        claims: [], // Progress claims
        workOrders: [],
        customers: [],
        users: [],
        currentUser: null,
        rolePermissions: {},
        logs: [], // Activity logs
        projectContracts: {}, // Project contract summaries
        projectSpecs: {}, // Project technical specifications
        specTemplates: [], // Global specification templates
        theme: 'dark' // default
    },

    // Global SVG Icons utility (for crisp, zero-dependency inline SVGs)
    icons: {
        dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
        projects: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        reminders: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        diary: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
        schedule: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        materials: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
        hse: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        weather: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
        claim: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
        payments: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
        contracts: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
        'land-contract': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        accounting: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
        calc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="4" y1="16" x2="20" y2="16"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="8" x2="20" y2="8"/></svg>`,
        renovation: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
        share: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
        rules: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
        map: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>`,
        metraj: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
        prices: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
        valuation: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M5 17h2v-3H5v3zm5 0h2V10h-2v7zm5 0h2V5h-2v12zm5 0h2v-5h-2v5z"/></svg>`,
        'land-valuation': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg>`,
        'estate-track': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
        comparison: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="21" x2="18" y2="3"/><line x1="12" y1="21" x2="12" y2="3"/><line x1="6" y1="21" x2="6" y2="3"/></svg>`,
        region: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z"/></svg>`,
        tax: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>`,
        assistant: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/></svg>`,
        'ai-chat': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        'ai-estate': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>`,
        'ai-photo': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
        'ai-blueprint': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18M3 15h18"/></svg>`,
        'ai-voice': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8"/></svg>`,
        'ai-draw': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
        'ai-design': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>`,
        'ai-layout': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/></svg>`,
        'ai-3d': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
        'ai-2d': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/></svg>`,
        'ai-rules': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        clients: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
        orders: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17h6M9 12h6M9 7h6"/></svg>`,
        'repair-form': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
        'order-slip': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`,
        'service-offer': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/></svg>`,
        calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        company: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
        tasks: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21-12v7a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74"/></svg>`,
        join: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
        'doc-projects': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
        'doc-finance': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
        fund: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
        'doc-sales': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
        'doc-gen': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        archive: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
        feasibility: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
        tools: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
        settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
        'project-docs': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
        'ai-docs': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        profile: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    },

    // Initialize application
    init() {
        this.loadIcons();
        this.setupEventListeners();
        this.loadState();
        this.checkAuthentication();
        this.setupProjectSelector();
        this.setupNotifications();
        this.setupMenuSearch();
        
        // Handle initial routing
        this.router();
        window.addEventListener('hashchange', () => this.router());
    },

    // Inject SVG icons into placeholders
    loadIcons() {
        document.querySelectorAll('.nav-icon[data-icon]').forEach(el => {
            const iconKey = el.getAttribute('data-icon');
            if (this.icons[iconKey]) {
                el.innerHTML = this.icons[iconKey];
            }
        });
    },

    // Setup Event Listeners for main frame elements
    setupEventListeners() {
        // Collapsible Accordion logic for Sidebar groups
        document.querySelectorAll('.nav-group-title').forEach(title => {
            title.addEventListener('click', () => {
                const group = title.closest('.nav-group');
                const wasActive = group.classList.contains('active');
                
                // Close other groups on desktop
                if (window.innerWidth > 992) {
                    document.querySelectorAll('.nav-group').forEach(g => g.classList.remove('active'));
                }
                
                if (!wasActive) {
                    group.classList.add('active');
                } else {
                    group.classList.remove('active');
                }
            });
        });

        // Theme Toggle Button
        const themeBtn = document.getElementById('darkModeToggle');
        themeBtn.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Mobile Nav Toggle
        const mobileToggleBtn = document.getElementById('mobileToggleBtn');
        const mobileCloseBtn = document.getElementById('mobileCloseBtn');
        const sidebar = document.querySelector('.sidebar');

        mobileToggleBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });

        mobileCloseBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });

        // Close sidebar on item click on mobile
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove('active');
                }
            });
        });

        // Global Project Change
        const projectSelect = document.getElementById('globalProjectSelector');
        projectSelect.addEventListener('change', (e) => {
            this.state.currentProjectId = parseInt(e.target.value);
            this.saveStateToStorage();
            this.showToast('warning', `Aktif proje değiştirildi: ${this.getActiveProject().name}`);
            this.router(); // Reload view with new project data
        });

        // Notification Toggle
        const notiBtn = document.getElementById('notificationBtn');
        const notiDropdown = document.getElementById('notificationDropdown');
        notiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notiDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!notiDropdown.contains(e.target) && e.target !== notiBtn) {
                notiDropdown.classList.remove('active');
            }
        });

        // Mark Notifications Read
        document.getElementById('markAllReadBtn').addEventListener('click', () => {
            this.markNotificationsAsRead();
        });

        // Floating AI Assistant triggers
        const aiTriggerBtn = document.getElementById('aiTriggerBtn');
        const aiChatPanel = document.getElementById('aiChatPanel');
        const aiChatCloseBtn = document.getElementById('aiChatCloseBtn');
        const aiSendBtn = document.getElementById('aiChatSendBtn');
        const aiInput = document.getElementById('aiChatInput');

        aiTriggerBtn.addEventListener('click', () => {
            aiChatPanel.classList.toggle('active');
            if (aiChatPanel.classList.contains('active')) {
                aiInput.focus();
            }
        });

        aiChatCloseBtn.addEventListener('click', () => {
            aiChatPanel.classList.remove('active');
        });

        aiSendBtn.addEventListener('click', () => this.handleAiQuery());
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAiQuery();
        });

        // Profile Quick View Navigation
        document.getElementById('profileQuickViewBtn').addEventListener('click', () => {
            window.location.hash = '#profil';
        });

        // Logout action
        document.getElementById('logoutBtn').addEventListener('click', () => {
            const userName = this.state.currentUser ? this.state.currentUser.name : '';
            this.logActivity('sistem', `Çıkış yapıldı: ${userName}`, 'info');
            this.state.currentUser = null;
            this.saveStateToStorage();
            this.showToast('danger', 'Sistemden çıkış yapılıyor...');
            setTimeout(() => {
                window.location.hash = '#panel';
                window.location.reload();
            }, 1000);
        });
    },

    // State Load with Rich Preloaded Mock Database
    loadState() {
        const localData = localStorage.getItem('brener_app_state');
        if (localData) {
            this.state = JSON.parse(localData);
            // Upgrade check for users & permissions
            if (!this.state.users) {
                this.state.users = [
                    { id: 1, name: 'Emre Türedi', email: 'admin@brener.com.tr', password: 'admin123', role: 'admin' },
                    { id: 2, name: 'Caner Şen', email: 'sefi@brener.com.tr', password: 'sefi123', role: 'sefi' },
                    { id: 3, name: 'Zeynep Yurt', email: 'muhasebe@brener.com.tr', password: 'muh123', role: 'muhasebe' },
                    { id: 4, name: 'Murat Kara', email: 'saha@brener.com.tr', password: 'saha123', role: 'saha' }
                ];
            }
            if (this.state.currentUser === undefined) {
                this.state.currentUser = null;
            }
            if (!this.state.rolePermissions || Object.keys(this.state.rolePermissions).length === 0) {
                this.state.rolePermissions = {
                    sefi: { genel: true, santiye: true, 'proje-yonetimi': true, finans: false, hesaplama: true, degerleme: false, ai: true, saha: false, ekip: true, belgeler: true },
                    muhasebe: { genel: true, santiye: false, 'proje-yonetimi': true, finans: true, hesaplama: false, degerleme: true, ai: false, saha: false, ekip: false, belgeler: true },
                    saha: { genel: true, santiye: false, 'proje-yonetimi': false, finans: false, hesaplama: false, degerleme: false, ai: false, saha: true, ekip: true, belgeler: true }
                };
            }
            if (!this.state.logs) {
                this.state.logs = [];
            }
            if (!this.state.specTemplates) {
                this.state.specTemplates = [];
            }
            if (!this.state.projectSpecs) {
                this.state.projectSpecs = {};
            } else {
                for (let projId in this.state.projectSpecs) {
                    const data = this.state.projectSpecs[projId];
                    if (data && !data.clauses) {
                        this.state.projectSpecs[projId] = {
                            metadata: {
                                ilce_semt: "KADIKÖY – GÖZTEPE",
                                bina_adi: "ÇAVLI APARTMANI",
                                ada_no: "391",
                                parsel_no: "5",
                                sartname_tarihi: "2026-04-17"
                            },
                            clauses: [
                                { id: 'c1', title: "1. Projeler ve Kaba İnşaat", content: data.kaba_beton || "" },
                                { id: 'c2', title: "2. Bodrum Kat", content: "" },
                                { id: 'c3', title: "3. Binanın Dış Cephesi", content: data.cephe_kaplama || "" },
                                { id: 'c4', title: "4. Zemin Kat ve Bina Girişi", content: "" },
                                { id: 'c5', title: "5. Duvar ve Sıvalar", content: data.kaba_duvar || "" },
                                { id: 'c6', title: "6. Isı Sistemi", content: data.mekanik_isitma || "" },
                                { id: 'c7', title: "7. Sıhhi ve Pis Su Sistemleri", content: "" },
                                { id: 'c8', title: "8. Elektrik - Klima Tesisatı", content: "" },
                                { id: 'c9', title: "9. Televizyon Tesisat Sistemi", content: "" },
                                { id: 'c10', title: "10. Telefon ve Görüntülü Diafon Sistemi", content: "" },
                                { id: 'c11', title: "11. Doğalgaz Tesisatı", content: "" },
                                { id: 'c12', title: "12. Çatı", content: "" },
                                { id: 'c13', title: "13. Bahçe ve Dış Duvarlar", content: "" },
                                { id: 'c14', title: "14. Asansörler", content: data.mekanik_asansor || "" },
                                { id: 'c15', title: "15. Merdiven ve Sahanlıklar", content: "" },
                                { id: 'c16', title: "16. Doğramalar", content: data.cephe_cam || "" },
                                { id: 'c17', title: "17. Kapalı Garaj", content: "" },
                                { id: 'c18', title: "18. Daire Dış ve İç Kapıları", content: data.ince_kapi || "" },
                                { id: 'c19', title: "19. Mutfaklar", content: data.ince_mutfak || "" },
                                { id: 'c20', title: "20. Banyo ve WC", content: "" },
                                { id: 'c21', title: "21. Antre ve Koridorlar", content: "" },
                                { id: 'c22', title: "22. Salon ve Odalar", content: data.ince_parke || "" },
                                { id: 'c23', title: "23. İşçilik ve Garanti Koşulları", content: "5 Yıl Boyunca..." }
                            ],
                            notes: "Yarısı bizden hibe/kredi kampanyası desteklidir. Residence Konsepti tasarımdır.",
                            sartname_durumu: "İmzalandı",
                            signed_file_url: "https://storage.brener.com.tr/docs/cavli_sartname_signed.pdf",
                            kat_malikleri_sayisi: 38,
                            signed_files: [
                                { name: "cavli_sartname_signed.pdf", size: "2.4 MB", date: "2026-04-20", url: "#" }
                            ]
                        };
                    }
                }
            }

            if (!this.state.projectContracts) {
                this.state.projectContracts = {};
            } else {
                for (let projId in this.state.projectContracts) {
                    const data = this.state.projectContracts[projId];
                    if (data && !Array.isArray(data)) {
                        this.state.projectContracts[projId] = [ { id: 'c_' + Date.now(), ...data } ];
                    }
                }
            }
        } else {
            // Load Mock database
            this.state.theme = 'dark';
            this.state.users = [
                { id: 1, name: 'Emre Türedi', email: 'admin@brener.com.tr', password: 'admin123', role: 'admin' },
                { id: 2, name: 'Caner Şen', email: 'sefi@brener.com.tr', password: 'sefi123', role: 'sefi' },
                { id: 3, name: 'Zeynep Yurt', email: 'muhasebe@brener.com.tr', password: 'muh123', role: 'muhasebe' },
                { id: 4, name: 'Murat Kara', email: 'saha@brener.com.tr', password: 'saha123', role: 'saha' }
            ];
            this.state.currentUser = null;
            this.state.rolePermissions = {
                sefi: { genel: true, santiye: true, 'proje-yonetimi': true, finans: false, hesaplama: true, degerleme: false, ai: true, saha: false, ekip: true, belgeler: true },
                muhasebe: { genel: true, santiye: false, 'proje-yonetimi': true, finans: true, hesaplama: false, degerleme: true, ai: false, saha: false, ekip: false, belgeler: true },
                saha: { genel: true, santiye: false, 'proje-yonetimi': false, finans: false, hesaplama: false, degerleme: false, ai: false, saha: true, ekip: true, belgeler: true }
            };
            this.state.theme = 'dark';
            this.state.projects = [
                { id: 101, name: 'Brener Port Konakları', location: 'Bodrum, Muğla', status: 'active', progress: 68, manager: 'Ahmet Şef', budget: 45000000, spent: 31000000 },
                { id: 102, name: 'Brener Plaza', location: 'Ataşehir, İstanbul', status: 'active', progress: 42, manager: 'Mehmet Yılmaz', budget: 120000000, spent: 50400000 },
                { id: 103, name: 'Brener Premium Villaları', location: 'Çeşme, İzmir', status: 'active', progress: 15, manager: 'Canan Demir', budget: 60000000, spent: 9000000 },
                { id: 104, name: 'Brener Loft Rezidans', location: 'Nilüfer, Bursa', status: 'completed', progress: 100, manager: 'Selin Kaya', budget: 85000000, spent: 83500000 }
            ];
            this.state.currentProjectId = 101;
            
            this.state.employees = [
                { id: 1, name: 'Hasan Demir', role: 'Kalıpçı Ustası', salary: 1500, status: 'active' },
                { id: 2, name: 'Ali Yılmaz', role: 'Demirci Ustası', salary: 1500, status: 'active' },
                { id: 3, name: 'Mustafa Kaya', role: 'Tuğla Duvar Ustası', salary: 1400, status: 'active' },
                { id: 4, name: 'Kemal Ak', role: 'Sıvacı Ustası', salary: 1300, status: 'active' },
                { id: 5, name: 'Zeynep Yurt', role: 'İSG Uzmanı', salary: 2500, status: 'active' },
                { id: 6, name: 'Caner Şen', role: 'Şantiye Mühendisi', salary: 3000, status: 'active' },
                { id: 7, name: 'Murat Kara', role: 'Elektrik Teknisyeni', salary: 1600, status: 'active' }
            ];

            this.state.materials = [
                { id: 1, name: 'Çimento (Torba - 50kg)', unit: 'Adet', stock: 1250, minStock: 200, price: 165 },
                { id: 2, name: 'İnşaat Demiri (Q12)', unit: 'Ton', stock: 45, minStock: 10, price: 24500 },
                { id: 3, name: 'Hazır Beton (C30)', unit: 'm³', stock: 180, minStock: 50, price: 2150 },
                { id: 4, name: 'Tuğla (13.5’luk)', unit: 'Bin Adet', stock: 18, minStock: 5, price: 8200 },
                { id: 5, name: 'Kum (Elenecek)', unit: 'Ton', stock: 65, minStock: 15, price: 680 }
            ];

            this.state.reminders = [
                { id: 1, title: 'C30 Beton Mukavemet Sonuçları Raporu', date: '2026-06-25', priority: 'high', done: false },
                { id: 2, title: 'Bodrum Blok Kalıp Teslimi İSG Kontrolü', date: '2026-06-26', priority: 'medium', done: false },
                { id: 3, title: 'Taşeron Hakediş İmza Toplantısı', date: '2026-06-28', priority: 'high', done: false },
                { id: 4, title: 'Demir Siparişi Ödemesi', date: '2026-06-29', priority: 'low', done: false }
            ];

            this.state.workOrders = [
                { id: 1, title: 'A Blok Temel Hafriyatı', desc: 'Hafriyat kamyonlarının sahaya koordineli alınması.', status: 'completed', assignedTo: 'Caner Şen', priority: 'high' },
                { id: 2, title: 'B Blok Zemin Demir Bağlama', desc: 'Q12 demirlerin projeye uygun döşenmesi.', status: 'progress', assignedTo: 'Ali Yılmaz', priority: 'high' },
                { id: 3, title: 'C Blok 1. Kat Kolon Kalıpları', desc: 'Kalıpların diklik kontrolü ve paspayları yerleşimi.', status: 'todo', assignedTo: 'Hasan Demir', priority: 'medium' },
                { id: 4, title: 'Elektrik Kablolama Alt Yapı', desc: '1. ve 2. Kat tavan buat geçişleri borulama.', status: 'testing', assignedTo: 'Murat Kara', priority: 'low' }
            ];

            this.state.customers = [
                { id: 1, name: 'Ertürk Holding A.Ş.', balance: 2500000, email: 'finance@erturk.com', phone: '0212 555 44 33' },
                { id: 2, name: 'Levent Serbest', balance: -450000, email: 'levent@gmail.com', phone: '0532 999 88 77' },
                { id: 3, name: 'Ayşe Karaca', balance: 0, email: 'ayse@outlook.com', phone: '0544 123 45 67' }
            ];

            this.state.concretePours = [
                { id: 1, project: 'Brener Port Konakları', date: '2026-06-20', grade: 'C30', volume: 120, temp: '28°C', slump: 'S3 (12cm)', status: 'Onaylandı (28 Gün Bekleniyor)' },
                { id: 2, project: 'Brener Plaza', date: '2026-06-22', grade: 'C35', volume: 240, temp: '26°C', slump: 'S4 (16cm)', status: 'Döküldü (Kürleniyor)' }
            ];

            this.state.claims = [
                { id: 1, subcontractor: 'Öz Yapı Demir Ltd.', description: 'B Blok Zemin ve 1. Kat Demir İşleri', totalAmount: 480000, retention: 24000, netPaid: 456000, date: '2026-06-15', status: 'paid' },
                { id: 2, subcontractor: 'Yavuz Beton Kalıp', description: 'A Blok Komple Kaba İşçilik', totalAmount: 1250000, retention: 62500, netPaid: 1187500, date: '2026-06-23', status: 'pending' }
            ];

            this.state.notifications = [
                { id: 1, title: 'Yeni İş Emri Atandı', desc: 'Caner Şen size B Blok kalıp kontrol görevini atadı.', time: '10 dakika önce', unread: true },
                { id: 2, title: 'Kritik Stok Uyarısı', desc: 'Çimento stoğu minimum seviyenin altına düştü!', time: '1 saat önce', unread: true },
                { id: 3, title: 'Beton Döküm Uyarısı', desc: 'Yarın Bodrum Projesi için beton dökümü planlandı.', time: '4 saat önce', unread: false }
            ];

            this.state.logs = [
                { id: 'seed1', timestamp: new Date(Date.now() - 500000).toISOString(), user: 'Zeynep Yurt', role: 'muhasebe', category: 'finans', action: 'Yavuz Beton Kalıp kaba işçilik hakediş faturası sisteme işlendi.', type: 'info', details: 'Hakediş No: 2, Tutar: 1.250.000 TL, Teminat Kesintisi: %5' },
                { id: 'seed2', timestamp: new Date(Date.now() - 1000000).toISOString(), user: 'Caner Şen', role: 'sefi', category: 'santiye', action: 'Şantiye Günlüğü raporu kaydedildi.', type: 'success', details: 'Hava: Açık 30°C. Demir bağlama ve temel kalıp imalatları tamamlandı.' },
                { id: 'seed3', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Murat Kara', role: 'saha', category: 'saha', action: 'B Blok Zemin Demir Bağlama iş emri tamamlandı olarak işaretlendi.', type: 'success', details: 'Usta: Ali Yılmaz. Projeye uygun 12 ton demir döşendi.' },
                { id: 'seed4', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'Emre Türedi', role: 'admin', category: 'proje', action: 'Aktif proje değiştirildi: Brener Port Konakları.', type: 'info', details: 'Proje ID: 101, Konum: Bodrum, Muğla' },
                { id: 'seed5', timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'Sistem', role: 'system', category: 'sistem', action: 'admin@brener.com.tr kullanıcısı sisteme başarılı giriş yaptı.', type: 'success', details: 'IP: 127.0.0.1, Tarayıcı: Chrome Windows' }
            ];

            this.state.projectContracts = {
                101: [
                    {
                        id: 'c_seed_1',
                        apartman_ismi: "Port Apartmanı",
                        adres: "Bodrum Marina Yolu No:45, Muğla",
                        ada: "402",
                        parsel: "12",
                        arsa_m2: 1500,
                        malik_sayisi: "24 Daire",
                        oran: 45,
                        yarisi_bizden: true,
                        sozlesme_tarihi: "2025-06-03",
                        sozlesme_tarihi_bitis: "2025-09-15",
                        yikim_tarihi: "2025-10-10",
                        ruhsat_donemi: "ŞUBAT",
                        insaat_suresi: "18 AY",
                        is_gecikmesi_cezasi: 20000,
                        teminat_mektubu: "10.000.000 TL Tutarlı Teminat Mektubu Verildi",
                        tasinma_yardimi: "Her Daire İçin 15.000 TL",
                        kira_yardimi: "Aylık 7.500 TL",
                        kira_baslangic_bitis: "Yıkım Tarihinden İtibaren Teslim Tarihine Kadar",
                        emlak_vergileri: "Yüklenici",
                        kapici_tazminat: "Yüklenici Tarafından Karşılanacaktır",
                        mulkiyet_tapu_masrafi: "Kat Maliki",
                        milestones: [
                            { name: "Temel", percent: 20 },
                            { name: "Su Basman + Zemin Kat Beton", percent: 20 },
                            { name: "Kaba İnşaat", percent: 20 },
                            { name: "Duvar + Sıva + Elektrik + Mekanik", percent: 10 },
                            { name: "Doğrama + Cam", percent: 10 },
                            { name: "Mobilya", percent: 10 },
                            { name: "Fiili Teslim", percent: 10 }
                        ],
                        müteahhit_hakedisi: "11 Daire",
                        temsil_heyeti: ["Gülendam Gürsan", "Nazik Ada", "Nermin Argan", "Fatma Tözman", "Mahmure Bozkurt"],
                        karar_orani: "5 TE 3",
                        ihtilaf_merkezi: "İSTAÇ",
                        fesih_sarti: "4 AY İNŞAAT İLERLEMEZSE"
                    }
                ]
            };
            this.state.specTemplates = [
                {
                    name: "Standart Kentsel Dönüşüm Şartnamesi",
                    clauses: [
                        { id: 't1', title: "1. Projeler ve Kaba İnşaat", content: "Statik projeye göre C30/37 hazır beton ve B420C demir kullanılacaktır." },
                        { id: 't2', title: "2. Bodrum Kat", content: "Bodrum katlarda perde beton izolasyonları mebran kaplama ile korunacaktır." },
                        { id: 't3', title: "3. Binanın Dış Cephesi", content: "Dış cephe taşyünü yalıtım üzeri alüminyum kompozit panel kaplama olacaktır." },
                        { id: 't4', title: "4. Zemin Kat ve Bina Girişi", content: "Bina girişi zemin kaplaması doğal mermer ve görüntülü diafon paneli olacaktır." },
                        { id: 't5', title: "5. Duvar ve Sıvalar", content: "Daire bölücü duvarlarda çift sıra gazbeton arası ses yalıtımı yapılacaktır." },
                        { id: 't6', title: "6. Isı Sistemi", content: "Dairelerde Rehau marka yerden ısıtma sistemi kurulacaktır." },
                        { id: 't7', title: "7. Sıhhi ve Pis Su Sistemleri", content: "Pis su boruları Fıratpen sessiz boru serisi olacaktır." },
                        { id: 't8', title: "8. Elektrik - Klima Tesisatı", content: "Klima tesisatı her odaya bakır borulama şeklinde çekilecektir." },
                        { id: 't9', title: "9. Televizyon Tesisat Sistemi", content: "Her daireye 3 adet bağımsız uydu hattı çekilecektir." },
                        { id: 't10', title: "10. Telefon ve Görüntülü Diafon Sistemi", content: "Audio marka 7 inç görüntülü interkom ekranı kurulacaktır." },
                        { id: 't11', title: "11. Doğalgaz Tesisatı", content: "Gaz tesisatı kapı önüne kadar çekilip sayaç vanası bırakılacaktır." },
                        { id: 't12', title: "12. Çatı", content: "Çatı çelik konstrüksiyon üzeri ısı yalıtımı ve arduazlı mebran kaplama olacaktır." },
                        { id: 't13', title: "13. Bahçe ve Dış Duvarlar", content: "Bahçe duvarları betonarme üzeri şık aydınlatmalı ve peyzajlı yapılacaktır." },
                        { id: 't14', title: "14. Asansörler", content: "Kone veya Schindler marka 10 kişilik çift hızlı asansör kurulacaktır." },
                        { id: 't15', title: "15. Merdiven ve Sahanlıklar", content: "Merdiven basamakları bej mermer, korkuluklar alüminyum profil olacaktır." },
                        { id: 't16', title: "16. Doğramalar", content: "Rehau veya pimapen marka çift camlı konfor serisi pencereler." },
                        { id: 't17', title: "17. Kapalı Garaj", content: "Her daire için 1 araçlık kapalı otopark alanı tahsis edilecektir." },
                        { id: 't18', title: "18. Daire Dış ve İç Kapıları", content: "Daire dış kapısı Kale çelik kapı, iç kapılar Dortek lake kapı olacaktır." },
                        { id: 't19', title: "19. Mutfaklar", content: "Mutfak dolapları Lineadecor, tezgah kuvars Belenco olacaktır." },
                        { id: 't20', title: "20. Banyo ve WC", content: "Gömme rezervuar Vitra marka, seramikler Kütahya Seramik olacaktır." },
                        { id: 't21', title: "21. Antre ve Koridorlar", content: "Girişte lake kapaklı portmanto dolabı hazır teslim edilecektir." },
                        { id: 't22', title: "22. Salon ve Odalar", content: "Zeminler 1. sınıf derzli lamine parke olacaktır." },
                        { id: 't23', title: "23. İşçilik ve Garanti Koşulları", content: "İmalat hatalarına karşı 5 yıl boyunca yüklenici garantisi kapsamındadır." }
                    ]
                }
            ];

            this.state.projectSpecs = {
                101: {
                    metadata: {
                        ilce_semt: "KADIKÖY – GÖZTEPE",
                        bina_adi: "ÇAVLI APARTMANI",
                        ada_no: "391",
                        parsel_no: "5",
                        sartname_tarihi: "2026-04-17"
                    },
                    clauses: [
                        { id: 'c1', title: "1. Projeler ve Kaba İnşaat", content: "Statik projeye uygun C30/37 Hazır Beton (TS EN 206) ve B420C Nervürlü İnşaat Demiri kullanılacaktır." },
                        { id: 'c2', title: "2. Bodrum Kat", content: "Bodrum kat perdeleri mebran bohçalama yöntemiyle su yalıtımı yapılacak ve XPS levhalarla korunacaktır." },
                        { id: 'c3', title: "3. Binanın Dış Cephesi", content: "150 yoğunluklu Taşyünü Cephe Yalıtımı (5cm) üzerine Alüminyum Kompozit Panel ve Doğal Taş (Traverten) kaplama yapılacaktır." },
                        { id: 'c4', title: "4. Zemin Kat ve Bina Girişi", content: "Bina giriş holü zeminleri traverten mermer, duvarlar kısmi ahşap kaplama ve paslanmaz posta kutulu olacaktır." },
                        { id: 'c5', title: "5. Duvar ve Sıvalar", content: "Dış duvarlar 25cm kalınlığında Ytong gazbeton, iç duvarlar alçı sıva üzeri Dyo silinebilir boya olacaktır." },
                        { id: 'c6', title: "6. Isı Sistemi", content: "Merkezi sistem pay ölçerli Rehau marka yerden ısıtma borulaması tesis edilecektir." },
                        { id: 'c7', title: "7. Sıhhi ve Pis Su Sistemleri", content: "Sıhhi tesisat boruları PPRC cam elyaf takviyeli, pis su boruları sessiz boru serisi olacaktır." },
                        { id: 'c8', title: "8. Elektrik - Klima Tesisatı", content: "Klima tesisatı her odaya bakır borulama şeklinde çekilecektir (Siemens sigortalar)." },
                        { id: 'c9', title: "9. Televizyon Tesisat Sistemi", content: "Merkezi uydu santrali kurulacak, her odada TV prizi bulunacaktır." },
                        { id: 'c10', title: "10. Telefon ve Görüntülü Diafon Sistemi", content: "Bina girişine Audio marka kameralı zil paneli, dairelere 7 inç renkli interkom ekranı kurulacaktır." },
                        { id: 'c11', title: "11. Doğalgaz Tesisatı", content: "Mutfak ocağı ve banyo sıcak su kullanımı için kolon doğalgaz hattı çekilecektir." },
                        { id: 'c12', title: "12. Çatı", content: "Çelik konstrüksiyon çatı, taşyünü ısı yalıtımı üzeri antrasit renkli çelik kiremit kaplama olacaktır." },
                        { id: 'c13', title: "13. Bahçe ve Dış Duvarlar", content: "Bahçe sınır duvarları brüt betonarme üstü panel çit, bahçe peyzajı otomatik sulamalı olacaktır." },
                        { id: 'c14', title: "14. Asansörler", content: "Kone 10 Kişilik Sedye Uyumlu VVVF frekans kontrollü lüks kabinli asansör tesis edilecektir." },
                        { id: 'c15', title: "15. Merdiven ve Sahanlıklar", content: "Merdiven basamakları Muğla beyazı mermer, korkuluklar temperli camlı alüminyum olacaktır." },
                        { id: 'c16', title: "16. Doğramalar", content: "Rehau PVC Doğrama - Isıcam Sinerji (4+16+4) çift açılımlı konfor pencereler." },
                        { id: 'c17', title: "17. Kapalı Garaj", content: "Kapalı otopark zeminleri helikopter perdahlı beton ve epoksi çizgilendirmeli olacaktır." },
                        { id: 'c18', title: "18. Daire Dış ve İç Kapıları", content: "Daire dış kapıları Dortek çelik kapı, iç kapıları Dortek lake panel ahşap kapı." },
                        { id: 'c19', title: "19. Mutfaklar", content: "Mutfak dolapları Lineadecor, tezgah kuvars Belenco marka, ankastre cihazlar Siemens." },
                        { id: 'c20', title: "20. Banyo ve WC", content: "Seramikler Kütahya Seramik 60x120 rektifiyeli granit, vitrifiyeler Vitra, bataryalar Artema." },
                        { id: 'c21', title: "21. Antre ve Koridorlar", content: "Giriş holüne asma tavan led ışık bandı ve gömme portmanto dolabı yapılacaktır." },
                        { id: 'c22', title: "22. Salon ve Odalar", content: "Şerifoğlu Lamine Parke (14mm Meşe) zemin kaplaması ve lüks ahşap süpürgelikler." },
                        { id: 'c23', title: "23. İşçilik ve Garanti Koşulları", content: "Brener Group kalitesiyle tüm ince ve kaba işçilikler 5 Yıl Boyunca firma garantimiz altındadır." }
                    ],
                    notes: "Yarısı bizden hibe/kredi kampanyası desteklidir. Residence Konsepti tasarımdır.",
                    sartname_durumu: "İmzalandı",
                    signed_file_url: "https://storage.brener.com.tr/docs/cavli_sartname_signed.pdf",
                    kat_malikleri_sayisi: 38,
                    signed_files: [
                        { name: "cavli_sartname_signed.pdf", size: "2.4 MB", date: "2026-04-20", url: "#" }
                    ]
                }
            };

            this.saveStateToStorage();
        }

        // Apply theme
        if (this.state.theme === 'light') {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            this.updateThemeUI('light');
        } else {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            this.updateThemeUI('dark');
        }
    },

    // Save State
    saveStateToStorage() {
        localStorage.setItem('brener_app_state', JSON.stringify(this.state));
    },

    // Activity Logger
    logActivity(category, action, type = 'info', details = '') {
        if (!this.state.logs) {
            this.state.logs = [];
        }
        
        const timestamp = new Date().toISOString();
        const user = this.state.currentUser ? this.state.currentUser.name : 'Misafir';
        const role = this.state.currentUser ? this.state.currentUser.role : 'guest';
        
        const logEntry = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp,
            user,
            role,
            category, // 'sistem' | 'proje' | 'santiye' | 'finans' | 'saha' | 'ai'
            action,
            type, // 'info' | 'success' | 'warning' | 'danger'
            details
        };
        
        this.state.logs.unshift(logEntry);
        
        // Keep logs limit to avoid storage bloat (e.g. 200 logs max)
        if (this.state.logs.length > 200) {
            this.state.logs.pop();
        }
        
        // Use direct localStorage set to avoid recursion
        localStorage.setItem('brener_app_state', JSON.stringify(this.state));
    },

    // Project Utilities
    getActiveProject() {
        return this.state.projects.find(p => p.id === this.state.currentProjectId) || this.state.projects[0];
    },

    setupProjectSelector() {
        const select = document.getElementById('globalProjectSelector');
        select.innerHTML = '';
        this.state.projects.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            if (p.id === this.state.currentProjectId) opt.selected = true;
            select.appendChild(opt);
        });
    },

    // Theme Management
    toggleTheme() {
        const isDark = document.body.classList.contains('dark-mode');
        if (isDark) {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            this.state.theme = 'light';
            this.updateThemeUI('light');
        } else {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            this.state.theme = 'dark';
            this.updateThemeUI('dark');
        }
        this.saveStateToStorage();
        this.logActivity('sistem', `Tema modu değiştirildi: ${this.state.theme === 'dark' ? 'Gece Modu' : 'Gündüz Modu'}`, 'info');
        this.showToast('info', `Tema modu değiştirildi: ${this.state.theme === 'dark' ? 'Gece Modu' : 'Gündüz Modu'}`);
    },

    updateThemeUI(theme) {
        const themeIcon = document.getElementById('themeIcon');
        const themeLabel = document.getElementById('themeLabel');
        if (theme === 'light') {
            themeIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
            themeLabel.textContent = 'Gündüz Modu';
        } else {
            themeIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
            themeLabel.textContent = 'Gece Modu';
        }
    },

    // Sidebar search filter
    setupMenuSearch() {
        const searchInput = document.getElementById('menuSearchInput');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            document.querySelectorAll('.nav-group').forEach(group => {
                let groupHasMatch = false;
                const items = group.querySelectorAll('.nav-item');
                
                items.forEach(item => {
                    const label = item.querySelector('.nav-label').textContent.toLowerCase();
                    if (label.includes(query)) {
                        item.style.display = 'flex';
                        groupHasMatch = true;
                    } else {
                        item.style.display = 'none';
                    }
                });

                if (query === '') {
                    group.style.display = 'block';
                    group.classList.remove('active');
                    // Retain active item group open
                    if (group.querySelector('.nav-item.active')) {
                        group.classList.add('active');
                    }
                } else if (groupHasMatch) {
                    group.style.display = 'block';
                    group.classList.add('active'); // Expand to show matching items
                } else {
                    group.style.display = 'none';
                }
            });
        });
    },

    // Notifications Manager
    setupNotifications() {
        this.renderNotifications();
    },

    renderNotifications() {
        const notiList = document.getElementById('notiList');
        const notiBadge = document.getElementById('notiBadge');
        notiList.innerHTML = '';

        const unreadCount = this.state.notifications.filter(n => n.unread).length;
        if (unreadCount > 0) {
            notiBadge.style.display = 'block';
        } else {
            notiBadge.style.display = 'none';
        }

        if (this.state.notifications.length === 0) {
            notiList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Bildiriminiz bulunmuyor.</div>`;
            return;
        }

        this.state.notifications.forEach(n => {
            const item = document.createElement('div');
            item.className = `noti-item ${n.unread ? 'unread' : ''}`;
            item.innerHTML = `
                <div class="noti-title">${n.title}</div>
                <div class="noti-desc">${n.desc}</div>
                <div class="noti-time">${n.time}</div>
            `;
            item.addEventListener('click', () => {
                n.unread = false;
                this.saveStateToStorage();
                this.renderNotifications();
                this.showToast('info', `Okundu işaretlendi: ${n.title}`);
            });
            notiList.appendChild(item);
        });
    },

    markNotificationsAsRead() {
        this.state.notifications.forEach(n => n.unread = false);
        this.saveStateToStorage();
        this.renderNotifications();
        this.showToast('success', 'Tüm bildirimler okundu olarak işaretlendi.');
    },

    // Toast Alerts
    showToast(type, message) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        if (type === 'success') icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
        else if (type === 'danger') icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        else icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

        toast.innerHTML = `
            <div class="toast-border"></div>
            ${icon}
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Modal Helper
    openModal(title, contentHtml) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = contentHtml;
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.add('active');

        const closeBtn = document.getElementById('modalCloseBtn');
        const clickAway = (e) => {
            if (e.target === overlay) closeModal();
        };
        const closeModal = () => {
            overlay.classList.remove('active');
            overlay.removeEventListener('click', clickAway);
        };
        closeBtn.onclick = closeModal;
        overlay.addEventListener('click', clickAway);
    },

    // Floating AI Chat Assistant Handler
    handleAiQuery() {
        const input = document.getElementById('aiChatInput');
        const container = document.getElementById('aiChatMessages');
        const query = input.value.trim();
        if (!query) return;

        this.logActivity('ai', `AI Asistan sorgusu gönderildi: "${query}"`, 'info');

        // User message
        const userMsg = document.createElement('div');
        userMsg.className = 'message user';
        userMsg.textContent = query;
        container.appendChild(userMsg);
        input.value = '';
        container.scrollTop = container.scrollHeight;

        // Simulate thinking indicator
        const thinking = document.createElement('div');
        thinking.className = 'message ai thinking';
        thinking.innerHTML = `<span class="spinner" style="width: 12px; height: 12px; border-width: 2px; display: inline-block; vertical-align: middle;"></span> Düşünüyor...`;
        container.appendChild(thinking);
        container.scrollTop = container.scrollHeight;

        // Context-aware simulated responses
        setTimeout(() => {
            thinking.remove();
            const aiMsg = document.createElement('div');
            aiMsg.className = 'message ai';
            
            const currentHash = window.location.hash || '#panel';
            const normalizedQuery = query.toLowerCase();
            let response = '';

            // Smart answers
            if (normalizedQuery.includes('maliyet') || normalizedQuery.includes('kaç para') || normalizedQuery.includes('fiyat')) {
                response = `Brener AI Maliyet Analizi: Şantiyede kullanılan hazır beton (C30) birim fiyatı güncel olarak 2.150 TL/m³, inşaat demiri ton fiyatı ise 24.500 TL civarındadır. Maliyet Hesaplayıcı aracımız üzerinden lüks inşaat sınıfı için m² maliyetini kabaca 18.000 TL olarak hesaplayabilirsiniz.`;
            } else if (normalizedQuery.includes('imar') || normalizedQuery.includes('taks') || normalizedQuery.includes('kaks') || normalizedQuery.includes('zemin')) {
                response = `Brener İmar Yönetmelik Bilgisi: TAKS (Taban Alanı Kat Sayısı), binanın arsaya oturan zemin alanının toplam arsa alanına oranıdır. KAKS (Kat Alanı Kat Sayısı) yani emsal ise, binanın katlar alanı toplamının arsa alanına oranıdır. Net inşaat alanını hesaplamak için çekme mesafelerini düştükten sonra imar sınırını geçmemek esastır.`;
            } else if (normalizedQuery.includes('beton') || normalizedQuery.includes('slump') || normalizedQuery.includes('hava')) {
                response = `Brener Şantiye Şefliği Önerisi: Hazır beton dökümünde hava sıcaklığı 5°C ile 30°C arasında olmalıdır. Bugün Bodrum projesinde planlanan döküm için hava sıcaklığı 28°C'dir, bu da sınır değere yakın. Kürleme işlemlerine dökümden hemen sonra başlanmalı, betonun hızlı su kaybetmesi engellenmelidir. Slump değeri olarak S3 (12cm) tercih edilmesi pompalanabilirlik için uygundur.`;
            } else if (normalizedQuery.includes('hakediş') || normalizedQuery.includes('kesinti')) {
                response = `Brener Finans Analizi: Taşeron hak edişlerinde kümülatif tutardan varsa önceki ödemeler düşülür, ayrıca %5 teminat kesintisi ve vergi stopajları uygulanarak net ödeme miktarı bulunur. 'Hakediş' sayfamızdan otomatik hakediş tablosu üretebilirsiniz.`;
            } else {
                // General fallback based on current page
                if (currentHash.includes('santiye') || currentHash.includes('gunluk')) {
                    response = `Brener Şantiye Günlüğü sayfasındasınız. Buradan günlük şantiye ilerleme durumunu, çalışan usta sayılarını ve gelen malzemeleri girerek şantiye logunu oluşturabilirsiniz. Verileriniz yerel hafızaya kaydedilecektir.`;
                } else if (currentHash.includes('finans') || currentHash.includes('hakedis')) {
                    response = `Finans modülündesiniz. Projelere ait bütçe harcamalarını, taşeron ödemelerini ve tahsilat takvimlerini sol menüden yönetebilirsiniz. Proje bütçe durumları Dashboard panelinde grafik olarak listelenmektedir.`;
                } else if (currentHash.includes('ai-') || currentHash.includes('asistan')) {
                    response = `AI Asistan modülündeyiz. Burada yer alan Plan Okuma ve Fotoğraf Analizi modülleriyle şantiyedeki usta hatalarını, iş güvenliği kusurlarını ve mimari planlardaki metrajları otomatik simüle edebiliriz.`;
                } else {
                    response = `Brener Group İnşaat Yönetim Sistemine hoş geldiniz. Panelinizde 3 aktif projeniz bulunuyor. Şantiye yönetimi, beton dökümü, imar hesapları veya hakediş girişleri yapmak için sol menüdeki ilgili araçlara tıklayabilir veya bana detaylı sorular sorabilirsiniz!`;
                }
            }

            aiMsg.innerHTML = response;
            container.appendChild(aiMsg);
            container.scrollTop = container.scrollHeight;
        }, 1000);
    },

    // SPA Router
    router() {
        const contentWindow = document.getElementById('contentWindow');
        const hash = window.location.hash || '#panel';
        const viewName = hash.replace('#', '');
        
        // Route protection mapping
        const viewGroupMap = {
            'panel': 'genel',
            'projelerim': 'genel',
            'hatirlaticilar': 'genel',
            'santiye-gunlugu': 'santiye',
            'is-programi': 'santiye',
            'personel-puantaj': 'santiye',
            'malzeme-stok': 'santiye',
            'isg-kaza': 'santiye',
            'hava-beton': 'santiye',
            'hakedis': 'finans',
            'tahsilat-takibi': 'finans',
            'teklif-sozlesme': 'finans',
            'kat-karsiligi': 'finans',
            'muhasebe-disa-aktar': 'finans',
            'maliyet-hesapla': 'hesaplama',
            'tadilat-hesabi': 'hesaplama',
            'arsa-payi': 'hesaplama',
            'mimari-yonetmelik': 'hesaplama',
            'harita-imar': 'hesaplama',
            'metraj-malzeme': 'hesaplama',
            'anlik-fiyatlar': 'hesaplama',
            'emlak-deger-tahmini': 'degerleme',
            'arsa-degerleme': 'degerleme',
            'emlak-takip': 'degerleme',
            'emsal-karsilastirma': 'degerleme',
            'bolge-analizi': 'degerleme',
            'komisyon-vergi': 'degerleme',
            'kira-dilekce-asistani': 'degerleme',
            'ai-asistan': 'ai',
            'emlak-ai-danisman': 'ai',
            'ai-fotograf-analizi': 'ai',
            'ai-plan-okuma': 'ai',
            'sesli-ai-sefi': 'ai',
            'ai-taslak-plan': 'ai',
            'ai-tadilat-tasarim': 'ai',
            'ai-mekan-yerlesim': 'ai',
            'ai-3d-cephe': 'ai',
            'ai-2d-vaziyet': 'ai',
            'yonetmelik-imar-asistani': 'ai',
            'musteri-cari': 'saha',
            'is-emirleri': 'saha',
            'tadilat-formu': 'saha',
            'siparis-fisi': 'saha',
            'servis-teklifi': 'saha',
            'randevu-takvimi': 'saha',
            'firma-yonetimi': 'ekip',
            'gorevlerim': 'ekip',
            'firmaya-katil': 'ekip',
            'belgeler-projeler': 'belgeler',
            'belgeler-finans': 'belgeler',
            'fon-yonetimi': 'belgeler',
            'belgeler-satis': 'belgeler',
            'evrak-uretici': 'belgeler',
            'akilli-arsiv': 'belgeler',
            'fizibilite': 'belgeler',
            'belgeler-araclar': 'belgeler',
            'ayarlar': 'belgeler',
            'proje-belgeleri': 'belgeler',
            'ai-evrak-merkezi': 'belgeler',
            'profil': 'belgeler',
            'sistem-loglari': 'belgeler',
            'proje-sozlesme-ozeti': 'proje-yonetimi',
            'teknik-sartname': 'proje-yonetimi',
            'kullanici-yonetimi': 'admin'
        };

        // Guard against unauthorized views
        if (this.state.currentUser) {
            const role = this.state.currentUser.role;
            const targetGroup = viewGroupMap[viewName];
            if (targetGroup) {
                if (role !== 'admin' && (targetGroup === 'admin' || this.state.rolePermissions[role]?.[targetGroup] === false)) {
                    this.showToast('danger', 'Bu bölüme erişim yetkiniz bulunmamaktadır!');
                    window.location.hash = '#panel';
                    return;
                }
            }
        } else {
            return;
        }

        // Show spinner during view transition
        contentWindow.innerHTML = `
            <div class="loading-spinner-wrapper">
                <div class="spinner"></div>
                <p>Modül Yükleniyor...</p>
            </div>
        `;

        // Update active sidebar item
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-view') === viewName) {
                item.classList.add('active');
                // Open parent group
                const group = item.closest('.nav-group');
                if (group) group.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Dynamic page rendering dispatcher
        setTimeout(() => {
            try {
                let rendered = false;
                
                // Route mapping using window modules
                if (window.BrenerApp.Dashboard && viewName === 'panel') {
                    window.BrenerApp.Dashboard.render(contentWindow);
                    rendered = true;
                } else if (window.BrenerApp.Santiye && ['santiye-gunlugu', 'is-programi', 'personel-puantaj', 'malzeme-stok', 'isg-kaza', 'hava-beton'].includes(viewName)) {
                    window.BrenerApp.Santiye.render(viewName, contentWindow);
                    rendered = true;
                } else if (window.BrenerApp.Finans && ['hakedis', 'tahsilat-takibi', 'teklif-sozlesme', 'kat-karsiligi', 'muhasebe-disa-aktar'].includes(viewName)) {
                    window.BrenerApp.Finans.render(viewName, contentWindow);
                    rendered = true;
                } else if (window.BrenerApp.Hesaplama && ['maliyet-hesapla', 'tadilat-hesabi', 'arsa-payi', 'mimari-yonetmelik', 'harita-imar', 'metraj-malzeme', 'anlik-fiyatlar'].includes(viewName)) {
                    window.BrenerApp.Hesaplama.render(viewName, contentWindow);
                    rendered = true;
                } else if (window.BrenerApp.Degerleme && ['emlak-deger-tahmini', 'arsa-degerleme', 'emlak-takip', 'emsal-karsilastirma', 'bolge-analizi', 'komisyon-vergi', 'kira-dilekce-asistani'].includes(viewName)) {
                    window.BrenerApp.Degerleme.render(viewName, contentWindow);
                    rendered = true;
                } else if (window.BrenerApp.AI && ['ai-asistan', 'emlak-ai-danisman', 'ai-fotograf-analizi', 'ai-plan-okuma', 'sesli-ai-sefi', 'ai-taslak-plan', 'ai-tadilat-tasarim', 'ai-mekan-yerlesim', 'ai-3d-cephe', 'ai-2d-vaziyet', 'yonetmelik-imar-asistani'].includes(viewName)) {
                    window.BrenerApp.AI.render(viewName, contentWindow);
                    rendered = true;
                } else if (window.BrenerApp.ProjeYonetimi && ['proje-sozlesme-ozeti', 'teknik-sartname'].includes(viewName)) {
                    window.BrenerApp.ProjeYonetimi.render(viewName, contentWindow);
                    rendered = true;
                } else if (window.BrenerApp.Saha && ['musteri-cari', 'is-emirleri', 'tadilat-formu', 'siparis-fisi', 'servis-teklifi', 'randevu-takvimi'].includes(viewName)) {
                    window.BrenerApp.Saha.render(viewName, contentWindow);
                    rendered = true;
                } else if (window.BrenerApp.Belgeler && ['firma-yonetimi', 'gorevlerim', 'firmaya-katil', 'belgeler-projeler', 'belgeler-finans', 'fon-yonetimi', 'belgeler-satis', 'evrak-uretici', 'akilli-arsiv', 'fizibilite', 'belgeler-araclar', 'ayarlar', 'proje-belgeleri', 'ai-evrak-merkezi', 'profil', 'kullanici-yonetimi', 'sistem-loglari'].includes(viewName)) {
                    window.BrenerApp.Belgeler.render(viewName, contentWindow);
                    rendered = true;
                } else if (viewName === 'projelerim') {
                    // Render projects list in app.js as it is core
                    this.renderProjects(contentWindow);
                    rendered = true;
                } else if (viewName === 'hatirlaticilar') {
                    this.renderReminders(contentWindow);
                    rendered = true;
                }

                if (!rendered) {
                    contentWindow.innerHTML = `
                        <div class="card" style="text-align: center; padding: 40px;">
                            <h2>Geliştirme Aşamasında</h2>
                            <p style="color: var(--text-muted); margin-top: 10px;">"${viewName}" modülü çok yakında yayında olacaktır.</p>
                            <button class="btn btn-primary" style="margin-top: 20px;" onclick="window.location.hash='#panel'">Panele Dön</button>
                        </div>
                    `;
                    this.updateTopbarTitle('Modül Hazırlanıyor', 'Brener Platform');
                }
            } catch (err) {
                console.error("Route error: ", err);
                contentWindow.innerHTML = `
                    <div class="card" style="text-align: center; padding: 40px; border-color: var(--danger);">
                        <h2 style="color: var(--danger);">Modül Yükleme Hatası</h2>
                        <p style="color: var(--text-muted); margin-top: 10px;">${err.message}</p>
                        <button class="btn btn-secondary" style="margin-top: 20px;" onclick="window.location.hash='#panel'">Ana Panele Dön</button>
                    </div>
                `;
            }
        }, 200);
    },

    // Header title update helper
    updateTopbarTitle(title, subtitle) {
        document.getElementById('pageTitle').textContent = title;
        document.getElementById('pageSubtitle').textContent = subtitle;
    },

    // Core View Renderer: Projects
    renderProjects(container) {
        this.updateTopbarTitle('Projelerim', 'Aktif Şantiyeler ve Portföy Yönetimi');
        
        let projectsHtml = `
            <div class="card-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
                <h2>Proje Portföyü</h2>
                <button class="btn btn-primary" id="addNewProjectBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Yeni Proje Ekle
                </button>
            </div>
            <div class="dashboard-grid">
        `;

        this.state.projects.forEach(p => {
            const isActive = p.id === this.state.currentProjectId;
            projectsHtml += `
                <div class="card project-card ${isActive ? 'active-project-card' : ''}" style="${isActive ? 'border-color: var(--primary); background: rgba(var(--primary-rgb), 0.05);' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-info'}" style="margin-bottom: 8px;">
                                ${p.status === 'active' ? 'Devam Ediyor' : 'Tamamlandı'}
                            </span>
                            <h3>${p.name}</h3>
                            <p style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                                ${p.location}
                            </p>
                        </div>
                        ${isActive ? '<span style="font-size: 0.7rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">Aktif</span>' : ''}
                    </div>

                    <div style="margin: 20px 0;">
                        <div class="progress-info">
                            <span>İlerleme Oranı</span>
                            <span>%${p.progress}</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${p.progress}%;"></div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px; border-top: 1px solid var(--border-color); padding-top: 16px;">
                        <div>
                            <span>Şantiye Şefi:</span>
                            <strong style="color: var(--text-main); display: block;">${p.manager}</strong>
                        </div>
                        <div>
                            <span>Bütçe Durumu:</span>
                            <strong style="color: var(--text-main); display: block;">${(p.spent/1000000).toFixed(1)}M / ${(p.budget/1000000).toFixed(1)}M TL</strong>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="window.BrenerApp.selectProject(${p.id})">Aktif Yap</button>
                        <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="window.location.hash='#santiye-gunlugu'">Detaylar</button>
                    </div>
                </div>
            `;
        });

        projectsHtml += `</div>`;
        container.innerHTML = projectsHtml;

        // Hook project addition modal
        document.getElementById('addNewProjectBtn').onclick = () => {
            const formHtml = `
                <div class="form-group">
                    <label>Proje Adı</label>
                    <input type="text" id="newProjName" placeholder="Örn: Brener Garden" required>
                </div>
                <div class="form-group">
                    <label>Konum</label>
                    <input type="text" id="newProjLoc" placeholder="Örn: Kadıköy, İstanbul" required>
                </div>
                <div class="form-group">
                    <label>Şantiye Şefi</label>
                    <input type="text" id="newProjManager" placeholder="Örn: Hasan Yılmaz" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Toplam Bütçe (TL)</label>
                        <input type="number" id="newProjBudget" value="10000000" required>
                    </div>
                    <div class="form-group">
                        <label>Başlangıç İlerlemesi (%)</label>
                        <input type="number" id="newProjProgress" value="0" min="0" max="100" required>
                    </div>
                </div>
                <button class="btn btn-primary" id="saveNewProjectBtn" style="width: 100%; margin-top: 10px;">Projeyi Kaydet</button>
            `;
            this.openModal('Yeni Şantiye Projesi Ekle', formHtml);

            document.getElementById('saveNewProjectBtn').onclick = () => {
                const name = document.getElementById('newProjName').value.trim();
                const location = document.getElementById('newProjLoc').value.trim();
                const manager = document.getElementById('newProjManager').value.trim();
                const budget = parseFloat(document.getElementById('newProjBudget').value);
                const progress = parseInt(document.getElementById('newProjProgress').value);

                if (!name || !location || !manager) {
                    alert('Lütfen gerekli tüm alanları doldurun!');
                    return;
                }

                const newProj = {
                    id: Date.now(),
                    name,
                    location,
                    status: 'active',
                    progress,
                    manager,
                    budget,
                    spent: 0
                };

                this.state.projects.push(newProj);
                this.state.currentProjectId = newProj.id;
                this.logActivity('proje', `Yeni şantiye projesi oluşturuldu: ${name}`, 'success', `Bütçe: ${budget} TL, Konum: ${location}`);
                this.saveStateToStorage();
                this.setupProjectSelector();
                this.showToast('success', `${name} projesi başarıyla portföye eklendi ve aktif yapıldı!`);
                document.getElementById('modalCloseBtn').click();
                this.router();
            };
        };
    },

    selectProject(id) {
        this.state.currentProjectId = id;
        this.saveStateToStorage();
        this.setupProjectSelector();
        this.logActivity('proje', `Aktif proje değiştirildi: ${this.getActiveProject().name}`, 'info', `Proje ID: ${id}`);
        this.showToast('success', `Aktif proje değiştirildi: ${this.getActiveProject().name}`);
        this.router();
    },

    // Core View Renderer: Reminders
    renderReminders(container) {
        this.updateTopbarTitle('Hatırlatıcılar & Yapılacaklar', 'Günlük Kontroller ve Kritik Son Tarihler');

        let remindersHtml = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Hatırlatıcı Listesi</h2>
                        <button class="btn btn-primary btn-sm" id="newReminderBtn">
                            Yeni Ekle
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Durum</th>
                                    <th>Başlık</th>
                                    <th>Son Tarih</th>
                                    <th>Öncelik</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        this.state.reminders.forEach(r => {
            remindersHtml += `
                <tr style="${r.done ? 'opacity: 0.5;' : ''}">
                    <td>
                        <input type="checkbox" ${r.done ? 'checked' : ''} onchange="window.BrenerApp.toggleReminder(${r.id})" style="cursor: pointer; width: 18px; height: 18px;">
                    </td>
                    <td>
                        <span style="${r.done ? 'text-decoration: line-through;' : 'font-weight: 500;'}">${r.title}</span>
                    </td>
                    <td>${r.date}</td>
                    <td>
                        <span class="badge ${r.priority === 'high' ? 'badge-danger' : r.priority === 'medium' ? 'badge-warning' : 'badge-info'}">
                            ${r.priority === 'high' ? 'Yüksek' : r.priority === 'medium' ? 'Orta' : 'Düşük'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="window.BrenerApp.deleteReminder(${r.id})">Sil</button>
                    </td>
                </tr>
            `;
        });

        remindersHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Hızlı Not Al</h2>
                    </div>
                    <textarea placeholder="Şantiyeden hızlı notlarınızı buraya yazın..." style="height: 150px; margin-bottom: 16px;"></textarea>
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.showToast('success', 'Şantiye notu başarıyla kaydedildi.')">Notu Kaydet</button>
                </div>
            </div>
        `;

        container.innerHTML = remindersHtml;

        // Hook reminder add
        document.getElementById('newReminderBtn').onclick = () => {
            const formHtml = `
                <div class="form-group">
                    <label>Hatırlatıcı Başlığı</label>
                    <input type="text" id="newRemTitle" placeholder="Örn: Demir teslimatı kontrolü" required>
                </div>
                <div class="form-group">
                    <label>Tarih</label>
                    <input type="date" id="newRemDate" value="2026-06-25" required>
                </div>
                <div class="form-group">
                    <label>Öncelik Seviyesi</label>
                    <select id="newRemPriority">
                        <option value="high">Yüksek</option>
                        <option value="medium" selected>Orta</option>
                        <option value="low">Düşük</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="saveNewRemBtn" style="width: 100%; margin-top: 10px;">Hatırlatıcıyı Ekle</button>
            `;
            this.openModal('Yeni Hatırlatıcı Ekle', formHtml);

            document.getElementById('saveNewRemBtn').onclick = () => {
                const title = document.getElementById('newRemTitle').value.trim();
                const date = document.getElementById('newRemDate').value;
                const priority = document.getElementById('newRemPriority').value;

                if (!title) {
                    alert('Lütfen başlık girin!');
                    return;
                }

                this.state.reminders.push({
                    id: Date.now(),
                    title,
                    date,
                    priority,
                    done: false
                });

                this.logActivity('sistem', `Yeni hatırlatıcı eklendi: ${title}`, 'success', `Son Tarih: ${date}, Öncelik: ${priority}`);
                this.saveStateToStorage();
                this.showToast('success', 'Yeni hatırlatıcı başarıyla eklendi.');
                document.getElementById('modalCloseBtn').click();
                this.router();
            };
        };
    },

    toggleReminder(id) {
        const r = this.state.reminders.find(rem => rem.id === id);
        if (r) {
            r.done = !r.done;
            this.saveStateToStorage();
            this.logActivity('sistem', `Hatırlatıcı durumu güncellendi: ${r.title} (${r.done ? 'Tamamlandı' : 'Yapılacak'})`, 'info');
            this.showToast('success', `Hatırlatıcı durumu güncellendi.`);
            this.router();
        }
    },

    deleteReminder(id) {
        const r = this.state.reminders.find(rem => rem.id === id);
        const title = r ? r.title : id;
        this.state.reminders = this.state.reminders.filter(rem => rem.id !== id);
        this.saveStateToStorage();
        this.logActivity('sistem', `Hatırlatıcı silindi: ${title}`, 'warning');
        this.showToast('danger', 'Hatırlatıcı listeden silindi.');
        this.router();
    },

    checkAuthentication() {
        const overlay = document.getElementById('loginOverlay');
        
        if (!this.state.currentUser) {
            document.body.classList.add('auth-mode');
            
            // Setup submit listener
            const submitBtn = document.getElementById('loginSubmitBtn');
            submitBtn.onclick = () => {
                const email = document.getElementById('loginEmail').value.trim();
                const pass = document.getElementById('loginPassword').value.trim();
                
                const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
                if (user) {
                    this.state.currentUser = user;
                    this.saveStateToStorage();
                    this.logActivity('sistem', `Başarılı giriş yapıldı: ${user.name} (${user.email})`, 'success', `Rol: ${user.role}`);
                    this.showToast('success', `Başarıyla giriş yapıldı. Hoş geldiniz, ${user.name}!`);
                    document.body.classList.remove('auth-mode');
                    this.initAppSession();
                    window.location.hash = '#panel';
                    this.router();
                } else {
                    this.showToast('danger', 'Hatalı e-posta adresi veya şifre!');
                }
            };
        } else {
            document.body.classList.remove('auth-mode');
            this.initAppSession();
        }
    },

    fillLogin(email, password) {
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = password;
        document.getElementById('loginSubmitBtn').click();
    },

    initAppSession() {
        const user = this.state.currentUser;
        if (!user) return;

        // Render initials in top bar avatar
        const avatar = document.querySelector('.profile-avatar');
        if (avatar) {
            const parts = user.name.split(' ');
            const initials = parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
            avatar.textContent = initials;
        }

        // Render user name and role
        const profileName = document.querySelector('.profile-name');
        const profileRole = document.querySelector('.profile-role');
        if (profileName) profileName.textContent = user.name;
        if (profileRole) {
            const roleLabels = { admin: 'Yönetici', sefi: 'Şantiye Şefi', muhasebe: 'Muhasebeci', saha: 'Saha Ekibi' };
            profileRole.textContent = roleLabels[user.role] || user.role;
        }

        this.applyRolePermissions();
    },

    applyRolePermissions() {
        const user = this.state.currentUser;
        if (!user) return;

        const role = user.role;
        const perms = this.state.rolePermissions[role] || {};

        // Manage "Kullanıcı & Yetki Yönetimi" link
        const adminLink = document.getElementById('menuItemKullaniciYonetimi');
        if (adminLink) {
            if (role === 'admin') {
                adminLink.style.display = 'flex';
            } else {
                adminLink.style.display = 'none';
            }
        }

        // Hide/Show sidebar groups
        document.querySelectorAll('.nav-group').forEach(group => {
            const groupCode = group.getAttribute('data-group');
            if (!groupCode) return;

            // Admin bypasses all checks
            if (role === 'admin') {
                group.style.display = 'block';
                return;
            }

            // Check configuration matrix
            if (perms[groupCode] === true) {
                group.style.display = 'block';
            } else {
                group.style.display = 'none';
            }
        });
    }
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.BrenerApp.init();
});
