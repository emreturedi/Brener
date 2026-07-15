/* ==========================================================================
   BRENER GROUP - DASHBOARD VIEW MODULE
   ========================================================================== */

window.BrenerApp.Dashboard = {
    render(container) {
        window.BrenerApp.updateTopbarTitle('Yönetim Paneli', 'Brener Group Genel Durum Analizleri');

        const activeProj = window.BrenerApp.getActiveProject();
        const totalBudget = window.BrenerApp.state.projects.reduce((acc, p) => acc + p.budget, 0);
        const totalSpent = window.BrenerApp.state.projects.reduce((acc, p) => acc + p.spent, 0);
        const activeCount = window.BrenerApp.state.projects.filter(p => p.status === 'active').length;
        const employeeCount = window.BrenerApp.state.employees.length;

        const currentUser = window.BrenerApp.state.currentUser;
        const isAdmin = currentUser && currentUser.role === 'admin';
        
        let adminActionHtml = '';
        if (isAdmin) {
            adminActionHtml = `
                <div class="card" style="border-left: 4px solid var(--primary); margin-bottom: 24px; background: rgba(var(--primary-rgb), 0.05); display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; animation: fadeIn 0.3s ease;">
                    <div>
                        <strong style="color: var(--primary); font-size: 1rem;">🔑 Yönetici Modu Aktif</strong>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Kullanıcı ekleme/silme ve rol bazlı menü gizleme yetkilerini buradan yönetebilirsiniz.</p>
                    </div>
                    <a href="#kullanici-yonetimi" class="btn btn-primary btn-sm">Kullanıcı & Yetki Yönetimi'ne Git</a>
                </div>
            `;
        }

        // Custom responsive inline SVG Chart rendering budget trend
        // Grid points represent months: Jan to Jun
        const points = "20,120 70,105 120,80 170,85 220,55 270,30";

        // Gather tasks
        const tasks = window.BrenerApp.state.tasks || [];
        const pendingTasks = tasks.filter(t => !t.completed);
        const displayTasks = pendingTasks.length > 0 ? pendingTasks.slice(0, 4) : [
            { id: 'T-1', title: 'Haftalık şantiye raporlarını gözden geçir.', priority: 'Yüksek', category: 'Genel' },
            { id: 'T-2', title: 'Yapı Ruhsatı harç dekontlarını muhasebeye ilet.', priority: 'Yüksek', category: 'Finans' },
            { id: 'T-3', title: 'A Blok 3. kat beton kırım test sonuçlarını sisteme yükle.', priority: 'Orta', category: 'Şantiye' },
            { id: 'T-4', title: 'Şantiye su aboneliği için belediye başvurusu yap.', priority: 'Düşük', category: 'İzinler' }
        ];

        // Gather demands / requests
        const requests = window.BrenerApp.state.requests || [];
        const pendingRequests = requests.filter(r => r.status === 'pending');
        const displayRequests = pendingRequests.length > 0 ? pendingRequests.slice(0, 4) : [
            { id: 'R-1', title: 'A Blok - 50 Ton Nervürlü Demir Talebi', category: 'Malzeme', date: 'Bugün' },
            { id: 'R-2', title: 'B Blok - 200 Torba Portland Çimento Talebi', category: 'Malzeme', date: 'Dün' },
            { id: 'R-3', title: 'Saha Şefliği - İSG Baret ve Yelek Tedariği', category: 'İSG', date: '12 Haz' },
            { id: 'R-4', title: 'C Blok - Beton Pompalama Kiralama Hizmeti', category: 'Hizmet', date: '10 Haz' }
        ];

        // Gather claims
        const claims = window.BrenerApp.state.claims || [];
        const pendingClaims = claims.filter(c => c.status === 'pending');
        const displayClaims = pendingClaims.length > 0 ? pendingClaims.slice(0, 4) : [
            { id: 'C-1', subcontractor: 'Yavuz Kalıp AŞ.', description: 'Kaba İnşaat Hakedişi', netPaid: 1180000 },
            { id: 'C-2', subcontractor: 'Emre Demir Doğrama', description: 'Korkuluk ve Panel İmalatı', netPaid: 450000 },
            { id: 'C-3', subcontractor: 'Brener Beton Ltd.', description: 'C30 Hazır Beton Alımı', netPaid: 850000 }
        ];
        
        let dashboardHtml = `
            ${adminActionHtml}
            <!-- Overview Stat Cards -->
            <div class="dashboard-grid" style="margin-bottom: 24px;">
                <div class="card stat-card">
                    <div class="stat-info">
                        <span class="stat-label">Aktif Şantiyeler</span>
                        <span class="stat-val">${activeCount}</span>
                        <span class="stat-desc up">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
                            Portföy Durumu
                        </span>
                    </div>
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    </div>
                </div>

                <div class="card stat-card">
                    <div class="stat-info">
                        <span class="stat-label">Toplam Çalışan Personel</span>
                        <span class="stat-val">${employeeCount}</span>
                        <span class="stat-desc up" style="color: var(--success);">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
                            Aktif Çalışanlar
                        </span>
                    </div>
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                </div>

                <div class="card stat-card">
                    <div class="stat-info">
                        <span class="stat-label">Toplam Yatırım Bütçesi</span>
                        <span class="stat-val">${(totalBudget/1000000).toFixed(1)}M ₺</span>
                        <span class="stat-label">Hakediş Havuzu</span>
                    </div>
                    <div class="stat-icon" style="color: var(--primary);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                </div>

                <div class="card stat-card">
                    <div class="stat-info">
                        <span class="stat-label">Gerçekleşen Toplam Harcama</span>
                        <span class="stat-val">${(totalSpent/1000000).toFixed(1)}M ₺</span>
                        <span class="stat-desc down" style="color: var(--warning);">
                            Bütçe Kullanımı: %${totalBudget > 0 ? ((totalSpent/totalBudget)*100).toFixed(0) : 0}
                        </span>
                    </div>
                    <div class="stat-icon" style="color: var(--danger);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                </div>
            </div>

            <!-- Main Charts & Feeds -->
            <div class="grid-2col" style="margin-bottom: 24px;">
                <!-- SVG Chart Card -->
                <div class="card" style="position: relative;">
                    <div class="card-header">
                        <h2>Gider Trend Analizi (2026 - Milyon TL)</h2>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Aylık Kümülatif Hak Edişler</span>
                    </div>
                    <div class="chart-container" style="width: 100%; height: 220px; margin-top: 10px;">
                        <svg viewBox="0 0 300 150" style="width: 100%; height: 100%;">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
                                    <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
                                </linearGradient>
                            </defs>
                            <line x1="20" y1="30" x2="280" y2="30" stroke="var(--border-color)" stroke-dasharray="2,2"/>
                            <line x1="20" y1="60" x2="280" y2="60" stroke="var(--border-color)" stroke-dasharray="2,2"/>
                            <line x1="20" y1="90" x2="280" y2="90" stroke="var(--border-color)" stroke-dasharray="2,2"/>
                            <line x1="20" y1="120" x2="280" y2="120" stroke="var(--border-color)"/>
                            <path d="M20,120 L20,120 L70,105 L120,80 L170,85 L220,55 L270,30 L270,120 Z" fill="url(#chartGradient)"/>
                            <polyline fill="none" stroke="var(--primary)" stroke-width="2" points="${points}"/>
                            <circle cx="20" cy="120" r="3.5" fill="var(--bg-main)" stroke="var(--primary)" stroke-width="2"/>
                            <circle cx="70" cy="105" r="3.5" fill="var(--bg-main)" stroke="var(--primary)" stroke-width="2"/>
                            <circle cx="120" cy="80" r="3.5" fill="var(--bg-main)" stroke="var(--primary)" stroke-width="2"/>
                            <circle cx="170" cy="85" r="3.5" fill="var(--bg-main)" stroke="var(--primary)" stroke-width="2"/>
                            <circle cx="220" cy="55" r="3.5" fill="var(--bg-main)" stroke="var(--primary)" stroke-width="2"/>
                            <circle cx="270" cy="30" r="3.5" fill="var(--bg-main)" stroke="var(--primary)" stroke-width="2"/>
                            <text x="20" y="135" fill="var(--text-muted)" font-size="6" text-anchor="middle">Ocak</text>
                            <text x="70" y="135" fill="var(--text-muted)" font-size="6" text-anchor="middle">Şubat</text>
                            <text x="120" y="135" fill="var(--text-muted)" font-size="6" text-anchor="middle">Mart</text>
                            <text x="170" y="135" fill="var(--text-muted)" font-size="6" text-anchor="middle">Nisan</text>
                            <text x="220" y="135" fill="var(--text-muted)" font-size="6" text-anchor="middle">Mayıs</text>
                            <text x="270" y="135" fill="var(--text-muted)" font-size="6" text-anchor="middle">Haziran</text>
                        </svg>
                    </div>
                </div>

                <!-- Weather & Concrete Pouring Index -->
                <div class="card">
                    <div class="card-header">
                        <h2>Şantiye Hava Durumları</h2>
                        <span class="badge badge-success">Otomatik Güncel</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                            <div>
                                <h4 style="font-weight: 600;">İstanbul Plaza Şantiyesi</h4>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">Çok Bulutlu | Rüzgar: 12 km/s</span>
                            </div>
                            <div style="text-align: right;">
                                <strong style="color: var(--text-main); font-size: 1.1rem;">26°C</strong>
                                <span class="badge badge-success" style="display: block; font-size: 0.6rem; margin-top: 3px;">Beton Dökümüne Uygun</span>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                            <div>
                                <h4 style="font-weight: 600;">Bodrum Port Konakları</h4>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">Açık Güneşli | Rüzgar: 4 km/s</span>
                            </div>
                            <div style="text-align: right;">
                                <strong style="color: var(--text-main); font-size: 1.1rem;">32°C</strong>
                                <span class="badge badge-warning" style="display: block; font-size: 0.6rem; margin-top: 3px;">Aşırı Sıcak: Sulamaya Dikkat</span>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px;">
                            <div>
                                <h4 style="font-weight: 600;">Çeşme Villaları</h4>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">Az Bulutlu | Rüzgar: 20 km/s</span>
                            </div>
                            <div style="text-align: right;">
                                <strong style="color: var(--text-main); font-size: 1.1rem;">29°C</strong>
                                <span class="badge badge-success" style="display: block; font-size: 0.6rem; margin-top: 3px;">Beton Dökümüne Uygun</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Active Project Focus & Quick Actions -->
            <div class="grid-2col" style="margin-bottom: 24px;">
                <!-- Active Project Card -->
                <div class="card" style="border-left: 4px solid var(--primary);">
                    <div class="card-header">
                        <h2>Aktif Seçili Şantiye Durumu</h2>
                        <a href="#projelerim" class="btn btn-secondary btn-sm">Tümünü Gör</a>
                    </div>
                    ${activeProj ? `
                        <h3 style="font-size: 1.3rem; margin-bottom: 4px;">${activeProj.name}</h3>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;">
                            Konum: ${activeProj.location} | Proje Sorumlusu: ${activeProj.manager}
                        </p>

                        <div style="margin-bottom: 24px;">
                            <div class="progress-info">
                                <span>Fiziksel İlerleme Oranı</span>
                                <span>%${activeProj.progress}</span>
                            </div>
                            <div class="progress-bar-bg" style="height: 10px;">
                                <div class="progress-bar-fill" style="width: ${activeProj.progress}%;"></div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <div>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">Proje Bütçesi</span>
                                <h4 style="font-size: 1.1rem; font-weight: 700; margin-top: 4px;">${(activeProj.budget/1000000).toFixed(1)}M ₺</h4>
                            </div>
                            <div>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">Harcanan Tutar</span>
                                <h4 style="font-size: 1.1rem; font-weight: 700; margin-top: 4px; color: var(--success);">${(activeProj.spent/1000000).toFixed(1)}M ₺</h4>
                            </div>
                            <div>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">Kalan Bütçe</span>
                                <h4 style="font-size: 1.1rem; font-weight: 700; margin-top: 4px; color: var(--primary);">${((activeProj.budget - activeProj.spent)/1000000).toFixed(1)}M ₺</h4>
                            </div>
                        </div>
                    ` : `
                        <p style="color:var(--text-muted);">Aktif seçili şantiye bulunmamaktadır.</p>
                    `}
                </div>

                <!-- Quick Actions Panel -->
                <div class="card">
                    <div class="card-header">
                        <h2>Hızlı İşlemler</h2>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
                        <button class="btn btn-secondary" onclick="document.getElementById('addNewProjectBtn').click()" style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px; border:1px solid var(--border-color); background:var(--bg-dark); border-radius:8px; cursor:pointer; justify-content:center; text-align:center;">
                            <span style="font-size:1.5rem;">➕</span>
                            <span style="font-size:0.8rem; font-weight:600;">Yeni Proje Ekle</span>
                        </button>
                        <button class="btn btn-secondary" onclick="window.location.hash='#santiye-gunlugu'" style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px; border:1px solid var(--border-color); background:var(--bg-dark); border-radius:8px; cursor:pointer; justify-content:center; text-align:center;">
                            <span style="font-size:1.5rem;">📝</span>
                            <span style="font-size:0.8rem; font-weight:600;">Günlük Rapor Gir</span>
                        </button>
                        <button class="btn btn-secondary" onclick="window.location.hash='#talepler'" style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px; border:1px solid var(--border-color); background:var(--bg-dark); border-radius:8px; cursor:pointer; justify-content:center; text-align:center;">
                            <span style="font-size:1.5rem;">📥</span>
                            <span style="font-size:0.8rem; font-weight:600;">Yeni Talep Oluştur</span>
                        </button>
                        <button class="btn btn-secondary" onclick="window.location.hash='#hakedis'" style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px; border:1px solid var(--border-color); background:var(--bg-dark); border-radius:8px; cursor:pointer; justify-content:center; text-align:center;">
                            <span style="font-size:1.5rem;">💰</span>
                            <span style="font-size:0.8rem; font-weight:600;">Hakediş Talebi Gir</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tasks & Demands -->
            <div class="grid-2col" style="margin-bottom: 24px;">
                <!-- Pending Tasks -->
                <div class="card">
                    <div class="card-header" style="margin-bottom:15px;">
                        <h2>Kritik Görevler & Uyarılar</h2>
                        <a href="#gorevlerim" class="btn btn-secondary btn-sm">Tümünü Yönet</a>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${displayTasks.map(t => `
                            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border:1px solid var(--border-color); border-radius:6px; background:rgba(255,255,255,0.01);">
                                <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
                                    <span style="font-size:0.75rem; padding:2px 6px; border-radius:4px; background:${t.priority === 'Yüksek' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'}; color:${t.priority === 'Yüksek' ? '#ef4444' : '#3b82f6'}; font-weight:600; flex-shrink:0;">
                                        ${t.priority}
                                    </span>
                                    <span style="font-size:0.82rem; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-main);">${t.title}</span>
                                </div>
                                <span style="font-size:0.72rem; color:var(--text-muted); margin-left:12px; flex-shrink:0;">${t.category}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Material & Saha Demands -->
                <div class="card">
                    <div class="card-header" style="margin-bottom:15px;">
                        <h2>Onay Bekleyen Saha Talepleri</h2>
                        <a href="#talepler" class="btn btn-secondary btn-sm">Tüm Talepler</a>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${displayRequests.map(r => `
                            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border:1px solid var(--border-color); border-radius:6px; background:rgba(255,255,255,0.01);">
                                <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
                                    <span style="font-size:0.75rem; padding:2px 6px; border-radius:4px; background:rgba(16, 185, 129, 0.15); color:#10b981; font-weight:600; flex-shrink:0;">
                                        ${r.category}
                                    </span>
                                    <span style="font-size:0.82rem; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-main);">${r.title}</span>
                                </div>
                                <span style="font-size:0.72rem; color:var(--text-muted); margin-left:12px; flex-shrink:0;">${r.date || 'Bugün'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Finance & Activity -->
            <div class="grid-2col" style="margin-bottom: 24px;">
                <!-- Pending Claims / Progress Payments -->
                <div class="card">
                    <div class="card-header" style="margin-bottom:15px;">
                        <h2>Onay Bekleyen Hakediş Talepleri</h2>
                        <a href="#hakedis" class="btn btn-secondary btn-sm">Hakediş Modülü</a>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${displayClaims.map(c => `
                            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border:1px solid var(--border-color); border-radius:6px; background:rgba(255,255,255,0.01);">
                                <div>
                                    <strong style="font-size:0.82rem; color:var(--text-main); display:block;">${c.subcontractor}</strong>
                                    <span style="font-size:0.72rem; color:var(--text-muted);">${c.description}</span>
                                </div>
                                <div style="text-align:right;">
                                    <strong style="font-size:0.85rem; color:var(--warning); display:block;">${(c.netPaid || c.totalAmount).toLocaleString('tr-TR')} ₺</strong>
                                    <span class="badge badge-warning" style="font-size:0.6rem; padding:1px 4px;">Beklemede</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Recent Activities Logs -->
                <div class="card">
                    <div class="card-header">
                        <h2>Son Şantiye Hareketleri</h2>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; gap: 12px; border-left: 2px solid var(--primary); padding-left: 12px;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); min-width:65px;">Bugün 15:42</div>
                            <div style="font-size: 0.85rem; font-weight: 500;">
                                <strong>Şantiye Günlüğü</strong> girişi yapıldı - Hasan Demir (12 Kalıpçı, 6 Demirci, 1 Beton Mikseri)
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; border-left: 2px solid var(--secondary); padding-left: 12px;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); min-width:65px;">Dün 17:15</div>
                            <div style="font-size: 0.85rem; font-weight: 500;">
                                <strong>Hakediş Talebi</strong> onaylandı - Yavuz Kalıp Aş. (Net: 1.18M ₺)
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; border-left: 2px solid var(--success); padding-left: 12px;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); min-width:65px;">22 Haz</div>
                            <div style="font-size: 0.85rem; font-weight: 500;">
                                <strong>Malzeme Teslimat</strong> - Demirci deposuna 20 Ton Donatı çeliği teslim alındı.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Complete Portfolio Matrix Table -->
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header" style="margin-bottom:20px;">
                    <h2>Proje Portföyü Genel Durumu</h2>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Sistemdeki tüm projeler ve özet metrikleri</span>
                </div>
                <div class="table-responsive">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border-color); text-align: left;">
                                <th style="padding: 12px 10px;">Proje Adı</th>
                                <th style="padding: 12px 10px;">Tip</th>
                                <th style="padding: 12px 10px;">Alan (m²)</th>
                                <th style="padding: 12px 10px;">İlerleme Oranı</th>
                                <th style="padding: 12px 10px;">Bütçe / Harcanan</th>
                                <th style="padding: 12px 10px; text-align: center;">Durum</th>
                                <th style="padding: 12px 10px; text-align: center;">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${window.BrenerApp.state.projects.map(p => {
                                const isCurrent = p.id === window.BrenerApp.state.currentProjectId;
                                return `
                                    <tr style="border-bottom: 1px solid var(--border-color); ${isCurrent ? 'background: rgba(var(--primary-rgb), 0.03);' : ''}">
                                        <td style="padding: 12px 10px;">
                                            <strong style="color:var(--text-main);">${p.name}</strong>
                                            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top:2px;">${p.location}</div>
                                        </td>
                                        <td style="padding: 12px 10px;">
                                            <span class="badge" style="background: rgba(var(--primary-rgb), 0.1); color: var(--primary); padding: 4px 8px; border-radius: 4px;">
                                                ${p.type || 'Belirtilmedi'}
                                            </span>
                                        </td>
                                        <td style="padding: 12px 10px;">
                                            ${(p.area || p.totalArea || 0).toLocaleString('tr-TR')} m²
                                        </td>
                                        <td style="padding: 12px 10px; width: 150px;">
                                            <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
                                                <span>%${p.progress || 0}</span>
                                            </div>
                                            <div class="progress-bar-bg" style="height: 6px; margin: 0;">
                                                <div class="progress-bar-fill" style="width: ${p.progress || 0}%;"></div>
                                            </div>
                                        </td>
                                        <td style="padding: 12px 10px;">
                                            <strong>${(p.budget || 0).toLocaleString('tr-TR')} ₺</strong>
                                            <div style="font-size: 0.72rem; color: var(--success); margin-top:2px;">Harcanan: ${(p.spent || 0).toLocaleString('tr-TR')} ₺</div>
                                        </td>
                                        <td style="padding: 12px 10px; text-align: center;">
                                            <span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-info'}">
                                                ${p.status === 'active' ? 'Devam Ediyor' : 'Tamamlandı'}
                                            </span>
                                        </td>
                                        <td style="padding: 12px 10px; text-align: center;">
                                            ${isCurrent ? `
                                                <span style="font-size: 0.78rem; font-weight: 700; color: var(--primary);">Aktif Proje</span>
                                            ` : `
                                                <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.selectProject(${p.id}); window.BrenerApp.Dashboard.render(document.getElementById('contentWindow'));" style="padding: 4px 10px; font-size: 0.75rem;">
                                                    Aktif Yap
                                                </button>
                                            `}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = dashboardHtml;
    }
};
