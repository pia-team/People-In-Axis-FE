# People In Axis - Frontend (React + TypeScript)

## İnsan Kaynakları ve Zaman Yönetim Sistemi - UI

### Teknoloji Stack
- **React 18.2** - Modern UI library
- **TypeScript 5.3** - Type-safe development
- **Material UI 5.15** - Component library
- **Redux Toolkit** - State management
- **React Query** - Server state management & caching
- **React Router v6** - Client-side routing
- **Keycloak JS** - Authentication & authorization
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Yup** - Schema validation
- **Vite** - Build tool & dev server
- **Vitest** - Unit testing framework

### Özellikler
- ✅ Modern ve responsive UI (Material UI)
- ✅ TypeScript ile tam tip güvenliği
- ✅ Keycloak OAuth2 entegrasyonu
- ✅ Role-based erişim kontrolü (RBAC)
- ✅ Çoklu dil desteği (TR/EN) - i18next
- ✅ Dark/Light tema desteği
- ✅ Real-time bildirimler (Notistack)
- ✅ Excel import/export
- ✅ Grafik ve raporlama (Chart.js, Recharts)
- ✅ Form validation (Yup + React Hook Form)
- ✅ Comprehensive unit test coverage
- ✅ CV Sharing modülü (Pozisyonlar, Başvurular, CV Havuzu)
- ✅ Timesheet yönetimi (Zaman çizelgesi takibi)

---

## Gereksinimler

- **Node.js** 18+ 
- **npm** 9+ veya **yarn** 1.22+
- **Backend API** çalışıyor olmalı (port 8080)
- **Keycloak** server çalışıyor olmalı (port 8180)

---

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
# npm kullanarak
npm install

# veya yarn kullanarak
yarn install
```

### 2. Ortam Değişkenleri

Proje, environment variable'ları kullanarak local development ve production arasında otomatik geçiş yapar.

**Local Development için:**

1. `.env.local` dosyası oluşturun (bu dosya git'e commit edilmez):
```bash
cp .env.example .env.local
```

2. `.env.local` dosyasını düzenleyin:
```env
# Local Backend API
VITE_API_BASE_URL=http://localhost:8080/api

# Local UI
VITE_UI_BASE_URL=http://localhost:3000

# Keycloak (local veya development)
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=people-in-axis
VITE_KEYCLOAK_CLIENT_ID=people-in-axis-frontend

# Authentication
VITE_AUTH_ENABLED=true
```

**Production Build için:**

Production build (`npm run build`) otomatik olarak `.env.production` dosyasını kullanır. Bu dosya zaten projede mevcuttur ve production API URL'lerini içerir:
- `VITE_API_BASE_URL=https://people-in-axis-api.dnext-pia.com/api`
- `VITE_UI_BASE_URL=https://people-in-axis-ui.dnext-pia.com`

**Environment Dosyaları Hiyerarşisi:**

Vite, environment dosyalarını şu sırayla yükler (yüksek öncelikten düşüğe):

