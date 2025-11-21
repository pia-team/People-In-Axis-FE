# 🌐 Otomatik Dil Çeviri Rehberi

Bu rehber, LibreTranslate API kullanarak `en.json` dosyasını baz alarak yeni dil dosyalarını otomatik oluşturmayı açıklar.

## 🚀 Hızlı Başlangıç

### Tek Dil Çevirisi

```bash
npm run i18n:translate tr
```

Bu komut `en.json` dosyasını baz alarak `tr.json` dosyasını oluşturur veya günceller.

### Birden Fazla Dil

```bash
npm run i18n:translate tr fr de es pt
```

Bu komut Türkçe, Fransızca, Almanca, İspanyolca ve Portekizce çevirilerini oluşturur.

---

## 📋 Kullanım

### Temel Kullanım

```bash
# Türkçe çeviri oluştur
npm run i18n:translate tr

# Fransızca çeviri oluştur
npm run i18n:translate fr

# Birden fazla dil
npm run i18n:translate tr fr de es
```

### Seçenekler

```bash
# Mevcut çeviriyi zorla yeniden çevir (--force)
npm run i18n:translate tr --force

# Batch boyutunu ayarla (default: 10)
npm run i18n:translate tr --chunk 5

# API çağrıları arasındaki gecikmeyi ayarla (ms, default: 1000)
npm run i18n:translate tr --delay 500

# Sessiz mod (verbose output'u gizle)
npm run i18n:translate tr --quiet

# Yardım
npm run i18n:translate --help
```

### Önceden Tanımlı Komutlar

```bash
# Sadece Türkçe
npm run i18n:translate:tr

# Popüler dilleri çevir
npm run i18n:translate:all
```

---

## 🔧 Nasıl Çalışır?

### 1. Kaynak Dosya

Script `src/locales/en.json` dosyasını baz alır.

### 2. Çeviri İşlemi

1. **Flatten:** Nested JSON yapısını dot notation'a çevirir
   - `{ common: { save: "Save" } }` → `{ "common.save": "Save" }`

2. **Cache Kontrolü:** Daha önce çevrilmiş metinleri cache'den kontrol eder
   - Cache dosyası: `src/cache.json`

3. **API Çağrısı:** Eksik çeviriler için LibreTranslate API'yi çağırır
   - Rate limiting için delay ekler
   - Retry mekanizması var

4. **Unflatten:** Çevrilmiş metinleri tekrar nested JSON yapısına çevirir
   - `{ "common.save": "Kaydet" }` → `{ common: { save: "Kaydet" } }`

5. **Dosya Yazma:** `src/locales/{lang}.json` dosyasını oluşturur veya günceller

### 3. Cache Mekanizması

- Cache dosyası: `src/cache.json`
- Format: `{ "key|source|target|text": "translated" }`
- Tekrar çeviri yapmaz, cache'den okur
- `--force` ile cache'i atlayabilirsiniz

---

## 🌍 Desteklenen Diller

LibreTranslate şu dilleri destekler:

- `en` - English
- `ar` - Arabic
- `az` - Azerbaijani
- `zh` - Chinese
- `cs` - Czech
- `nl` - Dutch
- `eo` - Esperanto
- `fi` - Finnish
- `fr` - French
- `de` - German
- `el` - Greek
- `hi` - Hindi
- `hu` - Hungarian
- `id` - Indonesian
- `ga` - Irish
- `it` - Italian
- `ja` - Japanese
- `ko` - Korean
- `pl` - Polish
- `pt` - Portuguese
- `ru` - Russian
- `sk` - Slovak
- `es` - Spanish
- `sv` - Swedish
- `tr` - Turkish
- `uk` - Ukrainian
- `vi` - Vietnamese

---

## ⚙️ Yapılandırma

### Environment Variables

`.env` dosyasında tanımlayabilirsiniz:

```env
# LibreTranslate API URL (opsiyonel)
TRANSLATE_API_URL=https://libretranslate.com/translate
```

Varsayılan: `https://libretranslate.com/translate`

### package.json Scripts

```json
{
  "scripts": {
    "i18n:translate": "node src/scripts/translate.js",
    "i18n:translate:tr": "node src/scripts/translate.js tr",
    "i18n:translate:all": "node src/scripts/translate.js tr fr de es pt it ru ja zh ko ar hi"
  }
}
```

---

## 📝 Örnek Kullanım Senaryoları

### Senaryo 1: Yeni Dil Ekleme

