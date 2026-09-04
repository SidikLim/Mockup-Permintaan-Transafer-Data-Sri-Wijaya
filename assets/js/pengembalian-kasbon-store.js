/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   pengembalian-kasbon-store.js - mock data transaksi Pengembalian
   Kas Bon Karyawan ("+ Penerimaan Piutang"), disimpan di
   localStorage. Setiap transaksi bisa membayar (sebagian atau
   penuh) satu atau lebih transaksi Kas Bon (KasbonStore) milik
   karyawan yang sama - lihat rincianPiutang[].

   CATATAN ASUMSI (mockup): pada layar aslinya kolom "Nominal IDR"
   di daftar tampak selalu 0,00 pada contoh screenshot - ini
   diperlakukan sebagai kemungkinan bug tampilan pada versi yang
   di-screenshot, sehingga pada mockup ini kolom tsb dihitung dari
   total baris "Terima Pengembalian BS" (rincianPiutang) yang
   sesungguhnya, supaya datanya bermakna. Silakan koreksi jika
   perilaku aslinya memang harus 0,00 statis.

   "Sisa Total" piutang suatu transaksi Kas Bon dihitung sebagai:
     jumlah Kas Bon - total seluruh Terima Pengembalian yang sudah
     tercatat pada transaksi Pengembalian Kas Bon lain (tidak
     termasuk transaksi yang sedang diedit).
   =========================================================== */

