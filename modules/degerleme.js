/* ==========================================================================
   BRENER GROUP - VALUATION & REAL ESTATE PORTFOLIO MODULE (DEĞERLEME)
   ========================================================================== */

window.BrenerApp.Degerleme = {
    render(view, container) {
        if (view === 'emlak-deger-tahmini') {
            this.renderEstateValue(container);
        } else if (view === 'arsa-degerleme') {
            this.renderLandValuation(container);
        } else if (view === 'emlak-takip') {
            this.renderPortfolio(container);
        } else if (view === 'emsal-karsilastirma') {
            this.renderCma(container);
        } else if (view === 'bolge-analizi') {
            this.renderRegion(container);
        } else if (view === 'komisyon-vergi') {
            this.renderTaxCalc(container);
        } else if (view === 'kira-dilekce-asistani') {
                this.renderRentAssistant(container);
            } else if (view === 'sektor-radari') {
                this.renderSektorRadari(container);
            }
    },

    // 1. Emlak Değer Tahmini (Value Predictor)
    renderEstateValue(container) {
        window.BrenerApp.updateTopbarTitle('Emlak Değer Tahmincisi', 'Bölge, Alan ve Konut Niteliklerine Göre Tahmini Satış Bedeli');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Mülk Değerleme Formu</h2>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Brüt Alan (m²)</label>
                            <input type="number" id="valArea" value="120" oninput="window.BrenerApp.Degerleme.calcEstateVal()">
                        </div>
                        <div class="form-group">
                            <label>Bina Yaşı</label>
                            <input type="number" id="valAge" value="0" min="0" oninput="window.BrenerApp.Degerleme.calcEstateVal()">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Bölge / Lokasyon Katsayısı</label>
                            <select id="valRegion" onchange="window.BrenerApp.Degerleme.calcEstateVal()">
                                <option value="1.5" selected>Levent/Beşiktaş, İst (Lüks Rayiç)</option>
                                <option value="1.2">Ataşehir/Kadıköy, İst (Nitelikli Rayiç)</option>
                                <option value="0.8">Nilüfer, Bursa (Standart Rayiç)</option>
                                <option value="1.4">Bodrum/Merkez, Muğla (Turizm Rayiç)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Oda Sayısı</label>
                            <select id="valRooms" onchange="window.BrenerApp.Degerleme.calcEstateVal()">
                                <option value="1">1+1</option>
                                <option value="2" selected>2+1</option>
                                <option value="3">3+1</option>
                                <option value="4">4+1</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Cephe / Kat Nitelikleri</label>
                        <select id="valFacade" onchange="window.BrenerApp.Degerleme.calcEstateVal()">
                            <option value="1.15" selected>Güney/Batı Cephe - Ara Kat (+%15 Değerli)</option>
                            <option value="1.0">Doğu Cephe - Orta Kat</option>
                            <option value="0.85">Kuzey Cephe - Giriş/Zemin Kat (-%15 Değerli)</option>
                        </select>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h4 style="font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">Tahmini Değerleme Raporu</h4>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Ortalama m² Değeri:</span>
                            <span id="liveValSquarePrice">45,000.00 TL/m²</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 700; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px; color: var(--primary);">
                            <span>Mülk Piyasa Değeri:</span>
                            <span id="liveValGrandTotal">6,210,000.00 ₺</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.showToast('success', 'Emlak ekspertiz rapor dosyası oluşturuldu.')">Ekspertiz Raporu Al</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Ekspertiz Parametreleri</h2>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-muted);">
                        - Değerlemeler bölgedeki ilan ve fiili satış emsal verilerinin istatistiksel regresyon analizi ile hesaplanır. <br><br>
                        - Bina yaşı aşınma yıpranma payı (depreciation) katsayısı olarak yıllık %1.5 oranında değer kaybı olarak yansıtılmaktadır. <br><br>
                        - Sosyal imkanlar, sitenin markası ve metroya yakınlık rayici yukarı taşıyan önemli çarpanlardır.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    calcEstateVal() {
        const area = parseFloat(document.getElementById('valArea').value) || 0;
        const age = parseFloat(document.getElementById('valAge').value) || 0;
        const regCoef = parseFloat(document.getElementById('valRegion').value) || 1.0;
        const rooms = parseInt(document.getElementById('valRooms').value) || 1;
        const facadeCoef = parseFloat(document.getElementById('valFacade').value) || 1.0;

        // Base price standard in metropolitan is 35,000 TL per m2
        let baseSqRate = 35000 * regCoef;
        
        // Age depreciation
        baseSqRate = baseSqRate * (1 - (age * 0.015));
        if (baseSqRate < 15000) baseSqRate = 15000; // minimum rate floor

        // Room additions
        const roomBonus = (rooms - 1) * 350000;
        
        let totalVal = (area * baseSqRate) + roomBonus;
        totalVal = totalVal * facadeCoef;

        document.getElementById('liveValSquarePrice').textContent = `${baseSqRate.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL/m²`;
        document.getElementById('liveValGrandTotal').textContent = `${totalVal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺`;
    },

    // 2. Arsa Değerleme (Land Appraisal)
    renderLandValuation(container) {
        window.BrenerApp.updateTopbarTitle('Arsa Değerleme Modülü', 'İmar Yapılaşma Haklarına Göre Arsa Ekspertiz Analizi');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Arsa Değer Tahmincisi</h2>
                    </div>
                    <div class="form-group">
                        <label>Arsa Alanı ($m^2$)</label>
                        <input type="number" id="landValArea" value="1500" oninput="window.BrenerApp.Degerleme.calcLandVal()">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>İmar Emsali (KAKS)</label>
                            <input type="number" id="landValEmsal" value="1.5" step="0.1" oninput="window.BrenerApp.Degerleme.calcLandVal()">
                        </div>
                        <div class="form-group">
                            <label>Bölge Rayiç Bedeli ($TL/m^2$)</label>
                            <input type="number" id="landValRayic" value="18000" oninput="window.BrenerApp.Degerleme.calcLandVal()">
                        </div>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h4 style="font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">Arsa Analiz Özeti</h4>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Maksimum İnşaat Alanı (Satılabilir):</span>
                            <span id="landValBuildArea">2,250 m²</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 700; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px; color: var(--primary);">
                            <span>Arsa Toplam Değeri:</span>
                            <span id="landValTotal">27,000,000.00 ₺</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.showToast('success', 'Arsa İmar ekspertizi dosyası oluşturuldu.')">Değerleme Raporunu İndir</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Arsa Değer Faktörleri</h2>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-muted);">
                        Arsa değerinde en önemli unsur fiziki alan değil, üzerindeki imar hakkıdır. Emsali 0.30 olan bir arsa ile emsali 2.0 olan arsa arasında yapılaşma kapasitesi farkından dolayı 6-7 kat fiyat farkı olması doğaldır.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    calcLandVal() {
        const area = parseFloat(document.getElementById('landValArea').value) || 0;
        const emsal = parseFloat(document.getElementById('landValEmsal').value) || 0;
        const rayic = parseFloat(document.getElementById('landValRayic').value) || 0;

        const buildArea = area * emsal;
        const total = area * rayic;

        document.getElementById('landValBuildArea').textContent = `${buildArea.toLocaleString('tr-TR')} m²`;
        document.getElementById('landValTotal').textContent = `${total.toLocaleString('tr-TR')} ₺`;
    },

    // 3. Emlak Takip (Portfolio)
    renderPortfolio(container) {
        window.BrenerApp.updateTopbarTitle('Emlak Portföy Takibi', 'Satılık ve Kiralık Daire/Arsa Portföy Havuzu');

        let html = `
            <div class="card">
                <div class="card-header" style="margin-bottom: 20px;">
                    <h2>Aktif Satış & Kiralama Portföyü</h2>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Portföy No</th>
                                <th>Tip / İlan</th>
                                <th>Konum</th>
                                <th>Daire Bilgisi</th>
                                <th>Fiyat</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>BRN-501</strong></td>
                                <td><span class="badge badge-success">Satılık Daire</span></td>
                                <td>Bodrum Port Konakları A-4</td>
                                <td>3+1, 150m²</td>
                                <td><strong>12,500,000 ₺</strong></td>
                                <td><span class="badge badge-info">Satışta</span></td>
                            </tr>
                            <tr>
                                <td><strong>BRN-502</strong></td>
                                <td><span class="badge badge-success">Satılık Daire</span></td>
                                <td>Brener Plaza Ofis No: 18</td>
                                <td>Ofis, 95m²</td>
                                <td><strong>7,800,000 ₺</strong></td>
                                <td><span class="badge badge-info">Satışta</span></td>
                            </tr>
                            <tr>
                                <td><strong>BRN-503</strong></td>
                                <td><span class="badge badge-warning">Kiralık Ofis</span></td>
                                <td>Brener Plaza Ofis No: 22</td>
                                <td>Ofis, 120m²</td>
                                <td><strong>45,000 ₺ / Ay</strong></td>
                                <td><span class="badge badge-success">Kiralandı</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    // 4. Emsal Karşılaştırma (CMA Table)
    renderCma(container) {
        window.BrenerApp.updateTopbarTitle('Emsal Karşılaştırma Analizi', 'Seçilen Mülklerin Yan Yana Özellik Karşılaştırması');

        let html = `
            <div class="card">
                <div class="card-header" style="margin-bottom: 20px;">
                    <h2>CMA (Comparable Market Analysis) Tablosu</h2>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Kriter / Özellik</th>
                                <th style="color: var(--primary);">Hedef Mülk (Brener Port)</th>
                                <th>Emsal 1 (Bodrum Suite)</th>
                                <th>Emsal 2 (Sahil Villaları)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>İstenen Satış Fiyatı</strong></td>
                                <td style="font-weight: 700; color: var(--primary);">12,500,000 ₺</td>
                                <td>11,900,000 ₺</td>
                                <td>14,200,000 ₺</td>
                            </tr>
                            <tr>
                                <td><strong>Brüt Alan (m²)</strong></td>
                                <td>150 m²</td>
                                <td>135 m²</td>
                                <td>170 m²</td>
                            </tr>
                            <tr>
                                <td><strong>Birim m² Fiyatı</strong></td>
                                <td>83,300 TL/m²</td>
                                <td>88,140 TL/m²</td>
                                <td>83,500 TL/m²</td>
                            </tr>
                            <tr>
                                <td><strong>Bina Yaşı</strong></td>
                                <td>Sıfır Yapı (Yeni)</td>
                                <td>3 Yıllık</td>
                                <td>5 Yıllık</td>
                            </tr>
                            <tr>
                                <td><strong>Havuz / Sosyal Alan</strong></td>
                                <td>Mevcut (Ortak)</td>
                                <td>Mevcut (Ortak)</td>
                                <td>Özel Havuz</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    // 5. Bölge Analizi (Regional Data)
    renderRegion(container) {
        window.BrenerApp.updateTopbarTitle('Bölge Yatırım & Trend Analizi', 'Bodrum ve İstanbul Bölgesel Amortisman Trendleri');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Fiyat Değişim Endeksi (Son 1 Yıl)</h2>
                    </div>
                    <div class="chart-container" style="width: 100%; height: 180px; margin-top: 10px;">
                        <svg viewBox="0 0 300 120" style="width: 100%; height: 100%;">
                            <line x1="20" y1="20" x2="280" y2="20" stroke="var(--border-color)" stroke-dasharray="2,2"/>
                            <line x1="20" y1="60" x2="280" y2="60" stroke="var(--border-color)" stroke-dasharray="2,2"/>
                            <line x1="20" y1="100" x2="280" y2="100" stroke="var(--border-color)"/>
                            <!-- Bodrum inflation slope -->
                            <polyline fill="none" stroke="var(--primary)" stroke-width="2.5" points="20,95 70,85 120,60 170,45 220,35 270,15"/>
                            <circle cx="270" cy="15" r="3.5" fill="var(--primary)"/>
                            <text x="275" y="15" fill="var(--primary)" font-size="6">Bodrum (+%65)</text>
                        </svg>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Bölge Sosyo-Demografik Özet</h2>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-muted);">
                        - Amortisman Süresi (Bodrum): 18-20 Yıl <br><br>
                        - Gelir Düzeyi Sınıfı: A+ / A <br><br>
                        - Son 12 ayda m² satış fiyatları Bodrum genelinde %65 artış göstererek en karlı yazlık lokasyon endeksine yerleşmiştir.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    // 6. Komisyon & Vergi (Commission & Tax Calculator)
    renderTaxCalc(container) {
        window.BrenerApp.updateTopbarTitle('Komisyon & Tapu Vergisi', 'Alım/Satım Masrafları ve Tapu Harcı Hesaplama Modülü');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Satış Giderleri Hesaplayıcı</h2>
                    </div>
                    <div class="form-group">
                        <label>Gayrimenkul Beyan Değeri (TL)</label>
                        <input type="number" id="taxSalesPrice" value="5000000" oninput="window.BrenerApp.Degerleme.calcTaxes()">
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h4 style="font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">Tapu & Komisyon Dağılımı</h4>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Alıcı Tapu Harcı (%2):</span>
                            <span id="taxBuyerHarc">100,000.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Satıcı Tapu Harcı (%2):</span>
                            <span id="taxSellerHarc">100,000.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; color: var(--primary);">
                            <span>Emlak Acentesi Komisyonu (KDV Hariç %2):</span>
                            <span id="taxAgency">100,000.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px; color: var(--danger);">
                            <span>Toplam Ek Gider Havuzu:</span>
                            <span id="taxTotal">300,000.00 ₺</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.showToast('success', 'Masraf döküm tablosu PDF basıldı.')">Masraf Raporu Çıkar</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Yasal Dayanaklar</h2>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-muted);">
                        - Tapu harcı, mülk alım satımlarında beyan edilen rayiç değer üzerinden hem alıcıdan hem satıcıdan ayrı ayrı %2 (toplamda %4) oranında tahsil edilir. <br><br>
                        - Emlak komisyonu Taşınmaz Ticareti Yönetmeliği uyarınca taraflardan maksimum %2'şer oranında alınabilir.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    calcTaxes() {
        const price = parseFloat(document.getElementById('taxSalesPrice').value) || 0;
        
        const harc = price * 0.02;
        const agency = price * 0.02;
        const total = (harc * 2) + agency;

        document.getElementById('taxBuyerHarc').textContent = `${harc.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('taxSellerHarc').textContent = `${harc.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('taxAgency').textContent = `${agency.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('taxTotal').textContent = `${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
    },

    // 7. Kira & Dilekçe Asistanı (Rent Calculator / Generator)
    renderRentAssistant(container) {
        window.BrenerApp.updateTopbarTitle('Kira & Dilekçe Asistanı', 'TÜFE Kira Artışı ve Tahliye Dilekçe Şablonları');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Kira Artış Oranı Hesaplayıcı</h2>
                    </div>
                    <div class="form-group">
                        <label>Mevcut Aylık Kira Bedeli (TL)</label>
                        <input type="number" id="rentCurrent" value="20000" oninput="window.BrenerApp.Degerleme.calcRentIncrease()">
                    </div>
                    <div class="form-group">
                        <label>Yasal TÜFE Artış Endeksi (%)</label>
                        <input type="number" id="rentTufe" value="62.5" step="0.1" oninput="window.BrenerApp.Degerleme.calcRentIncrease()">
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h4 style="font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">Kira Artış Sonucu</h4>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Kira Artış Miktarı:</span>
                            <span id="rentIncreaseVal">12,500.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px; color: var(--success);">
                            <span>Yeni Aylık Kira Bedeli:</span>
                            <span id="rentNewVal">32,500.00 ₺</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" id="genRentNoticeBtn">Kira Artış İhbarnamesi Yazdır</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Tahliye Taahhütnamesi Hazırla</h2>
                    </div>
                    <div class="form-group">
                        <label>Kiracı Adı</label>
                        <input type="text" id="tenantName" placeholder="Örn: Hasan Kaya">
                    </div>
                    <button class="btn btn-secondary" style="width: 100%;" id="genEvictionNoticeBtn">Tahliye Taahhütnamesi Üret</button>
                </div>
            </div>
        `;
        container.innerHTML = html;

        document.getElementById('genRentNoticeBtn').onclick = () => {
            const rentCur = parseFloat(document.getElementById('rentCurrent').value);
            const tufe = parseFloat(document.getElementById('rentTufe').value);
            const newVal = rentCur * (1 + (tufe / 100));

            const noticeHtml = `
                <div style="background: var(--bg-main); border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; font-family: monospace; font-size: 0.85rem; line-height: 1.6;">
                    <strong>KİRA ARTIŞ İHBARNAMESİ</strong><br><br>
                    <strong>Muhatap Kiracı:</strong> Sayın Kiracı <br>
                    <strong>Konu:</strong> Borçlar Kanunu Madde 344 uyarınca TÜFE kira artışı bildirimi. <br><br>
                    Mevcut aylık kira bedeliniz olan ${rentCur.toLocaleString('tr-TR')} TL tutarı, 12 aylık TÜFE ortalaması olan %${tufe} oranında artırılarak yeni kira döneminde aylık <strong>${newVal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL</strong> olarak güncellenmiştir. Ödemelerinizin yeni tutar üzerinden yapılması rica olunur.
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="window.BrenerApp.showToast('success', 'İhbarname PDF olarak basıldı.')">PDF İndir</button>
            `;
            window.BrenerApp.openModal('Kira İhbarnamesi Şablonu', noticeHtml);
        };

        document.getElementById('genEvictionNoticeBtn').onclick = () => {
            const tenant = document.getElementById('tenantName').value.trim() || 'Hasan Kaya';
            const noticeHtml = `
                <div style="background: var(--bg-main); border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; font-family: monospace; font-size: 0.85rem; line-height: 1.6;">
                    <strong>TAHLİYE TAAHHÜTNAMESİ</strong><br><br>
                    Kiracısı olduğum arsa/gayrimenkulü, mülk sahibinin hiçbir ihtar ve hüküm almasına gerek kalmaksızın, karşılıklı serbest irademizle kararlaştırılan tahliye tarihinde boşaltmayı, aksi halde doğacak tüm masrafları üstlenmeyi kayıtsız şartsız taahhüt ederim.<br><br>
                    <strong>Taahhüt Eden Kiracı:</strong> ${tenant} <br>
                    <strong>İmza Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="window.BrenerApp.showToast('success', 'Tahliye taahhütnamesi imzalandı.')">Taahhütnameyi Yazdır</button>
            `;
            window.BrenerApp.openModal('Tahliye Taahhütnamesi', noticeHtml);
        };
    },

    calcRentIncrease() {
        const rentCur = parseFloat(document.getElementById('rentCurrent').value) || 0;
        const tufe = parseFloat(document.getElementById('rentTufe').value) || 0;

        const inc = rentCur * (tufe / 100);
        const newVal = rentCur + inc;

        document.getElementById('rentIncreaseVal').textContent = `${inc.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('rentNewVal').textContent = `${newVal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
    },

    renderSektorRadari(container) {
        window.BrenerApp.updateTopbarTitle('Sektör Radarı', 'Türkiye genelinde güncel inşaat projeleri ve kamu ihaleleri');

        // Initial last update state
        let lastUpdatedMinutes = 17 * 24 * 60; // 17 days in minutes

        const getFormattedLastUpdateText = (min) => {
            if (min === 0) return 'Son güncelleme: Şimdi';
            const days = Math.floor(min / (24 * 60));
            if (days > 0) return `Son güncelleme: ${days} gün önce`;
            const hours = Math.floor(min / 60);
            if (hours > 0) return `Son güncelleme: ${hours} saat önce`;
            return `Son güncelleme: ${min} dakika önce`;
        };

        const mockProjects = [
            {
                source: 'TOKİ Projesi',
                status: 'İhale Sürecinde',
                category: 'Konut',
                title: 'Rize İli Hemşin İlçesi Kentsel Dönüşüm ve Gelişim Projesi 2. Etap 47 Adet Konut ve 8 Adet Dükkan İnşaatları ile Altyapı ve Çevre Düzenlemesi İşi',
                subtext: 'TOKİ Toplu Konut / İhale Projesi. Tarih: 13 Temmuz 2026 11:00',
                location: 'Rize',
                authority: 'T.C. TOPLU KONUT İDARESİ BAŞKANLIĞI (TOKİ)',
                date: '13 Tem 2026',
                link: 'https://www.toki.gov.tr/ihale-tarihleri'
            },
            {
                source: 'TOKİ Projesi',
                status: 'İhale Sürecinde',
                category: 'Konut',
                title: 'Sakarya İli, Adapazarı İlçesi, Sakarya Büyükşehir Belediyesi Hizmet Binası İnşaatı ile Altyapı ve Çevre Düzenlemesi İşi',
                subtext: 'TOKİ Toplu Konut / İhale Projesi. Tarih: 30 Haziran 2026 11:00',
                location: 'Sakarya',
                authority: 'T.C. TOPLU KONUT İDARESİ BAŞKANLIĞI (TOKİ)',
                date: '30 Haz 2026',
                link: 'https://www.toki.gov.tr/ihale-tarihleri'
            },
            {
                source: 'Kamu İhalesi (EKAP)',
                status: 'Teklif Aşamasında',
                category: 'Altyapı',
                title: 'Trabzon İli Ortahisar İlçesi Yağmursuyu ve Kanalizasyon Şebeke Hattı Genişletilmesi İnşaat İşi',
                subtext: 'Trabzon İçme Suyu ve Kanalizasyon İdaresi (TİSKİ) İhale İlanı',
                location: 'Trabzon',
                authority: 'TİSKİ GENEL MÜDÜRLÜĞÜ',
                date: '20 Tem 2026',
                link: 'https://ekap.kik.gov.tr'
            },
            {
                source: 'ÇED Duyurusu',
                status: 'ÇED Olumlu',
                category: 'Sanayi',
                title: 'Kocaeli Dilovası Organize Sanayi Bölgesi Metal Geri Kazanım ve İleri Material Üretim Tesisi Kapasite Artışı Projesi',
                subtext: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı ÇED Duyurusu',
                location: 'Kocaeli',
                authority: 'ÇEVRE, ŞEHİRCİLİK VE İKLİM DEĞİŞİKLİĞİ BAKANLIĞI',
                date: '12 Tem 2026',
                link: 'https://ced.csb.gov.tr'
            },
            {
                source: 'Belediye / Basın İlan (ilan.gov.tr)',
                status: 'İlan Sürecinde',
                category: 'Sosyal Tesis',
                title: 'Ankara Çankaya Belediyesi Kültür Merkezi ve Semt Evi Kaba İnşaat Yapım İşi İlanı',
                subtext: 'Çankaya Belediye Başkanlığı Destek Hizmetleri Md.',
                location: 'Ankara',
                authority: 'ÇANKAYA BELEDİYE BAŞKANLIĞI',
                date: '08 Tem 2026',
                link: 'https://www.ilan.gov.tr'
            },
            {
                source: 'İstanbul Büyükşehir Bld.',
                status: 'Değerlendirmede',
                category: 'Ulaşım',
                title: 'Kadıköy-Söğütlüçeşme Üsküdar-Harem Nostaljik Tramvay Hattı Altyapı ve Ray Döşeme İşleri Yapımı',
                subtext: 'İBB Raylı Sistem Daire Başkanlığı Raylı Sistem Projeler Md.',
                location: 'İstanbul',
                authority: 'İSTANBUL BÜYÜKŞEHİR BELEDİYE BAŞKANLIĞI (İBB)',
                date: '25 Tem 2026',
                link: 'https://www.ibb.istanbul'
            }
        ];

        let html = `
            <style>
                .radar-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                    transition: all 0.2s;
                }
                .source-badge {
                    font-size: 0.72rem;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-weight: bold;
                    display: inline-block;
                }
                .source-toki { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .source-ekap { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .source-ced { background: rgba(249, 115, 22, 0.1); color: #f97316; }
                .source-ilan { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
                .source-ibb { background: rgba(99, 102, 241, 0.1); color: #6366f1; }

                .status-badge {
                    font-size: 0.72rem;
                    padding: 4px 8px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    display: inline-block;
                }
                .cat-badge {
                    font-size: 0.72rem;
                    padding: 4px 8px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    color: var(--text-main);
                    display: inline-block;
                }
                .radar-item-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 16px;
                    position: relative;
                    transition: all 0.2s;
                }
                .radar-item-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .copilot-banner {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
                    border: 1px solid rgba(139, 92, 246, 0.15);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                .tab-pill {
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .tab-pill.active {
                    background: #1e293b;
                    color: white;
                    border-color: #1e293b;
                }
            </style>

            <!-- Top Banner Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 2.2rem;">🌐</div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Sektör Radarı</h2>
                        <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-muted);">Türkiye genelinde güncel inşaat projeleri ve kamu ihaleleri</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span id="radarLastUpdatedLabel" style="font-size: 0.8rem; color: var(--text-muted);">${getFormattedLastUpdateText(lastUpdatedMinutes)}</span>
                    <button class="btn btn-primary" id="btnUpdateRadarNow" style="background: #10b981; border: none; font-weight: 700; color: white; display: flex; align-items: center; gap: 6px;">
                        🔄 Şimdi Güncelle
                    </button>
                </div>
            </div>

            <!-- Top 4 Cards Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1.2fr; gap: 16px; margin-bottom: 24px;">
                <div class="radar-card" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Toplam Proje</div>
                        <strong style="font-size: 1.8rem; display: block; margin-top: 6px; color: var(--text-main);">63</strong>
                        <span style="font-size: 0.72rem; color: var(--text-muted);">Tüm kaynaklardan</span>
                    </div>
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">🏢</div>
                </div>

                <div class="radar-card" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Bu Hafta</div>
                        <strong style="font-size: 1.8rem; display: block; margin-top: 6px; color: var(--text-main);">0</strong>
                        <span style="font-size: 0.72rem; color: #10b981; font-weight: 600;">+ yeni eklenen</span>
                    </div>
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(59, 130, 246, 0.1); color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">📈</div>
                </div>

                <div class="radar-card" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase;">Veri Kaynağı</div>
                        <strong style="font-size: 1.8rem; display: block; margin-top: 6px; color: var(--text-main);">5</strong>
                        <span style="font-size: 0.72rem; color: var(--text-muted);">Aktif kaynak</span>
                    </div>
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">🌐</div>
                </div>

                <div class="radar-card" style="padding: 14px 20px;">
                    <div style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; font-weight: bold;">Kaynak Dağılımı ℹ</div>
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.74rem;">
                        <div style="display: flex; justify-content: space-between;"><span>ÇED Duyurusu</span><strong style="color: #f97316;">20</strong></div>
                        <div style="display: flex; justify-content: space-between;"><span>Kamu İhalesi (EKAP)</span><strong style="color: #3b82f6;">12</strong></div>
                        <div style="display: flex; justify-content: space-between;"><span>Belediye / Basın İlan</span><strong style="color: #06b6d4;">5</strong></div>
                        <div style="display: flex; justify-content: space-between;"><span>İstanbul Büyükşehir Bld.</span><strong style="color: #6366f1;">4</strong></div>
                        <div style="display: flex; justify-content: space-between;"><span>TOKİ Projesi</span><strong style="color: #10b981;">22</strong></div>
                    </div>
                </div>
            </div>

            <!-- AI Market Copilot Banner -->
            <div class="copilot-banner">
                <div style="max-width: 70%;">
                    <h3 style="margin: 0; font-size: 1rem; color: #8b5cf6; display: flex; align-items: center; gap: 6px;">✨ AI Sektör Ortağı (Market Copilot)</h3>
                    <p style="margin: 6px 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">
                        Veritabanındaki son ihaleleri, kamu yatırımlarını ve ÇED duyurularını analiz ederek anında pazar trend raporları, bölgesel fırsatlar ve SEO içerik fikirleri üretin.
                    </p>
                </div>
                <button class="btn btn-primary" id="btnSektorRadarAiAnalyze" style="background: #8b5cf6; border: none; color: white; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    🔮 Pazar Fırsatlarını Analiz Et
                </button>
            </div>

            <!-- Source Filters Tab Pills -->
            <div style="display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap;">
                <div class="tab-pill active" data-source="Tüm Kaynaklar">Tüm Kaynaklar</div>
                <div class="tab-pill" data-source="ÇED Duyurusu">ÇED Duyurusu</div>
                <div class="tab-pill" data-source="TOKİ Projesi">TOKİ Projesi</div>
                <div class="tab-pill" data-source="Kamu İhalesi (EKAP)">Kamu İhalesi (EKAP)</div>
                <div class="tab-pill" data-source="Belediye / Basın İlan (ilan.gov.tr)">Belediye / Basın İlan (ilan.gov.tr)</div>
                <div class="tab-pill" data-source="İstanbul Büyükşehir Bld.">İstanbul Büyükşehir Bld.</div>
            </div>

            <!-- Search & Filters Row -->
            <div class="card" style="padding: 16px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center;">
                <div style="position: relative; width: 100%;">
                    <input type="text" id="searchRadarInput" placeholder="Proje adı, firma veya il ara..." style="width: 100%; padding: 10px 10px 10px 36px;">
                    <span style="position: absolute; left: 12px; top: 11px; color: var(--text-muted);">🔍</span>
                </div>
                <button class="btn btn-secondary" style="padding: 10px 20px; display: flex; align-items: center; gap: 6px;">
                    ⚙ Filtreler
                </button>
                <button class="btn btn-primary" id="btnSearchRadarSubmit" style="background: #059669; border: none; color: white; font-weight: bold; padding: 10px 24px; display: flex; align-items: center; gap: 6px;">
                    🔍 Ara
                </button>
            </div>

            <!-- Results Section List -->
            <div id="radarResultsList">
                <!-- Items rendered dynamically -->
            </div>
        `;

        container.innerHTML = html;

        // Source Styles Mapping
        const sourceStyles = {
            'TOKİ Projesi': 'source-toki',
            'Kamu İhalesi (EKAP)': 'source-ekap',
            'ÇED Duyurusu': 'source-ced',
            'Belediye / Basın İlan (ilan.gov.tr)': 'source-ilan',
            'İstanbul Büyükşehir Bld.': 'source-ibb'
        };

        const renderRadarItems = (items) => {
            const resultsContainer = document.getElementById('radarResultsList');
            if (!resultsContainer) return;

            if (items.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="card" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        Aradığınız kriterlere uygun güncel proje ihalesi veya ÇED duyurusu bulunamadı.
                    </div>
                `;
                return;
            }

            resultsContainer.innerHTML = items.map(p => {
                const srcStyle = sourceStyles[p.source] || '';
                return `
                    <div class="radar-item-card">
                        <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                            <span class="source-badge ${srcStyle}">${p.source}</span>
                            <span class="status-badge">${p.status}</span>
                            <span class="cat-badge">${p.category}</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 8px 0; font-size: 0.95rem; font-weight: 700; line-height: 1.5; color: var(--text-main);">
                                    ${p.title}
                                </h4>
                                <span style="font-size: 0.74rem; color: var(--text-muted); display: block; margin-bottom: 12px;">
                                    ${p.subtext}
                                </span>
                                
                                <div style="display: flex; gap: 16px; font-size: 0.74rem; color: var(--text-muted); flex-wrap: wrap;">
                                    <span>📍 ${p.location}</span>
                                    <span>🏢 ${p.authority}</span>
                                    <span>📅 ${p.date}</span>
                                </div>
                            </div>
                            
                            <a href="${p.link}" target="_blank" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px; text-decoration: none; padding: 6px 12px; font-size: 0.72rem; white-space: nowrap;">
                                🚀 Kaynağa Git
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
        };

        // Render initial data list
        renderRadarItems(mockProjects);

        // Dynamic Filtering
        const searchInput = document.getElementById('searchRadarInput');
        const searchBtn = document.getElementById('btnSearchRadarSubmit');
        const tabPills = container.querySelectorAll('.tab-pill');
        let activeFilterSource = 'Tüm Kaynaklar';

        const runFilter = () => {
            const query = searchInput.value.toLowerCase().trim();
            const filtered = mockProjects.filter(p => {
                const matchesSearch = p.title.toLowerCase().includes(query) || p.location.toLowerCase().includes(query) || p.authority.toLowerCase().includes(query);
                const matchesSource = activeFilterSource === 'Tüm Kaynaklar' || p.source === activeFilterSource;
                return matchesSearch && matchesSource;
            });
            renderRadarItems(filtered);
        };

        // Tab Pill Click Handler
        tabPills.forEach(pill => {
            pill.onclick = () => {
                tabPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                activeFilterSource = pill.getAttribute('data-source');
                runFilter();
            };
        });

        searchBtn.onclick = runFilter;
        searchInput.onkeydown = (e) => {
            if (e.key === 'Enter') runFilter();
        };

        // Update Radar Now Button
        document.getElementById('btnUpdateRadarNow').onclick = () => {
            lastUpdatedMinutes = 0;
            document.getElementById('radarLastUpdatedLabel').textContent = getFormattedLastUpdateText(lastUpdatedMinutes);
            window.BrenerApp.showToast('success', 'Sektör Radarı verileri ihaleler ve ÇED duyurularıyla anlık senkronize edildi!');
            window.BrenerApp.logActivity('degerleme', 'Sektör Radarı verileri güncellendi.', 'success');
        };

        // AI Market Copilot Report Modal
        document.getElementById('btnSektorRadarAiAnalyze').onclick = () => {
            const reportHtml = `
                <div style="padding: 20px; font-size: 0.88rem; display: flex; flex-direction: column; gap: 16px;">
                    <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.15)); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 8px; padding: 14px; border-left: 4px solid #8b5cf6;">
                        <strong style="color: #8b5cf6; display: block; margin-bottom: 4px;">🎯 AI Copilot Özet Raporu: Haftalık Fırsatlar</strong>
                        Rize ve Sakarya'da 2 adet büyük kamu/TOKİ yatırımı ihale ilan aşamasında. Kentsel dönüşüm kapsamında malzeme tedariki ve alt yüklenici fırsatları %35 oranında artış gösterdi.
                    </div>
                    
                    <div>
                        <strong style="display: block; margin-bottom: 6px;">💡 Bölgesel Pazar Fırsatları:</strong>
                        <ol style="margin: 0; padding-left: 20px; line-height: 1.5;">
                            <li><strong>Rize Hemşin (Konut & Ticari):</strong> 47 Konut ve 8 dükkan projesi için kaba inşaat demiri ve beton tedarik lojistiği fırsatı.</li>
                            <li><strong>Sakarya Hizmet Binası:</strong> Belediye hizmet binası ince inşaat ve elektromekanik taahhüt işleri.</li>
                            <li><strong>Kocaeli Dilovası OSB:</strong> Sanayi tesislerinde ÇED olumlu raporları sonrası metal geri kazanım tesisi altyapı iş kalemleri.</li>
                        </ol>
                    </div>

                    <div>
                        <strong style="display: block; margin-bottom: 6px;">📈 SEO & Blog İçerik Fikirleri:</strong>
                        <ul style="margin: 0; padding-left: 20px; line-height: 1.5;">
                            <li>"Kentsel Dönüşüm Projelerinde Doğru Taşeron ve Tedarik Zinciri Seçimi"</li>
                            <li>"Sakarya ve Rize Yeni Kamu Yatırımlarının Yerel İnşaat Sektörüne Etkisi"</li>
                        </ul>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 10px;">
                        <span style="font-size: 0.72rem; color: var(--text-muted);">Analiz Tarihi: Bugün</span>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-secondary" onclick="window.BrenerApp.closeModal()">Kapat</button>
                            <button class="btn btn-primary" style="background:#8b5cf6; border:none; color:white;" onclick="window.BrenerApp.closeModal(); window.BrenerApp.showToast('success', 'Rapor PDF olarak indirildi.');">Raporu İndir</button>
                        </div>
                    </div>
                </div>
            `;
            window.BrenerApp.openModal('🔮 AI Sektör Ortağı Analiz Raporu', reportHtml);
        };
    },
        };
