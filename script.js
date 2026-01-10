// Sabit Başlangıç Tarihi: 30 Kasım 2018
const startDate = new Date('2018-11-30T00:00:00');

// DOM Elementleri
const yearsEl = document.getElementById('years');
const monthsEl = document.getElementById('months');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function updateCounter() {
    const now = new Date();

    // Tam Yıl Hesabı (Başlangıçtan bugüne geçen tam yıl)
    let years = now.getFullYear() - startDate.getFullYear();

    // Ay ve Gün düzeltmeleri (Eğer henüz o ay/gün gelmediyse yılı düşür)
    let m = now.getMonth() - startDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < startDate.getDate())) {
        years--;
    }

    // TOPLAM AY HESABI
    // (Yıl farkı * 12) + (Ay farkı)
    let totalMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    // Eğer gün henüz dolmadıysa 1 ay eksilt
    if (now.getDate() < startDate.getDate()) {
        totalMonths--;
    }

    // TOPLAM GÜN HESABI
    const diff = now - startDate;
    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    // TOPLAM SAAT HESABI
    const totalHours = Math.floor(diff / (1000 * 60 * 60));

    // TOPLAM DAKİKA HESABI
    const totalMinutes = Math.floor(diff / (1000 * 60));

    // Saniye (Kalan süre - Normal akış 0-59)
    let seconds = now.getSeconds() - startDate.getSeconds();
    if (seconds < 0) { seconds += 60; }

    // Ekrana Yazdırma
    yearsEl.textContent = years + 1; // 8. Yıl

    // Ay: Toplam geçen ay
    monthsEl.textContent = totalMonths.toLocaleString('tr-TR');

    // Gün: Toplam geçen gün
    daysEl.textContent = totalDays.toLocaleString('tr-TR');

    hoursEl.textContent = totalHours.toLocaleString('tr-TR');
    minutesEl.textContent = totalMinutes.toLocaleString('tr-TR');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
}

setInterval(updateCounter, 1000);
updateCounter();

// Müzik Kontrolü (Görünmez & Otomatik)
const bgMusic = document.getElementById('bg-music');

// Müzik işlemlerini sayfa yüklenmesini beklemeden başlat
document.addEventListener('DOMContentLoaded', () => {
    bgMusic.volume = 0.5;

    // Şarkının "Büklüm büklüm boynunda" kısmından başlaması için saniye ayarı
    bgMusic.currentTime = 42;

    // Tarayıcıya dosyayı hemen yüklemeye başlamasını söyle
    bgMusic.load();

    // Müzik çalma girişimi
    const attemptPlay = () => {
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Müzik çalıyor. 🎵");
                removeUnlockListeners();
            }).catch(error => {
                console.log("Otomatik çalma engellendi. Etkileşim bekleniyor.");
            });
        }
    };

    // Kullanıcı etkileşimi ile kilidi aç
    const unlockAudio = () => {
        // Tekrar denemeden önce süreyi garantiye al
        if (bgMusic.currentTime < 42) bgMusic.currentTime = 42;

        bgMusic.play().then(() => {
            console.log("Etkileşim ile müzik başladı.");
            removeUnlockListeners();
        }).catch(e => console.log("Hala çalınamadı:", e));
    };

    const removeUnlockListeners = () => {
        window.removeEventListener('click', unlockAudio, true);
        window.removeEventListener('touchstart', unlockAudio, true);
        window.removeEventListener('scroll', unlockAudio, true);
        window.removeEventListener('keydown', unlockAudio, true);
    };

    // Dinleyicileri HEMEN ekle (Load olayını bekleme)
    window.addEventListener('click', unlockAudio, true);
    window.addEventListener('touchstart', unlockAudio, true);
    window.addEventListener('scroll', unlockAudio, true);
    window.addEventListener('keydown', unlockAudio, true);

    // İlk denemeyi yap
    attemptPlay();
});




// --- FIREBASE AYARLARI ---
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
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "API_KEY_BURAYA") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        storage = firebase.storage();
        isFirebaseActive = true;
        console.log("Firebase aktif!");
    } else {
        console.log("Firebase ayarlanmadı, IndexedDB kullanılacak.");
        initDB(); // IndexedDB başlat
    }
} catch (e) {
    console.error("Firebase başlatma hatası:", e);
    // Hata olsa bile IndexedDB denenebilir
    if (!isFirebaseActive) initDB();
}

