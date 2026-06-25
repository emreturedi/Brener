/* ==========================================================================
   BRENER GROUP - ŞANTİYE YÖNETİMİ MODÜLÜ - TAM SÜRÜM
   ========================================================================== */

window.BrenerApp.Santiye = {
    render(view, container) {
        const activeProj = window.BrenerApp.getActiveProject();
        if (view === 'santiye-gunlugu')   this.renderDiary(activeProj, container);
        else if (view === 'is-programi')  this.renderGantt(activeProj, container);
        else if (view === 'personel-puantaj') this.renderAttendance(activeProj, container);
        else if (view === 'malzeme-stok') this.renderStock(activeProj, container);
        else if (view === 'isg-kaza')     this.renderHse(activeProj, container);
        else if (view === 'hava-beton')   this.renderConcrete(activeProj, container);
    },

    /* ====================================================================
       1. ŞANTİYE GÜNLÜĞÜ
    ==================================================================== */
    renderDiary(project, container) {
        window.BrenerApp.updateTopbarTitle('Şantiye Günlüğü', `${project.name} — Günlük Rapor Kayıt Defteri`);

        let logs = JSON.parse(localStorage.getItem(`brener_diary_${project.id}`)) || [
            { id: 1, date: '2026-06-24', weather: '☀️ Açık, 30°C', tasks: 'A Blok zemin kat kolon demiri döşendi. B Blok temel kalıbı çakıldı. C Blok hafriyat tamamlandı.', crew: '12 Kalıpçı, 8 Demirci, 2 Mühendis, 1 İSG Uzmanı', materials: '25 Ton Nervürlü Demir Q12, 120 Torba Çimento', notes: 'Güvenlik denetimi tamamlandı. Vardiya kesintisiz devam etti.', progress: 68 },
            { id: 2, date: '2026-06-23', weather: '⛅ Az Bulutlu, 28°C', tasks: 'A Blok temel betonu döküldü, kürleme yapıldı. C Blok kazı işleri sürdü. Zemin araştırma raporu alındı.', crew: '10 Kalıpçı, 10 Demirci, 1 Kepçe Operatörü', materials: '180 m³ C30 Hazır Beton, 5 Ton Donatı', notes: 'Slump testi: S3 – uygun. 28 gün sonra mukavemet ölçümü yapılacak.', progress: 66 }
        ];

        const today = new Date().toLocaleDateString('tr-TR');
        const todayLog = logs[0];

        container.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">

            <!-- SOL: Yeni Günlük Giriş Formu -->
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
                    <input type="number" id="diaryProgress" value="${project.progress}" min="0" max="100">
                </div>
                <button class="btn btn-primary" id="saveDiaryBtn" style="width:100%;margin-top:8px;">
                    💾 Günlük Kaydı Oluştur
                </button>
            </div>

            <!-- SAĞ: Son Özet + İstatistikler -->
            <div style="display:flex;flex-direction:column;gap:16px;">
                <!-- Proje Özeti -->
                <div class="card" style="background:linear-gradient(135deg,rgba(204,163,82,0.08),rgba(204,163,82,0.02));border-color:rgba(204,163,82,0.3);">
                    <h3 style="font-size:0.9rem;color:var(--primary);margin-bottom:16px;text-transform:uppercase;letter-spacing:1px;">📊 Aktif Proje Durumu</h3>
                    <div style="font-size:1.1rem;font-weight:700;margin-bottom:6px;">${project.name}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:16px;">📍 ${project.location}</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.82rem;">
                        <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="color:var(--text-muted);">Bütçe</div>
                            <div style="font-weight:700;color:var(--primary);margin-top:3px;">${(project.budget/1000000).toFixed(0)}M ₺</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="color:var(--text-muted);">Harcama</div>
                            <div style="font-weight:700;color:var(--warning);margin-top:3px;">${(project.spent/1000000).toFixed(1)}M ₺</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="color:var(--text-muted);">Şef</div>
                            <div style="font-weight:700;margin-top:3px;">${project.manager}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;border:1px solid var(--border-color);">
                            <div style="color:var(--text-muted);">İlerleme</div>
                            <div style="font-weight:700;color:var(--success);margin-top:3px;">%${project.progress}</div>
                        </div>
                    </div>
                    <div style="margin-top:14px;">
                        <div class="progress-bar-bg" style="height:8px;border-radius:4px;">
                            <div class="progress-bar-fill" style="width:${project.progress}%;border-radius:4px;background:linear-gradient(90deg,var(--primary),#ebd197);"></div>
                        </div>
                    </div>
                </div>

                <!-- Son Kayıt Özeti -->
                ${todayLog ? `
                <div class="card">
                    <h3 style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">📖 Son Günlük Özeti — ${todayLog.date}</h3>
                    <div style="display:flex;align-items:center;gap:8px;font-size:0.9rem;margin-bottom:8px;">
                        <span>${todayLog.weather}</span>
                        <span style="color:var(--text-muted);">•</span>
                        <span style="color:var(--success);">%${todayLog.progress} İlerleme</span>
                    </div>
                    <p style="font-size:0.83rem;line-height:1.5;color:var(--text-main);">${todayLog.tasks}</p>
                    <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.75rem;color:var(--text-muted);">
                        <div>👷 ${todayLog.crew}</div>
                        <div>📦 ${todayLog.materials}</div>
                    </div>
                </div>` : ''}
            </div>
        </div>

        <!-- Geçmiş Günlük Kayıtlar -->
        <div class="card">
            <div class="card-header" style="margin-bottom:20px;">
                <h2>📚 Geçmiş Günlük Kayıtlar</h2>
                <button class="btn btn-secondary btn-sm" onclick="window.BrenerApp.showToast('info','Günlük rapor PDF olarak dışa aktarıldı.')">📥 Tümünü Dışa Aktar</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px;" id="diaryLogList">
                ${logs.map(l => `
                <div style="border:1px solid var(--border-color);border-radius:10px;padding:16px;background:rgba(255,255,255,0.01);transition:all 0.2s;" onmouseenter="this.style.borderColor='var(--primary)'" onmouseleave="this.style.borderColor='var(--border-color)'">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">📅 ${l.date}</span>
                            <span style="font-size:0.8rem;color:var(--text-muted);">${l.weather}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="background:rgba(16,185,129,0.1);border:1px solid var(--success);color:var(--success);padding:2px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;">%${l.progress} İlerleme</span>
                        </div>
                    </div>
                    <p style="font-size:0.85rem;line-height:1.5;margin-bottom:10px;">${l.tasks}</p>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.78rem;color:var(--text-muted);border-top:1px dashed var(--border-color);padding-top:10px;">
                        <div>👷‍♂️ <strong style="color:var(--text-main);">Ekip:</strong> ${l.crew}</div>
                        <div>📦 <strong style="color:var(--text-main);">Malzeme:</strong> ${l.materials}</div>
                        ${l.notes ? `<div style="grid-column:1/-1;">📝 <strong style="color:var(--text-main);">Not:</strong> ${l.notes}</div>` : ''}
                    </div>
                </div>`).join('')}
            </div>
        </div>`;

        document.getElementById('saveDiaryBtn').onclick = () => {
            const tasks = document.getElementById('diaryTasks').value.trim();
            const crew  = document.getElementById('diaryCrew').value.trim();
            if (!tasks || !crew) { alert('Lütfen çalışmaları ve ekip bilgisini doldurun!'); return; }
            const newLog = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                weather:   document.getElementById('diaryWeather').value.trim(),
                tasks,
                crew,
                materials: document.getElementById('diaryMaterials').value.trim(),
                notes:     document.getElementById('diaryNotes').value.trim(),
                progress:  parseInt(document.getElementById('diaryProgress').value) || project.progress
            };
            logs.unshift(newLog);
            localStorage.setItem(`brener_diary_${project.id}`, JSON.stringify(logs));
            window.BrenerApp.showToast('success', 'Günlük şantiye raporu başarıyla kaydedildi.');
            this.renderDiary(project, container);
        };
    },

    /* ====================================================================
       2. İŞ PROGRAMI — İnteraktif Gantt
    ==================================================================== */
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
            window.BrenerApp.showToast('success', `${name} personel listesine eklendi.`);
            this.renderAttendance(project, container);
        };

        document.getElementById('markAllPresentBtn').onclick = () => {
            employees.forEach(emp => {
                localStorage.setItem(`p_${project.id}_${emp.id}_${today}`, 'geldi');
            });
            window.BrenerApp.showToast('success', 'Tüm personel GELDİ olarak işaretlendi.');
            this.renderAttendance(project, container);
        };
    },

    savePuantaj(projectId, empId, date, status) {
        localStorage.setItem(`p_${projectId}_${empId}_${date}`, status);
        const labels = { geldi:'GELDİ ✅', gelmedi:'GELMEDİ ❌', izinli:'İZİNLİ 🏖️' };
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
            if (amt <= 0) { alert('Geçerli bir miktar girin!'); return; }
            if (type === 'add') {
                mat.stock += amt;
                window.BrenerApp.showToast('success', `${mat.name} stoğuna +${amt} ${mat.unit} eklendi.`);
            } else {
                if (mat.stock < amt) { window.BrenerApp.showToast('danger','Yetersiz stok miktarı!'); return; }
                mat.stock -= amt;
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
            pours.unshift({ id: Date.now(), project:project.name, date:new Date().toISOString().split('T')[0], grade, volume, temp, slump, notes, status:'Döküldü (Kürleniyor)' });
            window.BrenerApp.saveStateToStorage();
            window.BrenerApp.showToast('success', 'Beton dökümü raporlandı. Laboratuvar numune kaydı açıldı.');
            this.renderConcrete(project, container);
        };
    }
};
