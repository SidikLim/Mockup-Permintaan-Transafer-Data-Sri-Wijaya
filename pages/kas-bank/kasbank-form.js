/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   kasbank-form.js - logika form tambah/ubah Master Kas/Bank
   =========================================================== */

(function () {
  var current = null;
  var isNew = false;

  function init() {
    MockUI.mountShell('master-kas-bank');

    var kode = MockUI.qs('kode');
    if (kode) {
      current = KasBankStore.getByKode(kode);
      if (!current) {
        MockUI.toast('error', 'Akun dengan kode "' + kode + '" tidak ditemukan.');
        current = KasBankStore.emptyAccount();
        isNew = true;
      }
    } else {
      current = KasBankStore.emptyAccount();
      isNew = true;
    }

    document.getElementById('pageTitle').innerHTML = isNew ? '+ Kas/Bank' : '&#9998; Kas/Bank - ' + MockUI.esc(current.nama || current.kode);
    fillForm(current);
    bindEvents();
  }

  function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
  function getVal(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  function fillForm(a) {
    setVal('fKode', a.kode || '');
    setVal('fNama', a.nama || '');
    setVal('fTipe', a.tipe || 'Kas');
    setVal('fSaldo', MockUI.formatCurrency(a.saldo || 0));
    setVal('fMataUang', a.mataUang || 'IDR');
    setVal('fTelepon', a.telepon || '');
    setVal('fNoRek', a.noRek || '');
  }

  function collectFormIntoCurrent() {
    current.nama = getVal('fNama').trim();
    current.tipe = getVal('fTipe');
    current.saldo = MockUI.parseLocaleNumber(getVal('fSaldo'));
    current.mataUang = getVal('fMataUang');
    current.telepon = getVal('fTelepon');
    current.noRek = getVal('fNoRek');
  }

  function validate() {
    if (!getVal('fNama').trim()) {
      MockUI.toast('error', 'Nama Bank wajib diisi.');
      return false;
    }
    return true;
  }

  function onSimpan() {
    collectFormIntoCurrent();
    if (!validate()) return;
    KasBankStore.upsert(current);
    isNew = false;
    MockUI.toast('success', 'Akun Kas/Bank "' + current.nama + '" berhasil disimpan.');
    setTimeout(function () { window.location.href = 'daftar-bank.html'; }, 700);
  }

  function bindEvents() {
    document.getElementById('fSaldo').addEventListener('focus', function () { this.select(); });
    document.getElementById('fSaldo').addEventListener('blur', function () {
      this.value = MockUI.formatCurrency(MockUI.parseLocaleNumber(this.value));
    });

    document.getElementById('fTipe').addEventListener('change', function () {
      if (isNew) {
        current.kode = KasBankStore.nextKode(this.value);
        setVal('fKode', current.kode);
      }
    });

    document.getElementById('btnRegenKode').addEventListener('click', function () {
      if (!isNew) {
        MockUI.toast('info', 'Kode Bank tidak dapat diubah setelah tersimpan.');
        return;
      }
      current.kode = KasBankStore.nextKode(getVal('fTipe'));
      setVal('fKode', current.kode);
      MockUI.toast('info', 'Kode Bank diperbarui: ' + current.kode);
    });

    document.getElementById('btnSimpan').addEventListener('click', onSimpan);
    document.getElementById('btnActivityLog').addEventListener('click', function () {
      MockUI.toast('info', 'Activity Log berada di luar cakupan mockup ini.');
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Mockup form Master Kas/Bank.', 3500);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
