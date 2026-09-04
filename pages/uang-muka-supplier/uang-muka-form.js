/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   uang-muka-form.js - logika form Uang Muka Supplier, termasuk
   checkbox PPh per baris item (di sebelah kiri checkbox Ppn).

   Aturan PPh (sesuai permintaan):
   - Checkbox PPh pada suatu baris hanya bisa dicentang jika
     checkbox Ppn baris tersebut juga dicentang (PPh "menumpang"
     pada baris yang kena PPN).
   - Jika Ppn baris di-uncheck, PPh baris tersebut otomatis ikut
     di-uncheck & dinonaktifkan (aturan berlaku dua arah).
   - Jumlah PPh dihitung hanya dari baris yang Ppn-nya DAN PPh-nya
     sama-sama tercentang, dikalikan tarif dari field "Pph Dipotong".
   =========================================================== */

(function () {
  var current = null;
  var isNew = false;
  var activeTab = 'rincian-transaksi';

  function init() {
    MockUI.mountShell('uang-muka-supplier-2');
    populateSupplierList();
    populatePphTypes();

    var no = MockUI.qs('no');
    if (no) {
      current = UangMukaStore.getByNo(no);
      if (!current) {
        MockUI.toast('error', 'Transaksi dengan nomor "' + no + '" tidak ditemukan.');
        current = UangMukaStore.emptyTransaction();
        isNew = true;
      }
    } else {
      current = UangMukaStore.emptyTransaction();
      isNew = true;
    }
    if (!current.items || !current.items.length) current.items = [UangMukaStore.emptyItem()];
    if (!current.jurnalItems) current.jurnalItems = [];

    document.getElementById('pageTitle').innerHTML = isNew
      ? '+ Uang Muka Supplier 2'
      : '&#9998; Uang Muka Supplier 2 - ' + MockUI.esc(current.no);

    fillHeader(current);
    renderItemTable();
    renderJurnalTable();
    updatePpnDetailVisibility();
    recalc();
    bindEvents();
  }

  function populateSupplierList() {
    var list = document.getElementById('supplierList');
    var suppliers = (window.SupplierStore ? SupplierStore.loadAll() : []);
    list.innerHTML = suppliers.map(function (s) {
      return '<option value="' + MockUI.esc(s.nama) + '">';
    }).join('');
  }

  function populatePphTypes() {
    var sel = document.getElementById('fPphType');
    sel.innerHTML = UangMukaStore.PPH_TYPES.map(function (t) {
      return '<option value="' + MockUI.esc(t.value) + '">' + MockUI.esc(t.label) + '</option>';
    }).join('');
  }

  function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
  function getVal(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  function fillHeader(t) {
    setVal('fDepartemen', t.departemen || 'PUSAT');
    setVal('fSupplier', t.supplier || '');
    setVal('fNoOtomatis', t.noOtomatis || 'UMS01');
    setVal('fTglTrn', t.tglTrn || '');
    setVal('fNoPO', t.noPO || '');
    setVal('fNoTransaksi', t.noTransaksi || t.no || '');
    setVal('fSyaratBayar', t.syaratBayar || 'CASH ON DELIVERY');
    setVal('fTglJatuhTempo', t.tglJatuhTempo || '');
    setVal('fJurnalAkun', t.jurnalAkun || '01 Hutang usaha');
    setVal('fKeterangan', t.keterangan || '');
    setVal('sMataUang', t.supplierMataUang || 'IDR');
    setVal('fDpTertagih', t.dpTertagihPersen != null ? t.dpTertagihPersen : 100);
    setVal('fTglFakturPajak', t.tglFakturPajak || '');
    document.getElementById('fTidakIsiNoFakturPajak').checked = !!t.tidakIsiNoFakturPajak;
    setVal('fNoFakturPajak', t.noFakturPajak || '');
    setVal('fPphType', t.pphType || '');

    var ppnRadios = document.getElementsByName('fPpnType');
    ppnRadios.forEach(function (r) { r.checked = (r.value === (t.ppnType || 'eksklusif')); });

    var jurnalRadios = document.getElementsByName('fJurnalMode');
    jurnalRadios.forEach(function (r) { r.checked = (r.value === (t.jurnalMode || 'otomatis')); });
  }

  // -----------------------------------------------------------------
  // Tabel item (Rincian Transaksi) - kolom PPh (kiri) + Ppn (kanan)
  // -----------------------------------------------------------------
  function renderItemTable() {
    var tbody = document.getElementById('itemTableBody');
    var rows = current.items;

    tbody.innerHTML = rows.map(function (it, idx) {
      var ppnChecked = !!it.ppn;
      var pphChecked = !!it.pph && ppnChecked;
      it.pph = pphChecked; // normalisasi jika data tidak konsisten
      return (
        '<tr data-row="' + idx + '">' +
          '<td class="col-check"><div class="chk-cell"><input type="checkbox" data-field="pph" ' +
            (pphChecked ? 'checked' : '') + (ppnChecked ? '' : ' disabled') +
            ' title="' + (ppnChecked ? 'Sertakan baris ini pada perhitungan PPh' : 'Aktifkan Ppn pada baris ini terlebih dahulu') + '"></div></td>' +
          '<td class="col-check"><div class="chk-cell"><input type="checkbox" data-field="ppn" ' + (ppnChecked ? 'checked' : '') + '></div></td>' +
          '<td><input type="text" data-field="keterangan" value="' + MockUI.esc(it.keterangan) + '" placeholder="Keterangan item"></td>' +
          '<td class="col-qty"><input type="text" inputmode="decimal" data-field="qty" value="' + MockUI.formatCurrency(it.qty) + '"></td>' +
          '<td class="col-jumlah"><input type="text" inputmode="decimal" data-field="jumlah" value="' + MockUI.formatCurrency(it.jumlah) + '"></td>' +
          '<td class="col-action"><button class="btn-icon red" data-remove-item="' + idx + '" title="Hapus baris" type="button">&#128465;</button></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('input[type=checkbox][data-field="ppn"]').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var idx = rowIndex(chk);
        current.items[idx].ppn = chk.checked;
        if (!chk.checked && current.items[idx].pph) {
          current.items[idx].pph = false;
          MockUI.toast('info', 'PPh pada baris ini otomatis dinonaktifkan karena Ppn tidak dicentang.');
        }
        renderItemTable();
        recalc();
      });
    });
    tbody.querySelectorAll('input[type=checkbox][data-field="pph"]').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var idx = rowIndex(chk);
        current.items[idx].pph = chk.checked;
        recalc();
      });
    });
    tbody.querySelectorAll('input[data-field="keterangan"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var idx = rowIndex(input);
        current.items[idx].keterangan = input.value;
      });
    });

    // Qty & Jumlah IDR: tampil dalam format desimal id-ID (rata kanan) saat
    // tidak fokus; saat fokus dipilih semua (select-all) supaya mudah diketik
    // ulang, lalu diformat ulang saat blur. Total dihitung ulang tiap kali
    // nilainya berubah selama pengetikan.
    tbody.querySelectorAll('input[data-field="qty"], input[data-field="jumlah"]').forEach(function (input) {
      input.addEventListener('focus', function () {
        input.select();
      });
      input.addEventListener('input', function () {
        var idx = rowIndex(input);
        var field = input.getAttribute('data-field');
        current.items[idx][field] = MockUI.parseLocaleNumber(input.value);
        recalc();
      });
      input.addEventListener('blur', function () {
        var idx = rowIndex(input);
        var field = input.getAttribute('data-field');
        input.value = MockUI.formatCurrency(current.items[idx][field]);
      });
    });
    tbody.querySelectorAll('[data-remove-item]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-remove-item'), 10);
        current.items.splice(idx, 1);
        if (!current.items.length) current.items.push(UangMukaStore.emptyItem());
        renderItemTable();
        recalc();
      });
    });
  }

  function rowIndex(el) {
    var tr = el.closest('tr');
    return parseInt(tr.getAttribute('data-row'), 10);
  }

  function addItemRow() {
    current.items.push(UangMukaStore.emptyItem());
    renderItemTable();
    recalc();
    var lastInput = document.querySelector('#itemTableBody tr:last-child input[data-field="keterangan"]');
    if (lastInput) lastInput.focus();
  }

  // -----------------------------------------------------------------
  // Tabel Rincian Jurnal Akun
  // -----------------------------------------------------------------
  function renderJurnalTable() {
    var tbody = document.getElementById('jurnalTableBody');
    var rows = current.jurnalItems;

    if (!rows.length) {
      tbody.innerHTML = '<tr class="bank-empty-row"><td colspan="7" style="text-align:center;color:var(--text-muted);padding:16px;font-style:italic;">Belum ada baris jurnal. Klik "Buat Jurnal" (mode otomatis) atau "+ Tambah" untuk menambah baris manual.</td></tr>';
    } else {
      tbody.innerHTML = rows.map(function (r, idx) {
        return (
          '<tr data-jrow="' + idx + '">' +
            '<td><input type="text" data-jfield="kodeAkun" value="' + MockUI.esc(r.kodeAkun) + '" placeholder="Kode akun"></td>' +
            '<td><input type="text" data-jfield="costCenter" value="' + MockUI.esc(r.costCenter) + '" placeholder="Cost center"></td>' +
            '<td><input type="text" data-jfield="namaAkun" value="' + MockUI.esc(r.namaAkun) + '" placeholder="Nama akun" disabled></td>' +
            '<td><input type="text" data-jfield="keterangan" value="' + MockUI.esc(r.keterangan) + '" placeholder="Keterangan"></td>' +
            '<td><input type="number" data-jfield="debit" value="' + (r.debit || 0) + '" min="0"></td>' +
            '<td><input type="number" data-jfield="kredit" value="' + (r.kredit || 0) + '" min="0"></td>' +
            '<td class="col-action"><button class="btn-icon red" data-remove-jurnal="' + idx + '" title="Hapus baris" type="button">&#128465;</button></td>' +
          '</tr>'
        );
      }).join('');
    }

    tbody.querySelectorAll('input[data-jfield]').forEach(function (input) {
      input.addEventListener('input', function () {
        var tr = input.closest('tr');
        var idx = parseInt(tr.getAttribute('data-jrow'), 10);
        var field = input.getAttribute('data-jfield');
        var val = (field === 'debit' || field === 'kredit') ? (parseFloat(input.value) || 0) : input.value;
        current.jurnalItems[idx][field] = val;
        updateJurnalBalance();
      });
    });
    tbody.querySelectorAll('[data-remove-jurnal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-remove-jurnal'), 10);
        current.jurnalItems.splice(idx, 1);
        renderJurnalTable();
        updateJurnalBalance();
      });
    });
    updateJurnalBalance();
  }

  function addJurnalRow() {
    current.jurnalItems.push({ kodeAkun: '', costCenter: '', namaAkun: '', keterangan: '', debit: 0, kredit: 0 });
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
    var totals = calcTotals();
    var no = current.noTransaksi || current.no || '';
    var ket = 'Transaksi Uang Muka ' + no;
    var rows = [
      { kodeAkun: '21010100', costCenter: '', namaAkun: 'Hutang Usaha', keterangan: ket, debit: 0, kredit: round2(totals.jumlah) }
    ];
    if (totals.subtotal > 0) {
      rows.push({ kodeAkun: '11050100', costCenter: '', namaAkun: 'Uang Muka Pembelian', keterangan: ket, debit: round2(totals.subtotal), kredit: 0 });
    }
    if (totals.ppnAmount > 0) {
      rows.push({ kodeAkun: '11070500', costCenter: '', namaAkun: 'Prepaid - PPN', keterangan: ket, debit: round2(totals.ppnAmount), kredit: 0 });
    }
    if (totals.pphAmount > 0) {
      rows.push({ kodeAkun: '11070600', costCenter: '', namaAkun: 'Prepaid - PPh', keterangan: ket, debit: round2(totals.pphAmount), kredit: 0 });
    }
    current.jurnalItems = rows;
    renderJurnalTable();
    MockUI.toast('success', 'Jurnal otomatis dibuat berdasarkan Subtotal, PPN, dan PPh saat ini.');
  }

  // -----------------------------------------------------------------
  // Kalkulasi: Subtotal, DPP, PPN 11%, PPh, Jumlah
  // -----------------------------------------------------------------
  function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

  function calcTotals() {
    var items = current.items || [];
    var subtotal = items.reduce(function (s, it) { return s + (Number(it.jumlah) || 0); }, 0);

    var ppnType = (document.querySelector('input[name="fPpnType"]:checked') || {}).value || 'tidak_ada';
    var dpPersen = parseFloat(getVal('fDpTertagih')) || 0;
    var dpp = round2(subtotal * dpPersen / 100);

    var ppnBase = items.filter(function (it) { return it.ppn; }).reduce(function (s, it) { return s + (Number(it.jumlah) || 0); }, 0);
    var ppnRate = (ppnType === 'eksklusif' || ppnType === 'inklusif') ? 11 : 0;
    var ppnAmount = (ppnType === 'inklusif') ? 0 : round2(ppnBase * ppnRate / 100);

    var pphType = getVal('fPphType');
    var pphRate = UangMukaStore.pphRate(pphType);
    var pphBase = items.filter(function (it) { return it.ppn && it.pph; }).reduce(function (s, it) { return s + (Number(it.jumlah) || 0); }, 0);
    var pphAmount = round2(pphBase * pphRate / 100);

    var jumlah = round2(subtotal + ppnAmount + pphAmount);

    return { subtotal: subtotal, dpp: dpp, ppnRate: ppnRate, ppnAmount: ppnAmount, pphRate: pphRate, pphAmount: pphAmount, jumlah: jumlah, ppnType: ppnType };
  }

  function recalc() {
    var totals = calcTotals();
    setVal('sSubtotal', MockUI.formatCurrency(totals.subtotal));
    setVal('sDpp', MockUI.formatCurrency(totals.dpp));
    setVal('sPpnAmount', MockUI.formatCurrency(totals.ppnAmount));
    setVal('sPphAmount', MockUI.formatCurrency(totals.pphAmount));
    setVal('sJumlah', MockUI.formatCurrency(totals.jumlah));
    document.getElementById('lblPajak11').textContent = 'Pajak ' + totals.ppnRate + '%';
    document.getElementById('lblPajakPph').textContent = totals.pphRate > 0 ? 'PPh (' + totals.pphRate + '%)' : 'PPh';
  }

  function updatePpnDetailVisibility() {
    var checked = (document.querySelector('input[name="fPpnType"]:checked') || {}).value;
    var box = document.getElementById('ppnDetailBox');
    box.style.display = (checked === 'eksklusif' || checked === 'inklusif') ? 'block' : 'none';
  }

  // -----------------------------------------------------------------
  // Tabs
  // -----------------------------------------------------------------
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === tab);
    });
    document.getElementById('panel-rincian-transaksi').classList.toggle('is-active', tab === 'rincian-transaksi');
    document.getElementById('panel-rincian-jurnal').classList.toggle('is-active', tab === 'rincian-jurnal');
  }

  // -----------------------------------------------------------------
  // Simpan
  // -----------------------------------------------------------------
  function collectFormIntoCurrent() {
    current.departemen = getVal('fDepartemen');
    current.supplier = getVal('fSupplier').trim();
    current.noOtomatis = getVal('fNoOtomatis');
    current.tglTrn = getVal('fTglTrn');
    current.noPO = getVal('fNoPO');
    current.syaratBayar = getVal('fSyaratBayar');
    current.tglJatuhTempo = getVal('fTglJatuhTempo');
    current.jurnalAkun = getVal('fJurnalAkun');
    current.keterangan = getVal('fKeterangan');
    current.dpTertagihPersen = parseFloat(getVal('fDpTertagih')) || 0;
    current.tglFakturPajak = getVal('fTglFakturPajak');
    current.tidakIsiNoFakturPajak = document.getElementById('fTidakIsiNoFakturPajak').checked;
    current.noFakturPajak = getVal('fNoFakturPajak');
    current.pphType = getVal('fPphType');
    current.ppnType = (document.querySelector('input[name="fPpnType"]:checked') || {}).value || 'tidak_ada';
    current.jurnalMode = (document.querySelector('input[name="fJurnalMode"]:checked') || {}).value || 'otomatis';
    current.tglUangMuka = current.tglTrn || current.tglUangMuka;

    current.items = current.items.filter(function (it) {
      return it.keterangan || it.qty || it.jumlah;
    });
    if (!current.items.length) current.items.push(UangMukaStore.emptyItem());
  }

  function validate() {
    if (!getVal('fSupplier').trim()) {
      MockUI.toast('error', 'Supplier wajib diisi.');
      return false;
    }
    if (!current.items.some(function (it) { return (Number(it.jumlah) || 0) > 0; })) {
      MockUI.toast('error', 'Tambahkan minimal satu baris item dengan Jumlah IDR lebih dari 0.');
      return false;
    }
    return true;
  }

  function onSimpan(thenPrint) {
    collectFormIntoCurrent();
    if (!validate()) return;
    UangMukaStore.upsert(current);
    isNew = false;
    MockUI.toast('success', (thenPrint ? 'Transaksi disimpan, invoice siap dicetak (di luar cakupan mockup ini). ' : '') + 'Uang Muka "' + current.no + '" berhasil disimpan.');
    setTimeout(function () {
      window.location.href = 'daftar-uang-muka.html';
    }, 800);
  }

  function bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { switchTab(btn.getAttribute('data-tab')); });
    });

    document.getElementById('btnAddItem').addEventListener('click', addItemRow);
    document.getElementById('btnAddJurnal').addEventListener('click', addJurnalRow);
    document.getElementById('btnBuatJurnal').addEventListener('click', buatJurnalOtomatis);

    document.getElementsByName('fPpnType').forEach(function (r) {
      r.addEventListener('change', function () { updatePpnDetailVisibility(); recalc(); });
    });
    document.getElementById('fDpTertagih').addEventListener('input', recalc);
    document.getElementById('fPphType').addEventListener('change', recalc);

    document.getElementById('btnSimpan').addEventListener('click', function () { onSimpan(false); });
    document.getElementById('btnCetakSimpan').addEventListener('click', function () { onSimpan(true); });

    document.getElementById('btnPickSupplier').addEventListener('click', function () {
      MockUI.toast('info', 'Gunakan kolom Supplier untuk mengetik/mencari nama supplier (data dari Master Vendor).');
    });
    document.getElementById('btnPickPO').addEventListener('click', function () {
      MockUI.toast('info', 'Pemilihan No. PO dari daftar Purchase Order berada di luar cakupan mockup ini.');
    });
    document.getElementById('btnPilihPph').addEventListener('click', function () {
      MockUI.toast('info', 'Gunakan dropdown Pph Dipotong di sebelahnya untuk memilih jenis & tarif PPh.');
    });
    document.getElementById('btnActivityLog').addEventListener('click', function () {
      MockUI.toast('info', 'Activity Log berada di luar cakupan mockup ini.');
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Centang Ppn lalu PPh pada baris item untuk melihat perhitungan otomatis PPN & PPh.', 4500);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