**Development Mode (`npm run dev`):**
1. `.env.development.local` (varsa, git'e commit edilmez)
2. `.env.local` ✓ **Kullanılır** (git'e commit edilmez)
3. `.env.development` (varsa, git'e commit edilir)
4. `.env` (varsa, git'e commit edilir - **gereksiz, kullanmayın**)

**Production Mode (`npm run build`):**
1. `.env.production.local` (varsa, git'e commit edilmez)
2. `.env.local` (varsa, ama production değerleri override eder)
3. `.env.production` ✓ **Kullanılır** (git'e commit edilir)
4. `.env` (varsa, git'e commit edilir - **gereksiz, kullanmayın**)

**Özet:**
- **Local Development**: `.env.local` dosyası kullanılır
- **Production Build**: `.env.production` dosyası kullanılır
- **Template**: `.env.example` dosyası referans için kullanılır (git'e commit edilir)

### 3. Keycloak Client Yapılandırması

Keycloak admin konsolunda:
1. "people-in-axis" realm'ine gidin
2. Client oluşturun:
   - **Client ID**: `people-in-axis-frontend`
   - **Client Protocol**: `openid-connect`
   - **Root URL**: `http://localhost:3000`
   - **Valid Redirect URIs**: `http://localhost:3000/*`
   - **Web Origins**: `http://localhost:3000`
   - **Access Type**: `public`

### 4. Uygulamayı Çalıştırma

```bash
# Development mode
npm run dev
# veya
yarn dev

# Uygulama http://localhost:3000 adresinde çalışacak
```

---

## Build ve Production

### Production Build

```bash
# Build oluştur (TypeScript check + Vite build)
npm run build
# veya
yarn build

# Build'i önizle (production build'i local'de test et)
npm run preview
# veya
yarn preview
```

**Not:** Production build sırasında test dosyaları otomatik olarak exclude edilir. Test dosyaları sadece test ortamında çalıştırılır ve production bundle'a dahil edilmez.

### Docker Build

```bash
# Docker image oluştur
docker build -t people-in-axis-frontend:1.0.0 .

# Container çalıştır
docker run -p 3000:80 \
  -e VITE_API_BASE_URL=http://api.example.com \
  -e VITE_KEYCLOAK_URL=http://keycloak.example.com \
  people-in-axis-frontend:1.0.0
```

---

## Proje Yapısı

```
src/
├── assets/          # Statik dosyalar (resimler, fontlar)
├── components/      # Tekrar kullanılabilir componentler
│   ├── auth/       # Authentication componentleri
│   ├── common/     # Genel UI componentleri
│   ├── cv-sharing/ # CV Sharing modülü componentleri
│   ├── forms/      # Form componentleri
│   └── ui/         # UI componentleri (Button, Card, etc.)
├── config/         # Uygulama konfigürasyonu
├── hooks/          # Custom React hooks
├── layouts/        # Sayfa layout'ları (MainLayout, AuthLayout)
├── pages/          # Sayfa componentleri
│   ├── auth/       # Login, Unauthorized sayfaları
│   ├── employees/  # Çalışan yönetimi sayfaları
│   ├── companies/  # Şirket yönetimi sayfaları
│   ├── cv-sharing/ # CV Sharing modülü sayfaları
│   │   ├── applications/ # Başvuru yönetimi
│   │   ├── positions/    # Pozisyon yönetimi
│   │   ├── pool-cvs/     # CV Havuzu yönetimi
│   │   └── settings/     # Eşleştirme ayarları
│   ├── timesheets/ # Zaman çizelgesi sayfaları
│   ├── expenses/   # Masraf yönetimi sayfaları
│   ├── projects/   # Proje yönetimi sayfaları
│   └── admin/      # Admin sayfaları
├── providers/      # Context providers (KeycloakProvider)
├── services/       # API servisleri
│   ├── cv-sharing/ # CV Sharing API servisleri
│   └── ...
├── store/          # Redux store
│   └── slices/     # Redux slices
├── types/          # TypeScript tip tanımlamaları
├── utils/          # Yardımcı fonksiyonlar (validation, formatting)
├── test/           # Test dosyaları ve utilities
│   ├── setup.ts    # Test setup (vitest)
│   └── utils.tsx   # Test utilities (custom render)
└── i18n/           # Çoklu dil dosyaları
```

---

## Ana Modüller ve Özellikler

### 1. Dashboard
- Genel özet istatistikler
- Son aktiviteler
- Hızlı erişim linkleri
- Grafik ve chart'lar

### 2. Çalışan Yönetimi (Employee Management)
- Çalışan listesi ve gelişmiş arama
- Çalışan detay görüntüleme
- Yeni çalışan ekleme ve düzenleme
- Excel'den toplu import
- Excel'e export
- Çalışan profili yönetimi

### 3. Şirket ve Departman Yönetimi
- Şirket listesi ve yönetimi
- Departman yönetimi
- Hiyerarşik organizasyon yapısı

### 4. Proje Yönetimi
- Proje listesi ve detayları
- Proje oluşturma ve düzenleme
- Proje takım üyeleri yönetimi

### 5. Masraf Yönetimi (Expense Management)
- Masraf girişi ve takibi
- Fatura/fiş yükleme
- Onay süreci ve workflow
- Masraf raporları
- Excel export

---

## CV Sharing Modülü

CV Sharing modülü, işe alım süreçlerini yönetmek için kapsamlı bir çözüm sunar. Pozisyon ilanları, başvurular ve CV havuzu yönetimini içerir.

### Modül Yapısı

CV Sharing modülü şu alt modüllerden oluşur:
- **Positions (Pozisyonlar)** - Açık pozisyonların yönetimi
- **Applications (Başvurular)** - Aday başvurularının takibi
- **Pool CVs (CV Havuzu)** - CV havuzu yönetimi ve eşleştirme
- **Settings (Ayarlar)** - Eşleştirme algoritması ayarları

---

### Positions (Pozisyonlar)

**Rota:** `/cv-sharing/positions`

**Yetki Gereksinimleri:** `HUMAN_RESOURCES`, `COMPANY_MANAGER`

#### PositionList - Pozisyon Listesi
**Rota:** `/cv-sharing/positions`

**İşlevler:**
- Tüm açık pozisyonların listelenmesi
- Gelişmiş filtreleme (durum, departman, iş tipi)
- Arama fonksiyonu
- Sayfalama (pagination)
- Pozisyon durumu yönetimi (ACTIVE, CLOSED, DRAFT, ARCHIVED)
- Toplu işlemler (arşivleme, kopyalama)

**Özellikler:**
- **DataGrid** ile gelişmiş tablo görünümü
- Filtreleme: Durum, Departman, İş Tipi (Full-time, Part-time, Contract)
- Sıralama ve sayfalama
- Hızlı işlemler: Görüntüle, Düzenle, Arşivle, Kopyala
- Export işlevi (CSV formatında)

**Kullanım Senaryoları:**
1. Yeni bir pozisyon oluşturmak için "New Position" butonuna tıklayın
2. Mevcut pozisyonları filtreleyerek görüntüleyin
3. Pozisyon detayına gitmek için satıra tıklayın
4. Toplu işlemler için pozisyonları seçip menüden işlem seçin

#### PositionDetail - Pozisyon Detayı
**Rota:** `/cv-sharing/positions/:id`

**İşlevler:**
- Pozisyonun detaylı bilgilerini görüntüleme
- Pozisyon bilgilerini düzenleme
- Pozisyona yapılan başvuruları görüntüleme
- CV Havuzundan eşleşen adayları görüntüleme
- Pozisyon durumunu değiştirme
- Pozisyonu arşivleme veya kopyalama

**Sekmeler:**
1. **Overview** - Pozisyon genel bilgileri
   - Başlık, açıklama, gereksinimler
   - Maaş aralığı, konum, iş tipi
   - Departman ve sorumlu kişiler
   
2. **Applications** - Başvurular
   - Pozisyona yapılan tüm başvurular
   - Başvuru durumları (NEW, IN_REVIEW, ACCEPTED, REJECTED)
   - Başvuru filtreleme ve sıralama
   
3. **Matches** - Eşleşmeler
   - CV Havuzundan otomatik eşleşen adaylar
   - Eşleşme skoru ve detayları
   - Eşleşmeleri onaylama/reddetme

**Kullanım Senaryoları:**
1. Pozisyon bilgilerini güncellemek için "Edit" butonuna tıklayın
2. Başvuruları incelemek için "Applications" sekmesine geçin
3. Eşleşen adayları görmek için "Matches" sekmesini kullanın
4. Pozisyonu kapatmak için durumu "CLOSED" olarak değiştirin

#### PositionForm - Pozisyon Oluşturma/Düzenleme
**Rota:** `/cv-sharing/positions/new` veya `/cv-sharing/positions/:id/edit`

**İşlevler:**
- Yeni pozisyon oluşturma
- Mevcut pozisyonu düzenleme
- Form validasyonu
- Gereksinimler ve yetenekler tanımlama
- Maaş aralığı ve çalışma koşulları belirleme

**Form Alanları:**
- **Temel Bilgiler:**
  - Başlık (Title) - Zorunlu
  - Departman - Zorunlu
  - Açıklama (Description) - Zorunlu
  - İş Tipi (Work Type) - Full-time, Part-time, Contract
  - Konum (Location) - Ofis veya Remote
  
- **Gereksinimler:**
  - Minimum deneyim yılı
  - Eğitim seviyesi
  - Gerekli yetenekler (Skills)
  - Diller ve seviyeleri
  
- **Maaş ve Koşullar:**
  - Maaş aralığı (min-max)
  - Çalışma saatleri
  - Avantajlar ve yan haklar

**Kullanım Senaryoları:**
1. Yeni bir pozisyon ilanı oluşturmak için tüm alanları doldurun
2. Mevcut pozisyonu güncellemek için değişiklikleri yapıp kaydedin
3. Gereksinimleri detaylı şekilde tanımlayarak eşleştirme kalitesini artırın

---

### Applications (Başvurular)

**Rota:** `/cv-sharing/applications`

**Yetki:** Tüm kullanıcılar (ancak bazı işlemler için özel yetkiler gerekir)

#### ApplicationList - Başvuru Listesi
**Rota:** `/cv-sharing/applications`

**İşlevler:**
- Tüm başvuruların listelenmesi
- Gelişmiş filtreleme (durum, pozisyon, tarih aralığı)
- Arama fonksiyonu (isim, email, pozisyon)
- Sayfalama ve sıralama
- Toplu işlemler (forward, status update)
- Export işlevi (CSV)

**Filtreler:**
- **Status:** NEW, IN_REVIEW, FORWARDED, MEETING_SCHEDULED, ACCEPTED, REJECTED, WITHDRAWN
- **Position:** Belirli bir pozisyona göre filtreleme
- **Date Range:** Başvuru tarih aralığı
- **Department:** Departmana göre filtreleme

**Kullanım Senaryoları:**
1. Yeni başvuruları görmek için status filtresini "NEW" yapın
2. Belirli bir pozisyonun başvurularını görmek için pozisyon filtresini kullanın
3. Başvuru detayına gitmek için satıra tıklayın
4. Toplu işlem yapmak için başvuruları seçip menüden işlem seçin

#### ApplicationDetail - Başvuru Detayı
**Rota:** `/cv-sharing/applications/:id`

**İşlevler:**
- Başvurunun detaylı bilgilerini görüntüleme
- Başvuru durumunu güncelleme
- Yorum (comment) ekleme ve görüntüleme
- Puanlama (rating) sistemi
- Toplantı planlama (meeting scheduling)
- Dosya yükleme ve indirme
- Başvuruyu iletme (forward) işlemi
- Başvuru geçmişi görüntüleme

**Ana Bölümler:**
1. **Kişisel Bilgiler:**
   - Ad, Soyad, Email, Telefon
   - TCKN, Doğum Tarihi, Adres
   - Profil fotoğrafı (varsa)

2. **Profesyonel Bilgiler:**
   - Deneyim yılı
   - Beklenen maaş
   - Müsait başlangıç tarihi
   - Bildirim süresi (notice period)

3. **Dokümanlar:**
   - CV dosyası
   - Kapak mektubu
   - Ek belgeler
   - Dosya indirme ve silme

4. **Değerlendirme:**
   - Durum (Status) - Dropdown ile değiştirilebilir
   - Yorumlar (Comments) - İç ve dış yorumlar
   - Puanlar (Ratings) - 1-5 yıldız puanlama
   - Toplantılar (Meetings) - Planlanan görüşmeler

5. **İşlemler:**
   - Durum güncelleme
   - Yorum ekleme
   - Puanlama
   - Toplantı planlama
   - Başvuruyu iletme (forward)
   - Dosya yükleme

**Kullanım Senaryoları:**
1. Başvuruyu değerlendirmek için detay sayfasına gidin
2. Yorum ekleyerek notlarınızı paylaşın
3. Puanlama yaparak adayı değerlendirin
4. Toplantı planlayarak görüşme yapın
5. Durumu güncelleyerek süreci ilerletin
6. Başvuruyu başka bir değerlendiriciye iletin

#### ApplicationForm - Başvuru Formu
**Rota:** `/cv-sharing/applications/new/:positionId`

**İşlevler:**
- Yeni başvuru oluşturma
- Multi-step form yapısı
- Form validasyonu (TCKN, email, telefon)
- Dosya yükleme (CV, kapak mektubu)
- KVKK onayı

**Form Adımları:**
1. **Kişisel Bilgiler:**
   - Ad, Soyad - Zorunlu
   - Email - Zorunlu, format kontrolü
   - Telefon - Zorunlu
   - TCKN - Zorunlu, doğrulama algoritması
   - Doğum Tarihi - Zorunlu
   - Adres - Zorunlu

2. **Profesyonel Detaylar:**
   - Deneyim yılı - Zorunlu
   - Beklenen maaş - Opsiyonel
   - Müsait başlangıç tarihi - Zorunlu
   - Bildirim süresi - Opsiyonel
   - Kapak mektubu - Opsiyonel

3. **Dokümanlar ve Onay:**
   - CV dosyası yükleme - Zorunlu (.pdf, .doc, .docx)
   - Ek belgeler - Opsiyonel
   - KVKK onayı - Zorunlu (checkbox)
   - Form gönderimi

**Kullanım Senaryoları:**
1. Pozisyon detay sayfasından "Apply" butonuna tıklayın
2. Tüm adımları tamamlayarak başvurunuzu oluşturun
3. CV'nizi ve diğer belgelerinizi yükleyin
4. KVKK onayını verip başvurunuzu gönderin

#### ApplicationReview - Başvuru Değerlendirme
**Rota:** `/cv-sharing/applications/:id/review`

**İşlevler:**
- Başvurunun detaylı değerlendirmesi
- Hızlı değerlendirme paneli
- Durum güncelleme
- Yorum ve puanlama ekleme
- Toplantı planlama kısayolu

#### ForwardDialog - Başvuru İletme
**Rota:** `/cv-sharing/applications/:id/forward`

**İşlevler:**
- Başvuruyu belirli kullanıcılara iletme
- Mesaj ekleme
- Toplu iletme işlemi
- İletme geçmişi

#### MeetingScheduler - Toplantı Planlayıcı
**Rota:** `/cv-sharing/applications/:id/meetings` veya `/cv-sharing/applications/:id/scheduler`

**İşlevler:**
- Toplantı planlama ve yönetimi
- Takvim entegrasyonu
- Toplantı hatırlatıcıları
- Toplantı notları ve sonuçları
- Toplantı iptali veya erteleme

---

### Pool CVs (CV Havuzu)

**Rota:** `/cv-sharing/pool-cvs`

**Yetki:** Tüm kullanıcılar (ancak bazı işlemler için `COMPANY_MANAGER` veya `ADMIN` gerekir)

#### PoolCVList - CV Havuzu Listesi
**Rota:** `/cv-sharing/pool-cvs`

**İşlevler:**
- CV havuzundaki tüm CV'lerin listelenmesi
- Gelişmiş filtreleme (durum, deneyim, etiketler)
- Arama fonksiyonu (isim, email, yetenekler)
- Görünüm modları (Card, List, Compact)
- CV durumu yönetimi (aktif/pasif)
- Pozisyonlarla otomatik eşleştirme
- CV'leri etiketleme (tagging)
- Export işlevi (CSV)

**Filtreler:**
- **Status:** Active, Inactive, All
- **Experience:** Deneyim yılı aralığı (0-2, 2-5, 5-10, 10+)
- **Tags:** Etiketlere göre filtreleme
- **Skills:** Yeteneklere göre arama
- **Languages:** Dillere göre filtreleme

**Görünüm Modları:**
1. **Card View:** Kart görünümü, detaylı bilgiler
2. **List View:** Liste görünümü, kompakt
3. **Compact View:** Mini kart görünümü, hızlı tarama

**İşlemler:**
- CV detayına gitme
- CV durumunu aktif/pasif yapma
- CV'yi pozisyonlarla eşleştirme
- CV'ye etiket ekleme
- CV'yi düzenleme veya silme
- CV'yi export etme

**Kullanım Senaryoları:**
1. Tüm aktif CV'leri görmek için status filtresini "Active" yapın
2. Belirli yeteneklere sahip adayları bulmak için arama yapın
3. CV kartına tıklayarak detaylı bilgileri görüntüleyin
4. "Match with Positions" butonuyla uygun pozisyonları bulun
5. CV'yi etiketleyerek kategorize edin

#### PoolCVDetail - CV Detayı
**Rota:** `/cv-sharing/pool-cvs/:id`

**İşlevler:**
- CV'nin detaylı bilgilerini görüntüleme
- CV bilgilerini düzenleme
- Dosya yükleme ve indirme (CV, sertifikalar)
- Etiket yönetimi
- Pozisyon eşleştirmeleri görüntüleme
- CV durumunu aktif/pasif yapma
- CV geçmişi

**Ana Bölümler:**
1. **Kişisel Bilgiler:**
   - Ad, Soyad, Email, Telefon
   - TCKN, Doğum Tarihi, Adres
   - Profil fotoğrafı

2. **Profesyonel Bilgiler:**
   - Deneyim yılı
   - Mevcut pozisyon
   - Eğitim geçmişi
   - Sertifikalar

3. **Yetenekler:**
   - Teknik yetenekler (Skills)
   - Diller ve seviyeleri
   - Etiketler (Tags)

4. **Dosyalar:**
   - CV dosyası
   - Sertifikalar
   - Diğer belgeler
   - Dosya yükleme ve indirme

5. **Eşleştirmeler:**
   - Uygun pozisyonlar
   - Eşleşme skoru
   - Eşleşme geçmişi

**Kullanım Senaryoları:**
1. CV detay sayfasına giderek adayın tüm bilgilerini inceleyin
2. Dosyaları indirerek CV'yi detaylı inceleyin
3. Etiketler ekleyerek CV'yi kategorize edin
4. "Match Positions" butonuyla uygun pozisyonları bulun
5. CV durumunu güncelleyerek aktif/pasif yapın

#### PoolCVForm - CV Oluşturma/Düzenleme
**Rota:** `/cv-sharing/pool-cvs/new` veya `/cv-sharing/pool-cvs/:id/edit`

**İşlevler:**
- Yeni CV ekleme (manuel veya dosya yükleme)
- Mevcut CV'yi düzenleme
- Form validasyonu
- Yetenek ve dil ekleme
- Etiket yönetimi

**Form Alanları:**
- Kişisel bilgiler (Ad, Soyad, Email, Telefon, TCKN, Adres)
- Profesyonel bilgiler (Deneyim, Pozisyon, Eğitim)
- Yetenekler ve diller
- Dosya yükleme
- Etiketler

**Kullanım Senaryoları:**
1. Yeni bir CV eklemek için formu doldurun
2. CV dosyasını yükleyerek bilgileri otomatik çıkarın
3. Yetenekleri ve dilleri ekleyin
4. Etiketler ekleyerek CV'yi kategorize edin

---

### Matching Settings (Eşleştirme Ayarları)

**Rota:** `/cv-sharing/settings/matching`

**Yetki Gereksinimleri:** `HUMAN_RESOURCES`, `COMPANY_MANAGER`

**İşlevler:**
- Eşleştirme algoritması ayarları
- Skor hesaplama kriterleri
- Ağırlıklandırma ayarları
- Otomatik eşleştirme aktif/pasif yapma

**Ayarlar:**
- **Skills Matching:** Yetenek eşleşmesi ağırlığı
- **Experience Matching:** Deneyim eşleşmesi ağırlığı
- **Education Matching:** Eğitim eşleşmesi ağırlığı
- **Language Matching:** Dil eşleşmesi ağırlığı
- **Threshold:** Minimum eşleşme skoru (threshold)
- **Auto-match:** Otomatik eşleştirme aktif/pasif

**Kullanım Senaryoları:**
1. Eşleştirme kalitesini artırmak için ağırlıkları ayarlayın
2. Minimum eşleşme skorunu belirleyin
3. Otomatik eşleştirmeyi aktif edin veya pasif yapın

---

## Timesheet Modülü

Timesheet modülü, çalışanların çalışma saatlerini takip etmek ve yönetmek için kapsamlı bir çözüm sunar.

### Modül Yapısı

Timesheet modülü şu sayfalardan oluşur:
- **My TimeSheets** - Kullanıcının kendi timesheet'leri
- **All TimeSheets** - Tüm timesheet'ler (yöneticiler için)
- **TimeSheet Detail** - Timesheet detayı ve yönetimi
- **TimeSheet Form** - Yeni timesheet oluşturma/düzenleme
- **TimeSheet Approval** - Timesheet onay süreci
- **Admin TimeSheet Approval** - Admin onay süreci
- **Team Lead Assigned** - Takım lideri atamalı satırlar
- **TimeSheet Import** - Excel'den import

---

### My TimeSheets - Kendi TimeSheet'lerim

**Rota:** `/timesheets/my`

**Yetki:** Tüm kullanıcılar

**İşlevler:**
- Kullanıcının kendi timesheet'lerini görüntüleme
- Timesheet listesi ve filtreleme
- Timesheet durumu takibi
- Sayfalama

**Görüntülenen Bilgiler:**
- Proje adı
- Çalışma tarihi
- Çalışılan saatler
- Durum (DRAFT, SUBMITTED, APPROVED, REJECTED, COMPLETED)

**Kullanım Senaryoları:**
1. Kendi timesheet'lerinizi görmek için bu sayfaya gidin
2. Belirli bir tarih aralığındaki timesheet'leri filtreleyin
3. Duruma göre filtreleyerek onay bekleyenleri görebilirsiniz
4. Timesheet detayına gitmek için satıra tıklayın

---

### TimeSheet List - Tüm TimeSheet'ler

**Rota:** `/timesheets`

**Yetki Gereksinimleri:** `TEAM_MANAGER`, `HUMAN_RESOURCES`, `ADMIN`

**İşlevler:**
- Tüm çalışanların timesheet'lerini görüntüleme
- Gelişmiş filtreleme (çalışan, proje, tarih, durum)
- Arama fonksiyonu
- Excel'den import
- Sayfalama ve sıralama

**Filtreler:**
- **Employee:** Çalışana göre filtreleme
- **Project:** Projeye göre filtreleme
- **Date Range:** Tarih aralığı
- **Status:** Duruma göre filtreleme (DRAFT, SUBMITTED, APPROVED, REJECTED, COMPLETED)

**Kullanım Senaryoları:**
1. Tüm timesheet'leri görmek için bu sayfaya gidin
2. Belirli bir çalışanın timesheet'lerini filtreleyin
3. Onay bekleyen timesheet'leri görmek için durum filtresini kullanın
4. Excel'den toplu import yapmak için "Import" butonuna tıklayın

---

### TimeSheet Detail - TimeSheet Detayı

**Rota:** `/timesheets/:id`

**İşlevler:**
- Timesheet'in detaylı bilgilerini görüntüleme
- Timesheet satırlarını (rows) görüntüleme ve yönetme
- Satır ekleme, düzenleme, silme
- Satır atama (team lead için)
- Satır onaylama/reddetme
- Timesheet gönderme (submit)
- Timesheet iptal etme (cancel)
- Timesheet kopyalama (clone)
- TimeSheet geçmişi (history) görüntüleme
- Company reject işlemi

**Ana Bölümler:**

1. **TimeSheet Bilgileri:**
   - Çalışan adı
   - Proje adı
   - Çalışma tarihi
   - Toplam saatler
   - Durum ve base durum
   - Oluşturulma ve güncellenme tarihleri

2. **TimeSheet Satırları (Rows):**
   - Her satır için: Tarih, Saat, Görev/Task
   - Satır durumu (PENDING, APPROVED, REJECTED)
   - Satır işlemleri: Düzenle, Sil, Onayla, Reddet, Ata

3. **İşlemler:**
   - **Submit:** Timesheet'i gönderme (DRAFT → SUBMITTED)
   - **Cancel:** Timesheet'i iptal etme (neden ile)
   - **Clone:** Timesheet'i kopyalama
   - **Add Row:** Yeni satır ekleme
   - **View History:** Geçmiş görüntüleme

4. **Hızlı Satır Ekleme:**
   - Tarih seçimi
   - Saat girişi
   - Görev/Task açıklaması
   - Hızlı ekleme butonu

**Rol Bazlı İşlemler:**

- **EMPLOYEE:**
  - Kendi timesheet'lerini görüntüleme ve düzenleme
  - Satır ekleme, düzenleme, silme
  - Timesheet gönderme (submit)
  - Timesheet iptal etme

- **TEAM_MANAGER:**
  - Atanmış satırları onaylama/reddetme
  - Satır atama işlemi
  - Timesheet onaylama/reddetme

- **HUMAN_RESOURCES:**
  - Tüm timesheet'leri görüntüleme
  - Timesheet onaylama/reddetme
  - Company reject işlemi

- **ADMIN:**
  - Tüm işlemleri gerçekleştirme
  - Admin onay süreci

**Kullanım Senaryoları:**

1. **Çalışan (Employee) İçin:**
   - Timesheet detayına gidin
   - Yeni satır eklemek için "Add Row" butonuna tıklayın
   - Tarih, saat ve görevi girin
   - Tüm satırları ekledikten sonra "Submit" butonuna tıklayın
   - Timesheet'iniz onay için gönderilecektir

2. **Takım Lideri (Team Manager) İçin:**
   - Timesheet detayına gidin
   - Atanmış satırları görmek için sayfayı inceleyin
   - Satırları onaylamak veya reddetmek için ilgili butonları kullanın
   - Satır ataması yapmak için "Assign" butonuna tıklayın

3. **İnsan Kaynakları (HR) İçin:**
   - Timesheet detayına gidin
   - Tüm bilgileri inceleyin
   - Onaylamak için "Approve" butonuna tıklayın
   - Reddetmek için "Reject" butonuna tıklayın ve not ekleyin

---

### TimeSheet Form - Yeni TimeSheet Oluşturma/Düzenleme

**Rota:** `/timesheets/new` veya `/timesheets/:id/edit`

**Yetki:** Tüm kullanıcılar (kendi timesheet'leri için)

**İşlevler:**
- Yeni timesheet oluşturma
- Mevcut timesheet'i düzenleme
- Proje seçimi
- Tarih seçimi
- Satır ekleme, düzenleme, silme
- Form validasyonu

**Form Alanları:**
- **Project:** Proje seçimi (dropdown) - Zorunlu
- **Work Date:** Çalışma tarihi - Zorunlu
- **Rows:** Timesheet satırları
  - Date (Tarih) - Zorunlu
  - Hours (Saat) - Zorunlu, pozitif sayı
  - Task (Görev) - Opsiyonel

**Validasyon Kuralları:**
- Proje seçimi zorunludur
- Tarih zorunludur
- En az bir satır eklenmelidir
- Toplam saatler pozitif olmalıdır
- Satır tarihleri timesheet tarihi ile uyumlu olmalıdır

**Kullanım Senaryoları:**
1. Yeni timesheet oluşturmak için "New TimeSheet" butonuna tıklayın
2. Projeyi seçin
3. Çalışma tarihini seçin
4. Satırlar ekleyin (tarih, saat, görev)
5. Kaydedin ve gerekirse gönderin

---

### TimeSheet Approval - TimeSheet Onay

**Rota:** `/timesheets/approval`

**Yetki Gereksinimleri:** `TEAM_MANAGER`, `HUMAN_RESOURCES`

**İşlevler:**
- Onay bekleyen timesheet'leri görüntüleme
- Toplu onaylama/reddetme
- Filtreleme ve arama
- Sayfalama
- Onay sayısı göstergesi

**Görüntülenen Bilgiler:**
- Çalışan adı
- Proje adı
- Çalışma tarihi
- Çalışılan saatler
- Durum
- Base durum
- İşlemler (Approve, Reject, Details)

**Kullanım Senaryoları:**
1. Onay bekleyen timesheet'leri görmek için bu sayfaya gidin
2. Timesheet detayına gitmek için "Details" butonuna tıklayın
3. Onaylamak için "Approve" butonuna tıklayın
4. Reddetmek için "Reject" butonuna tıklayın ve neden ekleyin
5. Toplu işlem yapmak için timesheet'leri seçip işlem yapın

---

### Admin TimeSheet Approval - Admin Onay

**Rota:** `/timesheets/admin-approval`

**Yetki Gereksinimleri:** `ADMIN`

**İşlevler:**
- Admin onayı bekleyen timesheet'leri görüntüleme
- Admin onayı verme/reddetme
- Filtreleme ve arama
- Sayfalama

**Özellikler:**
- Normal onay sürecinden geçmiş timesheet'ler için son onay
- Company reject işlemi
- Detaylı inceleme ve onay

**Kullanım Senaryoları:**
1. Admin onayı bekleyen timesheet'leri görüntüleyin
2. Timesheet detayını inceleyin
3. Final onayı verin veya reddedin

---

### Team Lead Assigned - Takım Lideri Atamalı Satırlar

**Rota:** `/timesheets/assigned`

**Yetki Gereksinimleri:** `TEAM_MANAGER`

**İşlevler:**
- Atanmış timesheet satırlarını görüntüleme
- Satır onaylama/reddetme
- Satır detaylarını görüntüleme
- Filtreleme ve arama

**Görüntülenen Bilgiler:**
- Timesheet ID
- Çalışan adı
- Proje adı
- Tarih
- Saat
- Görev/Task
- Durum

**Kullanım Senaryoları:**
1. Size atanmış satırları görmek için bu sayfaya gidin
2. Satır detayını inceleyin
3. Onaylamak veya reddetmek için ilgili butonları kullanın

---

### TimeSheet Import - Excel Import

**Rota:** `/timesheets/import`

**Yetki Gereksinimleri:** `HUMAN_RESOURCES`, `COMPANY_MANAGER`

**İşlevler:**
- Excel dosyasından timesheet'leri toplu import etme
- Import template indirme
- Import sonuçlarını görüntüleme (başarılı/başarısız)
- Hata mesajlarını görüntüleme

**Template Formatı:**
Excel template şu sütunları içerir:
- **EmployeeId** (required): Sistemde var olan çalışan ID'si
- **ProjectId** (optional): İlgili proje ID'si (boş bırakılabilir)
- **WorkDate** (required): Tarih formatı YYYY-MM-DD (örn. 2024-09-09)
- **HoursWorked** (optional): 7.5 gibi ondalıklı değer kabul eder
- **Task** (optional): Görev açıklaması
- **EmployeeName/ProjectName** (rehber amaçlı): Import sırasında dikkate alınmaz

**Import İşlemi:**
1. Template'i indirin
2. Template'i doldurun
3. Dosyayı yükleyin
4. Import sonuçlarını kontrol edin
5. Başarılı ve başarısız kayıtları görüntüleyin

**Kullanım Senaryoları:**
1. Toplu timesheet import yapmak için bu sayfaya gidin
2. Template'i indirip doldurun
3. Dosyayı yükleyin
4. Import sonuçlarını kontrol edin
5. Hatalı kayıtları düzeltip tekrar import edin

---

## Test ve Kod Kalitesi

### Test Komutları

```bash
# Unit testleri çalıştır
npm test

# Watch mode (geliştirme sırasında)
npm run test:watch

# Test UI (interaktif)
npm run test:ui

# Coverage raporu ile
npm run test:coverage
```

### Test Yapısı

- **Test Framework:** Vitest
- **Test Utilities:** React Testing Library
- **Coverage:** @vitest/coverage-v8
- **Mock:** Vi (Vitest built-in)

**Test Dosyaları Konumu:**
- Component testleri: `src/test/components/`
- Service testleri: `src/test/services/`
- Hook testleri: `src/test/hooks/`
- Utility testleri: `src/test/utils/`

### Kod Kalitesi

```bash
# Lint kontrolü
npm run lint

# Kod formatlama
npm run format
```

---

## Scripts

```json
{
  "dev": "Geliştirme sunucusunu başlatır (http://localhost:3000)",
  "build": "Production build oluşturur (TypeScript check + Vite build)",
  "preview": "Production build'i önizler",
  "lint": "ESLint ile kod kontrolü",
  "format": "Prettier ile kod formatlama",
  "test": "Unit testleri çalıştırır (vitest --run)",
  "test:watch": "Watch mode'da testleri çalıştırır",
  "test:ui": "Test UI'ı açar (interaktif)",
  "test:coverage": "Test coverage raporu oluşturur"
}
```

**Not:** `build` ve `dev` komutları sırasında test dosyaları otomatik olarak exclude edilir. Test dosyaları sadece test komutları çalıştırıldığında çalıştırılır.

---

## Kullanılan Kütüphaneler

### Core
- **react** (^18.2.0): UI library
- **react-dom** (^18.2.0): React DOM rendering
- **react-router-dom** (^6.22.1): Client-side routing
- **typescript** (^5.3.3): Type safety

### State Management
- **@reduxjs/toolkit** (^2.2.1): Redux state management
- **react-redux** (^9.1.0): React Redux bindings
- **@tanstack/react-query** (^5.22.2): Server state management & caching

### UI Components
- **@mui/material** (^5.15.10): Material UI components
- **@mui/icons-material** (^5.15.10): Material icons
- **@mui/x-data-grid** (^6.19.4): Advanced data grid
- **@mui/x-date-pickers** (^6.19.4): Date/time pickers

### Forms & Validation
- **react-hook-form** (^7.50.1): Form management
- **yup** (^1.3.3): Schema validation
- **@hookform/resolvers** (^3.3.4): Form validation resolvers

### Authentication
- **keycloak-js** (^24.1.0): Keycloak JavaScript adapter

### HTTP Client
- **axios** (^1.6.7): HTTP client

### Utilities
- **date-fns** (^2.30.0): Date utilities
- **i18next** (^23.10.0): Internationalization
- **react-i18next** (^14.0.5): React i18next bindings
- **notistack** (^3.1.0): Snackbar notifications
- **chart.js** (^4.4.1): Chart library
- **react-chartjs-2** (^5.2.0): React Chart.js wrapper
- **recharts** (^2.12.0): Composable charting library

### Testing
- **vitest** (^3.2.4): Unit testing framework
- **@vitest/coverage-v8** (^3.2.4): Coverage provider
- **@testing-library/react** (^16.3.0): React testing utilities
- **@testing-library/jest-dom** (^6.9.1): Custom matchers
- **@testing-library/user-event** (^14.6.1): User interaction simulation

### Build Tools
- **vite** (^6.3.6): Build tool & dev server
- **@vitejs/plugin-react** (^4.2.1): Vite React plugin

---

## Browser Desteği

- **Chrome** (son 2 versiyon)
- **Firefox** (son 2 versiyon)
- **Safari** (son 2 versiyon)
- **Edge** (son 2 versiyon)

---

## Güvenlik

### Authentication & Authorization
- Keycloak OAuth2/OpenID Connect entegrasyonu
- JWT token yönetimi
- Role-based access control (RBAC)
- Private route koruması

### Güvenlik Best Practices
- API isteklerinde token otomatik ekleme
- XSS koruması
- CSRF koruması (backend tarafında)
- Güvenli HTTP headers
- Environment variable'ların güvenli yönetimi

---

## Deployment

### Production Build

Production build oluşturulduğunda:
1. TypeScript type check yapılır
2. Vite production build oluşturulur
3. Test dosyaları otomatik exclude edilir
4. Optimize edilmiş bundle'lar oluşturulur
5. Source map'ler oluşturulur

### Environment Variables

Production ortamında aşağıdaki environment variable'lar ayarlanmalıdır:
- `VITE_API_BASE_URL`: Backend API URL'i
- `VITE_KEYCLOAK_URL`: Keycloak server URL'i
- `VITE_KEYCLOAK_REALM`: Keycloak realm adı
- `VITE_KEYCLOAK_CLIENT_ID`: Keycloak client ID
- `VITE_AUTH_ENABLED`: Authentication aktif/pasif (true/false)

---

## Sorun Giderme

### Yaygın Sorunlar

1. **Port 3000 zaten kullanılıyor:**
   ```bash
   # Vite config'de port değiştir veya
   # Farklı bir port kullan: npm run dev -- --port 3001
   ```

2. **API bağlantı hatası:**
   - Backend API'nin çalıştığından emin olun
   - `.env.local` dosyasındaki `VITE_API_BASE_URL` değerini kontrol edin
   - CORS ayarlarını kontrol edin

3. **Keycloak bağlantı hatası:**
   - Keycloak server'ın çalıştığından emin olun
   - `.env.local` dosyasındaki Keycloak ayarlarını kontrol edin
   - Keycloak realm ve client yapılandırmasını kontrol edin

4. **Test dosyaları bulunamıyor:**
   - `vitest.config.ts` dosyasındaki include/exclude ayarlarını kontrol edin
   - Test dosyalarının doğru konumda olduğundan emin olun

---

## Katkıda Bulunma

1. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
2. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
3. Branch'inizi push edin (`git push origin feature/amazing-feature`)
4. Pull Request oluşturun

---

## Lisans

MIT

---

## İletişim

**PIA Team** - peopleinaxis@example.com

---

## Sürüm Geçmişi

### v1.0.0 (2024)
- İlk stabil sürüm
- CV Sharing modülü
- Timesheet modülü
- Çalışan, Şirket, Departman yönetimi
- Masraf yönetimi
- Raporlama modülü
