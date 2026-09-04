/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   kasbon-form.js - logika form Kas Bon Karyawan
   =========================================================== */

(function () {
  var current = null;
  var isNew = false;

  var KAS_BANK_KODE = {
    'Kas Kecil - HO': '11010120',
    'Bank Mandiri - HO': '11020110',
    'Bank BCA - HO': '11020130'
  };

  function init() {
    MockUI.mountShell('kas-bon');
    populateKaryawanList();

    var no = MockUI.qs('no');
    if (no) {
      current = KasbonStore.getByNo(no);
      if (!current) {
        MockUI.toast('error', 'Transaksi dengan nomor "' + no + '" tidak ditemukan.');
        current = KasbonStore.emptyTransaction();
        isNew = true;
      }
    } else {
      current = KasbonStore.emptyTransaction();
      isNew = true;
    }
    if (!current.jurnalItems) current.jurnalItems = [];

    document.getElementById('pageTitle').innerHTML = isNew
      ? '+ Kas Bon'
      : '&#9998; Kas Bon - ' + MockUI.esc(current.no);

    fillForm(current);
    renderJurnalTable();
    bindEvents();
  }

  function populateKaryawanList() {
    var list = document.getElementById('karyawanList');
    var karyawans = (window.KaryawanStore ? KaryawanStore.loadAll() : []);
    list.innerHTML = karyawans.map(function (k) {
      return '<option value="' + MockUI.esc(k.nama) + '">';
    }).join('');
  }

  function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
  function getVal(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  function fillForm(t) {
    setVal('fNoTransaksi', t.no || '');
    setVal('fCaNumber', t.caNumber || '');
    setVal('fDepartemen', t.departemen || 'GA-HR');
    setVal('fProyek', t.proyek || '');
    setVal('fKaryawan', t.karyawan || '');
    setVal('fKursKaryawan', MockUI.formatCurrency(t.kursKaryawan || 1));
    setVal('fMataUangKaryawan', t.mataUangKaryawan || 'IDR');
    setVal('fJumlah', MockUI.formatCurrency(t.jumlah || 0));
    setVal('fTglTrn', t.tglTrn || '');
    setVal('fKasBank', t.kasBank || 'Kas Kecil - HO');
    setVal('fKursKasBank', MockUI.formatCurrency(t.kursKasBank || 1));
    setVal('fMataUangKasBank', t.mataUangKasBank || 'IDR');
    setVal('fJumlahKasBank', MockUI.formatCurrency(t.jumlah || 0));
    setVal('fJurnalAkun', t.jurnalAkun || t.kasBank || 'Kas Kecil - HO');
    setVal('fDibayarKepada', t.dibayarKepada || '');
    setVal('fKeterangan', t.keterangan || '');

    var jurnalRadios = document.getElementsByName('fJurnalMode');
    jurnalRadios.forEach(function (r) { r.checked = (r.value === (t.jurnalMode || 'otomatis')); });
  }

  // -----------------------------------------------------------------
  // Tabel Rincian Jurnal Akun
  // -----------------------------------------------------------------
  function renderJurnalTable() {
    var tbody = document.getElementById('jurnalTableBody');
    var rows = current.jurnalItems;

    if (!rows.length) {
      tbody.innerHTML = '<tr class="bank-empty-row"><td colspan="8" style="text-align:center;color:var(--text-muted);padding:16px;font-style:italic;">Belum ada baris jurnal. Klik "Buat Jurnal" (mode otomatis) atau "+ Tambah Item Baru" untuk menambah baris manual.</td></tr>';
    } else {
      tbody.innerHTML = rows.map(function (r, idx) {
        return (
          '<tr data-jrow="' + idx + '">' +
            '<td><input type="text" data-jfield="kodeAkun" value="' + MockUI.esc(r.kodeAkun) + '" placeholder="Kode akun"></td>' +
            '<td><input type="text" data-jfield="costCenter" value="' + MockUI.esc(r.costCenter) + '" placeholder="Cost center"></td>' +
            '<td><input type="text" data-jfield="namaAkun" value="' + MockUI.esc(r.namaAkun) + '" placeholder="Nama akun"></td>' +
            '<td><input type="text" data-jfield="keterangan" value="' + MockUI.esc(r.keterangan) + '" placeholder="Keterangan"></td>' +
            '<td><input type="text" data-jfield="komponen" value="' + MockUI.esc(r.komponen || '') + '" placeholder="Pilih Komponen" disabled></td>' +
            '<td><input type="text" inputmode="decimal" data-jfield="debit" value="' + MockUI.formatCurrency(r.debit) + '"></td>' +
            '<td><input type="text" inputmode="decimal" data-jfield="kredit" value="' + MockUI.formatCurrency(r.kredit) + '"></td>' +
            '<td class="col-action"><button class="btn-icon red" data-remove-jurnal="' + idx + '" title="Hapus baris" type="button">&#128465;</button></td>' +
          '</tr>'
        );
      }).join('');
    }

    tbody.querySelectorAll('input[data-jfield="kodeAkun"], input[data-jfield="costCenter"], input[data-jfield="namaAkun"], input[data-jfield="keterangan"]').forEach(function (input) {
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
    current.jurnalItems.push({ kodeAkun: '', costCenter: '', namaAkun: '', keterangan: getVal('fKeterangan'), komponen: '', debit: 0, kredit: 0 });
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
    var jumlah = MockUI.parseLocaleNumber(getVal('fJumlah'));
    var ket = getVal('fKeterangan');
    var kasBankNama = getVal('fKasBank') || 'Kas Kecil - HO';
    var kasBankKode = KAS_BANK_KODE[kasBankNama] || '11010120';

    current.jurnalItems = [
      { kodeAkun: '11030300', costCenter: '', namaAkun: 'Piutang Karyawan', keterangan: ket, komponen: '', debit: jumlah, kredit: 0 },
      { kodeAkun: kasBankKode, costCenter: '', namaAkun: kasBankNama, keterangan: ket, komponen: '', debit: 0, kredit: jumlah }
    ];
    renderJurnalTable();
    MockUI.toast('success', 'Jurnal otomatis dibuat: Piutang Karyawan (debit) vs ' + kasBankNama + ' (kredit).');
  }

  // -----------------------------------------------------------------
  // Sinkronisasi Jumlah -> Jumlah Kas/Bank, dan Kas/Bank -> Jurnal
  // -----------------------------------------------------------------
  function bindJumlahSync() {
    var fJumlah = document.getElementById('fJumlah');
    fJumlah.addEventListener('focus', function () { fJumlah.select(); });
    fJumlah.addEventListener('input', function () {
      var val = MockUI.parseLocaleNumber(fJumlah.value);
      setVal('fJumlahKasBank', MockUI.formatCurrency(val));
    });
    fJumlah.addEventListener('blur', function () {
      var val = MockUI.parseLocaleNumber(fJumlah.value);
      fJumlah.value = MockUI.formatCurrency(val);
      setVal('fJumlahKasBank', MockUI.formatCurrency(val));
    });

    var fKasBank = document.getElementById('fKasBank');
    fKasBank.addEventListener('change', syncKasBankToJurnal);
    fKasBank.addEventListener('blur', syncKasBankToJurnal);
  }

  function syncKasBankToJurnal() {
    var val = getVal('fKasBank');
    var sel = document.getElementById('fJurnalAkun');
    var hasOption = Array.prototype.some.call(sel.options, function (o) { return o.value === val; });
    if (hasOption) sel.value = val;
  }

  // -----------------------------------------------------------------
  // Simpan
  // -----------------------------------------------------------------
  function collectFormIntoCurrent() {
    current.caNumber = getVal('fCaNumber');
    current.departemen = getVal('fDepartemen');
    current.proyek = getVal('fProyek');
    current.karyawan = getVal('fKaryawan').trim();
    current.jumlah = MockUI.parseLocaleNumber(getVal('fJumlah'));
    current.tglTrn = getVal('fTglTrn');
    current.kasBank = getVal('fKasBank');
    current.jurnalAkun = getVal('fJurnalAkun');
    current.dibayarKepada = getVal('fDibayarKepada');
    current.keterangan = getVal('fKeterangan');
    current.jurnalMode = (document.querySelector('input[name="fJurnalMode"]:checked') || {}).value || 'otomatis';
  }

  function validate() {
    if (!getVal('fKaryawan').trim()) {
      MockUI.toast('error', 'Karyawan wajib diisi.');
      return false;
    }
    if (MockUI.parseLocaleNumber(getVal('fJumlah')) <= 0) {
      MockUI.toast('error', 'Jumlah kas bon harus lebih dari 0.');
      return false;
    }
    return true;
  }

  function onSimpan() {
    collectFormIntoCurrent();
    if (!validate()) return;
    KasbonStore.upsert(current);
    isNew = false;
    MockUI.toast('success', 'Transaksi Kas Bon "' + current.no + '" berhasil disimpan.');
    setTimeout(function () { window.location.href = 'daftar-kasbon.html'; }, 800);
  }

  function bindEvents() {
    bindJumlahSync();
    document.getElementById('btnAddJurnal').addEventListener('click', addJurnalRow);
    document.getElementById('btnBuatJurnal').addEventListener('click', buatJurnalOtomatis);
    document.getElementById('btnSimpan').addEventListener('click', onSimpan);

    document.getElementById('btnRegenNo').addEventListener('click', function () {
      if (!isNew) {
        MockUI.toast('info', 'Nomor transaksi tidak dapat diubah setelah tersimpan.');
        return;
      }
      current.no = KasbonStore.nextNo();
      setVal('fNoTransaksi', current.no);
      MockUI.toast('info', 'Nomor transaksi diperbarui: ' + current.no);
    });
    document.getElementById('btnPickKaryawan').addEventListener('click', function () {
      MockUI.toast('info', 'Gunakan kolom Karyawan untuk mengetik/mencari nama (data dari Master Karyawan).');
    });
    document.getElementById('btnPickKasBank').addEventListener('click', function () {
      MockUI.toast('info', 'Gunakan kolom Kas/Bank untuk memilih akun kas/bank.');
    });
    document.getElementById('btnPickProyek').addEventListener('click', function () {
      MockUI.toast('info', 'Pemilihan Proyek berada di luar cakupan mockup ini.');
    });
    document.getElementById('btnActivityLog').addEventListener('click', function () {
      MockUI.toast('info', 'Activity Log berada di luar cakupan mockup ini.');
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Isi Karyawan & Jumlah, lalu klik "Buat Jurnal" untuk membuat jurnal otomatis Piutang Karyawan vs Kas/Bank.', 5000);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
