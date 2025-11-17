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

## Sürüm Geçmişi

### v1.0.0 (2024)
- İlk stabil sürüm
- CV Sharing modülü
- Timesheet modülü
- Çalışan, Şirket, Departman yönetimi
- Masraf yönetimi
- Raporlama modülü
