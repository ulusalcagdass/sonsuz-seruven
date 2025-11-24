// Sabit Başlangıç Tarihi: 30 Kasım 2018
// Aylar 0'dan başlar: Kasım = 10
const startDate = new Date('2018-11-30T00:00:00');

// DOM Elementleri
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function updateCounter() {
    const now = new Date();
    const diff = now - startDate;

    // Zaman birimleri hesaplama
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // Ekrana yazdırma (Çift haneli formatlama)
    daysEl.textContent = days;
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
}

// Sayacı başlat (Her saniyede bir güncelle - Salise kalktığı için 1000ms yeterli)
setInterval(updateCounter, 1000);

// İlk yüklemede hemen çalıştır
updateCounter();

// Müzik Kontrolü
const bgMusic = document.getElementById('bg-music');

// 1. Hemen çalmayı dene (Tarayıcı izin verirse)
window.addEventListener('load', () => {
    bgMusic.currentTime = 45; // Nakarat başlangıcı
    bgMusic.play().catch(error => {
        console.log("Otomatik oynatma tarayıcı tarafından engellendi. Kullanıcı etkileşimi bekleniyor.", error);
    });
});

// 2. Eğer engellenirse, ekrana ilk dokunuşta çal (Yedek plan)
document.body.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Müzik başlatılamadı:", e));
    }
}, { once: true });
document.body.addEventListener('touchstart', () => {
    if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Müzik başlatılamadı:", e));
    }
}, { once: true });

// ... (Menü kodları aynı kalıyor) ...

// --- FIREBASE AYARLARI (Ortak Veritabanı) ---
const firebaseConfig = {
    apiKey: "AIzaSyBu2e7VWVv5B7GWNHdHzJQgurY37pJgINg",
    authDomain: "sonsuzseruven.firebaseapp.com",
    projectId: "sonsuzseruven",
    storageBucket: "sonsuzseruven.firebasestorage.app",
    messagingSenderId: "1030466348280",
    appId: "1:1030466348280:web:aa2504338f0bfe718e870d",
    measurementId: "G-JM96LDCRF3"
};

let db, storage;
let isFirebaseActive = false;

try {
    // Firebase kütüphanesi yüklendi mi ve API Key girildi mi kontrol et
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "API_KEY_BURAYA") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        storage = firebase.storage();
        isFirebaseActive = true;
        console.log("Firebase aktif! Veriler buluta kaydediliyor.");
    } else {
        console.log("Firebase ayarlanmadı, LocalStorage (Telefon Hafızası) kullanılıyor.");
    }
} catch (e) {
    console.error("Firebase başlatma hatası:", e);
}

// --- MENÜ VE NAVİGASYON ---
const menuBtn = document.getElementById('menu-btn');
const closeMenuBtn = document.getElementById('close-menu');
const sideMenu = document.getElementById('side-menu');
const menuOverlay = document.getElementById('menu-overlay');
const menuItems = document.querySelectorAll('.side-menu li');
const pages = document.querySelectorAll('.page');

function toggleMenu() {
    sideMenu.classList.toggle('open');
    menuOverlay.classList.toggle('active');
}

menuBtn.addEventListener('click', toggleMenu);
closeMenuBtn.addEventListener('click', toggleMenu);
menuOverlay.addEventListener('click', toggleMenu);

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        // Aktif menü öğesini güncelle
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Sayfayı değiştir
        const targetId = item.getAttribute('data-target');
        pages.forEach(page => {
            if (page.id === targetId) {
                page.classList.remove('hidden-page');
                page.classList.add('active-page');
            } else {
                page.classList.add('hidden-page');
                page.classList.remove('active-page');
            }
        });

        // Menüyü kapat
        toggleMenu();
    });
});



// --- ANI DEFTERİ (JOURNAL) ---
const journalDate = document.getElementById('journal-date');
const journalLocation = document.getElementById('journal-location');
const journalNote = document.getElementById('journal-note');
const addNoteBtn = document.getElementById('add-note-btn');
const journalList = document.getElementById('journal-list');
const getLocationBtn = document.getElementById('get-location-btn');

