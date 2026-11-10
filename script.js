
const API = "https://jsonplaceholder.typicode.com";

const btnTema = document.getElementById("btn-tema");
const formPengalaman = document.getElementById("form-pengalaman");
const daftarPengalaman = document.getElementById("daftar-pengalaman");
const pesanPengalaman = document.getElementById("pesan-pengalaman");

const loading = document.getElementById("loading");
const containerArtikel = document.getElementById("container-artikel");
const namaPenulis = document.getElementById("nama-penulis");
const emailPenulis = document.getElementById("email-penulis");

const btnKontak = document.getElementById("btn-kontak");
const infoKontak = document.getElementById("info-kontak");

const formKomentar = document.getElementById("form-komentar");
const inputNamaKomentar = document.getElementById("nama-komentar");
const inputIsiKomentar = document.getElementById("isi-komentar");
const daftarKomentar = document.getElementById("daftar-komentar");
const pesanKomentar = document.getElementById("pesan-komentar");
const loadingKomentar = document.getElementById("loading-komentar");

const btnReset = document.getElementById("btn-reset");
const btnKirimKomentar = document.getElementById("btn-kirim-komentar");

let sedangEdit = false;
let idKomentarDiedit = null;

let jumlahLike =
    JSON.parse(localStorage.getItem("semua_like_valentino")) || {};

let komentarTersimpan =
    JSON.parse(localStorage.getItem("komentar_valentino"));

if (!Array.isArray(komentarTersimpan)) {
    komentarTersimpan = [];
}

function simpanKomentar() {
    localStorage.setItem(
        "komentar_valentino",
        JSON.stringify(komentarTersimpan)
    );
}

function simpanLike() {
    localStorage.setItem(
        "semua_like_valentino",
        JSON.stringify(jumlahLike)
    );
}

function pesanDariStatus(status) {
    if (status === 404) {
        return "Data tidak ditemukan di server.";
    }

    if (status === 400) {
        return "Data yang dikirim tidak valid.";
    }

    if (status >= 500) {
        return "Server sedang bermasalah, coba lagi nanti.";
    }

    if (!status) {
        return "Tidak dapat terhubung ke server.";
    }

    return "Terjadi kesalahan. Status: " + status;
}

async function ambilRespons(url, pilihan = {}) {
    let response;

    try {
        response = await fetch(url, pilihan);
    } catch (error) {
        error.status = 0;
        throw error;
    }

    if (!response.ok) {
        const error = new Error(
            pesanDariStatus(response.status)
        );

        error.status = response.status;
        throw error;
    }

    if (response.status === 204) {
        return null;
    }

    return await response.json();
}

if (btnTema) {
    const tema = localStorage.getItem("tema_valentino");

    if (tema === "dark") {
        document.body.classList.add("dark");
        btnTema.textContent = "Mode Terang";
    }

    btnTema.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        const gelap = document.body.classList.contains("dark");

        btnTema.textContent = gelap
            ? "Mode Terang"
            : "Mode Gelap";

        localStorage.setItem(
            "tema_valentino",
            gelap ? "dark" : "light"
        );
    });
}

function tampilkanPengalaman() {
    if (!daftarPengalaman) return;

    const pengalaman =
        JSON.parse(localStorage.getItem("pengalaman")) || [];

    daftarPengalaman.innerHTML = "";

    pengalaman.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "item-pengalaman";

        const judul = document.createElement("h3");
        judul.textContent = item.judul;

        const periode = document.createElement("p");
        periode.textContent = item.periode;

        const deskripsi = document.createElement("p");
        deskripsi.textContent = item.deskripsi;

        const tombolHapus = document.createElement("button");
        tombolHapus.type = "button";
        tombolHapus.textContent = "Hapus";

        tombolHapus.addEventListener("click", () => {
            const data =
                JSON.parse(localStorage.getItem("pengalaman")) || [];

            data.splice(index, 1);

            localStorage.setItem(
                "pengalaman",
                JSON.stringify(data)
            );

            tampilkanPengalaman();
        });

        card.append(judul, periode, deskripsi, tombolHapus);
        daftarPengalaman.appendChild(card);
    });
}

if (formPengalaman) {
    formPengalaman.addEventListener("submit", (e) => {
        e.preventDefault();

        const judul = document.getElementById("judul-pengalaman").value.trim();
        const periode = document.getElementById("periode").value.trim();
        const deskripsi = document.getElementById("deskripsi").value.trim();

        if (!judul || !periode || !deskripsi) {
            pesanPengalaman.textContent =
                "Semua kolom harus diisi.";
            return;
        }

        const pengalaman =
            JSON.parse(localStorage.getItem("pengalaman")) || [];

        pengalaman.push({ judul, periode, deskripsi });

        localStorage.setItem(
            "pengalaman",
            JSON.stringify(pengalaman)
        );

        formPengalaman.reset();

        pesanPengalaman.textContent =
            "Pengalaman berhasil ditambahkan.";

        tampilkanPengalaman();
    });
}

