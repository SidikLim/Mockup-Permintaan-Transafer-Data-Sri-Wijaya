/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   daftar-uang-muka.js - logika halaman Daftar Uang Muka Supplier 2
   =========================================================== */

(function () {
  var state = { all: [], filtered: [], page: 1, pageSize: 10, search: '' };

  function init() {
    MockUI.mountShell('uang-muka-supplier-2');
    state.all = UangMukaStore.loadAll();
    applyFilter();
    bindEvents();
  }

  function applyFilter() {
    var q = state.search.trim().toLowerCase();
    state.filtered = !q ? state.all.slice() : state.all.filter(function (t) {
      return (t.no + ' ' + t.supplier + ' ' + (t.keterangan || '')).toLowerCase().indexOf(q) !== -1;
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
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:24px;">Tidak ada data uang muka yang cocok.</td></tr>';
      return;
    }

    tbody.innerHTML = pageItems.map(function (t) {
      var jumlah = computeJumlah(t);
      return (
        '<tr>' +
          '<td><a href="uang-muka-form.html?no=' + encodeURIComponent(t.no) + '" style="color:var(--sidebar-active-text);font-weight:600;">' + MockUI.esc(t.no) + '</a></td>' +
          '<td>' + MockUI.esc(formatTgl(t.tglUangMuka)) + '</td>' +
          '<td>' + MockUI.esc(t.supplier) + '</td>' +
          '<td class="num">' + MockUI.formatCurrency(jumlah) + '</td>' +
          '<td>' + MockUI.esc(t.keterangan || '') + '</td>' +
          '<td><button class="btn-icon blue" data-view="' + MockUI.esc(t.no) + '" title="Lihat Invoice" type="button">&#128065;</button></td>' +
          '<td><button class="btn-icon blue" data-print="' + MockUI.esc(t.no) + '" title="Cetak Invoice" type="button">&#128424; &#9662;</button></td>' +
          '<td><a class="btn-icon blue" href="uang-muka-form.html?no=' + encodeURIComponent(t.no) + '" title="Ubah">&#9998;</a></td>' +
          '<td><button class="btn-icon red" data-delete="' + MockUI.esc(t.no) + '" title="Hapus" type="button">&#128465;</button></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('[data-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () { onDelete(btn.getAttribute('data-delete')); });
    });
    tbody.querySelectorAll('[data-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MockUI.toast('info', 'Pratinjau invoice berada di luar cakupan mockup ini. Gunakan tombol Ubah untuk melihat detail transaksi.');
      });
    });
    tbody.querySelectorAll('[data-print]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MockUI.toast('info', 'Cetak invoice berada di luar cakupan mockup ini.');
      });
    });
  }

  // Subtotal + PPN(11% dari baris ber-checklist Ppn) + PPh(rate x baris yang ber-checklist Ppn & Pph)
  function computeJumlah(t) {
    var items = t.items || [];
    var subtotal = items.reduce(function (sum, it) { return sum + (Number(it.jumlah) || 0); }, 0);
    var ppnBase = items.filter(function (it) { return it.ppn; }).reduce(function (sum, it) { return sum + (Number(it.jumlah) || 0); }, 0);
    var pphBase = items.filter(function (it) { return it.ppn && it.pph; }).reduce(function (sum, it) { return sum + (Number(it.jumlah) || 0); }, 0);
    var ppnRate = (t.ppnType === 'eksklusif' || t.ppnType === 'inklusif') ? 11 : 0;
    var ppnAmount = t.ppnType === 'inklusif' ? 0 : Math.round(ppnBase * ppnRate) / 100;
    var pphAmount = Math.round(pphBase * UangMukaStore.pphRate(t.pphType) * 100) / 10000;
    return subtotal + ppnAmount + pphAmount;
  }

  function formatTgl(iso) {
    if (!iso) return '';
    var parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
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
    var t = UangMukaStore.getByNo(no);
    if (!t) return;
    MockUI.confirmDialog({
      title: 'Hapus Uang Muka',
      message: 'Hapus transaksi uang muka "' + t.no + '" (' + t.supplier + ')?',
      confirmLabel: 'Hapus'
    }, function () {
      UangMukaStore.removeByNo(no);
      state.all = UangMukaStore.loadAll();
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
      window.location.href = 'uang-muka-form.html';
    });
    document.getElementById('btnFilterSemua').addEventListener('click', function () {
      MockUI.toast('info', 'Filter status berada di luar cakupan mockup tahap ini.');
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Mockup Uang Muka Supplier 2 - termasuk checkbox PPh per baris item pada form.', 4500);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
