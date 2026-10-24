// ==========================================
// KONFIGURASI API URL GOOGLE APPS SCRIPT
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbyPlQMFL_cb08aDkrDW26_Qddfbvoq_-38Zus5Nxj7HHWYcyxNSUjVKHz8pHzOc0Ki6jQ/exec";

let allSchools = [];
let filteredSchools = [];
let currentPage = 1;
const itemsPerPage = 3; 
let currentTypeFilter = 'ALL';

let chatUserData = {
    department: "-",
    name: "-",
    email: "-",
    phone: "-"
};

function showToast(message) {
    const toast = document.getElementById('toastNotification');
    const toastText = document.getElementById('toastText');
    toastText.innerText = message;
    
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3500);
}

function openSubscribeModal() {
    const modal = document.getElementById('subscribeModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeSubscribeModal() {
    const modal = document.getElementById('subscribeModal');
    const content = document.getElementById('modalContent');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 200);
}

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    const isHidden = chatWindow.classList.contains('hidden');

    if (isHidden) {
        chatWindow.classList.remove('hidden');
        setTimeout(() => {
            chatWindow.classList.remove('scale-95', 'opacity-0');
            chatWindow.classList.add('scale-100', 'opacity-100');
        }, 10);
        
        loadChatHistory();
    } else {
        chatWindow.classList.remove('scale-100', 'opacity-100');
        chatWindow.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            chatWindow.classList.add('hidden');
        }, 200);
    }
}

function loadChatHistory() {
    fetch(`${API_URL}?action=getChatHistory`)
        .then(response => response.json())
        .then(history => {
            if (!history || history.length === 0) return;
            console.log("Riwayat chat:", history);
        })
        .catch(err => console.error("Gagal mengambil riwayat chat: ", err));
}

function startLiveChat(e) {
    e.preventDefault();
    
    chatUserData.department = document.getElementById('chatDept').value;
    chatUserData.name = document.getElementById('chatName').value;
    chatUserData.email = document.getElementById('chatEmail').value;
    chatUserData.phone = document.getElementById('chatPhone').value;

    document.getElementById('chatHeaderTitle').innerText = `Live Chat (${chatUserData.department})`;
    document.getElementById('chatHeaderDesc').innerText = `Terhubung dengan tim support. Halo, ${chatUserData.name}!`;

    const container = document.getElementById('chatBodyContainer');
    container.innerHTML = `
        <div class="h-64 p-4 bg-slate-50 overflow-y-auto text-xs text-slate-600 space-y-3" id="activeChatMessages">
            <div class="bg-white p-2.5 rounded-xl rounded-bl-none border border-slate-100 max-w-[80%] shadow-sm text-xs text-slate-700">
                Halo ${chatUserData.name}, terima kasih telah menghubungi departemen <b>${chatUserData.department}</b>. Ada yang bisa kami bantu?
            </div>
        </div>
        <div class="p-3 border-t bg-white flex gap-2">
            <input type="text" id="activeChatInput" placeholder="Tulis pesan..." class="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
            <button onclick="sendActiveMessage()" class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
        </div>
    `;

    const activeInput = document.getElementById('activeChatInput');
    if (activeInput) {
        activeInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                sendActiveMessage();
            }
        });
    }
}

function sendActiveMessage() {
    const input = document.getElementById('activeChatInput');
    const msgBox = document.getElementById('activeChatMessages');

    if (!input || !msgBox) return;

    const message = input.value.trim();
    if (message === "") return;

    const userMsgHTML = `<div class="bg-blue-600 text-white p-2.5 rounded-xl rounded-br-none ml-auto max-w-[80%] shadow-sm text-xs mb-2">${message}</div>`;
    msgBox.innerHTML += userMsgHTML;
    input.value = "";
    msgBox.scrollTop = msgBox.scrollHeight;

    const payloadData = {
        action: "saveChatMessage",
        department: chatUserData.department,
        name: chatUserData.name,
        email: chatUserData.email,
        phone: chatUserData.phone,
        message: message
    };

    fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData)
    }).catch(err => console.error("Gagal mengirim pesan chat:", err));
}

function handleSubscribe(e) {
    e.preventDefault();
    const schoolName = document.getElementById('subName').value;
    const email = document.getElementById('subEmail').value;
    const phone = document.getElementById('subPhone').value;

    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    btnText.innerText = "Mengirim Data...";
    btnLoader.classList.remove('hidden');

    const resetLoadingState = () => {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        btnText.innerText = "Kirim Permintaan Berlangganan";
        btnLoader.classList.add('hidden');
    };

    const payload = {
        action: "saveSubscription",
        schoolName: schoolName,
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
        resetLoadingState();
        closeSubscribeModal();
        showToast('Permintaan berlangganan berhasil dikirim!');
        e.target.reset();
    })
    .catch(() => {
        resetLoadingState();
        showToast('Gagal mengirim permintaan. Silakan coba lagi.');
    });
}

