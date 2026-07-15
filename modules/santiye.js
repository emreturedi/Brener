window.BrenerApp.Santiye = {
    render(view, container) {
        const activeProj = window.BrenerApp.getActiveProject();
        if (view === 'santiye-gunlugu')   this.renderDiary(activeProj, container);
        else if (view === 'is-programi')  this.renderGantt(activeProj, container);
        else if (view === 'personel-puantaj') this.renderAttendance(activeProj, container);
        else if (view === 'malzeme-stok') this.renderStock(activeProj, container);
        else if (view === 'isg-kaza')     this.renderHse(activeProj, container);
        else if (view === 'hava-beton')   this.renderConcrete(activeProj, container);
        else if (view === 'musteri-raporu') this.renderMusteriRaporu(container);
        else if (view === 'malik-raporu') this.renderMalikRaporu(container);
    },

    /* ====================================================================
       1. ŞANTİYE GÜNLÜĞÜ
    ==================================================================== */
    renderDiary(project, container) {
        window.BrenerApp.updateTopbarTitle('Şantiye Günlüğü', `${project.name} — Günlük Rapor Kayıt Defteri`);

        container.innerHTML = `
        <style>
            .btn-tab {
                padding: 8px 18px;
                background: transparent;
                border: none;
                color: var(--text-muted);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                border-radius: 6px;
                font-size: 0.85rem;
            }
            .btn-tab:hover {
                color: var(--text-main);
                background: rgba(255,255,255,0.02);
            }
            .btn-tab.active {
                background: #ffffff !important;
                color: #1e3a8a !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
        </style>

        <!-- PROJE ÖZET VE TEKNİK BİLGİ KARTI -->
        <div class="card" style="margin-bottom: 24px; border-left: 5px solid var(--primary); padding: 24px;">
            <h2 style="font-size: 1.1rem; font-weight: bold; margin-bottom: 16px; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                📋 Proje Teknik Bilgi Kartı
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; font-size: 0.82rem; line-height: 1.5;">
                
                <!-- Temel Bilgiler -->
                <div style="border-right: 1px solid var(--border-color); padding-right: 15px;">
                    <div style="font-weight: bold; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Temel Bilgiler</div>
                    <div><strong>Proje Tipi:</strong> ${project.type || 'Belirtilmemiş'}</div>
                    <div style="margin-top: 4px;"><strong>Adres:</strong> ${project.location || '—'}</div>
                    <div style="margin-top: 4px; color: var(--text-muted); max-height: 60px; overflow-y: auto;"><strong>Açıklama:</strong> ${project.description || '—'}</div>
                </div>

                <!-- Özellikler & Tipler -->
                <div style="border-right: 1px solid var(--border-color); padding-right: 15px;">
                    <div style="font-weight: bold; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Özellikler & Tipler</div>
                    <div><strong>Özellikler:</strong></div>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px;">
                        ${project.features && project.features.length > 0 
                            ? project.features.map(f => `<span class="badge badge-primary" style="font-size: 0.65rem; padding: 2px 6px;">${f}</span>`).join('')
                            : '<span style="color: var(--text-muted);">Seçilmemiş</span>'
                        }
                    </div>
                    <div style="margin-top: 8px;"><strong>Birim Tipleri:</strong></div>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px;">
                        ${project.unitTypes && project.unitTypes.length > 0 
                            ? project.unitTypes.map(t => `<span class="badge badge-teal" style="font-size: 0.65rem; padding: 2px 6px; background: #0d9488; color: #fff;">${t}</span>`).join('')
                            : '<span style="color: var(--text-muted);">Seçilmemiş</span>'
                        }
                    </div>
                </div>

                <!-- Teknik Bilgiler -->
                <div style="border-right: 1px solid var(--border-color); padding-right: 15px;">
                    <div style="font-weight: bold; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Teknik & Yapı</div>
                    <div><strong>Toplam Alan:</strong> ${(project.area || project.totalArea) ? (project.area || project.totalArea).toLocaleString('tr-TR') + ' m²' : 'Belirtilmemiş'}</div>
                    <div style="margin-top: 4px;"><strong>Blok / Kat Detayları:</strong></div>
                    <div style="margin-top: 3px; max-height: 80px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px;">
                        ${project.blocks && project.blocks.length > 0 
                            ? project.blocks.map(b => `<div style="font-size: 0.78rem; background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 3px;">🏢 ${b.name}: ${b.floors} Kat</div>`).join('')
                            : '<span style="color: var(--text-muted);">Blok bilgisi girilmemiş</span>'
                        }
                    </div>
                    <div style="margin-top: 4px; font-weight: bold; color: var(--primary);">Toplam Kat Sayısı: ${project.blocks ? project.blocks.reduce((acc, b) => acc + b.floors, 0) : 0}</div>
                </div>

                <!-- Zaman & Bütçe -->
                <div>
                    <div style="font-weight: bold; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Zaman & Bütçe</div>
                    <div><strong>Bütçe:</strong> ${project.budget ? project.budget.toLocaleString('tr-TR') + ' ₺' : '—'}</div>
                    <div style="margin-top: 4px;"><strong>Başlangıç Tarihi:</strong> ${project.startDate || '—'}</div>
                    <div style="margin-top: 4px;"><strong>Bitiş Tarihi:</strong> ${project.endDate || '—'}</div>
                    <div style="margin-top: 8px;">
                        <div class="progress-info" style="font-size: 0.72rem; margin-bottom: 2px;">
                            <span>İş İlerleme Oranı</span>
                            <span>%${project.progress || 0}</span>
                        </div>
                        <div class="progress-bar-bg" style="height: 5px;">
                            <div class="progress-bar-fill" style="width: ${project.progress || 0}%;"></div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- ALT ARAÇ ÇUBUĞU (ACTIONS TOOLBAR) -->
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 20px 0 16px 0;">
            <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                <button id="btnActionLoc" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-main); font-weight: 600; border-radius: 6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                    Konum
                </button>
                <button id="btnActionEdit" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-main); font-weight: 600; border-radius: 6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Düzenle
                </button>
                <button id="btnActionConvert" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #8b5cf6; border: none; color: #ffffff; font-weight: 600; border-radius: 6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    İlana Dönüştür
                </button>
                <button id="btnActionSketch" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid #f97316; background: transparent; color: #f97316; font-weight: 600; border-radius: 6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    Kroki ile Güncelle
                </button>
                <button id="btnActionVoiceReport" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(135deg, #f97316, #ea580c); border: none; color: #ffffff; font-weight: 600; border-radius: 6px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2);">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/></svg>
                    AI Sesli Rapor Gir
                </button>
                <button id="btnActionDelete" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid #ef4444; background: transparent; color: #ef4444; font-weight: 600; border-radius: 6px; margin-left: auto;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    Sil
                </button>
            </div>
        </div>

        <!-- NEW DETAIL NAVIGATION TABS (AS HIGHLIGHTED IN SCREENSHOT) -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 6px 12px; margin-bottom: 24px; display: flex; gap: 10px; overflow-x: auto;" id="projectDetailTabs">
            <button class="btn-tab active" data-tab="genel">Genel Bilgiler</button>
            <button class="btn-tab" data-tab="asamalar">Proje Aşamaları</button>
            <button class="btn-tab" data-tab="bagimsiz">Bağımsız Bölümler</button>
            <button class="btn-tab" data-tab="kalemler">İş Kalemleri</button>
            <button class="btn-tab" data-tab="butce">Bütçe</button>
            <button class="btn-tab" data-tab="malzeme">Malzeme Seçimleri</button>
            <button class="btn-tab" data-tab="yonetmelik">Yönetmelik</button>
            <button class="btn-tab" data-tab="ekip">Ekip</button>
            <button class="btn-tab" data-tab="ilan">İlan</button>
        </div>

        <!-- Dynamic Content Body -->
        <div id="projectDetailTabContent"></div>
        `;

        // Inner Tab Render Helper
        const switchTab = (tabName) => {
            const tabContent = document.getElementById('projectDetailTabContent');
            if (!tabContent) return;

            // Update Tab classes
            container.querySelectorAll('#projectDetailTabs .btn-tab').forEach(btn => {
                if (btn.getAttribute('data-tab') === tabName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            if (tabName === 'asamalar') {
                // RENDER PROJECT PHASES (PROJE AŞAMALARI)
                let phases = JSON.parse(localStorage.getItem(`brener_phases_${project.id}`));
                if (!phases || phases.length === 0) {
                    phases = [
                        { id: 1, name: 'Tahliye & Yıkım', status: 'Tamamlandı', date: '14 Şub 2025', progress: '0/4 görev tamamlandı', percent: 0, alert: null },
                        { id: 2, name: 'Temel & Hafriyat', status: 'Tamamlandı', date: '28 Mar 2025', progress: '0/3 görev tamamlandı', percent: 0, alert: null },
                        { id: 3, name: 'Kaba İnşaat (Bodrum-3. Kat)', status: 'Şu Anki Aşama', date: '30 Haz 2025', progress: '0/4 görev tamamlandı', percent: 0, alert: { text: 'Gecikti (169 gün)', type: 'danger' } },
                        { id: 4, name: 'Kaba İnşaat (4-7. Kat) & Çatı', status: 'Tamamlanmadı', date: '15 Eyl 2025', progress: 'Tüm görevler tamamlandı', percent: 0, alert: null },
                        { id: 5, name: 'İnce İşler & Tesisat', status: 'Tamamlanmadı', date: '31 Eki 2025', progress: 'Tüm görevler tamamlandı', percent: 0, alert: null },
                        { id: 6, name: 'Dış Cephe & Teslim', status: 'Tamamlanmadı', date: '30 Kas 2025', progress: 'Tüm görevler tamamlandı', percent: 0, alert: { text: '1 fon bağlı', type: 'info' } }
                    ];
                    localStorage.setItem(`brener_phases_${project.id}`, JSON.stringify(phases));
                }

                const currentPhaseObj = phases.find(p => p.status === 'Şu Anki Aşama') || { name: 'Belirtilmedi' };

                let phasesHtml = `
                    <div class="card-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2>📍 Proje Zaman Aşamaları (Timeline)</h2>
                            <span style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; display: block;">
                                Şu anki aşama: <strong style="color: var(--primary);">${currentPhaseObj.name}</strong>
                            </span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary btn-sm" id="btnDetailExportPhasesExcel">📥 Excel'e Aktar</button>
                            <button class="btn btn-secondary btn-sm" id="btnDetailAutoCalendar">📅 Otomatik Takvimle</button>
                            <button class="btn btn-primary btn-sm" id="btnDetailAddNewPhase">➕ Aşama Ekle</button>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                `;

                phases.forEach((p, idx) => {
                    const isCompleted = p.status === 'Tamamlandı';
                    const isActive = p.status === 'Şu Anki Aşama';
                    
                    let iconHtml = '';
                    if (isCompleted) {
                        iconHtml = `<div class="circle-icon circle-completed" title="Tamamlandı">✔️</div>`;
                    } else if (isActive) {
                        iconHtml = `<div class="circle-icon circle-active">${idx + 1}</div>`;
                    } else {
                        iconHtml = `<div class="circle-icon circle-pending">${idx + 1}</div>`;
                    }

                    let statusBadge = '';
                    if (isCompleted) {
                        statusBadge = `<span class="badge badge-success" style="font-size: 0.65rem; padding: 2px 6px;">Tamamlandı</span>`;
                    } else if (isActive) {
                        statusBadge = `<span class="badge badge-primary" style="font-size: 0.65rem; padding: 2px 6px;">Şu Anki Aşama</span>`;
                    } else {
                        statusBadge = `<span class="badge badge-secondary" style="font-size: 0.65rem; padding: 2px 6px;">Tamamlanmadı</span>`;
                    }

                    let alertBadge = '';
                    if (p.alert) {
                        const bg = p.alert.type === 'danger' ? '#ef4444' : '#0d9488';
                        alertBadge = `<span class="badge" style="font-size: 0.65rem; padding: 2px 6px; background: ${bg}; color: #fff; display: inline-flex; align-items: center; gap: 4px; font-weight: bold;">
                            ${p.alert.text}
                        </span>`;
                    }

                    phasesHtml += `
                        <div class="phase-card ${isActive ? 'active-phase' : ''}" style="border: 1px solid var(--border-color); padding: 12px 15px; border-radius: 8px; background: rgba(255,255,255,0.01);">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; gap: 12px; align-items: center; flex: 1;">
                                    ${iconHtml}
                                    <div>
                                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                            <h3 style="font-size: 0.88rem; font-weight: 700; margin: 0; color: var(--text-main);">${p.name}</h3>
                                            ${statusBadge}
                                            ${alertBadge}
                                        </div>
                                        <div style="display: flex; gap: 12px; font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; align-items: center; flex-wrap: wrap;">
                                            <span>🕒 Bitiş: <strong>${p.date}</strong></span>
                                            <span>•</span>
                                            <span style="color: ${p.progress.includes('Tüm') ? '#10b981' : 'var(--text-muted)'}; font-weight: ${p.progress.includes('Tüm') ? 'bold' : 'normal'};">${p.progress}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <button class="arrow-btn btn-detail-move-up" data-idx="${idx}" style="font-size: 0.75rem;" ${idx === 0 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}>▲</button>
                                        <button class="arrow-btn btn-detail-move-down" data-idx="${idx}" style="font-size: 0.75rem;" ${idx === phases.length - 1 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}>▼</button>
                                    </div>
                                    <button class="btn btn-secondary btn-sm btn-detail-edit-phase" data-idx="${idx}" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px;">⚙️</button>
                                    <button class="btn btn-secondary btn-sm btn-detail-delete-phase" data-idx="${idx}" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px; color: var(--danger); border-color: rgba(239, 68, 68, 0.2);">🗑️</button>
                                </div>
                            </div>
                            <!-- progress bar -->
                            <div style="margin-top: 8px;">
                                <div class="progress-bar-bg" style="height: 4px; border-radius: 2px;">
                                    <div class="progress-bar-fill" style="width: ${p.percent || (isCompleted ? 100 : isActive ? 45 : 0)}%; background: ${isCompleted ? '#10b981' : isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; border-radius: 2px;"></div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                phasesHtml += `</div>`;
                tabContent.innerHTML = phasesHtml;

                // Reordering
                tabContent.querySelectorAll('.btn-detail-move-up').forEach(btn => {
                    btn.onclick = () => {
                        const idx = parseInt(btn.getAttribute('data-idx'));
                        if (idx > 0) {
                            const temp = phases[idx];
                            phases[idx] = phases[idx - 1];
                            phases[idx - 1] = temp;
                            localStorage.setItem(`brener_phases_${project.id}`, JSON.stringify(phases));
                            switchTab('asamalar');
                        }
                    };
                });

                tabContent.querySelectorAll('.btn-detail-move-down').forEach(btn => {
                    btn.onclick = () => {
                        const idx = parseInt(btn.getAttribute('data-idx'));
                        if (idx < phases.length - 1) {
                            const temp = phases[idx];
                            phases[idx] = phases[idx + 1];
                            phases[idx + 1] = temp;
                            localStorage.setItem(`brener_phases_${project.id}`, JSON.stringify(phases));
                            switchTab('asamalar');
                        }
                    };
                });

                // Excel & Auto Calendar
                document.getElementById('btnDetailExportPhasesExcel').onclick = () => {
                    window.BrenerApp.showToast('success', 'Aşamalar Excel (XLSX) formatında dışa aktarıldı!');
                };

                document.getElementById('btnDetailAutoCalendar').onclick = () => {
                    let baseDate = new Date();
                    phases.forEach((p, index) => {
                        p.date = new Date(baseDate.getTime() + (index * 35 * 24 * 60 * 60 * 1000)).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
                    });
                    localStorage.setItem(`brener_phases_${project.id}`, JSON.stringify(phases));
                    window.BrenerApp.showToast('success', 'Aşama takvimi otomatik güncellendi!');
                    switchTab('asamalar');
                };

                // Add phase
                document.getElementById('btnDetailAddNewPhase').onclick = () => {
                    const addForm = `
                        <div class="form-group">
                            <label>Aşama Başlığı *</label>
                            <input type="text" id="addPhaseName" placeholder="Örn: İnce Sıva & Boya İşleri" required>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div class="form-group">
                                <label>Planlanan Bitiş Tarihi</label>
                                <input type="text" id="addPhaseDate" placeholder="Örn: 15 Eyl 2025" value="15 Eyl 2025">
                            </div>
                            <div class="form-group">
                                <label>Durum</label>
                                <select id="addPhaseStatus">
                                    <option value="Tamamlanmadı">Tamamlanmadı</option>
                                    <option value="Şu Anki Aşama">Şu Anki Aşama</option>
                                    <option value="Tamamlandı">Tamamlandı</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn btn-primary" id="btnSaveDetailAddPhase" style="width: 100%; margin-top: 10px;">Kaydet</button>
                    `;
                    window.BrenerApp.openModal('Yeni Proje Aşaması Ekle', addForm);

                    document.getElementById('btnSaveDetailAddPhase').onclick = () => {
                        const name = document.getElementById('addPhaseName').value.trim();
                        const date = document.getElementById('addPhaseDate').value.trim();
                        const status = document.getElementById('addPhaseStatus').value;

                        if (!name) {
                            alert('Aşama başlığı girin!');
                            return;
                        }

                        if (status === 'Şu Anki Aşama') {
                            phases.forEach(p => {
                                if (p.status === 'Şu Anki Aşama') p.status = 'Tamamlanmadı';
                            });
                        }

                        phases.push({
                            id: Date.now(),
                            name,
                            status,
                            date: date || '31 Ara 2025',
                            progress: '0/4 görev tamamlandı',
                            percent: 0,
                            alert: null
                        });

                        localStorage.setItem(`brener_phases_${project.id}`, JSON.stringify(phases));
                        window.BrenerApp.showToast('success', 'Yeni aşama eklendi.');
                        document.getElementById('modalCloseBtn').click();
                        switchTab('asamalar');
                    };
                };

                // Edit
                tabContent.querySelectorAll('.btn-detail-edit-phase').forEach(btn => {
                    btn.onclick = () => {
                        const idx = parseInt(btn.getAttribute('data-idx'));
                        const p = phases[idx];

                        const editForm = `
                            <div class="form-group">
                                <label>Aşama Başlığı *</label>
                                <input type="text" id="editPhaseName" value="${p.name}" required>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Planlanan Bitiş Tarihi</label>
                                    <input type="text" id="editPhaseDate" value="${p.date}">
                                </div>
                                <div class="form-group">
                                    <label>Durum</label>
                                    <select id="editPhaseStatus">
                                        <option value="Tamamlanmadı" ${p.status === 'Tamamlanmadı' ? 'selected' : ''}>Tamamlanmadı</option>
                                        <option value="Şu Anki Aşama" ${p.status === 'Şu Anki Aşama' ? 'selected' : ''}>Şu Anki Aşama</option>
                                        <option value="Tamamlandı" ${p.status === 'Tamamlandı' ? 'selected' : ''}>Tamamlandı</option>
                                    </select>
                                </div>
                            </div>
                            <button class="btn btn-primary" id="btnSaveDetailEditPhase" style="width: 100%; margin-top: 10px;">Değişiklikleri Kaydet</button>
                        `;
                        window.BrenerApp.openModal('Aşamayı Düzenle', editForm);

                        document.getElementById('btnSaveDetailEditPhase').onclick = () => {
                            p.name = document.getElementById('editPhaseName').value.trim();
                            p.date = document.getElementById('editPhaseDate').value.trim();
                            p.status = document.getElementById('editPhaseStatus').value;

                            localStorage.setItem(`brener_phases_${project.id}`, JSON.stringify(phases));
                            window.BrenerApp.showToast('success', 'Aşama güncellendi.');
                            document.getElementById('modalCloseBtn').click();
                            switchTab('asamalar');
                        };
                    };
                });

                // Delete
                tabContent.querySelectorAll('.btn-detail-delete-phase').forEach(btn => {
                    btn.onclick = () => {
                        const idx = parseInt(btn.getAttribute('data-idx'));
                        if (confirm('Aşamayı silmek istediğinize emin misiniz?')) {
                            phases.splice(idx, 1);
                            localStorage.setItem(`brener_phases_${project.id}`, JSON.stringify(phases));
                            switchTab('asamalar');
                        }
                    };
                });

            } else if (tabName === 'genel') {
                // RENDER GENERAL INFO (DAILY DIARY & ARCHIVE)
                let logs = JSON.parse(localStorage.getItem(`brener_diary_${project.id}`)) || [
                    { id: 1, date: '2026-06-24', weather: '☀️ Açık, 30°C', tasks: 'A Blok zemin kat kolon demiri döşendi. B Blok temel kalıbı çakıldı. C Blok hafriyat tamamlandı.', crew: '12 Kalıpçı, 8 Demirci, 2 Mühendis', materials: '25 Ton Demir, 120 Torba Çimento', notes: 'Güvenlik denetimi tamamlandı.', progress: 68 },
                    { id: 2, date: '2026-06-23', weather: '⛅ Az Bulutlu, 28°C', tasks: 'A Blok temel betonu döküldü, kürleme yapıldı. C Blok kazı işleri sürdü.', crew: '10 Kalıpçı, 10 Demirci, 1 Kepçe Operatörü', materials: '180 m³ C30 Beton', notes: 'Slump testi: S3 - uygun.', progress: 66 }
                ];
                const today = new Date().toLocaleDateString('tr-TR');

                tabContent.innerHTML = `
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
                        <!-- SOL: Yeni Günlük Rapor Gir -->
                        <div class="card">
                            <div class="card-header" style="margin-bottom:20px;">
                                <h2>📋 Günlük Rapor Gir</h2>
                                <span style="font-size:0.8rem;color:var(--text-muted);">📅 ${today}</span>
                            </div>
                            <div class="form-group">
                                <label>Hava Durumu & Sıcaklık</label>
                                <input type="text" id="diaryWeather" value="☀️ Açık, 29°C">
                            </div>
                            <div class="form-group">
                                <label>Yapılan İmalatlar & Çalışmalar</label>
                                <textarea id="diaryTasks" style="height:90px;" placeholder="Bugün yapılan imalat ve inşaat işlerini detaylandırın..."></textarea>
                            </div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                <div class="form-group">
                                    <label>Çalışan Ekip (kişi)</label>
                                    <input type="text" id="diaryCrew" placeholder="Örn: 8 Kalıpçı, 6 Demirci">
                                </div>
                                <div class="form-group">
                                    <label>Giren Malzemeler</label>
                                    <input type="text" id="diaryMaterials" placeholder="Örn: 20 Ton Demir, 40 m³ Beton">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notlar / Özel Durumlar</label>
                                <textarea id="diaryNotes" style="height:60px;" placeholder="İSG notu, denetim sonucu, teslim alınan belgeler..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Anlık İlerleme (%)</label>
                                <input type="number" id="diaryProgress" value="${project.progress || 0}" min="0" max="100">
                            </div>
                            <button class="btn btn-primary" id="btnSaveDiary" style="width:100%;margin-top:10px;">Raporu Kaydet</button>
                        </div>

                        <!-- SAĞ: Rapor Arşivi -->
                        <div class="card" style="display:flex;flex-direction:column;">
                            <div class="card-header" style="margin-bottom:20px;">
                                <h2>🕒 Rapor Arşivi</h2>
                            </div>
                            <div class="diary-list" style="flex:1;overflow-y:auto;max-height:480px;display:flex;flex-direction:column;gap:15px;padding-right:5px;">
                                ${logs.map(log => `
                                    <div style="border:1px solid var(--border-color);padding:15px;border-radius:6px;background:rgba(255,255,255,0.01);">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;border-bottom:1px dashed var(--border-color);padding-bottom:6px;">
                                            <strong style="color:var(--primary);font-size:0.85rem;">📅 Rapor Tarihi: ${log.date}</strong>
                                            <span style="font-size:0.75rem;background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px;">${log.weather}</span>
                                        </div>
                                        <div style="font-size:0.82rem;line-height:1.4;">
                                            <div style="margin-bottom:6px;"><strong>İmalat/Faaliyet:</strong> ${log.tasks}</div>
                                            <div style="margin-bottom:6px;color:var(--text-muted);"><strong>Çalışan Kadro:</strong> ${log.crew}</div>
                                            <div style="margin-bottom:6px;color:var(--text-muted);"><strong>Kullanılan Malzeme:</strong> ${log.materials}</div>
                                            ${log.notes ? `<div style="color:var(--text-muted);font-style:italic;"><strong>Notlar:</strong> ${log.notes}</div>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;

                // Re-bind save button inside tab content
                document.getElementById('btnSaveDiary').onclick = () => {
                    const weather = document.getElementById('diaryWeather').value.trim();
                    const tasks = document.getElementById('diaryTasks').value.trim();
                    const crew = document.getElementById('diaryCrew').value.trim();
                    const materials = document.getElementById('diaryMaterials').value.trim();
                    const notes = document.getElementById('diaryNotes').value.trim();
                    const newProgress = parseInt(document.getElementById('diaryProgress').value) || 0;

                    if (!tasks) {
                        alert('Lütfen bugün yapılan imalatları girin!');
                        return;
                    }

                    const newLog = {
                        id: Date.now(),
                        date: new Date().toISOString().split('T')[0],
                        weather,
                        tasks,
                        crew: crew || 'Belirtilmemiş',
                        materials: materials || 'Belirtilmemiş',
                        notes: notes,
                        progress: newProgress
                    };

                    logs.unshift(newLog);
                    localStorage.setItem(`brener_diary_${project.id}`, JSON.stringify(logs));

                    project.progress = newProgress;
                    window.BrenerApp.saveStateToStorage();
                    window.BrenerApp.showToast('success', 'Günlük şantiye raporu başarıyla kaydedildi!');
                    
                    // Re-render diary
                    switchTab('genel');
                };

            } else if (tabName === 'bagimsiz') {
                // RENDER INDEPENDENT SECTIONS (BAĞIMSIZ BÖLÜMLER)
                const units = JSON.parse(localStorage.getItem(`brener_units_${project.id}`)) || [
                    { id: 1, block: 'A Blok', no: 'Daire 1', type: '3+1', status: 'Satılık', area: '140 m²', price: '8.500.000 ₺' },
                    { id: 2, block: 'A Blok', no: 'Daire 2', type: '2+1', status: 'Satıldı', area: '110 m²', price: '6.200.000 ₺' },
                    { id: 3, block: 'B Blok', no: 'Daire 3', type: '4+1', status: 'Kiralık', area: '180 m²', price: '45.000 ₺/Ay' },
                    { id: 4, block: 'B Blok', no: 'Dükkan 1', type: 'Ticari', status: 'Satılık', area: '220 m²', price: '18.000.000 ₺' }
                ];

                tabContent.innerHTML = `
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                            <h2>🏢 Projedeki Bağımsız Bölümler (Kat Malikleri & Birimler)</h2>
                            <button id="btnAddNewUnit" class="btn btn-primary btn-sm">+ Yeni Birim Ekle</button>
                        </div>
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Blok Adı</th>
                                        <th>Kapı No</th>
                                        <th>Birim Tipi</th>
                                        <th>Brüt Alan</th>
                                        <th>Durum</th>
                                        <th>Fiyat / Değer</th>
                                        <th>İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${units.map((u, idx) => `
                                        <tr>
                                            <td><strong>${u.block}</strong></td>
                                            <td>${u.no}</td>
                                            <td><span class="badge badge-info">${u.type}</span></td>
                                            <td>${u.area}</td>
                                            <td>
                                                <span class="badge ${u.status === 'Satıldı' ? 'badge-success' : u.status === 'Satılık' ? 'badge-warning' : 'badge-primary'}">
                                                    ${u.status}
                                                </span>
                                            </td>
                                            <td><strong>${u.price}</strong></td>
                                            <td>
                                                <button class="btn btn-secondary btn-sm btn-delete-unit" data-idx="${idx}">&times; Sil</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;

                // Add unit logic
                document.getElementById('btnAddNewUnit').onclick = () => {
                    const unitForm = `
                        <div class="form-group">
                            <label>Blok Seçin</label>
                            <select id="newUnitBlock">
                                ${project.blocks && project.blocks.length > 0
                                    ? project.blocks.map(b => `<option value="${b.name}">${b.name}</option>`).join('')
                                    : '<option value="A Blok">A Blok</option><option value="B Blok">B Blok</option>'
                                }
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Kapı No</label>
                            <input type="text" id="newUnitNo" placeholder="Örn: Daire 12, Dükkan 4" required>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div class="form-group">
                                <label>Tipi</label>
                                <input type="text" id="newUnitType" placeholder="Örn: 3+1, Ofis" required>
                            </div>
                            <div class="form-group">
                                <label>Alan (m²)</label>
                                <input type="text" id="newUnitArea" placeholder="Örn: 120 m²">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div class="form-group">
                                <label>Durum</label>
                                <select id="newUnitStatus">
                                    <option value="Satılık">Satılık</option>
                                    <option value="Satıldı">Satıldı</option>
                                    <option value="Kiralık">Kiralık</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Satış Fiyatı (₺)</label>
                                <input type="text" id="newUnitPrice" placeholder="Örn: 7.500.000 ₺">
                            </div>
                        </div>
                        <button class="btn btn-primary" id="btnSaveNewUnit" style="width: 100%; margin-top: 10px;">Birimi Kaydet</button>
                    `;
                    window.BrenerApp.openModal('Yeni Bağımsız Bölüm Ekle', unitForm);

                    document.getElementById('btnSaveNewUnit').onclick = () => {
                        const block = document.getElementById('newUnitBlock').value;
                        const no = document.getElementById('newUnitNo').value.trim();
                        const type = document.getElementById('newUnitType').value.trim();
                        const area = document.getElementById('newUnitArea').value.trim();
                        const status = document.getElementById('newUnitStatus').value;
                        const price = document.getElementById('newUnitPrice').value.trim() || '—';

                        if (!no || !type) {
                            alert('Lütfen kapı no ve tipi girin!');
                            return;
                        }

                        units.push({ id: Date.now(), block, no, type, status, area: area || '—', price });
                        localStorage.setItem(`brener_units_${project.id}`, JSON.stringify(units));
                        window.BrenerApp.showToast('success', 'Yeni bağımsız bölüm projeye eklendi!');
                        document.getElementById('modalCloseBtn').click();
                        switchTab('bagimsiz');
                    };
                };

                tabContent.querySelectorAll('.btn-delete-unit').forEach(btn => {
                    btn.onclick = () => {
                        const idx = parseInt(btn.getAttribute('data-idx'));
                        units.splice(idx, 1);
                        localStorage.setItem(`brener_units_${project.id}`, JSON.stringify(units));
                        switchTab('bagimsiz');
                    };
                });

            } else if (tabName === 'kalemler') {
                // RENDER WORK ITEMS (İŞ KALEMLERİ)
                const items = JSON.parse(localStorage.getItem(`brener_work_items_${project.id}`)) || [
                    { id: 1, name: 'Hafriyat & Kazı İşleri', weight: '%10', progress: 100, status: 'Tamamlandı' },
                    { id: 2, name: 'Kaba Yapı & Betonarme', weight: '%40', progress: 85, status: 'Devam Ediyor' },
                    { id: 3, name: 'Dış Cephe & Alüminyum İşleri', weight: '%25', progress: 40, status: 'Devam Ediyor' },
                    { id: 4, name: 'Elektrik & Mekanik Altyapı', weight: '%15', progress: 25, status: 'Devam Ediyor' },
                    { id: 5, name: 'İnce İşler & Boya / Seramik', weight: '%10', progress: 0, status: 'Başlamadı' }
                ];

                tabContent.innerHTML = `
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                            <h2>🔨 Proje İş Kalemleri ve Ağırlık Yüzdeleri</h2>
                            <button id="btnAddNewWorkItem" class="btn btn-primary btn-sm">+ Yeni İş Kalemi</button>
                        </div>
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>İş Kalemi Açıklaması</th>
                                        <th>Sözleşme Ağırlığı</th>
                                        <th>İlerleme Durumu</th>
                                        <th>Durum</th>
                                        <th>Güncelle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${items.map((it, idx) => `
                                        <tr>
                                            <td><strong>${it.name}</strong></td>
                                            <td><span class="badge badge-info">${it.weight}</span></td>
                                            <td>
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    <div class="progress-bar-bg" style="width: 100px; height: 8px;">
                                                        <div class="progress-bar-fill" style="width: ${it.progress}%; background: ${it.progress === 100 ? '#10b981' : '#3b82f6'};"></div>
                                                    </div>
                                                    <span>%${it.progress}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span class="badge ${it.status === 'Tamamlandı' ? 'badge-success' : it.status === 'Devam Ediyor' ? 'badge-primary' : 'badge-secondary'}">
                                                    ${it.status}
                                                </span>
                                            </td>
                                            <td>
                                                <input type="number" class="work-progress-input" data-idx="${idx}" value="${it.progress}" min="0" max="100" style="width: 60px; padding: 4px; text-align: center;">
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;

                // Add Work Item
                document.getElementById('btnAddNewWorkItem').onclick = () => {
                    const itemForm = `
                        <div class="form-group">
                            <label>İş Kalemi Adı</label>
                            <input type="text" id="newWorkItemName" placeholder="Örn: İnce Sıva ve Saten Boya" required>
                        </div>
                        <div class="form-group">
                            <label>Sözleşme Yüzdelik Ağırlığı (Tüm Projedeki Oranı)</label>
                            <input type="text" id="newWorkItemWeight" placeholder="Örn: %15" required>
                        </div>
                        <button class="btn btn-primary" id="btnSaveWorkItem" style="width: 100%; margin-top: 10px;">Kaydet</button>
                    `;
                    window.BrenerApp.openModal('Yeni İş Kalemi Ekle', itemForm);

                    document.getElementById('btnSaveWorkItem').onclick = () => {
                        const name = document.getElementById('newWorkItemName').value.trim();
                        const weight = document.getElementById('newWorkItemWeight').value.trim();

                        if (!name || !weight) {
                            alert('Lütfen iş kalemi adı ve ağırlığı girin!');
                            return;
                        }

                        items.push({ id: Date.now(), name, weight, progress: 0, status: 'Başlamadı' });
                        localStorage.setItem(`brener_work_items_${project.id}`, JSON.stringify(items));
                        window.BrenerApp.showToast('success', 'Yeni iş kalemi sözleşmeye eklendi!');
                        document.getElementById('modalCloseBtn').click();
                        switchTab('kalemler');
                    };
                };

                // Track live progress input changes
                tabContent.querySelectorAll('.work-progress-input').forEach(input => {
                    input.onchange = () => {
                        const idx = parseInt(input.getAttribute('data-idx'));
                        let val = parseInt(input.value) || 0;
                        val = Math.max(0, Math.min(100, val));
                        
                        items[idx].progress = val;
                        if (val === 100) {
                            items[idx].status = 'Tamamlandı';
                        } else if (val > 0) {
                            items[idx].status = 'Devam Ediyor';
                        } else {
                            items[idx].status = 'Başlamadı';
                        }

                        localStorage.setItem(`brener_work_items_${project.id}`, JSON.stringify(items));
                        window.BrenerApp.showToast('info', 'İş kalemi ilerlemesi güncellendi.');
                        switchTab('kalemler');
                    };
                });

            } else if (tabName === 'butce') {
                // RENDER BUDGET DETAILS (BÜTÇE)
                const budgetDetails = JSON.parse(localStorage.getItem(`brener_budget_${project.id}`)) || {
                    initial: project.budget || 120000000,
                    materials: 45000000,
                    labor: 32000000,
                    subcontractors: 25000000,
                    overhead: 8000000,
                    totalSpent: 110000000
                };

                tabContent.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                        
                        <!-- Finansal Özet -->
                        <div class="card">
                            <div class="card-header" style="margin-bottom: 15px;">
                                <h2>💰 Finansal Bütçe Dağılımı</h2>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.85rem;">
                                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">
                                    <span>Toplam Tahsis Edilen Bütçe:</span>
                                    <strong>${budgetDetails.initial.toLocaleString('tr-TR')} ₺</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">
                                    <span>Malzeme Harcamaları:</span>
                                    <span>${budgetDetails.materials.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">
                                    <span>İşçilik Giderleri:</span>
                                    <span>${budgetDetails.labor.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">
                                    <span>Taşeron Hakediş Toplamı:</span>
                                    <span>${budgetDetails.subcontractors.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">
                                    <span>Genel Giderler (Şantiye/Ofis):</span>
                                    <span>${budgetDetails.overhead.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.95rem; margin-top: 10px; color: var(--primary);">
                                    <span>Toplam Gerçekleşen Harcama:</span>
                                    <span>${budgetDetails.totalSpent.toLocaleString('tr-TR')} ₺</span>
                                </div>
                            </div>
                        </div>

                        <!-- Bütçe Grafiği ve Kalan -->
                        <div class="card">
                            <div class="card-header" style="margin-bottom: 15px;">
                                <h2>📊 Bütçe Analizi & Kalan Durum</h2>
                            </div>
                            <div style="text-align: center; padding: 10px;">
                                <div style="font-size: 1.5rem; font-weight: 700; color: #10b981; margin-bottom: 6px;">
                                    ${(budgetDetails.initial - budgetDetails.totalSpent).toLocaleString('tr-TR')} ₺
                                </div>
                                <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 20px;">Kalan Bütçe Rezervi</div>
                                
                                <div style="margin-bottom: 10px;">
                                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
                                        <span>Bütçe Harcama Oranı</span>
                                        <span>%${Math.round((budgetDetails.totalSpent / budgetDetails.initial) * 100)}</span>
                                    </div>
                                    <div class="progress-bar-bg" style="height: 12px; border-radius: 6px;">
                                        <div class="progress-bar-fill" style="width: ${Math.round((budgetDetails.totalSpent / budgetDetails.initial) * 100)}%; background: #3b82f6; border-radius: 6px;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                `;

            } else if (tabName === 'malzeme') {
                // RENDER MATERIAL SELECTIONS (MALZEME SEÇİMLERİ)
                const materials = JSON.parse(localStorage.getItem(`brener_materials_${project.id}`)) || [
                    { id: 1, name: 'C30 Hazır Beton', supplier: 'Akçansa Beton', qty: '1.200 m³', status: 'Şantiyede', date: '2026-06-20' },
                    { id: 2, name: 'Sika Su Yalıtım Membranı', supplier: 'Sika Yapı Kimyasalları', qty: '850 m²', status: 'Sipariş Verildi', date: '2026-06-25' },
                    { id: 3, name: 'Nervürlü Demir Q14', supplier: 'Kardemir A.Ş.', qty: '45 Ton', status: 'Şantiyede', date: '2026-06-18' },
                    { id: 4, name: 'Alüminyum Kompozit Levha', supplier: 'Asaş Alüminyum', qty: '2.500 m²', status: 'Sevkiyatta', date: '2026-07-02' }
                ];

                tabContent.innerHTML = `
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                            <h2>🧱 Şantiye Malzeme Seçimleri ve Tedarik Takibi</h2>
                            <button id="btnAddNewMaterial" class="btn btn-primary btn-sm">+ Yeni Malzeme Siparişi</button>
                        </div>
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Malzeme / Kalem Adı</th>
                                        <th>Tedarikçi / Üretici</th>
                                        <th>Miktar</th>
                                        <th>Durum</th>
                                        <th>Planlanan Tarih</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${materials.map(m => `
                                        <tr>
                                            <td><strong>${m.name}</strong></td>
                                            <td>${m.supplier}</td>
                                            <td>${m.qty}</td>
                                            <td>
                                                <span class="badge ${m.status === 'Şantiyede' ? 'badge-success' : m.status === 'Sevkiyatta' ? 'badge-info' : 'badge-warning'}">
                                                    ${m.status}
                                                </span>
                                            </td>
                                            <td>${m.date}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;

                // Add material logic
                document.getElementById('btnAddNewMaterial').onclick = () => {
                    const matForm = `
                        <div class="form-group">
                            <label>Malzeme Adı</label>
                            <input type="text" id="newMatName" placeholder="Örn: Çift Cam Cephe Paneli" required>
                        </div>
                        <div class="form-group">
                            <label>Tedarikçi Firma</label>
                            <input type="text" id="newMatSupplier" placeholder="Örn: Şişecam A.Ş." required>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div class="form-group">
                                <label>Miktar</label>
                                <input type="text" id="newMatQty" placeholder="Örn: 450 adet">
                            </div>
                            <div class="form-group">
                                <label>Durum</label>
                                <select id="newMatStatus">
                                    <option value="Sipariş Verildi">Sipariş Verildi</option>
                                    <option value="Sevkiyatta">Sevkiyatta</option>
                                    <option value="Şantiyede">Şantiyede</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn btn-primary" id="btnSaveMaterial" style="width: 100%; margin-top: 10px;">Kaydet</button>
                    `;
                    window.BrenerApp.openModal('Yeni Malzeme Siparişi Ekle', matForm);

                    document.getElementById('btnSaveMaterial').onclick = () => {
                        const name = document.getElementById('newMatName').value.trim();
                        const supplier = document.getElementById('newMatSupplier').value.trim();
                        const qty = document.getElementById('newMatQty').value.trim();
                        const status = document.getElementById('newMatStatus').value;

                        if (!name || !supplier) {
                            alert('Lütfen gerekli alanları doldurun!');
                            return;
                        }

                        materials.push({ id: Date.now(), name, supplier, qty: qty || '—', status, date: new Date().toISOString().split('T')[0] });
                        localStorage.setItem(`brener_materials_${project.id}`, JSON.stringify(materials));
                        window.BrenerApp.showToast('success', 'Malzeme siparişi tedarik listesine eklendi!');
                        document.getElementById('modalCloseBtn').click();
                        switchTab('malzeme');
                    };
                };

            } else if (tabName === 'yonetmelik') {
                // RENDER REGULATIONS (YÖNETMELİK)
                tabContent.innerHTML = `
                    <div class="card" style="line-height: 1.6;">
                        <div class="card-header" style="margin-bottom: 15px;">
                            <h2>⚖️ Proje İmar ve Yapı Yönetmeliği Detayları</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 0.85rem;">
                            
                            <div style="border-right: 1px solid var(--border-color); padding-right: 20px;">
                                <h3 style="font-weight: bold; font-size: 0.9rem; color: var(--primary); margin-bottom: 10px;">İmar Parametreleri</h3>
                                <div><strong>Zemin İmar İzni (TAKS):</strong> 0.35</div>
                                <div style="margin-top: 5px;"><strong>Emsal Kat İzni (KAKS):</strong> 2.07</div>
                                <div style="margin-top: 5px;"><strong>Maksimum Yükseklik (Hmax):</strong> 36.50 m (12 Kat)</div>
                                <div style="margin-top: 5px;"><strong>Deprem Derecesi:</strong> 1. Derece Deprem Bölgesi</div>
                                <div style="margin-top: 5px;"><strong>Zemin Sınıfı:</strong> ZB (Sert/Kaya Zemin)</div>
                            </div>

                            <div>
                                <h3 style="font-weight: bold; font-size: 0.9rem; color: var(--primary); margin-bottom: 10px;">Ruhsat & Yasal İzinler</h3>
                                <div><strong>Yapı Ruhsat No:</strong> 2024/908-GH</div>
                                <div style="margin-top: 5px;"><strong>Ruhsat Tarihi:</strong> 15.04.2024</div>
                                <div style="margin-top: 5px;"><strong>Yapı Denetim Firması:</strong> Göztepe Yapı Denetim A.Ş.</div>
                                <div style="margin-top: 5px;"><strong>İSG Tescil No:</strong> 47392-B</div>
                                <div style="margin-top: 5px; display: flex; align-items: center; gap: 6px;">
                                    <strong>İskan Durumu:</strong> 
                                    <span class="badge badge-warning" style="font-size: 0.7rem; padding: 2px 6px;">Beklemede</span>
                                </div>
                            </div>

                        </div>
                    </div>
                `;

            } else if (tabName === 'ekip') {
                // RENDER TEAM DETAILS (EKİP)
                const team = [
                    { name: 'Hasan Yılmaz', role: 'Şantiye Şefi', contact: '0532 900 1234', block: 'Genel Sorumlu' },
                    { name: 'Caner Şen', role: 'Baş Mühendis (İnşaat)', contact: '0533 111 2233', block: 'A Blok Sorumlusu' },
                    { name: 'Büşra Kaya', role: 'Mimar / Tasarım Koordinatörü', contact: '0535 222 3344', block: 'Genel Sorumlu' },
                    { name: 'Ali Yılmaz', role: 'İSG Uzmanı', contact: '0544 333 4455', block: 'Tüm Şantiye' }
                ];

                tabContent.innerHTML = `
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 20px;">
                            <h2>👷 Proje Yönetim Kadrosu & Ekip Listesi</h2>
                        </div>
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ad Soyad</th>
                                        <th>Görev / Rol</th>
                                        <th>İletişim</th>
                                        <th>Sorumluluk Alanı</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${team.map(t => `
                                        <tr>
                                            <td><strong>${t.name}</strong></td>
                                            <td><span class="badge badge-primary">${t.role}</span></td>
                                            <td>${t.contact}</td>
                                            <td>${t.block}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;

            } else if (tabName === 'ilan') {
                // RENDER LISTING PREVIEW (İLAN)
                tabContent.innerHTML = `
                    <div class="card" style="line-height: 1.6;">
                        <div class="card-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                            <h2>📢 Gayrimenkul Portföy İlanı Ön İzleme</h2>
                            <span class="badge badge-success" style="font-size: 0.8rem; padding: 4px 10px; background: #10b981; color: #fff;">Yayında</span>
                        </div>
                        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; font-size: 0.85rem;">
                            
                            <div>
                                <h3 style="font-size: 1rem; font-weight: bold; color: var(--primary); margin-bottom: 8px;">${project.name}</h3>
                                <p style="color: var(--text-muted); font-style: italic; margin-bottom: 15px;">${project.location || 'Kadıköy, İstanbul'}</p>
                                <p style="margin-bottom: 15px;">${project.description || 'Bu proje Brener Group kalitesiyle inşa edilmekte olup, en üst düzey malzeme ve işçilik detaylarıyla donatılmıştır. Lansman fiyatlarıyla satışlar başlamıştır.'}</p>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                                    <div><strong>Fiyat Aralığı:</strong> 6.000.000 ₺ - 22.000.000 ₺</div>
                                    <div><strong>Proje Alanı:</strong> ${(project.area || project.totalArea) ? (project.area || project.totalArea).toLocaleString('tr-TR') + ' m²' : '—'}</div>
                                    <div><strong>Birim Seçenekleri:</strong> ${project.unitTypes ? project.unitTypes.join(', ') : '—'}</div>
                                    <div><strong>İletişim:</strong> Brener Satış Ofisi (0216 444 0 555)</div>
                                </div>
                            </div>

                            <div style="background: rgba(0,0,0,0.15); border: 1px dashed var(--border-color); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center;">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary); margin-bottom: 12px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                <strong style="font-size: 0.9rem;">Galeri & Görsel Yüklemesi</strong>
                                <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Projeye ait 3D render veya saha fotoğraflarını yükleyin.</span>
                            </div>

                        </div>
                    </div>
                `;
            }
        };

        // Initialize with default 'genel' tab
        switchTab('genel');

        // Bind tab button click triggers
        container.querySelectorAll('#projectDetailTabs .btn-tab').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const tab = btn.getAttribute('data-tab');
                switchTab(tab);
            };
        });

        // Bind Actions Toolbar
        document.getElementById('btnActionLoc').onclick = (e) => {
            e.preventDefault();
            const address = project.location || "Göztepe, Kadıköy, İstanbul";
            const mapHtml = `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 0.85rem; margin-bottom: 12px; font-weight: 600; color: var(--text-main);">📍 Proje Konumu: <span style="font-weight: normal; color: var(--text-muted);">${address}</span></div>
                    <div style="position: relative; overflow: hidden; padding-top: 56.25%; border-radius: 8px; border: 1px solid var(--border-color);">
                        <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                            src="https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                            allowfullscreen></iframe>
                    </div>
                </div>
            `;
            window.BrenerApp.openModal('Proje Harita Konumu', mapHtml);
        };

        document.getElementById('btnActionEdit').onclick = (e) => {
            e.preventDefault();
            this.openProjectEditModal(project, () => {
                this.renderDiary(project, container);
            });
        };

        document.getElementById('btnActionConvert').onclick = (e) => {
            e.preventDefault();
            window.BrenerApp.showToast('success', `${project.name} projesi başarıyla satılık/kiralık ilan portföyüne aktarıldı!`);
            window.BrenerApp.logActivity('proje', `Proje ilana dönüştürüldü: ${project.name}`, 'info');
        };

        document.getElementById('btnActionSketch').onclick = (e) => {
            e.preventDefault();
            const sketchHtml = `
                <div style="text-align: center; padding: 15px;">
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">Projeye ait mimari vaziyet planı veya kroki belgesini seçerek teknik bilgileri güncelleyebilirsiniz.</p>
                    <input type="file" id="sketchFileSelect" style="display: none;" accept="image/*,application/pdf">
                    <button class="btn btn-primary" onclick="document.getElementById('sketchFileSelect').click()">📁 Kroki Dosyası Seç</button>
                    <div id="sketchResultBox" style="display: none; margin-top: 20px; font-size: 0.82rem; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; padding: 10px; border-radius: 4px; text-align: left; line-height: 1.4;">
                        <strong>Yapay Zeka Analiz Raporu:</strong><br>
                        • Kroki başarıyla okundu.<br>
                        • Toplam Alan 27.500 m² olarak güncellendi (+2,500 m² ilave alan tespit edildi).<br>
                        • Yeni blok "C Blok" (8 Kat) şantiyeye eklendi.
                    </div>
                </div>
            `;
            window.BrenerApp.openModal('Kroki ile Güncelle', sketchHtml);
            
            const fileSelect = document.getElementById('sketchFileSelect');
            if (fileSelect) {
                fileSelect.onchange = () => {
                    if (fileSelect.files.length > 0) {
                        const resBox = document.getElementById('sketchResultBox');
                        if (resBox) {
                            resBox.style.display = 'block';
                             const newArea = ((project.area || project.totalArea) || 25000) + 2500;
                             project.area = newArea;
                             project.totalArea = newArea;
                            if (project.blocks) {
                                if (!project.blocks.some(b => b.name === 'C Blok')) {
                                    project.blocks.push({ name: 'C Blok', floors: 8 });
                                }
                            }
                            window.BrenerApp.saveStateToStorage();
                            window.BrenerApp.showToast('success', 'Kroki başarıyla analiz edildi, alan ve blok bilgileri güncellendi!');
                            setTimeout(() => {
                                document.getElementById('modalCloseBtn').click();
                                this.renderDiary(project, container);
                            }, 3500);
                        }
                    }
                };
            }
        };

        document.getElementById('btnActionVoiceReport').onclick = (e) => {
            e.preventDefault();
            window.BrenerApp.openVoiceAssistant();
        };

        document.getElementById('btnActionDelete').onclick = (e) => {
            e.preventDefault();
            if (confirm(`${project.name} projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
                const projects = window.BrenerApp.state.projects;
                const idx = projects.findIndex(p => p.id === project.id);
                if (idx !== -1) {
                    projects.splice(idx, 1);
                    if (projects.length > 0) {
                        window.BrenerApp.state.currentProjectId = projects[0].id;
                    } else {
                        window.BrenerApp.state.currentProjectId = null;
                    }
                    window.BrenerApp.saveStateToStorage();
                    window.BrenerApp.setupProjectSelector();
                    window.BrenerApp.showToast('danger', `${project.name} projesi silindi.`);
                    window.location.hash = '#projelerim';
                }
            }
        };
    },
    renderGantt(project, container) {
        window.BrenerApp.updateTopbarTitle('İş Programı — Gantt', `${project.name} — Kritik Yol ve Zaman Çizelgesi`);

        const phases = [
            { id:1, name: 'Hafriyat & Zemin Araştırması', cat:'Hazırlık',   start:1,  dur:14, done:100, dep:null,   color:'#10b981', resp:'Caner Şen' },
            { id:2, name: 'Temel Kalıp & Demir Montajı',  cat:'Kaba Yapı',  start:15, dur:10, done:100, dep:1,      color:'#10b981', resp:'Hasan Demir' },
            { id:3, name: 'Radye Temel Beton Dökümü',      cat:'Kaba Yapı',  start:25, dur:7,  done:100, dep:2,      color:'#10b981', resp:'Caner Şen' },
            { id:4, name: 'Bodrum Perde Beton İmalat',     cat:'Kaba Yapı',  start:32, dur:18, done:85,  dep:3,      color:'#cca352', resp:'Ali Yılmaz' },
            { id:5, name: 'Zemin Kat Kolon & Kiriş Kalıp', cat:'Kaba Yapı', start:50, dur:21, done:35,  dep:4,      color:'#3b82f6', resp:'Hasan Demir' },
            { id:6, name: '1. Kat Döşeme Beton Dökümü',   cat:'Kaba Yapı',  start:71, dur:10, done:0,   dep:5,      color:'#9ca3af', resp:'Caner Şen' },
            { id:7, name: 'Duvar Örme & İnce İşçilik',    cat:'İnce İşler', start:81, dur:30, done:0,   dep:6,      color:'#9ca3af', resp:'Mustafa Kaya' },
            { id:8, name: 'Elektrik & Mekanik Tesisat',   cat:'Tesisat',    start:90, dur:25, done:0,   dep:5,      color:'#9ca3af', resp:'Murat Kara' },
            { id:9, name: 'Dış Cephe Sıva & Boya',        cat:'Dış Cephe',  start:111,dur:20, done:0,   dep:7,      color:'#9ca3af', resp:'Kemal Ak' },
            { id:10,name: 'Teslim & Ruhsat İşlemleri',   cat:'Kapanış',    start:131,dur:10, done:0,   dep:[8,9],  color:'#9ca3af', resp:'Emre Türedi' }
        ];

        const totalDur = 140;
        const catColors = { 'Hazırlık':'#6366f1','Kaba Yapı':'#cca352','İnce İşler':'#f59e0b','Tesisat':'#3b82f6','Dış Cephe':'#ec4899','Kapanış':'#10b981' };

        const summary = {
            total: phases.length,
            done:  phases.filter(p => p.done === 100).length,
            inProg:phases.filter(p => p.done > 0 && p.done < 100).length,
            notStr:phases.filter(p => p.done === 0).length
        };

        const ganttBars = phases.map(p => {
            const leftPct  = (p.start / totalDur) * 100;
            const widthPct = (p.dur   / totalDur) * 100;
            const fillPct  = p.done;
            const clr = p.done === 100 ? '#10b981' : p.done > 0 ? '#cca352' : '#374151';
            return `
            <div style="display:grid;grid-template-columns:220px 1fr;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid var(--border-color);">
                <div>
                    <div style="font-size:0.8rem;font-weight:600;">${p.name}</div>
                    <div style="font-size:0.68rem;color:var(--text-muted);">👤 ${p.resp} &nbsp;|&nbsp; ${p.dur} gün</div>
                </div>
                <div style="position:relative;height:22px;background:rgba(255,255,255,0.04);border-radius:4px;overflow:hidden;">
                    <div style="position:absolute;left:${leftPct}%;width:${widthPct}%;height:100%;background:${clr};border-radius:4px;display:flex;align-items:center;justify-content:center;">
                        ${fillPct > 0 ? `<div style="position:absolute;left:0;top:0;height:100%;width:${fillPct}%;background:rgba(255,255,255,0.25);border-radius:4px;"></div>` : ''}
                        <span style="font-size:0.6rem;font-weight:700;color:#fff;z-index:1;position:relative;">${p.done > 0 ? '%'+p.done : ''}</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `
        <!-- Özet Kartlar -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
            ${[
                { label:'Toplam Faaliyet', val: summary.total, color:'var(--primary)', icon:'📋' },
                { label:'Tamamlanan',      val: summary.done,  color:'var(--success)', icon:'✅' },
                { label:'Devam Eden',      val: summary.inProg,color:'var(--warning)', icon:'🔄' },
                { label:'Başlamayan',      val: summary.notStr,color:'var(--text-muted)',icon:'⏳' }
            ].map(s=>`
            <div class="card" style="text-align:center;padding:20px;">
                <div style="font-size:1.8rem;margin-bottom:6px;">${s.icon}</div>
                <div style="font-size:2rem;font-weight:800;color:${s.color};">${s.val}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">${s.label}</div>
            </div>`).join('')}
        </div>

        <!-- Gantt Şeması -->
        <div class="card">
            <div class="card-header" style="margin-bottom:20px;">
                <h2>📅 Zaman Çizelgesi Planı — ${project.name}</h2>
                <div style="display:flex;gap:10px;font-size:0.75rem;">
                    ${Object.entries(catColors).map(([k,v])=>`<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:${v};border-radius:2px;display:inline-block;"></span>${k}</span>`).join('')}
                </div>
            </div>
            <!-- Timeline Header -->
            <div style="display:grid;grid-template-columns:220px 1fr;gap:12px;margin-bottom:8px;padding:0 0 8px;border-bottom:2px solid var(--border-color);">
                <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);">FAALİYET</div>
                <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--text-muted);">
                    ${Array.from({length:8},(_,i)=>`<span>Hf ${i*2+1}</span>`).join('')}
                </div>
            </div>
            ${ganttBars}
            <div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;">
                <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info','MS Project formatında dışa aktarılıyor...')">📊 MS Project Dışa Aktar</button>
                <button class="btn btn-primary btn-sm" onclick="window.BrenerApp.showToast('success','Revize iş programı kaydedildi.')">💾 Güncelle & Kaydet</button>
            </div>
        </div>

        <!-- Kritik Görevler Tablosu -->
        <div class="card" style="margin-top:24px;">
            <div class="card-header" style="margin-bottom:16px;"><h2>🔴 Kritik Yol Faaliyetleri</h2></div>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>#</th><th>Faaliyet Adı</th><th>Kategori</th><th>Sorumlu</th><th>Süre</th><th>İlerleme</th><th>Durum</th></tr></thead>
                    <tbody>
                        ${phases.map(p=>`
                        <tr>
                            <td>${p.id}</td>
                            <td><strong>${p.name}</strong></td>
                            <td><span style="background:${catColors[p.cat]}22;color:${catColors[p.cat]};padding:2px 8px;border-radius:20px;font-size:0.72rem;">${p.cat}</span></td>
                            <td>${p.resp}</td>
                            <td>${p.dur} gün</td>
                            <td>
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <div style="flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;">
                                        <div style="width:${p.done}%;height:100%;background:${p.done===100?'var(--success)':p.done>0?'var(--primary)':'var(--border-color)'};border-radius:3px;"></div>
                                    </div>
                                    <span style="font-size:0.75rem;font-weight:600;color:${p.done===100?'var(--success)':p.done>0?'var(--primary)':'var(--text-muted)'};">%${p.done}</span>
                                </div>
                            </td>
                            <td><span class="badge ${p.done===100?'badge-success':p.done>0?'badge-warning':'badge-info'}">${p.done===100?'Tamamlandı':p.done>0?'Devam Ediyor':'Başlamadı'}</span></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    },

    /* ====================================================================
       3. PERSONEL & PUANTAJ
    ==================================================================== */
    renderAttendance(project, container) {
        window.BrenerApp.updateTopbarTitle('Personel & Puantaj', `${project.name} — Günlük Çalışan Yoklama Takip Sistemi`);

        const today  = new Date().toISOString().split('T')[0];
        const employees = window.BrenerApp.state.employees;

        // Compute stats
        let presentCount=0, absentCount=0, leaveCount=0;
        employees.forEach(emp => {
            const key = `p_${project.id}_${emp.id}_${today}`;
            const st = localStorage.getItem(key) || 'geldi';
            if (st==='geldi') presentCount++;
            else if (st==='gelmedi') absentCount++;
            else leaveCount++;
        });

        const statCards = [
            { label:'Çalışmada', val:presentCount, color:'var(--success)', icon:'✅' },
            { label:'Gelmedi', val:absentCount, color:'var(--danger)', icon:'❌' },
            { label:'İzinli', val:leaveCount, color:'var(--warning)', icon:'🏖️' },
            { label:'Toplam Personel', val:employees.length, color:'var(--primary)', icon:'👷' }
        ];

        const rows = employees.map(emp => {
            const key = `p_${project.id}_${emp.id}_${today}`;
            const st  = localStorage.getItem(key) || 'geldi';
            const stLabel = st==='geldi'?'Geldi':st==='gelmedi'?'Gelmedi':'İzinli';
            const stClass = st==='geldi'?'badge-success':st==='gelmedi'?'badge-danger':'badge-warning';
            return `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--primary),#ebd197);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;color:#111;flex-shrink:0;">
                            ${emp.name.split(' ').map(p=>p[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <strong>${emp.name}</strong>
                    </div>
                </td>
                <td><span class="badge badge-info" style="font-size:0.65rem;">${emp.role}</span></td>
                <td style="font-weight:600;">${emp.salary.toLocaleString('tr-TR')} ₺</td>
                <td><span class="badge ${stClass}">${stLabel}</span></td>
                <td>
                    <div style="display:flex;gap:6px;">
                        <button class="btn btn-sm ${st==='geldi'?'btn-primary':'btn-secondary'}" onclick="window.BrenerApp.Santiye.savePuantaj(${project.id},${emp.id},'${today}','geldi')">✅ Geldi</button>
                        <button class="btn btn-sm ${st==='gelmedi'?'btn-danger':'btn-secondary'}" onclick="window.BrenerApp.Santiye.savePuantaj(${project.id},${emp.id},'${today}','gelmedi')">❌ Gelmedi</button>
                        <button class="btn btn-sm ${st==='izinli'?'btn-warning':'btn-secondary'}" onclick="window.BrenerApp.Santiye.savePuantaj(${project.id},${emp.id},'${today}','izinli')">🏖️ İzinli</button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        container.innerHTML = `
        <!-- İstatistik Kartlar -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
            ${statCards.map(s=>`
            <div class="card" style="text-align:center;padding:20px;">
                <div style="font-size:1.6rem;margin-bottom:4px;">${s.icon}</div>
                <div style="font-size:2rem;font-weight:800;color:${s.color};">${s.val}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">${s.label}</div>
            </div>`).join('')}
        </div>

        <!-- Puantaj Tablosu -->
        <div class="card">
            <div class="card-header" style="margin-bottom:20px;">
                <div>
                    <h2>📋 Günlük Puantaj Kartı</h2>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">Tarih: <strong>${today}</strong> — ${project.name}</div>
                </div>
                <div style="display:flex;gap:10px;">
                    <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info','Tüm personel GELDI olarak işaretlendi.')" id="markAllPresentBtn">👥 Tümünü Geldi İşaretle</button>
                    <button class="btn btn-primary btn-sm" onclick="window.BrenerApp.Santiye.calculatePayroll(${project.id})">💰 Bordro Raporu</button>
                </div>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Personel</th>
                            <th>Görev / Branş</th>
                            <th>Yevmiye (TL)</th>
                            <th>Durum</th>
                            <th>Puantaj Güncelle</th>
                        </tr>
                    </thead>
                    <tbody id="puantajTbody">${rows}</tbody>
                </table>
            </div>
        </div>

        <!-- Hızlı Personel Ekle -->
        <div class="card" style="margin-top:24px;">
            <div class="card-header" style="margin-bottom:16px;"><h2>➕ Yeni Personel Ekle</h2></div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px;align-items:end;">
                <div class="form-group" style="margin:0;">
                    <label>Ad Soyad</label>
                    <input type="text" id="newEmpName" placeholder="Örn: Mehmet Çelik">
                </div>
                <div class="form-group" style="margin:0;">
                    <label>Görevi / Branş</label>
                    <input type="text" id="newEmpRole" placeholder="Örn: Elektrikçi Usta">
                </div>
                <div class="form-group" style="margin:0;">
                    <label>Günlük Yevmiye (₺)</label>
                    <input type="number" id="newEmpSalary" value="1400">
                </div>
                <button class="btn btn-primary" id="addEmpBtn">Ekle</button>
            </div>
        </div>`;

        document.getElementById('addEmpBtn').onclick = () => {
            const name   = document.getElementById('newEmpName').value.trim();
            const role   = document.getElementById('newEmpRole').value.trim();
            const salary = parseFloat(document.getElementById('newEmpSalary').value) || 1400;
            if (!name || !role) { alert('Lütfen ad ve görevi doldurun!'); return; }
            window.BrenerApp.state.employees.push({ id: Date.now(), name, role, salary, status:'active' });
            window.BrenerApp.saveStateToStorage();
            window.BrenerApp.logActivity('santiye', `Yeni personel şantiyeye kaydedildi: ${name}`, 'success', `Görev: ${role}, Yevmiye: ${salary} TL`);
            window.BrenerApp.showToast('success', `${name} personel listesine eklendi.`);
            this.renderAttendance(project, container);
        };

        document.getElementById('markAllPresentBtn').onclick = () => {
            employees.forEach(emp => {
                localStorage.setItem(`p_${project.id}_${emp.id}_${today}`, 'geldi');
            });
            window.BrenerApp.logActivity('santiye', `Tüm şantiye personeli GELDİ olarak işaretlendi.`, 'info', `Tarih: ${today}, Proje: ${project.name}`);
            window.BrenerApp.showToast('success', 'Tüm personel GELDİ olarak işaretlendi.');
            this.renderAttendance(project, container);
        };
    },

    savePuantaj(projectId, empId, date, status) {
        localStorage.setItem(`p_${projectId}_${empId}_${date}`, status);
        const labels = { geldi:'GELDİ ✅', gelmedi:'GELMEDİ ❌', izinli:'İZİNLİ 🏖️' };
        
        const emp = window.BrenerApp.state.employees.find(e => e.id == empId);
        const empName = emp ? emp.name : `Personel #${empId}`;
        window.BrenerApp.logActivity('santiye', `Personel puantajı güncellendi: ${empName} (${labels[status]})`, 'info', `Tarih: ${date}`);
        
        window.BrenerApp.showToast('success', `Puantaj güncellendi: ${labels[status]}`);
        this.render('personel-puantaj', document.getElementById('contentWindow'));
    },

    calculatePayroll(projectId) {
        const employees = window.BrenerApp.state.employees;
        let totalBrut = 0;
        const rows = employees.map(emp => {
            const workDays = 22;
            const brut = workDays * emp.salary;
            const sgk  = Math.round(brut * 0.15);
            const gv   = Math.round((brut - sgk) * 0.15);
            const net  = brut - sgk - gv;
            totalBrut += brut;
            return `
            <tr>
                <td><strong>${emp.name}</strong></td>
                <td>${emp.role}</td>
                <td>${emp.salary.toLocaleString('tr-TR')} ₺</td>
                <td>${workDays} Gün</td>
                <td>${brut.toLocaleString('tr-TR')} ₺</td>
                <td style="color:var(--danger);">-${sgk.toLocaleString('tr-TR')} ₺</td>
                <td style="color:var(--danger);">-${gv.toLocaleString('tr-TR')} ₺</td>
                <td style="font-weight:700;color:var(--success);">${net.toLocaleString('tr-TR')} ₺</td>
            </tr>`;
        }).join('');
        window.BrenerApp.openModal('💰 Aylık Personel Hakediş Bordrosu', `
            <div class="table-responsive">
                <table style="font-size:0.8rem;">
                    <thead><tr><th>Personel</th><th>Görev</th><th>Yevmiye</th><th>İş Günü</th><th>Brüt</th><th>SGK Kes.</th><th>GV Kes.</th><th>Net Maaş</th></tr></thead>
                    <tbody>${rows}</tbody>
                    <tfoot><tr><td colspan="4" style="font-weight:700;">TOPLAM</td><td colspan="3" style="font-weight:700;color:var(--warning);">Brüt: ${totalBrut.toLocaleString('tr-TR')} ₺</td><td></td></tr></tfoot>
                </table>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:20px;" onclick="window.BrenerApp.showToast('success','Banka Ödeme Talimatı PDF indirildi.')">🏦 Banka Ödeme Talimatı Çıkar</button>
        `);
    },

    /* ====================================================================
       4. MALZEME & STOK
    ==================================================================== */
    renderStock(project, container) {
        window.BrenerApp.updateTopbarTitle('Malzeme & Stok Yönetimi', `${project.name} — Depo Stok Takibi ve Sipariş Yönetimi`);

        const materials = window.BrenerApp.state.materials;
        const totalValue = materials.reduce((s,m) => s + m.stock*m.price, 0);
        const lowCount   = materials.filter(m => m.stock <= m.minStock).length;

        const stockRows = materials.map(m => {
            const isLow  = m.stock <= m.minStock;
            const pct    = Math.min(100, (m.stock / (m.minStock*3)) * 100);
            const barClr = isLow ? 'var(--danger)' : pct < 60 ? 'var(--warning)' : 'var(--success)';
            return `
            <tr>
                <td>
                    <div style="font-weight:600;">${m.name}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">Birim: ${m.unit}</div>
                </td>
                <td>
                    <div style="font-weight:700;font-size:1rem;color:${isLow?'var(--danger)':'var(--text-main)'};">${m.stock.toLocaleString('tr-TR')}</div>
                    <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:4px;width:80px;">
                        <div style="height:100%;width:${pct}%;background:${barClr};border-radius:2px;"></div>
                    </div>
                </td>
                <td style="color:var(--text-muted);">${m.minStock.toLocaleString('tr-TR')}</td>
                <td style="font-weight:600;color:var(--primary);">${m.price.toLocaleString('tr-TR')} ₺</td>
                <td style="font-weight:600;">${(m.stock*m.price).toLocaleString('tr-TR')} ₺</td>
                <td><span class="badge ${isLow?'badge-danger':'badge-success'}">${isLow?'⚠️ Kritik':'✅ Güvenli'}</span></td>
                <td>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        <button class="btn btn-sm btn-secondary" onclick="window.BrenerApp.Santiye.stockModal(${m.id},'add')">+ Giriş</button>
                        <button class="btn btn-sm btn-secondary" onclick="window.BrenerApp.Santiye.stockModal(${m.id},'use')">− Çıkış</button>
                        ${isLow ? `<button class="btn btn-sm btn-danger" onclick="window.location.hash='#siparis-fisi'">🔔 Sipariş</button>` : ''}
                    </div>
                </td>
            </tr>`;
        }).join('');

        container.innerHTML = `
        <!-- Özet Kartlar -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
            <div class="card" style="text-align:center;padding:20px;">
                <div style="font-size:1.6rem;margin-bottom:4px;">📦</div>
                <div style="font-size:1.8rem;font-weight:800;color:var(--primary);">${materials.length}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">Malzeme Çeşidi</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;border-color:${lowCount>0?'var(--danger)':'var(--border-color)'};">
                <div style="font-size:1.6rem;margin-bottom:4px;">⚠️</div>
                <div style="font-size:1.8rem;font-weight:800;color:${lowCount>0?'var(--danger)':'var(--success)'};">${lowCount}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">Kritik Stok</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;">
                <div style="font-size:1.6rem;margin-bottom:4px;">💰</div>
                <div style="font-size:1.4rem;font-weight:800;color:var(--success);">${(totalValue/1000000).toFixed(2)}M</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">Depo Stok Değeri (₺)</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;">
                <div style="font-size:1.6rem;margin-bottom:4px;">🔄</div>
                <div style="font-size:1.8rem;font-weight:800;color:var(--warning);">3</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">Bekleyen Sipariş</div>
            </div>
        </div>

        <!-- Stok Tablosu -->
        <div class="card">
            <div class="card-header" style="margin-bottom:20px;">
                <h2>🏭 Şantiye Depo Stok Durumları</h2>
                <div style="display:flex;gap:10px;">
                    <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info','Stok raporu Excel\'e aktarıldı.')">📊 Excel Raporu</button>
                    <button class="btn btn-primary btn-sm" onclick="window.BrenerApp.Santiye.addNewMaterialModal()">+ Yeni Malzeme Ekle</button>
                </div>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Malzeme Adı</th>
                            <th>Güncel Stok</th>
                            <th>Kritik Eşik</th>
                            <th>Birim Fiyat</th>
                            <th>Stok Değeri</th>
                            <th>Durum</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>${stockRows}</tbody>
                </table>
            </div>
        </div>

        <!-- Son Hareket Logu -->
        <div class="card" style="margin-top:24px;">
            <div class="card-header" style="margin-bottom:16px;"><h2>📜 Son Stok Hareketleri</h2></div>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>Tarih</th><th>Malzeme</th><th>İşlem</th><th>Miktar</th><th>Yapan</th></tr></thead>
                    <tbody>
                        <tr><td>24.06.2026</td><td>Çimento (50kg Torba)</td><td><span class="badge badge-success">Giriş</span></td><td>+200 Adet</td><td>Caner Şen</td></tr>
                        <tr><td>24.06.2026</td><td>Hazır Beton (C30)</td><td><span class="badge badge-warning">Çıkış</span></td><td>-120 m³</td><td>Hasan Demir</td></tr>
                        <tr><td>23.06.2026</td><td>İnşaat Demiri (Q12)</td><td><span class="badge badge-success">Giriş</span></td><td>+25 Ton</td><td>Ali Yılmaz</td></tr>
                        <tr><td>23.06.2026</td><td>Kum (Elenecek)</td><td><span class="badge badge-warning">Çıkış</span></td><td>-15 Ton</td><td>Mustafa Kaya</td></tr>
                    </tbody>
                </table>
            </div>
        </div>`;
    },

    stockModal(id, type) {
        const mat = window.BrenerApp.state.materials.find(m => m.id === id);
        if (!mat) return;
        window.BrenerApp.openModal(
            type==='add' ? `📥 ${mat.name} — Stok Girişi` : `📤 ${mat.name} — Stok Çıkışı`,
            `<div class="form-group">
                <label>${type==='add'?'Eklenecek Miktar':'Kullanılacak Miktar'} (${mat.unit})</label>
                <input type="number" id="stockAmtInput" value="50" min="1" style="font-size:1.2rem;text-align:center;padding:14px;">
             </div>
             <div class="form-group">
                <label>Açıklama / Gerekçe</label>
                <input type="text" id="stockNoteInput" placeholder="Örn: B Blok zemin kat döşeme için kullanım">
             </div>
             <button class="btn btn-primary" style="width:100%;margin-top:10px;" id="confirmStockBtn">Kaydet</button>`
        );
        document.getElementById('confirmStockBtn').onclick = () => {
            const amt = parseFloat(document.getElementById('stockAmtInput').value) || 0;
            const note = document.getElementById('stockNoteInput').value.trim();
            if (amt <= 0) { alert('Geçerli bir miktar girin!'); return; }
            if (type === 'add') {
                mat.stock += amt;
                window.BrenerApp.logActivity('santiye', `${mat.name} stoğuna +${amt} ${mat.unit} eklendi.`, 'success', `Açıklama: ${note}`);
                window.BrenerApp.showToast('success', `${mat.name} stoğuna +${amt} ${mat.unit} eklendi.`);
            } else {
                if (mat.stock < amt) { window.BrenerApp.showToast('danger','Yetersiz stok miktarı!'); return; }
                mat.stock -= amt;
                window.BrenerApp.logActivity('santiye', `${mat.name} stoğundan -${amt} ${mat.unit} kullanıldı.`, 'warning', `Açıklama: ${note}`);
                window.BrenerApp.showToast('warning', `${mat.name} stoğundan -${amt} ${mat.unit} kullanıldı.`);
            }
            window.BrenerApp.saveStateToStorage();
            document.getElementById('modalCloseBtn').click();
            this.render('malzeme-stok', document.getElementById('contentWindow'));
        };
    },

    addNewMaterialModal() {
        window.BrenerApp.openModal('+ Yeni Malzeme Ekle', `
            <div class="form-group"><label>Malzeme Adı</label><input type="text" id="nmName" placeholder="Örn: Çatı Kiremidi (m²)"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group"><label>Birim</label><select id="nmUnit"><option>Adet</option><option>Ton</option><option>m³</option><option>m²</option><option>Metre</option><option>Paket</option></select></div>
                <div class="form-group"><label>Birim Fiyat (₺)</label><input type="number" id="nmPrice" value="100"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group"><label>Başlangıç Stoku</label><input type="number" id="nmStock" value="0"></div>
                <div class="form-group"><label>Kritik Eşik (Min Stok)</label><input type="number" id="nmMin" value="10"></div>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:10px;" id="saveNewMatBtn">Malzemeyi Kaydet</button>
        `);
        document.getElementById('saveNewMatBtn').onclick = () => {
            const name  = document.getElementById('nmName').value.trim();
            const unit  = document.getElementById('nmUnit').value;
            const price = parseFloat(document.getElementById('nmPrice').value)||0;
            const stock = parseFloat(document.getElementById('nmStock').value)||0;
            const min   = parseFloat(document.getElementById('nmMin').value)||10;
            if (!name) { alert('Malzeme adı gerekli!'); return; }
            window.BrenerApp.state.materials.push({ id:Date.now(), name, unit, stock, minStock:min, price });
            window.BrenerApp.saveStateToStorage();
            window.BrenerApp.logActivity('santiye', `Yeni stok kalemi tanımlandı: ${name}`, 'success', `Birim: ${unit}, Başlangıç: ${stock}, Kritik Seviye: ${min}`);
            window.BrenerApp.showToast('success', `${name} stok listesine eklendi.`);
            document.getElementById('modalCloseBtn').click();
            this.render('malzeme-stok', document.getElementById('contentWindow'));
        };
    },

    /* ====================================================================
       5. İSG / KAZA
    ==================================================================== */
    renderHse(project, container) {
        window.BrenerApp.updateTopbarTitle('İSG / İş Güvenliği Paneli', `${project.name} — Denetim, Risk ve Kaza Kayıt Defteri`);

        const incidents = JSON.parse(localStorage.getItem(`brener_hse_${project.id}`)) || [
            { id:1, date:'2026-06-20', type:'ramak-kala',  desc:'B Blok 2. kat iskelesi korkuluğu yerinden çıkmış bulundu. Derhal sabitlendi.', reporter:'Zeynep Yurt', severity:'Düşük' },
            { id:2, date:'2026-06-15', type:'kaza-hafif',  desc:'Kalıpçı ustası el bileğine çivi batması. İlk yardım uygulandı, mesaiye devam etti.', reporter:'Zeynep Yurt', severity:'Hafif' }
        ];

        const checkItems = [
            { label:'Baret, yelek ve çelik burunlu ayakkabı kontrolleri yapıldı', done:true },
            { label:'Dış cephe iskelesi ankraj ve korkuluk kontrolleri tamamlandı', done:true },
            { label:'Şaft boşlukları ve merdiven kenarları bariyer ile kapatıldı', done:false },
            { label:'Elektrik panoları kaçak akım rölesi kontrolleri yapıldı', done:true },
            { label:'Yüksekte çalışan tüm personelin emniyet kemeri bağlı', done:false },
            { label:'Yangın tüpleri ve tahliye yolları kontrol edildi', done:true },
            { label:'Vinç ve havalı ekipman günlük bakım formu dolduruldu', done:false },
            { label:'Ramak kala kayıt defteri güncellendi', done:true }
        ];

        const doneCount = checkItems.filter(c => c.done).length;
        const pct = Math.round(doneCount / checkItems.length * 100);

        const incidentTypeColors = { 'ramak-kala':'badge-warning','kaza-hafif':'badge-danger','kaza-orta':'badge-danger' };
        const incidentTypeLabels = { 'ramak-kala':'Ramak Kala','kaza-hafif':'Hafif Yaralanma','kaza-orta':'Maddi Hasarlı Kaza' };
        const severityColors = { 'Düşük':'badge-info','Hafif':'badge-warning','Orta':'badge-danger','Ağır':'badge-danger' };

        container.innerHTML = `
        <!-- İSG Özet Kartlar -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
            <div class="card" style="text-align:center;padding:20px;border-color:${pct===100?'var(--success)':'var(--warning)'};">
                <div style="font-size:1.6rem;margin-bottom:4px;">🛡️</div>
                <div style="font-size:2rem;font-weight:800;color:${pct===100?'var(--success)':'var(--warning)'};">%${pct}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">Günlük Denetim Puanı</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;">
                <div style="font-size:1.6rem;margin-bottom:4px;">📋</div>
                <div style="font-size:2rem;font-weight:800;color:var(--primary);">${checkItems.length}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">Kontrol Kalemi</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;border-color:var(--danger);">
                <div style="font-size:1.6rem;margin-bottom:4px;">⚠️</div>
                <div style="font-size:2rem;font-weight:800;color:var(--danger);">${incidents.length}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">Olay Kaydı</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;border-color:var(--success);">
                <div style="font-size:1.6rem;margin-bottom:4px;">✅</div>
                <div style="font-size:2rem;font-weight:800;color:var(--success);">${doneCount}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">Tamamlanan Kontrol</div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">

            <!-- Günlük Denetim Listesi -->
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;">
                    <h2>📋 Günlük İSG Denetim Listesi</h2>
                    <span style="font-size:0.8rem;color:var(--text-muted);">${doneCount}/${checkItems.length} Tamamlandı</span>
                </div>
                <div style="margin-bottom:12px;">
                    <div class="progress-bar-bg" style="height:8px;border-radius:4px;">
                        <div class="progress-bar-fill" style="width:${pct}%;border-radius:4px;background:${pct===100?'var(--success)':'var(--warning)'}"></div>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    ${checkItems.map((c,i)=>`
                    <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:0.85rem;padding:8px;border-radius:6px;border:1px solid ${c.done?'var(--success)':'var(--border-color)'};background:${c.done?'rgba(16,185,129,0.05)':'transparent'};transition:all 0.2s;">
                        <input type="checkbox" ${c.done?'checked':''} style="width:16px;height:16px;margin-top:1px;flex-shrink:0;">
                        <span style="${c.done?'color:var(--text-muted);text-decoration:line-through;':''}">${c.label}</span>
                    </label>`).join('')}
                </div>
                <button class="btn btn-primary" style="width:100%;margin-top:20px;" onclick="window.BrenerApp.showToast('success','İSG Günlük Denetim Formu imzalandı ve arşivlendi.')">✍️ Denetimi Tamamla & İmzala</button>
            </div>

            <!-- Olay Bildirimi Formu -->
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;"><h2>🚨 Olay / Ramak Kala Bildirimi</h2></div>
                <div class="form-group">
                    <label>Olay Tarihi & Saati</label>
                    <input type="text" id="hseDateTime" value="${new Date().toLocaleString('tr-TR')}" disabled style="opacity:0.7;">
                </div>
                <div class="form-group">
                    <label>Olay Tipi</label>
                    <select id="hseType">
                        <option value="ramak-kala">Ramak Kala (Kaza Olmadı)</option>
                        <option value="kaza-hafif">Hafif Yaralanmalı Kaza</option>
                        <option value="kaza-orta">Maddi Hasarlı Şantiye Kazası</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Etkilenen Bölge / Konum</label>
                    <input type="text" id="hseLocation" placeholder="Örn: A Blok 3. Kat İskele">
                </div>
                <div class="form-group">
                    <label>Olay Detayı & Alınan Önlemler</label>
                    <textarea id="hseDetail" style="height:100px;" placeholder="Olayı kısaca açıklayın, alınan önlemleri belirtin..."></textarea>
                </div>
                <div class="form-group">
                    <label>Şiddet Derecesi</label>
                    <select id="hseSeverity">
                        <option>Düşük</option>
                        <option>Hafif</option>
                        <option>Orta</option>
                        <option>Ağır</option>
                    </select>
                </div>
                <button class="btn btn-danger" style="width:100%;" id="saveHseBtn">🚨 Olayı Raporla & Kaydet</button>
            </div>
        </div>

        <!-- Geçmiş Olay Kayıtları -->
        <div class="card">
            <div class="card-header" style="margin-bottom:16px;">
                <h2>📁 Geçmiş Olay Kayıtları</h2>
                <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info','İSG raporları PDF olarak indirildi.')">📥 Raporları İndir</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>Tarih</th><th>Olay Tipi</th><th>Şiddet</th><th>Açıklama</th><th>Bildiren</th></tr></thead>
                    <tbody id="hseIncidentTbody">
                        ${incidents.map(i=>`
                        <tr>
                            <td><strong>${i.date}</strong></td>
                            <td><span class="badge ${incidentTypeColors[i.type]||'badge-info'}">${incidentTypeLabels[i.type]||i.type}</span></td>
                            <td><span class="badge ${severityColors[i.severity]||'badge-info'}">${i.severity}</span></td>
                            <td style="max-width:300px;font-size:0.82rem;">${i.desc}</td>
                            <td>${i.reporter}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;

        document.getElementById('saveHseBtn').onclick = () => {
            const detail   = document.getElementById('hseDetail').value.trim();
            const type     = document.getElementById('hseType').value;
            const location = document.getElementById('hseLocation').value.trim();
            const severity = document.getElementById('hseSeverity').value;
            if (!detail) { alert('Lütfen olay detayını doldurun!'); return; }
            const user = window.BrenerApp.state.currentUser;
            const newInc = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                type,
                desc: `[${location}] ${detail}`,
                reporter: user ? user.name : 'Bilinmiyor',
                severity
            };
            incidents.unshift(newInc);
            localStorage.setItem(`brener_hse_${project.id}`, JSON.stringify(incidents));
            window.BrenerApp.logActivity('santiye', `İSG / Kaza Olay Raporu eklendi: ${type} (${severity})`, 'danger', `Konum: ${location}, Rapor Eden: ${newInc.reporter}, Detay: ${detail}`);
            window.BrenerApp.showToast('danger', 'İSG Olay Raporu şantiye müdürlüğüne iletildi.');
            this.renderHse(project, container);
        };
    },

    /* ====================================================================
       6. HAVA & BETON DÖKÜM
    ==================================================================== */
    renderConcrete(project, container) {
        window.BrenerApp.updateTopbarTitle('Hava & Beton Döküm Raporu', `${project.name} — Yapı Güvenliği ve Laboratuvar Takibi`);

        const pours = window.BrenerApp.state.concretePours;
        const totalVol = pours.reduce((s,p)=>s+p.volume,0);

        // Hava durumu widget (simüle)
        const weather = [
            { day:'Bugün',  icon:'☀️', temp:'30°C', status:'Uygun', cls:'badge-success' },
            { day:'Yarın',  icon:'⛅', temp:'27°C', status:'Uygun', cls:'badge-success' },
            { day:'2 Gün',  icon:'🌩️', temp:'22°C', status:'Riskli', cls:'badge-danger' },
            { day:'3 Gün',  icon:'🌦️', temp:'24°C', status:'Dikkat', cls:'badge-warning' }
        ];

        container.innerHTML = `
        <!-- Hava Durumu Widget -->
        <div class="card" style="margin-bottom:24px;background:linear-gradient(135deg,rgba(59,130,246,0.08),rgba(59,130,246,0.02));border-color:rgba(59,130,246,0.3);">
            <div class="card-header" style="margin-bottom:16px;">
                <h2>🌤️ Beton Döküm Hava Durumu Tahmini</h2>
                <span style="font-size:0.8rem;color:var(--text-muted);">Kaynak: Yerel Meteoroloji</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                ${weather.map(w=>`
                <div style="text-align:center;padding:16px;border:1px solid var(--border-color);border-radius:10px;background:rgba(255,255,255,0.02);">
                    <div style="font-size:2rem;">${w.icon}</div>
                    <div style="font-weight:700;margin:6px 0;font-size:1.1rem;">${w.temp}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px;">${w.day}</div>
                    <span class="badge ${w.cls}" style="font-size:0.65rem;">${w.status}</span>
                </div>`).join('')}
            </div>
            <div style="margin-top:12px;padding:10px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;font-size:0.82rem;color:var(--danger);">
                ⚠️ <strong>Uyarı:</strong> 2 gün sonrası için fırtına tahmini mevcut. O günkü beton dökümlerini öteleyiniz veya gerekli önlemleri alınız.
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
            <!-- Döküm Rapor Formu -->
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;"><h2>🏗️ Beton Döküm Rapor Formu</h2></div>
                <div class="form-group">
                    <label>Döküm Yapılan Yapı Elemanı</label>
                    <input type="text" id="pourElement" placeholder="Örn: A Blok 2. Kat Döşeme Plağı">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>Beton Sınıfı</label>
                        <select id="pourGrade">
                            <option value="C25">C25</option>
                            <option value="C30" selected>C30</option>
                            <option value="C35">C35</option>
                            <option value="C40">C40</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Beton Hacmi (m³)</label>
                        <input type="number" id="pourVolume" value="80">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>Slump Testi</label>
                        <select id="pourSlump">
                            <option value="S1 (≤10cm)">S1 (≤10cm) — Katı</option>
                            <option value="S2 (10-14cm)">S2 (10-14cm) — Plastik</option>
                            <option value="S3 (12-17cm)" selected>S3 (12-17cm) — Yumuşak</option>
                            <option value="S4 (16-21cm)">S4 (16-21cm) — Akıcı</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Hava Sıcaklığı</label>
                        <input type="text" id="pourTemp" value="30°C">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>Lab. Numune No</label>
                        <input type="text" id="pourSampleNo" placeholder="Örn: NUM-4590">
                    </div>
                    <div class="form-group">
                        <label>Transmiksör Plaka</label>
                        <input type="text" id="pourTruck" placeholder="Örn: 34 ABC 123">
                    </div>
                </div>
                <div class="form-group">
                    <label>Notlar</label>
                    <textarea id="pourNotes" style="height:60px;" placeholder="Kürleme yöntemi, vibratör kullanımı notları..."></textarea>
                </div>
                <button class="btn btn-primary" id="saveConcreteBtn" style="width:100%;margin-top:8px;">💾 Döküm Raporunu Kaydet</button>
            </div>

            <!-- İstatistikler -->
            <div style="display:flex;flex-direction:column;gap:16px;">
                <div class="card" style="background:linear-gradient(135deg,rgba(204,163,82,0.08),rgba(204,163,82,0.02));border-color:rgba(204,163,82,0.3);">
                    <h3 style="font-size:0.85rem;color:var(--primary);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">📊 Döküm İstatistikleri</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:center;">
                        <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="font-size:1.8rem;font-weight:800;color:var(--primary);">${pours.length}</div>
                            <div style="font-size:0.72rem;color:var(--text-muted);">Toplam Döküm</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="font-size:1.8rem;font-weight:800;color:var(--success);">${totalVol}</div>
                            <div style="font-size:0.72rem;color:var(--text-muted);">Toplam m³</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="font-size:1.8rem;font-weight:800;color:var(--warning);">${pours.filter(p=>p.status.includes('Kür')).length}</div>
                            <div style="font-size:0.72rem;color:var(--text-muted);">Kürleme Aşamasında</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="font-size:1.8rem;font-weight:800;color:var(--success);">${pours.filter(p=>p.status.includes('Onay')).length}</div>
                            <div style="font-size:0.72rem;color:var(--text-muted);">Onaylanan</div>
                        </div>
                    </div>
                </div>

                <!-- Döküm Takvimi -->
                <div class="card">
                    <h3 style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px;">📅 Planlanan Döküm Takvimi</h3>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border:1px solid rgba(16,185,129,0.3);background:rgba(16,185,129,0.05);border-radius:6px;">
                            <div><div style="font-size:0.8rem;font-weight:600;">B Blok 1. Kat Kolonlar</div><div style="font-size:0.7rem;color:var(--text-muted);">C30 — ~120 m³</div></div>
                            <span class="badge badge-success" style="font-size:0.65rem;">25.06.2026</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.05);border-radius:6px;">
                            <div><div style="font-size:0.8rem;font-weight:600;">A Blok 2. Kat Döşeme</div><div style="font-size:0.7rem;color:var(--text-muted);">C30 — ~200 m³</div></div>
                            <span class="badge badge-warning" style="font-size:0.65rem;">28.06.2026</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border:1px solid var(--border-color);border-radius:6px;">
                            <div><div style="font-size:0.8rem;font-weight:600;">C Blok Radye Temel</div><div style="font-size:0.7rem;color:var(--text-muted);">C35 — ~350 m³</div></div>
                            <span class="badge badge-info" style="font-size:0.65rem;">02.07.2026</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Döküm Geçmişi -->
        <div class="card">
            <div class="card-header" style="margin-bottom:16px;">
                <h2>📊 Beton Döküm Kayıtları & Laboratuvar Takibi</h2>
                <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info','Laboratuvar raporları PDF olarak indirildi.')">📥 Lab Raporları</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr><th>Tarih</th><th>Proje</th><th>Yapı Elemanı / Notlar</th><th>Sınıf</th><th>Hacim (m³)</th><th>Sıcaklık</th><th>Slump</th><th>Lab. No</th><th>Durum</th></tr>
                    </thead>
                    <tbody id="concreteTbody">
                        ${pours.map(p=>`
                        <tr>
                            <td><strong>${p.date}</strong></td>
                            <td style="font-size:0.8rem;">${p.project}</td>
                            <td style="font-size:0.8rem;max-width:200px;">${p.notes || '—'}</td>
                            <td><span class="badge badge-info">${p.grade}</span></td>
                            <td style="font-weight:700;">${p.volume} m³</td>
                            <td>${p.temp}</td>
                            <td>${p.slump}</td>
                            <td><code style="font-size:0.75rem;color:var(--primary);">NUM-${4590+p.id%1000}</code></td>
                            <td><span class="badge ${p.status.includes('Onay')?'badge-success':'badge-warning'}">${p.status}</span></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;

        document.getElementById('saveConcreteBtn').onclick = () => {
            const element = document.getElementById('pourElement').value.trim();
            const volume  = parseFloat(document.getElementById('pourVolume').value);
            const grade   = document.getElementById('pourGrade').value;
            const slump   = document.getElementById('pourSlump').value;
            const temp    = document.getElementById('pourTemp').value;
            const notes   = document.getElementById('pourNotes').value.trim();
            if (!element || !volume) { alert('Lütfen yapı elemanı ve hacmini girin!'); return; }
            pours.unshift({ id: Date.now(), project:project.name, date:new Date().toISOString().split('T')[0], grade, volume, temp, slump, notes: element + (notes ? ' - ' + notes : ''), status:'Döküldü (Kürleniyor)' });
            window.BrenerApp.saveStateToStorage();
            window.BrenerApp.logActivity('santiye', `Hazır Beton dökümü raporlandı: ${grade} sınıfı, ${volume} m³`, 'success', `Yapı Elemanı: ${element}, Sıcaklık: ${temp}, Kıvam/Slump: ${slump}`);
            window.BrenerApp.showToast('success', 'Beton dökümü raporlandı. Laboratuvar numune kaydı açıldı.');
            this.renderConcrete(project, container);
        };
    },

renderMusteriRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Müşteri Raporu', 'Profesyonel maliyet tahmin raporu oluşturun');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        // State definition for selected colors and values
        let selectedReportType = 'Detaylı Rapor';
        let currentThemeColor = '#3b82f6'; // Default Blue

        let html = `
            <style>
                .report-type-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .report-type-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                }
                .report-type-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
                .report-type-card.selected {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.04);
                }
                .report-type-card.selected::before {
                    content: "✔";
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #3b82f6;
                    color: white;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                }
                .theme-circle {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                }
                .theme-circle.selected {
                    border-color: #fff;
                    transform: scale(1.15);
                    box-shadow: 0 0 8px rgba(255,255,255,0.4);
                }
                .preview-stat-card {
                    background: var(--primary);
                    color: #000;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    margin-bottom: 20px;
                    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.15);
                    transition: all 0.3s;
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📄 Müşteri Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Profesyonel maliyet tahmin raporu oluşturun</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-sm" id="btnLoadReportDemo" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px; padding: 8px 16px; font-weight: 600;">Demo Veri</button>
                    <button class="btn btn-sm" id="btnDownloadReportPdf" style="background: white; border: none; color: #3b82f6; border-radius: 6px; padding: 8px 16px; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">📥 PDF İndir</button>
                </div>
            </div>

            <!-- Report Type Grid Selection -->
            <div class="report-type-grid">
                <div class="report-type-card selected" data-type="Detaylı Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                    <strong style="display: block; font-size: 0.9rem;">Detaylı Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Tüm iş kalemleri, kategori tabloları</span>
                </div>
                <div class="report-type-card" data-type="Özet Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📷</div>
                    <strong style="display: block; font-size: 0.9rem;">Özet Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Kategori özetleri, metraj bilgileri</span>
                </div>
                <div class="report-type-card" data-type="Yönetici Raporu">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📑</div>
                    <strong style="display: block; font-size: 0.9rem;">Yönetici Raporu</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Sadece toplam ve dağılım</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Forms Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje Seç Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 12px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📂 Proje Seç</h2>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mevcut bir projeden maliyet verisi yükle</label>
                            <select id="reportProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Firma Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">🏢 Firma Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Firma Adı</label>
                                <input type="text" id="reportFirmaAd" value="Brener" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Firma Logosu</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <div style="width: 80px; height: 38px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: var(--text-muted);">Logo Yok</div>
                                    <button class="btn btn-secondary btn-sm" style="padding: 10px 14px;">⚡ Yükle</button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group" style="margin-top: 10px; margin-bottom: 0;">
                            <label>Renk Teması</label>
                            <div style="display: flex; gap: 10px;">
                                <div class="theme-circle selected" data-color="#3b82f6" style="background: #3b82f6;"></div>
                                <div class="theme-circle" data-color="#10b981" style="background: #10b981;"></div>
                                <div class="theme-circle" data-color="#f97316" style="background: #f97316;"></div>
                                <div class="theme-circle" data-color="#8b5cf6" style="background: #8b5cf6;"></div>
                                <div class="theme-circle" data-color="#4b5563" style="background: #4b5563;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">👤 Müşteri Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Ad Soyad</label>
                            <input type="text" id="reportMusteriAd" placeholder="Müşteri adı soyadı" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon</label>
                                <input type="text" id="reportMusteriTel" placeholder="0532 xxx xx xx" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-posta</label>
                                <input type="email" id="reportMusteriEmail" placeholder="ornek@email.com" style="width: 100%;">
                            </div>
                        </div>
                    </div>

                    <!-- Proje Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📍 Proje Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Proje Adı</label>
                                <input type="text" id="reportProjeAd" value="${activeProj ? activeProj.name : 'Örnek Villa Projesi'}" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Proje Adresi</label>
                                <input type="text" id="reportProjeAdres" value="${activeProj ? activeProj.location : ''}" placeholder="Proje adresi" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Açıklama</label>
                            <textarea id="reportProjeAciklama" rows="2" style="width: 100%;">${activeProj ? `${activeProj.type} - ${activeProj.blocks || 1} Blok` : 'Konut - 3 kat, 150 m²'}</textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Notlar (Rapora eklenecek)</label>
                            <textarea id="reportProjeNotlar" rows="2" placeholder="Müşteriye iletilecek özel notlar" style="width: 100%;"></textarea>
                        </div>
                    </div>

                </div>

                <!-- Right Preview Column -->
                <div>
                    <div class="card" style="padding: 24px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 20px;">
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
                            <span>Seçili Rapor:</span>
                            <span id="previewReportTypeLabel" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-weight: bold;">📝 Detaylı Rapor</span>
                        </div>

                        <!-- Big Cost Stat Card -->
                        <div class="preview-stat-card" id="reportCostStatCard" style="background: #3b82f6; color: white;">
                            <div style="font-size: 0.85rem; opacity: 0.95; font-weight: 500;">Tahmini Toplam Maliyet</div>
                            <div style="font-size: 1.85rem; font-weight: 800; margin: 8px 0;" id="previewTotalCostVal">15.750.000 ₺</div>
                            <div style="font-size: 0.82rem; opacity: 0.9;" id="previewPerSqmVal">35.000 ₺/m²</div>
                        </div>

                        <!-- Three Sub-stats -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Brüt Alan</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewAreaVal">450 m²</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Kat Sayısı</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewFloorsVal">3</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">İş Kalemi</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;">11</strong>
                            </div>
                        </div>
                        <div style="text-align: center; font-size: 0.76rem; color: var(--text-muted);" id="previewProjectSub">
                            Proje: Örnek Villa Projesi
                        </div>

                        <!-- Maliyet Dağılımı (Progress Bars) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">📊 Maliyet Dağılımı</h3>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>🔨 Malzeme</span>
                                    <strong id="previewMaterialCost">9.450.000 ₺ (%60)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbMaterial" style="width: 60%; background: #3b82f6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>👤 İşçilik</span>
                                    <strong id="previewLaborCost">4.725.000 ₺ (%30)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbLabor" style="width: 30%; background: #f97316; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>📦 Ekipman</span>
                                    <strong id="previewEquipmentCost">1.575.000 ₺ (%10)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbEquipment" style="width: 10%; background: #8b5cf6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Kategori Dağılımı (SVG Donut Chart) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">🍩 Kategori Dağılımı</h3>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
                                <!-- SVG Donut -->
                                <svg width="100" height="100" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4.2"></circle>
                                    
                                    <!-- Kaba Insaat - 40% (stroke-dasharray: 40 60) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" stroke-width="4.2" stroke-dasharray="40 60" stroke-dashoffset="25"></circle>
                                    
                                    <!-- Ince Insaat - 30% (stroke-dasharray: 30 70) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" stroke-width="4.2" stroke-dasharray="30 70" stroke-dashoffset="85"></circle>
                                    
                                    <!-- Tesisat - 20% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" stroke-width="4.2" stroke-dasharray="20 80" stroke-dashoffset="115"></circle>
                                    
                                    <!-- Dis Cephe - 10% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" stroke-width="4.2" stroke-dasharray="10 90" stroke-dashoffset="135"></circle>
                                </svg>
                                <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem;">
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 2px;"></span> Kaba İnşaat (40%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> İnce İnşaat (30%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #f97316; border-radius: 2px;"></span> Tesisat (20%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></span> Dış Cephe (10%)</div>
                                </div>
                            </div>
                        </div>

                        <!-- İş Kalemleri Detayı (Accordion List) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">📝 İş Kalemleri Detayı</h3>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Kaba İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valKaba">6.300.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>İnce İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valInce">4.725.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(249, 115, 22, 0.15); color: #f97316; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Tesisat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valTesisat">3.150.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">2</span>
                                        <strong>Dış Cephe</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valDis">1.575.000 ₺</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // UI Element Event Handlers
        const reportCards = container.querySelectorAll('.report-type-card');
        const previewTypeLabel = document.getElementById('previewReportTypeLabel');

        reportCards.forEach(card => {
            card.onclick = () => {
                reportCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedReportType = card.getAttribute('data-type');
                previewTypeLabel.textContent = `📝 ${selectedReportType}`;
            };
        });

        // Theme Circles Click Event
        const themeCircles = container.querySelectorAll('.theme-circle');
        const costCard = document.getElementById('reportCostStatCard');

        themeCircles.forEach(circle => {
            circle.onclick = () => {
                themeCircles.forEach(c => c.classList.remove('selected'));
                circle.classList.add('selected');
                currentThemeColor = circle.getAttribute('data-color');
                costCard.style.background = currentThemeColor;
            };
        });

        // Dynamic project selection calculations
        const projectSelect = document.getElementById('reportProjectSelect');
        const inputProjeAd = document.getElementById('reportProjeAd');
        const inputProjeAdres = document.getElementById('reportProjeAdres');
        const txtProjeAciklama = document.getElementById('reportProjeAciklama');

        const valCost = document.getElementById('previewTotalCostVal');
        const valPerSqm = document.getElementById('previewPerSqmVal');
        const valArea = document.getElementById('previewAreaVal');
        const valFloors = document.getElementById('previewFloorsVal');
        const txtProjectSub = document.getElementById('previewProjectSub');

        const labelMaterial = document.getElementById('previewMaterialCost');
        const labelLabor = document.getElementById('previewLaborCost');
        const labelEquipment = document.getElementById('previewEquipmentCost');

        const pbM = document.getElementById('pbMaterial');
        const pbL = document.getElementById('pbLabor');
        const pbE = document.getElementById('pbEquipment');

        const valKaba = document.getElementById('valKaba');
        const valInce = document.getElementById('valInce');
        const valTesisat = document.getElementById('valTesisat');
        const valDis = document.getElementById('valDis');

        const updatePreviewValues = (projectData) => {
            if (!projectData) {
                // Set default/villa project values
                valCost.textContent = '15.750.000 ₺';
                valPerSqm.textContent = '35.000 ₺/m²';
                valArea.textContent = '450 m²';
                valFloors.textContent = '3';
                txtProjectSub.textContent = 'Proje: Örnek Villa Projesi';

                labelMaterial.textContent = '9.450.000 ₺ (%60)';
                labelLabor.textContent = '4.725.000 ₺ (%30)';
                labelEquipment.textContent = '1.575.000 ₺ (%10)';

                pbM.style.width = '60%';
                pbL.style.width = '30%';
                pbE.style.width = '10%';

                valKaba.textContent = '6.300.000 ₺';
                valInce.textContent = '4.725.000 ₺';
                valTesisat.textContent = '3.150.000 ₺';
                valDis.textContent = '1.575.000 ₺';
                return;
            }

            // Estimate total cost based on square meters
            const area = parseInt(projectData.area) || 300;
            const floors = parseInt(projectData.floors) || 2;
            const multiplier = projectData.type === 'Villa' ? 42000 : projectData.type === 'Apartman' ? 32000 : 25000;
            const totalCost = area * multiplier;

            // Formatted values
            valCost.textContent = `${totalCost.toLocaleString('tr-TR')} ₺`;
            valPerSqm.textContent = `${multiplier.toLocaleString('tr-TR')} ₺/m²`;
            valArea.textContent = `${area} m²`;
            valFloors.textContent = floors;
            txtProjectSub.textContent = `Proje: ${projectData.name}`;

            // Cost breakdowns
            const material = totalCost * 0.58;
            const labor = totalCost * 0.32;
            const equip = totalCost * 0.10;

            labelMaterial.textContent = `${material.toLocaleString('tr-TR')} ₺ (%58)`;
            labelLabor.textContent = `${labor.toLocaleString('tr-TR')} ₺ (%32)`;
            labelEquipment.textContent = `${equip.toLocaleString('tr-TR')} ₺ (%10)`;

            pbM.style.width = '58%';
            pbL.style.width = '32%';
            pbE.style.width = '10%';

            // Categories breakdowns
            valKaba.textContent = `${(totalCost * 0.42).toLocaleString('tr-TR')} ₺`;
            valInce.textContent = `${(totalCost * 0.28).toLocaleString('tr-TR')} ₺`;
            valTesisat.textContent = `${(totalCost * 0.20).toLocaleString('tr-TR')} ₺`;
            valDis.textContent = `${(totalCost * 0.10).toLocaleString('tr-TR')} ₺`;
        };

        projectSelect.onchange = () => {
            const selectedId = projectSelect.value;
            if (!selectedId) {
                inputProjeAd.value = '';
                inputProjeAdres.value = '';
                txtProjeAciklama.value = '';
                updatePreviewValues(null);
                return;
            }

            const p = projects.find(item => item.id.toString() === selectedId.toString());
            if (p) {
                inputProjeAd.value = p.name;
                inputProjeAdres.value = p.location || '';
                txtProjeAciklama.value = `${p.type} - ${p.area} m², ${p.floors || 2} Kat`;
                updatePreviewValues(p);
            }
        };

        // Form Inputs event listeners to update right column titles
        inputProjeAd.oninput = () => {
            txtProjectSub.textContent = `Proje: ${inputProjeAd.value || 'Belirtilmedi'}`;
        };

        // Demo Data Button Action
        document.getElementById('btnLoadReportDemo').onclick = () => {
            document.getElementById('reportMusteriAd').value = 'Hakan Demir';
            document.getElementById('reportMusteriTel').value = '0533 999 88 77';
            document.getElementById('reportMusteriEmail').value = 'hakan.demir@demirholding.com';
            
            inputProjeAd.value = 'Marmara Plaza Restorasyon';
            inputProjeAdres.value = 'Kadıköy, İstanbul';
            txtProjeAciklama.value = 'Eski Eser Restorasyon ve Güçlendirme';
            
            valCost.textContent = '28.400.000 ₺';
            valPerSqm.textContent = '48.000 ₺/m²';
            valArea.textContent = '600 m²';
            valFloors.textContent = '4';
            txtProjectSub.textContent = 'Proje: Marmara Plaza Restorasyon';

            labelMaterial.textContent = '17.040.000 ₺ (%60)';
            labelLabor.textContent = '8.520.000 ₺ (%30)';
            labelEquipment.textContent = '2.840.000 ₺ (%10)';

            pbM.style.width = '60%';
            pbL.style.width = '30%';
            pbE.style.width = '10%';

            valKaba.textContent = '11.360.000 ₺';
            valInce.textContent = '8.520.000 ₺';
            valTesisat.textContent = '5.680.000 ₺';
            valDis.textContent = '2.840.000 ₺';

            window.BrenerApp.showToast('success', 'Müşteri raporu için demo veriler yüklendi.');
        };

        // Download PDF simulation
        document.getElementById('btnDownloadReportPdf').onclick = () => {
            window.BrenerApp.showToast('success', 'Müşteri Tahmin Raporu PDF formatında başarıyla indirildi!');
        };
    },

renderMalikRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Malik Raporu', 'Projelerin İlerlemesi ve Malik Bilgilendirme Raporu');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        let html = `
            <style>
                .progress-ring {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                }
                .progress-ring svg {
                    transform: rotate(-90deg);
                }
                .progress-ring-circle {
                    transition: stroke-dashoffset 0.35s;
                    transform-origin: 50% 50%;
                }
                .photo-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-top: 10px;
                }
                .photo-thumb {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    height: 80px;
                    overflow: hidden;
                    position: relative;
                    cursor: pointer;
                }
                .photo-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .photo-thumb .photo-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    font-size: 0.62rem;
                    text-align: center;
                    padding: 3px 0;
                }
                .preview-phone {
                    background: var(--bg-card);
                    border: 12px solid #222;
                    border-radius: 36px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
                    max-width: 320px;
                    margin: 0 auto;
                    overflow: hidden;
                    position: relative;
                }
                .preview-phone-screen {
                    height: 520px;
                    overflow-y: auto;
                    padding: 16px;
                    font-size: 0.85rem;
                }
                .timeline-step {
                    display: flex;
                    gap: 12px;
                    position: relative;
                    margin-bottom: 20px;
                }
                .timeline-step::before {
                    content: "";
                    position: absolute;
                    top: 18px;
                    left: 9px;
                    bottom: -22px;
                    width: 2px;
                    background: var(--border-color);
                    z-index: 1;
                }
                .timeline-step:last-child::before {
                    display: none;
                }
                .timeline-dot {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                    font-weight: bold;
                    z-index: 2;
                }
                .timeline-dot.completed {
                    background: #10b981;
                    color: white;
                }
                .timeline-dot.active {
                    background: #3b82f6;
                    color: white;
                    box-shadow: 0 0 8px rgba(59,130,246,0.5);
                }
                .timeline-dot.pending {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid var(--border-color);
                    color: var(--text-muted);
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📋 Malik Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Mülk ve arsa sahipleri için projelerin ilerleme ve fotoğraf raporunu oluşturup gönderin</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Configuration Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje & İlerleme Seç -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>🏢 Proje Seç & İlerleme</h2>
                        </div>
                        <div class="form-group">
                            <label>Raporlanacak Proje</label>
                            <select id="malikProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>İlerleme Yüzdesi (%)</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="range" id="malikProgressRange" min="0" max="100" value="65" style="flex: 1;">
                                    <strong id="malikProgressVal" style="width: 40px; text-align: right; font-size: 1rem; color: var(--primary);">%65</strong>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Aktif Aşama</label>
                                <select id="malikActiveStage" style="width: 100%;">
                                    <option value="Temel İmalatı">Temel İmalatı</option>
                                    <option value="Kaba İnşaat (Betonarme)" selected>Kaba İnşaat (Betonarme)</option>
                                    <option value="Duvar İmalatları">Duvar İmalatları</option>
                                    <option value="İnce İşler (Alçı & Boya)">İnce İşler (Alçı & Boya)</option>
                                    <option value="Cephe Kaplama">Cephe Kaplama</option>
                                    <option value="Çevre Düzenleme">Çevre Düzenleme</option>
                                    <option value="Anahtar Teslim">Anahtar Teslim</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri (Malik) Bilgileri -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>👤 Malik (Müşteri) Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Adı Soyadı</label>
                            <input type="text" id="malikCustomerName" value="Mustafa Koç" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon (WhatsApp Gönderimi İçin)</label>
                                <input type="text" id="malikCustomerPhone" value="05321112233" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-Posta</label>
                                <input type="email" id="malikCustomerEmail" value="mustafa.koc@gmail.com" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mühendis Rapor Notu (Malike İletilecek)</label>
                            <textarea id="malikReportNotes" rows="3" style="width: 100%;">Değerli mülk sahibimiz, projemizin betonarme karkas imalatları başarıyla tamamlanmış olup ince işler aşamasına geçilmiştir. Güncel durum fotoğraflarını aşağıdan inceleyebilirsiniz.</textarea>
                        </div>
                    </div>

                    <!-- Şantiye Fotoğrafları -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 8px;">
                            <h2>📷 Güncel İlerleme Fotoğrafları</h2>
                        </div>
                        <p style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 12px;">Raporda görüntülenecek 3 adet şantiye fotoğrafı seçin veya yeni yükleyin</p>
                        
                        <div class="photo-grid">
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Temel Demiri</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Kolon Betonu</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Duvar İmalatı</div>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 12px;">➕ Yeni Fotoğraf Ekle</button>
                    </div>

                    <!-- Gönderim Kanalları -->
                    <div class="card" style="border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.02);">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>📤 Raporu Malik'e Gönder</h2>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn" id="btnSendReportWhatsapp" style="flex: 1; background: #25d366; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);">
                                💬 WhatsApp ile Gönder
                            </button>
                            <button class="btn" id="btnSendReportEmail" style="flex: 1; background: #3b82f6; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);">
                                📧 E-Posta ile Gönder
                            </button>
                        </div>
                    </div>

                </div>

                <!-- Right Live Mobile Preview Column -->
                <div>
                    <h3 style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">📱 Malik Canlı Rapor Görünümü</h3>
                    
                    <!-- Mobile Mockup -->
                    <div class="preview-phone">
                        <div class="preview-phone-screen">
                            
                            <!-- Phone Top Bar -->
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px;">
                                <strong style="color: var(--primary);">BRENER GROUP</strong>
                                <span class="badge badge-success" style="font-size: 0.65rem;">İlerleme Raporu</span>
                            </div>

                            <!-- Project Title -->
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h4 style="font-size: 1.05rem; font-weight: 800; margin: 0;" id="phoneProjectName">Örnek Villa Projesi</h4>
                                <span style="font-size: 0.7rem; color: var(--text-muted);" id="phoneProjectAddr">Bodrum, Muğla</span>
                            </div>

                            <!-- Circular Progress Ring -->
                            <div class="progress-ring">
                                <svg width="120" height="120">
                                    <circle stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="transparent" r="52" cx="60" cy="60"></circle>
                                    <circle class="progress-ring-circle" id="phoneProgressCircle" stroke="#10b981" stroke-width="8" fill="transparent" r="52" cx="60" cy="60" stroke-dasharray="326.7" stroke-dashoffset="114.3"></circle>
                                </svg>
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <strong id="phoneProgressText" style="font-size: 1.35rem; font-weight: bold; color: white;">%65</strong>
                                    <span style="font-size: 0.6rem; color: var(--text-muted);">Tamamlandı</span>
                                </div>
                            </div>

                            <!-- Active Phase details -->
                            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Aktif İnşaat Aşaması</div>
                                <strong id="phoneActiveStageText" style="font-size: 0.85rem; color: #10b981; display: block; margin-top: 4px;">Kaba İnşaat (Betonarme)</strong>
                            </div>

                            <!-- Timeline -->
                            <div style="margin-bottom: 24px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 12px;">📋 İnşaat Aşamaları</h5>
                                
                                <div class="timeline-step">
                                    <div class="timeline-dot completed">✓</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;">Temel İmalatı</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">%100 Tamamlandı</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot active" id="tlDotActive">▶</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;" id="tlActiveText">Kaba İnşaat (Betonarme)</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);" id="tlActivePercent">Devam ediyor</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot pending"></div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block; opacity: 0.6;">İnce İmalatlar & Cephe</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">Başlamadı</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Engineer Notes -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-bottom: 20px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 6px;">✍️ Mühendis Notu</h5>
                                <p style="font-size: 0.74rem; color: var(--text-main); line-height: 1.4; margin: 0; background: rgba(255,255,255,0.01); padding: 8px; border-radius: 6px; border-left: 3px solid #10b981;" id="phoneNotesText">
                                    Değerli mülk sahibimiz, projemizin kaba inşaat demir ve beton dökümleri tamamlanmış olup duvar örme aşamasına başlanacaktır.
                                </p>
                            </div>

                            <!-- Photos -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 10px;">📸 Güncel Fotoğraflar</h5>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // Interactive logic elements references
        const selectProj = document.getElementById('malikProjectSelect');
        const progressRange = document.getElementById('malikProgressRange');
        const progressVal = document.getElementById('malikProgressVal');
        const activeStage = document.getElementById('malikActiveStage');
        const inputCustName = document.getElementById('malikCustomerName');
        const inputCustPhone = document.getElementById('malikCustomerPhone');
        const inputCustEmail = document.getElementById('malikCustomerEmail');
        const txtNotes = document.getElementById('malikReportNotes');

        const phoneProjName = document.getElementById('phoneProjectName');
        const phoneProjAddr = document.getElementById('phoneProjectAddr');
        const phoneProgressText = document.getElementById('phoneProgressText');
        const phoneProgressCircle = document.getElementById('phoneProgressCircle');
        const phoneActiveStageText = document.getElementById('phoneActiveStageText');
        const phoneNotesText = document.getElementById('phoneNotesText');
        const tlActiveText = document.getElementById('tlActiveText');
        const tlActivePercent = document.getElementById('tlActivePercent');

        // Circle calculation variables
        const radius = 52;
        const circumference = 2 * Math.PI * radius; // 326.72

        const updateCircleProgress = (percent) => {
            const offset = circumference - (percent / 100 * circumference);
            phoneProgressCircle.style.strokeDashoffset = offset;
            phoneProgressText.textContent = `%${percent}`;
            progressVal.textContent = `%${percent}`;
            tlActivePercent.textContent = `%${percent} seviyesinde`;
        };

        // Event Listeners
        progressRange.oninput = () => {
            updateCircleProgress(progressRange.value);
        };

        activeStage.onchange = () => {
            const val = activeStage.value;
            phoneActiveStageText.textContent = val;
            tlActiveText.textContent = val;
        };

        txtNotes.oninput = () => {
            phoneNotesText.textContent = txtNotes.value || 'Not girilmedi.';
        };

        selectProj.onchange = () => {
            const selId = selectProj.value;
            if (!selId) return;
            const p = projects.find(item => item.id.toString() === selId.toString());
            if (p) {
                phoneProjName.textContent = p.name;
                phoneProjAddr.textContent = p.location || 'Şantiye Alanı';
                
                // Adjust default progress based on actual project progress if it exists
                const progressNum = p.progress ? parseInt(p.progress.replace('%','')) : 45;
                progressRange.value = progressNum;
                updateCircleProgress(progressNum);
            }
        };

        // Initialize progress
        updateCircleProgress(65);

        // Send WhatsApp Action
        document.getElementById('btnSendReportWhatsapp').onclick = () => {
            const custName = inputCustName.value.trim();
            const custPhone = inputCustPhone.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;

            if (!custName || !custPhone) {
                alert('Lütfen malik adı ve telefon numarasını doldurun!');
                return;
            }

            const message = `Sayın ${custName}, ${projName} inşaatımızda güncel ilerleme seviyesi %${progress} oranına ulaşmıştır. Aktif aşama: ${stage}. Detayları incelemek için rapor linkiniz: http://brener.com.tr/rapor/malik-382a`;
            const encodedMsg = encodeURIComponent(message);
            const waUrl = `https://api.whatsapp.com/send?phone=${custPhone}&text=${encodedMsg}`;

            window.BrenerApp.showToast('success', `${custName} adlı malike WhatsApp rapor taslağı oluşturuldu. WhatsApp Web/Uygulaması açılıyor.`);
            window.BrenerApp.logActivity('santiye', `${custName} malikine WhatsApp ilerleme raporu gönderildi: %${progress}`, 'success', message);
            
            setTimeout(() => {
                window.open(waUrl, '_blank');
            }, 1000);
        };

        // Send Email Action
        document.getElementById('btnSendReportEmail').onclick = () => {
            const custName = inputCustName.value.trim();
            const custEmail = inputCustEmail.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;
            const notes = txtNotes.value.trim();

            if (!custName || !custEmail) {
                alert('Lütfen malik adı ve e-posta adresini doldurun!');
                return;
            }

            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 500px; border: 1px solid #ddd; border-radius: 12px; padding: 24px; background: #fff; color: #333;">
                    <h3 style="color: #10b981; margin-top: 0;">BRENER GROUP - İlerleyiş Raporu</h3>
                    <p>Sayın <strong>${custName}</strong>,</p>
                    <p><strong>${projName}</strong> projesine ait güncel ilerleme ve saha durumu bilgileri aşağıdaki gibidir:</p>
                    <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin: 16px 0;">
                        <strong>İlerleme Seviyesi:</strong> %${progress} tamamlandı<br>
                        <strong>Aktif Aşama:</strong> ${stage}
                    </div>
                    <p><strong>Mühendis Notu:</strong><br>${notes}</p>
                    <p style="font-size: 0.85rem; color: #666;">Güncel fotoğraflar ve detaylar rapora eklenmiştir.</p>
                </div>
            `;

            const modalHtml = `
                <div style="padding: 16px;">
                    <div class="form-group">
                        <label>Alıcı</label>
                        <input type="text" value="${custEmail}" disabled style="width:100%; opacity:0.6;">
                    </div>
                    <div class="form-group">
                        <label>E-Posta Şablon Önizleme</label>
                        <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: rgba(255,255,255,0.02); max-height: 250px; overflow-y: auto;">
                            ${emailHtml}
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; margin-top:20px; justify-content:flex-end;">
                        <button class="btn btn-secondary" onclick="window.BrenerApp.closeModal()">Kapat</button>
                        <button class="btn btn-primary" id="btnConfirmSendEmail" style="background:#10b981; border:none; color:white;">E-Postayı Gönder</button>
                    </div>
                </div>
            `;

            window.BrenerApp.openModal('📧 Malik E-Posta Gönderim Taslağı', modalHtml);

            document.getElementById('btnConfirmSendEmail').onclick = () => {
                window.BrenerApp.closeModal();
                window.BrenerApp.showToast('success', `${custName} malikine bilgilendirme e-postası başarıyla gönderildi.`);
                window.BrenerApp.logActivity('santiye', `${custName} malikine e-posta ilerleme raporu gönderildi`, 'success', `Alıcı: ${custEmail}, İlerleme: %${progress}`);
            };
        };

    },

    renderMusteriRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Müşteri Raporu', 'Profesyonel maliyet tahmin raporu oluşturun');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        // State definition for selected colors and values
        let selectedReportType = 'Detaylı Rapor';
        let currentThemeColor = '#3b82f6'; // Default Blue

        let html = `
            <style>
                .report-type-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .report-type-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                }
                .report-type-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
                .report-type-card.selected {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.04);
                }
                .report-type-card.selected::before {
                    content: "✔";
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #3b82f6;
                    color: white;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                }
                .theme-circle {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                }
                .theme-circle.selected {
                    border-color: #fff;
                    transform: scale(1.15);
                    box-shadow: 0 0 8px rgba(255,255,255,0.4);
                }
                .preview-stat-card {
                    background: var(--primary);
                    color: #000;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    margin-bottom: 20px;
                    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.15);
                    transition: all 0.3s;
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📄 Müşteri Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Profesyonel maliyet tahmin raporu oluşturun</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-sm" id="btnLoadReportDemo" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px; padding: 8px 16px; font-weight: 600;">Demo Veri</button>
                    <button class="btn btn-sm" id="btnDownloadReportPdf" style="background: white; border: none; color: #3b82f6; border-radius: 6px; padding: 8px 16px; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">📥 PDF İndir</button>
                </div>
            </div>

            <!-- Report Type Grid Selection -->
            <div class="report-type-grid">
                <div class="report-type-card selected" data-type="Detaylı Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                    <strong style="display: block; font-size: 0.9rem;">Detaylı Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Tüm iş kalemleri, kategori tabloları</span>
                </div>
                <div class="report-type-card" data-type="Özet Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📷</div>
                    <strong style="display: block; font-size: 0.9rem;">Özet Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Kategori özetleri, metraj bilgileri</span>
                </div>
                <div class="report-type-card" data-type="Yönetici Raporu">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📑</div>
                    <strong style="display: block; font-size: 0.9rem;">Yönetici Raporu</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Sadece toplam ve dağılım</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Forms Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje Seç Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 12px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📂 Proje Seç</h2>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mevcut bir projeden maliyet verisi yükle</label>
                            <select id="reportProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Firma Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">🏢 Firma Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Firma Adı</label>
                                <input type="text" id="reportFirmaAd" value="Brener" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Firma Logosu</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <div style="width: 80px; height: 38px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: var(--text-muted);">Logo Yok</div>
                                    <button class="btn btn-secondary btn-sm" style="padding: 10px 14px;">⚡ Yükle</button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group" style="margin-top: 10px; margin-bottom: 0;">
                            <label>Renk Teması</label>
                            <div style="display: flex; gap: 10px;">
                                <div class="theme-circle selected" data-color="#3b82f6" style="background: #3b82f6;"></div>
                                <div class="theme-circle" data-color="#10b981" style="background: #10b981;"></div>
                                <div class="theme-circle" data-color="#f97316" style="background: #f97316;"></div>
                                <div class="theme-circle" data-color="#8b5cf6" style="background: #8b5cf6;"></div>
                                <div class="theme-circle" data-color="#4b5563" style="background: #4b5563;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">👤 Müşteri Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Ad Soyad</label>
                            <input type="text" id="reportMusteriAd" placeholder="Müşteri adı soyadı" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon</label>
                                <input type="text" id="reportMusteriTel" placeholder="0532 xxx xx xx" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-posta</label>
                                <input type="email" id="reportMusteriEmail" placeholder="ornek@email.com" style="width: 100%;">
                            </div>
                        </div>
                    </div>

                    <!-- Proje Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📍 Proje Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Proje Adı</label>
                                <input type="text" id="reportProjeAd" value="${activeProj ? activeProj.name : 'Örnek Villa Projesi'}" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Proje Adresi</label>
                                <input type="text" id="reportProjeAdres" value="${activeProj ? activeProj.location : ''}" placeholder="Proje adresi" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Açıklama</label>
                            <textarea id="reportProjeAciklama" rows="2" style="width: 100%;">${activeProj ? `${activeProj.type} - ${activeProj.blocks || 1} Blok` : 'Konut - 3 kat, 150 m²'}</textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Notlar (Rapora eklenecek)</label>
                            <textarea id="reportProjeNotlar" rows="2" placeholder="Müşteriye iletilecek özel notlar" style="width: 100%;"></textarea>
                        </div>
                    </div>

                </div>

                <!-- Right Preview Column -->
                <div>
                    <div class="card" style="padding: 24px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 20px;">
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
                            <span>Seçili Rapor:</span>
                            <span id="previewReportTypeLabel" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-weight: bold;">📝 Detaylı Rapor</span>
                        </div>

                        <!-- Big Cost Stat Card -->
                        <div class="preview-stat-card" id="reportCostStatCard" style="background: #3b82f6; color: white;">
                            <div style="font-size: 0.85rem; opacity: 0.95; font-weight: 500;">Tahmini Toplam Maliyet</div>
                            <div style="font-size: 1.85rem; font-weight: 800; margin: 8px 0;" id="previewTotalCostVal">15.750.000 ₺</div>
                            <div style="font-size: 0.82rem; opacity: 0.9;" id="previewPerSqmVal">35.000 ₺/m²</div>
                        </div>

                        <!-- Three Sub-stats -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Brüt Alan</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewAreaVal">450 m²</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Kat Sayısı</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewFloorsVal">3</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">İş Kalemi</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;">11</strong>
                            </div>
                        </div>
                        <div style="text-align: center; font-size: 0.76rem; color: var(--text-muted);" id="previewProjectSub">
                            Proje: Örnek Villa Projesi
                        </div>

                        <!-- Maliyet Dağılımı (Progress Bars) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">📊 Maliyet Dağılımı</h3>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>🔨 Malzeme</span>
                                    <strong id="previewMaterialCost">9.450.000 ₺ (%60)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbMaterial" style="width: 60%; background: #3b82f6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>👤 İşçilik</span>
                                    <strong id="previewLaborCost">4.725.000 ₺ (%30)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbLabor" style="width: 30%; background: #f97316; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>📦 Ekipman</span>
                                    <strong id="previewEquipmentCost">1.575.000 ₺ (%10)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbEquipment" style="width: 10%; background: #8b5cf6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Kategori Dağılımı (SVG Donut Chart) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">🍩 Kategori Dağılımı</h3>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
                                <!-- SVG Donut -->
                                <svg width="100" height="100" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4.2"></circle>
                                    
                                    <!-- Kaba Insaat - 40% (stroke-dasharray: 40 60) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" stroke-width="4.2" stroke-dasharray="40 60" stroke-dashoffset="25"></circle>
                                    
                                    <!-- Ince Insaat - 30% (stroke-dasharray: 30 70) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" stroke-width="4.2" stroke-dasharray="30 70" stroke-dashoffset="85"></circle>
                                    
                                    <!-- Tesisat - 20% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" stroke-width="4.2" stroke-dasharray="20 80" stroke-dashoffset="115"></circle>
                                    
                                    <!-- Dis Cephe - 10% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" stroke-width="4.2" stroke-dasharray="10 90" stroke-dashoffset="135"></circle>
                                </svg>
                                <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem;">
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 2px;"></span> Kaba İnşaat (40%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> İnce İnşaat (30%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #f97316; border-radius: 2px;"></span> Tesisat (20%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></span> Dış Cephe (10%)</div>
                                </div>
                            </div>
                        </div>

                        <!-- İş Kalemleri Detayı (Accordion List) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">📝 İş Kalemleri Detayı</h3>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Kaba İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valKaba">6.300.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>İnce İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valInce">4.725.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(249, 115, 22, 0.15); color: #f97316; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Tesisat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valTesisat">3.150.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">2</span>
                                        <strong>Dış Cephe</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valDis">1.575.000 ₺</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // UI Element Event Handlers
        const reportCards = container.querySelectorAll('.report-type-card');
        const previewTypeLabel = document.getElementById('previewReportTypeLabel');

        reportCards.forEach(card => {
            card.onclick = () => {
                reportCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedReportType = card.getAttribute('data-type');
                previewTypeLabel.textContent = `📝 ${selectedReportType}`;
            };
        });

        // Theme Circles Click Event
        const themeCircles = container.querySelectorAll('.theme-circle');
        const costCard = document.getElementById('reportCostStatCard');

        themeCircles.forEach(circle => {
            circle.onclick = () => {
                themeCircles.forEach(c => c.classList.remove('selected'));
                circle.classList.add('selected');
                currentThemeColor = circle.getAttribute('data-color');
                costCard.style.background = currentThemeColor;
            };
        });

        // Dynamic project selection calculations
        const projectSelect = document.getElementById('reportProjectSelect');
        const inputProjeAd = document.getElementById('reportProjeAd');
        const inputProjeAdres = document.getElementById('reportProjeAdres');
        const txtProjeAciklama = document.getElementById('reportProjeAciklama');

        const valCost = document.getElementById('previewTotalCostVal');
        const valPerSqm = document.getElementById('previewPerSqmVal');
        const valArea = document.getElementById('previewAreaVal');
        const valFloors = document.getElementById('previewFloorsVal');
        const txtProjectSub = document.getElementById('previewProjectSub');

        const labelMaterial = document.getElementById('previewMaterialCost');
        const labelLabor = document.getElementById('previewLaborCost');
        const labelEquipment = document.getElementById('previewEquipmentCost');

        const pbM = document.getElementById('pbMaterial');
        const pbL = document.getElementById('pbLabor');
        const pbE = document.getElementById('pbEquipment');

        const valKaba = document.getElementById('valKaba');
        const valInce = document.getElementById('valInce');
        const valTesisat = document.getElementById('valTesisat');
        const valDis = document.getElementById('valDis');

        const updatePreviewValues = (projectData) => {
            if (!projectData) {
                // Set default/villa project values
                valCost.textContent = '15.750.000 ₺';
                valPerSqm.textContent = '35.000 ₺/m²';
                valArea.textContent = '450 m²';
                valFloors.textContent = '3';
                txtProjectSub.textContent = 'Proje: Örnek Villa Projesi';

                labelMaterial.textContent = '9.450.000 ₺ (%60)';
                labelLabor.textContent = '4.725.000 ₺ (%30)';
                labelEquipment.textContent = '1.575.000 ₺ (%10)';

                pbM.style.width = '60%';
                pbL.style.width = '30%';
                pbE.style.width = '10%';

                valKaba.textContent = '6.300.000 ₺';
                valInce.textContent = '4.725.000 ₺';
                valTesisat.textContent = '3.150.000 ₺';
                valDis.textContent = '1.575.000 ₺';
                return;
            }

            // Estimate total cost based on square meters
            const area = parseInt(projectData.area) || 300;
            const floors = parseInt(projectData.floors) || 2;
            const multiplier = projectData.type === 'Villa' ? 42000 : projectData.type === 'Apartman' ? 32000 : 25000;
            const totalCost = area * multiplier;

            // Formatted values
            valCost.textContent = `${totalCost.toLocaleString('tr-TR')} ₺`;
            valPerSqm.textContent = `${multiplier.toLocaleString('tr-TR')} ₺/m²`;
            valArea.textContent = `${area} m²`;
            valFloors.textContent = floors;
            txtProjectSub.textContent = `Proje: ${projectData.name}`;

            // Cost breakdowns
            const material = totalCost * 0.58;
            const labor = totalCost * 0.32;
            const equip = totalCost * 0.10;

            labelMaterial.textContent = `${material.toLocaleString('tr-TR')} ₺ (%58)`;
            labelLabor.textContent = `${labor.toLocaleString('tr-TR')} ₺ (%32)`;
            labelEquipment.textContent = `${equip.toLocaleString('tr-TR')} ₺ (%10)`;

            pbM.style.width = '58%';
            pbL.style.width = '32%';
            pbE.style.width = '10%';

            // Categories breakdowns
            valKaba.textContent = `${(totalCost * 0.42).toLocaleString('tr-TR')} ₺`;
            valInce.textContent = `${(totalCost * 0.28).toLocaleString('tr-TR')} ₺`;
            valTesisat.textContent = `${(totalCost * 0.20).toLocaleString('tr-TR')} ₺`;
            valDis.textContent = `${(totalCost * 0.10).toLocaleString('tr-TR')} ₺`;
        };

        projectSelect.onchange = () => {
            const selectedId = projectSelect.value;
            if (!selectedId) {
                inputProjeAd.value = '';
                inputProjeAdres.value = '';
                txtProjeAciklama.value = '';
                updatePreviewValues(null);
                return;
            }

            const p = projects.find(item => item.id.toString() === selectedId.toString());
            if (p) {
                inputProjeAd.value = p.name;
                inputProjeAdres.value = p.location || '';
                txtProjeAciklama.value = `${p.type} - ${p.area} m², ${p.floors || 2} Kat`;
                updatePreviewValues(p);
            }
        };

        // Form Inputs event listeners to update right column titles
        inputProjeAd.oninput = () => {
            txtProjectSub.textContent = `Proje: ${inputProjeAd.value || 'Belirtilmedi'}`;
        };

        // Demo Data Button Action
        document.getElementById('btnLoadReportDemo').onclick = () => {
            document.getElementById('reportMusteriAd').value = 'Hakan Demir';
            document.getElementById('reportMusteriTel').value = '0533 999 88 77';
            document.getElementById('reportMusteriEmail').value = 'hakan.demir@demirholding.com';
            
            inputProjeAd.value = 'Marmara Plaza Restorasyon';
            inputProjeAdres.value = 'Kadıköy, İstanbul';
            txtProjeAciklama.value = 'Eski Eser Restorasyon ve Güçlendirme';
            
            valCost.textContent = '28.400.000 ₺';
            valPerSqm.textContent = '48.000 ₺/m²';
            valArea.textContent = '600 m²';
            valFloors.textContent = '4';
            txtProjectSub.textContent = 'Proje: Marmara Plaza Restorasyon';

            labelMaterial.textContent = '17.040.000 ₺ (%60)';
            labelLabor.textContent = '8.520.000 ₺ (%30)';
            labelEquipment.textContent = '2.840.000 ₺ (%10)';

            pbM.style.width = '60%';
            pbL.style.width = '30%';
            pbE.style.width = '10%';

            valKaba.textContent = '11.360.000 ₺';
            valInce.textContent = '8.520.000 ₺';
            valTesisat.textContent = '5.680.000 ₺';
            valDis.textContent = '2.840.000 ₺';

            window.BrenerApp.showToast('success', 'Müşteri raporu için demo veriler yüklendi.');
        };

        // Download PDF simulation
        document.getElementById('btnDownloadReportPdf').onclick = () => {
            window.BrenerApp.showToast('success', 'Müşteri Tahmin Raporu PDF formatında başarıyla indirildi!');
        };
    },

    renderMalikRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Malik Raporu', 'Projelerin İlerlemesi ve Malik Bilgilendirme Raporu');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        let html = `
            <style>
                .progress-ring {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                }
                .progress-ring svg {
                    transform: rotate(-90deg);
                }
                .progress-ring-circle {
                    transition: stroke-dashoffset 0.35s;
                    transform-origin: 50% 50%;
                }
                .photo-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-top: 10px;
                }
                .photo-thumb {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    height: 80px;
                    overflow: hidden;
                    position: relative;
                    cursor: pointer;
                }
                .photo-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .photo-thumb .photo-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    font-size: 0.62rem;
                    text-align: center;
                    padding: 3px 0;
                }
                .preview-phone {
                    background: var(--bg-card);
                    border: 12px solid #222;
                    border-radius: 36px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
                    max-width: 320px;
                    margin: 0 auto;
                    overflow: hidden;
                    position: relative;
                }
                .preview-phone-screen {
                    height: 520px;
                    overflow-y: auto;
                    padding: 16px;
                    font-size: 0.85rem;
                }
                .timeline-step {
                    display: flex;
                    gap: 12px;
                    position: relative;
                    margin-bottom: 20px;
                }
                .timeline-step::before {
                    content: "";
                    position: absolute;
                    top: 18px;
                    left: 9px;
                    bottom: -22px;
                    width: 2px;
                    background: var(--border-color);
                    z-index: 1;
                }
                .timeline-step:last-child::before {
                    display: none;
                }
                .timeline-dot {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                    font-weight: bold;
                    z-index: 2;
                }
                .timeline-dot.completed {
                    background: #10b981;
                    color: white;
                }
                .timeline-dot.active {
                    background: #3b82f6;
                    color: white;
                    box-shadow: 0 0 8px rgba(59,130,246,0.5);
                }
                .timeline-dot.pending {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid var(--border-color);
                    color: var(--text-muted);
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📋 Malik Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Mülk ve arsa sahipleri için projelerin ilerleme ve fotoğraf raporunu oluşturup gönderin</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Configuration Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje & İlerleme Seç -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>🏢 Proje Seç & İlerleme</h2>
                        </div>
                        <div class="form-group">
                            <label>Raporlanacak Proje</label>
                            <select id="malikProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>İlerleme Yüzdesi (%)</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="range" id="malikProgressRange" min="0" max="100" value="65" style="flex: 1;">
                                    <strong id="malikProgressVal" style="width: 40px; text-align: right; font-size: 1rem; color: var(--primary);">%65</strong>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Aktif Aşama</label>
                                <select id="malikActiveStage" style="width: 100%;">
                                    <option value="Temel İmalatı">Temel İmalatı</option>
                                    <option value="Kaba İnşaat (Betonarme)" selected>Kaba İnşaat (Betonarme)</option>
                                    <option value="Duvar İmalatları">Duvar İmalatları</option>
                                    <option value="İnce İşler (Alçı & Boya)">İnce İşler (Alçı & Boya)</option>
                                    <option value="Cephe Kaplama">Cephe Kaplama</option>
                                    <option value="Çevre Düzenleme">Çevre Düzenleme</option>
                                    <option value="Anahtar Teslim">Anahtar Teslim</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri (Malik) Bilgileri -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>👤 Malik (Müşteri) Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Adı Soyadı</label>
                            <input type="text" id="malikCustomerName" value="Mustafa Koç" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon (WhatsApp Gönderimi İçin)</label>
                                <input type="text" id="malikCustomerPhone" value="05321112233" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-Posta</label>
                                <input type="email" id="malikCustomerEmail" value="mustafa.koc@gmail.com" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mühendis Rapor Notu (Malike İletilecek)</label>
                            <textarea id="malikReportNotes" rows="3" style="width: 100%;">Değerli mülk sahibimiz, projemizin betonarme karkas imalatları başarıyla tamamlanmış olup ince işler aşamasına geçilmiştir. Güncel durum fotoğraflarını aşağıdan inceleyebilirsiniz.</textarea>
                        </div>
                    </div>

                    <!-- Şantiye Fotoğrafları -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 8px;">
                            <h2>📷 Güncel İlerleme Fotoğrafları</h2>
                        </div>
                        <p style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 12px;">Raporda görüntülenecek 3 adet şantiye fotoğrafı seçin veya yeni yükleyin</p>
                        
                        <div class="photo-grid">
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Temel Demiri</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Kolon Betonu</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Duvar İmalatı</div>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 12px;">➕ Yeni Fotoğraf Ekle</button>
                    </div>

                    <!-- Gönderim Kanalları -->
                    <div class="card" style="border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.02);">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>📤 Raporu Malik'e Gönder</h2>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn" id="btnSendReportWhatsapp" style="flex: 1; background: #25d366; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);">
                                💬 WhatsApp ile Gönder
                            </button>
                            <button class="btn" id="btnSendReportEmail" style="flex: 1; background: #3b82f6; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);">
                                📧 E-Posta ile Gönder
                            </button>
                        </div>
                    </div>

                </div>

                <!-- Right Live Mobile Preview Column -->
                <div>
                    <h3 style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">📱 Malik Canlı Rapor Görünümü</h3>
                    
                    <!-- Mobile Mockup -->
                    <div class="preview-phone">
                        <div class="preview-phone-screen">
                            
                            <!-- Phone Top Bar -->
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px;">
                                <strong style="color: var(--primary);">BRENER GROUP</strong>
                                <span class="badge badge-success" style="font-size: 0.65rem;">İlerleme Raporu</span>
                            </div>

                            <!-- Project Title -->
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h4 style="font-size: 1.05rem; font-weight: 800; margin: 0;" id="phoneProjectName">Örnek Villa Projesi</h4>
                                <span style="font-size: 0.7rem; color: var(--text-muted);" id="phoneProjectAddr">Bodrum, Muğla</span>
                            </div>

                            <!-- Circular Progress Ring -->
                            <div class="progress-ring">
                                <svg width="120" height="120">
                                    <circle stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="transparent" r="52" cx="60" cy="60"></circle>
                                    <circle class="progress-ring-circle" id="phoneProgressCircle" stroke="#10b981" stroke-width="8" fill="transparent" r="52" cx="60" cy="60" stroke-dasharray="326.7" stroke-dashoffset="114.3"></circle>
                                </svg>
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <strong id="phoneProgressText" style="font-size: 1.35rem; font-weight: bold; color: white;">%65</strong>
                                    <span style="font-size: 0.6rem; color: var(--text-muted);">Tamamlandı</span>
                                </div>
                            </div>

                            <!-- Active Phase details -->
                            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Aktif İnşaat Aşaması</div>
                                <strong id="phoneActiveStageText" style="font-size: 0.85rem; color: #10b981; display: block; margin-top: 4px;">Kaba İnşaat (Betonarme)</strong>
                            </div>

                            <!-- Timeline -->
                            <div style="margin-bottom: 24px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 12px;">📋 İnşaat Aşamaları</h5>
                                
                                <div class="timeline-step">
                                    <div class="timeline-dot completed">✓</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;">Temel İmalatı</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">%100 Tamamlandı</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot active" id="tlDotActive">▶</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;" id="tlActiveText">Kaba İnşaat (Betonarme)</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);" id="tlActivePercent">Devam ediyor</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot pending"></div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block; opacity: 0.6;">İnce İmalatlar & Cephe</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">Başlamadı</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Engineer Notes -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-bottom: 20px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 6px;">✍️ Mühendis Notu</h5>
                                <p style="font-size: 0.74rem; color: var(--text-main); line-height: 1.4; margin: 0; background: rgba(255,255,255,0.01); padding: 8px; border-radius: 6px; border-left: 3px solid #10b981;" id="phoneNotesText">
                                    Değerli mülk sahibimiz, projemizin kaba inşaat demir ve beton dökümleri tamamlanmış olup duvar örme aşamasına başlanacaktır.
                                </p>
                            </div>

                            <!-- Photos -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 10px;">📸 Güncel Fotoğraflar</h5>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // Interactive logic elements references
        const selectProj = document.getElementById('malikProjectSelect');
        const progressRange = document.getElementById('malikProgressRange');
        const progressVal = document.getElementById('malikProgressVal');
        const activeStage = document.getElementById('malikActiveStage');
        const inputCustName = document.getElementById('malikCustomerName');
        const inputCustPhone = document.getElementById('malikCustomerPhone');
        const inputCustEmail = document.getElementById('malikCustomerEmail');
        const txtNotes = document.getElementById('malikReportNotes');

        const phoneProjName = document.getElementById('phoneProjectName');
        const phoneProjAddr = document.getElementById('phoneProjectAddr');
        const phoneProgressText = document.getElementById('phoneProgressText');
        const phoneProgressCircle = document.getElementById('phoneProgressCircle');
        const phoneActiveStageText = document.getElementById('phoneActiveStageText');
        const phoneNotesText = document.getElementById('phoneNotesText');
        const tlActiveText = document.getElementById('tlActiveText');
        const tlActivePercent = document.getElementById('tlActivePercent');

        // Circle calculation variables
        const radius = 52;
        const circumference = 2 * Math.PI * radius; // 326.72

        const updateCircleProgress = (percent) => {
            const offset = circumference - (percent / 100 * circumference);
            phoneProgressCircle.style.strokeDashoffset = offset;
            phoneProgressText.textContent = `%${percent}`;
            progressVal.textContent = `%${percent}`;
            tlActivePercent.textContent = `%${percent} seviyesinde`;
        };

        // Event Listeners
        progressRange.oninput = () => {
            updateCircleProgress(progressRange.value);
        };

        activeStage.onchange = () => {
            const val = activeStage.value;
            phoneActiveStageText.textContent = val;
            tlActiveText.textContent = val;
        };

        txtNotes.oninput = () => {
            phoneNotesText.textContent = txtNotes.value || 'Not girilmedi.';
        };

        selectProj.onchange = () => {
            const selId = selectProj.value;
            if (!selId) return;
            const p = projects.find(item => item.id.toString() === selId.toString());
            if (p) {
                phoneProjName.textContent = p.name;
                phoneProjAddr.textContent = p.location || 'Şantiye Alanı';
                
                // Adjust default progress based on actual project progress if it exists
                const progressNum = p.progress ? parseInt(p.progress.replace('%','')) : 45;
                progressRange.value = progressNum;
                updateCircleProgress(progressNum);
            }
        };

        // Initialize progress
        updateCircleProgress(65);

        // Send WhatsApp Action
        document.getElementById('btnSendReportWhatsapp').onclick = () => {
            const custName = inputCustName.value.trim();
            const custPhone = inputCustPhone.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;

            if (!custName || !custPhone) {
                alert('Lütfen malik adı ve telefon numarasını doldurun!');
                return;
            }

            const message = `Sayın ${custName}, ${projName} inşaatımızda güncel ilerleme seviyesi %${progress} oranına ulaşmıştır. Aktif aşama: ${stage}. Detayları incelemek için rapor linkiniz: http://brener.com.tr/rapor/malik-382a`;
            const encodedMsg = encodeURIComponent(message);
            const waUrl = `https://api.whatsapp.com/send?phone=${custPhone}&text=${encodedMsg}`;

            window.BrenerApp.showToast('success', `${custName} adlı malike WhatsApp rapor taslağı oluşturuldu. WhatsApp Web/Uygulaması açılıyor.`);
            window.BrenerApp.logActivity('santiye', `${custName} malikine WhatsApp ilerleme raporu gönderildi: %${progress}`, 'success', message);
            
            setTimeout(() => {
                window.open(waUrl, '_blank');
            }, 1000);
        };

        // Send Email Action
        document.getElementById('btnSendReportEmail').onclick = () => {
            const custName = inputCustName.value.trim();
            const custEmail = inputCustEmail.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;
            const notes = txtNotes.value.trim();

            if (!custName || !custEmail) {
                alert('Lütfen malik adı ve e-posta adresini doldurun!');
                return;
            }

            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 500px; border: 1px solid #ddd; border-radius: 12px; padding: 24px; background: #fff; color: #333;">
                    <h3 style="color: #10b981; margin-top: 0;">BRENER GROUP - İlerleyiş Raporu</h3>
                    <p>Sayın <strong>${custName}</strong>,</p>
                    <p><strong>${projName}</strong> projesine ait güncel ilerleme ve saha durumu bilgileri aşağıdaki gibidir:</p>
                    <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin: 16px 0;">
                        <strong>İlerleme Seviyesi:</strong> %${progress} tamamlandı<br>
                        <strong>Aktif Aşama:</strong> ${stage}
                    </div>
                    <p><strong>Mühendis Notu:</strong><br>${notes}</p>
                    <p style="font-size: 0.85rem; color: #666;">Güncel fotoğraflar ve detaylar rapora eklenmiştir.</p>
                </div>
            `;

            const modalHtml = `
                <div style="padding: 16px;">
                    <div class="form-group">
                        <label>Alıcı</label>
                        <input type="text" value="${custEmail}" disabled style="width:100%; opacity:0.6;">
                    </div>
                    <div class="form-group">
                        <label>E-Posta Şablon Önizleme</label>
                        <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: rgba(255,255,255,0.02); max-height: 250px; overflow-y: auto;">
                            ${emailHtml}
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; margin-top:20px; justify-content:flex-end;">
                        <button class="btn btn-secondary" onclick="window.BrenerApp.closeModal()">Kapat</button>
                        <button class="btn btn-primary" id="btnConfirmSendEmail" style="background:#10b981; border:none; color:white;">E-Postayı Gönder</button>
                    </div>
                </div>
            `;

            window.BrenerApp.openModal('📧 Malik E-Posta Gönderim Taslağı', modalHtml);

            document.getElementById('btnConfirmSendEmail').onclick = () => {
                window.BrenerApp.closeModal();
                window.BrenerApp.showToast('success', `${custName} malikine bilgilendirme e-postası başarıyla gönderildi.`);
                window.BrenerApp.logActivity('santiye', `${custName} malikine e-posta ilerleme raporu gönderildi`, 'success', `Alıcı: ${custEmail}, İlerleme: %${progress}`);
            };
        };

    },
    
    renderMusteriRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Müşteri Raporu', 'Profesyonel maliyet tahmin raporu oluşturun');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        // State definition for selected colors and values
        let selectedReportType = 'Detaylı Rapor';
        let currentThemeColor = '#3b82f6'; // Default Blue

        let html = `
            <style>
                .report-type-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .report-type-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                }
                .report-type-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
                .report-type-card.selected {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.04);
                }
                .report-type-card.selected::before {
                    content: "✔";
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #3b82f6;
                    color: white;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                }
                .theme-circle {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                }
                .theme-circle.selected {
                    border-color: #fff;
                    transform: scale(1.15);
                    box-shadow: 0 0 8px rgba(255,255,255,0.4);
                }
                .preview-stat-card {
                    background: var(--primary);
                    color: #000;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    margin-bottom: 20px;
                    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.15);
                    transition: all 0.3s;
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📄 Müşteri Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Profesyonel maliyet tahmin raporu oluşturun</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-sm" id="btnLoadReportDemo" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px; padding: 8px 16px; font-weight: 600;">Demo Veri</button>
                    <button class="btn btn-sm" id="btnDownloadReportPdf" style="background: white; border: none; color: #3b82f6; border-radius: 6px; padding: 8px 16px; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">📥 PDF İndir</button>
                </div>
            </div>

            <!-- Report Type Grid Selection -->
            <div class="report-type-grid">
                <div class="report-type-card selected" data-type="Detaylı Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                    <strong style="display: block; font-size: 0.9rem;">Detaylı Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Tüm iş kalemleri, kategori tabloları</span>
                </div>
                <div class="report-type-card" data-type="Özet Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📷</div>
                    <strong style="display: block; font-size: 0.9rem;">Özet Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Kategori özetleri, metraj bilgileri</span>
                </div>
                <div class="report-type-card" data-type="Yönetici Raporu">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📑</div>
                    <strong style="display: block; font-size: 0.9rem;">Yönetici Raporu</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Sadece toplam ve dağılım</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Forms Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje Seç Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 12px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📂 Proje Seç</h2>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mevcut bir projeden maliyet verisi yükle</label>
                            <select id="reportProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Firma Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">🏢 Firma Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Firma Adı</label>
                                <input type="text" id="reportFirmaAd" value="Brener" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Firma Logosu</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <div style="width: 80px; height: 38px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: var(--text-muted);">Logo Yok</div>
                                    <button class="btn btn-secondary btn-sm" style="padding: 10px 14px;">⚡ Yükle</button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group" style="margin-top: 10px; margin-bottom: 0;">
                            <label>Renk Teması</label>
                            <div style="display: flex; gap: 10px;">
                                <div class="theme-circle selected" data-color="#3b82f6" style="background: #3b82f6;"></div>
                                <div class="theme-circle" data-color="#10b981" style="background: #10b981;"></div>
                                <div class="theme-circle" data-color="#f97316" style="background: #f97316;"></div>
                                <div class="theme-circle" data-color="#8b5cf6" style="background: #8b5cf6;"></div>
                                <div class="theme-circle" data-color="#4b5563" style="background: #4b5563;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">👤 Müşteri Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Ad Soyad</label>
                            <input type="text" id="reportMusteriAd" placeholder="Müşteri adı soyadı" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon</label>
                                <input type="text" id="reportMusteriTel" placeholder="0532 xxx xx xx" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-posta</label>
                                <input type="email" id="reportMusteriEmail" placeholder="ornek@email.com" style="width: 100%;">
                            </div>
                        </div>
                    </div>

                    <!-- Proje Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📍 Proje Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Proje Adı</label>
                                <input type="text" id="reportProjeAd" value="${activeProj ? activeProj.name : 'Örnek Villa Projesi'}" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Proje Adresi</label>
                                <input type="text" id="reportProjeAdres" value="${activeProj ? activeProj.location : ''}" placeholder="Proje adresi" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Açıklama</label>
                            <textarea id="reportProjeAciklama" rows="2" style="width: 100%;">${activeProj ? `${activeProj.type} - ${activeProj.blocks || 1} Blok` : 'Konut - 3 kat, 150 m²'}</textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Notlar (Rapora eklenecek)</label>
                            <textarea id="reportProjeNotlar" rows="2" placeholder="Müşteriye iletilecek özel notlar" style="width: 100%;"></textarea>
                        </div>
                    </div>

                </div>

                <!-- Right Preview Column -->
                <div>
                    <div class="card" style="padding: 24px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 20px;">
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
                            <span>Seçili Rapor:</span>
                            <span id="previewReportTypeLabel" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-weight: bold;">📝 Detaylı Rapor</span>
                        </div>

                        <!-- Big Cost Stat Card -->
                        <div class="preview-stat-card" id="reportCostStatCard" style="background: #3b82f6; color: white;">
                            <div style="font-size: 0.85rem; opacity: 0.95; font-weight: 500;">Tahmini Toplam Maliyet</div>
                            <div style="font-size: 1.85rem; font-weight: 800; margin: 8px 0;" id="previewTotalCostVal">15.750.000 ₺</div>
                            <div style="font-size: 0.82rem; opacity: 0.9;" id="previewPerSqmVal">35.000 ₺/m²</div>
                        </div>

                        <!-- Three Sub-stats -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Brüt Alan</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewAreaVal">450 m²</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Kat Sayısı</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewFloorsVal">3</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">İş Kalemi</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;">11</strong>
                            </div>
                        </div>
                        <div style="text-align: center; font-size: 0.76rem; color: var(--text-muted);" id="previewProjectSub">
                            Proje: Örnek Villa Projesi
                        </div>

                        <!-- Maliyet Dağılımı (Progress Bars) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">📊 Maliyet Dağılımı</h3>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>🔨 Malzeme</span>
                                    <strong id="previewMaterialCost">9.450.000 ₺ (%60)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbMaterial" style="width: 60%; background: #3b82f6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>👤 İşçilik</span>
                                    <strong id="previewLaborCost">4.725.000 ₺ (%30)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbLabor" style="width: 30%; background: #f97316; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>📦 Ekipman</span>
                                    <strong id="previewEquipmentCost">1.575.000 ₺ (%10)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbEquipment" style="width: 10%; background: #8b5cf6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Kategori Dağılımı (SVG Donut Chart) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">🍩 Kategori Dağılımı</h3>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
                                <!-- SVG Donut -->
                                <svg width="100" height="100" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4.2"></circle>
                                    
                                    <!-- Kaba Insaat - 40% (stroke-dasharray: 40 60) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" stroke-width="4.2" stroke-dasharray="40 60" stroke-dashoffset="25"></circle>
                                    
                                    <!-- Ince Insaat - 30% (stroke-dasharray: 30 70) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" stroke-width="4.2" stroke-dasharray="30 70" stroke-dashoffset="85"></circle>
                                    
                                    <!-- Tesisat - 20% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" stroke-width="4.2" stroke-dasharray="20 80" stroke-dashoffset="115"></circle>
                                    
                                    <!-- Dis Cephe - 10% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" stroke-width="4.2" stroke-dasharray="10 90" stroke-dashoffset="135"></circle>
                                </svg>
                                <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem;">
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 2px;"></span> Kaba İnşaat (40%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> İnce İnşaat (30%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #f97316; border-radius: 2px;"></span> Tesisat (20%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></span> Dış Cephe (10%)</div>
                                </div>
                            </div>
                        </div>

                        <!-- İş Kalemleri Detayı (Accordion List) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">📝 İş Kalemleri Detayı</h3>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Kaba İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valKaba">6.300.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>İnce İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valInce">4.725.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(249, 115, 22, 0.15); color: #f97316; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Tesisat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valTesisat">3.150.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">2</span>
                                        <strong>Dış Cephe</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valDis">1.575.000 ₺</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // UI Element Event Handlers
        const reportCards = container.querySelectorAll('.report-type-card');
        const previewTypeLabel = document.getElementById('previewReportTypeLabel');

        reportCards.forEach(card => {
            card.onclick = () => {
                reportCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedReportType = card.getAttribute('data-type');
                previewTypeLabel.textContent = `📝 ${selectedReportType}`;
            };
        });

        // Theme Circles Click Event
        const themeCircles = container.querySelectorAll('.theme-circle');
        const costCard = document.getElementById('reportCostStatCard');

        themeCircles.forEach(circle => {
            circle.onclick = () => {
                themeCircles.forEach(c => c.classList.remove('selected'));
                circle.classList.add('selected');
                currentThemeColor = circle.getAttribute('data-color');
                costCard.style.background = currentThemeColor;
            };
        });

        // Dynamic project selection calculations
        const projectSelect = document.getElementById('reportProjectSelect');
        const inputProjeAd = document.getElementById('reportProjeAd');
        const inputProjeAdres = document.getElementById('reportProjeAdres');
        const txtProjeAciklama = document.getElementById('reportProjeAciklama');

        const valCost = document.getElementById('previewTotalCostVal');
        const valPerSqm = document.getElementById('previewPerSqmVal');
        const valArea = document.getElementById('previewAreaVal');
        const valFloors = document.getElementById('previewFloorsVal');
        const txtProjectSub = document.getElementById('previewProjectSub');

        const labelMaterial = document.getElementById('previewMaterialCost');
        const labelLabor = document.getElementById('previewLaborCost');
        const labelEquipment = document.getElementById('previewEquipmentCost');

        const pbM = document.getElementById('pbMaterial');
        const pbL = document.getElementById('pbLabor');
        const pbE = document.getElementById('pbEquipment');

        const valKaba = document.getElementById('valKaba');
        const valInce = document.getElementById('valInce');
        const valTesisat = document.getElementById('valTesisat');
        const valDis = document.getElementById('valDis');

        const updatePreviewValues = (projectData) => {
            if (!projectData) {
                // Set default/villa project values
                valCost.textContent = '15.750.000 ₺';
                valPerSqm.textContent = '35.000 ₺/m²';
                valArea.textContent = '450 m²';
                valFloors.textContent = '3';
                txtProjectSub.textContent = 'Proje: Örnek Villa Projesi';

                labelMaterial.textContent = '9.450.000 ₺ (%60)';
                labelLabor.textContent = '4.725.000 ₺ (%30)';
                labelEquipment.textContent = '1.575.000 ₺ (%10)';

                pbM.style.width = '60%';
                pbL.style.width = '30%';
                pbE.style.width = '10%';

                valKaba.textContent = '6.300.000 ₺';
                valInce.textContent = '4.725.000 ₺';
                valTesisat.textContent = '3.150.000 ₺';
                valDis.textContent = '1.575.000 ₺';
                return;
            }

            // Estimate total cost based on square meters
            const area = parseInt(projectData.area) || 300;
            const floors = parseInt(projectData.floors) || 2;
            const multiplier = projectData.type === 'Villa' ? 42000 : projectData.type === 'Apartman' ? 32000 : 25000;
            const totalCost = area * multiplier;

            // Formatted values
            valCost.textContent = `${totalCost.toLocaleString('tr-TR')} ₺`;
            valPerSqm.textContent = `${multiplier.toLocaleString('tr-TR')} ₺/m²`;
            valArea.textContent = `${area} m²`;
            valFloors.textContent = floors;
            txtProjectSub.textContent = `Proje: ${projectData.name}`;

            // Cost breakdowns
            const material = totalCost * 0.58;
            const labor = totalCost * 0.32;
            const equip = totalCost * 0.10;

            labelMaterial.textContent = `${material.toLocaleString('tr-TR')} ₺ (%58)`;
            labelLabor.textContent = `${labor.toLocaleString('tr-TR')} ₺ (%32)`;
            labelEquipment.textContent = `${equip.toLocaleString('tr-TR')} ₺ (%10)`;

            pbM.style.width = '58%';
            pbL.style.width = '32%';
            pbE.style.width = '10%';

            // Categories breakdowns
            valKaba.textContent = `${(totalCost * 0.42).toLocaleString('tr-TR')} ₺`;
            valInce.textContent = `${(totalCost * 0.28).toLocaleString('tr-TR')} ₺`;
            valTesisat.textContent = `${(totalCost * 0.20).toLocaleString('tr-TR')} ₺`;
            valDis.textContent = `${(totalCost * 0.10).toLocaleString('tr-TR')} ₺`;
        };

        projectSelect.onchange = () => {
            const selectedId = projectSelect.value;
            if (!selectedId) {
                inputProjeAd.value = '';
                inputProjeAdres.value = '';
                txtProjeAciklama.value = '';
                updatePreviewValues(null);
                return;
            }

            const p = projects.find(item => item.id.toString() === selectedId.toString());
            if (p) {
                inputProjeAd.value = p.name;
                inputProjeAdres.value = p.location || '';
                txtProjeAciklama.value = `${p.type} - ${p.area} m², ${p.floors || 2} Kat`;
                updatePreviewValues(p);
            }
        };

        // Form Inputs event listeners to update right column titles
        inputProjeAd.oninput = () => {
            txtProjectSub.textContent = `Proje: ${inputProjeAd.value || 'Belirtilmedi'}`;
        };

        // Demo Data Button Action
        document.getElementById('btnLoadReportDemo').onclick = () => {
            document.getElementById('reportMusteriAd').value = 'Hakan Demir';
            document.getElementById('reportMusteriTel').value = '0533 999 88 77';
            document.getElementById('reportMusteriEmail').value = 'hakan.demir@demirholding.com';
            
            inputProjeAd.value = 'Marmara Plaza Restorasyon';
            inputProjeAdres.value = 'Kadıköy, İstanbul';
            txtProjeAciklama.value = 'Eski Eser Restorasyon ve Güçlendirme';
            
            valCost.textContent = '28.400.000 ₺';
            valPerSqm.textContent = '48.000 ₺/m²';
            valArea.textContent = '600 m²';
            valFloors.textContent = '4';
            txtProjectSub.textContent = 'Proje: Marmara Plaza Restorasyon';

            labelMaterial.textContent = '17.040.000 ₺ (%60)';
            labelLabor.textContent = '8.520.000 ₺ (%30)';
            labelEquipment.textContent = '2.840.000 ₺ (%10)';

            pbM.style.width = '60%';
            pbL.style.width = '30%';
            pbE.style.width = '10%';

            valKaba.textContent = '11.360.000 ₺';
            valInce.textContent = '8.520.000 ₺';
            valTesisat.textContent = '5.680.000 ₺';
            valDis.textContent = '2.840.000 ₺';

            window.BrenerApp.showToast('success', 'Müşteri raporu için demo veriler yüklendi.');
        };

        // Download PDF simulation
        document.getElementById('btnDownloadReportPdf').onclick = () => {
            window.BrenerApp.showToast('success', 'Müşteri Tahmin Raporu PDF formatında başarıyla indirildi!');
        };
    },

    renderMalikRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Malik Raporu', 'Projelerin İlerlemesi ve Malik Bilgilendirme Raporu');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        let html = `
            <style>
                .progress-ring {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                }
                .progress-ring svg {
                    transform: rotate(-90deg);
                }
                .progress-ring-circle {
                    transition: stroke-dashoffset 0.35s;
                    transform-origin: 50% 50%;
                }
                .photo-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-top: 10px;
                }
                .photo-thumb {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    height: 80px;
                    overflow: hidden;
                    position: relative;
                    cursor: pointer;
                }
                .photo-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .photo-thumb .photo-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    font-size: 0.62rem;
                    text-align: center;
                    padding: 3px 0;
                }
                .preview-phone {
                    background: var(--bg-card);
                    border: 12px solid #222;
                    border-radius: 36px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
                    max-width: 320px;
                    margin: 0 auto;
                    overflow: hidden;
                    position: relative;
                }
                .preview-phone-screen {
                    height: 520px;
                    overflow-y: auto;
                    padding: 16px;
                    font-size: 0.85rem;
                }
                .timeline-step {
                    display: flex;
                    gap: 12px;
                    position: relative;
                    margin-bottom: 20px;
                }
                .timeline-step::before {
                    content: "";
                    position: absolute;
                    top: 18px;
                    left: 9px;
                    bottom: -22px;
                    width: 2px;
                    background: var(--border-color);
                    z-index: 1;
                }
                .timeline-step:last-child::before {
                    display: none;
                }
                .timeline-dot {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                    font-weight: bold;
                    z-index: 2;
                }
                .timeline-dot.completed {
                    background: #10b981;
                    color: white;
                }
                .timeline-dot.active {
                    background: #3b82f6;
                    color: white;
                    box-shadow: 0 0 8px rgba(59,130,246,0.5);
                }
                .timeline-dot.pending {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid var(--border-color);
                    color: var(--text-muted);
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📋 Malik Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Mülk ve arsa sahipleri için projelerin ilerleme ve fotoğraf raporunu oluşturup gönderin</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Configuration Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje & İlerleme Seç -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>🏢 Proje Seç & İlerleme</h2>
                        </div>
                        <div class="form-group">
                            <label>Raporlanacak Proje</label>
                            <select id="malikProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>İlerleme Yüzdesi (%)</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="range" id="malikProgressRange" min="0" max="100" value="65" style="flex: 1;">
                                    <strong id="malikProgressVal" style="width: 40px; text-align: right; font-size: 1rem; color: var(--primary);">%65</strong>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Aktif Aşama</label>
                                <select id="malikActiveStage" style="width: 100%;">
                                    <option value="Temel İmalatı">Temel İmalatı</option>
                                    <option value="Kaba İnşaat (Betonarme)" selected>Kaba İnşaat (Betonarme)</option>
                                    <option value="Duvar İmalatları">Duvar İmalatları</option>
                                    <option value="İnce İşler (Alçı & Boya)">İnce İşler (Alçı & Boya)</option>
                                    <option value="Cephe Kaplama">Cephe Kaplama</option>
                                    <option value="Çevre Düzenleme">Çevre Düzenleme</option>
                                    <option value="Anahtar Teslim">Anahtar Teslim</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri (Malik) Bilgileri -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>👤 Malik (Müşteri) Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Adı Soyadı</label>
                            <input type="text" id="malikCustomerName" value="Mustafa Koç" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon (WhatsApp Gönderimi İçin)</label>
                                <input type="text" id="malikCustomerPhone" value="05321112233" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-Posta</label>
                                <input type="email" id="malikCustomerEmail" value="mustafa.koc@gmail.com" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mühendis Rapor Notu (Malike İletilecek)</label>
                            <textarea id="malikReportNotes" rows="3" style="width: 100%;">Değerli mülk sahibimiz, projemizin betonarme karkas imalatları başarıyla tamamlanmış olup ince işler aşamasına geçilmiştir. Güncel durum fotoğraflarını aşağıdan inceleyebilirsiniz.</textarea>
                        </div>
                    </div>

                    <!-- Şantiye Fotoğrafları -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 8px;">
                            <h2>📷 Güncel İlerleme Fotoğrafları</h2>
                        </div>
                        <p style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 12px;">Raporda görüntülenecek 3 adet şantiye fotoğrafı seçin veya yeni yükleyin</p>
                        
                        <div class="photo-grid">
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Temel Demiri</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Kolon Betonu</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Duvar İmalatı</div>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 12px;">➕ Yeni Fotoğraf Ekle</button>
                    </div>

                    <!-- Gönderim Kanalları -->
                    <div class="card" style="border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.02);">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>📤 Raporu Malik'e Gönder</h2>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn" id="btnSendReportWhatsapp" style="flex: 1; background: #25d366; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);">
                                💬 WhatsApp ile Gönder
                            </button>
                            <button class="btn" id="btnSendReportEmail" style="flex: 1; background: #3b82f6; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);">
                                📧 E-Posta ile Gönder
                            </button>
                        </div>
                    </div>

                </div>

                <!-- Right Live Mobile Preview Column -->
                <div>
                    <h3 style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">📱 Malik Canlı Rapor Görünümü</h3>
                    
                    <!-- Mobile Mockup -->
                    <div class="preview-phone">
                        <div class="preview-phone-screen">
                            
                            <!-- Phone Top Bar -->
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px;">
                                <strong style="color: var(--primary);">BRENER GROUP</strong>
                                <span class="badge badge-success" style="font-size: 0.65rem;">İlerleme Raporu</span>
                            </div>

                            <!-- Project Title -->
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h4 style="font-size: 1.05rem; font-weight: 800; margin: 0;" id="phoneProjectName">Örnek Villa Projesi</h4>
                                <span style="font-size: 0.7rem; color: var(--text-muted);" id="phoneProjectAddr">Bodrum, Muğla</span>
                            </div>

                            <!-- Circular Progress Ring -->
                            <div class="progress-ring">
                                <svg width="120" height="120">
                                    <circle stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="transparent" r="52" cx="60" cy="60"></circle>
                                    <circle class="progress-ring-circle" id="phoneProgressCircle" stroke="#10b981" stroke-width="8" fill="transparent" r="52" cx="60" cy="60" stroke-dasharray="326.7" stroke-dashoffset="114.3"></circle>
                                </svg>
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <strong id="phoneProgressText" style="font-size: 1.35rem; font-weight: bold; color: white;">%65</strong>
                                    <span style="font-size: 0.6rem; color: var(--text-muted);">Tamamlandı</span>
                                </div>
                            </div>

                            <!-- Active Phase details -->
                            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Aktif İnşaat Aşaması</div>
                                <strong id="phoneActiveStageText" style="font-size: 0.85rem; color: #10b981; display: block; margin-top: 4px;">Kaba İnşaat (Betonarme)</strong>
                            </div>

                            <!-- Timeline -->
                            <div style="margin-bottom: 24px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 12px;">📋 İnşaat Aşamaları</h5>
                                
                                <div class="timeline-step">
                                    <div class="timeline-dot completed">✓</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;">Temel İmalatı</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">%100 Tamamlandı</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot active" id="tlDotActive">▶</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;" id="tlActiveText">Kaba İnşaat (Betonarme)</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);" id="tlActivePercent">Devam ediyor</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot pending"></div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block; opacity: 0.6;">İnce İmalatlar & Cephe</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">Başlamadı</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Engineer Notes -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-bottom: 20px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 6px;">✍️ Mühendis Notu</h5>
                                <p style="font-size: 0.74rem; color: var(--text-main); line-height: 1.4; margin: 0; background: rgba(255,255,255,0.01); padding: 8px; border-radius: 6px; border-left: 3px solid #10b981;" id="phoneNotesText">
                                    Değerli mülk sahibimiz, projemizin kaba inşaat demir ve beton dökümleri tamamlanmış olup duvar örme aşamasına başlanacaktır.
                                </p>
                            </div>

                            <!-- Photos -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 10px;">📸 Güncel Fotoğraflar</h5>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // Interactive logic elements references
        const selectProj = document.getElementById('malikProjectSelect');
        const progressRange = document.getElementById('malikProgressRange');
        const progressVal = document.getElementById('malikProgressVal');
        const activeStage = document.getElementById('malikActiveStage');
        const inputCustName = document.getElementById('malikCustomerName');
        const inputCustPhone = document.getElementById('malikCustomerPhone');
        const inputCustEmail = document.getElementById('malikCustomerEmail');
        const txtNotes = document.getElementById('malikReportNotes');

        const phoneProjName = document.getElementById('phoneProjectName');
        const phoneProjAddr = document.getElementById('phoneProjectAddr');
        const phoneProgressText = document.getElementById('phoneProgressText');
        const phoneProgressCircle = document.getElementById('phoneProgressCircle');
        const phoneActiveStageText = document.getElementById('phoneActiveStageText');
        const phoneNotesText = document.getElementById('phoneNotesText');
        const tlActiveText = document.getElementById('tlActiveText');
        const tlActivePercent = document.getElementById('tlActivePercent');

        // Circle calculation variables
        const radius = 52;
        const circumference = 2 * Math.PI * radius; // 326.72

        const updateCircleProgress = (percent) => {
            const offset = circumference - (percent / 100 * circumference);
            phoneProgressCircle.style.strokeDashoffset = offset;
            phoneProgressText.textContent = `%${percent}`;
            progressVal.textContent = `%${percent}`;
            tlActivePercent.textContent = `%${percent} seviyesinde`;
        };

        // Event Listeners
        progressRange.oninput = () => {
            updateCircleProgress(progressRange.value);
        };

        activeStage.onchange = () => {
            const val = activeStage.value;
            phoneActiveStageText.textContent = val;
            tlActiveText.textContent = val;
        };

        txtNotes.oninput = () => {
            phoneNotesText.textContent = txtNotes.value || 'Not girilmedi.';
        };

        selectProj.onchange = () => {
            const selId = selectProj.value;
            if (!selId) return;
            const p = projects.find(item => item.id.toString() === selId.toString());
            if (p) {
                phoneProjName.textContent = p.name;
                phoneProjAddr.textContent = p.location || 'Şantiye Alanı';
                
                // Adjust default progress based on actual project progress if it exists
                const progressNum = p.progress ? parseInt(p.progress.replace('%','')) : 45;
                progressRange.value = progressNum;
                updateCircleProgress(progressNum);
            }
        };

        // Initialize progress
        updateCircleProgress(65);

        // Send WhatsApp Action
        document.getElementById('btnSendReportWhatsapp').onclick = () => {
            const custName = inputCustName.value.trim();
            const custPhone = inputCustPhone.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;

            if (!custName || !custPhone) {
                alert('Lütfen malik adı ve telefon numarasını doldurun!');
                return;
            }

            const message = `Sayın ${custName}, ${projName} inşaatımızda güncel ilerleme seviyesi %${progress} oranına ulaşmıştır. Aktif aşama: ${stage}. Detayları incelemek için rapor linkiniz: http://brener.com.tr/rapor/malik-382a`;
            const encodedMsg = encodeURIComponent(message);
            const waUrl = `https://api.whatsapp.com/send?phone=${custPhone}&text=${encodedMsg}`;

            window.BrenerApp.showToast('success', `${custName} adlı malike WhatsApp rapor taslağı oluşturuldu. WhatsApp Web/Uygulaması açılıyor.`);
            window.BrenerApp.logActivity('santiye', `${custName} malikine WhatsApp ilerleme raporu gönderildi: %${progress}`, 'success', message);
            
            setTimeout(() => {
                window.open(waUrl, '_blank');
            }, 1000);
        };

        // Send Email Action
        document.getElementById('btnSendReportEmail').onclick = () => {
            const custName = inputCustName.value.trim();
            const custEmail = inputCustEmail.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;
            const notes = txtNotes.value.trim();

            if (!custName || !custEmail) {
                alert('Lütfen malik adı ve e-posta adresini doldurun!');
                return;
            }

            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 500px; border: 1px solid #ddd; border-radius: 12px; padding: 24px; background: #fff; color: #333;">
                    <h3 style="color: #10b981; margin-top: 0;">BRENER GROUP - İlerleyiş Raporu</h3>
                    <p>Sayın <strong>${custName}</strong>,</p>
                    <p><strong>${projName}</strong> projesine ait güncel ilerleme ve saha durumu bilgileri aşağıdaki gibidir:</p>
                    <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin: 16px 0;">
                        <strong>İlerleme Seviyesi:</strong> %${progress} tamamlandı<br>
                        <strong>Aktif Aşama:</strong> ${stage}
                    </div>
                    <p><strong>Mühendis Notu:</strong><br>${notes}</p>
                    <p style="font-size: 0.85rem; color: #666;">Güncel fotoğraflar ve detaylar rapora eklenmiştir.</p>
                </div>
            `;

            const modalHtml = `
                <div style="padding: 16px;">
                    <div class="form-group">
                        <label>Alıcı</label>
                        <input type="text" value="${custEmail}" disabled style="width:100%; opacity:0.6;">
                    </div>
                    <div class="form-group">
                        <label>E-Posta Şablon Önizleme</label>
                        <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: rgba(255,255,255,0.02); max-height: 250px; overflow-y: auto;">
                            ${emailHtml}
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; margin-top:20px; justify-content:flex-end;">
                        <button class="btn btn-secondary" onclick="window.BrenerApp.closeModal()">Kapat</button>
                        <button class="btn btn-primary" id="btnConfirmSendEmail" style="background:#10b981; border:none; color:white;">E-Postayı Gönder</button>
                    </div>
                </div>
            `;

            window.BrenerApp.openModal('📧 Malik E-Posta Gönderim Taslağı', modalHtml);

            document.getElementById('btnConfirmSendEmail').onclick = () => {
                window.BrenerApp.closeModal();
                window.BrenerApp.showToast('success', `${custName} malikine bilgilendirme e-postası başarıyla gönderildi.`);
                window.BrenerApp.logActivity('santiye', `${custName} malikine e-posta ilerleme raporu gönderildi`, 'success', `Alıcı: ${custEmail}, İlerleme: %${progress}`);
            };
        };

    },
    
    renderMusteriRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Müşteri Raporu', 'Profesyonel maliyet tahmin raporu oluşturun');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        // State definition for selected colors and values
        let selectedReportType = 'Detaylı Rapor';
        let currentThemeColor = '#3b82f6'; // Default Blue

        let html = `
            <style>
                .report-type-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .report-type-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                }
                .report-type-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
                .report-type-card.selected {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.04);
                }
                .report-type-card.selected::before {
                    content: "✔";
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #3b82f6;
                    color: white;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                }
                .theme-circle {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                }
                .theme-circle.selected {
                    border-color: #fff;
                    transform: scale(1.15);
                    box-shadow: 0 0 8px rgba(255,255,255,0.4);
                }
                .preview-stat-card {
                    background: var(--primary);
                    color: #000;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    margin-bottom: 20px;
                    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.15);
                    transition: all 0.3s;
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📄 Müşteri Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Profesyonel maliyet tahmin raporu oluşturun</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-sm" id="btnLoadReportDemo" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px; padding: 8px 16px; font-weight: 600;">Demo Veri</button>
                    <button class="btn btn-sm" id="btnDownloadReportPdf" style="background: white; border: none; color: #3b82f6; border-radius: 6px; padding: 8px 16px; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">📥 PDF İndir</button>
                </div>
            </div>

            <!-- Report Type Grid Selection -->
            <div class="report-type-grid">
                <div class="report-type-card selected" data-type="Detaylı Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                    <strong style="display: block; font-size: 0.9rem;">Detaylı Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Tüm iş kalemleri, kategori tabloları</span>
                </div>
                <div class="report-type-card" data-type="Özet Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📷</div>
                    <strong style="display: block; font-size: 0.9rem;">Özet Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Kategori özetleri, metraj bilgileri</span>
                </div>
                <div class="report-type-card" data-type="Yönetici Raporu">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📑</div>
                    <strong style="display: block; font-size: 0.9rem;">Yönetici Raporu</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Sadece toplam ve dağılım</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Forms Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje Seç Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 12px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📂 Proje Seç</h2>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mevcut bir projeden maliyet verisi yükle</label>
                            <select id="reportProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Firma Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">🏢 Firma Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Firma Adı</label>
                                <input type="text" id="reportFirmaAd" value="Brener" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Firma Logosu</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <div style="width: 80px; height: 38px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: var(--text-muted);">Logo Yok</div>
                                    <button class="btn btn-secondary btn-sm" style="padding: 10px 14px;">⚡ Yükle</button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group" style="margin-top: 10px; margin-bottom: 0;">
                            <label>Renk Teması</label>
                            <div style="display: flex; gap: 10px;">
                                <div class="theme-circle selected" data-color="#3b82f6" style="background: #3b82f6;"></div>
                                <div class="theme-circle" data-color="#10b981" style="background: #10b981;"></div>
                                <div class="theme-circle" data-color="#f97316" style="background: #f97316;"></div>
                                <div class="theme-circle" data-color="#8b5cf6" style="background: #8b5cf6;"></div>
                                <div class="theme-circle" data-color="#4b5563" style="background: #4b5563;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">👤 Müşteri Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Ad Soyad</label>
                            <input type="text" id="reportMusteriAd" placeholder="Müşteri adı soyadı" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon</label>
                                <input type="text" id="reportMusteriTel" placeholder="0532 xxx xx xx" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-posta</label>
                                <input type="email" id="reportMusteriEmail" placeholder="ornek@email.com" style="width: 100%;">
                            </div>
                        </div>
                    </div>

                    <!-- Proje Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📍 Proje Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Proje Adı</label>
                                <input type="text" id="reportProjeAd" value="${activeProj ? activeProj.name : 'Örnek Villa Projesi'}" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Proje Adresi</label>
                                <input type="text" id="reportProjeAdres" value="${activeProj ? activeProj.location : ''}" placeholder="Proje adresi" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Açıklama</label>
                            <textarea id="reportProjeAciklama" rows="2" style="width: 100%;">${activeProj ? `${activeProj.type} - ${activeProj.blocks || 1} Blok` : 'Konut - 3 kat, 150 m²'}</textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Notlar (Rapora eklenecek)</label>
                            <textarea id="reportProjeNotlar" rows="2" placeholder="Müşteriye iletilecek özel notlar" style="width: 100%;"></textarea>
                        </div>
                    </div>

                </div>

                <!-- Right Preview Column -->
                <div>
                    <div class="card" style="padding: 24px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 20px;">
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
                            <span>Seçili Rapor:</span>
                            <span id="previewReportTypeLabel" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-weight: bold;">📝 Detaylı Rapor</span>
                        </div>

                        <!-- Big Cost Stat Card -->
                        <div class="preview-stat-card" id="reportCostStatCard" style="background: #3b82f6; color: white;">
                            <div style="font-size: 0.85rem; opacity: 0.95; font-weight: 500;">Tahmini Toplam Maliyet</div>
                            <div style="font-size: 1.85rem; font-weight: 800; margin: 8px 0;" id="previewTotalCostVal">15.750.000 ₺</div>
                            <div style="font-size: 0.82rem; opacity: 0.9;" id="previewPerSqmVal">35.000 ₺/m²</div>
                        </div>

                        <!-- Three Sub-stats -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Brüt Alan</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewAreaVal">450 m²</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Kat Sayısı</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewFloorsVal">3</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">İş Kalemi</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;">11</strong>
                            </div>
                        </div>
                        <div style="text-align: center; font-size: 0.76rem; color: var(--text-muted);" id="previewProjectSub">
                            Proje: Örnek Villa Projesi
                        </div>

                        <!-- Maliyet Dağılımı (Progress Bars) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">📊 Maliyet Dağılımı</h3>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>🔨 Malzeme</span>
                                    <strong id="previewMaterialCost">9.450.000 ₺ (%60)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbMaterial" style="width: 60%; background: #3b82f6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>👤 İşçilik</span>
                                    <strong id="previewLaborCost">4.725.000 ₺ (%30)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbLabor" style="width: 30%; background: #f97316; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>📦 Ekipman</span>
                                    <strong id="previewEquipmentCost">1.575.000 ₺ (%10)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbEquipment" style="width: 10%; background: #8b5cf6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Kategori Dağılımı (SVG Donut Chart) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">🍩 Kategori Dağılımı</h3>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
                                <!-- SVG Donut -->
                                <svg width="100" height="100" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4.2"></circle>
                                    
                                    <!-- Kaba Insaat - 40% (stroke-dasharray: 40 60) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" stroke-width="4.2" stroke-dasharray="40 60" stroke-dashoffset="25"></circle>
                                    
                                    <!-- Ince Insaat - 30% (stroke-dasharray: 30 70) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" stroke-width="4.2" stroke-dasharray="30 70" stroke-dashoffset="85"></circle>
                                    
                                    <!-- Tesisat - 20% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" stroke-width="4.2" stroke-dasharray="20 80" stroke-dashoffset="115"></circle>
                                    
                                    <!-- Dis Cephe - 10% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" stroke-width="4.2" stroke-dasharray="10 90" stroke-dashoffset="135"></circle>
                                </svg>
                                <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem;">
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 2px;"></span> Kaba İnşaat (40%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> İnce İnşaat (30%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #f97316; border-radius: 2px;"></span> Tesisat (20%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></span> Dış Cephe (10%)</div>
                                </div>
                            </div>
                        </div>

                        <!-- İş Kalemleri Detayı (Accordion List) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">📝 İş Kalemleri Detayı</h3>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Kaba İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valKaba">6.300.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>İnce İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valInce">4.725.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(249, 115, 22, 0.15); color: #f97316; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Tesisat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valTesisat">3.150.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">2</span>
                                        <strong>Dış Cephe</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valDis">1.575.000 ₺</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // UI Element Event Handlers
        const reportCards = container.querySelectorAll('.report-type-card');
        const previewTypeLabel = document.getElementById('previewReportTypeLabel');

        reportCards.forEach(card => {
            card.onclick = () => {
                reportCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedReportType = card.getAttribute('data-type');
                previewTypeLabel.textContent = `📝 ${selectedReportType}`;
            };
        });

        // Theme Circles Click Event
        const themeCircles = container.querySelectorAll('.theme-circle');
        const costCard = document.getElementById('reportCostStatCard');

        themeCircles.forEach(circle => {
            circle.onclick = () => {
                themeCircles.forEach(c => c.classList.remove('selected'));
                circle.classList.add('selected');
                currentThemeColor = circle.getAttribute('data-color');
                costCard.style.background = currentThemeColor;
            };
        });

        // Dynamic project selection calculations
        const projectSelect = document.getElementById('reportProjectSelect');
        const inputProjeAd = document.getElementById('reportProjeAd');
        const inputProjeAdres = document.getElementById('reportProjeAdres');
        const txtProjeAciklama = document.getElementById('reportProjeAciklama');

        const valCost = document.getElementById('previewTotalCostVal');
        const valPerSqm = document.getElementById('previewPerSqmVal');
        const valArea = document.getElementById('previewAreaVal');
        const valFloors = document.getElementById('previewFloorsVal');
        const txtProjectSub = document.getElementById('previewProjectSub');

        const labelMaterial = document.getElementById('previewMaterialCost');
        const labelLabor = document.getElementById('previewLaborCost');
        const labelEquipment = document.getElementById('previewEquipmentCost');

        const pbM = document.getElementById('pbMaterial');
        const pbL = document.getElementById('pbLabor');
        const pbE = document.getElementById('pbEquipment');

        const valKaba = document.getElementById('valKaba');
        const valInce = document.getElementById('valInce');
        const valTesisat = document.getElementById('valTesisat');
        const valDis = document.getElementById('valDis');

        const updatePreviewValues = (projectData) => {
            if (!projectData) {
                // Set default/villa project values
                valCost.textContent = '15.750.000 ₺';
                valPerSqm.textContent = '35.000 ₺/m²';
                valArea.textContent = '450 m²';
                valFloors.textContent = '3';
                txtProjectSub.textContent = 'Proje: Örnek Villa Projesi';

                labelMaterial.textContent = '9.450.000 ₺ (%60)';
                labelLabor.textContent = '4.725.000 ₺ (%30)';
                labelEquipment.textContent = '1.575.000 ₺ (%10)';

                pbM.style.width = '60%';
                pbL.style.width = '30%';
                pbE.style.width = '10%';

                valKaba.textContent = '6.300.000 ₺';
                valInce.textContent = '4.725.000 ₺';
                valTesisat.textContent = '3.150.000 ₺';
                valDis.textContent = '1.575.000 ₺';
                return;
            }

            // Estimate total cost based on square meters
            const area = parseInt(projectData.area) || 300;
            const floors = parseInt(projectData.floors) || 2;
            const multiplier = projectData.type === 'Villa' ? 42000 : projectData.type === 'Apartman' ? 32000 : 25000;
            const totalCost = area * multiplier;

            // Formatted values
            valCost.textContent = `${totalCost.toLocaleString('tr-TR')} ₺`;
            valPerSqm.textContent = `${multiplier.toLocaleString('tr-TR')} ₺/m²`;
            valArea.textContent = `${area} m²`;
            valFloors.textContent = floors;
            txtProjectSub.textContent = `Proje: ${projectData.name}`;

            // Cost breakdowns
            const material = totalCost * 0.58;
            const labor = totalCost * 0.32;
            const equip = totalCost * 0.10;

            labelMaterial.textContent = `${material.toLocaleString('tr-TR')} ₺ (%58)`;
            labelLabor.textContent = `${labor.toLocaleString('tr-TR')} ₺ (%32)`;
            labelEquipment.textContent = `${equip.toLocaleString('tr-TR')} ₺ (%10)`;

            pbM.style.width = '58%';
            pbL.style.width = '32%';
            pbE.style.width = '10%';

            // Categories breakdowns
            valKaba.textContent = `${(totalCost * 0.42).toLocaleString('tr-TR')} ₺`;
            valInce.textContent = `${(totalCost * 0.28).toLocaleString('tr-TR')} ₺`;
            valTesisat.textContent = `${(totalCost * 0.20).toLocaleString('tr-TR')} ₺`;
            valDis.textContent = `${(totalCost * 0.10).toLocaleString('tr-TR')} ₺`;
        };

        projectSelect.onchange = () => {
            const selectedId = projectSelect.value;
            if (!selectedId) {
                inputProjeAd.value = '';
                inputProjeAdres.value = '';
                txtProjeAciklama.value = '';
                updatePreviewValues(null);
                return;
            }

            const p = projects.find(item => item.id.toString() === selectedId.toString());
            if (p) {
                inputProjeAd.value = p.name;
                inputProjeAdres.value = p.location || '';
                txtProjeAciklama.value = `${p.type} - ${p.area} m², ${p.floors || 2} Kat`;
                updatePreviewValues(p);
            }
        };

        // Form Inputs event listeners to update right column titles
        inputProjeAd.oninput = () => {
            txtProjectSub.textContent = `Proje: ${inputProjeAd.value || 'Belirtilmedi'}`;
        };

        // Demo Data Button Action
        document.getElementById('btnLoadReportDemo').onclick = () => {
            document.getElementById('reportMusteriAd').value = 'Hakan Demir';
            document.getElementById('reportMusteriTel').value = '0533 999 88 77';
            document.getElementById('reportMusteriEmail').value = 'hakan.demir@demirholding.com';
            
            inputProjeAd.value = 'Marmara Plaza Restorasyon';
            inputProjeAdres.value = 'Kadıköy, İstanbul';
            txtProjeAciklama.value = 'Eski Eser Restorasyon ve Güçlendirme';
            
            valCost.textContent = '28.400.000 ₺';
            valPerSqm.textContent = '48.000 ₺/m²';
            valArea.textContent = '600 m²';
            valFloors.textContent = '4';
            txtProjectSub.textContent = 'Proje: Marmara Plaza Restorasyon';

            labelMaterial.textContent = '17.040.000 ₺ (%60)';
            labelLabor.textContent = '8.520.000 ₺ (%30)';
            labelEquipment.textContent = '2.840.000 ₺ (%10)';

            pbM.style.width = '60%';
            pbL.style.width = '30%';
            pbE.style.width = '10%';

            valKaba.textContent = '11.360.000 ₺';
            valInce.textContent = '8.520.000 ₺';
            valTesisat.textContent = '5.680.000 ₺';
            valDis.textContent = '2.840.000 ₺';

            window.BrenerApp.showToast('success', 'Müşteri raporu için demo veriler yüklendi.');
        };

        // Download PDF simulation
        document.getElementById('btnDownloadReportPdf').onclick = () => {
            window.BrenerApp.showToast('success', 'Müşteri Tahmin Raporu PDF formatında başarıyla indirildi!');
        };
    },

    renderMalikRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Malik Raporu', 'Projelerin İlerlemesi ve Malik Bilgilendirme Raporu');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        let html = `
            <style>
                .progress-ring {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                }
                .progress-ring svg {
                    transform: rotate(-90deg);
                }
                .progress-ring-circle {
                    transition: stroke-dashoffset 0.35s;
                    transform-origin: 50% 50%;
                }
                .photo-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-top: 10px;
                }
                .photo-thumb {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    height: 80px;
                    overflow: hidden;
                    position: relative;
                    cursor: pointer;
                }
                .photo-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .photo-thumb .photo-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    font-size: 0.62rem;
                    text-align: center;
                    padding: 3px 0;
                }
                .preview-phone {
                    background: var(--bg-card);
                    border: 12px solid #222;
                    border-radius: 36px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
                    max-width: 320px;
                    margin: 0 auto;
                    overflow: hidden;
                    position: relative;
                }
                .preview-phone-screen {
                    height: 520px;
                    overflow-y: auto;
                    padding: 16px;
                    font-size: 0.85rem;
                }
                .timeline-step {
                    display: flex;
                    gap: 12px;
                    position: relative;
                    margin-bottom: 20px;
                }
                .timeline-step::before {
                    content: "";
                    position: absolute;
                    top: 18px;
                    left: 9px;
                    bottom: -22px;
                    width: 2px;
                    background: var(--border-color);
                    z-index: 1;
                }
                .timeline-step:last-child::before {
                    display: none;
                }
                .timeline-dot {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                    font-weight: bold;
                    z-index: 2;
                }
                .timeline-dot.completed {
                    background: #10b981;
                    color: white;
                }
                .timeline-dot.active {
                    background: #3b82f6;
                    color: white;
                    box-shadow: 0 0 8px rgba(59,130,246,0.5);
                }
                .timeline-dot.pending {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid var(--border-color);
                    color: var(--text-muted);
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📋 Malik Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Mülk ve arsa sahipleri için projelerin ilerleme ve fotoğraf raporunu oluşturup gönderin</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Configuration Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje & İlerleme Seç -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>🏢 Proje Seç & İlerleme</h2>
                        </div>
                        <div class="form-group">
                            <label>Raporlanacak Proje</label>
                            <select id="malikProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>İlerleme Yüzdesi (%)</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="range" id="malikProgressRange" min="0" max="100" value="65" style="flex: 1;">
                                    <strong id="malikProgressVal" style="width: 40px; text-align: right; font-size: 1rem; color: var(--primary);">%65</strong>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Aktif Aşama</label>
                                <select id="malikActiveStage" style="width: 100%;">
                                    <option value="Temel İmalatı">Temel İmalatı</option>
                                    <option value="Kaba İnşaat (Betonarme)" selected>Kaba İnşaat (Betonarme)</option>
                                    <option value="Duvar İmalatları">Duvar İmalatları</option>
                                    <option value="İnce İşler (Alçı & Boya)">İnce İşler (Alçı & Boya)</option>
                                    <option value="Cephe Kaplama">Cephe Kaplama</option>
                                    <option value="Çevre Düzenleme">Çevre Düzenleme</option>
                                    <option value="Anahtar Teslim">Anahtar Teslim</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri (Malik) Bilgileri -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>👤 Malik (Müşteri) Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Adı Soyadı</label>
                            <input type="text" id="malikCustomerName" value="Mustafa Koç" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon (WhatsApp Gönderimi İçin)</label>
                                <input type="text" id="malikCustomerPhone" value="05321112233" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-Posta</label>
                                <input type="email" id="malikCustomerEmail" value="mustafa.koc@gmail.com" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mühendis Rapor Notu (Malike İletilecek)</label>
                            <textarea id="malikReportNotes" rows="3" style="width: 100%;">Değerli mülk sahibimiz, projemizin betonarme karkas imalatları başarıyla tamamlanmış olup ince işler aşamasına geçilmiştir. Güncel durum fotoğraflarını aşağıdan inceleyebilirsiniz.</textarea>
                        </div>
                    </div>

                    <!-- Şantiye Fotoğrafları -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 8px;">
                            <h2>📷 Güncel İlerleme Fotoğrafları</h2>
                        </div>
                        <p style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 12px;">Raporda görüntülenecek 3 adet şantiye fotoğrafı seçin veya yeni yükleyin</p>
                        
                        <div class="photo-grid">
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Temel Demiri</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Kolon Betonu</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Duvar İmalatı</div>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 12px;">➕ Yeni Fotoğraf Ekle</button>
                    </div>

                    <!-- Gönderim Kanalları -->
                    <div class="card" style="border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.02);">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>📤 Raporu Malik'e Gönder</h2>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn" id="btnSendReportWhatsapp" style="flex: 1; background: #25d366; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);">
                                💬 WhatsApp ile Gönder
                            </button>
                            <button class="btn" id="btnSendReportEmail" style="flex: 1; background: #3b82f6; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);">
                                📧 E-Posta ile Gönder
                            </button>
                        </div>
                    </div>

                </div>

                <!-- Right Live Mobile Preview Column -->
                <div>
                    <h3 style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">📱 Malik Canlı Rapor Görünümü</h3>
                    
                    <!-- Mobile Mockup -->
                    <div class="preview-phone">
                        <div class="preview-phone-screen">
                            
                            <!-- Phone Top Bar -->
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px;">
                                <strong style="color: var(--primary);">BRENER GROUP</strong>
                                <span class="badge badge-success" style="font-size: 0.65rem;">İlerleme Raporu</span>
                            </div>

                            <!-- Project Title -->
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h4 style="font-size: 1.05rem; font-weight: 800; margin: 0;" id="phoneProjectName">Örnek Villa Projesi</h4>
                                <span style="font-size: 0.7rem; color: var(--text-muted);" id="phoneProjectAddr">Bodrum, Muğla</span>
                            </div>

                            <!-- Circular Progress Ring -->
                            <div class="progress-ring">
                                <svg width="120" height="120">
                                    <circle stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="transparent" r="52" cx="60" cy="60"></circle>
                                    <circle class="progress-ring-circle" id="phoneProgressCircle" stroke="#10b981" stroke-width="8" fill="transparent" r="52" cx="60" cy="60" stroke-dasharray="326.7" stroke-dashoffset="114.3"></circle>
                                </svg>
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <strong id="phoneProgressText" style="font-size: 1.35rem; font-weight: bold; color: white;">%65</strong>
                                    <span style="font-size: 0.6rem; color: var(--text-muted);">Tamamlandı</span>
                                </div>
                            </div>

                            <!-- Active Phase details -->
                            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Aktif İnşaat Aşaması</div>
                                <strong id="phoneActiveStageText" style="font-size: 0.85rem; color: #10b981; display: block; margin-top: 4px;">Kaba İnşaat (Betonarme)</strong>
                            </div>

                            <!-- Timeline -->
                            <div style="margin-bottom: 24px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 12px;">📋 İnşaat Aşamaları</h5>
                                
                                <div class="timeline-step">
                                    <div class="timeline-dot completed">✓</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;">Temel İmalatı</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">%100 Tamamlandı</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot active" id="tlDotActive">▶</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;" id="tlActiveText">Kaba İnşaat (Betonarme)</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);" id="tlActivePercent">Devam ediyor</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot pending"></div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block; opacity: 0.6;">İnce İmalatlar & Cephe</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">Başlamadı</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Engineer Notes -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-bottom: 20px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 6px;">✍️ Mühendis Notu</h5>
                                <p style="font-size: 0.74rem; color: var(--text-main); line-height: 1.4; margin: 0; background: rgba(255,255,255,0.01); padding: 8px; border-radius: 6px; border-left: 3px solid #10b981;" id="phoneNotesText">
                                    Değerli mülk sahibimiz, projemizin kaba inşaat demir ve beton dökümleri tamamlanmış olup duvar örme aşamasına başlanacaktır.
                                </p>
                            </div>

                            <!-- Photos -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 10px;">📸 Güncel Fotoğraflar</h5>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // Interactive logic elements references
        const selectProj = document.getElementById('malikProjectSelect');
        const progressRange = document.getElementById('malikProgressRange');
        const progressVal = document.getElementById('malikProgressVal');
        const activeStage = document.getElementById('malikActiveStage');
        const inputCustName = document.getElementById('malikCustomerName');
        const inputCustPhone = document.getElementById('malikCustomerPhone');
        const inputCustEmail = document.getElementById('malikCustomerEmail');
        const txtNotes = document.getElementById('malikReportNotes');

        const phoneProjName = document.getElementById('phoneProjectName');
        const phoneProjAddr = document.getElementById('phoneProjectAddr');
        const phoneProgressText = document.getElementById('phoneProgressText');
        const phoneProgressCircle = document.getElementById('phoneProgressCircle');
        const phoneActiveStageText = document.getElementById('phoneActiveStageText');
        const phoneNotesText = document.getElementById('phoneNotesText');
        const tlActiveText = document.getElementById('tlActiveText');
        const tlActivePercent = document.getElementById('tlActivePercent');

        // Circle calculation variables
        const radius = 52;
        const circumference = 2 * Math.PI * radius; // 326.72

        const updateCircleProgress = (percent) => {
            const offset = circumference - (percent / 100 * circumference);
            phoneProgressCircle.style.strokeDashoffset = offset;
            phoneProgressText.textContent = `%${percent}`;
            progressVal.textContent = `%${percent}`;
            tlActivePercent.textContent = `%${percent} seviyesinde`;
        };

        // Event Listeners
        progressRange.oninput = () => {
            updateCircleProgress(progressRange.value);
        };

        activeStage.onchange = () => {
            const val = activeStage.value;
            phoneActiveStageText.textContent = val;
            tlActiveText.textContent = val;
        };

        txtNotes.oninput = () => {
            phoneNotesText.textContent = txtNotes.value || 'Not girilmedi.';
        };

        selectProj.onchange = () => {
            const selId = selectProj.value;
            if (!selId) return;
            const p = projects.find(item => item.id.toString() === selId.toString());
            if (p) {
                phoneProjName.textContent = p.name;
                phoneProjAddr.textContent = p.location || 'Şantiye Alanı';
                
                // Adjust default progress based on actual project progress if it exists
                const progressNum = p.progress ? parseInt(p.progress.replace('%','')) : 45;
                progressRange.value = progressNum;
                updateCircleProgress(progressNum);
            }
        };

        // Initialize progress
        updateCircleProgress(65);

        // Send WhatsApp Action
        document.getElementById('btnSendReportWhatsapp').onclick = () => {
            const custName = inputCustName.value.trim();
            const custPhone = inputCustPhone.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;

            if (!custName || !custPhone) {
                alert('Lütfen malik adı ve telefon numarasını doldurun!');
                return;
            }

            const message = `Sayın ${custName}, ${projName} inşaatımızda güncel ilerleme seviyesi %${progress} oranına ulaşmıştır. Aktif aşama: ${stage}. Detayları incelemek için rapor linkiniz: http://brener.com.tr/rapor/malik-382a`;
            const encodedMsg = encodeURIComponent(message);
            const waUrl = `https://api.whatsapp.com/send?phone=${custPhone}&text=${encodedMsg}`;

            window.BrenerApp.showToast('success', `${custName} adlı malike WhatsApp rapor taslağı oluşturuldu. WhatsApp Web/Uygulaması açılıyor.`);
            window.BrenerApp.logActivity('santiye', `${custName} malikine WhatsApp ilerleme raporu gönderildi: %${progress}`, 'success', message);
            
            setTimeout(() => {
                window.open(waUrl, '_blank');
            }, 1000);
        };

        // Send Email Action
        document.getElementById('btnSendReportEmail').onclick = () => {
            const custName = inputCustName.value.trim();
            const custEmail = inputCustEmail.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;
            const notes = txtNotes.value.trim();

            if (!custName || !custEmail) {
                alert('Lütfen malik adı ve e-posta adresini doldurun!');
                return;
            }

            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 500px; border: 1px solid #ddd; border-radius: 12px; padding: 24px; background: #fff; color: #333;">
                    <h3 style="color: #10b981; margin-top: 0;">BRENER GROUP - İlerleyiş Raporu</h3>
                    <p>Sayın <strong>${custName}</strong>,</p>
                    <p><strong>${projName}</strong> projesine ait güncel ilerleme ve saha durumu bilgileri aşağıdaki gibidir:</p>
                    <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin: 16px 0;">
                        <strong>İlerleme Seviyesi:</strong> %${progress} tamamlandı<br>
                        <strong>Aktif Aşama:</strong> ${stage}
                    </div>
                    <p><strong>Mühendis Notu:</strong><br>${notes}</p>
                    <p style="font-size: 0.85rem; color: #666;">Güncel fotoğraflar ve detaylar rapora eklenmiştir.</p>
                </div>
            `;

            const modalHtml = `
                <div style="padding: 16px;">
                    <div class="form-group">
                        <label>Alıcı</label>
                        <input type="text" value="${custEmail}" disabled style="width:100%; opacity:0.6;">
                    </div>
                    <div class="form-group">
                        <label>E-Posta Şablon Önizleme</label>
                        <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: rgba(255,255,255,0.02); max-height: 250px; overflow-y: auto;">
                            ${emailHtml}
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; margin-top:20px; justify-content:flex-end;">
                        <button class="btn btn-secondary" onclick="window.BrenerApp.closeModal()">Kapat</button>
                        <button class="btn btn-primary" id="btnConfirmSendEmail" style="background:#10b981; border:none; color:white;">E-Postayı Gönder</button>
                    </div>
                </div>
            `;

            window.BrenerApp.openModal('📧 Malik E-Posta Gönderim Taslağı', modalHtml);

            document.getElementById('btnConfirmSendEmail').onclick = () => {
                window.BrenerApp.closeModal();
                window.BrenerApp.showToast('success', `${custName} malikine bilgilendirme e-postası başarıyla gönderildi.`);
                window.BrenerApp.logActivity('santiye', `${custName} malikine e-posta ilerleme raporu gönderildi`, 'success', `Alıcı: ${custEmail}, İlerleme: %${progress}`);
            };
        };

    },
    
    renderMusteriRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Müşteri Raporu', 'Profesyonel maliyet tahmin raporu oluşturun');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        // State definition for selected colors and values
        let selectedReportType = 'Detaylı Rapor';
        let currentThemeColor = '#3b82f6'; // Default Blue

        let html = `
            <style>
                .report-type-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .report-type-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                }
                .report-type-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
                .report-type-card.selected {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.04);
                }
                .report-type-card.selected::before {
                    content: "✔";
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #3b82f6;
                    color: white;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                }
                .theme-circle {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                }
                .theme-circle.selected {
                    border-color: #fff;
                    transform: scale(1.15);
                    box-shadow: 0 0 8px rgba(255,255,255,0.4);
                }
                .preview-stat-card {
                    background: var(--primary);
                    color: #000;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    margin-bottom: 20px;
                    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.15);
                    transition: all 0.3s;
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📄 Müşteri Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Profesyonel maliyet tahmin raporu oluşturun</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-sm" id="btnLoadReportDemo" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px; padding: 8px 16px; font-weight: 600;">Demo Veri</button>
                    <button class="btn btn-sm" id="btnDownloadReportPdf" style="background: white; border: none; color: #3b82f6; border-radius: 6px; padding: 8px 16px; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">📥 PDF İndir</button>
                </div>
            </div>

            <!-- Report Type Grid Selection -->
            <div class="report-type-grid">
                <div class="report-type-card selected" data-type="Detaylı Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                    <strong style="display: block; font-size: 0.9rem;">Detaylı Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Tüm iş kalemleri, kategori tabloları</span>
                </div>
                <div class="report-type-card" data-type="Özet Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📷</div>
                    <strong style="display: block; font-size: 0.9rem;">Özet Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Kategori özetleri, metraj bilgileri</span>
                </div>
                <div class="report-type-card" data-type="Yönetici Raporu">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📑</div>
                    <strong style="display: block; font-size: 0.9rem;">Yönetici Raporu</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Sadece toplam ve dağılım</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Forms Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje Seç Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 12px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📂 Proje Seç</h2>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mevcut bir projeden maliyet verisi yükle</label>
                            <select id="reportProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Firma Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">🏢 Firma Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Firma Adı</label>
                                <input type="text" id="reportFirmaAd" value="Brener" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Firma Logosu</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <div style="width: 80px; height: 38px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: var(--text-muted);">Logo Yok</div>
                                    <button class="btn btn-secondary btn-sm" style="padding: 10px 14px;">⚡ Yükle</button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group" style="margin-top: 10px; margin-bottom: 0;">
                            <label>Renk Teması</label>
                            <div style="display: flex; gap: 10px;">
                                <div class="theme-circle selected" data-color="#3b82f6" style="background: #3b82f6;"></div>
                                <div class="theme-circle" data-color="#10b981" style="background: #10b981;"></div>
                                <div class="theme-circle" data-color="#f97316" style="background: #f97316;"></div>
                                <div class="theme-circle" data-color="#8b5cf6" style="background: #8b5cf6;"></div>
                                <div class="theme-circle" data-color="#4b5563" style="background: #4b5563;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">👤 Müşteri Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Ad Soyad</label>
                            <input type="text" id="reportMusteriAd" placeholder="Müşteri adı soyadı" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon</label>
                                <input type="text" id="reportMusteriTel" placeholder="0532 xxx xx xx" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-posta</label>
                                <input type="email" id="reportMusteriEmail" placeholder="ornek@email.com" style="width: 100%;">
                            </div>
                        </div>
                    </div>

                    <!-- Proje Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📍 Proje Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Proje Adı</label>
                                <input type="text" id="reportProjeAd" value="${activeProj ? activeProj.name : 'Örnek Villa Projesi'}" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Proje Adresi</label>
                                <input type="text" id="reportProjeAdres" value="${activeProj ? activeProj.location : ''}" placeholder="Proje adresi" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Açıklama</label>
                            <textarea id="reportProjeAciklama" rows="2" style="width: 100%;">${activeProj ? `${activeProj.type} - ${activeProj.blocks || 1} Blok` : 'Konut - 3 kat, 150 m²'}</textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Notlar (Rapora eklenecek)</label>
                            <textarea id="reportProjeNotlar" rows="2" placeholder="Müşteriye iletilecek özel notlar" style="width: 100%;"></textarea>
                        </div>
                    </div>

                </div>

                <!-- Right Preview Column -->
                <div>
                    <div class="card" style="padding: 24px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 20px;">
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
                            <span>Seçili Rapor:</span>
                            <span id="previewReportTypeLabel" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-weight: bold;">📝 Detaylı Rapor</span>
                        </div>

                        <!-- Big Cost Stat Card -->
                        <div class="preview-stat-card" id="reportCostStatCard" style="background: #3b82f6; color: white;">
                            <div style="font-size: 0.85rem; opacity: 0.95; font-weight: 500;">Tahmini Toplam Maliyet</div>
                            <div style="font-size: 1.85rem; font-weight: 800; margin: 8px 0;" id="previewTotalCostVal">15.750.000 ₺</div>
                            <div style="font-size: 0.82rem; opacity: 0.9;" id="previewPerSqmVal">35.000 ₺/m²</div>
                        </div>

                        <!-- Three Sub-stats -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Brüt Alan</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewAreaVal">450 m²</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Kat Sayısı</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewFloorsVal">3</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">İş Kalemi</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;">11</strong>
                            </div>
                        </div>
                        <div style="text-align: center; font-size: 0.76rem; color: var(--text-muted);" id="previewProjectSub">
                            Proje: Örnek Villa Projesi
                        </div>

                        <!-- Maliyet Dağılımı (Progress Bars) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">📊 Maliyet Dağılımı</h3>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>🔨 Malzeme</span>
                                    <strong id="previewMaterialCost">9.450.000 ₺ (%60)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbMaterial" style="width: 60%; background: #3b82f6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>👤 İşçilik</span>
                                    <strong id="previewLaborCost">4.725.000 ₺ (%30)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbLabor" style="width: 30%; background: #f97316; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>📦 Ekipman</span>
                                    <strong id="previewEquipmentCost">1.575.000 ₺ (%10)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbEquipment" style="width: 10%; background: #8b5cf6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Kategori Dağılımı (SVG Donut Chart) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">🍩 Kategori Dağılımı</h3>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
                                <!-- SVG Donut -->
                                <svg width="100" height="100" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4.2"></circle>
                                    
                                    <!-- Kaba Insaat - 40% (stroke-dasharray: 40 60) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" stroke-width="4.2" stroke-dasharray="40 60" stroke-dashoffset="25"></circle>
                                    
                                    <!-- Ince Insaat - 30% (stroke-dasharray: 30 70) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" stroke-width="4.2" stroke-dasharray="30 70" stroke-dashoffset="85"></circle>
                                    
                                    <!-- Tesisat - 20% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" stroke-width="4.2" stroke-dasharray="20 80" stroke-dashoffset="115"></circle>
                                    
                                    <!-- Dis Cephe - 10% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" stroke-width="4.2" stroke-dasharray="10 90" stroke-dashoffset="135"></circle>
                                </svg>
                                <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem;">
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 2px;"></span> Kaba İnşaat (40%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> İnce İnşaat (30%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #f97316; border-radius: 2px;"></span> Tesisat (20%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></span> Dış Cephe (10%)</div>
                                </div>
                            </div>
                        </div>

                        <!-- İş Kalemleri Detayı (Accordion List) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">📝 İş Kalemleri Detayı</h3>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Kaba İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valKaba">6.300.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>İnce İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valInce">4.725.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(249, 115, 22, 0.15); color: #f97316; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Tesisat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valTesisat">3.150.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">2</span>
                                        <strong>Dış Cephe</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valDis">1.575.000 ₺</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // UI Element Event Handlers
        const reportCards = container.querySelectorAll('.report-type-card');
        const previewTypeLabel = document.getElementById('previewReportTypeLabel');

        reportCards.forEach(card => {
            card.onclick = () => {
                reportCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedReportType = card.getAttribute('data-type');
                previewTypeLabel.textContent = `📝 ${selectedReportType}`;
            };
        });

        // Theme Circles Click Event
        const themeCircles = container.querySelectorAll('.theme-circle');
        const costCard = document.getElementById('reportCostStatCard');

        themeCircles.forEach(circle => {
            circle.onclick = () => {
                themeCircles.forEach(c => c.classList.remove('selected'));
                circle.classList.add('selected');
                currentThemeColor = circle.getAttribute('data-color');
                costCard.style.background = currentThemeColor;
            };
        });

        // Dynamic project selection calculations
        const projectSelect = document.getElementById('reportProjectSelect');
        const inputProjeAd = document.getElementById('reportProjeAd');
        const inputProjeAdres = document.getElementById('reportProjeAdres');
        const txtProjeAciklama = document.getElementById('reportProjeAciklama');

        const valCost = document.getElementById('previewTotalCostVal');
        const valPerSqm = document.getElementById('previewPerSqmVal');
        const valArea = document.getElementById('previewAreaVal');
        const valFloors = document.getElementById('previewFloorsVal');
        const txtProjectSub = document.getElementById('previewProjectSub');

        const labelMaterial = document.getElementById('previewMaterialCost');
        const labelLabor = document.getElementById('previewLaborCost');
        const labelEquipment = document.getElementById('previewEquipmentCost');

        const pbM = document.getElementById('pbMaterial');
        const pbL = document.getElementById('pbLabor');
        const pbE = document.getElementById('pbEquipment');

        const valKaba = document.getElementById('valKaba');
        const valInce = document.getElementById('valInce');
        const valTesisat = document.getElementById('valTesisat');
        const valDis = document.getElementById('valDis');

        const updatePreviewValues = (projectData) => {
            if (!projectData) {
                // Set default/villa project values
                valCost.textContent = '15.750.000 ₺';
                valPerSqm.textContent = '35.000 ₺/m²';
                valArea.textContent = '450 m²';
                valFloors.textContent = '3';
                txtProjectSub.textContent = 'Proje: Örnek Villa Projesi';

                labelMaterial.textContent = '9.450.000 ₺ (%60)';
                labelLabor.textContent = '4.725.000 ₺ (%30)';
                labelEquipment.textContent = '1.575.000 ₺ (%10)';

                pbM.style.width = '60%';
                pbL.style.width = '30%';
                pbE.style.width = '10%';

                valKaba.textContent = '6.300.000 ₺';
                valInce.textContent = '4.725.000 ₺';
                valTesisat.textContent = '3.150.000 ₺';
                valDis.textContent = '1.575.000 ₺';
                return;
            }

            // Estimate total cost based on square meters
            const area = parseInt(projectData.area) || 300;
            const floors = parseInt(projectData.floors) || 2;
            const multiplier = projectData.type === 'Villa' ? 42000 : projectData.type === 'Apartman' ? 32000 : 25000;
            const totalCost = area * multiplier;

            // Formatted values
            valCost.textContent = `${totalCost.toLocaleString('tr-TR')} ₺`;
            valPerSqm.textContent = `${multiplier.toLocaleString('tr-TR')} ₺/m²`;
            valArea.textContent = `${area} m²`;
            valFloors.textContent = floors;
            txtProjectSub.textContent = `Proje: ${projectData.name}`;

            // Cost breakdowns
            const material = totalCost * 0.58;
            const labor = totalCost * 0.32;
            const equip = totalCost * 0.10;

            labelMaterial.textContent = `${material.toLocaleString('tr-TR')} ₺ (%58)`;
            labelLabor.textContent = `${labor.toLocaleString('tr-TR')} ₺ (%32)`;
            labelEquipment.textContent = `${equip.toLocaleString('tr-TR')} ₺ (%10)`;

            pbM.style.width = '58%';
            pbL.style.width = '32%';
            pbE.style.width = '10%';

            // Categories breakdowns
            valKaba.textContent = `${(totalCost * 0.42).toLocaleString('tr-TR')} ₺`;
            valInce.textContent = `${(totalCost * 0.28).toLocaleString('tr-TR')} ₺`;
            valTesisat.textContent = `${(totalCost * 0.20).toLocaleString('tr-TR')} ₺`;
            valDis.textContent = `${(totalCost * 0.10).toLocaleString('tr-TR')} ₺`;
        };

        projectSelect.onchange = () => {
            const selectedId = projectSelect.value;
            if (!selectedId) {
                inputProjeAd.value = '';
                inputProjeAdres.value = '';
                txtProjeAciklama.value = '';
                updatePreviewValues(null);
                return;
            }

            const p = projects.find(item => item.id.toString() === selectedId.toString());
            if (p) {
                inputProjeAd.value = p.name;
                inputProjeAdres.value = p.location || '';
                txtProjeAciklama.value = `${p.type} - ${p.area} m², ${p.floors || 2} Kat`;
                updatePreviewValues(p);
            }
        };

        // Form Inputs event listeners to update right column titles
        inputProjeAd.oninput = () => {
            txtProjectSub.textContent = `Proje: ${inputProjeAd.value || 'Belirtilmedi'}`;
        };

        // Demo Data Button Action
        document.getElementById('btnLoadReportDemo').onclick = () => {
            document.getElementById('reportMusteriAd').value = 'Hakan Demir';
            document.getElementById('reportMusteriTel').value = '0533 999 88 77';
            document.getElementById('reportMusteriEmail').value = 'hakan.demir@demirholding.com';
            
            inputProjeAd.value = 'Marmara Plaza Restorasyon';
            inputProjeAdres.value = 'Kadıköy, İstanbul';
            txtProjeAciklama.value = 'Eski Eser Restorasyon ve Güçlendirme';
            
            valCost.textContent = '28.400.000 ₺';
            valPerSqm.textContent = '48.000 ₺/m²';
            valArea.textContent = '600 m²';
            valFloors.textContent = '4';
            txtProjectSub.textContent = 'Proje: Marmara Plaza Restorasyon';

            labelMaterial.textContent = '17.040.000 ₺ (%60)';
            labelLabor.textContent = '8.520.000 ₺ (%30)';
            labelEquipment.textContent = '2.840.000 ₺ (%10)';

            pbM.style.width = '60%';
            pbL.style.width = '30%';
            pbE.style.width = '10%';

            valKaba.textContent = '11.360.000 ₺';
            valInce.textContent = '8.520.000 ₺';
            valTesisat.textContent = '5.680.000 ₺';
            valDis.textContent = '2.840.000 ₺';

            window.BrenerApp.showToast('success', 'Müşteri raporu için demo veriler yüklendi.');
        };

        // Download PDF simulation
        document.getElementById('btnDownloadReportPdf').onclick = () => {
            window.BrenerApp.showToast('success', 'Müşteri Tahmin Raporu PDF formatında başarıyla indirildi!');
        };
    },

    renderMalikRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Malik Raporu', 'Projelerin İlerlemesi ve Malik Bilgilendirme Raporu');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        let html = `
            <style>
                .progress-ring {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                }
                .progress-ring svg {
                    transform: rotate(-90deg);
                }
                .progress-ring-circle {
                    transition: stroke-dashoffset 0.35s;
                    transform-origin: 50% 50%;
                }
                .photo-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-top: 10px;
                }
                .photo-thumb {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    height: 80px;
                    overflow: hidden;
                    position: relative;
                    cursor: pointer;
                }
                .photo-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .photo-thumb .photo-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    font-size: 0.62rem;
                    text-align: center;
                    padding: 3px 0;
                }
                .preview-phone {
                    background: var(--bg-card);
                    border: 12px solid #222;
                    border-radius: 36px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
                    max-width: 320px;
                    margin: 0 auto;
                    overflow: hidden;
                    position: relative;
                }
                .preview-phone-screen {
                    height: 520px;
                    overflow-y: auto;
                    padding: 16px;
                    font-size: 0.85rem;
                }
                .timeline-step {
                    display: flex;
                    gap: 12px;
                    position: relative;
                    margin-bottom: 20px;
                }
                .timeline-step::before {
                    content: "";
                    position: absolute;
                    top: 18px;
                    left: 9px;
                    bottom: -22px;
                    width: 2px;
                    background: var(--border-color);
                    z-index: 1;
                }
                .timeline-step:last-child::before {
                    display: none;
                }
                .timeline-dot {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                    font-weight: bold;
                    z-index: 2;
                }
                .timeline-dot.completed {
                    background: #10b981;
                    color: white;
                }
                .timeline-dot.active {
                    background: #3b82f6;
                    color: white;
                    box-shadow: 0 0 8px rgba(59,130,246,0.5);
                }
                .timeline-dot.pending {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid var(--border-color);
                    color: var(--text-muted);
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📋 Malik Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Mülk ve arsa sahipleri için projelerin ilerleme ve fotoğraf raporunu oluşturup gönderin</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Configuration Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje & İlerleme Seç -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>🏢 Proje Seç & İlerleme</h2>
                        </div>
                        <div class="form-group">
                            <label>Raporlanacak Proje</label>
                            <select id="malikProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>İlerleme Yüzdesi (%)</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="range" id="malikProgressRange" min="0" max="100" value="65" style="flex: 1;">
                                    <strong id="malikProgressVal" style="width: 40px; text-align: right; font-size: 1rem; color: var(--primary);">%65</strong>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Aktif Aşama</label>
                                <select id="malikActiveStage" style="width: 100%;">
                                    <option value="Temel İmalatı">Temel İmalatı</option>
                                    <option value="Kaba İnşaat (Betonarme)" selected>Kaba İnşaat (Betonarme)</option>
                                    <option value="Duvar İmalatları">Duvar İmalatları</option>
                                    <option value="İnce İşler (Alçı & Boya)">İnce İşler (Alçı & Boya)</option>
                                    <option value="Cephe Kaplama">Cephe Kaplama</option>
                                    <option value="Çevre Düzenleme">Çevre Düzenleme</option>
                                    <option value="Anahtar Teslim">Anahtar Teslim</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri (Malik) Bilgileri -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>👤 Malik (Müşteri) Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Adı Soyadı</label>
                            <input type="text" id="malikCustomerName" value="Mustafa Koç" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon (WhatsApp Gönderimi İçin)</label>
                                <input type="text" id="malikCustomerPhone" value="05321112233" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-Posta</label>
                                <input type="email" id="malikCustomerEmail" value="mustafa.koc@gmail.com" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mühendis Rapor Notu (Malike İletilecek)</label>
                            <textarea id="malikReportNotes" rows="3" style="width: 100%;">Değerli mülk sahibimiz, projemizin betonarme karkas imalatları başarıyla tamamlanmış olup ince işler aşamasına geçilmiştir. Güncel durum fotoğraflarını aşağıdan inceleyebilirsiniz.</textarea>
                        </div>
                    </div>

                    <!-- Şantiye Fotoğrafları -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 8px;">
                            <h2>📷 Güncel İlerleme Fotoğrafları</h2>
                        </div>
                        <p style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 12px;">Raporda görüntülenecek 3 adet şantiye fotoğrafı seçin veya yeni yükleyin</p>
                        
                        <div class="photo-grid">
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Temel Demiri</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Kolon Betonu</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Duvar İmalatı</div>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 12px;">➕ Yeni Fotoğraf Ekle</button>
                    </div>

                    <!-- Gönderim Kanalları -->
                    <div class="card" style="border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.02);">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>📤 Raporu Malik'e Gönder</h2>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn" id="btnSendReportWhatsapp" style="flex: 1; background: #25d366; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);">
                                💬 WhatsApp ile Gönder
                            </button>
                            <button class="btn" id="btnSendReportEmail" style="flex: 1; background: #3b82f6; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);">
                                📧 E-Posta ile Gönder
                            </button>
                        </div>
                    </div>

                </div>

                <!-- Right Live Mobile Preview Column -->
                <div>
                    <h3 style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">📱 Malik Canlı Rapor Görünümü</h3>
                    
                    <!-- Mobile Mockup -->
                    <div class="preview-phone">
                        <div class="preview-phone-screen">
                            
                            <!-- Phone Top Bar -->
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px;">
                                <strong style="color: var(--primary);">BRENER GROUP</strong>
                                <span class="badge badge-success" style="font-size: 0.65rem;">İlerleme Raporu</span>
                            </div>

                            <!-- Project Title -->
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h4 style="font-size: 1.05rem; font-weight: 800; margin: 0;" id="phoneProjectName">Örnek Villa Projesi</h4>
                                <span style="font-size: 0.7rem; color: var(--text-muted);" id="phoneProjectAddr">Bodrum, Muğla</span>
                            </div>

                            <!-- Circular Progress Ring -->
                            <div class="progress-ring">
                                <svg width="120" height="120">
                                    <circle stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="transparent" r="52" cx="60" cy="60"></circle>
                                    <circle class="progress-ring-circle" id="phoneProgressCircle" stroke="#10b981" stroke-width="8" fill="transparent" r="52" cx="60" cy="60" stroke-dasharray="326.7" stroke-dashoffset="114.3"></circle>
                                </svg>
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <strong id="phoneProgressText" style="font-size: 1.35rem; font-weight: bold; color: white;">%65</strong>
                                    <span style="font-size: 0.6rem; color: var(--text-muted);">Tamamlandı</span>
                                </div>
                            </div>

                            <!-- Active Phase details -->
                            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Aktif İnşaat Aşaması</div>
                                <strong id="phoneActiveStageText" style="font-size: 0.85rem; color: #10b981; display: block; margin-top: 4px;">Kaba İnşaat (Betonarme)</strong>
                            </div>

                            <!-- Timeline -->
                            <div style="margin-bottom: 24px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 12px;">📋 İnşaat Aşamaları</h5>
                                
                                <div class="timeline-step">
                                    <div class="timeline-dot completed">✓</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;">Temel İmalatı</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">%100 Tamamlandı</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot active" id="tlDotActive">▶</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;" id="tlActiveText">Kaba İnşaat (Betonarme)</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);" id="tlActivePercent">Devam ediyor</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot pending"></div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block; opacity: 0.6;">İnce İmalatlar & Cephe</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">Başlamadı</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Engineer Notes -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-bottom: 20px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 6px;">✍️ Mühendis Notu</h5>
                                <p style="font-size: 0.74rem; color: var(--text-main); line-height: 1.4; margin: 0; background: rgba(255,255,255,0.01); padding: 8px; border-radius: 6px; border-left: 3px solid #10b981;" id="phoneNotesText">
                                    Değerli mülk sahibimiz, projemizin kaba inşaat demir ve beton dökümleri tamamlanmış olup duvar örme aşamasına başlanacaktır.
                                </p>
                            </div>

                            <!-- Photos -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 10px;">📸 Güncel Fotoğraflar</h5>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // Interactive logic elements references
        const selectProj = document.getElementById('malikProjectSelect');
        const progressRange = document.getElementById('malikProgressRange');
        const progressVal = document.getElementById('malikProgressVal');
        const activeStage = document.getElementById('malikActiveStage');
        const inputCustName = document.getElementById('malikCustomerName');
        const inputCustPhone = document.getElementById('malikCustomerPhone');
        const inputCustEmail = document.getElementById('malikCustomerEmail');
        const txtNotes = document.getElementById('malikReportNotes');

        const phoneProjName = document.getElementById('phoneProjectName');
        const phoneProjAddr = document.getElementById('phoneProjectAddr');
        const phoneProgressText = document.getElementById('phoneProgressText');
        const phoneProgressCircle = document.getElementById('phoneProgressCircle');
        const phoneActiveStageText = document.getElementById('phoneActiveStageText');
        const phoneNotesText = document.getElementById('phoneNotesText');
        const tlActiveText = document.getElementById('tlActiveText');
        const tlActivePercent = document.getElementById('tlActivePercent');

        // Circle calculation variables
        const radius = 52;
        const circumference = 2 * Math.PI * radius; // 326.72

        const updateCircleProgress = (percent) => {
            const offset = circumference - (percent / 100 * circumference);
            phoneProgressCircle.style.strokeDashoffset = offset;
            phoneProgressText.textContent = `%${percent}`;
            progressVal.textContent = `%${percent}`;
            tlActivePercent.textContent = `%${percent} seviyesinde`;
        };

        // Event Listeners
        progressRange.oninput = () => {
            updateCircleProgress(progressRange.value);
        };

        activeStage.onchange = () => {
            const val = activeStage.value;
            phoneActiveStageText.textContent = val;
            tlActiveText.textContent = val;
        };

        txtNotes.oninput = () => {
            phoneNotesText.textContent = txtNotes.value || 'Not girilmedi.';
        };

        selectProj.onchange = () => {
            const selId = selectProj.value;
            if (!selId) return;
            const p = projects.find(item => item.id.toString() === selId.toString());
            if (p) {
                phoneProjName.textContent = p.name;
                phoneProjAddr.textContent = p.location || 'Şantiye Alanı';
                
                // Adjust default progress based on actual project progress if it exists
                const progressNum = p.progress ? parseInt(p.progress.replace('%','')) : 45;
                progressRange.value = progressNum;
                updateCircleProgress(progressNum);
            }
        };

        // Initialize progress
        updateCircleProgress(65);

        // Send WhatsApp Action
        document.getElementById('btnSendReportWhatsapp').onclick = () => {
            const custName = inputCustName.value.trim();
            const custPhone = inputCustPhone.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;

            if (!custName || !custPhone) {
                alert('Lütfen malik adı ve telefon numarasını doldurun!');
                return;
            }

            const message = `Sayın ${custName}, ${projName} inşaatımızda güncel ilerleme seviyesi %${progress} oranına ulaşmıştır. Aktif aşama: ${stage}. Detayları incelemek için rapor linkiniz: http://brener.com.tr/rapor/malik-382a`;
            const encodedMsg = encodeURIComponent(message);
            const waUrl = `https://api.whatsapp.com/send?phone=${custPhone}&text=${encodedMsg}`;

            window.BrenerApp.showToast('success', `${custName} adlı malike WhatsApp rapor taslağı oluşturuldu. WhatsApp Web/Uygulaması açılıyor.`);
            window.BrenerApp.logActivity('santiye', `${custName} malikine WhatsApp ilerleme raporu gönderildi: %${progress}`, 'success', message);
            
            setTimeout(() => {
                window.open(waUrl, '_blank');
            }, 1000);
        };

        // Send Email Action
        document.getElementById('btnSendReportEmail').onclick = () => {
            const custName = inputCustName.value.trim();
            const custEmail = inputCustEmail.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;
            const notes = txtNotes.value.trim();

            if (!custName || !custEmail) {
                alert('Lütfen malik adı ve e-posta adresini doldurun!');
                return;
            }

            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 500px; border: 1px solid #ddd; border-radius: 12px; padding: 24px; background: #fff; color: #333;">
                    <h3 style="color: #10b981; margin-top: 0;">BRENER GROUP - İlerleyiş Raporu</h3>
                    <p>Sayın <strong>${custName}</strong>,</p>
                    <p><strong>${projName}</strong> projesine ait güncel ilerleme ve saha durumu bilgileri aşağıdaki gibidir:</p>
                    <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin: 16px 0;">
                        <strong>İlerleme Seviyesi:</strong> %${progress} tamamlandı<br>
                        <strong>Aktif Aşama:</strong> ${stage}
                    </div>
                    <p><strong>Mühendis Notu:</strong><br>${notes}</p>
                    <p style="font-size: 0.85rem; color: #666;">Güncel fotoğraflar ve detaylar rapora eklenmiştir.</p>
                </div>
            `;

            const modalHtml = `
                <div style="padding: 16px;">
                    <div class="form-group">
                        <label>Alıcı</label>
                        <input type="text" value="${custEmail}" disabled style="width:100%; opacity:0.6;">
                    </div>
                    <div class="form-group">
                        <label>E-Posta Şablon Önizleme</label>
                        <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: rgba(255,255,255,0.02); max-height: 250px; overflow-y: auto;">
                            ${emailHtml}
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; margin-top:20px; justify-content:flex-end;">
                        <button class="btn btn-secondary" onclick="window.BrenerApp.closeModal()">Kapat</button>
                        <button class="btn btn-primary" id="btnConfirmSendEmail" style="background:#10b981; border:none; color:white;">E-Postayı Gönder</button>
                    </div>
                </div>
            `;

            window.BrenerApp.openModal('📧 Malik E-Posta Gönderim Taslağı', modalHtml);

            document.getElementById('btnConfirmSendEmail').onclick = () => {
                window.BrenerApp.closeModal();
                window.BrenerApp.showToast('success', `${custName} malikine bilgilendirme e-postası başarıyla gönderildi.`);
                window.BrenerApp.logActivity('santiye', `${custName} malikine e-posta ilerleme raporu gönderildi`, 'success', `Alıcı: ${custEmail}, İlerleme: %${progress}`);
            };
        };

    },
    
    renderMusteriRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Müşteri Raporu', 'Profesyonel maliyet tahmin raporu oluşturun');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        // State definition for selected colors and values
        let selectedReportType = 'Detaylı Rapor';
        let currentThemeColor = '#3b82f6'; // Default Blue

        let html = `
            <style>
                .report-type-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .report-type-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                }
                .report-type-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
                .report-type-card.selected {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.04);
                }
                .report-type-card.selected::before {
                    content: "✔";
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #3b82f6;
                    color: white;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                }
                .theme-circle {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                }
                .theme-circle.selected {
                    border-color: #fff;
                    transform: scale(1.15);
                    box-shadow: 0 0 8px rgba(255,255,255,0.4);
                }
                .preview-stat-card {
                    background: var(--primary);
                    color: #000;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    margin-bottom: 20px;
                    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.15);
                    transition: all 0.3s;
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📄 Müşteri Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Profesyonel maliyet tahmin raporu oluşturun</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-sm" id="btnLoadReportDemo" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px; padding: 8px 16px; font-weight: 600;">Demo Veri</button>
                    <button class="btn btn-sm" id="btnDownloadReportPdf" style="background: white; border: none; color: #3b82f6; border-radius: 6px; padding: 8px 16px; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">📥 PDF İndir</button>
                </div>
            </div>

            <!-- Report Type Grid Selection -->
            <div class="report-type-grid">
                <div class="report-type-card selected" data-type="Detaylı Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                    <strong style="display: block; font-size: 0.9rem;">Detaylı Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Tüm iş kalemleri, kategori tabloları</span>
                </div>
                <div class="report-type-card" data-type="Özet Rapor">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📷</div>
                    <strong style="display: block; font-size: 0.9rem;">Özet Rapor</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Kategori özetleri, metraj bilgileri</span>
                </div>
                <div class="report-type-card" data-type="Yönetici Raporu">
                    <div style="font-size: 1.5rem; margin-bottom: 8px;">📑</div>
                    <strong style="display: block; font-size: 0.9rem;">Yönetici Raporu</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 4px;">Sadece toplam ve dağılım</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Forms Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje Seç Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 12px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📂 Proje Seç</h2>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mevcut bir projeden maliyet verisi yükle</label>
                            <select id="reportProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Firma Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">🏢 Firma Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Firma Adı</label>
                                <input type="text" id="reportFirmaAd" value="Brener" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Firma Logosu</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <div style="width: 80px; height: 38px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: var(--text-muted);">Logo Yok</div>
                                    <button class="btn btn-secondary btn-sm" style="padding: 10px 14px;">⚡ Yükle</button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group" style="margin-top: 10px; margin-bottom: 0;">
                            <label>Renk Teması</label>
                            <div style="display: flex; gap: 10px;">
                                <div class="theme-circle selected" data-color="#3b82f6" style="background: #3b82f6;"></div>
                                <div class="theme-circle" data-color="#10b981" style="background: #10b981;"></div>
                                <div class="theme-circle" data-color="#f97316" style="background: #f97316;"></div>
                                <div class="theme-circle" data-color="#8b5cf6" style="background: #8b5cf6;"></div>
                                <div class="theme-circle" data-color="#4b5563" style="background: #4b5563;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">👤 Müşteri Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Ad Soyad</label>
                            <input type="text" id="reportMusteriAd" placeholder="Müşteri adı soyadı" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon</label>
                                <input type="text" id="reportMusteriTel" placeholder="0532 xxx xx xx" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-posta</label>
                                <input type="email" id="reportMusteriEmail" placeholder="ornek@email.com" style="width: 100%;">
                            </div>
                        </div>
                    </div>

                    <!-- Proje Bilgileri Card -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2 style="font-size: 1rem; display: flex; align-items: center; gap: 6px;">📍 Proje Bilgileri</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Proje Adı</label>
                                <input type="text" id="reportProjeAd" value="${activeProj ? activeProj.name : 'Örnek Villa Projesi'}" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>Proje Adresi</label>
                                <input type="text" id="reportProjeAdres" value="${activeProj ? activeProj.location : ''}" placeholder="Proje adresi" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Açıklama</label>
                            <textarea id="reportProjeAciklama" rows="2" style="width: 100%;">${activeProj ? `${activeProj.type} - ${activeProj.blocks || 1} Blok` : 'Konut - 3 kat, 150 m²'}</textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Notlar (Rapora eklenecek)</label>
                            <textarea id="reportProjeNotlar" rows="2" placeholder="Müşteriye iletilecek özel notlar" style="width: 100%;"></textarea>
                        </div>
                    </div>

                </div>

                <!-- Right Preview Column -->
                <div>
                    <div class="card" style="padding: 24px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 20px;">
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
                            <span>Seçili Rapor:</span>
                            <span id="previewReportTypeLabel" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-weight: bold;">📝 Detaylı Rapor</span>
                        </div>

                        <!-- Big Cost Stat Card -->
                        <div class="preview-stat-card" id="reportCostStatCard" style="background: #3b82f6; color: white;">
                            <div style="font-size: 0.85rem; opacity: 0.95; font-weight: 500;">Tahmini Toplam Maliyet</div>
                            <div style="font-size: 1.85rem; font-weight: 800; margin: 8px 0;" id="previewTotalCostVal">15.750.000 ₺</div>
                            <div style="font-size: 0.82rem; opacity: 0.9;" id="previewPerSqmVal">35.000 ₺/m²</div>
                        </div>

                        <!-- Three Sub-stats -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Brüt Alan</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewAreaVal">450 m²</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Kat Sayısı</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;" id="previewFloorsVal">3</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 4px;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">İş Kalemi</div>
                                <strong style="font-size: 0.88rem; display: block; margin-top: 4px;">11</strong>
                            </div>
                        </div>
                        <div style="text-align: center; font-size: 0.76rem; color: var(--text-muted);" id="previewProjectSub">
                            Proje: Örnek Villa Projesi
                        </div>

                        <!-- Maliyet Dağılımı (Progress Bars) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">📊 Maliyet Dağılımı</h3>
                            
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>🔨 Malzeme</span>
                                    <strong id="previewMaterialCost">9.450.000 ₺ (%60)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbMaterial" style="width: 60%; background: #3b82f6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>👤 İşçilik</span>
                                    <strong id="previewLaborCost">4.725.000 ₺ (%30)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbLabor" style="width: 30%; background: #f97316; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>

                            <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
                                    <span>📦 Ekipman</span>
                                    <strong id="previewEquipmentCost">1.575.000 ₺ (%10)</strong>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                                    <div class="progress-bar-fill" id="pbEquipment" style="width: 10%; background: #8b5cf6; border-radius: 3px; height: 6px;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Kategori Dağılımı (SVG Donut Chart) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">🍩 Kategori Dağılımı</h3>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
                                <!-- SVG Donut -->
                                <svg width="100" height="100" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4.2"></circle>
                                    
                                    <!-- Kaba Insaat - 40% (stroke-dasharray: 40 60) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" stroke-width="4.2" stroke-dasharray="40 60" stroke-dashoffset="25"></circle>
                                    
                                    <!-- Ince Insaat - 30% (stroke-dasharray: 30 70) -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" stroke-width="4.2" stroke-dasharray="30 70" stroke-dashoffset="85"></circle>
                                    
                                    <!-- Tesisat - 20% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" stroke-width="4.2" stroke-dasharray="20 80" stroke-dashoffset="115"></circle>
                                    
                                    <!-- Dis Cephe - 10% -->
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" stroke-width="4.2" stroke-dasharray="10 90" stroke-dashoffset="135"></circle>
                                </svg>
                                <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem;">
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 2px;"></span> Kaba İnşaat (40%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> İnce İnşaat (30%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #f97316; border-radius: 2px;"></span> Tesisat (20%)</div>
                                    <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></span> Dış Cephe (10%)</div>
                                </div>
                            </div>
                        </div>

                        <!-- İş Kalemleri Detayı (Accordion List) -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">📝 İş Kalemleri Detayı</h3>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Kaba İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valKaba">6.300.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>İnce İnşaat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valInce">4.725.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(249, 115, 22, 0.15); color: #f97316; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">3</span>
                                        <strong>Tesisat</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valTesisat">3.150.000 ₺</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem;">2</span>
                                        <strong>Dış Cephe</strong>
                                    </div>
                                    <span style="color: var(--text-main); font-weight: bold;" id="valDis">1.575.000 ₺</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // UI Element Event Handlers
        const reportCards = container.querySelectorAll('.report-type-card');
        const previewTypeLabel = document.getElementById('previewReportTypeLabel');

        reportCards.forEach(card => {
            card.onclick = () => {
                reportCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedReportType = card.getAttribute('data-type');
                previewTypeLabel.textContent = `📝 ${selectedReportType}`;
            };
        });

        // Theme Circles Click Event
        const themeCircles = container.querySelectorAll('.theme-circle');
        const costCard = document.getElementById('reportCostStatCard');

        themeCircles.forEach(circle => {
            circle.onclick = () => {
                themeCircles.forEach(c => c.classList.remove('selected'));
                circle.classList.add('selected');
                currentThemeColor = circle.getAttribute('data-color');
                costCard.style.background = currentThemeColor;
            };
        });

        // Dynamic project selection calculations
        const projectSelect = document.getElementById('reportProjectSelect');
        const inputProjeAd = document.getElementById('reportProjeAd');
        const inputProjeAdres = document.getElementById('reportProjeAdres');
        const txtProjeAciklama = document.getElementById('reportProjeAciklama');

        const valCost = document.getElementById('previewTotalCostVal');
        const valPerSqm = document.getElementById('previewPerSqmVal');
        const valArea = document.getElementById('previewAreaVal');
        const valFloors = document.getElementById('previewFloorsVal');
        const txtProjectSub = document.getElementById('previewProjectSub');

        const labelMaterial = document.getElementById('previewMaterialCost');
        const labelLabor = document.getElementById('previewLaborCost');
        const labelEquipment = document.getElementById('previewEquipmentCost');

        const pbM = document.getElementById('pbMaterial');
        const pbL = document.getElementById('pbLabor');
        const pbE = document.getElementById('pbEquipment');

        const valKaba = document.getElementById('valKaba');
        const valInce = document.getElementById('valInce');
        const valTesisat = document.getElementById('valTesisat');
        const valDis = document.getElementById('valDis');

        const updatePreviewValues = (projectData) => {
            if (!projectData) {
                // Set default/villa project values
                valCost.textContent = '15.750.000 ₺';
                valPerSqm.textContent = '35.000 ₺/m²';
                valArea.textContent = '450 m²';
                valFloors.textContent = '3';
                txtProjectSub.textContent = 'Proje: Örnek Villa Projesi';

                labelMaterial.textContent = '9.450.000 ₺ (%60)';
                labelLabor.textContent = '4.725.000 ₺ (%30)';
                labelEquipment.textContent = '1.575.000 ₺ (%10)';

                pbM.style.width = '60%';
                pbL.style.width = '30%';
                pbE.style.width = '10%';

                valKaba.textContent = '6.300.000 ₺';
                valInce.textContent = '4.725.000 ₺';
                valTesisat.textContent = '3.150.000 ₺';
                valDis.textContent = '1.575.000 ₺';
                return;
            }

            // Estimate total cost based on square meters
            const area = parseInt(projectData.area) || 300;
            const floors = parseInt(projectData.floors) || 2;
            const multiplier = projectData.type === 'Villa' ? 42000 : projectData.type === 'Apartman' ? 32000 : 25000;
            const totalCost = area * multiplier;

            // Formatted values
            valCost.textContent = `${totalCost.toLocaleString('tr-TR')} ₺`;
            valPerSqm.textContent = `${multiplier.toLocaleString('tr-TR')} ₺/m²`;
            valArea.textContent = `${area} m²`;
            valFloors.textContent = floors;
            txtProjectSub.textContent = `Proje: ${projectData.name}`;

            // Cost breakdowns
            const material = totalCost * 0.58;
            const labor = totalCost * 0.32;
            const equip = totalCost * 0.10;

            labelMaterial.textContent = `${material.toLocaleString('tr-TR')} ₺ (%58)`;
            labelLabor.textContent = `${labor.toLocaleString('tr-TR')} ₺ (%32)`;
            labelEquipment.textContent = `${equip.toLocaleString('tr-TR')} ₺ (%10)`;

            pbM.style.width = '58%';
            pbL.style.width = '32%';
            pbE.style.width = '10%';

            // Categories breakdowns
            valKaba.textContent = `${(totalCost * 0.42).toLocaleString('tr-TR')} ₺`;
            valInce.textContent = `${(totalCost * 0.28).toLocaleString('tr-TR')} ₺`;
            valTesisat.textContent = `${(totalCost * 0.20).toLocaleString('tr-TR')} ₺`;
            valDis.textContent = `${(totalCost * 0.10).toLocaleString('tr-TR')} ₺`;
        };

        projectSelect.onchange = () => {
            const selectedId = projectSelect.value;
            if (!selectedId) {
                inputProjeAd.value = '';
                inputProjeAdres.value = '';
                txtProjeAciklama.value = '';
                updatePreviewValues(null);
                return;
            }

            const p = projects.find(item => item.id.toString() === selectedId.toString());
            if (p) {
                inputProjeAd.value = p.name;
                inputProjeAdres.value = p.location || '';
                txtProjeAciklama.value = `${p.type} - ${p.area} m², ${p.floors || 2} Kat`;
                updatePreviewValues(p);
            }
        };

        // Form Inputs event listeners to update right column titles
        inputProjeAd.oninput = () => {
            txtProjectSub.textContent = `Proje: ${inputProjeAd.value || 'Belirtilmedi'}`;
        };

        // Demo Data Button Action
        document.getElementById('btnLoadReportDemo').onclick = () => {
            document.getElementById('reportMusteriAd').value = 'Hakan Demir';
            document.getElementById('reportMusteriTel').value = '0533 999 88 77';
            document.getElementById('reportMusteriEmail').value = 'hakan.demir@demirholding.com';
            
            inputProjeAd.value = 'Marmara Plaza Restorasyon';
            inputProjeAdres.value = 'Kadıköy, İstanbul';
            txtProjeAciklama.value = 'Eski Eser Restorasyon ve Güçlendirme';
            
            valCost.textContent = '28.400.000 ₺';
            valPerSqm.textContent = '48.000 ₺/m²';
            valArea.textContent = '600 m²';
            valFloors.textContent = '4';
            txtProjectSub.textContent = 'Proje: Marmara Plaza Restorasyon';

            labelMaterial.textContent = '17.040.000 ₺ (%60)';
            labelLabor.textContent = '8.520.000 ₺ (%30)';
            labelEquipment.textContent = '2.840.000 ₺ (%10)';

            pbM.style.width = '60%';
            pbL.style.width = '30%';
            pbE.style.width = '10%';

            valKaba.textContent = '11.360.000 ₺';
            valInce.textContent = '8.520.000 ₺';
            valTesisat.textContent = '5.680.000 ₺';
            valDis.textContent = '2.840.000 ₺';

            window.BrenerApp.showToast('success', 'Müşteri raporu için demo veriler yüklendi.');
        };

        // Download PDF simulation
        document.getElementById('btnDownloadReportPdf').onclick = () => {
            window.BrenerApp.showToast('success', 'Müşteri Tahmin Raporu PDF formatında başarıyla indirildi!');
        };
    },

    renderMalikRaporu(container) {
        window.BrenerApp.updateTopbarTitle('Malik Raporu', 'Projelerin İlerlemesi ve Malik Bilgilendirme Raporu');

        const activeProj = window.BrenerApp.getActiveProject();
        const projects = window.BrenerApp.state.projects || [];

        let html = `
            <style>
                .progress-ring {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                }
                .progress-ring svg {
                    transform: rotate(-90deg);
                }
                .progress-ring-circle {
                    transition: stroke-dashoffset 0.35s;
                    transform-origin: 50% 50%;
                }
                .photo-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-top: 10px;
                }
                .photo-thumb {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    height: 80px;
                    overflow: hidden;
                    position: relative;
                    cursor: pointer;
                }
                .photo-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .photo-thumb .photo-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    font-size: 0.62rem;
                    text-align: center;
                    padding: 3px 0;
                }
                .preview-phone {
                    background: var(--bg-card);
                    border: 12px solid #222;
                    border-radius: 36px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
                    max-width: 320px;
                    margin: 0 auto;
                    overflow: hidden;
                    position: relative;
                }
                .preview-phone-screen {
                    height: 520px;
                    overflow-y: auto;
                    padding: 16px;
                    font-size: 0.85rem;
                }
                .timeline-step {
                    display: flex;
                    gap: 12px;
                    position: relative;
                    margin-bottom: 20px;
                }
                .timeline-step::before {
                    content: "";
                    position: absolute;
                    top: 18px;
                    left: 9px;
                    bottom: -22px;
                    width: 2px;
                    background: var(--border-color);
                    z-index: 1;
                }
                .timeline-step:last-child::before {
                    display: none;
                }
                .timeline-dot {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                    font-weight: bold;
                    z-index: 2;
                }
                .timeline-dot.completed {
                    background: #10b981;
                    color: white;
                }
                .timeline-dot.active {
                    background: #3b82f6;
                    color: white;
                    box-shadow: 0 0 8px rgba(59,130,246,0.5);
                }
                .timeline-dot.pending {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid var(--border-color);
                    color: var(--text-muted);
                }
            </style>

            <!-- Top Banner -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 24px; color: #fff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">📋 Malik Raporu</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Mülk ve arsa sahipleri için projelerin ilerleme ve fotoğraf raporunu oluşturup gönderin</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start;">
                
                <!-- Left Configuration Column -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Proje & İlerleme Seç -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>🏢 Proje Seç & İlerleme</h2>
                        </div>
                        <div class="form-group">
                            <label>Raporlanacak Proje</label>
                            <select id="malikProjectSelect" style="width: 100%;">
                                <option value="">Proje seçin...</option>
                                ${projects.map(p => `<option value="${p.id}" ${activeProj && activeProj.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>İlerleme Yüzdesi (%)</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="range" id="malikProgressRange" min="0" max="100" value="65" style="flex: 1;">
                                    <strong id="malikProgressVal" style="width: 40px; text-align: right; font-size: 1rem; color: var(--primary);">%65</strong>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Aktif Aşama</label>
                                <select id="malikActiveStage" style="width: 100%;">
                                    <option value="Temel İmalatı">Temel İmalatı</option>
                                    <option value="Kaba İnşaat (Betonarme)" selected>Kaba İnşaat (Betonarme)</option>
                                    <option value="Duvar İmalatları">Duvar İmalatları</option>
                                    <option value="İnce İşler (Alçı & Boya)">İnce İşler (Alçı & Boya)</option>
                                    <option value="Cephe Kaplama">Cephe Kaplama</option>
                                    <option value="Çevre Düzenleme">Çevre Düzenleme</option>
                                    <option value="Anahtar Teslim">Anahtar Teslim</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri (Malik) Bilgileri -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>👤 Malik (Müşteri) Bilgileri</h2>
                        </div>
                        <div class="form-group">
                            <label>Adı Soyadı</label>
                            <input type="text" id="malikCustomerName" value="Mustafa Koç" style="width: 100%;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Telefon (WhatsApp Gönderimi İçin)</label>
                                <input type="text" id="malikCustomerPhone" value="05321112233" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label>E-Posta</label>
                                <input type="email" id="malikCustomerEmail" value="mustafa.koc@gmail.com" style="width: 100%;">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Mühendis Rapor Notu (Malike İletilecek)</label>
                            <textarea id="malikReportNotes" rows="3" style="width: 100%;">Değerli mülk sahibimiz, projemizin betonarme karkas imalatları başarıyla tamamlanmış olup ince işler aşamasına geçilmiştir. Güncel durum fotoğraflarını aşağıdan inceleyebilirsiniz.</textarea>
                        </div>
                    </div>

                    <!-- Şantiye Fotoğrafları -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 8px;">
                            <h2>📷 Güncel İlerleme Fotoğrafları</h2>
                        </div>
                        <p style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 12px;">Raporda görüntülenecek 3 adet şantiye fotoğrafı seçin veya yeni yükleyin</p>
                        
                        <div class="photo-grid">
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Temel Demiri</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Kolon Betonu</div>
                            </div>
                            <div class="photo-thumb">
                                <img src="https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=150&q=80">
                                <div class="photo-overlay">Duvar İmalatı</div>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 12px;">➕ Yeni Fotoğraf Ekle</button>
                    </div>

                    <!-- Gönderim Kanalları -->
                    <div class="card" style="border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.02);">
                        <div class="card-header" style="margin-bottom: 16px;">
                            <h2>📤 Raporu Malik'e Gönder</h2>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn" id="btnSendReportWhatsapp" style="flex: 1; background: #25d366; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);">
                                💬 WhatsApp ile Gönder
                            </button>
                            <button class="btn" id="btnSendReportEmail" style="flex: 1; background: #3b82f6; color: white; border: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);">
                                📧 E-Posta ile Gönder
                            </button>
                        </div>
                    </div>

                </div>

                <!-- Right Live Mobile Preview Column -->
                <div>
                    <h3 style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">📱 Malik Canlı Rapor Görünümü</h3>
                    
                    <!-- Mobile Mockup -->
                    <div class="preview-phone">
                        <div class="preview-phone-screen">
                            
                            <!-- Phone Top Bar -->
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px;">
                                <strong style="color: var(--primary);">BRENER GROUP</strong>
                                <span class="badge badge-success" style="font-size: 0.65rem;">İlerleme Raporu</span>
                            </div>

                            <!-- Project Title -->
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h4 style="font-size: 1.05rem; font-weight: 800; margin: 0;" id="phoneProjectName">Örnek Villa Projesi</h4>
                                <span style="font-size: 0.7rem; color: var(--text-muted);" id="phoneProjectAddr">Bodrum, Muğla</span>
                            </div>

                            <!-- Circular Progress Ring -->
                            <div class="progress-ring">
                                <svg width="120" height="120">
                                    <circle stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="transparent" r="52" cx="60" cy="60"></circle>
                                    <circle class="progress-ring-circle" id="phoneProgressCircle" stroke="#10b981" stroke-width="8" fill="transparent" r="52" cx="60" cy="60" stroke-dasharray="326.7" stroke-dashoffset="114.3"></circle>
                                </svg>
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <strong id="phoneProgressText" style="font-size: 1.35rem; font-weight: bold; color: white;">%65</strong>
                                    <span style="font-size: 0.6rem; color: var(--text-muted);">Tamamlandı</span>
                                </div>
                            </div>

                            <!-- Active Phase details -->
                            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
                                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Aktif İnşaat Aşaması</div>
                                <strong id="phoneActiveStageText" style="font-size: 0.85rem; color: #10b981; display: block; margin-top: 4px;">Kaba İnşaat (Betonarme)</strong>
                            </div>

                            <!-- Timeline -->
                            <div style="margin-bottom: 24px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 12px;">📋 İnşaat Aşamaları</h5>
                                
                                <div class="timeline-step">
                                    <div class="timeline-dot completed">✓</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;">Temel İmalatı</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">%100 Tamamlandı</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot active" id="tlDotActive">▶</div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block;" id="tlActiveText">Kaba İnşaat (Betonarme)</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);" id="tlActivePercent">Devam ediyor</span>
                                    </div>
                                </div>

                                <div class="timeline-step">
                                    <div class="timeline-dot pending"></div>
                                    <div>
                                        <strong style="font-size: 0.78rem; display: block; opacity: 0.6;">İnce İmalatlar & Cephe</strong>
                                        <span style="font-size: 0.65rem; color: var(--text-muted);">Başlamadı</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Engineer Notes -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-bottom: 20px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 6px;">✍️ Mühendis Notu</h5>
                                <p style="font-size: 0.74rem; color: var(--text-main); line-height: 1.4; margin: 0; background: rgba(255,255,255,0.01); padding: 8px; border-radius: 6px; border-left: 3px solid #10b981;" id="phoneNotesText">
                                    Değerli mülk sahibimiz, projemizin kaba inşaat demir ve beton dökümleri tamamlanmış olup duvar örme aşamasına başlanacaktır.
                                </p>
                            </div>

                            <!-- Photos -->
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                                <h5 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 10px;">📸 Güncel Fotoğraflar</h5>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                    <div style="border-radius: 6px; overflow: hidden; height: 90px; border: 1px solid var(--border-color);">
                                        <img src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // Interactive logic elements references
        const selectProj = document.getElementById('malikProjectSelect');
        const progressRange = document.getElementById('malikProgressRange');
        const progressVal = document.getElementById('malikProgressVal');
        const activeStage = document.getElementById('malikActiveStage');
        const inputCustName = document.getElementById('malikCustomerName');
        const inputCustPhone = document.getElementById('malikCustomerPhone');
        const inputCustEmail = document.getElementById('malikCustomerEmail');
        const txtNotes = document.getElementById('malikReportNotes');

        const phoneProjName = document.getElementById('phoneProjectName');
        const phoneProjAddr = document.getElementById('phoneProjectAddr');
        const phoneProgressText = document.getElementById('phoneProgressText');
        const phoneProgressCircle = document.getElementById('phoneProgressCircle');
        const phoneActiveStageText = document.getElementById('phoneActiveStageText');
        const phoneNotesText = document.getElementById('phoneNotesText');
        const tlActiveText = document.getElementById('tlActiveText');
        const tlActivePercent = document.getElementById('tlActivePercent');

        // Circle calculation variables
        const radius = 52;
        const circumference = 2 * Math.PI * radius; // 326.72

        const updateCircleProgress = (percent) => {
            const offset = circumference - (percent / 100 * circumference);
            phoneProgressCircle.style.strokeDashoffset = offset;
            phoneProgressText.textContent = `%${percent}`;
            progressVal.textContent = `%${percent}`;
            tlActivePercent.textContent = `%${percent} seviyesinde`;
        };

        // Event Listeners
        progressRange.oninput = () => {
            updateCircleProgress(progressRange.value);
        };

        activeStage.onchange = () => {
            const val = activeStage.value;
            phoneActiveStageText.textContent = val;
            tlActiveText.textContent = val;
        };

        txtNotes.oninput = () => {
            phoneNotesText.textContent = txtNotes.value || 'Not girilmedi.';
        };

        selectProj.onchange = () => {
            const selId = selectProj.value;
            if (!selId) return;
            const p = projects.find(item => item.id.toString() === selId.toString());
            if (p) {
                phoneProjName.textContent = p.name;
                phoneProjAddr.textContent = p.location || 'Şantiye Alanı';
                
                // Adjust default progress based on actual project progress if it exists
                const progressNum = p.progress ? parseInt(p.progress.replace('%','')) : 45;
                progressRange.value = progressNum;
                updateCircleProgress(progressNum);
            }
        };

        // Initialize progress
        updateCircleProgress(65);

        // Send WhatsApp Action
        document.getElementById('btnSendReportWhatsapp').onclick = () => {
            const custName = inputCustName.value.trim();
            const custPhone = inputCustPhone.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;

            if (!custName || !custPhone) {
                alert('Lütfen malik adı ve telefon numarasını doldurun!');
                return;
            }

            const message = `Sayın ${custName}, ${projName} inşaatımızda güncel ilerleme seviyesi %${progress} oranına ulaşmıştır. Aktif aşama: ${stage}. Detayları incelemek için rapor linkiniz: http://brener.com.tr/rapor/malik-382a`;
            const encodedMsg = encodeURIComponent(message);
            const waUrl = `https://api.whatsapp.com/send?phone=${custPhone}&text=${encodedMsg}`;

            window.BrenerApp.showToast('success', `${custName} adlı malike WhatsApp rapor taslağı oluşturuldu. WhatsApp Web/Uygulaması açılıyor.`);
            window.BrenerApp.logActivity('santiye', `${custName} malikine WhatsApp ilerleme raporu gönderildi: %${progress}`, 'success', message);
            
            setTimeout(() => {
                window.open(waUrl, '_blank');
            }, 1000);
        };

        // Send Email Action
        document.getElementById('btnSendReportEmail').onclick = () => {
            const custName = inputCustName.value.trim();
            const custEmail = inputCustEmail.value.trim();
            const projName = selectProj.options[selectProj.selectedIndex]?.text || 'Proje';
            const progress = progressRange.value;
            const stage = activeStage.value;
            const notes = txtNotes.value.trim();

            if (!custName || !custEmail) {
                alert('Lütfen malik adı ve e-posta adresini doldurun!');
                return;
            }

            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 500px; border: 1px solid #ddd; border-radius: 12px; padding: 24px; background: #fff; color: #333;">
                    <h3 style="color: #10b981; margin-top: 0;">BRENER GROUP - İlerleyiş Raporu</h3>
                    <p>Sayın <strong>${custName}</strong>,</p>
                    <p><strong>${projName}</strong> projesine ait güncel ilerleme ve saha durumu bilgileri aşağıdaki gibidir:</p>
                    <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin: 16px 0;">
                        <strong>İlerleme Seviyesi:</strong> %${progress} tamamlandı<br>
                        <strong>Aktif Aşama:</strong> ${stage}
                    </div>
                    <p><strong>Mühendis Notu:</strong><br>${notes}</p>
                    <p style="font-size: 0.85rem; color: #666;">Güncel fotoğraflar ve detaylar rapora eklenmiştir.</p>
                </div>
            `;

            const modalHtml = `
                <div style="padding: 16px;">
                    <div class="form-group">
                        <label>Alıcı</label>
                        <input type="text" value="${custEmail}" disabled style="width:100%; opacity:0.6;">
                    </div>
                    <div class="form-group">
                        <label>E-Posta Şablon Önizleme</label>
                        <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: rgba(255,255,255,0.02); max-height: 250px; overflow-y: auto;">
                            ${emailHtml}
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; margin-top:20px; justify-content:flex-end;">
                        <button class="btn btn-secondary" onclick="window.BrenerApp.closeModal()">Kapat</button>
                        <button class="btn btn-primary" id="btnConfirmSendEmail" style="background:#10b981; border:none; color:white;">E-Postayı Gönder</button>
                    </div>
                </div>
            `;

            window.BrenerApp.openModal('📧 Malik E-Posta Gönderim Taslağı', modalHtml);

            document.getElementById('btnConfirmSendEmail').onclick = () => {
                window.BrenerApp.closeModal();
                window.BrenerApp.showToast('success', `${custName} malikine bilgilendirme e-postası başarıyla gönderildi.`);
                window.BrenerApp.logActivity('santiye', `${custName} malikine e-posta ilerleme raporu gönderildi`, 'success', `Alıcı: ${custEmail}, İlerleme: %${progress}`);
            };
        };

    },
    };