/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   pengembalian-kasbon-form.js - logika form Pengembalian Kas Bon
   ("+ Penerimaan Piutang").

   Alur:
   - Pilih Karyawan -> tab "Piutang Karyawan" menampilkan seluruh
     transaksi Kas Bon karyawan tsb yang masih memiliki Sisa Total
     (setelah dikurangi pengembalian yang tercatat pada transaksi
     LAIN), plus baris yang sudah dipilih pada transaksi ini sendiri
     (saat mode ubah).
   - Centang "Bayar" pada satu/lebih baris -> field "Terima
     Pengembalian BS" aktif, default terisi sebesar Sisa Total, bisa
     diubah manual.
   - "Total Terima Pengembalian" = total seluruh baris yang dicentang.
   - Tabel "Informasi Bank / Kurs" mencatat dari akun kas/bank mana
     dana diterima; "Jumlah Bank" = total kolom "Jumlah Yang Dibayar".
   - Saat disimpan, Jumlah Bank pada tabel Bank/Kurs idealnya sama
     dengan Total Terima Pengembalian; jika tidak sama, penyimpanan
     ditolak KECUALI checkbox "Jumlah penerimaan tidak sama dengan
     piutang dapat disimpan?" dicentang.
   - "Buat Jurnal" (mode otomatis) membalik jurnal Kas Bon asli:
     Debit akun Kas/Bank (uang diterima) vs Kredit Piutang Karyawan
     (piutang berkurang), sebesar Total Terima Pengembalian. Ini
     adalah asumsi logika akuntansi yang wajar untuk mockup ini -
     silakan koreksi jika pola jurnal aslinya berbeda.
   =========================================================== */

