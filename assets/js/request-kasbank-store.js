/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   request-kasbank-store.js - mock data "Request Transaksi Kas /
   Bank" (pengajuan transaksi kas/bank yang perlu di-approve
   sebelum dieksekusi sebagai Transaksi Kas/Bank sungguhan).
   Disimpan di localStorage.
   =========================================================== */

(function (global) {
  var STORAGE_KEY = 'srw_mockup_request_kasbank_v1';

  var DEPARTEMEN_KODE = {
    'PUSAT': 'PST', 'TANGERANG': 'TGR', 'SANGATTA': 'SGT', 'GA-HR': 'GAH', 'PROJECT': 'PRJ'
  };

  function seedData() {
    return [
      {
        no: 'RCT-2026090002',
        departemen: 'TANGERANG', proyek: '', tglTrn: '2026-09-01',
        dibayarKepada: 'DPLK AIA',
        keterangan: 'DPLK AIA - SETORAN DANA PENSIUN BLN AGUSTUS 2026\nhttps://nas.indobaruna.com/drive/d/f/19i0d24v5NQFCvpVX36Bk5FwAuWjGnsk',
        rincianRows: [
          {
            kasBank: 'Bank BCA - HO', dept: 'TGR', crc: 'IDR', kurs: 1, tipeTransaksi: 'Keluar Kas', cair: true,
            noGiro: '', tglJatuhTempo: '2026-09-01', jurnal: '',
            keterangan: 'DPLK AIA - SETORAN DANA PENSIUN BLN AGUSTUS 2026', total: 50010000
          }
        ],
        requestBy: 'christovani',
        approveBy: ['bondan', 'tekun'],
        status: 'Approved',
        activityLog: [
          { action: 'Created By', user: 'christovani', at: '2026-09-01T18:24:50' },
          { action: 'Edited By', user: 'christovani', at: '2026-09-01T18:27:10' },
          { action: 'Approved By', user: 'tekun', at: '2026-09-02T11:35:53' },
          { action: 'Approved By', user: 'bondan', at: '2026-09-02T10:32:55' }
        ]
      },
      {
        no: 'RCT-2026090001',
        departemen: 'TANGERANG', proyek: '', tglTrn: '2026-09-01',
        dibayarKepada: 'DPLK AIA',
        keterangan: 'DPLK AIA - SETORAN DANA PENSIUN BLN JULI 2026\nhttps://nas.indobaruna.com/drive/d/f/19i00RyXaFTAY1n1tBG1vtghEnc9G5Ou',
        rincianRows: [
          {
            kasBank: 'Bank BCA - HO', dept: 'TGR', crc: 'IDR', kurs: 1, tipeTransaksi: 'Keluar Kas', cair: true,
            noGiro: '', tglJatuhTempo: '2026-09-01', jurnal: '',
            keterangan: 'DPLK AIA - SETORAN DANA PENSIUN BLN JULI 2026', total: 50010000
          }
        ],
        requestBy: 'christovani',
        approveBy: ['bondan'],
        status: 'Pending',
        activityLog: [
          { action: 'Created By', user: 'christovani', at: '2026-09-01T09:12:30' },
          { action: 'Approved By', user: 'bondan', at: '2026-09-01T14:05:11' }
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
      console.error('Gagal memuat data Request Transaksi Kas/Bank, memakai data awal.', e);
      return seedData();
    }
  }

  function saveAll(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { console.error('Gagal menyimpan data Request Transaksi Kas/Bank.', e); }
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
    var yyyymm = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0');
    var list = loadAll();
    var prefix = 'RCT-' + yyyymm;
    var max = 0;
    list.forEach(function (t) {
      if (t.no.indexOf(prefix) === 0) {
        var n = parseInt(t.no.slice(prefix.length), 10);
        if (!isNaN(n) && n > max) max = n;
      }
    });
    return prefix + String(max + 1).padStart(4, '0');
  }

  function totalOf(trx) {
    return (trx.rincianRows || []).reduce(function (s, r) { return s + (Number(r.total) || 0); }, 0);
  }

  function emptyTransaction() {
    var todayIso = new Date().toISOString().slice(0, 10);
    return {
      no: nextNo(), departemen: 'PUSAT', proyek: '', tglTrn: todayIso,
      dibayarKepada: '', keterangan: '',
      rincianRows: [emptyRincian()],
      requestBy: 'mas', approveBy: [], status: 'Pending', activityLog: []
    };
  }

  function emptyRincian() {
    return { kasBank: '', dept: 'PST', crc: 'IDR', kurs: 1, tipeTransaksi: 'Keluar Kas', cair: true, noGiro: '', tglJatuhTempo: '', jurnal: '', keterangan: '', total: 0 };
  }

  global.RequestKasBankStore = {
    loadAll: loadAll, saveAll: saveAll, getByNo: getByNo, upsert: upsert, removeByNo: removeByNo,
    nextNo: nextNo, totalOf: totalOf, emptyTransaction: emptyTransaction, emptyRincian: emptyRincian,
    DEPARTEMEN_KODE: DEPARTEMEN_KODE
  };
})(window);
