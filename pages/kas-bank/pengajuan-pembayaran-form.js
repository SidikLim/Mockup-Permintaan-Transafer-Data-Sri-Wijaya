/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   pengajuan-pembayaran-form.js - logika form "Pengajuan
   Pembayaran" (permintaan pembayaran hutang supplier sebelum
   di-approve & dieksekusi sebagai Pelunasan Hutang sungguhan).

   CATATAN: alur approval (siapa yang boleh approve, notifikasi)
   berada di luar cakupan mockup ini - status & Approve By pada
   data contoh hanya untuk visual. Kolom "Komponen" & tombol
   pencarian Proyek/Supplier juga hanya placeholder (toast).
   "Sisa" pada Rincian Pengajuan Pembayaran dihitung dari total
   faktur dikurangi jumlah yang SUDAH benar-benar dibayar lewat
   Pelunasan Hutang (bukan dari pengajuan lain yang masih pending),
   sama seperti pola "Sisa Total" pada Pengembalian Kas Bon.
   =========================================================== */

(function () {
  var current = null;
  var isNew = false;

  function init() {
    MockUI.mountShell('pengajuan-pembayaran');
    populateSupplierList();
    populateBankPaymentSelect();

    var no = MockUI.qs('no');
    if (no) {
      current = PengajuanPembayaranStore.getByNo(no);
      if (!current) {
        MockUI.toast('error', 'Pengajuan dengan nomor "' + no + '" tidak ditemukan.');
        current = PengajuanPembayaranStore.emptyTransaction();
        isNew = true;
      }
    } else {
      current = PengajuanPembayaranStore.emptyTransaction();
      isNew = true;
    }
    if (!current.rincianFaktur) current.rincianFaktur = [];
    if (!current.activityLog) current.activityLog = [];

    document.getElementById('pageTitle').innerHTML = isNew
      ? '+ Pengajuan Pembayaran'
      : '&#9998; Pengajuan Pembayaran - ' + MockUI.esc(current.no);

    fillHeader(current);
    renderStamp();
    renderAccountBankSupplier();
    renderRincianTable();
    renderActivityLog();
    bindEvents();
  }

  function populateSupplierList() {
    var list = document.getElementById('supplierList');
    var names = FakturHutangStore.listSuppliers();
    if (window.SupplierStore) {
      SupplierStore.loadAll().forEach(function (s) {
        if (names.indexOf(s.nama) === -1) names.push(s.nama);
      });
    }
    list.innerHTML = names.map(function (n) { return '<option value="' + MockUI.esc(n) + '">'; }).join('');
  }

  function populateBankPaymentSelect() {
    var sel = document.getElementById('fBankPayment');
    var accs = (window.KasBankStore ? KasBankStore.loadAll() : []);
    sel.innerHTML = accs.map(function (a) { return '<option value="' + MockUI.esc(a.nama) + '">' + MockUI.esc(a.nama) + '</option>'; }).join('');
  }

  function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
  function getVal(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  function fillHeader(t) {
    setVal('fNoOtomatis', t.noOtomatis || 'PYR01');
    setVal('fNoTransaksi', t.no || '');
    setVal('fMetodePayment', t.metodePayment || 'Transfer');
    setVal('fProyek', t.proyek || '');
    setVal('fSupplier', t.supplier || '');
    setVal('fTglTrn', t.tglTrn || '');
    setVal('fTglJatuhTempo', t.tglJatuhTempo || '');
    setVal('fBankPayment', t.bankPayment || '');
    setVal('fKeterangan', t.keterangan || '');
  }

  function renderStamp() {
    var box = document.getElementById('stampBox');
    if (current.status === 'Approved' || current.status === 'Paid') {
      box.innerHTML = '<div class="form-stamp">' + (current.status === 'Paid' ? 'Paid' : 'Approved') + '</div>';
    } else if (current.status === 'Rejected') {
      box.innerHTML = '<div class="form-stamp form-stamp--pending">Rejected</div>';
    } else {
      box.innerHTML = '';
    }
  }

  // -----------------------------------------------------------------
  // Account Bank Supplier
  // -----------------------------------------------------------------
  function renderAccountBankSupplier() {
    var select = document.getElementById('fAccountBankSupplier');
    var accounts = PengajuanPembayaranStore.getSupplierBankAccounts(getVal('fSupplier').trim());

    if (!accounts.length) {
      select.innerHTML = '<option value="">- Tidak ada rekening -</option>';
      renderAcctTable(null);
      return;
    }
    select.innerHTML = accounts.map(function (a, idx) {
      return '<option value="' + idx + '">(' + MockUI.esc(a.noRekening) + ') ' + MockUI.esc(a.namaRekening) + '</option>';
    }).join('');
    var idx = Math.min(current.accountBankSupplierIdx || 0, accounts.length - 1);
    select.value = String(idx);
    renderAcctTable(accounts[idx]);
  }

  function renderAcctTable(a) {
    var wrap = document.getElementById('acctTableWrap');
    if (!a) {
      wrap.innerHTML = '<div style="color:var(--text-muted);font-size:12.5px;font-style:italic;padding:6px 0;">Supplier ini belum memiliki rekening bank pada Master Vendor.</div>';
      return;
    }
    wrap.innerHTML =
      '<div class="bank-table-wrap"><table class="bank-table"><thead><tr>' +
        '<th style="width:22%;">Bank</th><th style="width:20%;">Cabang</th><th style="width:29%;">Nomor Rekening</th><th style="width:29%;">Nama Rekening</th>' +
      '</tr></thead><tbody><tr>' +
        '<td>' + MockUI.esc(a.bank) + '</td>' +
        '<td>' + MockUI.esc(a.cabang) + '</td>' +
        '<td>' + MockUI.esc(a.noRekening) + '</td>' +
        '<td>' + MockUI.esc(a.namaRekening) + '</td>' +
      '</tr></tbody></table></div>';
  }

  // -----------------------------------------------------------------
  // Rincian Pengajuan Pembayaran (pilih Faktur Hutang supplier terkait)
  // -----------------------------------------------------------------
  function buildFakturRows() {
    var supplier = getVal('fSupplier').trim();
    if (!supplier) return [];

    var faktur = FakturHutangStore.listBySupplier(supplier);
    var dibayarLain = {};
    (window.PelunasanHutangStore ? PelunasanHutangStore.loadAll() : []).forEach(function (p) {
      (p.rincianFaktur || []).forEach(function (r) {
        if (!r.checked) return;
        dibayarLain[r.noFaktur] = (dibayarLain[r.noFaktur] || 0) + (Number(r.pembayaran) || 0);
      });
    });

    var selectedMap = {};
    current.rincianFaktur.forEach(function (r) { selectedMap[r.noFaktur] = r; });

    return faktur.map(function (fk) {
      var sudahDibayar = dibayarLain[fk.noFaktur] || 0;
      var sisa = Math.round((fk.total - sudahDibayar) * 100) / 100;
      var sel = selectedMap[fk.noFaktur];
      return {
        noFaktur: fk.noFaktur, noInvoice: fk.noInvoice, tglFaktur: fk.tglFaktur, tglJatuhTempo: fk.tglJatuhTempo,
        crc: fk.crc, total: fk.total, sisa: sisa,
        checked: sel ? !!sel.checked : false,
        pembayaran: sel ? (Number(sel.pembayaran) || 0) : 0,
        komponen: sel ? (sel.komponen || '') : ''
      };
    }).filter(function (r) { return r.sisa > 0.009 || r.checked; });
  }

  function renderRincianTable() {
    var tbody = document.getElementById('rincianTableBody');
    var rows = buildFakturRows();

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="10" class="piutang-table-empty">' +
        (getVal('fSupplier').trim() ? 'Supplier ini tidak memiliki sisa Faktur Hutang yang bisa diajukan.' : 'Pilih Supplier terlebih dahulu untuk menampilkan daftar Faktur Hutang.') +
        '</td></tr>';
      updateTotal();
      return;
    }

    tbody.innerHTML = rows.map(function (r, idx) {
      return (
        '<tr data-frow="' + idx + '" data-no-faktur="' + MockUI.esc(r.noFaktur) + '">' +
          '<td class="col-check"><input type="checkbox" data-ffield="checked"' + (r.checked ? ' checked' : '') + '></td>' +
          '<td>' + MockUI.esc(r.noFaktur) + '</td>' +
          '<td>' + MockUI.esc(r.noInvoice || '') + '</td>' +
          '<td>' + MockUI.esc(formatTgl(r.tglFaktur)) + '</td>' +
          '<td>' + MockUI.esc(formatTgl(r.tglJatuhTempo)) + '</td>' +
          '<td>' + MockUI.esc(r.crc) + '</td>' +
          '<td class="col-amount readonly-cell">' + MockUI.formatCurrency(r.total) + '</td>' +
          '<td class="col-amount readonly-cell">' + MockUI.formatCurrency(r.sisa) + '</td>' +
          '<td class="col-amount"><input type="text" inputmode="decimal" data-ffield="pembayaran" value="' + MockUI.formatCurrency(r.pembayaran) + '"' + (r.checked ? '' : ' disabled') + '></td>' +
          '<td><input type="text" data-ffield="komponen" value="' + MockUI.esc(r.komponen || '') + '" placeholder="Pilih Komponen" disabled></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('input[data-ffield="checked"]').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var tr = chk.closest('tr');
        var noFaktur = tr.getAttribute('data-no-faktur');
        var rowData = buildFakturRows()[fRowIndex(chk)];
        setRincian(noFaktur, chk.checked, chk.checked ? (rowData.pembayaran || rowData.sisa) : rowData.pembayaran, rowData.komponen);
        // Deferred (setTimeout 0) to avoid the same innerHTML/blur race fixed
        // in transaksi-kasbank-form.js's syncCrcFromKasBank().
        setTimeout(renderRincianTable, 0);
      });
    });
    tbody.querySelectorAll('input[data-ffield="pembayaran"]').forEach(function (input) {
      input.addEventListener('focus', function () { input.select(); });
      input.addEventListener('input', function () {
        var tr = input.closest('tr');
        var noFaktur = tr.getAttribute('data-no-faktur');
        var val = MockUI.parseLocaleNumber(input.value);
        setRincian(noFaktur, true, val, null);
        updateTotal();
      });
      input.addEventListener('blur', function () {
        var tr = input.closest('tr');
        var noFaktur = tr.getAttribute('data-no-faktur');
        var entry = current.rincianFaktur.filter(function (r) { return r.noFaktur === noFaktur; })[0];
        input.value = MockUI.formatCurrency(entry ? entry.pembayaran : 0);
      });
    });

    updateTotal();
  }

  function fRowIndex(el) {
    var tr = el.closest('tr');
    return parseInt(tr.getAttribute('data-frow'), 10);
  }

  function setRincian(noFaktur, checked, pembayaran, komponen) {
    var entry = current.rincianFaktur.filter(function (r) { return r.noFaktur === noFaktur; })[0];
    if (!entry) {
      entry = { noFaktur: noFaktur, checked: false, pembayaran: 0, komponen: '' };
      current.rincianFaktur.push(entry);
    }
    entry.checked = checked;
    entry.pembayaran = Math.round((Number(pembayaran) || 0) * 100) / 100;
    if (komponen != null) entry.komponen = komponen;
  }

  function updateTotal() {
    var total = current.rincianFaktur.reduce(function (s, r) {
      return s + (r.checked ? (Number(r.pembayaran) || 0) : 0);
    }, 0);
    setVal('sTotal', MockUI.formatCurrency(total));
    return total;
  }

  function formatTgl(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p.length === 3 ? (p[2] + '/' + p[1] + '/' + p[0]) : iso;
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
    current.noOtomatis = getVal('fNoOtomatis');
    current.metodePayment = getVal('fMetodePayment');
    current.proyek = getVal('fProyek');
    current.supplier = getVal('fSupplier').trim();
    current.tglTrn = getVal('fTglTrn');
    current.tglJatuhTempo = getVal('fTglJatuhTempo');
    current.bankPayment = getVal('fBankPayment');
    var acctSel = document.getElementById('fAccountBankSupplier');
    current.accountBankSupplierIdx = acctSel.value ? parseInt(acctSel.value, 10) : 0;
    current.keterangan = getVal('fKeterangan');
    current.rincianFaktur = current.rincianFaktur.filter(function (r) { return r.checked && (Number(r.pembayaran) || 0) > 0; });
  }

  function validate() {
    if (!getVal('fSupplier').trim()) {
      MockUI.toast('error', 'Supplier wajib diisi.');
      return false;
    }
    if (!current.rincianFaktur.some(function (r) { return r.checked && (Number(r.pembayaran) || 0) > 0; })) {
      MockUI.toast('error', 'Pilih minimal satu baris Rincian Pengajuan Pembayaran dengan jumlah Pembayaran lebih dari 0.');
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
    PengajuanPembayaranStore.upsert(current);
    isNew = false;
    MockUI.toast('success', (thenPrint ? 'Pengajuan disimpan, siap dicetak (di luar cakupan mockup ini). ' : '') + 'Pengajuan "' + current.no + '" berhasil disimpan.');
    setTimeout(function () { window.location.href = 'daftar-pengajuan-pembayaran.html'; }, 800);
  }

  function bindEvents() {
    document.getElementById('btnSimpan').addEventListener('click', function () { onSimpan(false); });
    document.getElementById('btnCetakSimpan').addEventListener('click', function () { onSimpan(true); });

    document.getElementById('fNoOtomatis').addEventListener('change', function () {
      if (!isNew) { setVal('fNoOtomatis', current.noOtomatis); return; }
      current.no = PengajuanPembayaranStore.nextNo(getVal('fNoOtomatis'));
      setVal('fNoTransaksi', current.no);
    });
    document.getElementById('btnRegenNo').addEventListener('click', function () {
      if (!isNew) {
        MockUI.toast('info', 'Nomor transaksi tidak dapat diubah setelah tersimpan.');
        return;
      }
      current.no = PengajuanPembayaranStore.nextNo(getVal('fNoOtomatis'));
      setVal('fNoTransaksi', current.no);
      MockUI.toast('info', 'Nomor transaksi diperbarui: ' + current.no);
    });

    var fSupplier = document.getElementById('fSupplier');
    fSupplier.addEventListener('change', function () {
      current.rincianFaktur = [];
      // Deferred: fSupplier is a text input with a datalist, same shape as
      // the kasBank input whose synchronous innerHTML rebuild inside its own
      // 'change' handler raced with the browser's native blur/change cycle
      // (see fix in transaksi-kasbank-form.js's syncCrcFromKasBank()).
      setTimeout(function () {
        renderAccountBankSupplier();
        renderRincianTable();
      }, 0);
    });

    document.getElementById('fAccountBankSupplier').addEventListener('change', function (e) {
      var accounts = PengajuanPembayaranStore.getSupplierBankAccounts(getVal('fSupplier').trim());
      var idx = parseInt(e.target.value, 10) || 0;
      current.accountBankSupplierIdx = idx;
      renderAcctTable(accounts[idx]);
    });

    document.getElementById('btnPickSupplier').addEventListener('click', function () {
      MockUI.toast('info', 'Gunakan kolom Supplier untuk mengetik/mencari nama (data dari Master Vendor & Faktur Hutang).');
    });
    document.getElementById('btnPickProyek').addEventListener('click', function () {
      MockUI.toast('info', 'Pemilihan Proyek berada di luar cakupan mockup ini.');
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Pilih Supplier, centang Faktur Hutang yang diajukan pembayarannya pada Rincian Pengajuan Pembayaran, lalu Simpan.', 5500);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
