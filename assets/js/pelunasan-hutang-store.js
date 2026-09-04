/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   pelunasan-hutang-store.js - mock data "Pelunasan Hutang"
   (transaksi pembayaran hutang supplier yang sudah dieksekusi -
   bisa ditarik dari Pengajuan Pembayaran yang sudah di-approve,
   atau dibuat langsung). Disimpan di localStorage.

   CATATAN: 10 baris pertama diadaptasi dari contoh screenshot
   (PT SEKAWAN INTIPERKASA-SIP008) - nomor transaksi, keterangan,
   dan total dipertahankan; kode akun Bank memakai master Kas/Bank
   Sri Wijaya sendiri (kasbank-store.js) dan akun "Hutang Usaha"
   memakai kode 21010100 yang sudah dipakai pada modul Uang Muka
   Supplier (lihat uang-muka-store.js) supaya konsisten satu chart
   of accounts. 3 baris terakhir adalah data pelengkap yang saya
   buat sendiri, dikaitkan ke supplier Master Vendor yang sudah ada
   (data-store.js).

   Nomor transaksi (mis. "MAN1-2026090011") bisa saja terlihat mirip
   dengan penomoran pada modul "Transaksi Kas/Bank" - ini karena
   kedua modul sama-sama diadaptasi dari screenshot perusahaan
   sumber yang sama, dan pada sistem sungguhan keduanya kemungkinan
   berbagi satu nomor transaksi bank yang sama (Pelunasan Hutang
   adalah tampilan sisi AP dari transaksi Kas/Bank tsb). Pada
   mockup ini keduanya disimpan sebagai 2 store independen.
   =========================================================== */

