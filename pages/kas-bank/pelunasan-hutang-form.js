/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   pelunasan-hutang-form.js - logika form "Pelunasan Hutang"
   (transaksi pembayaran hutang supplier yang sudah dieksekusi -
   bisa ditarik dari Pengajuan Pembayaran yang sudah Approved, atau
   dibuat langsung dengan memilih Faktur Hutang milik supplier).

   Alur:
   - Isi "Dari Supplier" (atau tarik langsung dari field "Pengajuan
     Pembayaran" - hanya pengajuan berstatus Approved yang bisa
     ditarik, sekaligus mengunci Supplier & mengisi baris Bank +
     tab "Lunasi Beberapa Faktur" secara otomatis).
   - Tab "Lunasi Beberapa Faktur" menampilkan seluruh Faktur Hutang
     milik supplier terpilih yang masih memiliki Sisa (setelah
     dikurangi pembayaran pada transaksi Pelunasan Hutang LAIN),
     plus baris yang sudah dipilih pada transaksi ini sendiri (mode
     ubah) - pola perhitungan sisa sama seperti Pengembalian Kas
     Bon.
   - "Total Hutang Dibayar" = total seluruh baris faktur yang
     dicentang; idealnya sama dengan "Jumlah Keluar Kas" pada tabel
     Bank/Kurs, kecuali checkbox override dicentang.
   - "Buat Jurnal" (mode otomatis): Debit akun Hutang Usaha (hutang
     berkurang) vs Kredit akun Bank yang dipakai membayar.
   =========================================================== */

