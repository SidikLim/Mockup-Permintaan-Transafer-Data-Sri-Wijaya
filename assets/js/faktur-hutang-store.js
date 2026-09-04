/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   faktur-hutang-store.js - mock data Faktur Pembelian (invoice
   hutang ke supplier) yang masih bisa diajukan/dilunasi lewat
   modul Pengajuan Pembayaran & Pelunasan Hutang.

   CATATAN: 7 faktur pertama diadaptasi dari contoh screenshot
   (PT SEKAWAN INTIPERKASA-SIP008) - nomor faktur/invoice & nilai
   dipertahankan. Sisanya adalah data pelengkap yang saya buat
   sendiri supaya daftar Pengajuan Pembayaran & Pembayaran Hutang
   punya cukup baris untuk terasa seperti sistem sungguhan,
   sebagian sengaja dikaitkan ke supplier yang sudah ada di Master
   Vendor (lihat data-store.js) supaya datanya terasa satu sistem.

   "Sisa" (saldo faktur yang belum dibayar) TIDAK disimpan di sini
   - dihitung on-the-fly di form Pengajuan Pembayaran / Pelunasan
   Hutang, sama seperti pola "Sisa Total" pada Pengembalian Kas Bon
   (lihat pengembalian-kasbon-form.js).
   =========================================================== */

