/* ==========================================================================
   BRENER GROUP - CIVIL ENGINEERING & ZONING CALCULATORS MODULE (HESAPLAMA ARAÇLARI)
   ========================================================================== */

window.BrenerApp.Hesaplama = {
    render(view, container) {
        const activeProj = window.BrenerApp.getActiveProject();

        if (view === 'maliyet-hesapla') {
            this.renderCostCalc(container);
        } else if (view === 'tadilat-hesabi') {
            this.renderRenovationCalc(container);
        } else if (view === 'arsa-payi') {
            this.renderLandShareCalc(container);
        } else if (view === 'mimari-yonetmelik') {
            this.renderRules(container);
        } else if (view === 'harita-imar') {
            this.renderZoningCalc(container);
        } else if (view === 'metraj-malzeme') {
            this.renderTakeoffCalc(container);
        } else if (view === 'anlik-fiyatlar') {
            this.renderPrices(container);
        }
    },

    // 1. Maliyet Hesapla (Building Cost Estimator)
    renderCostCalc(container) {
        window.BrenerApp.updateTopbarTitle('İnşaat Maliyet Tahmincisi', 'Yapı Sınıfı ve Alan Parametrelerine Göre Maliyet Çıkarıcı');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Maliyet Hesap Parametreleri</h2>
                    </div>
                    <div class="form-group">
                        <label>Toplam İnşaat Alanı (m²)</label>
                        <input type="number" id="costArea" value="2000" oninput="window.BrenerApp.Hesaplama.calcBuildingCost()">
                    </div>
                    <div class="form-group">
                        <label>Yapı Sınıfı / Kalitesi</label>
                        <select id="costQuality" onchange="window.BrenerApp.Hesaplama.calcBuildingCost()">
                            <option value="luxury">Lüks Sınıf Konut (Vurgulu) - 22,000 TL/m²</option>
                            <option value="class1" selected>1. Sınıf Apartman - 16,500 TL/m²</option>
                            <option value="class2">2. Sınıf Yapı / Standart - 12,000 TL/m²</option>
                            <option value="villa">Lüks Villa / Müstakil - 25,000 TL/m²</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Temel Tipi</label>
                        <select id="costFoundation" onchange="window.BrenerApp.Hesaplama.calcBuildingCost()">
                            <option value="radye">Radye Temel (Güçlendirilmiş) - Standart</option>
                            <option value="tekil">Tekil / Sürekli Temel - %5 Tasarruflu</option>
                        </select>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h4 style="font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">Maliyet Dağılım Tahmini</h4>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Kaba İnşaat (%40):</span>
                            <span id="costKaba">13,200,000.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>İnce İşçilik & Bitirme (%45):</span>
                            <span id="costInce">14,850,000.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Mekanik & Elektrik (%15):</span>
                            <span id="costMek">4,950,000.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px; color: var(--primary);">
                            <span>Toplam Yaklaşık Maliyet:</span>
                            <span id="costTotal">33,000,000.00 ₺</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.showToast('success', 'Maliyet Analiz Raporu PDF formatında indirildi.')">Raporu PDF Olarak Al</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Maliyet Değişkenleri Rehberi</h2>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-muted);">
                        - Hesaplanan maliyetler, Türkiye Çevre, Şehircilik ve İklim Değişikliği Bakanlığı'nın yayınladığı yaklaşık yapı birim maliyet tebliğleri ve piyasa reel veri katsayıları harmanlanarak formüle edilmiştir. <br><br>
                        - Şantiyenin bulunduğu il/ilçe zemin yapısı, hafriyat nakliye mesafeleri, demir ve beton tedarik navlun maliyetleri nihai maliyeti %10-%15 oranında dalgalandırabilir.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    calcBuildingCost() {
        const area = parseFloat(document.getElementById('costArea').value) || 0;
        const quality = document.getElementById('costQuality').value;
        const foundation = document.getElementById('costFoundation').value;

        let unitRate = 16500;
        if (quality === 'luxury') unitRate = 22000;
        else if (quality === 'class2') unitRate = 12000;
        else if (quality === 'villa') unitRate = 25000;

        let total = area * unitRate;
        if (foundation === 'tekil') {
            total = total * 0.95; // 5% discount
        }

        const kaba = total * 0.40;
        const ince = total * 0.45;
        const mek = total * 0.15;

        document.getElementById('costKaba').textContent = `${kaba.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('costInce').textContent = `${ince.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('costMek').textContent = `${mek.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('costTotal').textContent = `${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
    },

    // 2. Tadilat Hesabı (Renovation Estimator)
    renderRenovationCalc(container) {
        window.BrenerApp.updateTopbarTitle('Tadilat & Dekorasyon Maliyeti', 'Boya, Seramik, Asma Tavan ve Parke Alan Hesapları');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Tadilat Metraj Alanları</h2>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Duvar Boyama Alanı (m²)</label>
                            <input type="number" id="renPaint" value="120" oninput="window.BrenerApp.Hesaplama.calcRenovation()">
                        </div>
                        <div class="form-group">
                            <label>Parke Döşeme Alanı (m²)</label>
                            <input type="number" id="renFloor" value="60" oninput="window.BrenerApp.Hesaplama.calcRenovation()">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Seramik / Fayans Alanı (m²)</label>
                            <input type="number" id="renCeramic" value="30" oninput="window.BrenerApp.Hesaplama.calcRenovation()">
                        </div>
                        <div class="form-group">
                            <label>Alçıpan / Asma Tavan (m²)</label>
                            <input type="number" id="renCeil" value="65" oninput="window.BrenerApp.Hesaplama.calcRenovation()">
                        </div>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h4 style="font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">Tadilat Kalemleri Tahmini (TL)</h4>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Boya (Malzeme + İşçilik @140 TL/m²):</span>
                            <span id="renPaintTotal">16,800.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Parke Döşeme (Malzeme + İşçilik @450 TL/m²):</span>
                            <span id="renFloorTotal">27,000.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Seramik Kaplama (İşçilikli @600 TL/m²):</span>
                            <span id="renCeramicTotal">18,000.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Asma Tavan (Asma + Alçı @380 TL/m²):</span>
                            <span id="renCeilTotal">24,700.00 ₺</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px; color: var(--success);">
                            <span>Toplam Tadilat Tutarı:</span>
                            <span id="renGrandTotal">86,500.00 ₺</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.showToast('success', 'Tadilat keşif özeti teklife dönüştürüldü.')">Teklif Olarak Yazdır</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Tadilat İpuçları</h2>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-muted);">
                        - Seramik imalatlarında %10, parke imalatlarında ise %7-8 oranında süpürgelik ve firesi kesim payı hesaplanarak malzeme siparişi verilmelidir. <br><br>
                        - Fiyatlar İstanbul/Marmara geneli ortalama işçilik rayiçleridir.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    calcRenovation() {
        const paint = parseFloat(document.getElementById('renPaint').value) || 0;
        const floor = parseFloat(document.getElementById('renFloor').value) || 0;
        const ceramic = document.getElementById('renCeramic').value || 0;
        const ceil = parseFloat(document.getElementById('renCeil').value) || 0;

        const paintT = paint * 140;
        const floorT = floor * 450;
        const ceramicT = ceramic * 600;
        const ceilT = ceil * 380;
        const total = paintT + floorT + ceramicT + ceilT;

        document.getElementById('renPaintTotal').textContent = `${paintT.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('renFloorTotal').textContent = `${floorT.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('renCeramicTotal').textContent = `${ceramicT.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('renCeilTotal').textContent = `${ceilT.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
        document.getElementById('renGrandTotal').textContent = `${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
    },

    // 3. Arsa Payı Hesabı (Land Share Calc)
    renderLandShareCalc(container) {
        window.BrenerApp.updateTopbarTitle('Arsa Payı Hesaplama Robotu', 'Kat Mülkiyeti Kurulumu ve Dönüşüm Hakları Analizi');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Daire Arsa Payı Hesaplayıcı</h2>
                    </div>
                    <div class="form-group">
                        <label>Toplam Arsa Alanı ($m^2$)</label>
                        <input type="number" id="landShareTotalArea" value="1200" oninput="window.BrenerApp.Hesaplama.calcLandShare()">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Dairenin Arsa Payı Pay Değeri (Pay)</label>
                            <input type="number" id="landSharePay" value="45" oninput="window.BrenerApp.Hesaplama.calcLandShare()">
                        </div>
                        <div class="form-group">
                            <label>Toplam Payda Değeri (Payda)</label>
                            <input type="number" id="landSharePayda" value="360" oninput="window.BrenerApp.Hesaplama.calcLandShare()">
                        </div>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h4 style="font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">Hesaplanan Mülkiyet Oranı</h4>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Hisse Oranı:</span>
                            <span id="landShareRatio">12.50 % (1 / 8)</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px; color: var(--primary);">
                            <span>Düşen Net Toprak Payı:</span>
                            <span id="landShareNetArea">150.00 m²</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.showToast('success', 'Arsa Payı tescil belgesi özetlendi.')">Tapu Bilgi Kartı Çıkar</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Hukuki Not</h2>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-muted);">
                        Kentsel dönüşüm sürecinde tapudaki arsa payı esastır. Hatalı belirlenmiş arsa payları (örn: daire büyüklükleri farklı olmasına rağmen eşit arsa payı girilmesi) dava yoluyla düzeltilebilmektedir.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    calcLandShare() {
        const area = parseFloat(document.getElementById('landShareTotalArea').value) || 0;
        const pay = parseFloat(document.getElementById('landSharePay').value) || 0;
        const payda = parseFloat(document.getElementById('landSharePayda').value) || 1;

        const ratio = (pay / payda) * 100;
        const netArea = area * (pay / payda);

        document.getElementById('landShareRatio').textContent = `${ratio.toFixed(2)} % (${pay} / ${payda})`;
        document.getElementById('landShareNetArea').textContent = `${netArea.toFixed(2)} m²`;
    },

    // 4. Mimari Yönetmelik Cheat Sheet
    renderRules(container) {
        window.BrenerApp.updateTopbarTitle('Mimari Yönetmelikler Kılavuzu', 'TAKS, KAKS, Çekme Mesafesi ve Yükseklik Kuralları');

        let html = `
            <div class="card">
                <div class="card-header" style="margin-bottom: 20px;">
                    <h2>İmar ve Mimari Yönetmelik Özet Tablosu</h2>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Kural / Kısaltma</th>
                                <th>Tanım</th>
                                <th>Standart Limit Değerleri</th>
                                <th>Açıklama</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>TAKS</strong></td>
                                <td>Taban Alanı Kat Sayısı</td>
                                <td>0.20 - 0.40</td>
                                <td>Binanın arsada kapladığı maksimum izdüşüm zemin alanıdır.</td>
                            </tr>
                            <tr>
                                <td><strong>KAKS (Emsal)</strong></td>
                                <td>Kat Alanı Kat Sayısı</td>
                                <td>1.00 - 2.50</td>
                                <td>Binanın tüm katlarının toplam inşaat alanının arsa alanına oranı.</td>
                            </tr>
                            <tr>
                                <td><strong>Çekme Mesafesi</strong></td>
                                <td>Yol ve Parsel Sınır Payı</td>
                                <td>Ön: 5m, Yan: 3m</td>
                                <td>Komşu parsel ve imar yollarına bırakılması zorunlu çekme sınırı.</td>
                            </tr>
                            <tr>
                                <td><strong>Gabari (Hmax)</strong></td>
                                <td>Azami Yapı Yüksekliği</td>
                                <td>Belediye İmar Planına Göre</td>
                                <td>Binanın çatı uç noktasına kadar alabileceği maksimum yükseklik.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    // 5. Harita / İmar Hesapları (Zoning Calculations)
    renderZoningCalc(container) {
        window.BrenerApp.updateTopbarTitle('İmar & Parselasyon Hesaplama Modülü', 'Net ve Brüt Parsel Alanı Dönüşümleri (DOP Kesintileri)');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Zoning / İmar Hesaplayıcı</h2>
                    </div>
                    <div class="form-group">
                        <label>Brüt Kadastro Parsel Alanı (m²)</label>
                        <input type="number" id="zoneGross" value="5000" oninput="window.BrenerApp.Hesaplama.calcZoning()">
                    </div>
                    <div class="form-group">
                        <label>Düzenleme Ortaklık Payı (DOP) Oranı (%)</label>
                        <input type="number" id="zoneDop" value="45" min="0" max="45" oninput="window.BrenerApp.Hesaplama.calcZoning()">
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h4 style="font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">İmar Sonuçları</h4>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span>Kamuya Terk Edilen Alan (DOP):</span>
                            <span id="zoneTerk">2,250 m²</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px; color: var(--primary);">
                            <span>Net İmar Parseli Alanı:</span>
                            <span id="zoneNet">2,750 m²</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.showToast('success', 'İmar terki hesap tablosu oluşturuldu.')">İmar Planlama Çıktısı Al</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>DOP Bilgilendirmesi</h2>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-muted);">
                        - İmar Kanunu 18. Madde uygulamalarında, düzenlemeye tabi tutulan yerlerin ihtiyacı olan yol, yeşil alan, okul ve karakol gibi kamu alanları için parsellerden %45'e kadar Düzenleme Ortaklık Payı (DOP) kesilebilmektedir. <br><br>
                        - İmar parseline dönüştükten sonra arsa üzerinde fiilen yapı ruhsatı alma hakkı kazanılır.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    calcZoning() {
        const gross = parseFloat(document.getElementById('zoneGross').value) || 0;
        const dop = parseFloat(document.getElementById('zoneDop').value) || 0;

        const terk = gross * (dop / 100);
        const net = gross - terk;

        document.getElementById('zoneTerk').textContent = `${terk.toLocaleString('tr-TR')} m²`;
        document.getElementById('zoneNet').textContent = `${net.toLocaleString('tr-TR')} m²`;
    },

    // 6. Metraj & Malzeme Listesi (Quantity Takeoff)
    renderTakeoffCalc(container) {
        window.BrenerApp.updateTopbarTitle('Metraj & Donatı Hesaplama Robotu', 'Kolon/Kiriş Ölçüleri ve Donatı Ağırlık Metrajı');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Betonarme Kolon Metraj Tahmincisi</h2>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Kolon Genişliği - A (cm)</label>
                            <input type="number" id="takeoffA" value="40" oninput="window.BrenerApp.Hesaplama.calcTakeoff()">
                        </div>
                        <div class="form-group">
                            <label>Kolon Genişliği - B (cm)</label>
                            <input type="number" id="takeoffB" value="60" oninput="window.BrenerApp.Hesaplama.calcTakeoff()">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Kolon Yüksekliği - H (m)</label>
                            <input type="number" id="takeoffH" value="3" step="0.1" oninput="window.BrenerApp.Hesaplama.calcTakeoff()">
                        </div>
                        <div class="form-group">
                            <label>Kolon Sayısı (Adet)</label>
                            <input type="number" id="takeoffCount" value="24" oninput="window.BrenerApp.Hesaplama.calcTakeoff()">
                        </div>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h4 style="font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">Tahmini Malzeme Gereksinimi</h4>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; color: var(--secondary);">
                            <span>Gereken Beton Hacmi ($m^3$):</span>
                            <span id="takeoffConcrete">17.28 m³</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; color: var(--primary);">
                            <span>Tahmini Demir Metrajı (Boy donatı + Etriye):</span>
                            <span id="takeoffSteel">2.07 Ton</span>
                        </div>
                        <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
                            * Demir metrajı, beton hacminin ortalama %120 kg/m³ donatı yoğunluğu katsayısına göre simüle edilmiştir.
                        </p>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.BrenerApp.showToast('success', 'Beton ve demir metraj siparişi ambar modülüne gönderildi.')">Depoya Metraj Bildir</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Mühendislik Notları</h2>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-muted);">
                        - Beton dökümü siparişi verilirken kalıp esnemeleri ve boru kayıpları göz önüne alınarak %3-%5 oranında fire payı eklenmelidir. <br><br>
                        - Donatı bağlamada paspayı yüksekliği (minimum 3cm veya 5cm) paslanmaya karşı hayati önem taşır. Donatıda paspayı takozları yerleşimi kontrol edilmeden beton dökümüne izin verilmemelidir.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    calcTakeoff() {
        const a = (parseFloat(document.getElementById('takeoffA').value) || 0) / 100;
        const b = (parseFloat(document.getElementById('takeoffB').value) || 0) / 100;
        const h = parseFloat(document.getElementById('takeoffH').value) || 0;
        const count = parseFloat(document.getElementById('takeoffCount').value) || 0;

        const concrete = a * b * h * count;
        // Assume 120 kg/m³ rebar weight standard density
        const steel = (concrete * 120) / 1000;

        document.getElementById('takeoffConcrete').textContent = `${concrete.toFixed(2)} m³`;
        document.getElementById('takeoffSteel').textContent = `${steel.toFixed(2)} Ton`;
    },

    // 7. Anlık Malzeme Fiyatları (Instant Prices)
    renderPrices(container) {
        window.BrenerApp.updateTopbarTitle('Anlık Malzeme Fiyat Grafikleri', 'Brener Piyasa Takip Terminali (Günlük Fiyat Trendleri)');

        // Inline responsive SVG graph for iron price trend over past 5 weeks
        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>İnşaat Demiri Fiyat Trendi (Ton - TL)</h2>
                        <span class="badge badge-danger">Yükselişte (+%2.3)</span>
                    </div>
                    <div style="font-size: 1.8rem; font-weight: 700; margin-top: 8px; color: var(--text-main);">
                        24,500.00 ₺ <span style="font-size: 0.8rem; color: var(--danger); font-weight: 500;">▲ 550 ₺</span>
                    </div>
                    <div class="chart-container" style="width: 100%; height: 180px; margin-top: 20px;">
                        <svg viewBox="0 0 300 120" style="width: 100%; height: 100%;">
                            <!-- Grid lines -->
                            <line x1="20" y1="20" x2="280" y2="20" stroke="var(--border-color)" stroke-dasharray="2,2"/>
                            <line x1="20" y1="60" x2="280" y2="60" stroke="var(--border-color)" stroke-dasharray="2,2"/>
                            <line x1="20" y1="100" x2="280" y2="100" stroke="var(--border-color)"/>
                            <!-- Trend Line (glowing) -->
                            <polyline fill="none" stroke="var(--danger)" stroke-width="2.5" points="20,95 70,85 120,68 170,72 220,50 270,30"/>
                            <circle cx="270" cy="30" r="4" fill="var(--danger)"/>
                            <!-- Labels -->
                            <text x="20" y="112" fill="var(--text-muted)" font-size="5">5 Hafta Önce</text>
                            <text x="120" y="112" fill="var(--text-muted)" font-size="5">3 Hafta Önce</text>
                            <text x="270" y="112" fill="var(--text-muted)" font-size="5" text-anchor="end">Güncel</text>
                        </svg>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Çimento Fiyat Trendi (Torba 50kg - TL)</h2>
                        <span class="badge badge-success">Stabil</span>
                    </div>
                    <div style="font-size: 1.8rem; font-weight: 700; margin-top: 8px; color: var(--text-main);">
                        165.00 ₺ <span style="font-size: 0.8rem; color: var(--success); font-weight: 500;">● Sabit</span>
                    </div>
                    <div class="chart-container" style="width: 100%; height: 180px; margin-top: 20px;">
                        <svg viewBox="0 0 300 120" style="width: 100%; height: 100%;">
                            <!-- Grid lines -->
                            <line x1="20" y1="20" x2="280" y2="20" stroke="var(--border-color)" stroke-dasharray="2,2"/>
                            <line x1="20" y1="60" x2="280" y2="60" stroke="var(--border-color)" stroke-dasharray="2,2"/>
                            <line x1="20" y1="100" x2="280" y2="100" stroke="var(--border-color)"/>
                            <!-- Trend Line (glowing) -->
                            <polyline fill="none" stroke="var(--success)" stroke-width="2.5" points="20,70 70,72 120,68 170,70 220,65 270,65"/>
                            <circle cx="270" cy="65" r="4" fill="var(--success)"/>
                            <!-- Labels -->
                            <text x="20" y="112" fill="var(--text-muted)" font-size="5">5 Hafta Önce</text>
                            <text x="120" y="112" fill="var(--text-muted)" font-size="5">3 Hafta Önce</text>
                            <text x="270" y="112" fill="var(--text-muted)" font-size="5" text-anchor="end">Güncel</text>
                        </svg>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }
};