// --- INDEXEDDB ALTYAPISI (Hafıza Artırımı İçin) ---
const DB_NAME = 'AnniversaryAppDB';
const DB_VERSION = 1;
let idb;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB hatası:", event.target.error);
            alert("Veritabanı başlatılamadı! Tarayıcınız desteklemiyor olabilir.");
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            idb = event.target.result;
            console.log("IndexedDB başarıyla açıldı.");
            // Veri taşıma işlemini başlat (Migration)
            migrateFromLocalStorage();
            resolve(idb);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Tabloları oluştur (Object Stores)
            if (!db.objectStoreNames.contains('memories')) {
                db.createObjectStore('memories', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('photos')) {
                db.createObjectStore('photos', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('bucket_list')) {
                db.createObjectStore('bucket_list', { keyPath: 'id' });
            }
            console.log("IndexedDB tabloları oluşturuldu.");
        };
    });
}

// LocalStorage'dan Veri Taşıma (Migration)
async function migrateFromLocalStorage() {
    const stores = ['memories', 'photos', 'bucket_list'];
    let migrationCount = 0;

    for (const storeName of stores) {
        const rawData = localStorage.getItem(storeName);
        if (rawData) {
            try {
                const data = JSON.parse(rawData);
                if (Array.isArray(data) && data.length > 0) {
                    console.log(`${storeName} için ${data.length} veri taşınıyor...`);
                    const tx = idb.transaction(storeName, 'readwrite');
                    const store = tx.objectStore(storeName);

                    data.forEach(item => {
                        // ID kontrolü (yoksa ekle)
                        if (!item.id) item.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                        store.put(item);
                    });

                    await new Promise((resolve) => {
                        tx.oncomplete = () => {
                            console.log(`${storeName} taşındı.`);
                            localStorage.removeItem(storeName); // Temizlik
                            migrationCount++;
                            resolve();
                        };
                        tx.onerror = () => resolve(); // Hata olsa da devam et
                    });
                }
            } catch (e) {
                console.error("Migration hatası:", e);
            }
        }
    }

    if (migrationCount > 0) {
        alert("Eski verileriniz başarıyla geniş hafızaya taşındı! 🎉");
        // Sayfayı yenilemeye gerek yok, veriler idb'de.
        // Fonksiyonlar render edildiğinde idb'den çekecek.
        renderMemories();
        renderPhotos();
        renderBucketList();
    } else {
        // İlk yükleme veya zaten taşınmışsa renderları çağır
        renderMemories();
        renderPhotos();
        renderBucketList();
    }
}

// GENEL VERİTABANI FONKSİYONLARI (CRUD)
function dbAdd(storeName, item) {
    return new Promise((resolve, reject) => {
        if (!idb) { reject("Veritabanı hazır değil"); return; }
        const tx = idb.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.add(item);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

function dbGetAll(storeName) {
    return new Promise((resolve, reject) => {
        if (!idb) { resolve([]); return; } // DB yoksa boş dön
        const tx = idb.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

function dbDelete(storeName, id) {
    return new Promise((resolve, reject) => {
        if (!idb) { reject("DB yok"); return; }
        const tx = idb.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

function dbUpdate(storeName, item) {
    return new Promise((resolve, reject) => {
        if (!idb) { reject("DB yok"); return; }
        const tx = idb.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(item); // put = güncelle veya ekle

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
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
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
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
        toggleMenu();
    });
});


// Yardımcı Fonksiyon: Yerel Tarih Stringi (YYYY-MM-DD)
function getLocalDateString() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - (offset * 60 * 1000));
    return local.toISOString().split('T')[0];
}

// --- ANI DEFTERİ (JOURNAL) ---
const journalDate = document.getElementById('journal-date');
const journalLocation = document.getElementById('journal-location');
const journalNote = document.getElementById('journal-note');
const addNoteBtn = document.getElementById('add-note-btn');
const journalList = document.getElementById('journal-list');
const getLocationBtn = document.getElementById('get-location-btn');

// Bugünün tarihini ayarla
journalDate.value = getLocalDateString();

getLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("Tarayıcınız konum özelliğini desteklemiyor.");
        return;
    }
    getLocationBtn.textContent = "İzin bekleniyor...";
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
        alert("Konum alınamadı.");
        getLocationBtn.textContent = "📍 Konumu Bul";
    }, { enableHighAccuracy: true });
});

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
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // Benzersiz ID
        date,
        location,
        note,
        timestamp: new Date().toISOString()
    };

    try {
        if (isFirebaseActive) {
            await db.collection("memories").add(memory);
        } else {
            await dbAdd('memories', memory);
        }
        alert("Anı başarıyla kaydedildi!");
        journalLocation.value = '';
        journalNote.value = '';
        if (!isFirebaseActive) renderMemories();
    } catch (error) {
        console.error("Anı kaydetme hatası:", error);
        if (error.name === 'QuotaExceededError') {
            alert("Hafıza TAMAMEN dolu! Lütfen cihazınızda yer açın.");
        } else {
            alert("Kaydedilemedi: " + error.message);
        }
    }
});

