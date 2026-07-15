/* ==========================================================================
   BRENER GROUP - AI MODULES SIMULATION MODULE (AI MODÜLLERİ)
   ========================================================================== */

window.BrenerApp.AI = {
    render(view, container) {
        if (view === 'ai-asistan' || view === 'emlak-ai-danisman' || view === 'yonetmelik-imar-asistani') {
            this.renderChatbot(view, container);
        } else if (view === 'ai-fotograf-analizi') {
            this.renderPhotoAnalysis(container);
        } else if (view === 'ai-kanal-entegrasyon') {
            this.renderChannelIntegration(container);
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

    // 2. AI Fotoğraf Analizi (Image Defect Inspector Simulator & Channel Integrations)
    renderPhotoAnalysis(container) {
        window.BrenerApp.updateTopbarTitle('AI Şantiye Fotoğraf & Kanal Analizi', 'Şantiyeden Yüklenen Görsellerdeki Güvenlik Hatalarını Bulucu ve Mesajlaşma Kanalları Entegrasyonu');

        let activeTab = 'safety'; // 'safety' or 'channels'

        const renderContent = () => {
            let innerHtml = '';

            if (activeTab === 'safety') {
                innerHtml = `
                    <div class="grid-2col">
                        <div class="card">
                            <div class="card-header">
                                <h2>Analiz Edilecek Şantiye Fotoğrafı</h2>
                            </div>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">Sistemden örnek şantiye fotoğrafı seçerek AI görsel analiz modelini simüle edin:</p>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                                <button class="btn btn-secondary" style="height: 100px; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; justify-content: center; align-items: center;" id="btnInspectPaspayi">
                                    📸 <strong>Görsel 1</strong>
                                    <span>Kolon Paspayı Kontrolü</span>
                                </button>
                                <button class="btn btn-secondary" style="height: 100px; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; justify-content: center; align-items: center;" id="btnInspectIskele">
                                    📸 <strong>Görsel 2</strong>
                                    <span>İskele İSG Analizi</span>
                                </button>
                            </div>

                            <div style="border: 2px dashed var(--border-color); border-radius: 8px; height: 180px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.85rem; cursor: pointer;" onclick="alert('Kendi görsel yükleme modülü simüle ediliyor. Lütfen hazır görselleri kullanın.')">
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
            } else {
                innerHtml = `
                    <!-- Row 1: Integration Status Cards -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                        <div class="card" style="border-left: 4px solid #0088cc; padding: 16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <strong style="color:var(--text-main); font-size:0.95rem;">✈️ Telegram Entegrasyonu</strong>
                                <span class="badge badge-success">Aktif (Webhook)</span>
                            </div>
                            <p style="font-size:0.8rem; color:var(--text-muted); margin:0 0 12px 0;">BrenerGroupBot ile saha fişleri ve saha günlük fotoğrafları işlenir.</p>
                            <code style="font-size:0.75rem; color:var(--primary); background:rgba(var(--primary-rgb),0.05); padding:4px 8px; border-radius:4px;">@BrenerGroupBot</code>
                        </div>

                        <div class="card" style="border-left: 4px solid #25d366; padding: 16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <strong style="color:var(--text-main); font-size:0.95rem;">💬 WhatsApp Business</strong>
                                <span class="badge badge-success">Aktif</span>
                            </div>
                            <p style="font-size:0.8rem; color:var(--text-muted); margin:0 0 12px 0;">+90 555 000 00 00 numaralı WhatsApp hattından veri girişi yapılır.</p>
                            <code style="font-size:0.75rem; color:var(--primary); background:rgba(var(--primary-rgb),0.05); padding:4px 8px; border-radius:4px;">+90 555 000 00 00</code>
                        </div>

                        <div class="card" style="border-left: 4px solid #ef4444; padding: 16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <strong style="color:var(--text-main); font-size:0.95rem;">📧 E-Posta Fatura Okuyucu</strong>
                                <span class="badge badge-success">Aktif</span>
                            </div>
                            <p style="font-size:0.8rem; color:var(--text-muted); margin:0 0 12px 0;">Gelen faturalar yapay zeka tarafından parse edilerek sisteme girilir.</p>
                            <code style="font-size:0.75rem; color:var(--primary); background:rgba(var(--primary-rgb),0.05); padding:4px 8px; border-radius:4px;">saha@brenergroup.com</code>
                        </div>
                    </div>

                    <!-- Row 2: Chat & File Entry Simulator Sandbox -->
                    <div class="grid-2col">
                        <!-- Left Card: Simulator Input -->
                        <div class="card">
                            <div class="card-header">
                                <h2>AI Kanal Veri Giriş Simülatörü</h2>
                            </div>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
                                Telegram, WhatsApp veya E-Posta üzerinden gönderilen bir görselin/dosyanın sisteme nasıl otomatik veri girişi sağladığını simüle edin:
                            </p>

                            <div class="form-group" style="margin-bottom:16px;">
                                <label>1. Gönderim Kanalı Seçin</label>
                                <select id="simChannelSelect" style="width:100%; padding:10px; background:var(--bg-dark); border:1px solid var(--border-color); border-radius:8px; color:var(--text-main);">
                                    <option value="whatsapp">💬 WhatsApp (+90 555 000 00 00)</option>
                                    <option value="telegram">✈️ Telegram (@BrenerGroupBot)</option>
                                    <option value="email">📧 E-Posta (saha@brenergroup.com)</option>
                                </select>
                            </div>

                            <div class="form-group" style="margin-bottom:24px;">
                                <label>2. Gönderilecek Evrak / Görsel Tipi</label>
                                <div style="display:flex; flex-direction:column; gap:10px;">
                                    <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--border-color); border-radius:8px; background:rgba(255,255,255,0.01); cursor:pointer;">
                                        <input type="radio" name="simDocType" value="fatura" checked style="margin:0;">
                                        <div>
                                            <strong style="font-size:0.85rem; display:block;">🧾 Malzeme Alım Faturası / Fişi</strong>
                                            <span style="font-size:0.75rem; color:var(--text-muted);">Örn: "Yavuz Çimento A.Ş. - 45.000 ₺ Hazır Beton Faturası" (Gider/Hakediş kaydı yapar)</span>
                                        </div>
                                    </label>
                                    
                                    <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--border-color); border-radius:8px; background:rgba(255,255,255,0.01); cursor:pointer;">
                                        <input type="radio" name="simDocType" value="ilerleme" style="margin:0;">
                                        <div>
                                            <strong style="font-size:0.85rem; display:block;">🏗️ Şantiye Günlük İlerleme Fotoğrafı</strong>
                                            <span style="font-size:0.75rem; color:var(--text-muted);">Örn: "A Blok 4. Kat demir donatı döşeme fotoğrafı" (Fiziksel ilerleme kaydı yapar)</span>
                                        </div>
                                    </label>

                                    <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--border-color); border-radius:8px; background:rgba(255,255,255,0.01); cursor:pointer;">
                                        <input type="radio" name="simDocType" value="talep" style="margin:0;">
                                        <div>
                                            <strong style="font-size:0.85rem; display:block;">📝 Saha Malzeme Talep Fişi (El Yazısı)</strong>
                                            <span style="font-size:0.75rem; color:var(--text-muted);">Örn: "Şantiye el yazısı kağıt: 20 Baret, 10 Çift Çizme" (Saha Talebi oluşturur)</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button class="btn btn-primary" id="btnSimulateChannelSend" style="width:100%; font-weight:700; padding:12px;">📤 Evrak Görselini Gönder</button>
                        </div>

                        <!-- Right Card: Simulation Output -->
                        <div class="card" id="channelSimResultCard">
                            <div class="card-header">
                                <h2>Webhook Alıcı & AI Ayrıştırma Günlüğü</h2>
                            </div>
                            <div style="text-align: center; padding: 60px; color: var(--text-muted); font-size: 0.85rem;">
                                Simülasyonu başlatmak için soldan kanal ve evrak seçip "Evrak Görselini Gönder" butonuna basın.
                            </div>
                        </div>
                    </div>
                `;
            }

            let tabsHtml = `
                <!-- Navigation Tabs -->
                <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                    <button class="btn ${activeTab === 'safety' ? 'btn-primary' : 'btn-secondary'}" id="tabSafety" style="padding: 8px 16px; font-size: 0.85rem;">
                        🛡️ Şantiye İSG & Kusur Analizi
                    </button>
                    <button class="btn ${activeTab === 'channels' ? 'btn-primary' : 'btn-secondary'}" id="tabChannels" style="padding: 8px 16px; font-size: 0.85rem;">
                        📲 Telegram / WhatsApp / E-Posta Veri Girişi
                    </button>
                </div>
                
                <div id="aiPhotoTabContent">
                    ${innerHtml}
                </div>
            `;

            container.innerHTML = tabsHtml;

            // Bind tab click events
            document.getElementById('tabSafety').onclick = () => {
                activeTab = 'safety';
                renderContent();
            };
            document.getElementById('tabChannels').onclick = () => {
                activeTab = 'channels';
                renderContent();
            };

            // Bind actions for active tab
            if (activeTab === 'safety') {
                document.getElementById('btnInspectPaspayi').onclick = () => {
                    this.inspectImage('paspayi');
                };
                document.getElementById('btnInspectIskele').onclick = () => {
                    this.inspectImage('iskele');
                };
            } else {
                document.getElementById('btnSimulateChannelSend').onclick = () => {
                    const channel = document.getElementById('simChannelSelect').value;
                    const docType = document.querySelector('input[name="simDocType"]:checked').value;
                    this.simulateChannelInput(channel, docType);
                };
            }
        };

        renderContent();
    },

    // 2b. AI Kanal Veri Girişi (Telegram / WhatsApp / E-Posta) - Standalone page
    renderChannelIntegration(container) {
        window.BrenerApp.updateTopbarTitle('📲 AI Kanal Veri Girişi', 'Telegram, WhatsApp ve E-Posta üzerinden resim/evrak göndererek sisteme otomatik veri girişi yapın');

        container.innerHTML = `
            <!-- Row 0: Info Banner -->
            <div style="background: linear-gradient(135deg, rgba(var(--primary-rgb),0.15) 0%, rgba(var(--primary-rgb),0.05) 100%); border: 1px solid rgba(var(--primary-rgb),0.3); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px;">
                <div style="font-size: 2rem;">🤖</div>
                <div>
                    <strong style="color: var(--primary); font-size: 1rem;">Yapay Zeka Destekli Otomatik Veri Girişi</strong>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-muted);">Saha personeli, şantiyeden <strong>fatura fotoğrafı</strong>, <strong>ilerleme görseli</strong> veya <strong>el yazısı malzeme fişi</strong> göndererek sisteme otomatik kayıt yapabilir. AI Vision & OCR motoru görseli okur, verileri ayrıştırır ve ilgili modüle (Finans, Talepler, Günlük) anında işler.</p>
                </div>
            </div>

            <!-- Row 1: Integration Status Cards -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                <div class="card" style="border-left: 4px solid #0088cc; padding: 20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.5rem;">✈️</span>
                            <strong style="color:var(--text-main); font-size:0.95rem;">Telegram</strong>
                        </div>
                        <span class="badge badge-success">Aktif</span>
                    </div>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin:0 0 10px 0;">Saha fişleri ve saha günlük fotoğrafları @BrenerGroupBot üzerinden işlenir.</p>
                    <code style="font-size:0.78rem; color:#0088cc; background:rgba(0,136,204,0.08); padding:5px 10px; border-radius:6px; display:block; text-align:center;">@BrenerGroupBot</code>
                </div>

                <div class="card" style="border-left: 4px solid #25d366; padding: 20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.5rem;">💬</span>
                            <strong style="color:var(--text-main); font-size:0.95rem;">WhatsApp Business</strong>
                        </div>
                        <span class="badge badge-success">Aktif</span>
                    </div>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin:0 0 10px 0;">+90 555 000 00 00 numaralı WhatsApp hattından fatura ve talep girişi yapılır.</p>
                    <code style="font-size:0.78rem; color:#25d366; background:rgba(37,211,102,0.08); padding:5px 10px; border-radius:6px; display:block; text-align:center;">+90 555 000 00 00</code>
                </div>

                <div class="card" style="border-left: 4px solid var(--danger); padding: 20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.5rem;">📧</span>
                            <strong style="color:var(--text-main); font-size:0.95rem;">E-Posta (IMAP)</strong>
                        </div>
                        <span class="badge badge-success">Aktif</span>
                    </div>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin:0 0 10px 0;">Gelen faturalar ve ekler AI tarafından okunarak muhasebeye otomatik işlenir.</p>
                    <code style="font-size:0.78rem; color:var(--danger); background:rgba(239,68,68,0.08); padding:5px 10px; border-radius:6px; display:block; text-align:center;">saha@brenergroup.com</code>
                </div>
            </div>

            <!-- Row 2: Chat & File Entry Simulator Sandbox -->
            <div class="grid-2col">
                <!-- Left Card: Simulator Input -->
                <div class="card">
                    <div class="card-header">
                        <h2>🧪 AI Kanal Veri Giriş Simülatörü</h2>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
                        Telegram, WhatsApp veya E-Posta üzerinden gönderilen bir görselin sisteme nasıl otomatik veri girişi sağladığını simüle edin:
                    </p>

                    <div class="form-group" style="margin-bottom:16px;">
                        <label>1. Gönderim Kanalı Seçin</label>
                        <select id="simChannelSelect2" style="width:100%; padding:10px; background:var(--bg-dark); border:1px solid var(--border-color); border-radius:8px; color:var(--text-main);">
                            <option value="whatsapp">💬 WhatsApp (+90 555 000 00 00)</option>
                            <option value="telegram">✈️ Telegram (@BrenerGroupBot)</option>
                            <option value="email">📧 E-Posta (saha@brenergroup.com)</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-bottom:24px;">
                        <label>2. Gönderilecek Evrak / Görsel Tipi</label>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--border-color); border-radius:8px; background:rgba(255,255,255,0.01); cursor:pointer;">
                                <input type="radio" name="simDocType2" value="fatura" checked style="margin:0;">
                                <div>
                                    <strong style="font-size:0.85rem; display:block;">🧾 Malzeme Alım Faturası / Fişi</strong>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Örn: "Yavuz Çimento A.Ş. - 45.000 ₺ Hazır Beton Faturası" → Gider kaydı açılır</span>
                                </div>
                            </label>

                            <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--border-color); border-radius:8px; background:rgba(255,255,255,0.01); cursor:pointer;">
                                <input type="radio" name="simDocType2" value="ilerleme" style="margin:0;">
                                <div>
                                    <strong style="font-size:0.85rem; display:block;">🏗️ Şantiye Günlük İlerleme Fotoğrafı</strong>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Örn: "A Blok 4. Kat demir donatı döşeme fotoğrafı" → Fiziksel ilerleme +%5</span>
                                </div>
                            </label>

                            <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--border-color); border-radius:8px; background:rgba(255,255,255,0.01); cursor:pointer;">
                                <input type="radio" name="simDocType2" value="talep" style="margin:0;">
                                <div>
                                    <strong style="font-size:0.85rem; display:block;">📝 Saha Malzeme Talep Fişi (El Yazısı)</strong>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Örn: "20 Baret, 10 Çift Çizme" el yazısı fişi → Saha Talebi oluşturur</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button class="btn btn-primary" id="btnSimulateChannelSend2" style="width:100%; font-weight:700; padding:14px; font-size:1rem;">
                        📤 Evrak Görselini Gönder &amp; AI ile İşle
                    </button>
                </div>

                <!-- Right Card: Simulation Output -->
                <div class="card" id="channelSimResultCard2">
                    <div class="card-header">
                        <h2>📡 Webhook Alıcı &amp; AI Ayrıştırma Günlüğü</h2>
                    </div>
                    <div style="text-align: center; padding: 80px 40px; color: var(--text-muted); font-size: 0.88rem;">
                        <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.4;">📲</div>
                        <p>Simülasyonu başlatmak için soldan kanal ve evrak tipini seçip<br><strong>"Evrak Görselini Gönder"</strong> butonuna basın.</p>
                        <p style="margin-top:12px; font-size:0.78rem; opacity:0.6;">AI Vision OCR motoru görseli okuyacak, veriyi ayrıştıracak ve sisteme kaydedecek.</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btnSimulateChannelSend2').onclick = () => {
            const channel = document.getElementById('simChannelSelect2').value;
            const docType = document.querySelector('input[name="simDocType2"]:checked').value;
            this.simulateChannelInput2(channel, docType);
        };
    },

    simulateChannelInput2(channel, docType) {
        const resultCard = document.getElementById('channelSimResultCard2');
        const channelLabels = { whatsapp: '💬 WhatsApp', telegram: '✈️ Telegram', email: '📧 E-Posta' };

        resultCard.innerHTML = `
            <div class="card-header"><h2>📡 Webhook Alıcı &amp; AI Ayrıştırma Günlüğü</h2></div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; text-align: center;">
                <div style="border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid var(--primary); border-radius: 50%; width: 48px; height: 48px; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <strong style="color:var(--text-main); font-size:1rem;">${channelLabels[channel]} üzerinden görsel alındı</strong>
                <span style="font-size:0.82rem; color:var(--text-muted); margin-top:10px;">AI Vision OCR Modülü çalıştırılıyor...<br>Görsel indiriliyor, gürültü azaltma uygulanıyor ve metin katmanları taranıyor.</span>
            </div>
        `;

        setTimeout(() => {
            this.simulateChannelInput(channel, docType, true);
        }, 2000);
    },

    inspectImage(type) {
        const resultCard = document.getElementById('imageInspectResultCard');
        resultCard.innerHTML = `
            <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px;">
                <h2>AI Analiz Raporu</h2>
                <span class="badge badge-warning">Tarama Tamamlandı</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
                <p style="font-size: 0.9rem; font-weight: 600; color:var(--text-main);">Görsel Kaynağı: Şantiye Kamerası A-Block</p>
                <div style="padding: 12px; border-radius: 6px; border: 1px solid var(--danger); background: rgba(239, 68, 68, 0.05); color: var(--text-main); font-size: 0.85rem;">
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

    simulateChannelInput(channel, docType, isStandalone) {
        const cardId = isStandalone ? 'channelSimResultCard2' : 'channelSimResultCard';
        const resultCard = document.getElementById(cardId);
        
        resultCard.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
                <div style="border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid var(--primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <strong style="color:var(--text-main);">AI Vision OCR Modülü Çalıştırılıyor...</strong>
                <span style="font-size:0.8rem; color:var(--text-muted); margin-top:8px;">Görsel indiriliyor, gürültü azaltma uygulanıyor ve metin katmanları taranıyor.</span>
            </div>
        `;

        setTimeout(() => {
            let title = '';
            let details = '';
            let extractedData = {};
            let statusText = '';
            let badgeClass = 'badge-success';

            const activeProj = window.BrenerApp.getActiveProject();

            if (docType === 'fatura') {
                title = '🧾 Fatura / Fiş Ayrıştırma Sonucu';
                statusText = 'Muhasebeye Otomatik İşlendi';
                const fDate = new Date().toISOString().split('T')[0];
                extractedData = {
                    belgeTipi: 'Fatura',
                    saticiFirma: 'Yavuz Hazır Beton A.Ş.',
                    tarih: fDate,
                    malzeme: 'C30 Hazır Beton Alımı',
                    miktar: '50 m³',
                    tutarNet: 37500,
                    kdv: 7500,
                    toplamTutar: 45000,
                    projeId: activeProj ? activeProj.id : 1
                };
                details = `
                    <div style="font-size:0.85rem; line-height:1.5; color:var(--text-main);">
                        • <strong>Tedarikçi:</strong> Yavuz Hazır Beton A.Ş.<br>
                        • <strong>Tarih:</strong> ${extractedData.tarih}<br>
                        • <strong>Ürün/Hizmet:</strong> C30 Hazır Beton Alımı (50 m³)<br>
                        • <strong>Toplam Tutar:</strong> 45.000 ₺ (Net: 37.500 ₺ + KDV: 7.500 ₺)<br>
                        • <strong>Tespit Güveni:</strong> %98.4 (AI Vision onaylı)
                    </div>
                `;

                // Add to claims
                const claims = window.BrenerApp.state.claims || [];
                claims.unshift({
                    id: Date.now(),
                    subcontractor: extractedData.saticiFirma,
                    description: `${extractedData.malzeme} (${extractedData.miktar}) - AI Entegrasyon Girişi`,
                    totalAmount: extractedData.toplamTutar,
                    retention: 0,
                    netPaid: extractedData.toplamTutar,
                    date: extractedData.tarih,
                    status: 'paid'
                });

                // Add to project spent budget
                if (activeProj) {
                    activeProj.spent = (activeProj.spent || 0) + extractedData.toplamTutar;
                }
                window.BrenerApp.saveStateToStorage();
                window.BrenerApp.showToast('success', 'Fatura başarıyla işlendi ve gider kaydı oluşturuldu!');
                window.BrenerApp.logActivity('finans', `AI Webhook: ${extractedData.saticiFirma} faturası işlendi`, 'success', `${extractedData.toplamTutar} ₺`);

            } else if (docType === 'ilerleme') {
                title = '🏗️ İlerleme Fotoğrafı Analiz Sonucu';
                statusText = 'Şantiye İlerlemesi Güncellendi';
                extractedData = {
                    analizTipi: 'Saha İlerleme Tespiti',
                    tespitEdilenAsama: 'Demir Donatı & Kalıp İşleri',
                    fizikselIlerlemeKatkisi: 5,
                    detay: 'A Blok 4. Kat tabliye demir donatı serimi tamamlanmış, paspayı takozları yerleştirilmiş. Beton dökümüne hazır hale gelinmiş.'
                };
                details = `
                    <div style="font-size:0.85rem; line-height:1.5; color:var(--text-main);">
                        • <strong>Tespit Edilen Aşama:</strong> ${extractedData.tespitEdilenAsama}<br>
                        • <strong>Fiziksel İlerleme:</strong> +%5 artış sağlandı.<br>
                        • <strong>AI Gözlem Notu:</strong> ${extractedData.detay}<br>
                        • <strong>İSG Durumu:</strong> Güvenli (Kask ve yelek kullanımı tam)<br>
                        • <strong>Tespit Güveni:</strong> %95.1
                    </div>
                `;

                if (activeProj) {
                    activeProj.progress = Math.min(100, (activeProj.progress || 0) + 5);
                }
                window.BrenerApp.saveStateToStorage();
                window.BrenerApp.showToast('success', 'Şantiye ilerleme fotoğrafı işlendi ve ilerleme %5 artırıldı!');
                window.BrenerApp.logActivity('santiye', `AI Webhook: Şantiye ilerleme tespiti (+%5)`, 'success', extractedData.detay);

            } else {
                title = '📝 Saha Malzeme Talebi (OCR) Sonucu';
                statusText = 'Yeni Saha Talebi Oluşturuldu';
                extractedData = {
                    talepEden: 'Şantiye Şefliği',
                    malzemeler: [
                        { urun: 'İSG Bareti (Sarı)', miktar: 20 },
                        { urun: 'Koruyucu İş Çizmesi (Çelik Burunlu)', miktar: 10 }
                    ],
                    not: 'El yazısı notundan dijital forma dönüştürüldü.'
                };
                details = `
                    <div style="font-size:0.85rem; line-height:1.5; color:var(--text-main);">
                        • <strong>Talep Sahibi:</strong> Şantiye Şefliği (Emre Türedi)<br>
                        • <strong>Çıkarılan Malzemeler:</strong><br>
                          - 20 Adet: İSG Bareti (Sarı)<br>
                          - 10 Adet: Koruyucu İş Çizmesi (Çelik Burunlu)<br>
                        • <strong>AI El Yazısı Okuma Güveni:</strong> %92.8
                    </div>
                `;

                const requests = window.BrenerApp.state.requests || [];
                const nextNum = requests.length + 1;
                const newId = `AI-TAL-${nextNum.toString().padStart(3, '0')}`;
                requests.unshift({
                    id: newId,
                    title: `${extractedData.malzemeler.map(m => `${m.miktar} adet ${m.urun}`).join(', ')}`,
                    category: 'Malzeme',
                    priority: 'Yüksek',
                    date: new Date().toISOString().split('T')[0],
                    status: 'pending',
                    description: 'Telegram/WhatsApp AI Fotoğraf Okuyucu Tarafından Otomatik Oluşturuldu.',
                    requester: 'Saha Şefi Emre'
                });

                window.BrenerApp.saveStateToStorage();
                window.BrenerApp.showToast('success', 'El yazısı talep fişi işlendi ve malzeme talebi oluşturuldu!');
                window.BrenerApp.logActivity('santiye', `AI Webhook: Malzeme talebi oluşturuldu (${newId})`, 'info');
            }

            resultCard.innerHTML = `
                <div class="card-header" style="border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-bottom:15px;">
                    <h2>${title}</h2>
                    <span class="badge ${badgeClass}">${statusText}</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:16px;">
                    <div style="background:rgba(var(--primary-rgb), 0.03); border:1px solid var(--border-color); border-radius:8px; padding:12px; font-size:0.8rem; font-family:monospace; color:var(--text-main); max-height:150px; overflow-y:auto;">
                        <strong>JSON Çıktısı (AI Parse):</strong>
                        <pre style="margin:5px 0 0 0; white-space:pre-wrap; font-family:inherit;">${JSON.stringify(extractedData, null, 2)}</pre>
                    </div>

                    <div style="padding:14px; border-left:3px solid var(--primary); background:rgba(255,255,255,0.02); border-radius:4px;">
                        <strong style="display:block; margin-bottom:6px; font-size:0.9rem; color:var(--text-main);">Detay Raporu:</strong>
                        ${details}
                    </div>

                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <span style="font-size:0.8rem; color:var(--success); font-weight:600; display:flex; align-items:center; gap:4px;">
                            ✔️ İlgili veri tabanlarına işlendi ve senkronize edildi.
                        </span>
                    </div>
                </div>
            `;
        }, 1500);
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
