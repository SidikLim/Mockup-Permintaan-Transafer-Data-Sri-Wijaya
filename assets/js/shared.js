/* ===========================================================
   MASERP Mockup - PT Sri Wijaya Teknik Utama
   shared.js - header, sidebar, toast, confirm-modal helpers
   Dipakai bersama oleh semua halaman. Setiap halaman baru cukup:
     1. <script>window.APP_BASE = "<relatif ke root>";</script>
     2. <body data-active-menu="...">
     3. <div id="app-header"></div><div id="app-sidebar"></div>
     4. include file ini setelah data-store.js
   =========================================================== */

(function (global) {
  var BASE = global.APP_BASE || './';

  var ORG_NAME = 'SRIWIJAYA TEKNIK UTAMA, PT-STU002-YR2026';
  var USER_NAME = 'mas';

  // -----------------------------------------------------------------
  // Struktur menu sidebar. `enabled:false` = tampil untuk konteks visual
  // tapi belum difungsikan pada tahap mockup ini (di luar cakupan tahap
  // awal: hanya Master Vendor / Supplier yang aktif).
  // href dibangun relatif terhadap BASE ("root" folder mockup).
  // -----------------------------------------------------------------
  var MENU = [
    { key: 'dashboard', label: 'Dashboard', icon: '&#8962;', href: 'index.html', enabled: true },
    {
      key: 'supplier-pembelian', label: 'Supplier & Pembelian', icon: '&#128722;', enabled: true, defaultOpen: true,
      groups: [
        {
          header: 'Master & Setting',
          items: [
            { key: 'supplier', label: 'Supplier', href: 'pages/master-vendor/daftar-supplier.html', enabled: true },
            { key: 'supplier-group', label: 'Supplier Group', enabled: false },
            { key: 'jurnal-pembelian', label: 'Jurnal Pembelian', enabled: false },
            { key: 'jurnal-ap', label: 'Jurnal A.P.', enabled: false },
            { key: 'jurnal-biaya-impor', label: 'Jurnal Biaya Impor', enabled: false }
          ]
        },
        {
          header: 'Daftar Transaksi',
          items: [
            { key: 'tutup-pending-po', label: 'Tutup Pending PO', enabled: false },
            { key: 'uang-muka-supplier-2', label: 'Uang Muka Supplier 2', href: 'pages/uang-muka-supplier/daftar-uang-muka.html', enabled: true },
            { key: 'transaksi-ap', label: 'Transaksi A.P.', enabled: false },
            { key: 'permintaan-pembelian', label: 'Permintaan Pembelian', enabled: false },
            { key: 'tutup-pr', label: 'Tutup PR', enabled: false },
            { key: 'penawaran-pembelian', label: 'Penawaran Pembelian', enabled: false },
            { key: 'perbandingan-penawaran', label: 'Perbandingan Penawaran Pembelian', enabled: false },
            { key: 'purchase-order', label: 'Purchase Order', enabled: false },
            { key: 'terima-barang', label: 'Terima Barang', enabled: false },
            { key: 'retur-pb', label: 'Retur PB', enabled: false },
            { key: 'pembelian-bpb', label: 'Pembelian Melalui BPB', enabled: false }
          ]
        }
      ]
    },
    { key: 'customer-penjualan', label: 'Customer & Penjualan', icon: '&#128179;', enabled: false },
    {
      key: 'karyawan', label: 'Karyawan', icon: '&#128100;', enabled: true,
      groups: [
        {
          header: 'Master & Setting',
          items: [
            { key: 'master-karyawan', label: 'Master Karyawan', href: 'pages/karyawan/daftar-karyawan.html', enabled: true },
            { key: 'jurnal-karyawan', label: 'Jurnal Karyawan', enabled: false }
          ]
        },
        {
          header: 'Daftar Transaksi',
          items: [
            { key: 'kas-bon', label: 'Kas Bon', href: 'pages/karyawan/daftar-kasbon.html', enabled: true },
            { key: 'pengembalian-kas-bon', label: 'Pengembalian Kas Bon', href: 'pages/karyawan/daftar-pengembalian-kasbon.html', enabled: true }
          ]
        }
      ]
    },
    { key: 'data-transaksi', label: 'Data Transaksi', icon: '&#128196;', enabled: false },
    { key: 'persediaan-barang', label: 'Persediaan Barang', icon: '&#127991;', enabled: false },
    {
      key: 'kas-bank', label: 'Kas/Bank', icon: '&#127974;', enabled: true,
      groups: [
        {
          header: 'Master & Setting',
          items: [
            { key: 'master-kas-bank', label: 'Kas/Bank', href: 'pages/kas-bank/daftar-bank.html', enabled: true },
            { key: 'currency', label: 'Currency', enabled: false },
            { key: 'jurnal-pelunasan-utang-piutang', label: 'Jurnal Pelunasan Utang/Piutang', enabled: false },
            { key: 'jurnal-kas-lain-lain', label: 'Jurnal Kas Lain-Lain', enabled: false },
            { key: 'cash-flow', label: 'Cash Flow', enabled: false }
          ]
        },
        {
          header: 'Daftar Transaksi',
          items: [
            { key: 'pengajuan-pembayaran', label: 'Pengajuan Pembayaran', href: 'pages/kas-bank/daftar-pengajuan-pembayaran.html', enabled: true },
            { key: 'pelunasan-hutang', label: 'Pelunasan Hutang', href: 'pages/kas-bank/daftar-pelunasan-hutang.html', enabled: true },
            { key: 'terima-piutang', label: 'Terima Piutang', enabled: false },
            { key: 'request-transaksi-kasbank', label: 'Request Transaksi Kas / Bank', href: 'pages/kas-bank/daftar-request-kasbank.html', enabled: true },
            { key: 'transaksi-kasbank', label: 'Transaksi Kas / Bank', href: 'pages/kas-bank/daftar-transaksi-kasbank.html', enabled: true },
            { key: 'daftar-giro-mundur', label: 'Daftar Giro Mundur', enabled: false },
            { key: 'rekonsiliasi', label: 'Rekonsiliasi', enabled: false }
          ]
        }
      ]
    },
    { key: 'general-ledger', label: 'General Ledger', icon: '&#128209;', enabled: false },
    { key: 'manufacturing', label: 'Manufacturing', icon: '&#9881;', enabled: false },
    { key: 'aktiva-tetap', label: 'Aktiva Tetap', icon: '&#128663;', enabled: false },
    { key: 'project-management', label: 'Project Management', icon: '&#128203;', enabled: false },
    { key: 'lain-lain', label: 'Lain-lain', icon: '&#8942;', enabled: false },
    { key: 'pengaturan', label: 'Pengaturan', icon: '&#9881;', enabled: false },
    { key: 'user-security', label: 'User Security', icon: '&#128100;', enabled: false },
    { key: 'daftar-laporan', label: 'Daftar Laporan', icon: '&#128202;', enabled: false },
    { key: 'profil-perusahaan', label: 'Profil Perusahaan', icon: '&#128193;', enabled: false }
  ];

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildHeaderHtml() {
    return (
      '<header class="app-header">' +
        '<div class="app-header__left">' +
          '<button class="icon-btn" id="btnToggleSidebar" type="button" title="Tampilkan/Sembunyikan menu">&#9776;</button>' +
          '<a class="app-logo" href="' + BASE + 'index.html">' +
            '<span class="app-logo__mark">M</span><span>maserp</span>' +
          '</a>' +
        '</div>' +
        '<div class="app-header__right">' +
          '<div class="badge-group">' +
            '<span class="badge" title="Approval">&#128274; <span class="badge__count">9</span></span>' +
            '<span class="badge" title="Notifikasi">&#128266; <span class="badge__count">536</span></span>' +
            '<span class="badge" title="Kalender">&#128197; <span class="badge__count">181</span></span>' +
            '<span class="badge badge--red" title="Dokumen">&#128196; <span class="badge__count">14</span></span>' +
            '<span class="badge" title="Arsip">&#128230; <span class="badge__count">10</span></span>' +
            '<span class="badge badge--yellow" title="Berkas">&#128193; <span class="badge__count">144</span></span>' +
          '</div>' +
          '<div class="user-chip">' +
            '<span class="user-chip__avatar">' + esc(USER_NAME.charAt(0).toUpperCase()) + '</span>' +
            '<span>Halo, ' + esc(USER_NAME) + ' <strong>(' + esc(ORG_NAME) + ')</strong></span>' +
          '</div>' +
        '</div>' +
      '</header>'
    );
  }

  function renderMenuItem(item, activeKey) {
    if (item.href) {
      var isActive = item.key === activeKey;
      var cls = 'menu-link' + (isActive ? ' is-active' : '') + (item.enabled === false ? ' is-disabled' : '');
      return '<a class="' + cls + '" ' +
        (item.enabled === false ? '' : 'href="' + BASE + item.href + '"') +
        ' data-enabled="' + (item.enabled === false ? '0' : '1') + '" data-label="' + esc(item.label) + '">' +
        esc(item.label) + '</a>';
    }
    var cls2 = 'menu-link' + (item.enabled === false ? ' is-disabled' : '');
    return '<span class="' + cls2 + '" data-enabled="0" data-label="' + esc(item.label) + '">' + esc(item.label) + '</span>';
  }

  function buildSidebarHtml(activeKey) {
    var html = '<nav class="app-sidebar" id="appSidebar">';
    MENU.forEach(function (top) {
      if (top.groups) {
        var isOpenGroup = top.defaultOpen || (top.groups || []).some(function (g) {
          return g.items.some(function (it) { return it.key === activeKey; });
        });
        html += '<div class="menu-group">';
        html += '<div class="menu-toplevel' + (isOpenGroup ? ' is-open' : '') + '" data-toggle="' + top.key + '">' +
          '<span>' + top.icon + '</span><span>' + esc(top.label) + '</span><span class="chev">&#9656;</span></div>';
        html += '<div class="menu-submenu' + (isOpenGroup ? ' is-open' : '') + '" id="submenu-' + top.key + '">';
        top.groups.forEach(function (g) {
          html += '<div class="menu-subheader">' + esc(g.header) + '</div>';
          g.items.forEach(function (it) { html += renderMenuItem(it, activeKey); });
        });
        html += '</div></div>';
      } else {
        var isActiveTop = top.key === activeKey;
        var clsTop = 'menu-toplevel' + (top.enabled === false ? ' is-disabled' : '') + (isActiveTop ? ' menu-toplevel--active' : '');
        if (top.href) {
          html += '<a class="' + clsTop + '" ' + (top.enabled === false ? '' : 'href="' + BASE + top.href + '"') +
            ' data-enabled="' + (top.enabled === false ? '0' : '1') + '" data-label="' + esc(top.label) + '" style="text-decoration:none;">' +
            '<span>' + top.icon + '</span><span>' + esc(top.label) + '</span></a>';
        } else {
          html += '<div class="' + clsTop + '" data-enabled="0" data-label="' + esc(top.label) + '">' +
            '<span>' + top.icon + '</span><span>' + esc(top.label) + '</span></div>';
        }
      }
    });
    html += '</nav>';
    return html;
  }

  function mountShell(activeKey) {
    var headerEl = document.getElementById('app-header');
    var sidebarEl = document.getElementById('app-sidebar');
    if (headerEl) headerEl.outerHTML = buildHeaderHtml();
    if (sidebarEl) sidebarEl.outerHTML = buildSidebarHtml(activeKey);

    // Submenu toggle
    document.querySelectorAll('[data-toggle]').forEach(function (el) {
      el.addEventListener('click', function () {
        var sub = document.getElementById('submenu-' + el.getAttribute('data-toggle'));
        el.classList.toggle('is-open');
        if (sub) sub.classList.toggle('is-open');
      });
    });

    // Disabled links: block navigation + show toast
    document.querySelectorAll('[data-enabled="0"]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var label = el.getAttribute('data-label') || 'Menu ini';
        MockUI.toast('info', label + ' belum tersedia pada tahap mockup ini (fokus saat ini: Master Vendor / Supplier).');
      });
    });

    // Sidebar collapse toggle
    var toggleBtn = document.getElementById('btnToggleSidebar');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var sidebar = document.getElementById('appSidebar');
        var main = document.querySelector('.app-main');
        if (sidebar) sidebar.classList.toggle('is-collapsed');
        if (main) main.classList.toggle('is-full');
      });
    }
  }

  // -----------------------------------------------------------------
  // Toast notifications
  // -----------------------------------------------------------------
  function ensureToastStack() {
    var stack = document.getElementById('toastStack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'toastStack';
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  function toast(type, message, durationMs) {
    var stack = ensureToastStack();
    var el = document.createElement('div');
    el.className = 'toast toast--' + (type || 'info');
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .25s ease';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 250);
    }, durationMs || 3200);
  }

  // -----------------------------------------------------------------
  // Confirm modal (pengganti window.confirm)
  // -----------------------------------------------------------------
  function confirmDialog(opts, onConfirm) {
    opts = opts || {};
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML =
      '<div class="modal-box">' +
        '<div class="modal-box__body">' +
          '<div class="modal-box__title">' + esc(opts.title || 'Konfirmasi') + '</div>' +
          '<div>' + esc(opts.message || 'Apakah Anda yakin?') + '</div>' +
        '</div>' +
        '<div class="modal-box__footer">' +
          '<button class="btn btn-outline" data-act="cancel" type="button">' + esc(opts.cancelLabel || 'Batal') + '</button>' +
          '<button class="btn btn-danger" data-act="confirm" type="button">' + esc(opts.confirmLabel || 'Hapus') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop || e.target.getAttribute('data-act') === 'cancel') {
        backdrop.remove();
      } else if (e.target.getAttribute('data-act') === 'confirm') {
        backdrop.remove();
        onConfirm && onConfirm();
      }
    });
  }

  function formatCurrency(n) {
    n = Number(n) || 0;
    return n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Parser untuk input angka desimal yang menerima format Indonesia
  // ("11.975.040,00" -> 11975040) maupun angka mentah yang diketik
  // langsung ("11975040" atau "123.45").
  function parseLocaleNumber(str) {
    if (str == null) return 0;
    var s = String(str).trim();
    if (!s) return 0;
    if (s.indexOf(',') !== -1 && s.indexOf('.') !== -1) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (s.indexOf(',') !== -1) {
      s = s.replace(',', '.');
    }
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  global.MockUI = {
    mountShell: mountShell,
    toast: toast,
    confirmDialog: confirmDialog,
    formatCurrency: formatCurrency,
    parseLocaleNumber: parseLocaleNumber,
    qs: qs,
    esc: esc
  };
})(window);
