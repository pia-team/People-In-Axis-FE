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

### Kullanılan Roller (Roles)

Sistemde aşağıdaki roller kullanılmaktadır. Roller Keycloak üzerinden yönetilir:

- **ADMIN** - Tam yönetici erişimi, tüm modüllere erişim ve sistem ayarları
- **SYSTEM_ADMIN** - Sistem seviyesi yönetici, `/system-admin/**` endpoint'lerine erişim
- **HUMAN_RESOURCES** - İnsan kaynakları yönetimi, çalışan/şirket/departman yönetimi, timesheet/expense onayı, raporlama
- **TEAM_MANAGER** - Takım lideri, timesheet/expense onayı (takım seviyesinde), proje oluşturma/güncelleme
- **COMPANY_MANAGER** - Şirket yöneticisi, şirket modülüne erişim, raporlama, CV Sharing modülü yönetimi
- **FINANCE** - Finans ekibi, expense onayı ve ödeme işlemleri, expense import/export
- **Authenticated (Giriş Yapmış Kullanıcı)** - Tüm giriş yapmış kullanıcılar, kendi timesheet/expense'lerini görüntüleme ve oluşturma

**Not:** Roller Keycloak realm'inde tanımlıdır ve JWT token'ında `realm_access.roles` içinde bulunur. Backend'de `ROLE_<ROL_ADI>` formatında kullanılır.

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

CV Sharing modülü, işe alım süreçlerini yönetmek için kapsamlı bir çözüm sunar. Pozisyon ilanları, başvurular ve CV havuzu yönetimini içerir. Modül, HR departmanları ve işe alım ekipleri için tasarlanmıştır ve aday başvurularının tüm yaşam döngüsünü yönetir.

### Modül Yapısı

CV Sharing modülü şu alt modüllerden oluşur:
- **Positions (Pozisyonlar)** - Açık pozisyonların yönetimi ve ilan oluşturma
- **Applications (Başvurular)** - Aday başvurularının takibi ve değerlendirme süreci
- **Pool CVs (CV Havuzu)** - CV havuzu yönetimi ve otomatik eşleştirme
- **Settings (Ayarlar)** - Eşleştirme algoritması ayarları ve konfigürasyon

### API Entegrasyonu

Modül, backend API ile tam entegre çalışır:
- **Base URL:** `/api/cv-sharing`
- **Authentication:** Keycloak JWT token ile korumalı
- **Data Format:** JSON (request/response)
- **Pagination:** Spring Data Page formatı (0-based indexing)

---

## CV Sharing Modülü Sayfaları

### Positions (Pozisyonlar) Modülü

#### PositionList - Pozisyon Listesi Sayfası

**Rota:** `/cv-sharing/positions`  
**Dosya:** `src/pages/cv-sharing/positions/PositionList.tsx`  
**Yetki Gereksinimleri:** `HUMAN_RESOURCES`, `COMPANY_MANAGER`

**Amaç ve İşlev:**
PositionList sayfası, sistemdeki tüm açık pozisyonların merkezi yönetim noktasıdır. HR yöneticileri ve şirket yöneticileri bu sayfa üzerinden pozisyonları görüntüleyebilir, filtreleyebilir, arayabilir ve yönetebilir.

**Temel Özellikler:**
- **Gelişmiş DataGrid:** Material-UI DataGrid komponenti ile zengin tablo görünümü
- **Çoklu Filtreleme:** Durum, departman, iş tipi, tarih aralığı gibi kriterlere göre filtreleme
- **Gerçek Zamanlı Arama:** Başlık, açıklama ve departman alanlarında anlık arama
- **Sayfalama:** Büyük veri setleri için optimize edilmiş sayfalama (10, 25, 50, 100 kayıt/sekte)
- **Sıralama:** Her sütuna göre artan/azalan sıralama
- **Toplu İşlemler:** Birden fazla pozisyonu seçerek toplu arşivleme, kopyalama, durum değiştirme
- **Export:** CSV formatında veri dışa aktarma

**Görüntülenen Bilgiler:**
- Pozisyon başlığı (Title)
- Departman adı
- İş tipi (Full-time, Part-time, Contract)
- Durum (ACTIVE, CLOSED, DRAFT, ARCHIVED)
- Oluşturulma tarihi
- Başvuru sayısı
- Eşleşme sayısı

**Durum Yönetimi:**
- **ACTIVE:** Aktif pozisyon, başvuru kabul ediyor
- **CLOSED:** Kapatılmış pozisyon, yeni başvuru kabul etmiyor
- **DRAFT:** Taslak pozisyon, henüz yayınlanmamış
- **ARCHIVED:** Arşivlenmiş pozisyon, görünürlüğü kısıtlı

**Kullanım Senaryoları:**
1. **Yeni Pozisyon Oluşturma:**
   - "New Position" butonuna tıklayın
   - Yönlendirileceğiniz form sayfasında tüm bilgileri doldurun

2. **Pozisyon Arama ve Filtreleme:**
   - Üst kısımdaki arama kutusuna pozisyon adı veya departman yazın
   - Sol paneldeki filtreleri kullanarak durum, departman veya iş tipine göre filtreleyin
   - Tarih aralığı seçerek belirli bir dönemdeki pozisyonları görüntüleyin

3. **Pozisyon Detayına Erişim:**
   - Tablodaki herhangi bir satıra tıklayarak pozisyon detay sayfasına gidin
   - Detay sayfasında başvuruları, eşleşmeleri ve pozisyon bilgilerini görüntüleyin

4. **Toplu İşlemler:**
   - Tablodaki checkbox'ları kullanarak birden fazla pozisyon seçin
   - Üst menüden "Archive", "Duplicate" veya "Change Status" seçeneklerini kullanın

5. **Veri Dışa Aktarma:**
   - "Export" butonuna tıklayarak mevcut filtrelenmiş verileri CSV formatında indirin

**Teknik Detaylar:**
- **State Management:** React Query ile server state yönetimi
- **Caching:** 5 dakika cache süresi ile performans optimizasyonu
- **Optimistic Updates:** Durum değişikliklerinde anlık UI güncellemesi
- **Error Handling:** Kapsamlı hata yönetimi ve kullanıcı bildirimleri

---

#### PositionDetail - Pozisyon Detay Sayfası

**Rota:** `/cv-sharing/positions/:id`  
**Dosya:** `src/pages/cv-sharing/positions/PositionDetail.tsx`  
**Yetki Gereksinimleri:** `HUMAN_RESOURCES`, `COMPANY_MANAGER` (görüntüleme için tüm kullanıcılar)

**Amaç ve İşlev:**
PositionDetail sayfası, bir pozisyonun tüm detaylarını, başvurularını ve eşleşmelerini görüntülemek için kullanılır. Sekme tabanlı bir yapı ile farklı bilgi kategorilerini organize eder.

**Sekme Yapısı:**

1. **Overview (Genel Bakış) Sekmesi:**
   - **Pozisyon Temel Bilgileri:**
     - Başlık, açıklama, departman
     - İş tipi, konum, maaş aralığı
     - Oluşturulma ve güncellenme tarihleri
     - Durum ve görünürlük ayarları
   
   - **Gereksinimler:**
     - Minimum deneyim yılı
     - Eğitim seviyesi
     - Gerekli yetenekler (Skills) - zorunlu/opsiyonel işaretlemeli
     - Diller ve seviyeleri (A1-C2)
   
   - **İş Tanımı:**
     - Detaylı iş açıklaması (rich text)
     - Sorumluluklar
     - Avantajlar ve yan haklar
     - Çalışma koşulları

2. **Applications (Başvurular) Sekmesi:**
   - **Başvuru Listesi:**
     - Pozisyona yapılan tüm başvurular
     - Başvuru durumları (NEW, IN_REVIEW, ACCEPTED, REJECTED, etc.)
     - Başvuru tarihi ve aday bilgileri
     - Hızlı durum değiştirme
   
   - **Filtreleme ve Sıralama:**
     - Duruma göre filtreleme
     - Tarihe göre sıralama
     - Aday adına göre arama
   
   - **Hızlı İşlemler:**
     - Başvuru detayına gitme
     - Durum güncelleme
     - Toplu işlemler

3. **Matches (Eşleşmeler) Sekmesi:**
   - **Otomatik Eşleşmeler:**
     - CV Havuzundan otomatik eşleşen adaylar
     - Eşleşme skoru (0-100)
     - Eşleşme detayları (hangi kriterler eşleşti)
   
   - **Eşleşme Filtreleme:**
     - Minimum skor filtresi
     - Yetenek bazlı filtreleme
     - Deneyim bazlı filtreleme
   
   - **Eşleşme İşlemleri:**
     - Eşleşmeyi onaylama/reddetme
     - Adaya başvuru daveti gönderme
     - CV detayını görüntüleme

**İşlem Butonları:**
- **Edit:** Pozisyon bilgilerini düzenleme
- **Archive:** Pozisyonu arşivleme
- **Duplicate:** Pozisyonu kopyalama (yeni pozisyon oluşturma)
- **Change Status:** Durum değiştirme (ACTIVE ↔ CLOSED)
- **Export Applications:** Başvuruları CSV olarak dışa aktarma

**Kullanım Senaryoları:**
1. **Pozisyon Bilgilerini Güncelleme:**
   - "Edit" butonuna tıklayın
   - Form sayfasında değişiklikleri yapın
   - Kaydedin

2. **Başvuruları İnceleme:**
   - "Applications" sekmesine geçin
   - Yeni başvuruları görmek için durum filtresini "NEW" yapın
   - Başvuru detayına gitmek için satıra tıklayın

3. **Eşleşen Adayları Bulma:**
   - "Matches" sekmesine geçin
   - Eşleşme skoruna göre sıralayın
   - Yüksek skorlu adayları inceleyin
   - Uygun adaylara başvuru daveti gönderin

4. **Pozisyonu Kapatma:**
   - "Change Status" butonuna tıklayın
   - Durumu "CLOSED" olarak değiştirin
   - Kapatma nedenini girin (opsiyonel)

**Teknik Detaylar:**
- **Lazy Loading:** Sekmeler arasında geçişte veri yükleme
- **Real-time Updates:** WebSocket ile anlık başvuru bildirimleri (opsiyonel)
- **Optimistic UI:** Durum değişikliklerinde anlık görsel geri bildirim

---

#### PositionForm - Pozisyon Oluşturma/Düzenleme Formu

**Rota:** `/cv-sharing/positions/new` (yeni) veya `/cv-sharing/positions/:id/edit` (düzenleme)  
**Dosya:** `src/pages/cv-sharing/positions/PositionForm.tsx`  
**Yetki Gereksinimleri:** `HUMAN_RESOURCES`, `COMPANY_MANAGER`

**Amaç ve İşlev:**
PositionForm, yeni pozisyon oluşturma veya mevcut pozisyonu düzenleme için kapsamlı bir form sayfasıdır. Multi-step form yapısı ile kullanıcı deneyimini optimize eder.

**Form Yapısı:**

**1. Temel Bilgiler Bölümü:**
- **Title (Başlık):** *Zorunlu, 3-200 karakter*
- **Department (Departman):** *Zorunlu, dropdown seçimi*
- **Description (Açıklama):** *Zorunlu, rich text editor*
- **Work Type (İş Tipi):** *Zorunlu*
  - Full-time
  - Part-time
  - Contract
  - Internship
- **Location (Konum):** *Zorunlu*
  - Office (Ofis)
  - Remote (Uzaktan)
  - Hybrid (Hibrit)
- **Visibility (Görünürlük):** *Zorunlu*
  - PUBLIC (Herkese açık)
  - INTERNAL (Sadece şirket içi)
  - PRIVATE (Özel)

**2. Gereksinimler Bölümü:**
- **Minimum Experience (Minimum Deneyim):** *Zorunlu, 0-50 yıl*
- **Education Level (Eğitim Seviyesi):** *Opsiyonel*
  - High School
  - Associate Degree
  - Bachelor's Degree
  - Master's Degree
  - PhD
- **Required Skills (Gerekli Yetenekler):** *En az 1 zorunlu*
  - Yetenek adı
  - Zorunlu/Opsiyonel işareti
  - Minimum yeterlilik seviyesi (Beginner, Intermediate, Advanced, Expert)
  - Minimum deneyim yılı
- **Languages (Diller):** *Opsiyonel*
  - Dil kodu (TR, EN, DE, FR, etc.)
  - Minimum seviye (A1, A2, B1, B2, C1, C2)
  - Zorunlu/Opsiyonel işareti

**3. Maaş ve Koşullar Bölümü:**
- **Salary Range (Maaş Aralığı):**
  - Minimum maaş (TL)
  - Maximum maaş (TL)
  - Maaş tipi (Monthly, Yearly)
- **Benefits (Avantajlar):** *Checkbox listesi*
  - Health Insurance
  - Meal Card
  - Transportation
  - Gym Membership
  - Remote Work
  - Flexible Hours
  - etc.
- **Working Hours (Çalışma Saatleri):**
  - Haftalık çalışma saati
  - Esnek çalışma saatleri (evet/hayır)

**4. Ek Bilgiler:**
- **Application Deadline (Başvuru Son Tarihi):** *Opsiyonel*
- **Expected Start Date (Beklenen Başlangıç Tarihi):** *Opsiyonel*
- **Additional Notes (Ek Notlar):** *Opsiyonel, rich text*

**Form Validasyonu:**
- **Client-side:** React Hook Form + Yup schema validation
- **Server-side:** Backend API validasyonu
- **Real-time:** Alan bazlı anlık validasyon mesajları
- **TCKN Validation:** Türkiye Cumhuriyeti Kimlik Numarası algoritması

**Kullanım Senaryoları:**
1. **Yeni Pozisyon Oluşturma:**
   - PositionList sayfasından "New Position" butonuna tıklayın
   - Tüm bölümleri sırayla doldurun
   - "Save as Draft" ile taslak olarak kaydedin veya "Publish" ile yayınlayın

2. **Mevcut Pozisyonu Düzenleme:**
   - PositionDetail sayfasından "Edit" butonuna tıklayın
   - Değişiklikleri yapın
   - "Save Changes" ile kaydedin

3. **Pozisyonu Kopyalama:**
   - PositionDetail sayfasından "Duplicate" butonuna tıklayın
   - Form otomatik olarak doldurulur
   - Gerekli değişiklikleri yapın
   - Yeni pozisyon olarak kaydedin

**Teknik Detaylar:**
- **Form State:** React Hook Form ile yönetim
- **Auto-save:** Taslak otomatik kaydetme (localStorage)
- **File Upload:** CV ve belge yükleme için drag-and-drop desteği
- **Rich Text:** Quill veya TinyMCE editor entegrasyonu

---

### Applications (Başvurular) Modülü

#### ApplicationList - Başvuru Listesi Sayfası

