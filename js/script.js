const url = 'https://script.google.com/macros/s/AKfycbzBDl5JwfiehI-Mjdu3lN1dsRfV9SX67NXED6NljjP_suYOkZGlldX9mHfYEJoatNy8Yw/exec';

function showContent(sectionId) {
    // Sembunyikan semua section konten
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');

    // Tampilkan section yang dipilih
    document.getElementById(sectionId).style.display = 'block';

    // Ambil semua nav-link dan hapus kelas active serta text-white
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        link.classList.remove('txtOnSidebar');
        link.classList.add('txtOnSidebar');

        // Temukan elemen <span> di dalam link dan ubah kelasnya
        const spanElement = link.querySelector('span');
        if (spanElement) {
            spanElement.classList.remove('txtOnSidebar');
            spanElement.classList.add('txtOnSidebar');
        }
    });

    // Tambahkan kelas active dan text-white pada nav-link yang diklik
    const activeLink = document.querySelector(`a[onclick="showContent('${sectionId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        activeLink.classList.add('text-white'); // Menambahkan text-white
        activeLink.classList.remove('text-primary'); // Menghapus text-primary

        // Temukan elemen <span> di dalam link yang aktif dan ubah kelasnya
        const activeSpan = activeLink.querySelector('span');
        if (activeSpan) {
            activeSpan.classList.add('text-white'); // Menambahkan text-white
            activeSpan.classList.remove('text-primary'); // Menghapus text-primary
        }
    }
}


//hitung data
async function loadDashboardData() {
    try {
        const fetchPromises = [
            fetch(url + '?action=getPegawaiCount'),
            fetch(url + '?action=getAbsensiCount'),
            fetch(url + '?action=getIzinCount'),
            fetch(url + '?action=getLemburCount')
        ];

        // Tunggu hingga semua permintaan selesai
        const responses = await Promise.all(fetchPromises);

        // Ambil dan atur data dari setiap response
        const [pegawaiResponse, absensiResponse, izinResponse, lemburResponse] = await Promise.all(responses.map(res => res.json()));

        document.getElementById('dataPegawai').textContent = pegawaiResponse.count;
        document.getElementById('nowDate').textContent = absensiResponse.count;
        document.getElementById('dataIzinMenunggu').textContent = izinResponse.count;
        document.getElementById('dataLemburMenunggu').textContent = lemburResponse.count;

        // Tampilkan tanggal hari ini
        const today = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        document.getElementById('date').textContent = today.toLocaleDateString('id-ID', options);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}


// Simpan data karyawan
document.getElementById("employeeForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    data.action = 'addKaryawan';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("Data berhasil disimpan!");
            this.reset();
            location.reload();
        } else {
            alert("Gagal menyimpan data.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Terjadi kesalahan.");
    }
});

// Edit data karyawan
function editKaryawan(kode) {
    fetch(url + '?action=getKaryawan&kode=' + kode)
        .then(response => response.json())
        .then(data => {            
            if (Array.isArray(data)) {
                const karyawan = data.find(k => k.kode === kode);
                
                if (karyawan) {
                    document.getElementById('editKode').value = karyawan.kode;
                    document.getElementById('editNama').value = karyawan.nama;
                    document.getElementById('editjenisKelamin').value = karyawan.jenisKelamin || '';
                    document.getElementById('editEmail').value = karyawan.email;
                    document.getElementById('editnoHp').value = karyawan.noHp || '';
                    document.getElementById('editAlamat').value = karyawan.alamat;
                    document.getElementById('editPass').value = karyawan.password || '';
                    document.getElementById('editJabatan').value = karyawan.jabatan;
                    document.getElementById('editDivisi').value = karyawan.divisi;

                    document.getElementById('editKaryawanModal').style.display = 'block';
                } else {
                    alert('Karyawan dengan kode tersebut tidak ditemukan.');
                }
            } else {
                alert('Data tidak dalam format yang diharapkan.');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Tutup modal edit karyawan
function closeEditKaryawanModal() {
    document.getElementById('editKaryawanModal').style.display = 'none';
}

// Ambil data karyawan
function loadDataKaryawan() {
    fetch(url + '?action=getKaryawan')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#dataKaryawan tbody');
            tableBody.innerHTML = '';

            data.forEach((karyawan) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${karyawan.no}</td>
                    <td>${karyawan.kode}</td>
                    <td>${karyawan.nama}</td>
                    <td>${karyawan.email}</td>
                    <td>${karyawan.alamat}</td>
                    <td>${karyawan.jabatan}</td>
                    <td>${karyawan.divisi}</td>
                    <td>
                        <button class="btn btn-sm btnView me-1 mb-1" onclick btnView="viewKaryawan('${karyawan.kode}')"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btnEdit mb-1" onclick="editKaryawan('${karyawan.kode}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btnHapus" onclick="deleteKaryawan('${karyawan.kode}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Hapus data karyawan
function deleteKaryawan(kode) {
    if (confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) {
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({ action: 'deleteKaryawan', kode: kode })
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                alert("Data karyawan berhasil dihapus!");
                loadDataKaryawan();
            } else {
                alert("Gagal menghapus data karyawan.");
            }
        })
        .catch(error => {
            console.error('Error deleting karyawan:', error);
            alert("Terjadi kesalahan saat menghapus karyawan.");
        });
    }
}

// Melihat detail karyawan
function viewKaryawan(kode) {
    alert('Melihat detail karyawan dengan kode: ' + kode);
}

// Submit form edit
document.getElementById('formEditKaryawan').addEventListener('submit', function (event) {
    event.preventDefault();

    const data = {
        action: 'editKaryawan',
        kode: document.getElementById('editKode').value,
        nama: document.getElementById('editNama').value,
        jenisKelamin: document.getElementById('editjenisKelamin').value,
        email: document.getElementById('editEmail').value,
        noHp: document.getElementById('editnoHp').value,
        alamat: document.getElementById('editAlamat').value,
        password: document.getElementById('editPass').value,
        jabatan: document.getElementById('editJabatan').value,
        divisi: document.getElementById('editDivisi').value
    };

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            alert('Data karyawan berhasil diperbarui.');
            closeEditKaryawanModal();
            loadDataKaryawan();
            console.log(data);
        } else {
            alert('Gagal memperbarui data karyawan.');
        }
    })
    .catch(error => console.error('Error updating data:', error));
});

//Data jabatan
function loadDataJabatan() {
    fetch(url + '?action=getJabatan')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#dataJabatan tbody');
            tableBody.innerHTML = '';
            let i = 0;
            data.forEach((karyawan) => {
                const row = document.createElement('tr');
                i++;
                row.innerHTML = `
                    <td>${i}</td>
                    <td>${karyawan.kode}</td>
                    <td>${karyawan.jabatan}</td>
                    <td>
                        <button class="btn btn-sm btnHapus" onclick="deleteJabatan('${karyawan.kode}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}
//Option Jabatan
async function loadJabatanOptions() {
    try {
        const response = await fetch(url + '?action=getJabatan');
        const jabatanData = await response.json();

        const jabatanSelect = document.getElementById("jabatan");
        const editJabatanSelect = document.getElementById("editJabatan");

        // Menghapus opsi lama kecuali opsi default "---"
        jabatanSelect.innerHTML = '<option value="">---</option>';
        editJabatanSelect.innerHTML = '<option value="">---</option>';

        // Tambahkan opsi berdasarkan data dari server
        jabatanData.forEach(jabatan => {
            // Buat elemen option untuk jabatanSelect
            const option1 = document.createElement("option");
            option1.value = jabatan.jabatan; // Nilai opsi
            option1.textContent = jabatan.jabatan; // Teks yang tampil
            jabatanSelect.appendChild(option1);

            // Buat elemen option terpisah untuk editJabatanSelect
            const option2 = document.createElement("option");
            option2.value = jabatan.jabatan; // Nilai opsi
            option2.textContent = jabatan.jabatan; // Teks yang tampil
            editJabatanSelect.appendChild(option2);
        });
    } catch (error) {
        console.error("Error loading jabatan options:", error);
    }
}

// Simpan data jabatan
document.getElementById("jabatanForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // Tambahkan action untuk menentukan jenis data yang dikirim
    data.action = 'addJabatan';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("Data jabatan berhasil disimpan!");
            this.reset();
            location.reload();
        } else {
            alert("Gagal menyimpan data jabatan.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Terjadi kesalahan saat menyimpan data.");
    }
});