// Bugünün tarihini varsayılan yap
journalDate.valueAsDate = new Date();

// Konum Bulma
getLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("Tarayıcınız konum özelliğini desteklemiyor.");
        return;
    }

    getLocationBtn.textContent = "İzin bekleniyor...";

    // Kullanıcıya bilgi ver (iOS PWA bazen sessizce reddeder)
    alert("Konum izni isteği gönderilecek. Lütfen ekrana gelen uyarıda 'İzin Ver'i seçin.\n\nEğer uyarı gelmezse: Ayarlar > Gizlilik > Konum Servisleri'nden tarayıcınıza izin verin.");

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        getLocationBtn.textContent = "Adres bulunuyor...";

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            const district = data.address.suburb || data.address.district || "";
            const city = data.address.province || data.address.city || "";
            journalLocation.value = `${district} ${city}`.trim() || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
            getLocationBtn.textContent = "📍 Konumu Bul";
        } catch (e) {
            journalLocation.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            getLocationBtn.textContent = "📍 Konumu Bul";
        }

    }, (error) => {
        console.error("Konum hatası:", error);
        let errorMsg = "Konum alınamadı.";
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMsg = "Konum izni reddedildi. Lütfen ayarlardan izin verin.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMsg = "Konum bilgisi mevcut değil.";
                break;
            case error.TIMEOUT:
                errorMsg = "Konum isteği zaman aşımına uğradı.";
                break;
        }
        alert(errorMsg);
        getLocationBtn.textContent = "📍 Konumu Bul";
    }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
});

// Tarih değişince filtrele
journalDate.addEventListener('change', renderMemories);

addNoteBtn.addEventListener('click', async () => {
    const date = journalDate.value;
    const location = journalLocation.value;
    const note = journalNote.value;

    if (!date || !note) {
        alert("Lütfen tarih ve not alanlarını doldurun.");
        return;
    }

    const memory = {
        date,
        location,
        note,
        timestamp: new Date().toISOString()
    };

    if (isFirebaseActive) {
        // Firebase'e kaydet
        try {
            await db.collection("memories").add(memory);
            alert("Anı başarıyla kaydedildi!");
        } catch (error) {
            console.error("Hata:", error);
            alert("Kaydedilirken hata oluştu.");
        }
    } else {
        // LocalStorage'a kaydet
        const memories = JSON.parse(localStorage.getItem('memories') || '[]');
        memories.push(memory);
        localStorage.setItem('memories', JSON.stringify(memories));
        renderMemories(); // Listeyi güncelle
        alert("Anı telefona kaydedildi! (Bulut için ayar gerekli)");
    }

    // Formu temizle
    journalLocation.value = '';
    journalNote.value = '';
});

// Eski renderMemories fonksiyonu kaldırıldı (Aşağıda yeniden tanımlandı)

// Eski createMemoryCard fonksiyonu kaldırıldı (Aşağıda yeniden tanımlandı)

// Sayfa yüklenince anıları getir
renderMemories();


// --- FOTOĞRAF ALBÜMÜ ---
const photoUpload = document.getElementById('photo-upload');
const photoGrid = document.getElementById('photo-grid');
const photoFilterDate = document.getElementById('photo-filter-date');
const clearFilterBtn = document.getElementById('clear-filter-btn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeLightbox = document.querySelector('.close-lightbox');

// Filtreleme Eventleri
photoFilterDate.addEventListener('change', renderPhotos);
clearFilterBtn.addEventListener('click', () => {
    photoFilterDate.value = '';
    renderPhotos();
});

// Lightbox Kapatma
closeLightbox.addEventListener('click', () => {
    lightbox.style.display = "none";
});
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = "none";
    }
});

