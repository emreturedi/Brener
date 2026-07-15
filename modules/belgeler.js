/* ==========================================================================
   BRENER GROUP - DOCUMENTS, TEAM & FEASIBILITY MODULE (BELGELER & HESAP)
   ========================================================================== */

window.BrenerApp.Belgeler = {
    render(view, container) {
        if (view === 'firma-yonetimi') {
            this.renderCompany(container);
        } else if (view === 'gorevlerim') {
            this.renderTasks(container);
        } else if (view === 'firmaya-katil') {
            this.renderJoinTeam(container);
        } else if (view === 'belgeler-projeler' || view === 'proje-belgeleri') {
            this.renderProjectDocs(container);
        } else if (view === 'belgeler-finans') {
            this.renderFinanceDocs(container);
        } else if (view === 'fon-yonetimi') {
            this.renderFunds(container);
        } else if (view === 'belgeler-satis') {
            this.renderSalesDocs(container);
        } else if (view === 'evrak-uretici') {
            this.renderDocGen(container);
        } else if (view === 'akilli-arsiv') {
            this.renderArchive(container);
        } else if (view === 'fizibilite') {
            this.renderFeasibility(container);
        } else if (view === 'belgeler-araclar') {
            this.renderUnitTools(container);
        } else if (view === 'ayarlar') {
            this.renderSettings(container);
        } else if (view === 'ai-evrak-merkezi') {
            this.renderAiDocs(container);
        } else if (view === 'profil') {
            this.renderProfile(container);
        } else if (view === 'kullanici-yonetimi') {
            this.renderUserManagement(container);
        } else if (view === 'sistem-loglari') {
            this.renderSystemLogs(container);
        }
    },

    // 1. Firma Yönetimi
    renderCompany(container) {
        window.BrenerApp.updateTopbarTitle('Firma Yönetimi', 'Brener Group Şirket Personelleri ve Departman Şeması');

        let html = `
            <div class="card">
                <div class="card-header" style="margin-bottom: 20px;">
                    <h2>Organizasyon ve Ekip Üyeleri</h2>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Ad Soyad</th>
                                <th>Departman</th>
                                <th>Rol / Ünvan</th>
                                <th>E-Posta</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Emre Türedi</strong></td>
                                <td>Yönetim Kurulu</td>
                                <td>Genel Müdür / Ortak</td>
                                <td>emre.turedi@brener.com.tr</td>
                                <td><span class="badge badge-success">Aktif</span></td>
                            </tr>
                            <tr>
                                <td><strong>Caner Şen</strong></td>
                                <td>Mühendislik</td>
                                <td>Proje & Şantiye Koordinatörü</td>
                                <td>caner.sen@brener.com.tr</td>
                                <td><span class="badge badge-success">Aktif</span></td>
                            </tr>
                            <tr>
                                <td><strong>Zeynep Yurt</strong></td>
                                <td>İSG / Denetim</td>
                                <td>Baş İSG Uzmanı</td>
                                <td>zeynep.yurt@brener.com.tr</td>
                                <td><span class="badge badge-success">Aktif</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    // 2. Görevlerim (Personal Checklist)
    // 2. Görevlerim (Personal Checklist)
    initTasksData() {
        if (!window.BrenerApp.state.tasks) {
            window.BrenerApp.state.tasks = [
                { id: 'TSK-001', title: 'Haftalık şantiye raporlarını gözden geçir.', category: 'Şantiye', priority: 'Yüksek', completed: false, date: '2026-07-10' },
                { id: 'TSK-002', title: 'Taşeron hakediş onaylarını tamamla.', category: 'Finans', priority: 'Yüksek', completed: true, date: '2026-07-05' },
                { id: 'TSK-003', title: 'Bodrum belediye ruhsat yazısını takip et.', category: 'Ruhsat', priority: 'Orta', completed: false, date: '2026-07-12' },
                { id: 'TSK-004', title: 'Mimari detay çizim revizyonlarını kontrol et.', category: 'Tasarım', priority: 'Düşük', completed: false, date: '2026-07-15' }
            ];
            window.BrenerApp.saveStateToStorage();
        }
    },

    renderTasks(container) {
        window.BrenerApp.updateTopbarTitle('Görevlerim', 'Kişisel Yapılacaklar ve İş Takip Paneli');
        this.initTasksData();

        let currentFilterStatus = 'all'; 
        let currentFilterPriority = 'all'; 
        let currentFilterCategory = 'all'; 

        const renderLayout = () => {
            const tasks = window.BrenerApp.state.tasks || [];
            const completedCount = tasks.filter(t => t.completed).length;
            const totalCount = tasks.length;
            const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            let html = `
                <style>
                    .task-dashboard {
                        display: grid;
                        grid-template-columns: 1fr 280px;
                        gap: 20px;
                        align-items: start;
                    }
                    .task-card {
                        background: var(--bg-card);
                        border: 1px solid var(--border-color);
                        border-radius: 10px;
                        padding: 16px;
                        margin-bottom: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        transition: all 0.2s;
                    }
                    .task-card:hover {
                        border-color: var(--primary);
                        transform: translateX(4px);
                    }
                    .task-card.completed {
                        opacity: 0.6;
                    }
                    .task-card.completed .task-title {
                        text-decoration: line-through;
                        color: var(--text-muted);
                    }
                    .badge-priority {
                        font-size: 0.65rem;
                        padding: 3px 8px;
                        border-radius: 4px;
                        font-weight: 700;
                    }
                    .badge-p-high { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                    .badge-p-medium { background: rgba(249, 115, 22, 0.15); color: #f97316; }
                    .badge-p-low { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }

                    .badge-cat {
                        font-size: 0.65rem;
                        padding: 3px 8px;
                        border-radius: 4px;
                        background: rgba(255, 255, 255, 0.05);
                        color: var(--text-muted);
                        border: 1px solid var(--border-color);
                    }
                    .filter-pill {
                        padding: 6px 12px;
                        background: rgba(255,255,255,0.02);
                        border: 1px solid var(--border-color);
                        border-radius: 20px;
                        font-size: 0.76rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        color: var(--text-muted);
                    }
                    .filter-pill:hover {
                        color: var(--text-main);
                        border-color: var(--primary);
                    }
                    .filter-pill.active {
                        background: var(--primary);
                        color: #000;
                        border-color: var(--primary);
                        font-weight: bold;
                    }
                </style>

                <div class="task-dashboard">
                    
                    <div>
                        <div class="card" style="margin-bottom: 20px; padding: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <div>
                                    <h2 style="margin: 0; font-size: 1.15rem;">📌 Görev Listesi</h2>
                                    <span style="font-size: 0.78rem; color: var(--text-muted);">${completedCount} / ${totalCount} Görev Tamamlandı</span>
                                </div>
                                <button class="btn btn-primary btn-sm" id="btnAddNewTask">+ Yeni Görev Ekle</button>
                            </div>
                            <div class="progress-bar-bg" style="height: 8px; border-radius: 4px;">
                                <div class="progress-bar-fill" style="width: ${percent}%; background: var(--success); height: 8px; border-radius: 4px; transition: width 0.4s ease;"></div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;">
                            <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold; margin-right: 5px;">Durum:</span>
                            <div class="filter-pill ${currentFilterStatus === 'all' ? 'active' : ''}" data-filter-status="all">Tümü</div>
                            <div class="filter-pill ${currentFilterStatus === 'pending' ? 'active' : ''}" data-filter-status="pending">Bekleyenler</div>
                            <div class="filter-pill ${currentFilterStatus === 'completed' ? 'active' : ''}" data-filter-status="completed">Tamamlananlar</div>
                        </div>

                        <div id="tasksListContainer"></div>
                    </div>

                    <div>
                        <div class="card" style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
                            <div>
                                <h3 style="font-size: 0.85rem; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; color: var(--text-main);">🏷 Kategoriler</h3>
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <div class="filter-pill ${currentFilterCategory === 'all' ? 'active' : ''}" data-filter-cat="all" style="text-align: center;">Tüm Kategoriler</div>
                                    <div class="filter-pill ${currentFilterCategory === 'Şantiye' ? 'active' : ''}" data-filter-cat="Şantiye" style="text-align: center;">🔨 Şantiye</div>
                                    <div class="filter-pill ${currentFilterCategory === 'Finans' ? 'active' : ''}" data-filter-cat="Finans" style="text-align: center;">💰 Finans</div>
                                    <div class="filter-pill ${currentFilterCategory === 'Ruhsat' ? 'active' : ''}" data-filter-cat="Ruhsat" style="text-align: center;">📜 Ruhsat</div>
                                    <div class="filter-pill ${currentFilterCategory === 'Tasarım' ? 'active' : ''}" data-filter-cat="Tasarım" style="text-align: center;">📐 Tasarım</div>
                                    <div class="filter-pill ${currentFilterCategory === 'Diğer' ? 'active' : ''}" data-filter-cat="Diğer" style="text-align: center;">⚙ Diğer</div>
                                </div>
                            </div>

                            <div>
                                <h3 style="font-size: 0.85rem; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; color: var(--text-main);">⚡ Öncelik Seviyesi</h3>
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <div class="filter-pill ${currentFilterPriority === 'all' ? 'active' : ''}" data-filter-priority="all" style="text-align: center;">Tüm Öncelikler</div>
                                    <div class="filter-pill ${currentFilterPriority === 'Yüksek' ? 'active' : ''}" data-filter-priority="Yüksek" style="text-align: center; border-color: rgba(239, 68, 68, 0.4);">🔴 Yüksek</div>
                                    <div class="filter-pill ${currentFilterPriority === 'Orta' ? 'active' : ''}" data-filter-priority="Orta" style="text-align: center; border-color: rgba(249, 115, 22, 0.4);">🟡 Orta</div>
                                    <div class="filter-pill ${currentFilterPriority === 'Düşük' ? 'active' : ''}" data-filter-priority="Düşük" style="text-align: center; border-color: rgba(59, 130, 246, 0.4);">🔵 Düşük</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            `;
            container.innerHTML = html;
        };

        const renderList = () => {
            const tasks = window.BrenerApp.state.tasks || [];
            const listContainer = document.getElementById('tasksListContainer');
            if (!listContainer) return;

            let filtered = tasks.filter(t => {
                if (currentFilterStatus === 'pending' && t.completed) return false;
                if (currentFilterStatus === 'completed' && !t.completed) return false;
                if (currentFilterPriority !== 'all' && t.priority !== currentFilterPriority) return false;
                if (currentFilterCategory !== 'all' && t.category !== currentFilterCategory) return false;
                return true;
            });

            if (filtered.length === 0) {
                listContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; border: 1px dashed var(--border-color); border-radius: 8px; color: var(--text-muted); font-size: 0.85rem;">
                        Seçili filtrelere uygun görev bulunamadı.
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = filtered.map(t => {
                let badgeClass = "badge-p-low";
                if (t.priority === 'Yüksek') badgeClass = "badge-p-high";
                else if (t.priority === 'Orta') badgeClass = "badge-p-medium";

                return `
                    <div class="task-card ${t.completed ? 'completed' : ''}" data-id="${t.id}">
                        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                            <input type="checkbox" class="task-toggle" ${t.completed ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <strong class="task-title" style="font-size: 0.9rem; color: var(--text-main);">${t.title}</strong>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <span class="badge-cat">${t.category}</span>
                                    <span class="badge-priority ${badgeClass}">${t.priority}</span>
                                    <span style="font-size: 0.72rem; color: var(--text-muted);">Tarih: ${t.date ? new Date(t.date).toLocaleDateString('tr-TR') : 'Belirtilmedi'}</span>
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm btn-delete-task" style="padding: 6px 10px; color: var(--danger); background: transparent; border: none; font-size: 1rem; cursor: pointer;" title="Görevi Sil">🗑</button>
                    </div>
                `;
            }).join('');

            listContainer.querySelectorAll('.task-toggle').forEach(chk => {
                chk.onchange = () => {
                    const card = chk.closest('.task-card');
                    const id = card.getAttribute('data-id');
                    const task = tasks.find(t => t.id === id);
                    if (task) {
                        task.completed = chk.checked;
                        window.BrenerApp.saveStateToStorage();
                        renderLayout();
                        renderList();
                        setupEvents();
                    }
                };
            });

            listContainer.querySelectorAll('.btn-delete-task').forEach(btn => {
                btn.onclick = () => {
                    if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
                        const card = btn.closest('.task-card');
                        const id = card.getAttribute('data-id');
                        window.BrenerApp.state.tasks = tasks.filter(t => t.id !== id);
                        window.BrenerApp.saveStateToStorage();
                        renderLayout();
                        renderList();
                        setupEvents();
                    }
                };
            });
        };

        const setupEvents = () => {
            container.querySelectorAll('[data-filter-status]').forEach(btn => {
                btn.onclick = () => {
                    currentFilterStatus = btn.getAttribute('data-filter-status');
                    renderLayout();
                    renderList();
                    setupEvents();
                };
            });

            container.querySelectorAll('[data-filter-cat]').forEach(btn => {
                btn.onclick = () => {
                    currentFilterCategory = btn.getAttribute('data-filter-cat');
                    renderLayout();
                    renderList();
                    setupEvents();
                };
            });

            container.querySelectorAll('[data-filter-priority]').forEach(btn => {
                btn.onclick = () => {
                    currentFilterPriority = btn.getAttribute('data-filter-priority');
                    renderLayout();
                    renderList();
                    setupEvents();
                };
            });

            const addBtn = document.getElementById('btnAddNewTask');
            if (addBtn) {
                addBtn.onclick = () => {
                    const modalHtml = `
                        <div style="padding: 16px;">
                            <div class="form-group">
                                <label>Görev Açıklaması</label>
                                <input type="text" id="newTaskTitle" placeholder="Örn. Haftalık saha fotoğraflarını yükle" style="width: 100%;">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px;">
                                <div class="form-group">
                                    <label>Kategori</label>
                                    <select id="newTaskCategory" style="width: 100%;">
                                        <option value="Şantiye">🔨 Şantiye</option>
                                        <option value="Finans">💰 Finans</option>
                                        <option value="Ruhsat">📜 Ruhsat</option>
                                        <option value="Tasarım">📐 Tasarım</option>
                                        <option value="Diğer">⚙ Diğer</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Öncelik</label>
                                    <select id="newTaskPriority" style="width: 100%;">
                                        <option value="Yüksek">🔴 Yüksek</option>
                                        <option value="Orta" selected>🟡 Orta</option>
                                        <option value="Düşük">🔵 Düşük</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" style="margin-top: 10px;">
                                <label>Son Tarih</label>
                                <input type="date" id="newTaskDate" style="width: 100%;">
                            </div>
                            <div style="display:flex; gap:12px; margin-top:20px; justify-content:flex-end;">
                                <button class="btn btn-secondary" onclick="window.BrenerApp.closeModal()">Kapat</button>
                                <button class="btn btn-primary" id="btnConfirmAddTask">Görev Ekle</button>
                            </div>
                        </div>
                    `;

                    window.BrenerApp.openModal('📌 Yeni Görev Ekle', modalHtml);

                    document.getElementById('btnConfirmAddTask').onclick = () => {
                        const title = document.getElementById('newTaskTitle').value.trim();
                        const category = document.getElementById('newTaskCategory').value;
                        const priority = document.getElementById('newTaskPriority').value;
                        const date = document.getElementById('newTaskDate').value;

                        if (!title) {
                            alert('Lütfen görev açıklamasını doldurun!');
                            return;
                        }

                        const newTask = {
                            id: `TSK-00\${(window.BrenerApp.state.tasks || []).length + 1}`,
                            title,
                            category,
                            priority,
                            completed: false,
                            date: date || new Date().toISOString().split('T')[0]
                        };

                        window.BrenerApp.state.tasks = window.BrenerApp.state.tasks || [];
                        window.BrenerApp.state.tasks.push(newTask);
                        window.BrenerApp.saveStateToStorage();
                        
                        window.BrenerApp.closeModal();
                        window.BrenerApp.showToast('success', 'Yeni kişisel görev başarıyla eklendi.');

                        renderLayout();
                        renderList();
                        setupEvents();
                    };
                };
            }
        };

        renderLayout();
        renderList();
        setupEvents();
    },

    // 3. Firmaya Katıl
    renderJoinTeam(container) {
        window.BrenerApp.updateTopbarTitle('Firmaya Katıl', 'Brener Ekibine Davetiye Koduyla Katılım Ekranı');

        let html = `
            <div class="card" style="max-width: 400px; margin: 0 auto; text-align: center; padding: 30px;">
                <div class="card-header" style="justify-content: center; margin-bottom: 20px;">
                    <h2>Brener Kurumsal Ağına Katıl</h2>
                </div>
                <div class="form-group">
                    <label>Firma Davet Kodu (6 Haneli)</label>
                    <input type="text" placeholder="Örn: BRN-984" style="text-align: center; text-transform: uppercase; font-size: 1.1rem; letter-spacing: 2px;">
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" onclick="window.BrenerApp.showToast('success', 'Firma katılım onay talebi kurucu yöneticilere gönderildi.')">Ağa Katılma İsteği Gönder</button>
            </div>
        `;
        container.innerHTML = html;
    },

    // 4. Proje Belgeleri
    renderProjectDocs(container) {
        window.BrenerApp.updateTopbarTitle('Proje Belgeleri', 'Statik Hesaplar, Mimari Planlar ve İmar Ruhsat Dosyaları');

        let html = `
            <div class="card">
                <div class="card-header" style="margin-bottom: 20px;">
                    <h2>Belge Arşivi (Projeler)</h2>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Dosya Adı</th>
                                <th>Kategori</th>
                                <th>Ekleyen</th>
                                <th>Tarih</th>
                                <th>Boyut</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Bodrum_BlokA_Statik_Proje.dwg</strong></td>
                                <td>Statik Çizim</td>
                                <td>Caner Şen</td>
                                <td>15.06.2026</td>
                                <td>18.4 MB</td>
                                <td><button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info', 'Dosya indiriliyor...')">İndir</button></td>
                            </tr>
                            <tr>
                                <td><strong>Belediye_Yapi_Ruhsati.pdf</strong></td>
                                <td>Resmi Evrak</td>
                                <td>Emre Türedi</td>
                                <td>10.06.2026</td>
                                <td>2.3 MB</td>
                                <td><button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info', 'Dosya indiriliyor...')">İndir</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    // 5. Finans Belgeleri
    renderFinanceDocs(container) {
        window.BrenerApp.updateTopbarTitle('Finans Belgeleri', 'Fatura Suretleri, Stopaj Beyanları ve Ödeme Fişleri');

        const docs = [
            { id: 1, name: 'KDV Beyannamesi - Mayıs 2026', category: 'Vergi', date: '01.06.2026', amount: '₺ 840,500', status: 'Onaylı', statusClass: 'badge-success' },
            { id: 2, name: 'Yapı Ruhsatı Harcı Makbuzu', category: 'Resmi Ödeme', date: '15.05.2026', amount: '₺ 127,400', status: 'Onaylı', statusClass: 'badge-success' },
            { id: 3, name: 'İş Avansı Banka Dekontu - Kuzey Kalıp Ltd.', category: 'Taşeron Ödemesi', date: '20.06.2026', amount: '₺ 1,187,500', status: 'İşlendi', statusClass: 'badge-info' },
            { id: 4, name: 'Gelir Vergisi Stopaj - Haziran 2026', category: 'Vergi', date: '23.06.2026', amount: '₺ 215,000', status: 'Beklemede', statusClass: 'badge-warning' },
            { id: 5, name: 'SGK Prim Ödeme Makbuzu - Haziran', category: 'Sigorta', date: '22.06.2026', amount: '₺ 98,750', status: 'Onaylı', statusClass: 'badge-success' },
            { id: 6, name: 'Öz Yapı Demir Ltd. - e-Fatura #2026-0042', category: 'Hakediş Faturası', date: '18.06.2026', amount: '₺ 480,000', status: 'Onaylı', statusClass: 'badge-success' }
        ];

        let rows = docs.map(d => `
            <tr>
                <td><strong>${d.name}</strong></td>
                <td><span class="badge badge-info" style="font-size:0.7rem;">${d.category}</span></td>
                <td>${d.date}</td>
                <td style="font-weight:700; color:var(--primary);">${d.amount}</td>
                <td><span class="badge ${d.statusClass}">${d.status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info','${d.name} indiriliyor...')">İndir</button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="card">
                <div class="card-header" style="margin-bottom:20px;">
                    <h2>Finansal Belgeler Arşivi</h2>
                    <div style="display:flex;gap:10px;">
                        <select style="background:rgba(255,255,255,0.04);border:1px solid var(--border-color);padding:6px 12px;border-radius:8px;color:var(--text-main);">
                            <option>Tüm Kategoriler</option>
                            <option>Vergi</option>
                            <option>Hakediş Faturası</option>
                            <option>Taşeron Ödemesi</option>
                        </select>
                        <button class="btn btn-primary btn-sm" onclick="window.BrenerApp.showToast('success','Yeni belge eklendi.')">+ Belge Yükle</button>
                    </div>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Belge Adı</th><th>Kategori</th><th>Tarih</th><th>Tutar</th><th>Durum</th><th>İşlem</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // 6. Fon Yönetimi (Funds Overview)
    renderFunds(container) {
        window.BrenerApp.updateTopbarTitle('Fon ve Hazine Yönetimi', 'Kasa/Banka Mevduatları ve Kredi Ödemeleri');

        const accounts = [
            { name: 'Yapı Kredi - Ana Kurumsal Hesap', iban: 'TR39 0006 7010 0000 0xxx', balance: 12_540_000, type: 'Vadesiz', icon: '🏦' },
            { name: 'Garanti BBVA - Şantiye Operasyon', iban: 'TR72 0006 2000 0080 0xxx', balance: 3_215_000, type: 'Vadesiz', icon: '🏦' },
            { name: 'Ziraat Bankası - Teminat Mektubu Blokaj', iban: 'TR80 0001 0017 4500 0xxx', balance: 2_000_000, type: 'Bloke', icon: '🔒' },
            { name: 'Kasa (TL Nakit)', iban: '-', balance: 85_000, type: 'Kasa', icon: '💵' }
        ];

        const loans = [
            { name: 'Yapı Kredi - Proje Kredisi 1', remaining: 18_500_000, monthly: 920_000, nextDate: '01.07.2026', rate: '% 42.5' },
            { name: 'Garanti BBVA - İnşaat Finansmanı', remaining: 25_000_000, monthly: 1_200_000, nextDate: '05.07.2026', rate: '% 40.0' }
        ];

        const totalLiquidity = accounts.filter(a => a.type !== 'Bloke').reduce((s, a) => s + a.balance, 0);
        const totalDebt = loans.reduce((s, l) => s + l.remaining, 0);
        const totalMonthly = loans.reduce((s, l) => s + l.monthly, 0);

        const accountRows = accounts.map(a => `
            <tr>
                <td>${a.icon} <strong>${a.name}</strong></td>
                <td style="font-family:monospace;color:var(--text-muted);font-size:0.8rem;">${a.iban}</td>
                <td><span class="badge ${a.type === 'Bloke' ? 'badge-warning' : a.type === 'Kasa' ? 'badge-info' : 'badge-success'}">${a.type}</span></td>
                <td style="font-weight:700;color:var(--success);text-align:right;">${a.balance.toLocaleString('tr-TR')} ₺</td>
            </tr>
        `).join('');

        const loanRows = loans.map(l => `
            <tr>
                <td><strong>${l.name}</strong></td>
                <td style="color:var(--danger);font-weight:700;">${l.remaining.toLocaleString('tr-TR')} ₺</td>
                <td>${l.monthly.toLocaleString('tr-TR')} ₺ / Ay</td>
                <td><span class="badge badge-warning">${l.nextDate}</span></td>
                <td style="color:var(--primary);">${l.rate}</td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
                <div class="card" style="text-align:center;border-color:var(--success);">
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">Toplam Likidite</div>
                    <div style="font-size:1.6rem;font-weight:800;color:var(--success);margin-top:6px;">${totalLiquidity.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div class="card" style="text-align:center;border-color:var(--danger);">
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">Toplam Banka Borcu</div>
                    <div style="font-size:1.6rem;font-weight:800;color:var(--danger);margin-top:6px;">${totalDebt.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div class="card" style="text-align:center;border-color:var(--warning);">
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">Aylık Kredi Ödemesi</div>
                    <div style="font-size:1.6rem;font-weight:800;color:var(--warning);margin-top:6px;">${totalMonthly.toLocaleString('tr-TR')} ₺</div>
                </div>
            </div>
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header" style="margin-bottom:16px;"><h2>Banka Hesapları & Kasa</h2></div>
                    <div class="table-responsive">
                        <table>
                            <thead><tr><th>Hesap</th><th>IBAN</th><th>Tür</th><th style="text-align:right;">Bakiye</th></tr></thead>
                            <tbody>${accountRows}</tbody>
                        </table>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header" style="margin-bottom:16px;"><h2>Aktif Kredi Ödemeleri</h2></div>
                    <div class="table-responsive">
                        <table>
                            <thead><tr><th>Kredi</th><th>Kalan Anapara</th><th>Taksit</th><th>Son Ödeme</th><th>Faiz</th></tr></thead>
                            <tbody>${loanRows}</tbody>
                        </table>
                    </div>
                    <button class="btn btn-primary" style="width:100%;margin-top:16px;" onclick="window.BrenerApp.showToast('success','Nakit akış raporu Excel formatında dışa aktarıldı.')">Nakit Akış Raporu İndir</button>
                </div>
            </div>
        `;
    },

    // 7. Satış Belgeleri
    renderSalesDocs(container) {
        window.BrenerApp.updateTopbarTitle('Satış Belgeleri', 'Daire Satış Sözleşmeleri ve Tapu Devir Evrakları');

        const sales = [
            { id: 1, unit: 'Brener Port Konakları - A Blok D:5', buyer: 'Mehmet Arslan', price: 4_800_000, paid: 4_800_000, date: '10.03.2026', status: 'Tapu Devri Yapıldı', cls: 'badge-success' },
            { id: 2, unit: 'Brener Port Konakları - B Blok D:12', buyer: 'Ayşe Karaca', price: 5_200_000, paid: 2_600_000, date: '22.04.2026', status: 'Taksitli Ödeme', cls: 'badge-warning' },
            { id: 3, unit: 'Brener Plaza - Ofis Kat:8 No:801', buyer: 'Ertürk Holding A.Ş.', price: 12_500_000, paid: 6_250_000, date: '05.05.2026', status: 'Ön Sözleşme Aşaması', cls: 'badge-info' },
            { id: 4, unit: 'Brener Premium Villaları - Villa 04', buyer: 'Levent Serbest', price: 9_800_000, paid: 0, date: '20.06.2026', status: 'Ön Rezervasyon', cls: 'badge-warning' }
        ];

        const totalSales = sales.reduce((s, x) => s + x.price, 0);
        const totalCollected = sales.reduce((s, x) => s + x.paid, 0);
        const totalPending = totalSales - totalCollected;

        let rows = sales.map(s => `
            <tr>
                <td><strong>${s.unit}</strong></td>
                <td>${s.buyer}</td>
                <td style="font-weight:700;">${s.price.toLocaleString('tr-TR')} ₺</td>
                <td style="color:var(--success);font-weight:600;">${s.paid.toLocaleString('tr-TR')} ₺</td>
                <td style="color:var(--danger);">${(s.price - s.paid).toLocaleString('tr-TR')} ₺</td>
                <td>${s.date}</td>
                <td><span class="badge ${s.cls}">${s.status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info','${s.unit} sözleşmesi açılıyor...')">Sözleşme</button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
                <div class="card" style="text-align:center;">
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Toplam Satış Portföyü</div>
                    <div style="font-size:1.5rem;font-weight:800;color:var(--primary);margin-top:6px;">${totalSales.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div class="card" style="text-align:center;">
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Tahsil Edilen</div>
                    <div style="font-size:1.5rem;font-weight:800;color:var(--success);margin-top:6px;">${totalCollected.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div class="card" style="text-align:center;">
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Bekleyen Tahsilat</div>
                    <div style="font-size:1.5rem;font-weight:800;color:var(--warning);margin-top:6px;">${totalPending.toLocaleString('tr-TR')} ₺</div>
                </div>
            </div>
            <div class="card">
                <div class="card-header" style="margin-bottom:20px;">
                    <h2>Daire & Birim Satış Kayıtları</h2>
                    <button class="btn btn-primary btn-sm" onclick="window.BrenerApp.showToast('success','Yeni satış kaydı eklendi.')">+ Yeni Satış Ekle</button>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Birim</th><th>Alıcı</th><th>Satış Bedeli</th><th>Tahsilat</th><th>Kalan</th><th>Tarih</th><th>Durum</th><th>İşlem</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // 8. Evrak Üretici
    renderDocGen(container) {
        window.BrenerApp.updateTopbarTitle('Evrak Üretici', 'Resmi Yazışmalar ve Şantiye Tutanak Şablonları');

        let html = `
            <div class="card" style="max-width: 600px; margin: 0 auto;">
                <div class="card-header">
                    <h2>Şantiye Teslim / Durum Tespit Tutanağı Üret</h2>
                </div>
                <div class="form-group">
                    <label>Tutanak Başlığı</label>
                    <input type="text" id="docGenTitle" value="Demir Donatı Teslim Tespit Tutanağı">
                </div>
                <div class="form-group">
                    <label>Tutanak İçeriği</label>
                    <textarea id="docGenBody" placeholder="Tutanak metnini yazın..." style="height: 120px;">Yapılan kontroller neticesinde, A Blok temel üstü demir donatı bağlama imalatının projeye ve statik yönergelere uygun olarak tamamlandığı, paspaylarının yerleştirildiği tespit edilmiş olup beton dökümüne izin verilmiştir.</textarea>
                </div>
                <button class="btn btn-primary" style="width: 100%;" id="generateDocBtn">Tutanağı Resmi PDF Yap</button>
            </div>
        `;
        container.innerHTML = html;

        document.getElementById('generateDocBtn').onclick = () => {
            const title = document.getElementById('docGenTitle').value.trim();
            const body = document.getElementById('docGenBody').value.trim();

            const docHtml = `
                <div style="background: white; color: black; border: 1px solid #ccc; padding: 40px; font-family: 'Times New Roman', serif; line-height: 1.6; text-align: justify; font-size: 0.95rem;">
                    <div style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 1.1rem; text-transform: uppercase;">
                        BRENER GROUP İNŞAAT A.Ş.<br>
                        ${title}
                    </div>
                    ${body.replace(/\n/g, '<br>')}
                    <br><br><br>
                    <div style="display: flex; justify-content: space-between;">
                        <div style="text-align: center;">
                            <strong>Şantiye Şefi</strong><br> İmza
                        </div>
                        <div style="text-align: center;">
                            <strong>Kontrol Mühendisi</strong><br> İmza
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="window.BrenerApp.showToast('success', 'Resmi tutanak PDF basıldı.')">PDF İndir</button>
            `;
            window.BrenerApp.openModal('Üretilen Resmi Evrak', docHtml);
        };
    },

    // 9. Akıllı Arşiv
    renderArchive(container) {
        window.BrenerApp.updateTopbarTitle('Akıllı Arşiv Sistemi', 'OCR ve Etiket Tabanlı Gelişmiş Evrak Arama Motoru');

        const docs = [
            { name: 'İmar Durumu Belgesi - Bodrum 2026', tags: ['imar', 'bodrum', 'ruhsat'], date: '12.01.2026', size: '1.2 MB', type: 'PDF', color: 'var(--danger)' },
            { name: 'Statik Proje - Blok A Zemin Kat', tags: ['statik', 'çizim', 'blokA'], date: '05.02.2026', size: '18.4 MB', type: 'DWG', color: '#0066cc' },
            { name: 'Taşeron Hakediş - Yavuz Beton #3', tags: ['hakediş', 'beton', 'sözleşme'], date: '23.06.2026', size: '0.8 MB', type: 'XLSX', color: 'var(--success)' },
            { name: 'İSG Risk Değerlendirme Raporu 2026', tags: ['isg', 'risk', 'güvenlik'], date: '10.06.2026', size: '2.1 MB', type: 'PDF', color: 'var(--danger)' },
            { name: 'Yapı Ruhsatı & Harç Makbuzu', tags: ['ruhsat', 'belediye', 'resmi'], date: '15.05.2026', size: '3.5 MB', type: 'PDF', color: 'var(--danger)' },
            { name: 'Banka Proje Kredisi Sözleşmesi', tags: ['kredi', 'banka', 'finans'], date: '01.03.2026', size: '5.2 MB', type: 'PDF', color: 'var(--danger)' }
        ];

        let docCards = docs.map(d => `
            <div class="card" style="display:flex;align-items:center;gap:16px;padding:16px;">
                <div style="width:50px;height:50px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid var(--border-color);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:${d.color};flex-shrink:0;">${d.type}</div>
                <div style="flex:1;">
                    <div style="font-weight:600;">${d.name}</div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">
                        ${d.tags.map(t => `<span style="background:rgba(255,255,255,0.05);border:1px solid var(--border-color);padding:2px 8px;border-radius:20px;font-size:0.7rem;color:var(--text-muted);">#${t}</span>`).join('')}
                    </div>
                </div>
                <div style="text-align:right;font-size:0.8rem;color:var(--text-muted);flex-shrink:0;">
                    <div>${d.date}</div>
                    <div style="margin-top:2px;">${d.size}</div>
                    <button class="btn btn-secondary btn-sm" style="margin-top:8px;" onclick="window.BrenerApp.showToast('info','${d.name} indiriliyor...')">İndir</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="card" style="margin-bottom:24px;">
                <div style="display:flex;gap:12px;align-items:center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="archiveSearch" placeholder="Dosya adı, etiket veya kategori ara... (ör: hakediş, ruhsat, statik)" style="flex:1;background:transparent;border:none;color:var(--text-main);font-size:1rem;outline:none;" oninput="window.BrenerApp.Belgeler.filterArchive(this.value)">
                    <button class="btn btn-primary btn-sm" onclick="window.BrenerApp.showToast('success','Yeni dosya arşive eklendi.')">+ Dosya Yükle</button>
                </div>
            </div>
            <div id="archiveDocList" style="display:flex;flex-direction:column;gap:12px;">
                ${docCards}
            </div>
        `;
    },

    filterArchive(query) {
        const q = query.toLowerCase();
        const listEl = document.getElementById('archiveDocList');
        if (!listEl) return;
        listEl.querySelectorAll('.card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(q) || q === '' ? 'flex' : 'none';
        });
    },

    // 10. Fizibilite (ROI Calculator)
    renderFeasibility(container) {
        window.BrenerApp.updateTopbarTitle('Proje Fizibilite Analizörü', 'Yatırımın Geri Dönüşü (ROI) ve Karlılık Tahmin Algoritmaları');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Fizibilite ROI Hesap Makinesi</h2>
                    </div>
                    <div class="form-group">
                        <label>Arsa Alım / Yatırım Bedeli (TL)</label>
                        <input type="number" id="fezLand" value="15000000" oninput="window.BrenerApp.Belgeler.calcFeasibility()">
                    </div>
                    <div class="form-group">
                        <label>Toplam Tahmini İnşaat Maliyeti (TL)</label>
                        <input type="number" id="fezBuild" value="30000000" oninput="window.BrenerApp.Belgeler.calcFeasibility()">
                    </div>
                    <div class="form-group">
                        <label>Tahmini Proje Toplam Satış Hasılatı (TL)</label>
                        <input type="number" id="fezSales" value="65000000" oninput="window.BrenerApp.Belgeler.calcFeasibility()">
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h4 style="font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">Karlılık & ROI Sonucu</h4>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Net Kar Projeksiyonu:</span>
                            <span id="fezNetProfit" style="font-weight: 600; color: var(--success);">20,000,000.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px; color: var(--primary);">
                            <span>Yatırım Geri Dönüşü (ROI):</span>
                            <span id="fezRoi">44.44 %</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.showToast('success', 'Fizibilite Raporu Excel olarak çıktı alındı.')">Detaylı Fizibilite Raporu Çıkar</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Fizibilite Değerlendirmesi</h2>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-muted);">
                        - ROI (Return on Investment), elde edilen net karın toplam yatırım maliyetine (Arsa + İnşaat) bölünmesiyle hesaplanır. <br><br>
                        - İnşaat sektöründe hedeflenen proje bazlı minimum ROI oranı konut projelerinde %30, ticari projelerde ise %40 seviyelerindedir.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    calcFeasibility() {
        const land = parseFloat(document.getElementById('fezLand').value) || 0;
        const build = parseFloat(document.getElementById('fezBuild').value) || 0;
        const sales = parseFloat(document.getElementById('fezSales').value) || 0;

        const totalCost = land + build;
        const profit = sales - totalCost;
        const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

        document.getElementById('fezNetProfit').textContent = `${profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('fezNetProfit').style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
        document.getElementById('fezRoi').textContent = `${roi.toFixed(2)} %`;
    },

    // 11. Araçlar (Unit Converter)
    renderUnitTools(container) {
        window.BrenerApp.updateTopbarTitle('Mühendislik Pratik Araçları', 'Birim Çevrimleri ve Hızlı Metraj Dönüştürücüler');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Alan Birim Çevirici</h2>
                    </div>
                    <div class="form-group">
                        <label>Dönüm (Dekar) Değeri</label>
                        <input type="number" id="unitDonum" value="1" oninput="window.BrenerApp.Belgeler.convertArea(1)">
                    </div>
                    <div class="form-group">
                        <label>Metrekare Değeri ($m^2$)</label>
                        <input type="number" id="unitM2" value="1000" oninput="window.BrenerApp.Belgeler.convertArea(2)">
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Donatı Ağırlık / Boy Çevirici</h2>
                    </div>
                    <div class="form-group">
                        <label>Demir Çapı (Q)</label>
                        <select id="unitDemirCap" onchange="window.BrenerApp.Belgeler.calcSteelWeight()">
                            <option value="8">Q8 (0.395 kg/m)</option>
                            <option value="10">Q10 (0.617 kg/m)</option>
                            <option value="12" selected>Q12 (0.888 kg/m)</option>
                            <option value="14">Q14 (1.208 kg/m)</option>
                            <option value="16">Q16 (1.578 kg/m)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Toplam Metraj (Metre)</label>
                        <input type="number" id="unitDemirLength" value="100" oninput="window.BrenerApp.Belgeler.calcSteelWeight()">
                    </div>
                    <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 6px; font-weight: 700; text-align: center; border: 1px solid var(--border-color);">
                        Toplam Ağırlık: <span id="unitDemirResultWeight" style="color: var(--primary);">88.8 kg</span>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    convertArea(dir) {
        const donum = document.getElementById('unitDonum');
        const m2 = document.getElementById('unitM2');

        if (dir === 1) {
            m2.value = (parseFloat(donum.value) || 0) * 1000;
        } else {
            donum.value = (parseFloat(m2.value) || 0) / 1000;
        }
    },

    calcSteelWeight() {
        const cap = parseInt(document.getElementById('unitDemirCap').value);
        const len = parseFloat(document.getElementById('unitDemirLength').value) || 0;

        // standard weight per meter formula: (d^2) / 162
        const weightPerMeter = (cap * cap) / 162;
        const total = weightPerMeter * len;

        document.getElementById('unitDemirResultWeight').textContent = `${total.toFixed(1)} kg (${(total/1000).toFixed(3)} Ton)`;
    },

    // 12. Ayarlar (Settings)
    renderSettings(container) {
        window.BrenerApp.updateTopbarTitle('Sistem Ayarları', 'Brener Group Platform Yapılandırmaları');

        const aiSettings = window.BrenerApp.state.aiChannelSettings || {
            whatsapp: {
                provider: 'twilio',
                accountSid: 'AC9bd2de67f8cea340d6259c9e6e3831a9',
                authToken: '',
                fromNumber: 'whatsapp:+14155238886',
                testNumber: '+905327398489'
            },
            telegram: {
                botToken: '',
                botUsername: 'BrenerGroupBot'
            },
            email: {
                imapHost: 'imap.yandex.com',
                imapPort: '993',
                emailAddress: 'saha@brenergroup.com',
                password: ''
            },
            thresholds: {
                minOcrConfidence: 90,
                unknownSupplierAction: 'alert',
                autoApproveProgress: false
            }
        };

        let html = `
            <div style="display: flex; flex-direction: column; gap: 20px; max-width: 600px; margin: 0 auto;">
                <!-- Platform Preferences Card -->
                <div class="card">
                    <div class="card-header" style="margin-bottom: 20px;">
                        <h2>Platform Tercihleri</h2>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" checked style="width: 18px; height: 18px;"> E-Posta Bildirimlerini Aktif Et
                        </label>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" checked style="width: 18px; height: 18px;"> Kritik Stok Limitinde Otomatik Satın Alma Talebi Oluştur
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Para Birimi Varsayılanı</label>
                        <select>
                            <option value="TRY">Türk Lirası (₺)</option>
                            <option value="USD">Amerikan Doları ($)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" style="width:100%; margin-top: 10px;" onclick="window.BrenerApp.showToast('success', 'Ayarlarınız kaydedildi.')">Ayarları Kaydet</button>
                </div>

                <!-- AI Kanal Entegrasyon Ayarları -->
                <div class="card" style="border-left: 4px solid var(--primary);">
                    <div class="card-header" style="margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                        <h2 style="color: var(--primary); display: flex; align-items: center; gap: 8px;">📲 AI Kanal Entegrasyon Ayarları</h2>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5;">
                        Saha personelinden gelen fotoğraf ve belgelerin AI Vision OCR ile taranması için API anahtarlarını ve kanal bağlantılarını buradan yönetebilirsiniz.
                    </p>

                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <!-- WhatsApp -->
                        <details style="border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; background: rgba(255,255,255,0.01);">
                            <summary style="font-weight: 600; color: var(--text-main); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                💬 WhatsApp Business (Twilio) Ayarları
                            </summary>
                            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px; padding: 5px;">
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">Twilio Account SID</label>
                                    <input type="text" id="ai_wa_sid" style="width: 100%; padding: 8px; font-family: monospace;" value="${aiSettings.whatsapp.accountSid || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">Twilio Auth Token</label>
                                    <input type="password" id="ai_wa_token" style="width: 100%; padding: 8px;" value="${aiSettings.whatsapp.authToken || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">Gönderici WhatsApp Numarası (From)</label>
                                    <input type="text" id="ai_wa_from" style="width: 100%; padding: 8px; font-family: monospace;" value="${aiSettings.whatsapp.fromNumber || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">Test Alıcı Numarası (To)</label>
                                    <input type="text" id="ai_wa_test" style="width: 100%; padding: 8px; font-family: monospace;" value="${aiSettings.whatsapp.testNumber || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">Canlı Webhook URL (Sunucu)</label>
                                    <input type="text" readonly style="width: 100%; padding: 8px; background: rgba(0,0,0,0.1); color: var(--text-muted); font-family: monospace; font-size: 0.75rem;" value="${window.location.origin}/api/webhook/whatsapp">
                                </div>
                            </div>
                        </details>

                        <!-- Telegram -->
                        <details style="border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; background: rgba(255,255,255,0.01);">
                            <summary style="font-weight: 600; color: var(--text-main); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                ✈️ Telegram Bot Ayarları
                            </summary>
                            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px; padding: 5px;">
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">Telegram Bot Token</label>
                                    <input type="password" id="ai_tg_token" style="width: 100%; padding: 8px;" value="${aiSettings.telegram.botToken || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">Bot Kullanıcı Adı (Username)</label>
                                    <input type="text" id="ai_tg_username" style="width: 100%; padding: 8px; font-family: monospace;" value="${aiSettings.telegram.botUsername || ''}">
                                </div>
                            </div>
                        </details>

                        <!-- E-Posta -->
                        <details style="border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; background: rgba(255,255,255,0.01);">
                            <summary style="font-weight: 600; color: var(--text-main); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                📧 E-Posta (IMAP) Sunucu Ayarları
                            </summary>
                            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px; padding: 5px;">
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">IMAP Sunucu Adresi</label>
                                    <input type="text" id="ai_mail_host" style="width: 100%; padding: 8px; font-family: monospace;" value="${aiSettings.email.imapHost || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">IMAP Port</label>
                                    <input type="text" id="ai_mail_port" style="width: 100%; padding: 8px; font-family: monospace;" value="${aiSettings.email.imapPort || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">E-Posta Adresi</label>
                                    <input type="text" id="ai_mail_user" style="width: 100%; padding: 8px; font-family: monospace;" value="${aiSettings.email.emailAddress || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">Şifre / Uygulama Şifresi</label>
                                    <input type="password" id="ai_mail_pass" style="width: 100%; padding: 8px;" value="${aiSettings.email.password || ''}">
                                </div>
                            </div>
                        </details>

                        <!-- Müdahale Kuralları -->
                        <details style="border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; background: rgba(255,255,255,0.01);">
                            <summary style="font-weight: 600; color: var(--text-main); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                🛡️ Müdahale Eşikleri & Karar Kuralları
                            </summary>
                            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px; padding: 5px;">
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">Minimum OCR Güven Skoru (%)</label>
                                    <input type="number" id="ai_min_ocr" min="50" max="100" style="width: 100%; padding: 8px;" value="${aiSettings.thresholds.minOcrConfidence || 90}">
                                    <span style="font-size:0.7rem; color:var(--text-muted);">* Bu skorun altındaki evraklar doğrudan işlenmez, yönetici onayına düşer.</span>
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.78rem;">Bilinmeyen Tedarikçi Tespit Edildiğinde</label>
                                    <select id="ai_unknown_supplier" style="width: 100%; padding: 8px; background:var(--bg-dark); border:1px solid var(--border-color); color:var(--text-main);">
                                        <option value="alert" ${aiSettings.thresholds.unknownSupplierAction === 'alert' ? 'selected' : ''}>Kayıt Açma, Yöneticiye Bildir</option>
                                        <option value="save" ${aiSettings.thresholds.unknownSupplierAction === 'save' ? 'selected' : ''}>"Bilinmeyen Tedarikçi" Olarak Kaydet</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.78rem; margin-top: 6px;">
                                        <input type="checkbox" id="ai_auto_approve" ${aiSettings.thresholds.autoApproveProgress ? 'checked' : ''} style="width:16px; height:16px;">
                                        Şantiye İlerlemesini Doğrudan Onayla (Şef onayı istemeden)
                                    </label>
                                </div>
                            </div>
                        </details>
                    </div>

                    <button class="btn btn-primary" style="width:100%; margin-top: 16px; font-weight: bold;" id="btnSaveAiSettings">AI Kanal Ayarlarını Kaydet</button>
                </div>

                <!-- AI Müdahale Rehberi -->
                <div class="card" style="border-left: 4px solid var(--warning); background: rgba(var(--warning-rgb,234,179,8),0.02);">
                    <div class="card-header" style="margin-bottom: 10px;">
                        <h2 style="color: var(--warning); display: flex; align-items: center; gap: 8px;">🛡️ AI Müdahale & Yönetim Kılavuzu</h2>
                    </div>
                    <div style="font-size: 0.8rem; line-height: 1.5; color: var(--text-muted); display:flex; flex-direction:column; gap:10px;">
                        <p>
                            Saha ekibinin AI kanalları (WhatsApp, Telegram, Mail) üzerinden gönderdiği evrakların doğruluğunu korumak için <strong>ne zaman</strong> ve <strong>hangi modülden</strong> müdahale etmeniz gerektiğini belirten kontrol kılavuzu:
                        </p>
                        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 5px;">
                            <div style="padding: 10px; border-radius: 6px; background: rgba(255,255,255,0.02); border-left: 2px solid var(--danger);">
                                <strong style="color: var(--text-main); font-size: 0.82rem;">⚠️ Düşük OCR Güven Skoru (%<span id="guide_min_ocr">${aiSettings.thresholds.minOcrConfidence || 90}</span> Altı)</strong>
                                <p style="margin: 4px 0 0;">AI okuma güveni eşiğin altına düştüğünde, veriler doğrudan onaylanmaz. <strong>Belgeler → Gelen Evraklar</strong> sayfasından ilgili resmi açıp el ile düzeltme yapabilir veya reddedebilirsiniz.</p>
                            </div>
                            <div style="padding: 10px; border-radius: 6px; background: rgba(255,255,255,0.02); border-left: 2px solid var(--warning);">
                                <strong style="color: var(--text-main); font-size: 0.82rem;">🧾 Hatalı Fatura / Miktar Eşleşmesi</strong>
                                <p style="margin: 4px 0 0;">Yavuz Beton faturası gibi sisteme otomatik işlenen hakediş veya gider belgelerinde yanlış miktar/tutar tespit edilirse, <strong>Finans → Hakedişler / Giderler</strong> sekmesinden kaydı düzenle butonunu kullanarak anında müdahale edebilirsiniz.</p>
                            </div>
                            <div style="padding: 10px; border-radius: 6px; background: rgba(255,255,255,0.02); border-left: 2px solid var(--info);">
                                <strong style="color: var(--text-main); font-size: 0.82rem;">📝 Malzeme Taleplerinin Düzenlenmesi</strong>
                                <p style="margin: 4px 0 0;">Otomatik oluşturulan saha talepleri <strong>Talepler</strong> sayfasında <code>Beklemede</code> olarak bekler. Satın alım öncesi miktar, öncelik veya kategori bilgilerini değiştirip <code>Onayla</code> butonuna basarak süreci yürütebilirsiniz.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Database Migration and Backup Card -->
                <div class="card" style="border-color: rgba(204,163,82,0.3);">
                    <div class="card-header" style="margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                        <h2 style="color: var(--primary);">💾 Veritabanı Yönetimi & Sunucuya Taşıma</h2>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5;">
                        Brener Group platformundaki tüm verilerinizi (Projeler, Şartnameler, Sözleşmeler, Çalışanlar ve Sistem Günlükleri) hosting ortamına taşımak veya yedeklemek için aşağıdaki araçları kullanabilirsiniz.
                    </p>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button class="btn btn-primary" id="btnExportDb" style="width: 100%; font-weight: bold; padding: 12px 20px;">
                            📥 Tüm Veritabanını JSON Olarak İndir (Export)
                        </button>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <button class="btn btn-secondary" id="btnImportDbTrigger" style="flex: 1; padding: 12px 20px;">
                                📤 Veritabanını Geri Yükle (Import)
                            </button>
                            <input type="file" id="dbImportFileInput" style="display: none;" accept=".json">
                        </div>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 10px; display: block; text-align: center;">
                        * İçe aktarma işlemi tarayıcıdaki tüm mevcut verilerinizi sıfırlayarak yüklenen dosyadaki verileri yazar.
                    </span>
                </div>
            </div>
        `;
        container.innerHTML = html;

        // Save AI settings action
        const btnSaveAi = document.getElementById('btnSaveAiSettings');
        if (btnSaveAi) {
            btnSaveAi.onclick = () => {
                const sid = document.getElementById('ai_wa_sid').value;
                const tokenVal = document.getElementById('ai_wa_token').value;
                const fromNum = document.getElementById('ai_wa_from').value;
                const testNum = document.getElementById('ai_wa_test').value;

                const tgToken = document.getElementById('ai_tg_token').value;
                const tgUser = document.getElementById('ai_tg_username').value;

                const mailHost = document.getElementById('ai_mail_host').value;
                const mailPort = document.getElementById('ai_mail_port').value;
                const mailUser = document.getElementById('ai_mail_user').value;
                const mailPass = document.getElementById('ai_mail_pass').value;

                const minOcr = parseInt(document.getElementById('ai_min_ocr').value) || 90;
                const unknownSupplier = document.getElementById('ai_unknown_supplier').value;
                const autoApprove = document.getElementById('ai_auto_approve').checked;

                window.BrenerApp.state.aiChannelSettings = {
                    whatsapp: {
                        provider: 'twilio',
                        accountSid: sid,
                        authToken: tokenVal,
                        fromNumber: fromNum,
                        testNumber: testNum
                    },
                    telegram: {
                        botToken: tgToken,
                        botUsername: tgUser
                    },
                    email: {
                        imapHost: mailHost,
                        imapPort: mailPort,
                        emailAddress: mailUser,
                        password: mailPass
                    },
                    thresholds: {
                        minOcrConfidence: minOcr,
                        unknownSupplierAction: unknownSupplier,
                        autoApproveProgress: autoApprove
                    }
                };

                // Update guide view dynamically
                const guideMinOcr = document.getElementById('guide_min_ocr');
                if (guideMinOcr) guideMinOcr.textContent = minOcr;

                window.BrenerApp.saveStateToStorage();
                window.BrenerApp.showToast('success', 'AI Kanal entegrasyon ayarları başarıyla kaydedildi.');
                window.BrenerApp.logActivity('sistem', 'AI Kanal entegrasyon ayarları güncellendi.', 'success');
            };
        }

        // Hook up database actions
        document.getElementById('btnExportDb').onclick = () => {
            const stateStr = JSON.stringify(window.BrenerApp.state, null, 4);
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(stateStr);
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `brener_veritabani_yedegi_${new Date().toISOString().slice(0,10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            
            window.BrenerApp.logActivity('sistem', 'Tüm veritabanı yedeği JSON olarak dışa aktarıldı.', 'success');
            window.BrenerApp.showToast('success', 'Tüm veritabanı başarıyla indirildi.');
        };

        const fileInput = document.getElementById('dbImportFileInput');
        document.getElementById('btnImportDbTrigger').onclick = () => {
            fileInput.click();
        };

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedState = JSON.parse(event.target.result);
                    if (importedState && typeof importedState === 'object' && importedState.users && importedState.projectSpecs) {
                        window.BrenerApp.state = importedState;
                        window.BrenerApp.saveStateToStorage();
                        
                        window.BrenerApp.showToast('success', 'Veritabanı başarıyla içe aktarıldı! Sistem yeniden yükleniyor...');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        alert('Hata: Yüklenen dosya geçerli bir Brener veritabanı yedeği değil!');
                    }
                } catch (err) {
                    alert('Yükleme sırasında hata oluştu: ' + err.message);
                }
            };
            reader.readAsText(file);
        };
    },

    // 13. AI Evrak Merkezi
    renderAiDocs(container) {
        window.BrenerApp.updateTopbarTitle('AI Evrak Merkezi', 'Gelen Resmi Yazıları Otomatik Özetleme ve Cevap Taslağı Çıkarıcı');

        container.innerHTML = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header" style="margin-bottom:16px;">
                        <h2>📄 Evrak Yükle & Analiz Et</h2>
                    </div>
                    <div style="border:2px dashed var(--border-color);border-radius:12px;padding:40px;text-align:center;margin-bottom:16px;cursor:pointer;transition:border-color 0.2s;" onmouseenter="this.style.borderColor='var(--primary)'" onmouseleave="this.style.borderColor='var(--border-color)'" onclick="window.BrenerApp.showToast('info','Dosya yükleme sihirbazı açılıyor...')">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted);margin-bottom:12px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <div style="font-weight:600;margin-bottom:6px;">PDF veya görsel sürükle & bırak</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">PDF, JPG, PNG desteklenir (max. 20MB)</div>
                    </div>
                    <div class="form-group">
                        <label>Evrak Tipi</label>
                        <select>
                            <option>Belediye Yazışması / İmar Bildirimi</option>
                            <option>Mahkeme Tebligatı</option>
                            <option>Taşeron Hakediş Faturası</option>
                            <option>Vergi Dairesi Bildirimi</option>
                            <option>Diğer Resmi Yazı</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" style="width:100%;" id="aiDocAnalyzeBtn">🤖 AI ile Analiz Et & Özet Çıkar</button>
                </div>
                <div class="card">
                    <div class="card-header" style="margin-bottom:16px;">
                        <h2>🤖 AI Analiz Sonucu</h2>
                    </div>
                    <div id="aiDocResult" style="display:flex;flex-direction:column;gap:12px;">
                        <div style="background:rgba(var(--primary-rgb),0.05);border:1px solid rgba(var(--primary-rgb),0.2);border-radius:10px;padding:16px;">
                            <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--primary);font-weight:700;margin-bottom:8px;">📋 Son Analiz - Bodrum Belediyesi Yazısı</div>
                            <p style="font-size:0.85rem;line-height:1.6;color:var(--text-main);"><strong>Özet:</strong> İmar tadilatına ait Bodrum Belediyesi'nin 21.06.2026 tarihli yazısında, A Blok cephe çekme mesafesinin 3 metreden 2.5 metreye revize edilmesi talep edilmektedir.</p>
                            <div style="margin-top:10px;border-top:1px solid var(--border-color);padding-top:10px;">
                                <div style="font-size:0.75rem;color:var(--danger);font-weight:600;">⚠️ Kritik Süre: 15 gün içinde itiraz edilmezse kabul edilmiş sayılır (Son gün: 05.07.2026)</div>
                            </div>
                        </div>
                        <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:10px;padding:16px;">
                            <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);font-weight:700;margin-bottom:8px;">✉️ AI Cevap Taslağı</div>
                            <textarea style="width:100%;height:130px;background:transparent;border:none;color:var(--text-main);font-size:0.82rem;line-height:1.5;resize:none;outline:none;">Bodrum Belediyesi Müdürlüğüne,

21.06.2026 tarih ve [...] sayılı yazınız incelenmiştir. Projenin mevcut imar planına uygunluğuna dair tarafımızca hazırlanan statik ve mimari raporlar ekte sunulmaktadır...

Gereğini arz ederiz.</textarea>
                            <button class="btn btn-secondary" style="width:100%;margin-top:10px;" onclick="window.BrenerApp.showToast('success','Cevap taslağı kopyalandı.')">Taslağı Kopyala</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:24px;">
                <div class="card-header" style="margin-bottom:16px;"><h2>Son AI Analizler</h2></div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Evrak Adı</th><th>Tip</th><th>Analiz Tarihi</th><th>AI Özet</th><th>Süre Uyarısı</th></tr></thead>
                        <tbody>
                            <tr>
                                <td><strong>Bodrum Belediye İmar Yazısı</strong></td>
                                <td>Belediye Yazışması</td>
                                <td>24.06.2026</td>
                                <td style="max-width:250px;font-size:0.8rem;">Cephe çekme mesafesi revizyonu talebi. 15 günlük itiraz süresi.</td>
                                <td><span class="badge badge-danger">05.07.2026</span></td>
                            </tr>
                            <tr>
                                <td><strong>SGK Haciz Bildirimi</strong></td>
                                <td>Resmi Tebligat</td>
                                <td>15.06.2026</td>
                                <td style="max-width:250px;font-size:0.8rem;">Prim borcu nedeniyle ihtar. 7 gün içinde ödeme yapılması gerekli.</td>
                                <td><span class="badge badge-success">Çözümlendi</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('aiDocAnalyzeBtn').onclick = () => {
            const btn = document.getElementById('aiDocAnalyzeBtn');
            btn.textContent = '⏳ Analiz ediliyor...';
            btn.disabled = true;
            setTimeout(() => {
                window.BrenerApp.showToast('success', 'AI evrak analizi tamamlandı! Özet ve cevap taslağı oluşturuldu.');
                btn.textContent = '🤖 AI ile Analiz Et & Özet Çıkar';
                btn.disabled = false;
            }, 2000);
        };
    },

    // 14. Profil
    renderProfile(container) {
        window.BrenerApp.updateTopbarTitle('Kullanıcı Profili', 'Brener Group Çalışan Kartı ve Yetkiler');

        const user = window.BrenerApp.state.currentUser;
        if (!user) return;

        const roleLabels = { admin: 'Yönetici (Admin)', sefi: 'Şantiye Şefi', muhasebe: 'Muhasebeci', saha: 'Saha Ekibi' };
        const initials = user.name.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);

        let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; max-width: 1000px; margin: 0 auto;">
                
                <!-- Profil Bilgileri Card -->
                <div class="card" style="padding: 32px;" id="profileCardContainer">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), #ebd197); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 700; color: var(--text-dark); box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);">
                            ${initials}
                        </div>
                        <h2 style="font-weight: 700; font-size: 1.5rem;">${user.name}</h2>
                        <span class="badge badge-success" style="margin-top: 8px; font-size: 0.75rem;">${roleLabels[user.role] || user.role}</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 16px; border-top: 1px solid var(--border-color); padding-top: 24px; font-size: 0.95rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: var(--text-muted);">📧 E-Posta:</span>
                            <strong>${user.email}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: var(--text-muted);">📞 Telefon:</span>
                            <strong>${user.phone || '+90 532 111 22 33'}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: var(--text-muted);">🏢 Şirket:</span>
                            <strong>Brener Group</strong>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px; margin-top: 32px;">
                        <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.Belgeler.toggleProfileEdit()">İletişim Bilgilerini Düzenle</button>
                    </div>
                </div>

                <!-- Şifre Değiştir Card -->
                <div class="card" style="padding: 32px;">
                    <div class="card-header" style="margin-bottom: 20px;">
                        <h2>🔒 Şifre Değiştir</h2>
                        <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-top: 4px;">
                            Hesap güvenliğiniz için şifrenizi düzenli aralıklarla değiştirin.
                        </span>
                    </div>
                    
                    <div class="form-group">
                        <label>Mevcut Şifre</label>
                        <input type="password" id="changePassCurrent" placeholder="••••••••" style="width:100%; background:rgba(255,255,255,0.03); border:1px solid var(--border-color); padding:10px; border-radius:8px; color:var(--text-main);" required>
                    </div>

                    <div class="form-group">
                        <label>Yeni Şifre</label>
                        <input type="password" id="changePassNew" placeholder="Yeni şifrenizi girin (en az 6 karakter)" style="width:100%; background:rgba(255,255,255,0.03); border:1px solid var(--border-color); padding:10px; border-radius:8px; color:var(--text-main);" required>
                    </div>

                    <div class="form-group" style="margin-bottom: 24px;">
                        <label>Yeni Şifre (Tekrar)</label>
                        <input type="password" id="changePassNewConfirm" placeholder="Yeni şifrenizi tekrar girin" style="width:100%; background:rgba(255,255,255,0.03); border:1px solid var(--border-color); padding:10px; border-radius:8px; color:var(--text-main);" required>
                    </div>

                    <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.Belgeler.changePasswordAction()">Şifreyi Güncelle</button>
                </div>

                <!-- Şirket Logosu Yönetimi Card -->
                <div class="card" style="padding: 32px; grid-column: 1 / -1;">
                    <div class="card-header" style="margin-bottom: 20px;">
                        <h2>🏢 Şirket Logosu</h2>
                        <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-top: 4px;">
                            Giriş ekranı ve sol menüde gösterilecek kurumsal logonuzu güncelleyin.
                        </span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap;">
                        <div style="background: var(--bg-dark); padding: 16px; border-radius: 8px; border: 1px dashed var(--border-color); display: flex; align-items: center; justify-content: center; width: 220px; height: 110px;">
                            <img id="profileLogoPreview" src="${window.BrenerApp.state.companyLogo || 'logo.png'}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 12px; flex: 1; min-width: 250px;">
                            <label class="btn btn-secondary" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; text-align: center; max-width: 200px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                                Yeni Logo Seç
                                <input type="file" id="companyLogoInput" accept="image/*" style="display: none;" onchange="window.BrenerApp.Belgeler.handleLogoUpload(event)">
                            </label>
                            <div style="display: flex; gap: 12px;">
                                <button class="btn btn-primary" onclick="window.BrenerApp.Belgeler.saveLogo()">Logoyu Kaydet</button>
                                ${window.BrenerApp.state.companyLogo ? `<button class="btn btn-danger" onclick="window.BrenerApp.Belgeler.resetLogo()">Varsayılana Dön</button>` : ''}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `;
        container.innerHTML = html;
    },

    toggleProfileEdit() {
        const user = window.BrenerApp.state.currentUser;
        const container = document.getElementById('profileCardContainer');
        if (!container || !user) return;

        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-weight: 700;">Profili Düzenle</h2>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Kişisel iletişim bilgilerinizi güncelleyin.</p>
            </div>
            
            <div class="form-group">
                <label>Adı Soyadı</label>
                <input type="text" id="editProfileName" value="${user.name}" required>
            </div>
            <div class="form-group" style="margin-bottom: 24px;">
                <label>Telefon Numarası</label>
                <input type="text" id="editProfilePhone" value="${user.phone || '+90 532 111 22 33'}" required>
            </div>
            <div class="form-group">
                <label>E-Posta (Değiştirilemez)</label>
                <input type="email" value="${user.email}" disabled style="opacity: 0.6;">
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button class="btn btn-secondary" style="flex: 1;" onclick="window.BrenerApp.Belgeler.renderProfile(document.getElementById('contentWindow'))">İptal</button>
                <button class="btn btn-primary" style="flex: 1;" onclick="window.BrenerApp.Belgeler.saveProfileEdits()">Değişiklikleri Kaydet</button>
            </div>
        `;
    },

    saveProfileEdits() {
        const name = document.getElementById('editProfileName').value.trim();
        const phone = document.getElementById('editProfilePhone').value.trim();

        if (!name) {
            alert('Lütfen Ad Soyad alanını doldurun!');
            return;
        }

        const user = window.BrenerApp.state.currentUser;
        if (!user) return;

        // Update details
        user.name = name;
        user.phone = phone;

        // Sync list
        const stateUser = window.BrenerApp.state.users.find(u => u.id === user.id);
        if (stateUser) {
            stateUser.name = name;
            stateUser.phone = phone;
        }

        window.BrenerApp.saveStateToStorage();
        window.BrenerApp.initAppSession();
        window.BrenerApp.showToast('success', 'Profil bilgileriniz başarıyla güncellendi.');
        this.renderProfile(document.getElementById('contentWindow'));
    },

    changePasswordAction() {
        const currentPass = document.getElementById('changePassCurrent').value.trim();
        const newPass = document.getElementById('changePassNew').value.trim();
        const confirmPass = document.getElementById('changePassNewConfirm').value.trim();

        const user = window.BrenerApp.state.currentUser;
        if (!user) return;

        if (!currentPass || !newPass || !confirmPass) {
            alert('Lütfen tüm şifre alanlarını doldurun!');
            return;
        }

        if (currentPass !== user.password) {
            alert('Mevcut şifreniz hatalı!');
            return;
        }

        if (newPass.length < 6) {
            alert('Yeni şifre en az 6 karakter olmalıdır!');
            return;
        }

        if (newPass !== confirmPass) {
            alert('Yeni şifreler uyuşmuyor!');
            return;
        }

        // Update password
        user.password = newPass;

        // Sync with users list
        const stateUser = window.BrenerApp.state.users.find(u => u.id === user.id);
        if (stateUser) {
            stateUser.password = newPass;
        }

        window.BrenerApp.saveStateToStorage();
        window.BrenerApp.showToast('success', 'Şifreniz başarıyla değiştirildi.');
        
        // Reset input fields
        document.getElementById('changePassCurrent').value = '';
        document.getElementById('changePassNew').value = '';
        document.getElementById('changePassNewConfirm').value = '';
    },

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('profileLogoPreview');
            if (preview) preview.src = e.target.result;
            this.tempLogoDataUrl = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    saveLogo() {
        if (!this.tempLogoDataUrl) {
            window.BrenerApp.showToast('info', 'Lütfen önce yeni bir logo seçin!');
            return;
        }

        window.BrenerApp.state.companyLogo = this.tempLogoDataUrl;
        this.tempLogoDataUrl = null;

        window.BrenerApp.saveStateToStorage();
        window.BrenerApp.updateLogoImages();
        window.BrenerApp.showToast('success', 'Şirket logosu başarıyla güncellendi!');
        this.renderProfile(document.getElementById('contentWindow'));
    },

    resetLogo() {
        if (confirm('Şirket logosunu varsayılana sıfırlamak istediğinize emin misiniz?')) {
            delete window.BrenerApp.state.companyLogo;
            this.tempLogoDataUrl = null;

            window.BrenerApp.saveStateToStorage();
            window.BrenerApp.updateLogoImages();
            window.BrenerApp.showToast('success', 'Logo varsayılana sıfırlandı.');
            this.renderProfile(document.getElementById('contentWindow'));
        }
    },

    renderUserManagement(container) {
        window.BrenerApp.updateTopbarTitle('Kullanıcı & Yetki Yönetimi', 'Sistem Kullanıcıları ve Modül Rol-Yetki Matrisi');

        const users = window.BrenerApp.state.users;
        const rolePermissions = window.BrenerApp.state.rolePermissions;

        const roles = [
            { code: 'admin', label: 'Yönetici' },
            { code: 'finans_sorumlusu', label: 'Finans Sorumlusu' },
            { code: 'ofis', label: 'Ofis Personeli' },
            { code: 'proje_yoneticisi', label: 'Proje Yöneticisi' },
            { code: 'saha_personeli', label: 'Saha Personeli' },
            { code: 'satis', label: 'Satış Sorumlusu' },
            { code: 'proje_muduru', label: 'Proje Müdürü' },
            { code: 'mimar', label: 'Mimar / İç Mimar' },
            { code: 'insaat_muhendisi', label: 'İnşaat Mühendisi' },
            { code: 'metraj_uzmani', label: 'Metraj ve Keşif Uzmanı' },
            { code: 'isg', label: 'İSG' },
            { code: 'sefi', label: 'Şantiye Şefi' },
            { code: 'formen', label: 'Ustabaşı / Formen' },
            { code: 'isci', label: 'Usta / İşçi' },
            { code: 'saha_muhendisi', label: 'Saha Mühendisi / Tekniker' }
        ];

        // Parse navigation elements dynamically from DOM (Ensures auto-update when menu changes)
        const getSidebarMenuStructure = () => {
            const structure = [];
            
            // 1. Scan direct top-level nav-items (not in a group)
            const directItems = [];
            document.querySelectorAll('.sidebar-nav > .nav-item').forEach(item => {
                const viewName = item.getAttribute('data-view');
                const labelEl = item.querySelector('.nav-label');
                if (viewName && labelEl && viewName !== 'kullanici-yonetimi') {
                    directItems.push({
                        code: viewName,
                        label: labelEl.textContent.trim()
                    });
                }
            });
            
            if (directItems.length > 0) {
                structure.push({
                    code: 'general_direct',
                    label: 'Genel Bağlantılar',
                    items: directItems
                });
            }

            // 2. Scan group navs
            document.querySelectorAll('.sidebar-nav .nav-group').forEach(group => {
                const groupCode = group.getAttribute('data-group');
                const titleEl = group.querySelector('.nav-group-title span');
                if (!groupCode || !titleEl) return;
                
                const items = [];
                group.querySelectorAll('.nav-item').forEach(item => {
                    const viewName = item.getAttribute('data-view');
                    const labelEl = item.querySelector('.nav-label');
                    if (viewName && labelEl) {
                        items.push({
                            code: viewName,
                            label: labelEl.textContent.trim()
                        });
                    }
                });
                
                structure.push({
                    code: groupCode,
                    label: titleEl.textContent.trim(),
                    items: items
                });
            });
            
            return structure;
        };

        const menuStructure = getSidebarMenuStructure();

        let headerCells = '<th style="width: 180px; min-width: 180px; max-width: 180px; text-align: left; padding: 12px 8px; font-size: 0.75rem;">Menü / Modül Grubu</th>';
        roles.forEach(r => {
            headerCells += `<th style="text-align: center; width: 68px; min-width: 68px; max-width: 68px; white-space: normal; word-wrap: break-word; padding: 12px 2px; font-size: 0.62rem; line-height: 1.1; text-transform: uppercase; vertical-align: bottom;">${r.label}</th>`;
        });

        let matrixRows = '';
        menuStructure.forEach(group => {
            // Group Header Row
            matrixRows += `
                <tr style="background: rgba(255, 255, 255, 0.04); font-weight: 700;">
                    <td colspan="${roles.length + 1}" style="padding: 10px 8px; color: var(--primary); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px;">
                        📁 ${group.label}
                    </td>
                </tr>
            `;

            // Sub-menu Items
            group.items.forEach(item => {
                let cells = '';
                roles.forEach(r => {
                    const isChecked = rolePermissions[r.code]?.[item.code] !== false;
                    cells += `
                        <td style="text-align: center; width: 68px; min-width: 68px; max-width: 68px; padding: 8px 2px;">
                            <input type="checkbox" class="matrix-checkbox" data-role="${r.code}" data-view="${item.code}" ${isChecked ? 'checked' : ''}>
                        </td>
                    `;
                });

                matrixRows += `
                    <tr>
                        <td style="width: 180px; min-width: 180px; max-width: 180px; white-space: normal; word-wrap: break-word; padding: 8px 8px 8px 24px; font-size: 0.8rem; color: var(--text-main);">
                            📄 ${item.label}
                        </td>
                        ${cells}
                    </tr>
                `;
            });
        });

        let userRows = '';
        users.forEach(u => {
            const roleLabels = { 
                admin: 'Yönetici',
                finans_sorumlusu: 'Finans Sorumlusu',
                ofis: 'Ofis Personeli',
                proje_yoneticisi: 'Proje Yöneticisi',
                saha_personeli: 'Saha Personeli',
                satis: 'Satış Sorumlusu',
                proje_muduru: 'Proje Müdürü',
                mimar: 'Mimar / İç Mimar',
                insaat_muhendisi: 'İnşaat Mühendisi',
                metraj_uzmani: 'Metraj ve Keşif Uzmanı',
                isg: 'İSG',
                sefi: 'Şantiye Şefi',
                formen: 'Ustabaşı / Formen',
                isci: 'Usta / İşçi',
                saha_muhendisi: 'Saha Mühendisi / Tekniker'
            };
            userRows += `
                <tr>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td><span class="badge badge-info">${roleLabels[u.role] || u.role}</span></td>
                    <td>
                        ${u.role !== 'admin' ? `<button class="btn btn-danger btn-sm" onclick="window.BrenerApp.Belgeler.deleteUser(${u.id})">Sil</button>` : '<span style="font-size:0.75rem; color:var(--text-muted);">Silinemez</span>'}
                    </td>
                </tr>
            `;
        });

        let html = `
            <div style="display: flex; flex-direction: column; gap: 24px;">
                <!-- Aktif Kullanıcı Hesapları Card -->
                <div class="card">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2>Aktif Kullanıcı Hesapları</h2>
                        <button class="btn btn-primary btn-sm" id="btnOpenAddUserModal" style="display: flex; align-items: center; gap: 6px;">
                            ➕ Yeni Kullanıcı Ekle
                        </button>
                    </div>
                    <div class="table-responsive" style="max-height: 380px; overflow-y: auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Kullanıcı</th>
                                    <th>E-Posta</th>
                                    <th>Rol</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${userRows}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Yetki Matrisi Card -->
                <div class="card">
                    <div class="card-header" style="margin-bottom: 20px;">
                        <h2>Rol & Yetki Maskeleme Matrisi</h2>
                        <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-top: 4px;">
                            Admin rolü tüm modüllere tam yetkilidir.
                        </span>
                    </div>
                    <div class="table-responsive" style="overflow-x: auto; width: 100%; max-width: 100%; display: block; border-radius: 8px; border: 1px solid var(--border-color);">
                        <table class="matrix-table" style="width: 100%; border-collapse: collapse; table-layout: fixed; min-width: 1200px;">
                            <thead>
                                <tr>
                                    ${headerCells}
                                </tr>
                            </thead>
                            <tbody id="matrixTableBody">
                                ${matrixRows}
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                        <button class="btn btn-primary" id="saveMatrixBtn">Yetki Matrisini Kaydet & Uygula</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

        // Open Modal Event Bind
        document.getElementById('btnOpenAddUserModal').onclick = () => {
            const modalHtml = `
                <style>
                    .modal-toggle-container {
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid var(--border-color);
                        border-radius: 10px;
                        padding: 14px 16px;
                        margin-bottom: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .modal-switch {
                        position: relative;
                        display: inline-block;
                        width: 46px;
                        height: 24px;
                    }
                    .modal-switch input {
                        opacity: 0;
                        width: 0;
                        height: 0;
                    }
                    .modal-slider {
                        position: absolute;
                        cursor: pointer;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background-color: rgba(255, 255, 255, 0.1);
                        transition: .3s;
                        border-radius: 24px;
                    }
                    .modal-slider:before {
                        position: absolute;
                        content: "";
                        height: 18px;
                        width: 18px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: .3s;
                        border-radius: 50%;
                    }
                    input:checked + .modal-slider {
                        background-color: #ea580c;
                    }
                    input:checked + .modal-slider:before {
                        transform: translateX(22px);
                    }
                </style>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px; margin-top: -10px;">
                    Organizasyonunuza yeni bir kullanıcı ekleyin
                </div>

                <!-- Taşeron / Saha Kullanıcısı Toggle -->
                <div class="modal-toggle-container">
                    <div>
                        <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-main);">Taşeron / Saha Kullanıcısı</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Bu kullanıcı dashboard'a giriş yapamaz, sadece WhatsApp ile kullanılır</div>
                    </div>
                    <label class="modal-switch">
                        <input type="checkbox" id="addTaseronSwitch">
                        <span class="modal-slider"></span>
                    </label>
                </div>

                <div class="form-group">
                    <label>Ad Soyad</label>
                    <input type="text" id="addUserName" placeholder="Ahmet Yılmaz" required style="width:100%;">
                </div>

                <div class="form-group">
                    <label>E-posta</label>
                    <input type="email" id="addUserEmail" placeholder="ahmet@santiyenet.com" required style="width:100%;">
                </div>

                <div class="form-group">
                    <label>Şifre</label>
                    <input type="password" id="addUserPass" placeholder="En az 6 karakter" required style="width:100%;">
                </div>

                <div class="form-group">
                    <label>Telefon Numarası</label>
                    <input type="text" id="addUserPhone" placeholder="05XX XXX XX XX" style="width:100%;">
                </div>

                <div class="form-group">
                    <label>Rol</label>
                    <select id="addUserRole" style="width:100%;">
                        <option value="">Rol seçin...</option>
                        <option value="admin">Yönetici</option>
                        <option value="finans_sorumlusu">Finans Sorumlusu</option>
                        <option value="ofis">Ofis Personeli</option>
                        <option value="proje_yoneticisi">Proje Yöneticisi</option>
                        <option value="saha_personeli">Saha Personeli</option>
                        <option value="satis">Satış Sorumlusu</option>
                        <option value="proje_muduru">Proje Müdürü</option>
                        <option value="mimar">Mimar / İç Mimar</option>
                        <option value="insaat_muhendisi">İnşaat Mühendisi</option>
                        <option value="metraj_uzmani">Metraj ve Keşif Uzmanı</option>
                        <option value="isg">İSG</option>
                        <option value="sefi">Şantiye Şefi</option>
                        <option value="formen">Ustabaşı / Formen</option>
                        <option value="isci">Usta / İşçi</option>
                        <option value="saha_muhendisi">Saha Mühendisi / Tekniker</option>
                    </select>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                    <button class="btn btn-secondary" id="btnCancelAddUser" style="padding: 10px 24px; font-weight: 600; border-radius: 8px;">İptal</button>
                    <button class="btn" id="btnConfirmAddUser" style="background: #ea580c; color: white; padding: 10px 24px; font-weight: 600; border-radius: 8px; border: none;">Oluştur</button>
                </div>
            `;

            window.BrenerApp.openModal('Yeni Kullanıcı Ekle', modalHtml);

            // Handle toggle changes
            const taseronSwitch = document.getElementById('addTaseronSwitch');
            const emailInput = document.getElementById('addUserEmail');
            const passInput = document.getElementById('addUserPass');
            const roleSelect = document.getElementById('addUserRole');

            taseronSwitch.onchange = () => {
                if (taseronSwitch.checked) {
                    emailInput.value = 'saha_whatsapp@brener.com';
                    emailInput.disabled = true;
                    passInput.value = 'whatsapp_user_field';
                    passInput.disabled = true;
                    roleSelect.value = 'saha';
                    roleSelect.disabled = true;
                } else {
                    emailInput.value = '';
                    emailInput.disabled = false;
                    passInput.value = '';
                    passInput.disabled = false;
                    roleSelect.value = '';
                    roleSelect.disabled = false;
                }
            };

            // Cancel button
            document.getElementById('btnCancelAddUser').onclick = () => {
                document.getElementById('modalCloseBtn').click();
            };

            // Create button submit action
            document.getElementById('btnConfirmAddUser').onclick = () => {
                const name = document.getElementById('addUserName').value.trim();
                const email = emailInput.value.trim();
                const pass = passInput.value.trim();
                const role = roleSelect.value;
                const phone = document.getElementById('addUserPhone').value.trim();

                if (!name) {
                    alert('Lütfen Ad Soyad girin!');
                    return;
                }
                if (!email) {
                    alert('Lütfen E-posta girin!');
                    return;
                }
                if (!pass || pass.length < 6) {
                    alert('Şifre en az 6 karakter olmalıdır!');
                    return;
                }
                if (!role) {
                    alert('Lütfen bir Rol seçin!');
                    return;
                }

                // Check duplicates
                const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
                if (exists) {
                    alert('Bu e-posta adresine sahip bir kullanıcı zaten var!');
                    return;
                }

                // Add to state
                users.push({
                    id: Date.now(),
                    name,
                    email,
                    password: pass,
                    role,
                    phone: phone || ''
                });

                window.BrenerApp.saveStateToStorage();
                window.BrenerApp.showToast('success', `${name} için yeni kullanıcı hesabı başarıyla oluşturuldu.`);
                document.getElementById('modalCloseBtn').click();
                this.renderUserManagement(container);
            };
        };

        // Save Matrix Action
        document.getElementById('saveMatrixBtn').onclick = () => {
            const checkboxes = document.querySelectorAll('.matrix-checkbox');
            
            // Rebuild rolePermissions structure cleanly
            window.BrenerApp.state.rolePermissions = {};
            
            checkboxes.forEach(cb => {
                const r = cb.getAttribute('data-role');
                const viewCode = cb.getAttribute('data-view');
                if (!r || !viewCode) return;
                
                const isChecked = cb.checked;
                
                if (!window.BrenerApp.state.rolePermissions[r]) {
                    window.BrenerApp.state.rolePermissions[r] = {};
                }
                // Store false explicitly if unchecked so default logic checks out
                window.BrenerApp.state.rolePermissions[r][viewCode] = isChecked;
            });

            window.BrenerApp.saveStateToStorage();
            window.BrenerApp.applyRolePermissions();
            window.BrenerApp.showToast('success', 'Tüm menü ve alt menü yetkileri başarıyla güncellendi ve uygulandı.');
            this.renderUserManagement(container);
        };
    },

    deleteUser(id) {
        const users = window.BrenerApp.state.users;
        const userToDelete = users.find(u => u.id === id);
        if (userToDelete) {
            window.BrenerApp.state.users = users.filter(u => u.id !== id);
            window.BrenerApp.saveStateToStorage();
            window.BrenerApp.showToast('danger', `${userToDelete.name} kullanıcısı silindi.`);
            this.renderUserManagement(document.getElementById('contentWindow'));
        }
    },

    // 14. Sistem Logları ve Aktivite Geçmişi
    renderSystemLogs(container) {
        window.BrenerApp.updateTopbarTitle('Sistem Logları & Aktivite Geçmişi', 'Sistem Olayları, İşlem Geçmişi ve Güvenlik Denetimleri');

        let html = `
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header" style="flex-wrap: wrap; gap: 15px; margin-bottom: 16px;">
                    <h2>📋 Aktivite ve Olay Günlüğü</h2>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-left: auto;">
                        <button class="btn btn-secondary btn-sm" id="exportLogsBtn">📥 Logları İndir (JSON)</button>
                        <button class="btn btn-danger btn-sm" id="clearLogsBtn">🗑️ Geçmişi Temizle</button>
                    </div>
                </div>

                <!-- Filtreleme Alanı -->
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <input type="text" id="logSearch" placeholder="Loglarda ara (Kullanıcı, açıklama)..." style="width: 100%; padding: 10px 14px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <select id="logCategoryFilter" style="width: 100%; padding: 10px;">
                            <option value="all">Tüm Kategoriler</option>
                            <option value="sistem">Sistem</option>
                            <option value="proje">Proje</option>
                            <option value="santiye">Şantiye</option>
                            <option value="finans">Finans</option>
                            <option value="saha">Saha</option>
                            <option value="ai">Yapay Zeka (AI)</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <select id="logTypeFilter" style="width: 100%; padding: 10px;">
                            <option value="all">Tüm Seviyeler</option>
                            <option value="info">Bilgi (Info)</option>
                            <option value="success">Başarılı (Success)</option>
                            <option value="warning">Uyarı (Warning)</option>
                            <option value="danger">Hata / Risk (Danger)</option>
                        </select>
                    </div>
                </div>

                <!-- Log Tablosu -->
                <div class="table-responsive" style="max-height: 550px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;" id="logsTable">
                        <thead>
                            <tr style="background: rgba(255, 255, 255, 0.02); text-align: left; border-bottom: 1px solid var(--border-color);">
                                <th style="padding: 12px 16px; width: 170px;">Zaman Damgası</th>
                                <th style="padding: 12px 16px; width: 150px;">Kullanıcı</th>
                                <th style="padding: 12px 16px; width: 100px;">Kategori</th>
                                <th style="padding: 12px 16px;">Olay / Açıklama</th>
                            </tr>
                        </thead>
                        <tbody id="logsTableBody">
                            <!-- Dinamik olarak doldurulacak -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const logs = window.BrenerApp.state.logs || [];
        const tableBody = document.getElementById('logsTableBody');
        const searchInput = document.getElementById('logSearch');
        const categoryFilter = document.getElementById('logCategoryFilter');
        const typeFilter = document.getElementById('logTypeFilter');
        const exportBtn = document.getElementById('exportLogsBtn');
        const clearBtn = document.getElementById('clearLogsBtn');

        const roleLabels = { admin: 'Yönetici', sefi: 'Şantiye Şefi', muhasebe: 'Muhasebeci', saha: 'Saha Ekibi', system: 'Sistem', guest: 'Misafir' };
        const categoryLabels = { sistem: 'Sistem', proje: 'Proje', santiye: 'Şantiye', finans: 'Finans', saha: 'Saha', ai: 'Yapay Zeka' };

        const filterAndRenderLogs = () => {
            const query = searchInput.value.toLowerCase().trim();
            const selectedCat = categoryFilter.value;
            const selectedType = typeFilter.value;

            tableBody.innerHTML = '';

            const filtered = logs.filter(log => {
                const matchesSearch = log.action.toLowerCase().includes(query) || 
                                      log.user.toLowerCase().includes(query) || 
                                      (log.details && log.details.toLowerCase().includes(query));
                
                const matchesCat = selectedCat === 'all' || log.category === selectedCat;
                const matchesType = selectedType === 'all' || log.type === selectedType;

                return matchesSearch && matchesCat && matchesType;
            });

            if (filtered.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 40px; color: var(--text-muted);">
                            Aradığınız kriterlere uygun sistem logu bulunamadı.
                        </td>
                    </tr>
                `;
                return;
            }

            filtered.forEach(log => {
                const tr = document.createElement('tr');
                
                // Color left-border based on log level/type
                let borderStyle = 'border-left: 4px solid var(--border-color);';
                if (log.type === 'success') borderStyle = 'border-left: 4px solid var(--success);';
                else if (log.type === 'warning') borderStyle = 'border-left: 4px solid var(--warning);';
                else if (log.type === 'danger') borderStyle = 'border-left: 4px solid var(--danger);';
                else if (log.type === 'info') borderStyle = 'border-left: 4px solid var(--primary);';

                tr.style = `border-bottom: 1px solid var(--border-color); background: rgba(255,255,255,0.01);`;
                
                const timeStr = new Date(log.timestamp).toLocaleString('tr-TR');
                
                // Class for role badge
                let roleClass = 'badge-info';
                if (log.role === 'admin') roleClass = 'badge-danger';
                else if (log.role === 'sefi') roleClass = 'badge-primary';
                else if (log.role === 'muhasebe') roleClass = 'badge-warning';
                else if (log.role === 'system') roleClass = 'badge-success';

                // Class for category badge
                let catClass = 'badge-secondary';
                if (log.category === 'finans') catClass = 'badge-success';
                else if (log.category === 'proje') catClass = 'badge-info';
                else if (log.category === 'santiye') catClass = 'badge-warning';
                else if (log.category === 'saha') catClass = 'badge-primary';
                else if (log.category === 'ai') catClass = 'badge-danger';

                tr.innerHTML = `
                    <td style="padding: 12px 16px; font-weight: 500; font-family: monospace; ${borderStyle}">${timeStr}</td>
                    <td style="padding: 12px 16px;">
                        <span style="font-weight: 600; display: block; color: var(--text-main);">${log.user}</span>
                        <span class="badge ${roleClass}" style="font-size: 0.65rem; margin-top: 3px; display: inline-block;">${roleLabels[log.role] || log.role}</span>
                    </td>
                    <td style="padding: 12px 16px;">
                        <span class="badge ${catClass}" style="font-size: 0.7rem; font-weight: 600;">${categoryLabels[log.category] || log.category}</span>
                    </td>
                    <td style="padding: 12px 16px; line-height: 1.4;">
                        <div style="font-weight: 500; color: var(--text-main);">${log.action}</div>
                        ${log.details ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; font-family: monospace; background: rgba(0,0,0,0.15); padding: 4px 8px; border-radius: 4px;">${log.details}</div>` : ''}
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        };

        // Event hooks
        searchInput.oninput = filterAndRenderLogs;
        categoryFilter.onchange = filterAndRenderLogs;
        typeFilter.onchange = filterAndRenderLogs;

        // Clear Logs
        clearBtn.onclick = () => {
            if (confirm("Tüm log geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
                window.BrenerApp.state.logs = [];
                window.BrenerApp.logActivity('sistem', 'Sistem log geçmişi yönetici tarafından temizlendi.', 'warning');
                window.BrenerApp.showToast('danger', 'Log geçmişi temizlendi.');
                
                this.renderSystemLogs(container);
            }
        };

        // Export Logs as JSON file
        exportBtn.onclick = () => {
            const query = searchInput.value.toLowerCase().trim();
            const selectedCat = categoryFilter.value;
            const selectedType = typeFilter.value;

            const filteredLogs = logs.filter(log => {
                const matchesSearch = log.action.toLowerCase().includes(query) || 
                                      log.user.toLowerCase().includes(query) || 
                                      (log.details && log.details.toLowerCase().includes(query));
                const matchesCat = selectedCat === 'all' || log.category === selectedCat;
                const matchesType = selectedType === 'all' || log.type === selectedType;
                return matchesSearch && matchesCat && matchesType;
            });

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 4));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `brener_sistem_loglari_${new Date().toISOString().slice(0,10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            
            window.BrenerApp.showToast('success', 'Log kayıtları JSON olarak indirildi.');
        };

        // Initial render
        filterAndRenderLogs();
    }
};
