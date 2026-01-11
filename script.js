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
    apiKey: "AIzaSyD4ySpAeQtvPQ9PQb830Ie0KPP_ZIYtt2o",
    authDomain: "beyza-app.firebaseapp.com",
    projectId: "beyza-app",
    storageBucket: "beyza-app.firebasestorage.app",
    messagingSenderId: "456251267418",
    appId: "1:456251267418:web:fd9e3f0e8df0c68a06fb63"
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

            // Daha detaylı adres (Kafe ismi, Mağaza ismi vb.)
            const venue = data.address.amenity || data.address.shop || data.address.tourism || data.address.building || "";
            const district = data.address.suburb || data.address.district || data.address.neighbourhood || "";
            const city = data.address.province || data.address.city || "";

            let finalLocation = "";
            if (venue) {
                finalLocation = `${venue}, ${district}`; // Örn: Starbucks, Kadıköy
            } else {
                finalLocation = `${district} ${city}`.trim(); // Örn: Kadıköy İstanbul
            }

            journalLocation.value = finalLocation || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
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
        try {
            const memories = JSON.parse(localStorage.getItem('memories') || '[]');
            memory.id = Date.now().toString();
            memories.push(memory);
            localStorage.setItem('memories', JSON.stringify(memories));
            renderMemories();
            alert("Anı telefona kaydedildi!");
        } catch (error) {
            console.error("LocalStorage hatası:", error);
            alert("KAYIT HATASI: " + error.name + "\nDetay: " + error.message + "\n\n(Hafıza dolu olmayabilir, gizli sekme veya tarayıcı kısıtlaması olabilir.)");
        }
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
                const MAX_SIZE = 800; // Hafıza için oldukça iyi, belki 600 yapılabilir
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
        showUploadStatus(`${i + 1}/${totalFiles} yükleniyor... (${formattedDate})`);

        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        let contentBase64;
        let fileType = 'image';

        if (isVideo) {
            // Video ise küçültme yapmadan direkt oku (Boyut kontrolü eklenebilir)
            if (file.size > 15 * 1024 * 1024) { // 15MB Limit
                alert(`Video çok büyük (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 15MB yükleyebilirsin.`);
                continue;
            }
            contentBase64 = await readFileAsDataURL(file);
            fileType = 'video';
        } else {
            // Fotoğraf ise küçült
            contentBase64 = await resizeImage(file);
            fileType = 'image';
        }

        const mediaItem = {
            url: contentBase64,
            date: uploadDate,
            timestamp: new Date().toISOString(),
            type: fileType
        };

        if (isFirebaseActive) {
            await db.collection("photos").add(mediaItem);
        } else {
            try {
                const photos = JSON.parse(localStorage.getItem('photos') || '[]');
                // ID ekleyelim
                mediaItem.id = Date.now() + Math.random().toString(36);
                photos.push(mediaItem);
                localStorage.setItem('photos', JSON.stringify(photos));
            } catch (error) {
                hideUploadStatus();
                console.error("LocalStorage hatası:", error);
                alert("KAYIT HATASI: " + error.name + "\nDetay: " + error.message);
                return;
            }
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

function createPhotoElement(url, id, type) {
    const item = document.createElement('div');
    item.className = 'photo-item fade-in';

    // Türü belirle (Eski verilerde type olmayabilir, URL'den tahmin et veya image varsay)
    const isVideo = type === 'video' || (url && url.startsWith('data:video'));

    if (isVideo) {
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.borderRadius = '15px'; // CSS uyumu
        item.appendChild(video);

        // Videoya tıklanınca lightbox açılmasın, kendi oynatıcısını kullansın
        // Ama silme butonu eklememiz lazım, bu tasarımda zor olabilir.
        // Şimdilik lightbox'a yönlendirelim, orada silsin.
        item.addEventListener('click', (e) => {
            // Video kontrollerine basınca açılmaması için
            if (e.target.tagName !== 'VIDEO') {
                openLightbox(url, id, 'video');
            }
        });
    } else {
        item.style.backgroundImage = `url(${url})`;
        item.addEventListener('click', () => { openLightbox(url, id, 'image'); });
    }

    photoGrid.appendChild(item);
}

let currentPhotoId = null;
function openLightbox(url, id, type) {
    lightbox.style.display = "block";

    // Video ise img tagini gizle video koy, resimse tam tersi
    let videoEl = document.getElementById('lightbox-video');
    if (!videoEl) {
        videoEl = document.createElement('video');
        videoEl.id = 'lightbox-video';
        videoEl.controls = true;
        videoEl.style.maxWidth = '90%';
        videoEl.style.maxHeight = '80vh';
        videoEl.style.display = 'none';
        // lightboxImg'in yanına ekle (veya yerine)
        lightbox.insertBefore(videoEl, lightboxImg);
    }

    if (type === 'video' || url.startsWith('data:video')) {
        lightboxImg.style.display = 'none';
        videoEl.style.display = 'block';
        videoEl.src = url;
    } else {
        videoEl.style.display = 'none';
        videoEl.pause(); // Varsa önceki videoyu durdur
        lightboxImg.style.display = 'block';
        lightboxImg.src = url;
    }

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
        try {
            const items = JSON.parse(localStorage.getItem('bucket_list') || '[]');
            items.push({ id: Date.now().toString(), text: text, completed: false });
            localStorage.setItem('bucket_list', JSON.stringify(items));
            renderBucketList();
        } catch (error) {
            console.error("LocalStorage hatası:", error);
            alert("KAYIT HATASI: " + error.name + "\nDetay: " + error.message);
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

// --- VERİ YÖNETİMİ & AYARLAR ---
const settingsPage = document.getElementById('settings-page');
const storageBar = document.getElementById('storage-bar');
const storageText = document.getElementById('storage-text');
const countPhotos = document.getElementById('count-photos');
const countMemories = document.getElementById('count-memories');
const countBucket = document.getElementById('count-bucket');
const clearPhotosBtn = document.getElementById('clear-photos-btn');
const resetAppBtn = document.getElementById('reset-app-btn');

function calculateStorage() {
    let total = 0;
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += ((localStorage[key].length + key.length) * 2);
        }
    }
    // 5MB = 5 * 1024 * 1024 bytes (yaklaşık)
    // Karakter başına 2 byte (UTF-16)
    const max = 5 * 1024 * 1024;
    const percentage = Math.min((total / max) * 100, 100).toFixed(1);
    const usedMB = (total / (1024 * 1024)).toFixed(2);

    storageBar.style.width = `${percentage}%`;
    storageText.textContent = `Kullanılan: ${usedMB} MB / 5.0 MB (%${percentage})`;

    if (percentage > 90) {
        storageBar.classList.add('full');
        storageBar.classList.remove('high');
    } else if (percentage > 70) {
        storageBar.classList.add('high');
        storageBar.classList.remove('full');
    } else {
        storageBar.classList.remove('high', 'full');
    }
}

function updateDataCounts() {
    const photos = JSON.parse(localStorage.getItem('photos') || '[]');
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    const bucket = JSON.parse(localStorage.getItem('bucket_list') || '[]');

    countPhotos.textContent = photos.length;
    countMemories.textContent = memories.length;
    countBucket.textContent = bucket.length;
}

// Ayarlar Sayfası Görüntülendiğinde Çalıştır
const settingsObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.id === 'settings-page' &&
            mutation.target.classList.contains('active-page')) {
            calculateStorage();
            updateDataCounts();
        }
    });
});