**Rota:** `/cv-sharing/applications`  
**Dosya:** `src/pages/cv-sharing/applications/ApplicationList.tsx`  
**Yetki:** Tüm kullanıcılar (ancak bazı işlemler için özel yetkiler gerekir)

**Amaç ve İşlev:**
ApplicationList, sistemdeki tüm başvuruların merkezi görüntüleme ve yönetim noktasıdır. HR ekipleri ve değerlendiriciler bu sayfa üzerinden başvuruları filtreleyebilir, arayabilir ve yönetebilir.

**Temel Özellikler:**
- **Gelişmiş Filtreleme:** Durum, pozisyon, departman, tarih aralığı
- **Çoklu Arama:** Aday adı, email, pozisyon adı
- **Sayfalama:** Büyük veri setleri için optimize edilmiş sayfalama
- **Toplu İşlemler:** Birden fazla başvuruyu seçerek toplu durum değiştirme, iletme
- **Export:** CSV formatında veri dışa aktarma
- **Real-time Updates:** Yeni başvurular için anlık bildirimler

**Filtreler:**
- **Status (Durum):**
  - NEW (Yeni)
  - IN_REVIEW (İncelemede)
  - FORWARDED (İletildi)
  - MEETING_SCHEDULED (Toplantı Planlandı)
  - ACCEPTED (Kabul Edildi)
  - REJECTED (Reddedildi)
  - WITHDRAWN (Geri Çekildi)
  - ARCHIVED (Arşivlendi)
- **Position (Pozisyon):** Dropdown ile pozisyon seçimi
- **Date Range (Tarih Aralığı):** Başvuru tarihi aralığı
- **Department (Departman):** Departman bazlı filtreleme
- **Rating (Puan):** Minimum puan filtresi

**Görüntülenen Bilgiler:**
- Aday adı ve soyadı
- Email ve telefon
- Pozisyon adı
- Başvuru tarihi
- Durum (renk kodlu)
- Ortalama puan (yıldız gösterimi)
- Yorum sayısı
- Toplantı durumu

**Kullanım Senaryoları:**
1. **Yeni Başvuruları Görüntüleme:**
   - Durum filtresini "NEW" yapın
   - Yeni başvurular listelenir
   - Başvuru detayına gitmek için satıra tıklayın

2. **Belirli Pozisyonun Başvurularını Görüntüleme:**
   - Pozisyon filtresinden ilgili pozisyonu seçin
   - Sadece o pozisyona yapılan başvurular görüntülenir

3. **Toplu Durum Güncelleme:**
   - Birden fazla başvuruyu seçin
   - Üst menüden "Change Status" seçin
   - Yeni durumu seçin ve kaydedin

4. **Başvuruları İletme:**
   - İletmek istediğiniz başvuruları seçin
   - "Forward" butonuna tıklayın
   - Alıcı email adreslerini girin ve gönderin

**Teknik Detaylar:**
- **Server-side Filtering:** Filtreleme backend'de yapılır, performans optimizasyonu
- **Debounced Search:** Arama için debounce (300ms) ile gereksiz API çağrılarını önleme
- **Infinite Scroll:** Alternatif olarak sayfa sonuna gelindiğinde otomatik yükleme

---

#### ApplicationDetail - Başvuru Detay Sayfası

**Rota:** `/cv-sharing/applications/:id`  
**Dosya:** `src/pages/cv-sharing/applications/ApplicationDetail.tsx`  
**Yetki:** Tüm kullanıcılar (ancak bazı işlemler için özel yetkiler gerekir)

**Amaç ve İşlev:**
ApplicationDetail, bir başvurunun tüm detaylarını, değerlendirme sürecini ve ilgili tüm bilgileri görüntülemek için kullanılır. Değerlendiriciler bu sayfa üzerinden başvuruyu inceleyebilir, yorum ekleyebilir, puan verebilir ve durumu güncelleyebilir.

**Ana Bölümler:**

**1. Kişisel Bilgiler Bölümü:**
- **Temel Bilgiler:**
  - Ad, Soyad
  - Email (tıklanabilir, mailto linki)
  - Telefon (tıklanabilir, tel linki)
  - TCKN (maskelenmiş gösterim)
  - Doğum Tarihi
  - Adres
  - Profil fotoğrafı (varsa)

**2. Profesyonel Bilgiler Bölümü:**
- **Deneyim:**
  - Toplam deneyim yılı
  - Mevcut pozisyon (varsa)
  - Önceki iş deneyimleri
- **Beklentiler:**
  - Beklenen maaş
  - Müsait başlangıç tarihi
  - Bildirim süresi (gün)
- **Kapak Mektubu:**
  - Adayın yazdığı kapak mektubu (rich text)

**3. Dokümanlar Bölümü:**
- **CV Dosyası:**
  - Dosya adı, boyutu, yükleme tarihi
  - İndirme butonu
  - PDF önizleme (varsa)
- **Ek Belgeler:**
  - Sertifikalar
  - Referans mektupları
  - Diğer belgeler
  - Toplu indirme seçeneği

**4. Değerlendirme Bölümü:**
- **Durum Yönetimi:**
  - Mevcut durum (dropdown ile değiştirilebilir)
  - Durum geçmişi (timeline görünümü)
  - Durum değiştirme notu (opsiyonel)
- **Yorumlar:**
  - **İç Yorumlar:** Sadece sistem kullanıcıları görebilir
  - **Dış Yorumlar:** Adaya gönderilebilir
  - Yorum ekleme formu
  - Yorum geçmişi (tarih, kullanıcı, içerik)
  - Yorum düzenleme/silme (sadece kendi yorumları)
- **Puanlar (Ratings):**
  - Genel puan (1-5 yıldız)
  - Kategori bazlı puanlar:
    - Teknik Yetenekler
    - Deneyim
    - Eğitim
    - Dil
    - Kültürel Uyum
  - Puan geçmişi
  - Ortalama puan hesaplama
- **Toplantılar (Meetings):**
  - Planlanan toplantılar listesi
  - Toplantı detayları (tarih, saat, katılımcılar)
  - Toplantı durumu (SCHEDULED, COMPLETED, CANCELLED)
  - Toplantı notları
  - Yeni toplantı planlama butonu

**5. İşlemler Bölümü:**
- **Hızlı İşlemler:**
  - Durum güncelleme
  - Yorum ekleme
  - Puan verme
  - Toplantı planlama
  - Başvuruyu iletme (Forward)
  - Dosya yükleme
  - Başvuruyu arşivleme

**Kullanım Senaryoları:**
1. **Başvuruyu Değerlendirme:**
   - Başvuru detay sayfasına gidin
   - CV'yi indirip inceleyin
   - Yorum ekleyerek notlarınızı paylaşın
   - Puan vererek değerlendirmenizi kaydedin
   - Durumu güncelleyerek süreci ilerletin

2. **Toplantı Planlama:**
   - "Schedule Meeting" butonuna tıklayın
   - Toplantı tarihi, saati ve katılımcıları seçin
   - Toplantı linki (Zoom, Teams, etc.) ekleyin
   - Adaya otomatik email gönderilir

3. **Başvuruyu İletme:**
   - "Forward" butonuna tıklayın
   - Alıcı email adreslerini girin (virgülle ayırılmış)
   - İsteğe bağlı mesaj ekleyin
   - Gönderin

4. **Durum Güncelleme:**
   - Durum dropdown'ından yeni durumu seçin
   - Durum değişikliği notu ekleyin (opsiyonel)
   - Kaydedin
   - Adaya otomatik bildirim gönderilir (duruma göre)

**Teknik Detaylar:**
- **File Preview:** PDF ve görsel dosyalar için önizleme
- **Real-time Comments:** WebSocket ile anlık yorum güncellemeleri
- **Activity Timeline:** Tüm işlemlerin kronolojik görünümü
- **Email Notifications:** Durum değişikliklerinde otomatik email gönderimi

---

#### ApplicationForm - Başvuru Formu

**Rota:** `/cv-sharing/applications/new/:positionId`  
**Dosya:** `src/pages/cv-sharing/applications/ApplicationForm.tsx`  
**Yetki:** Tüm kullanıcılar (dış adaylar dahil)

**Amaç ve İşlev:**
ApplicationForm, adayların pozisyonlara başvuru yapması için kullanılan multi-step form sayfasıdır. Form, aday bilgilerini toplar, dosya yükleme imkanı sunar ve KVKK onayı alır.

**Form Adımları:**

**Adım 1: Kişisel Bilgiler**
- **Ad (First Name):** *Zorunlu, 2-50 karakter*
- **Soyad (Last Name):** *Zorunlu, 2-50 karakter*
- **Email:** *Zorunlu, email formatı kontrolü*
- **Telefon:** *Zorunlu, Türkiye telefon formatı (05XX XXX XX XX)*
- **TCKN:** *Zorunlu, 11 haneli, algoritma kontrolü*
- **Doğum Tarihi:** *Zorunlu, date picker*
- **Adres:** *Zorunlu, 10-500 karakter*

**Adım 2: Profesyonel Detaylar**
- **Deneyim Yılı:** *Zorunlu, 0-50 yıl*
- **Beklenen Maaş:** *Opsiyonel, sayısal değer*
- **Müsait Başlangıç Tarihi:** *Zorunlu, date picker*
- **Bildirim Süresi (Gün):** *Opsiyonel, 0-365 gün*
- **Kapak Mektubu:** *Opsiyonel, rich text editor, max 2000 karakter*

**Adım 3: Dokümanlar ve Onay**
- **CV Dosyası:** *Zorunlu*
  - Desteklenen formatlar: PDF, DOC, DOCX
  - Maksimum boyut: 10 MB
  - Drag-and-drop veya dosya seçici
- **Ek Belgeler:** *Opsiyonel*
  - Birden fazla dosya yükleme
  - Maksimum 5 dosya
  - Toplam maksimum boyut: 25 MB
- **KVKK Onayı:** *Zorunlu*
  - Kişisel verilerin işlenmesi onayı (checkbox)
  - KVKK metni linki
  - Onay verilmeden form gönderilemez

**Form Validasyonu:**
- **Client-side:** React Hook Form + Yup schema
- **TCKN Validation:** Türkiye Cumhuriyeti Kimlik Numarası algoritması
- **Email Validation:** RFC 5322 standart email formatı
- **Phone Validation:** Türkiye telefon numarası formatı
- **File Validation:** Dosya tipi ve boyut kontrolü

**Kullanım Senaryoları:**
1. **Pozisyon Detayından Başvuru:**
   - PositionDetail sayfasından "Apply" butonuna tıklayın
   - Form otomatik olarak pozisyon ID'si ile açılır
   - Tüm adımları tamamlayın
   - KVKK onayını verin
   - "Submit Application" butonuna tıklayın

2. **CV Havuzundan Başvuru:**
   - PoolCVDetail sayfasından "Apply to Position" butonuna tıklayın
   - Pozisyon seçin
   - Form açılır, bazı bilgiler otomatik doldurulur
   - Eksik bilgileri tamamlayın ve gönderin

**Teknik Detaylar:**
- **Progress Indicator:** Stepper component ile adım göstergesi
- **Auto-save:** Her adımda otomatik kaydetme (localStorage)
- **File Upload:** Axios ile multipart/form-data upload
- **Progress Bar:** Dosya yükleme sırasında ilerleme çubuğu
- **Error Recovery:** Hata durumunda form verilerinin korunması

---

#### ApplicationReview - Başvuru Değerlendirme Sayfası

**Rota:** `/cv-sharing/applications/:id/review`  
**Dosya:** `src/pages/cv-sharing/applications/ApplicationReview.tsx`  
**Yetki Gereksinimleri:** `HUMAN_RESOURCES`, `COMPANY_MANAGER`, `TEAM_MANAGER`

**Amaç ve İşlev:**
ApplicationReview, başvuruların hızlı değerlendirilmesi için optimize edilmiş bir sayfadır. Değerlendiriciler bu sayfa üzerinden hızlıca yorum ekleyebilir, puan verebilir ve karar verebilir.

**Özellikler:**
- **Kompakt Görünüm:** Tüm önemli bilgiler tek sayfada
- **Hızlı İşlemler:** Yorum, puan ve durum güncelleme için hızlı formlar
- **Karar Butonları:** Accept/Reject için tek tıkla işlem
- **Özet Bilgiler:** Aday özeti, pozisyon bilgisi, mevcut durum

**Kullanım Senaryoları:**
1. **Hızlı Değerlendirme:**
   - ApplicationList'ten "Quick Review" butonuna tıklayın
   - Özet bilgileri inceleyin
   - Yorum ekleyin ve puan verin
   - Karar verin (Accept/Reject)

---

#### ForwardDialog - Başvuru İletme Dialogu

**Rota:** `/cv-sharing/applications/:id/forward`  
**Dosya:** `src/pages/cv-sharing/applications/ForwardDialog.tsx`  
**Yetki:** Tüm kullanıcılar

**Amaç ve İşlev:**
ForwardDialog, başvuruları diğer değerlendiricilere veya yöneticilere iletmek için kullanılan bir dialog sayfasıdır.

**Form Alanları:**
- **Recipients (Alıcılar):** *Zorunlu*
  - Email adresleri (virgülle ayırılmış)
  - Email formatı kontrolü
  - Maksimum 10 alıcı
- **Message (Mesaj):** *Opsiyonel*
  - İletme mesajı
  - Rich text editor
  - Maksimum 1000 karakter

**Kullanım Senaryoları:**
1. **Başvuruyu İletme:**
   - ApplicationDetail sayfasından "Forward" butonuna tıklayın
   - Alıcı email adreslerini girin
   - İsteğe bağlı mesaj ekleyin
   - "Send" butonuna tıklayın
   - Alıcılara otomatik email gönderilir

---

#### MeetingScheduler - Toplantı Planlayıcı

**Rota:** `/cv-sharing/applications/:id/meetings` veya `/cv-sharing/applications/:id/scheduler`  
**Dosya:** `src/pages/cv-sharing/applications/MeetingScheduler.tsx`  
**Yetki:** Tüm kullanıcılar

**Amaç ve İşlev:**
MeetingScheduler, adaylarla yapılacak toplantıları planlamak ve yönetmek için kullanılan bir sayfadır. Takvim entegrasyonu ve otomatik hatırlatıcılar sunar.

**Özellikler:**
- **Takvim Görünümü:** Aylık, haftalık, günlük görünüm
- **Toplantı Oluşturma:** Tarih, saat, katılımcı seçimi
- **Video Konferans Entegrasyonu:** Zoom, Teams, Google Meet linkleri
- **Hatırlatıcılar:** Email ve sistem bildirimleri
- **Toplantı Notları:** Toplantı sonrası not ekleme

**Kullanım Senaryoları:**
1. **Toplantı Planlama:**
   - ApplicationDetail sayfasından "Schedule Meeting" butonuna tıklayın
   - Tarih ve saat seçin
   - Katılımcıları ekleyin
   - Video konferans linki ekleyin (opsiyonel)
   - "Create Meeting" butonuna tıklayın
   - Tüm katılımcılara otomatik email gönderilir

