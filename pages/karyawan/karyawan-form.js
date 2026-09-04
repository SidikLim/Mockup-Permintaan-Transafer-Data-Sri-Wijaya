/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   karyawan-form.js - logika form tambah/ubah Master Karyawan
   =========================================================== */

(function () {
  var current = null;
  var isNew = false;

  function init() {
    MockUI.mountShell('master-karyawan');

    var kode = MockUI.qs('kode');
    if (kode) {
      current = KaryawanStore.getByKode(kode);
      if (!current) {
        MockUI.toast('error', 'Karyawan dengan kode "' + kode + '" tidak ditemukan.');
        current = KaryawanStore.emptyKaryawan();
        isNew = true;
      }
    } else {
      current = KaryawanStore.emptyKaryawan();
      isNew = true;
    }

    document.getElementById('pageTitle').innerHTML = isNew ? '+ Karyawan' : '&#9998; Karyawan - ' + MockUI.esc(current.nama || current.kode);
    fillForm(current);
    bindEvents();
  }

  function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
  function getVal(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  function fillForm(k) {
    setVal('fKode', k.kode || '');
    setVal('fNama', k.nama || '');
    setVal('fTelepon', k.telepon || '');
    setVal('fEmail', k.email || '');
    setVal('fMataUang', k.mataUang || 'IDR');
    setVal('fAlamat', k.alamat || '');
    setVal('fJabatan', k.jabatan || '');
    setVal('fNoRekening', k.noRekening || '');
    setVal('fBatasKredit', k.batasKredit || 0);
    setVal('fNpwp', k.npwp || '');
  }

  function collectFormIntoCurrent() {
    current.nama = getVal('fNama').trim();
    current.telepon = getVal('fTelepon');
    current.email = getVal('fEmail');
    current.mataUang = getVal('fMataUang');
    current.alamat = getVal('fAlamat');
    current.jabatan = getVal('fJabatan');
    current.noRekening = getVal('fNoRekening');
    current.batasKredit = parseFloat(getVal('fBatasKredit')) || 0;
    current.npwp = getVal('fNpwp');
  }

  function validate() {
    if (!getVal('fNama').trim()) {
      MockUI.toast('error', 'Nama Karyawan wajib diisi.');
      return false;
    }
    return true;
  }

  function onSimpan() {
    collectFormIntoCurrent();
    if (!validate()) return;
    KaryawanStore.upsert(current);
    isNew = false;
    MockUI.toast('success', 'Data karyawan "' + current.nama + '" berhasil disimpan.');
    setTimeout(function () { window.location.href = 'daftar-karyawan.html'; }, 700);
  }

  function bindEvents() {
    document.getElementById('btnSimpan').addEventListener('click', onSimpan);
    document.getElementById('btnActivityLog').addEventListener('click', function () {
      MockUI.toast('info', 'Activity Log berada di luar cakupan mockup ini.');
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Mockup form Master Karyawan.', 3500);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
