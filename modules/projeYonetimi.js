/* ==========================================================================
   BRENER GROUP - PROJECT MANAGEMENT & CONTRACT SUMMARIES (PROJE YÖNETİMİ)
   ========================================================================== */

window.BrenerApp.ProjeYonetimi = {
    // Component view state
    mode: 'list', // 'list' or 'form'
    editingContractId: null,
    temsilHeyetiTags: [],
    presentationFilter: 'all',
    presentationSearch: '',

    render(view, container) {
        if (view === 'proje-sozlesme-ozeti') {
            this.renderMain(container);
        } else if (view === 'teknik-sartname') {
            this.renderSpecs(container);
        } else if (view === 'musteri-sunumlari') {
            this.renderPresentations(container);
        } else if (view === 'proje-asamalari') {
            this.renderPhases(container);
        } else if (view === 'musteri-takip') {
            this.renderCrm(container);
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
                <\/script>
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
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    renderPresentations(container) {
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

        window.BrenerApp.updateTopbarTitle('Müşteri Sunumları & Galeri', `${activeProj.name} — Görsel, Video ve PDF Sunum Dokümanları`);

        // Initialize state arrays
        if (!window.BrenerApp.state.customerPresentations) {
            window.BrenerApp.state.customerPresentations = {};
        }
        if (!window.BrenerApp.state.customerPresentations[activeProj.id]) {
            window.BrenerApp.state.customerPresentations[activeProj.id] = [];
        }

        const presentations = window.BrenerApp.state.customerPresentations[activeProj.id];

        let html = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <!-- Üst Aksiyon & İstatistik Kartı -->
                <div class="card" style="background: linear-gradient(135deg, rgba(204,163,82,0.1), rgba(21,29,45,0.5)); border-color: rgba(204,163,82,0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                        <div>
                            <span class="badge badge-primary" style="margin-bottom: 5px;">Müşteri Sunumu Gösterimi</span>
                            <h2 style="margin: 0; font-size: 1.4rem; color: var(--text-main);">🖥️ Sunum ve Galeri Paneli</h2>
                            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">Müşterilerinize ve arsa sahiplerine yapılacak sunumlar için dosyaları yönetin.</p>
                        </div>
                        <div>
                            <button class="btn btn-primary" id="btnLaunchSlideshow" style="padding: 12px 24px; font-weight: 700; box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.25);">
                                🖥️ Sunum Modunu Başlat
                            </button>
                        </div>
                    </div>
                </div>

                <div class="grid-3col" style="grid-template-columns: 2fr 1fr; align-items: start; gap: 20px;">
                    <!-- SOL: GALERİ VE DOSYALAR -->
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="card">
                            <!-- Filtre ve Arama Araç Çubuğu -->
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
                                <div style="display: flex; gap: 8px;" class="presentation-tabs">
                                    <button class="btn ${this.presentationFilter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm pres-tab-btn" data-type="all">Tümü</button>
                                    <button class="btn ${this.presentationFilter === 'image' ? 'btn-primary' : 'btn-secondary'} btn-sm pres-tab-btn" data-type="image">🖼️ Görseller</button>
                                    <button class="btn ${this.presentationFilter === 'video' ? 'btn-primary' : 'btn-secondary'} btn-sm pres-tab-btn" data-type="video">🎥 Videolar</button>
                                    <button class="btn ${this.presentationFilter === 'pdf' ? 'btn-primary' : 'btn-secondary'} btn-sm pres-tab-btn" data-type="pdf">📄 PDF Belgeleri</button>
                                </div>
                                <div style="position: relative; width: 220px;">
                                    <input type="text" id="presSearchInput" value="${this.presentationSearch}" placeholder="Galeri içinde ara..." style="width: 100%; padding: 8px 12px; font-size: 0.85rem;">
                                </div>
                            </div>

                            <!-- Dosyalar Grid Listesi -->
                            <div class="grid-2col" id="presItemsGrid" style="gap: 15px;">
                                <!-- Dinamik yüklenecek -->
                            </div>
                        </div>
                    </div>

                    <!-- SAĞ: YENİ DOSYA YÜKLEME FORMU -->
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="card" style="position: sticky; top: 20px;">
                            <div class="card-header" style="margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                                <h3 style="color: var(--primary); font-size: 1.1rem; display: flex; align-items: center; gap: 8px; margin: 0;">
                                    📤 Yeni Sunum Dosyası Ekle
                                </h3>
                            </div>

                            <div class="form-group">
                                <label>Dosya / Sunum Başlığı</label>
                                <input type="text" id="newPresTitle" placeholder="Örn: Kat Planı Render..." class="custom-input">
                            </div>

                            <div class="form-group">
                                <label>Dosya Türü</label>
                                <select id="newPresType" class="custom-input">
                                    <option value="image">Görsel (JPG, PNG, WebP)</option>
                                    <option value="video">Video (MP4, WebM)</option>
                                    <option value="pdf">PDF Belgesi</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Dosya Adresi (URL / Embed)</label>
                                <input type="text" id="newPresUrl" placeholder="https://domain.com/dosya.jpg veya mock" class="custom-input">
                                <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; display: block;">
                                    * Harici dosya URL'i girin ya da test için bilgisayarınızdan dosya seçin.
                                </span>
                            </div>

                            <!-- Yerel dosya yükleme simulatoru -->
                            <div class="form-group" style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 15px; text-align: center; cursor: pointer; transition: all 0.2s;" id="presDropzone">
                                <div style="font-size: 1.5rem; margin-bottom: 6px;">📂</div>
                                <div style="font-size: 0.8rem; font-weight: 600;">Yerel Dosya Seç (Simüle Et)</div>
                                <input type="file" id="presFileInput" style="display: none;" accept="image/*,video/*,application/pdf">
                                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;" id="presFileName">Maksimum 50MB</div>
                            </div>

                            <!-- Yükleme İlerleme Çubuğu -->
                            <div id="presUploadProgressWrapper" style="display: none; margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                                    <span>Yükleniyor...</span>
                                    <span id="presProgressPercent">0%</span>
                                </div>
                                <div class="progress-bar-bg" style="height: 6px;">
                                    <div class="progress-bar-fill" id="presProgressBarFill" style="width: 0%; height: 100%;"></div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Dosya Açıklaması</label>
                                <textarea id="newPresDesc" placeholder="Müşteriye sunulacak detaylı açıklama..." style="height: 60px;"></textarea>
                            </div>

                            <button class="btn btn-primary" id="btnSaveNewPres" style="width: 100%; margin-top: 10px;">
                                💾 Dosyayı Galeriye Ekle
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CUSTOM FULLSCREEN PRESENTATION OVERLAY -->
            <div id="presFullscreenOverlay" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10, 15, 26, 0.98); z-index: 9999; flex-direction: column; justify-content: center; align-items: center; color: #ffffff; font-family: var(--font-family);">
                <!-- Overlay Header -->
                <div style="position: absolute; top: 0; left: 0; width: 100%; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0)); box-sizing: border-box; z-index: 10;">
                    <div>
                        <h2 id="presSlideTitle" style="margin: 0; font-size: 1.5rem; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Slide Title</h2>
                        <p id="presSlideDesc" style="margin: 4px 0 0 0; font-size: 0.85rem; color: #a0aec0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Slide Description</p>
                    </div>
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <span id="presSlideIndex" style="font-size: 1rem; font-weight: bold; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px;">1 / 5</span>
                        <button id="btnCloseFullscreenPres" style="background: rgba(255,0,0,0.2); border: 1px solid rgba(255,0,0,0.4); color: #ff8888; border-radius: 50%; width: 40px; height: 40px; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseenter="this.style.background='rgba(255,0,0,0.4)'" onmouseleave="this.style.background='rgba(255,0,0,0.2)'">✕</button>
                    </div>
                </div>

                <!-- Slide Content Frame -->
                <div id="presSlideContentFrame" style="width: 85%; height: 70%; display: flex; justify-content: center; align-items: center; position: relative;">
                    <!-- Media element dynamically rendered -->
                </div>

                <!-- Navigation Controls -->
                <button id="btnPresPrev" style="position: absolute; left: 30px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; width: 60px; height: 60px; border-radius: 50%; font-size: 1.8rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;" onmouseenter="this.style.background='rgba(255,255,255,0.15)'" onmouseleave="this.style.background='rgba(255,255,255,0.05)'">◀</button>
                <button id="btnPresNext" style="position: absolute; right: 30px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; width: 60px; height: 60px; border-radius: 50%; font-size: 1.8rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;" onmouseenter="this.style.background='rgba(255,255,255,0.15)'" onmouseleave="this.style.background='rgba(255,255,255,0.05)'">▶</button>

                <!-- Footer Autoplay controls -->
                <div style="position: absolute; bottom: 30px; display: flex; gap: 15px; align-items: center; background: rgba(0,0,0,0.6); padding: 12px 24px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.08);">
                    <button id="btnPresPlayPause" style="background: var(--primary); border: none; color: black; font-weight: bold; border-radius: 20px; padding: 6px 16px; cursor: pointer;">⏸ Autoplay Duraklat</button>
                    <span style="font-size: 0.85rem; color: #a0aec0;">Interval: 5s</span>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Render and filter functions
        const renderGalleryItems = () => {
            const grid = document.getElementById('presItemsGrid');
            grid.innerHTML = '';

            const filtered = presentations.filter(p => {
                const matchesType = this.presentationFilter === 'all' || p.type === this.presentationFilter;
                const matchesSearch = p.title.toLowerCase().includes(this.presentationSearch.toLowerCase()) ||
                                      (p.description && p.description.toLowerCase().includes(this.presentationSearch.toLowerCase()));
                return matchesType && matchesSearch;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: span 2; text-align: center; padding: 40px; color: var(--text-muted);">
                        Arama kriterlerine veya filtreye uygun sunum dosyası bulunamadı.
                    </div>
                `;
                return;
            }

            filtered.forEach(p => {
                const card = document.createElement('div');
                card.className = 'card presentation-item-card';
                card.style = 'padding: 0; overflow: hidden; display: flex; flex-direction: column; height: 100%; border: 1px solid var(--border-color); position: relative;';

                // Render thumbnail template based on type
                let mediaThumbnail = '';
                if (p.type === 'image') {
                    mediaThumbnail = `
                        <div style="width: 100%; height: 160px; background: url('${p.url}') center/cover no-repeat; position: relative;">
                            <span class="badge badge-success" style="position: absolute; top: 10px; left: 10px; font-size: 0.65rem;">Görsel</span>
                        </div>
                    `;
                } else if (p.type === 'video') {
                    const thumb = p.thumbnail || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80';
                    mediaThumbnail = `
                        <div style="width: 100%; height: 160px; background: url('${thumb}') center/cover no-repeat; position: relative; display: flex; align-items: center; justify-content: center;">
                            <span class="badge badge-danger" style="position: absolute; top: 10px; left: 10px; font-size: 0.65rem;">Video</span>
                            <div style="width: 45px; height: 45px; border-radius: 50%; background: rgba(0,0,0,0.6); border: 2px solid #fff; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; cursor: pointer;">▶</div>
                        </div>
                    `;
                } else if (p.type === 'pdf') {
                    mediaThumbnail = `
                        <div style="width: 100%; height: 160px; background: linear-gradient(135deg, #1e293b, #0f172a); position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
                            <span class="badge badge-info" style="position: absolute; top: 10px; left: 10px; font-size: 0.65rem;">PDF Belgesi</span>
                            <span style="font-size: 3rem;">📄</span>
                            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: bold; font-family: monospace;">PDF DOCUMENT</span>
                        </div>
                    `;
                }

                card.innerHTML = `
                    ${mediaThumbnail}
                    <div style="padding: 15px; display: flex; flex-direction: column; flex-grow: 1;">
                        <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-main); line-height: 1.3;">${p.title}</h4>
                        <p style="font-size: 0.78rem; color: var(--text-muted); margin: 6px 0 12px 0; line-height: 1.4; flex-grow: 1;">
                            ${p.description || 'Açıklama girilmemiş.'}
                        </p>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: auto;">
                            <span>📅 ${p.date}</span>
                            <span>💾 ${p.size || '—'}</span>
                        </div>
                        <div style="display: flex; gap: 6px; margin-top: 12px;">
                            <button class="btn btn-primary btn-sm btn-show-media" data-id="${p.id}" style="flex: 2; padding: 6px 8px; font-size: 0.75rem;">🔍 Göster (Detay)</button>
                            <button class="btn btn-secondary btn-sm btn-copy-link" data-url="${p.url}" style="flex: 1; padding: 6px 8px; font-size: 0.75rem;">🔗 Link</button>
                            <button class="btn btn-danger btn-sm btn-delete-media" data-id="${p.id}" style="padding: 6px 8px; font-size: 0.75rem;">🗑️</button>
                        </div>
                    </div>
                `;

                // Wire up actions within cards
                card.querySelector('.btn-show-media').onclick = () => {
                    this.showPresentationLightbox(p);
                };

                card.querySelector('.btn-copy-link').onclick = () => {
                    navigator.clipboard.writeText(p.url);
                    window.BrenerApp.showToast('success', 'Dosya adresi kopyalandı.');
                };

                card.querySelector('.btn-delete-media').onclick = () => {
                    if (confirm(`"${p.title}" dosyasını silmek istediğinize emin misiniz?`)) {
                        const updated = presentations.filter(x => x.id !== p.id);
                        window.BrenerApp.state.customerPresentations[activeProj.id] = updated;
                        window.BrenerApp.saveStateToStorage();
                        
                        window.BrenerApp.logActivity('proje', `Sunum dosyası silindi: ${p.title}`, 'warning');
                        window.BrenerApp.showToast('danger', 'Dosya başarıyla silindi.');
                        
                        // Reload presentations list
                        this.renderPresentations(container);
                    }
                };

                grid.appendChild(card);
            });
        };

        // Autocomplete search input query
        const searchInput = document.getElementById('presSearchInput');
        searchInput.oninput = (e) => {
            this.presentationSearch = e.target.value;
            renderGalleryItems();
        };

        // Filter tab selection
        container.querySelectorAll('.pres-tab-btn').forEach(btn => {
            btn.onclick = (e) => {
                container.querySelectorAll('.pres-tab-btn').forEach(x => {
                    x.classList.remove('btn-primary');
                    x.classList.add('btn-secondary');
                });
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-secondary');

                this.presentationFilter = btn.getAttribute('data-type');
                renderGalleryItems();
            };
        });

        // Dropzone simulators
        const dropzone = document.getElementById('presDropzone');
        const fileInput = document.getElementById('presFileInput');
        const fileNameDisp = document.getElementById('presFileName');

        dropzone.onclick = () => fileInput.click();

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                fileNameDisp.textContent = `${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`;
                
                // Prefill fields
                document.getElementById('newPresTitle').value = file.name.split('.').slice(0, -1).join('.');
                
                const ext = file.name.split('.').pop().toLowerCase();
                const typeSelect = document.getElementById('newPresType');
                if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
                    typeSelect.value = 'image';
                    document.getElementById('newPresUrl').value = URL.createObjectURL(file); // Temporary mock blob url
                } else if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
                    typeSelect.value = 'video';
                    document.getElementById('newPresUrl').value = 'https://assets.mixkit.co/videos/preview/mixkit-suburban-houses-aerial-view-40858-large.mp4'; // Use fallback mp4
                } else if (ext === 'pdf') {
                    typeSelect.value = 'pdf';
                    document.getElementById('newPresUrl').value = 'https://storage.brener.com.tr/docs/mimari_proje_detaylari.pdf';
                }
            }
        };

        // Add item submit handler
        document.getElementById('btnSaveNewPres').onclick = () => {
            const title = document.getElementById('newPresTitle').value.trim();
            const type = document.getElementById('newPresType').value;
            const url = document.getElementById('newPresUrl').value.trim();
            const desc = document.getElementById('newPresDesc').value.trim();

            if (!title || !url) {
                alert('Lütfen Başlık ve Dosya Adresi (URL) alanlarını doldurun.');
                return;
            }

            // Simulate progress bar before saving
            const progressWrapper = document.getElementById('presUploadProgressWrapper');
            const progressBarFill = document.getElementById('presProgressBarFill');
            const progressPercent = document.getElementById('presProgressPercent');
            
            progressWrapper.style.display = 'block';
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                progressBarFill.style.width = `${progress}%`;
                progressPercent.textContent = `${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // Add new presentation object to array
                    const newAsset = {
                        id: 'p_' + Date.now(),
                        title,
                        type,
                        url,
                        date: new Date().toLocaleDateString('tr-TR'),
                        size: (Math.random() * 5 + 1).toFixed(1) + ' MB',
                        description: desc
                    };

                    presentations.push(newAsset);
                    window.BrenerApp.state.customerPresentations[activeProj.id] = presentations;
                    window.BrenerApp.saveStateToStorage();
                    
                    window.BrenerApp.logActivity('proje', `Yeni sunum dosyası yüklendi: ${title}`, 'success');
                    window.BrenerApp.showToast('success', 'Dosya başarıyla sunum galerisine eklendi.');
                    
                    // Redraw entire component
                    this.renderPresentations(container);
                }
            }, 100);
        };

        // Start presentation slideshow deck
        document.getElementById('btnLaunchSlideshow').onclick = () => {
            this.launchPresentationsSlideshow(presentations);
        };

        // Initial grid draw
        renderGalleryItems();
    },

    showPresentationLightbox(asset) {
        let content = '';

        if (asset.type === 'image') {
            content = `
                <div style="text-align: center;">
                    <img src="${asset.url}" style="max-width: 100%; max-height: 500px; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg);">
                    <p style="margin-top: 15px; font-size: 0.9rem; color: var(--text-main); text-align: left; line-height: 1.5; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 6px; border-left: 3px solid var(--primary);">
                        <strong>Dosya Detayı:</strong> ${asset.description || 'Açıklama girilmemiş.'}
                    </p>
                </div>
            `;
        } else if (asset.type === 'video') {
            content = `
                <div style="text-align: center;">
                    <video src="${asset.url}" controls autoplay style="width: 100%; max-height: 480px; border-radius: 8px; box-shadow: var(--shadow-lg); background: #000;"></video>
                    <p style="margin-top: 15px; font-size: 0.9rem; color: var(--text-main); text-align: left; line-height: 1.5; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 6px; border-left: 3px solid var(--primary);">
                        <strong>Video Detayı:</strong> ${asset.description || 'Açıklama girilmemiş.'}
                    </p>
                </div>
            `;
        } else if (asset.type === 'pdf') {
            content = `
                <div style="text-align: center;">
                    <div style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); padding: 20px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 15px; margin-bottom: 15px;">
                        <span style="font-size: 4rem;">📄</span>
                        <h3 style="margin: 0; color: var(--text-main);">${asset.title}</h3>
                        <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 400px;">Bu bir PDF belgesidir. Güvenli tarayıcı uyumluluğu nedeniyle harici sekmede açabilir veya doğrudan indirebilirsiniz.</p>
                        <div style="display: flex; gap: 10px;">
                            <a href="${asset.url}" target="_blank" class="btn btn-primary" style="text-decoration: none;">📄 PDF Belgesini Aç</a>
                            <a href="${asset.url}" download class="btn btn-secondary" style="text-decoration: none;">📥 Bilgisayara İndir</a>
                        </div>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--text-main); text-align: left; line-height: 1.5; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 6px; border-left: 3px solid var(--primary);">
                        <strong>Dosya Detayı:</strong> ${asset.description || 'Açıklama girilmemiş.'}
                    </p>
                </div>
            `;
        }

        window.BrenerApp.openModal(asset.title, content);
    },

    launchPresentationsSlideshow(assets) {
        if (assets.length === 0) {
            alert('Sunum yapılacak dosya bulunmamaktadır!');
            return;
        }

        const overlay = document.getElementById('presFullscreenOverlay');
        overlay.style.display = 'flex';

        let currentIndex = 0;
        let autoplayTimer = null;
        let isPlaying = true;

        const updateSlide = () => {
            const item = assets[currentIndex];
            document.getElementById('presSlideTitle').textContent = item.title;
            document.getElementById('presSlideDesc').textContent = item.description || 'Açıklama girilmemiş.';
            document.getElementById('presSlideIndex').textContent = `${currentIndex + 1} / ${assets.length}`;

            const frame = document.getElementById('presSlideContentFrame');
            frame.innerHTML = '';

            if (item.type === 'image') {
                frame.innerHTML = `<img src="${item.url}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">`;
            } else if (item.type === 'video') {
                frame.innerHTML = `<video src="${item.url}" controls autoplay style="max-width: 100%; max-height: 100%; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); background: #000;"></video>`;
            } else if (item.type === 'pdf') {
                frame.innerHTML = `
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 12px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;">
                        <span style="font-size: 5rem;">📄</span>
                        <h2 style="margin: 0; color: #fff;">${item.title}</h2>
                        <p style="color: #a0aec0; max-width: 400px; font-size: 0.9rem;">Detaylı mimari paftalar ve resmi dökümanlar için PDF belgesi.</p>
                        <a href="${item.url}" target="_blank" class="btn btn-primary" style="text-decoration: none; padding: 12px 30px; font-size: 1rem; border-radius: 30px;">📄 Belgeyi Yeni Sekmede Aç</a>
                    </div>
                `;
            }
        };

        const stopAutoplay = () => {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
            isPlaying = false;
            document.getElementById('btnPresPlayPause').textContent = '▶ Autoplay Başlat';
            document.getElementById('btnPresPlayPause').style.background = '#e2e8f0';
            document.getElementById('btnPresPlayPause').style.color = 'black';
        };

        const startAutoplay = () => {
            stopAutoplay();
            isPlaying = true;
            document.getElementById('btnPresPlayPause').textContent = '⏸ Autoplay Duraklat';
            document.getElementById('btnPresPlayPause').style.background = 'var(--primary)';
            document.getElementById('btnPresPlayPause').style.color = 'black';

            autoplayTimer = setInterval(() => {
                currentIndex = (currentIndex + 1) % assets.length;
                updateSlide();
            }, 5000);
        };

        // Navigation bindings
        document.getElementById('btnPresNext').onclick = () => {
            stopAutoplay();
            currentIndex = (currentIndex + 1) % assets.length;
            updateSlide();
        };

        document.getElementById('btnPresPrev').onclick = () => {
            stopAutoplay();
            currentIndex = (currentIndex - 1 + assets.length) % assets.length;
            updateSlide();
        };

        document.getElementById('btnPresPlayPause').onclick = () => {
            if (isPlaying) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        };

        document.getElementById('btnCloseFullscreenPres').onclick = () => {
            stopAutoplay();
            overlay.style.display = 'none';
        };

        // Keyboard navigation
        const handleKeyDown = (e) => {
            if (overlay.style.display === 'flex') {
                if (e.key === 'ArrowRight') {
                    document.getElementById('btnPresNext').click();
                } else if (e.key === 'ArrowLeft') {
                    document.getElementById('btnPresPrev').click();
                } else if (e.key === 'Escape') {
                    document.getElementById('btnCloseFullscreenPres').click();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        // Remove keyboard event handler when overlay closes
        document.getElementById('btnCloseFullscreenPres').addEventListener('click', () => {
            window.removeEventListener('keydown', handleKeyDown);
        });

        // Initialize first slide
        updateSlide();
        startAutoplay();
    },

    renderPhases(container) {
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

        window.BrenerApp.updateTopbarTitle('Proje Aşamaları', `${activeProj.name} — Zaman Planı ve İlerleme Takibi`);

        // Initialize default phases if not exists
        let phases = JSON.parse(localStorage.getItem(`brener_phases_${activeProj.id}`));
        if (!phases || phases.length === 0) {
            phases = [
                { id: 1, name: 'Tahliye & Yıkım', status: 'Tamamlandı', date: '14 Şub 2025', progress: '0/4 görev tamamlandı', percent: 0, alert: null },
                { id: 2, name: 'Temel & Hafriyat', status: 'Tamamlandı', date: '28 Mar 2025', progress: '0/3 görev tamamlandı', percent: 0, alert: null },
                { id: 3, name: 'Kaba İnşaat (Bodrum-3. Kat)', status: 'Şu Anki Aşama', date: '30 Haz 2025', progress: '0/4 görev tamamlandı', percent: 0, alert: { text: 'Gecikti (169 gün)', type: 'danger' } },
                { id: 4, name: 'Kaba İnşaat (4-7. Kat) & Çatı', status: 'Tamamlanmadı', date: '15 Eyl 2025', progress: 'Tüm görevler tamamlandı', percent: 0, alert: null },
                { id: 5, name: 'İnce İşler & Tesisat', status: 'Tamamlanmadı', date: '31 Eki 2025', progress: 'Tüm görevler tamamlandı', percent: 0, alert: null },
                { id: 6, name: 'Dış Cephe & Teslim', status: 'Tamamlanmadı', date: '30 Kas 2025', progress: 'Tüm görevler tamamlandı', percent: 0, alert: { text: '1 fon bağlı', type: 'info' } }
            ];
            localStorage.setItem(`brener_phases_${activeProj.id}`, JSON.stringify(phases));
        }

        // Find current phase
        const currentPhaseObj = phases.find(p => p.status === 'Şu Anki Aşama') || { name: 'Belirtilmedi' };

        let phasesHtml = `
            <style>
                .phase-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 16px 20px;
                    margin-bottom: 12px;
                    transition: all 0.3s;
                    position: relative;
                }
                .phase-card.active-phase {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.03);
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.05);
                }
                .circle-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    font-weight: 700;
                }
                .circle-completed {
                    background: #d1fae5;
                    color: #065f46;
                }
                .circle-active {
                    background: #dbeafe;
                    color: #1e40af;
                }
                .circle-pending {
                    background: rgba(255,255,255,0.08);
                    color: var(--text-muted);
                    border: 1px solid var(--border-color);
                }
                .arrow-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 2px;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                }
                .arrow-btn:hover {
                    color: var(--text-main);
                }
            </style>

            <div class="card-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="display: flex; align-items: center; gap: 8px;">📍 Proje Aşamaları</h2>
                    <span style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; display: block;">
                        Şu anki aşama: <strong style="color: var(--primary);">${currentPhaseObj.name}</strong>
                    </span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary btn-sm" id="btnExportPhasesExcel" style="display: flex; align-items: center; gap: 6px;">
                        📥 Excel'e Aktar
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btnAutoCalendar" style="display: flex; align-items: center; gap: 6px;">
                        📅 Otomatik Takvimle
                    </button>
                    <button class="btn btn-primary btn-sm" id="btnAddNewPhase" style="display: flex; align-items: center; gap: 6px;">
                        ➕ Aşama Ekle
                    </button>
                </div>
            </div>

            <div id="phasesListContainer">
        `;

        phases.forEach((p, idx) => {
            const isCompleted = p.status === 'Tamamlandı';
            const isActive = p.status === 'Şu Anki Aşama';
            
            // Determine circle icon
            let iconHtml = '';
            if (isCompleted) {
                iconHtml = `<div class="circle-icon circle-completed" title="Tamamlandı">✔️</div>`;
            } else if (isActive) {
                iconHtml = `<div class="circle-icon circle-active">${idx + 1}</div>`;
            } else {
                iconHtml = `<div class="circle-icon circle-pending">${idx + 1}</div>`;
            }

            // Determine status badge
            let statusBadge = '';
            if (isCompleted) {
                statusBadge = `<span class="badge badge-success" style="font-size: 0.65rem; padding: 2px 6px;">Tamamlandı</span>`;
            } else if (isActive) {
                statusBadge = `<span class="badge badge-primary" style="font-size: 0.65rem; padding: 2px 6px;">Şu Anki Aşama</span>`;
            } else {
                statusBadge = `<span class="badge badge-secondary" style="font-size: 0.65rem; padding: 2px 6px;">Tamamlanmadı</span>`;
            }

            // Determine alert badge
            let alertBadge = '';
            if (p.alert) {
                const bg = p.alert.type === 'danger' ? '#ef4444' : '#0d9488';
                alertBadge = `<span class="badge" style="font-size: 0.65rem; padding: 2px 6px; background: ${bg}; color: #fff; display: inline-flex; align-items: center; gap: 4px; font-weight: bold;">
                    ${p.alert.text}
                </span>`;
            }

            phasesHtml += `
                <div class="phase-card ${isActive ? 'active-phase' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        
                        <!-- Left Block: Title -->
                        <div style="display: flex; gap: 16px; align-items: start; flex: 1;">
                            ${iconHtml}
                            <div>
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <h3 style="font-size: 0.95rem; font-weight: 700; margin: 0; color: var(--text-main);">${p.name}</h3>
                                    ${statusBadge}
                                    ${alertBadge}
                                </div>
                                <div style="display: flex; gap: 15px; font-size: 0.76rem; color: var(--text-muted); margin-top: 6px; align-items: center; flex-wrap: wrap;">
                                    <span style="display: flex; align-items: center; gap: 4px;">
                                        🕒 Planlanan Bitiş: <strong>${p.date}</strong>
                                    </span>
                                    <span>•</span>
                                    <span style="color: ${p.progress.includes('Tüm') ? '#10b981' : 'var(--text-muted)'}; font-weight: ${p.progress.includes('Tüm') ? 'bold' : 'normal'};">
                                        ${p.progress}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Right Block: Controls -->
                        <div style="display: flex; align-items: center; gap: 12px; margin-left: 15px;">
                            
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <button class="arrow-btn btn-move-up" data-idx="${idx}" title="Yukarı Taşı" ${idx === 0 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}>▲</button>
                                <button class="arrow-btn btn-move-down" data-idx="${idx}" title="Aşağı Taşı" ${idx === phases.length - 1 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}>▼</button>
                            </div>

                            <button class="btn btn-secondary btn-sm btn-edit-phase" data-idx="${idx}" style="padding: 4px 8px; font-size: 0.72rem; border-radius: 4px; display: flex; align-items: center;">
                                ⚙️ Düzenle
                            </button>
                            <button class="btn btn-secondary btn-sm btn-delete-phase" data-idx="${idx}" style="padding: 4px 8px; font-size: 0.72rem; border-radius: 4px; color: var(--danger); border-color: rgba(239, 68, 68, 0.2);">
                                🗑️ Sil
                            </button>

                        </div>

                    </div>

                    <!-- Progress Bar -->
                    <div style="margin-top: 12px;">
                        <div class="progress-bar-bg" style="height: 6px; border-radius: 3px;">
                            <div class="progress-bar-fill" style="width: ${p.percent || (isCompleted ? 100 : isActive ? 45 : 0)}%; background: ${isCompleted ? '#10b981' : isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; border-radius: 3px;"></div>
                        </div>
                        <div style="text-align: right; font-size: 0.72rem; color: var(--text-muted); margin-top: 3px;">
                            %${p.percent || (isCompleted ? 100 : isActive ? 45 : 0)}
                        </div>
                    </div>

                </div>
            `;
        });

        phasesHtml += `</div>`;
        container.innerHTML = phasesHtml;

        // Bind Up / Down order changes
        container.querySelectorAll('.btn-move-up').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                if (idx > 0) {
                    const temp = phases[idx];
                    phases[idx] = phases[idx - 1];
                    phases[idx - 1] = temp;
                    localStorage.setItem(`brener_phases_${activeProj.id}`, JSON.stringify(phases));
                    this.renderPhases(container);
                }
            };
        });

        container.querySelectorAll('.btn-move-down').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                if (idx < phases.length - 1) {
                    const temp = phases[idx];
                    phases[idx] = phases[idx + 1];
                    phases[idx + 1] = temp;
                    localStorage.setItem(`brener_phases_${activeProj.id}`, JSON.stringify(phases));
                    this.renderPhases(container);
                }
            };
        });

        document.getElementById('btnExportPhasesExcel').onclick = () => {
            window.BrenerApp.showToast('success', 'Proje aşama planı Excel formatında dışa aktarıldı!');
        };

        document.getElementById('btnAutoCalendar').onclick = () => {
            let baseDate = new Date();
            phases.forEach((p, index) => {
                p.date = new Date(baseDate.getTime() + (index * 35 * 24 * 60 * 60 * 1000)).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
            });
            localStorage.setItem(`brener_phases_${activeProj.id}`, JSON.stringify(phases));
            window.BrenerApp.showToast('success', 'Aşama takvim tarihleri otomatik optimize edildi!');
            this.renderPhases(container);
        };

        document.getElementById('btnAddNewPhase').onclick = () => {
            const addForm = `
                <div class="form-group">
                    <label>Aşama Başlığı *</label>
                    <input type="text" id="newPhaseName" placeholder="Örn: İnce Sıva & Boya İşleri" required>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="form-group">
                        <label>Planlanan Bitiş Tarihi</label>
                        <input type="text" id="newPhaseDate" placeholder="Örn: 15 Eyl 2025" value="15 Eyl 2025">
                    </div>
                    <div class="form-group">
                        <label>Durum</label>
                        <select id="newPhaseStatus">
                            <option value="Tamamlanmadı">Tamamlanmadı</option>
                            <option value="Şu Anki Aşama">Şu Anki Aşama</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                        </select>
                    </div>
                </div>
                <button class="btn btn-primary" id="btnSaveNewPhase" style="width: 100%; margin-top: 10px;">Aşamayı Kaydet</button>
            `;
            window.BrenerApp.openModal('Yeni Proje Aşaması Ekle', addForm);

            document.getElementById('btnSaveNewPhase').onclick = () => {
                const name = document.getElementById('newPhaseName').value.trim();
                const date = document.getElementById('newPhaseDate').value.trim();
                const status = document.getElementById('newPhaseStatus').value;

                if (!name) {
                    alert('Lütfen aşama başlığı girin!');
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

                localStorage.setItem(`brener_phases_${activeProj.id}`, JSON.stringify(phases));
                window.BrenerApp.showToast('success', 'Asama eklendi.');
                document.getElementById('modalCloseBtn').click();
                this.renderPhases(container);
            };
        };

        container.querySelectorAll('.btn-delete-phase').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                if (confirm('Aşamayı silmek istediğinize emin misiniz?')) {
                    phases.splice(idx, 1);
                    localStorage.setItem(`brener_phases_${activeProj.id}`, JSON.stringify(phases));
                    this.renderPhases(container);
                }
            };
        });

        container.querySelectorAll('.btn-edit-phase').forEach(btn => {
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
                    <button class="btn btn-primary" id="btnSaveEditPhase" style="width: 100%; margin-top: 10px;">Değişiklikleri Kaydet</button>
                `;
                window.BrenerApp.openModal('Aşamayı Düzenle', editForm);

                document.getElementById('btnSaveEditPhase').onclick = () => {
                    p.name = document.getElementById('editPhaseName').value.trim();
                    p.date = document.getElementById('editPhaseDate').value.trim();
                    p.status = document.getElementById('editPhaseStatus').value;

                    localStorage.setItem(`brener_phases_${activeProj.id}`, JSON.stringify(phases));
                    window.BrenerApp.showToast('success', 'Aşama güncellendi.');
                    document.getElementById('modalCloseBtn').click();
                    this.renderPhases(container);
                };
            };
        });
    },

    renderCrm(container) {
        window.BrenerApp.updateTopbarTitle('Müşteri Adayları (CRM)', 'Potansiyel alıcıları takip edin, etkileşimleri yönetin ve satış funnel\'ınızı izleyin.');

        // Initialize state crm leads
        if (!window.BrenerApp.state.crmLeads) {
            window.BrenerApp.state.crmLeads = [
                {
                    id: 'lead_1',
                    firstName: 'Mustafa',
                    lastName: 'Kaya',
                    phone: '05329998877',
                    project: 'Örnek Villa Projesi',
                    budget: '8.500.000',
                    source: 'Sosyal Medya',
                    notes: 'Projedeki 3+1 villalarla ilgileniyor.',
                    stage: 'Yeni Aday',
                    type: 'Daire Satışı'
                },
                {
                    id: 'lead_2',
                    firstName: 'Hasan',
                    lastName: 'Yılmaz',
                    phone: '05468846094',
                    address: 'Kadıköy, Bahariye Cad. No: 12',
                    floors: '5',
                    apartments: '10',
                    landShare: '350',
                    coOwners: '10',
                    source: 'Tavsiye',
                    notes: 'Kentsel dönüşüm kapsamında teklif bekliyor.',
                    stage: 'İletişimde',
                    type: 'Kentsel Dönüşüm'
                }
            ];
            window.BrenerApp.saveStateToStorage();
        }

        const leads = window.BrenerApp.state.crmLeads;
        this.selectedCrmTab = this.selectedCrmTab || 'Daire Satışı';

        // Filter leads based on active tab
        const activeLeads = leads.filter(l => l.type === this.selectedCrmTab);

        // Metrics calculations
        const totalLeads = activeLeads.length;
        const hotLeads = activeLeads.filter(l => l.stage === 'Teklif Verildi' || l.stage === 'Randevu/Sunum').length;
        const newLeads = activeLeads.filter(l => l.stage === 'Yeni Aday').length;
        const interactionLeads = activeLeads.filter(l => l.stage !== 'Yeni Aday' && l.stage !== 'İptal Edildi').length;

        let html = `
            <style>
                .crm-tab-bar {
                    display: flex;
                    gap: 12px;
                    border-bottom: 2px solid var(--border-color);
                    margin-bottom: 24px;
                    padding-bottom: 8px;
                }
                .crm-tab {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    padding: 8px 16px;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                }
                .crm-tab:hover {
                    color: var(--primary);
                }
                .crm-tab.active {
                    color: var(--primary);
                }
                .crm-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: -10px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: var(--primary);
                    border-radius: 2px;
                }
                .kanban-board {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 12px;
                    align-items: start;
                    overflow-x: auto;
                    padding-bottom: 16px;
                }
                .kanban-column {
                    background: rgba(255,255,255,0.01);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 12px;
                    min-height: 400px;
                }
                .kanban-column-header {
                    font-size: 0.78rem;
                    font-weight: bold;
                    margin-bottom: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 8px;
                }
                .kanban-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 12px;
                    margin-bottom: 12px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
                    transition: all 0.25s;
                }
                .kanban-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .kanban-card-title {
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin: 0 0 6px 0;
                    color: var(--text-main);
                }
                .kanban-card-detail {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    margin-bottom: 4px;
                    word-break: break-all;
                }
                .kanban-card-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid var(--border-color);
                    padding-top: 8px;
                    margin-top: 8px;
                }
                .kanban-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    cursor: pointer;
                    padding: 2px 6px;
                    border-radius: 4px;
                    transition: all 0.15s;
                }
                .kanban-btn:hover {
                    background: rgba(255,255,255,0.05);
                    color: var(--primary);
                }
            </style>

            <!-- Top Header & Actions -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">👥 Müşteri Adayları (CRM)</h2>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-muted);">Potansiyel alıcıları takip edin, etkileşimleri yönetin ve satış funnel'ınızı izleyin.</p>
                </div>
                <button class="btn btn-primary" id="btnCrmAddNewLead" style="background: #1e293b; border: none; color: white; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                    ➕ Yeni Aday
                </button>
            </div>

            <!-- CRM Daire/Kentsel Donusum Tab Selection -->
            <div class="crm-tab-bar">
                <div class="crm-tab ${this.selectedCrmTab === 'Daire Satışı' ? 'active' : ''}" data-tab="Daire Satışı">🏢 Daire Satışı Adayları</div>
                <div class="crm-tab ${this.selectedCrmTab === 'Kentsel Dönüşüm' ? 'active' : ''}" data-tab="Kentsel Dönüşüm">🏗 Kentsel Dönüşüm Adayları</div>
            </div>

            <!-- Metrics Row Grid -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Toplam Aday</div>
                        <strong style="font-size: 1.6rem; display: block; margin-top: 4px; color: var(--text-main);">${totalLeads}</strong>
                    </div>
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(59, 130, 246, 0.1); color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">👤</div>
                </div>

                <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Sıcak Takip</div>
                        <strong style="font-size: 1.6rem; display: block; margin-top: 4px; color: var(--text-main);">${hotLeads}</strong>
                    </div>
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(249, 115, 22, 0.1); color: #f97316; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">🔥</div>
                </div>

                <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Yeni Gelen</div>
                        <strong style="font-size: 1.6rem; display: block; margin-top: 4px; color: var(--text-main);">${newLeads}</strong>
                    </div>
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(6, 182, 212, 0.1); color: #06b6d4; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">▶</div>
                </div>

                <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Toplam Etkileşim</div>
                        <strong style="font-size: 1.6rem; display: block; margin-top: 4px; color: var(--text-main);">${interactionLeads}</strong>
                    </div>
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">💬</div>
                </div>
            </div>

            <!-- Search & Filters -->
            <div class="card" style="padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
                <div style="position: relative; flex: 1; min-width: 250px;">
                    <input type="text" id="crmSearchInput" placeholder="İsim, e-posta veya telefon ile ara..." style="width: 100%; padding-left: 36px;">
                    <span style="position: absolute; left: 12px; top: 11px; color: var(--text-muted);">🔍</span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" style="padding: 10px 16px;">⚙ Filtrele</button>
                </div>
            </div>

            <!-- Slogan Guide -->
            <p style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 12px;">💡 Butonları kullanarak veya düzenleme panellerinden adayların aşamalarını değiştirebilirsiniz.</p>

            <!-- Kanban Board Grid -->
            <div class="kanban-board">
                <div class="kanban-column" data-stage="Yeni Aday">
                    <div class="kanban-column-header">
                        <span style="color: #3b82f6;">🔵 Yeni Aday</span>
                        <span class="badge" style="background: rgba(59,130,246,0.15); color: #3b82f6;" id="count_YeniAday">0</span>
                    </div>
                    <div class="kanban-cards-container" id="container_YeniAday"></div>
                </div>

                <div class="kanban-column" data-stage="İletişimde">
                    <div class="kanban-column-header">
                        <span style="color: #8b5cf6;">🔵 İletişimde</span>
                        <span class="badge" style="background: rgba(139,92,246,0.15); color: #8b5cf6;" id="count_Iletisimde">0</span>
                    </div>
                    <div class="kanban-cards-container" id="container_Iletisimde"></div>
                </div>

                <div class="kanban-column" data-stage="Randevu/Sunum">
                    <div class="kanban-column-header">
                        <span style="color: #ec4899;">🟣 Randevu/Sunum</span>
                        <span class="badge" style="background: rgba(236,72,153,0.15); color: #ec4899;" id="count_RandevuSunum">0</span>
                    </div>
                    <div class="kanban-cards-container" id="container_RandevuSunum"></div>
                </div>

                <div class="kanban-column" data-stage="Teklif Verildi">
                    <div class="kanban-column-header">
                        <span style="color: #f59e0b;">🟡 Teklif Verildi</span>
                        <span class="badge" style="background: rgba(245,158,11,0.15); color: #f59e0b;" id="count_TeklifVerildi">0</span>
                    </div>
                    <div class="kanban-cards-container" id="container_TeklifVerildi"></div>
                </div>

                <div class="kanban-column" data-stage="Satış/Kapama">
                    <div class="kanban-column-header">
                        <span style="color: #10b981;">🟢 Satış/Kapama</span>
                        <span class="badge" style="background: rgba(16,185,129,0.15); color: #10b981;" id="count_SatisKapama">0</span>
                    </div>
                    <div class="kanban-cards-container" id="container_SatisKapama"></div>
                </div>

                <div class="kanban-column" data-stage="İptal Edildi">
                    <div class="kanban-column-header">
                        <span style="color: #ef4444;">🔴 İptal Edildi</span>
                        <span class="badge" style="background: rgba(239,68,68,0.15); color: #ef4444;" id="count_IptalEdildi">0</span>
                    </div>
                    <div class="kanban-cards-container" id="container_IptalEdildi"></div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Render Cards initially
        this.renderKanbanCards(activeLeads);

        // Bind Search filtering
        const crmSearch = document.getElementById('crmSearchInput');
        crmSearch.oninput = () => {
            const query = crmSearch.value.toLowerCase().trim();
            const filtered = activeLeads.filter(l => {
                return `${l.firstName} ${l.lastName}`.toLowerCase().includes(query) || l.phone.includes(query) || (l.notes && l.notes.toLowerCase().includes(query));
            });
            this.renderKanbanCards(filtered);
        };

        // Tab Change Binding
        const tabs = container.querySelectorAll('.crm-tab');
        tabs.forEach(t => {
            t.onclick = () => {
                this.selectedCrmTab = t.getAttribute('data-tab');
                this.renderCrm(container);
            };
        });

        // Add lead binding
        document.getElementById('btnCrmAddNewLead').onclick = () => {
            this.showCrmAddNewLeadModal(container);
        };
    },

    renderKanbanCards(leadsList) {
        const stages = ['Yeni Aday', 'İletişimde', 'Randevu/Sunum', 'Teklif Verildi', 'Satış/Kapama', 'İptal Edildi'];
        
        // Reset count labels & containers
        stages.forEach(stg => {
            const cleanId = stg.replace('/', '').replace(' ', '');
            const colContainer = document.getElementById(`container_${cleanId}`);
            const countLabel = document.getElementById(`count_${cleanId}`);
            if (colContainer) {
                colContainer.innerHTML = '';
            }
            if (countLabel) {
                countLabel.textContent = '0';
            }
        });

        const stageCounts = {};
        stages.forEach(s => stageCounts[s] = 0);

        leadsList.forEach(lead => {
            const stage = lead.stage;
            const cleanId = stage.replace('/', '').replace(' ', '');
            const colContainer = document.getElementById(`container_${cleanId}`);
            
            if (colContainer) {
                stageCounts[stage] = (stageCounts[stage] || 0) + 1;
                
                const card = document.createElement('div');
                card.className = 'kanban-card';
                card.setAttribute('data-id', lead.id);

                let detailsHtml = '';
                if (lead.type === 'Daire Satışı') {
                    detailsHtml = `
                        <div class="kanban-card-detail">🏢 <strong>Proje:</strong> ${lead.project || 'Genel'}</div>
                        <div class="kanban-card-detail">💰 <strong>Bütçe:</strong> ${lead.budget ? lead.budget + ' ₺' : 'Belirtilmedi'}</div>
                    `;
                } else {
                    // Kentsel Dönüşüm
                    detailsHtml = `
                        <div class="kanban-card-detail">📍 <strong>Adres:</strong> ${lead.address || 'Belirtilmedi'}</div>
                        <div class="kanban-card-detail">📐 <strong>Arsa Payı:</strong> ${lead.landShare ? lead.landShare + ' m²' : 'Belirtilmedi'}</div>
                    `;
                }

                card.innerHTML = `
                    <h4 class="kanban-card-title">${lead.firstName} ${lead.lastName}</h4>
                    <div class="kanban-card-detail">📞 ${lead.phone}</div>
                    ${detailsHtml}
                    <div class="kanban-card-detail" style="margin-top: 6px; font-style: italic; color: var(--text-muted); max-height: 32px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        "${lead.notes || 'Not girilmemiş.'}"
                    </div>
                    
                    <div class="kanban-card-actions">
                        <div style="display: flex; gap: 4px;">
                            <button class="kanban-btn btnMoveBack" title="Geri Al">◀</button>
                            <button class="kanban-btn btnMoveNext" title="İlerlet">▶</button>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <button class="kanban-btn btnViewLead" title="Detay / Düzenle" style="color: var(--primary);">👁</button>
                            <button class="kanban-btn btnDeleteLead" title="Sil" style="color: #ef4444;">🗑</button>
                        </div>
                    </div>
                `;

                colContainer.appendChild(card);

                // Bind Card Events
                card.querySelector('.btnViewLead').onclick = (e) => {
                    e.stopPropagation();
                    this.showLeadDetailModal(lead.id);
                };

                card.querySelector('.btnDeleteLead').onclick = (e) => {
                    e.stopPropagation();
                    if (confirm('Bu müşteri adayını silmek istediğinize emin misiniz?')) {
                        const globalList = window.BrenerApp.state.crmLeads;
                        const idx = globalList.findIndex(l => l.id === lead.id);
                        if (idx !== -1) {
                            globalList.splice(idx, 1);
                            window.BrenerApp.saveStateToStorage();
                            window.BrenerApp.showToast('success', 'Müşteri adayı başarıyla silindi.');
                            this.renderCrm(document.getElementById('contentWindow'));
                        }
                    }
                };

                // Move stage handlers
                card.querySelector('.btnMoveBack').onclick = (e) => {
                    e.stopPropagation();
                    this.shiftLeadStage(lead.id, -1);
                };

                card.querySelector('.btnMoveNext').onclick = (e) => {
                    e.stopPropagation();
                    this.shiftLeadStage(lead.id, 1);
                };
            }
        });

        // Set column counts
        stages.forEach(stg => {
            const cleanId = stg.replace('/', '').replace(' ', '');
            const countLabel = document.getElementById(`count_${cleanId}`);
            if (countLabel) {
                countLabel.textContent = stageCounts[stg] || '0';
            }
        });
    },

    shiftLeadStage(leadId, direction) {
        const stages = ['Yeni Aday', 'İletişimde', 'Randevu/Sunum', 'Teklif Verildi', 'Satış/Kapama', 'İptal Edildi'];
        const globalList = window.BrenerApp.state.crmLeads;
        const lead = globalList.find(l => l.id === leadId);
        
        if (lead) {
            const currentIdx = stages.indexOf(lead.stage);
            if (currentIdx !== -1) {
                let nextIdx = currentIdx + direction;
                if (nextIdx >= 0 && nextIdx < stages.length) {
                    lead.stage = stages[nextIdx];
                    window.BrenerApp.saveStateToStorage();
                    window.BrenerApp.showToast('success', `${lead.firstName} ${lead.lastName} aşaması güncellendi: ${lead.stage}`);
                    this.renderCrm(document.getElementById('contentWindow'));
                }
            }
        }
    },

    showLeadDetailModal(id) {
        const l = window.BrenerApp.state.crmLeads.find(item => item.id === id);
        if (!l) return;

        let detailsHtml = '';
        if (l.type === 'Daire Satışı') {
            detailsHtml = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase;">İlgilendiği Proje</span>
                        <strong>🏢 ${l.project || 'Genel'}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase;">Bütçe (₺)</span>
                        <strong>${l.budget ? l.budget + ' ₺' : 'Belirtilmedi'}</strong>
                    </div>
                </div>
            `;
        } else {
            // Kentsel Dönüşüm
            detailsHtml = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase;">Mevcut Bina Adresi</span>
                        <strong>📍 ${l.address || 'Belirtilmedi'}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase;">Arsa Payı (m²)</span>
                        <strong>📐 ${l.landShare ? l.landShare + ' m²' : 'Belirtilmedi'}</strong>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase;">Bina Kat / Daire Sayısı</span>
                        <strong>🏢 ${l.floors || 0} Kat / ${l.apartments || 0} Daire</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase;">Toplam Malik Sayısı</span>
                        <strong>👥 ${l.coOwners || 0} Kişi</strong>
                    </div>
                </div>
            `;
        }

        const modalHtml = `
            <div style="padding: 20px; font-size: 0.9rem; display: flex; flex-direction: column; gap: 16px;">
                <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px;">
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase;">Müşteri Adı Soyadı</span>
                        <strong>${l.firstName} ${l.lastName}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase;">Müşteri Tipi</span>
                        <span class="badge badge-info" style="font-size: 0.75rem;">${l.type}</span>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Telefon</span>
                        <strong>📞 ${l.phone}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size: 0.7rem; text-transform: uppercase;">Edinme Kaynağı</span>
                        <strong>🔗 ${l.source}</strong>
                    </div>
                </div>

                ${detailsHtml}

                <div>
                    <span style="color: var(--text-muted); display: block; font-size: 0.74rem; text-transform: uppercase; margin-bottom: 6px;">İlk Notlar / Görüşmeler</span>
                    <p style="margin: 0; line-height: 1.5; padding: 10px; background: rgba(255,255,255,0.01); border-radius: 6px; border: 1px solid var(--border-color); color: var(--text-main); font-size: 0.85rem;">
                        ${l.notes || 'Herhangi bir not girilmemiş.'}
                    </p>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                    <button class="btn btn-secondary" onclick="window.BrenerApp.closeModal()">Kapat</button>
                </div>
            </div>
        `;

        window.BrenerApp.openModal('📋 Müşteri Adayı Detayları', modalHtml);
    },

    showCrmAddNewLeadModal(mainContainer) {
        const projects = window.BrenerApp.state.projects || [];

        const modalHtml = `
            <div style="padding: 16px; font-size: 0.9rem;">
                
                <div class="form-group" style="margin-bottom: 16px;">
                    <label style="font-weight: bold; color: var(--primary);">Müşteri Tipi *</label>
                    <select id="addLeadType" style="width: 100%;">
                        <option value="Daire Satışı">🏢 Daire Satışı</option>
                        <option value="Kentsel Dönüşüm">🏗 Kentsel Dönüşüm</option>
                    </select>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div class="form-group">
                        <label>AD *</label>
                        <input type="text" id="addLeadName" placeholder="Ad" required style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>SOYAD *</label>
                        <input type="text" id="addLeadSurname" placeholder="Soyad" required style="width: 100%;">
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label>TELEFON *</label>
                    <input type="text" id="addLeadPhone" placeholder="0546 884 60 94" required style="width: 100%;">
                </div>

                <!-- Dynamic Fields Box -->
                <div id="crmDynamicFieldsArea" style="margin-bottom: 16px;">
                    <!-- Defaults to Daire Satisi -->
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label>İLGİLENDİĞİ PROJE</label>
                        <select id="addLeadProject" style="width: 100%;">
                            <option value="">Proje Seçin (Opsiyonel)</option>
                            ${projects.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px;">
                        <div class="form-group">
                            <label>KAYNAK</label>
                            <select id="addLeadSource" style="width: 100%;">
                                <option value="Web Sitesi" selected>Web Sitesi</option>
                                <option value="Sosyal Medya">Sosyal Medya</option>
                                <option value="Tavsiye">Tavsiye</option>
                                <option value="Doğrudan">Doğrudan</option>
                                <option value="Diğer">Diğer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>BÜTÇE (₺)</label>
                            <input type="text" id="addLeadBudget" placeholder="2.000.000" style="width: 100%;">
                        </div>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label>İLK NOTLAR</label>
                    <textarea id="addLeadNotes" rows="3" style="width: 100%;" placeholder="Görüşme hakkında ilk notlar..."></textarea>
                </div>

                <button class="btn btn-primary" id="btnConfirmAddCrmLead" style="width: 100%; padding: 12px; font-weight: bold; background: #1e293b; border: none; color: white;">
                    ➕ Adayı Kaydet
                </button>
            </div>
        `;

        window.BrenerApp.openModal('Yeni Aday Müşteri Ekle', modalHtml);

        // Dynamic Switch of inputs based on Customer Type selection
        const typeSelect = document.getElementById('addLeadType');
        const dynamicArea = document.getElementById('crmDynamicFieldsArea');

        typeSelect.onchange = () => {
            const val = typeSelect.value;
            if (val === 'Daire Satışı') {
                dynamicArea.innerHTML = `
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label>İLGİLENDİĞİ PROJE</label>
                        <select id="addLeadProject" style="width: 100%;">
                            <option value="">Proje Seçin (Opsiyonel)</option>
                            ${projects.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px;">
                        <div class="form-group">
                            <label>KAYNAK</label>
                            <select id="addLeadSource" style="width: 100%;">
                                <option value="Web Sitesi" selected>Web Sitesi</option>
                                <option value="Sosyal Medya">Sosyal Medya</option>
                                <option value="Tavsiye">Tavsiye</option>
                                <option value="Doğrudan">Doğrudan</option>
                                <option value="Diğer">Diğer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>BÜTÇE (₺)</label>
                            <input type="text" id="addLeadBudget" placeholder="2.000.000" style="width: 100%;">
                        </div>
                    </div>
                `;
            } else {
                // Kentsel Dönüşüm
                dynamicArea.innerHTML = `
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label>BİNA ADRESİ *</label>
                        <input type="text" id="addLeadAddress" placeholder="Bina adresi girin" required style="width: 100%;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div class="form-group">
                            <label>ARSA PAYI (m²)</label>
                            <input type="number" id="addLeadLandShare" placeholder="Arsa metrekaresi" style="width: 100%;">
                        </div>
                        <div class="form-group">
                            <label>KAYNAK</label>
                            <select id="addLeadSource" style="width: 100%;">
                                <option value="Web Sitesi" selected>Web Sitesi</option>
                                <option value="Sosyal Medya">Sosyal Medya</option>
                                <option value="Tavsiye">Tavsiye</option>
                                <option value="Doğrudan">Doğrudan</option>
                                <option value="Diğer">Diğer</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-group">
                            <label>KAT SAYISI</label>
                            <input type="number" id="addLeadFloors" placeholder="Kat sayısı" style="width: 100%;">
                        </div>
                        <div class="form-group">
                            <label>DAİRE SAYISI</label>
                            <input type="number" id="addLeadApartments" placeholder="Daire sayısı" style="width: 100%;">
                        </div>
                    </div>
                `;
            }
        };

        // Submit Save Action
        document.getElementById('btnConfirmAddCrmLead').onclick = () => {
            const type = typeSelect.value;
            const firstName = document.getElementById('addLeadName').value.trim();
            const lastName = document.getElementById('addLeadSurname').value.trim();
            const phone = document.getElementById('addLeadPhone').value.trim();
            const notes = document.getElementById('addLeadNotes').value.trim();

            if (!firstName || !lastName || !phone) {
                alert('Lütfen Ad, Soyad ve Telefon alanlarını doldurun!');
                return;
            }

            const newLead = {
                id: 'lead_' + Date.now(),
                firstName,
                lastName,
                phone,
                notes,
                stage: 'Yeni Aday',
                type,
                source: document.getElementById('addLeadSource').value
            };

            if (type === 'Daire Satışı') {
                newLead.project = document.getElementById('addLeadProject').value;
                newLead.budget = document.getElementById('addLeadBudget').value.trim();
            } else {
                const addr = document.getElementById('addLeadAddress').value.trim();
                if (!addr) {
                    alert('Lütfen Bina Adresini girin!');
                    return;
                }
                newLead.address = addr;
                newLead.landShare = document.getElementById('addLeadLandShare').value;
                newLead.floors = document.getElementById('addLeadFloors').value;
                newLead.apartments = document.getElementById('addLeadApartments').value;
            }

            // Save to state
            window.BrenerApp.state.crmLeads.push(newLead);
            window.BrenerApp.saveStateToStorage();
            
            window.BrenerApp.closeModal();
            window.BrenerApp.showToast('success', `${firstName} ${lastName} isimli yeni aday CRM\'e kaydedildi.`);
            window.BrenerApp.logActivity('proje-yonetimi', `Yeni CRM Adayı eklendi: ${firstName} ${lastName} (${type})`, 'success');

            // Refresh Kanban list view
            this.renderCrm(mainContainer);
        };
    },
};
