window.BrenerApp.Talepler = {
    currentSubView: 'list', // 'list' or 'create'

    initData() {
        if (!window.BrenerApp.state.requests) {
            window.BrenerApp.state.requests = [
                {
                    id: 'TEST-TAL-001',
                    title: 'Test - Ek Malzeme Talebi',
                    category: 'Malzeme',
                    priority: 'Normal',
                    project: 'TEST - Demo İnşaat Projesi',
                    status: 'Onaylandı',
                    source: 'Saha',
                    description: 'Kaba inşaat aşamasında tavan betonu dökümü öncesinde kalıp iskelesi takviyesi için ek kereste ve plywood tedarik edilmesi gerekmektedir.'
                }
            ];
            window.BrenerApp.saveStateToStorage();
        }
    },

    render(container) {
        this.initData();
        
        if (this.currentSubView === 'create') {
            this.renderCreateForm(container);
        } else {
            this.renderListView(container);
        }
    },

    renderListView(container) {
        window.BrenerApp.updateTopbarTitle('Talepler', 'Talep ve onay süreçlerini yönetin');

        const requests = window.BrenerApp.state.requests || [];
        
        // Metrics calculation
        const totalCount = requests.length;
        const pendingCount = requests.filter(r => r.status === 'Bekliyor' || r.status === 'Bekleyen').length;
        const approvedCount = requests.filter(r => r.status === 'Onaylandı').length;
        const criticalCount = requests.filter(r => r.priority === 'Kritik').length;

        let html = `
            <!-- Top Actions/Metrics Cards -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📋 Talepler</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-muted);">Talep ve onay süreçlerini yönetin</p>
                </div>
                <button class="btn btn-primary" id="btnGoToCreateRequest" style="display: flex; align-items: center; gap: 8px; font-weight: bold; background: #1e293b; border: none; color: white;">
                    ➕ Yeni Talep
                </button>
            </div>

            <!-- 4 Metric Cards Grid -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Toplam Talep</div>
                        <strong style="font-size: 1.8rem; display: block; margin-top: 6px; color: var(--text-main);">${totalCount}</strong>
                    </div>
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(59, 130, 246, 0.1); color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">❓</div>
                </div>

                <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Bekleyen</div>
                        <strong style="font-size: 1.8rem; display: block; margin-top: 6px; color: var(--text-main);">${pendingCount}</strong>
                    </div>
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(245, 158, 11, 0.1); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">🕒</div>
                </div>

                <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Onaylanan</div>
                        <strong style="font-size: 1.8rem; display: block; margin-top: 6px; color: var(--text-main);">${approvedCount}</strong>
                    </div>
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">✔</div>
                </div>

                <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Kritik</div>
                        <strong style="font-size: 1.8rem; display: block; margin-top: 6px; color: var(--text-main);">${criticalCount}</strong>
                    </div>
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">🛡</div>
                </div>
            </div>

            <!-- Filter & Search Bar Card -->
            <div class="card" style="padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
                    <span id="filteredRequestsCount">${totalCount} kayıt bulundu</span>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" style="padding: 6px 10px; opacity: 0.5;">📁 Grid</button>
                        <button class="btn btn-primary btn-sm" style="padding: 6px 10px; background: #1e293b; border: none;">📋 Liste</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 12px;">
                    <div style="position: relative;">
                        <input type="text" id="searchRequestInput" placeholder="Talep başlığı veya numarası ara..." style="width: 100%; padding-left: 36px;">
                        <span style="position: absolute; left: 12px; top: 11px; color: var(--text-muted); font-size: 0.9rem;">🔍</span>
                    </div>

                    <select id="filterRequestStatus" style="width: 100%;">
                        <option value="">Tüm Durumlar</option>
                        <option value="Bekliyor">Bekliyor</option>
                        <option value="Onaylandı">Onaylandı</option>
                        <option value="Reddedildi">Reddedildi</option>
                    </select>

                    <select id="filterRequestPriority" style="width: 100%;">
                        <option value="">Tüm Öncelikler</option>
                        <option value="Düşük">Düşük</option>
                        <option value="Normal">Normal</option>
                        <option value="Yüksek">Yüksek</option>
                        <option value="Kritik">Kritik</option>
                    </select>

                    <select id="filterRequestCategory" style="width: 100%;">
                        <option value="">Tüm Kategoriler</option>
                        <option value="Malzeme">Malzeme</option>
                        <option value="Hizmet">Hizmet</option>
                        <option value="Makine & Ekipman">Makine & Ekipman</option>
                        <option value="Diğer">Diğer</option>
                    </select>
                </div>
            </div>

            <!-- Requests List Table Card -->
            <div class="card" style="padding: 0; overflow: hidden;">
                <table class="matrix-table" style="width: 100%; border-collapse: collapse; margin-top: 0;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border-color); background: rgba(255,255,255,0.02);">
                            <th style="padding: 12px 16px; text-align: left; font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Talep No</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Başlık</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Kategori</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Öncelik</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Proje</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Durum</th>
                            <th style="padding: 12px 16px; text-align: center; font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="requestsTableBody">
                        <!-- Rows rendered dynamically -->
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;

        // Actions mapping
        document.getElementById('btnGoToCreateRequest').onclick = () => {
            this.currentSubView = 'create';
            this.render(container);
        };

        // Filter event listeners
        const searchInput = document.getElementById('searchRequestInput');
        const filterStatus = document.getElementById('filterRequestStatus');
        const filterPriority = document.getElementById('filterRequestPriority');
        const filterCategory = document.getElementById('filterRequestCategory');

        const filterRows = () => {
            const query = searchInput.value.toLowerCase().trim();
            const status = filterStatus.value;
            const priority = filterPriority.value;
            const category = filterCategory.value;

            const filtered = requests.filter(r => {
                const matchSearch = r.title.toLowerCase().includes(query) || r.id.toLowerCase().includes(query);
                const matchStatus = !status || r.status === status;
                const matchPriority = !priority || r.priority === priority;
                const matchCategory = !category || r.category === category;
                return matchSearch && matchStatus && matchPriority && matchCategory;
            });

            document.getElementById('filteredRequestsCount').textContent = `${filtered.length} kayıt bulundu`;
            this.renderTableRows(filtered);
        };

        searchInput.oninput = filterRows;
        filterStatus.onchange = filterRows;
        filterPriority.onchange = filterRows;
        filterCategory.onchange = filterRows;

        // Render initial table rows
        this.renderTableRows(requests);
    },

    renderTableRows(items) {
        const body = document.getElementById('requestsTableBody');
        if (!body) return;

        if (items.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem;">
                        Herhangi bir talep kaydı bulunamadı.
                    </td>
                </tr>
            `;
            return;
        }

        const priorityColors = {
            'Düşük': 'background: rgba(255,255,255,0.05); color: var(--text-muted);',
            'Normal': 'background: rgba(59, 130, 246, 0.1); color: #3b82f6;',
            'Yüksek': 'background: rgba(249, 115, 22, 0.1); color: #f97316;',
            'Kritik': 'background: rgba(239, 68, 68, 0.1); color: #ef4444; font-weight: bold;'
        };

        const statusBadges = {
            'Bekliyor': '<span class="badge badge-warning">Bekliyor</span>',
            'Bekleyen': '<span class="badge badge-warning">Bekliyor</span>',
            'Onaylandı': '<span class="badge badge-success">Onaylandı</span>',
            'Reddedildi': '<span class="badge badge-danger">Reddedildi</span>'
        };

        body.innerHTML = items.map(r => {
            const prioStyle = priorityColors[r.priority] || '';
            const statusBadge = statusBadges[r.status] || `<span class="badge badge-info">${r.status}</span>`;

            return `
                <tr style="border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;" class="request-row" data-id="${r.id}">
                    <td style="padding: 12px 16px; font-weight: bold; font-size: 0.8rem; color: var(--primary);">${r.id}</td>
                    <td style="padding: 12px 16px; font-weight: 600; font-size: 0.85rem;">${r.title}</td>
                    <td style="padding: 12px 16px; font-size: 0.78rem;">
                        <span style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 20px;">${r.category}</span>
                    </td>
                    <td style="padding: 12px 16px; font-size: 0.74rem;">
                        <span style="padding: 4px 8px; border-radius: 20px; ${prioStyle}">${r.priority}</span>
                    </td>
                    <td style="padding: 12px 16px; font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                        🏢 ${r.project || 'Genel Proje'}
                    </td>
                    <td style="padding: 12px 16px;">${statusBadge}</td>
                    <td style="padding: 12px 16px; text-align: center;" onclick="event.stopPropagation();">
                        ${r.status === 'Bekliyor' || r.status === 'Bekleyen' ? `
                            <button class="btn btn-success btn-sm btnActionApprove" data-id="${r.id}" style="padding: 4px 8px; font-size: 0.7rem; font-weight: bold;">Onayla</button>
                            <button class="btn btn-danger btn-sm btnActionReject" data-id="${r.id}" style="padding: 4px 8px; font-size: 0.7rem; font-weight: bold;">Reddet</button>
                        ` : `
                            <span style="font-size: 0.72rem; color: var(--text-muted);">İşlem Tamam</span>
                        `}
                    </td>
                </tr>
            `;
        }).join('');

        // Bind Row click events for details view modal
        body.querySelectorAll('.request-row').forEach(row => {
            row.onclick = () => {
                const id = row.getAttribute('data-id');
                this.showRequestDetailModal(id);
            };
        });

        // Bind Approve/Reject buttons
        body.querySelectorAll('.btnActionApprove').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                this.updateRequestStatus(id, 'Onaylandı');
            };
        });

        body.querySelectorAll('.btnActionReject').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                this.updateRequestStatus(id, 'Reddedildi');
            };
        });
    },

    showRequestDetailModal(id) {
        const r = window.BrenerApp.state.requests.find(item => item.id === id);
        if (!r) return;

        const modalHtml = `
            <div style="padding: 20px; font-size: 0.9rem; display: flex; flex-direction: column; gap: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase;">Talep No / Başlık</span>
                        <strong>${r.id} - ${r.title}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase;">Proje</span>
                        <strong>🏢 ${r.project}</strong>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Kategori</span>
                        <strong style="color: var(--primary);">${r.category}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Öncelik</span>
                        <strong style="color: #3b82f6;">${r.priority}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Kaynak</span>
                        <strong>${r.source || 'Saha'}</strong>
                    </div>
                </div>

                <div>
                    <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase; margin-bottom: 6px;">Talep Açıklaması</span>
                    <p style="margin: 0; line-height: 1.5; padding: 10px; background: rgba(255,255,255,0.01); border-radius: 6px; border: 1px solid var(--border-color); color: var(--text-main); font-size: 0.85rem;">
                        ${r.description}
                    </p>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                    <button class="btn btn-secondary" onclick="window.BrenerApp.closeModal()">Kapat</button>
                </div>
            </div>
        `;

        window.BrenerApp.openModal(`📋 Talep Detayı - ${r.id}`, modalHtml);
    },

    updateRequestStatus(id, newStatus) {
        const r = window.BrenerApp.state.requests.find(item => item.id === id);
        if (r) {
            r.status = newStatus;
            window.BrenerApp.saveStateToStorage();
            window.BrenerApp.showToast('success', `Talep ${id} durumu '${newStatus}' olarak güncellendi.`);
            window.BrenerApp.logActivity('genel', `Talep durumu güncellendi: ${id} -> ${newStatus}`, 'success');
            
            // Re-render
            this.render(document.getElementById('contentWindow'));
        }
    },

    renderCreateForm(container) {
        window.BrenerApp.updateTopbarTitle('Yeni Talep', 'Yeni bir talep oluşturun');

        const projects = window.BrenerApp.state.projects || [];

        let html = `
            <!-- Form Header with Back Arrow Button -->
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                <button class="btn btn-secondary btn-sm" id="btnBackToRequestList" style="padding: 10px; border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                    ⬅
                </button>
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Yeni Talep</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-muted);">Yeni bir talep oluşturun</p>
                </div>
            </div>

            <!-- Form Card -->
            <div class="card" style="padding: 24px; max-width: 900px; margin: 0 auto;">
                <div class="card-header" style="margin-bottom: 20px;">
                    <h3 style="font-size: 1.1rem; font-weight: bold; color: var(--primary);">Talep Bilgileri</h3>
                    <span style="font-size: 0.76rem; color: var(--text-muted); display: block; margin-top: 4px;">Talep detaylarını girin</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div class="form-group">
                        <label>Başlık *</label>
                        <input type="text" id="addRequestTitle" placeholder="Talep başlığı girin" required style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>Proje</label>
                        <select id="addRequestProject" style="width: 100%;">
                            <option value="">Proje seçin (opsiyonel)</option>
                            ${projects.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div class="form-group">
                        <label>Kategori *</label>
                        <select id="addRequestCategory" style="width: 100%;">
                            <option value="Malzeme">Malzeme</option>
                            <option value="Hizmet">Hizmet</option>
                            <option value="Makine & Ekipman">Makine & Ekipman</option>
                            <option value="Diğer" selected>Diğer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Kaynak *</label>
                        <select id="addRequestSource" style="width: 100%;">
                            <option value="Saha" selected>Saha</option>
                            <option value="Ofis">Ofis</option>
                            <option value="Müşteri">Müşteri</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label>Öncelik *</label>
                    <select id="addRequestPriority" style="width: 100%;">
                        <option value="Düşük">Düşük</option>
                        <option value="Normal" selected>Normal</option>
                        <option value="Yüksek">Yüksek</option>
                        <option value="Kritik">Kritik</option>
                    </select>
                </div>

                <div class="form-group" style="margin-bottom: 24px;">
                    <label>Açıklama *</label>
                    <textarea id="addRequestDescription" rows="4" placeholder="Talebin detaylı açıklamasını girin..." required style="width: 100%;"></textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 20px;">
                    <button class="btn btn-secondary" id="btnCancelCreateRequest" style="padding: 10px 20px;">İptal</button>
                    <button class="btn btn-primary" id="btnSaveNewRequest" style="padding: 10px 24px; background: #1e293b; border: none; color: white; display: flex; align-items: center; gap: 6px; font-weight: bold;">
                        💾 Kaydet
                    </button>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // Cancel / Back actions
        const goBack = () => {
            this.currentSubView = 'list';
            this.render(container);
        };

        document.getElementById('btnBackToRequestList').onclick = goBack;
        document.getElementById('btnCancelCreateRequest').onclick = goBack;

        // Save Action
        document.getElementById('btnSaveNewRequest').onclick = () => {
            const title = document.getElementById('addRequestTitle').value.trim();
            const project = document.getElementById('addRequestProject').value;
            const category = document.getElementById('addRequestCategory').value;
            const source = document.getElementById('addRequestSource').value;
            const priority = document.getElementById('addRequestPriority').value;
            const description = document.getElementById('addRequestDescription').value.trim();

            if (!title || !description) {
                alert('Lütfen Başlık ve Açıklama alanlarını doldurun!');
                return;
            }

            // Generate next request ID
            const requests = window.BrenerApp.state.requests || [];
            const nextNum = requests.length + 1;
            const newId = `TEST-TAL-${nextNum.toString().padStart(3, '0')}`;

            const newRequest = {
                id: newId,
                title,
                category,
                priority,
                project: project || 'Genel Proje',
                status: 'Bekliyor',
                source,
                description
            };

            requests.push(newRequest);
            window.BrenerApp.saveStateToStorage();
            window.BrenerApp.logActivity('genel', `Yeni talep oluşturuldu: ${newId} - ${title}`, 'success', description);
            window.BrenerApp.showToast('success', `${newId} numaralı yeni talep başarıyla oluşturuldu.`);

            // Redirect back to list view
            this.currentSubView = 'list';
            this.render(container);
        };
    }
};