---

### Pool CVs (CV Havuzu) Modülü

#### PoolCVList - CV Havuzu Listesi Sayfası

**Rota:** `/cv-sharing/pool-cvs`  
**Dosya:** `src/pages/cv-sharing/pool-cvs/PoolCVList.tsx`  
**Yetki:** Tüm kullanıcılar (ancak bazı işlemler için `COMPANY_MANAGER` veya `ADMIN` gerekir)

**Amaç ve İşlev:**
PoolCVList, CV havuzundaki tüm CV'lerin görüntülenmesi, aranması ve yönetilmesi için kullanılan ana sayfadır. HR ekipleri bu sayfa üzerinden CV'leri görüntüleyebilir, filtreleyebilir ve pozisyonlarla eşleştirebilir.

**Temel Özellikler:**
- **Çoklu Görünüm Modları:** Card, List, Compact
- **Gelişmiş Filtreleme:** Durum, deneyim, etiket, yetenek, dil
- **Arama:** İsim, email, yetenek bazlı arama
- **Otomatik Eşleştirme:** Pozisyonlarla otomatik eşleştirme
- **Etiketleme:** CV'lere etiket ekleme ve filtreleme
- **Export:** CSV formatında veri dışa aktarma

**Görünüm Modları:**

1. **Card View (Kart Görünümü):**
   - Büyük kartlar, detaylı bilgiler
   - Profil fotoğrafı
   - Yetenekler ve diller
   - Eşleşme skorları
   - Hızlı işlem butonları

2. **List View (Liste Görünümü):**
   - Kompakt liste görünümü
   - Tablo benzeri yapı
   - Daha fazla CV aynı anda görüntüleme
   - Hızlı tarama için optimize

3. **Compact View (Kompakt Görünüm):**
   - Mini kartlar
   - Sadece temel bilgiler
   - Maksimum görünürlük
   - Hızlı seçim için optimize

**Filtreler:**
- **Status:** Active, Inactive, All
- **Experience:** 0-2, 2-5, 5-10, 10+ yıl
- **Tags:** Etiketlere göre filtreleme
- **Skills:** Yeteneklere göre arama
- **Languages:** Dillere göre filtreleme
- **Last Updated:** Son güncellenme tarihi

**İşlemler:**
- **View Detail:** CV detay sayfasına gitme
- **Edit:** CV düzenleme (yetki gerekir)
- **Delete:** CV silme (yetki gerekir)
- **Toggle Status:** Aktif/pasif durumu değiştirme
- **Match Positions:** Pozisyonlarla eşleştirme
- **Add Tags:** Etiket ekleme
- **Export:** CSV export

**Kullanım Senaryoları:**
1. **CV Arama:**
   - Üst kısımdaki arama kutusuna isim, email veya yetenek yazın
   - Sonuçlar anlık olarak filtrelenir

2. **Deneyim Bazlı Filtreleme:**
   - Sol paneldeki deneyim filtresini kullanın
   - Örneğin "5-10 years" seçerek 5-10 yıl deneyime sahip adayları görüntüleyin

3. **Pozisyonlarla Eşleştirme:**
   - CV kartındaki "Match Positions" butonuna tıklayın
   - Sistem otomatik olarak uygun pozisyonları bulur
   - Eşleşme skorlarını görüntüleyin
   - Uygun pozisyonlara başvuru daveti gönderin

4. **Etiket Yönetimi:**
   - CV kartındaki "Add Tags" butonuna tıklayın
   - Mevcut etiketlerden seçin veya yeni etiket oluşturun
   - Etiketlere göre filtreleme yapın

**Teknik Detaylar:**
- **Virtual Scrolling:** Büyük veri setleri için performans optimizasyonu
- **Lazy Loading:** Görünüm modu değiştiğinde veri yükleme
- **Caching:** React Query ile 5 dakika cache
- **Optimistic Updates:** Durum değişikliklerinde anlık UI güncellemesi

---

#### PoolCVDetail - CV Detay Sayfası

**Rota:** `/cv-sharing/pool-cvs/:id`  
**Dosya:** `src/pages/cv-sharing/pool-cvs/PoolCVDetail.tsx`  
**Yetki:** Tüm kullanıcılar (ancak düzenleme için `COMPANY_MANAGER` veya `ADMIN` gerekir)

**Amaç ve İşlev:**
PoolCVDetail, CV havuzundaki bir CV'nin tüm detaylarını görüntülemek ve yönetmek için kullanılan sayfadır. HR ekipleri bu sayfa üzerinden aday bilgilerini inceleyebilir, dosyaları indirebilir ve pozisyonlarla eşleştirebilir.

**Ana Bölümler:**

**1. Kişisel Bilgiler:**
- Ad, Soyad
- Email, Telefon
- TCKN (maskelenmiş)
- Doğum Tarihi
- Adres
- Profil fotoğrafı

**2. Profesyonel Bilgiler:**
- **Deneyim:**
  - Toplam deneyim yılı
  - İş geçmişi (şirket, pozisyon, süre)
  - Sorumluluklar ve başarılar
- **Eğitim:**
  - Okul adı, bölüm, derece
  - Mezuniyet tarihi
  - GPA (varsa)
- **Sertifikalar:**
  - Sertifika adı, kurum, tarih
  - Geçerlilik süresi

**3. Yetenekler:**
- **Teknik Yetenekler:**
  - Yetenek adı
  - Seviye (Beginner, Intermediate, Advanced, Expert)
  - Deneyim yılı
- **Diller:**
  - Dil adı
  - Seviye (A1-C2)
  - Sertifika (varsa)
- **Etiketler:**
  - Kategori etiketleri
  - Özel etiketler
  - Etiket ekleme/silme

**4. Dosyalar:**
- **CV Dosyası:**
  - Dosya adı, boyutu, yükleme tarihi
  - İndirme butonu
  - PDF önizleme
- **Sertifikalar:**
  - Sertifika dosyaları
  - Toplu indirme
- **Diğer Belgeler:**
  - Referans mektupları
  - Portföy dosyaları
  - Diğer ek belgeler

**5. Eşleştirmeler:**
- **Uygun Pozisyonlar:**
  - Pozisyon adı
  - Eşleşme skoru (0-100)
  - Eşleşme detayları (hangi kriterler eşleşti)
  - Başvuru durumu
- **Eşleşme Geçmişi:**
  - Geçmiş eşleştirmeler
  - Başvuru sonuçları
  - Notlar

**İşlem Butonları:**
- **Edit:** CV bilgilerini düzenleme
- **Toggle Status:** Aktif/pasif durumu değiştirme
- **Match Positions:** Pozisyonlarla eşleştirme
- **Add Tags:** Etiket ekleme
- **Upload Files:** Dosya yükleme
- **Delete:** CV silme (yetki gerekir)

**Kullanım Senaryoları:**
1. **CV İnceleme:**
   - CV detay sayfasına gidin
   - Tüm bilgileri inceleyin
   - CV dosyasını indirip detaylı inceleyin
   - Sertifikaları ve diğer belgeleri kontrol edin

2. **Pozisyonlarla Eşleştirme:**
   - "Match Positions" butonuna tıklayın
   - Sistem otomatik olarak uygun pozisyonları bulur
   - Eşleşme skorlarını inceleyin
   - Yüksek skorlu pozisyonlara başvuru daveti gönderin

3. **Etiket Yönetimi:**
   - "Add Tags" butonuna tıklayın
   - Mevcut etiketlerden seçin veya yeni etiket oluşturun
   - Etiketleri kullanarak CV'yi kategorize edin

4. **CV Güncelleme:**
   - "Edit" butonuna tıklayın
   - Form sayfasında değişiklikleri yapın
   - Kaydedin

**Teknik Detaylar:**
- **File Preview:** PDF ve görsel dosyalar için önizleme
- **Match Algorithm:** Backend'de çalışan eşleştirme algoritması
- **Tag Management:** Dinamik etiket sistemi
- **Activity Log:** Tüm işlemlerin kaydı

---

#### PoolCVForm - CV Oluşturma/Düzenleme Formu

**Rota:** `/cv-sharing/pool-cvs/new` (yeni) veya `/cv-sharing/pool-cvs/:id/edit` (düzenleme)  
**Dosya:** `src/pages/cv-sharing/pool-cvs/PoolCVForm.tsx`  
**Yetki Gereksinimleri:** `COMPANY_MANAGER`, `ADMIN`

**Amaç ve İşlev:**
PoolCVForm, CV havuzuna yeni CV eklemek veya mevcut CV'yi düzenlemek için kullanılan form sayfasıdır. Manuel veri girişi veya dosya yükleme ile CV eklenebilir.

**Form Alanları:**

**1. Kişisel Bilgiler:**
- Ad, Soyad *Zorunlu*
- Email *Zorunlu, email formatı*
- Telefon *Zorunlu*
- TCKN *Zorunlu, 11 haneli*
- Doğum Tarihi *Zorunlu*
- Adres *Zorunlu*

**2. Profesyonel Bilgiler:**
- **Deneyim:**
  - Toplam deneyim yılı *Zorunlu*
  - İş geçmişi (dinamik liste)
    - Şirket adı
    - Pozisyon
    - Başlangıç-Bitiş tarihi
    - Sorumluluklar
- **Eğitim:**
  - Okul adı
  - Bölüm
  - Derece
  - Mezuniyet tarihi
  - GPA (opsiyonel)
- **Sertifikalar:**
  - Sertifika adı
  - Kurum
  - Tarih
  - Geçerlilik süresi (opsiyonel)

**3. Yetenekler ve Diller:**
- **Yetenekler:**
  - Yetenek adı
  - Seviye (dropdown)
  - Deneyim yılı
- **Diller:**
  - Dil kodu (dropdown)
  - Seviye (A1-C2)
  - Sertifika (opsiyonel)

**4. Dosyalar:**
- **CV Dosyası:** *Zorunlu*
  - PDF, DOC, DOCX formatları
  - Maksimum 10 MB
- **Sertifikalar:** *Opsiyonel*
  - Birden fazla dosya
  - Maksimum 5 dosya
- **Diğer Belgeler:** *Opsiyonel*

**5. Etiketler:**
- Mevcut etiketlerden seçim
- Yeni etiket oluşturma
- Etiket silme

**6. Durum:**
- Aktif/Pasif seçimi
- Varsayılan: Aktif

**Kullanım Senaryoları:**
1. **Manuel CV Ekleme:**
   - "New CV" butonuna tıklayın
   - Tüm form alanlarını doldurun
   - CV dosyasını yükleyin
   - Etiketleri ekleyin
   - "Save" butonuna tıklayın

2. **CV Dosyasından Otomatik Çıkarma:**
   - CV dosyasını yükleyin
   - "Extract Information" butonuna tıklayın
   - Sistem otomatik olarak bilgileri çıkarır (AI destekli)
   - Çıkarılan bilgileri kontrol edin ve düzenleyin
   - Kaydedin

3. **Mevcut CV'yi Güncelleme:**
   - PoolCVDetail sayfasından "Edit" butonuna tıklayın
   - Form otomatik olarak doldurulur
   - Değişiklikleri yapın
   - Kaydedin

**Teknik Detaylar:**
- **AI Integration:** CV dosyasından otomatik bilgi çıkarma (opsiyonel)
- **File Upload:** Multipart/form-data ile dosya yükleme
- **Dynamic Fields:** İş geçmişi, eğitim, sertifika için dinamik alanlar
- **Auto-save:** Otomatik kaydetme (localStorage)

---

### Matching Settings (Eşleştirme Ayarları) Sayfası

**Rota:** `/cv-sharing/settings/matching`  
**Dosya:** `src/pages/cv-sharing/settings/MatchingSettings.tsx`  
**Yetki Gereksinimleri:** `HUMAN_RESOURCES`, `COMPANY_MANAGER`

**Amaç ve İşlev:**
MatchingSettings, CV-Pozisyon eşleştirme algoritmasının parametrelerini yönetmek için kullanılan ayar sayfasıdır. HR yöneticileri bu sayfa üzerinden eşleştirme kalitesini optimize edebilir.

**Ayarlar:**

**1. Ağırlıklandırma Ayarları (Weights):**
- **Skills Weight (Yetenek Ağırlığı):** 0-100, varsayılan: 30
- **Experience Weight (Deneyim Ağırlığı):** 0-100, varsayılan: 25
- **Education Weight (Eğitim Ağırlığı):** 0-100, varsayılan: 20
- **Language Weight (Dil Ağırlığı):** 0-100, varsayılan: 15
- **Semantic Weight (Anlamsal Ağırlık):** 0-100, varsayılan: 10
- **Toplam:** 100 olmalı (otomatik kontrol)

**2. Eşik Değerleri (Thresholds):**
- **Minimum Match Score:** 0-100, varsayılan: 60
  - Bu skorun altındaki eşleşmeler gösterilmez
- **High Match Score:** 0-100, varsayılan: 80
  - Bu skorun üstündeki eşleşmeler "yüksek uyum" olarak işaretlenir

**3. Otomatik Eşleştirme:**
- **Auto-match Enabled:** Otomatik eşleştirme aktif/pasif
- **Auto-match Interval:** Otomatik eşleştirme sıklığı (günlük, haftalık)
- **Notification:** Yeni eşleşmeler için bildirim gönderimi

**4. Gelişmiş Ayarlar:**
- **Skill Alias Management:** Yetenek eş anlamlıları yönetimi
- **Semantic Matching:** AI destekli anlamsal eşleştirme (opsiyonel)
- **Learning Mode:** Makine öğrenmesi ile algoritma iyileştirme (opsiyonel)

**Kullanım Senaryoları:**
1. **Eşleştirme Kalitesini Artırma:**
   - Ağırlıkları ayarlayın
   - Örneğin, yeteneklere daha fazla ağırlık vererek teknik pozisyonlar için optimize edin
   - Minimum eşik değerini artırarak sadece yüksek uyumlu eşleşmeleri gösterin

2. **Otomatik Eşleştirmeyi Aktif Etme:**
   - "Auto-match Enabled" seçeneğini aktif edin
   - Sıklığı belirleyin (günlük önerilir)
   - Bildirim seçeneklerini ayarlayın
   - Sistem otomatik olarak yeni eşleşmeleri bulur ve bildirim gönderir

3. **Yetenek Eş Anlamlıları Yönetimi:**
   - "Skill Alias Management" bölümüne gidin
   - Eş anlamlı yetenekleri gruplandırın
   - Örneğin: "JavaScript" ve "JS" aynı yetenek olarak kabul edilir

**Teknik Detaylar:**
- **Real-time Preview:** Ayar değişikliklerinin önizlemesi
- **Validation:** Ağırlıkların toplamının 100 olması kontrolü
- **Backend Sync:** Ayarlar backend'de saklanır ve tüm eşleştirmelerde kullanılır
- **Versioning:** Ayar geçmişi ve geri alma özelliği

