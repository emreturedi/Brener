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
            customerPresentations: [],
            notifications: [],
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
        profile: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        timeline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="5" x2="20" y2="5"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="19" x2="20" y2="19"/><circle cx="5" cy="5" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="19" r="1"/></svg>`,
        budget: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="M12 11h4v2h-4z"/><circle cx="7" cy="12" r="2"/></svg>`,
        reports: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
        radar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
        crm: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
        support: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        presentation: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`
    },

    // Initialize application
    init() {
        this.loadIcons();
        this.setupEventListeners();
        this.loadState();
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
                    
                    // Clear credentials from localStorage
                    localStorage.removeItem('brener_jwt_token');
                    localStorage.removeItem('brener_current_user');
                    localStorage.removeItem('brener_app_state');
                    
                    this.state.currentUser = null;
                    this.showToast('danger', 'Sistemden çıkış yapılıyor...');
                    setTimeout(() => {
                        window.location.hash = '';
                        window.location.reload();
                    }, 1000);
                });
    },

    // State Load with Rich Preloaded Mock Database
    async loadState() {
        const token = localStorage.getItem('brener_jwt_token');
        if (!token) {
            this.state.currentUser = null;
            this.checkAuthentication();
            return;
        }

        // Show loading indicator
        const contentWindow = document.getElementById('contentWindow');
        if (contentWindow) {
            contentWindow.innerHTML = `
                <div class="loading-spinner-wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 400px;">
                    <div class="spinner" style="border: 4px solid rgba(255,255,255,0.1); width: 50px; height: 50px; border-radius: 50%; border-left-color: var(--primary); animation: spin 1s linear infinite;"></div>
                    <p style="margin-top: 20px; font-weight: bold; color: var(--text-muted);">Veriler Yükleniyor...</p>
                </div>
            `;
        }

        try {
            const response = await fetch('/api/state', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('brener_jwt_token');
                    localStorage.removeItem('brener_current_user');
                    window.location.reload();
                    return;
                }
                throw new Error("Failed to load state");
            }

            const stateData = await response.json();
            this.state = stateData;
            
            // Ensure all required state keys exist (upgrade/migration check)
            if (!this.state.hakedisContracts) {
                this.initHakedisState();
            }
            if (!this.state.tasks) this.state.tasks = [];
            if (!this.state.crmLeads) this.state.crmLeads = [];
            if (!this.state.budgetTransactions) this.state.budgetTransactions = [];
            if (!this.state.claims) this.state.claims = [];
            if (!this.state.theme) this.state.theme = 'dark';
            if (!this.state.rolePermissions || Object.keys(this.state.rolePermissions).length === 0) {
                this.state.rolePermissions = {
                    sefi: { genel: true, santiye: true, seflik: true, finans: false, hesaplama: true, degerleme: false, ai: true, saha: false, ekip: true, belgeler: true },
                    muhasebe: { genel: true, santiye: false, seflik: false, finans: true, hesaplama: false, degerleme: true, ai: false, saha: false, ekip: false, belgeler: true },
                    saha: { genel: true, santiye: false, seflik: false, finans: false, hesaplama: false, degerleme: false, ai: false, saha: true, ekip: true, belgeler: true }
                };
            }
            if (!this.state.logs) this.state.logs = [];
            if (!this.state.projectContracts) this.state.projectContracts = {};
            if (!this.state.projectSpecs) this.state.projectSpecs = {};
            if (!this.state.specTemplates) this.state.specTemplates = [];
            if (!this.state.customerPresentations) this.state.customerPresentations = [];
            if (!this.state.notifications) this.state.notifications = [];
            if (!this.state.reminders) this.state.reminders = [];
            
            // Set current user from local storage token
            this.state.currentUser = JSON.parse(localStorage.getItem('brener_current_user'));
            
            // Initialize App
            this.initAppSession();
            this.setupProjectSelector();
            this.setupNotifications();
            this.setupMenuSearch();
            this.loadIcons();
            this.router();
            
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
        } catch (err) {
            console.error("Load state error:", err);
            this.showToast('danger', 'Veriler sunucudan yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
        }
    },
    
    // Save State
    saveStateToStorage() {
        localStorage.setItem('brener_app_state', JSON.stringify(this.state));
        const token = localStorage.getItem('brener_jwt_token');
        if (token) {
            fetch('/api/state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(this.state)
            }).catch(err => console.error("Sync state error:", err));
        }
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
            'talepler': 'genel',
            'santiye-gunlugu': 'santiye',
            'is-programi': 'santiye',
            'personel-puantaj': 'santiye',
            'malzeme-stok': 'santiye',
            'isg-kaza': 'santiye',
            'hava-beton': 'santiye',
            'musteri-raporu': 'santiye',
            'malik-raporu': 'santiye',
            'hakedis-yonetim': 'hakedis-yonetim',
            'butce-maliyet': 'hakedis-yonetim',
            'proje-sozlesme-ozeti': 'proje-yonetimi',
            'teknik-sartname': 'proje-yonetimi',
            'musteri-sunumlari': 'proje-yonetimi',
            'proje-asamalari': 'proje-yonetimi',
            'musteri-takip': 'proje-yonetimi',
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
            'sektor-radari': 'degerleme',
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
            'kullanici-yonetimi': 'belgeler',
            'sistem-loglari': 'belgeler'
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
                } else if (window.BrenerApp.Santiye && ['santiye-gunlugu', 'is-programi', 'personel-puantaj', 'malzeme-stok', 'isg-kaza', 'hava-beton', 'musteri-raporu', 'malik-raporu'].includes(viewName)) {
                    window.BrenerApp.Santiye.render(viewName, contentWindow);
                    rendered = true;
                                } else if (window.BrenerApp.Finans && ['hakedis', 'hakedis-yonetim', 'tahsilat-takibi', 'teklif-sozlesme', 'kat-karsiligi', 'muhasebe-disa-aktar', 'butce-maliyet'].includes(viewName)) {
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
                                                                } else if (window.BrenerApp.ProjeYonetimi && ['proje-sozlesme-ozeti', 'teknik-sartname', 'musteri-sunumlari', 'proje-asamalari', 'musteri-takip'].includes(viewName)) {
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
                } else if (window.BrenerApp.Talepler && viewName === 'talepler') {
                    window.BrenerApp.Talepler.render(contentWindow);
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
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
                    Şantiye bilgilerini girin ve pano şablonu seçin
                </div>
                <div class="form-group">
                    <label>Şantiye Adı</label>
                    <input type="text" id="newProjName" placeholder="Park Rezidans" required style="width: 100%;">
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div class="form-group">
                        <label>Şantiye Kodu</label>
                        <input type="text" id="newProjCode" placeholder="PR-001" required style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>İl</label>
                        <input type="text" id="newProjCity" placeholder="İstanbul" required style="width: 100%;">
                    </div>
                </div>
                <div class="form-group">
                    <label>Adres</label>
                    <input type="text" id="newProjAddress" placeholder="Kadıköy, Caferağa Mah." required style="width: 100%;">
                </div>
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 4px;">Başlangıç Tarihi <span style="color:#ef4444;">*</span></label>
                    <input type="date" id="newProjStartDate" required style="width: 100%;">
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 4px;">Varsayılan aşamalar tanımlıysa bu tarihten itibaren otomatik takvimlenir.</span>
                </div>
                
                <div style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 20px; margin-bottom: 20px;">
                    <label style="font-weight: 700; color: var(--primary); font-size: 0.9rem; margin-bottom: 4px; display: block;">Hedef Bütçe (m² bazında)</label>
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 12px;">Toplam inşaat alanı ve m² hedef maliyetini girin; sistem ana hedef bütçeyi otomatik hesaplar ve aşamalara dağıtır.</span>
                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label>Toplam İnşaat Alanı (m²)</label>
                            <input type="number" id="newProjArea" placeholder="ör: 12500" required style="width: 100%;">
                        </div>
                        <div class="form-group">
                            <label>m² Hedef Maliyet</label>
                            <input type="number" id="newProjUnitCost" placeholder="ör: 15000" required style="width: 100%;">
                        </div>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 20px; margin-bottom: 24px;">
                    <label>Pano Şablonu</label>
                    <select id="newProjTemplate" class="custom-select" style="width:100%; padding:10px; background:var(--bg-dark); border:1px solid var(--border-color); border-radius:8px; color:var(--text-main);">
                        <option value="none">Şablonsuz oluştur</option>
                        <option value="std_resi">Standart 6-7 Katlı Konut Şantiyesi</option>
                        <option value="permit">Yapı Ruhsatı Süreci</option>
                        <option value="eia">ÇED (Çevresel Etki Değerlendirmesi)</option>
                        <option value="rough">Demirli Kaba İnşaat Şablonu</option>
                        <option value="luxury">Lüks Site ve Sosyal Donatı Projesi (Çok Bloklu)</option>
                        <option value="half_us">Yarısı Bizden & Kentsel Dönüşüm Projesi</option>
                        <option value="occupancy">İskan (Yapı Kullanma İzin) Süreci</option>
                    </select>
                </div>
                
                <button class="btn btn-primary" id="saveNewProjectBtn" style="width: 100%; font-weight: 700; padding: 12px;">Oluştur</button>
            `;
            this.openModal('Yeni Şantiye Oluştur', formHtml);

            document.getElementById('saveNewProjectBtn').onclick = () => {
                const name = document.getElementById('newProjName').value.trim();
                const code = document.getElementById('newProjCode').value.trim();
                const city = document.getElementById('newProjCity').value.trim();
                const address = document.getElementById('newProjAddress').value.trim();
                const startDateStr = document.getElementById('newProjStartDate').value;
                const area = parseFloat(document.getElementById('newProjArea').value) || 0;
                const unitCost = parseFloat(document.getElementById('newProjUnitCost').value) || 0;
                const template = document.getElementById('newProjTemplate').value;

                if (!name || !code || !city || !address || !startDateStr) {
                    alert('Lütfen gerekli tüm alanları doldurun!');
                    return;
                }

                const budget = area * unitCost;

                const newProj = {
                    id: Date.now(),
                    name: name,
                    code: code,
                    city: city,
                    location: `${city}, ${address}`,
                    startDate: startDateStr,
                    area: area,
                    unitCost: unitCost,
                    budget: budget,
                    spent: 0,
                    progress: 0,
                    status: 'active',
                    manager: this.state.currentUser ? this.state.currentUser.name : 'Belirtilmedi'
                };

                // Generate templates stages (phases)
                const baseDate = new Date(startDateStr);
                function addDays(date, days) {
                    const result = new Date(date);
                    result.setDate(result.getDate() + days);
                    const d = String(result.getDate()).padStart(2, '0');
                    const m = String(result.getMonth() + 1).padStart(2, '0');
                    const y = result.getFullYear();
                    return `${d}.${m}.${y}`;
                }

                let phases = [];
                if (template === 'std_resi') {
                    phases = [
                        { id: 1, name: 'Hafriyat & Temel', status: 'Şu Anki Aşama', date: addDays(baseDate, 0), progress: '0/3 görev', percent: 0, alert: null },
                        { id: 2, name: 'Kaba İnşaat (1-3. Kat)', status: 'Tamamlanmadı', date: addDays(baseDate, 75), progress: '0/4 görev', percent: 0, alert: null },
                        { id: 3, name: 'Kaba İnşaat (4-7. Kat)', status: 'Tamamlanmadı', date: addDays(baseDate, 150), progress: '0/4 görev', percent: 0, alert: null },
                        { id: 4, name: 'Çatı & Dış Cephe', status: 'Tamamlanmadı', date: addDays(baseDate, 195), progress: '0/3 görev', percent: 0, alert: null },
                        { id: 5, name: 'İnce İşler & Tesisat', status: 'Tamamlanmadı', date: addDays(baseDate, 270), progress: '0/5 görev', percent: 0, alert: null },
                        { id: 6, name: 'Peyzaj & Teslim', status: 'Tamamlanmadı', date: addDays(baseDate, 330), progress: '0/2 görev', percent: 0, alert: null }
                    ];
                } else if (template === 'permit') {
                    phases = [
                        { id: 1, name: 'Aplikasyon Krokisi & İmar Durumu', status: 'Şu Anki Aşama', date: addDays(baseDate, 0), progress: '0/2 görev', percent: 0, alert: null },
                        { id: 2, name: 'Mimari, Statik, Tesisat Projeleri Çizimi', status: 'Tamamlanmadı', date: addDays(baseDate, 30), progress: '0/4 görev', percent: 0, alert: null },
                        { id: 3, name: 'Zemin Etüdü & Yapı Denetim Anlaşması', status: 'Tamamlanmadı', date: addDays(baseDate, 45), progress: '0/2 görev', percent: 0, alert: null },
                        { id: 4, name: 'Belediye Proje Onay Süreci', status: 'Tamamlanmadı', date: addDays(baseDate, 75), progress: '0/3 görev', percent: 0, alert: null },
                        { id: 5, name: 'Yapı Ruhsatı Harçları & Ruhsat Alımı', status: 'Tamamlanmadı', date: addDays(baseDate, 90), progress: '0/2 görev', percent: 0, alert: null }
                    ];
                } else if (template === 'eia') {
                    phases = [
                        { id: 1, name: 'ÇED Başvuru Dosyasının Sunulması', status: 'Şu Anki Aşama', date: addDays(baseDate, 0), progress: '0/2 görev', percent: 0, alert: null },
                        { id: 2, name: 'Halkın Katılımı Toplantısı', status: 'Tamamlanmadı', date: addDays(baseDate, 35), progress: '0/1 görev', percent: 0, alert: null },
                        { id: 3, name: 'Kapsam Belirleme ve Özel Format Oluşturma', status: 'Tamamlanmadı', date: addDays(baseDate, 65), progress: '0/2 görev', percent: 0, alert: null },
                        { id: 4, name: 'ÇED Raporunun İDK Değerlendirmesi', status: 'Tamamlanmadı', date: addDays(baseDate, 125), progress: '0/3 görev', percent: 0, alert: null },
                        { id: 5, name: 'ÇED Olumlu / Olumsuz Kararının Verilmesi', status: 'Tamamlanmadı', date: addDays(baseDate, 155), progress: '0/1 görev', percent: 0, alert: null }
                    ];
                } else if (template === 'rough') {
                    phases = [
                        { id: 1, name: 'Aks Ölçümü & Kazı Çalışmaları', status: 'Şu Anki Aşama', date: addDays(baseDate, 0), progress: '0/2 görev', percent: 0, alert: null },
                        { id: 2, name: 'Grobeton & Temel Yalıtımı', status: 'Tamamlanmadı', date: addDays(baseDate, 15), progress: '0/2 görev', percent: 0, alert: null },
                        { id: 3, name: 'Radye Temel Demiri & Beton Dökümü', status: 'Tamamlanmadı', date: addDays(baseDate, 35), progress: '0/3 görev', percent: 0, alert: null },
                        { id: 4, name: 'Bodrum Kat Betonarme Perde & Kolonlar', status: 'Tamamlanmadı', date: addDays(baseDate, 55), progress: '0/3 görev', percent: 0, alert: null },
                        { id: 5, name: 'Tip Kat Tabliye Demiri & Betonarme İmalatları', status: 'Tamamlanmadı', date: addDays(baseDate, 115), progress: '0/4 görev', percent: 0, alert: null }
                    ];
                } else if (template === 'luxury') {
                    phases = [
                        { id: 1, name: 'Şantiye Mobilizasyonu & İstinat Yapıları', status: 'Şu Anki Aşama', date: addDays(baseDate, 0), progress: '0/3 görev', percent: 0, alert: null },
                        { id: 2, name: 'Blok Temelleri & Altyapı İşleri', status: 'Tamamlanmadı', date: addDays(baseDate, 90), progress: '0/4 görev', percent: 0, alert: null },
                        { id: 3, name: 'Çok Bloklu Kaba Yapı İmalatı', status: 'Tamamlanmadı', date: addDays(baseDate, 300), progress: '0/5 görev', percent: 0, alert: null },
                        { id: 4, name: 'Sosyal Tesis, Havuz & Spor Alanları', status: 'Tamamlanmadı', date: addDays(baseDate, 390), progress: '0/3 görev', percent: 0, alert: null },
                        { id: 5, name: 'İç Mimari Uygulamalar & İnce İşçilikler', status: 'Tamamlanmadı', date: addDays(baseDate, 480), progress: '0/6 görev', percent: 0, alert: null },
                        { id: 6, name: 'Peyzaj, Rekreasyon & Anahtar Teslim', status: 'Tamamlanmadı', date: addDays(baseDate, 570), progress: '0/2 görev', percent: 0, alert: null }
                    ];
                } else if (template === 'half_us') {
                    phases = [
                        { id: 1, name: 'Riskli Yapı Tespiti & Karot Alımı', status: 'Şu Anki Aşama', date: addDays(baseDate, 0), progress: '0/2 görev', percent: 0, alert: null },
                        { id: 2, name: 'Hak Sahipleri Anlaşma & Karar Protokolü', status: 'Tamamlanmadı', date: addDays(baseDate, 50), progress: '0/3 görev', percent: 0, alert: null },
                        { id: 3, name: 'ÇŞB Yarısı Bizden Başvurusu', status: 'Tamamlanmadı', date: addDays(baseDate, 80), progress: '0/2 görev', percent: 0, alert: null },
                        { id: 4, name: 'Eski Binanın Tahliyesi & Yıkımı', status: 'Tamamlanmadı', date: addDays(baseDate, 125), progress: '0/3 görev', percent: 0, alert: null },
                        { id: 5, name: 'Yeni Bina Projelendirme & İnşaat Süreci', status: 'Tamamlanmadı', date: addDays(baseDate, 515), progress: '0/5 görev', percent: 0, alert: null }
                    ];
                } else if (template === 'occupancy') {
                    phases = [
                        { id: 1, name: 'SGK ve Vergi Dairesi İlişiksiz Belgeleri', status: 'Şu Anki Aşama', date: addDays(baseDate, 0), progress: '0/2 görev', percent: 0, alert: null },
                        { id: 2, name: 'TSE, Asansör, İtfaiye Uygunluk Raporları', status: 'Tamamlanmadı', date: addDays(baseDate, 20), progress: '0/4 görev', percent: 0, alert: null },
                        { id: 3, name: 'Yapı Denetim Kuruluşu Sertifikası', status: 'Tamamlanmadı', date: addDays(baseDate, 30), progress: '0/2 görev', percent: 0, alert: null },
                        { id: 4, name: 'Belediye İskan Teknik Heyet Muayenesi', status: 'Tamamlanmadı', date: addDays(baseDate, 50), progress: '0/3 görev', percent: 0, alert: null },
                        { id: 5, name: 'İskan Harçlarının Yatırılması & İskan Alımı', status: 'Tamamlanmadı', date: addDays(baseDate, 65), progress: '0/2 görev', percent: 0, alert: null }
                    ];
                }

                if (phases.length > 0) {
                    localStorage.setItem(`brener_phases_${newProj.id}`, JSON.stringify(phases));
                }

                this.state.projects.push(newProj);
                this.state.currentProjectId = newProj.id;
                this.logActivity('proje', `Yeni şantiye projesi oluşturuldu: ${name}`, 'success', `Bütçe: ${budget} TL, Konum: ${city}`);
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
        if (!overlay) return;
        
        document.body.classList.add('auth-mode');
        
        // Login Submit
        const submitBtn = document.getElementById('loginSubmitBtn');
        if (submitBtn) {
            submitBtn.onclick = async () => {
                const email = document.getElementById('loginEmail').value.trim();
                const pass = document.getElementById('loginPassword').value.trim();
                
                if (!email || !pass) {
                    this.showToast('danger', 'E-posta ve şifre gereklidir!');
                    return;
                }
                
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password: pass })
                    });
                    
                    const result = await response.json();
                    if (!response.ok) {
                        throw new Error(result.error || 'Giriş başarısız');
                    }
                    
                    localStorage.setItem('brener_jwt_token', result.token);
                    localStorage.setItem('brener_current_user', JSON.stringify(result.user));
                    this.state.currentUser = result.user;
                    
                    this.showToast('success', `Hoş geldiniz, ${result.user.name}!`);
                    document.body.classList.remove('auth-mode');
                    
                    // Reload state to fetch this company's data
                    await this.loadState();
                } catch (err) {
                    console.error("Login failed:", err);
                    this.showToast('danger', err.message);
                }
            };
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

        // Hide login overlay and show dashboard container
        document.body.classList.remove('auth-mode');

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

        this.updateLogoImages();
        this.applyRolePermissions();
    },

    updateLogoImages() {
        const logoSrc = this.state.companyLogo || 'logo.png';
        const loginLogo = document.getElementById('loginLogoImg');
        const sidebarLogo = document.getElementById('sidebarLogoImg');
        if (loginLogo) loginLogo.src = logoSrc;
        if (sidebarLogo) sidebarLogo.src = logoSrc;
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
                    },
                
                    initHakedisState() {
                        this.state.hakedisContracts = [
                            {
                                id: 'con_1',
                                projectId: 101, // Bodrum Port Konakları
                                contractorName: "Öz Yapı Cephe Sistemleri A.Ş.",
                                workDescription: "Dış Cephe Kompozit Panel ve Strüktürel Silikonlu Cam Cephe Kaplama İmalatları",
                                contractDate: "2026-01-10",
                                siteHandoverDate: "2026-01-15",
                                contractEndDate: "2026-10-15",
                                contractAmountUsd: 150000.00,
                                contractAmountTry: 3500000.00,
                                advanceGivenUsd: 30000.00,
                                advancePercentUsd: 0.20, // %20
                                cashGuaranteeRate: 0.05, // %5
                                vatRate: 0.20, // %20
                                vatWithholdingRate: 0.40, // 4/10 tevkifat
                                stoppageRate: 0.03, // %3 stopaj
                                status: "ACTIVE"
                            }
                        ];
                
                        this.state.hakedisContractItems = [
                            {
                                id: 'item_1',
                                contractId: 'con_1',
                                itemCode: "13.A.1",
                                groupCode: "13.A",
                                description: "Alüminyum Alt Konstrüksiyon ve Ankraj Montajı",
                                unit: "m²",
                                unitPriceUsd: 12.00,
                                unitPriceTry: 300.00,
                                contractQty: 1800
                            },
                            {
                                id: 'item_2',
                                contractId: 'con_1',
                                itemCode: "13.A.2",
                                groupCode: "13.A",
                                description: "Taşyünü Yalıtım Levhası Uygulaması (5cm kalınlık, 150 yoğunluk)",
                                unit: "m²",
                                unitPriceUsd: 8.00,
                                unitPriceTry: 200.00,
                                contractQty: 1800
                            },
                            {
                                id: 'item_3',
                                contractId: 'con_1',
                                itemCode: "13.B.1",
                                groupCode: "13.B",
                                description: "Alüminyum Kompozit Levha (4mm kalınlık, PVDF boyalı) Cephe Kaplaması",
                                unit: "m²",
                                unitPriceUsd: 35.00,
                                unitPriceTry: 900.00,
                                contractQty: 1200
                            },
                            {
                                id: 'item_4',
                                contractId: 'con_1',
                                itemCode: "13.B.2",
                                groupCode: "13.B",
                                description: "Strüktürel Silikonlu Çift Cam Cephe Kaplama (6+12+6 Temperli Konfor Cam)",
                                unit: "m²",
                                unitPriceUsd: 95.00,
                                unitPriceTry: 2500.00,
                                contractQty: 600
                            }
                        ];
                
                        this.state.progressPayments = [];
                        this.state.periodItemEntries = [];
                        this.state.otherDeductionEntries = [];
                        this.state.defectDeductions = [];
                        this.state.siteRecords = [];
                        this.state.paymentApprovals = [];
                
                        // Now, seed a completed Period 1 progress payment
                        const pay1Id = 'pay_1';
                        this.state.progressPayments.push({
                            id: pay1Id,
                            contractId: 'con_1',
                            paymentNo: 1,
                            isFinal: false,
                            periodDate: "2026-05-15",
                            status: "APPROVED",
                            prevCumulativeUsd: 0,
                            prevCumulativeTry: 0,
                            manufacturingAmountUsd: 36000.00,
                            manufacturingAmountTry: 920000.00,
                            additionsAmountUsd: 2000.00,
                            additionsAmountTry: 50000.00,
                            servicesAmountUsd: 1000.00,
                            servicesAmountTry: 20000.00,
                            grossAmountUsd: 39000.00,
                            grossAmountTry: 990000.00,
                            vatAmountUsd: 7800.00,
                            vatAmountTry: 198000.00,
                            vatWithholdingUsd: -3120.00,
                            vatWithholdingTry: -79200.00,
                            grossWithVatUsd: 43680.00,
                            grossWithVatTry: 1108800.00,
                            advanceDeductionUsd: 7200.00,
                            advanceDeductionTry: 0.00,
                            cashGuaranteeDeductionUsd: 1800.00,
                            cashGuaranteeDeductionTry: 46000.00,
                            stoppageDeductionUsd: 1170.00,
                            stoppageDeductionTry: 29700.00,
                            penaltyDeductionUsd: 0.00,
                            penaltyDeductionTry: 0.00,
                            otherDeductionsUsd: 0.00,
                            otherDeductionsTry: 0.00,
                            totalDeductionsUsd: 10170.00,
                            totalDeductionsTry: 75700.00,
                            netPayableUsd: 33510.00,
                            netPayableTry: 1033100.00
                        });
                
                        // Seed entries for Period 1
                        this.state.periodItemEntries.push(
                            { id: 'e1_1', progressPaymentId: pay1Id, contractItemId: 'item_1', periodQty: 800, cumulativeQty: 800, periodAmountUsd: 9600, periodAmountTry: 240000, cumulativeAmountUsd: 9600, cumulativeAmountTry: 240000, measurementDetails: [], note: "" },
                            { id: 'e1_2', progressPaymentId: pay1Id, contractItemId: 'item_2', periodQty: 800, cumulativeQty: 800, periodAmountUsd: 6400, periodAmountTry: 160000, cumulativeAmountUsd: 6400, cumulativeAmountTry: 160000, measurementDetails: [], note: "" },
                            { id: 'e1_3', progressPaymentId: pay1Id, contractItemId: 'item_3', periodQty: 300, cumulativeQty: 300, periodAmountUsd: 10500, periodAmountTry: 270000, cumulativeAmountUsd: 10500, cumulativeAmountTry: 270000, measurementDetails: [], note: "" },
                            { id: 'e1_4', progressPaymentId: pay1Id, contractItemId: 'item_4', periodQty: 100, cumulativeQty: 100, periodAmountUsd: 9500, periodAmountTry: 250000, cumulativeAmountUsd: 9500, cumulativeAmountTry: 250000, measurementDetails: [], note: "" }
                        );
                
                        // Seed Period 2 as DRAFT
                        const pay2Id = 'pay_2';
                        this.state.progressPayments.push({
                            id: pay2Id,
                            contractId: 'con_1',
                            paymentNo: 2,
                            isFinal: false,
                            periodDate: "2026-06-15",
                            status: "DRAFT",
                            prevCumulativeUsd: 39000.00,
                            prevCumulativeTry: 990000.00,
                            manufacturingAmountUsd: 0,
                            manufacturingAmountTry: 0,
                            additionsAmountUsd: 0,
                            additionsAmountTry: 0,
                            servicesAmountUsd: 0,
                            servicesAmountTry: 0,
                            grossAmountUsd: 0,
                            grossAmountTry: 0,
                            vatAmountUsd: 0,
                            vatAmountTry: 0,
                            vatWithholdingUsd: 0,
                            vatWithholdingTry: 0,
                            grossWithVatUsd: 0,
                            grossWithVatTry: 0,
                            advanceDeductionUsd: 0,
                            advanceDeductionTry: 0,
                            cashGuaranteeDeductionUsd: 0,
                            cashGuaranteeDeductionTry: 0,
                            stoppageDeductionUsd: 0,
                            stoppageDeductionTry: 0,
                            penaltyDeductionUsd: 0,
                            penaltyDeductionTry: 0,
                            otherDeductionsUsd: 0,
                            otherDeductionsTry: 0,
                            totalDeductionsUsd: 0,
                            totalDeductionsTry: 0,
                            netPayableUsd: 0,
                            netPayableTry: 0
                        });
                
                        // Seed entries for Period 2
                        this.state.periodItemEntries.push(
                            { id: 'e2_1', progressPaymentId: pay2Id, contractItemId: 'item_1', periodQty: 0, cumulativeQty: 800, periodAmountUsd: 0, periodAmountTry: 0, cumulativeAmountUsd: 9600, cumulativeAmountTry: 240000, measurementDetails: [], note: "" },
                            { id: 'e2_2', progressPaymentId: pay2Id, contractItemId: 'item_2', periodQty: 0, cumulativeQty: 800, periodAmountUsd: 0, periodAmountTry: 0, cumulativeAmountUsd: 6400, cumulativeAmountTry: 160000, measurementDetails: [], note: "" },
                            { id: 'e2_3', progressPaymentId: pay2Id, contractItemId: 'item_3', periodQty: 0, cumulativeQty: 300, periodAmountUsd: 0, periodAmountTry: 0, cumulativeAmountUsd: 10500, cumulativeAmountTry: 270000, measurementDetails: [], note: "" },
                            { id: 'e2_4', progressPaymentId: pay2Id, contractItemId: 'item_4', periodQty: 0, cumulativeQty: 100, periodAmountUsd: 0, periodAmountTry: 0, cumulativeAmountUsd: 9500, cumulativeAmountTry: 250000, measurementDetails: [], note: "" }
                        );
                
                        this.calculateProgressPayment(pay2Id);
                    },
                
                    calculateProgressPayment(paymentId) {
                        const pay = this.state.progressPayments.find(p => p.id === paymentId);
                        if (!pay) return;
                        const contract = this.state.hakedisContracts.find(c => c.id === pay.contractId);
                        if (!contract) return;
                
                        // 1. Previous Cumulative Gross
                        const prevPay = this.state.progressPayments.find(p => p.contractId === pay.contractId && p.paymentNo === pay.paymentNo - 1);
                        pay.prevCumulativeUsd = prevPay ? (prevPay.prevCumulativeUsd + prevPay.grossAmountUsd) : 0;
                        pay.prevCumulativeTry = prevPay ? (prevPay.prevCumulativeTry + prevPay.grossAmountTry) : 0;
                
                        // 2. Manufacturing amounts from entries
                        let totalPeriodMfgUsd = 0;
                        let totalPeriodMfgTry = 0;
                
                        const currentEntries = this.state.periodItemEntries.filter(e => e.progressPaymentId === paymentId);
                        const items = this.state.hakedisContractItems.filter(i => i.contractId === pay.contractId);
                
                        currentEntries.forEach(entry => {
                            const item = items.find(i => i.id === entry.contractItemId);
                            if (!item) return;
                
                            entry.periodAmountUsd = entry.periodQty * item.unitPriceUsd;
                            entry.periodAmountTry = entry.periodQty * item.unitPriceTry;
                
                            let prevQty = 0;
                            if (prevPay) {
                                const prevEntry = this.state.periodItemEntries.find(e => e.progressPaymentId === prevPay.id && e.contractItemId === item.id);
                                if (prevEntry) prevQty = prevEntry.cumulativeQty;
                            }
                
                            entry.cumulativeQty = prevQty + entry.periodQty;
                            entry.cumulativeAmountUsd = entry.cumulativeQty * item.unitPriceUsd;
                            entry.cumulativeAmountTry = entry.cumulativeQty * item.unitPriceTry;
                
                            entry.overContractWarning = entry.cumulativeQty > item.contractQty;
                
                            totalPeriodMfgUsd += entry.periodAmountUsd;
                            totalPeriodMfgTry += entry.periodAmountTry;
                        });
                
                        pay.manufacturingAmountUsd = Math.round(totalPeriodMfgUsd * 100) / 100;
                        pay.manufacturingAmountTry = Math.round(totalPeriodMfgTry * 100) / 100;
                
                        // 3. Cumulative Manufacturing
                        let prevCumulativeMfgUsd = 0;
                        if (prevPay) {
                            const allPrevPayments = this.state.progressPayments.filter(p => p.contractId === pay.contractId && p.paymentNo < pay.paymentNo);
                            prevCumulativeMfgUsd = allPrevPayments.reduce((s, p) => s + p.manufacturingAmountUsd, 0);
                        }
                        const thisCumulativeMfgUsd = prevCumulativeMfgUsd + pay.manufacturingAmountUsd;
                
                        // 4. Gross = Mfg + Additions + Services
                        pay.grossAmountUsd = Math.round((pay.manufacturingAmountUsd + (pay.additionsAmountUsd || 0) + (pay.servicesAmountUsd || 0)) * 100) / 100;
                        pay.grossAmountTry = Math.round((pay.manufacturingAmountTry + (pay.additionsAmountTry || 0) + (pay.servicesAmountTry || 0)) * 100) / 100;
                
                        // 5. VAT
                        pay.vatAmountUsd = Math.round((pay.grossAmountUsd * contract.vatRate) * 100) / 100;
                        pay.vatAmountTry = Math.round((pay.grossAmountTry * contract.vatRate) * 100) / 100;
                
                        // 6. VAT Withholding
                        pay.vatWithholdingUsd = -Math.round((pay.vatAmountUsd * contract.vatWithholdingRate) * 100) / 100;
                        pay.vatWithholdingTry = -Math.round((pay.vatAmountTry * contract.vatWithholdingRate) * 100) / 100;
                
                        // 7. Gross with VAT = Gross + VAT + Withholding
                        pay.grossWithVatUsd = Math.round((pay.grossAmountUsd + pay.vatAmountUsd + pay.vatWithholdingUsd) * 100) / 100;
                        pay.grossWithVatTry = Math.round((pay.grossAmountTry + pay.vatAmountTry + pay.vatWithholdingTry) * 100) / 100;
                
                        // 8. Deductions
                        // Avans Deduction
                        if (contract.advancePercentUsd > 0 && contract.advanceGivenUsd > 0) {
                            const targetCumulativeAdvance = Math.min(thisCumulativeMfgUsd * contract.advancePercentUsd, contract.advanceGivenUsd);
                            const allPrevPayments = this.state.progressPayments.filter(p => p.contractId === pay.contractId && p.paymentNo < pay.paymentNo);
                            const prevDeductedAdvanceUsd = allPrevPayments.reduce((s, p) => s + p.advanceDeductionUsd, 0);
                
                            const remainingAdvance = contract.advanceGivenUsd - prevDeductedAdvanceUsd;
                            let deduction = targetCumulativeAdvance - prevDeductedAdvanceUsd;
                            pay.advanceDeductionUsd = Math.max(0, Math.min(Math.round(deduction * 100) / 100, Math.round(remainingAdvance * 100) / 100));
                        } else {
                            pay.advanceDeductionUsd = 0;
                        }
                        pay.advanceDeductionTry = 0;
                
                        // Cash Guarantee
                        pay.cashGuaranteeDeductionUsd = Math.round((pay.manufacturingAmountUsd * contract.cashGuaranteeRate) * 100) / 100;
                        pay.cashGuaranteeDeductionTry = Math.round((pay.manufacturingAmountTry * contract.cashGuaranteeRate) * 100) / 100;
                
                        // Stoppage
                        pay.stoppageDeductionUsd = Math.round((pay.grossAmountUsd * contract.stoppageRate) * 100) / 100;
                        pay.stoppageDeductionTry = Math.round((pay.grossAmountTry * contract.stoppageRate) * 100) / 100;
                
                        // Other and Defect Deductions
                        const currentOtherDeductions = this.state.otherDeductionEntries.filter(d => d.progressPaymentId === pay.id && !d.isDeferred);
                        const currentDefectDeductions = this.state.defectDeductions.filter(d => d.progressPaymentId === pay.id);
                
                        let otherUsd = currentOtherDeductions.filter(d => d.currency === 'USD').reduce((s, d) => s + parseFloat(d.amount), 0);
                        let otherTry = currentOtherDeductions.filter(d => d.currency === 'TRY').reduce((s, d) => s + parseFloat(d.amount), 0);
                
                        otherUsd += currentDefectDeductions.reduce((s, d) => s + parseFloat(d.amountUsd), 0);
                        otherTry += currentDefectDeductions.reduce((s, d) => s + parseFloat(d.amountTry), 0);
                
                        pay.otherDeductionsUsd = Math.round(otherUsd * 100) / 100;
                        pay.otherDeductionsTry = Math.round(otherTry * 100) / 100;
                
                        // Total Deductions (S)
                        pay.totalDeductionsUsd = Math.round((pay.advanceDeductionUsd + pay.cashGuaranteeDeductionUsd + pay.stoppageDeductionUsd + (pay.penaltyDeductionUsd || 0) + pay.otherDeductionsUsd) * 100) / 100;
                        pay.totalDeductionsTry = Math.round((pay.advanceDeductionTry + pay.cashGuaranteeDeductionTry + pay.stoppageDeductionTry + (pay.penaltyDeductionTry || 0) + pay.otherDeductionsTry) * 100) / 100;
                
                        // Net Payable (Q) = G - S
                        pay.netPayableUsd = Math.round((pay.grossWithVatUsd - pay.totalDeductionsUsd) * 100) / 100;
                        pay.netPayableTry = Math.round((pay.grossWithVatTry - pay.totalDeductionsTry) * 100) / 100;
                    }
                };

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.BrenerApp.init();
});
