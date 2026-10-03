# Fitness Takip Projesi 💪

Bu proje, kişisel antrenman programınızı ve istatistiklerinizi hem bilgisayardan (web) hem de cebinizden (mobil) eşzamanlı olarak takip edebilmeniz için geliştirilmiş **tamamen bulut tabanlı**, uçtan uca modern bir sistemdir.

## 🏗️ Proje Mimarisi

Sistem, önceki yerel (Streamlit/FastAPI) versiyonundan tamamen kurtarılarak **PythonAnywhere** bulut sunucusuna taşınmıştır. Cihazlarınız bilgisayarınıza bağımlı kalmadan 7/24 bulut ile haberleşir:

1. **Bulut API ve Web Dashboard (Flask + Tailwind CSS):** 
   - `flask_app.py` üzerinden çalışan ve PythonAnywhere üzerinde barındırılan ana omurgadır.
   - Bilgisayardan veya telefondan tarayıcı ile girildiğinde modern, hızlı ve Tailwind ile tasarlanmış zengin bir web arayüzü sunar (İstatistikler, FullCalendar entegrasyonu, antrenman döngüsü yönetimi).
   - Aynı zamanda `/api/data` uç noktası (endpoint) üzerinden mobil uygulamaya JSON formatında veri sağlar.
2. **Mobil Uygulama (React Native Expo - `mobile_app/`):** 
   - Expo Router sekme (tab) yapısıyla tasarlanmış, şık ve performanslı mobil uygulamadır.
   - İnternet üzerinden (PythonAnywhere API'si aracılığıyla) doğrudan buluttaki `data.json` verinize okuma/yazma yapar.
   - EAS Build ile `.apk` formatında derlenip telefona bağımsız bir uygulama olarak kurulabilir.

## 🚀 Temel Özellikler

* **Algoritmik 10 Günlük Döngü:** Belirlediğiniz 7 antrenman günü, otomatik olarak hesaplanan dinlenme günleriyle birlikte 10 günlük dinlenme planına yayılır.
* **Modüler Düzenleme:** Antrenman sıralamanızı ve isimlerini her iki platformdan da dilediğiniz gibi güncelleyebilirsiniz.
* **Akıllı Takas (Swap) Sistemi:** Eğer o gün programdaki idman yerine döngüdeki başka bir idmanı yaparsanız (örneğin göğüs yerine bacak), sistem bu iki idmanın yerini otomatik olarak değiştirerek gelecek planınızı korur.
* **İstatistik ve Motivasyon:** Seriniz (Streak), en uzun seriniz (Rekor), son 30 günlük ve son 1 yıllık başarı oranlarınız yüzdelik ilerleme çubuklarıyla tutulur.
* **Bulut Senkronizasyonu:** Telefonunuzda yaptığınız bir değişiklik saniyesinde web sitenize, web sitenizde yaptığınız bir değişiklik saniyesinde mobil uygulamanıza yansır.

## ⚙️ Kurulum ve Çalıştırma

### 1. Web Sürümü (Bulut Kullanımı)
Uygulama artık yerel bir sunucu gerektirmez. Herhangi bir cihazın tarayıcısından direkt olarak kendi PythonAnywhere adresinize girerek uygulamayı kullanabilirsiniz:
`http://KULLANICI_ADINIZ.pythonanywhere.com`

> **Not (PWA):** Bu adresi telefonunuzun tarayıcısından açıp "Ana Ekrana Ekle" seçeneğiyle doğrudan bir mobil uygulama gibi (PWA) tam ekran kullanabilirsiniz.

### 2. Mobil Uygulama Geliştirme ve Test (Expo Go)
Mobil uygulama üzerinde geliştirme yapmak veya yerelde test etmek isterseniz:
```bash
cd mobile_app
npm install
npx expo start -c
```
Ardından telefonunuzdaki **Expo Go** uygulaması ile QR kodu okutabilirsiniz. Uygulama verileri doğrudan PythonAnywhere bulut sunucusundan çekecektir.

### 3. Mobil Uygulamayı Pakete (APK) Dönüştürme
Uygulamayı mağaza kalitesinde bir Android APK dosyasına dönüştürmek için:
```bash
cd mobile_app
npx eas-cli login
npx eas-cli build -p android --profile preview
```
İşlem tamamlandığında terminalin size vereceği linkten `.apk` dosyanızı indirip telefonunuza kalıcı olarak kurabilirsiniz.