(function (global) {
  var STORAGE_KEY = 'srw_mockup_pengembalian_kasbon_v1';

  var KAS_BANK_KODE = {
    'Kas Kecil - HO': '11010120',
    'Bank Mandiri - HO': '11020110',
    'Bank BCA - HO': '11020130'
  };
  var AKUN_PIUTANG_KARYAWAN = '11030300';
  var NAMA_PIUTANG_KARYAWAN = 'Piutang Karyawan';

  function makeRow(no, karyawan, tgl, kasbonNo, jumlahDibayar, kasBankAkun) {
    var ket = 'PENGEMBALIAN KAS BON ' + karyawan + ' TGL ' + formatTgl(tgl);
    var kasBankKode = KAS_BANK_KODE[kasBankAkun] || KAS_BANK_KODE['Kas Kecil - HO'];
    return {
      no: no, caNumber: '', departemen: 'GA-HR', proyek: '',
      karyawan: karyawan, tglTrn: tgl, keterangan: ket,
      bankRows: [
        {
          akunBank: kasBankAkun, namaBank: kasBankAkun, kurs: 1, kursIdr: 1, kursTargetIdr: 1,
          tipeTransaksi: 'Penerimaan', jurnal: kasBankAkun, keterangan: 'Penerimaan pengembalian kas bon',
          jumlahDibayar: jumlahDibayar
        }
      ],
      rincianPiutang: [
        { kasbonNo: kasbonNo, bayar: true, terimaPengembalian: jumlahDibayar }
      ],
      jurnalMode: 'otomatis',
      jurnalItems: [
        { kodeAkun: kasBankKode, costCenter: '', namaAkun: kasBankAkun, keterangan: ket, komponen: '', debit: jumlahDibayar, kredit: 0 },
        { kodeAkun: AKUN_PIUTANG_KARYAWAN, costCenter: '', namaAkun: NAMA_PIUTANG_KARYAWAN, keterangan: ket, komponen: '', debit: 0, kredit: jumlahDibayar }
      ],
      overrideTidakSama: false
    };
  }

  function formatTgl(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p.length === 3 ? (p[2] + '/' + p[1] + '/' + p[0]) : iso;
  }

  function seedData() {
    return [
      makeRow('PPK/STU/26/0063', 'ASMUNI', '2026-08-31', 'EMT/STU/08/26/001', 1500000, 'Kas Kecil - HO'),
      makeRow('PPK/STU/26/0062', 'ARIMA WORYANI', '2026-08-15', 'EMT/STU/07/26/003', 750000, 'Kas Kecil - HO'),
      makeRow('PPK/STU/26/0061', 'MAMAN SUHERMAN', '2026-08-10', 'EMT/STU/07/26/001', 2500000, 'Bank Mandiri - HO'),
      makeRow('PPK/STU/26/0060', 'HAERUNISA SAFITRI', '2026-08-05', 'EMT/STU/06/26/003', 2000000, 'Bank Mandiri - HO'),
      makeRow('PPK/STU/26/0059', 'ASMUNI', '2026-07-25', 'EMT/STU/07/26/002', 350000, 'Kas Kecil - HO'),
      makeRow('PPK/STU/26/0058', 'KORLIANUS TANGDIALLA', '2026-07-20', 'EMT/STU/06/26/001', 1836225, 'Kas Kecil - HO'),
      makeRow('PPK/STU/26/0057', 'APRIANI HASTANTI', '2026-07-10', 'EMT/STU/04/26/002', 5000000, 'Bank Mandiri - HO'),
      makeRow('PPK/STU/26/0056', 'EFENDI', '2026-06-28', 'EMT/STU/04/26/005', 2500000, 'Bank Mandiri - HO'),
      makeRow('PPK/STU/26/0055', 'HASYADI RAJAB', '2026-06-20', 'EMT/STU/04/26/004', 1500000, 'Bank Mandiri - HO'),
      makeRow('PPK/STU/26/0054', 'SLAMET BASUNI', '2026-06-15', 'EMT/STU/04/26/003', 2000000, 'Bank Mandiri - HO')
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
      console.error('Gagal memuat data pengembalian kas bon, memakai data awal.', e);
      return seedData();
    }
  }

  function saveAll(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { console.error('Gagal menyimpan data pengembalian kas bon.', e); }
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
    var tahun = String(d.getFullYear()).slice(2);
    var list = loadAll();
    var prefix = 'PPK/STU/' + tahun + '/';
    var max = 0;
    list.forEach(function (t) {
      if (t.no.indexOf(prefix) === 0) {
        var n = parseInt(t.no.slice(prefix.length), 10);
        if (!isNaN(n) && n > max) max = n;
      }
    });
    return prefix + String(max + 1).padStart(4, '0');
  }

  function emptyTransaction() {
    var todayIso = new Date().toISOString().slice(0, 10);
    return {
      no: nextNo(), caNumber: '', departemen: 'GA-HR', proyek: '',
      karyawan: '', tglTrn: todayIso, keterangan: '',
      bankRows: [{ akunBank: 'Kas Kecil - HO', namaBank: 'Kas Kecil - HO', kurs: 1, kursIdr: 1, kursTargetIdr: 1, tipeTransaksi: 'Penerimaan', jurnal: 'Kas Kecil - HO', keterangan: '', jumlahDibayar: 0 }],
      rincianPiutang: [],
      jurnalMode: 'otomatis',
      jurnalItems: [],
      overrideTidakSama: false
    };
  }

  // Total Nominal IDR suatu transaksi (dipakai di daftar) = jumlah seluruh
  // baris rincianPiutang yang berstatus bayar.
  function totalNominal(trx) {
    return (trx.rincianPiutang || []).reduce(function (s, r) {
      return s + (r.bayar ? (Number(r.terimaPengembalian) || 0) : 0);
    }, 0);
  }

  // Daftar transaksi Kas Bon milik seorang karyawan beserta Sisa Total
  // piutangnya (setelah dikurangi pengembalian yang sudah tercatat pada
  // transaksi Pengembalian Kas Bon LAIN, tidak termasuk `excludeNo`).
  function getOutstandingForKaryawan(karyawan, excludeNo) {
    if (!karyawan || !window.KasbonStore) return [];
    var kasbonList = KasbonStore.loadAll().filter(function (k) { return k.karyawan === karyawan; });
    var pengembalianList = loadAll().filter(function (p) { return p.no !== excludeNo; });

    var dibayarPerKasbon = {};
    pengembalianList.forEach(function (p) {
      (p.rincianPiutang || []).forEach(function (r) {
        if (!r.bayar) return;
        dibayarPerKasbon[r.kasbonNo] = (dibayarPerKasbon[r.kasbonNo] || 0) + (Number(r.terimaPengembalian) || 0);
      });
    });

    return kasbonList.map(function (k) {
      var sudahDibayar = dibayarPerKasbon[k.no] || 0;
      var sisaTotal = Math.round((k.jumlah - sudahDibayar) * 100) / 100;
      return {
        no: k.no, tipeTransaksi: 'Kas Bon', tglFaktur: k.tglTrn, tglJthTempo: k.tglTrn,
        mataUang: k.mataUangKaryawan || 'IDR', kurs: k.kursKaryawan || 1,
        jumlah: k.jumlah, sisaTotal: sisaTotal
      };
    }).filter(function (r) { return r.sisaTotal > 0.009; });
  }

  global.PengembalianKasbonStore = {
    loadAll: loadAll, saveAll: saveAll, getByNo: getByNo, upsert: upsert,
    removeByNo: removeByNo, nextNo: nextNo, emptyTransaction: emptyTransaction,
    totalNominal: totalNominal, getOutstandingForKaryawan: getOutstandingForKaryawan,
    KAS_BANK_KODE: KAS_BANK_KODE, AKUN_PIUTANG_KARYAWAN: AKUN_PIUTANG_KARYAWAN, NAMA_PIUTANG_KARYAWAN: NAMA_PIUTANG_KARYAWAN
  };
})(window);
