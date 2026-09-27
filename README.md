# Fitness Takip Projesi 🏋️‍♂️📱

Bu proje, kişisel antrenman programınızı ve istatistiklerinizi hem bilgisayardan (web) hem de cebinizden (mobil) eşzamanlı olarak takip edebilmeniz için geliştirilmiş uçtan uca modern bir sistemdir.

## 🏗️ Proje Mimarisi

Sistem 3 ana bileşenden oluşmaktadır ve tüm verileriniz merkezi tek bir beyin olan data.json dosyasında tutulur. Bu sayede hiçbir senkronizasyon sorunu yaşanmaz:

1. **Web Dashboard (Streamlit - pp.py):** Bilgisayarınız üzerinden tüm istatistiklerinizi görebileceğiniz, programı yönetebileceğiniz ve döngünüzü düzenleyebileceğiniz zengin masaüstü arayüzü.
2. **Yerel API Sunucusu (FastAPI - pi.py):** Mobil uygulamanın bilgisayarınızdaki data.json dosyasına yerel ağ (Wi-Fi) üzerinden güvenle erişip verileri okuma/yazma yapmasını sağlayan köprü sistem.
3. **Mobil Uygulama (React Native Expo - mobile_app/):** Telefonunuzdan idmanlarınızı anlık olarak işaretleyebileceğiniz, serinizi (streak) ve ilerlemenizi görebileceğiniz son derece şık ve "Hepsi Bir Arada" sekme yapısına sahip mobil arayüz.

## ✨ Temel Özellikler

* **Algoritmik 10 Günlük Döngü:** Belirlediğiniz 7 antrenman günü, bilimsel bir yaklaşımla (2 idman, 1 dinlenme, 2 idman, 1 dinlenme, 3 idman, 1 dinlenme) otomatik olarak 10 günlük dinlenme planına yayılır.
* **Modüler Düzenleme:** Antrenman sıralamanızı ve isimlerini her iki platformdan da dilediğiniz gibi güncelleyebilirsiniz.
* **Akıllı Takas (Swap) Sistemi:** Eğer o gün programdaki idman yerine döngüdeki başka bir idmanı yaparsanız (örneğin göğüs yerine bacak), sistem bu iki idmanın yerini otomatik olarak değiştirerek gelecek planınızı korur.
* **İstatistik ve Motivasyon:** Seriniz (Streak), en uzun seriniz (Rekor), son 30 günlük ve son 1 yıllık başarı oranlarınız yüzdelik ilerleme çubuklarıyla tutulur.
* **Gelişmiş Takvim:** Yeşil (tamamlanan) ve Kırmızı Nokta (planlanan) işaretlemeleriyle geçmiş ve gelecek idman programınızı takvim üzerinden anlık görebilirsiniz.

## 🚀 Kurulum ve Çalıştırma

### 1. Web Uygulamasını Çalıştırma (Bilgisayar İçin)
Uygulama dizinindeyken terminalinizde aşağıdaki komutu çalıştırarak masaüstü arayüzüne ulaşabilirsiniz:
`ash
streamlit run app.py
`

### 2. API Sunucusunu Çalıştırma (Mobil Uygulamanın Veri Alabilmesi İçin)
Mobil uygulamanın bilgisayarınızdaki verileri çekebilmesi için arka planda köprü API'sini başlatmanız gerekir:
`ash
python api.py
`
*(Sunucu yerel ağınızda 8000 portu üzerinden yayın yapmaya başlayacaktır).*

### 3. Mobil Uygulamayı Çalıştırma (Telefon İçin)
Terminalde yeni bir sekme açıp mobil uygulama klasörüne girin ve projeyi başlatın:
`ash
cd mobile_app
npm start
`
*(Alternatif olarak 
pm.cmd start yazabilirsiniz).*

Ardından Android telefonunuza kurduğunuz **Expo Go** uygulaması ile bilgisayar ekranınızda çıkan QR kodu okutmanız yeterlidir. 
**Önemli Not:** Telefonunuzun ve bilgisayarınızın aynı Wi-Fi ağına bağlı olması gerekmektedir.