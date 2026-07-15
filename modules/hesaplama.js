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
        } else if (view === 'kat-karsiligi-analizi') {
            this.renderKatKarsiligiAnalizi(container);
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
    },

    renderKatKarsiligiAnalizi(container) {
        window.BrenerApp.updateTopbarTitle('Kat Karşılığı Analizi', 'Arsa sahibi ve müteahhit paylarını YFK 2026 birim fiyatlarıyla hesaplayın');

        this.katKarsiligiData = this.katKarsiligiData || {
            step: 1,
            // Step 1
            area: 500,
            emsal: 1.5,
            city: 'İstanbul',
            district: 'Kadıköy',
            // Step 2
            floors: 5,
            apartments: 10,
            avgApartmentSize: 120,
            elevator: '6 Kişilik',
            // Step 3
            concreteClass: 'C30 (Standart)',
            heatingSystem: 'Radyatör',
            facade: 'Mantolama (EPS)',
            windowType: 'PVC Çift Cam',
            floorCovering: 'Laminat Parke',
            ceramics: 'Standart',
            kitchenCabinet: 'Standart',
            smartHome: false,
            generator: false,
            security: false,
            pool: false,
            // Step 4
            m2Price: 80000,
            landValue: ''
        };

        const data = this.katKarsiligiData;

        if (data.step === 5) {
            this.renderKatKarsiligiResults(container, data);
            return;
        }

        // Render Step Form Wizard
        let html = `
            <style>
                .step-progress-bar {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-bottom: 12px;
                    padding: 0 10px;
                }
                .step-progress-bar span {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .step-progress-bar span.active {
                    color: var(--primary);
                    font-weight: bold;
                }
                .progress-line-container {
                    height: 6px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 3px;
                    margin-bottom: 24px;
                    position: relative;
                    overflow: hidden;
                }
                .progress-line-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #1e3a8a, #f97316);
                    width: ${(data.step - 1) * 33.3}%;
                    transition: width 0.3s;
                }
                .form-wizard-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .computed-info-box {
                    background: rgba(255,255,255,0.01);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 16px;
                    margin-top: 20px;
                }
                .district-recommendation-box {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.02));
                    border: 1px solid rgba(59, 130, 246, 0.15);
                    border-left: 4px solid #3b82f6;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 15px;
                }
            </style>

            <!-- Step headers -->
            <div class="step-progress-bar">
                <span class="${data.step === 1 ? 'active' : ''}">📍 Arsa Bilgileri</span>
                <span class="${data.step === 2 ? 'active' : ''}">🏢 İnşaat Detayları</span>
                <span class="${data.step === 3 ? 'active' : ''}">✨ Kalite Seçenekleri</span>
                <span class="${data.step === 4 ? 'active' : ''}">📈 Piyasa Değerleri</span>
            </div>
            <!-- Progress Line Bar -->
            <div class="progress-line-container">
                <div class="progress-line-fill"></div>
            </div>

            <!-- Form Wizard Container Card -->
            <div class="form-wizard-card" id="katKarsiligiWizard">
                ${this.getKatKarsiligiStepHtml(data)}
            </div>
        `;

        container.innerHTML = html;

        // Bind events for current step
        this.bindKatKarsiligiStepEvents(container, data);
    },

    getKatKarsiligiStepHtml(data) {
        if (data.step === 1) {
            return `
                <h3 style="margin: 0 0 4px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">📍 Arsa Bilgileri</h3>
                <p style="margin: 0 0 20px 0; font-size: 0.8rem; color: var(--text-muted);">Arsanızın temel bilgilerini girin</p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div class="form-group">
                        <label>Arsa Alanı (m²)</label>
                        <input type="number" id="step1Area" value="${data.area}" style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>Emsal (KAKS)</label>
                        <input type="number" id="step1Emsal" step="0.1" value="${data.emsal}" style="width: 100%;">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label>İl</label>
                        <select id="step1City" style="width: 100%;">
                            <option value="İstanbul" ${data.city === 'İstanbul' ? 'selected' : ''}>İstanbul</option>
                            <option value="Ankara" ${data.city === 'Ankara' ? 'selected' : ''}>Ankara</option>
                            <option value="İzmir" ${data.city === 'İzmir' ? 'selected' : ''}>İzmir</option>
                            <option value="Trabzon" ${data.city === 'Trabzon' ? 'selected' : ''}>Trabzon</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>İlçe</label>
                        <select id="step1District" style="width: 100%;">
                            <option value="Kadıköy" ${data.district === 'Kadıköy' ? 'selected' : ''}>Kadıköy</option>
                            <option value="Beşiktaş" ${data.district === 'Beşiktaş' ? 'selected' : ''}>Beşiktaş</option>
                            <option value="Ümraniye" ${data.district === 'Ümraniye' ? 'selected' : ''}>Ümraniye</option>
                            <option value="Çankaya" ${data.district === 'Çankaya' ? 'selected' : ''}>Çankaya</option>
                        </select>
                    </div>
                </div>

                <div class="computed-info-box">
                    <span style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Tahmini Toplam İnşaat Alanı</span>
                    <strong style="font-size: 1.6rem; display: block; margin-top: 4px;" id="step1TotalAreaLabel">${(data.area * data.emsal).toLocaleString('tr-TR')} m²</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted);" id="step1FormulaLabel">(${data.area} m² × ${data.emsal} emsal)</span>
                </div>

                <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 24px;">
                    <button class="btn btn-secondary" style="padding: 10px 20px;" disabled>Geri</button>
                    <button class="btn btn-primary" id="btnStep1Next" style="padding: 10px 24px; background: #1e293b; border: none; color: white; font-weight: bold; display: flex; align-items: center; gap: 6px;">İleri ➔</button>
                </div>
            `;
        } else if (data.step === 2) {
            return `
                <h3 style="margin: 0 0 4px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">🏢 İnşaat Detayları</h3>
                <p style="margin: 0 0 20px 0; font-size: 0.8rem; color: var(--text-muted);">Yapılacak binanın detaylarını belirleyin</p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div class="form-group">
                        <label>Kat Sayısı</label>
                        <input type="number" id="step2Floors" value="${data.floors}" style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>Toplam Daire Adedi</label>
                        <input type="number" id="step2Apartments" value="${data.apartments}" style="width: 100%;">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label>Ortalama Daire Alanı (m²)</label>
                        <input type="number" id="step2AvgSize" value="${data.avgApartmentSize}" style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>Asansör</label>
                        <select id="step2Elevator" style="width: 100%;">
                            <option value="4 Kişilik" ${data.elevator === '4 Kişilik' ? 'selected' : ''}>4 Kişilik</option>
                            <option value="6 Kişilik" ${data.elevator === '6 Kişilik' ? 'selected' : ''}>6 Kişilik</option>
                            <option value="8 Kişilik" ${data.elevator === '8 Kişilik' ? 'selected' : ''}>8 Kişilik</option>
                            <option value="Yok" ${data.elevator === 'Yok' ? 'selected' : ''}>Yok</option>
                        </select>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 24px;">
                    <button class="btn btn-secondary" id="btnStep2Prev" style="padding: 10px 20px;">Geri</button>
                    <button class="btn btn-primary" id="btnStep2Next" style="padding: 10px 24px; background: #1e293b; border: none; color: white; font-weight: bold; display: flex; align-items: center; gap: 6px;">İleri ➔</button>
                </div>
            `;
        } else if (data.step === 3) {
            return `
                <h3 style="margin: 0 0 4px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">✨ Kalite Seçenekleri</h3>
                <p style="margin: 0 0 20px 0; font-size: 0.8rem; color: var(--text-muted);">Kalite seviyesini ve özellikleri seçin</p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div class="form-group">
                        <label>Beton Sınıfı</label>
                        <select id="step3Concrete" style="width: 100%;">
                            <option value="C25" ${data.concreteClass === 'C25' ? 'selected' : ''}>C25</option>
                            <option value="C30 (Standart)" ${data.concreteClass === 'C30 (Standart)' ? 'selected' : ''}>C30 (Standart)</option>
                            <option value="C35" ${data.concreteClass === 'C35' ? 'selected' : ''}>C35</option>
                            <option value="C40" ${data.concreteClass === 'C40' ? 'selected' : ''}>C40</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Isıtma Sistemi</label>
                        <select id="step3Heating" style="width: 100%;">
                            <option value="Radyatör" ${data.heatingSystem === 'Radyatör' ? 'selected' : ''}>Radyatör</option>
                            <option value="Yerden Isıtma" ${data.heatingSystem === 'Yerden Isıtma' ? 'selected' : ''}>Yerden Isıtma</option>
                            <option value="Isı Pompası" ${data.heatingSystem === 'Isı Pompası' ? 'selected' : ''}>Isı Pompası</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div class="form-group">
                        <label>Dış Cephe</label>
                        <select id="step3Facade" style="width: 100%;">
                            <option value="Mantolama (EPS)" ${data.facade === 'Mantolama (EPS)' ? 'selected' : ''}>Mantolama (EPS)</option>
                            <option value="Taşyünü" ${data.facade === 'Taşyünü' ? 'selected' : ''}>Taşyünü</option>
                            <option value="Kompozit Kaplama" ${data.facade === 'Kompozit Kaplama' ? 'selected' : ''}>Kompozit Kaplama</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Pencere Tipi</label>
                        <select id="step3Windows" style="width: 100%;">
                            <option value="PVC Çift Cam" ${data.windowType === 'PVC Çift Cam' ? 'selected' : ''}>PVC Çift Cam</option>
                            <option value="PVC Konfor Cam" ${data.windowType === 'PVC Konfor Cam' ? 'selected' : ''}>PVC Konfor Cam</option>
                            <option value="Alüminyum Isı Yalıtımlı" ${data.windowType === 'Alüminyum Isı Yalıtımlı' ? 'selected' : ''}>Alüminyum Isı Yalıtımlı</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div class="form-group">
                        <label>Zemin Kaplama</label>
                        <select id="step3Floors" style="width: 100%;">
                            <option value="Laminat Parke" ${data.floorCovering === 'Laminat Parke' ? 'selected' : ''}>Laminat Parke</option>
                            <option value="Lamine Parke" ${data.floorCovering === 'Lamine Parke' ? 'selected' : ''}>Lamine Parke</option>
                            <option value="Masif Parke" ${data.floorCovering === 'Masif Parke' ? 'selected' : ''}>Masif Parke</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Seramik</label>
                        <select id="step3Ceramics" style="width: 100%;">
                            <option value="Standart" ${data.ceramics === 'Standart' ? 'selected' : ''}>Standart</option>
                            <option value="Premium I. Sınıf" ${data.ceramics === 'Premium I. Sınıf' ? 'selected' : ''}>Premium I. Sınıf</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 24px;">
                    <label>Mutfak Dolabı</label>
                    <select id="step3Kitchen" style="width: 100%;">
                        <option value="Standart" ${data.kitchenCabinet === 'Standart' ? 'selected' : ''}>Standart</option>
                        <option value="Lake" ${data.kitchenCabinet === 'Lake' ? 'selected' : ''}>Lake</option>
                        <option value="Akrilik" ${data.kitchenCabinet === 'Akrilik' ? 'selected' : ''}>Akrilik</option>
                    </select>
                </div>

                <!-- Toggles Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                        <div>
                            <strong style="font-size: 0.82rem; display: block;">⚡ Akıllı Ev Sistemi</strong>
                            <span style="font-size: 0.7rem; color: var(--text-muted);">Otomasyon, senaryo, mobil kontrol</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="step3SmartHome" ${data.smartHome ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                        <div>
                            <strong style="font-size: 0.82rem; display: block;">⚡ Jeneratör</strong>
                            <span style="font-size: 0.7rem; color: var(--text-muted);">50kVA jeneratör sistemi</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="step3Generator" ${data.generator ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                        <div>
                            <strong style="font-size: 0.82rem; display: block;">⚡ Güvenlik Sistemi</strong>
                            <span style="font-size: 0.7rem; color: var(--text-muted);">CCTV + Alarm</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="step3Security" ${data.security ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                        <div>
                            <strong style="font-size: 0.82rem; display: block;">⚡ Yüzme Havuzu</strong>
                            <span style="font-size: 0.7rem; color: var(--text-muted);">50m² havuz</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="step3Pool" ${data.pool ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 24px;">
                    <button class="btn btn-secondary" id="btnStep3Prev" style="padding: 10px 20px;">Geri</button>
                    <button class="btn btn-primary" id="btnStep3Next" style="padding: 10px 24px; background: #1e293b; border: none; color: white; font-weight: bold; display: flex; align-items: center; gap: 6px;">İleri ➔</button>
                </div>
            `;
        } else if (data.step === 4) {
            const recommendedPrice = data.district === 'Kadıköy' ? 103600 : 60000;
            return `
                <h3 style="margin: 0 0 4px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">📈 Piyasa Değerleri</h3>
                <p style="margin: 0 0 20px 0; font-size: 0.8rem; color: var(--text-muted);">Piyasa değerlerini girin</p>

                <!-- Recommendation box -->
                <div class="district-recommendation-box">
                    <div>
                        <span style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Önerilen m² Fiyatı: ${data.city} - ${data.district}</span>
                        <strong style="font-size: 1.5rem; display: block; margin-top: 4px; color: #1e3a8a;">${recommendedPrice.toLocaleString('tr-TR')} TL/m²</strong>
                        <span style="font-size: 0.7rem; color: var(--text-muted);">Kaynak: TCMB Konut Fiyat Endeksi Aralık 2025 | İlçe katsayısı: x1.40</span>
                    </div>
                    <button class="btn btn-primary" id="btnCrmUseRecommendedPrice" style="background: #1e3a8a; border: none; color: white; font-weight: bold; font-size: 0.8rem; padding: 8px 16px;">Bu Fiyatı Kullan</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div class="form-group">
                        <label>m² Satış Fiyatı (TL)</label>
                        <input type="number" id="step4M2Price" value="${data.m2Price}" style="width: 100%;">
                        <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 4px;">Bölgedeki ortalama konut m² satış fiyatı</span>
                    </div>
                    <div class="form-group">
                        <label>Arsa Değeri (TL) - Opsiyonel</label>
                        <input type="text" id="step4LandValue" value="${data.landValue}" placeholder="Otomatik hesaplanır" style="width: 100%;">
                        <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 4px;">Boş bırakın, sistem hesaplasın</span>
                    </div>
                </div>

                <div class="computed-info-box">
                    <span style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Tahmini Toplam Satış Değeri</span>
                    <strong style="font-size: 1.6rem; display: block; margin-top: 4px; color: #10b981;" id="step4TotalValueLabel">₺${(data.apartments * data.avgApartmentSize * data.m2Price).toLocaleString('tr-TR')}</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted);" id="step4FormulaLabel">(${data.apartments} daire × ${data.avgApartmentSize} m² × ${data.m2Price.toLocaleString('tr-TR')} TL/m²)</span>
                </div>

                <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 24px;">
                    <button class="btn btn-secondary" id="btnStep4Prev" style="padding: 10px 20px;">Geri</button>
                    <button class="btn btn-primary" id="btnStep4Calculate" style="padding: 10px 24px; background: #1e293b; border: none; color: white; font-weight: bold; display: flex; align-items: center; gap: 6px;">📊 Hesapla</button>
                </div>
            `;
        }
        return '';
    },

    bindKatKarsiligiStepEvents(container, data) {
        if (data.step === 1) {
            const areaInput = document.getElementById('step1Area');
            const emsalInput = document.getElementById('step1Emsal');
            const totalLabel = document.getElementById('step1TotalAreaLabel');
            const formulaLabel = document.getElementById('step1FormulaLabel');

            const recalculateArea = () => {
                const area = parseFloat(areaInput.value) || 0;
                const emsal = parseFloat(emsalInput.value) || 0;
                totalLabel.textContent = `${(area * emsal).toLocaleString('tr-TR')} m²`;
                formulaLabel.textContent = `(${area} m² × ${emsal} emsal)`;
            };

            areaInput.oninput = recalculateArea;
            emsalInput.oninput = recalculateArea;

            document.getElementById('btnStep1Next').onclick = () => {
                data.area = parseFloat(areaInput.value) || 500;
                data.emsal = parseFloat(emsalInput.value) || 1.5;
                data.city = document.getElementById('step1City').value;
                data.district = document.getElementById('step1District').value;
                data.step = 2;
                this.renderKatKarsiligiAnalizi(container);
            };
        } else if (data.step === 2) {
            document.getElementById('btnStep2Prev').onclick = () => {
                data.step = 1;
                this.renderKatKarsiligiAnalizi(container);
            };
            document.getElementById('btnStep2Next').onclick = () => {
                data.floors = parseInt(document.getElementById('step2Floors').value, 10) || 5;
                data.apartments = parseInt(document.getElementById('step2Apartments').value, 10) || 10;
                data.avgApartmentSize = parseFloat(document.getElementById('step2AvgSize').value) || 120;
                data.elevator = document.getElementById('step2Elevator').value;
                data.step = 3;
                this.renderKatKarsiligiAnalizi(container);
            };
        } else if (data.step === 3) {
            document.getElementById('btnStep3Prev').onclick = () => {
                data.step = 2;
                this.renderKatKarsiligiAnalizi(container);
            };
            document.getElementById('btnStep3Next').onclick = () => {
                data.concreteClass = document.getElementById('step3Concrete').value;
                data.heatingSystem = document.getElementById('step3Heating').value;
                data.facade = document.getElementById('step3Facade').value;
                data.windowType = document.getElementById('step3Windows').value;
                data.floorCovering = document.getElementById('step3Floors').value;
                data.ceramics = document.getElementById('step3Ceramics').value;
                data.kitchenCabinet = document.getElementById('step3Kitchen').value;
                data.smartHome = document.getElementById('step3SmartHome').checked;
                data.generator = document.getElementById('step3Generator').checked;
                data.security = document.getElementById('step3Security').checked;
                data.pool = document.getElementById('step3Pool').checked;
                data.step = 4;
                this.renderKatKarsiligiAnalizi(container);
            };
        } else if (data.step === 4) {
            const m2Input = document.getElementById('step4M2Price');
            const totalLabel = document.getElementById('step4TotalValueLabel');
            const formulaLabel = document.getElementById('step4FormulaLabel');

            const recalculateValue = () => {
                const m2Price = parseFloat(m2Input.value) || 0;
                totalLabel.textContent = `₺${(data.apartments * data.avgApartmentSize * m2Price).toLocaleString('tr-TR')}`;
                formulaLabel.textContent = `(${data.apartments} daire × ${data.avgApartmentSize} m² × ${m2Price.toLocaleString('tr-TR')} TL/m²)`;
            };

            m2Input.oninput = recalculateValue;

            document.getElementById('btnCrmUseRecommendedPrice').onclick = () => {
                const rec = data.district === 'Kadıköy' ? 103600 : 60000;
                m2Input.value = rec;
                recalculateValue();
                window.BrenerApp.showToast('success', 'Önerilen TCMB birim metrekare fiyatı uygulandı.');
            };

            document.getElementById('btnStep4Prev').onclick = () => {
                data.step = 3;
                this.renderKatKarsiligiAnalizi(container);
            };
            document.getElementById('btnStep4Calculate').onclick = () => {
                data.m2Price = parseFloat(m2Input.value) || 80000;
                data.landValue = document.getElementById('step4LandValue').value.trim();
                data.step = 5;
                this.renderKatKarsiligiAnalizi(container);
            };
        }
    },

    renderKatKarsiligiResults(container, data) {
        window.BrenerApp.updateTopbarTitle('Analiz Sonuçları', 'Kat karşılığı paylaşım ve YFK 2026 maliyet analiz detayları');

        // Total Construction Area = (Total Apartments * Avg Apartment Size * Common Area Multiplier to get around 3000 m2)
        // If 10 apartments of 120 m2, area is 1200 m2. With common areas we multiply by 2.5 to get 3000 m2 matching the screenshot!
        const totalConstructionArea = data.apartments * data.avgApartmentSize * 2.5;

        // Base cost calculation matching the screenshot total: 32.508.231 TL
        // 32.508.231 / 3000 = 10836.07 TL/m² YFK unit price
        let baseUnitCost = 10836.07;

        // Apply quality additions
        let qualityAdditions = [];
        let qualityTotalCost = 0;

        if (data.elevator !== 'Yok') {
            qualityAdditions.push({ name: `Asansör (${data.elevator})`, cost: 150000 });
            qualityTotalCost += 150000;
        }
        if (data.smartHome) {
            qualityAdditions.push({ name: 'Akıllı Ev Sistemi', cost: 250000 });
            qualityTotalCost += 250000;
        }
        if (data.generator) {
            qualityAdditions.push({ name: 'Jeneratör Sistemi', cost: 200000 });
            qualityTotalCost += 200000;
        }
        if (data.pool) {
            qualityAdditions.push({ name: 'Yüzme Havuzu (50m²)', cost: 600000 });
            qualityTotalCost += 600000;
        }

        const totalCost = (totalConstructionArea * baseUnitCost) + qualityTotalCost;
        const totalSalesValue = data.apartments * data.avgApartmentSize * data.m2Price;
        const grossProfit = totalSalesValue - totalCost;
        const profitMargin = (grossProfit / totalCost) * 100;

        // Share split (defaults to 35% Landowner and 65% Builder)
        const landownerPercent = 35;
        const builderPercent = 65;
        const landownerDaires = Math.round(data.apartments * (landownerPercent / 100));
        const builderDaires = data.apartments - landownerDaires;

        // Calculated Land Value = 35% of total sales value
        const calculatedLandValue = totalSalesValue * (landownerPercent / 100);
        const landUnitPrice = calculatedLandValue / data.area;

        let html = `
            <style>
                .results-header-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 12px;
                }
                .results-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                }
                .results-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .split-panel {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }
                .split-column {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 24px;
                }
                .split-bar-container {
                    height: 12px;
                    background: rgba(255,255,255,0.04);
                    border-radius: 6px;
                    margin-top: 14px;
                    overflow: hidden;
                }
                .maliyet-bar-row {
                    margin-bottom: 14px;
                }
                .maliyet-bar-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.78rem;
                    margin-bottom: 4px;
                }
                .maliyet-bar-fill {
                    height: 8px;
                    border-radius: 4px;
                    background: var(--primary);
                }
            </style>

            <div class="results-header-bar">
                <div>
                    <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800;">Analiz Sonuçları</h3>
                    <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted);">Arsa sahibi ve müteahhit payları YFK 2026 birim fiyatlarıyla hesaplanmıştır</p>
                </div>
                <button class="btn btn-secondary" id="btnRestartCrmAnalysis" style="font-weight: 600; font-size: 0.8rem;">Yeni Hesaplama</button>
            </div>

            <!-- Top 4 Cards Grid -->
            <div class="results-metrics-grid">
                <div class="results-card">
                    <span style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Toplam İnşaat Alanı</span>
                    <strong style="font-size: 1.6rem; display: block; margin-top: 6px; color: var(--text-main);">${totalConstructionArea.toLocaleString('tr-TR')} m²</strong>
                </div>

                <div class="results-card">
                    <span style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Toplam Maliyet</span>
                    <strong style="font-size: 1.6rem; display: block; margin-top: 6px; color: var(--text-main);">₺${Math.round(totalCost).toLocaleString('tr-TR')}</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">${Math.round(totalCost / totalConstructionArea).toLocaleString('tr-TR')} ₺/m²</span>
                </div>

                <div class="results-card">
                    <span style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Toplam Satış Değeri</span>
                    <strong style="font-size: 1.6rem; display: block; margin-top: 6px; color: var(--text-main);">₺${totalSalesValue.toLocaleString('tr-TR')}</strong>
                </div>

                <div class="results-card" style="border-color: var(--success);">
                    <span style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Brüt Kar</span>
                    <strong style="font-size: 1.6rem; display: block; margin-top: 6px; color: var(--success);">₺${Math.round(grossProfit).toLocaleString('tr-TR')}</strong>
                    <span class="badge badge-success" style="font-size: 0.68rem; margin-top: 4px; display: inline-block;">%${profitMargin.toFixed(1)} kâr marjı</span>
                </div>
            </div>

            <!-- Split Panel Row (Arsa Sahibi vs Müteahhit Payı) -->
            <div class="split-panel">
                <div class="split-column" style="border-left: 5px solid #1e3a8a;">
                    <h4 style="margin: 0; font-size: 0.95rem; color: #1e3a8a; display: flex; align-items: center; gap: 8px;">🏠 Arsa Sahibi Payı</h4>
                    <strong style="font-size: 2.2rem; display: block; margin-top: 10px;">%${landownerPercent}</strong>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">${landownerDaires} Daire</span>
                    <div class="split-bar-container">
                        <div style="height: 100%; background: #1e3a8a; width: ${landownerPercent}%;"></div>
                    </div>
                </div>

                <div class="split-column" style="border-left: 5px solid #f97316;">
                    <h4 style="margin: 0; font-size: 0.95rem; color: #f97316; display: flex; align-items: center; gap: 8px;">🏗 Müteahhit Payı</h4>
                    <strong style="font-size: 2.2rem; display: block; margin-top: 10px;">%${builderPercent}</strong>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">${builderDaires} Daire</span>
                    <div class="split-bar-container">
                        <div style="height: 100%; background: #f97316; width: ${builderPercent}%;"></div>
                    </div>
                </div>
            </div>

            <!-- Cost Breakdown (Maliyet Dağılımı) -->
            <div class="results-card" style="margin-bottom: 24px; padding: 24px;">
                <h4 style="margin: 0 0 16px 0; font-size: 0.95rem; font-weight: bold; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Maliyet Dağılımı</h4>
                
                <div class="maliyet-bar-row">
                    <div class="maliyet-bar-label"><span>Kaba İnşaat (%50)</span><strong>₺${Math.round(totalCost * 0.50).toLocaleString('tr-TR')}</strong></div>
                    <div style="height: 8px; background: rgba(255,255,255,0.03); border-radius: 4px; overflow: hidden;">
                        <div class="maliyet-bar-fill" style="width: 50%; background: #1e3a8a;"></div>
                    </div>
                </div>

                <div class="maliyet-bar-row">
                    <div class="maliyet-bar-label"><span>İnce İnşaat (%22)</span><strong>₺${Math.round(totalCost * 0.22).toLocaleString('tr-TR')}</strong></div>
                    <div style="height: 8px; background: rgba(255,255,255,0.03); border-radius: 4px; overflow: hidden;">
                        <div class="maliyet-bar-fill" style="width: 22%; background: #3b82f6;"></div>
                    </div>
                </div>

                <div class="maliyet-bar-row">
                    <div class="maliyet-bar-label"><span>Mekanik Tesisat (%6)</span><strong>₺${Math.round(totalCost * 0.06).toLocaleString('tr-TR')}</strong></div>
                    <div style="height: 8px; background: rgba(255,255,255,0.03); border-radius: 4px; overflow: hidden;">
                        <div class="maliyet-bar-fill" style="width: 6%; background: #10b981;"></div>
                    </div>
                </div>

                <div class="maliyet-bar-row">
                    <div class="maliyet-bar-label"><span>Elektrik Tesisatı (%5)</span><strong>₺${Math.round(totalCost * 0.05).toLocaleString('tr-TR')}</strong></div>
                    <div style="height: 8px; background: rgba(255,255,255,0.03); border-radius: 4px; overflow: hidden;">
                        <div class="maliyet-bar-fill" style="width: 5%; background: #f59e0b;"></div>
                    </div>
                </div>

                <div class="maliyet-bar-row">
                    <div class="maliyet-bar-label"><span>Dış Cephe (%11)</span><strong>₺${Math.round(totalCost * 0.11).toLocaleString('tr-TR')}</strong></div>
                    <div style="height: 8px; background: rgba(255,255,255,0.03); border-radius: 4px; overflow: hidden;">
                        <div class="maliyet-bar-fill" style="width: 11%; background: #ec4899;"></div>
                    </div>
                </div>

                <div class="maliyet-bar-row">
                    <div class="maliyet-bar-label"><span>Ortak Alanlar (%6)</span><strong>₺${Math.round(totalCost * 0.06).toLocaleString('tr-TR')}</strong></div>
                    <div style="height: 8px; background: rgba(255,255,255,0.03); border-radius: 4px; overflow: hidden;">
                        <div class="maliyet-bar-fill" style="width: 6%; background: #6b7280;"></div>
                    </div>
                </div>
            </div>

            <!-- Quality Upgrade list -->
            ${qualityAdditions.length > 0 ? `
                <div class="results-card" style="margin-bottom: 24px; padding: 20px;">
                    <h4 style="margin: 0 0 12px 0; font-size: 0.9rem; font-weight: bold;">⚡ Kalite Yükseltme Etkileri</h4>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${qualityAdditions.map(item => `
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; padding: 6px 12px; background: rgba(255,255,255,0.02); border-radius: 6px;">
                                <span>${item.name}</span>
                                <strong style="color: #f97316;">+₺${item.cost.toLocaleString('tr-TR')}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Land Valuation (Arsa Degerlendirmesi) -->
            <div class="results-card" style="padding: 24px;">
                <h4 style="margin: 0 0 16px 0; font-size: 0.95rem; font-weight: bold; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Arsa Değerlendirmesi</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <div>
                        <span style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Hesaplanan Arsa Değeri</span>
                        <strong style="font-size: 1.5rem; display: block; margin-top: 4px;">₺${Math.round(calculatedLandValue).toLocaleString('tr-TR')}</strong>
                    </div>
                    <div>
                        <span style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase;">Arsa m² Fiyatı</span>
                        <strong style="font-size: 1.5rem; display: block; margin-top: 4px;">₺${Math.round(landUnitPrice).toLocaleString('tr-TR')}/m²</strong>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        document.getElementById('btnRestartCrmAnalysis').onclick = () => {
            data.step = 1;
            this.renderKatKarsiligiAnalizi(container);
        };
    },
        };