tampilkanPengalaman();

async function ambilArtikel() {
    if (!loading || !containerArtikel) return;

    loading.hidden = false;
    containerArtikel.innerHTML = "";

    try {
        const artikel = await ambilRespons(
            `${API}/posts?_limit=5`
        );

        artikel.forEach((item) => {
            const card = document.createElement("article");
            card.className = "artikel-item";

            const judul = document.createElement("h3");
            judul.textContent = item.title;

            const isi = document.createElement("p");
            isi.textContent = item.body;

            const tombolLike = document.createElement("button");
            tombolLike.type = "button";
            tombolLike.className = "btn-like";

            jumlahLike[item.id] =
                Number(jumlahLike[item.id] || 0);

            tombolLike.textContent =
                `Like (${jumlahLike[item.id]})`;

            tombolLike.addEventListener("click", async () => {
                const sebelumnya = jumlahLike[item.id];

                jumlahLike[item.id]++;
                simpanLike();

                tombolLike.disabled = true;
                tombolLike.textContent = "Mengirim...";

                try {
                    await perbaruiLikeKeServer(
                        item.id,
                        jumlahLike[item.id]
                    );

                    tombolLike.textContent =
                        `Like (${jumlahLike[item.id]})`;

                } catch (error) {
                    jumlahLike[item.id] = sebelumnya;
                    simpanLike();

                    tombolLike.textContent =
                        `Like (${jumlahLike[item.id]})`;

                    alert(pesanDariStatus(error.status));
                    console.error(error);

                } finally {
                    tombolLike.disabled = false;
                }
            });

            card.append(judul, isi, tombolLike);
            containerArtikel.appendChild(card);
        });

        simpanLike();

        const penulis = await ambilRespons(
            `${API}/users/1`
        );

        namaPenulis.textContent = "Nama: " + penulis.name;
        emailPenulis.textContent = "Email: " + penulis.email;

    } catch (error) {
        containerArtikel.textContent =
            pesanDariStatus(error.status);

        namaPenulis.textContent =
            "Nama penulis tidak dapat dimuat.";

        emailPenulis.textContent =
            "Email tidak dapat dimuat.";

        console.error(error);

    } finally {
        loading.hidden = true;
    }
}

ambilArtikel();

async function perbaruiLikeKeServer(postId, jumlah) {
    return await ambilRespons(
        `${API}/posts/${postId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                likes: jumlah
            })
        }
    );
}

if (btnKontak) {
    btnKontak.addEventListener("click", () => {
        infoKontak.hidden = !infoKontak.hidden;

        btnKontak.textContent = infoKontak.hidden
            ? "Tampilkan Kontak"
            : "Sembunyikan Kontak";
    });
}

async function ambilKomentar() {
    if (!loadingKomentar || !daftarKomentar) return;

    loadingKomentar.hidden = false;
    daftarKomentar.innerHTML = "";

    try {
        if (komentarTersimpan.length === 0) {
            const komentar = await ambilRespons(
                `${API}/comments?_limit=5`
            );

            komentarTersimpan = komentar;
            simpanKomentar();
        }

        komentarTersimpan.forEach((item) => {
            tampilkanSatuKomentar(item);
        });

    } catch (error) {
        daftarKomentar.textContent =
            pesanDariStatus(error.status);

        console.error(error);

    } finally {
        loadingKomentar.hidden = true;
    }
}

function tampilkanSatuKomentar(komentar) {
    const itemKomentar = document.createElement("div");

    itemKomentar.className = "item-komentar";
    itemKomentar.dataset.id = komentar.id;
    itemKomentar.dataset.nama = komentar.name || "";
    itemKomentar.dataset.pesan = komentar.body || "";

    const teksKomentar = document.createElement("p");
    teksKomentar.className = "comment-body";

    teksKomentar.textContent =
        `${komentar.name}: ${komentar.body}`;

    const infoId = document.createElement("small");
    infoId.className = "comment-id";
    infoId.textContent = `ID server: ${komentar.id}`;

    const tombolEdit = document.createElement("button");
    tombolEdit.type = "button";
    tombolEdit.textContent = "Edit";
    tombolEdit.className = "btn-edit";

    const tombolHapus = document.createElement("button");
    tombolHapus.type = "button";
    tombolHapus.textContent = "Hapus";
    tombolHapus.className = "btn-hapus";

    itemKomentar.append(
        teksKomentar,
        infoId,
        tombolEdit,
        tombolHapus
    );

    daftarKomentar.appendChild(itemKomentar);
}

async function kirimKomentarKeServer(nama, pesan) {
    return await ambilRespons(
        `${API}/comments`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nama,
                body: pesan,
                postId: 1
            })
        }
    );
}

async function editKomentarKeServer(id, nama, pesan) {
    return await ambilRespons(
        `${API}/comments/${id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nama,
                body: pesan
            })
        }
    );
}

