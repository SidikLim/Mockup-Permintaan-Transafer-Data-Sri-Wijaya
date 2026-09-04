/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   data-store.js - mock data supplier (termasuk rekening bank)
   Disimpan di localStorage browser supaya perubahan tetap ada
   saat berpindah antar halaman (list <-> form). Tidak terhubung
   ke server / database sungguhan - murni untuk kebutuhan mockup.
   =========================================================== */

(function (global) {
  var STORAGE_KEY = 'srw_mockup_suppliers_v1';

  function seedData() {
    return [
      {
        kode: 'SP-00306', prefix: '000SP', mataUang: 'IDR',
        nama: 'CV BANUA PARAHYANGAN BERSAMA', wilayah: 'SANGATTA UTARA', supplierGroup: '',
        telepon: '', fax: '', email: '', kontakPerson: '', status: 'Aktif',
        syaratBayar: 'Kredit 30 Hari', npwp: '', batasKredit: 0, ppnTipe: 'PPN Eksklusif',
        provinsi: 'Kalimantan Timur', kabupatenKota: 'Kutai Timur', kecamatan: '', kelurahan: '',
        alamat: 'JL AW SYAHRANIE RT 021, SANGATTA UTARA, KAB KUTAI TIMUR, KALIMANTAN TIMUR',
        akunGlUtang: '', akunUangMuka: '',
        uangMuka: 0, saldoUtang: 0,
        rekeningBank: []
      },
      {
        kode: 'SP-00357', prefix: '000SP', mataUang: 'IDR',
        nama: 'UD. CAKRAWALA AC MOBIL', wilayah: 'SANGATTA UTARA', supplierGroup: '',
        telepon: '', fax: '', email: '', kontakPerson: '', status: 'Aktif',
        syaratBayar: 'Kredit 30 Hari', npwp: '', batasKredit: 0, ppnTipe: 'PPN Eksklusif',
        provinsi: 'Kalimantan Timur', kabupatenKota: 'Kutai Timur', kecamatan: '', kelurahan: '',
        alamat: 'JL SOEKARNO HATTA NO.18 G RT.026 SINGA GEMBARA, SANGATTA UTARA KAB. KUTAI TIMUR KALIMANTAN TIMUR',
        akunGlUtang: '', akunUangMuka: '',
        uangMuka: 0, saldoUtang: 0,
        rekeningBank: [
          { bank: 'BCA', cabang: 'Sangatta', noRekening: '1234567890', namaRekening: 'CAKRAWALA AC MOBIL' }
        ]
      },
      {
        kode: 'SP-00366', prefix: 'VN01', mataUang: 'IDR',
        nama: 'INTI GLOBAL BERSAMA TEKNIK', wilayah: 'SANGATTA', supplierGroup: '',
        telepon: '0823 5789 0888', fax: '', email: '', kontakPerson: 'HENRY A', status: 'Aktif',
        syaratBayar: 'Kredit 30 Hari', npwp: '0861370906724000', batasKredit: 0, ppnTipe: 'PPN Eksklusif',
        provinsi: '', kabupatenKota: '', kecamatan: '', kelurahan: '',
        alamat: 'JL. MUNTHE NO.H 435 RT.054 RW.000, SWARGA BARA, SANGATTA UTARA, KAB. KUTAI TIMUR, KALIMANTAN TIMUR',
        akunGlUtang: '', akunUangMuka: '',
        uangMuka: 0, saldoUtang: 116800000,
        rekeningBank: [
          { bank: 'Bank Mandiri', cabang: 'Sangatta', noRekening: '1450012345678', namaRekening: 'INTI GLOBAL BERSAMA TEKNIK' },
          { bank: 'BRI', cabang: 'Kutai Timur', noRekening: '0098765432109', namaRekening: 'INTI GLOBAL BERSAMA TEKNIK' }
        ]
      },
      {
        kode: 'SP-00160', prefix: 'BDGSP', mataUang: 'IDR',
        nama: 'Agave Primatama', wilayah: 'BANDUNG', supplierGroup: '',
        telepon: '', fax: '', email: '', kontakPerson: '', status: 'Aktif',
        syaratBayar: 'Kredit 30 Hari', npwp: '', batasKredit: 0, ppnTipe: 'PPN Eksklusif',
        provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: '', kelurahan: '',
        alamat: 'Metro Trade Centre 11-15 Jl. Soekarno Hatta 590 Rt. 004 Rw. 011, Sekejati, Buahbatu, Kota Bandung, Jawa Barat, 40286',
        akunGlUtang: '', akunUangMuka: '',
        uangMuka: 0, saldoUtang: 11872782,
        rekeningBank: [
          { bank: 'BCA', cabang: 'Buahbatu', noRekening: '5556667778', namaRekening: 'AGAVE PRIMATAMA' }
        ]
      },
      {
        kode: 'SP-00187', prefix: 'BDGSP', mataUang: 'IDR',
        nama: 'PT. Angsa Putih Kurnia Kharisma', wilayah: 'BANDUNG', supplierGroup: '',
        telepon: '', fax: '', email: '', kontakPerson: '', status: 'Aktif',
        syaratBayar: 'Kredit 30 Hari', npwp: '', batasKredit: 0, ppnTipe: 'PPN Eksklusif',
        provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: '', kelurahan: '',
        alamat: 'JL. RUKO TAMAN KOPO INDAH III BLOK F3 NO. 31 BANDUNG 40218',
        akunGlUtang: '', akunUangMuka: '',
        uangMuka: 0, saldoUtang: 0,
        rekeningBank: []
      },
      {
        kode: 'SP-00334', prefix: 'BDGSP', mataUang: 'IDR',
        nama: 'LABORATORIUM LOGAM', wilayah: 'BANDUNG', supplierGroup: '',
        telepon: '', fax: '', email: '', kontakPerson: '', status: 'Aktif',
        syaratBayar: 'Kredit 30 Hari', npwp: '', batasKredit: 0, ppnTipe: 'PPN Eksklusif',
        provinsi: 'Jawa Barat', kabupatenKota: 'Kota Bandung', kecamatan: '', kelurahan: '',
        alamat: 'Jl. Terusan Gatot subroto, Sukapura, Kiaracondong, kota Bandung',
        akunGlUtang: '', akunUangMuka: '',
        uangMuka: 0, saldoUtang: 0,
        rekeningBank: []
      },
      {
        kode: 'SP-00047', prefix: 'BGLSP', mataUang: 'IDR',
        nama: 'Lipi Motor Bengalon', wilayah: 'KUTAI TIMUR', supplierGroup: '',
        telepon: '', fax: '', email: '', kontakPerson: '', status: 'Aktif',
        syaratBayar: 'Kredit 30 Hari', npwp: '', batasKredit: 0, ppnTipe: 'PPN Eksklusif',
        provinsi: 'Kalimantan Timur', kabupatenKota: 'Kutai Timur', kecamatan: 'Bengalon', kelurahan: '',
        alamat: 'Sepaso, Kec. Bengalon, Kabupaten Kutai Timur',
        akunGlUtang: '', akunUangMuka: '',
        uangMuka: 0, saldoUtang: 0,
        rekeningBank: []
      },
      {
        kode: 'SP-00059', prefix: 'BGLSP', mataUang: 'IDR',
        nama: 'Pak Bastian', wilayah: 'KUTAI TIMUR', supplierGroup: '',
        telepon: '', fax: '', email: '', kontakPerson: '', status: 'Aktif',
        syaratBayar: 'Kredit 30 Hari', npwp: '', batasKredit: 0, ppnTipe: 'PPN Eksklusif',
        provinsi: 'Kalimantan Timur', kabupatenKota: 'Kutai Timur', kecamatan: 'Bengalon', kelurahan: '',
        alamat: 'Sekerat, Kec. Bengalon, Kabupaten Kutai Timur, Kalimantan Timur 75618',
        akunGlUtang: '', akunUangMuka: '',
        uangMuka: 0, saldoUtang: 0,
        rekeningBank: []
      },
      {
        kode: 'SP-00163', prefix: 'BGLSP', mataUang: 'IDR',
        nama: 'CV. Agus Jaya', wilayah: 'KUTAI TIMUR', supplierGroup: '',
        telepon: '', fax: '', email: '', kontakPerson: '', status: 'Aktif',
        syaratBayar: 'Kredit 30 Hari', npwp: '', batasKredit: 0, ppnTipe: 'PPN Eksklusif',
        provinsi: 'Kalimantan Timur', kabupatenKota: 'Kutai Timur', kecamatan: '', kelurahan: '',
        alamat: 'Kutai Timur Sangatta',
        akunGlUtang: '', akunUangMuka: '',
        uangMuka: 0, saldoUtang: 0,
        rekeningBank: []
      },
      {
        kode: 'SP-00166', prefix: 'BGLSP', mataUang: 'IDR',
        nama: 'CV.BINTANG JAYA', wilayah: 'KUTAI TIMUR', supplierGroup: '',
        telepon: '', fax: '', email: '', kontakPerson: '', status: 'Aktif',
        syaratBayar: 'Kredit 30 Hari', npwp: '', batasKredit: 0, ppnTipe: 'PPN Eksklusif',
        provinsi: 'Kalimantan Timur', kabupatenKota: 'Kutai Timur', kecamatan: '', kelurahan: '',
        alamat: 'SANGATTA KUTAI TIMUR',
        akunGlUtang: '', akunUangMuka: '',
        uangMuka: 0, saldoUtang: 0,
        rekeningBank: []
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
      console.error('Gagal memuat data supplier dari localStorage, memakai data awal.', e);
      return seedData();
    }
  }

  function saveAll(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Gagal menyimpan data supplier.', e);
    }
  }

  function getByKode(kode) {
    var list = loadAll();
    for (var i = 0; i < list.length; i++) {
      if (list[i].kode === kode) return list[i];
    }
    return null;
  }

  function upsert(supplier) {
    var list = loadAll();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].kode === supplier.kode) { idx = i; break; }
    }
    if (idx >= 0) list[idx] = supplier; else list.push(supplier);
    saveAll(list);
    return supplier;
  }

  function removeByKode(kode) {
    var list = loadAll().filter(function (s) { return s.kode !== kode; });
    saveAll(list);
  }

  function nextKode() {
    var list = loadAll();
    var max = 0;
    list.forEach(function (s) {
      var m = /SP-(\d+)/.exec(s.kode || '');
      if (m) {
        var n = parseInt(m[1], 10);
        if (n > max) max = n;
      }
    });
    return 'SP-' + String(max + 1).padStart(5, '0');
  }

  function resetToSeed() {
    var seeded = seedData();
    saveAll(seeded);
    return seeded;
  }

  function emptySupplier() {
    return {
      kode: nextKode(), prefix: '000SP', mataUang: 'IDR',
      nama: '', wilayah: '', supplierGroup: '',
      telepon: '', fax: '', email: '', kontakPerson: '', status: 'Aktif',
      syaratBayar: 'Kredit 30 Hari', npwp: '', batasKredit: 0, ppnTipe: 'PPN Eksklusif',
      provinsi: '', kabupatenKota: '', kecamatan: '', kelurahan: '', alamat: '',
      akunGlUtang: '', akunUangMuka: '',
      uangMuka: 0, saldoUtang: 0,
      rekeningBank: []
    };
  }

  global.SupplierStore = {
    loadAll: loadAll,
    saveAll: saveAll,
    getByKode: getByKode,
    upsert: upsert,
    removeByKode: removeByKode,
    nextKode: nextKode,
    resetToSeed: resetToSeed,
    emptySupplier: emptySupplier
  };
})(window);
