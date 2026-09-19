# Fitness Takip

Kişisel antrenman programını takip etmeni ve Google Takvim ile otomatik senkronize etmeni sağlayan Python (Streamlit) tabanlı bir web uygulaması.

## Özellikler

* **2 İdman, 1 Dinlenme Döngüsü:** Uygulama, antrenman günlerini ve dinlenme günlerini otomatik olarak bu döngüye göre planlar.
* **Seri (Streak) Takibi:** Kaç gün arka arkaya antrenman yaptığını ve maksimum serini hesaplar.
* **Eksik Antrenman Bildirimi:** Geçmişte yapılması gereken ancak işaretlenmeyen antrenmanlar için kullanıcıyı uyarır ve takvimi buna göre yeniden düzenler.
* **Google Takvim Senkronizasyonu:** Gelecek 90 günlük idman takvimini otomatik olarak Google Takvim'ine (başlangıç ve bitiş saatleriyle birlikte) ekler.
* **Aylık Takvim Görünümü:** Streamlit arayüzünde geçmiş ve gelecek tüm antrenmanları görselleştirir.
* **İstatistikler:** Son 30 gün ve 1 yıl içindeki antrenman başarı oranlarını gösterir.

## Kurulum ve Çalıştırma

1. Gerekli kütüphaneleri yükleyin:
   ```bash
   pip install -r requirements.txt
   ```
2. Uygulamayı çalıştırın:
   ```bash
   streamlit run app.py
   ```

## Notlar

Bu proje, kişisel verileri gizli tutmak amacıyla `data.json`, `credentials.json` ve `token.json` dosyalarını GitHub'a yüklememek üzere `.gitignore` ile yapılandırılmıştır. Uygulamanın çalışması için kendi Google Cloud Console projenizden OAuth Client ID oluşturup klasöre `credentials.json` olarak kaydetmeniz gerekmektedir.
