/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   request-kasbank-form.js - logika form "Request Cash Transaction"
   (pengajuan transaksi kas/bank sebelum di-approve & dieksekusi
   sebagai Transaksi Kas/Bank sungguhan).

   CATATAN: alur approval (siapa yang boleh approve, notifikasi,
   dsb) berada di luar cakupan mockup ini - status & Approve By
   pada data contoh hanya untuk visual. Kolom "Jurnal" & tombol
   pencarian Proyek juga hanya placeholder (toast).
   =========================================================== */

(function () {
  var current = null;
  var isNew = false;

  var DEPT_OPTIONS = ['PST', 'TGR', 'SGT', 'GAH', 'PRJ'];

  function init() {
    MockUI.mountShell('request-transaksi-kasbank');
    populateKasBankList();

    var no = MockUI.qs('no');
    if (no) {
      current = RequestKasBankStore.getByNo(no);
      if (!current) {
        MockUI.toast('error', 'Request dengan nomor "' + no + '" tidak ditemukan.');
        current = RequestKasBankStore.emptyTransaction();
        isNew = true;
      }
    } else {
      current = RequestKasBankStore.emptyTransaction();
      isNew = true;
    }
    if (!current.rincianRows || !current.rincianRows.length) current.rincianRows = [RequestKasBankStore.emptyRincian()];
    if (!current.activityLog) current.activityLog = [];

    document.getElementById('pageTitle').innerHTML = isNew
      ? '+ Request Cash Transaction'
      : '&#9998; Request Cash Transaction - ' + MockUI.esc(current.no);

    fillHeader(current);
    renderStamp();
    renderRincianTable();
    renderActivityLog();
    recalc();
    bindEvents();
  }

  function populateKasBankList() {
    var list = document.getElementById('kasBankList');
    var accs = (window.KasBankStore ? KasBankStore.loadAll() : []);
    list.innerHTML = accs.map(function (a) {
      return '<option value="' + MockUI.esc(a.nama) + '">';
    }).join('');
  }

  function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
  function getVal(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  function fillHeader(t) {
    setVal('fDepartemen', t.departemen || 'PUSAT');
    setVal('fProyek', t.proyek || '');
    setVal('fNoTransaksi', t.no || '');
    setVal('fTglTrn', t.tglTrn || '');
    setVal('fDibayarKepada', t.dibayarKepada || '');
    setVal('fKeterangan', t.keterangan || '');
  }

  function renderStamp() {
    var box = document.getElementById('stampBox');
    if (current.status === 'Approved') {
      box.innerHTML = '<div class="form-stamp">Approved</div>';
    } else if (current.status === 'Rejected') {
      box.innerHTML = '<div class="form-stamp form-stamp--pending">Rejected</div>';
    } else {
      box.innerHTML = '';
    }
  }

  // -----------------------------------------------------------------
  // Tabel Rincian Transaksi Kas/Bank
  // -----------------------------------------------------------------
  function renderRincianTable() {
    var tbody = document.getElementById('rincianTableBody');
    var rows = current.rincianRows;
    var canRemove = rows.length > 1;

    tbody.innerHTML = rows.map(function (r, idx) {
      return (
        '<tr data-rrow="' + idx + '">' +
          '<td><input type="text" data-rfield="kasBank" value="' + MockUI.esc(r.kasBank) + '" list="kasBankList" placeholder="Pilih Kas/Bank"></td>' +
          '<td><select data-rfield="dept">' + DEPT_OPTIONS.map(function (d) { return '<option' + (d === r.dept ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select></td>' +
          '<td><input type="text" data-rfield="crc" value="' + MockUI.esc(r.crc || 'IDR') + '" disabled></td>' +
          '<td><input type="text" inputmode="decimal" data-rfield="kurs" value="' + MockUI.formatCurrency(r.kurs != null ? r.kurs : 1) + '"></td>' +
          '<td><select data-rfield="tipeTransaksi"><option' + (r.tipeTransaksi === 'Keluar Kas' ? ' selected' : '') + '>Keluar Kas</option><option' + (r.tipeTransaksi === 'Terima Kas' ? ' selected' : '') + '>Terima Kas</option></select></td>' +
          '<td style="text-align:center;"><input type="checkbox" data-rfield="cair"' + (r.cair ? ' checked' : '') + '></td>' +
          '<td><input type="text" data-rfield="noGiro" value="' + MockUI.esc(r.noGiro || '') + '"></td>' +
          '<td><input type="date" data-rfield="tglJatuhTempo" value="' + MockUI.esc(r.tglJatuhTempo || '') + '"></td>' +
          '<td><div class="cell-with-search"><input type="text" data-rfield="jurnal" value="' + MockUI.esc(r.jurnal || '') + '" placeholder="Pilih jurnal"><button class="btn-icon blue" data-pick-jurnal="' + idx + '" type="button" title="Pilih Jurnal">&#128269;</button></div></td>' +
          '<td><input type="text" data-rfield="keterangan" value="' + MockUI.esc(r.keterangan || '') + '" placeholder="Keterangan"></td>' +
          '<td class="col-amount"><input type="text" inputmode="decimal" data-rfield="total" value="' + MockUI.formatCurrency(r.total) + '"></td>' +
          '<td class="col-action"><button class="btn-icon red" data-remove-rincian="' + idx + '" title="Hapus baris"' + (canRemove ? '' : ' disabled') + ' type="button">&#128465;</button></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('input[data-rfield="kasBank"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var idx = rRowIndex(input);
        current.rincianRows[idx].kasBank = input.value;
      });
      input.addEventListener('change', function () {
        var idx = rRowIndex(input);
        syncCrcFromKasBank(idx, input.value);
      });
    });
    tbody.querySelectorAll('select[data-rfield="dept"], select[data-rfield="tipeTransaksi"]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var idx = rRowIndex(sel);
        current.rincianRows[idx][sel.getAttribute('data-rfield')] = sel.value;
      });
    });
    tbody.querySelectorAll('input[data-rfield="cair"]').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var idx = rRowIndex(chk);
        current.rincianRows[idx].cair = chk.checked;
      });
    });
    tbody.querySelectorAll('input[data-rfield="noGiro"], input[data-rfield="jurnal"], input[data-rfield="keterangan"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var idx = rRowIndex(input);
        current.rincianRows[idx][input.getAttribute('data-rfield')] = input.value;
      });
    });
    tbody.querySelectorAll('input[data-rfield="tglJatuhTempo"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var idx = rRowIndex(input);
        current.rincianRows[idx].tglJatuhTempo = input.value;
      });
    });
    tbody.querySelectorAll('input[data-rfield="kurs"], input[data-rfield="total"]').forEach(function (input) {
      input.addEventListener('focus', function () { input.select(); });
      input.addEventListener('input', function () {
        var idx = rRowIndex(input);
        var field = input.getAttribute('data-rfield');
        current.rincianRows[idx][field] = MockUI.parseLocaleNumber(input.value);
        recalc();
      });
      input.addEventListener('blur', function () {
        var idx = rRowIndex(input);
        var field = input.getAttribute('data-rfield');
        input.value = MockUI.formatCurrency(current.rincianRows[idx][field]);
      });
    });
    tbody.querySelectorAll('[data-pick-jurnal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MockUI.toast('info', 'Gunakan kolom Jurnal untuk mengetik nama jurnal secara manual.');
      });
    });
    tbody.querySelectorAll('[data-remove-rincian]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (current.rincianRows.length <= 1) return;
        var idx = parseInt(btn.getAttribute('data-remove-rincian'), 10);
        current.rincianRows.splice(idx, 1);
        renderRincianTable();
        recalc();
      });
    });
  }

  function rRowIndex(el) {
    var tr = el.closest('tr');
    return parseInt(tr.getAttribute('data-rrow'), 10);
  }

  function syncCrcFromKasBank(idx, namaKasBank) {
    var acc = (window.KasBankStore ? KasBankStore.loadAll() : []).filter(function (a) { return a.nama === namaKasBank; })[0];
    if (acc) {
      current.rincianRows[idx].crc = acc.mataUang || 'IDR';
      // Deferred to avoid racing the native 'change' event's own blur/change
      // completion cycle (see identical fix in transaksi-kasbank-form.js).
      setTimeout(function () {
        renderRincianTable();
        recalc();
      }, 0);
    }
  }

  function addRincianRow() {
    current.rincianRows.push(RequestKasBankStore.emptyRincian());
    renderRincianTable();
    recalc();
  }

  function recalc() {
    var total = current.rincianRows.reduce(function (s, r) { return s + (Number(r.total) || 0); }, 0);
    setVal('sJumlahTransaksi', MockUI.formatCurrency(total));
  }

  // -----------------------------------------------------------------
  // Activity log
  // -----------------------------------------------------------------
  function renderActivityLog() {
    var box = document.getElementById('activityLogBox');
    if (!current.activityLog.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<div class="activity-log-box">' +
      current.activityLog.map(function (l) {
        return '<span class="log-line">' + MockUI.esc(l.action) + ' ' + MockUI.esc(l.user) + ' @ ' + MockUI.esc(formatDateTime(l.at)) + '</span>';
      }).join('') +
      '</div>';
  }

  function formatDateTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  // -----------------------------------------------------------------
  // Simpan
  // -----------------------------------------------------------------
  function collectFormIntoCurrent() {
    current.departemen = getVal('fDepartemen');
    current.proyek = getVal('fProyek');
    current.tglTrn = getVal('fTglTrn');
    current.dibayarKepada = getVal('fDibayarKepada');
    current.keterangan = getVal('fKeterangan');
  }

  function validate() {
    if (!getVal('fDibayarKepada').trim()) {
      MockUI.toast('error', 'Dibayar Kepada / Terima Dari wajib diisi.');
      return false;
    }
    if (!current.rincianRows.some(function (r) { return r.kasBank && (Number(r.total) || 0) > 0; })) {
      MockUI.toast('error', 'Tambahkan minimal satu baris Rincian Transaksi Kas/Bank dengan Total lebih dari 0.');
      return false;
    }
    return true;
  }

  function onSimpan(thenPrint) {
    collectFormIntoCurrent();
    if (!validate()) return;
    var nowIso = new Date().toISOString();
    if (isNew) {
      current.activityLog.push({ action: 'Created By', user: current.requestBy || 'mas', at: nowIso });
    } else {
      current.activityLog.push({ action: 'Edited By', user: current.requestBy || 'mas', at: nowIso });
    }
    RequestKasBankStore.upsert(current);
    isNew = false;
    MockUI.toast('success', (thenPrint ? 'Request disimpan, siap dicetak (di luar cakupan mockup ini). ' : '') + 'Request "' + current.no + '" berhasil disimpan.');
    setTimeout(function () { window.location.href = 'daftar-request-kasbank.html'; }, 800);
  }

  function bindEvents() {
    document.getElementById('btnAddRincian').addEventListener('click', addRincianRow);
    document.getElementById('btnSimpan').addEventListener('click', function () { onSimpan(false); });
    document.getElementById('btnCetakSimpan').addEventListener('click', function () { onSimpan(true); });

    document.getElementById('btnRegenNo').addEventListener('click', function () {
      if (!isNew) {
        MockUI.toast('info', 'Nomor transaksi tidak dapat diubah setelah tersimpan.');
        return;
      }
      current.no = RequestKasBankStore.nextNo();
      setVal('fNoTransaksi', current.no);
      MockUI.toast('info', 'Nomor transaksi diperbarui: ' + current.no);
    });
    document.getElementById('btnPickProyek').addEventListener('click', function () {
      MockUI.toast('info', 'Pemilihan Proyek berada di luar cakupan mockup ini.');
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Isi Rincian Transaksi Kas/Bank, lalu Simpan. Request akan menunggu Approve sebelum dieksekusi sebagai Transaksi Kas/Bank.', 5500);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
