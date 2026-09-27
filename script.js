// ==========================================
// KONFIGURASI API URL GOOGLE APPS SCRIPT
// ==========================================
// Pastikan URL ini adalah URL Web App Google Apps Script kamu yang terbaru
const API_URL = "https://script.google.com/macros/s/AKfycbxKqZbu-afN8_SIo1Pxfj6lrzG66xY_sSLA8sVtrKoNre-FXIaL51JPqOVfrrY6dey9Ug/exec";

let allSchools = [];
let currentPage = 1;
const itemsPerPage = 4; // Jumlah sekolah per halaman

// Load data sekolah saat halaman dibuka
document.addEventListener("DOMContentLoaded", () => {
    fetchSchools();
    loadReviews(); // Memuat daftar ulasan dari Google Sheets
});

function fetchSchools() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            allSchools = data;
            renderSchools(allSchools);
            updateStats(allSchools.length);
        })
        .catch(error => {
            console.error("Gagal memuat data sekolah:", error);
            document.getElementById("schoolList").innerHTML = `
                <div class="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center text-red-400 text-xs">
                    Gagal memuat data sekolah. Periksa koneksi atau URL API.
                </div>
            `;
            document.getElementById("totalBadge").innerText = "0 Sekolah";
            document.getElementById("pageInfo").innerText = "0 / 0";
        });
}

function renderSchools(schools) {
    const listContainer = document.getElementById("schoolList");
    const totalBadge = document.getElementById("totalBadge");
    
    totalBadge.innerText = `${schools.length} Sekolah`;

    if (schools.length === 0) {
        listContainer.innerHTML = `
            <div class="bg-slate-800/40 border border-white/10 p-5 rounded-xl text-center text-slate-400 text-xs">
                Sekolah tidak ditemukan.
            </div>
        `;
        document.getElementById("pageInfo").innerText = "0 / 0";
        document.getElementById("prevBtn").disabled = true;
        document.getElementById("nextBtn").disabled = true;
        return;
    }

    // Pagination logic
    const totalPages = Math.ceil(schools.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = schools.slice(start, end);

    listContainer.innerHTML = "";
    paginatedItems.forEach(school => {
        const card = document.createElement("a");
        card.href = school.url;
        card.target = "_blank";
        card.className = "school-card bg-slate-800/40 hover:bg-slate-800/70 border border-white/10 p-4 rounded-xl flex items-center justify-between group transition-all shadow-sm block";
        card.innerHTML = `
            <div class="space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">${school.type || 'SD'}</span>
                <h4 class="font-extrabold text-white text-xs group-hover:text-blue-400 transition-colors">${school.name}</h4>
                <p class="text-[11px] text-slate-400">${school.region}</p>
            </div>
            <div class="bg-slate-700/50 group-hover:bg-blue-600 text-slate-300 group-hover:text-white p-2.5 rounded-xl transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
            </div>
        `;
        listContainer.appendChild(card);
    });

    // Update Pagination Info
    document.getElementById("pageInfo").innerText = `${currentPage} / ${totalPages}`;
    document.getElementById("prevBtn").disabled = currentPage === 1;
    document.getElementById("nextBtn").disabled = currentPage === totalPages || totalPages === 0;
}

function filterSchools() {
    const keyword = document.getElementById("searchSchool").value.toLowerCase();
    const filtered = allSchools.filter(school => 
        school.name.toLowerCase().includes(keyword) || school.region.toLowerCase().includes(keyword)
    );
    currentPage = 1; // Reset ke halaman pertama saat mencari
    renderSchools(filtered);
}

function changePage(direction) {
    currentPage += direction;
    const keyword = document.getElementById("searchSchool").value.toLowerCase();
    const filtered = allSchools.filter(school => 
        school.name.toLowerCase().includes(keyword) || school.region.toLowerCase().includes(keyword)
    );
    renderSchools(filtered);
}

function updateStats(total) {
    const statElement = document.getElementById("totalSchoolStat");
    if (statElement) {
        statElement.innerText = total + "+";
    }
}

// ==========================================
// MODAL BERLANGGANAN
// ==========================================
function openSubscribeModal() {
    const modal = document.getElementById("subscribeModal");
    const content = document.getElementById("modalContent");
    modal.classList.remove("hidden");
    setTimeout(() => {
        content.classList.remove("scale-95", "opacity-0");
        content.classList.add("scale-100", "opacity-100");
    }, 10);
}

function closeSubscribeModal() {
    const modal = document.getElementById("subscribeModal");
    const content = document.getElementById("modalContent");
    content.classList.remove("scale-100", "opacity-100");
    content.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300);
}

function handleSubscribe(event) {
    event.preventDefault();
    const name = document.getElementById("subName").value;
    const email = document.getElementById("subEmail").value;
    const phone = document.getElementById("subPhone").value;
    
    const btnText = document.getElementById("btnText");
    const btnLoader = document.getElementById("btnLoader");
    const submitBtn = document.getElementById("submitBtn");

    btnText.innerText = "Mengirim...";
    btnLoader.classList.remove("hidden");
    submitBtn.disabled = true;

    const payload = {
        action: "saveSubscription",
        schoolName: name,
        email: email,
        phone: phone
    };

    fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(() => {
        showToast("Permintaan berlangganan berhasil dikirim!");
        closeSubscribeModal();
        document.getElementById("subName").value = "";
        document.getElementById("subEmail").value = "";
        document.getElementById("subPhone").value = "";
    })
    .catch(error => {
        console.error("Error:", error);
        showToast("Gagal mengirim permintaan. Coba lagi.");
    })
    .finally(() => {
        btnText.innerText = "Kirim Permintaan Berlangganan";
        btnLoader.classList.add("hidden");
        submitBtn.disabled = false;
    });
}