function formatDateManual(dateStr) {
    if (!dateStr) return "";
    const months = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    const parts = dateStr.split('-');
    const year = parts[0];
    const monthIndex = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    return `${day} ${months[monthIndex]} ${year}`;
}

let unsubscribeJournal = null; // Dinleyiciyi durdurmak için

async function renderMemories() {
    journalList.innerHTML = '';
    const selectedDate = journalDate.value;

    if (isFirebaseActive) {
        // ... (Firebase kodları aynı kalır) ...
        // Önceki dinleyiciyi temizle
        if (unsubscribeJournal) unsubscribeJournal();

        let query = db.collection("memories");
        if (selectedDate) query = query.where("date", "==", selectedDate);

        unsubscribeJournal = query.onSnapshot(snapshot => {
            journalList.innerHTML = '';
            const memories = [];
            snapshot.forEach(doc => { memories.push({ id: doc.id, ...doc.data() }); });
            memories.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
            if (memories.length === 0) {
                journalList.innerHTML = '<div class="empty-state">Bu tarihte anı yok.</div>';
                return;
            }
            memories.forEach(memory => createMemoryCard(memory, memory.id));
        });

    } else {
        // INDEXEDDB OKUMA
        try {
            let memories = await dbGetAll('memories');

            if (selectedDate) {
                memories = memories.filter(m => m.date === selectedDate);
            }
            // Tarihe göre sıralama (Yeniden eskiye)
            memories.sort((a, b) => b.date.localeCompare(a.date));

            if (memories.length === 0) {
                journalList.innerHTML = '<div class="empty-state">Bu tarihte anı yok.</div>';
                return;
            }
            memories.forEach(memory => createMemoryCard(memory, memory.id));
        } catch (e) {
            console.error("Anılar yüklenemedi:", e);
        }
    }
}

function createMemoryCard(data, id) {
    const card = document.createElement('div');
    card.className = 'journal-card fade-in';

    const dateStr = formatDateManual(data.date);

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

window.deleteMemory = async function (id) {
    if (confirm("Bu anıyı silmek istediğine emin misin?")) {
        if (isFirebaseActive) {
            await db.collection("memories").doc(id).delete();
        } else {
            try {
                await dbDelete('memories', id);
                renderMemories();
            } catch (e) {
                alert("Silinemedi: " + e.message);
            }
        }
    }
};


// --- FOTOĞRAF ALBÜMÜ ---
const photoUpload = document.getElementById('photo-upload');
const photoGrid = document.getElementById('photo-grid');
const photoFilterDate = document.getElementById('photo-filter-date');
const clearFilterBtn = document.getElementById('clear-filter-btn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeLightbox = document.querySelector('.close-lightbox');
const uploadStatus = document.getElementById('upload-status');
const uploadMsg = document.getElementById('upload-msg');

let unsubscribePhotos = null;

photoFilterDate.addEventListener('change', renderPhotos);
clearFilterBtn.addEventListener('click', () => {
    photoFilterDate.value = '';
    renderPhotos();
});

closeLightbox.addEventListener('click', () => { lightbox.style.display = "none"; });
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.style.display = "none"; });

function resizeImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 800;
                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

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

    // DÜZELTME: Eğer filtrede bir tarih seçiliyse O TARİHE kaydet, yoksa bugüne kaydet.
    // Böylece geçmişe dönük fotoğraf yüklenebilir.
    let uploadDate = photoFilterDate.value;
    if (!uploadDate) {
        uploadDate = getLocalDateString();
    }

    const totalFiles = files.length;

    // Kullanıcıya hangi tarihe yüklendiğini gösterelim
    const dateParts = uploadDate.split('-');
    const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
    showUploadStatus(`${formattedDate} tarihine ${totalFiles} fotoğraf yükleniyor...`);

    for (let i = 0; i < totalFiles; i++) {
        try {
            showUploadStatus(`${i + 1}/${totalFiles} yükleniyor... (${formattedDate})`);
            const base64Image = await resizeImage(files[i]);

            const photoData = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                url: base64Image,
                date: uploadDate,
                timestamp: new Date().toISOString()
            };

            if (isFirebaseActive) {
                await db.collection("photos").add(photoData);
            } else {
                await dbAdd('photos', photoData);
            }
        } catch (error) {
            console.error("Fotoğraf yükleme hatası:", error);
            alert(`Fotoğraf yüklenemedi (${files[i].name}): Hafıza dolu olabilir.`);
        }
    }
    hideUploadStatus();
    if (!isFirebaseActive) renderPhotos();
    showUploadStatus("Tamamlandı! ✅");
    setTimeout(hideUploadStatus, 2000);
});

