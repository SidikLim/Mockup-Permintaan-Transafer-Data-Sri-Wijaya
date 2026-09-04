/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   daftar-pengajuan-pembayaran.js - logika halaman Daftar
   Pengajuan Pembayaran
   =========================================================== */

(function () {
  var state = { all: [], filtered: [], page: 1, pageSize: 10, search: '' };

  function init() {
    MockUI.mountShell('pengajuan-pembayaran');
    state.all = PengajuanPembayaranStore.loadAll();
    applyFilter();
    bindEvents();
  }

  function applyFilter() {
    var q = state.search.trim().toLowerCase();
    state.filtered = !q ? state.all.slice() : state.all.filter(function (t) {
      return (t.no + ' ' + t.supplier + ' ' + (t.keterangan || '') + ' ' + t.requestBy + ' ' + (t.approveBy || []).join(' ')).toLowerCase().indexOf(q) !== -1;
    });
    // Urutkan berdasarkan Tgl. Trn. terbaru dulu; untuk tanggal yang sama,
    // Array.prototype.sort stabil sehingga urutan data seed (sesuai urutan
    // pada screenshot sumber) tetap terjaga alih-alih diacak oleh sortir
    // string "no" (yang tidak selalu mencerminkan urutan pembuatan asli).
    state.filtered.sort(function (a, b) { return b.tglTrn.localeCompare(a.tglTrn); });
    state.page = 1;
    render();
  }

  function totalPages() { return Math.max(1, Math.ceil(state.filtered.length / state.pageSize)); }

  function render() {
    renderTable();
    renderPagination();
    document.getElementById('totalRecord').textContent = 'Total Record: ' + state.filtered.length;
  }

  function statusPillClass(status) {
    if (status === 'Approved') return 'status-pill--approved';
    if (status === 'Rejected') return 'status-pill--rejected';
    if (status === 'Paid') return 'status-pill--paid';
    return 'status-pill--pending';
  }

  function renderTable() {
    var tbody = document.getElementById('tableBody');
    var start = (state.page - 1) * state.pageSize;
    var pageItems = state.filtered.slice(start, start + state.pageSize);

    if (!pageItems.length) {
      tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;color:var(--text-muted);padding:24px;">Tidak ada data Pengajuan Pembayaran yang cocok.</td></tr>';
      return;
    }

    tbody.innerHTML = pageItems.map(function (t) {
      var total = PengajuanPembayaranStore.totalOf(t);
      var crc = PengajuanPembayaranStore.crcOf(t);
      var noColor = t.status === 'Pending' ? 'var(--danger)' : 'var(--sidebar-active-text)';
      return (
        '<tr>' +
          '<td><a href="pengajuan-pembayaran-form.html?no=' + encodeURIComponent(t.no) + '" style="color:' + noColor + ';font-weight:600;">' + MockUI.esc(t.no) + '</a></td>' +
          '<td>' + MockUI.esc(formatTgl(t.tglTrn)) + '</td>' +
          '<td>' + MockUI.esc(t.supplier || '') + '</td>' +
          '<td>' + MockUI.esc(t.keterangan || '').replace(/\n/g, '<br>') + '</td>' +
          '<td>' + MockUI.esc(t.requestBy || '') + '</td>' +
          '<td>' + MockUI.esc((t.approveBy || []).join(';')) + '</td>' +
          '<td><span class="status-pill ' + statusPillClass(t.status) + '">' + MockUI.esc(t.status) + '</span></td>' +
          '<td class="num">' + MockUI.formatCurrency(total) + '</td>' +
          '<td>' + MockUI.esc(crc) + '</td>' +
          '<td><button class="btn-icon teal" data-view="' + MockUI.esc(t.no) + '" title="Lihat" type="button">&#128065;</button></td>' +
          '<td><button class="btn-icon teal" data-print="' + MockUI.esc(t.no) + '" title="Cetak" type="button">&#128424;</button></td>' +
          '<td><a class="btn-icon blue" href="pengajuan-pembayaran-form.html?no=' + encodeURIComponent(t.no) + '" title="Ubah">&#9998;</a></td>' +
          '<td><button class="btn-icon red" data-delete="' + MockUI.esc(t.no) + '" title="Hapus" type="button">&#128465;</button></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('[data-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () { onDelete(btn.getAttribute('data-delete')); });
    });
    tbody.querySelectorAll('[data-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MockUI.toast('info', 'Pratinjau pengajuan berada di luar cakupan mockup ini. Gunakan tombol Ubah untuk melihat detail.');
      });
    });
    tbody.querySelectorAll('[data-print]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MockUI.toast('info', 'Cetak Pengajuan Pembayaran berada di luar cakupan mockup ini.');
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
    var t = PengajuanPembayaranStore.getByNo(no);
    if (!t) return;
    MockUI.confirmDialog({
      title: 'Hapus Pengajuan Pembayaran',
      message: 'Hapus pengajuan "' + t.no + '"?',
      confirmLabel: 'Hapus'
    }, function () {
      PengajuanPembayaranStore.removeByNo(no);
      state.all = PengajuanPembayaranStore.loadAll();
      applyFilter();
      MockUI.toast('success', 'Pengajuan "' + t.no + '" berhasil dihapus.');
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
      window.location.href = 'pengajuan-pembayaran-form.html';
    });
    document.getElementById('btnMonth').addEventListener('click', function () {
      MockUI.toast('info', 'Filter bulan berada di luar cakupan mockup ini.');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