if (formKomentar) {
    formKomentar.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nama = inputNamaKomentar.value.trim();
        const pesan = inputIsiKomentar.value.trim();

        if (!nama || !pesan) {
            pesanKomentar.textContent =
                "Nama dan komentar harus diisi.";
            return;
        }

        btnKirimKomentar.disabled = true;
        btnReset.disabled = true;

        const sedangMengedit = sedangEdit;

        btnKirimKomentar.textContent = sedangMengedit
            ? "Memperbarui..."
            : "Mengirim...";

        try {
            if (sedangMengedit) {
                const hasil = await editKomentarKeServer(
                    idKomentarDiedit,
                    nama,
                    pesan
                );

                komentarTersimpan = komentarTersimpan.map(
                    (item) =>
                        String(item.id) === String(idKomentarDiedit)
                            ? hasil
                            : item
                );

                simpanKomentar();

                daftarKomentar.innerHTML = "";

                komentarTersimpan.forEach((item) => {
                    tampilkanSatuKomentar(item);
                });

                pesanKomentar.textContent =
                    "Komentar berhasil diperbarui.";

            } else {
                const hasil = await kirimKomentarKeServer(
                    nama,
                    pesan
                );

                komentarTersimpan.push(hasil);
                simpanKomentar();

                tampilkanSatuKomentar(hasil);

                pesanKomentar.textContent =
                    `Komentar berhasil dikirim. ID server: ${hasil.id}`;
            }

            formKomentar.reset();
            batalEdit(false);

        } catch (error) {
            pesanKomentar.textContent =
                pesanDariStatus(error.status);

            console.error(error);

        } finally {
            btnKirimKomentar.disabled = false;
            btnReset.disabled = false;

            btnKirimKomentar.textContent = sedangEdit
                ? "Simpan Perubahan"
                : "Kirim Komentar";
        }
    });
}

if (daftarKomentar) {
    daftarKomentar.addEventListener("click", async (e) => {
        const tombol = e.target.closest("button");

        if (!tombol) return;

        const item = tombol.closest(".item-komentar");

        if (!item) return;

        const id = item.dataset.id;

        if (tombol.classList.contains("btn-edit")) {
            if (sedangEdit) {
                pesanKomentar.textContent =
                    "Selesaikan edit sebelumnya terlebih dahulu.";
                return;
            }

            inputNamaKomentar.value = item.dataset.nama;
            inputIsiKomentar.value = item.dataset.pesan;

            sedangEdit = true;
            idKomentarDiedit = id;

            btnKirimKomentar.textContent =
                "Simpan Perubahan";

            btnReset.hidden = false;

            pesanKomentar.textContent =
                "Silakan ubah komentar pada formulir.";

            inputNamaKomentar.focus();

            formKomentar.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            return;
        }

        if (tombol.classList.contains("btn-hapus")) {
            tombol.disabled = true;
            tombol.textContent = "Menghapus...";

            try {
                await ambilRespons(
                    `${API}/comments/${id}`,
                    {
                        method: "DELETE"
                    }
                );

                komentarTersimpan = komentarTersimpan.filter(
                    (komentar) =>
                        String(komentar.id) !== String(id)
                );

                simpanKomentar();
                item.remove();

                if (
                    sedangEdit &&
                    String(idKomentarDiedit) === String(id)
                ) {
                    formKomentar.reset();
                    batalEdit(false);
                }

                pesanKomentar.textContent =
                    "Komentar berhasil dihapus.";

            } catch (error) {
                tombol.disabled = false;
                tombol.textContent = "Hapus";

                pesanKomentar.textContent =
                    pesanDariStatus(error.status);

                console.error(error);
            }
        }
    });
}

function batalEdit(tampilkanPesan = true) {
    sedangEdit = false;
    idKomentarDiedit = null;

    btnReset.hidden = true;

    btnKirimKomentar.textContent =
        "Kirim Komentar";

    if (tampilkanPesan) {
        pesanKomentar.textContent =
            "Edit komentar dibatalkan.";
    }
}

if (btnReset) {
    btnReset.addEventListener("click", () => {
        formKomentar.reset();
        batalEdit(true);
    });
}

ambilKomentar();

const tahun = document.getElementById("tahun");

if (tahun) {
    tahun.textContent = new Date().getFullYear();
}