(function () {
  var current = null;
  var isNew = false;
  var fakturSearch = '';

  function init() {
    MockUI.mountShell('pelunasan-hutang');
    populateSupplierList();
    populateKasBankList();

    var no = MockUI.qs('no');
    if (no) {
      current = PelunasanHutangStore.getByNo(no);
      if (!current) {
        MockUI.toast('error', 'Transaksi dengan nomor "' + no + '" tidak ditemukan.');
        current = PelunasanHutangStore.emptyTransaction();
        isNew = true;
      }
    } else {
      current = PelunasanHutangStore.emptyTransaction();
      isNew = true;
    }
    if (!current.rincianRows || !current.rincianRows.length) current.rincianRows = [PelunasanHutangStore.emptyRincianRow()];
    if (!current.rincianFaktur) current.rincianFaktur = [];
    if (!current.jurnalItems) current.jurnalItems = [];

    document.getElementById('pageTitle').innerHTML = isNew
      ? '+ Pelunasan Hutang'
      : '&#9998; Pelunasan Hutang - ' + MockUI.esc(current.no);

    fillHeader(current);
    renderPengajuanField();
    renderBankTable();
    renderFakturTable();
    renderJurnalTable();
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

  function populateKasBankList() {
    var list = document.getElementById('kasBankList');
    var accs = (window.KasBankStore ? KasBankStore.loadAll() : []);
    list.innerHTML = accs.map(function (a) { return '<option value="' + MockUI.esc(a.nama) + '">'; }).join('');
  }

  function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
  function getVal(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  function fillHeader(t) {
    setVal('fDepartemen', t.departemen || 'PUSAT');
    setVal('fNoTransaksi', t.no || '');
    setVal('fTglTrn', t.tglTrn || '');
    setVal('fSupplier', t.supplier || '');
    setVal('fKeterangan', t.keterangan || '');
    document.getElementById('fOverrideTidakSama').checked = !!t.overrideTidakSama;
    var jurnalRadios = document.getElementsByName('fJurnalMode');
    jurnalRadios.forEach(function (r) { r.checked = (r.value === (t.jurnalMode || 'otomatis')); });
  }

  // -----------------------------------------------------------------
  // Field "Pengajuan Pembayaran" (chip terpilih <-> input pencarian)
  // -----------------------------------------------------------------
  function renderPengajuanField() {
    var wrap = document.getElementById('pengajuanFieldWrap');
    if (current.pengajuanNo) {
      wrap.innerHTML = '<div class="ref-chip">' + MockUI.esc(current.pengajuanNo) + '<button type="button" id="btnClearPengajuan" title="Hapus referensi">&times;</button></div>';
      var btn = document.getElementById('btnClearPengajuan');
      if (btn) btn.addEventListener('click', clearPengajuan);
    } else {
      populatePengajuanDatalist();
      wrap.innerHTML =
        '<div class="cell-with-search">' +
          '<input type="text" id="fPengajuanNo" placeholder="Cari Pengajuan Pembayaran (opsional)" list="pengajuanList">' +
          '<button class="btn-icon blue" id="btnPickPengajuan" type="button" title="Tarik data">&#128269;</button>' +
        '</div>';
      document.getElementById('btnPickPengajuan').addEventListener('click', function () {
        var val = getVal('fPengajuanNo').trim();
        if (!val) { MockUI.toast('error', 'Ketik/pilih nomor Pengajuan Pembayaran terlebih dahulu.'); return; }
        pullFromPengajuan(val);
      });
    }
  }

  function populatePengajuanDatalist() {
    var list = document.getElementById('pengajuanList');
    var approved = (window.PengajuanPembayaranStore ? PengajuanPembayaranStore.loadAll() : [])
      .filter(function (p) { return p.status === 'Approved'; });
    list.innerHTML = approved.map(function (p) {
      return '<option value="' + MockUI.esc(p.no) + '">' + MockUI.esc(p.supplier) + '</option>';
    }).join('');
  }

  function pullFromPengajuan(no) {
    var req = PengajuanPembayaranStore.getByNo(no);
    if (!req) { MockUI.toast('error', 'Pengajuan Pembayaran "' + no + '" tidak ditemukan.'); return; }
    if (req.status !== 'Approved') {
      MockUI.toast('error', 'Pengajuan "' + no + '" belum Approved (status saat ini: ' + req.status + '), tidak bisa ditarik.');
      return;
    }
    current.pengajuanNo = req.no;
    current.supplier = req.supplier;
    current.keterangan = req.no + ' - ' + (req.supplier || '') + (req.keterangan ? ' - ' + req.keterangan.split('\n')[0] : '');
    current.rincianFaktur = (req.rincianFaktur || []).filter(function (r) { return r.checked; }).map(function (r) {
      return { noFaktur: r.noFaktur, checked: true, pembayaran: r.pembayaran };
    });
    var total = current.rincianFaktur.reduce(function (s, r) { return s + (Number(r.pembayaran) || 0); }, 0);
    var crc = PengajuanPembayaranStore.crcOf(req);
    var row = PelunasanHutangStore.emptyRincianRow();
    row.kasBank = req.bankPayment || '';
    row.crc = crc;
    row.tipeTransaksi = 'Keluar Kas';
    row.tglJatuhTempo = req.tglTrn || current.tglTrn;
    row.keterangan = current.keterangan;
    row.pembayaran = total;
    current.rincianRows = [row];

    if (isNew) {
      current.no = PelunasanHutangStore.nextNo(row.kasBank);
      setVal('fNoTransaksi', current.no);
    }

    fillHeader(current);
    renderPengajuanField();
    renderBankTable();
    renderFakturTable();
    MockUI.toast('success', 'Data ditarik dari Pengajuan Pembayaran "' + req.no + '".');
  }

  function clearPengajuan() {
    current.pengajuanNo = '';
    renderPengajuanField();
  }

  // -----------------------------------------------------------------
  // Tabel Informasi Bank / Kurs
  // -----------------------------------------------------------------
  function renderBankTable() {
    var tbody = document.getElementById('bankTableBody');
    var rows = current.rincianRows;
    var canRemove = rows.length > 1;

    tbody.innerHTML = rows.map(function (r, idx) {
      var kode = PelunasanHutangStore.KAS_BANK_KODE[r.kasBank] || '';
      return (
        '<tr data-brow="' + idx + '">' +
          '<td class="readonly-cell">' + MockUI.esc(kode) + '</td>' +
          '<td><input type="text" data-bfield="kasBank" value="' + MockUI.esc(r.kasBank) + '" list="kasBankList" placeholder="Pilih Kas/Bank"></td>' +
          '<td><input type="text" data-bfield="crc" value="' + MockUI.esc(r.crc || 'IDR') + '" disabled></td>' +
          '<td><input type="text" inputmode="decimal" data-bfield="kurs" value="' + MockUI.formatCurrency(r.kurs != null ? r.kurs : 1) + '"></td>' +
          '<td><input type="text" inputmode="decimal" data-bfield="kursTarget" value="' + MockUI.formatCurrency(r.kursTarget != null ? r.kursTarget : 1) + '"></td>' +
          '<td><select data-bfield="tipeTransaksi"><option' + (r.tipeTransaksi === 'Keluar Kas' ? ' selected' : '') + '>Keluar Kas</option><option' + (r.tipeTransaksi === 'Terima Kas' ? ' selected' : '') + '>Terima Kas</option></select></td>' +
          '<td style="text-align:center;"><input type="checkbox" data-bfield="cair"' + (r.cair ? ' checked' : '') + '></td>' +
          '<td><input type="text" data-bfield="noGiro" value="' + MockUI.esc(r.noGiro || '') + '"></td>' +
          '<td><input type="date" data-bfield="tglJatuhTempo" value="' + MockUI.esc(r.tglJatuhTempo || '') + '"></td>' +
          '<td><div class="cell-with-search"><input type="text" data-bfield="jurnal" value="' + MockUI.esc(r.jurnal || '') + '" placeholder="Pilih jurnal"><button class="btn-icon blue" data-pick-jurnal="' + idx + '" type="button" title="Pilih Jurnal">&#128269;</button></div></td>' +
          '<td><input type="text" data-bfield="keterangan" value="' + MockUI.esc(r.keterangan || '') + '" placeholder="Keterangan"></td>' +
          '<td class="col-amount"><input type="text" inputmode="decimal" data-bfield="pembayaran" value="' + MockUI.formatCurrency(r.pembayaran) + '"></td>' +
          '<td class="col-action"><button class="btn-icon red" data-remove-bank="' + idx + '" title="Hapus baris"' + (canRemove ? '' : ' disabled') + ' type="button">&#128465;</button></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('input[data-bfield="kasBank"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var idx = bRowIndex(input);
        current.rincianRows[idx].kasBank = input.value;
      });
      input.addEventListener('change', function () {
        var idx = bRowIndex(input);
        syncCrcFromKasBank(idx, input.value);
      });
    });
    tbody.querySelectorAll('select[data-bfield="tipeTransaksi"]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var idx = bRowIndex(sel);
        current.rincianRows[idx].tipeTransaksi = sel.value;
        recalcBankSummary();
      });
    });
    tbody.querySelectorAll('input[data-bfield="cair"]').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var idx = bRowIndex(chk);
        current.rincianRows[idx].cair = chk.checked;
      });
    });
    tbody.querySelectorAll('input[data-bfield="noGiro"], input[data-bfield="jurnal"], input[data-bfield="keterangan"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var idx = bRowIndex(input);
        current.rincianRows[idx][input.getAttribute('data-bfield')] = input.value;
      });
    });
    tbody.querySelectorAll('input[data-bfield="tglJatuhTempo"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var idx = bRowIndex(input);
        current.rincianRows[idx].tglJatuhTempo = input.value;
      });
    });
    tbody.querySelectorAll('input[data-bfield="kurs"], input[data-bfield="kursTarget"], input[data-bfield="pembayaran"]').forEach(function (input) {
      input.addEventListener('focus', function () { input.select(); });
      input.addEventListener('input', function () {
        var idx = bRowIndex(input);
        var field = input.getAttribute('data-bfield');
        current.rincianRows[idx][field] = MockUI.parseLocaleNumber(input.value);
        recalcBankSummary();
      });
      input.addEventListener('blur', function () {
        var idx = bRowIndex(input);
        var field = input.getAttribute('data-bfield');
        input.value = MockUI.formatCurrency(current.rincianRows[idx][field]);
      });
    });
    tbody.querySelectorAll('[data-pick-jurnal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MockUI.toast('info', 'Gunakan kolom Jurnal untuk mengetik nama jurnal secara manual.');
      });
    });
    tbody.querySelectorAll('[data-remove-bank]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (current.rincianRows.length <= 1) return;
        var idx = parseInt(btn.getAttribute('data-remove-bank'), 10);
        current.rincianRows.splice(idx, 1);
        renderBankTable();
        recalcBankSummary();
      });
    });

    recalcBankSummary();
  }

  function bRowIndex(el) {
    var tr = el.closest('tr');
    return parseInt(tr.getAttribute('data-brow'), 10);
  }

  function syncCrcFromKasBank(idx, namaKasBank) {
    var acc = (window.KasBankStore ? KasBankStore.loadAll() : []).filter(function (a) { return a.nama === namaKasBank; })[0];
    if (acc) {
      current.rincianRows[idx].crc = acc.mataUang || 'IDR';
      // Deferred (setTimeout 0): rebuilding the table's innerHTML synchronously
      // from within the kasBank input's own native 'change' event can race with
      // the browser's blur/change completion cycle for that same input (see the
      // identical fix & explanation in transaksi-kasbank-form.js).
      setTimeout(function () {
        renderBankTable();
      }, 0);
    }
  }

  function addBankRow() {
    current.rincianRows.push(PelunasanHutangStore.emptyRincianRow());
    renderBankTable();
  }

  function recalcBankSummary() {
    var jumlahBank = current.rincianRows.reduce(function (s, r) {
      var amt = Number(r.pembayaran) || 0;
      return s + (r.tipeTransaksi === 'Terima Kas' ? amt : -amt);
    }, 0);
    var setelahKonversi = current.rincianRows.reduce(function (s, r) {
      var kurs = Number(r.kurs) || 1;
      var kursTarget = Number(r.kursTarget) || 1;
      var amt = (Number(r.pembayaran) || 0) * (kursTarget / kurs);
      return s + (r.tipeTransaksi === 'Terima Kas' ? amt : -amt);
    }, 0);
    var isTerima = current.rincianRows.length && current.rincianRows[0].tipeTransaksi === 'Terima Kas';
    document.getElementById('lblJumlahBank').textContent = isTerima ? 'Jumlah Terima Kas' : 'Jumlah Keluar Kas';
    setVal('sJumlahBank', MockUI.formatCurrency(Math.abs(jumlahBank)));
    setVal('sSetelahKonversi', MockUI.formatCurrency(Math.abs(setelahKonversi)));
    return Math.abs(jumlahBank);
  }

  // -----------------------------------------------------------------
  // Tab: Lunasi Beberapa Faktur
  // -----------------------------------------------------------------
  function buildFakturRows() {
    var supplier = getVal('fSupplier').trim();
    if (!supplier) return [];

    var faktur = FakturHutangStore.listBySupplier(supplier);
    var dibayarLain = {};
    PelunasanHutangStore.loadAll()
      .filter(function (p) { return p.no !== current.no; })
      .forEach(function (p) {
        (p.rincianFaktur || []).forEach(function (r) {
          if (!r.checked) return;
          dibayarLain[r.noFaktur] = (dibayarLain[r.noFaktur] || 0) + (Number(r.pembayaran) || 0);
        });
      });

    var selectedMap = {};
    current.rincianFaktur.forEach(function (r) { selectedMap[r.noFaktur] = r; });

    var rows = faktur.map(function (fk) {
      var sudahDibayar = dibayarLain[fk.noFaktur] || 0;
      var sisa = Math.round((fk.total - sudahDibayar) * 100) / 100;
      var sel = selectedMap[fk.noFaktur];
      return {
        noFaktur: fk.noFaktur, noInvoice: fk.noInvoice, dept: fk.dept, noPO: fk.noPO,
        tipeTransaksi: fk.tipeTransaksi, tglFaktur: fk.tglFaktur, tglJatuhTempo: fk.tglJatuhTempo,
        crc: fk.crc, kurs: fk.kurs, sisa: sisa,
        checked: sel ? !!sel.checked : false,
        pembayaran: sel ? (Number(sel.pembayaran) || 0) : 0
      };
    }).filter(function (r) { return r.sisa > 0.009 || r.checked; });

    var q = fakturSearch.trim().toLowerCase();
    if (q) {
      rows = rows.filter(function (r) {
        return (r.noFaktur + ' ' + (r.noInvoice || '')).toLowerCase().indexOf(q) !== -1;
      });
    }
    return rows;
  }

  function renderFakturTable() {
    var tbody = document.getElementById('fakturTableBody');
    var rows = buildFakturRows();

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="12" class="piutang-table-empty">' +
        (getVal('fSupplier').trim() ? 'Supplier ini tidak memiliki sisa Faktur Hutang yang cocok.' : 'Pilih / isi Dari Supplier terlebih dahulu untuk menampilkan daftar Faktur Hutang.') +
        '</td></tr>';
      updateTotalHutang();
      return;
    }

    tbody.innerHTML = rows.map(function (r, idx) {
      return (
        '<tr data-frow="' + idx + '" data-no-faktur="' + MockUI.esc(r.noFaktur) + '">' +
          '<td class="col-check"><input type="checkbox" data-ffield="checked"' + (r.checked ? ' checked' : '') + '></td>' +
          '<td>' + MockUI.esc(r.noFaktur) + '</td>' +
          '<td>' + MockUI.esc(r.noInvoice || '') + '</td>' +
          '<td>' + MockUI.esc(r.dept || '') + '</td>' +
          '<td>' + MockUI.esc(r.noPO || '') + '</td>' +
          '<td>' + MockUI.esc(r.tipeTransaksi) + '</td>' +
          '<td>' + MockUI.esc(formatTgl(r.tglFaktur)) + '</td>' +
          '<td>' + MockUI.esc(formatTgl(r.tglJatuhTempo)) + '</td>' +
          '<td>' + MockUI.esc(r.crc) + '</td>' +
          '<td>' + MockUI.formatCurrency(r.kurs) + '</td>' +
          '<td class="col-amount readonly-cell">' + MockUI.formatCurrency(r.sisa) + '</td>' +
          '<td class="col-amount"><input type="text" inputmode="decimal" data-ffield="pembayaran" value="' + MockUI.formatCurrency(r.pembayaran) + '"' + (r.checked ? '' : ' disabled') + '></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('input[data-ffield="checked"]').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var tr = chk.closest('tr');
        var noFaktur = tr.getAttribute('data-no-faktur');
        var rowData = buildFakturRows()[fRowIndex(chk)];
        setFakturRincian(noFaktur, chk.checked, chk.checked ? (rowData.pembayaran || rowData.sisa) : rowData.pembayaran);
        setTimeout(renderFakturTable, 0);
      });
    });
    tbody.querySelectorAll('input[data-ffield="pembayaran"]').forEach(function (input) {
      input.addEventListener('focus', function () { input.select(); });
      input.addEventListener('input', function () {
        var tr = input.closest('tr');
        var noFaktur = tr.getAttribute('data-no-faktur');
        var val = MockUI.parseLocaleNumber(input.value);
        setFakturRincian(noFaktur, true, val);
        updateTotalHutang();
      });
      input.addEventListener('blur', function () {
        var tr = input.closest('tr');
        var noFaktur = tr.getAttribute('data-no-faktur');
        var entry = current.rincianFaktur.filter(function (r) { return r.noFaktur === noFaktur; })[0];
        input.value = MockUI.formatCurrency(entry ? entry.pembayaran : 0);
      });
    });

    updateTotalHutang();
  }

  function fRowIndex(el) {
    var tr = el.closest('tr');
    return parseInt(tr.getAttribute('data-frow'), 10);
  }

  function setFakturRincian(noFaktur, checked, pembayaran) {
    var entry = current.rincianFaktur.filter(function (r) { return r.noFaktur === noFaktur; })[0];
    if (!entry) {
      entry = { noFaktur: noFaktur, checked: false, pembayaran: 0 };
      current.rincianFaktur.push(entry);
    }
    entry.checked = checked;
    entry.pembayaran = Math.round((Number(pembayaran) || 0) * 100) / 100;
  }

  function updateTotalHutang() {
    var total = current.rincianFaktur.reduce(function (s, r) {
      return s + (r.checked ? (Number(r.pembayaran) || 0) : 0);
    }, 0);
    setVal('sTotalHutang', MockUI.formatCurrency(total));
    return total;
  }

  function formatTgl(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p.length === 3 ? (p[2] + '/' + p[1] + '/' + p[0]) : iso;
  }

  // -----------------------------------------------------------------
  // Tab: Rincian Jurnal Akun
  // -----------------------------------------------------------------
  function renderJurnalTable() {
    var tbody = document.getElementById('jurnalTableBody');
    var rows = current.jurnalItems;

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:16px;font-style:italic;">Belum ada baris jurnal. Klik "Buat Jurnal" (mode otomatis) atau "+ Tambah Akun Baru" untuk menambah baris manual.</td></tr>';
    } else {
      tbody.innerHTML = rows.map(function (r, idx) {
        return (
          '<tr data-jrow="' + idx + '">' +
            '<td><input type="text" data-jfield="kodeAkun" value="' + MockUI.esc(r.kodeAkun) + '" placeholder="Kode akun"></td>' +
            '<td><input type="text" data-jfield="costCenter" value="' + MockUI.esc(r.costCenter || '') + '" placeholder="Cost center"></td>' +
            '<td><input type="text" data-jfield="namaAkun" value="' + MockUI.esc(r.namaAkun) + '" placeholder="Nama akun"></td>' +
            '<td><input type="text" data-jfield="keterangan" value="' + MockUI.esc(r.keterangan || '') + '" placeholder="Keterangan"></td>' +
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
    current.jurnalItems.push({ kodeAkun: '', costCenter: '', namaAkun: '', keterangan: getVal('fKeterangan'), debit: 0, kredit: 0 });
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
    var total = recalcBankSummary();
    var ket = getVal('fKeterangan');
    var firstRow = current.rincianRows[0];
    if (!firstRow || !firstRow.kasBank || total <= 0) {
      MockUI.toast('error', 'Isi minimal satu baris Informasi Bank/Kurs dengan Pembayaran lebih dari 0 sebelum membuat jurnal.');
      return;
    }
    current.jurnalItems = PelunasanHutangStore.buildJurnal(firstRow.kasBank, firstRow.tipeTransaksi, total, ket);
    renderJurnalTable();
    MockUI.toast('success', 'Jurnal otomatis dibuat: Hutang Usaha (debit) vs ' + firstRow.kasBank + ' (kredit).');
  }

  // -----------------------------------------------------------------
  // Tabs
  // -----------------------------------------------------------------
  function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === tab);
    });
    document.getElementById('panel-lunasi-faktur').classList.toggle('is-active', tab === 'lunasi-faktur');
    document.getElementById('panel-rincian-jurnal').classList.toggle('is-active', tab === 'rincian-jurnal');
  }

  // -----------------------------------------------------------------
  // Simpan
  // -----------------------------------------------------------------
  function collectFormIntoCurrent() {
    current.departemen = getVal('fDepartemen');
    current.supplier = getVal('fSupplier').trim();
    current.tglTrn = getVal('fTglTrn');
    current.keterangan = getVal('fKeterangan');
    current.overrideTidakSama = document.getElementById('fOverrideTidakSama').checked;
    current.jurnalMode = (document.querySelector('input[name="fJurnalMode"]:checked') || {}).value || 'otomatis';
    current.rincianFaktur = current.rincianFaktur.filter(function (r) { return r.checked && (Number(r.pembayaran) || 0) > 0; });
  }

  function validate() {
    if (!getVal('fSupplier').trim()) {
      MockUI.toast('error', 'Dari Supplier wajib diisi.');
      return false;
    }
    if (!current.rincianRows.some(function (r) { return r.kasBank && (Number(r.pembayaran) || 0) > 0; })) {
      MockUI.toast('error', 'Tambahkan minimal satu baris Informasi Bank/Kurs dengan Pembayaran lebih dari 0.');
      return false;
    }
    var totalHutang = updateTotalHutang();
    if (totalHutang <= 0) {
      MockUI.toast('error', 'Pilih minimal satu baris pada tab "Lunasi Beberapa Faktur" dengan jumlah Pembayaran lebih dari 0.');
      return false;
    }
    var jumlahBank = recalcBankSummary();
    var override = document.getElementById('fOverrideTidakSama').checked;
    if (Math.abs(jumlahBank - totalHutang) >= 0.01 && !override) {
      MockUI.toast('error', 'Jumlah Bank (' + MockUI.formatCurrency(jumlahBank) + ') tidak sama dengan Total Hutang Dibayar (' + MockUI.formatCurrency(totalHutang) + '). Centang "Total keluar kas tidak sama dengan hutang?" jika ingin tetap menyimpan.');
      return false;
    }
    return true;
  }

  function onSimpan(thenPrint) {
    collectFormIntoCurrent();
    if (!validate()) return;
    PelunasanHutangStore.upsert(current);
    // Jika transaksi ini ditarik dari sebuah Pengajuan Pembayaran, tandai
    // Pengajuan tsb menjadi "Paid" sekarang bahwa pembayarannya sudah
    // benar-benar dieksekusi.
    if (current.pengajuanNo && window.PengajuanPembayaranStore) {
      var req = PengajuanPembayaranStore.getByNo(current.pengajuanNo);
      if (req && req.status === 'Approved') {
        req.status = 'Paid';
        req.activityLog = req.activityLog || [];
        req.activityLog.push({ action: 'Dibayar Oleh', user: current.departemen ? current.supplier : 'mas', at: new Date().toISOString() });
        PengajuanPembayaranStore.upsert(req);
      }
    }
    isNew = false;
    MockUI.toast('success', (thenPrint ? 'Transaksi disimpan, siap dicetak (di luar cakupan mockup ini). ' : '') + 'Pelunasan Hutang "' + current.no + '" berhasil disimpan.');
    setTimeout(function () { window.location.href = 'daftar-pelunasan-hutang.html'; }, 800);
  }

  function bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { switchTab(btn.getAttribute('data-tab')); });
    });

    document.getElementById('btnAddBankRow').addEventListener('click', addBankRow);
    document.getElementById('btnAddJurnal').addEventListener('click', addJurnalRow);
    document.getElementById('btnBuatJurnal').addEventListener('click', buatJurnalOtomatis);
    document.getElementById('btnSimpan').addEventListener('click', function () { onSimpan(false); });
    document.getElementById('btnCetakSimpan').addEventListener('click', function () { onSimpan(true); });

    document.getElementById('searchFaktur').addEventListener('input', function (e) {
      fakturSearch = e.target.value;
      renderFakturTable();
    });

    var fSupplier = document.getElementById('fSupplier');
    fSupplier.addEventListener('change', function () {
      if (current.pengajuanNo) current.pengajuanNo = '';
      current.rincianFaktur = [];
      setTimeout(function () {
        renderPengajuanField();
        renderFakturTable();
      }, 0);
    });

    document.getElementById('btnRegenNo').addEventListener('click', function () {
      if (!isNew) {
        MockUI.toast('info', 'Nomor transaksi tidak dapat diubah setelah tersimpan.');
        return;
      }
      var firstBank = current.rincianRows[0];
      current.no = PelunasanHutangStore.nextNo(firstBank ? firstBank.kasBank : '');
      setVal('fNoTransaksi', current.no);
      MockUI.toast('info', 'Nomor transaksi diperbarui: ' + current.no);
    });
    document.getElementById('btnPickSupplier').addEventListener('click', function () {
      MockUI.toast('info', 'Gunakan kolom Dari Supplier untuk mengetik/mencari nama (data dari Master Vendor & Faktur Hutang).');
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Isi Dari Supplier (atau tarik dari Pengajuan Pembayaran yang Approved), pilih Faktur pada tab "Lunasi Beberapa Faktur", lalu klik "Buat Jurnal".', 5500);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
