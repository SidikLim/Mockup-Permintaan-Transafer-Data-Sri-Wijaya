/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   daftar-karyawan.js - logika halaman Master Karyawan
   =========================================================== */

(function () {
  var state = { all: [], filtered: [], page: 1, pageSize: 10, search: '' };

  function init() {
    MockUI.mountShell('master-karyawan');
    state.all = KaryawanStore.loadAll();
    applyFilter();
    bindEvents();
  }

  function applyFilter() {
    var q = state.search.trim().toLowerCase();
    state.filtered = !q ? state.all.slice() : state.all.filter(function (k) {
      return (k.kode + ' ' + k.nama + ' ' + (k.alamat || '')).toLowerCase().indexOf(q) !== -1;
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
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px;">Tidak ada data karyawan yang cocok.</td></tr>';
      return;
    }

    tbody.innerHTML = pageItems.map(function (k) {
      return (
        '<tr>' +
          '<td><a href="karyawan-form.html?kode=' + encodeURIComponent(k.kode) + '" style="color:var(--sidebar-active-text);font-weight:600;">' + MockUI.esc(k.kode + k.mataUang) + '</a></td>' +
          '<td>' + MockUI.esc(k.nama) + '</td>' +
          '<td>' + MockUI.esc(k.mataUang) + '</td>' +
          '<td>' + MockUI.esc(k.alamat || '') + '</td>' +
          '<td class="num">' + MockUI.formatCurrency(k.saldoPiutang) + '</td>' +
          '<td><label class="toggle-switch"><input type="checkbox" data-toggle-aktif="' + MockUI.esc(k.kode) + '" ' + (k.nonAktif ? 'checked' : '') + '><span class="toggle-slider"></span></label></td>' +
          '<td><a class="btn-icon blue" href="karyawan-form.html?kode=' + encodeURIComponent(k.kode) + '" title="Ubah">&#9998;</a></td>' +
          '<td><button class="btn-icon red" data-delete="' + MockUI.esc(k.kode) + '" title="Hapus" type="button">&#128465;</button></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('[data-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () { onDelete(btn.getAttribute('data-delete')); });
    });
    tbody.querySelectorAll('[data-toggle-aktif]').forEach(function (chk) {
      chk.addEventListener('change', function () {
        var kode = chk.getAttribute('data-toggle-aktif');
        KaryawanStore.toggleNonAktif(kode);
        state.all = KaryawanStore.loadAll();
        var k = KaryawanStore.getByKode(kode);
        MockUI.toast('info', 'Status "' + k.nama + '" diubah menjadi ' + (k.nonAktif ? 'Non-Aktif' : 'Aktif') + '.');
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
    var k = KaryawanStore.getByKode(kode);
    if (!k) return;
    MockUI.confirmDialog({
      title: 'Hapus Karyawan',
      message: 'Hapus karyawan "' + k.nama + '" (' + k.kode + ')?',
      confirmLabel: 'Hapus'
    }, function () {
      KaryawanStore.removeByKode(kode);
      state.all = KaryawanStore.loadAll();
      applyFilter();
      MockUI.toast('success', 'Karyawan "' + k.nama + '" berhasil dihapus.');
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
      window.location.href = 'karyawan-form.html';
    });
    document.getElementById('btnImport').addEventListener('click', function () {
      MockUI.toast('info', 'Import Master Karyawan berada di luar cakupan mockup tahap ini.');
    });
    document.getElementById('btnKasbonBelumLunas').addEventListener('click', function () {
      MockUI.toast('info', 'Menampilkan seluruh transaksi Kas Bon (status lunas/belum lunas berada di luar cakupan mockup ini).');
      setTimeout(function () { window.location.href = 'daftar-kasbon.html'; }, 600);
    });
    document.getElementById('btnHelp').addEventListener('click', function () {
      MockUI.toast('info', 'Mockup Master Karyawan - klik toggle untuk mengubah status Aktif/Non-Aktif.', 4500);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