---

## Timesheet Modülü

Timesheet modülü, çalışanların çalışma saatlerini takip etmek ve yönetmek için kapsamlı bir çözüm sunar. Modül, proje bazlı zaman takibi, onay süreçleri ve raporlama özellikleri ile işletmelerin zaman yönetimi ihtiyaçlarını karşılar.

### Modül Yapısı

Timesheet modülü şu sayfalardan oluşur:
- **My TimeSheets** - Kullanıcının kendi timesheet'leri
- **TimeSheet List** - Tüm timesheet'ler (yöneticiler için)
- **TimeSheet Detail** - Timesheet detayı ve yönetimi
- **TimeSheet Form** - Yeni timesheet oluşturma/düzenleme
- **TimeSheet Approval** - Timesheet onay süreci
- **Admin TimeSheet Approval** - Admin onay süreci
- **Team Lead Assigned** - Takım lideri atamalı satırlar
- **TimeSheet Import** - Excel'den toplu import

### API Entegrasyonu

Modül, backend API ile tam entegre çalışır:
- **Base URL:** `/api/timesheets`
- **Authentication:** Keycloak JWT token ile korumalı
- **Data Format:** JSON (request/response)
- **Pagination:** Spring Data Page formatı (0-based indexing)

---

## Timesheet Modülü Sayfaları

### My TimeSheets - Kendi TimeSheet'lerim Sayfası

**Rota:** `/timesheets/my`  
**Dosya:** `src/pages/timesheets/MyTimeSheets.tsx`  
**Yetki:** Tüm kullanıcılar

**Amaç ve İşlev:**
MyTimeSheets sayfası, kullanıcının kendi timesheet'lerini görüntülemek ve yönetmek için kullanılan kişisel dashboard sayfasıdır. Çalışanlar bu sayfa üzerinden kendi zaman kayıtlarını görüntüleyebilir, durumlarını takip edebilir ve yeni timesheet oluşturabilir.

**Temel Özellikler:**
- **Kişisel Timesheet Listesi:** Sadece kullanıcının kendi timesheet'leri
- **Durum Filtreleme:** DRAFT, SUBMITTED, APPROVED, REJECTED, COMPLETED
- **Tarih Filtreleme:** Tarih aralığı ile filtreleme
- **Sayfalama:** Büyük veri setleri için optimize edilmiş sayfalama
- **Hızlı Erişim:** Yeni timesheet oluşturma butonu
- **Durum Göstergeleri:** Renk kodlu durum göstergeleri

**Görüntülenen Bilgiler:**
- **Proje Adı:** Timesheet'in bağlı olduğu proje
- **Çalışma Tarihi:** Timesheet'in tarihi
- **Çalışılan Saatler:** Toplam çalışılan saat (ondalıklı)
- **Durum:** Renk kodlu durum göstergesi
  - DRAFT (Taslak) - Gri
  - SUBMITTED (Gönderildi) - Mavi
  - APPROVED (Onaylandı) - Yeşil
  - REJECTED (Reddedildi) - Kırmızı
  - COMPLETED (Tamamlandı) - Mor

**Kullanım Senaryoları:**
1. **Kendi Timesheet'lerinizi Görüntüleme:**
   - Sol menüden "My TimeSheets" seçeneğine tıklayın
   - Tüm timesheet'leriniz listelenir
   - Durum ve tarih filtrelerini kullanarak istediğiniz timesheet'leri bulun

2. **Onay Bekleyen Timesheet'leri Kontrol Etme:**
   - Durum filtresini "SUBMITTED" yapın
   - Onay bekleyen timesheet'lerinizi görüntüleyin
   - Detay sayfasına giderek durumu kontrol edin

3. **Yeni Timesheet Oluşturma:**
   - "New TimeSheet" butonuna tıklayın
   - Form sayfasına yönlendirilirsiniz
   - Timesheet bilgilerini doldurun ve kaydedin

4. **Timesheet Detayına Erişim:**
   - Listeden herhangi bir timesheet satırına tıklayın
   - TimeSheet Detail sayfasına yönlendirilirsiniz
   - Detaylı bilgileri görüntüleyin ve düzenleyin

**Teknik Detaylar:**
- **User Context:** Kullanıcı bilgisi otomatik olarak backend'e gönderilir
- **Caching:** React Query ile 5 dakika cache
- **Real-time Updates:** Durum değişikliklerinde anlık güncelleme
- **Optimistic UI:** İşlemlerde anlık görsel geri bildirim

---

### TimeSheet List - Tüm TimeSheet'ler Sayfası

**Rota:** `/timesheets`  
**Dosya:** `src/pages/timesheets/TimeSheetList.tsx`  
**Yetki Gereksinimleri:** `TEAM_MANAGER`, `HUMAN_RESOURCES`, `ADMIN`

**Amaç ve İşlev:**
TimeSheetList sayfası, yöneticiler ve HR ekipleri için tüm çalışanların timesheet'lerini görüntülemek ve yönetmek için kullanılan merkezi yönetim sayfasıdır. Bu sayfa üzerinden tüm timesheet'ler görüntülenebilir, filtreleme yapılabilir ve toplu işlemler gerçekleştirilebilir.

**Temel Özellikler:**
- **Tüm Timesheet'leri Görüntüleme:** Tüm çalışanların timesheet'leri
- **Gelişmiş Filtreleme:** Çalışan, proje, tarih, durum bazlı filtreleme
- **Arama Fonksiyonu:** Çalışan adı, proje adı ile arama
- **Sayfalama ve Sıralama:** Büyük veri setleri için optimize edilmiş
- **Export:** Excel formatında veri dışa aktarma
- **Import:** Excel'den toplu import (HR ve Company Manager için)
- **Toplu İşlemler:** Birden fazla timesheet seçerek toplu onaylama/reddetme

**Filtreler:**
- **Employee (Çalışan):** Dropdown ile çalışan seçimi
- **Project (Proje):** Dropdown ile proje seçimi
- **Date Range (Tarih Aralığı):** Başlangıç ve bitiş tarihi seçimi
- **Status (Durum):**
  - DRAFT (Taslak)
  - SUBMITTED (Gönderildi)
  - APPROVED (Onaylandı)
  - REJECTED (Reddedildi)
  - COMPLETED (Tamamlandı)
  - All (Tümü)

**Görüntülenen Bilgiler:**
- **Çalışan Adı:** Timesheet sahibi çalışan
- **Proje Adı:** Timesheet'in bağlı olduğu proje
- **Çalışma Tarihi:** Timesheet tarihi
- **Çalışılan Saatler:** Toplam saat (ondalıklı)
- **Durum:** Renk kodlu durum göstergesi
- **Base Status:** Temel durum (COMPLETED veya diğer)

**Kullanım Senaryoları:**
1. **Tüm Timesheet'leri Görüntüleme:**
   - Sol menüden "TimeSheets" seçeneğine tıklayın
   - Tüm çalışanların timesheet'leri listelenir
   - Filtreleri kullanarak istediğiniz timesheet'leri bulun

2. **Belirli Bir Çalışanın Timesheet'lerini Görüntüleme:**
   - Employee filtresinden çalışanı seçin
   - Sadece o çalışanın timesheet'leri görüntülenir
   - Tarih aralığı ile daha spesifik sonuçlar alın

3. **Onay Bekleyen Timesheet'leri Bulma:**
   - Status filtresini "SUBMITTED" yapın
   - Onay bekleyen tüm timesheet'ler listelenir
   - Toplu onaylama yapabilirsiniz

4. **Excel Export:**
   - "Export" butonuna tıklayın
   - Mevcut filtrelenmiş veriler Excel formatında indirilir
   - Excel dosyası tüm timesheet bilgilerini içerir

5. **Excel Import:**
   - "Import" butonuna tıklayın (HR ve Company Manager için)
   - Template'i indirin
   - Template'i doldurun
   - Dosyayı yükleyin
   - Import sonuçlarını kontrol edin

**Teknik Detaylar:**
- **Server-side Filtering:** Filtreleme backend'de yapılır, performans optimizasyonu
- **Debounced Search:** Arama için debounce (300ms) ile gereksiz API çağrılarını önleme
- **Excel Export:** Backend'de Excel dosyası oluşturulur, frontend'de indirilir
- **Bulk Operations:** Toplu işlemler için backend API endpoint'leri

---

### TimeSheet Detail - TimeSheet Detay Sayfası

**Rota:** `/timesheets/:id`  
**Dosya:** `src/pages/timesheets/TimeSheetDetail.tsx`  
**Yetki:** Tüm kullanıcılar (ancak bazı işlemler için özel yetkiler gerekir)

**Amaç ve İşlev:**
TimeSheetDetail sayfası, bir timesheet'in tüm detaylarını görüntülemek, düzenlemek ve yönetmek için kullanılan kapsamlı bir sayfadır. Bu sayfa üzerinden timesheet satırları yönetilebilir, onay süreçleri gerçekleştirilebilir ve geçmiş işlemler görüntülenebilir.

**Ana Bölümler:**

**1. TimeSheet Bilgileri Bölümü:**
- **Çalışan Bilgileri:**
  - Çalışan adı ve soyadı
  - Çalışan ID
  - Departman
- **Proje Bilgileri:**
  - Proje adı
  - Proje ID
  - Proje durumu
- **Timesheet Bilgileri:**
  - Timesheet ID
  - Çalışma tarihi
  - Toplam çalışılan saatler
  - Durum (DRAFT, SUBMITTED, APPROVED, REJECTED, COMPLETED)
  - Base Status (COMPLETED veya diğer)
  - Oluşturulma tarihi ve saati
  - Son güncellenme tarihi ve saati
  - Oluşturan kullanıcı
  - Son güncelleyen kullanıcı

**2. TimeSheet Satırları (Rows) Bölümü:**
- **Satır Listesi:**
  - Her satır için:
    - Tarih (Date)
    - Çalışılan saat (Hours) - ondalıklı (örn. 7.5)
    - Görev/Task açıklaması
    - Satır durumu (PENDING, APPROVED, REJECTED)
    - Atanan takım lideri (varsa)
    - Onay/Red tarihi
    - Onay/Red notu
- **Satır İşlemleri:**
  - **Edit:** Satır düzenleme (sadece DRAFT durumunda)
  - **Delete:** Satır silme (sadece DRAFT durumunda)
  - **Approve:** Satır onaylama (Team Manager için)
  - **Reject:** Satır reddetme (Team Manager için)
  - **Assign:** Satır atama (Team Manager için)

**3. İşlemler Bölümü:**
- **Submit (Gönder):**
  - Timesheet'i onay için gönderme
  - Durum: DRAFT → SUBMITTED
  - Sadece DRAFT durumunda kullanılabilir
  - En az bir satır olmalıdır
- **Cancel (İptal):**
  - Timesheet'i iptal etme
  - İptal nedeni zorunludur
  - Durum: SUBMITTED → DRAFT veya REJECTED
- **Clone (Kopyala):**
  - Timesheet'i kopyalama
  - Yeni bir timesheet oluşturur
  - Tüm satırlar kopyalanır
  - Durum: DRAFT
- **Add Row (Satır Ekle):**
  - Yeni satır ekleme
  - Sadece DRAFT durumunda kullanılabilir
- **View History (Geçmiş Görüntüle):**
  - Timesheet geçmişini görüntüleme
  - Tüm durum değişiklikleri
  - Onay/Red işlemleri
  - Notlar ve yorumlar

**4. Hızlı Satır Ekleme Bölümü:**
- **Tarih Seçimi:** Date picker ile tarih seçimi
- **Saat Girişi:** Numeric input ile saat girişi (ondalıklı)
- **Görev Açıklaması:** Text input ile görev açıklaması
- **Hızlı Ekleme Butonu:** Tek tıkla satır ekleme

**Rol Bazlı İşlemler:**

**Authenticated User (Giriş Yapmış Kullanıcı - Tüm Roller):**
- Kendi timesheet'lerini görüntüleme ve düzenleme
- Satır ekleme, düzenleme, silme (sadece DRAFT durumunda)
- Timesheet gönderme (Submit)
- Timesheet iptal etme (Cancel)
- Timesheet kopyalama (Clone)
- Geçmiş görüntüleme

**TEAM_MANAGER (Takım Lideri):**
- Atanmış satırları görüntüleme
- Satır onaylama/reddetme
- Satır atama işlemi
- Timesheet onaylama/reddetme (tüm timesheet için)
- Geçmiş görüntüleme

**HUMAN_RESOURCES (İnsan Kaynakları):**
- Tüm timesheet'leri görüntüleme
- Timesheet onaylama/reddetme
- Company reject işlemi
- Geçmiş görüntüleme
- Raporlama

**ADMIN (Yönetici):**
- Tüm işlemleri gerçekleştirme
- Admin onay süreci
- Tüm timesheet'leri görüntüleme ve yönetme
- Sistem ayarları

**Kullanım Senaryoları:**

1. **Kullanıcı İçin - Timesheet Oluşturma:**
   - TimeSheet Detail sayfasına gidin (yeni timesheet için)
   - "Add Row" butonuna tıklayın
   - Tarih, saat ve görev bilgilerini girin
   - Gerekirse daha fazla satır ekleyin
   - Tüm satırları ekledikten sonra "Submit" butonuna tıklayın
   - Timesheet'iniz onay için gönderilecektir

2. **Takım Lideri (Team Manager) İçin - Satır Onaylama:**
   - TimeSheet Detail sayfasına gidin
   - Atanmış satırları görüntüleyin (satır durumu: PENDING)
   - Her satır için "Approve" veya "Reject" butonuna tıklayın
   - Gerekirse not ekleyin
   - Tüm satırları onayladıktan sonra timesheet'i onaylayın

3. **İnsan Kaynakları (HR) İçin - Timesheet Onaylama:**
   - TimeSheet Detail sayfasına gidin
   - Tüm bilgileri inceleyin
   - Satırları kontrol edin
   - Onaylamak için "Approve" butonuna tıklayın
   - Reddetmek için "Reject" butonuna tıklayın ve not ekleyin

4. **Timesheet Geçmişini Görüntüleme:**
   - "View History" butonuna tıklayın
   - Dialog açılır
   - Tüm durum değişikliklerini, onay/red işlemlerini ve notları görüntüleyin

**Teknik Detaylar:**
- **Real-time Updates:** Durum değişikliklerinde anlık güncelleme
- **Optimistic UI:** İşlemlerde anlık görsel geri bildirim
- **Validation:** Satır ekleme/düzenleme sırasında validasyon
- **Error Handling:** Kapsamlı hata yönetimi ve kullanıcı bildirimleri
- **Activity Log:** Tüm işlemlerin kaydı

---

### TimeSheet Form - Yeni TimeSheet Oluşturma/Düzenleme Formu