// ==========================================
// CHAT WIDGET
// ==========================================
function toggleChat() {
    const windowEl = document.getElementById("chatWindow");
    if (windowEl.classList.contains("hidden")) {
        windowEl.classList.remove("hidden");
        setTimeout(() => {
            windowEl.classList.remove("scale-95", "opacity-0");
            windowEl.classList.add("scale-100", "opacity-100");
        }, 10);
    } else {
        windowEl.classList.remove("scale-100", "opacity-100");
        windowEl.classList.add("scale-95", "opacity-0");
        setTimeout(() => {
            windowEl.classList.add("hidden");
        }, 300);
    }
}

function startLiveChat(event) {
    event.preventDefault();
    const dept = document.getElementById("chatDept").value;
    const name = document.getElementById("chatName").value;
    const email = document.getElementById("chatEmail").value;
    const phone = document.getElementById("chatPhone").value;

    const payload = {
        action: "saveChatMessage",
        department: dept,
        name: name,
        email: email,
        phone: phone,
        message: "Memulai sesi chat bantuan"
    };

    fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(() => {
        showToast("Terhubung ke Support Edosmart!");
        // Arahkan ke WhatsApp Admin otomatis setelah data tersimpan
        const waMessage = encodeURIComponent(`Halo Admin Edosmart, saya ${name} dari departemen ${dept}. Mohon bantuannya.`);
        window.open(`https://wa.me/6283822788935?text=${waMessage}`, '_blank');
        toggleChat();
    })
    .catch(error => {
        console.error("Error:", error);
        showToast("Gagal memulai chat. Silakan coba lagi.");
    });
}

// ==========================================
// TOAST NOTIFICATION
// ==========================================
function showToast(message) {
    const toast = document.getElementById("toastNotification");
    const text = document.getElementById("toastText");
    text.innerText = message;

    toast.classList.remove("translate-y-20", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");

    setTimeout(() => {
        toast.classList.remove("translate-y-0", "opacity-100");
        toast.classList.add("translate-y-20", "opacity-0");
    }, 4000);
}

// ==========================================
// FITUR ULASAN & RATING (REVIEWS)
// ==========================================
let selectedRating = 0;

function setRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('.star-icon');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('text-slate-600');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-slate-600');
        }
    });
    document.getElementById('ratingText').innerText = `${rating} dari 5 Bintang`;
}

function handleReviewSubmit(event) {
    event.preventDefault();
    if (selectedRating === 0) {
        showToast("Silakan pilih rating bintang terlebih dahulu!");
        return;
    }

    const name = document.getElementById('reviewName').value;
    const comment = document.getElementById('reviewComment').value;
    const btn = document.getElementById('reviewBtn');

    btn.innerText = "Mengirim...";
    btn.disabled = true;

    const reviewData = {
        action: "saveReview",
        nama: name,
        rating: selectedRating,
        ulasan: comment
    };

    fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData)
    })
    .then(() => {
        showToast("Terima kasih! Ulasan Anda berhasil dikirim.");
        document.getElementById('reviewName').value = "";
        document.getElementById('reviewComment').value = "";
        setRating(0);
        document.getElementById('ratingText').innerText = "Pilih Bintang";
        
        // Muat ulang daftar ulasan setelah 1 detik
        setTimeout(loadReviews, 1000);
    })
    .catch((error) => {
        console.error("Error:", error);
        showToast("Gagal mengirim ulasan. Coba lagi.");
    })
    .finally(() => {
        btn.innerText = "Kirim Ulasan";
        btn.disabled = false;
    });
}

function loadReviews() {
    fetch(API_URL + "?action=getReviews")
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('reviewsList');
        if (!container) return;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="bg-slate-800/40 border border-white/10 p-4 rounded-xl text-center text-slate-400 text-xs">Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</div>';
            return;
        }

        container.innerHTML = "";
        data.forEach(rev => {
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= rev.rating) {
                    starsHtml += '<svg class="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.399 8.168-7.333-3.854-7.333 3.854 1.399-8.168-5.934-5.787 8.2-1.192z"/></svg>';
                } else {
                    starsHtml += '<svg class="w-3.5 h-3.5 text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.399 8.168-7.333-3.854-7.333 3.854 1.399-8.168-5.934-5.787 8.2-1.192z"/></svg>';
                }
            }

            const card = document.createElement('div');
            card.className = "bg-slate-800/40 border border-white/10 p-4 rounded-xl flex flex-col justify-between space-y-2 shadow-sm";
            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <h5 class="font-bold text-white text-xs">${rev.nama}</h5>
                        <div class="flex items-center space-x-0.5">${starsHtml}</div>
                    </div>
                    <p class="text-slate-300 text-[11px] leading-relaxed">"${rev.ulasan}"</p>
                </div>
                <span class="text-[9px] text-slate-500">${rev.timestamp ? new Date(rev.timestamp).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : ''}</span>
            `;
            container.appendChild(card);
        });
    })
    .catch(err => console.error("Gagal memuat ulasan:", err));
}