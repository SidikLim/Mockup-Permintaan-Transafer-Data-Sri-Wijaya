/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   pengajuan-pembayaran-store.js - mock data "Pengajuan
   Pembayaran" (permintaan pembayaran hutang supplier yang perlu
   di-approve sebelum dieksekusi sebagai Pelunasan Hutang
   sungguhan pada modul "Pelunasan Hutang").

   CATATAN: 6 baris pertama diadaptasi dari contoh screenshot
   (PT SEKAWAN INTIPERKASA-SIP008) - nomor transaksi, keterangan,
   dan total dipertahankan; kode akun Bank Payment memakai master
   Kas/Bank Sri Wijaya sendiri (lihat kasbank-store.js), bukan kode
   dari perusahaan sumber. Alur approval sungguhan (siapa yang
   boleh approve, notifikasi) berada di luar cakupan mockup ini -
   status & Approve By pada data contoh hanya untuk visual.
   =========================================================== */

(function (global) {
  var STORAGE_KEY = 'srw_mockup_pengajuan_pembayaran_v1';

  // Rekening bank supplier (untuk tabel "Account Bank Supplier" pada form).
  // Memakai skema field YANG SAMA dengan "Informasi Rekening Bank" pada
  // Master Supplier (bank/cabang/noRekening/namaRekening - lihat
  // data-store.js & pages/master-vendor/supplier-form.html) supaya
  // keduanya konsisten satu sistem. PT BIROTIKA SEMESTA memakai data
  // persis dari screenshot; supplier lain adalah data pelengkap yang
  // plausible untuk kebutuhan mockup.
  var SUPPLIER_BANK_ACCOUNTS = {
    'PT BIROTIKA SEMESTA': [{ bank: 'CITIBANK NA', cabang: 'JAKARTA', noRekening: '78902978026903', namaRekening: 'PT BIROTIKA SEMESTA' }],
    'PT FEDEX EXPRESS INTERNATIONAL': [{ bank: 'BANK MANDIRI', cabang: 'JAKARTA', noRekening: '2019283746', namaRekening: 'PT FEDEX EXPRESS INTERNATIONAL' }],
    'PT INDONESIA SATELIT SOLUSI': [{ bank: 'BCA', cabang: 'JAKARTA', noRekening: '1234509876', namaRekening: 'PT INDONESIA SATELIT SOLUSI' }],
    'PT. INTERNUSA BAHTERA': [{ bank: 'BANK MANDIRI', cabang: 'JAKARTA', noRekening: '5566778899', namaRekening: 'PT. INTERNUSA BAHTERA' }],
    'MITSUI BUSSAN PANA HARRISON PTE LTD': [{ bank: 'DBS BANK', cabang: 'SINGAPORE', noRekening: 'SG-004829173', namaRekening: 'MITSUI BUSSAN PANA HARRISON PTE LTD' }],
    'PT. MARSH INSURANCE BROKERS INDONESIA': [{ bank: 'BANK MANDIRI', cabang: 'JAKARTA', noRekening: '8871122334', namaRekening: 'PT. MARSH INSURANCE BROKERS INDONESIA' }],
    "RUMAH BUMBU BY DEBS' CATERING": [{ bank: 'BCA', cabang: 'TANGERANG', noRekening: '0091827364', namaRekening: "RUMAH BUMBU BY DEBS' CATERING" }],
    'PT FAJAR JASA NUSANTARA': [{ bank: 'BANK MANDIRI', cabang: 'JAKARTA', noRekening: '3344556677', namaRekening: 'PT FAJAR JASA NUSANTARA' }],
    'FREIGHTPLAN (PVT) LTD': [{ bank: 'HABIB BANK', cabang: 'KARACHI', noRekening: 'PK-77281940', namaRekening: 'FREIGHTPLAN (PVT) LTD' }],
    'MYEONG SEONG INDUSTRIES CO., LTD': [{ bank: 'KEB HANA BANK', cabang: 'SEOUL', noRekening: 'KR-88291002', namaRekening: 'MYEONG SEONG INDUSTRIES CO., LTD' }],
    'PT. BARRA ASEAN SHIPPING': [{ bank: 'BCA', cabang: 'JAKARTA', noRekening: '1122998877', namaRekening: 'PT. BARRA ASEAN SHIPPING' }],
    'MANDIRI SENTOSA / YULIANTO': [{ bank: 'BCA', cabang: 'SANGATTA', noRekening: '6677889900', namaRekening: 'MANDIRI SENTOSA / YULIANTO' }],
    'PT JASON ELEKTRONIKA': [{ bank: 'BCA', cabang: 'JAKARTA', noRekening: '2233445566', namaRekening: 'PT JASON ELEKTRONIKA' }],
    'PT USAHA PRATAMA SEJAHTERA': [{ bank: 'BANK MANDIRI', cabang: 'JAKARTA', noRekening: '7788990011', namaRekening: 'PT USAHA PRATAMA SEJAHTERA' }]
  };

  // Untuk supplier yang sudah ada di Master Vendor (data-store.js / SupplierStore),
  // pakai rekening bank yang sudah tercatat di sana supaya datanya konsisten
  // satu sistem, alih-alih menduplikasi data rekening baru. Skema field-nya
  // sudah sama (bank/cabang/noRekening/namaRekening) jadi tidak perlu di-remap.
  function getSupplierBankAccounts(supplierName) {
    if (SUPPLIER_BANK_ACCOUNTS[supplierName]) return SUPPLIER_BANK_ACCOUNTS[supplierName];
    if (window.SupplierStore) {
      var s = SupplierStore.loadAll().filter(function (x) { return x.nama === supplierName; })[0];
      if (s && s.rekeningBank && s.rekeningBank.length) return s.rekeningBank;
    }
    return [];
  }

  function seedData() {
    return [
      {
        no: 'PYR-2026090002', noOtomatis: 'PYR01', metodePayment: 'Transfer', proyek: '',
        supplier: 'PT BIROTIKA SEMESTA', tglTrn: '2026-09-02', tglJatuhTempo: '2026-09-24',
        bankPayment: 'Bank Mandiri - HO', accountBankSupplierIdx: 0,
        keterangan: 'PT BIROTIKA SEMESTA | Due 24-09-2026 JKTIR01028727 | DPP Rp 1.258.043 | PPN Rp 13.838 | PPh 23 = Rp 25.161 |\nTOTAL Rp 1.246.720\nhttps://nas.indobaruna.com/drive/d/f/19iYOY8ti5GAlOPBwH2IrVnvURHUyVQe',
        rincianFaktur: [{ noFaktur: 'PIV-2026080050', checked: true, pembayaran: 1246720, komponen: '' }],
        requestBy: 'tina', approveBy: ['bondan', 'tekun'], status: 'Paid',
        activityLog: [
          { action: 'Created By', user: 'tina', at: '2026-09-02T09:05:12' },
          { action: 'Approved By', user: 'tekun', at: '2026-09-02T10:30:40' },
          { action: 'Approved By', user: 'bondan', at: '2026-09-02T11:02:18' },
          { action: 'Dibayar Oleh', user: 'tina', at: '2026-09-02T14:20:00' }
        ]
      },
      {
        no: 'PYR-2026090006', noOtomatis: 'PYR01', metodePayment: 'Transfer', proyek: '',
        supplier: 'PT FEDEX EXPRESS INTERNATIONAL', tglTrn: '2026-09-01', tglJatuhTempo: '2026-09-25',
        bankPayment: 'Bank Mandiri - HO', accountBankSupplierIdx: 0,
        keterangan: 'PT FEDEX EXPRESS INTERNATIONAL | Due 25-09-2026 872914160 | DPP Rp 2.106.879 | PPN Rp 23.176 | PPh 23 = Rp 42.138 |\nTOTAL Rp 2.087.917\n872936443 | DPP Rp 1.439.962 | PPN Rp 15.840 | PPh 23 = Rp 28.799 | TOTAL Rp 1.427.003',
        rincianFaktur: [
          { noFaktur: 'PIV-2026080048', checked: true, pembayaran: 2087917, komponen: '' },
          { noFaktur: 'PIV-2026080049', checked: true, pembayaran: 1427003, komponen: '' }
        ],
        requestBy: 'tina', approveBy: ['bondan', 'tekun'], status: 'Paid',
        activityLog: [
          { action: 'Created By', user: 'tina', at: '2026-09-01T09:40:05' },
          { action: 'Approved By', user: 'tekun', at: '2026-09-01T13:15:22' },
          { action: 'Approved By', user: 'bondan', at: '2026-09-01T15:48:09' },
          { action: 'Dibayar Oleh', user: 'tina', at: '2026-09-02T09:10:00' }
        ]
      },
      {
        no: 'PYR-2026090005', noOtomatis: 'PYR01', metodePayment: 'Transfer', proyek: '',
        supplier: 'PT INDONESIA SATELIT SOLUSI', tglTrn: '2026-09-01', tglJatuhTempo: '2026-09-02',
        bankPayment: 'Bank BCA - HO', accountBankSupplierIdx: 0,
        keterangan: 'PT INDONESIA SATELIT SOLUSI | Due 02-09-2026 INMSAT26081760 | DPP Rp 6.210.291 | TOTAL Rp 6.210.291\nSAT26080335 | DPP Rp 367.846 | TOTAL Rp 367.846',
        rincianFaktur: [{ noFaktur: 'INV-INMSAT26081760', checked: true, pembayaran: 6578136.90, komponen: '' }],
        requestBy: 'tina', approveBy: ['bondan', 'tekun'], status: 'Approved',
        activityLog: [
          { action: 'Created By', user: 'tina', at: '2026-09-01T08:30:00' },
          { action: 'Approved By', user: 'tekun', at: '2026-09-01T11:05:44' },
          { action: 'Approved By', user: 'bondan', at: '2026-09-01T14:00:31' }
        ]
      },
      {
        no: 'PYR-ADV-2026090001', noOtomatis: 'PYR-ADV', metodePayment: 'Transfer', proyek: 'MV.CERDAS V.399',
        supplier: 'PT. INTERNUSA BAHTERA', tglTrn: '2026-09-01', tglJatuhTempo: '2026-09-04',
        bankPayment: 'Bank Mandiri - HO', accountBankSupplierIdx: 0,
        keterangan: 'PT. INTERNUSA BAHTERA | Due 04-09-2026 VIII/2026 | DPP Rp 0 | TOTAL Rp 25.000.000\nADVANCE DISB MV.CERDAS V.399',
        rincianFaktur: [{ noFaktur: 'ADV-2026090001', checked: true, pembayaran: 25000000, komponen: '' }],
        requestBy: 'christovani', approveBy: ['bondan', 'tekun'], status: 'Approved',
        activityLog: [
          { action: 'Created By', user: 'christovani', at: '2026-09-01T08:00:00' },
          { action: 'Approved By', user: 'tekun', at: '2026-09-01T10:12:09' },
          { action: 'Approved By', user: 'bondan', at: '2026-09-01T10:40:57' }
        ]
      },
      {
        no: 'PYR-2026090004', noOtomatis: 'PYR01', metodePayment: 'Transfer', proyek: '',
        supplier: 'MITSUI BUSSAN PANA HARRISON PTE LTD', tglTrn: '2026-09-01', tglJatuhTempo: '2026-09-20',
        bankPayment: 'Bank BCA - HO', accountBankSupplierIdx: 0,
        keterangan: 'MITSUI BUSSAN PANA HARRISON PTE LTD | Due 20-09-2026\n1002/80586/1227256/709139/LCC-P&I/1 | DPP US$51.439,65 | TOTAL US$12.859,91\n1002/80586/1227256/709139/P&I-LCC/1 | DPP US$73.376,43 | TOTAL US$18.344,11',
        rincianFaktur: [{ noFaktur: '1002-80586/1227256/709139', checked: true, pembayaran: 29643.81, komponen: '' }],
        requestBy: 'tina', approveBy: ['bondan', 'tekun'], status: 'Approved',
        activityLog: [
          { action: 'Created By', user: 'tina', at: '2026-09-01T09:00:00' },
          { action: 'Approved By', user: 'tekun', at: '2026-09-01T12:20:15' },
          { action: 'Approved By', user: 'bondan', at: '2026-09-01T13:05:47' }
        ]
      },
      {
        no: 'PYR-2026090001', noOtomatis: 'PYR01', metodePayment: 'Transfer', proyek: '',
        supplier: 'PT. MARSH INSURANCE BROKERS INDONESIA', tglTrn: '2026-09-01', tglJatuhTempo: '2026-09-06',
        bankPayment: 'Bank BCA - HO', accountBankSupplierIdx: 0,
        keterangan: 'PT. MARSH INSURANCE BROKERS INDONESIA | Due 06-09-2026 S1228-0083073-000 | DPP US$230.853,50 | TOTAL US$173.137,50\nAJU-2026-1431 - INSTALLMENT 2 OF 4 - B.ASURANSI MV.CEPAT - MARINE WAR RISK - PER 6 JUNI 2026 S/D 6 JUNI 2027',
        rincianFaktur: [{ noFaktur: 'S1228-0083073-000', checked: true, pembayaran: 57712.50, komponen: '' }],
        requestBy: 'tina', approveBy: ['bondan', 'tekun'], status: 'Approved',
        activityLog: [
          { action: 'Created By', user: 'tina', at: '2026-09-01T07:45:00' },
          { action: 'Approved By', user: 'tekun', at: '2026-09-01T09:55:30' },
          { action: 'Approved By', user: 'bondan', at: '2026-09-01T10:22:12' }
        ]
      }
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
      console.error('Gagal memuat data Pengajuan Pembayaran, memakai data awal.', e);
      return seedData();
    }
  }

  function saveAll(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { console.error('Gagal menyimpan data Pengajuan Pembayaran.', e); }
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

  function nextNo(noOtomatis) {
    var prefix = noOtomatis === 'PYR-ADV' ? 'PYR-ADV-' : 'PYR-';
    var d = new Date();
    var yyyymm = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0');
    var full = prefix + yyyymm;
    var list = loadAll();
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
    return (trx.rincianFaktur || []).reduce(function (s, r) {
      return s + (r.checked ? (Number(r.pembayaran) || 0) : 0);
    }, 0);
  }

  function crcOf(trx) {
    var first = (trx.rincianFaktur || [])[0];
    if (!first || !window.FakturHutangStore) return 'IDR';
    var fk = FakturHutangStore.getByNoFaktur(first.noFaktur);
    return (fk && fk.crc) || 'IDR';
  }

  function emptyTransaction() {
    var todayIso = new Date().toISOString().slice(0, 10);
    return {
      no: nextNo('PYR01'), noOtomatis: 'PYR01', metodePayment: 'Transfer', proyek: '',
      supplier: '', tglTrn: todayIso, tglJatuhTempo: todayIso,
      bankPayment: '', accountBankSupplierIdx: 0, keterangan: '',
      rincianFaktur: [], requestBy: 'mas', approveBy: [], status: 'Pending', activityLog: []
    };
  }

  global.PengajuanPembayaranStore = {
    loadAll: loadAll, saveAll: saveAll, getByNo: getByNo, upsert: upsert, removeByNo: removeByNo,
    nextNo: nextNo, totalOf: totalOf, crcOf: crcOf, emptyTransaction: emptyTransaction,
    getSupplierBankAccounts: getSupplierBankAccounts
  };
})(window);