function renderPhotos() {
    photoGrid.innerHTML = '';
    const filterDate = photoFilterDate.value;

    if (isFirebaseActive) {
        if (unsubscribePhotos) unsubscribePhotos();

        let query = db.collection("photos");
        if (filterDate) {
            query = query.where("date", "==", filterDate);
        }

        unsubscribePhotos = query.onSnapshot(snapshot => {
            photoGrid.innerHTML = '';
            const photos = [];
            snapshot.forEach(doc => {
                photos.push({ id: doc.id, ...doc.data() });
            });

            // Client-side sıralama
            photos.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

            if (photos.length === 0) {
                photoGrid.innerHTML = '<div class="empty-state">Fotoğraf bulunamadı.</div>';
                return;
            }

            photos.forEach(photo => createPhotoElement(photo.url, photo.id));
        });
    } else {
        // INDEXEDDB OKUMA
        try {
            let photos = await dbGetAll('photos');

            if (filterDate) {
                photos = photos.filter(p => p.date === filterDate);
            }

            if (photos.length === 0) {
                photoGrid.innerHTML = '<div class="empty-state">Fotoğraf bulunamadı.</div>';
                return;
            }

            // Sıralama (Yeniden eskiye) - Timestamp varsa kullan yoksa ters çevir
            photos.sort((a, b) => {
                if (a.timestamp && b.timestamp) return b.timestamp.localeCompare(a.timestamp);
                return 0; // Doğal sıra kalsın, zaten son eklenen en son gelmişti ama dbGetAll sırası garanti değil.
            });
            // dbGetAll genellikle keyPath sırasına göre gelir (id). ID timestamp içeriyorsa sıralı olabilir.
            // Garanti olsun diye reverse ya da sort:
            photos.reverse();

            photos.forEach(photo => createPhotoElement(photo.url, photo.id));
        } catch (e) {
            console.error("Fotoğraflar yüklenemedi:", e);
        }
    }
}

function createPhotoElement(url, id) {
    const img = document.createElement('div');
    img.className = 'photo-item fade-in';
    img.style.backgroundImage = `url(${url})`;
    img.addEventListener('click', () => { openLightbox(url, id); });
    photoGrid.appendChild(img);
}

let currentPhotoId = null;
function openLightbox(url, id) {
    lightbox.style.display = "block";
    lightboxImg.src = url;
    currentPhotoId = id;

    const oldBtn = document.getElementById('lightbox-delete-btn');
    if (oldBtn) oldBtn.remove();

    const deleteBtn = document.createElement('button');
    deleteBtn.id = 'lightbox-delete-btn';
    deleteBtn.className = 'lightbox-delete-btn';
    deleteBtn.innerHTML = '🗑️ Sil';
    deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        if (confirm("Bu fotoğrafı silmek istediğine emin misin?")) {
            await deletePhoto(currentPhotoId);
            lightbox.style.display = "none";
        }
    };
    lightbox.appendChild(deleteBtn);
}

