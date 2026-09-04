/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   daftar-bank.js - logika halaman Daftar Bank (Master Kas/Bank)
   =========================================================== */

(function () {
  var state = { all: [], filtered: [], page: 1, pageSize: 10, search: '' };

  function init() {
    MockUI.mountShell('master-kas-bank');
    state.all = KasBankStore.loadAll();
    applyFilter();
    bindEvents();
  }

  function applyFilter() {
    var q = state.search.trim().toLowerCase();
    state.filtered = !q ? state.all.slice() : state.all.filter(function (a) {
      return (a.kode + ' ' + a.nama + ' ' + (a.noRek || '')).toLowerCase().indexOf(q) !== -1;
    });
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
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:24px;">Tidak ada data Kas/Bank yang cocok.</td></tr>';
      return;
    }

    tbody.innerHTML = pageItems.map(function (a) {
      return (
        '<tr>' +
          '<td><a href="kasbank-form.html?kode=' + encodeURIComponent(a.kode) + '" style="color:var(--sidebar-active-text);font-weight:600;">' + MockUI.esc(a.kode) + '</a></td>' +
          '<td>' + MockUI.esc(a.nama) + '</td>' +
          '<td class="num">' + MockUI.formatCurrency(a.saldo) + '</td>' +
          '<td>' + MockUI.esc(a.mataUang || 'IDR') + '</td>' +
          '<td>' + MockUI.esc(a.telepon || '') + '</td>' +
          '<td>' + MockUI.esc(a.noRek || '') + '</td>' +
          '<td>' + MockUI.esc(a.tipe || 'Kas') + '</td>' +
          '<td><a class="btn-icon blue" href="kasbank-form.html?kode=' + encodeURIComponent(a.kode) + '" title="Ubah">&#9998;</a></td>' +
          '<td><button class="btn-icon red" data-delete="' + MockUI.esc(a.kode) + '" title="Hapus" type="button">&#128465;</button></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('[data-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () { onDelete(btn.getAttribute('data-delete')); });
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
    var a = KasBankStore.getByKode(kode);
    if (!a) return;
    MockUI.confirmDialog({
      title: 'Hapus Akun Kas/Bank',
      message: 'Hapus akun "' + a.kode + ' - ' + a.nama + '"?',
      confirmLabel: 'Hapus'
    }, function () {
      KasBankStore.removeByKode(kode);
      state.all = KasBankStore.loadAll();
      applyFilter();
      MockUI.toast('success', 'Akun "' + a.nama + '" berhasil dihapus.');
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
      window.location.href = 'kasbank-form.html';
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Mockup Master Kas/Bank - kelola daftar akun Kas dan Bank perusahaan.', 4000);
    });
    document.querySelectorAll('.sort-icon').forEach(function (icon) {
      icon.addEventListener('click', function (e) {
        e.stopPropagation();
        MockUI.toast('info', 'Pengurutan kolom berada di luar cakupan mockup ini.');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
