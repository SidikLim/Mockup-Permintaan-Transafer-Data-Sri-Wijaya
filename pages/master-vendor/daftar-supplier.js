/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   daftar-supplier.js - logika halaman Daftar Supplier
   =========================================================== */

(function () {
  var state = {
    all: [],
    filtered: [],
    page: 1,
    pageSize: 10,
    search: ''
  };

  function init() {
    MockUI.mountShell('supplier');
    state.all = SupplierStore.loadAll();
    applyFilter();
    bindEvents();
  }

  function applyFilter() {
    var q = state.search.trim().toLowerCase();
    state.filtered = !q ? state.all.slice() : state.all.filter(function (s) {
      return (s.kode + ' ' + s.nama + ' ' + s.alamat).toLowerCase().indexOf(q) !== -1;
    });
    state.page = 1;
    render();
  }

  function totalPages() {
    return Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  }

  function render() {
    renderTable();
    renderPagination();
    document.getElementById('totalRecord').textContent = 'Total Record: ' + state.filtered.length;
  }

  function renderTable() {
    var tbody = document.getElementById('tableBody');
    var start = (state.page - 1) * state.pageSize;
    var pageItems = state.filtered.slice(start, start + state.pageSize);

    if (!pageItems.length) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:24px;">Tidak ada data supplier yang cocok.</td></tr>';
      return;
    }

    tbody.innerHTML = pageItems.map(function (s) {
      var bankCount = (s.rekeningBank || []).length;
      var bankPill = bankCount > 0
        ? '<span class="count-pill">' + bankCount + ' Rekening</span>'
        : '<span class="count-pill is-empty">Belum ada</span>';
      return (
        '<tr>' +
          '<td><a href="supplier-form.html?kode=' + encodeURIComponent(s.kode) + '" style="color:var(--sidebar-active-text);font-weight:600;">' + MockUI.esc(s.prefix + '-' + s.kode.replace('SP-', '') + s.mataUang) + '</a></td>' +
          '<td>' + MockUI.esc(s.nama) + '</td>' +
          '<td>' + MockUI.esc(s.mataUang) + '</td>' +
          '<td>' + MockUI.esc(s.alamat) + '</td>' +
          '<td class="num">' + MockUI.formatCurrency(s.uangMuka) + '</td>' +
          '<td class="num">' + MockUI.formatCurrency(s.saldoUtang) + '</td>' +
          '<td>' + bankPill + '</td>' +
          '<td><button class="btn btn-outline btn-sm" data-attach="' + MockUI.esc(s.kode) + '" type="button">&#128206; 0 Files</button></td>' +
          '<td><a class="btn-icon blue" href="supplier-form.html?kode=' + encodeURIComponent(s.kode) + '" title="Ubah">&#9998;</a></td>' +
          '<td><button class="btn-icon red" data-delete="' + MockUI.esc(s.kode) + '" title="Hapus" type="button">&#128465;</button></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('[data-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () { onDelete(btn.getAttribute('data-delete')); });
    });
    tbody.querySelectorAll('[data-attach]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MockUI.toast('info', 'Fitur lampiran file belum diimplementasikan pada mockup ini.');
      });
    });
  }

  function renderPagination() {
    var wrap = document.getElementById('paginationPages');
    var pages = totalPages();
    var html = '';
    html += '<button class="page-btn" id="pgFirst"' + (state.page === 1 ? ' disabled' : '') + '>First</button>';
    html += '<button class="page-btn" id="pgPrev"' + (state.page === 1 ? ' disabled' : '') + '>Previous</button>';
    var startP = Math.max(1, state.page - 2);
    var endP = Math.min(pages, startP + 4);
    for (var p = startP; p <= endP; p++) {
      html += '<button class="page-btn' + (p === state.page ? ' is-active' : '') + '" data-page="' + p + '">' + p + '</button>';
    }
    html += '<button class="page-btn" id="pgNext"' + (state.page === pages ? ' disabled' : '') + '>Next</button>';
    html += '<button class="page-btn" id="pgLast"' + (state.page === pages ? ' disabled' : '') + '>Last</button>';
    wrap.innerHTML = html;

    var first = document.getElementById('pgFirst');
    var prev = document.getElementById('pgPrev');
    var next = document.getElementById('pgNext');
    var last = document.getElementById('pgLast');
    if (first) first.addEventListener('click', function () { state.page = 1; render(); });
    if (prev) prev.addEventListener('click', function () { state.page = Math.max(1, state.page - 1); render(); });
    if (next) next.addEventListener('click', function () { state.page = Math.min(pages, state.page + 1); render(); });
    if (last) last.addEventListener('click', function () { state.page = pages; render(); });
    wrap.querySelectorAll('[data-page]').forEach(function (btn) {
      btn.addEventListener('click', function () { state.page = parseInt(btn.getAttribute('data-page'), 10); render(); });
    });
  }

  function onDelete(kode) {
    var s = SupplierStore.getByKode(kode);
    if (!s) return;
    MockUI.confirmDialog({
      title: 'Hapus Supplier',
      message: 'Hapus supplier "' + s.nama + '" (' + s.kode + ')? Data rekening bank terkait juga akan terhapus.',
      confirmLabel: 'Hapus'
    }, function () {
      SupplierStore.removeByKode(kode);
      state.all = SupplierStore.loadAll();
      applyFilter();
      MockUI.toast('success', 'Supplier "' + s.nama + '" berhasil dihapus.');
    });
  }

  function bindEvents() {
    document.getElementById('searchInput').addEventListener('input', function (e) {
      state.search = e.target.value;
      applyFilter();
    });
    document.getElementById('pageSize').addEventListener('change', function (e) {
      state.pageSize = parseInt(e.target.value, 10);
      state.page = 1;
      render();
    });
    document.getElementById('btnTambah').addEventListener('click', function () {
      window.location.href = 'supplier-form.html';
    });
    document.getElementById('btnGeneratePpn').addEventListener('click', function () {
      MockUI.toast('info', 'Generate Default Type PPN berada di luar cakupan mockup tahap ini.');
    });
    document.getElementById('btnUangMuka2').addEventListener('click', function () {
      MockUI.toast('info', 'Fitur Uang Muka 2 berada di luar cakupan mockup tahap ini.');
    });
    document.getElementById('btnImport').addEventListener('click', function () {
      MockUI.toast('info', 'Impor Supplier berada di luar cakupan mockup tahap ini.');
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Mockup Master Vendor - tahap awal proyek Permintaan Transfer Dana Sri Wijaya.', 4500);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