```bash
# 1. en.json dosyasını hazırla (tüm çeviri anahtarları ile)
# 2. Yeni dil için çeviri oluştur
npm run i18n:translate fr

# 3. Oluşturulan fr.json dosyasını kontrol et
# 4. Gerekirse manuel düzenlemeler yap
```

### Senaryo 2: Eksik Çevirileri Tamamlama

```bash
# en.json'a yeni anahtarlar eklediniz
# tr.json'da eksik kalanları çevir
npm run i18n:translate tr

# Script sadece eksik anahtarları çevirecek
```

### Senaryo 3: Tüm Çevirileri Yenileme

```bash
# Mevcut çevirileri zorla yeniden çevir
npm run i18n:translate tr --force
```

### Senaryo 4: Batch İşlem

```bash
# Birden fazla dili tek seferde çevir
npm run i18n:translate tr fr de es pt it

# Script her dil için sırayla çeviri yapacak
```

---

## 🔍 Dosya Yapısı

```
src/
├── locales/
│   ├── en.json          # Kaynak dil (base)
│   ├── tr.json          # Türkçe (otomatik oluşturulur)
│   ├── fr.json          # Fransızca (otomatik oluşturulur)
│   └── ...
├── scripts/
│   └── translate.js     # Çeviri script'i
└── cache.json           # Çeviri cache'i (otomatik oluşturulur)
```

---

## ⚠️ Önemli Notlar

### 1. Cache Dosyası

- `cache.json` dosyası otomatik oluşturulur
- `.gitignore`'a eklenmeli (isteğe bağlı)
- Cache sayesinde tekrar çeviri yapılmaz, daha hızlı çalışır

### 2. Rate Limiting

- LibreTranslate API rate limit'e sahip
- Script otomatik olarak delay ekler (default: 1000ms)
- `--delay` ile ayarlanabilir

### 3. Hata Yönetimi

- Çeviri başarısız olursa orijinal metin (İngilizce) kullanılır
- Retry mekanizması var (3 deneme)
- Başarısız çeviriler log'lanır

### 4. Mevcut Dosyalar

- Eğer hedef dil dosyası varsa, sadece eksik anahtarlar çevrilir
- Mevcut çeviriler korunur (merge yapılır)
- `--force` ile tüm dosya yeniden çevrilir

---

## 🐛 Sorun Giderme

### Hata: "Language not supported"

**Çözüm:** Desteklenen dil kodlarını kontrol edin:
```bash
npm run i18n:translate --help
```

### Hata: "Rate limited"

**Çözüm:** Daha uzun delay kullanın:
```bash
npm run i18n:translate tr --delay 2000
```

### Hata: "Missing base file"

**Çözüm:** `src/locales/en.json` dosyasının var olduğundan emin olun.

### Çeviriler Kalitesiz

**Çözüm:** 
1. Otomatik çevirileri kontrol edin
2. Gerekirse manuel düzenlemeler yapın
3. Önemli metinler için profesyonel çeviri kullanın

---

## 🎯 Best Practices

1. **İlk Çeviri:** Yeni dil eklerken önce otomatik çeviri yapın, sonra manuel düzenleyin
2. **Cache Kullanımı:** Cache'i commit etmeyin, her geliştirici kendi cache'ini oluşturur
3. **Batch Size:** Büyük dosyalar için `--chunk 5` gibi küçük batch size kullanın
4. **Delay:** Rate limit hatası alırsanız `--delay` değerini artırın
5. **Manuel Düzenleme:** Önemli metinler için otomatik çevirileri kontrol edin

---

## 📚 Örnekler

### Örnek 1: Türkçe Çeviri Oluşturma

```bash
npm run i18n:translate tr
```

**Çıktı:**
```
🌐 Translating to Turkish (tr)
   Source: src/locales/en.json
   Target: src/locales/tr.json
   Missing keys: 734 / 734
   Chunk size: 10, Delay: 1000ms

✅ [TR] common.dashboard
   "Dashboard" → "Dashboard"

✅ [TR] common.save
   "Save" → "Kaydet"

📊 Progress: 100% (734/734)

✅ Translation complete!
   Translated: 734
   Cached: 0
   Failed: 0
   File: src/locales/tr.json
```

### Örnek 2: Birden Fazla Dil

```bash
npm run i18n:translate tr fr de
```

Her dil için ayrı ayrı çeviri yapılır ve sonunda özet gösterilir.

---

**Sorun mu yaşıyorsunuz?** `npm run i18n:translate --help` komutu ile yardım alabilirsiniz! 🚀