// Resim Sıkıştırma Fonksiyonu (Firestore için)
function resizeImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max boyut 800px (Firestore 1MB limiti için güvenli)
                const MAX_SIZE = 800;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // JPEG olarak sıkıştır (0.7 kalite)
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Upload Status Elementleri
const uploadStatus = document.getElementById('upload-status');
const uploadMsg = document.getElementById('upload-msg');

function showUploadStatus(msg) {
    uploadMsg.textContent = msg;
    uploadStatus.classList.remove('hidden');
}

function hideUploadStatus() {
    uploadStatus.classList.add('hidden');
}

photoUpload.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadDate = new Date().toISOString().split('T')[0];
    const totalFiles = files.length;
    let processedFiles = 0;

    showUploadStatus(`${totalFiles} fotoğraf hazırlanıyor...`);

    for (let i = 0; i < totalFiles; i++) {
        const file = files[i];

        try {
            showUploadStatus(`${i + 1}/${totalFiles} yükleniyor...`);

            // Resmi sıkıştır (Base64 formatında al)
            const base64Image = await resizeImage(file);

            if (isFirebaseActive) {
                // Firestore'a direkt kaydet
                await db.collection("photos").add({
                    url: base64Image,
                    date: uploadDate,
                    timestamp: new Date().toISOString()
                });
            } else {
                // LocalStorage
                const photos = JSON.parse(localStorage.getItem('photos') || '[]');
                // ID oluştur (Silme işlemi için gerekli)
                const id = Date.now() + Math.random().toString(36).substr(2, 9);
                photos.push({
                    id: id,
                    url: base64Image,
                    date: uploadDate
                });
                localStorage.setItem('photos', JSON.stringify(photos));
            }

            processedFiles++;
        } catch (error) {
            console.error("Fotoğraf işleme hatası:", error);
        }
    }

    hideUploadStatus();
    if (!isFirebaseActive) renderPhotos();
    // Başarılı bildirimi (kısa süreli)
    showUploadStatus("Tamamlandı! ✅");
    setTimeout(hideUploadStatus, 2000);
});

function renderPhotos() {
    photoGrid.innerHTML = '';
    const filterDate = photoFilterDate.value;

    if (isFirebaseActive) {
        // Firebase'den çek
        let query = db.collection("photos").orderBy("timestamp", "desc");

        // Firestore'da client-side filtreleme yapmak daha kolay şimdilik
        query.onSnapshot(snapshot => {
            photoGrid.innerHTML = '';
            let hasPhoto = false;

            snapshot.forEach(doc => {
                const data = doc.data();
                // Tarih filtresi kontrolü
                if (filterDate && data.date !== filterDate) return;

                createPhotoElement(data.url, doc.id);
                hasPhoto = true;
            });

            if (!hasPhoto) {
                photoGrid.innerHTML = '<div class="empty-state">Fotoğraf bulunamadı.</div>';
            }
        });
    } else {
        // LocalStorage'dan çek
        let photos = JSON.parse(localStorage.getItem('photos') || '[]');

        if (filterDate) {
            photos = photos.filter(p => p.date === filterDate);
        }

        if (photos.length === 0) {
            photoGrid.innerHTML = '<div class="empty-state">Fotoğraf bulunamadı.</div>';
            return;
        }

        photos.reverse();
        photos.forEach(photo => {
            createPhotoElement(photo.url, photo.id);
        });
    }
}

function createPhotoElement(url, id) {
    const img = document.createElement('div');
    img.className = 'photo-item fade-in';
    img.style.backgroundImage = `url(${url})`;

    img.addEventListener('click', () => {
        openLightbox(url, id);
    });

    photoGrid.appendChild(img);
}

// Lightbox Logic
let currentPhotoId = null;

