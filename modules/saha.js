/* ==========================================================================
   BRENER GROUP - FIELD OPERATIONS & KANBAN SERVICE MODULE (SAHA & SERVİS)
   ========================================================================== */

window.BrenerApp.Saha = {
    render(view, container) {
        const activeProj = window.BrenerApp.getActiveProject();

        if (view === 'musteri-cari') {
            this.renderCustomers(container);
        } else if (view === 'is-emirleri') {
            this.renderKanban(container);
        } else if (view === 'tadilat-formu') {
            this.renderRepairForm(container);
        } else if (view === 'siparis-fisi') {
            this.renderOrderSlip(container);
        } else if (view === 'servis-teklifi') {
            this.renderServiceOffer(container);
        } else if (view === 'randevu-takvimi') {
            this.renderCalendar(container);
        }
    },

    // 1. Müşteriler & Cari
    renderCustomers(container) {
        window.BrenerApp.updateTopbarTitle('Müşteri & Cari Takibi', 'Şantiye Müşterileri, Taşeron ve Cari Ekstreler');

        let html = `
            <div class="card">
                <div class="card-header" style="margin-bottom: 20px;">
                    <h2>Aktif Cari Hesaplar</h2>
                    <button class="btn btn-primary btn-sm" id="addNewCustBtn">Yeni Cari Kartı Ekle</button>
                </div>
                
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Cari Ünvanı / Müşteri</th>
                                <th>İletişim E-Posta</th>
                                <th>Telefon No</th>
                                <th>Cari Bakiye Durumu</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        window.BrenerApp.state.customers.forEach(c => {
            const isDebt = c.balance < 0;
            html += `
                <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.email}</td>
                    <td>${c.phone}</td>
                    <td style="font-weight: 700; ${isDebt ? 'color: var(--danger);' : c.balance > 0 ? 'color: var(--success);' : ''}">
                        ${c.balance.toLocaleString('tr-TR')} ₺
                    </td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="window.BrenerApp.Saha.showCustLedger(${c.id})">Ekstre Al</button>
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;

        document.getElementById('addNewCustBtn').onclick = () => {
            const formHtml = `
                <div class="form-group">
                    <label>Müşteri / Cari Ünvanı</label>
                    <input type="text" id="newCustName" placeholder="Örn: Tekin İnşaat Malzemeleri Ltd." required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>E-Posta</label>
                        <input type="email" id="newCustEmail" placeholder="info@tekin.com">
                    </div>
                    <div class="form-group">
                        <label>Telefon</label>
                        <input type="text" id="newCustPhone" placeholder="0532...">
                    </div>
                </div>
                <div class="form-group">
                    <label>Açılış Bakiyesi (Alacaklı ise pozitif, borçlu ise negatif girin - TL)</label>
                    <input type="number" id="newCustBalance" value="0">
                </div>
                <button class="btn btn-primary" id="saveNewCustBtn" style="width: 100%; margin-top: 10px;">Cari Kaydet</button>
            `;
            window.BrenerApp.openModal('Yeni Cari Hesap Ekle', formHtml);

            document.getElementById('saveNewCustBtn').onclick = () => {
                const name = document.getElementById('newCustName').value.trim();
                const email = document.getElementById('newCustEmail').value.trim() || '-';
                const phone = document.getElementById('newCustPhone').value.trim() || '-';
                const balance = parseFloat(document.getElementById('newCustBalance').value) || 0;

                if (!name) {
                    alert('Lütfen Cari Ünvanı girin!');
                    return;
                }

                window.BrenerApp.state.customers.push({
                    id: Date.now(),
                    name,
                    email,
                    phone,
                    balance
                });

                window.BrenerApp.saveStateToStorage();
                window.BrenerApp.logActivity('saha', `Yeni cari hesap oluşturuldu: ${name}`, 'success', `Telefon: ${phone}, E-posta: ${email}, Bakiye: ${balance} TL`);
                window.BrenerApp.showToast('success', `${name} cari hesabı açıldı.`);
                document.getElementById('modalCloseBtn').click();
                this.renderCustomers(container);
            };
        };
    },

    showCustLedger(id) {
        const cust = window.BrenerApp.state.customers.find(c => c.id === id);
        if (!cust) return;

        const ledgerHtml = `
            <div style="font-size: 0.85rem; margin-bottom: 16px;">
                <strong>Cari Adı:</strong> ${cust.name} <br>
                <strong>Bakiye:</strong> ${cust.balance.toLocaleString('tr-TR')} TL
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>Açıklama</th>
                            <th>Borç (TL)</th>
                            <th>Alacak (TL)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>20.06.2026</td>
                            <td>Açılış Devir Kaydı</td>
                            <td>${cust.balance < 0 ? Math.abs(cust.balance).toLocaleString('tr-TR') : '0'} ₺</td>
                            <td>${cust.balance >= 0 ? cust.balance.toLocaleString('tr-TR') : '0'} ₺</td>
                        </tr>
                        <tr>
                            <td>22.06.2026</td>
                            <td>Malzeme Alımı Faturası</td>
                            <td>120,000 ₺</td>
                            <td>0 ₺</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="window.BrenerApp.showToast('success', 'Hesap ekstresi PDF olarak indirildi.')">Ekstre PDF İndir</button>
        `;
        window.BrenerApp.openModal(`${cust.name} Cari Hesap Ekstresi`, ledgerHtml);
    },

    // 2. İş Emirleri (Kanban Board)
    renderKanban(container) {
        window.BrenerApp.updateTopbarTitle('İş Emirleri Panosu', 'Şantiyede Ustalar ve Mühendisler İçin Kanban Akış Kartları');

        const tasks = window.BrenerApp.state.workOrders;

        let todoHtml = '';
        let progressHtml = '';
        let testingHtml = '';
        let completedHtml = '';

        tasks.forEach(t => {
            const cardHtml = `
                <div class="card" style="margin-bottom: 12px; padding: 14px; border-left: 4px solid ${t.priority === 'high' ? 'var(--danger)' : 'var(--primary)'};">
                    <span class="badge ${t.priority === 'high' ? 'badge-danger' : 'badge-warning'}" style="font-size: 0.6rem; margin-bottom: 6px;">
                        ${t.priority === 'high' ? 'Yüksek' : 'Orta'}
                    </span>
                    <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">${t.title}</h4>
                    <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.3; margin-bottom: 10px;">${t.desc}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; color: var(--text-muted);">
                        <span>👤 ${t.assignedTo}</span>
                        <div style="display: flex; gap: 4px;">
                            ${t.status === 'todo' ? `<button class="btn btn-sm btn-primary" style="padding: 2px 6px; font-size: 0.65rem;" onclick="window.BrenerApp.Saha.moveTask(${t.id}, 'progress')">Başlat</button>` : ''}
                            ${t.status === 'progress' ? `<button class="btn btn-sm btn-secondary" style="padding: 2px 6px; font-size: 0.65rem;" onclick="window.BrenerApp.Saha.moveTask(${t.id}, 'testing')">Test Et</button>` : ''}
                            ${t.status === 'testing' ? `<button class="btn btn-sm btn-primary" style="padding: 2px 6px; font-size: 0.65rem;" onclick="window.BrenerApp.Saha.moveTask(${t.id}, 'completed')">Tamamla</button>` : ''}
                            ${t.status !== 'completed' ? `<button class="btn btn-sm btn-danger" style="padding: 2px 6px; font-size: 0.65rem;" onclick="window.BrenerApp.Saha.deleteTask(${t.id})">Sil</button>` : ''}
                        </div>
                    </div>
                </div>
            `;

            if (t.status === 'todo') todoHtml += cardHtml;
            else if (t.status === 'progress') progressHtml += cardHtml;
            else if (t.status === 'testing') testingHtml += cardHtml;
            else if (t.status === 'completed') completedHtml += cardHtml;
        });

        let html = `
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <h2>Grup İş Emri Dağıtımı</h2>
                <button class="btn btn-primary btn-sm" id="addNewTaskBtn">Yeni İş Emri Oluştur</button>
            </div>
            
            <div class="grid-3col" style="grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: start;">
                <!-- Column: Todo -->
                <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
                    <h3 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 12px; display: flex; justify-content: space-between;">
                        <span>Yapılacaklar</span>
                        <span class="badge badge-info" style="font-size: 0.65rem;">${tasks.filter(t => t.status === 'todo').length}</span>
                    </h3>
                    <div style="min-height: 200px;">
                        ${todoHtml || '<div style="font-size: 0.75rem; text-align: center; color: var(--text-muted); padding: 20px;">Görevi yok.</div>'}
                    </div>
                </div>

                <!-- Column: Progress -->
                <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
                    <h3 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 12px; display: flex; justify-content: space-between;">
                        <span>Devam Edenler</span>
                        <span class="badge badge-warning" style="font-size: 0.65rem;">${tasks.filter(t => t.status === 'progress').length}</span>
                    </h3>
                    <div style="min-height: 200px;">
                        ${progressHtml || '<div style="font-size: 0.75rem; text-align: center; color: var(--text-muted); padding: 20px;">Çalışma yok.</div>'}
                    </div>
                </div>

                <!-- Column: Testing -->
                <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
                    <h3 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 12px; display: flex; justify-content: space-between;">
                        <span>Kontrol / Test</span>
                        <span class="badge badge-info" style="font-size: 0.65rem;">${tasks.filter(t => t.status === 'testing').length}</span>
                    </h3>
                    <div style="min-height: 200px;">
                        ${testingHtml || '<div style="font-size: 0.75rem; text-align: center; color: var(--text-muted); padding: 20px;">Kontrol yok.</div>'}
                    </div>
                </div>

                <!-- Column: Completed -->
                <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
                    <h3 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 12px; display: flex; justify-content: space-between;">
                        <span>Tamamlananlar</span>
                        <span class="badge badge-success" style="font-size: 0.65rem;">${tasks.filter(t => t.status === 'completed').length}</span>
                    </h3>
                    <div style="min-height: 200px;">
                        ${completedHtml || '<div style="font-size: 0.75rem; text-align: center; color: var(--text-muted); padding: 20px;">Biten yok.</div>'}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

        document.getElementById('addNewTaskBtn').onclick = () => {
            const formHtml = `
                <div class="form-group">
                    <label>Görev / İş Başlığı</label>
                    <input type="text" id="newWOTitle" placeholder="Örn: 2. Kat Kalıp Sökümü" required>
                </div>
                <div class="form-group">
                    <label>Detaylı Açıklama</label>
                    <textarea id="newWODesc" placeholder="Detay girin..." style="height: 80px;"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Sorumlu Personel</label>
                        <select id="newWOAssigned">
                            ${window.BrenerApp.state.employees.map(e => `<option value="${e.name}">${e.name} (${e.role})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Öncelik</label>
                        <select id="newWOPriority">
                            <option value="high">Yüksek</option>
                            <option value="medium" selected>Orta</option>
                        </select>
                    </div>
                </div>
                <button class="btn btn-primary" id="saveNewWOBtn" style="width:100%; margin-top: 10px;">İş Emri Ata</button>
            `;
            window.BrenerApp.openModal('Yeni İş Emri Görev Kartı Ekle', formHtml);

            document.getElementById('saveNewWOBtn').onclick = () => {
                const title = document.getElementById('newWOTitle').value.trim();
                const desc = document.getElementById('newWODesc').value.trim();
                const assignedTo = document.getElementById('newWOAssigned').value;
                const priority = document.getElementById('newWOPriority').value;

                if (!title) {
                    alert('Lütfen başlık girin!');
                    return;
                }

                window.BrenerApp.state.workOrders.push({
                    id: Date.now(),
                    title,
                    desc,
                    status: 'todo',
                    assignedTo,
                    priority
                });

                window.BrenerApp.saveStateToStorage();
                window.BrenerApp.logActivity('saha', `Yeni iş emri atandı: ${title}`, 'info', `Atanan: ${assignedTo}, Öncelik: ${priority}`);
                window.BrenerApp.showToast('success', `Yeni iş emri oluşturuldu: ${title}`);
                document.getElementById('modalCloseBtn').click();
                this.renderKanban(container);
            };
        };
    },

    moveTask(id, newStatus) {
        const t = window.BrenerApp.state.workOrders.find(task => task.id === id);
        if (t) {
            const oldStatus = t.status;
            t.status = newStatus;
            window.BrenerApp.saveStateToStorage();
            window.BrenerApp.logActivity('saha', `İş emri durumu güncellendi: ${t.title}`, 'info', `Durum: ${oldStatus.toUpperCase()} ➡️ ${newStatus.toUpperCase()}`);
            window.BrenerApp.showToast('success', `Görev taşındı: ${newStatus.toUpperCase()}`);
            this.renderKanban(document.getElementById('contentWindow'));
        }
    },

    deleteTask(id) {
        const t = window.BrenerApp.state.workOrders.find(task => task.id === id);
        const title = t ? t.title : id;
        window.BrenerApp.state.workOrders = window.BrenerApp.state.workOrders.filter(task => task.id !== id);
        window.BrenerApp.saveStateToStorage();
        window.BrenerApp.logActivity('saha', `İş emri silindi: ${title}`, 'warning');
        window.BrenerApp.showToast('danger', 'İş emri silindi.');
        this.renderKanban(document.getElementById('contentWindow'));
    },

    // 3. Tadilat/Tamirat Formu (Punch list defect logging)
    renderRepairForm(container) {
        window.BrenerApp.updateTopbarTitle('Tamirat & Punch Listeleri', 'Daire Teslimleri Öncesi Hata / Eksik Takip Formları');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Eksik / Kusurlu İmalat Rapor Formu</h2>
                    </div>
                    <div class="form-group">
                        <label>Bağımsız Bölüm (Daire No / Mahali)</label>
                        <input type="text" id="defectLoc" placeholder="Örn: Blok A, Daire: 14 Mutfak" required>
                    </div>
                    <div class="form-group">
                        <label>Hata / Kusur Açıklaması</label>
                        <textarea id="defectDesc" placeholder="Örn: Mutfak tezgah mermerinde sol köşede çatlak mevcut..." style="height: 100px;" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Aciliyet Durumu</label>
                        <select id="defectPriority">
                            <option value="high">Yüksek (Teslime engel)</option>
                            <option value="medium" selected>Orta (Tamir edilebilir)</option>
                            <option value="low">Düşük (Rötuş seviyesi)</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" id="saveDefectBtn" style="width: 100%;">Hasarı Raporla</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Şantiye Hata / Punch Takip Listesi</h2>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="font-size: 0.85rem; font-weight: 600;">Blok B Daire 8 - Parke Esnemesi</h4>
                                <span style="font-size: 0.7rem; color: var(--text-muted);">Sorumlu: Parke Ekibi</span>
                            </div>
                            <span class="badge badge-warning">Tamir Ediliyor</span>
                        </div>
                        <div style="padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="font-size: 0.85rem; font-weight: 600;">Blok A Giriş - Cam Çatlağı</h4>
                                <span style="font-size: 0.7rem; color: var(--text-muted);">Sorumlu: Camcı Usta</span>
                            </div>
                            <span class="badge badge-success">Giderildi</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

        document.getElementById('saveDefectBtn').onclick = () => {
            const loc = document.getElementById('defectLoc').value.trim();
            const desc = document.getElementById('defectDesc').value.trim();

            if (!loc || !desc) {
                alert('Lütfen alanları doldurun!');
                return;
            }

            window.BrenerApp.showToast('success', `${loc} adresindeki hata punch listesine eklendi ve ilgili ekibe atandı.`);
            document.getElementById('defectLoc').value = '';
            document.getElementById('defectDesc').value = '';
        };
    },

    // 4. Sipariş Fişi (Material Purchase Request)
    renderOrderSlip(container) {
        window.BrenerApp.updateTopbarTitle('Sipariş Fişi Hazırlama', 'Şantiyeye Çimento, Demir ve Malzeme Satın Alma Talepleri');

        let html = `
            <div class="card" style="max-width: 600px; margin: 0 auto;">
                <div class="card-header">
                    <h2>Malzeme Satın Alma Talep Fişi</h2>
                </div>
                <div class="form-group">
                    <label>Tedarik Edilecek Malzeme</label>
                    <select id="slipMat">
                        ${window.BrenerApp.state.materials.map(m => `<option value="${m.name}">${m.name} (${m.unit})</option>`).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Sipariş Miktarı</label>
                        <input type="number" id="slipQty" value="10" required>
                    </div>
                    <div class="form-group">
                        <label>Teslim Edilecek Proje Deposu</label>
                        <select id="slipProj">
                            ${window.BrenerApp.state.projects.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Satın Alma Açıklaması / Sipariş Gerekçesi</label>
                    <textarea id="slipDesc" placeholder="Örn: 3. Kat beton dökümü için acil tedarik..." style="height: 80px;"></textarea>
                </div>
                <button class="btn btn-primary" id="saveSlipBtn" style="width: 100%;">Sipariş Fişini Onaya Gönder</button>
            </div>
        `;
        container.innerHTML = html;

        document.getElementById('saveSlipBtn').onclick = () => {
            const mat = document.getElementById('slipMat').value;
            const qty = parseFloat(document.getElementById('slipQty').value);
            const proj = document.getElementById('slipProj').value;

            window.BrenerApp.showToast('success', `${qty} miktar ${mat} alım talebi ${proj} şantiyesi için satın almaya iletildi.`);
            window.location.hash = '#malzeme-stok';
        };
    },

    // 5. Servis Teklifi
    renderServiceOffer(container) {
        window.BrenerApp.updateTopbarTitle('Servis ve Bakım Teklif Kartı', 'Müşterilere Sunulan Tamirat/Tadilat Hizmeti Fiyatlandırması');

        let html = `
            <div class="card" style="max-width: 500px; margin: 0 auto;">
                <div class="card-header">
                    <h2>Servis Hizmet Teklifi Oluştur</h2>
                </div>
                <div class="form-group">
                    <label>Müşteri Ünvanı</label>
                    <input type="text" id="srvClient" placeholder="Örn: Hasan Yılmaz (Villa 12 Sakini)" required>
                </div>
                <div class="form-group">
                    <label>Servis / İş Kalemleri Açıklaması</label>
                    <textarea id="srvDesc" placeholder="Mermer parlatma ve sıhhi tesisat armatür yenileme..." style="height: 80px;"></textarea>
                </div>
                <div class="form-group">
                    <label>Teklif Tutarı (TL)</label>
                    <input type="number" id="srvPrice" value="12500" required>
                </div>
                <button class="btn btn-primary" id="saveSrvOfferBtn" style="width: 100%;">Teklifi Müşteriye E-Postala</button>
            </div>
        `;
        container.innerHTML = html;

        document.getElementById('saveSrvOfferBtn').onclick = () => {
            const client = document.getElementById('srvClient').value.trim();
            const price = parseFloat(document.getElementById('srvPrice').value);

            if (!client || !price) {
                alert('Lütfen müşteri adı ve teklif tutarını doldurun!');
                return;
            }

            window.BrenerApp.showToast('success', `${client} için ${price.toLocaleString('tr-TR')} TL bedelli Servis Teklif Belgesi hazırlanıp e-postalandı.`);
            window.location.hash = '#musteri-cari';
        };
    },

    // 6. Randevu Takvimi
    renderCalendar(container) {
        window.BrenerApp.updateTopbarTitle('Randevu Takvimi & Ajanda', 'Saha Ekipleri Müşteri Randevuları ve Denetim Günleri');

        let html = `
            <div class="card">
                <div class="card-header" style="margin-bottom: 20px;">
                    <h2>Ajanda Kayıtları (Bu Hafta)</h2>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Tarih & Saat</th>
                                <th>Toplantı / Randevu Açıklaması</th>
                                <th>Katılımcılar</th>
                                <th>Lokasyon</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>24.06.2026 - 14:00</strong></td>
                                <td>Belediye İmar Müdürlüğü Proje Onay Toplantısı</td>
                                <td>Caner Şen (Mühendis), Emre Türedi</td>
                                <td>Kadıköy İmar Md.</td>
                            </tr>
                            <tr>
                                <td><strong>25.06.2026 - 11:00</strong></td>
                                <td>Bodrum Şantiye Beton Dökümü Numune Kontrolü</td>
                                <td>Hasan Usta, Laboratuvar Yetkilisi</td>
                                <td>Bodrum Şantiye</td>
                            </tr>
                            <tr>
                                <td><strong>26.06.2026 - 16:00</strong></td>
                                <td>Ertürk Holding Daire Satışı Tapu İşlemleri</td>
                                <td>Satış Müdürü, Alıcı Vekili</td>
                                <td>Tapu Dairesi</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }
};
