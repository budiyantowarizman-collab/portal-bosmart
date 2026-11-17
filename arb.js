// Ganti dengan URL Web App Google Apps Script milikmu yang berakhiran /exec
const API_URL = "https://script.google.com/macros/s/MASUKKAN_URL_WEB_APP_DISINI/exec";

let allSchools = [];
let filteredSchools = [];
let currentPage = 1;
const itemsPerPage = 3;

// Saat halaman arb.html dibuka, ambil data khusus ARB
window.addEventListener("DOMContentLoaded", () => {
    fetchDataARB();

    // PENGAMAN: Paksa tutup preloader setelah 4 detik jika koneksi lambat/error
    setTimeout(() => {
        const loader = document.getElementById("pageLoader");
        if (loader && loader.style.display !== "none") {
            loader.classList.add("fade-out");
            setTimeout(() => loader.style.display = "none", 500);
        }
    }, 4000);
});

function fetchDataARB() {
    const listContainer = document.getElementById("schoolList");
    if (listContainer) {
        listContainer.innerHTML = `<div class="text-center py-10 text-slate-400 text-xs animate-pulse">Memuat data sekolah ARB...</div>`;
    }

    // PENTING: Menambahkan parameter ?action=getARB di sini
    fetch(`${API_URL}?action=getARB`)
        .then(response => response.json())
        .then(data => {
            allSchools = data;
            filteredSchools = data;
            currentPage = 1;
            renderPagination();

            // Sembunyikan preloader jika data berhasil dimuat
            const loader = document.getElementById("pageLoader");
            if (loader) {
                loader.classList.add("fade-out");
                setTimeout(() => loader.style.display = "none", 500);
            }
        })
        .catch(err => {
            console.error("Gagal memuat data ARB:", err);
            if (listContainer) {
                listContainer.innerHTML = `<div class="text-center py-10 text-rose-400 text-xs font-semibold">Gagal memuat data sekolah ARB. Pastikan API_URL sudah benar.</div>`;
            }
            // Tetap sembunyikan preloader agar halaman tidak macet berputar
            const loader = document.getElementById("pageLoader");
            if (loader) {
                loader.classList.add("fade-out");
                setTimeout(() => loader.style.display = "none", 500);
            }
        });
}

function renderPagination() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredSchools.slice(startIndex, endIndex);

    const schoolList = document.getElementById("schoolList");
    if (!schoolList) return;
    
    schoolList.innerHTML = "";

    if (paginatedItems.length === 0) {
        schoolList.innerHTML = `<div class="text-center py-10 text-slate-400 text-xs">Sekolah tidak ditemukan.</div>`;
        return;
    }

    paginatedItems.forEach(school => {
        const item = document.createElement("div");
        item.className = "flex items-center justify-between p-3.5 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-2xl transition-all shadow-sm";
        item.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                    ${school.type || 'AR'}
                </div>
                <div>
                    <h4 class="text-xs font-extrabold text-white uppercase tracking-wide">${school.name}</h4>
                    <p class="text-[11px] text-slate-400 capitalize">${school.region}</p>
                </div>
            </div>
            <a href="${school.url}" target="_blank" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95">
                Login ARB
            </a>
        `;
        schoolList.appendChild(item);
    });

    // Update info halaman
    const totalPages = Math.ceil(filteredSchools.length / itemsPerPage) || 1;
    
    const pageInfo = document.getElementById("pageInfo");
    if (pageInfo) pageInfo.innerText = `Halaman ${currentPage} dari ${totalPages}`;

    const totalBadge = document.getElementById("totalBadge");
    if (totalBadge) totalBadge.innerText = `${filteredSchools.length} Sekolah`;

    const totalSchoolStat = document.getElementById("totalSchoolStat");
    if (totalSchoolStat) totalSchoolStat.innerText = allSchools.length + "+";

    const prevBtn = document.getElementById("prevBtn");
    if (prevBtn) prevBtn.disabled = currentPage === 1;

    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    renderPagination();
}

function filterSchools() {
    const searchInput = document.getElementById("searchSchool");
    if (!searchInput) return;
    
    const keyword = searchInput.value.toLowerCase();
    filteredSchools = allSchools.filter(school => 
        school.name.toLowerCase().includes(keyword) || school.region.toLowerCase().includes(keyword)
    );
    currentPage = 1;
    renderPagination();
}