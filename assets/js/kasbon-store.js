/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   kasbon-store.js - mock data transaksi Kas Bon Karyawan
   (header + baris jurnal), disimpan di localStorage.
   =========================================================== */

(function (global) {
  var STORAGE_KEY = 'srw_mockup_kasbon_v1';

  function seedData() {
    return [
      makeRow('EMT/STU/08/26/001', 'ASMUNI', '2026-08-31', 'KAS BON ASMUNI ( TUNAI ) TGL 31/08/2026', 1500000, 'manual'),
      makeRow('EMT/STU/07/26/003', 'ARIMA WORYANI', '2026-07-28', 'KAS BON ARIMA WORYANI ( TUNAI TGL 28 JULI 2026 )', 1500000, 'otomatis'),
      makeRow('EMT/STU/07/26/002', 'ASMUNI', '2026-07-22', 'KAS BON ASMUNI TGL 22 JULI 2026 ( TUNAI )', 350000, 'otomatis'),
      makeRow('EMT/STU/07/26/001', 'MAMAN SUHERMAN', '2026-07-17', 'PINJAMAN MAMAN SUHERMAN TGL 17/07/2026 VIA BANK MANDIRI (CEK JL 477173 (11))', 2500000, 'otomatis'),
      makeRow('EMT/STU/06/26/003', 'HAERUNISA SAFITRI', '2026-06-22', 'PINJAMAN HAERUNISA SAFITRI TGL 22/06/2026 VIA BANK MANDIRI (CEK JL 476992)', 3500000, 'otomatis'),
      makeRow('EMT/STU/06/26/002', 'ASMUNI', '2026-06-20', 'PINJAMAN ASMUNI TUNAI TGL 20 JUNI 2026', 300000, 'otomatis'),
      makeRow('EMT/STU/06/26/001', 'KORLIANUS TANGDIALLA', '2026-05-25', '50% SERTIFIKASI KELISTRIKAN AN Z90330 - KORLIANUS TANGDIALLA (PROJECT KPC) PO335/05/26/0052', 1836225, 'otomatis'),
      makeRow('EMT/STU/04/26/006', 'ARIMA WORYANI', '2026-04-25', 'PINJAMAN ARIMA WORYANI TUNAI TGL 24/04/2026', 600000, 'otomatis'),
      makeRow('EMT/STU/04/26/002', 'APRIANI HASTANTI', '2026-03-06', 'PINJAMAN APRIANI HASTANTI TGL 06/03/2026 VIA BANK MANDIRI (CEK JK 400610)', 10000000, 'otomatis'),
      makeRow('EMT/STU/04/26/001', 'ASMUNI', '2026-02-20', 'PINJAMAN ASMUNI TGL 22/02/2026 VIA BANK MANDIRI (CEK JJ 799131)', 2500000, 'otomatis'),
      makeRow('EMT/STU/04/26/005', 'EFENDI', '2026-02-20', 'PINJAMAN EFENDI TGL 20/02/2026 VIA BANK MANDIRI (CEK JJ 799131)', 2500000, 'otomatis'),
      makeRow('EMT/STU/04/26/004', 'HASYADI RAJAB', '2026-02-20', 'PINJAMAN HASYADI RAJAB TGL 20/02/2026 VIA BANK MANDIRI (CEK JJ 799131)', 3000000, 'otomatis'),
      makeRow('EMT/STU/04/26/003', 'SLAMET BASUNI', '2026-02-20', 'PINJAMAN SLAMET BASUNI TGL 20/02/2026 VIA BANK MANDIRI (CEK JJ 799131)', 2000000, 'otomatis')
    ];
  }

  function makeRow(no, karyawan, tgl, keterangan, jumlah, jurnalMode) {
    var kasBankAkun = keterangan.toUpperCase().indexOf('BANK MANDIRI') !== -1 ? 'Bank Mandiri - HO' : 'Kas Kecil - HO';
    var kasBankKode = kasBankAkun === 'Bank Mandiri - HO' ? '11020110' : '11010120';
    return {
      no: no, caNumber: '', departemen: 'GA-HR', proyek: '', karyawan: karyawan,
      kursKaryawan: 1, mataUangKaryawan: 'IDR', jumlah: jumlah, tglTrn: tgl,
      kasBank: kasBankAkun, kursKasBank: 1, mataUangKasBank: 'IDR',
      jurnalAkun: kasBankAkun, dibayarKepada: karyawan, keterangan: keterangan,
      jurnalMode: jurnalMode || 'otomatis',
      jurnalItems: [
        { kodeAkun: '11030300', costCenter: '', namaAkun: 'Piutang Karyawan', keterangan: keterangan, komponen: '', debit: jumlah, kredit: 0 },
        { kodeAkun: kasBankKode, costCenter: '', namaAkun: kasBankAkun, keterangan: keterangan, komponen: '', debit: 0, kredit: jumlah }
      ]
    };
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
      console.error('Gagal memuat data kas bon, memakai data awal.', e);
      return seedData();
    }
  }

  function saveAll(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { console.error('Gagal menyimpan data kas bon.', e); }
  }

  function getByNo(no) {
    var list = loadAll();
    for (var i = 0; i < list.length; i++) if (list[i].no === no) return list[i];
    return null;
  }

  function upsert(trx) {
    var list = loadAll();
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].no === trx.no) { idx = i; break; }
    if (idx >= 0) list[idx] = trx; else list.push(trx);
    saveAll(list);
    return trx;
  }

  function removeByNo(no) {
    saveAll(loadAll().filter(function (t) { return t.no !== no; }));
  }

  function nextNo() {
    var d = new Date();
    var bulan = String(d.getMonth() + 1).padStart(2, '0');
    var tahun = String(d.getFullYear()).slice(2);
    var list = loadAll();
    var prefix = 'EMT/STU/' + bulan + '/' + tahun + '/';
    var max = 0;
    list.forEach(function (t) {
      if (t.no.indexOf(prefix) === 0) {
        var n = parseInt(t.no.slice(prefix.length), 10);
        if (!isNaN(n) && n > max) max = n;
      }
    });
    return prefix + String(max + 1).padStart(3, '0');
  }

  function emptyTransaction() {
    var todayIso = new Date().toISOString().slice(0, 10);
    return {
      no: nextNo(), caNumber: '', departemen: 'GA-HR', proyek: '', karyawan: '',
      kursKaryawan: 1, mataUangKaryawan: 'IDR', jumlah: 0, tglTrn: todayIso,
      kasBank: 'Kas Kecil - HO', kursKasBank: 1, mataUangKasBank: 'IDR',
      jurnalAkun: 'Kas Kecil - HO', dibayarKepada: '', keterangan: '',
      jurnalMode: 'otomatis', jurnalItems: []
    };
  }

  global.KasbonStore = {
    loadAll: loadAll, saveAll: saveAll, getByNo: getByNo, upsert: upsert,
    removeByNo: removeByNo, nextNo: nextNo, emptyTransaction: emptyTransaction
  };
})(window);
