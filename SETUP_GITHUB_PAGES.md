# 🔧 GitHub Pages Kurulum Rehberi - Detaylı Adımlar

Bu rehber, GitHub Pages'i etkinleştirmek ve dokümantasyonu yayınlamak için gerekli tüm adımları içerir.

## ⚠️ ÖNEMLİ: İlk Adım (Zorunlu)

**Workflow'u çalıştırmadan önce** aşağıdaki adımları tamamlamanız gerekiyor!

---

## 📝 Adım 1: Repository Settings'e Gidin

1. GitHub'da repository'nize gidin:
   ```
   https://github.com/pia-team/People-In-Axis-FE
   ```

2. **Settings** sekmesine tıklayın (sağ üstte, Code ve Issues'ın yanında)

3. Sol menüden **Pages** seçeneğine tıklayın

---

## 📝 Adım 2: GitHub Pages'i Etkinleştirin

**Build and deployment** bölümünde:

1. **Source** dropdown menüsünü açın
2. **"GitHub Actions"** seçeneğini seçin
3. **Save** butonuna tıklayın

✅ **Bu adım çok önemli!** Workflow çalışmadan önce mutlaka yapılmalı.

---

## 📝 Adım 3: Environment Kontrolü (İsteğe Bağlı)

1. **Settings** → **Environments** sekmesine gidin
2. **github-pages** environment'ının var olduğunu kontrol edin
3. Yoksa, Settings'te Pages'i etkinleştirdiğinizde otomatik oluşturulur

---

## 📝 Adım 4: Workflow'u Çalıştırın

### Seçenek A: Otomatik (Push ile)

1. `.davia/` klasörüne değişiklik yapın veya workflow dosyasını güncelleyin
2. Push yapın:
   ```bash
   git push origin unit-test
   ```
3. Workflow otomatik olarak çalışacak

### Seçenek B: Manuel

1. GitHub'da **Actions** sekmesine gidin
2. Sol menüden **"Deploy Documentation to GitHub Pages"** workflow'unu seçin
3. Sağ üstte **"Run workflow"** butonuna tıklayın
4. Branch: **unit-test** seçin
5. **"Run workflow"** butonuna tıklayın

---

## 📝 Adım 5: Deploy Durumunu Kontrol Edin

1. **Actions** sekmesine gidin
2. En üstteki workflow run'ını seçin
3. Deploy adımını kontrol edin
4. Başarılı olduktan sonra yeşil tik görünecek

---

## 📝 Adım 6: Dokümantasyonu Görüntüleyin

Deploy başarılı olduktan sonra:

1. **Settings** → **Pages** sekmesine tekrar gidin
2. En üstte **"Your site is live at"** mesajını göreceksiniz
3. URL'ye tıklayın veya şu adresi kullanın:

   ```
   https://pia-team.github.io/People-In-Axis-FE/
   ```

4. Ana sayfa:
   ```
   https://pia-team.github.io/People-In-Axis-FE/index.html
   ```

5. Diğer sayfalar:
   ```
   https://pia-team.github.io/People-In-Axis-FE/project-overview.html
   https://pia-team.github.io/People-In-Axis-FE/getting-started.html
   ```

---

## 🚨 Sorun Giderme

### Hata: "Get Pages site failed"

**Sebep:** GitHub Pages Settings'te etkinleştirilmemiş.

**Çözüm:**
1. **Settings** → **Pages** → **Source: GitHub Actions** → **Save**
2. Tekrar workflow'u çalıştırın

### Hata: "Resource not accessible by integration"

**Sebep:** Workflow'un Pages'i etkinleştirmek için yetkisi yok.

**Çözüm:**
- Pages'i manuel olarak Settings'te etkinleştirmelisiniz (Adım 2)

### Workflow Çalışmıyor

**Kontrol Listesi:**
- ✅ Settings → Pages → Source: **GitHub Actions** seçili mi?
- ✅ `.github/workflows/docs.yml` dosyası mevcut mu?
- ✅ `.davia/assets` klasörü mevcut mu?
- ✅ `.davia/assets/index.html` dosyası mevcut mu?
- ✅ Branch'e push yapıldı mı?

### Deploy Başarısız

**Kontrol:**
1. **Actions** sekmesine gidin
2. Başarısız workflow run'ını seçin
3. Hata mesajlarını kontrol edin
4. En yaygın sorunlar:
   - `.davia/assets` klasörü bulunamıyor
   - İzin hatası (Settings'te Pages etkinleştirilmemiş)

---

## ✅ Kontrol Listesi

Deploy başarılı olduktan sonra kontrol edin:

- [ ] Settings → Pages → Source: **GitHub Actions** seçili
- [ ] Actions → Workflow başarılı (yeşil tik)
- [ ] Dokümantasyon URL'de görüntüleniyor
- [ ] Ana sayfa (`index.html`) açılıyor
- [ ] Diğer sayfalar açılıyor (örn: `project-overview.html`)
- [ ] Linkler çalışıyor

---

## 📊 Zaman Çizelgesi

- **Settings'te Pages etkinleştirme:** 30 saniye
- **İlk deploy:** 2-5 dakika
- **Sonraki deploys:** 1-2 dakika
- **Toplam süre:** 3-6 dakika

---

## 🎯 Özet

1. **Settings** → **Pages** → **Source: GitHub Actions** → **Save**
2. **Actions** → Workflow'u çalıştır
3. Deploy'i bekle (2-5 dakika)
4. Dokümantasyonu görüntüle: `https://pia-team.github.io/People-In-Axis-FE/`

---

**Sorun devam ederse, yukarıdaki adımları tekrar kontrol edin!** 🚀