//Delete jabatan
function deleteJabatan(kode) {
    if (confirm("Apakah Anda yakin ingin menghapus jabatan ini?")) {
        fetch(url + '?action=deleteJabatan&kode=' + kode, {
            method: 'post',
            body: JSON.stringify({
                action: 'deleteJabatan',
                kode: kode
            })
        })
            .then(response => response.json())
            .then(result => {
                if (result.status === 'success') {
                    alert("Jabatan berhasil dihapus!");
                    loadDataJabatan();
                } else {
                    alert("Gagal menghapus jabatan.");
                }
            })
            .catch(error => {
                console.error('Error deleting jabatan:', error);
                alert("Terjadi kesalahan saat menghapus jabatan.");
            });
    }
}

//simpan data divisi
document.getElementById("divisiForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // Tambahkan action untuk menentukan jenis data yang dikirim
    data.action = 'addDivisi';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("Data divisi berhasil disimpan!");
            this.reset();
            location.reload();
        } else {
            alert("Gagal menyimpan data divisi.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Terjadi kesalahan saat menyimpan data.");
    }
});
//tampilkan data divisi
function loadDataDivisi() {
    fetch(url + '?action=getDivisi')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#dataDivisi tbody');
            tableBody.innerHTML = '';
            let i = 0;
            data.forEach((karyawan) => {
                const row = document.createElement('tr');
                i++;
                row.innerHTML = `
                    <td>${i}</td>
                    <td>${karyawan.kode}</td>
                    <td>${karyawan.divisi}</td>
                    <td>
                        <button class="btn btn-sm btnHapus" onclick="deleteDivisi('${karyawan.kode}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}
//option divisi
async function loadDivisiOptions() {
    try {
        const response = await fetch(url + '?action=getDivisi');
        const divisiData = await response.json();

        const divisiSelect = document.getElementById("divisi");
        const editDivisiSelect = document.getElementById("editDivisi");

        // Menghapus opsi lama kecuali opsi default "---"
        divisiSelect.innerHTML = '<option value="">---</option>';
        editDivisiSelect.innerHTML = '<option value="">---</option>';

        // Tambahkan opsi berdasarkan data dari server
        divisiData.forEach(divisi => {
            // Buat elemen option untuk divisiSelect
            const option1 = document.createElement("option");
            option1.value = divisi.divisi; // Nilai opsi
            option1.textContent = divisi.divisi; // Teks yang tampil
            divisiSelect.appendChild(option1);

            // Buat elemen option terpisah untuk editDivisiSelect
            const option2 = document.createElement("option");
            option2.value = divisi.divisi; // Nilai opsi
            option2.textContent = divisi.divisi; // Teks yang tampil
            editDivisiSelect.appendChild(option2);
        });
    } catch (error) {
        console.error("Error loading divisi options:", error);
    }
}

//Delete divisi
function deleteDivisi(kode) {
    if (confirm("Apakah Anda yakin ingin menghapus divisi ini?")) {
        fetch(url + '?action=deleteDivisi&kode=' + kode, {
            method: 'post',
            body: JSON.stringify({
                action: 'deleteDivisi',
                kode: kode
            })
        })
            .then(response => response.json())
            .then(result => {
                if (result.status === 'success') {
                    alert("Divisi berhasil dihapus!");
                    loadDataDivisi();
                } else {
                    alert("Gagal menghapus divisi.");
                }
            })
            .catch(error => {
                console.error('Error deleting divisi:', error);
                alert("Terjadi kesalahan saat menghapus divisi.");
            });
    }
}

//simpan absen
document.getElementById("addForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // Tambahkan action untuk menentukan jenis data yang dikirim
    data.action = 'addAbsen';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("Data absensi berhasil disimpan!");
            this.reset();
            location.reload();
        } else {
            alert("Gagal menyimpan data absensi.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Terjadi kesalahan saat menyimpan data.");
    }
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Tampilkan absen
function loadDataAbsen() {
    fetch(url + '?action=getAbsen')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#dataAbsen tbody');
            tableBody.innerHTML = '';
            data.forEach((absen) => {
                const row = document.createElement('tr');

                // Format tanggal dan waktu
                const formattedTanggal = formatDate(absen.tanggal);
                const formattedJamMasuk = formatTime(absen.jamMasuk);
                const formattedJamKeluar = formatTime(absen.jamKeluar);

                row.innerHTML = `
                    <td>${absen.no}</td>
                    <td>${absen.namaKaryawan}</td>
                    <td>${formattedTanggal}</td>
                    <td>${absen.lokasi}</td>
                    <td>${formattedJamMasuk}</td>
                    <td>${formattedJamKeluar}</td>
                    <td>
                        <button class="btn btn-sm btnHapus" onclick="deleteDivisi('${absen.no}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

//simpan izin
document.getElementById("izinForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // Tambahkan action untuk menentukan jenis data yang dikirim
    data.action = 'addIzin';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("Izin berhasil diajukan!");
            this.reset();
            location.reload();
        } else {
            alert("Gagal mengajukan izin.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Terjadi kesalahan saat menyimpan data.");
    }
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Tampilkan Izin
function loadDataIzin() {
    fetch(url + '?action=getIzin')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#dataIzin tbody');
            tableBody.innerHTML = '';
            data.forEach((liIzin) => {
                const row = document.createElement('tr');

                // Format tanggal dan waktu
                const formattedTanggal = formatDate(liIzin.tanggalIzin);
                const formattedJamIzin = formatTime(liIzin.jamIzin);

                row.innerHTML = `
                    <td id="noIzin">${liIzin.no}</td>
                    <td>${liIzin.namaIzin}</td>
                    <td>${liIzin.jIzin}</td>
                    <td>${formattedTanggal}</td>
                    <td>${formattedJamIzin}</td>
                    <td>${liIzin.ketIzin}</td>
                    <td>${liIzin.statusIzin}</td>
                    <td>
                        <button class="btn btn-sm btnEdit me-1 mb-1" onclick="ubahStatusIzin(${liIzin.no})"><i class="fas fa-edit"></i> Ubah Status</button>
                        <button class="btn btn-sm btnHapus" onclick="deleteDivisi('${liIzin.no}')"><i class="fas fa-trash"></i>Hapus Data Izin</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Membuka modal edit izin
function ubahStatusIzin(no) {
    document.getElementById('ubahStatusId').value = no;
    const modalElement = new bootstrap.Modal(document.getElementById('ubahStatusModal'));
    modalElement.show();
}

// Menyimpan status
async function simpanStatus() {
    const no = document.getElementById('ubahStatusId').value;
    const statusIzin = document.getElementById('statusBaru').value;

    if (!statusIzin) {
        alert("Pilih status baru terlebih dahulu!");
        return;
    }

    const data = {
        action: 'editIzin',
        no: no,
        statusIzin: statusIzin
    };

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                console.log(data);
                alert("Status izin berhasil diubah!");
                const modalElement = bootstrap.Modal.getInstance(document.getElementById('ubahStatusModal'));
                modalElement.hide();
                loadDataIzin(); // Refresh data izin
            } else {
                alert("Gagal mengubah status izin.");
            }
        })
        .catch(error => console.error('Error updating status:', error));
}

// Menutup modal
function closeModal() {
    const modalElement = bootstrap.Modal.getInstance(document.getElementById('ubahStatusModal'));
    modalElement.hide(); // Tutup modal menggunakan Bootstrap
}

// Simpan Lembur
document.getElementById("lemburForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // Tambahkan action untuk menentukan jenis data yang dikirim
    data.action = 'addLembur';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("Lembur berhasil ditambahkan!");
            this.reset();
            location.reload(); // Refresh data lembur setelah berhasil ditambahkan
        } else {
            alert("Gagal menambahkan lembur.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Terjadi kesalahan saat menyimpan data.");
    }
});

// Format Tanggal
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format YYYY-MM-DD
}

// Format Jam
function formatTime(dateString) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`; // Format HH:MM
}

// Tampilkan Data Lembur
function loadDataLembur() {
    fetch(url + '?action=getLembur')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#dataLembur tbody');
            tableBody.innerHTML = '';
            data.forEach((liLembur) => {
                const row = document.createElement('tr');
                const formattedTanggal = formatDate(liLembur.tanggalLembur);
                const formattedJamMulai = formatTime(liLembur.jamMulaiLembur);
                const formattedJamSelesai = formatTime(liLembur.jamSelesaiLembur);
                row.innerHTML = `
                    <td>${liLembur.no}</td>
                    <td>${liLembur.namaLembur}</td>
                    <td>${formattedTanggal}</td>
                    <td>${formattedJamMulai} | ${formattedJamSelesai}</td>
                    <td>${liLembur.ketLembur}</td>
                    <td>${liLembur.statusLembur}</td>
                    <td>
                        <button class="btn btn-sm btnEdit" onclick="ubahStatusLembur(${liLembur.no})"><i class="fas fa-edit"></i> Ubah Status</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}



// Menyimpan status lembur
async function simpanStatus() {
    const no = document.getElementById('ubahStatusLemburId').value;
    const statusLembur = document.getElementById('statusLemburBaru').value;

    if (!statusLembur) {
        alert("Pilih status baru terlebih dahulu!");
        return;
    }

    const data = {
        action: 'editLembur',
        no: no,
        statusLembur: statusLembur
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert("Status lembur berhasil diubah!");
            const modalElement = bootstrap.Modal.getInstance(document.getElementById('ubahStatusLembur'));
            modalElement.hide();
            loadDataLembur(); // Refresh data lembur
        } else {
            alert("Gagal mengubah status lembur.");
            console.log(result);
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}
// Membuka modal edit lembur
function ubahStatusLembur(no) {
    document.getElementById('ubahStatusLemburId').value = no;
    const modalElement = new bootstrap.Modal(document.getElementById('ubahStatusLembur'));
    modalElement.show();
}
// Menutup modal
function closeModal() {
    const modalElement = bootstrap.Modal.getInstance(document.getElementById('ubahStatusLembur'));
    modalElement.hide();
}

function loadData() {
    loadDataJabatan();
    loadDataKaryawan();
    loadJabatanOptions();
    loadDataDivisi();
    loadDivisiOptions();
    loadDataAbsen();
    loadDataIzin();
    loadDataLembur();
    loadDashboardData()
}
window.onload = loadData