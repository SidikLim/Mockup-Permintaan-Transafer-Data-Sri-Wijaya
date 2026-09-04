/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   uang-muka-store.js - mock data transaksi Uang Muka Supplier 2
   (header transaksi + baris item + info PPN + baris jurnal),
   disimpan di localStorage. Tidak terhubung ke server sungguhan.
   =========================================================== */

(function (global) {
  var STORAGE_KEY = 'srw_mockup_uang_muka_v1';

  // Tabel referensi tipe PPh yang bisa dipilih pada field "Pph Dipotong".
  // rate dalam persen. Dipakai untuk menghitung kolom "PPh" pada Rincian Transaksi.
  var PPH_TYPES = [
    { value: '', label: 'Tidak Ada PPh', rate: 0 },
    { value: 'pph23-jasa', label: 'PPh 23 - Jasa (2%)', rate: 2 },
    { value: 'pph23-sewa', label: 'PPh 23 - Sewa (2%)', rate: 2 },
    { value: 'pph22', label: 'PPh 22 (1.5%)', rate: 1.5 },
    { value: 'pph4a2-final', label: 'PPh 4(2) Final (2%)', rate: 2 },
    { value: 'pph21', label: 'PPh 21 (5%)', rate: 5 }
  ];

  function pphRate(value) {
    var found = PPH_TYPES.filter(function (t) { return t.value === value; })[0];
    return found ? found.rate : 0;
  }

  function emptyItem() {
    return { keterangan: '', qty: 1, jumlah: 0, ppn: true, pph: false };
  }

  function seedData() {
    return [
      {
        no: 'UMS/SC26047548', tglUangMuka: '2026-08-31', supplier: 'PT.ALAM LESTARI UNGGUL', keterangan: '',
        departemen: 'PUSAT', noPO: 'PO2608052/STU/PST', noOtomatis: 'UMS01', noTransaksi: 'UMS/SC26047548',
        tglTrn: '2026-08-31', syaratBayar: 'CASH ON DELIVERY', tglJatuhTempo: '2026-09-01', jurnalAkun: '01 Hutang usaha',
        supplierMataUang: 'IDR', dpTertagihPersen: 100,
        ppnType: 'eksklusif', tglFakturPajak: '2026-08-31', tidakIsiNoFakturPajak: false, noFakturPajak: '',
        pphType: '',
        items: [
          { keterangan: 'ELECTRODE- CAST IRON [4.0MM CIN-1]', qty: 20, jumlah: 11975040, ppn: true, pph: false },
          { keterangan: 'ELECTRODE - CAST IRON [3.2MM CIN-1]', qty: 20, jumlah: 11975040, ppn: true, pph: false },
          { keterangan: 'ELECTRODE - CAST IRON [3.2MM CIN-2]', qty: 20, jumlah: 8428320, ppn: true, pph: false }
        ],
        jurnalMode: 'otomatis',
        jurnalItems: [
          { kodeAkun: '21010100', costCenter: '', namaAkun: 'Hutang Usaha', keterangan: 'Transaksi Uang Muka UMS/SC26047548', debit: 0, kredit: 35940024 },
          { kodeAkun: '11050100', costCenter: '', namaAkun: 'Uang Muka Pembelian', keterangan: 'Transaksi Uang Muka UMS/SC26047548', debit: 32378400, kredit: 0 },
          { kodeAkun: '11070500', costCenter: '', namaAkun: 'Prepaid - PPN', keterangan: 'Transaksi Uang Muka UMS/SC26047548', debit: 3561624, kredit: 0 }
        ]
      },
      makeSimple('UMS/809', '2026-08-27', 'LUCKY LOGAM', 1750000),
      makeSimple('UMS/808', '2026-08-27', 'LUCKY LOGAM', 2340000),
      makeSimple('UMS/1702-2026002152', '2026-08-26', 'PT. ASTRA INTERNATIONAL Tbk - ISUZU', 1500000),
      makeSimple('UMS/SO.260805116', '2026-08-24', 'PT. Paragon Spesial Metal', 4406700),
      makeSimple('UMS/SO.260805113', '2026-08-24', 'PT. Paragon Spesial Metal', 577200),
      makeSimple('UMS/PO2608006/STU/GA-HR', '2026-08-24', 'CV Sumber Mitra', 1098900),
      makeSimple('UMS/BIJ-I-2608062', '2026-08-24', 'PT. BOSINDO JAYA', 8214000),
      makeSimple('UMS/SO.260804979', '2026-08-24', 'PT. Paragon Spesial Metal', 26329200),
      makeSimple('UMS/PO2608042/STU/PST', '2026-08-24', 'CV SINERGI CAHAYA NUSANTARA', 1221000)
    ];
  }

  function makeSimple(no, tgl, supplier, jumlah) {
    return {
      no: no, tglUangMuka: tgl, supplier: supplier, keterangan: '',
      departemen: 'PUSAT', noPO: '', noOtomatis: 'UMS01', noTransaksi: no,
      tglTrn: tgl, syaratBayar: 'CASH ON DELIVERY', tglJatuhTempo: tgl, jurnalAkun: '01 Hutang usaha',
      supplierMataUang: 'IDR', dpTertagihPersen: 100,
      ppnType: 'tidak_ada', tglFakturPajak: '', tidakIsiNoFakturPajak: false, noFakturPajak: '',
      pphType: '',
      items: [
        { keterangan: 'Uang Muka Pembelian - ' + supplier, qty: 1, jumlah: jumlah, ppn: false, pph: false }
      ],
      jurnalMode: 'otomatis',
      jurnalItems: []
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
      console.error('Gagal memuat data uang muka, memakai data awal.', e);
      return seedData();
    }
  }

  function saveAll(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Gagal menyimpan data uang muka.', e);
    }
  }

  function getByNo(no) {
    var list = loadAll();
    for (var i = 0; i < list.length; i++) {
      if (list[i].no === no) return list[i];
    }
    return null;
  }

  function upsert(trx) {
    var list = loadAll();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].no === trx.no) { idx = i; break; }
    }
    if (idx >= 0) list[idx] = trx; else list.push(trx);
    saveAll(list);
    return trx;
  }

  function removeByNo(no) {
    var list = loadAll().filter(function (s) { return s.no !== no; });
    saveAll(list);
  }

  function nextNo() {
    var d = new Date();
    var stamp = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    var rand = String(Math.floor(Math.random() * 900) + 100);
    return 'UMS/SC' + stamp + rand;
  }

  function emptyTransaction() {
    var todayIso = new Date().toISOString().slice(0, 10);
    return {
      no: nextNo(), tglUangMuka: todayIso, supplier: '', keterangan: '',
      departemen: 'PUSAT', noPO: '', noOtomatis: 'UMS01', noTransaksi: nextNo(),
      tglTrn: todayIso, syaratBayar: 'CASH ON DELIVERY', tglJatuhTempo: todayIso, jurnalAkun: '01 Hutang usaha',
      supplierMataUang: 'IDR', dpTertagihPersen: 100,
      ppnType: 'eksklusif', tglFakturPajak: todayIso, tidakIsiNoFakturPajak: false, noFakturPajak: '',
      pphType: '',
      items: [emptyItem()],
      jurnalMode: 'otomatis',
      jurnalItems: []
    };
  }

  global.UangMukaStore = {
    loadAll: loadAll,
    saveAll: saveAll,
    getByNo: getByNo,
    upsert: upsert,
    removeByNo: removeByNo,
    nextNo: nextNo,
    emptyTransaction: emptyTransaction,
    emptyItem: emptyItem,
    PPH_TYPES: PPH_TYPES,
    pphRate: pphRate
  };
})(window);
