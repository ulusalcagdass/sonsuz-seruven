# Uygulamayı Nasıl Güncellersin?

Uygulamada bir değişiklik yaptığında (yeni özellik, düzeltme vs.), bu değişikliklerin internetteki sitene (GitHub Pages) gitmesi için şu 3 adımı yapman yeterli.

Linkin (**https://ulusalcagdass.github.io/sonsuz-seruven/**) ASLA değişmez. Sen kodları gönderince site otomatik güncellenir.

## Adım Adım Güncelleme

1. **Terminal**'i aç.
2. Proje klasörüne git (Eğer kapattıysan):
   ```bash
   cd ~/Desktop/Sonsuz_Seruven_App
   ```

3. Şu 3 sihirli komutu sırasıyla yaz ve Enter'a bas:

   **1. Değişiklikleri Paketle:**
   ```bash
   git add .
   ```

   **2. Pakete İsim Ver (Tırnak içine ne yaptığını yazabilirsin):**
   ```bash
   git commit -m "Uygulama güncellendi"
   ```

   **3. Buluta Gönder:**
   ```bash
   git push
   ```

Bu kadar! `git push` dedikten 1-2 dakika sonra siten kendiliğinden güncellenmiş olur.
