/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   kasbank-store.js - mock data Master Kas/Bank (Daftar Bank),
   disimpan di localStorage.

   CATATAN: 10 baris pertama (kode 11010110 - 11010200) disalin
   persis dari screenshot "Daftar Bank" yang diberikan (data Kas).
   13 baris berikutnya (Kas Kecil site lain + akun-akun Bank
   sungguhan seperti Bank Mandiri/BCA/BRI/BNI) adalah data contoh
   tambahan yang saya lengkapi sendiri supaya paginasi 3 halaman /
   Total Record: 23 pada mockup ini sama seperti screenshot.

   PENTING (lihat juga kasbon-store.js & pengembalian-kasbon-store.js):
   kode akun "Bank Mandiri - HO" / "Bank BCA - HO" yang dipakai pada
   jurnal otomatis Kas Bon & Pengembalian Kas Bon sebelumnya hanya
   berupa ASUMSI mockup (11010200 / 11010210). Ternyata kode 11010200
   pada Master Kas/Bank yang sesungguhnya adalah "Kas Penjualan HO",
   bukan Bank Mandiri. Kode akun tsb sudah saya perbaiki mengikuti
   kode akun Bank pada file ini (lihat 11020110 & 11020130 di bawah)
   supaya konsisten satu sistem.
   =========================================================== */

(function (global) {
  var STORAGE_KEY = 'srw_mockup_kasbank_v1';

  function seedData() {
    return [
      // ---- Persis dari screenshot "Daftar Bank" (halaman 1) ----
      { kode: '11010110', nama: 'Kas Besar', saldo: 5000000, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },
      { kode: '11010120', nama: 'Kas Kecil - HO', saldo: 31503266.92, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },
      { kode: '11010130', nama: 'Kas Kecil Project - KPC', saldo: 20751000, mataUang: 'IDR', telepon: '', noRek: '1480024509344', tipe: 'Kas' },
      { kode: '11010131', nama: 'Kas Kecil 335', saldo: 0, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },
      { kode: '11010132', nama: 'Kas Kecil 338', saldo: 0, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },
      { kode: '11010140', nama: 'Kas Kecil Project - Pertamina', saldo: 14480500, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },
      { kode: '11010150', nama: 'Kas Kecil Project - THIESS', saldo: 0, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },
      { kode: '11010180', nama: 'Cash Advance / Kas Bon / Uang Muka', saldo: 0, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },
      { kode: '11010190', nama: 'Kas dalam Perjalanan', saldo: 0, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },
      { kode: '11010200', nama: 'Kas Penjualan HO', saldo: 0, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },

      // ---- Data tambahan (halaman 2-3) - contoh, bukan dari screenshot ----
      { kode: '11010210', nama: 'Kas Kecil Project - Adaro', saldo: 0, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },
      { kode: '11010220', nama: 'Kas Kecil Project - Berau Coal', saldo: 0, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },
      { kode: '11010230', nama: 'Kas Kecil Site - Sangatta', saldo: 5250000, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' },
      { kode: '11020110', nama: 'Bank Mandiri - HO', saldo: 458213750.5, mataUang: 'IDR', telepon: '', noRek: '1080012345678', tipe: 'Bank' },
      { kode: '11020120', nama: 'Bank Mandiri - Project KPC', saldo: 75600000, mataUang: 'IDR', telepon: '', noRek: '1080098765432', tipe: 'Bank' },
      { kode: '11020130', nama: 'Bank BCA - HO', saldo: 212450000, mataUang: 'IDR', telepon: '', noRek: '0123456789', tipe: 'Bank' },
      { kode: '11020140', nama: 'Bank BCA - Project THIESS', saldo: 18900000, mataUang: 'IDR', telepon: '', noRek: '0129988776', tipe: 'Bank' },
      { kode: '11020150', nama: 'Bank BRI - HO', saldo: 63200000, mataUang: 'IDR', telepon: '', noRek: '009901123456', tipe: 'Bank' },
      { kode: '11020160', nama: 'Bank BNI - HO', saldo: 44750000, mataUang: 'IDR', telepon: '', noRek: '0334455667', tipe: 'Bank' },
      { kode: '11020170', nama: 'Bank Mandiri - Payroll', saldo: 15800000, mataUang: 'IDR', telepon: '', noRek: '1080055667788', tipe: 'Bank' },
      { kode: '11020180', nama: 'Bank CIMB Niaga - HO', saldo: 9250000, mataUang: 'IDR', telepon: '', noRek: '800123456700', tipe: 'Bank' },
      { kode: '11020190', nama: 'Bank Mandiri USD - HO', saldo: 12500, mataUang: 'USD', telepon: '', noRek: '1080077889900', tipe: 'Bank' },
      { kode: '11020200', nama: 'Bank Danamon - HO', saldo: 3100000, mataUang: 'IDR', telepon: '', noRek: '001234567890', tipe: 'Bank' }
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
      console.error('Gagal memuat data Kas/Bank, memakai data awal.', e);
      return seedData();
    }
  }

  function saveAll(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { console.error('Gagal menyimpan data Kas/Bank.', e); }
  }

  function getByKode(kode) {
    var list = loadAll();
    for (var i = 0; i < list.length; i++) if (list[i].kode === kode) return list[i];
    return null;
  }

  function upsert(acc) {
    var list = loadAll();
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].kode === acc.kode) { idx = i; break; }
    if (idx >= 0) list[idx] = acc; else list.push(acc);
    saveAll(list);
    return acc;
  }

  function removeByKode(kode) {
    saveAll(loadAll().filter(function (a) { return a.kode !== kode; }));
  }

  function nextKode(tipe) {
    var list = loadAll();
    var prefix = tipe === 'Bank' ? '1102' : '1101';
    var max = 0;
    list.forEach(function (a) {
      if (a.kode && a.kode.indexOf(prefix) === 0) {
        var n = parseInt(a.kode, 10);
        if (!isNaN(n) && n > max) max = n;
      }
    });
    if (max === 0) max = tipe === 'Bank' ? 11020100 : 11010100;
    return String(max + 10);
  }

  function emptyAccount() {
    return { kode: nextKode('Kas'), nama: '', saldo: 0, mataUang: 'IDR', telepon: '', noRek: '', tipe: 'Kas' };
  }

  global.KasBankStore = {
    loadAll: loadAll, saveAll: saveAll, getByKode: getByKode, upsert: upsert,
    removeByKode: removeByKode, nextKode: nextKode, emptyAccount: emptyAccount
  };
})(window);
