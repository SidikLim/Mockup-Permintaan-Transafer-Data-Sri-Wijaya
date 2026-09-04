/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   transaksi-kasbank-store.js - mock data "Transaksi Kas / Bank"
   (transaksi kas/bank yang sudah dieksekusi - bisa berasal dari
   Request Transaksi Kas/Bank yang di-approve, atau dibuat
   langsung). Disimpan di localStorage.

   CATATAN: 10 baris pertama diadaptasi dari contoh screenshot
   (nama vendor/keterangan asli dipertahankan, nama perusahaan
   pada 2 baris pertama disesuaikan menjadi Sri Wijaya Teknik
   Utama). 11 baris berikutnya adalah data contoh tambahan yang
   saya lengkapi sendiri, mengaitkan ke modul lain pada mockup ini
   (Kas Bon, Karyawan, Supplier) supaya datanya terasa satu sistem.
   =========================================================== */

(function (global) {
  var STORAGE_KEY = 'srw_mockup_transaksi_kasbank_v1';

  // Duplikat ringan dari kode akun Master Kas/Bank (lihat kasbank-store.js)
  // supaya file ini tetap berdiri sendiri, sama seperti pola di
  // kasbon-store.js / pengembalian-kasbon-store.js.
  var KAS_BANK_KODE = {
    'Kas Besar': '11010110',
    'Kas Kecil - HO': '11010120',
    'Kas Penjualan HO': '11010200',
    'Bank Mandiri - HO': '11020110',
    'Bank BCA - HO': '11020130'
  };
  var KAS_DALAM_PERJALANAN_KODE = '11010190';
  var KAS_DALAM_PERJALANAN_NAMA = 'Kas dalam Perjalanan';

  function buildJurnal(kasBankNama, tipeTransaksi, total, keterangan) {
    var kode = KAS_BANK_KODE[kasBankNama] || KAS_BANK_KODE['Kas Kecil - HO'];
    var isTerima = tipeTransaksi === 'Terima Kas';
    return [
      { kodeAkun: kode, kodeDept: '', costCenter: '', namaAkun: kasBankNama, keterangan: keterangan, debit: isTerima ? total : 0, kredit: isTerima ? 0 : total },
      { kodeAkun: KAS_DALAM_PERJALANAN_KODE, kodeDept: '', costCenter: '', namaAkun: KAS_DALAM_PERJALANAN_NAMA, keterangan: keterangan, debit: isTerima ? 0 : total, kredit: isTerima ? total : 0 }
    ];
  }

  function makeRow(no, tgl, keterangan, kasBankNama, tipeTransaksi, total, crc) {
    return {
      no: no, requestNo: '', departemen: 'PUSAT', proyek: '', tglTrn: tgl, dibayarKepada: '',
      rincianRows: [
        { kasBank: kasBankNama, dept: 'PST', crc: crc, kurs: 1, tipeTransaksi: tipeTransaksi, cair: true, noGiro: '', tglJatuhTempo: tgl, jurnal: '', keterangan: keterangan, total: total }
      ],
      keterangan: keterangan,
      jurnalMode: 'otomatis',
      jurnalItems: buildJurnal(kasBankNama, tipeTransaksi, total, keterangan)
    };
  }

  function seedData() {
    return [
      makeRow('BCA4-2026090006', '2026-09-02', 'SRIWIJAYA TEKNIK UTAMA,PT PINDAH BUKU DARI BCA ESCROW USD', 'Bank BCA - HO', 'Terima Kas', 338224.87, 'USD'),
      makeRow('BCA5-2026090002', '2026-09-02', 'SRIWIJAYA TEKNIK UTAMA,PT PINDAH BUKU KE BCA USD', 'Bank BCA - HO', 'Keluar Kas', 338224.87, 'USD'),
      makeRow('MAN1-2026090012', '2026-09-02', 'BIAYA TRANSFER FEDEX EXPRESS', 'Bank Mandiri - HO', 'Keluar Kas', 2500, 'IDR'),
      makeRow('MAN1-2026090010', '2026-09-02', 'BIAYA TRANSFER BIROTIKA SEMESTA', 'Bank Mandiri - HO', 'Keluar Kas', 2500, 'IDR'),
      makeRow('MAN1-2026090008', '2026-09-02', 'BIAYA TRANSFER RUMAH BUMBU BY DEBS', 'Bank Mandiri - HO', 'Keluar Kas', 2500, 'IDR'),
      makeRow('MAN1-2026090006', '2026-09-02', 'BIAYA ADMIN FAJAR JASA NUSANTARA', 'Bank Mandiri - HO', 'Keluar Kas', 5000, 'IDR'),
      makeRow('MAN1-2026090003', '2026-09-02', 'BIAYA TRANSFER EDDY WIJAYA', 'Bank Mandiri - HO', 'Keluar Kas', 2500, 'IDR'),
      makeRow('BCA4-2026090005', '2026-09-01', 'BIAYA VALUE TODAY MYEONG SEONG', 'Bank BCA - HO', 'Keluar Kas', 1.69, 'USD'),
      makeRow('BCA4-2026090004', '2026-09-01', 'BIAYA FULL AMOUNT MYEONG SEONG', 'Bank BCA - HO', 'Keluar Kas', 25, 'USD'),
      makeRow('BCA4-2026090003', '2026-09-01', 'BIAYA PROVISI MYEONG SEONG', 'Bank BCA - HO', 'Keluar Kas', 11.17, 'USD'),
      makeRow('MAN1-2026090001', '2026-09-01', 'SRIWIJAYA TEKNIK UTAMA,PT PINDAH BUKU DARI BCA OPERASIONAL', 'Bank Mandiri - HO', 'Terima Kas', 186144301, 'IDR'),
      makeRow('BCA1-2026090015', '2026-08-31', 'PEMBAYARAN UANG MUKA SUPPLIER - PT INDOPRIMA STEEL', 'Bank BCA - HO', 'Keluar Kas', 75000000, 'IDR'),
      makeRow('MAN1-2026090014', '2026-08-30', 'PEMBAYARAN KAS BON ASMUNI', 'Bank Mandiri - HO', 'Keluar Kas', 1500000, 'IDR'),
      makeRow('KAS1-2026090013', '2026-08-29', 'SETORAN KAS PENJUALAN HO KE BANK MANDIRI', 'Bank Mandiri - HO', 'Terima Kas', 5000000, 'IDR'),
      makeRow('MAN1-2026090011', '2026-08-28', 'TERIMA TRANSFER PELUNASAN PIUTANG PT ADARO INDONESIA', 'Bank Mandiri - HO', 'Terima Kas', 45000000, 'IDR'),
      makeRow('BCA1-2026090009', '2026-08-27', 'BIAYA ADMIN BULANAN BCA', 'Bank BCA - HO', 'Keluar Kas', 150000, 'IDR'),
      makeRow('MAN1-2026090007', '2026-08-26', 'PEMBAYARAN GAJI KARYAWAN AGUSTUS 2026', 'Bank Mandiri - HO', 'Keluar Kas', 125000000, 'IDR'),
      makeRow('BCA1-2026090005', '2026-08-25', 'TERIMA TRANSFER DP PROYEK KPC', 'Bank BCA - HO', 'Terima Kas', 250000000, 'IDR'),
      makeRow('MAN1-2026090002', '2026-08-24', 'BIAYA MATERAI & NOTARIS', 'Bank Mandiri - HO', 'Keluar Kas', 350000, 'IDR'),
      makeRow('KAS1-2026090001', '2026-08-20', 'PENGISIAN KAS KECIL HO', 'Kas Besar', 'Keluar Kas', 10000000, 'IDR'),
      makeRow('BCA1-2026090001', '2026-08-18', 'SETORAN MODAL PEMEGANG SAHAM', 'Bank BCA - HO', 'Terima Kas', 500000000, 'IDR')
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
      console.error('Gagal memuat data Transaksi Kas/Bank, memakai data awal.', e);
      return seedData();
    }
  }

  function saveAll(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { console.error('Gagal menyimpan data Transaksi Kas/Bank.', e); }
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

  function shortPrefixFor(kasBankNama) {
    if (!kasBankNama) return 'KAS1';
    var upper = kasBankNama.toUpperCase();
    if (upper.indexOf('MANDIRI') !== -1) return 'MAN1';
    if (upper.indexOf('BCA') !== -1) return 'BCA1';
    if (upper.indexOf('BRI') !== -1) return 'BRI1';
    if (upper.indexOf('BNI') !== -1) return 'BNI1';
    return 'KAS1';
  }

  function nextNo(kasBankNama) {
    var prefix = shortPrefixFor(kasBankNama);
    var d = new Date();
    var yyyymm = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0');
    var list = loadAll();
    var full = prefix + '-' + yyyymm;
    var max = 0;
    list.forEach(function (t) {
      if (t.no.indexOf(full) === 0) {
        var n = parseInt(t.no.slice(full.length), 10);
        if (!isNaN(n) && n > max) max = n;
      }
    });
    return full + String(max + 1).padStart(4, '0');
  }

  function totalOf(trx) {
    return (trx.rincianRows || []).reduce(function (s, r) {
      var amt = Number(r.total) || 0;
      return s + (r.tipeTransaksi === 'Terima Kas' ? amt : -amt);
    }, 0);
  }

  function emptyRincian() {
    return { kasBank: '', dept: 'PST', crc: 'IDR', kurs: 1, tipeTransaksi: 'Terima Kas', cair: true, noGiro: '', tglJatuhTempo: '', jurnal: '', keterangan: '', total: 0 };
  }

  function emptyTransaction() {
    var todayIso = new Date().toISOString().slice(0, 10);
    return {
      no: nextNo(''), requestNo: '', departemen: 'PUSAT', proyek: '', tglTrn: todayIso, dibayarKepada: '',
      rincianRows: [emptyRincian()], keterangan: '', jurnalMode: 'otomatis', jurnalItems: []
    };
  }

  global.TransaksiKasBankStore = {
    loadAll: loadAll, saveAll: saveAll, getByNo: getByNo, upsert: upsert, removeByNo: removeByNo,
    nextNo: nextNo, totalOf: totalOf, emptyTransaction: emptyTransaction, emptyRincian: emptyRincian,
    KAS_BANK_KODE: KAS_BANK_KODE, KAS_DALAM_PERJALANAN_KODE: KAS_DALAM_PERJALANAN_KODE, KAS_DALAM_PERJALANAN_NAMA: KAS_DALAM_PERJALANAN_NAMA
  };
})(window);