function showLoadingSkeleton() {
    const schoolList = document.getElementById('schoolList');
    let skeletonHTML = '';
    for (let i = 0; i < itemsPerPage; i++) {
        skeletonHTML += `
            <div class="bg-white/60 p-4 rounded-2xl border border-slate-100 flex items-center justify-between animate-pulse">
                <div class="flex items-center space-x-3 w-3/4">
                    <div class="w-10 h-10 bg-slate-200 rounded-xl"></div>
                    <div class="space-y-2 w-full">
                        <div class="h-4 bg-slate-200 rounded-md w-3/4"></div>
                        <div class="h-3 bg-slate-100 rounded-md w-1/2"></div>
                    </div>
                </div>
                <div class="w-20 h-8 bg-slate-200 rounded-xl"></div>
            </div>
        `;
    }
    schoolList.innerHTML = skeletonHTML;
    document.getElementById('pageInfo').innerText = "Menyiapkan data...";
    document.getElementById('totalBadge').innerText = "...";
}

window.onload = function() {
    showLoadingSkeleton();
    
    // Ambil data sekolah dari API Apps Script
    fetch(`${API_URL}?action=getSchools`)
        .then(response => response.json())
        .then(data => {
            allSchools = data;
            filteredSchools = data;
            renderPagination();

            const statElement = document.getElementById('totalSchoolStat');
            if (statElement) {
                statElement.innerText = allSchools.length + "+";
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('schoolList').innerHTML = `<div class="text-center py-10 text-rose-500 text-xs font-semibold">Gagal memuat data dari server.</div>`;
        });

    // Muat daftar ulasan pelanggan saat halaman dibuka
    loadReviews();
};

function filterByType(type) {
    currentTypeFilter = type;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.className = "filter-btn px-4 py-2 rounded-lg font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm";
    });
    const targetBtn = document.getElementById(`btn-${type}`);
    if (targetBtn) {
        targetBtn.className = "filter-btn px-4 py-2 rounded-lg font-bold bg-slate-800 text-white shadow-sm transition-all";
    }

    applyFilters();
}

function filterSchools() {
    applyFilters();
}

function applyFilters() {
    let input = document.getElementById('searchSchool').value.toLowerCase();
    
    filteredSchools = allSchools.filter(school => {
        let matchesType = (currentTypeFilter === 'ALL' || school.type === currentTypeFilter);
        let matchesSearch = school.name.toLowerCase().includes(input) || school.region.toLowerCase().includes(input);
        return matchesType && matchesSearch;
    });

    currentPage = 1;
    renderPagination();
}

function renderPagination() {
    const schoolList = document.getElementById('schoolList');
    schoolList.innerHTML = '';

    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let paginatedItems = filteredSchools.slice(startIndex, endIndex);

    let totalPages = Math.ceil(filteredSchools.length / itemsPerPage) || 1;
    document.getElementById('totalBadge').innerText = `${filteredSchools.length} Sekolah`;

    if (filteredSchools.length === 0) {
        schoolList.innerHTML = `
            <div class="text-center py-10 text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Sekolah tidak ditemukan</span>
            </div>`;
        document.getElementById('pageInfo').innerText = `Halaman 0 dari 0`;
        document.getElementById('prevBtn').disabled = true;
        document.getElementById('nextBtn').disabled = true;
        return;
    }

    paginatedItems.forEach(school => {
        let itemHTML = `
            <div class="bg-slate-800/40 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between shadow-sm hover:border-blue-500 hover:bg-slate-800/70 transition-all">
                <div class="flex items-center space-x-4">
                    <div class="bg-blue-600 text-white font-extrabold text-[11px] px-3 py-2.5 rounded-xl shadow-sm flex items-center justify-center min-w-[42px]">
                        ${school.type}
                    </div>
                    <div>
                        <h3 class="text-sm font-extrabold text-white school-name leading-tight">${school.name}</h3>
                        <p class="text-[11px] text-slate-400 font-medium mt-0.5">${school.region}</p>
                    </div>
                </div>
                <button onclick="accessPortal('${school.url}')" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95">
                    Login
                </button>
            </div>
        `;
        schoolList.innerHTML += itemHTML;
    });

    document.getElementById('pageInfo').innerText = `Halaman ${currentPage} dari ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function changePage(direction) {
    let totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
    currentPage += direction;
    
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    renderPagination();
}

function accessPortal(targetUrl) {
    window.open(targetUrl, '_blank');
}

function revealOnScroll() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100;
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

window.addEventListener("scroll", revealOnScroll);

// ==========================================
// FITUR ULASAN & RATING PELANGGAN (REVIEWS)
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
    const ratingText = document.getElementById('ratingText');
    if (ratingText) {
        ratingText.innerText = `${rating} dari 5 Bintang`;
    }
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

    if (btn) {
        btn.innerText = "Mengirim...";
        btn.disabled = true;
    }

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
        const ratingText = document.getElementById('ratingText');
        if (ratingText) ratingText.innerText = "Pilih Bintang";
        
        setTimeout(loadReviews, 1000);
    })
    .catch((error) => {
        console.error("Error:", error);
        showToast("Gagal mengirim ulasan. Coba lagi.");
    })
    .finally(() => {
        if (btn) {
            btn.innerText = "Kirim Ulasan";
            btn.disabled = false;
        }
    });
}

function loadReviews() {
    fetch(`${API_URL}?action=getReviews`)
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