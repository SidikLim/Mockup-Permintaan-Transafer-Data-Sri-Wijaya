/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   karyawan-store.js - mock data Master Karyawan, disimpan di
   localStorage. Tidak terhubung ke server sungguhan.
   =========================================================== */

(function (global) {
  var STORAGE_KEY = 'srw_mockup_karyawan_v1';

  function seedData() {
    return [
      { kode: 'Z34345', mataUang: 'IDR', nama: 'A. TOGAR NAINGGOLAN', alamat: '', telepon: '', email: '', jabatan: '', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 0, nonAktif: false },
      { kode: 'Z123023', mataUang: 'IDR', nama: 'ABD RAHMAN', alamat: "(END CONTRACT)'Jl Pirus Raya, RT 013, Berebes Tengah, Bontang Selatan", telepon: '082250304417', email: 'rahmadabd650@gmail.com', jabatan: 'Welder Senior', noRekening: '1480023193132', npwp: '0', batasKredit: 0, saldoPiutang: 0, nonAktif: false },
      { kode: 'Z126930', mataUang: 'IDR', nama: 'ABD. RAHIM', alamat: 'Kabo Jaya, Kampung Bugis No 309', telepon: '', email: '', jabatan: '', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 0, nonAktif: false },
      { kode: 'Z106533', mataUang: 'IDR', nama: 'ABD. RAHMAT', alamat: 'Jl. Slamet Riyadi RT 41 No. 30, Bontang Utara', telepon: '', email: '', jabatan: '', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 0, nonAktif: false },
      { kode: 'Z123737', mataUang: 'IDR', nama: 'ABDI TRI DARMAWAN', alamat: '', telepon: '', email: '', jabatan: '', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 0, nonAktif: false },
      { kode: 'Z98369', mataUang: 'IDR', nama: 'ABDUL HAQ', alamat: '', telepon: '', email: '', jabatan: '', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 0, nonAktif: false },
      { kode: 'Z129107', mataUang: 'IDR', nama: 'ABDUL RACHMAN', alamat: 'Gg.Guna Jaya No.1 RT.003 Sangatta Utara', telepon: '', email: '', jabatan: '', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 0, nonAktif: false },
      { kode: 'Z84818', mataUang: 'IDR', nama: 'ABDULLAH', alamat: 'Gg Rajawali, RT/RW : 025/000, Teluk lingga, Sangatta Utara', telepon: '', email: '', jabatan: '', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 0, nonAktif: false },
      { kode: 'Z111406', mataUang: 'IDR', nama: 'ACHMAD PERMADI', alamat: 'Jl. Soekarno Hatta Gg. Konveor - Sangatta', telepon: '', email: '', jabatan: '', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 0, nonAktif: false },
      { kode: 'PK-123', mataUang: 'IDR', nama: 'ADE CHANDRA', alamat: 'SAMARINDA', telepon: '', email: '', jabatan: '', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 0, nonAktif: false },
      { kode: 'Z110045', mataUang: 'IDR', nama: 'ASMUNI', alamat: 'Sangatta Utara', telepon: '', email: '', jabatan: 'Operator', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 1500000, nonAktif: false },
      { kode: 'Z110088', mataUang: 'IDR', nama: 'ARIMA WORYANI', alamat: 'Sangatta Utara', telepon: '', email: '', jabatan: 'Admin', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 1500000, nonAktif: false },
      { kode: 'Z110090', mataUang: 'IDR', nama: 'MAMAN SUHERMAN', alamat: 'Sangatta Utara', telepon: '', email: '', jabatan: 'Teknisi', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 2500000, nonAktif: false },
      { kode: 'Z110091', mataUang: 'IDR', nama: 'HAERUNISA SAFITRI', alamat: 'Sangatta Utara', telepon: '', email: '', jabatan: 'Admin', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 3500000, nonAktif: false },
      { kode: 'Z110092', mataUang: 'IDR', nama: 'KORLIANUS TANGDIALLA', alamat: 'Sangatta Utara', telepon: '', email: '', jabatan: 'Teknisi Listrik', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 1836225, nonAktif: false },
      { kode: 'Z110093', mataUang: 'IDR', nama: 'APRIANI HASTANTI', alamat: 'Sangatta Utara', telepon: '', email: '', jabatan: 'Admin', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 10000000, nonAktif: false },
      { kode: 'Z110094', mataUang: 'IDR', nama: 'EFENDI', alamat: 'Sangatta Utara', telepon: '', email: '', jabatan: 'Teknisi', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 2500000, nonAktif: false },
      { kode: 'Z110095', mataUang: 'IDR', nama: 'HASYADI RAJAB', alamat: 'Sangatta Utara', telepon: '', email: '', jabatan: 'Teknisi', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 3000000, nonAktif: false },
      { kode: 'Z110096', mataUang: 'IDR', nama: 'SLAMET BASUNI', alamat: 'Sangatta Utara', telepon: '', email: '', jabatan: 'Teknisi', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 2000000, nonAktif: false }
    ];
  }

  function loadAll() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        var seeded = seedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Gagal memuat data karyawan, memakai data awal.', e);
      return seedData();
    }
  }

  function saveAll(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { console.error('Gagal menyimpan data karyawan.', e); }
  }

  function getByKode(kode) {
    var list = loadAll();
    for (var i = 0; i < list.length; i++) if (list[i].kode === kode) return list[i];
    return null;
  }

  function upsert(k) {
    var list = loadAll();
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].kode === k.kode) { idx = i; break; }
    if (idx >= 0) list[idx] = k; else list.push(k);
    saveAll(list);
    return k;
  }

  function removeByKode(kode) {
    saveAll(loadAll().filter(function (k) { return k.kode !== kode; }));
  }

  function toggleNonAktif(kode) {
    var list = loadAll();
    for (var i = 0; i < list.length; i++) {
      if (list[i].kode === kode) { list[i].nonAktif = !list[i].nonAktif; break; }
    }
    saveAll(list);
    return list;
  }

  function nextKode() {
    var list = loadAll();
    var max = 0;
    list.forEach(function (k) {
      var m = /Z(\d+)/.exec(k.kode || '');
      if (m) { var n = parseInt(m[1], 10); if (n > max) max = n; }
    });
    return 'Z' + String(max + 1);
  }

  function emptyKaryawan() {
    return {
      kode: nextKode(), mataUang: 'IDR', nama: '', alamat: '', telepon: '', email: '',
      jabatan: '', noRekening: '', npwp: '', batasKredit: 0, saldoPiutang: 0, nonAktif: false
    };
  }

  global.KaryawanStore = {
    loadAll: loadAll, saveAll: saveAll, getByKode: getByKode, upsert: upsert,
    removeByKode: removeByKode, toggleNonAktif: toggleNonAktif, nextKode: nextKode, emptyKaryawan: emptyKaryawan
  };
})(window);
