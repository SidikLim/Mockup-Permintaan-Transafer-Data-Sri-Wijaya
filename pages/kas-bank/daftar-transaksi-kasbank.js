/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   daftar-transaksi-kasbank.js - logika halaman Daftar Transaksi
   Kas / Bank
   =========================================================== */

(function () {
  var state = { all: [], filtered: [], page: 1, pageSize: 10, search: '' };

  function init() {
    MockUI.mountShell('transaksi-kasbank');
    state.all = TransaksiKasBankStore.loadAll();
    applyFilter();
    bindEvents();
  }

  function applyFilter() {
    var q = state.search.trim().toLowerCase();
    state.filtered = !q ? state.all.slice() : state.all.filter(function (t) {
      return (t.no + ' ' + (t.keterangan || '')).toLowerCase().indexOf(q) !== -1;
    });
    state.filtered.sort(function (a, b) { return (b.tglTrn + b.no).localeCompare(a.tglTrn + a.no); });
    state.page = 1;
    render();
  }

  function totalPages() { return Math.max(1, Math.ceil(state.filtered.length / state.pageSize)); }

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
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:24px;">Tidak ada data Transaksi Kas/Bank yang cocok.</td></tr>';
      return;
    }

    tbody.innerHTML = pageItems.map(function (t) {
      var total = TransaksiKasBankStore.totalOf(t);
      var crc = (t.rincianRows && t.rincianRows[0] && t.rincianRows[0].crc) || 'IDR';
      return (
        '<tr>' +
          '<td><a href="transaksi-kasbank-form.html?no=' + encodeURIComponent(t.no) + '" style="color:var(--sidebar-active-text);font-weight:600;">' + MockUI.esc(t.no) + '</a></td>' +
          '<td>' + MockUI.esc(formatTgl(t.tglTrn)) + '</td>' +
          '<td>' + MockUI.esc(t.keterangan || '') + '</td>' +
          '<td class="num">' + MockUI.formatCurrency(total) + '</td>' +
          '<td>' + MockUI.esc(crc) + '</td>' +
          '<td><a class="btn-icon blue" href="transaksi-kasbank-form.html?no=' + encodeURIComponent(t.no) + '" title="Ubah">&#9998;</a></td>' +
          '<td><button class="btn-icon red" data-delete="' + MockUI.esc(t.no) + '" title="Hapus" type="button">&#128465;</button></td>' +
          '<td><button class="btn-icon teal" data-view="' + MockUI.esc(t.no) + '" title="Lihat" type="button">&#128065;</button></td>' +
          '<td><button class="btn-icon teal" data-print="' + MockUI.esc(t.no) + '" title="Cetak" type="button">&#128424;</button></td>' +
          '<td><button class="btn-icon teal" data-gl="' + MockUI.esc(t.no) + '" title="Lihat G.L." type="button">&#128065;</button></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('[data-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () { onDelete(btn.getAttribute('data-delete')); });
    });
    tbody.querySelectorAll('[data-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MockUI.toast('info', 'Pratinjau transaksi berada di luar cakupan mockup ini. Gunakan tombol Ubah untuk melihat detail.');
      });
    });
    tbody.querySelectorAll('[data-print]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MockUI.toast('info', 'Cetak bukti transaksi kas/bank berada di luar cakupan mockup ini.');
      });
    });
    tbody.querySelectorAll('[data-gl]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MockUI.toast('info', 'Tampilan General Ledger berada di luar cakupan mockup ini.');
      });
    });
  }

  function formatTgl(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p.length === 3 ? (p[2] + '/' + p[1] + '/' + p[0]) : iso;
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

  function onDelete(no) {
    var t = TransaksiKasBankStore.getByNo(no);
    if (!t) return;
    MockUI.confirmDialog({
      title: 'Hapus Transaksi Kas/Bank',
      message: 'Hapus transaksi "' + t.no + '"?',
      confirmLabel: 'Hapus'
    }, function () {
      TransaksiKasBankStore.removeByNo(no);
      state.all = TransaksiKasBankStore.loadAll();
      applyFilter();
      MockUI.toast('success', 'Transaksi "' + t.no + '" berhasil dihapus.');
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
      window.location.href = 'transaksi-kasbank-form.html';
    });
    document.getElementById('btnTambahAntar').addEventListener('click', function () {
      MockUI.toast('info', 'Transaksi Antar Kas/Bank (transfer 2 akun sekaligus dalam 1 layar) berada di luar cakupan mockup tahap ini. Gunakan "+ Tambah" untuk transaksi kas/bank biasa.', 5000);
    });
    document.getElementById('btnMonth').addEventListener('click', function () {
      MockUI.toast('info', 'Filter bulan berada di luar cakupan mockup ini.');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
