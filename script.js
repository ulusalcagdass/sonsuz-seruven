// Sabit Başlangıç Tarihi: 30 Kasım 2018
const startDate = new Date('2018-11-30T00:00:00');

// DOM Elementleri
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function updateCounter() {
    const now = new Date();
    const diff = now - startDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = days;
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
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
        console.log("Firebase ayarlanmadı, LocalStorage kullanılıyor.");
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

    const memory = { date, location, note, timestamp: new Date().toISOString() };

    if (isFirebaseActive) {
        try {
            await db.collection("memories").add(memory);
            alert("Anı başarıyla kaydedildi!");
        } catch (error) {
            alert("Kaydedilirken hata oluştu.");
        }
    } else {
        const memories = JSON.parse(localStorage.getItem('memories') || '[]');
        memory.id = Date.now().toString();
        memories.push(memory);
        localStorage.setItem('memories', JSON.stringify(memories));
        renderMemories();
        alert("Anı telefona kaydedildi!");
    }
    journalLocation.value = '';
    journalNote.value = '';
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

function renderMemories() {
    journalList.innerHTML = '';
    const selectedDate = journalDate.value;

    if (isFirebaseActive) {
        // Önceki dinleyiciyi temizle (varsa)
        if (unsubscribeJournal) {
            unsubscribeJournal();
        }

        let query = db.collection("memories");

        // Eğer tarih seçiliyse, o tarihe göre filtrele
        if (selectedDate) {
            query = query.where("date", "==", selectedDate);
        }

        // Sıralama: Tarih seçiliyse timestamp'e göre, değilse tarihe göre
        // Not: Firestore'da 'where' ve 'orderBy' farklı alanlardaysa index gerekir.
        // Basitlik için: Tarih seçiliyse client-side sıralama veya sadece eklenme sırası yeterli.
        // Karmaşıklığı önlemek için sadece filtreliyoruz, sıralamayı client'ta yapabiliriz veya index hatası almamak için orderBy'ı kaldırabiliriz.

        unsubscribeJournal = query.onSnapshot(snapshot => {
            journalList.innerHTML = '';
            const memories = [];
            snapshot.forEach(doc => {
                memories.push({ id: doc.id, ...doc.data() });
            });

            // Client-side sıralama (En yeni en üstte)
            memories.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

            if (memories.length === 0) {
                journalList.innerHTML = '<div class="empty-state">Bu tarihte anı yok.</div>';
                return;
            }

            memories.forEach(memory => createMemoryCard(memory, memory.id));
        });

    } else {
        let memories = JSON.parse(localStorage.getItem('memories') || '[]');
        if (selectedDate) {
            memories = memories.filter(m => m.date === selectedDate);
        }
        memories.sort((a, b) => b.date.localeCompare(a.date));

        if (memories.length === 0) {
            journalList.innerHTML = '<div class="empty-state">Bu tarihte anı yok.</div>';
            return;
        }
        memories.forEach(memory => createMemoryCard(memory, memory.id));
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
            let memories = JSON.parse(localStorage.getItem('memories') || '[]');
            memories = memories.filter(m => m.id !== id);
            localStorage.setItem('memories', JSON.stringify(memories));
            renderMemories();
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

            if (isFirebaseActive) {
                await db.collection("photos").add({ url: base64Image, date: uploadDate, timestamp: new Date().toISOString() });
            } else {
                const photos = JSON.parse(localStorage.getItem('photos') || '[]');
                photos.push({ id: Date.now() + Math.random().toString(36), url: base64Image, date: uploadDate });
                localStorage.setItem('photos', JSON.stringify(photos));
            }
        } catch (error) {
            console.error("Hata:", error);
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
        let photos = JSON.parse(localStorage.getItem('photos') || '[]');
        if (filterDate) photos = photos.filter(p => p.date === filterDate);
        if (photos.length === 0) {
            photoGrid.innerHTML = '<div class="empty-state">Fotoğraf bulunamadı.</div>';
            return;
        }
        photos.reverse();
        photos.forEach(photo => createPhotoElement(photo.url, photo.id));
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
    } else {
        let photos = JSON.parse(localStorage.getItem('photos') || '[]');
        photos = photos.filter(p => p.id !== id);
        localStorage.setItem('photos', JSON.stringify(photos));
        renderPhotos();
    }
}

renderMemories();
renderPhotos();

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

    if (isFirebaseActive) {
        await db.collection("bucket_list").add({
            text: text,
            completed: false,
            timestamp: new Date().toISOString()
        });
    } else {
        const items = JSON.parse(localStorage.getItem('bucket_list') || '[]');
        items.push({ id: Date.now().toString(), text: text, completed: false });
        localStorage.setItem('bucket_list', JSON.stringify(items));
        renderBucketList();
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
        const items = JSON.parse(localStorage.getItem('bucket_list') || '[]');
        items.forEach(item => createBucketElement(item.id, item));
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
        const items = JSON.parse(localStorage.getItem('bucket_list') || '[]');
        const item = items.find(i => i.id === id);
        if (item) item.completed = isChecked;
        localStorage.setItem('bucket_list', JSON.stringify(items));
        renderBucketList();
    }
};

window.deleteBucketItem = async function (id) {
    if (confirm("Bu maddeyi silmek istiyor musun?")) {
        if (isFirebaseActive) {
            await db.collection("bucket_list").doc(id).delete();
        } else {
            let items = JSON.parse(localStorage.getItem('bucket_list') || '[]');
            items = items.filter(i => i.id !== id);
            localStorage.setItem('bucket_list', JSON.stringify(items));
            renderBucketList();
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

// --- SAAT BAŞI AŞK BİLDİRİMİ (12:00 - 00:00) ---
const notificationSound = document.getElementById('notification-sound');
const testNotificationBtn = document.getElementById('test-notification-btn');

if (testNotificationBtn) {
    testNotificationBtn.addEventListener('click', () => {
        requestNotificationPermission();
        sendLoveNotification("Seni Çok Seviyorum! ❤️", "İyi ki varsın sevgilim...");
    });
}

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("Tarayıcın bildirimleri desteklemiyor.");
        return;
    }

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

function sendLoveNotification(title, body) {
    // Ses çal
    if (notificationSound) {
        notificationSound.currentTime = 0;
        notificationSound.play().catch(e => console.log("Ses çalınamadı (etkileşim gerekli olabilir):", e));
    }

    // Bildirim gönder
    if (Notification.permission === "granted") {
        // Service Worker varsa onu kullan (PWA için daha iyi)
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: 'icon.png',
                    vibrate: [200, 100, 200]
                });
            });
        } else {
            // Standart bildirim
            new Notification(title, {
                body: body,
                icon: 'icon.png'
            });
        }
    }
}

// Her dakika kontrol et
setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Saat 12:00 ile 00:00 arasında (00:00 dahil değil, 23:59 son)
    // Ve tam saat başıysa (dakika 0)
    if (hours >= 12 && hours <= 23 && minutes === 0) {
        sendLoveNotification("Seni Çok Seviyorum! ❤️", "Saat başı hatırlatması: İyi ki hayatımdasın.");
    }
}, 60000); // 60 saniyede bir kontrol et