(function (global) {
  var STORAGE_KEY = 'srw_mockup_faktur_hutang_v1';

  function f(noFaktur, noInvoice, supplier, dept, noPO, tipeTransaksi, tglFaktur, tglJatuhTempo, crc, total) {
    return {
      noFaktur: noFaktur, noInvoice: noInvoice || '', supplier: supplier, dept: dept || '',
      noPO: noPO || '', tipeTransaksi: tipeTransaksi || 'Beli Kredit',
      tglFaktur: tglFaktur, tglJatuhTempo: tglJatuhTempo, crc: crc || 'IDR', kurs: 1, total: total
    };
  }

  function seedData() {
    return [
      f('PIV-2026080050', 'JKTIR01028727', 'PT BIROTIKA SEMESTA', '', '', 'Beli Kredit', '2026-08-25', '2026-09-24', 'IDR', 1246720),
      f('PIV-2026080048', '872914160', 'PT FEDEX EXPRESS INTERNATIONAL', 'BAK', '', 'Beli Kredit', '2026-08-19', '2026-09-18', 'IDR', 2087917),
      f('PIV-2026080049', '872936443', 'PT FEDEX EXPRESS INTERNATIONAL', 'CDS', '', 'Beli Kredit', '2026-08-26', '2026-09-25', 'IDR', 1427003),
      f('INV-INMSAT26081760', 'SAT26080335', 'PT INDONESIA SATELIT SOLUSI', '', '', 'Beli Kredit', '2026-08-28', '2026-09-02', 'IDR', 6578136.90),
      f('ADV-2026090001', '', 'PT. INTERNUSA BAHTERA', '', 'PO2608/VIII/2026', 'Advance', '2026-09-01', '2026-09-04', 'IDR', 25000000),
      f('1002-80586/1227256/709139', '1227256/709139', 'MITSUI BUSSAN PANA HARRISON PTE LTD', '', '', 'Beli Kredit', '2026-08-20', '2026-09-20', 'USD', 29643.81),
      f('S1228-0083073-000', 'AJU-2026-1431', 'PT. MARSH INSURANCE BROKERS INDONESIA', '', '', 'Beli Kredit', '2026-08-06', '2026-09-06', 'USD', 57712.50),

      f('SIP.AUG.2026-28', '28', "RUMAH BUMBU BY DEBS' CATERING", '', '', 'Beli Kredit', '2026-08-15', '2026-09-02', 'IDR', 2000000),
      f('SIP.AUG.2026-29', '29', "RUMAH BUMBU BY DEBS' CATERING", '', '', 'Beli Kredit', '2026-08-20', '2026-09-02', 'IDR', 1780000),
      f('580.INV.QP.FJN.VIII.26', '', 'PT FAJAR JASA NUSANTARA', '', '', 'Beli Kredit', '2026-08-10', '2026-09-02', 'IDR', 1675000),
      f('DISB.MV.CERDAS.V297', '', 'FREIGHTPLAN (PVT) LTD', '', '', 'Beli Kredit', '2026-08-05', '2026-09-01', 'USD', 1291.00),
      f('PO.00335,00680,00679', '', 'MYEONG SEONG INDUSTRIES CO., LTD', '', 'PO.00335,00680,00679', 'Beli Kredit', '2026-07-20', '2026-09-01', 'USD', 4500.00),
      f('PO.00695,00696,00833', '', 'MYEONG SEONG INDUSTRIES CO., LTD', '', 'PO.00695,00696,00833', 'Beli Kredit', '2026-07-25', '2026-09-01', 'USD', 4439.00),
      f('DISB.MV.CERDAS.V398', '', 'PT. BARRA ASEAN SHIPPING', '', '', 'Beli Kredit', '2026-08-12', '2026-09-01', 'IDR', 42884701.93),
      f('WO.00132', '', 'MANDIRI SENTOSA / YULIANTO', '', 'WO.00132', 'Beli Kredit', '2026-08-01', '2026-09-01', 'IDR', 59948750),
      f('WO.00106', '', 'PT JASON ELEKTRONIKA', '', 'WO.00106', 'Beli Kredit', '2026-08-05', '2026-09-01', 'IDR', 10000000),
      f('WO.00117', '', 'PT JASON ELEKTRONIKA', '', 'WO.00117', 'Beli Kredit', '2026-08-10', '2026-09-01', 'IDR', 8816000),
      f('WO.00085', '', 'PT USAHA PRATAMA SEJAHTERA', '', 'WO.00085', 'Beli Kredit', '2026-08-01', '2026-09-01', 'IDR', 15135000),
      f('WO.00086', '', 'PT USAHA PRATAMA SEJAHTERA', '', 'WO.00086', 'Beli Kredit', '2026-08-05', '2026-09-01', 'IDR', 15000000),

      // Baris tambahan (di luar screenshot) - dikaitkan ke supplier Master Vendor
      // yang sudah ada di data-store.js supaya modul Kas/Bank ini terasa satu
      // sistem dengan modul Supplier & Pembelian.
      f('INV-AGV-0912', '', 'Agave Primatama', '', '', 'Beli Kredit', '2026-08-01', '2026-08-31', 'IDR', 11872782),
      f('INV-IGB-0745', '', 'INTI GLOBAL BERSAMA TEKNIK', '', '', 'Beli Kredit', '2026-07-15', '2026-08-25', 'IDR', 58400000),
      f('INV-APK-0231', '', 'PT. Angsa Putih Kurnia Kharisma', '', '', 'Beli Kredit', '2026-08-10', '2026-09-05', 'IDR', 3250000)
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
      console.error('Gagal memuat data Faktur Hutang, memakai data awal.', e);
      return seedData();
    }
  }

  function saveAll(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { console.error('Gagal menyimpan data Faktur Hutang.', e); }
  }

  function getByNoFaktur(no) {
    var list = loadAll();
    for (var i = 0; i < list.length; i++) if (list[i].noFaktur === no) return list[i];
    return null;
  }

  function upsert(fk) {
    var list = loadAll();
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].noFaktur === fk.noFaktur) { idx = i; break; }
    if (idx >= 0) list[idx] = fk; else list.push(fk);
    saveAll(list);
    return fk;
  }

  function removeByNoFaktur(no) {
    saveAll(loadAll().filter(function (x) { return x.noFaktur !== no; }));
  }

  function listBySupplier(supplier) {
    return loadAll().filter(function (x) { return x.supplier === supplier; });
  }

  function listSuppliers() {
    var seen = {}; var out = [];
    loadAll().forEach(function (x) {
      if (!seen[x.supplier]) { seen[x.supplier] = true; out.push(x.supplier); }
    });
    return out;
  }

  global.FakturHutangStore = {
    loadAll: loadAll, saveAll: saveAll, getByNoFaktur: getByNoFaktur, upsert: upsert,
    removeByNoFaktur: removeByNoFaktur, listBySupplier: listBySupplier, listSuppliers: listSuppliers
  };
})(window);