**Rota:** `/timesheets/new` (yeni) veya `/timesheets/:id/edit` (düzenleme)  
**Dosya:** `src/pages/timesheets/TimeSheetForm.tsx`  
**Yetki:** Tüm kullanıcılar (kendi timesheet'leri için)

**Amaç ve İşlev:**
TimeSheetForm, yeni timesheet oluşturma veya mevcut timesheet'i düzenleme için kullanılan form sayfasıdır. Form, proje seçimi, tarih belirleme ve satır ekleme işlemlerini kolaylaştırır.

**Form Alanları:**

**1. Temel Bilgiler:**
- **Project (Proje):** *Zorunlu*
  - Dropdown ile proje seçimi
  - Sadece aktif projeler gösterilir
  - Kullanıcının erişebildiği projeler
- **Work Date (Çalışma Tarihi):** *Zorunlu*
  - Date picker ile tarih seçimi
  - Geçmiş ve gelecek tarihler seçilebilir
  - Varsayılan: Bugünün tarihi

**2. TimeSheet Satırları (Rows):**
- **Dinamik Satır Listesi:**
  - Her satır için:
    - **Date (Tarih):** *Zorunlu*
      - Date picker
      - Timesheet tarihi ile uyumlu olmalı
    - **Hours (Saat):** *Zorunlu*
      - Numeric input
      - Pozitif sayı olmalı
      - Ondalıklı değer kabul eder (örn. 7.5)
      - Maksimum: 24 saat
    - **Task (Görev):** *Opsiyonel*
      - Text input
      - Maksimum 500 karakter
      - Görev açıklaması

**Validasyon Kuralları:**
- Proje seçimi zorunludur
- Çalışma tarihi zorunludur
- En az bir satır eklenmelidir
- Her satır için tarih ve saat zorunludur
- Toplam saatler pozitif olmalıdır
- Satır tarihleri timesheet tarihi ile uyumlu olmalıdır (aynı ay içinde)
- Toplam saatler makul bir aralıkta olmalıdır (örn. 0-24 saat/gün)

**Form İşlemleri:**
- **Add Row:** Yeni satır ekleme
- **Remove Row:** Satır silme
- **Save as Draft:** Taslak olarak kaydetme
- **Save and Submit:** Kaydetme ve gönderme
- **Cancel:** Formdan çıkma (değişiklikler kaybolur)

**Kullanım Senaryoları:**
1. **Yeni Timesheet Oluşturma:**
   - TimeSheetList veya MyTimeSheets sayfasından "New TimeSheet" butonuna tıklayın
   - Projeyi seçin
   - Çalışma tarihini seçin
   - "Add Row" butonuna tıklayarak satırlar ekleyin
   - Her satır için tarih, saat ve görev bilgilerini girin
   - "Save as Draft" ile taslak olarak kaydedin veya "Save and Submit" ile gönderin

2. **Mevcut Timesheet'i Düzenleme:**
   - TimeSheet Detail sayfasından "Edit" butonuna tıklayın (sadece DRAFT durumunda)
   - Form sayfasına yönlendirilirsiniz
   - Değişiklikleri yapın
   - "Save as Draft" veya "Save and Submit" ile kaydedin

3. **Satır Ekleme/Düzenleme:**
   - "Add Row" butonuna tıklayın
   - Yeni satır formu açılır
   - Bilgileri doldurun
   - "Save" ile kaydedin
   - Satır silmek için satır yanındaki "Delete" butonuna tıklayın

**Teknik Detaylar:**
- **Form State:** React Hook Form ile yönetim
- **Dynamic Fields:** Dinamik satır ekleme/silme
- **Validation:** Yup schema ile validasyon
- **Auto-save:** Taslak otomatik kaydetme (localStorage)
- **Error Handling:** Kapsamlı hata yönetimi

---

### TimeSheet Approval - TimeSheet Onay Sayfası

**Rota:** `/timesheets/approval`  
**Dosya:** `src/pages/timesheets/TimeSheetApproval.tsx`  
**Yetki Gereksinimleri:** `TEAM_MANAGER`, `HUMAN_RESOURCES`

**Amaç ve İşlev:**
TimeSheetApproval sayfası, yöneticiler ve HR ekipleri için onay bekleyen timesheet'leri görüntülemek ve yönetmek için kullanılan özel bir sayfadır. Bu sayfa, onay sürecini hızlandırmak için optimize edilmiştir.

**Temel Özellikler:**
- **Onay Bekleyen Timesheet'ler:** Sadece SUBMITTED durumundaki timesheet'ler
- **Onay Sayısı Göstergesi:** Bekleyen onay sayısı badge'i
- **Toplu Onaylama/Reddetme:** Birden fazla timesheet seçerek toplu işlem
- **Filtreleme ve Arama:** Çalışan, proje, tarih bazlı filtreleme
- **Hızlı Onay:** Tek tıkla onaylama/reddetme
- **Detay Görüntüleme:** Timesheet detayına hızlı erişim

**Görüntülenen Bilgiler:**
- **Çalışan Adı:** Timesheet sahibi
- **Proje Adı:** Timesheet'in bağlı olduğu proje
- **Çalışma Tarihi:** Timesheet tarihi
- **Çalışılan Saatler:** Toplam saat
- **Durum:** SUBMITTED (gönderildi)
- **Base Status:** Temel durum
- **Gönderilme Tarihi:** Timesheet'in gönderildiği tarih
- **İşlemler:** Approve, Reject, Details butonları

**Kullanım Senaryoları:**
1. **Onay Bekleyen Timesheet'leri Görüntüleme:**
   - Sol menüden "TimeSheet Approval" seçeneğine tıklayın
   - Onay bekleyen tüm timesheet'ler listelenir
   - Onay sayısı badge'inde bekleyen sayı gösterilir

2. **Timesheet Onaylama:**
   - Listeden onaylamak istediğiniz timesheet'i bulun
   - "Approve" butonuna tıklayın
   - Onay mesajı gösterilir
   - Timesheet durumu APPROVED olur

3. **Timesheet Reddetme:**
   - Listeden reddetmek istediğiniz timesheet'i bulun
   - "Reject" butonuna tıklayın
   - Red nedeni girmeniz istenir
   - Red nedeni zorunludur
   - Timesheet durumu REJECTED olur
   - Çalışana otomatik bildirim gönderilir

4. **Toplu Onaylama:**
   - Birden fazla timesheet seçin (checkbox'lar)
   - Üst menüden "Approve Selected" seçin
   - Tüm seçili timesheet'ler onaylanır

5. **Detay Görüntüleme:**
   - "Details" butonuna tıklayın
   - TimeSheet Detail sayfasına yönlendirilirsiniz
   - Detaylı bilgileri inceleyin
   - Onay/Red işlemini detay sayfasından da yapabilirsiniz

**Teknik Detaylar:**
- **Real-time Count:** Bekleyen onay sayısı anlık güncellenir
- **Optimistic UI:** Onay/Red işlemlerinde anlık görsel geri bildirim
- **Bulk Operations:** Toplu işlemler için backend API endpoint'leri
- **Notification:** Onay/Red işlemlerinde çalışana otomatik bildirim

---

### Admin TimeSheet Approval - Admin Onay Sayfası

**Rota:** `/timesheets/admin-approval`  
**Dosya:** `src/pages/timesheets/AdminTimeSheetApproval.tsx`  
**Yetki Gereksinimleri:** `ADMIN`

**Amaç ve İşlev:**
AdminTimeSheetApproval sayfası, admin onayı bekleyen timesheet'ler için özel bir onay sayfasıdır. Bu sayfa, normal onay sürecinden geçmiş timesheet'ler için son onay aşamasıdır.

**Temel Özellikler:**
- **Admin Onayı Bekleyen Timesheet'ler:** Normal onay sürecinden geçmiş timesheet'ler
- **Final Approval:** Son onay aşaması
- **Company Reject:** Şirket seviyesinde red işlemi
- **Detaylı İnceleme:** Tüm timesheet bilgileri ve geçmişi
- **Filtreleme ve Arama:** Çalışan, proje, tarih bazlı filtreleme

**Kullanım Senaryoları:**
1. **Admin Onayı Verme:**
   - AdminTimeSheetApproval sayfasına gidin
   - Onay bekleyen timesheet'leri görüntüleyin
   - Timesheet detayını inceleyin
   - "Approve" butonuna tıklayın
   - Timesheet durumu COMPLETED olur

2. **Company Reject:**
   - Reddetmek istediğiniz timesheet'i bulun
   - "Company Reject" butonuna tıklayın
   - Red nedeni girin
   - Timesheet reddedilir
   - İlgili taraflara bildirim gönderilir

**Teknik Detaylar:**
- **Final Status:** COMPLETED durumu sadece admin onayı ile verilir
- **Company Reject:** Şirket seviyesinde özel red işlemi
- **Audit Trail:** Tüm admin işlemleri kaydedilir

---

### Team Lead Assigned - Takım Lideri Atamalı Satırlar Sayfası

**Rota:** `/timesheets/assigned`  
**Dosya:** `src/pages/timesheets/TeamLeadAssigned.tsx`  
**Yetki Gereksinimleri:** `TEAM_MANAGER`

**Amaç ve İşlev:**
TeamLeadAssigned sayfası, takım liderlerine atanmış timesheet satırlarını görüntülemek ve yönetmek için kullanılan özel bir sayfadır. Bu sayfa, takım liderlerinin sadece kendilerine atanmış satırları görmesini sağlar.

**Temel Özellikler:**
- **Atanmış Satırlar:** Sadece kullanıcıya atanmış satırlar
- **Satır Onaylama/Reddetme:** Her satır için ayrı onay/red
- **Satır Detayları:** Tarih, saat, görev, çalışan bilgileri
- **Filtreleme:** Durum, tarih, çalışan bazlı filtreleme
- **Toplu İşlemler:** Birden fazla satır seçerek toplu onay/red

**Görüntülenen Bilgiler:**
- **Timesheet ID:** İlgili timesheet ID'si
- **Çalışan Adı:** Satır sahibi çalışan
- **Proje Adı:** İlgili proje
- **Tarih:** Satır tarihi
- **Saat:** Çalışılan saat
- **Görev/Task:** Görev açıklaması
- **Durum:** PENDING, APPROVED, REJECTED
- **İşlemler:** Approve, Reject, View Details

**Kullanım Senaryoları:**
1. **Atanmış Satırları Görüntüleme:**
   - Sol menüden "Team Lead Assigned" seçeneğine tıklayın
   - Size atanmış tüm satırlar listelenir
   - Durum filtresini kullanarak PENDING satırları görüntüleyin

2. **Satır Onaylama:**
   - Onaylamak istediğiniz satırı bulun
   - "Approve" butonuna tıklayın
   - Satır durumu APPROVED olur
   - Timesheet sahibine bildirim gönderilir

3. **Satır Reddetme:**
   - Reddetmek istediğiniz satırı bulun
   - "Reject" butonuna tıklayın
   - Red nedeni girin
   - Satır durumu REJECTED olur
   - Timesheet sahibine bildirim gönderilir

4. **Timesheet Detayına Erişim:**
   - "View Details" butonuna tıklayın
   - TimeSheet Detail sayfasına yönlendirilirsiniz
   - Tüm timesheet bilgilerini görüntüleyin

**Teknik Detaylar:**
- **Assignment Filter:** Backend'de sadece atanmış satırlar filtrelenir
- **Real-time Updates:** Yeni atamalar anlık görüntülenir
- **Notification:** Onay/Red işlemlerinde çalışana bildirim

---

### TimeSheet Import - Excel Import Sayfası

**Rota:** `/timesheets/import`  
**Dosya:** `src/pages/timesheets/TimeSheetImport.tsx`  
**Yetki Gereksinimleri:** `HUMAN_RESOURCES`, `COMPANY_MANAGER`

**Amaç ve İşlev:**
TimeSheetImport sayfası, Excel dosyasından toplu timesheet import işlemi için kullanılan sayfadır. Bu sayfa, büyük veri setlerini hızlıca sisteme aktarmak için kullanılır.

**Temel Özellikler:**
- **Template İndirme:** Excel template dosyası indirme
- **Dosya Yükleme:** Excel dosyası yükleme (.xlsx, .xls)
- **Import İşlemi:** Toplu import işlemi
- **Sonuç Görüntüleme:** Başarılı/başarısız kayıtların görüntülenmesi
- **Hata Mesajları:** Detaylı hata mesajları
- **Retry:** Başarısız kayıtları düzeltip tekrar import

**Template Formatı:**
Excel template şu sütunları içerir:

| Sütun Adı | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| EmployeeId | Number | Evet | Sistemde var olan çalışan ID'si |
| ProjectId | Number | Hayır | İlgili proje ID'si (boş bırakılabilir) |
| WorkDate | Date | Evet | Tarih formatı YYYY-MM-DD (örn. 2024-09-09) |
| HoursWorked | Number | Hayır | 7.5 gibi ondalıklı değer kabul eder |
| Task | Text | Hayır | Görev açıklaması |
| EmployeeName | Text | Hayır | Rehber amaçlı, import sırasında dikkate alınmaz |
| ProjectName | Text | Hayır | Rehber amaçlı, import sırasında dikkate alınmaz |

**Import İşlemi:**
1. **Template İndirme:**
   - "Download Template" butonuna tıklayın
   - Excel template dosyası indirilir
   - Template'i açın ve örnek verileri görüntüleyin

2. **Template Doldurma:**
   - Template'i Excel'de açın
   - Örnek satırları silin
   - Verilerinizi girin
   - Zorunlu alanları doldurduğunuzdan emin olun
   - Tarih formatını kontrol edin (YYYY-MM-DD)
   - EmployeeId'nin sistemde var olduğundan emin olun

3. **Dosya Yükleme:**
   - "Choose File" butonuna tıklayın
   - Doldurulmuş Excel dosyasını seçin
   - "Upload" butonuna tıklayın
   - Import işlemi başlar
   - İlerleme çubuğu gösterilir

4. **Sonuç Kontrolü:**
   - Import işlemi tamamlandığında sonuçlar gösterilir
   - Başarılı kayıt sayısı
   - Başarısız kayıt sayısı
   - Başarılı kayıtların listesi
   - Başarısız kayıtların listesi ve hata mesajları

5. **Hata Düzeltme:**
   - Başarısız kayıtları inceleyin
   - Hata mesajlarını okuyun
   - Excel dosyasını düzeltin
   - Tekrar import edin

**Import Sonuçları:**
- **Başarılı Kayıtlar:**
  - Timesheet ID
  - Çalışan adı
  - Proje adı
  - Tarih
  - Saat
  - Görev
  - Oluşturulma mesajı

- **Başarısız Kayıtlar:**
  - Satır numarası
  - EmployeeId
  - ProjectId
  - WorkDate
  - HoursWorked
  - Task
  - Hata mesajı (detaylı)

**Kullanım Senaryoları:**
1. **Toplu Timesheet Import:**
   - TimeSheet Import sayfasına gidin
   - Template'i indirin
   - Template'i doldurun
   - Dosyayı yükleyin
   - Sonuçları kontrol edin
   - Başarısız kayıtları düzeltip tekrar import edin

2. **Hata Düzeltme:**
   - Başarısız kayıtları inceleyin
   - Hata mesajlarını okuyun
   - Örneğin: "EmployeeId not found" hatası alırsanız, EmployeeId'nin sistemde var olduğundan emin olun
   - Excel dosyasını düzeltin
   - Tekrar import edin

**Teknik Detaylar:**
- **File Upload:** Multipart/form-data ile dosya yükleme
- **Backend Processing:** Import işlemi backend'de yapılır
- **Validation:** Her satır için validasyon yapılır
- **Transaction:** Başarılı kayıtlar commit edilir, başarısızlar rollback edilir
- **Error Reporting:** Detaylı hata mesajları ve satır numaraları

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

---

## AI-Powered Matching System: Phase 2 & Phase 3

CV-Pozisyon eşleştirme sistemi, iki büyük fazda AI destekli yeteneklerle geliştirilmiştir. Bu bölüm, her iki fazın bileşenleri, kullanım senaryoları ve teknik detaylar hakkında kapsamlı dokümantasyon sağlar.

---

## Phase 2: AI-Enhanced Matching (Embeddings, ANN Search, Re-ranking)

### Genel Bakış

Phase 2, AI destekli semantik benzerlik eşleştirmesi ile CV-Pozisyon eşleştirme doğruluğunu artırır. Sistem, embeddings (metin vektör temsilleri), yaklaşık en yakın komşu (ANN) araması ve cross-encoder yeniden sıralama kullanarak en ilgili eşleşmeleri bulur.

### Gereksinimler

**Backend Gereksinimleri:**
- PostgreSQL 14+ with pgvector extension
- HuggingFace API key (veya OpenAI API key)
- Backend API çalışıyor olmalı

**Frontend Gereksinimleri:**
- React 18.2+
- TypeScript 5.3+
- Material UI 5.15+
- React Query 5.22+

### Frontend Entegrasyonu

#### Matching Settings Sayfası

**Rota:** `/cv-sharing/settings/matching`  
**Dosya:** `src/pages/cv-sharing/settings/MatchingSettings.tsx`

**Phase 2 Özellikleri:**

1. **Semantic Weight (Anlamsal Ağırlık)**
   - AI semantik benzerlik için ağırlık ayarı (0-100)
   - Varsayılan: 15
   - Diğer ağırlıklarla birlikte toplam 100 olmalı

2. **Embedding Durumu**
   - Embedding'lerin otomatik oluşturulduğunu gösterir
   - Kullanıcı müdahalesi gerekmez
   - Backend'de otomatik olarak yönetilir

3. **ANN Search Ayarları**
   - Candidate limit (varsayılan: 500)
   - Backend'de yapılandırılır, frontend'de görüntülenir

4. **Re-ranker Ayarları**
   - Re-ranker aktif/pasif durumu
   - Top-K değeri (varsayılan: 100)
   - Backend'de yapılandırılır

**Örnek Konfigürasyon Verisi:**

```typescript
// MatchingConfig type
interface MatchingConfig {
  id: string;
  weights: {
    skills: number;        // 0-100, örnek: 35
    experience: number;    // 0-100, örnek: 20
    language: number;     // 0-100, örnek: 10
    education: number;    // 0-100, örnek: 5
    location: number;     // 0-100, örnek: 10
    salary: number;       // 0-100, örnek: 5
    semantic: number;     // 0-100, örnek: 15 (Phase 2)
  };
  thresholds: {
    minMatchScore: number;    // 0-100, örnek: 60
    highMatchScore: number;   // 0-100, örnek: 80
  };
  ann: {
    enabled: boolean;
    candidateLimit: number;   // örnek: 500
  };
  reranker: {
    enabled: boolean;
    topK: number;            // örnek: 100
  };
}
```

**API Request Örneği (Konfigürasyon Güncelleme):**

```typescript
// matchingService.updateConfig()
const config: MatchingConfig = {
  id: "config-uuid",
  weights: {
    skills: 40,
    experience: 20,
    language: 10,
    education: 5,
    location: 10,
    salary: 5,
    semantic: 10  // Toplam 100 olmalı
  },
  thresholds: {
    minMatchScore: 65,
    highMatchScore: 85
  },
  ann: {
    enabled: true,
    candidateLimit: 500
  },
  reranker: {
    enabled: true,
    topK: 100
  }
};

await matchingService.updateConfig(config);
```

**API Response Örneği (Eşleştirme Sonuçları):**

```typescript
// poolCVService.matchPositions() response
interface MatchedPositionResponse {
  positionId: string;
  positionTitle: string;
  matchScore: number;        // 0-100
  annDistance: number;       // 0-1, lower = more similar
  rerankScore: number;       // 0-1, higher = more relevant
  featureScores: {
    skills: number;
    experience: number;
    education: number;
    language: number;
    location: number;
    salary: number;
    semantic: number;
  };
}

// Örnek response
const matches: MatchedPositionResponse[] = [
  {
    positionId: "uuid-1",
    positionTitle: "Senior Java Developer",
    matchScore: 85,
    annDistance: 0.234,
    rerankScore: 0.92,
    featureScores: {
      skills: 90,
      experience: 80,
      education: 75,
      language: 100,
      location: 60,
      salary: 50,
      semantic: 85
    }
  }
];
```

**Kullanım Senaryoları:**

**Senaryo 1: Semantic Weight Ayarlama**
1. Matching Settings sayfasına gidin (`/cv-sharing/settings/matching`)
2. "Semantic Weight" slider'ını ayarlayın (varsayılan: 15)
3. Diğer ağırlıkları da ayarlayın (toplam 100 olmalı)
4. Sistem otomatik olarak toplamı kontrol eder
5. Toplam 1.00 değilse "Save Configuration" butonu devre dışı kalır
6. Ağırlıkları ayarlayın ve "Save Configuration" butonuna tıklayın
7. Başarılı kayıt sonrası snackbar bildirimi gösterilir

**Senaryo 2: Otomatik Eşleştirme**
1. PoolCV detay sayfasında "Match Positions" butonuna tıklayın
2. Sistem otomatik olarak:
   - Embedding oluşturur (yoksa)
   - ANN araması yapar (top 500 aday)
   - Re-ranker ile yeniden sıralar (top 100)
3. Sonuçlar eşleşme skorlarıyla gösterilir
4. Kullanıcı minimum skor filtresi uygulayabilir

### Kullanıcı Deneyimi

**Phase 2 Kullanıcıya Nasıl Görünür:**

1. **Daha İyi Eşleşmeler:**
   - Eşleşme sonuçları daha doğru ve ilgili
   - Semantik benzerlik sayesinde eş anlamlılar eşleşir
   - Örnek: "JavaScript" ve "JS" aynı yetenek olarak kabul edilir

2. **Hızlı Sonuçlar:**
   - ANN araması sayesinde hızlı eşleştirme
   - Re-ranker ile iyileştirilmiş doğruluk
   - Kullanıcı farkı fark etmez (arka planda çalışır)

3. **Görsel Geri Bildirim:**
   - Eşleşme skorları gösterilir
   - Yüksek skorlu eşleşmeler vurgulanır
   - Kullanıcı filtreleme yapabilir (minimum skor)

### Frontend API Entegrasyonu

**Kullanılan Servisler:**
- `matchingService.getConfig()` - Matching konfigürasyonunu getir
- `matchingService.updateConfig()` - Konfigürasyonu güncelle
- `poolCVService.matchPositions()` - PoolCV için pozisyon eşleştir (Phase 2 kullanır)

**Service Kullanım Örnekleri:**

```typescript
// 1. Matching konfigürasyonunu getir
import { matchingService } from '@/services/cv-sharing/matchingService';

const config = await matchingService.getConfig();
console.log(config.weights.semantic); // Phase 2 semantic weight

// 2. Konfigürasyonu güncelle
const updatedConfig = {
  ...config,
  weights: {
    ...config.weights,
    semantic: 20  // Semantic weight'i artır
  }
};
await matchingService.updateConfig(updatedConfig);

// 3. PoolCV için eşleştirme yap
import { poolCVService } from '@/services/cv-sharing/poolCVService';

const matches = await poolCVService.matchPositions(poolCvId, {
  limit: 20,
  minScore: 60
});
// matches -> Phase 2 ile eşleştirilmiş pozisyonlar

// 4. React Query ile kullanım
import { useQuery, useMutation } from '@tanstack/react-query';

// Konfigürasyonu getir
const { data: config, isLoading } = useQuery({
  queryKey: ['matching-config'],
  queryFn: () => matchingService.getConfig()
});

// Konfigürasyonu güncelle
const updateMutation = useMutation({
  mutationFn: (config: MatchingConfig) => 
    matchingService.updateConfig(config),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['matching-config'] });
    enqueueSnackbar('Configuration updated successfully', { variant: 'success' });
  }
});
```

**Component Örnekleri:**

```typescript
// MatchingSettings.tsx - Semantic Weight Input
<TextField
  label="Semantic Weight"
  type="number"
  value={config.weights.semantic}
  onChange={(e) => {
    setConfig({
      ...config,
      weights: {
        ...config.weights,
        semantic: Number(e.target.value)
      }
    });
  }}
  inputProps={{ min: 0, max: 100, step: 1 }}
  helperText="AI semantic similarity weight (0-100)"
/>

// Weight Total Validation
const totalWeight = Object.values(config.weights).reduce((sum, w) => sum + w, 0);
const diff = Math.abs(totalWeight - 100);
const tolerance = 1; // 1% tolerance

{diff > tolerance && (
  <Alert severity="error">
    Weight total must equal 100. Current: {totalWeight.toFixed(2)}
  </Alert>
)}
```

---

## Phase 3: Machine Learning & Active Learning

### Genel Bakış

Phase 3, makine öğrenmesi yetenekleri ile eşleştirme kalitesini sürekli iyileştirir:
- **Eğitim Verisi Toplama:** İnsan etiketli ilgili veriler
- **Model Eğitimi:** LambdaMART sıralama modelleri
- **Aktif Öğrenme:** Belirsiz çiftleri insan incelemesi için belirleme
- **A/B Testi:** Farklı eşleştirme stratejilerini karşılaştırma

### Gereksinimler

**Backend Gereksinimleri:**
- PostgreSQL 14+ (JSONB support)
- Phase 3 API endpoints aktif olmalı
- Model storage (S3 veya local)

**Frontend Gereksinimleri:**
- React 18.2+
- TypeScript 5.3+
- Material UI 5.15+
- React Query 5.22+

**Minimum Veri:**
- İlk model için: 500 etiketli örnek
- Production model için: 2000+ etiketli örnek
- Önerilen: 5000+ örnek

### Frontend Sayfaları

#### 1. Training Examples (Eğitim Örnekleri) Sayfası

**Rota:** `/cv-sharing/training`  
**Dosya:** `src/pages/cv-sharing/training/TrainingExampleList.tsx`

**Amaç:**
İnsan etiketli CV-Pozisyon çiftlerini görüntüleme, yönetme ve dışa aktarma.

**Özellikler:**
- **Eğitim Örnekleri Listesi:** Tüm etiketli çiftler
- **Filtreleme:** İlgili skor, tarih, CV, pozisyon bazlı
- **Arama:** CV adı, pozisyon adı ile arama
- **İstatistikler:** Toplam, etiketlenmiş, dışa aktarılmış sayıları
- **Dışa Aktarma:** CSV/JSON formatında eğitim verisi dışa aktarma
- **Oluşturma:** Yeni eğitim örneği oluşturma

**Type Definitions:**

```typescript
// types/cv-sharing/training.ts
export interface TrainingExample {
  id: string;
  companyUuid: string;
  poolCvId: number;
  poolCvName: string;
  positionId: number;
  positionTitle: string;
  relevanceLabel: number;  // 0-5
  matchScore: number;
  annDistance: number;
  rerankScore: number;
  featuresSnapshot: Record<string, number>;
  notes?: string;
  labeledBy: string;
  labeledByName: string;
  labeledAt: string;
  exported: boolean;
  exportedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingExampleRequest {
  poolCvId: number;
  positionId: number;
  relevanceLabel: number;  // 0-5, required
  notes?: string;
}

export interface ExportTrainingDataRequest {
  format: 'CSV' | 'JSON';
  includeFeatures: boolean;
  startDate?: string;
  endDate?: string;
  minRelevance?: number;  // 0-5
  maxRelevance?: number;  // 0-5
  includeExported?: boolean;
}

export interface TrainingStats {
  totalExamples: number;
  exportedExamples: number;
  unexportedExamples: number;
  byRelevanceLabel: Record<string, number>;  // "0": 50, "1": 100, etc.
  averageRelevanceLabel: number;
  lastExportedAt?: string;
}
```

**API Service Kullanımı:**

```typescript
// services/cv-sharing/trainingService.ts
import { trainingService } from '@/services/cv-sharing/trainingService';

// 1. Eğitim örneklerini listele
const { data: examples } = useQuery({
  queryKey: ['training-examples', { page: 0, size: 20 }],
  queryFn: () => trainingService.getTrainingExamples({
    page: 0,
    size: 20,
    relevanceLabel: 4
  })
});

// 2. Yeni eğitim örneği oluştur
const createMutation = useMutation({
  mutationFn: (data: CreateTrainingExampleRequest) =>
    trainingService.createTrainingExample(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['training-examples'] });
    enqueueSnackbar('Training example created', { variant: 'success' });
  }
});

// Kullanım
createMutation.mutate({
  poolCvId: 123,
  positionId: 456,
  relevanceLabel: 4,
  notes: "Strong match, candidate has all required skills"
});

// 3. Eğitim verisini dışa aktar
const exportMutation = useMutation({
  mutationFn: (request: ExportTrainingDataRequest) =>
    trainingService.exportTrainingData(request),
  onSuccess: (blob, variables) => {
    // Download file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-data-${Date.now()}.${variables.format.toLowerCase()}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
});

// Kullanım
exportMutation.mutate({
  format: 'CSV',
  includeFeatures: true,
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  minRelevance: 3,
  maxRelevance: 5,
  includeExported: false
});

// 4. İstatistikleri getir
const { data: stats } = useQuery({
  queryKey: ['training-stats'],
  queryFn: () => trainingService.getTrainingStats()
});
```

**Form Örneği (Training Example Oluşturma):**

```typescript
// TrainingExampleForm.tsx
const [formData, setFormData] = useState<CreateTrainingExampleRequest>({
  poolCvId: 0,
  positionId: 0,
  relevanceLabel: 3,
  notes: ''
});

// Relevance Label seçimi
<FormControl fullWidth>
  <InputLabel>Relevance Label</InputLabel>
  <Select
    value={formData.relevanceLabel}
    onChange={(e) => setFormData({ ...formData, relevanceLabel: Number(e.target.value) })}
  >
    <MenuItem value={0}>0 - Completely Irrelevant</MenuItem>
    <MenuItem value={1}>1 - Slightly Relevant</MenuItem>
    <MenuItem value={2}>2 - Somewhat Relevant</MenuItem>
    <MenuItem value={3}>3 - Relevant</MenuItem>
    <MenuItem value={4}>4 - Highly Relevant</MenuItem>
    <MenuItem value={5}>5 - Perfect Match</MenuItem>
  </Select>
  <FormHelperText>
    Rate how well this CV matches the position (0-5)
  </FormHelperText>
</FormControl>
```

**Kullanım Senaryoları:**

**Senaryo 1: Manuel Etiketleme**
1. Training Examples sayfasına gidin
2. "Create Training Example" butonuna tıklayın
3. PoolCV ve Position seçin
4. İlgili skor verin (0-5)
5. Notlar ekleyin
6. Kaydedin

**Senaryo 2: Toplu Dışa Aktarma**
1. Training Examples sayfasına gidin
2. Filtreleri uygulayın (isteğe bağlı)
3. "Export Training Data" butonuna tıklayın
4. Format seçin (CSV/JSON)
5. Dosyayı indirin
6. Data scientist'e gönderin

**Senaryo 3: İstatistikleri Görüntüleme**
1. Training Examples sayfasına gidin
2. Üst kısımda istatistikler gösterilir:
   - Toplam örnek sayısı
   - Etiketlenmiş örnek sayısı
   - Dışa aktarılmış örnek sayısı
   - İlgili skor dağılımı

#### 2. Review Tasks (İnceleme Görevleri) Sayfası

**Rota:** `/cv-sharing/review-tasks`  
**Dosya:** `src/pages/cv-sharing/review-tasks/ReviewTaskList.tsx`

**Amaç:**
Aktif öğrenme tarafından belirlenen belirsiz CV-Pozisyon çiftlerini inceleme ve etiketleme.

**Özellikler:**
- **Görev Listesi:** Tüm inceleme görevleri
- **Durum Filtreleme:** PENDING, ASSIGNED, COMPLETED, CANCELLED
- **Öncelik Göstergesi:** HIGH, MEDIUM, LOW
- **Belirsizlik Skoru:** Sistem tarafından hesaplanan belirsizlik (0-1)
- **Atama:** Görevleri kullanıcılara atama
- **Tamamlama:** Görevleri tamamlama (etiket ekleme)
- **Toplu İşlemler:** Birden fazla görevi seçerek toplu işlem

**Type Definitions:**

```typescript
// types/cv-sharing/review-task.ts
export type ReviewTaskStatus = 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
export type ReviewTaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ReviewTask {
  id: string;
  companyUuid: string;
  poolCvId: number;
  poolCvName: string;
  positionId: number;
  positionTitle: string;
  uncertaintyScore: number;  // 0-1, higher = more uncertain
  matchScore: number;        // 0-100
  status: ReviewTaskStatus;
  assignedTo?: string;
  assignedToName?: string;
  priority: ReviewTaskPriority;
  completedAt?: string;
  completedBy?: string;
  relevanceLabel?: number;   // 0-5, set when completed
  notes?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteReviewTaskRequest {
  relevanceLabel: number;  // 0-5, required
  notes?: string;
}

export interface ReviewTaskStats {
  total: number;
  pending: number;
  assigned: number;
  completed: number;
  cancelled: number;
  averageUncertaintyScore: number;
}
```

**API Service Kullanımı:**

```typescript
// services/cv-sharing/reviewTaskService.ts
import { reviewTaskService } from '@/services/cv-sharing/reviewTaskService';

// 1. İnceleme görevlerini listele
const { data: tasks } = useQuery({
  queryKey: ['review-tasks', { status: 'PENDING' }],
  queryFn: () => reviewTaskService.getReviewTasks({
    page: 0,
    size: 20,
    status: 'PENDING'
  })
});

// 2. Yeni görevler oluştur (aktif öğrenme)
const generateMutation = useMutation({
  mutationFn: () => reviewTaskService.generateReviewTasks({
    maxTasks: 100,
    uncertaintyThreshold: 0.5,
    matchScoreMin: 40,
    matchScoreMax: 70
  }),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['review-tasks'] });
    enqueueSnackbar(`${data.generated} review tasks generated`, { variant: 'success' });
  }
});

// 3. Görevi tamamla (etiket ekle)
const completeMutation = useMutation({
  mutationFn: ({ taskId, data }: { taskId: string, data: CompleteReviewTaskRequest }) =>
    reviewTaskService.completeReviewTask(taskId, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['review-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['training-examples'] });
    enqueueSnackbar('Review task completed', { variant: 'success' });
  }
});

// Kullanım
completeMutation.mutate({
  taskId: 'task-uuid',
  data: {
    relevanceLabel: 3,
    notes: 'Moderate match, candidate has most skills but lacks some experience'
  }
});

// 4. Görevi kullanıcıya ata
const assignMutation = useMutation({
  mutationFn: ({ taskId, userId }: { taskId: string, userId: string }) =>
    reviewTaskService.assignReviewTask(taskId, userId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['review-tasks'] });
    enqueueSnackbar('Task assigned successfully', { variant: 'success' });
  }
});
```

**Component Örneği (Review Task Tamamlama):**

```typescript
// ReviewTaskDetail.tsx
const [formData, setFormData] = useState<CompleteReviewTaskRequest>({
  relevanceLabel: 3,
  notes: ''
});

// Relevance Label slider
<Box sx={{ mt: 2 }}>
  <Typography gutterBottom>
    Relevance Label: {formData.relevanceLabel}
  </Typography>
  <Slider
    value={formData.relevanceLabel}
    onChange={(_, value) => setFormData({ ...formData, relevanceLabel: value as number })}
    min={0}
    max={5}
    step={1}
    marks={[
      { value: 0, label: '0 - Irrelevant' },
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5 - Perfect' }
    ]}
  />
</Box>

// Notes input
<TextField
  label="Notes"
  multiline
  rows={4}
  value={formData.notes}
  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
  helperText="Add notes about this match (optional)"
  fullWidth
/>

// Complete button
<Button
  variant="contained"
  onClick={() => completeMutation.mutate({ taskId: task.id, data: formData })}
  disabled={completeMutation.isPending}
>
  {completeMutation.isPending ? <CircularProgress size={20} /> : 'Complete Task'}
</Button>
```

**Kullanım Senaryoları:**

**Senaryo 1: Günlük Aktif Öğrenme İş Akışı**
1. Review Tasks sayfasına gidin
2. "Generate Review Tasks" butonuna tıklayın (veya otomatik çalışır)
3. Sistem belirsiz çiftleri belirler
4. Görevler listelenir
5. Her görevi inceleyin
6. İlgili skor verin (0-5)
7. Notlar ekleyin
8. Tamamlayın

**Senaryo 2: Görev Atama**
1. Review Tasks sayfasına gidin
2. Bir görevi seçin
3. "Assign" butonuna tıklayın
4. Kullanıcı seçin
5. Görev atanır
6. Atanan kullanıcı bildirim alır

**Senaryo 3: Görev Detayı ve Tamamlama**
1. Review Tasks sayfasından bir göreve tıklayın
2. Review Task Detail sayfasına yönlendirilirsiniz
3. CV ve Position detaylarını görüntüleyin
4. Eşleşme skorunu inceleyin
5. İlgili skor verin (0-5)
6. Notlar ekleyin
7. "Complete Task" butonuna tıklayın
8. Görev tamamlanır ve eğitim örneği oluşturulur

#### 3. Model Registry (Model Kayıt Defteri) Sayfası

**Rota:** `/cv-sharing/models`  
**Dosya:** `src/pages/cv-sharing/models/ModelRegistryList.tsx`

**Amaç:**
Eğitilmiş ML modellerini görüntüleme, yönetme ve etkinleştirme.

**Özellikler:**
- **Model Listesi:** Tüm kayıtlı modeller
- **Durum Göstergesi:** TRAINING, READY, ACTIVE, DEPRECATED
- **Metrikler:** NDCG, MAP gibi model metrikleri
- **Etkinleştirme:** Modeli etkinleştirme (önceki model otomatik devre dışı kalır)
- **Detaylar:** Model detaylarını görüntüleme
- **Kayıt:** Yeni model kaydetme (data scientist için)

**Type Definitions:**

```typescript
// types/cv-sharing/model.ts
export type ModelType = 'LAMBDAMART' | 'NEURAL_RANKER' | 'LINEAR';
export type ModelStatus = 'TRAINING' | 'READY' | 'ACTIVE' | 'DEPRECATED';

export interface ModelRegistry {
  id: string;
  companyUuid?: string;
  modelVersion: string;  // e.g., "v1.0.0"
  modelType: ModelType;
  modelPath: string;     // S3 path or local path
  trainingConfig: Record<string, any>;  // Hyperparameters
  metrics: {
    'ndcg@10'?: number;
    'ndcg@20'?: number;
    'map'?: number;
    'mrr'?: number;
  };
  trainingExamplesCount: number;
  trainingDateFrom?: string;
  trainingDateTo?: string;
  status: ModelStatus;
  isActive: boolean;
  activatedAt?: string;
  activatedBy?: string;
  activatedByName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModelRegistryRequest {
  modelVersion: string;
  modelType: ModelType;
  modelPath: string;
  trainingConfig: Record<string, any>;
  metrics: Record<string, number>;
  trainingExamplesCount: number;
  trainingDateFrom?: string;
  trainingDateTo?: string;
  notes?: string;
}
```

**API Service Kullanımı:**

```typescript
// services/cv-sharing/modelRegistryService.ts
import { modelRegistryService } from '@/services/cv-sharing/modelRegistryService';

// 1. Modelleri listele
const { data: models } = useQuery({
  queryKey: ['models'],
  queryFn: () => modelRegistryService.getModels()
});

// 2. Yeni model kaydet
const registerMutation = useMutation({
  mutationFn: (data: ModelRegistryRequest) =>
    modelRegistryService.registerModel(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['models'] });
    enqueueSnackbar('Model registered successfully', { variant: 'success' });
  }
});

// Kullanım
registerMutation.mutate({
  modelVersion: 'v1.0.0',
  modelType: 'LAMBDAMART',
  modelPath: 's3://matching-models/company-uuid/lambdamart-v1.0.0.pkl',
  trainingConfig: {
    n_estimators: 100,
    learning_rate: 0.1,
    max_depth: 6
  },
  metrics: {
    'ndcg@10': 0.85,
    'map': 0.82
  },
  trainingExamplesCount: 2000,
  trainingDateFrom: '2024-01-01',
  trainingDateTo: '2024-01-31',
  notes: 'First production model'
});

// 3. Modeli etkinleştir
const activateMutation = useMutation({
  mutationFn: (modelId: string) =>
    modelRegistryService.activateModel(modelId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['models'] });
    queryClient.invalidateQueries({ queryKey: ['active-model'] });
    enqueueSnackbar('Model activated successfully', { variant: 'success' });
  }
});

// 4. Aktif modeli getir
const { data: activeModel } = useQuery({
  queryKey: ['active-model'],
  queryFn: () => modelRegistryService.getActiveModel()
});
```

**Component Örneği (Model Kayıt Formu):**

```typescript
// ModelRegistryForm.tsx
const [formData, setFormData] = useState<ModelRegistryRequest>({
  modelVersion: '',
  modelType: 'LAMBDAMART',
  modelPath: '',
  trainingConfig: {},
  metrics: {},
  trainingExamplesCount: 0
});

// Model Version input
<TextField
  label="Model Version"
  value={formData.modelVersion}
  onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })}
  placeholder="v1.0.0"
  required
  helperText="Version identifier (e.g., v1.0.0)"
/>

// Model Type select
<FormControl fullWidth>
  <InputLabel>Model Type</InputLabel>
  <Select
    value={formData.modelType}
    onChange={(e) => setFormData({ ...formData, modelType: e.target.value as ModelType })}
  >
    <MenuItem value="LAMBDAMART">LambdaMART (Recommended)</MenuItem>
    <MenuItem value="NEURAL_RANKER">Neural Ranker (Experimental)</MenuItem>
    <MenuItem value="LINEAR">Linear (Baseline)</MenuItem>
  </Select>
</FormControl>

// Metrics input (JSON)
<TextField
  label="Metrics (JSON)"
  multiline
  rows={4}
  value={JSON.stringify(formData.metrics, null, 2)}
  onChange={(e) => {
    try {
      setFormData({ ...formData, metrics: JSON.parse(e.target.value) });
    } catch (err) {
      // Invalid JSON
    }
  }}
  helperText='Example: {"ndcg@10": 0.85, "map": 0.82}'
/>
```

**Kullanım Senaryoları:**

**Senaryo 1: Model Kaydı (Data Scientist)**
1. Model Registry sayfasına gidin
2. "Register New Model" butonuna tıklayın
3. Model bilgilerini girin:
   - Model Version (örn. "v1.0.0")
   - Model Type (LambdaMART, Neural Ranker, etc.)
   - Model Path (S3 veya local path)
   - Training Config (JSON)
   - Metrics (NDCG, MAP, etc.)
4. Kaydedin

**Senaryo 2: Model Etkinleştirme (HR Admin)**
1. Model Registry sayfasına gidin
2. Bir model seçin (durum: READY)
3. Model detaylarını inceleyin
4. Metrikleri kontrol edin
5. "Activate" butonuna tıklayın
6. Onaylayın
7. Model etkinleştirilir, önceki model devre dışı kalır

**Senaryo 3: Model Karşılaştırma**
1. Model Registry sayfasına gidin
2. Birden fazla modeli görüntüleyin
3. Metrikleri karşılaştırın
4. En iyi performans gösteren modeli seçin
5. Etkinleştirin

#### 4. A/B Tests (A/B Testleri) Sayfası

**Rota:** `/cv-sharing/ab-tests`  
**Dosya:** `src/pages/cv-sharing/ab-tests/AbTestList.tsx`

**Amaç:**
Farklı eşleştirme stratejilerini karşılaştırmak için A/B testleri oluşturma ve yönetme.

**Özellikler:**
- **Test Listesi:** Tüm A/B testleri
- **Durum Yönetimi:** DRAFT, RUNNING, PAUSED, COMPLETED
- **Varyant Yapılandırması:** Birden fazla varyant (baseline, model v1, model v2, etc.)
- **Trafik Bölünmesi:** Varyantlar arası trafik yüzdesi (örn. 50/50, 33/33/34)
- **Metrikler:** Test metrikleri (dönüşüm oranı, eşleşme kalitesi, etc.)
- **Başlatma/Durdurma:** Testi başlatma, duraklatma, tamamlama

**Type Definitions:**

```typescript
// types/cv-sharing/ab-test.ts
export type AbTestStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export interface AbTestVariant {
  name: string;              // e.g., "baseline", "lambdaMART-v1"
  configId?: string;         // Matching config ID
  modelId?: number;          // Model ID (if using ML model)
  description?: string;
}

export interface TrafficSplit {
  [variantName: string]: number;  // e.g., {"baseline": 50, "lambdaMART-v1": 50}
}

export interface AbTest {
  id: string;
  companyUuid?: string;
  testName: string;
  description?: string;
  status: AbTestStatus;
  startDate?: string;
  endDate?: string;
  variants: AbTestVariant[];
  trafficSplit: TrafficSplit;
  metrics?: {
    [variantName: string]: {
      totalMatches: number;
      averageRelevanceLabel: number;
      conversionRate: number;
      averageTimeToFill: number;
    };
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AbTestRequest {
  testName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  variants: AbTestVariant[];
  trafficSplit: TrafficSplit;
}
```

**API Service Kullanımı:**

```typescript
// services/cv-sharing/abTestService.ts
import { abTestService } from '@/services/cv-sharing/abTestService';

// 1. A/B testlerini listele
const { data: tests } = useQuery({
  queryKey: ['ab-tests'],
  queryFn: () => abTestService.getAbTests()
});

// 2. Yeni A/B testi oluştur
const createMutation = useMutation({
  mutationFn: (data: AbTestRequest) =>
    abTestService.createAbTest(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    enqueueSnackbar('A/B test created successfully', { variant: 'success' });
  }
});

// Kullanım
createMutation.mutate({
  testName: 'baseline-vs-lambdamart-v1',
  description: 'Compare baseline vs LambdaMART v1.0',
  startDate: '2024-01-15',
  endDate: '2024-01-29',
  variants: [
    {
      name: 'baseline',
      configId: 'config-uuid-1',
      modelId: undefined,
      description: 'Current baseline matching algorithm'
    },
    {
      name: 'lambdaMART-v1',
      configId: 'config-uuid-1',
      modelId: 1,
      description: 'LambdaMART v1.0.0 model'
    }
  ],
  trafficSplit: {
    'baseline': 50,
    'lambdaMART-v1': 50
  }
});

// 3. Testi başlat
const startMutation = useMutation({
  mutationFn: (testId: string) =>
    abTestService.startAbTest(testId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    enqueueSnackbar('A/B test started', { variant: 'success' });
  }
});

// 4. Testi tamamla
const completeMutation = useMutation({
  mutationFn: (testId: string) =>
    abTestService.completeAbTest(testId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    enqueueSnackbar('A/B test completed', { variant: 'success' });
  }
});
```

**Component Örneği (A/B Test Oluşturma):**

```typescript
// AbTestForm.tsx
const [variants, setVariants] = useState<AbTestVariant[]>([
  { name: 'baseline', configId: '', modelId: undefined }
]);
const [trafficSplit, setTrafficSplit] = useState<TrafficSplit>({
  'baseline': 50
});

// Varyant ekleme
const addVariant = () => {
  setVariants([...variants, { name: '', configId: '', modelId: undefined }]);
  setTrafficSplit({ ...trafficSplit, '': 0 });
};

// Trafik bölünmesi validasyonu
const totalTraffic = Object.values(trafficSplit).reduce((sum, v) => sum + v, 0);
const isValid = totalTraffic === 100 && variants.length >= 2;

// Trafik yüzdesi input
{variants.map((variant, index) => (
  <TextField
    key={index}
    label={`${variant.name} Traffic %`}
    type="number"
    value={trafficSplit[variant.name] || 0}
    onChange={(e) => {
      setTrafficSplit({
        ...trafficSplit,
        [variant.name]: Number(e.target.value)
      });
    }}
    inputProps={{ min: 0, max: 100, step: 1 }}
    helperText={`Total must equal 100 (Current: ${totalTraffic})`}
  />
))}
```

**Kullanım Senaryoları:**

**Senaryo 1: Baseline vs. ML Model Testi**
1. A/B Tests sayfasına gidin
2. "Create A/B Test" butonuna tıklayın
3. Test bilgilerini girin:
   - Test Name (örn. "Baseline vs LambdaMART v1.0")
   - Description
   - Start Date / End Date
4. Varyantları yapılandırın:
   - Varyant 1: Baseline (mevcut eşleştirme)
   - Varyant 2: LambdaMART model (yeni)
5. Trafik bölünmesini ayarlayın (50/50)
6. Kaydedin
7. "Start Test" butonuna tıklayın
8. Test çalışmaya başlar

**Senaryo 2: Test Metriklerini İzleme**
1. A/B Tests sayfasına gidin
2. Çalışan bir testi seçin
3. Test detaylarını görüntüleyin
4. Metrikleri inceleyin:
   - Match quality (ortalama ilgili skor)
   - Conversion rate (eşleşmeler → başvurular)
   - Time to fill position
5. Varyantları karşılaştırın
6. Kazanan varyantı belirleyin

**Senaryo 3: Test Tamamlama ve Model Etkinleştirme**
1. A/B Tests sayfasına gidin
2. Tamamlanmış bir testi seçin
3. Metrikleri analiz edin
4. Kazanan varyantı belirleyin
5. Eğer ML model kazandıysa:
   - Model Registry'ye gidin
   - Modeli etkinleştirin
6. Testi "Complete" olarak işaretleyin

### Frontend API Entegrasyonu

**Kullanılan Servisler:**

**Training Service:**
- `trainingService.getTrainingExamples()` - Eğitim örneklerini listele
- `trainingService.createTrainingExample()` - Yeni eğitim örneği oluştur
- `trainingService.exportTrainingData()` - Eğitim verisini dışa aktar
- `trainingService.getTrainingStats()` - İstatistikleri getir

**Review Task Service:**
- `reviewTaskService.getReviewTasks()` - İnceleme görevlerini listele
- `reviewTaskService.generateReviewTasks()` - Yeni görevler oluştur
- `reviewTaskService.completeReviewTask()` - Görevi tamamla (etiket ekle)
- `reviewTaskService.assignReviewTask()` - Görevi kullanıcıya ata

**Model Registry Service:**
- `modelRegistryService.getModels()` - Modelleri listele
- `modelRegistryService.registerModel()` - Yeni model kaydet
- `modelRegistryService.activateModel()` - Modeli etkinleştir
- `modelRegistryService.getActiveModel()` - Aktif modeli getir

**A/B Test Service:**
- `abTestService.getAbTests()` - A/B testlerini listele
- `abTestService.createAbTest()` - Yeni A/B testi oluştur
- `abTestService.startAbTest()` - Testi başlat
- `abTestService.completeAbTest()` - Testi tamamla

### UI Component Örnekleri

**Training Example List Table:**

```typescript
// TrainingExampleList.tsx - DataGrid columns
const columns = [
  { field: 'poolCvName', headerName: 'CV Name', width: 200 },
  { field: 'positionTitle', headerName: 'Position', width: 200 },
  { field: 'relevanceLabel', headerName: 'Relevance', width: 120,
    renderCell: (params) => (
      <Chip 
        label={params.value}
        color={
          params.value >= 4 ? 'success' : 
          params.value >= 3 ? 'warning' : 
          'default'
        }
      />
    )
  },
  { field: 'matchScore', headerName: 'Match Score', width: 120 },
  { field: 'labeledByName', headerName: 'Labeled By', width: 150 },
  { field: 'labeledAt', headerName: 'Labeled At', width: 180,
    renderCell: (params) => format(new Date(params.value), 'yyyy-MM-dd HH:mm')
  }
];
```

**Review Task Priority Badge:**

```typescript
// ReviewTaskList.tsx - Priority indicator
const getPriorityColor = (priority: ReviewTaskPriority) => {
  switch (priority) {
    case 'HIGH': return 'error';
    case 'MEDIUM': return 'warning';
    case 'LOW': return 'info';
    default: return 'default';
  }
};

<Chip 
  label={task.priority}
  color={getPriorityColor(task.priority)}
  size="small"
/>

// Uncertainty Score indicator
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Typography variant="caption">Uncertainty:</Typography>
  <LinearProgress 
    variant="determinate" 
    value={task.uncertaintyScore * 100} 
    sx={{ width: 100, height: 8 }}
  />
  <Typography variant="caption">
    {(task.uncertaintyScore * 100).toFixed(1)}%
  </Typography>
</Box>
```

**Model Metrics Display:**

```typescript
// ModelDetail.tsx - Metrics visualization
<Grid container spacing={2}>
  <Grid item xs={6}>
    <Card>
      <CardContent>
        <Typography variant="h6">NDCG@10</Typography>
        <Typography variant="h4" color="primary">
          {model.metrics['ndcg@10']?.toFixed(3) || 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={6}>
    <Card>
      <CardContent>
        <Typography variant="h6">MAP</Typography>
        <Typography variant="h4" color="primary">
          {model.metrics['map']?.toFixed(3) || 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
</Grid>

// Model status badge
<Chip 
  label={model.status}
  color={
    model.status === 'ACTIVE' ? 'success' :
    model.status === 'READY' ? 'info' :
    model.status === 'TRAINING' ? 'warning' :
    'default'
  }
  icon={model.isActive ? <CheckCircleIcon /> : undefined}
/>
```

**A/B Test Metrics Comparison:**

```typescript
// AbTestDetail.tsx - Metrics comparison chart
<Box sx={{ mt: 3 }}>
  <Typography variant="h6">Metrics Comparison</Typography>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Metric</TableCell>
        {abTest.variants.map(v => (
          <TableCell key={v.name} align="right">{v.name}</TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>Average Relevance Label</TableCell>
        {abTest.variants.map(v => (
          <TableCell key={v.name} align="right">
            {abTest.metrics?.[v.name]?.averageRelevanceLabel.toFixed(2)}
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell>Conversion Rate</TableCell>
        {abTest.variants.map(v => (
          <TableCell key={v.name} align="right">
            {(abTest.metrics?.[v.name]?.conversionRate * 100).toFixed(2)}%
          </TableCell>
        ))}
      </TableRow>
    </TableBody>
  </Table>
</Box>
```

### Menü Entegrasyonu

**MainLayout.tsx'te Yeni Menü Öğeleri:**

```typescript
// CV Sharing alt menüsüne eklendi:
{
  text: 'Review Tasks',
  icon: <TaskIcon />,
  path: '/cv-sharing/review-tasks',
  roles: ['HUMAN_RESOURCES', 'COMPANY_MANAGER']
},
{
  text: 'Training',
  icon: <SchoolIcon />,
  path: '/cv-sharing/training',
  roles: ['HUMAN_RESOURCES', 'COMPANY_MANAGER']
},
{
  text: 'Models',
  icon: <ModelTrainingIcon />,
  path: '/cv-sharing/models',
  roles: ['HUMAN_RESOURCES', 'COMPANY_MANAGER']
},
{
  text: 'A/B Tests',
  icon: <ScienceIcon />,
  path: '/cv-sharing/ab-tests',
  roles: ['HUMAN_RESOURCES', 'COMPANY_MANAGER']
}
```

### Kullanım Senaryoları (Tam İş Akışı)

#### Senaryo 1: Tam ML İş Akışı (HR + Data Scientist)

1. **Veri Toplama (HR):**
   - HR ekibi 1 ay boyunca eşleşmeleri etiketler (1000+ örnek)
   - Review Tasks sayfasından günlük görevleri tamamlar
   - Training Examples sayfasından manuel örnekler oluşturur

2. **Veri Dışa Aktarma (HR):**
   - Training Examples sayfasından "Export Training Data" butonuna tıklar
   - CSV/JSON formatında indirir
   - Data scientist'e gönderir

3. **Model Eğitimi (Data Scientist):**
   - Eğitim verisini alır
   - LambdaMART modelini offline eğitir
   - Modeli değerlendirir (NDCG, MAP metrikleri)

4. **Model Kaydı (Data Scientist):**
   - Model Registry sayfasına gider
   - "Register New Model" butonuna tıklar
   - Model bilgilerini ve metriklerini girer
   - Model dosyasını S3'e yükler
   - Modeli kaydeder

5. **A/B Testi (HR Admin):**
   - A/B Tests sayfasına gider
   - "Create A/B Test" butonuna tıklar
   - Baseline vs. LambdaMART testi oluşturur
   - 50/50 trafik bölünmesi ayarlar
   - Testi başlatır

6. **İzleme (HR Admin):**
   - 2 hafta boyunca test metriklerini izler
   - Varyantları karşılaştırır
   - LambdaMART'ın daha iyi performans gösterdiğini görür

7. **Model Etkinleştirme (HR Admin):**
   - Model Registry sayfasına gider
   - LambdaMART modelini seçer
   - "Activate" butonuna tıklar
   - Model etkinleştirilir, tüm eşleşmeler yeni modeli kullanır

#### Senaryo 2: Günlük Aktif Öğrenme İş Akışı (HR)

1. **Günlük Görev Oluşturma (Otomatik):**
   - Sistem her gece 2'de belirsiz çiftleri belirler
   - Review Tasks oluşturulur

2. **Görev İnceleme (HR):**
   - HR ekibi Review Tasks sayfasına gider
   - Pending görevleri görüntüler
   - Her görevi açar ve inceler

3. **Etiketleme (HR):**
   - CV ve Position detaylarını görüntüler
   - İlgili skor verir (0-5)
   - Notlar ekler
   - Görevi tamamlar

4. **Sürekli İyileştirme:**
   - Etiketler eğitim örneklerine dönüşür
   - Aylık olarak veri dışa aktarılır
   - Yeni model eğitilir ve dağıtılır

### Performans ve Kullanılabilirlik

**Frontend Optimizasyonları:**
- **Lazy Loading:** Phase 3 sayfaları lazy load edilir
- **Caching:** React Query ile 5 dakika cache
- **Optimistic Updates:** İşlemlerde anlık UI güncellemesi
- **Error Handling:** Kapsamlı hata yönetimi ve kullanıcı bildirimleri

**Kullanıcı Deneyimi:**
- **Loading States:** Tüm API çağrılarında loading göstergeleri
- **Empty States:** Veri yoksa bilgilendirici mesajlar
- **Success/Error Messages:** İşlem sonuçları için snackbar bildirimleri
- **Form Validation:** Tüm formlarda client-side validasyon

---

## Sürüm Geçmişi

### v1.0.0 (2024)
- İlk stabil sürüm
- CV Sharing modülü
- Timesheet modülü
- Çalışan, Şirket, Departman yönetimi
- Masraf yönetimi
- Raporlama modülü
- **Phase 2: AI-Enhanced Matching** (Embeddings, ANN Search, Re-ranking)
- **Phase 3: Machine Learning & Active Learning** (Training Examples, Review Tasks, Model Registry, A/B Testing)
