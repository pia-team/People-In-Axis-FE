# People In Axis - Frontend (React + TypeScript)

## İnsan Kaynakları ve Zaman Yönetim Sistemi - UI

### Teknoloji Stack
- **React 18.2**
- **TypeScript 5.3**
- **Material UI 5.15**
- **Redux Toolkit** (State management)
- **React Query** (Server state management)
- **React Router v6** (Routing)
- **Keycloak JS** (Authentication)
- **Axios** (HTTP client)
- **React Hook Form** (Form management)
- **Vite** (Build tool)

### Özellikler
- ✅ Modern ve responsive UI (Material UI)
- ✅ TypeScript ile tip güvenliği
- ✅ Keycloak OAuth2 entegrasyonu
- ✅ Role-based erişim kontrolü
- ✅ Çoklu dil desteği (TR/EN)
- ✅ Dark/Light tema
- ✅ Real-time bildirimler
- ✅ Excel import/export
- ✅ Grafik ve raporlama (Chart.js)
- ✅ Form validation (Yup)

### Gereksinimler
- Node.js 18+
- npm 9+ veya yarn 1.22+
- Backend API çalışıyor olmalı
- Keycloak server çalışıyor olmalı

### Kurulum

#### 1. Bağımlılıkları Yükle
```bash
# npm kullanarak
npm install

# veya yarn kullanarak
yarn install
```

#### 2. Ortam Değişkenleri
`.env` dosyası oluşturun:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=people-in-axis
VITE_KEYCLOAK_CLIENT_ID=people-in-axis-frontend
```

#### 3. Keycloak Client Yapılandırması
Keycloak admin konsolunda:
1. "people-in-axis" realm'ine gidin
2. Client oluşturun:
   - Client ID: people-in-axis-frontend
   - Client Protocol: openid-connect
   - Root URL: http://localhost:3000
   - Valid Redirect URIs: http://localhost:3000/*
   - Web Origins: http://localhost:3000
   - Access Type: public

#### 4. Uygulamayı Çalıştırma
```bash
# Development mode
npm run dev
# veya
yarn dev

# Uygulama http://localhost:3000 adresinde çalışacak
```

### Build ve Production

#### Production Build
```bash
# Build oluştur
npm run build
# veya
yarn build

# Build'i önizle
npm run preview
# veya
yarn preview
```

#### Docker Build
```bash
# Docker image oluştur
docker build -t people-in-axis-frontend:1.0.0 .

# Container çalıştır
docker run -p 3000:80 \
  -e VITE_API_BASE_URL=http://api.example.com \
  -e VITE_KEYCLOAK_URL=http://keycloak.example.com \
  people-in-axis-frontend:1.0.0
```

### Proje Yapısı
```
src/
├── assets/          # Statik dosyalar (resimler, fontlar)
├── components/      # Tekrar kullanılabilir componentler
│   ├── auth/       # Authentication componentleri
│   ├── common/     # Genel componentler
│   └── forms/      # Form componentleri
├── config/         # Uygulama konfigürasyonu
├── hooks/          # Custom React hooks
├── layouts/        # Sayfa layout'ları
├── pages/          # Sayfa componentleri
│   ├── auth/       # Login, Register sayfaları
│   ├── employees/  # Çalışan yönetimi sayfaları
│   ├── companies/  # Şirket yönetimi sayfaları
│   ├── timesheets/ # Zaman çizelgesi sayfaları
│   ├── expenses/   # Masraf yönetimi sayfaları
│   └── admin/      # Admin sayfaları
├── providers/      # Context providers
├── services/       # API servisleri
├── store/          # Redux store
│   └── slices/     # Redux slices
├── types/          # TypeScript tip tanımlamaları
├── utils/          # Yardımcı fonksiyonlar
└── i18n/           # Çoklu dil dosyaları
```

### Ana Özellikler

#### 1. Çalışan Yönetimi
- Çalışan listesi ve arama
- Çalışan detay görüntüleme
- Yeni çalışan ekleme
- Çalışan bilgilerini güncelleme
- Excel'den toplu import

#### 2. Zaman Çizelgesi
- Haftalık/aylık timesheet görünümü
- Timesheet oluşturma ve düzenleme
- Onay akışı
- Raporlama

#### 3. Masraf Yönetimi
- Masraf girişi
- Fatura/fiş yükleme
- Onay süreci
- Masraf raporları

#### 4. Raporlama
- Dashboard ve özet istatistikler
- Grafik ve chart'lar
- Excel export
- PDF raporlama

### Scripts

```json
{
  "dev": "Geliştirme sunucusunu başlatır",
  "build": "Production build oluşturur",
  "preview": "Production build'i önizler",
  "lint": "ESLint ile kod kontrolü",
  "format": "Prettier ile kod formatlama",
  "test": "Unit testleri çalıştırır",
  "test:coverage": "Test coverage raporu"
}
```

### Test
```bash
# Unit testleri çalıştır
npm test

# Coverage raporu ile
npm run test:coverage
```

### Kod Kalitesi
```bash
# Lint kontrolü
npm run lint

# Kod formatlama
npm run format
```

### Kullanılan Kütüphaneler

#### Core
- react: UI library
- react-dom: React DOM rendering
- react-router-dom: Routing
- typescript: Type safety

#### State Management
- @reduxjs/toolkit: Redux state management
- react-redux: React Redux bindings
- @tanstack/react-query: Server state management

#### UI Components
- @mui/material: Material UI components
- @mui/icons-material: Material icons
- @mui/x-data-grid: Advanced data grid
- @mui/x-date-pickers: Date/time pickers

#### Forms & Validation
- react-hook-form: Form management
- yup: Schema validation
- @hookform/resolvers: Form validation resolvers

#### Authentication
- keycloak-js: Keycloak JavaScript adapter

#### Utilities
- axios: HTTP client
- date-fns: Date utilities
- i18next: Internationalization
- notistack: Snackbar notifications
- recharts: Charts and graphs

### Browser Desteği
- Chrome (son 2 versiyon)
- Firefox (son 2 versiyon)
- Safari (son 2 versiyon)
- Edge (son 2 versiyon)

### Lisans
MIT

### İletişim
PIA Team - peopleinaxis@example.com
