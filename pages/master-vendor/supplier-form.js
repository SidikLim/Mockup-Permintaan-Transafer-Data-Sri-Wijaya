/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   supplier-form.js - logika form tambah/ubah supplier,
   termasuk tabel dinamis Informasi Rekening Bank.
   =========================================================== */

(function () {
  var current = null;   // objek supplier yang sedang diedit
  var isNew = false;

  function init() {
    MockUI.mountShell('supplier');

    var kode = MockUI.qs('kode');
    if (kode) {
      current = SupplierStore.getByKode(kode);
      if (!current) {
        MockUI.toast('error', 'Supplier dengan kode "' + kode + '" tidak ditemukan.');
        current = SupplierStore.emptySupplier();
        isNew = true;
      }
    } else {
      current = SupplierStore.emptySupplier();
      isNew = true;
    }
    if (!current.rekeningBank) current.rekeningBank = [];

    document.getElementById('pageTitle').textContent = isNew ? 'Tambah Supplier' : 'Ubah Supplier';
    fillForm(current);
    renderBankTable();
    bindEvents();
  }

  function fillForm(s) {
    setVal('fPrefix', s.prefix || '000SP');
    setVal('fKode', s.kode || '');
    setVal('fNama', s.nama || '');
    setVal('fWilayah', s.wilayah || '');
    setVal('fTelepon', s.telepon || '');
    setVal('fEmail', s.email || '');
    setVal('fSyaratBayar', s.syaratBayar || 'Kredit 30 Hari');
    setVal('fBatasKredit', s.batasKredit || 0);
    setVal('fProvinsi', s.provinsi || '');
    setVal('fKabupaten', s.kabupatenKota || '');
    setVal('fMataUang', s.mataUang || 'IDR');
    setVal('fSupplierGroup', s.supplierGroup || '');
    setVal('fFax', s.fax || '');
    setVal('fKontakPerson', s.kontakPerson || '');
    setVal('fNpwp', s.npwp || '');
    setVal('fPpnTipe', s.ppnTipe || 'PPN Eksklusif');
    setVal('fKecamatan', s.kecamatan || '');
    setVal('fKelurahan', s.kelurahan || '');
    setVal('fAlamat', s.alamat || '');
    setVal('fAkunGlUtang', s.akunGlUtang || '');
    setVal('fAkunUangMuka', s.akunUangMuka || '');

    var radios = document.getElementsByName('fStatus');
    radios.forEach(function (r) { r.checked = (r.value === (s.status || 'Aktif')); });
  }

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val;
  }
  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  // -----------------------------------------------------------------
  // Tabel Informasi Rekening Bank
  // -----------------------------------------------------------------
  function renderBankTable() {
    var tbody = document.getElementById('bankTableBody');
    var rows = current.rekeningBank;

    if (!rows.length) {
      tbody.innerHTML = '<tr class="bank-empty-row"><td colspan="5">Belum ada rekening bank. Klik "+ Tambah Rekening" untuk menambahkan.</td></tr>';
    } else {
      tbody.innerHTML = rows.map(function (r, idx) {
        return (
          '<tr data-row="' + idx + '">' +
            '<td><input type="text" data-field="bank" value="' + MockUI.esc(r.bank) + '" placeholder="Nama Bank"></td>' +
            '<td><input type="text" data-field="cabang" value="' + MockUI.esc(r.cabang) + '" placeholder="Cabang"></td>' +
            '<td><input type="text" data-field="noRekening" value="' + MockUI.esc(r.noRekening) + '" placeholder="Nomor Rekening"></td>' +
            '<td><input type="text" data-field="namaRekening" value="' + MockUI.esc(r.namaRekening) + '" placeholder="Nama Rekening"></td>' +
            '<td class="col-action"><button class="btn-icon red" data-remove-row="' + idx + '" title="Hapus baris" type="button">&#128465;</button></td>' +
          '</tr>'
        );
      }).join('');
    }

    tbody.querySelectorAll('input[data-field]').forEach(function (input) {
      input.addEventListener('input', function () {
        var tr = input.closest('tr');
        var idx = parseInt(tr.getAttribute('data-row'), 10);
        var field = input.getAttribute('data-field');
        current.rekeningBank[idx][field] = input.value;
      });
    });
    tbody.querySelectorAll('[data-remove-row]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-remove-row'), 10);
        current.rekeningBank.splice(idx, 1);
        renderBankTable();
      });
    });

    var label = document.getElementById('bankRowCountLabel');
    label.textContent = rows.length ? rows.length + ' rekening terdaftar' : '';
  }

  function addBankRow() {
    current.rekeningBank.push({ bank: '', cabang: '', noRekening: '', namaRekening: '' });
    renderBankTable();
    var lastInput = document.querySelector('#bankTableBody tr:last-child input[data-field="bank"]');
    if (lastInput) lastInput.focus();
  }

  // -----------------------------------------------------------------
  // Simpan / Duplicate / Batal
  // -----------------------------------------------------------------
  function collectFormIntoCurrent() {
    current.prefix = getVal('fPrefix');
    current.nama = getVal('fNama').trim();
    current.wilayah = getVal('fWilayah');
    current.telepon = getVal('fTelepon');
    current.email = getVal('fEmail');
    current.syaratBayar = getVal('fSyaratBayar');
    current.batasKredit = parseFloat(getVal('fBatasKredit')) || 0;
    current.provinsi = getVal('fProvinsi');
    current.kabupatenKota = getVal('fKabupaten');
    current.mataUang = getVal('fMataUang');
    current.supplierGroup = getVal('fSupplierGroup');
    current.fax = getVal('fFax');
    current.kontakPerson = getVal('fKontakPerson');
    current.npwp = getVal('fNpwp');
    current.ppnTipe = getVal('fPpnTipe');
    current.kecamatan = getVal('fKecamatan');
    current.kelurahan = getVal('fKelurahan');
    current.alamat = getVal('fAlamat');
    current.akunGlUtang = getVal('fAkunGlUtang');
    current.akunUangMuka = getVal('fAkunUangMuka');

    var checked = document.querySelector('input[name="fStatus"]:checked');
    current.status = checked ? checked.value : 'Aktif';

    // buang baris rekening bank yang benar-benar kosong sebelum disimpan
    current.rekeningBank = current.rekeningBank.filter(function (r) {
      return (r.bank || r.cabang || r.noRekening || r.namaRekening);
    });
  }

  function validate() {
    if (!getVal('fNama').trim()) {
      MockUI.toast('error', 'Nama Supplier wajib diisi.');
      return false;
    }
    var incompleteBank = current.rekeningBank.some(function (r) {
      var filled = [r.bank, r.cabang, r.noRekening, r.namaRekening].filter(Boolean).length;
      return filled > 0 && filled < 4;
    });
    if (incompleteBank) {
      MockUI.toast('error', 'Lengkapi semua kolom pada setiap baris Rekening Bank (Bank, Cabang, No. Rekening, Nama Rekening), atau hapus baris yang tidak terpakai.');
      return false;
    }
    return true;
  }

  function onSimpan() {
    collectFormIntoCurrent();
    if (!validate()) return;
    SupplierStore.upsert(current);
    isNew = false;
    document.getElementById('pageTitle').textContent = 'Ubah Supplier';
    MockUI.toast('success', 'Data supplier "' + current.nama + '" berhasil disimpan.');
    setTimeout(function () {
      window.location.href = 'daftar-supplier.html';
    }, 700);
  }

  function onDuplicate() {
    collectFormIntoCurrent();
    if (!validate()) return;
    var copy = JSON.parse(JSON.stringify(current));
    copy.kode = SupplierStore.nextKode();
    copy.nama = copy.nama + ' (Copy)';
    copy.saldoUtang = 0;
    copy.uangMuka = 0;
    SupplierStore.upsert(copy);
    MockUI.toast('success', 'Supplier diduplikasi menjadi "' + copy.nama + '".');
    setTimeout(function () {
      window.location.href = 'supplier-form.html?kode=' + encodeURIComponent(copy.kode);
    }, 700);
  }

  function bindEvents() {
    document.getElementById('btnAddBank').addEventListener('click', addBankRow);
    document.getElementById('btnSimpan').addEventListener('click', onSimpan);
    document.getElementById('btnDuplicate').addEventListener('click', onDuplicate);

    document.getElementById('btnAttach').addEventListener('click', function () {
      MockUI.toast('info', 'Fitur lampiran file belum diimplementasikan pada mockup ini.');
    });
    document.getElementById('btnCustomField').addEventListener('click', function () {
      MockUI.toast('info', 'Custom Field berada di luar cakupan mockup tahap ini.');
    });
    document.querySelectorAll('[data-coa]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MockUI.toast('info', 'Pemilihan Chart of Account berada di luar cakupan mockup tahap ini.');
      });
    });
    document.querySelectorAll('[data-coa-clear]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-coa-clear');
        setVal(id, '');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