(function (global) {
  var STORAGE_KEY = 'srw_mockup_pelunasan_hutang_v1';

  // Duplikat ringan dari kode akun Master Kas/Bank, sama seperti pola di
  // transaksi-kasbank-store.js / kasbon-store.js.
  var KAS_BANK_KODE = {
    'Kas Besar': '11010110',
    'Kas Kecil - HO': '11010120',
    'Bank Mandiri - HO': '11020110',
    'Bank BCA - HO': '11020130',
    'Bank Mandiri USD-HO': '11020190'
  };
  var AKUN_HUTANG_KODE = '21010100';
  var AKUN_HUTANG_NAMA = 'Hutang Usaha';

  function buildJurnal(kasBankNama, tipeTransaksi, total, keterangan) {
    var kode = KAS_BANK_KODE[kasBankNama] || KAS_BANK_KODE['Bank Mandiri - HO'];
    var isKeluar = tipeTransaksi !== 'Terima Kas';
    // Pelunasan Hutang (Keluar Kas): Debit Hutang Usaha (hutang berkurang), Kredit Bank/Kas.
    // Jika suatu saat ada retur/refund dari supplier (Terima Kas), jurnal dibalik.
    return [
      { kodeAkun: AKUN_HUTANG_KODE, costCenter: '', namaAkun: AKUN_HUTANG_NAMA, keterangan: keterangan, debit: isKeluar ? total : 0, kredit: isKeluar ? 0 : total },
      { kodeAkun: kode, costCenter: '', namaAkun: kasBankNama, keterangan: keterangan, debit: isKeluar ? 0 : total, kredit: isKeluar ? total : 0 }
    ];
  }

  function makeRow(no, tgl, supplier, pengajuanNo, kasBankNama, crc, total, keterangan, rincianFaktur) {
    var row = {
      kasBank: kasBankNama, dept: 'PST', crc: crc, kurs: 1, kursTarget: 1, tipeTransaksi: 'Keluar Kas',
      cair: true, noGiro: '', tglJatuhTempo: tgl, jurnal: 'Jurnal Vendor II', keterangan: keterangan, pembayaran: total
    };
    return {
      no: no, departemen: 'PUSAT', proyek: '', supplier: supplier, tglTrn: tgl, pengajuanNo: pengajuanNo,
      rincianRows: [row], rincianFaktur: rincianFaktur, keterangan: keterangan,
      jurnalMode: 'otomatis', jurnalItems: buildJurnal(kasBankNama, 'Keluar Kas', total, keterangan),
      overrideTidakSama: false
    };
  }

  function seedData() {
    return [
      makeRow('MAN1-2026090011', '2026-09-02', 'PT FEDEX EXPRESS INTERNATIONAL', 'PYR-2026090006', 'Bank Mandiri - HO', 'IDR', 3514920,
        'PYR-2026090006 - FEDEX EXPRESS INTERNATIONAL - INVOICE NO.872914160 & 872936443',
        [{ noFaktur: 'PIV-2026080048', checked: true, pembayaran: 2087917 }, { noFaktur: 'PIV-2026080049', checked: true, pembayaran: 1427003 }]),
      makeRow('MAN1-2026090009', '2026-09-02', 'PT BIROTIKA SEMESTA', 'PYR-2026090002', 'Bank Mandiri - HO', 'IDR', 1246720,
        'PYR-2026090002 - BIROTIKA SEMESTA-DHL - INVOICE NO.JKTIR01028727',
        [{ noFaktur: 'PIV-2026080050', checked: true, pembayaran: 1246720 }]),
      makeRow('MAN1-2026090007', '2026-09-02', "RUMAH BUMBU BY DEBS' CATERING", 'PYR-2026080098', 'Bank Mandiri - HO', 'IDR', 3780000,
        "PYR-2026080098 - RUMAH BUMBU BY DEBS' CATERRING - INVOICE NO.28 & 29.SIP.AUG.2026",
        [{ noFaktur: 'SIP.AUG.2026-28', checked: true, pembayaran: 2000000 }, { noFaktur: 'SIP.AUG.2026-29', checked: true, pembayaran: 1780000 }]),
      makeRow('MAN1-2026090005', '2026-09-02', 'PT FAJAR JASA NUSANTARA', 'PYR-2026080097', 'Bank Mandiri - HO', 'IDR', 1675000,
        'PYR-2026080097 - FAJAR JASA NUSANTARA - INVOICE NO.580.INV.QP.FJN.VIII.26',
        [{ noFaktur: '580.INV.QP.FJN.VIII.26', checked: true, pembayaran: 1675000 }]),
      makeRow('MAN2-2026090003', '2026-09-01', 'FREIGHTPLAN (PVT) LTD', 'PYR-2026080071', 'Bank Mandiri USD-HO', 'USD', 1291.00,
        'PYR-2026080071 FREIGHTPLAN DISB MV.CERDAS V.297',
        [{ noFaktur: 'DISB.MV.CERDAS.V297', checked: true, pembayaran: 1291.00 }]),
      makeRow('BCA4-2026090001', '2026-09-01', 'MYEONG SEONG INDUSTRIES CO., LTD', 'PYR-2026070083, PYR-2026070084', 'Bank BCA - HO', 'USD', 8939.00,
        'PYR-2026070083 MYEONG SEONG PO.00335,00680,00679, PYR-2026070084 MYEONG SEONG PO.00695,00696,00833',
        [{ noFaktur: 'PO.00335,00680,00679', checked: true, pembayaran: 4500.00 }, { noFaktur: 'PO.00695,00696,00833', checked: true, pembayaran: 4439.00 }]),
      makeRow('BCA3-2026090011', '2026-09-01', 'PT. BARRA ASEAN SHIPPING', 'PYR-2026080093', 'Bank BCA - HO', 'IDR', 42884701.93,
        'PYR-2026080093 BARRA ASEAN - DISB MV.CERDAS V.398',
        [{ noFaktur: 'DISB.MV.CERDAS.V398', checked: true, pembayaran: 42884701.93 }]),
      makeRow('BCA3-2026090010', '2026-09-01', 'MANDIRI SENTOSA / YULIANTO', 'PYR-2026080087', 'Bank BCA - HO', 'IDR', 59948750,
        'PYR-2026080087 - MANDIRI SENTOSA-YULIANTO - WO NO.00132',
        [{ noFaktur: 'WO.00132', checked: true, pembayaran: 59948750 }]),
      makeRow('BCA3-2026090008', '2026-09-01', 'PT JASON ELEKTRONIKA', 'PYR-2026080085, PYR-2026080086', 'Bank BCA - HO', 'IDR', 18816000,
        'PYR-2026080085 - JASON ELEKTRONIKA - WO NO.00106, PYR-2026080086 - JASON ELEKTRONIKA - WO NO.00117',
        [{ noFaktur: 'WO.00106', checked: true, pembayaran: 10000000 }, { noFaktur: 'WO.00117', checked: true, pembayaran: 8816000 }]),
      makeRow('BCA3-2026090007', '2026-09-01', 'PT USAHA PRATAMA SEJAHTERA', 'PYR-2026080053, PYR-2026080054', 'Bank BCA - HO', 'IDR', 30135000,
        'PYR-2026080053 - USAHA PRATAMA SEJAHTERA - WO NO.00085, PYR-2026080054 - USAHA PRATAMA SEJAHTERA - WO NO.00086',
        [{ noFaktur: 'WO.00085', checked: true, pembayaran: 15135000 }, { noFaktur: 'WO.00086', checked: true, pembayaran: 15000000 }]),

      // Baris tambahan (di luar screenshot) - dikaitkan ke supplier Master Vendor.
      makeRow('MAN1-2026080031', '2026-08-31', 'Agave Primatama', '', 'Bank Mandiri - HO', 'IDR', 11872782,
        'PELUNASAN HUTANG AGAVE PRIMATAMA - FULL SETTLEMENT INV-AGV-0912',
        [{ noFaktur: 'INV-AGV-0912', checked: true, pembayaran: 11872782 }]),
      makeRow('BCA1-2026080028', '2026-08-28', 'INTI GLOBAL BERSAMA TEKNIK', '', 'Bank BCA - HO', 'IDR', 58400000,
        'PEMBAYARAN SEBAGIAN HUTANG INTI GLOBAL BERSAMA TEKNIK INV-IGB-0745',
        [{ noFaktur: 'INV-IGB-0745', checked: true, pembayaran: 58400000 }]),
      makeRow('MAN1-2026080026', '2026-08-26', 'PT. Angsa Putih Kurnia Kharisma', '', 'Bank Mandiri - HO', 'IDR', 3250000,
        'PELUNASAN HUTANG PT. ANGSA PUTIH KURNIA KHARISMA INV-APK-0231',
        [{ noFaktur: 'INV-APK-0231', checked: true, pembayaran: 3250000 }])
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
      console.error('Gagal memuat data Pelunasan Hutang, memakai data awal.', e);
      return seedData();
    }
  }

  function saveAll(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { console.error('Gagal menyimpan data Pelunasan Hutang.', e); }
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
      var amt = Number(r.pembayaran) || 0;
      return s + (r.tipeTransaksi === 'Terima Kas' ? amt : -amt);
    }, 0);
  }

  function emptyRincianRow() {
    return { kasBank: '', dept: 'PST', crc: 'IDR', kurs: 1, kursTarget: 1, tipeTransaksi: 'Keluar Kas', cair: true, noGiro: '', tglJatuhTempo: '', jurnal: '', keterangan: '', pembayaran: 0 };
  }

  function emptyTransaction() {
    var todayIso = new Date().toISOString().slice(0, 10);
    return {
      no: nextNo(''), departemen: 'PUSAT', proyek: '', supplier: '', tglTrn: todayIso, pengajuanNo: '',
      rincianRows: [emptyRincianRow()], rincianFaktur: [], keterangan: '',
      jurnalMode: 'otomatis', jurnalItems: [], overrideTidakSama: false
    };
  }

  global.PelunasanHutangStore = {
    loadAll: loadAll, saveAll: saveAll, getByNo: getByNo, upsert: upsert, removeByNo: removeByNo,
    nextNo: nextNo, shortPrefixFor: shortPrefixFor, totalOf: totalOf,
    emptyTransaction: emptyTransaction, emptyRincianRow: emptyRincianRow, buildJurnal: buildJurnal,
    KAS_BANK_KODE: KAS_BANK_KODE, AKUN_HUTANG_KODE: AKUN_HUTANG_KODE, AKUN_HUTANG_NAMA: AKUN_HUTANG_NAMA
  };
})(window);
