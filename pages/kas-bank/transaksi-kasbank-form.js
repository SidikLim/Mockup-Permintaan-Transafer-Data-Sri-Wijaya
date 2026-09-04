/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   transaksi-kasbank-form.js - logika form "Buat Transaksi Kas /
   Bank". Bisa ditarik dari Request Cash Transaction yang sudah
   Approved (field "Request Cash Transaction" di atas), atau
   dibuat langsung tanpa request.

   Jurnal Otomatis: setiap baris Rincian Transaksi Kas/Bank
   menghasilkan satu baris Debit (Terima Kas) atau Kredit (Keluar
   Kas) pada akun Kas/Bank terkait (kode akun diambil dari kode
   pada Master Kas/Bank), lalu selisih bersihnya dibalance dengan
   satu baris akun "Kas dalam Perjalanan" - pola yang sama dipakai
   pada data contoh (seed) transaksi_kasbank-store.js. Ini adalah
   penyederhanaan mockup; pada sistem sungguhan pasangan jurnalnya
   bisa mengikuti akun lain sesuai pilihan "Jurnal" per baris.
   =========================================================== */

(function () {
  var current = null;
  var isNew = false;
  var activeTab = 'rincian-kb';

  var DEPT_OPTIONS = ['PST', 'TGR', 'SGT', 'GAH', 'PRJ'];

  function init() {
    MockUI.mountShell('transaksi-kasbank');
    populateKasBankList();
    populateRequestList();

    var no = MockUI.qs('no');
    if (no) {
      current = TransaksiKasBankStore.getByNo(no);
      if (!current) {
        MockUI.toast('error', 'Transaksi dengan nomor "' + no + '" tidak ditemukan.');
        current = TransaksiKasBankStore.emptyTransaction();
        isNew = true;
      }
    } else {
      current = TransaksiKasBankStore.emptyTransaction();
      isNew = true;
    }
    if (!current.rincianRows || !current.rincianRows.length) current.rincianRows = [TransaksiKasBankStore.emptyRincian()];
    if (!current.jurnalItems) current.jurnalItems = [];

    document.getElementById('pageTitle').innerHTML = isNew
      ? '+ Buat Transaksi Kas / Bank'
      : '&#9998; Transaksi Kas / Bank - ' + MockUI.esc(current.no);

    fillHeader(current);
    renderRincianTable();
    renderJurnalTable();
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

  function populateRequestList() {
    var list = document.getElementById('requestList');
    var reqs = (window.RequestKasBankStore ? RequestKasBankStore.loadAll() : []).filter(function (r) { return r.status === 'Approved'; });
    list.innerHTML = reqs.map(function (r) {
      return '<option value="' + MockUI.esc(r.no) + '">' + MockUI.esc((r.keterangan || '').split('\n')[0]) + '</option>';
    }).join('');
  }

  function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
  function getVal(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  function fillHeader(t) {
    setVal('fRequestNo', t.requestNo || '');
    setVal('fDepartemen', t.departemen || 'PUSAT');
    setVal('fProyek', t.proyek || '');
    setVal('fNoTransaksi', t.no || '');
    setVal('fTglTrn', t.tglTrn || '');
    setVal('fDibayarKepada', t.dibayarKepada || '');
    setVal('fKeterangan', t.keterangan || '');

    var jurnalRadios = document.getElementsByName('fJurnalMode');
    jurnalRadios.forEach(function (r) { r.checked = (r.value === (t.jurnalMode || 'otomatis')); });
  }

  // -----------------------------------------------------------------
  // Tarik data dari Request Cash Transaction yang sudah Approved
  // -----------------------------------------------------------------
  function pullFromRequest(reqNo) {
    var req = RequestKasBankStore.getByNo(reqNo);
    if (!req) {
      MockUI.toast('error', 'Request Cash Transaction "' + reqNo + '" tidak ditemukan.');
      return;
    }
    if (req.status !== 'Approved') {
      MockUI.toast('error', 'Request "' + reqNo + '" belum Approved, belum bisa ditarik menjadi Transaksi Kas/Bank.');
      return;
    }
    current.requestNo = req.no;
    current.departemen = req.departemen;
    current.proyek = req.proyek;
    current.dibayarKepada = req.dibayarKepada;
    current.keterangan = req.keterangan;
    current.rincianRows = req.rincianRows.map(function (r) { return Object.assign({}, r); });
    fillHeader(current);
    renderRincianTable();
    recalc();
    MockUI.toast('success', 'Data ditarik dari Request "' + req.no + '".');
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
        if (isNew && idx === 0) {
          current.no = TransaksiKasBankStore.nextNo(input.value);
          setVal('fNoTransaksi', current.no);
        }
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
      // Defer the table rebuild out of the native 'change' event's own call
      // stack: rebuilding innerHTML synchronously here can race with the
      // browser's own blur/change completion (the input that fired this
      // event is itself among the nodes being torn down), throwing
      // NotFoundError. setTimeout(...,0) lets that native cycle finish first.
      setTimeout(function () {
        renderRincianTable();
        recalc();
      }, 0);
    }
  }

  function addRincianRow() {
    current.rincianRows.push(TransaksiKasBankStore.emptyRincian());
    renderRincianTable();
    recalc();
  }

  function recalc() {
    var total = current.rincianRows.reduce(function (s, r) { return s + (Number(r.total) || 0); }, 0);
    setVal('sJumlahTransaksi', MockUI.formatCurrency(total));
  }

  // -----------------------------------------------------------------
  // Tabel Rincian Jurnal Akun
  // -----------------------------------------------------------------
  function renderJurnalTable() {
    var tbody = document.getElementById('jurnalTableBody');
    var rows = current.jurnalItems;

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:16px;font-style:italic;">Belum ada baris jurnal. Klik "Buat Jurnal" (mode otomatis) atau "+ Tambah" untuk menambah baris manual.</td></tr>';
    } else {
      tbody.innerHTML = rows.map(function (r, idx) {
        return (
          '<tr data-jrow="' + idx + '">' +
            '<td><input type="text" data-jfield="kodeAkun" value="' + MockUI.esc(r.kodeAkun) + '" placeholder="Kode akun"></td>' +
            '<td><input type="text" data-jfield="kodeDept" value="' + MockUI.esc(r.kodeDept || '') + '" placeholder="Dept"></td>' +
            '<td><input type="text" data-jfield="costCenter" value="' + MockUI.esc(r.costCenter || '') + '" placeholder="Klik untuk memilih" disabled></td>' +
            '<td><input type="text" data-jfield="namaAkun" value="' + MockUI.esc(r.namaAkun) + '" placeholder="Nama akun"></td>' +
            '<td><input type="text" data-jfield="keterangan" value="' + MockUI.esc(r.keterangan || '') + '" placeholder="Keterangan"></td>' +
            '<td><input type="text" inputmode="decimal" data-jfield="debit" value="' + MockUI.formatCurrency(r.debit) + '"></td>' +
            '<td><input type="text" inputmode="decimal" data-jfield="kredit" value="' + MockUI.formatCurrency(r.kredit) + '"></td>' +
            '<td class="col-action"><button class="btn-icon red" data-remove-jurnal="' + idx + '" title="Hapus baris" type="button">&#128465;</button></td>' +
          '</tr>'
        );
      }).join('');
    }

    tbody.querySelectorAll('input[data-jfield="kodeAkun"], input[data-jfield="kodeDept"], input[data-jfield="namaAkun"], input[data-jfield="keterangan"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var idx = jRowIndex(input);
        current.jurnalItems[idx][input.getAttribute('data-jfield')] = input.value;
      });
    });
    tbody.querySelectorAll('input[data-jfield="debit"], input[data-jfield="kredit"]').forEach(function (input) {
      input.addEventListener('focus', function () { input.select(); });
      input.addEventListener('input', function () {
        var idx = jRowIndex(input);
        var field = input.getAttribute('data-jfield');
        current.jurnalItems[idx][field] = MockUI.parseLocaleNumber(input.value);
        updateJurnalBalance();
      });
      input.addEventListener('blur', function () {
        var idx = jRowIndex(input);
        var field = input.getAttribute('data-jfield');
        input.value = MockUI.formatCurrency(current.jurnalItems[idx][field]);
      });
    });
    tbody.querySelectorAll('[data-remove-jurnal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-remove-jurnal'), 10);
        current.jurnalItems.splice(idx, 1);
        renderJurnalTable();
      });
    });
    updateJurnalBalance();
  }

  function jRowIndex(el) {
    var tr = el.closest('tr');
    return parseInt(tr.getAttribute('data-jrow'), 10);
  }

  function addJurnalRow() {
    current.jurnalItems.push({ kodeAkun: '', kodeDept: '', costCenter: '', namaAkun: '', keterangan: getVal('fKeterangan'), debit: 0, kredit: 0 });
    renderJurnalTable();
  }

  function updateJurnalBalance() {
    var debit = current.jurnalItems.reduce(function (s, r) { return s + (Number(r.debit) || 0); }, 0);
    var kredit = current.jurnalItems.reduce(function (s, r) { return s + (Number(r.kredit) || 0); }, 0);
    var diff = debit - kredit;
    var el = document.getElementById('jurnalBalance');
    el.value = MockUI.formatCurrency(diff);
    el.classList.toggle('is-balanced', Math.abs(diff) < 0.01);
    el.classList.toggle('is-unbalanced', Math.abs(diff) >= 0.01);
  }

  function buatJurnalOtomatis() {
    var ket = getVal('fKeterangan');
    var rows = current.rincianRows.filter(function (r) { return r.kasBank && (Number(r.total) || 0) > 0; });
    if (!rows.length) {
      MockUI.toast('error', 'Isi minimal satu baris Rincian Transaksi Kas/Bank terlebih dahulu.');
      return;
    }
    var items = [];
    var net = 0;
    rows.forEach(function (r) {
      var kode = TransaksiKasBankStore.KAS_BANK_KODE[r.kasBank] || '';
      var isTerima = r.tipeTransaksi === 'Terima Kas';
      var amt = Number(r.total) || 0;
      items.push({ kodeAkun: kode, kodeDept: r.dept, costCenter: '', namaAkun: r.kasBank, keterangan: r.keterangan || ket, debit: isTerima ? amt : 0, kredit: isTerima ? 0 : amt });
      net += isTerima ? amt : -amt;
    });
    if (Math.abs(net) > 0.009) {
      items.push({
        kodeAkun: TransaksiKasBankStore.KAS_DALAM_PERJALANAN_KODE, kodeDept: '', costCenter: '',
        namaAkun: TransaksiKasBankStore.KAS_DALAM_PERJALANAN_NAMA, keterangan: ket,
        debit: net < 0 ? -net : 0, kredit: net > 0 ? net : 0
      });
    }
    current.jurnalItems = items;
    renderJurnalTable();
    MockUI.toast('success', 'Jurnal otomatis dibuat dari Rincian Transaksi Kas/Bank (selisih dibalance ke akun Kas dalam Perjalanan).');
  }

  // -----------------------------------------------------------------
  // Tabs
  // -----------------------------------------------------------------
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === tab);
    });
    document.getElementById('panel-rincian-kb').classList.toggle('is-active', tab === 'rincian-kb');
    document.getElementById('panel-rincian-jurnal').classList.toggle('is-active', tab === 'rincian-jurnal');
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
    current.jurnalMode = (document.querySelector('input[name="fJurnalMode"]:checked') || {}).value || 'otomatis';
  }

  function validate() {
    if (!current.rincianRows.some(function (r) { return r.kasBank && (Number(r.total) || 0) > 0; })) {
      MockUI.toast('error', 'Tambahkan minimal satu baris Rincian Transaksi Kas/Bank dengan Kas/Bank & Total lebih dari 0.');
      return false;
    }
    return true;
  }

  function onSimpan(thenPrint) {
    collectFormIntoCurrent();
    if (!validate()) return;
    TransaksiKasBankStore.upsert(current);
    isNew = false;
    MockUI.toast('success', (thenPrint ? 'Transaksi disimpan, siap dicetak (di luar cakupan mockup ini). ' : '') + 'Transaksi Kas/Bank "' + current.no + '" berhasil disimpan.');
    setTimeout(function () { window.location.href = 'daftar-transaksi-kasbank.html'; }, 800);
  }

  function bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { switchTab(btn.getAttribute('data-tab')); });
    });

    document.getElementById('btnAddRincian').addEventListener('click', addRincianRow);
    document.getElementById('btnAddJurnal').addEventListener('click', addJurnalRow);
    document.getElementById('btnBuatJurnal').addEventListener('click', buatJurnalOtomatis);
    document.getElementById('btnSimpan').addEventListener('click', function () { onSimpan(false); });
    document.getElementById('btnCetakSimpan').addEventListener('click', function () { onSimpan(true); });

    var fRequestNo = document.getElementById('fRequestNo');
    fRequestNo.addEventListener('change', function () {
      if (fRequestNo.value.trim()) pullFromRequest(fRequestNo.value.trim());
    });
    document.getElementById('btnPickRequest').addEventListener('click', function () {
      if (fRequestNo.value.trim()) { pullFromRequest(fRequestNo.value.trim()); return; }
      MockUI.toast('info', 'Ketik atau pilih nomor Request Cash Transaction yang sudah Approved untuk menarik datanya.');
    });

    document.getElementById('btnRegenNo').addEventListener('click', function () {
      if (!isNew) {
        MockUI.toast('info', 'Nomor transaksi tidak dapat diubah setelah tersimpan.');
        return;
      }
      var firstKasBank = current.rincianRows[0] && current.rincianRows[0].kasBank;
      current.no = TransaksiKasBankStore.nextNo(firstKasBank);
      setVal('fNoTransaksi', current.no);
      MockUI.toast('info', 'Nomor transaksi diperbarui: ' + current.no);
    });
    document.getElementById('btnPickProyek').addEventListener('click', function () {
      MockUI.toast('info', 'Pemilihan Proyek berada di luar cakupan mockup ini.');
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Isi Rincian Transaksi Kas/Bank, lalu buka tab "Rincian Jurnal Akun" dan klik "Buat Jurnal". Bisa juga menarik data dari Request Cash Transaction yang sudah Approved.', 6000);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