(function () {
  var current = null;
  var isNew = false;
  var activeTab = 'piutang-karyawan';

  function init() {
    MockUI.mountShell('pengembalian-kas-bon');
    populateKaryawanList();

    var no = MockUI.qs('no');
    if (no) {
      current = PengembalianKasbonStore.getByNo(no);
      if (!current) {
        MockUI.toast('error', 'Transaksi dengan nomor "' + no + '" tidak ditemukan.');
        current = PengembalianKasbonStore.emptyTransaction();
        isNew = true;
      }
    } else {
      current = PengembalianKasbonStore.emptyTransaction();
      isNew = true;
    }
    if (!current.bankRows) current.bankRows = [];
    if (!current.rincianPiutang) current.rincianPiutang = [];
    if (!current.jurnalItems) current.jurnalItems = [];

    document.getElementById('pageTitle').innerHTML = isNew
      ? '+ Pengembalian Kas Bon'
      : '&#9998; Pengembalian Kas Bon - ' + MockUI.esc(current.no);

    fillHeader(current);
    renderBankTable();
    renderPiutangTable();
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

  function fillHeader(t) {
    setVal('fNoTransaksi', t.no || '');
    setVal('fDepartemen', t.departemen || 'GA-HR');
    setVal('fProyek', t.proyek || '');
    setVal('fKaryawan', t.karyawan || '');
    setVal('fTglTrn', t.tglTrn || '');
    setVal('fKeterangan', t.keterangan || '');
    document.getElementById('fOverrideTidakSama').checked = !!t.overrideTidakSama;

    var jurnalRadios = document.getElementsByName('fJurnalMode');
    jurnalRadios.forEach(function (r) { r.checked = (r.value === (t.jurnalMode || 'otomatis')); });
  }

  // -----------------------------------------------------------------
  // Tabel Informasi Bank / Kurs
  // -----------------------------------------------------------------
  function renderBankTable() {
    var tbody = document.getElementById('bankTableBody');
    var rows = current.bankRows;

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:16px;font-style:italic;">Belum ada baris bank/kurs. Klik "+ Tambah Baris" untuk menambah.</td></tr>';
    } else {
      tbody.innerHTML = rows.map(function (r, idx) {
        return (
          '<tr data-brow="' + idx + '">' +
            '<td><input type="text" data-bfield="akunBank" value="' + MockUI.esc(r.akunBank) + '" list="akunBankList" placeholder="Pilih akun bank"></td>' +
            '<td><input type="text" data-bfield="namaBank" value="' + MockUI.esc(r.namaBank) + '" placeholder="Nama bank"></td>' +
            '<td><input type="text" inputmode="decimal" data-bfield="kurs" value="' + MockUI.formatCurrency(r.kurs != null ? r.kurs : 1) + '"></td>' +
            '<td><input type="text" inputmode="decimal" data-bfield="kursIdr" value="' + MockUI.formatCurrency(r.kursIdr != null ? r.kursIdr : 1) + '"></td>' +
            '<td><input type="text" inputmode="decimal" data-bfield="kursTargetIdr" value="' + MockUI.formatCurrency(r.kursTargetIdr != null ? r.kursTargetIdr : 1) + '"></td>' +
            '<td><select data-bfield="tipeTransaksi"><option' + (r.tipeTransaksi === 'Penerimaan' ? ' selected' : '') + '>Penerimaan</option><option' + (r.tipeTransaksi === 'Pengeluaran' ? ' selected' : '') + '>Pengeluaran</option></select></td>' +
            '<td><input type="text" data-bfield="jurnal" value="' + MockUI.esc(r.jurnal) + '" list="akunBankList" placeholder="Akun jurnal"></td>' +
            '<td><input type="text" data-bfield="keterangan" value="' + MockUI.esc(r.keterangan || '') + '" placeholder="Keterangan"></td>' +
            '<td class="col-amount"><input type="text" inputmode="decimal" data-bfield="jumlahDibayar" value="' + MockUI.formatCurrency(r.jumlahDibayar) + '"></td>' +
            '<td class="col-action"><button class="btn-icon red" data-remove-bank="' + idx + '" title="Hapus baris" type="button">&#128465;</button></td>' +
          '</tr>'
        );
      }).join('');
    }

    tbody.querySelectorAll('input[data-bfield="akunBank"], input[data-bfield="namaBank"], input[data-bfield="jurnal"], input[data-bfield="keterangan"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var idx = bRowIndex(input);
        current.bankRows[idx][input.getAttribute('data-bfield')] = input.value;
      });
    });
    tbody.querySelectorAll('select[data-bfield="tipeTransaksi"]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var idx = bRowIndex(sel);
        current.bankRows[idx].tipeTransaksi = sel.value;
      });
    });
    tbody.querySelectorAll('input[data-bfield="kurs"], input[data-bfield="kursIdr"], input[data-bfield="kursTargetIdr"], input[data-bfield="jumlahDibayar"]').forEach(function (input) {
      input.addEventListener('focus', function () { input.select(); });
      input.addEventListener('input', function () {
        var idx = bRowIndex(input);
        var field = input.getAttribute('data-bfield');
        current.bankRows[idx][field] = MockUI.parseLocaleNumber(input.value);
        recalcBankSummary();
      });
      input.addEventListener('blur', function () {
        var idx = bRowIndex(input);
        var field = input.getAttribute('data-bfield');
        input.value = MockUI.formatCurrency(current.bankRows[idx][field]);
      });
    });
    tbody.querySelectorAll('[data-remove-bank]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-remove-bank'), 10);
        current.bankRows.splice(idx, 1);
        renderBankTable();
      });
    });
    recalcBankSummary();
  }

  function bRowIndex(el) {
    var tr = el.closest('tr');
    return parseInt(tr.getAttribute('data-brow'), 10);
  }

  function addBankRow() {
    current.bankRows.push({ akunBank: 'Kas Kecil - HO', namaBank: 'Kas Kecil - HO', kurs: 1, kursIdr: 1, kursTargetIdr: 1, tipeTransaksi: 'Penerimaan', jurnal: 'Kas Kecil - HO', keterangan: getVal('fKeterangan'), jumlahDibayar: 0 });
    renderBankTable();
  }

  function recalcBankSummary() {
    var jumlahBank = current.bankRows.reduce(function (s, r) { return s + (Number(r.jumlahDibayar) || 0); }, 0);
    var setelahKonversi = current.bankRows.reduce(function (s, r) {
      var kursIdr = Number(r.kursIdr) || 1;
      var kursTarget = Number(r.kursTargetIdr) || 1;
      return s + (Number(r.jumlahDibayar) || 0) * (kursTarget / kursIdr);
    }, 0);
    setVal('sJumlahBank', MockUI.formatCurrency(jumlahBank));
    setVal('sSetelahKonversi', MockUI.formatCurrency(setelahKonversi));
  }

  // -----------------------------------------------------------------
  // Tab: Piutang Karyawan
  // -----------------------------------------------------------------
  function buildPiutangRows() {
    var karyawan = getVal('fKaryawan').trim();
    if (!karyawan || !window.KasbonStore) return [];

    var kasbonList = KasbonStore.loadAll().filter(function (k) { return k.karyawan === karyawan; });
    var pengembalianLain = (window.PengembalianKasbonStore ? PengembalianKasbonStore.loadAll() : [])
      .filter(function (p) { return p.no !== current.no; });

    var dibayarPihakLain = {};
    pengembalianLain.forEach(function (p) {
      (p.rincianPiutang || []).forEach(function (r) {
        if (!r.bayar) return;
        dibayarPihakLain[r.kasbonNo] = (dibayarPihakLain[r.kasbonNo] || 0) + (Number(r.terimaPengembalian) || 0);
      });
    });

    var selectedMap = {};
    current.rincianPiutang.forEach(function (r) { selectedMap[r.kasbonNo] = r; });

    var rows = kasbonList.map(function (k) {
      var sudahDibayarLain = dibayarPihakLain[k.no] || 0;
      var sisaTotal = Math.round((k.jumlah - sudahDibayarLain) * 100) / 100;
      var sel = selectedMap[k.no];
      return {
        no: k.no, tipeTransaksi: 'Kas Bon', tglFaktur: k.tglTrn, tglJthTempo: k.tglTrn,
        crc: k.mataUangKaryawan || 'IDR', kurs: k.kursKaryawan || 1,
        sisaTotal: sisaTotal,
        bayar: sel ? !!sel.bayar : false,
        terimaPengembalian: sel ? (Number(sel.terimaPengembalian) || 0) : 0
      };
    }).filter(function (r) { return r.sisaTotal > 0.009 || r.bayar; });

    return rows;
  }

  function renderPiutangTable() {
    var tbody = document.getElementById('piutangTableBody');
    var rows = buildPiutangRows();

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="piutang-table-empty">' +
        (getVal('fKaryawan').trim() ? 'Karyawan ini tidak memiliki sisa piutang Kas Bon.' : 'Pilih Karyawan terlebih dahulu untuk menampilkan daftar piutang Kas Bon.') +
        '</td></tr>';
      updateTotalTerima();
      return;
    }

    tbody.innerHTML = rows.map(function (r, idx) {
      return (
        '<tr data-prow="' + idx + '" data-kasbon-no="' + MockUI.esc(r.no) + '">' +
          '<td class="col-check"><input type="checkbox" data-pfield="bayar"' + (r.bayar ? ' checked' : '') + '></td>' +
          '<td>' + MockUI.esc(r.no) + '</td>' +
          '<td>' + MockUI.esc(r.tipeTransaksi) + '</td>' +
          '<td>' + MockUI.esc(formatTgl(r.tglFaktur)) + '</td>' +
          '<td>' + MockUI.esc(formatTgl(r.tglJthTempo)) + '</td>' +
          '<td>' + MockUI.esc(r.crc) + '</td>' +
          '<td>' + MockUI.formatCurrency(r.kurs) + '</td>' +
          '<td class="col-amount readonly-cell">' + MockUI.formatCurrency(r.sisaTotal) + '</td>' +
          '<td class="col-amount"><input type="text" inputmode="decimal" data-pfield="terimaPengembalian" value="' + MockUI.formatCurrency(r.terimaPengembalian) + '"' + (r.bayar ? '' : ' disabled') + '></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('input[data-pfield="bayar"]').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var tr = chk.closest('tr');
        var kasbonNo = tr.getAttribute('data-kasbon-no');
        var rowData = buildPiutangRows()[pRowIndex(chk)];
        setRincian(kasbonNo, chk.checked, chk.checked ? (rowData.terimaPengembalian || rowData.sisaTotal) : rowData.terimaPengembalian);
        renderPiutangTable();
      });
    });
    tbody.querySelectorAll('input[data-pfield="terimaPengembalian"]').forEach(function (input) {
      input.addEventListener('focus', function () { input.select(); });
      input.addEventListener('input', function () {
        var tr = input.closest('tr');
        var kasbonNo = tr.getAttribute('data-kasbon-no');
        var val = MockUI.parseLocaleNumber(input.value);
        setRincian(kasbonNo, true, val);
        updateTotalTerima();
      });
      input.addEventListener('blur', function () {
        var tr = input.closest('tr');
        var kasbonNo = tr.getAttribute('data-kasbon-no');
        var entry = current.rincianPiutang.filter(function (r) { return r.kasbonNo === kasbonNo; })[0];
        input.value = MockUI.formatCurrency(entry ? entry.terimaPengembalian : 0);
      });
    });

    updateTotalTerima();
  }

  function pRowIndex(el) {
    var tr = el.closest('tr');
    return parseInt(tr.getAttribute('data-prow'), 10);
  }

  function setRincian(kasbonNo, bayar, jumlah) {
    var entry = current.rincianPiutang.filter(function (r) { return r.kasbonNo === kasbonNo; })[0];
    if (!entry) {
      entry = { kasbonNo: kasbonNo, bayar: false, terimaPengembalian: 0 };
      current.rincianPiutang.push(entry);
    }
    entry.bayar = bayar;
    entry.terimaPengembalian = Math.round((Number(jumlah) || 0) * 100) / 100;
  }

  function updateTotalTerima() {
    var total = current.rincianPiutang.reduce(function (s, r) {
      return s + (r.bayar ? (Number(r.terimaPengembalian) || 0) : 0);
    }, 0);
    setVal('sTotalTerima', MockUI.formatCurrency(total));
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
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:16px;font-style:italic;">Belum ada baris jurnal. Klik "Buat Jurnal" (mode otomatis) atau "+ Tambah" untuk menambah baris manual.</td></tr>';
    } else {
      tbody.innerHTML = rows.map(function (r, idx) {
        return (
          '<tr data-jrow="' + idx + '">' +
            '<td><input type="text" data-jfield="kodeAkun" value="' + MockUI.esc(r.kodeAkun) + '" placeholder="Kode akun"></td>' +
            '<td><input type="text" data-jfield="costCenter" value="' + MockUI.esc(r.costCenter || '') + '" placeholder="Cost center"></td>' +
            '<td><input type="text" data-jfield="namaAkun" value="' + MockUI.esc(r.namaAkun) + '" placeholder="Nama akun"></td>' +
            '<td><input type="text" data-jfield="keterangan" value="' + MockUI.esc(r.keterangan || '') + '" placeholder="Keterangan"></td>' +
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
    var total = updateTotalTerima();
    var ket = getVal('fKeterangan');
    var firstBank = current.bankRows[0];
    var kasBankNama = (firstBank && firstBank.jurnal) || 'Kas Kecil - HO';
    var kasBankKode = PengembalianKasbonStore.KAS_BANK_KODE[kasBankNama] || '11010120';

    current.jurnalItems = [
      { kodeAkun: kasBankKode, costCenter: '', namaAkun: kasBankNama, keterangan: ket, komponen: '', debit: total, kredit: 0 },
      { kodeAkun: PengembalianKasbonStore.AKUN_PIUTANG_KARYAWAN, costCenter: '', namaAkun: PengembalianKasbonStore.NAMA_PIUTANG_KARYAWAN, keterangan: ket, komponen: '', debit: 0, kredit: total }
    ];
    renderJurnalTable();
    MockUI.toast('success', 'Jurnal otomatis dibuat: ' + kasBankNama + ' (debit) vs Piutang Karyawan (kredit) - kebalikan dari jurnal Kas Bon.');
  }

  // -----------------------------------------------------------------
  // Tabs
  // -----------------------------------------------------------------
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === tab);
    });
    document.getElementById('panel-piutang-karyawan').classList.toggle('is-active', tab === 'piutang-karyawan');
    document.getElementById('panel-rincian-jurnal').classList.toggle('is-active', tab === 'rincian-jurnal');
  }

  // -----------------------------------------------------------------
  // Simpan
  // -----------------------------------------------------------------
  function collectFormIntoCurrent() {
    current.departemen = getVal('fDepartemen');
    current.proyek = getVal('fProyek');
    current.karyawan = getVal('fKaryawan').trim();
    current.tglTrn = getVal('fTglTrn');
    current.keterangan = getVal('fKeterangan');
    current.overrideTidakSama = document.getElementById('fOverrideTidakSama').checked;
    current.jurnalMode = (document.querySelector('input[name="fJurnalMode"]:checked') || {}).value || 'otomatis';
    current.rincianPiutang = current.rincianPiutang.filter(function (r) { return r.bayar && (Number(r.terimaPengembalian) || 0) > 0; });
  }

  function validate() {
    if (!getVal('fKaryawan').trim()) {
      MockUI.toast('error', 'Karyawan wajib diisi.');
      return false;
    }
    var totalTerima = updateTotalTerima();
    if (totalTerima <= 0) {
      MockUI.toast('error', 'Pilih minimal satu baris pada tab "Piutang Karyawan" dengan jumlah Terima Pengembalian lebih dari 0.');
      return false;
    }
    var jumlahBank = current.bankRows.reduce(function (s, r) { return s + (Number(r.jumlahDibayar) || 0); }, 0);
    var override = document.getElementById('fOverrideTidakSama').checked;
    if (Math.abs(jumlahBank - totalTerima) >= 0.01 && !override) {
      MockUI.toast('error', 'Jumlah Bank (' + MockUI.formatCurrency(jumlahBank) + ') tidak sama dengan Total Terima Pengembalian (' + MockUI.formatCurrency(totalTerima) + '). Centang "Jumlah penerimaan tidak sama dengan piutang dapat disimpan?" jika ingin tetap menyimpan.');
      return false;
    }
    return true;
  }

  function onSimpan() {
    collectFormIntoCurrent();
    if (!validate()) return;
    PengembalianKasbonStore.upsert(current);
    isNew = false;
    MockUI.toast('success', 'Transaksi Pengembalian Kas Bon "' + current.no + '" berhasil disimpan.');
    setTimeout(function () { window.location.href = 'daftar-pengembalian-kasbon.html'; }, 800);
  }

  function bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { switchTab(btn.getAttribute('data-tab')); });
    });

    document.getElementById('btnAddBankRow').addEventListener('click', addBankRow);
    document.getElementById('btnAddJurnal').addEventListener('click', addJurnalRow);
    document.getElementById('btnBuatJurnal').addEventListener('click', buatJurnalOtomatis);
    document.getElementById('btnSimpan').addEventListener('click', onSimpan);

    var fKaryawan = document.getElementById('fKaryawan');
    fKaryawan.addEventListener('change', function () {
      current.rincianPiutang = [];
      renderPiutangTable();
    });
    fKaryawan.addEventListener('blur', function () {
      renderPiutangTable();
    });

    document.getElementById('btnRegenNo').addEventListener('click', function () {
      if (!isNew) {
        MockUI.toast('info', 'Nomor transaksi tidak dapat diubah setelah tersimpan.');
        return;
      }
      current.no = PengembalianKasbonStore.nextNo();
      setVal('fNoTransaksi', current.no);
      MockUI.toast('info', 'Nomor transaksi diperbarui: ' + current.no);
    });
    document.getElementById('btnPickKaryawan').addEventListener('click', function () {
      MockUI.toast('info', 'Gunakan kolom Karyawan untuk mengetik/mencari nama (data dari Master Karyawan).');
    });
    document.getElementById('btnPickProyek').addEventListener('click', function () {
      MockUI.toast('info', 'Pemilihan Proyek berada di luar cakupan mockup ini.');
    });
    document.getElementById('btnActivityLog').addEventListener('click', function () {
      MockUI.toast('info', 'Activity Log berada di luar cakupan mockup ini.');
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Pilih Karyawan, centang baris piutang Kas Bon yang dibayar pada tab "Piutang Karyawan", lalu klik "Buat Jurnal".', 5500);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
