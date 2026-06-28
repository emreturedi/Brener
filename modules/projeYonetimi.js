/* ==========================================================================
   BRENER GROUP - PROJECT MANAGEMENT & CONTRACT SUMMARIES (PROJE YÖNETİMİ)
   ========================================================================== */

window.BrenerApp.ProjeYonetimi = {
    // Component view state
    mode: 'list', // 'list' or 'form'
    editingContractId: null,
    temsilHeyetiTags: [],

    render(view, container) {
        if (view === 'proje-sozlesme-ozeti') {
            this.renderMain(container);
        } else if (view === 'teknik-sartname') {
            this.renderSpecs(container);
        }
    },

    renderMain(container) {
        const activeProj = window.BrenerApp.getActiveProject();
        if (!activeProj) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <h2>Aktif Proje Seçilmedi</h2>
                    <p style="color: var(--text-muted); margin-top: 10px;">Lütfen üst menüden bir proje seçin.</p>
                </div>
            `;
            return;
        }

        if (this.mode === 'list') {
            this.renderList(activeProj, container);
        } else {
            this.renderForm(activeProj, container);
        }
    },

    /* ====================================================================
       1. LIST VIEW (SÖZLEŞMELER LİSTESİ)
       ==================================================================== */
    renderList(project, container) {
        window.BrenerApp.updateTopbarTitle('Proje Sözleşmeleri', `${project.name} — Sözleşme Özetleri ve Hukuki Durumlar`);

        const allContracts = window.BrenerApp.state.projectContracts || {};
        let contractsList = allContracts[project.id] || [];
        if (contractsList && !Array.isArray(contractsList)) {
            contractsList = [ { id: 'c_' + Date.now(), ...contractsList } ];
            allContracts[project.id] = contractsList;
            window.BrenerApp.saveStateToStorage();
        }

        let html = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card">
                    <div class="card-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                        <div>
                            <h2 style="margin: 0; color: var(--text-main); font-size: 1.3rem;">📄 Proje Sözleşme Özetleri</h2>
                            <p style="color: var(--text-muted); font-size: 0.82rem; margin-top: 4px;">Aktif projeye kayıtlı tüm kentsel dönüşüm, kat karşılığı ve apartman sözleşmeleri.</p>
                        </div>
                        <button class="btn btn-primary" id="addContractBtn">
                            ➕ Yeni Sözleşme Özeti Ekle
                        </button>
                    </div>

                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Apartman / Proje Adı</th>
                                    <th>Ada / Parsel</th>
                                    <th>Arsa Alanı</th>
                                    <th>Malik Sayısı</th>
                                    <th>Paylaşım Oranı</th>
                                    <th>İnşaat Süresi</th>
                                    <th style="text-align: right;">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${contractsList.length === 0 ? `
                                    <tr>
                                        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
                                            Bu projeye ait kayıtlı sözleşme özeti bulunmamaktadır. "Yeni Sözleşme Özeti Ekle" butonuna basarak başlayabilirsiniz.
                                        </td>
                                    </tr>
                                ` : contractsList.map(c => `
                                    <tr>
                                        <td><strong>${c.apartman_ismi || 'İsimsiz Sözleşme'}</strong></td>
                                        <td><code>${c.ada || '—'} / ${c.parsel || '—'}</code></td>
                                        <td>${c.arsa_m2 ? c.arsa_m2 + ' m²' : '—'}</td>
                                        <td><span class="badge badge-info">${c.malik_sayisi || '—'}</span></td>
                                        <td style="font-weight: 700; color: var(--primary);">%${c.oran || 0}</td>
                                        <td>${c.insaat_suresi || '—'}</td>
                                        <td style="text-align: right;">
                                            <div style="display: inline-flex; gap: 6px;">
                                                <button class="btn btn-primary btn-sm edit-contract-btn" data-id="${c.id}">🔍 Detay / Düzenle</button>
                                                <button class="btn btn-secondary btn-sm print-contract-btn" data-id="${c.id}">🖨️ PDF Al</button>
                                                <button class="btn btn-danger btn-sm delete-contract-btn" data-id="${c.id}">🗑️ Sil</button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Event: Go to Add Form
        document.getElementById('addContractBtn').onclick = () => {
            this.mode = 'form';
            this.editingContractId = null;
            this.temsilHeyetiTags = [];
            this.renderMain(container);
        };

        // Action Buttons Event Listeners
        container.querySelectorAll('.edit-contract-btn').forEach(btn => {
            btn.onclick = (e) => {
                const contractId = e.target.getAttribute('data-id');
                const target = contractsList.find(c => c.id === contractId);
                if (target) {
                    this.mode = 'form';
                    this.editingContractId = contractId;
                    this.temsilHeyetiTags = [...(target.temsil_heyeti || [])];
                    this.renderMain(container);
                }
            };
        });

        container.querySelectorAll('.print-contract-btn').forEach(btn => {
            btn.onclick = (e) => {
                const contractId = e.target.getAttribute('data-id');
                const target = contractsList.find(c => c.id === contractId);
                if (target) {
                    this.exportContractPDF(target, project);
                }
            };
        });

        container.querySelectorAll('.delete-contract-btn').forEach(btn => {
            btn.onclick = (e) => {
                const contractId = e.target.getAttribute('data-id');
                const target = contractsList.find(c => c.id === contractId);
                if (target && confirm(`"${target.apartman_ismi}" sözleşmesini silmek istediğinize emin misiniz?`)) {
                    const updatedList = contractsList.filter(c => c.id !== contractId);
                    window.BrenerApp.state.projectContracts[project.id] = updatedList;
                    window.BrenerApp.saveStateToStorage();

                    // Log activity
                    window.BrenerApp.logActivity('proje', `Sözleşme özeti silindi: ${target.apartman_ismi}`, 'warning', `Ada/Parsel: ${target.ada}/${target.parsel}`);
                    window.BrenerApp.showToast('danger', 'Sözleşme özeti başarıyla silindi.');
                    this.renderList(project, container);
                }
            };
        });
    },

    /* ====================================================================
       2. FORM VIEW (EKLEME / GÜNCELLEME FORMU)
       ==================================================================== */
    renderForm(project, container) {
        const allContracts = window.BrenerApp.state.projectContracts || {};
        let contractsList = allContracts[project.id] || [];
        if (contractsList && !Array.isArray(contractsList)) {
            contractsList = [ { id: 'c_' + Date.now(), ...contractsList } ];
            allContracts[project.id] = contractsList;
            window.BrenerApp.saveStateToStorage();
        }

        let contract = null;
        if (this.editingContractId) {
            contract = contractsList.find(c => c.id === this.editingContractId);
        }

        // Initialize empty contract template for "New" mode
        if (!contract) {
            contract = {
                id: null,
                apartman_ismi: "",
                adres: "",
                ada: "",
                parsel: "",
                arsa_m2: 0,
                malik_sayisi: "",
                oran: 40,
                yarisi_bizden: false,
                sozlesme_tarihi: "",
                sozlesme_tarihi_bitis: "",
                yikim_tarihi: "",
                ruhsat_donemi: "",
                insaat_suresi: "",
                is_gecikmesi_cezasi: 0,
                teminat_mektubu: "",
                tasinma_yardimi: "",
                kira_yardimi: "",
                kira_baslangic_bitis: "",
                emlak_vergileri: "Yüklenici",
                kapici_tazminat: "",
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
                müteahhit_hakedisi: "",
                temsil_heyeti: [],
                karar_orani: "",
                ihtilaf_merkezi: "İSTAÇ",
                fesih_sarti: ""
            };
            this.temsilHeyetiTags = [];
        }

        window.BrenerApp.updateTopbarTitle(
            this.editingContractId ? 'Sözleşme Düzenle' : 'Yeni Sözleşme Ekle', 
            `${project.name} — ${this.editingContractId ? contract.apartman_ismi : 'Yeni Kayıt Oluşturma'}`
        );

        const formattedCeza = contract.is_gecikmesi_cezasi ? '₺' + parseInt(contract.is_gecikmesi_cezasi).toLocaleString('tr-TR') : '';

        let html = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <!-- Üst Navigasyon & Aksiyon Kartı -->
                <div class="card" style="background: linear-gradient(135deg, rgba(204,163,82,0.1), rgba(21,29,45,0.5)); border-color: rgba(204,163,82,0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button class="btn btn-secondary" id="backToListBtn" style="padding: 10px 16px;">
                                ⬅️ Listeye Dön
                            </button>
                            <div>
                                <span class="badge badge-primary" style="margin-bottom: 4px;">${this.editingContractId ? 'Sözleşme Güncelleme' : 'Yeni Sözleşme Girişi'}</span>
                                <h2 style="margin: 0; color: var(--text-main); font-size: 1.3rem;">${this.editingContractId ? contract.apartman_ismi : 'Yeni Sözleşme Detayları'}</h2>
                            </div>
                        </div>
                        <div style="display: inline-flex; gap: 10px;">
                            ${this.editingContractId ? `<button class="btn btn-secondary" id="formPrintBtn" style="padding: 12px 20px;">🖨️ PDF Raporu Al</button>` : ''}
                            <button class="btn btn-primary" id="saveContractFormBtn" style="padding: 12px 24px; font-weight: 700;">
                                💾 Sözleşmeyi Kaydet
                            </button>
                        </div>
                    </div>
                </div>

                <div class="grid-2col" style="align-items: start;">
                    <!-- SOL KOLON: Bilgiler ve Şartlar -->
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <!-- BLOK 1: Genel Bilgiler -->
                        <div class="card">
                            <div class="card-header" style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                                <h3 style="color: var(--primary); font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                                    🏢 Genel Bilgiler
                                </h3>
                            </div>
                            
                            <div class="form-group">
                                <label>Apartman / Proje İsmi</label>
                                <input type="text" id="apartmanIsmi" value="${contract.apartman_ismi || ''}" placeholder="Örn: Port Apartmanı" class="custom-input">
                            </div>
                            <div class="form-group">
                                <label>Adres</label>
                                <textarea id="contractAdres" placeholder="Projenin tam tapu adresi..." style="height: 60px;">${contract.adres || ''}</textarea>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Ada</label>
                                    <input type="text" id="contractAda" value="${contract.ada || ''}" placeholder="Ada No" class="custom-input">
                                </div>
                                <div class="form-group">
                                    <label>Parsel</label>
                                    <input type="text" id="contractParsel" value="${contract.parsel || ''}" placeholder="Parsel No" class="custom-input">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Arsa Alanı (m²)</label>
                                    <input type="number" id="contractArsaM2" value="${contract.arsa_m2 || 0}" class="custom-input">
                                </div>
                                <div class="form-group">
                                    <label>Malik Sayısı</label>
                                    <input type="text" id="contractMalikSayisi" value="${contract.malik_sayisi || ''}" placeholder="Örn: 38 Daire" class="custom-input">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Paylaşım Oranı (%)</label>
                                    <input type="number" id="contractOran" value="${contract.oran || 40}" placeholder="Örn: 40" class="custom-input">
                                </div>
                                <div class="form-group">
                                    <label>Yarısı Bizden Desteği</label>
                                    <select id="contractYarisiBizden">
                                        <option value="true" ${contract.yarisi_bizden === true ? 'selected' : ''}>Evet (Faydalanıyor)</option>
                                        <option value="false" ${contract.yarisi_bizden === false ? 'selected' : ''}>Hayır (Faydalanmıyor)</option>
                                        <option value="belirsiz" ${contract.yarisi_bizden === 'belirsiz' ? 'selected' : ''}>Belirsiz / Süreçte</option>
                                    </select>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Sözleşme Başlangıç Tarihi</label>
                                    <input type="date" id="contractTarihBaslangic" value="${contract.sozlesme_tarihi || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Sözleşme Bitiş Tarihi</label>
                                    <input type="date" id="contractTarihBitis" value="${contract.sozlesme_tarihi_bitis || ''}">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Yıkım Tarihi</label>
                                    <input type="date" id="contractYikimTarih" value="${contract.yikim_tarihi || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Ruhsat Dönemi</label>
                                    <input type="text" id="contractRuhsatDonemi" value="${contract.ruhsat_donemi || ''}" placeholder="Örn: ŞUBAT veya ARALIK" class="custom-input">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>İnşaat Süresi</label>
                                    <input type="text" id="contractInsaatSuresi" value="${contract.insaat_suresi || ''}" placeholder="Örn: 15 AY" class="custom-input">
                                </div>
                                <div class="form-group">
                                    <label>Gecikme Cezası (Aylık)</label>
                                    <input type="text" id="contractGecikmeCezasi" value="${formattedCeza}" placeholder="₺20.000" class="custom-input">
                                </div>
                            </div>
                        </div>

                        <!-- BLOK 2: Finansal ve Hukuki Şartlar -->
                        <div class="card">
                            <div class="card-header" style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                                <h3 style="color: var(--primary); font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                                    ⚖️ Finansal & Hukuki Şartlar
                                </h3>
                            </div>
                            
                            <div class="form-group">
                                <label>Teminat Mektubu Detayı</label>
                                <input type="text" id="contractTeminat" value="${contract.teminat_mektubu || ''}" placeholder="Örn: Yok veya 10.000.000 TL" class="custom-input">
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Taşınma Yardımı</label>
                                    <input type="text" id="contractTasinmaYardimi" value="${contract.tasinma_yardimi || ''}" placeholder="Örn: 15.000 TL" class="custom-input">
                                </div>
                                <div class="form-group">
                                    <label>Kira Yardımı</label>
                                    <input type="text" id="contractKiraYardimi" value="${contract.kira_yardimi || ''}" placeholder="Örn: Aylık 7.500 TL" class="custom-input">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Kira Başlangıç / Bitiş Tanımı</label>
                                <input type="text" id="contractKiraDonemi" value="${contract.kira_baslangic_bitis || ''}" placeholder="Örn: Yıkımdan teslim tarihine kadar" class="custom-input">
                            </div>

                            <div class="form-group">
                                <label>Emlak Vergilerini Kim Öder?</label>
                                <select id="contractEmlakVergisi">
                                    <option value="Yüklenici" ${contract.emlak_vergileri === 'Yüklenici' ? 'selected' : ''}>Yüklenici (Müteahhit Firma)</option>
                                    <option value="Kat Maliki" ${contract.emlak_vergileri === 'Kat Maliki' ? 'selected' : ''}>Kat Maliki</option>
                                    <option value="Ortak" ${contract.emlak_vergileri === 'Ortak' ? 'selected' : ''}>%50 / %50 Ortaklaşa</option>
                                </select>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Kapıcı Kıdem Tazminatı</label>
                                    <input type="text" id="contractKapiciTazminat" value="${contract.kapici_tazminat || ''}" placeholder="Örn: Yükleniciye ait" class="custom-input">
                                </div>
                                <div class="form-group">
                                    <label>Mülkiyet & Tapu Masrafları</label>
                                    <select id="contractTapuMasrafi">
                                        <option value="Kat Maliki" ${contract.mulkiyet_tapu_masrafi === 'Kat Maliki' ? 'selected' : ''}>Kat Maliki</option>
                                        <option value="Yüklenici" ${contract.mulkiyet_tapu_masrafi === 'Yüklenici' ? 'selected' : ''}>Yüklenici</option>
                                        <option value="Ortak" ${contract.mulkiyet_tapu_masrafi === 'Ortak' ? 'selected' : ''}>Ortaklaşa</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SAĞ KOLON: Milestones, Temsil Heyeti ve Karar Detayları -->
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <!-- BLOK 3: Tapu Devri Hakediş Kilometre Taşları (Dynamic & Validated) -->
                        <div class="card">
                            <div class="card-header" style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="color: var(--primary); font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                                    🔑 Tapu Kilometre Taşları
                                </h3>
                                <span id="milestoneTotalBadge" class="badge badge-success" style="font-size: 0.8rem; padding: 6px 12px;">
                                    Toplam: %100
                                </span>
                            </div>

                            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 14px;">
                                İnşaat imalat adımlarına göre yükleniciye yapılacak tapu devri hakediş yüzdeleri. Toplamı **%100** olmak zorundadır.
                            </p>

                            <div style="display: flex; flex-direction: column; gap: 10px;" id="milestonesContainer">
                                <!-- Generated Dynamically -->
                            </div>

                            <button class="btn btn-secondary btn-sm" id="addMilestoneBtn" style="margin-top: 14px; width: 100%;">
                                ➕ Yeni Aşama / Kilometre Taşı Ekle
                            </button>
                            
                            <div id="milestoneWarningArea" style="margin-top: 10px; color: var(--danger); font-size: 0.8rem; font-weight: 600; display: none;">
                                ⚠️ Aşama oranları toplamı %100 olmalıdır!
                            </div>
                        </div>

                        <!-- BLOK 4: Sözleşme ve Karar Detayları -->
                        <div class="card">
                            <div class="card-header" style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                                <h3 style="color: var(--primary); font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                                    📝 Karar & Karar Heyeti
                                </h3>
                            </div>

                            <div class="form-group">
                                <label>Müteahhit / Yüklenici Hakedişi</label>
                                <input type="text" id="contractMuteahhitHakedis" value="${contract.müteahhit_hakedisi || ''}" placeholder="Örn: 11 Daire veya %45" class="custom-input">
                            </div>

                            <!-- Temsil Heyeti Tag input -->
                            <div class="form-group">
                                <label>Temsil Heyeti Üyeleri</label>
                                <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                                    <input type="text" id="heyetNameInput" placeholder="İsim yazıp enter/virgül basın..." class="custom-input" style="flex: 1;">
                                    <button class="btn btn-secondary" id="addHeyetNameBtn" style="padding: 0 14px;">Ekle</button>
                                </div>
                                <div id="heyetTagsContainer" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; background: rgba(0,0,0,0.15); border: 1px solid var(--border-color); border-radius: 8px; min-height: 44px;">
                                    <!-- Rendered dynamically -->
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Karar Oranı / Oy Birliği</label>
                                    <input type="text" id="contractKararOrani" value="${contract.karar_orani || ''}" placeholder="Örn: 5 TE 3 veya Salt Çoğunluk" class="custom-input">
                                </div>
                                <div class="form-group">
                                    <label>İhtilaf Çözüm Merkezi</label>
                                    <input type="text" id="contractIhtilafMerkezi" value="${contract.ihtilaf_merkezi || 'İSTAÇ'}" class="custom-input">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Sözleşme Fesih Şartı</label>
                                <textarea id="contractFesihSarti" placeholder="Sözleşmenin feshine sebep olacak gecikme veya ihlal koşulları..." style="height: 60px;">${contract.fesih_sarti || ''}</textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Render Milestones & Tags
        this.renderMilestonesList(contract.milestones || []);
        this.renderHeyetTags();

        // Currency Masking logic
        const gecikmeInput = document.getElementById('contractGecikmeCezasi');
        gecikmeInput.addEventListener('input', (e) => {
            let clean = e.target.value.replace(/[^\d]/g, "");
            if (clean === "") {
                e.target.value = "";
                return;
            }
            let parsed = parseInt(clean, 10);
            e.target.value = '₺' + parsed.toLocaleString('tr-TR');
        });

        // Representative Board (Temsil Heyeti) event listeners
        const heyetInput = document.getElementById('heyetNameInput');
        const addHeyetBtn = document.getElementById('addHeyetNameBtn');

        const addHeyetName = () => {
            const val = heyetInput.value.trim().replace(/,/g, "");
            if (val && !this.temsilHeyetiTags.includes(val)) {
                this.temsilHeyetiTags.push(val);
                this.renderHeyetTags();
                heyetInput.value = "";
            }
        };

        heyetInput.onkeypress = (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addHeyetName();
            }
        };
        addHeyetBtn.onclick = addHeyetName;

        // Back to list action
        document.getElementById('backToListBtn').onclick = () => {
            this.mode = 'list';
            this.renderMain(container);
        };

        // Print Action inside form
        if (this.editingContractId) {
            document.getElementById('formPrintBtn').onclick = () => {
                this.exportContractPDF(contract, project);
            };
        }

        // Dynamic Milestones buttons
        document.getElementById('addMilestoneBtn').onclick = () => {
            const currentMilestones = this.collectMilestones();
            currentMilestones.push({ name: "Yeni Aşama", percent: 0 });
            this.renderMilestonesList(currentMilestones);
        };

        // Save Button Action
        document.getElementById('saveContractFormBtn').onclick = () => {
            const finalMilestones = this.collectMilestones();
            const totalPercent = finalMilestones.reduce((acc, curr) => acc + curr.percent, 0);

            if (totalPercent !== 100) {
                window.BrenerApp.showToast('danger', `Hata: Tapu devri yüzdeleri toplamı %100 olmalıdır! (Şu an: %${totalPercent})`);
                document.getElementById('milestoneWarningArea').style.display = 'block';
                document.getElementById('milestoneWarningArea').textContent = `⚠️ Aşama oranları toplamı %100 olmalıdır! (Mevcut Toplam: %${totalPercent})`;
                return;
            }

            const name = document.getElementById('apartmanIsmi').value.trim();
            if (!name) {
                alert('Lütfen Apartman / Proje İsmini doldurun!');
                return;
            }

            // Extract numeric value from masked currency
            const rawCezaStr = document.getElementById('contractGecikmeCezasi').value.replace(/[^\d]/g, "");
            const isGecikmesiCezasi = rawCezaStr ? parseInt(rawCezaStr, 10) : 0;

            const isNew = !this.editingContractId;
            const updatedContract = {
                id: this.editingContractId || 'c_' + Date.now(),
                apartman_ismi: name,
                adres: document.getElementById('contractAdres').value.trim(),
                ada: document.getElementById('contractAda').value.trim(),
                parsel: document.getElementById('contractParsel').value.trim(),
                arsa_m2: parseFloat(document.getElementById('contractArsaM2').value) || 0,
                malik_sayisi: document.getElementById('contractMalikSayisi').value.trim(),
                oran: parseFloat(document.getElementById('contractOran').value) || 0,
                yarisi_bizden: document.getElementById('contractYarisiBizden').value === 'true' ? true : 
                               document.getElementById('contractYarisiBizden').value === 'false' ? false : 'belirsiz',
                sozlesme_tarihi: document.getElementById('contractTarihBaslangic').value,
                sozlesme_tarihi_bitis: document.getElementById('contractTarihBitis').value,
                yikim_tarihi: document.getElementById('contractYikimTarih').value,
                ruhsat_donemi: document.getElementById('contractRuhsatDonemi').value.trim(),
                insaat_suresi: document.getElementById('contractInsaatSuresi').value.trim(),
                is_gecikmesi_cezasi: isGecikmesiCezasi,
                teminat_mektubu: document.getElementById('contractTeminat').value.trim(),
                tasinma_yardimi: document.getElementById('contractTasinmaYardimi').value.trim(),
                kira_yardimi: document.getElementById('contractKiraYardimi').value.trim(),
                kira_baslangic_bitis: document.getElementById('contractKiraDonemi').value.trim(),
                emlak_vergileri: document.getElementById('contractEmlakVergisi').value,
                kapici_tazminat: document.getElementById('contractKapiciTazminat').value.trim(),
                mulkiyet_tapu_masrafi: document.getElementById('contractTapuMasrafi').value,
                milestones: finalMilestones,
                müteahhit_hakedisi: document.getElementById('contractMuteahhitHakedis').value.trim(),
                temsil_heyeti: this.temsilHeyetiTags,
                karar_orani: document.getElementById('contractKararOrani').value.trim(),
                ihtilaf_merkezi: document.getElementById('contractIhtilafMerkezi').value.trim(),
                fesih_sarti: document.getElementById('contractFesihSarti').value.trim()
            };

            // Update/Push list
            if (isNew) {
                contractsList.unshift(updatedContract);
            } else {
                const idx = contractsList.findIndex(c => c.id === this.editingContractId);
                if (idx !== -1) {
                    contractsList[idx] = updatedContract;
                }
            }

            // Save to global state
            window.BrenerApp.state.projectContracts[project.id] = contractsList;
            window.BrenerApp.saveStateToStorage();

            // Log activity
            window.BrenerApp.logActivity(
                'proje', 
                `Sözleşme özeti ${isNew ? 'eklendi' : 'güncellendi'}: ${updatedContract.apartman_ismi}`, 
                'success', 
                `Ada/Parsel: ${updatedContract.ada}/${updatedContract.parsel}, Paylaşım Oranı: %${updatedContract.oran}`
            );

            window.BrenerApp.showToast('success', `Sözleşme başarıyla ${isNew ? 'kaydedildi' : 'güncellendi'}.`);
            this.mode = 'list';
            this.renderMain(container);
        };
    },

    // Render Milestone rows
    renderMilestonesList(milestonesList) {
        const wrapper = document.getElementById('milestonesContainer');
        wrapper.innerHTML = '';

        milestonesList.forEach((m, idx) => {
            const row = document.createElement('div');
            row.style = 'display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);';
            row.className = 'milestone-row';
            row.innerHTML = `
                <input type="text" class="custom-input milestone-name" value="${m.name}" placeholder="Aşama Adı" style="flex: 2; padding: 6px 10px; font-size: 0.8rem;">
                <div style="display: flex; align-items: center; gap: 4px; flex: 1;">
                    <input type="number" class="custom-input milestone-percent" value="${m.percent}" min="0" max="100" style="padding: 6px; font-size: 0.8rem; text-align: center; width: 65px;">
                    <span style="font-weight:600; color: var(--text-muted);">%</span>
                </div>
                <button class="btn btn-danger btn-sm delete-milestone-btn" style="padding: 6px 10px; font-size: 0.8rem;" data-index="${idx}">🗑️</button>
            `;
            wrapper.appendChild(row);
        });

        // Add event listeners to detect change & recalculate total
        const inputs = wrapper.querySelectorAll('.milestone-percent');
        inputs.forEach(input => {
            input.oninput = () => this.updateMilestonesTotal();
        });

        // Delete Milestone button listener
        wrapper.querySelectorAll('.delete-milestone-btn').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                const currentMilestones = this.collectMilestones();
                currentMilestones.splice(idx, 1);
                this.renderMilestonesList(currentMilestones);
                this.updateMilestonesTotal();
            };
        });

        this.updateMilestonesTotal();
    },

    // Collect Milestones from inputs
    collectMilestones() {
        const list = [];
        const rows = document.querySelectorAll('.milestone-row');
        rows.forEach(row => {
            const name = row.querySelector('.milestone-name').value.trim();
            const percent = parseInt(row.querySelector('.milestone-percent').value) || 0;
            list.push({ name, percent });
        });
        return list;
    },

    // Live update total percent badge
    updateMilestonesTotal() {
        const milestones = this.collectMilestones();
        const sum = milestones.reduce((acc, curr) => acc + curr.percent, 0);

        const badge = document.getElementById('milestoneTotalBadge');
        if (badge) {
            badge.textContent = `Toplam: %${sum}`;
            if (sum === 100) {
                badge.className = 'badge badge-success';
                document.getElementById('milestoneWarningArea').style.display = 'none';
            } else {
                badge.className = 'badge badge-danger';
            }
        }
    },

    // Render Temsil Heyeti Tags
    renderHeyetTags() {
        const container = document.getElementById('heyetTagsContainer');
        container.innerHTML = '';

        if (this.temsilHeyetiTags.length === 0) {
            container.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem; padding: 5px;">Temsil heyeti üyesi eklenmedi.</span>`;
            return;
        }

        this.temsilHeyetiTags.forEach((name, idx) => {
            const tag = document.createElement('span');
            tag.style = 'display: inline-flex; align-items: center; gap: 6px; background: rgba(204,163,82,0.15); border: 1px solid rgba(204,163,82,0.3); color: var(--primary); padding: 4px 10px; border-radius: 16px; font-size: 0.75rem; font-weight: 500;';
            tag.innerHTML = `
                ${name}
                <span class="remove-tag" style="cursor: pointer; font-weight: bold; font-size: 0.85rem;" data-index="${idx}">&times;</span>
            `;
            container.appendChild(tag);
        });

        // Hook remove action
        container.querySelectorAll('.remove-tag').forEach(closeBtn => {
            closeBtn.onclick = (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                this.temsilHeyetiTags.splice(idx, 1);
                this.renderHeyetTags();
            };
        });
    },

    /* ====================================================================
       3. PDF RAPOR ÇIKTISI (PRINT TEMPLATE GENERATION)
       ==================================================================== */
    exportContractPDF(contract, project) {
        const printWindow = window.open('', '_blank', 'width=900,height=800');
        if (!printWindow) {
            alert('Lütfen tarayıcınızın pop-up engelleyicisini kaldırın.');
            return;
        }

        // Helper formatting functions
        const formatFnc = val => val ? val : '—';
        const formatCurrency = val => val ? '₺' + parseInt(val).toLocaleString('tr-TR') : '—';
        const formatDate = dStr => {
            if (!dStr) return '—';
            const parts = dStr.split('-');
            if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
            return dStr;
        };

        const totalPercent = (contract.milestones || []).reduce((acc, curr) => acc + curr.percent, 0);

        printWindow.document.write(`
            <html>
            <head>
                <title>${contract.apartman_ismi || 'Sözleşme Raporu'}</title>
                <style>
                    body {
                        font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
                        color: #1f2937;
                        background: #ffffff;
                        line-height: 1.4;
                        margin: 0;
                        padding: 40px;
                        font-size: 13px;
                    }
                    .header-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 25px;
                        border-bottom: 3px solid #cca352;
                        padding-bottom: 10px;
                    }
                    .logo-title {
                        font-size: 20px;
                        font-weight: 800;
                        color: #0d111c;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                    }
                    .logo-sub {
                        font-size: 10px;
                        color: #cca352;
                        font-weight: bold;
                        letter-spacing: 3px;
                        text-transform: uppercase;
                    }
                    .report-title {
                        text-align: right;
                        font-size: 16px;
                        font-weight: 700;
                        color: #1f2937;
                        text-transform: uppercase;
                    }
                    .report-date {
                        text-align: right;
                        font-size: 11px;
                        color: #6b7280;
                    }
                    h2 {
                        font-size: 13px;
                        color: #0d111c;
                        border-bottom: 1px solid #e5e7eb;
                        padding-bottom: 5px;
                        margin-top: 20px;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .table-summary {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    .table-summary th {
                        background: #f9fafb;
                        color: #374151;
                        font-weight: 600;
                        text-align: left;
                        border: 1px solid #e5e7eb;
                        padding: 7px 10px;
                        width: 30%;
                    }
                    .table-summary td {
                        border: 1px solid #e5e7eb;
                        padding: 7px 10px;
                        color: #1f2937;
                    }
                    .grid-2col {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    .milestones-list {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    .milestones-list th {
                        background: #f3f4f6;
                        color: #111827;
                        font-weight: 700;
                        padding: 6px 10px;
                        border: 1px solid #e5e7eb;
                        font-size: 11px;
                    }
                    .milestones-list td {
                        padding: 6px 10px;
                        border: 1px solid #e5e7eb;
                    }
                    .sign-section {
                        margin-top: 40px;
                        page-break-inside: avoid;
                    }
                    .sign-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .sign-title {
                        font-weight: 700;
                        text-transform: uppercase;
                        font-size: 11px;
                        color: #374151;
                        padding-bottom: 40px;
                        border-bottom: 1px dashed #d1d5db;
                    }
                    .footer-note {
                        margin-top: 30px;
                        font-size: 10px;
                        color: #9ca3af;
                        text-align: center;
                        border-top: 1px solid #f3f4f6;
                        padding-top: 10px;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <!-- Üst Rapor Başlığı & Antet -->
                <table class="header-table">
                    <tr>
                        <td>
                            <div class="logo-title">Brener Group</div>
                            <div class="logo-sub">İnşaat Yatırım A.Ş.</div>
                        </td>
                        <td>
                            <div class="report-title">Proje Sözleşme Özeti</div>
                            <div class="report-date">Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</div>
                        </td>
                    </tr>
                </table>

                <div class="grid-2col">
                    <div>
                        <h2>🏢 Genel Bilgiler</h2>
                        <table class="table-summary">
                            <tr><th>Apartman / Proje Adı</th><td>${formatFnc(contract.apartman_ismi)}</td></tr>
                            <tr><th>Proje Konumu (Grup)</th><td>${project.name}</td></tr>
                            <tr><th>Ada / Parsel No</th><td>${formatFnc(contract.ada)} / ${formatFnc(contract.parsel)}</td></tr>
                            <tr><th>Arsa Alanı</th><td>${contract.arsa_m2 ? contract.arsa_m2 + ' m²' : '—'}</td></tr>
                            <tr><th>Kat Malik Sayısı</th><td>${formatFnc(contract.malik_sayisi)}</td></tr>
                            <tr><th>Paylaşım Oranı</th><td>%${contract.oran || 0}</td></tr>
                            <tr><th>Yarısı Bizden Desteği</th><td>${contract.yarisi_bizden === true ? 'Evet' : contract.yarisi_bizden === false ? 'Hayır' : 'Belirsiz'}</td></tr>
                            <tr><th>Sözleşme Tarihi</th><td>${formatDate(contract.sozlesme_tarihi)} / ${formatDate(contract.sozlesme_tarihi_bitis)}</td></tr>
                            <tr><th>Yıkım Tarihi</th><td>${formatDate(contract.yikim_tarihi)}</td></tr>
                            <tr><th>Ruhsat Dönemi</th><td>${formatFnc(contract.ruhsat_donemi)}</td></tr>
                            <tr><th>Taahhüt Süresi</th><td>${formatFnc(contract.insaat_suresi)}</td></tr>
                            <tr><th>Gecikme Cezası (Aylık)</th><td>${formatCurrency(contract.is_gecikmesi_cezasi)}</td></tr>
                            <tr><th>Adres</th><td style="font-size: 11px;">${formatFnc(contract.adres)}</td></tr>
                        </table>
                    </div>

                    <div>
                        <h2>⚖️ Finansal & Hukuki Şartlar</h2>
                        <table class="table-summary">
                            <tr><th>Teminat Mektubu Detayı</th><td>${formatFnc(contract.teminat_mektubu)}</td></tr>
                            <tr><th>Taşınma Yardımı (Tek Sefer)</th><td>${formatFnc(contract.tasinma_yardimi)}</td></tr>
                            <tr><th>Kira Yardımı (Aylık)</th><td>${formatFnc(contract.kira_yardimi)}</td></tr>
                            <tr><th>Kira Dönemi Tanımı</th><td>${formatFnc(contract.kira_baslangic_bitis)}</td></tr>
                            <tr><th>Emlak Vergileri</th><td>${formatFnc(contract.emlak_vergileri)}</td></tr>
                            <tr><th>Kapıcı Kıdem Tazminatı</th><td>${formatFnc(contract.kapici_tazminat)}</td></tr>
                            <tr><th>Mülkiyet & Tapu Masrafı</th><td>${formatFnc(contract.mulkiyet_tapu_masrafi)}</td></tr>
                        </table>

                        <h2>📝 Karar & Sözleşme Detayları</h2>
                        <table class="table-summary">
                            <tr><th>Müteahhit Hakedişi</th><td>${formatFnc(contract.müteahhit_hakedisi)}</td></tr>
                            <tr><th>Karar Oranı</th><td>${formatFnc(contract.karar_orani)}</td></tr>
                            <tr><th>İhtilaf Çözüm Merkezi</th><td>${formatFnc(contract.ihtilaf_merkezi)}</td></tr>
                            <tr><th>Sözleşme Fesih Şartı</th><td style="font-size: 11px;">${formatFnc(contract.fesih_sarti)}</td></tr>
                        </table>
                    </div>
                </div>

                <div class="grid-2col" style="margin-top: 15px;">
                    <div>
                        <h2>🔑 Tapu Devri Kilometre Taşları</h2>
                        <table class="milestones-list">
                            <thead>
                                <tr>
                                    <th style="text-align: left;">İnşaat İmalat Aşaması</th>
                                    <th style="text-align: center; width: 80px;">Hak Yüzdesi</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(contract.milestones || []).map(m => `
                                    <tr>
                                        <td>${m.name}</td>
                                        <td style="text-align: center; font-weight: bold; color: #cca352;">%${m.percent}</td>
                                    </tr>
                                `).join('')}
                                <tr style="background: #f9fafb; font-weight: bold;">
                                    <td>Toplam Oran</td>
                                    <td style="text-align: center; color: #10b981;">%${totalPercent}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <h2>👥 Karar / Temsil Heyeti Üyeleri</h2>
                        <ul style="padding-left: 20px; margin: 0; color: #374151;">
                            ${(contract.temsil_heyeti || []).length === 0 
                                ? '<li>Temsil heyeti üyesi tanımlanmamıştır.</li>' 
                                : contract.temsil_heyeti.map(name => `<li><strong>${name}</strong></li>`).join('')
                            }
                        </ul>
                    </div>
                </div>

                <!-- İmza Bölümleri -->
                <div class="sign-section">
                    <table class="sign-table">
                        <tr>
                            <td style="width: 45%; vertical-align: top;">
                                <div class="sign-title">Kat Malikleri Temsil Heyeti Üyeleri</div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                                    ${(contract.temsil_heyeti || []).map(name => `
                                        <div style="font-size: 11px; margin-bottom: 25px;">
                                            <div>${name}</div>
                                            <div style="color: #9ca3af; font-size: 9px; margin-top: 15px;">(İmza)</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </td>
                            <td style="width: 10%;"></td>
                            <td style="width: 45%; vertical-align: top;">
                                <div class="sign-title">Yüklenici Firma Kaşe / İmza</div>
                                <div style="margin-top: 15px; font-size: 11px;">
                                    <strong>BRENER GROUP İNŞAAT YATIRIM A.Ş.</strong>
                                    <div style="color: #9ca3af; font-size: 9px; margin-top: 60px;">(Yetkili İmza / Kaşe)</div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="footer-note">
                    Brener Group İnşaat Yönetim Sistemi (Brener Group Construction Management Platform) tarafından üretilmiştir.
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    /* ====================================================================
       4. TEKNİK ŞARTNAME MODÜLÜ (TECHNICAL SPECIFICATIONS)
       ==================================================================== */
    activeSpecsTab: 'editor', // 'editor', 'preview', 'upload'

    renderSpecs(container) {
        const activeProj = window.BrenerApp.getActiveProject();
        if (!activeProj) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <h2>Aktif Proje Seçilmedi</h2>
                    <p style="color: var(--text-muted); margin-top: 10px;">Lütfen üst menüden bir proje seçin.</p>
                </div>
            `;
            return;
        }

        window.BrenerApp.updateTopbarTitle('Teknik Şartname', `${activeProj.name} — Malzeme ve İmalat Standartları`);

        const allSpecs = window.BrenerApp.state.projectSpecs || {};
        let specs = allSpecs[activeProj.id];

        // If no spec exists for this project, initialize with the 23 default clauses
        if (!specs) {
            specs = {
                metadata: {
                    ilce_semt: activeProj.location || "",
                    bina_adi: activeProj.name + " Projesi",
                    ada_no: "",
                    parsel_no: "",
                    sartname_tarihi: new Date().toISOString().split('T')[0]
                },
                clauses: [
                    { id: 'c1', title: "1. Projeler ve Kaba İnşaat", content: "C30/37 hazır beton ve B420C demir kullanılacaktır." },
                    { id: 'c2', title: "2. Bodrum Kat", content: "Bohçalama mebran su izolasyonu yapılacaktır." },
                    { id: 'c3', title: "3. Binanın Dış Cephesi", content: "Doğal taş ve alüminyum kompozit panel cephe." },
                    { id: 'c4', title: "4. Zemin Kat ve Bina Girişi", content: "Granit döşeme ve led aydınlatmalı bina girişi." },
                    { id: 'c5', title: "5. Duvar ve Sıvalar", content: "Gazbeton duvar imalatı ve alçı sıva yapılacaktır." },
                    { id: 'c6', title: "6. Isı Sistemi", content: "Rehau marka yerden ısıtma borulaması çekilecektir." },
                    { id: 'c7', title: "7. Sıhhi ve Pis Su Sistemleri", content: "Sessiz atık su boruları kurulacaktır." },
                    { id: 'c8', title: "8. Elektrik - Klima Tesisatı", content: "Her odaya bağımsız klima altyapısı çekilecektir." },
                    { id: 'c9', title: "9. Televizyon Tesisat Sistemi", content: "Merkezi uydu hattı ve daire içi prizler." },
                    { id: 'c10', title: "10. Telefon ve Görüntülü Diafon Sistemi", content: "Audio marka kameralı diafon sistemi kurulacaktır." },
                    { id: 'c11', title: "11. Doğalgaz Tesisatı", content: "Daire kapı girişlerine gaz vanaları bırakılacaktır." },
                    { id: 'c12', title: "12. Çatı", content: "Çelik konstrüksiyon çatı, arduaz kaplama." },
                    { id: 'c13', title: "13. Bahçe ve Dış Duvarlar", content: "Çevre koruma betonarme duvarı ve peyzaj düzenlemesi." },
                    { id: 'c14', title: "14. Asansörler", content: "Kone 10 kişilik VVVF lüks kabinli asansör." },
                    { id: 'c15', title: "15. Merdiven ve Sahanlıklar", content: "Mermer kaplama ve alüminyum merdiven korkulukları." },
                    { id: 'c16', title: "16. Doğramalar", content: "Rehau PVC doğramalar ve çift açılımlı Isıcam Konfor." },
                    { id: 'c17', title: "17. Kapalı Garaj", content: "Helikopter perdahlı beton otopark alanı." },
                    { id: 'c18', title: "18. Daire Dış ve İç Kapıları", content: "Dortek çelik dış kapı ve Dortek lake oda kapıları." },
                    { id: 'c19', title: "19. Mutfaklar", content: "Lineadecor mutfak üniteleri ve Belenco kuvars tezgah." },
                    { id: 'c20', title: "20. Banyo ve WC", content: "Vitra asma rezervuarlı klozet ve Kütahya Seramik 60x120 kaplama." },
                    { id: 'c21', title: "21. Antre ve Koridorlar", content: "Girişte özel tasarım lake portmanto dolabı." },
                    { id: 'c22', title: "22. Salon ve Odalar", content: "1. sınıf derzli lamine parke kaplaması." },
                    { id: 'c23', title: "23. İşçilik ve Garanti Koşulları", content: "İnce ve kaba tüm imalat hataları 5 yıl boyunca Brener garantisindedir." }
                ],
                notes: "Yarısı bizden hibe/kredi kampanyası desteklidir. Residence Konsepti tasarımdır.",
                sartname_durumu: "Taslak",
                signed_file_url: "",
                kat_malikleri_sayisi: 38,
                signed_files: []
            };
            window.BrenerApp.state.projectSpecs[activeProj.id] = specs;
            window.BrenerApp.saveStateToStorage();
        }

        if (!specs.signed_files) specs.signed_files = [];
        if (!specs.clauses) specs.clauses = [];
        if (!specs.metadata) {
            specs.metadata = { ilce_semt: "", bina_adi: "", ada_no: "", parsel_no: "", sartname_tarihi: "" };
        }

        // Header and Tabs HTML
        let html = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <!-- Üst Bilgi Kartı -->
                <div class="card" style="background: linear-gradient(135deg, rgba(204,163,82,0.1), rgba(21,29,45,0.5)); border-color: rgba(204,163,82,0.3); margin-bottom: 5px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                        <div>
                            <span class="badge badge-primary" style="margin-bottom: 8px;">Malzeme & İmalat Standartları</span>
                            <h2 style="margin: 0; color: var(--text-main); font-size: 1.5rem;">${activeProj.name} Teknik Şartnamesi</h2>
                            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">Şartname taslağını hazırlayın, önizleyin ve ıslak imzalı belgeleri arşivleyin.</p>
                        </div>
                        <div style="display: inline-flex; gap: 10px;">
                            ${this.activeSpecsTab === 'editor' ? `
                                <button class="btn btn-secondary" id="saveSpecTemplateBtn">💾 Şablon Olarak Kaydet</button>
                                <button class="btn btn-primary" id="saveSpecsBtn">💾 Şartnameyi Kaydet</button>
                            ` : ''}
                            ${this.activeSpecsTab === 'preview' ? `
                                <button class="btn btn-primary" id="printSpecsBtn">🖨️ PDF / Rapor Yazdır</button>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Sekme Gezinme Menüsü -->
                <div style="display: flex; gap: 10px; border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-bottom: 10px;">
                    <button class="btn ${this.activeSpecsTab === 'editor' ? 'btn-primary' : 'btn-secondary'}" id="tabSpecsEditorBtn" style="padding: 10px 18px;">✍️ Taslak Editörü</button>
                    <button class="btn ${this.activeSpecsTab === 'preview' ? 'btn-primary' : 'btn-secondary'}" id="tabSpecsPreviewBtn" style="padding: 10px 18px;">👁️ Önizleme & PDF</button>
                    <button class="btn ${this.activeSpecsTab === 'upload' ? 'btn-primary' : 'btn-secondary'}" id="tabSpecsUploadBtn" style="padding: 10px 18px;">📂 İmzalı Dosya Yükleme (${specs.signed_files.length})</button>
                </div>

                <!-- Sekme İçerikleri -->
                <div id="specsTabContent">
        `;

        if (this.activeSpecsTab === 'editor') {
            // TAB 1: EDITOR / TASLAK EKRANI
            const templates = window.BrenerApp.state.specTemplates || [];

            html += `
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div class="grid-2col" style="align-items: start;">
                        <!-- Sol Kolon: Üst Bilgiler ve Şablon Yükleme -->
                        <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
                            <div class="card-header" style="margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                                <h3 style="color: var(--primary); font-size: 1.1rem; margin: 0;">🏢 Genel Şartname Bilgileri</h3>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>İlçe / Semt</label>
                                    <input type="text" id="specIlceSemt" value="${specs.metadata.ilce_semt || ''}" placeholder="Örn: KADIKÖY – GÖZTEPE" class="custom-input">
                                </div>
                                <div class="form-group">
                                    <label>Bina Adı / Proje Başlığı</label>
                                    <input type="text" id="specBinaAdi" value="${specs.metadata.bina_adi || ''}" placeholder="Örn: ÇAVLI APARTMANI" class="custom-input">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Ada No</label>
                                    <input type="text" id="specAdaNo" value="${specs.metadata.ada_no || ''}" placeholder="Ada No" class="custom-input">
                                </div>
                                <div class="form-group">
                                    <label>Parsel No</label>
                                    <input type="text" id="specParselNo" value="${specs.metadata.parsel_no || ''}" placeholder="Parsel No" class="custom-input">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Şartname Tarihi</label>
                                    <input type="date" id="specSartnameTarihi" value="${specs.metadata.sartname_tarihi || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Kat Malikleri Sayısı</label>
                                    <input type="number" id="specMalikSayisi" value="${specs.kat_malikleri_sayisi || 0}" class="custom-input">
                                </div>
                            </div>
                        </div>

                        <!-- Sağ Kolon: Şablon Seçimi & Genel Hususlar -->
                        <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
                            <div class="card-header" style="margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                                <h3 style="color: var(--primary); font-size: 1.1rem; margin: 0;">📋 Şablon Yükle & Notlar</h3>
                            </div>
                            
                            <div class="form-group">
                                <label>Genel Şablonlardan Yükle</label>
                                <div style="display: flex; gap: 8px;">
                                    <select id="specTemplateSelector" style="flex: 1;">
                                        <option value="">-- Şablon Seçin --</option>
                                        ${templates.map((t, index) => `<option value="${index}">${t.name}</option>`).join('')}
                                    </select>
                                    <button class="btn btn-secondary" id="loadSpecTemplateBtn" style="padding: 0 14px;">Yükle</button>
                                </div>
                                <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: block;">* Dikkat: Şablon yüklemek mevcut maddeleri ezecektir.</span>
                            </div>

                            <div class="form-group">
                                <label>Notlar ve Genel Hususlar</label>
                                <textarea id="specNotes" placeholder="Genel koşullar, kampanyalar veya özel notlar..." style="height: 60px;">${specs.notes || ''}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Dinamik Şartname Maddeleri Düzenleme -->
                    <div class="card">
                        <div class="card-header" style="margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                            <h3 style="color: var(--primary); font-size: 1.1rem; margin: 0;">📝 Şartname Maddeleri & Sıralaması</h3>
                            <span class="badge badge-info" style="font-size: 0.8rem;">Toplam: ${specs.clauses.length} Madde</span>
                        </div>

                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
                            Maddeleri sürükleyip bırakarak veya sol taraftaki 🔼 🔽 butonlarını kullanarak yeniden sıralayabilirsiniz.
                        </p>

                        <div id="clausesContainer" style="display: flex; flex-direction: column; gap: 10px;">
                            ${specs.clauses.map((c, idx) => `
                                <div class="clause-row" draggable="true" data-index="${idx}" style="display: flex; gap: 12px; align-items: start; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; cursor: move; transition: border-color 0.2s;">
                                    <div style="display: flex; flex-direction: column; gap: 4px; padding-top: 4px;">
                                        <button class="btn btn-secondary btn-sm sort-up-btn" data-index="${idx}" style="padding: 3px 6px; font-size: 0.7rem; border-radius: 4px;">🔼</button>
                                        <button class="btn btn-secondary btn-sm sort-down-btn" data-index="${idx}" style="padding: 3px 6px; font-size: 0.7rem; border-radius: 4px;">🔽</button>
                                    </div>
                                    <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                        <input type="text" class="custom-input clause-title" value="${c.title || ''}" placeholder="Örn: 1. Projeler ve Kaba İnşaat" style="font-weight: 700; font-size: 0.9rem; padding: 6px 12px;">
                                        <textarea class="clause-content" placeholder="Teknik şartlar ve açıklamaları buraya yazın..." style="height: 55px; font-size: 0.82rem; padding: 8px 12px;">${c.content || ''}</textarea>
                                    </div>
                                    <button class="btn btn-danger btn-sm delete-clause-btn" data-index="${idx}" style="padding: 8px 12px; align-self: center; border-radius: 6px;">🗑️</button>
                                </div>
                            `).join('')}
                        </div>

                        <button class="btn btn-secondary btn-sm" id="addNewClauseBtn" style="margin-top: 15px; width: 100%;">
                            ➕ Yeni Teknik Şartname Maddesi Ekle
                        </button>
                    </div>
                </div>
            `;
        } else if (this.activeSpecsTab === 'preview') {
            // TAB 2: PREVIEW / ÖNİZLEME
            const totalClauses = specs.clauses.length;

            html += `
                <div style="display: flex; flex-direction: column; gap: 20px; align-items: center;">
                    <!-- A4 Kağıt Görünümlü Önizleme Alanı -->
                    <div id="specsA4Preview" style="background: #ffffff; color: #1f2937; padding: 50px; width: 100%; max-width: 800px; box-shadow: var(--shadow-md); border-radius: 4px; box-sizing: border-box; text-align: left;">
                        
                        <!-- 1. SAYFA KAPAK ÖNİZLEME -->
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 600px; padding: 40px 20px; border-bottom: 2px dashed #d1d5db; margin-bottom: 40px; text-align: center;">
                            <div style="margin-top: 10px;">
                                <div style="width: 80px; height: 80px; margin: 0 auto 10px;">
                                    <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#000" stroke-width="8"/>
                                        <path d="M 50 15 A 35 35 0 1 0 50 85 A 35 35 0 0 0 85 50 L 50 50 Z" fill="#000"/>
                                        <circle cx="50" cy="50" r="12" fill="#fff"/>
                                    </svg>
                                </div>
                                <div style="font-size: 24px; font-weight: 800; font-family: 'Times New Roman', serif; letter-spacing: 2px; text-transform: uppercase; color: #000; margin-top: 5px;">Brener</div>
                                <div style="font-size: 9px; font-weight: bold; letter-spacing: 3px; color: #333; margin-bottom: 8px;">İNŞAAT TAAHHÜT A.Ş.</div>
                                <div style="font-size: 11px; color: #4b5563;">www.brener.com.tr</div>
                                <div style="font-size: 11px; color: #4b5563;">info@brener.com.tr</div>
                            </div>
                            
                            <div>
                                <h1 style="font-size: 20px; font-weight: 800; color: #000; line-height: 1.4; margin-top: 30px; letter-spacing: 0.5px; text-transform: uppercase;">BRENER İNŞAAT TAAHHÜT AŞ.<br>TEKNİK ŞARTNAME</h1>
                                <h2 style="font-size: 16px; font-weight: 800; color: #000; margin-top: 15px; text-transform: uppercase;">( ${formatFnc(specs.metadata.bina_adi).toUpperCase()} )</h2>
                            </div>
                            
                            <table style="margin: 30px auto; width: 280px; border-collapse: collapse; font-size: 12px; text-align: left;">
                                <tr style="border-bottom: 1px solid #e5e7eb;"><th style="padding: 6px 0; font-weight: bold; color: #000;">İLÇE</th><td style="padding: 6px 0; color: #1f2937;">: ${formatFnc(specs.metadata.ilce_semt).toUpperCase()}</td></tr>
                                <tr style="border-bottom: 1px solid #e5e7eb;"><th style="padding: 6px 0; font-weight: bold; color: #000;">PAFTA</th><td style="padding: 6px 0; color: #1f2937;">: -</td></tr>
                                <tr style="border-bottom: 1px solid #e5e7eb;"><th style="padding: 6px 0; font-weight: bold; color: #000;">ADA</th><td style="padding: 6px 0; color: #1f2937;">: ${formatFnc(specs.metadata.ada_no)}</td></tr>
                                <tr style="border-bottom: 1px solid #e5e7eb;"><th style="padding: 6px 0; font-weight: bold; color: #000;">PARSEL</th><td style="padding: 6px 0; color: #1f2937;">: ${formatFnc(specs.metadata.parsel_no)}</td></tr>
                            </table>
                            
                            <div style="font-size: 16px; font-weight: bold; color: #d32f2f; margin-bottom: 10px;">${specs.metadata.sartname_tarihi ? specs.metadata.sartname_tarihi.split('-').reverse().join('.') : new Date().toLocaleDateString('tr-TR')}</div>
                        </div>

                        <!-- 2. SAYFA VE İÇERİK ÖNİZLEME -->
                        <div class="doc-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000000; padding-bottom: 6px; margin-bottom: 20px;">
                            <div class="doc-header-title" style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #000;">KAT KARŞILIĞI İNŞAAT SÖZLEŞMESİNE AİT TEKNİK ŞARTNAME</div>
                            <div class="doc-header-date" style="font-size: 12px; font-weight: bold; color: #000;">${specs.metadata.sartname_tarihi ? specs.metadata.sartname_tarihi.split('-').reverse().join('.') : new Date().toLocaleDateString('tr-TR')}</div>
                        </div>

                        <p style="font-size: 12px; line-height: 1.6; margin-bottom: 20px; font-weight: 600;">
                            • İş bu Teknik şartname, aynı taraflar arasında yapılan ve bu şartnamenin ekli olduğu Kat Karşılığı İnşaat Sözleşmesi’nin devamı niteliğinde ve ayrılmaz bir parçasıdır.
                        </p>

                        <!-- Dinamik Şartname Maddeleri -->
                        ${specs.clauses.map(c => {
                            let lines = [];
                            if (c.content.includes('•')) {
                                lines = c.content.split('•').map(l => l.trim()).filter(l => l.length > 0);
                            } else if (c.content.includes('*')) {
                                lines = c.content.split('*').map(l => l.trim()).filter(l => l.length > 0);
                            } else {
                                lines = c.content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                            }

                            if (lines.length === 0) {
                                lines = [c.content || '—'];
                            }

                            return `
                                <div style="margin-bottom: 18px;">
                                    <h3 style="font-size: 13px; font-weight: bold; margin: 20px 0 8px 0; text-transform: uppercase; color: #000;">${c.title.replace(':', '').trim()} :</h3>
                                    <ul style="list-style-type: disc; margin: 0 0 15px 0; padding-left: 20px; font-size: 12px; line-height: 1.6; color: #111827;">
                                        ${lines.map(line => `<li style="margin-bottom: 5px;">${line}</li>`).join('')}
                                    </ul>
                                </div>
                            `;
                        }).join('')}

                        <!-- Notlar ve Genel Hususlar -->
                        ${specs.notes ? `
                            <div style="margin-top: 30px;">
                                <h3 style="font-size: 13px; font-weight: bold; margin: 20px 0 8px 0; text-transform: uppercase; color: #000;">NOTLAR :</h3>
                                <p style="font-size: 12px; line-height: 1.6; color: #111827; margin: 0; white-space: pre-line; padding-left: 5px;">
                                    ${specs.notes}
                                </p>
                            </div>
                        ` : ''}

                        <div style="margin-top: 30px;">
                            <h3 style="font-size: 13px; font-weight: bold; margin: 20px 0 8px 0; text-transform: uppercase; color: #000;">GENEL HUSUSLAR</h3>
                            <ul style="list-style-type: disc; margin: 0 0 15px 0; padding-left: 20px; font-size: 12px; line-height: 1.6; color: #111827;">
                                <li style="font-weight: bold;">Bu proje yarısı bizden hibe+kredi kampanyasından faydalanabilecektir.</li>
                                <li>Yenilenecek olan ${formatFnc(specs.metadata.bina_adi)} 7/24 çevre güvenliği, çevre düzeni, girişler, kat holleri, otopark sistemleri olarak residence konseptinde yapılması planlanmaktadır.7/24 teknik servis hizmeti verilecek. Geniş peyzaj alanları yapılacak. Tercihen, çocuk oyun alanları yapılacak.</li>
                                <li>Bina yapım süresi ruhsattan itibaren 16 ayda tamamlanacaktır.</li>
                                <li>Açık otopark geçişinde engelli rampası yerine engelli asansörü kullanılacak.</li>
                                <li>Beş yıl garanti süresi boyunca, tüm daireler elektrik, tesisat ve yedek parça servis hizmeti alacaklardır.</li>
                                <li>Ortak alan aydınlatmalarında takviye pv panel güneş enerji sistemleri kullanılacaktır.</li>
                                <li>Kat malikleri mevcut hakkediş m2 sadık kalmak şartı ile farklı ihtiyaçları doğrultusunda daire tipleri talep edebilecekler. Örneğin geniş 2+1, geniş salon, geniş yatak odaları, açık mutfak gibi tercih yapabileceklerdir.</li>
                                <li>Kat malikleri mutfak dolabı, kapı, portmanto, seramik, duvar boyası gibi dekorasyon uygulamalarında 3 farklı desen ve renk kombinasyonu arasından seçim yapabileceklerdir.</li>
                                <li>Kat malikleri Brener yükümlülüğü ve Şartname dışı uygulamalarda da iç mimarlık tasarım ve uygulama hizmeti alabileceklerdir. Bağımsız alanlarda özel üretim tüm sabit ve gömme dolapları, ek dolapları uygun şartlarda mobilyalı teslim alabilme imkanları olacaktır.</li>
                                <li>Brener teslim sonrası kat maliklerinin onayı ile binayı 3-5 yıl düzenli kullanıma geçiş süresince teknik destek ve işletme olarak düşük maliyet ve yüksek konfor hedefiyle 7/24 Bina Yönetim Hizmeti verecektir. Tüm sistem ve yapı düzenli yürür hale getirilip süre sonunda sonraki bina yönetim grubuna teslim edilecektir.</li>
                            </ul>
                        </div>

                        <!-- İmza Bölümleri -->
                        <div class="sign-section" style="margin-top: 50px;">
                            <table class="sign-table" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="width: 45%; vertical-align: top; text-align: left;">
                                        <div style="font-weight: 800; font-size: 11px; text-transform: uppercase; color: #000;">${specs.metadata.bina_adi ? specs.metadata.bina_adi.replace('Projesi','').trim() : 'ÇAVLI APT'} KAT MALİKLERİ</div>
                                        <div style="font-size: 11px; margin-top: 10px; color: #374151;">1-${specs.kat_malikleri_sayisi || 38} KAT MALİKİ</div>
                                        <div style="color: #9ca3af; font-size: 9px; margin-top: 30px;">(İmza / Tarih)</div>
                                    </td>
                                    <td style="width: 10%;"></td>
                                    <td style="width: 45%; vertical-align: top; text-align: right;">
                                        <div style="font-weight: 800; font-size: 11px; text-transform: uppercase; color: #000;">YÜKLENİCİ</div>
                                        <div style="font-size: 11px; margin-top: 10px; font-weight: 800; color: #000;">BRENER İNŞAAT TAAHHÜT A.Ş.</div>
                                        <div style="color: #9ca3af; font-size: 9px; margin-top: 30px;">(Kaşe / Yetkili İmza)</div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // TAB 3: SIGNED FILE UPLOAD & ARCHIVE
            html += `
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div class="grid-2col" style="align-items: start;">
                        <!-- Sol Kolon: Durum Yönetimi & Dosya Yükleme -->
                        <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
                            <div class="card-header" style="margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                                <h3 style="color: var(--primary); font-size: 1.1rem; margin: 0;">🤝 Sözleşme & İmza Durumu</h3>
                            </div>
                            
                            <div class="form-group">
                                <label>Şartname Durumu</label>
                                <select id="specStatusSelect">
                                    <option value="Taslak" ${specs.sartname_durumu === 'Taslak' ? 'selected' : ''}>Taslak (İnceleme Aşamasında)</option>
                                    <option value="Onay Bekliyor" ${specs.sartname_durumu === 'Onay Bekliyor' ? 'selected' : ''}>Onay Bekliyor (Kurul Onayı)</option>
                                    <option value="İmzalandı" ${specs.sartname_durumu === 'İmzalandı' ? 'selected' : ''}>İmzalandı (Noter Onaylı / Islak İmzalı)</option>
                                </select>
                            </div>

                            <!-- Dosya Yükleme Zone (Drag and Drop) -->
                            <div class="form-group">
                                <label>Islak İmzalı Şartname Belgesi Yükle</label>
                                <div id="specUploadZone" style="border: 2px dashed rgba(204,163,82,0.4); background: rgba(0,0,0,0.15); padding: 30px 20px; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s;">
                                    <div style="font-size: 2.2rem; margin-bottom: 10px;">📂</div>
                                    <p style="font-size: 0.85rem; color: var(--text-main); font-weight: 600;">Dosyayı sürükleyip buraya bırakın</p>
                                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">veya dosya seçmek için <span style="color: var(--primary); text-decoration: underline;">tıklayın</span></p>
                                    <input type="file" id="signedFileInput" style="display: none;" accept=".pdf,.png,.jpg,.jpeg">
                                </div>
                            </div>

                            <!-- Progress Bar (Yükleme İlerlemesi) -->
                            <div id="uploadProgressWrapper" style="display: none; background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; flex-direction: column; gap: 8px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
                                    <span id="uploadFileName" style="color: var(--text-main); font-weight: 600;">belge.pdf</span>
                                    <span id="uploadProgressPercent" style="color: var(--primary); font-weight: 700;">%0</span>
                                </div>
                                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                                    <div id="uploadProgressBarFill" style="width: 0%; height: 100%; background: var(--primary); transition: width 0.1s ease;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Sağ Kolon: İmzalı Belgeler Arşivi -->
                        <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
                            <div class="card-header" style="margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="color: var(--primary); font-size: 1.1rem; margin: 0;">📁 İmzalı Belgeler Arşivi</h3>
                                <span class="badge badge-success" style="font-size: 0.75rem;">${specs.signed_files.length} Dosya</span>
                            </div>

                            ${specs.signed_files.length === 0 ? `
                                <div style="text-align: center; color: var(--text-muted); padding: 30px; font-size: 0.82rem;">
                                    Henüz ıslak imzalı bir şartname belgesi yüklenmedi.
                                </div>
                            ` : `
                                <div class="table-responsive">
                                    <table style="width: 100%;">
                                        <thead>
                                            <tr>
                                                <th>Dosya Adı</th>
                                                <th>Boyut</th>
                                                <th>Yükleme Tarihi</th>
                                                <th style="text-align: right;">Aksiyon</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${specs.signed_files.map((file, fileIdx) => `
                                                <tr>
                                                    <td><strong>${file.name}</strong></td>
                                                    <td><code>${file.size}</code></td>
                                                    <td>${file.date}</td>
                                                    <td style="text-align: right;">
                                                        <div style="display: inline-flex; gap: 6px;">
                                                            <button class="btn btn-primary btn-sm view-file-btn" onclick="window.BrenerApp.showToast('info','Dosya indiriliyor: ${file.name}')">📥 İndir</button>
                                                            <button class="btn btn-danger btn-sm delete-file-btn" data-index="${fileIdx}">🗑️ Sil</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Wire Up Tab Buttons
        document.getElementById('tabSpecsEditorBtn').onclick = () => { this.activeSpecsTab = 'editor'; this.renderSpecs(container); };
        document.getElementById('tabSpecsPreviewBtn').onclick = () => { this.activeSpecsTab = 'preview'; this.renderSpecs(container); };
        document.getElementById('tabSpecsUploadBtn').onclick = () => { this.activeSpecsTab = 'upload'; this.renderSpecs(container); };

        if (this.activeSpecsTab === 'editor') {
            // EDITOR EVENT HANDLERS
            const saveBtn = document.getElementById('saveSpecsBtn');
            const addNewBtn = document.getElementById('addNewClauseBtn');
            const loadTemplateBtn = document.getElementById('loadSpecTemplateBtn');
            const saveTemplateBtn = document.getElementById('saveSpecTemplateBtn');

            // Save Specifications Action
            saveBtn.onclick = () => {
                const updatedClauses = this.collectClauses();
                specs.metadata = {
                    ilce_semt: document.getElementById('specIlceSemt').value.trim(),
                    bina_adi: document.getElementById('specBinaAdi').value.trim(),
                    ada_no: document.getElementById('specAdaNo').value.trim(),
                    parsel_no: document.getElementById('specParselNo').value.trim(),
                    sartname_tarihi: document.getElementById('specSartnameTarihi').value
                };
                specs.kat_malikleri_sayisi = parseInt(document.getElementById('specMalikSayisi').value) || 0;
                specs.notes = document.getElementById('specNotes').value.trim();
                specs.clauses = updatedClauses;

                window.BrenerApp.state.projectSpecs[activeProj.id] = specs;
                window.BrenerApp.saveStateToStorage();

                window.BrenerApp.logActivity(
                    'proje', 
                    `Teknik şartname taslağı güncellendi: ${activeProj.name}`, 
                    'success', 
                    `Bina: ${specs.metadata.bina_adi}, Toplam Madde: ${updatedClauses.length}`
                );

                window.BrenerApp.showToast('success', 'Teknik şartname taslağı başarıyla kaydedildi.');
                this.renderSpecs(container);
            };

            // Save as General Template Action
            saveTemplateBtn.onclick = () => {
                const templateName = prompt("Lütfen şablon için bir isim girin:", "Standart Şartname Şablonu");
                if (templateName && templateName.trim()) {
                    const clauses = this.collectClauses();
                    if (!window.BrenerApp.state.specTemplates) {
                        window.BrenerApp.state.specTemplates = [];
                    }
                    window.BrenerApp.state.specTemplates.push({
                        name: templateName.trim(),
                        clauses: clauses
                    });
                    window.BrenerApp.saveStateToStorage();
                    window.BrenerApp.showToast('success', `"${templateName}" genel şablon olarak kaydedildi.`);
                    this.renderSpecs(container);
                }
            };

            // Load General Template Action
            loadTemplateBtn.onclick = () => {
                const index = document.getElementById('specTemplateSelector').value;
                if (index !== "") {
                    const selectedTemplate = window.BrenerApp.state.specTemplates[index];
                    if (selectedTemplate && confirm(`"${selectedTemplate.name}" şablonunu yüklemek istediğinize emin misiniz? Bu işlem mevcut maddelerinizi sıfırlayacaktır.`)) {
                        specs.clauses = JSON.parse(JSON.stringify(selectedTemplate.clauses)); // deep clone
                        this.renderSpecs(container);
                        window.BrenerApp.showToast('info', 'Şablon başarıyla yüklendi.');
                    }
                } else {
                    alert('Lütfen yüklenecek bir şablon seçin!');
                }
            };

            // Add New Clause Action
            addNewBtn.onclick = () => {
                const clauses = this.collectClauses();
                const newNum = clauses.length + 1;
                clauses.push({
                    id: 'c_' + Date.now(),
                    title: `${newNum}. Yeni Yapı Maddesi`,
                    content: ""
                });
                specs.clauses = clauses;
                this.renderSpecs(container);
            };

            // Wire Delete Clause Buttons
            container.querySelectorAll('.delete-clause-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    const clauses = this.collectClauses();
                    clauses.splice(idx, 1);
                    // Re-number titles if they follow standard formatting
                    clauses.forEach((c, index) => {
                        const dotIndex = c.title.indexOf('.');
                        if (dotIndex !== -1 && !isNaN(c.title.substring(0, dotIndex))) {
                            c.title = `${index + 1}${c.title.substring(dotIndex)}`;
                        }
                    });
                    specs.clauses = clauses;
                    this.renderSpecs(container);
                };
            });

            // Re-order sorting buttons action
            container.querySelectorAll('.sort-up-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                    if (idx > 0) {
                        const clauses = this.collectClauses();
                        const temp = clauses[idx];
                        clauses[idx] = clauses[idx - 1];
                        clauses[idx - 1] = temp;
                        // Swap titles numbers as well
                        this.swapTitleNumbers(clauses[idx], clauses[idx - 1]);
                        specs.clauses = clauses;
                        this.renderSpecs(container);
                    }
                };
            });

            container.querySelectorAll('.sort-down-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                    const clauses = this.collectClauses();
                    if (idx < clauses.length - 1) {
                        const temp = clauses[idx];
                        clauses[idx] = clauses[idx + 1];
                        clauses[idx + 1] = temp;
                        // Swap titles numbers
                        this.swapTitleNumbers(clauses[idx], clauses[idx + 1]);
                        specs.clauses = clauses;
                        this.renderSpecs(container);
                    }
                };
            });

            // HTML5 Drag and Drop Handlers
            const rows = container.querySelectorAll('.clause-row');
            let draggedIdx = null;

            rows.forEach(row => {
                row.ondragstart = (e) => {
                    draggedIdx = parseInt(row.getAttribute('data-index'));
                    row.style.opacity = '0.5';
                    row.style.borderColor = 'var(--primary)';
                };
                row.ondragend = () => {
                    row.style.opacity = '1';
                    row.style.borderColor = 'var(--border-color)';
                };
                row.ondragover = (e) => {
                    e.preventDefault();
                };
                row.ondrop = (e) => {
                    e.preventDefault();
                    const targetIdx = parseInt(row.getAttribute('data-index'));
                    if (draggedIdx !== null && draggedIdx !== targetIdx) {
                        const clauses = this.collectClauses();
                        const draggedItem = clauses[draggedIdx];
                        clauses.splice(draggedIdx, 1);
                        clauses.splice(targetIdx, 0, draggedItem);
                        
                        // Re-number order titles
                        clauses.forEach((c, index) => {
                            const dotIndex = c.title.indexOf('.');
                            if (dotIndex !== -1 && !isNaN(c.title.substring(0, dotIndex))) {
                                c.title = `${index + 1}${c.title.substring(dotIndex)}`;
                            }
                        });

                        specs.clauses = clauses;
                        this.renderSpecs(container);
                    }
                };
            });
        }

        if (this.activeSpecsTab === 'preview') {
            // PREVIEW EVENT HANDLERS
            document.getElementById('printSpecsBtn').onclick = () => {
                this.exportSpecsPDF(specs, activeProj);
            };
        }

        if (this.activeSpecsTab === 'upload') {
            // UPLOAD EVENT HANDLERS
            const dropzone = document.getElementById('specUploadZone');
            const fileInput = document.getElementById('signedFileInput');
            const statusSelect = document.getElementById('specStatusSelect');

            // Status Change Event
            statusSelect.onchange = () => {
                specs.sartname_durumu = statusSelect.value;
                window.BrenerApp.saveStateToStorage();
                window.BrenerApp.logActivity('proje', `${activeProj.name} teknik şartname durumu güncellendi: ${specs.sartname_durumu}`, 'info');
                window.BrenerApp.showToast('info', `Şartname durumu "${specs.sartname_durumu}" olarak güncellendi.`);
            };

            // Trigger browse click
            dropzone.onclick = () => {
                fileInput.click();
            };

            // Upload drop actions
            dropzone.ondragover = (e) => {
                e.preventDefault();
                dropzone.style.background = 'rgba(204,163,82,0.1)';
                dropzone.style.borderColor = 'var(--primary)';
            };
            dropzone.ondragleave = () => {
                dropzone.style.background = 'rgba(0,0,0,0.15)';
                dropzone.style.borderColor = 'rgba(204,163,82,0.4)';
            };
            dropzone.ondrop = (e) => {
                e.preventDefault();
                dropzone.style.background = 'rgba(0,0,0,0.15)';
                dropzone.style.borderColor = 'rgba(204,163,82,0.4)';
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.simulateFileUpload(files[0], specs, activeProj, container);
                }
            };

            fileInput.onchange = () => {
                if (fileInput.files.length > 0) {
                    this.simulateFileUpload(fileInput.files[0], specs, activeProj, container);
                }
            };

            // Delete Signed File Action
            container.querySelectorAll('.delete-file-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    const deletedFile = specs.signed_files[idx];
                    if (confirm(`"${deletedFile.name}" belgesini arşivden silmek istediğinize emin misiniz?`)) {
                        specs.signed_files.splice(idx, 1);
                        if (specs.signed_files.length === 0) {
                            specs.signed_file_url = "";
                            specs.sartname_durumu = "Taslak";
                        }
                        window.BrenerApp.saveStateToStorage();
                        window.BrenerApp.logActivity('proje', `İmzalı şartname belgesi silindi: ${deletedFile.name}`, 'warning');
                        window.BrenerApp.showToast('danger', 'Dosya arşivden silindi.');
                        this.renderSpecs(container);
                    }
                };
            });
        }
    },

    // Collect clauses from input and textarea DOM values
    collectClauses() {
        const list = [];
        const rows = document.querySelectorAll('.clause-row');
        rows.forEach(row => {
            const id = row.querySelector('.delete-clause-btn').getAttribute('data-index');
            const title = row.querySelector('.clause-title').value.trim();
            const content = row.querySelector('.clause-content').value.trim();
            list.push({ id: 'c_' + id + '_' + Date.now(), title, content });
        });
        return list;
    },

    // Utility helper to swap prefix numbers on manual sorting
    swapTitleNumbers(c1, c2) {
        const dot1 = c1.title.indexOf('.');
        const dot2 = c2.title.indexOf('.');
        if (dot1 !== -1 && dot2 !== -1) {
            const prefix1 = c1.title.substring(0, dot1);
            const prefix2 = c2.title.substring(0, dot2);
            if (!isNaN(prefix1) && !isNaN(prefix2)) {
                c1.title = prefix2 + c1.title.substring(dot1);
                c2.title = prefix1 + c2.title.substring(dot2);
            }
        }
    },

    // Simulates upload with animation & progress bar
    simulateFileUpload(file, specs, project, container) {
        const progressWrapper = document.getElementById('uploadProgressWrapper');
        const fileNameEl = document.getElementById('uploadFileName');
        const progressPercentEl = document.getElementById('uploadProgressPercent');
        const progressBarFill = document.getElementById('uploadProgressBarFill');

        fileNameEl.textContent = file.name;
        progressWrapper.style.display = 'flex';
        progressBarFill.style.width = '0%';
        progressPercentEl.textContent = '%0';

        let percent = 0;
        const interval = setInterval(() => {
            percent += Math.floor(Math.random() * 15) + 5;
            if (percent >= 100) {
                percent = 100;
                clearInterval(interval);
                
                // Add file to specs data
                const newFile = {
                    name: file.name,
                    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                    date: new Date().toLocaleDateString('tr-TR'),
                    url: 'https://storage.brener.com.tr/docs/' + encodeURIComponent(file.name)
                };

                specs.signed_files.push(newFile);
                specs.signed_file_url = newFile.url;
                specs.sartname_durumu = "İmzalandı"; // auto upgrade state to signed

                window.BrenerApp.saveStateToStorage();

                // Log Activity
                window.BrenerApp.logActivity(
                    'proje', 
                    `Teknik şartname ıslak imzalı dosya arşive yüklendi: ${file.name}`, 
                    'success', 
                    `Proje: ${project.name}, Dosya Boyutu: ${newFile.size}`
                );

                window.BrenerApp.showToast('success', 'Dosya başarıyla yüklendi ve arşivlendi.');
                setTimeout(() => {
                    this.renderSpecs(container);
                }, 400);
            }
            progressBarFill.style.width = percent + '%';
            progressPercentEl.textContent = '%' + percent;
        }, 100);
    },

    /* ====================================================================
       5. PDF / YAZDIRMA ÇIKTISI TASARIMI (A4 ANTETLİ KAĞIT DÜZENİ)
       ==================================================================== */
    exportSpecsPDF(specs, project) {
        const printWindow = window.open('', '_blank', 'width=900,height=800');
        if (!printWindow) {
            alert('Lütfen tarayıcınızın pop-up engelleyicisini kaldırın.');
            return;
        }

        const formatFnc = val => val ? val : '—';
        const totalClauses = specs.clauses.length;

        printWindow.document.write(`
            <html>
            <head>
                <title>${project.name} - Teknik Şartname</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                    body {
                        font-family: 'Inter', -apple-system, sans-serif;
                        color: #1f2937;
                        background: #ffffff;
                        line-height: 1.5;
                        margin: 0;
                        padding: 0;
                        font-size: 13px;
                    }
                    .page-break {
                        page-break-after: always;
                        break-after: page;
                    }
                    /* --- Cover Page Style --- */
                    .cover-page {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-between;
                        height: 100vh;
                        box-sizing: border-box;
                        padding: 60px 40px;
                        text-align: center;
                    }
                    .cover-logo-container {
                        margin-top: 10px;
                    }
                    .cover-logo-circle {
                        width: 90px;
                        height: 90px;
                        margin: 0 auto 10px;
                    }
                    .cover-logo-svg {
                        width: 100%;
                        height: 100%;
                    }
                    .cover-logo-title {
                        font-size: 26px;
                        font-weight: 800;
                        font-family: 'Times New Roman', serif;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        color: #000000;
                        margin-top: 5px;
                    }
                    .cover-logo-sub {
                        font-size: 10px;
                        font-weight: bold;
                        letter-spacing: 3px;
                        color: #333;
                        margin-bottom: 12px;
                    }
                    .cover-logo-web, .cover-logo-email {
                        font-size: 12px;
                        color: #4b5563;
                        line-height: 1.4;
                    }
                    .cover-title {
                        font-size: 22px;
                        font-weight: 800;
                        color: #000;
                        line-height: 1.4;
                        margin-top: 40px;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                    }
                    .cover-subtitle {
                        font-size: 18px;
                        font-weight: 800;
                        color: #000;
                        margin-top: 20px;
                        text-transform: uppercase;
                    }
                    .cover-fields-table {
                        margin: 40px auto;
                        width: 320px;
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    .cover-fields-table th {
                        text-align: left;
                        width: 90px;
                        padding: 8px 0;
                        font-weight: 800;
                        color: #000;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .cover-fields-table td {
                        text-align: left;
                        padding: 8px 0;
                        color: #1f2937;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .cover-date {
                        font-size: 18px;
                        font-weight: bold;
                        color: #d32f2f;
                        margin-bottom: 20px;
                    }
                    
                    /* --- Document Pages Style --- */
                    .doc-container {
                        padding: 40px;
                    }
                    .doc-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 1px solid #000000;
                        padding-bottom: 6px;
                        margin-bottom: 20px;
                    }
                    .doc-header-date {
                        font-size: 12px;
                        font-weight: bold;
                        color: #000;
                    }
                    .doc-header-title {
                        font-size: 12px;
                        font-weight: bold;
                        text-transform: uppercase;
                        color: #000;
                    }
                    .clause-header {
                        font-size: 13px;
                        font-weight: bold;
                        margin: 20px 0 8px 0;
                        text-transform: uppercase;
                        color: #000000;
                    }
                    .bullets-list {
                        list-style-type: disc;
                        margin: 0 0 15px 0;
                        padding-left: 20px;
                        font-size: 12px;
                        line-height: 1.6;
                        color: #111827;
                    }
                    .bullets-list li {
                        margin-bottom: 5px;
                    }
                    .sign-section {
                        margin-top: 60px;
                        page-break-inside: avoid;
                    }
                    .sign-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .footer-note {
                        margin-top: 40px;
                        font-size: 10px;
                        color: #9ca3af;
                        text-align: center;
                        border-top: 1px solid #f3f4f6;
                        padding-top: 10px;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .doc-container {
                            padding: 20px 0;
                        }
                    }
                </style>
            </head>
            <body>
                <!-- 1. SAYFA: KAPAK SAYFASI -->
                <div class="cover-page">
                    <div class="cover-logo-container">
                        <div class="cover-logo-circle">
                            <svg viewBox="0 0 100 100" class="cover-logo-svg">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#000" stroke-width="8"/>
                                <path d="M 50 15 A 35 35 0 1 0 50 85 A 35 35 0 0 0 85 50 L 50 50 Z" fill="#000"/>
                                <circle cx="50" cy="50" r="12" fill="#fff"/>
                            </svg>
                        </div>
                        <div class="cover-logo-title">Brener</div>
                        <div class="cover-logo-sub">İNŞAAT TAAHHÜT A.Ş.</div>
                        <div class="cover-logo-web">www.brener.com.tr</div>
                        <div class="cover-logo-email">info@brener.com.tr</div>
                    </div>
                    
                    <div>
                        <h1 class="cover-title">BRENER İNŞAAT TAAHHÜT AŞ.<br>TEKNİK ŞARTNAME</h1>
                        <h2 class="cover-subtitle">( ${formatFnc(specs.metadata.bina_adi).toUpperCase()} )</h2>
                    </div>
                    
                    <table class="cover-fields-table">
                        <tr><th>İLÇE</th><td>: ${formatFnc(specs.metadata.ilce_semt).toUpperCase()}</td></tr>
                        <tr><th>PAFTA</th><td>: -</td></tr>
                        <tr><th>ADA</th><td>: ${formatFnc(specs.metadata.ada_no)}</td></tr>
                        <tr><th>PARSEL</th><td>: ${formatFnc(specs.metadata.parsel_no)}</td></tr>
                    </table>
                    
                    <div class="cover-date">${specs.metadata.sartname_tarihi ? specs.metadata.sartname_tarihi.split('-').reverse().join('.') : new Date().toLocaleDateString('tr-TR')}</div>
                </div>
                <div class="page-break"></div>

                <!-- 2. SAYFA VE SONRASI: DÖKÜMAN İÇERİĞİ -->
                <div class="doc-container">
                    <div class="doc-header">
                        <div class="doc-header-title">KAT KARŞILIĞI İNŞAAT SÖZLEŞMESİNE AİT TEKNİK ŞARTNAME</div>
                        <div class="doc-header-date">${specs.metadata.sartname_tarihi ? specs.metadata.sartname_tarihi.split('-').reverse().join('.') : new Date().toLocaleDateString('tr-TR')}</div>
                    </div>

                    <p style="font-size: 12px; line-height: 1.6; margin-bottom: 20px; font-weight: 600;">
                        • İş bu Teknik şartname, aynı taraflar arasında yapılan ve bu şartnamenin ekli olduğu Kat Karşılığı İnşaat Sözleşmesi’nin devamı niteliğinde ve ayrılmaz bir parçasıdır.
                    </p>

                    <!-- Dinamik Şartname Maddeleri -->
                    ${specs.clauses.map(c => {
                        let lines = [];
                        if (c.content.includes('•')) {
                            lines = c.content.split('•').map(l => l.trim()).filter(l => l.length > 0);
                        } else if (c.content.includes('*')) {
                            lines = c.content.split('*').map(l => l.trim()).filter(l => l.length > 0);
                        } else {
                            lines = c.content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                        }

                        if (lines.length === 0) {
                            lines = [c.content || '—'];
                        }

                        return `
                            <div style="margin-bottom: 18px; page-break-inside: avoid;">
                                <h3 class="clause-header">${c.title.replace(':', '').trim()} :</h3>
                                <ul class="bullets-list">
                                    ${lines.map(line => `<li>${line}</li>`).join('')}
                                </ul>
                            </div>
                        `;
                    }).join('')}

                    <!-- Notlar ve Genel Hususlar -->
                    ${specs.notes ? `
                        <div style="margin-top: 30px; page-break-inside: avoid;">
                            <h3 class="clause-header">NOTLAR :</h3>
                            <p style="font-size: 12px; line-height: 1.6; color: #111827; margin: 0; white-space: pre-line; padding-left: 5px;">
                                ${specs.notes}
                            </p>
                        </div>
                    ` : ''}

                    <div style="margin-top: 30px; page-break-inside: avoid;">
                        <h3 class="clause-header">GENEL HUSUSLAR</h3>
                        <ul class="bullets-list">
                            <li style="font-weight: bold;">Bu proje yarısı bizden hibe+kredi kampanyasından faydalanabilecektir.</li>
                            <li>Yenilenecek olan ${formatFnc(specs.metadata.bina_adi)} 7/24 çevre güvenliği, çevre düzeni, girişler, kat holleri, otopark sistemleri olarak residence konseptinde yapılması planlanmaktadır.7/24 teknik servis hizmeti verilecek. Geniş peyzaj alanları yapılacak. Tercihen, çocuk oyun alanları yapılacak.</li>
                            <li>Bina yapım süresi ruhsattan itibaren 16 ayda tamamlanacaktır.</li>
                            <li>Açık otopark geçişinde engelli rampası yerine engelli asansörü kullanılacak.</li>
                            <li>Beş yıl garanti süresi boyunca, tüm daireler elektrik, tesisat ve yedek parça servis hizmeti alacaklardır.</li>
                            <li>Ortak alan aydınlatmalarında takviye pv panel güneş enerji sistemleri kullanılacaktır.</li>
                            <li>Kat malikleri mevcut hakkediş m2 sadık kalmak şartı ile farklı ihtiyaçları doğrultusunda daire tipleri talep edebilecekler. Örneğin geniş 2+1, geniş salon, geniş yatak odaları, açık mutfak gibi tercih yapabileceklerdir.</li>
                            <li>Kat malikleri mutfak dolabı, kapı, portmanto, seramik, duvar boyası gibi dekorasyon uygulamalarında 3 farklı desen ve renk kombinasyonu arasından seçim yapabileceklerdir.</li>
                            <li>Kat malikleri Brener yükümlülüğü ve Şartname dışı uygulamalarda da iç mimarlık tasarım ve uygulama hizmeti alabileceklerdir. Bağımsız alanlarda özel üretim tüm sabit ve gömme dolapları, ek dolapları uygun şartlarda mobilyalı teslim alabilme imkanları olacaktır.</li>
                            <li>Brener teslim sonrası kat maliklerinin onayı ile binayı 3-5 yıl düzenli kullanıma geçiş süresince teknik destek ve işletme olarak düşük maliyet ve yüksek konfor hedefiyle 7/24 Bina Yönetim Hizmeti verecektir. Tüm sistem ve yapı düzenli yürür hale getirilip süre sonunda sonraki bina yönetim grubuna teslim edilecektir.</li>
                        </ul>
                    </div>

                    <!-- İmza Bölümleri -->
                    <div class="sign-section">
                        <table class="sign-table">
                            <tr>
                                <td style="width: 45%; vertical-align: top; text-align: left;">
                                    <div style="font-weight: 800; font-size: 11px; text-transform: uppercase; color: #000;">${specs.metadata.bina_adi ? specs.metadata.bina_adi.replace('Projesi','').trim() : 'ÇAVLI APT'} KAT MALİKLERİ</div>
                                    <div style="font-size: 11px; margin-top: 10px; color: #374151;">1-${specs.kat_malikleri_sayisi || 38} KAT MALİKİ</div>
                                    <div style="color: #9ca3af; font-size: 9px; margin-top: 30px;">(İmza / Tarih)</div>
                                </td>
                                <td style="width: 10%;"></td>
                                <td style="width: 45%; vertical-align: top; text-align: right;">
                                    <div style="font-weight: 800; font-size: 11px; text-transform: uppercase; color: #000;">YÜKLENİCİ</div>
                                    <div style="font-size: 11px; margin-top: 10px; font-weight: 800; color: #000;">BRENER İNŞAAT TAAHHÜT A.Ş.</div>
                                    <div style="color: #9ca3af; font-size: 9px; margin-top: 30px;">(Kaşe / Yetkili İmza)</div>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div class="footer-note">
                        Brener Group İnşaat Yönetim Platformu tarafından otomatik olarak üretilmiştir.
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
};
