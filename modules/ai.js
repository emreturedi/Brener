/* ==========================================================================
   BRENER GROUP - AI MODULES SIMULATION MODULE (AI MODÜLLERİ)
   ========================================================================== */

window.BrenerApp.AI = {
    render(view, container) {
        if (view === 'ai-asistan' || view === 'emlak-ai-danisman' || view === 'yonetmelik-imar-asistani') {
            this.renderChatbot(view, container);
        } else if (view === 'ai-fotograf-analizi') {
            this.renderPhotoAnalysis(container);
        } else if (view === 'ai-plan-okuma') {
            this.renderBlueprintReader(container);
        } else if (view === 'sesli-ai-sefi') {
            this.renderVoiceChief(container);
        } else if (view === 'ai-taslak-plan') {
            this.renderDraftDrawer(container);
        } else {
            // General simulator view for other design AI tasks
            this.renderDesignSimulator(view, container);
        }
    },

    // 1. Chatbots (General AI, Real Estate Consultant, Zoning Assistant)
    renderChatbot(view, container) {
        let title = 'AI İnşaat Asistanı';
        let desc = 'Şantiye yönetimi, imalat ve teknik konularda sorularınızı sorun.';
        let placeholder = 'Çimento dozajı hesabı veya kalıp yapım kurallarını sorun...';
        
        if (view === 'emlak-ai-danisman') {
            title = 'Emlak AI Yatırım Danışmanı';
            desc = 'Amortisman süreleri, bölge fiyat trendleri ve gayrimenkul yatırım tüyoları.';
            placeholder = 'Bodrum 3+1 daire yatırımı karlı mı? Amortisman süresini sorun...';
        } else if (view === 'yonetmelik-imar-asistani') {
            title = 'Yönetmelik & İmar Mevzuat Asistanı';
            desc = 'İmar Kanunu 18. Madde, TAKS/KAKS imtiyazları ve otopark yönetmeliği soru-cevap.';
            placeholder = 'Setback (çekme mesafesi) hesabı nasıl yapılır? Sorun...';
        }

        window.BrenerApp.updateTopbarTitle(title, desc);

        let html = `
            <div class="card" style="max-width: 700px; margin: 0 auto; height: 480px; display: flex; flex-direction: column;">
                <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 8px; height: 8px; background: var(--success); border-radius: 50%;"></span>
                        <strong>Brener AI Chatbot Panel</strong>
                    </div>
                </div>
                <div style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px;" id="fullChatMessages">
                    <div class="message ai">
                        Merhaba! Ben Brener AI. ${desc} Nasıl yardımcı olabilirim?
                    </div>
                </div>
                <div style="padding: 12px; border-top: 1px solid var(--border-color); display: flex; gap: 8px; background: rgba(0,0,0,0.1);">
                    <input type="text" id="fullChatInput" placeholder="${placeholder}" style="flex:1; border-radius: 20px; padding: 10px 16px;">
                    <button class="btn btn-primary" style="border-radius: 50%; width: 42px; height: 42px; padding: 0;" id="fullChatSendBtn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = html;

        const sendBtn = document.getElementById('fullChatSendBtn');
        const input = document.getElementById('fullChatInput');
        const msgContainer = document.getElementById('fullChatMessages');

        const sendMessage = () => {
            const query = input.value.trim();
            if (!query) return;

            const uMsg = document.createElement('div');
            uMsg.className = 'message user';
            uMsg.textContent = query;
            msgContainer.appendChild(uMsg);
            input.value = '';
            msgContainer.scrollTop = msgContainer.scrollHeight;

            const thinking = document.createElement('div');
            thinking.className = 'message ai';
            thinking.innerHTML = `<span class="spinner" style="width: 10px; height: 10px; border-width: 2px; display: inline-block;"></span> Düşünüyor...`;
            msgContainer.appendChild(thinking);
            msgContainer.scrollTop = msgContainer.scrollHeight;

            setTimeout(() => {
                thinking.remove();
                const aMsg = document.createElement('div');
                aMsg.className = 'message ai';
                
                let response = '';
                const norm = query.toLowerCase();
                
                if (view === 'emlak-ai-danisman') {
                    response = `Brener Emlak AI Danışmanı: Yatırım yapacağınız Bodrum bölgesinde yıllık kira getiri çarpanı ortalama 22 yıldır. Ancak villa tipi yazlıklarda sezonluk kiralama (Airbnb/Airbnb benzeri) yapıldığında amortisman süresi 14-15 yıla kadar düşmektedir. Bu durum yatırım verimliliğini ciddi oranda artırmaktadır.`;
                } else if (view === 'yonetmelik-imar-asistani') {
                    response = `Zonlama Mevzuat AI: 3194 Sayılı İmar Kanunu uyarınca, ön bahçe çekme mesafesi asgari 5 metre, yan bahçe çekme mesafesi ise asgari 3 metredir. Parselinizin imar durum belgesindeki yapı nizamına (Ayrık, Blok veya Bitişik) göre bu mesafeler değişiklik gösterebilir. İmar plan notlarını mutlaka inceleyin.`;
                } else {
                    response = `Brener AI İnşaat Mühendislik Modülü: Beton kalitesinin korunması için döküm sonrası ilk 7 gün boyunca sabah ve akşam günde en az iki defa beton kürleme (sulama) işlemi yapılmalıdır. Bu işlem çatlakların oluşmasını engeller ve betonun C30/C35 hedef mukavemetine ulaşmasını sağlar.`;
                }

                aMsg.textContent = response;
                msgContainer.appendChild(aMsg);
                msgContainer.scrollTop = msgContainer.scrollHeight;
            }, 1000);
        };

        sendBtn.onclick = sendMessage;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') sendMessage();
        };
    },

    // 2. AI Fotoğraf Analizi (Image Defect Inspector Simulator)
    renderPhotoAnalysis(container) {
        window.BrenerApp.updateTopbarTitle('AI Şantiye Fotoğraf Analizi', 'Şantiyeden Yüklenen Görsellerdeki Güvenlik ve İmalat Hatalarını Bulucu');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Analiz Edilecek Şantiye Fotoğrafı</h2>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">Sistemden örnek şantiye fotoğrafı seçerek AI görsel analiz modelini simüle edin:</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                        <button class="btn btn-secondary" style="height: 100px; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem;" onclick="window.BrenerApp.AI.inspectImage('paspayi')">
                            📸 <strong>Görsel 1</strong>
                            <span>Kolon Paspayı Kontrolü</span>
                        </button>
                        <button class="btn btn-secondary" style="height: 100px; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem;" onclick="window.BrenerApp.AI.inspectImage('iskele')">
                            📸 <strong>Görsel 2</strong>
                            <span>İskele İSG Analizi</span>
                        </button>
                    </div>

                    <div style="border: 2px dashed var(--border-color); border-radius: 8px; height: 180px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.85rem;">
                        [ Kendi Fotoğrafınızı Sürükleyip Bırakın ]
                    </div>
                </div>

                <div class="card" id="imageInspectResultCard">
                    <div class="card-header">
                        <h2>Analiz Sonuç Kartı</h2>
                    </div>
                    <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                        Lütfen soldan analiz edilecek bir görsel seçin.
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    inspectImage(type) {
        const resultCard = document.getElementById('imageInspectResultCard');
        resultCard.innerHTML = `
            <div class="card-header">
                <h2>AI Analiz Raporu</h2>
                <span class="badge badge-warning">Tarama Tamamlandı</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
                <p style="font-size: 0.9rem; font-weight: 600;">Görsel Kaynağı: Şantiye Kamerası A-Block</p>
                <div style="padding: 12px; border-radius: 6px; border: 1px solid var(--danger); background: var(--danger-bg); font-size: 0.85rem;">
                    <strong>Hata Tespit Edildi:</strong> <br>
                    ${type === 'paspayi' 
                        ? 'Kolon alt donatı demirlerinde plastik paspayı takozlarının eksik olduğu görülmüştür. Beton dökümü durumunda demir korozyonu riski yüksektir. Beton dökümü durdurulmalı ve paspayları takılmalıdır.'
                        : 'Dış cephe iskelesinde çalışmakta olan 2 personelin emniyet kemerlerinin yaşam hattına bağlı olmadığı tespit edilmiştir. İSG yönergeleri gereği iş durdurulmalı ve personellere uyarı gönderilmelidir.'}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-danger btn-sm" style="flex:1;" onclick="window.BrenerApp.showToast('danger', 'Şantiye şefine acil İSG uyarısı SMS olarak gönderildi.')">Usta / Şefe İkaz Gönder</button>
                    <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#isg-kaza'">İSG Defterine Yaz</button>
                </div>
            </div>
        `;
    },

    // 3. AI Mimari Plan Okuma (Blueprint parser)
    renderBlueprintReader(container) {
        window.BrenerApp.updateTopbarTitle('AI Mimari Plan Okuma', 'Mimari Çizimlerden Çıkarılan Emsal, Alan ve Donatı Lokasyon Analizleri');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Mimari Kat Planı Yükle</h2>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 10px;">
                        <button class="btn btn-secondary" style="height: 100px; font-weight: 600;" id="readPlanBtn">
                            🗺️ Kat_Plani_A_Blok.dwg / PDF Analiz Et
                        </button>
                        <div style="border: 2px dashed var(--border-color); border-radius: 8px; height: 120px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.85rem;">
                            [ Plan Dosyasını Buraya Bırakın ]
                        </div>
                    </div>
                </div>

                <div class="card" id="planInspectResultCard">
                    <div class="card-header">
                        <h2>Plan Öznitelikleri (AI Çıkarımı)</h2>
                    </div>
                    <div style="text-align: center; padding: 30px; color: var(--text-muted);">
                        Analiz butonuna tıklayarak dwg/pdf mimari dosyasını taratın.
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

        document.getElementById('readPlanBtn').onclick = () => {
            const res = document.getElementById('planInspectResultCard');
            res.innerHTML = `
                <div class="card-header">
                    <h2>AI Mimari Plan Çözümleme</h2>
                    <span class="badge badge-success">Çözümlendi</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem;">
                    <div>📏 <strong>Toplam Brüt Alan:</strong> 165.40 m²</div>
                    <div>📐 <strong>Toplam Net Kullanım Alanı:</strong> 138.20 m²</div>
                    <div>🏢 <strong>Taşıyıcı Kolon Sayısı:</strong> 16 Adet Betonarme Kolon</div>
                    <div>🛏️ <strong>Oda Yerleşimi:</strong> 3 Oda, 1 Salon, 2 Banyo, 1 Mutfak</div>
                    <div style="padding: 10px; background: rgba(var(--primary-rgb), 0.1); border: 1px solid var(--primary); border-radius: 6px; margin-top: 8px;">
                        <strong>Yönetmelik Uygunluk Analizi:</strong> <br>
                        Plan, mimari yangın yönetmeliği kaçış mesafelerine ve asansör boşluğu ölçülerine %100 uyumludur.
                    </div>
                </div>
            `;
            window.BrenerApp.showToast('success', 'Kat planı mimari analiz algoritmamız tarafından çözümlendi.');
        };
    },

    // 4. Sesli AI Şantiye Şefi (Voice Commands)
    renderVoiceChief(container) {
        window.BrenerApp.updateTopbarTitle('Sesli AI Şantiye Şefi', 'Ses Komutlarıyla Hızlı Stok Güncelleme ve Puantaj Takibi');

        let html = `
            <div class="card" style="max-width: 500px; margin: 0 auto; text-align: center; padding: 40px;">
                <div class="card-header" style="justify-content: center; margin-bottom: 30px;">
                    <h2>Ses Kaydedici Terminal</h2>
                </div>
                
                <div id="voiceWave" style="height: 60px; display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 30px;">
                    <!-- Waveform bars -->
                    <div style="width: 4px; height: 10px; background: var(--primary); border-radius: 2px;"></div>
                    <div style="width: 4px; height: 10px; background: var(--primary); border-radius: 2px;"></div>
                    <div style="width: 4px; height: 10px; background: var(--primary); border-radius: 2px;"></div>
                    <div style="width: 4px; height: 10px; background: var(--primary); border-radius: 2px;"></div>
                </div>

                <button class="btn btn-primary" id="voiceRecordBtn" style="width: 80px; height: 80px; border-radius: 50%; box-shadow: 0 8px 24px rgba(var(--primary-rgb),0.3); padding: 0;">
                    🎤
                </button>
                
                <p id="voiceStatus" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 20px;">Kaydı başlatmak için mikrofona tıklayın.</p>
            </div>
        `;
        container.innerHTML = html;

        const recordBtn = document.getElementById('voiceRecordBtn');
        const status = document.getElementById('voiceStatus');
        const wave = document.getElementById('voiceWave');
        let isRecording = false;

        recordBtn.onclick = () => {
            if (!isRecording) {
                isRecording = true;
                recordBtn.style.background = 'var(--danger)';
                status.textContent = 'Dinleniyor... "Demir stoğuna 10 ton ekle" veya "Ali Yılmaz\'ı geldi yaz" deyin.';
                
                // Animate wave
                let interval = setInterval(() => {
                    if (!isRecording) {
                        clearInterval(interval);
                        return;
                    }
                    wave.querySelectorAll('div').forEach(div => {
                        div.style.height = `${Math.floor(10 + Math.random() * 40)}px`;
                    });
                }, 100);
            } else {
                isRecording = false;
                recordBtn.style.background = 'linear-gradient(135deg, var(--primary), #ebd197)';
                status.textContent = 'Ses işleniyor...';
                
                // Reset wave
                wave.querySelectorAll('div').forEach(div => div.style.height = '10px');

                setTimeout(() => {
                    status.innerHTML = `<strong>Algılanan Komut:</strong> <br> "Demir stoğuna 5 ton ekle"`;
                    window.BrenerApp.showToast('success', 'Sesli komut başarıyla işlendi: Demir stoğuna 5 Ton eklendi.');
                    // Add stock to demo data
                    const iron = window.BrenerApp.state.materials.find(m => m.id === 2);
                    if (iron) {
                        iron.stock += 5;
                        window.BrenerApp.saveStateToStorage();
                    }
                }, 1500);
            }
        };
    },

    // 5. AI Taslak Plan Çizimi (Floor plan generator)
    renderDraftDrawer(container) {
        window.BrenerApp.updateTopbarTitle('AI Taslak Plan Çizimi', 'Metinsel Yönergelere Göre 2D Kat Planı Çizim Jeneratörü');

        let html = `
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">
                        <h2>Kat Planı İstemi (Prompt)</h2>
                    </div>
                    <div class="form-group">
                        <label>Plan Özellikleri Açıklaması</label>
                        <textarea id="draftPrompt" placeholder="Örn: 2+1, ebeveyn banyolu, açık mutfaklı şık bir daire planı..." style="height: 120px;">2+1, ebeveyn banyolu, geniş balkonlu yazlık kat planı</textarea>
                    </div>
                    <button class="btn btn-primary" style="width:100%;" id="drawDraftBtn">Planı Çizmeye Başla</button>
                </div>

                <div class="card" id="draftOutputCard" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 250px;">
                    <div style="color: var(--text-muted); text-align: center;">
                        Plan çizim motorunu çalıştırmak için soldan istem girip çizdirin.
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

        document.getElementById('drawDraftBtn').onclick = () => {
            const out = document.getElementById('draftOutputCard');
            
            // Render a beautiful interactive SVG vector floor plan
            out.innerHTML = `
                <div class="card-header" style="width:100%; margin-bottom: 12px;">
                    <h2>Üretilen 2D Taslak Planı</h2>
                    <span class="badge badge-success">Çizildi</span>
                </div>
                <div style="background: white; border-radius: 8px; padding: 12px; width: 100%; display: flex; justify-content: center;">
                    <svg viewBox="0 0 200 150" style="width: 80%; height: auto;">
                        <!-- Outer Walls -->
                        <rect x="10" y="10" width="180" height="130" fill="none" stroke="#111827" stroke-width="3"/>
                        <!-- Room Divisions -->
                        <line x1="100" y1="10" x2="100" y2="140" stroke="#111827" stroke-width="2"/>
                        <line x1="10" y1="80" x2="100" y2="80" stroke="#111827" stroke-width="2"/>
                        <line x1="100" y1="90" x2="190" y2="90" stroke="#111827" stroke-width="2"/>
                        
                        <!-- Labels -->
                        <text x="55" y="45" fill="#111827" font-size="10" text-anchor="middle" font-weight="700">Yatak Odası</text>
                        <text x="55" y="115" fill="#111827" font-size="10" text-anchor="middle" font-weight="700">Salon / Mutfak</text>
                        <text x="145" y="50" fill="#111827" font-size="10" text-anchor="middle" font-weight="700">Y. Odası 2</text>
                        <text x="145" y="115" fill="#111827" font-size="10" text-anchor="middle" font-weight="700">Banyo</text>
                    </svg>
                </div>
                <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 16px;" onclick="window.BrenerApp.showToast('success', 'Plan CAD (dxf) dosyası olarak dışa aktarıldı.')">DWG/DXF Olarak İndir</button>
            `;
            window.BrenerApp.showToast('success', 'Kat planı taslağı başarıyla çizildi.');
        };
    },

    // 6. Other Design AI modules simulator (Tadilat, 3D Cephe, etc.)
    renderDesignSimulator(view, container) {
        let title = 'AI Tasarım Modülü';
        let desc = 'Yapay zeka görselleştirme ve planlama araçları.';
        
        if (view === 'ai-tadilat-tasarim') {
            title = 'AI Tadilat Tasarım Simülatörü';
            desc = 'Eski oda fotoğraflarını seçilen tarza göre yeniden dekore eder.';
        } else if (view === 'ai-mekan-yerlesim') {
            title = 'AI Mekan Yerleşim Robotu';
            desc = 'Daire planına göre optimum eşya ve yerleşim yer planı hazırlar.';
        } else if (view === 'ai-3d-cephe') {
            title = 'AI 3D Cephe Tasarım Aracı';
            desc = '2D bina kütlesini giydirerek lüks dış cephe tasarımları üretir.';
        } else if (view === 'ai-2d-vaziyet') {
            title = 'AI 2D Vaziyet Planı Çizici';
            desc = 'Arsa sınırlarına göre binaların konum ve bahçe yerleşim planını üretir.';
        }

        window.BrenerApp.updateTopbarTitle(title, desc);

        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 40px; max-width: 600px; margin: 0 auto;">
                <h2>${title}</h2>
                <p style="color: var(--text-muted); margin-top: 10px;">${desc}</p>
                <div style="border: 2px dashed var(--border-color); border-radius: 8px; height: 200px; display: flex; align-items: center; justify-content: center; margin: 24px 0; color: var(--text-muted);">
                    [ Analiz İçin Kaynak Görsel/Plan Dosyası Yükleyin ]
                </div>
                <button class="btn btn-primary" onclick="window.BrenerApp.showToast('success', 'AI Görselleştirme motoru çalıştırıldı. Çıktı arşive eklendi.')">Simülasyonu Çalıştır</button>
            </div>
        `;
    }
};