if (settingsPage) {
    settingsObserver.observe(settingsPage, { attributes: true, attributeFilter: ['class'] });
}

clearPhotosBtn.addEventListener('click', () => {
    const photoCount = JSON.parse(localStorage.getItem('photos') || '[]').length;
    if (photoCount === 0) {
        alert("Silinecek fotoğraf yok.");
        return;
    }

    if (confirm(`${photoCount} fotoğrafın tamamı silinecek. Anıların ve listen kalacak. Emin misin?`)) {
        localStorage.removeItem('photos');
        alert("Tüm fotoğraflar silindi. Yer açıldı! 🚀");
        calculateStorage();
        updateDataCounts();
        renderPhotos(); // Albümü güncelle (boşalacak)
    }
});

resetAppBtn.addEventListener('click', () => {
    if (confirm("DİKKAT! Tüm anılar, fotoğraflar ve her şey silinecek. Fabrika ayarlarına dönülecek. Emin misin?")) {
        if (confirm("Son kez soruyorum: Her şey silinsin mi?")) {
            localStorage.clear();
            location.reload();
        }
    }
});

// --- DEBUG & LOGGING SYSTEM ---
const consoleDiv = document.getElementById('console-log');
const toggleFirebaseBtn = document.getElementById('toggle-firebase-btn');

// Ekrana Log Basma Fonksiyonu
function logToScreen(msg, type = 'info') {
    if (!consoleDiv) return;
    const p = document.createElement('div');
    p.textContent = `> ${msg}`;
    p.style.color = type === 'error' ? '#ff5555' : '#55ff55';
    p.style.marginBottom = '5px';
    p.style.borderBottom = '1px solid #333';
    consoleDiv.prepend(p); // En yeniyi en üste ekle
}

// Orijinal konsolu koruyarak ekrana da bas
const originalLog = console.log;
const originalError = console.error;

console.log = function (...args) {
    originalLog.apply(console, args);
    logToScreen(args.join(' '));
};

console.error = function (...args) {
    originalError.apply(console, args);
    logToScreen(args.join(' '), 'error');
};

console.log("Debug sistemi aktif edildi.");
console.log("Firebase Veri Tabanı: " + (isFirebaseActive ? "AKTİF ✅" : "PASİF ❌ (Yerel Hafıza)"));

// Firebase Toggle
if (toggleFirebaseBtn) {
    toggleFirebaseBtn.textContent = isFirebaseActive ? "Firebase: AÇIK (Kapatmak için tıkla)" : "Firebase: KAPALI (Yerel Mod)";
    toggleFirebaseBtn.addEventListener('click', () => {
        isFirebaseActive = !isFirebaseActive;
        console.log("Firebase durumu değiştirildi: " + (isFirebaseActive ? "AÇIK" : "KAPALI"));
        toggleFirebaseBtn.textContent = isFirebaseActive ? "Firebase: AÇIK (Kapatmak için tıkla)" : "Firebase: KAPALI (Yerel Mod)";
        alert("Mod değiştirildi: " + (isFirebaseActive ? "Bulut (Firebase)" : "Yerel (Telefon)"));
    });
}

// Butonlara Log Ekleme (Hata İzleme İçin)
if (addNoteBtn) {
    addNoteBtn.addEventListener('click', () => {
        console.log("Anı Kaydet butonuna basıldı.");
    });
}

if (photoUpload) {
    photoUpload.addEventListener('click', () => {
        console.log("Fotoğraf yükleme seçimi açıldı.");
    });
}