async function deletePhoto(id) {
    if (isFirebaseActive) {
        await db.collection("photos").doc(id).delete();
        if (isFirebaseActive) {
            await db.collection("photos").doc(id).delete();
        } else {
            try {
                await dbDelete('photos', id);
                renderPhotos();
            } catch (e) {
                alert("Silinemedi: " + e.message);
            }
        }
    }

    // Başlangıçta renderları çağırma (InitDB içinde çağrılıyor, burada gerek yok veya await lazım)
    // initDB() asenkron olduğu için veriler gelmeden renderlar boş çizebilir.
    // initDB migration bitince zaten renderları çağırıyor.
    // O yüzden burayı kaldırabiliriz veya güvence olsun diye setTimeout ile bırakabiliriz.
    // En temizi: initDB'nin onsuccess'i zaten çağıracak. 
    // renderMemories();
    // renderPhotos();

    // --- YAPILACAKLAR LİSTESİ (BUCKET LIST) ---
    const bucketInput = document.getElementById('bucket-input');
    const addBucketBtn = document.getElementById('add-bucket-btn');
    const bucketList = document.getElementById('bucket-list');
    let unsubscribeBucket = null;

    // Event Listener'ı güvenli bir şekilde ekle
    if (addBucketBtn) {
        addBucketBtn.addEventListener('click', addBucketItem);
    }

    async function addBucketItem() {
        const text = bucketInput.value.trim();
        if (!text) return;

        const item = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            timestamp: new Date().toISOString()
        };

        if (isFirebaseActive) {
            await db.collection("bucket_list").add(item);
        } else {
            try {
                await dbAdd('bucket_list', item);
                renderBucketList();
            } catch (e) {
                alert("Eklenemedi (Hafıza sorunu olabilir): " + e.message);
            }
        }
        bucketInput.value = '';
    }

    function renderBucketList() {
        if (!bucketList) return;
        bucketList.innerHTML = '';

        if (isFirebaseActive) {
            if (unsubscribeBucket) unsubscribeBucket();

            unsubscribeBucket = db.collection("bucket_list")
                .orderBy("timestamp", "desc")
                .onSnapshot(snapshot => {
                    bucketList.innerHTML = '';
                    snapshot.forEach(doc => {
                        createBucketElement(doc.id, doc.data());
                    });
                });
        } else {
            // INDEXEDDB OKUMA
            try {
                const items = await dbGetAll('bucket_list');
                // Sıralama (Tamamlananlar altta, yeniler üstte vs.)
                // Basitçe ekleme sırasına göre veya tersi

                if (items.length === 0) {
                    // Boş
                }

                items.forEach(item => createBucketElement(item.id, item));
            } catch (e) {
                console.error("Liste yüklenemedi", e);
            }
        }
    }

    function createBucketElement(id, data) {
        const item = document.createElement('div');
        item.className = `bucket-item ${data.completed ? 'completed' : ''}`;
        item.innerHTML = `
        <input type="checkbox" class="bucket-checkbox" ${data.completed ? 'checked' : ''} onchange="toggleBucketItem('${id}', this.checked)">
        <span class="bucket-text">${data.text}</span>
        <button class="delete-btn" onclick="deleteBucketItem('${id}')">🗑️</button>
    `;
        bucketList.appendChild(item);
    }

    window.toggleBucketItem = async function (id, isChecked) {
        if (isChecked) {
            // KONFETİ PATLAT! 🎉
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }

        if (isFirebaseActive) {
            await db.collection("bucket_list").doc(id).update({ completed: isChecked });
        } else {
            try {
                // Önce öğeyi bulmak lazım ama idb'de update için nesnenin tamamı lazım
                // Bu yüzden önce get yapıp sonra put yapabiliriz, ya da sadece dbUpdate ile tüm nesneyi yollarız
                // Ancak elimizde tüm nesne yok, sadece ID var.
                // Basit çözüm: Tüm listeyi çekip bulmak (performanssız ama çalışır)
                // Daha iyi çözüm: get(id) -> update -> put

                // Transaction ile yapalım
                const tx = idb.transaction('bucket_list', 'readwrite');
                const store = tx.objectStore('bucket_list');
                const req = store.get(id);

                req.onsuccess = () => {
                    const item = req.result;
                    if (item) {
                        item.completed = isChecked;
                        store.put(item);
                        renderBucketList(); // UI güncelle
                    }
                };
            } catch (e) {
                console.error("Güncellenemedi", e);
            }
        }
    };

    window.deleteBucketItem = async function (id) {
        if (confirm("Bu maddeyi silmek istiyor musun?")) {
            if (isFirebaseActive) {
                await db.collection("bucket_list").doc(id).delete();
            } else {
                try {
                    await dbDelete('bucket_list', id);
                    renderBucketList();
                } catch (e) {
                    alert("Silinemedi: " + e.message);
                }
            }
        }
    };

    // Sayfa geçişlerinde listeyi yükle
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'bucket-list-page' &&
                mutation.target.classList.contains('active-page') &&
                !mutation.oldValue.includes('active-page')) {
                renderBucketList();
            }
        });
    });

    const bucketPage = document.getElementById('bucket-list-page');
    if (bucketPage) {
        observer.observe(bucketPage, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
        if (bucketPage.classList.contains('active-page')) renderBucketList();
    }