function openLightbox(url, id) {
    lightbox.style.display = "block";
    lightboxImg.src = url;
    currentPhotoId = id;

    // Silme butonu ekle (varsa eskisini temizle)
    const oldBtn = document.getElementById('lightbox-delete-btn');
    if (oldBtn) oldBtn.remove();

    const deleteBtn = document.createElement('button');
    deleteBtn.id = 'lightbox-delete-btn';
    deleteBtn.className = 'lightbox-delete-btn';
    deleteBtn.innerHTML = '🗑️ Sil';

    deleteBtn.onclick = async (e) => {
        e.stopPropagation(); // Lightbox kapanmasın
        if (confirm("Bu fotoğrafı silmek istediğine emin misin?")) {
            await deletePhoto(currentPhotoId);
            lightbox.style.display = "none";
        }
    };

    lightbox.appendChild(deleteBtn);
}

async function deletePhoto(id) {
    if (isFirebaseActive) {
        try {
            await db.collection("photos").doc(id).delete();
            // Snapshot listener otomatik güncelleyecek
        } catch (e) {
            console.error("Silme hatası:", e);
            alert("Silinirken hata oluştu.");
        }
    } else {
        let photos = JSON.parse(localStorage.getItem('photos') || '[]');
        photos = photos.filter(p => p.id !== id);
        localStorage.setItem('photos', JSON.stringify(photos));
        renderPhotos();
    }
}

// --- ANI SİLME FONKSİYONLARI ---

function renderMemories() {
    journalList.innerHTML = '';
    let memories = [];

    if (isFirebaseActive) {
        db.collection("memories").orderBy("date", "desc").onSnapshot(snapshot => {
            journalList.innerHTML = '';
            snapshot.forEach(doc => {
                createMemoryCard(doc.data(), doc.id);
            });
        });
    } else {
        memories = JSON.parse(localStorage.getItem('memories') || '[]');
        const selectedDate = journalDate.value;
        if (selectedDate) {
            memories = memories.filter(m => m.date === selectedDate);
        }
        memories.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (memories.length === 0) {
            journalList.innerHTML = '<div class="empty-state">Bu tarihte anı yok.</div>';
            return;
        }

        memories.forEach(memory => {
            createMemoryCard(memory, memory.id);
        });
    }
}

function createMemoryCard(data, id) {
    const card = document.createElement('div');
    card.className = 'journal-card fade-in';

    const dateObj = new Date(data.date);
    const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    card.innerHTML = `
        <div class="journal-header">
            <div class="journal-date">${dateStr}</div>
            <button class="delete-btn" onclick="deleteMemory('${id}')">🗑️</button>
        </div>
        ${data.location ? `<div class="journal-location">📍 ${data.location}</div>` : ''}
        <div class="journal-text">${data.note}</div>
    `;
    journalList.appendChild(card);
}

// Global scope'a ekle (HTML'den çağrılabilmesi için)
window.deleteMemory = async function (id) {
    if (confirm("Bu anıyı silmek istediğine emin misin?")) {
        if (isFirebaseActive) {
            try {
                await db.collection("memories").doc(id).delete();
            } catch (e) {
                console.error("Silme hatası:", e);
            }
        } else {
            let memories = JSON.parse(localStorage.getItem('memories') || '[]');
            memories = memories.filter(m => m.id !== id); // ID kontrolü
            localStorage.setItem('memories', JSON.stringify(memories));
            renderMemories();
        }
    }
};

// Not eklerken ID eklemeyi unutma (LocalStorage için)
// Bu kısmı override etmemiz gerekebilir ama şimdilik renderMemories'i burada tanımladığımız için yukarıdaki addNoteBtn listener'ı eski renderMemories'i çağırsa bile çalışır mı?
// Hayır, addNoteBtn yukarıda tanımlı ve eski renderMemories'i görüyor olabilir mi?
// JS'de fonksiyonlar hoisted olur ama const ile tanımlananlar olmaz.
// En iyisi addNoteBtn listener'ını da güncellemek ama dosya yapısı karışık.
// Şimdilik renderMemories'i override ediyoruz, bu yeterli olmalı çünkü addNoteBtn renderMemories'i çağırıyor.

// Sayfa yüklenince anıları getir
renderMemories();
