/* ==========================================================================
   BRENER GROUP - FİNANS & MUHASEBE MODÜLÜ - TAM SÜRÜM
   ========================================================================== */

window.BrenerApp.Finans = {
    render(view, container) {
        const activeProj = window.BrenerApp.getActiveProject();
        if (view === 'hakedis')               this.renderClaim(activeProj, container);
        else if (view === 'tahsilat-takibi')  this.renderCollections(activeProj, container);
        else if (view === 'teklif-sozlesme')  this.renderContracts(activeProj, container);
        else if (view === 'kat-karsiligi')    this.renderLandAgreement(activeProj, container);
        else if (view === 'muhasebe-disa-aktar') this.renderAccounting(activeProj, container);
    },

    /* ====================================================================
       1. HAKEDİŞ HESAPLAYICI
    ==================================================================== */
    renderClaim(project, container) {
        window.BrenerApp.updateTopbarTitle('Hakediş Hesaplayıcı', `${project.name} — Taşeron ve Müteahhit Hakediş İşlemleri`);

        const claims = window.BrenerApp.state.claims;
        const totalPaid    = claims.filter(c => c.status === 'paid').reduce((s,c) => s + c.netPaid, 0);
        const totalPending = claims.filter(c => c.status !== 'paid').reduce((s,c) => s + c.netPaid, 0);

        const claimRows = claims.map(c => `
            <tr>
                <td>
                    <div style="font-weight:600;">${c.subcontractor}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">${c.date || '—'}</div>
                </td>
                <td style="font-size:0.82rem;max-width:200px;">${c.description}</td>
                <td style="font-weight:600;">${c.totalAmount.toLocaleString('tr-TR')} ₺</td>
                <td style="font-weight:700;color:var(--success);">${c.netPaid.toLocaleString('tr-TR')} ₺</td>
                <td><span class="badge ${c.status === 'paid' ? 'badge-success' : 'badge-warning'}">${c.status === 'paid' ? '✅ Ödendi' : '⏳ Onay Bekliyor'}</span></td>
                <td>
                    ${c.status !== 'paid' ? `<button class="btn btn-sm btn-success" onclick="window.BrenerApp.Finans.approveClaim(${c.id})">Onayla</button>` : ''}
                </td>
            </tr>`).join('');

        container.innerHTML = `
        <!-- Özet Kartlar -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
            <div class="card" style="text-align:center;padding:20px;">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">Toplam Hakediş Sayısı</div>
                <div style="font-size:2.2rem;font-weight:800;color:var(--primary);margin-top:6px;">${claims.length}</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;border-color:var(--success);">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">Ödenen Toplam</div>
                <div style="font-size:1.8rem;font-weight:800;color:var(--success);margin-top:6px;">${(totalPaid/1000).toFixed(0)}K ₺</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;border-color:var(--warning);">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">Onay Bekleyen</div>
                <div style="font-size:1.8rem;font-weight:800;color:var(--warning);margin-top:6px;">${(totalPending/1000).toFixed(0)}K ₺</div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
            <!-- Hakediş Form -->
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;"><h2>📋 Yeni Hakediş Raporu Hazırla</h2></div>
                <div class="form-group">
                    <label>Taşeron Firma Adı</label>
                    <input type="text" id="claimSub" placeholder="Örn: Kuzey Kalıp Ltd. Şti.">
                </div>
                <div class="form-group">
                    <label>Yapılan İmalat Tanımı</label>
                    <input type="text" id="claimDesc" placeholder="Örn: 2. Kat Döşeme Kalıbı ve Beton Döküm İşçiliği">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>Metraj / Miktar</label>
                        <input type="number" id="claimQty" value="150" oninput="window.BrenerApp.Finans.calcLiveClaim()">
                    </div>
                    <div class="form-group">
                        <label>Birim</label>
                        <select id="claimUnit">
                            <option value="m²">m² (Kalıp)</option>
                            <option value="m³">m³ (Beton)</option>
                            <option value="Ton">Ton (Demir)</option>
                            <option value="Adet">Adet</option>
                        </select>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>Sözleşme Birim Fiyatı (₺)</label>
                        <input type="number" id="claimPrice" value="450" oninput="window.BrenerApp.Finans.calcLiveClaim()">
                    </div>
                    <div class="form-group">
                        <label>Teminat Kesintisi</label>
                        <select id="claimRetentionRate" onchange="window.BrenerApp.Finans.calcLiveClaim()">
                            <option value="5" selected>%5 Teminat</option>
                            <option value="10">%10 Teminat</option>
                            <option value="0">%0 Kesintisiz</option>
                        </select>
                    </div>
                </div>

                <!-- Canlı Hesap Paneli -->
                <div style="background:rgba(var(--primary-rgb),0.05);border:1px solid rgba(var(--primary-rgb),0.2);border-radius:10px;padding:14px;margin:12px 0;">
                    <div style="font-weight:700;font-size:0.8rem;color:var(--primary);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;">⚡ Canlı Hesaplama</div>
                    <div style="display:flex;justify-content:space-between;font-size:0.83rem;margin-bottom:5px;">
                        <span>Kaba Hakediş:</span><span id="liveSubtotal" style="font-weight:600;">67,500.00 ₺</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:0.83rem;margin-bottom:5px;">
                        <span>KDV (%20):</span><span id="liveKdv">13,500.00 ₺</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:0.83rem;margin-bottom:5px;color:var(--danger);">
                        <span>Teminat Kesintisi:</span><span id="liveRetention">-3,375.00 ₺</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:1rem;font-weight:800;border-top:1px solid var(--border-color);padding-top:8px;margin-top:8px;color:var(--success);">
                        <span>Net Ödenecek:</span><span id="liveNet">77,625.00 ₺</span>
                    </div>
                </div>
                <button class="btn btn-primary" id="saveClaimBtn" style="width:100%;">💾 Hakediş Raporunu Onayla & Kaydet</button>
            </div>

            <!-- Hakediş Arşivi -->
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;"><h2>📁 Şantiye Hakediş Arşivi</h2></div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Firma</th><th>İmalat</th><th>Brüt</th><th>Net Ödenen</th><th>Durum</th><th>İşlem</th></tr></thead>
                        <tbody id="claimsTbody">${claimRows}</tbody>
                    </table>
                </div>
            </div>
        </div>`;

        document.getElementById('saveClaimBtn').onclick = () => {
            const sub   = document.getElementById('claimSub').value.trim();
            const desc  = document.getElementById('claimDesc').value.trim();
            const qty   = parseFloat(document.getElementById('claimQty').value);
            const price = parseFloat(document.getElementById('claimPrice').value);
            const ret   = parseInt(document.getElementById('claimRetentionRate').value);
            if (!sub || !desc || !qty || !price) { alert('Lütfen tüm alanları doldurun!'); return; }
            const total     = qty * price;
            const retention = total * (ret / 100);
            const kdv       = total * 0.20;
            const net       = total + kdv - retention;
            window.BrenerApp.state.claims.unshift({ id: Date.now(), subcontractor: sub, description: desc, totalAmount: total, retention, netPaid: net, date: new Date().toISOString().split('T')[0], status: 'pending' });
            window.BrenerApp.saveStateToStorage();
            window.BrenerApp.logActivity('finans', `Yeni hakediş kaydı oluşturuldu: ${sub}`, 'success', `Açıklama: ${desc}, Net Ödenecek: ${net.toLocaleString('tr-TR')} TL`);
            window.BrenerApp.showToast('success', `${sub} hakediş onay aşamasına gönderildi.`);
            this.renderClaim(project, container);
        };
    },

    calcLiveClaim() {
        const qty    = parseFloat(document.getElementById('claimQty')?.value) || 0;
        const price  = parseFloat(document.getElementById('claimPrice')?.value) || 0;
        const ret    = parseInt(document.getElementById('claimRetentionRate')?.value) || 0;
        const sub    = qty * price;
        const kdv    = sub * 0.20;
        const retAmt = sub * (ret / 100);
        const net    = sub + kdv - retAmt;
        const fmt = n => n.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺';
        document.getElementById('liveSubtotal').textContent = fmt(sub);
        document.getElementById('liveKdv').textContent      = fmt(kdv);
        document.getElementById('liveRetention').textContent = '-' + fmt(retAmt);
        document.getElementById('liveNet').textContent      = fmt(net);
    },

    approveClaim(id) {
        const c = window.BrenerApp.state.claims.find(x => x.id === id);
        if (c) { 
            c.status = 'paid'; 
            window.BrenerApp.saveStateToStorage(); 
            window.BrenerApp.logActivity('finans', `Hakediş ödemesi onaylandı ve ödendi: ${c.subcontractor}`, 'success', `Açıklama: ${c.description}, Ödenen Net Tutar: ${c.netPaid.toLocaleString('tr-TR')} TL`);
            window.BrenerApp.showToast('success', `${c.subcontractor} hakediş ödemesi onaylandı.`); 
            this.render('hakedis', document.getElementById('contentWindow')); 
        }
    },

    /* ====================================================================
       2. TAHSİLAT TAKİBİ
    ==================================================================== */
    renderCollections(project, container) {
        window.BrenerApp.updateTopbarTitle('Tahsilat & Ödeme Planları', `${project.name} — Konut Satış Taksitleri ve Cari Girişler`);

        const payments = [
            { id:1, client:'Ertürk Holding A.Ş.', desc:'Plaza Projesi Hakediş Tahsilatı', date:'24.06.2026', due:'24.06.2026', amount:1_500_000, paid:true },
            { id:2, client:'Levent Serbest',       desc:'B Blok D:12 — 2. Taksit',           date:'28.06.2026', due:'28.06.2026', amount:450_000,   paid:false },
            { id:3, client:'Kaya İnşaat A.Ş.',    desc:'Tuğla Satış Bedeli Tahsilatı',      date:'02.07.2026', due:'02.07.2026', amount:85_000,    paid:false },
            { id:4, client:'Mehmet Arslan',        desc:'A Blok D:5 — Son Peşinat',          date:'15.07.2026', due:'15.07.2026', amount:960_000,   paid:false },
            { id:5, client:'Ayşe Karaca',          desc:'B Blok D:12 — 1. Taksit',           date:'22.05.2026', due:'22.05.2026', amount:520_000,   paid:true },
        ];

        const totalReceived = payments.filter(p=>p.paid).reduce((s,p)=>s+p.amount,0);
        const totalPending  = payments.filter(p=>!p.paid).reduce((s,p)=>s+p.amount,0);

        const rows = payments.map(p => `
            <tr>
                <td><strong>${p.client}</strong></td>
                <td style="font-size:0.82rem;color:var(--text-muted);">${p.desc}</td>
                <td>${p.date}</td>
                <td style="font-weight:700;color:${p.paid?'var(--success)':'var(--warning)'};">${p.amount.toLocaleString('tr-TR')} ₺</td>
                <td><span class="badge ${p.paid?'badge-success':'badge-warning'}">${p.paid?'✅ Tahsil Edildi':'⏳ Bekliyor'}</span></td>
                <td>
                    ${!p.paid?`<button class="btn btn-sm btn-success" onclick="window.BrenerApp.showToast('success','${p.client} tahsilatı gerçekleşti olarak işaretlendi.')">Tahsil Et</button>`:''}
                </td>
            </tr>`).join('');

        container.innerHTML = `
        <!-- Özet -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
            <div class="card" style="text-align:center;padding:20px;border-color:var(--success);">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Tahsil Edilen</div>
                <div style="font-size:1.8rem;font-weight:800;color:var(--success);margin-top:6px;">${(totalReceived/1000000).toFixed(2)}M ₺</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;border-color:var(--warning);">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Bekleyen Tahsilat</div>
                <div style="font-size:1.8rem;font-weight:800;color:var(--warning);margin-top:6px;">${(totalPending/1000000).toFixed(2)}M ₺</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Tahsilat Oranı</div>
                <div style="font-size:1.8rem;font-weight:800;color:var(--primary);margin-top:6px;">%${Math.round(totalReceived/(totalReceived+totalPending)*100)}</div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <!-- Tahsilat Tablosu -->
            <div class="card" style="grid-column:1/-1;">
                <div class="card-header" style="margin-bottom:20px;">
                    <h2>💰 Tahsilat & Ödeme Takip Listesi</h2>
                    <button class="btn btn-primary btn-sm" onclick="window.BrenerApp.showToast('success','Yeni tahsilat kaydı eklendi.')">+ Tahsilat Ekle</button>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Müşteri / Cari</th><th>Açıklama</th><th>Vade Tarihi</th><th>Tutar</th><th>Durum</th><th>İşlem</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>

            <!-- Ödeme Planı Sihirbazı -->
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;"><h2>📅 Ödeme Planı Sihirbazı</h2></div>
                <div class="form-group"><label>Alıcı Adı</label><input type="text" id="planClient" placeholder="Örn: Mustafa Koç"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group"><label>Satış Bedeli (₺)</label><input type="number" id="planTotal" value="6000000"></div>
                    <div class="form-group"><label>Peşinat (₺)</label><input type="number" id="planDown" value="2000000"></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group"><label>Taksit Sayısı (Ay)</label><input type="number" id="planMonths" value="12" min="1" max="60"></div>
                    <div class="form-group"><label>İlk Taksit</label><input type="date" id="planStartDate" value="2026-07-01"></div>
                </div>
                <button class="btn btn-primary" id="genPaymentPlanBtn" style="width:100%;margin-top:8px;">📊 Ödeme Planı Oluştur</button>
            </div>

            <!-- Gecikme & Hatırlatma -->
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;"><h2>🔔 Yaklaşan Vadeler</h2></div>
                ${payments.filter(p=>!p.paid).map(p=>`
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.05);border-radius:8px;margin-bottom:8px;">
                    <div>
                        <div style="font-weight:600;font-size:0.85rem;">${p.client}</div>
                        <div style="font-size:0.72rem;color:var(--text-muted);">${p.desc}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:700;color:var(--warning);">${p.amount.toLocaleString('tr-TR')} ₺</div>
                        <div style="font-size:0.72rem;color:var(--text-muted);">${p.due}</div>
                    </div>
                </div>`).join('')}
                <button class="btn btn-secondary" style="width:100%;margin-top:8px;" onclick="window.BrenerApp.showToast('info','Tüm borçlulara hatırlatma SMS\'i gönderildi.')">📱 Hatırlatma Gönder</button>
            </div>
        </div>`;

        document.getElementById('genPaymentPlanBtn').onclick = () => {
            const client = document.getElementById('planClient').value.trim();
            const total  = parseFloat(document.getElementById('planTotal').value);
            const down   = parseFloat(document.getElementById('planDown').value);
            const months = parseInt(document.getElementById('planMonths').value);
            if (!client || !total) { alert('Müşteri adı ve satış bedeli zorunlu!'); return; }
            const inst = (total - down) / months;
            const rows = Array.from({length:months},(_,i)=>`<tr><td>${i+1}. Taksit</td><td>${inst.toLocaleString('tr-TR',{maximumFractionDigits:0})} ₺</td><td><span class="badge badge-warning">Bekliyor</span></td></tr>`).join('');
            window.BrenerApp.openModal(`📅 ${client} — Ödeme Planı`, `
                <div style="margin-bottom:12px;font-size:0.85rem;"><strong>Toplam:</strong> ${total.toLocaleString('tr-TR')} ₺ | <strong>Peşinat:</strong> ${down.toLocaleString('tr-TR')} ₺ | <strong>Aylık Taksit:</strong> ${inst.toLocaleString('tr-TR',{maximumFractionDigits:0})} ₺</div>
                <div class="table-responsive"><table><thead><tr><th>Taksit</th><th>Tutar</th><th>Durum</th></tr></thead><tbody>${rows}</tbody></table></div>
                <button class="btn btn-primary" style="width:100%;margin-top:14px;" onclick="window.BrenerApp.showToast('success','Ödeme planı PDF olarak kaydedildi.')">📥 PDF İndir</button>
            `);
        };
    },

    /* ====================================================================
       3. TEKLİF & SÖZLEŞME
    ==================================================================== */
    renderContracts(project, container) {
        window.BrenerApp.updateTopbarTitle('Teklif & Sözleşme Yönetimi', `${project.name} — Taşeron ve Tedarikçi Sözleşme Arşivi`);

        const contracts = [
            { id:1, title:'Kuzey Kalıp Ltd. — Kalıp & İskele Sözleşmesi',    value:4_800_000, start:'01.04.2026', end:'01.10.2026', status:'Aktif',    cls:'badge-success' },
            { id:2, title:'Yavuz Beton — Hazır Beton Tedarik Sözleşmesi',    value:8_200_000, start:'15.04.2026', end:'15.09.2026', status:'Aktif',    cls:'badge-success' },
            { id:3, title:'Öz Yapı Demir Ltd. — Donatı Çeliği Anlaşması',   value:6_500_000, start:'01.05.2026', end:'01.11.2026', status:'Aktif',    cls:'badge-success' },
            { id:4, title:'Elektrik-Mek A.Ş. — Tesisat Hizmet Sözleşmesi', value:2_100_000, start:'01.08.2026', end:'01.12.2026', status:'Taslak',   cls:'badge-info' },
            { id:5, title:'Alçı & Sıva Grubu — İnce İşçilik Sözleşmesi',   value:1_850_000, start:'01.09.2026', end:'01.01.2027', status:'Teklif',   cls:'badge-warning' },
        ];

        const totalValue  = contracts.reduce((s,c) => s+c.value, 0);
        const activeValue = contracts.filter(c=>c.status==='Aktif').reduce((s,c) => s+c.value, 0);

        const rows = contracts.map(c => `
            <tr>
                <td><strong>${c.title}</strong></td>
                <td style="font-weight:700;color:var(--primary);">${c.value.toLocaleString('tr-TR')} ₺</td>
                <td style="font-size:0.8rem;">${c.start}</td>
                <td style="font-size:0.8rem;">${c.end}</td>
                <td><span class="badge ${c.cls}">${c.status}</span></td>
                <td>
                    <div style="display:flex;gap:4px;">
                        <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info','Sözleşme PDF açıldı.')">📄 Görüntüle</button>
                        <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('success','Sözleşme imza aşamasına gönderildi.')">✍️ İmzala</button>
                    </div>
                </td>
            </tr>`).join('');

        container.innerHTML = `
        <!-- Özet -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
            <div class="card" style="text-align:center;padding:20px;">
                <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;">Toplam Sözleşme</div>
                <div style="font-size:2rem;font-weight:800;color:var(--primary);margin-top:6px;">${contracts.length}</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;border-color:var(--success);">
                <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;">Aktif Sözleşmeler</div>
                <div style="font-size:2rem;font-weight:800;color:var(--success);margin-top:6px;">${contracts.filter(c=>c.status==='Aktif').length}</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;">
                <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;">Toplam Sözleşme Değeri</div>
                <div style="font-size:1.5rem;font-weight:800;color:var(--primary);margin-top:6px;">${(totalValue/1000000).toFixed(1)}M ₺</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;border-color:var(--success);">
                <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;">Aktif Sözleşme Değeri</div>
                <div style="font-size:1.5rem;font-weight:800;color:var(--success);margin-top:6px;">${(activeValue/1000000).toFixed(1)}M ₺</div>
            </div>
        </div>

        <!-- Sözleşme Tablosu -->
        <div class="card" style="margin-bottom:24px;">
            <div class="card-header" style="margin-bottom:20px;">
                <h2>📑 Sözleşme Arşivi</h2>
                <button class="btn btn-primary btn-sm" onclick="window.BrenerApp.Finans.newContractModal()">+ Yeni Sözleşme</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>Sözleşme Başlığı</th><th>Değer</th><th>Başlangıç</th><th>Bitiş</th><th>Durum</th><th>İşlem</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>

        <!-- Teklif Oluşturma Formu -->
        <div class="card">
            <div class="card-header" style="margin-bottom:20px;"><h2>📝 Hızlı Teklif Oluştur</h2></div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                <div class="form-group"><label>Firma / Tedarikçi</label><input type="text" id="offerFirm" placeholder="Örn: Müzik Çatı A.Ş."></div>
                <div class="form-group"><label>İş Kalemi</label><input type="text" id="offerWork" placeholder="Örn: Çatı Kaplama İşleri"></div>
                <div class="form-group"><label>Teklif Tutarı (₺)</label><input type="number" id="offerAmount" value="500000"></div>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:4px;" id="sendOfferBtn">📧 Teklifi E-Posta ile Gönder</button>
        </div>`;

        document.getElementById('sendOfferBtn').onclick = () => {
            const firm   = document.getElementById('offerFirm').value.trim();
            const work   = document.getElementById('offerWork').value.trim();
            const amount = parseFloat(document.getElementById('offerAmount').value);
            if (!firm || !work) { alert('Firma ve iş kalemi zorunlu!'); return; }
            window.BrenerApp.showToast('success', `${firm} firmasına ${amount.toLocaleString('tr-TR')} ₺ değerinde teklif iletildi.`);
        };
    },

    newContractModal() {
        window.BrenerApp.openModal('📑 Yeni Sözleşme Ekle', `
            <div class="form-group"><label>Sözleşme Başlığı</label><input type="text" id="newContTitle" placeholder="Örn: Çatı Kaplama Hizmet Sözleşmesi"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group"><label>Sözleşme Değeri (₺)</label><input type="number" id="newContValue" value="1000000"></div>
                <div class="form-group"><label>Durum</label>
                    <select id="newContStatus"><option>Taslak</option><option>Teklif</option><option>Aktif</option></select>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group"><label>Başlangıç Tarihi</label><input type="date" id="newContStart"></div>
                <div class="form-group"><label>Bitiş Tarihi</label><input type="date" id="newContEnd"></div>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:10px;" onclick="window.BrenerApp.showToast('success','Sözleşme kaydedildi.');document.getElementById('modalCloseBtn').click();">💾 Kaydet</button>
        `);
    },

    /* ====================================================================
       4. KAT KARŞILIĞI SÖZLEŞME
    ==================================================================== */
    renderLandAgreement(project, container) {
        window.BrenerApp.updateTopbarTitle('Kat Karşılığı Sözleşme Hesaplayıcı', 'Arsa Sahibi ve Müteahhit Pay Dağılım Analizi');

        container.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <!-- Hesap Formu -->
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;"><h2>🏗️ Kat Karşılığı Pay Hesabı</h2></div>
                <div class="form-group"><label>Arsa Alanı (m²)</label><input type="number" id="landArea" value="1000" oninput="window.BrenerApp.Finans.calcLandShares()"></div>
                <div class="form-group"><label>Emsal (TAKS × Kat Adedi)</label><input type="number" id="landEmsal" value="3.0" step="0.1" oninput="window.BrenerApp.Finans.calcLandShares()"></div>
                <div class="form-group"><label>Ortalama Daire Brüt Alanı (m²)</label><input type="number" id="landApartSize" value="130" oninput="window.BrenerApp.Finans.calcLandShares()"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group"><label>Müteahhit Payı (%)</label><input type="number" id="landContrShare" value="55" oninput="window.BrenerApp.Finans.calcLandShares()"></div>
                    <div class="form-group"><label>Arsa Sahibi Payı (%)</label><input type="number" id="landOwnerShare" value="45" disabled style="opacity:0.7;"></div>
                </div>
                <div class="form-group"><label>Tahmini Daire Satış Bedeli (₺/m²)</label><input type="number" id="landSqmPrice" value="45000" oninput="window.BrenerApp.Finans.calcLandShares()"></div>

                <div style="background:rgba(var(--primary-rgb),0.05);border:1px solid rgba(var(--primary-rgb),0.2);border-radius:10px;padding:14px;margin-top:8px;">
                    <div style="font-weight:700;font-size:0.8rem;color:var(--primary);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">📊 Hesaplama Sonuçları</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.85rem;">
                        <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="color:var(--text-muted);font-size:0.72rem;">Toplam İnşaat Alanı</div>
                            <div id="landTotalBuild" style="font-weight:700;margin-top:3px;color:var(--primary);">3,000 m²</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="color:var(--text-muted);font-size:0.72rem;">Toplam Daire Sayısı</div>
                            <div id="landTotalApts" style="font-weight:700;margin-top:3px;">23 Daire</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="color:var(--text-muted);font-size:0.72rem;">Müteahhit Dairesi</div>
                            <div id="landContrApts" style="font-weight:700;margin-top:3px;color:var(--success);">12 Daire</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="color:var(--text-muted);font-size:0.72rem;">Arsa Sahibi Dairesi</div>
                            <div id="landOwnerApts" style="font-weight:700;margin-top:3px;color:var(--warning);">11 Daire</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;border:1px solid var(--border-color);grid-column:1/-1;">
                            <div style="color:var(--text-muted);font-size:0.72rem;">Tahmini Toplam Proje Geliri</div>
                            <div id="landTotalRevenue" style="font-weight:800;margin-top:3px;font-size:1.2rem;color:var(--primary);">— ₺</div>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary" style="width:100%;margin-top:14px;" onclick="window.BrenerApp.showToast('success','Kat karşılığı analiz raporu PDF olarak indirildi.')">📥 Analiz Raporunu İndir</button>
            </div>

            <!-- Bilgi Paneli -->
            <div style="display:flex;flex-direction:column;gap:16px;">
                <div class="card" style="background:linear-gradient(135deg,rgba(204,163,82,0.08),transparent);border-color:rgba(204,163,82,0.3);">
                    <h3 style="color:var(--primary);margin-bottom:12px;font-size:0.9rem;text-transform:uppercase;letter-spacing:1px;">💡 Kat Karşılığı Nedir?</h3>
                    <p style="font-size:0.83rem;line-height:1.7;color:var(--text-muted);">
                        Kat karşılığı (arsa payı karşılığı inşaat) sözleşmesi; arsa sahibinin arsasını müteahhide vermesi, müteahhidin de bu arsaya bina inşa ederek belirlenen oranda bağımsız bölüm (daire, dükkan vb.) teslim etmesi esasına dayanan bir gayrimenkul geliştirme modelidir.
                    </p>
                </div>
                <div class="card">
                    <h3 style="margin-bottom:14px;font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);">📋 Güncel Mevcut Anlaşmalar</h3>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        <div style="padding:12px;border:1px solid var(--border-color);border-radius:8px;">
                            <div style="font-weight:600;font-size:0.85rem;">Bodrum Şantiyesi — Arsa Sahibi: H. Çelik Ailesi</div>
                            <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:0.78rem;color:var(--text-muted);">
                                <span>Arsa: 1.200 m² | KAKS: 2.5</span>
                                <span>Pay: %45 / %55</span>
                            </div>
                            <div style="margin-top:6px;"><span class="badge badge-success">Aktif Sözleşme</span></div>
                        </div>
                        <div style="padding:12px;border:1px solid var(--border-color);border-radius:8px;">
                            <div style="font-weight:600;font-size:0.85rem;">İzmir Projesi — Arsa Sahibi: Yılmaz Holding</div>
                            <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:0.78rem;color:var(--text-muted);">
                                <span>Arsa: 2.800 m² | KAKS: 3.0</span>
                                <span>Pay: %40 / %60</span>
                            </div>
                            <div style="margin-top:6px;"><span class="badge badge-info">Müzakere Aşamasında</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        this.calcLandShares();
    },

    calcLandShares() {
        const area     = parseFloat(document.getElementById('landArea')?.value) || 0;
        const emsal    = parseFloat(document.getElementById('landEmsal')?.value) || 0;
        const size     = parseFloat(document.getElementById('landApartSize')?.value) || 1;
        const cShare   = parseFloat(document.getElementById('landContrShare')?.value) || 0;
        const sqmPrice = parseFloat(document.getElementById('landSqmPrice')?.value) || 0;
        const oShare   = 100 - cShare;
        if (document.getElementById('landOwnerShare')) document.getElementById('landOwnerShare').value = oShare;
        const totalBuild = area * emsal;
        const totalApts  = Math.floor(totalBuild / size);
        const cApts      = Math.floor(totalApts * cShare / 100);
        const oApts      = totalApts - cApts;
        const totalRev   = totalBuild * sqmPrice;
        if (document.getElementById('landTotalBuild'))   document.getElementById('landTotalBuild').textContent   = `${totalBuild.toLocaleString('tr-TR')} m²`;
        if (document.getElementById('landTotalApts'))    document.getElementById('landTotalApts').textContent    = `${totalApts} Daire`;
        if (document.getElementById('landContrApts'))    document.getElementById('landContrApts').textContent    = `${cApts} Daire`;
        if (document.getElementById('landOwnerApts'))    document.getElementById('landOwnerApts').textContent    = `${oApts} Daire`;
        if (document.getElementById('landTotalRevenue')) document.getElementById('landTotalRevenue').textContent = `${totalRev.toLocaleString('tr-TR')} ₺`;
    },

    /* ====================================================================
       5. MUHASEBE & DIŞA AKTARIM (Tam İçerikli)
    ==================================================================== */
    renderAccounting(project, container) {
        window.BrenerApp.updateTopbarTitle('Muhasebe & Dışa Aktarım', 'Gelir-Gider Defteri, Mizan ve Raporlama Merkezi');

        const gelir = [
            { date:'24.06.2026', desc:'Ertürk Holding — Plaza Projesi Tahsilatı', category:'Satış Geliri',         amount:1_500_000 },
            { date:'20.06.2026', desc:'Ayşe Karaca — B Blok D:12 1. Taksit',     category:'Daire Satış Taksiti',   amount:520_000 },
            { date:'15.06.2026', desc:'Yavuz Beton Geri İade',                    category:'İade Alacak',           amount:45_000 },
            { date:'10.06.2026', desc:'Mehmet Arslan — A Blok D:5 Peşinat',      category:'Daire Satış Peşinatı',  amount:960_000 },
            { date:'01.06.2026', desc:'Kira Geliri — Depo Sahası',               category:'Kira Geliri',           amount:28_000 },
        ];

        const gider = [
            { date:'24.06.2026', desc:'Kuzey Kalıp Ltd. — Hakediş #4',          category:'Taşeron Ödemesi',   amount:677_625 },
            { date:'22.06.2026', desc:'SGK Prim Ödemesi — Haziran',             category:'SGK/Sigorta',       amount:98_750 },
            { date:'21.06.2026', desc:'Yapı Kredi — Kredi Taksiti',             category:'Kredi Geri Ödemesi',amount:920_000 },
            { date:'18.06.2026', desc:'Öz Yapı Demir Ltd. — e-Fatura #0042',   category:'Malzeme Alımı',     amount:480_000 },
            { date:'15.06.2026', desc:'Personel Ücretleri — Haziran Maaşları', category:'Personel Maaşı',    amount:312_400 },
            { date:'10.06.2026', desc:'KDV Ödemesi — Mayıs Beyannamesi',       category:'Vergi Ödemesi',     amount:840_500 },
            { date:'05.06.2026', desc:'Elektrik & Su — Şantiye Faturası',       category:'İşletme Gideri',    amount:18_600 },
        ];

        const toplamGelir = gelir.reduce((s,g)=>s+g.amount, 0);
        const toplamGider = gider.reduce((s,g)=>s+g.amount, 0);
        const netKar      = toplamGelir - toplamGider;

        // Kategori özeti
        const gelirKatMap = {};
        gelir.forEach(g => { gelirKatMap[g.category] = (gelirKatMap[g.category]||0) + g.amount; });
        const giderKatMap = {};
        gider.forEach(g => { giderKatMap[g.category] = (giderKatMap[g.category]||0) + g.amount; });

        const gelirRows = gelir.map(g=>`
            <tr>
                <td>${g.date}</td>
                <td>${g.desc}</td>
                <td><span style="background:rgba(16,185,129,0.1);color:var(--success);padding:2px 8px;border-radius:20px;font-size:0.7rem;">${g.category}</span></td>
                <td style="font-weight:700;color:var(--success);">+${g.amount.toLocaleString('tr-TR')} ₺</td>
            </tr>`).join('');

        const giderRows = gider.map(g=>`
            <tr>
                <td>${g.date}</td>
                <td>${g.desc}</td>
                <td><span style="background:rgba(239,68,68,0.1);color:var(--danger);padding:2px 8px;border-radius:20px;font-size:0.7rem;">${g.category}</span></td>
                <td style="font-weight:700;color:var(--danger);">-${g.amount.toLocaleString('tr-TR')} ₺</td>
            </tr>`).join('');

        container.innerHTML = `
        <!-- Özet KPI Kartlar -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
            <div class="card" style="text-align:center;padding:20px;border-color:var(--success);">
                <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">📈 Dönem Toplam Gelir</div>
                <div style="font-size:1.5rem;font-weight:800;color:var(--success);margin-top:6px;">${(toplamGelir/1000000).toFixed(2)}M ₺</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;border-color:var(--danger);">
                <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">📉 Dönem Toplam Gider</div>
                <div style="font-size:1.5rem;font-weight:800;color:var(--danger);margin-top:6px;">${(toplamGider/1000000).toFixed(2)}M ₺</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;border-color:${netKar>=0?'var(--success)':'var(--danger)'};">
                <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">💰 Net Kar / Zarar</div>
                <div style="font-size:1.5rem;font-weight:800;color:${netKar>=0?'var(--success)':'var(--danger)'};margin-top:6px;">${netKar>=0?'+':''}${(netKar/1000000).toFixed(2)}M ₺</div>
            </div>
            <div class="card" style="text-align:center;padding:20px;">
                <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">📊 Kâr Marjı</div>
                <div style="font-size:1.5rem;font-weight:800;color:var(--primary);margin-top:6px;">%${toplamGelir>0?((netKar/toplamGelir)*100).toFixed(1):0}</div>
            </div>
        </div>

        <!-- Filtre & Dışa Aktarım Bar -->
        <div class="card" style="margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <div class="form-group" style="margin:0;flex:1;min-width:140px;">
                    <label>Proje</label>
                    <select style="background:rgba(255,255,255,0.04);border:1px solid var(--border-color);padding:8px;border-radius:8px;color:var(--text-main);">
                        <option>Tüm Projeler</option>
                        <option selected>Brener Port Konakları</option>
                        <option>Brener Plaza</option>
                    </select>
                </div>
                <div class="form-group" style="margin:0;flex:1;min-width:140px;">
                    <label>Başlangıç</label>
                    <input type="date" value="2026-06-01">
                </div>
                <div class="form-group" style="margin:0;flex:1;min-width:140px;">
                    <label>Bitiş</label>
                    <input type="date" value="2026-06-30">
                </div>
                <div class="form-group" style="margin:0;flex:1;min-width:140px;">
                    <label>Kategori</label>
                    <select style="background:rgba(255,255,255,0.04);border:1px solid var(--border-color);padding:8px;border-radius:8px;color:var(--text-main);">
                        <option>Tümü</option>
                        <option>Sadece Gelirler</option>
                        <option>Sadece Giderler</option>
                    </select>
                </div>
                <div style="display:flex;gap:8px;margin-top:20px;">
                    <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info','Excel dosyası oluşturuldu.')">📊 Excel</button>
                    <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info','CSV dışa aktarıldı.')">📋 CSV</button>
                    <button class="btn btn-primary btn-sm" onclick="window.BrenerApp.showToast('success','PDF raporu hazırlandı.')">📄 PDF Raporu</button>
                </div>
            </div>
        </div>

        <!-- Gelir-Gider Tablolar -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
            <!-- Gelirler -->
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;">
                    <h2 style="color:var(--success);">📈 Gelir Kayıtları</h2>
                    <span style="font-weight:700;color:var(--success);">${toplamGelir.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div class="table-responsive">
                    <table style="font-size:0.82rem;">
                        <thead><tr><th>Tarih</th><th>Açıklama</th><th>Kategori</th><th>Tutar</th></tr></thead>
                        <tbody>${gelirRows}</tbody>
                    </table>
                </div>
                <div style="text-align:right;padding-top:12px;font-weight:700;font-size:1rem;border-top:1px solid var(--border-color);margin-top:8px;color:var(--success);">
                    Toplam: ${toplamGelir.toLocaleString('tr-TR')} ₺
                </div>
            </div>

            <!-- Giderler -->
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;">
                    <h2 style="color:var(--danger);">📉 Gider Kayıtları</h2>
                    <span style="font-weight:700;color:var(--danger);">${toplamGider.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div class="table-responsive">
                    <table style="font-size:0.82rem;">
                        <thead><tr><th>Tarih</th><th>Açıklama</th><th>Kategori</th><th>Tutar</th></tr></thead>
                        <tbody>${giderRows}</tbody>
                    </table>
                </div>
                <div style="text-align:right;padding-top:12px;font-weight:700;font-size:1rem;border-top:1px solid var(--border-color);margin-top:8px;color:var(--danger);">
                    Toplam: ${toplamGider.toLocaleString('tr-TR')} ₺
                </div>
            </div>
        </div>

        <!-- Kategori Dağılım Özeti -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;"><h2>📊 Gelir Kategori Dağılımı</h2></div>
                ${Object.entries(gelirKatMap).map(([k,v])=>`
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <span style="font-size:0.82rem;">${k}</span>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:100px;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;">
                            <div style="height:100%;width:${Math.round(v/toplamGelir*100)}%;background:var(--success);border-radius:3px;"></div>
                        </div>
                        <span style="font-size:0.8rem;font-weight:600;color:var(--success);width:100px;text-align:right;">${v.toLocaleString('tr-TR')} ₺</span>
                    </div>
                </div>`).join('')}
            </div>
            <div class="card">
                <div class="card-header" style="margin-bottom:16px;"><h2>📊 Gider Kategori Dağılımı</h2></div>
                ${Object.entries(giderKatMap).map(([k,v])=>`
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <span style="font-size:0.82rem;">${k}</span>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:100px;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;">
                            <div style="height:100%;width:${Math.round(v/toplamGider*100)}%;background:var(--danger);border-radius:3px;"></div>
                        </div>
                        <span style="font-size:0.8rem;font-weight:600;color:var(--danger);width:100px;text-align:right;">${v.toLocaleString('tr-TR')} ₺</span>
                    </div>
                </div>`).join('')}
            </div>
        </div>

        <!-- Hızlı Kayıt Ekle -->
        <div class="card">
            <div class="card-header" style="margin-bottom:16px;"><h2>➕ Hızlı Kayıt Ekle</h2></div>
            <div style="display:grid;grid-template-columns:auto 1fr 1fr 1fr auto;gap:12px;align-items:end;">
                <div class="form-group" style="margin:0;">
                    <label>Tür</label>
                    <select id="accType" style="background:rgba(255,255,255,0.04);border:1px solid var(--border-color);padding:9px;border-radius:8px;color:var(--text-main);">
                        <option value="gelir">📈 Gelir</option>
                        <option value="gider">📉 Gider</option>
                    </select>
                </div>
                <div class="form-group" style="margin:0;">
                    <label>Açıklama</label>
                    <input type="text" id="accDesc" placeholder="Örn: Araç kiralama gideri">
                </div>
                <div class="form-group" style="margin:0;">
                    <label>Kategori</label>
                    <input type="text" id="accCat" placeholder="Örn: İşletme Gideri">
                </div>
                <div class="form-group" style="margin:0;">
                    <label>Tutar (₺)</label>
                    <input type="number" id="accAmount" value="10000">
                </div>
                <button class="btn btn-primary" id="addAccEntryBtn">Ekle</button>
            </div>
        </div>`;

        document.getElementById('addAccEntryBtn').onclick = () => {
            const type = document.getElementById('accType').value;
            const desc = document.getElementById('accDesc').value.trim();
            const amount = parseFloat(document.getElementById('accAmount').value);
            if (!desc || !amount) { alert('Açıklama ve tutar zorunlu!'); return; }
            const icon = type === 'gelir' ? '📈' : '📉';
            window.BrenerApp.showToast('success', `${icon} ${desc} — ${amount.toLocaleString('tr-TR')} ₺ ${type} kaydı eklendi.`);
            document.getElementById('accDesc').value = '';
        };
    }
};
