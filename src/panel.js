export function renderPanelHTML() {
  return `<!doctype html>
<html lang="en" dir="ltr" data-bs-theme="auto" data-app-theme="bs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DoH Proxy — Management Dashboard</title>

  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230d6efd' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'></path><circle cx='12' cy='10' r='3'></circle><path d='M12 13v4'></path></svg>">

  <!-- Core Theme CSS (Dynamic via JS) -->
  <link id="theme-stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  
  <!-- jQuery 3.7.1 CDN -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js" crossorigin="anonymous"></script>

  <style>
    /* Global & Scroll */
    html, body { scroll-behavior: smooth; height: 100%; overflow: hidden; }
    .hide { display: none !important; }
    
    /* Sidebar Styles */
    .nav-sidebar .nav-link { color: var(--bs-body-color); border-radius: 0.375rem; margin: 0.125rem 0.75rem; padding: 0.6rem 1rem; font-weight: 500; transition: all 0.2s ease; white-space: nowrap; display: flex; align-items: center; gap: 0.75rem; line-height: 1; }
    .nav-sidebar .nav-link:hover { background-color: var(--bs-secondary-bg); }
    .nav-sidebar .nav-link.active { color: var(--bs-primary); background-color: var(--bs-primary-bg-subtle); font-weight: 600; }
    .nav-sidebar .nav-link i { font-size: 1.1rem; width: 24px; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease; }
    .nav-sidebar .nav-link.active i { transform: scale(1.15); }
    
    /* Desktop Sidebar Collapse Logic */
    @media (min-width: 992px) {
      body.sidebar-collapsed #sidebarMenu { width: 70px !important; }
      body.sidebar-collapsed .sidebar-brand-text, body.sidebar-collapsed .nav-text { display: none; }
      body.sidebar-collapsed .nav-sidebar .nav-link { justify-content: center; padding: 0.6rem 0; }
      body.sidebar-collapsed .nav-sidebar .nav-link i { margin: 0 !important; font-size: 1.3rem; }
    }
    
    /* UI Components */
    .card { border-radius: 12px; box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075); border: 1px solid var(--bs-border-color-translucent); margin-bottom: 1.5rem; }
    .card-header { background-color: transparent; border-bottom: 1px solid var(--bs-border-color-translucent); padding: 1rem 1.25rem; font-weight: 600; }
    .card-body { padding: 1.25rem; }
    .table th { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; color: var(--bs-secondary-color); border-top: none; }
    .table td { vertical-align: middle; }
    
    /* Utilities */
    .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .rule-row { gap: .5rem; align-items: center; display:flex; margin-bottom:.75rem; flex-wrap:wrap; }
    .rule-row input, .rule-row select { flex: 1; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
    
    /* Navbar adjustments */
    .navbar-brand { padding-top: .75rem; padding-bottom: .75rem; background-color: rgba(0, 0, 0, .25); box-shadow: inset calc(var(--bs-border-width) * -1) 0 0 rgba(0, 0, 0, .25); font-size: 1rem; }
    [dir="rtl"] .navbar-brand { box-shadow: inset var(--bs-border-width) 0 0 rgba(0, 0, 0, .25); }

    /* =========================================
       CSS Overrides for Bootswatch Themes
       ========================================= */
    /* ۱. اصلاح ورودی‌های Morph در حالت Dark */
    [data-app-theme="morph"][data-bs-theme="dark"] .form-control,
    [data-app-theme="morph"][data-bs-theme="dark"] .form-select {
      background-color: var(--bs-card-bg, #2b3035) !important;
      color: var(--bs-body-color, #fff) !important;
      border-color: var(--bs-border-color, rgba(255,255,255,0.15)) !important;
      box-shadow: none !important;
    }

    /* ۲. شفاف‌سازی دکمه همبرگری سایدبار در Morph */
    [data-app-theme="morph"] .navbar-toggler, 
    [data-app-theme="morph"] .sidebar-toggle-btn {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* ۳. رفع کامل باگ Form Switch و Checkbox در تم Materia */
    [data-app-theme="materia"] .form-check-input {
      appearance: auto !important;
      -webkit-appearance: checkbox !important;
    }
    [data-app-theme="materia"] .form-switch .form-check-input {
      -webkit-appearance: inherit !important;
      appearance: inherit !important;
      width: 2.5em !important;
      height: 1.25em !important;
      background-image: var(--bs-form-switch-bg) !important;
      background-position: left center !important;
      border-radius: 2em !important;
      transition: background-position .15s ease-in-out !important;
    }
    [data-app-theme="materia"] .form-switch .form-check-input:checked {
      background-position: right center !important;
    }
    [data-app-theme="materia"] .form-switch .form-check-input::before {
      top: auto !important;
    }
  </style>
</head>
<body>

  <!-- Authentication View -->
  <div id="auth-view" class="d-flex align-items-center justify-content-center w-100 vh-100 bg-body-tertiary">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5 col-xl-4">
          
          <div id="login-area" class="card shadow-lg border-0">
            <div class="card-body p-4 p-sm-5 text-center">
              <div class="bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style="width: 70px; height: 70px;"><i class="bi bi-shield-lock-fill fs-1"></i></div>
              <h2 class="h4 fw-bold mb-3">Admin Sign In</h2>
              <div class="mb-4 text-start">
                <label class="form-label fw-medium small">Master Password</label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-key text-muted"></i></span>
                  <input id="pw" type="password" class="form-control border-start-0 ps-0" placeholder="••••••••" />
                </div>
              </div>
              <button id="btn-login" class="btn btn-primary w-100 py-2 fw-bold">Authenticate <i class="bi bi-arrow-right ms-1"></i></button>
              <div id="login-msg" class="mt-3"></div>
            </div>
          </div>

          <div id="force-change-area" class="card shadow-lg border-0 border-top border-4 border-warning hide">
            <div class="card-body p-4 p-sm-5">
              <div class="text-center mb-4">
                 <h2 class="h5 fw-bold text-warning"><i class="bi bi-exclamation-triangle-fill me-2"></i> Setup Required</h2>
                 <p class="text-muted small">Please secure your installation by updating the auto-generated credentials.</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-medium small">New Secure Password</label>
                <input id="new-pw" type="password" class="form-control" />
              </div>
              <div class="mb-4">
                <label class="form-label fw-medium small">New Admin Path (URL-safe)</label>
                <div class="input-group">
                  <span class="input-group-text">/</span>
                  <input id="new-secret" type="text" class="form-control" placeholder="my-secret-panel" />
                  <span class="input-group-text">/panel/</span>
                </div>
              </div>
              <button id="btn-change-creds" class="btn btn-warning w-100 fw-bold text-dark">Lock & Save</button>
              <div id="change-msg" class="mt-3"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- Main Dashboard Layout -->
  <div id="panel-root" class="d-flex vh-100 overflow-hidden hide">
    
    <!-- Sidebar -->
    <aside class="bg-body-tertiary border-end d-flex flex-column flex-shrink-0 offcanvas-lg offcanvas-start" tabindex="-1" id="sidebarMenu" style="width: 280px; z-index: 1055;">
      <div class="sidebar-brand border-bottom d-flex justify-content-between align-items-center">
        <a href="#" class="text-decoration-none text-body d-flex align-items-center gap-2">
          <i class="bi bi-shield-check text-primary fs-4"></i>
          <span class="sidebar-brand-text fw-bold">DoH Proxy</span>
        </a>
        <button type="button" class="btn-close d-lg-none" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
      </div>
      
      <div class="sidebar-wrapper py-3">
        <ul class="nav nav-sidebar flex-column" role="tablist">
          <li class="nav-item text-muted small fw-bold text-uppercase px-4 mb-2 mt-1 sidebar-brand-text" style="font-size:0.7rem; letter-spacing:0.5px;">Dashboards</li>
          <li class="nav-item">
            <button class="nav-link active w-100 text-start border-0 bg-transparent" data-bs-toggle="tab" data-bs-target="#overview" type="button" role="tab">
              <i class="bi bi-grid-1x2"></i> <span class="nav-text">Overview</span>
            </button>
          </li>
          
          <li class="nav-item text-muted small fw-bold text-uppercase px-4 mb-2 mt-4 sidebar-brand-text" style="font-size:0.7rem; letter-spacing:0.5px;">Network Routing</li>
          <li class="nav-item">
            <button class="nav-link w-100 text-start border-0 bg-transparent" data-bs-toggle="tab" data-bs-target="#routers" type="button" role="tab">
              <i class="bi bi-router"></i> <span class="nav-text">Endpoints (Routers)</span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link w-100 text-start border-0 bg-transparent" data-bs-toggle="tab" data-bs-target="#templates" type="button" role="tab">
              <i class="bi bi-file-earmark-code"></i> <span class="nav-text">DNS Templates</span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link w-100 text-start border-0 bg-transparent" data-bs-toggle="tab" data-bs-target="#providers" type="button" role="tab">
              <i class="bi bi-hdd-network"></i> <span class="nav-text">Upstream Providers</span>
            </button>
          </li>
          
          <li class="nav-item text-muted small fw-bold text-uppercase px-4 mb-2 mt-4 sidebar-brand-text" style="font-size:0.7rem; letter-spacing:0.5px;">Tools & Config</li>
          <li class="nav-item">
            <button class="nav-link w-100 text-start border-0 bg-transparent" data-bs-toggle="tab" data-bs-target="#lookup" type="button" role="tab">
              <i class="bi bi-search"></i> <span class="nav-text">DNS Lookup</span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link w-100 text-start border-0 bg-transparent" data-bs-toggle="tab" data-bs-target="#settings" type="button" role="tab">
              <i class="bi bi-sliders"></i> <span class="nav-text">Global Settings</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="d-flex flex-column flex-grow-1 min-vw-0 overflow-hidden bg-body">
      
      <!-- Header -->
      <header class="navbar navbar-expand bg-body-tertiary border-bottom px-3 flex-shrink-0" style="height: 60px; z-index: 1030;">
        <div class="container-fluid px-0 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-link text-body d-lg-none p-2 text-decoration-none sidebar-toggle-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu">
              <i class="bi bi-list fs-4"></i>
            </button>
            <button class="btn btn-link text-body d-none d-lg-block p-2 text-decoration-none sidebar-toggle-btn" type="button" id="desktopSidebarToggle">
              <i class="bi bi-list fs-4"></i>
            </button>
          </div>

          <div class="d-flex align-items-center gap-2 gap-md-3">
            <span id="last-updated-time" class="text-muted small d-none d-md-inline">Last updated: --:--:--</span>
            <button id="btn-refresh-dashboard" class="btn btn-sm btn-primary d-flex align-items-center gap-2 rounded-pill px-3 shadow-sm">
              <i class="bi bi-arrow-clockwise" id="refresh-icon"></i> <span class="d-none d-sm-inline">Refresh</span>
            </button>
            
            <!-- Language Dropdown -->
            <div class="dropdown">
              <button id="langBtn" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 rounded-pill px-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-translate"></i> <span id="lang-label">EN</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow border-0" style="border-radius: 12px; min-width: 120px;">
                <li><a class="dropdown-item d-flex align-items-center gap-3 py-2 lang-option" href="#" data-lang="en">English</a></li>
                <li><a class="dropdown-item d-flex align-items-center gap-3 py-2 lang-option" href="#" data-lang="fa">فارسی</a></li>
              </ul>
            </div>

            <!-- Unified Appearance Dropdown -->
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-palette"></i> <span class="d-none d-sm-inline">Appearance</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow border-0" style="border-radius: 12px; min-width: 180px;">
                <li><h6 class="dropdown-header text-uppercase opacity-75 small">Mode</h6></li>
                <li><a class="dropdown-item d-flex align-items-center gap-3 py-2 mode-option" href="#" data-mode="auto"><i class="bi bi-circle-half opacity-50"></i> Auto</a></li>
                <li><a class="dropdown-item d-flex align-items-center gap-3 py-2 mode-option" href="#" data-mode="light"><i class="bi bi-sun-fill text-warning opacity-50"></i> Light</a></li>
                <li><a class="dropdown-item d-flex align-items-center gap-3 py-2 mode-option" href="#" data-mode="dark"><i class="bi bi-moon-stars-fill text-primary opacity-50"></i> Dark</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><h6 class="dropdown-header text-uppercase opacity-75 small">Theme</h6></li>
                <li><a class="dropdown-item d-flex align-items-center gap-3 py-2 theme-option" href="#" data-theme="bs"><i class="bi bi-bootstrap-fill text-primary opacity-50"></i> Default (BS)</a></li>
                <li><a class="dropdown-item d-flex align-items-center gap-3 py-2 theme-option" href="#" data-theme="morph"><i class="bi bi-droplet-fill text-info opacity-50"></i> Morph</a></li>
                <li><a class="dropdown-item d-flex align-items-center gap-3 py-2 theme-option" href="#" data-theme="minty"><i class="bi bi-leaf-fill text-success opacity-50"></i> Minty</a></li>
                <li><a class="dropdown-item d-flex align-items-center gap-3 py-2 theme-option" href="#" data-theme="materia"><i class="bi bi-layers-fill text-danger opacity-50"></i> Materia</a></li>
              </ul>
            </div>
            
            <button id="btn-logout" class="btn btn-sm btn-danger d-flex align-items-center gap-1 rounded-pill px-3"><i class="bi bi-box-arrow-right"></i> <span class="d-none d-sm-inline">Log out</span></button>
          </div>
        </div>
      </header>

      <!-- Main Scrollable Content -->
      <main class="flex-grow-1 overflow-auto p-3 p-md-4" id="main-content">
        <div class="tab-content h-100" id="myTabContent">
          
          <!-- Tab 0: Overview -->
          <div class="tab-pane fade show active" id="overview" role="tabpanel">
            <div class="mb-4">
              <h2 class="h4 mb-1 fw-bold">Executive Dashboard</h2>
              <div class="text-muted small">Live summary of your active endpoints and routing layers.</div>
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-3 col-sm-6">
                <div class="card border-0 bg-success-subtle text-success-emphasis h-100 mb-0">
                  <div class="card-body d-flex flex-column justify-content-center">
                    <div class="text-uppercase small fw-bold mb-1 opacity-75">Active Endpoints</div>
                    <div class="d-flex align-items-center gap-2"><i class="bi bi-router-fill fs-3 opacity-50"></i><span class="fs-2 fw-bold" id="stat-routers">0</span></div>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="card border-0 bg-primary-subtle text-primary-emphasis h-100 mb-0">
                  <div class="card-body d-flex flex-column justify-content-center">
                    <div class="text-uppercase small fw-bold mb-1 opacity-75">DNS Templates</div>
                    <div class="d-flex align-items-center gap-2"><i class="bi bi-braces-asterisk fs-3 opacity-50"></i><span class="fs-2 fw-bold" id="stat-templates">0</span></div>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="card border-0 bg-info-subtle text-info-emphasis h-100 mb-0">
                  <div class="card-body d-flex flex-column justify-content-center">
                    <div class="text-uppercase small fw-bold mb-1 opacity-75">Upstream Providers</div>
                    <div class="d-flex align-items-center gap-2"><i class="bi bi-hdd-network-fill fs-3 opacity-50"></i><span class="fs-2 fw-bold" id="stat-providers">0</span></div>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="card border-0 bg-warning-subtle text-warning-emphasis h-100 mb-0">
                  <div class="card-body d-flex flex-column justify-content-center">
                    <div class="text-uppercase small fw-bold mb-1 opacity-75">Global Cache TTL</div>
                    <div class="d-flex align-items-center gap-2"><i class="bi bi-stopwatch-fill fs-3 opacity-50"></i><span class="fs-2 fw-bold" id="stat-ttl">60s</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row g-4">
              <div class="col-xl-8 col-lg-7">
                <div class="card h-100 mb-0">
                  <div class="card-header d-flex align-items-center gap-2"><i class="bi bi-lightning-fill text-warning"></i> Quick Endpoints List</div>
                  <div class="card-body p-0">
                    <div class="table-responsive">
                      <table class="table table-hover align-middle mb-0" id="quick-router-table">
                        <thead><tr><th class="ps-4">Path</th><th>Full DoH Origin URL</th><th>ECS</th><th class="text-end pe-4">Action</th></tr></thead>
                        <tbody><tr><td colspan="4" class="text-muted text-center py-4">Loading active endpoints...</td></tr></tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-4 col-lg-5">
                <div class="card h-100 mb-0">
                  <div class="card-header d-flex align-items-center gap-2"><i class="bi bi-heart-pulse-fill text-danger"></i> System Status</div>
                  <div class="card-body p-3">
                    <ul class="list-group list-group-flush small">
                      <li class="list-group-item d-flex justify-content-between align-items-center px-2 bg-transparent">
                        <span class="text-body fw-medium"><i class="bi bi-globe2 me-2 text-muted"></i> Proxy Status</span>
                        <span class="badge bg-success rounded-pill px-2 py-1"><span class="status-dot bg-white me-1"></span> Online</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center px-2 bg-transparent">
                        <span class="text-body fw-medium"><i class="bi bi-database-fill-check me-2 text-muted"></i> KV Database</span>
                        <span class="badge bg-success rounded-pill px-2 py-1"><span class="status-dot bg-white me-1"></span> Connected</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center px-2 bg-transparent">
                        <span class="text-body fw-medium"><i class="bi bi-memory me-2 text-muted"></i> OCC Memory Cache</span>
                        <span class="badge bg-info text-dark rounded-pill px-2 py-1"><i class="bi bi-clock-history"></i> Active (5m)</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center px-2 bg-transparent border-0 mt-2">
                        <span class="text-body fw-medium"><i class="bi bi-list-columns-reverse me-2 text-muted"></i> Total Active Rules</span>
                        <span class="badge bg-secondary rounded-pill px-3 py-1 fs-6" id="stat-total-rules">0</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 1: Routers -->
          <div class="tab-pane fade" id="routers" role="tabpanel">
            <div class="mb-4">
              <h2 class="h4 mb-1 fw-bold">Routing Endpoints</h2>
              <div class="text-muted small">Manage secure DoH paths and attach rewrite templates or upstream failovers.</div>
            </div>
            <div class="card mb-4">
              <div class="card-header text-primary d-flex align-items-center gap-2"><i class="bi bi-plus-circle-fill"></i> <span id="router-form-title">Create New Endpoint</span></div>
              <div class="card-body">
                <div class="row g-4">
                  <div class="col-lg-6">
                    <label class="form-label fw-semibold small text-muted text-uppercase">Endpoint Path</label>
                    <input id="router-path" class="form-control" placeholder="/secure-dns/doh/">
                    <div class="form-check form-switch mt-4 p-3 bg-info-subtle border border-info-subtle rounded-3 d-flex align-items-center gap-2">
                      <input class="form-check-input m-0" type="checkbox" role="switch" id="router-ecs" style="cursor: pointer; width: 2.5rem; height: 1.25rem;">
                      <label class="form-check-label fw-bold text-info-emphasis ms-2" for="router-ecs" style="cursor: pointer;">Enable Subnet ECS Routing</label>
                    </div>
                    <div class="form-text mt-2 small"><i class="bi bi-info-circle"></i> Helps upstream servers return geo-optimized IP addresses based on client location.</div>
                  </div>
                  <div class="col-lg-6">
                    <label class="form-label fw-semibold small text-muted text-uppercase">Upstream Priority (Failover List)</label>
                    <select id="router-upstreams" class="form-select mb-1" multiple size="4"></select>
                    <div class="form-text small mb-3"><i class="bi bi-exclamation-triangle text-warning"></i> Ctrl/Cmd+Click to select multiple. Top to bottom dictates priority.</div>
                    <label class="form-label fw-semibold small text-muted text-uppercase">DNS Rewrites (Templates)</label>
                    <select id="router-templates" class="form-select" multiple size="3"></select>
                  </div>
                </div>
                <div class="mt-4 pt-3 border-top d-flex gap-2">
                  <button id="router-create" class="btn btn-primary px-4 fw-bold"><i class="bi bi-cloud-arrow-up-fill me-1"></i> Create Endpoint</button>
                  <button id="router-cancel" class="btn btn-light border hide fw-medium">Cancel</button>
                </div>
                <div id="router-msg" class="mt-3"></div>
              </div>
            </div>
            <div class="card mb-4">
              <div class="card-header d-flex align-items-center gap-2"><i class="bi bi-table text-secondary"></i> Active Endpoints</div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table id="router-table" class="table table-hover align-middle mb-0">
                    <thead><tr><th class="ps-4">Path & Flags</th><th>Upstream Cascade</th><th>Templates</th><th class="text-end pe-4">Actions</th></tr></thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 2: Templates -->
          <div class="tab-pane fade" id="templates" role="tabpanel">
            <div class="mb-4">
              <h2 class="h4 mb-1 fw-bold">DNS Templates</h2>
              <div class="text-muted small">Create blocks of rules to hijack, flatten, or block domains (A, AAAA, CNAME).</div>
            </div>
            <div class="card mb-4">
               <div class="card-header text-primary d-flex align-items-center gap-2"><i class="bi bi-file-earmark-plus-fill"></i> <span id="temp-form-title">Create Template Container</span></div>
               <div class="card-body">
                  <div class="mb-4">
                    <label class="form-label fw-semibold small text-muted text-uppercase">Template Identifier</label>
                    <input id="template-name" class="form-control form-control-lg" placeholder="e.g. Block Ads & Trackers" style="max-width: 500px;">
                  </div>
                  <div class="alert alert-secondary border-0 bg-secondary-subtle small py-2 d-flex align-items-center gap-2 rounded-3">
                    <i class="bi bi-info-circle-fill text-secondary fs-5"></i>
                    <span><strong>Matching:</strong> Use <code>*.example.com</code> for wildcards or <code>example.com</code> for exact match. Exact matches take priority over wildcards.</span>
                  </div>
                  <div class="p-3 bg-body-tertiary border rounded-3 mb-3">
                    <label class="form-label fw-bold small text-muted text-uppercase border-bottom pb-2 mb-3 d-block">Rewrite Rules Configuration</label>
                    <div id="rules-container"></div>
                    <button id="add-rule-btn" class="btn btn-sm btn-outline-secondary fw-bold mt-2"><i class="bi bi-plus-lg"></i> Add Rule Row</button>
                  </div>
                  <div class="d-flex gap-2">
                    <button id="template-create" class="btn btn-primary px-4 fw-bold"><i class="bi bi-cloud-arrow-up-fill me-1"></i> Save Template</button>
                    <button id="template-cancel" class="btn btn-light border hide fw-medium">Cancel</button>
                  </div>
                  <div id="template-msg" class="mt-3"></div>
               </div>
            </div>
            <div class="card mb-4">
              <div class="card-header d-flex align-items-center gap-2"><i class="bi bi-table text-secondary"></i> Saved Templates</div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table id="template-table" class="table table-hover align-middle mb-0">
                    <thead><tr><th class="ps-4">Identifier</th><th>Embedded Rules</th><th class="text-end pe-4">Actions</th></tr></thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 3: Providers -->
          <div class="tab-pane fade" id="providers" role="tabpanel">
            <div class="mb-4">
              <h2 class="h4 mb-1 fw-bold">Upstream Providers</h2>
              <div class="text-muted small">Register public or private DoH origin servers.</div>
            </div>
            <div class="card mb-4">
               <div class="card-header text-primary d-flex align-items-center gap-2"><i class="bi bi-cloud-plus-fill"></i> <span id="prov-form-title">Add Origin Provider</span></div>
               <div class="card-body">
                 <div class="row g-3 mb-3">
                    <div class="col-md-5">
                       <label class="form-label fw-semibold small text-muted text-uppercase">Display Name</label>
                       <input id="prov-name" class="form-control" placeholder="e.g. Cloudflare Security">
                    </div>
                    <div class="col-md-7">
                       <label class="form-label fw-semibold small text-muted text-uppercase">DoH Origin URL</label>
                       <input id="prov-url" class="form-control" placeholder="https://security.cloudflare-dns.com/dns-query">
                    </div>
                 </div>
                 <div class="d-flex gap-2 border-top pt-3 mt-2">
                    <button id="prov-add" class="btn btn-primary px-4 fw-bold"><i class="bi bi-cloud-arrow-up-fill me-1"></i> Register Origin</button>
                    <button id="prov-cancel" class="btn btn-light border hide fw-medium">Cancel</button>
                 </div>
                 <div id="prov-msg" class="mt-3"></div>
               </div>
            </div>
            <div class="card mb-4">
              <div class="card-header d-flex align-items-center gap-2"><i class="bi bi-table text-secondary"></i> Origin Servers Pool</div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table id="prov-table" class="table table-hover align-middle mb-0">
                    <thead><tr><th class="ps-4">Display Name</th><th>DoH URL Target</th><th class="text-end pe-4">Actions</th></tr></thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 4: Live DNS Lookup Tool -->
          <div class="tab-pane fade" id="lookup" role="tabpanel">
            <div class="mb-4">
              <h2 class="h4 mb-1 fw-bold">Live DNS Inspector</h2>
              <div class="text-muted small">Bypass firewalls and test origin responses securely from Cloudflare Edge.</div>
            </div>
            <div class="card border-primary-subtle mb-4">
              <div class="card-body p-4 bg-body-tertiary rounded-3">
                <div class="row g-3">
                  <div class="col-lg-3 col-md-6">
                    <label class="form-label small fw-bold text-body">Domain Query</label>
                    <input type="text" id="lookup-domain" class="form-control" placeholder="e.g. ubuntu.com">
                  </div>
                  <div class="col-lg-2 col-md-6">
                    <label class="form-label small fw-bold text-body">Type</label>
                    <select id="lookup-type" class="form-select text-center fw-bold text-primary">
                      <option value="A">A</option><option value="AAAA">AAAA</option><option value="CNAME">CNAME</option><option value="TXT">TXT</option><option value="MX">MX</option>
                    </select>
                  </div>
                  <div class="col-lg-5 col-md-8">
                    <label class="form-label small fw-bold text-body">Execute From Origin</label>
                    <select id="lookup-provider" class="form-select bg-body"></select>
                  </div>
                  <div class="col-lg-2 col-md-4 d-flex align-items-end">
                    <button id="lookup-btn" class="btn btn-primary w-100 fw-bold shadow-sm"><i class="bi bi-search me-1"></i> Resolve</button>
                  </div>
                </div>
                <div class="form-check form-switch mt-4 bg-info-subtle border border-info-subtle d-inline-flex p-2 pe-3 rounded-pill gap-2 align-items-center">
                  <input class="form-check-input m-0 ms-2" type="checkbox" role="switch" id="lookup-ecs-switch" style="cursor: pointer;">
                  <label class="form-check-label small fw-bold text-info-emphasis" for="lookup-ecs-switch" style="cursor: pointer;">Enable ECS Subnet Emulation</label>
                </div>
                <div class="row g-3 mt-1 hide" id="lookup-custom-url-container">
                  <div class="col-md-12 border-top pt-3 mt-3">
                    <label class="form-label small fw-bold text-primary">Custom Temporary DoH Server URL</label>
                    <input type="text" id="lookup-custom-url" class="form-control border-primary bg-primary-subtle text-primary-emphasis" placeholder="https://your-custom-doh.com/dns-query">
                  </div>
                </div>
                <div id="lookup-msg" class="mt-3"></div>
              </div>
            </div>
            <div id="lookup-result-container" class="card hide mb-4">
              <div class="card-header d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
                <h4 class="h6 mb-0 fw-bold d-flex align-items-center gap-2"><i class="bi bi-terminal-fill text-muted"></i> Inspection Results</h4>
                <div class="d-flex align-items-center gap-3">
                  <div class="btn-group btn-group-sm p-1 bg-body-tertiary rounded-pill border" role="group">
                    <button type="button" class="btn btn-light active rounded-pill fw-medium px-3" id="view-table-btn">Table</button>
                    <button type="button" class="btn btn-transparent rounded-pill fw-medium px-3 text-muted" id="view-json-btn">Raw JSON</button>
                  </div>
                  <div class="text-muted small border-start ps-3 d-flex gap-3 align-items-center">
                    <span id="lookup-status"></span>
                    <span class="d-flex align-items-center gap-1">Latency: <span id="lookup-latency" class="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-2"></span></span>
                  </div>
                </div>
              </div>
              <div class="card-body p-0" id="lookup-table-view">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0" id="lookup-result-table">
                    <thead><tr><th class="ps-4">Host Name</th><th>Type</th><th>TTL Expire</th><th class="pe-4">Data Value</th></tr></thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
              <div class="card-body p-3 hide" id="lookup-json-view">
                <pre class="bg-dark text-light p-3 rounded-3 mb-0 border border-dark-subtle shadow-inner" style="max-height: 400px; overflow-y: auto; font-family: var(--bs-font-monospace); font-size: 0.85rem;"><code id="lookup-json-code"></code></pre>
              </div>
            </div>
          </div>

          <!-- Tab 5: Global Settings -->
          <div class="tab-pane fade" id="settings" role="tabpanel">
            <div class="mb-4">
              <h2 class="h4 mb-1 fw-bold">Global Settings</h2>
              <div class="text-muted small">Manage wide system caching and engine optimizations.</div>
            </div>
            <div class="card mb-4">
              <div class="card-header d-flex align-items-center gap-2"><i class="bi bi-gear-fill text-secondary"></i> Optimizations & Memory Cache</div>
              <div class="card-body p-4">
                <div class="mb-4" style="max-width: 400px;">
                  <label class="form-label fw-bold text-body d-flex align-items-center gap-2" for="cache-ttl-input">
                     <i class="bi bi-stopwatch text-warning fs-5"></i> DNS Cache TTL 
                     <span class="badge bg-secondary-subtle text-secondary rounded-pill fw-normal">Seconds</span>
                  </label>
                  <input type="number" class="form-control form-control-lg" id="cache-ttl-input" min="1" max="86400" value="60">
                  <div class="form-text mt-2">Determines how long Cloudflare Edge preserves standard resolution objects before requesting origin.</div>
                </div>
                <div class="border-top pt-3 mt-4">
                  <button id="settings-save-btn" class="btn btn-primary px-4 fw-bold"><i class="bi bi-cloud-arrow-up-fill me-1"></i> Save Configuration</button>
                </div>
                <div id="settings-msg" class="mt-3"></div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

  <script>
  $(() => {
    
    const applyThemeAndLang = (mode, theme, lang) => {
      const isAutoDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const actualMode = (!mode || mode === "auto") ? (isAutoDark ? "dark" : "light") : mode;
      const actualTheme = theme || "bs";
      const actualLang = lang || "en";
      
      const $html = $("html");
      const $bsLink = $("#theme-stylesheet");
      
      if (actualLang === "fa") { 
        $html.attr("dir", "rtl").attr("lang", "fa"); 
      } else { 
        $html.attr("dir", "ltr").attr("lang", "en"); 
      }
      
      let cssUrl = "";
      if (actualTheme === "bs") {
         cssUrl = actualLang === "fa" ? "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css" : "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
      } else {
         cssUrl = actualLang === "fa" ? "https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/" + actualTheme + "/bootstrap.rtl.min.css" : "https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/" + actualTheme + "/bootstrap.min.css";
      }
      
      if ($bsLink.attr("href") !== cssUrl) { $bsLink.attr("href", cssUrl); }
      $html.attr("data-bs-theme", actualMode);
      $html.attr("data-app-theme", actualTheme);
      
      $(".mode-option").removeClass("active");
      $(".mode-option[data-mode='" + (mode || "auto") + "']").addClass("active");
      
      $(".theme-option").removeClass("active");
      $(".theme-option[data-theme='" + actualTheme + "']").addClass("active");

      const langLabels = { "en": "EN", "fa": "FA" };
      $("#lang-label").text(langLabels[actualLang]);
    };

    applyThemeAndLang(
      localStorage.getItem("panel_theme_mode") || "auto", 
      localStorage.getItem("panel_theme_name") || "bs", 
      localStorage.getItem("panel_lang") || "en"
    );

    $(".mode-option").on("click", function(e) { 
      e.preventDefault(); 
      const m = $(this).data("mode"); 
      localStorage.setItem("panel_theme_mode", m); 
      applyThemeAndLang(m, localStorage.getItem("panel_theme_name"), localStorage.getItem("panel_lang")); 
    });

    $(".theme-option").on("click", function(e) { 
      e.preventDefault(); 
      const t = $(this).data("theme"); 
      localStorage.setItem("panel_theme_name", t); 
      applyThemeAndLang(localStorage.getItem("panel_theme_mode"), t, localStorage.getItem("panel_lang")); 
    });

    $(".lang-option").on("click", function(e) { 
      e.preventDefault(); 
      const l = $(this).data("lang"); 
      localStorage.setItem("panel_lang", l); 
      applyThemeAndLang(localStorage.getItem("panel_theme_mode"), localStorage.getItem("panel_theme_name"), l); 
    });

    $("#desktopSidebarToggle").on("click", () => { $("body").toggleClass("sidebar-collapsed"); });

    const API_BASE = window.location.origin + "/" + (window.location.pathname.split("/").filter(Boolean)[0] || "") + "/api";

    let provEditingId = null, templateEditingId = null, routerEditingId = null;
    let provEditingUpdatedAt = null, templateEditingUpdatedAt = null, routerEditingUpdatedAt = null, globalSettingsUpdatedAt = null;
    let lastLookupResponse = null;
    let allProviders = [], allTemplates = [], allRouters = [], globalSettings = { cache_ttl: 60 };

    const showMessage = ($el, msg, type) => { 
        type = type || "info";
        const t = type === "info" ? "secondary" : type; 
        const iMap = {"success":"bi-check-circle-fill", "danger":"bi-exclamation-octagon-fill", "warning":"bi-exclamation-triangle-fill", "secondary":"bi-info-circle-fill"}; 
        const icon = iMap[t] || "bi-info-circle-fill"; 
        $el.empty().append($("<div>").addClass("alert alert-" + t + " d-flex align-items-center gap-2 small mb-0 shadow-sm").html("<i class='bi " + icon + " fs-6'></i> <div>" + msg + "</div>")); 
    };
    
    const clearMessage = ($el) => { $el.empty(); };

    const apiFetch = async (path, opts) => { 
      opts = opts || {};
      try { 
        const res = await $.ajax({ url: API_BASE + path, method: opts.method || "GET", contentType: "application/json", data: opts.body ? JSON.stringify(opts.body) : undefined, xhrFields: { withCredentials: true } }); 
        return { ok: true, status: 200, json: res }; 
      } catch (err) { 
        return { ok: false, status: err.status, json: err.responseJSON || { error: err.statusText } }; 
      } 
    };

    const handleConflict = (r, $msgContainer) => { 
      if (r.status === 409) { 
        const msg = "Data modified elsewhere! Force refreshing..."; 
        if ($msgContainer) showMessage($msgContainer, msg, "warning"); 
        else alert(msg); 
        loadAllData(); 
        return true; 
      } 
      return false; 
    };

    const resetProvForm = (clearMsg) => { 
      if (clearMsg === undefined) clearMsg = true;
      provEditingId = null; provEditingUpdatedAt = null; 
      $("#prov-name, #prov-url").val(""); $("#prov-add").html("<i class='bi bi-cloud-arrow-up-fill me-1'></i> Register Origin"); $("#prov-cancel").addClass("hide"); 
      $("#prov-form-title").text("Add Provider"); if (clearMsg) clearMessage($("#prov-msg")); 
    };

    const resetTemplateForm = (clearMsg) => { 
      if (clearMsg === undefined) clearMsg = true;
      templateEditingId = null; templateEditingUpdatedAt = null; 
      $("#template-name").val(""); $("#rules-container").empty().append(newRuleRow()); 
      $("#template-create").html("<i class='bi bi-cloud-arrow-up-fill me-1'></i> Save Template"); $("#template-cancel").addClass("hide"); 
      $("#temp-form-title").text("Create Template Container"); if (clearMsg) clearMessage($("#template-msg")); 
    };

    const resetRouterForm = (clearMsg) => { 
      if (clearMsg === undefined) clearMsg = true;
      routerEditingId = null; routerEditingUpdatedAt = null; 
      $("#router-path").val(""); $("#router-ecs").prop("checked", false); 
      $("#router-upstreams, #router-templates").val([]); $("#router-create").html("<i class='bi bi-cloud-arrow-up-fill me-1'></i> Create Endpoint"); 
      $("#router-cancel").addClass("hide"); $("#router-form-title").text("Create Endpoint"); if (clearMsg) clearMessage($("#router-msg")); 
    };

    const checkSession = async () => { 
      const r = await apiFetch("/session"); 
      if (r.ok && r.json && r.json.authenticated) { 
        $("#auth-view").addClass("hide"); $("#panel-root").removeClass("hide"); 
        $("#btn-refresh-dashboard, #last-updated-time").removeClass("hide"); 
        loadAllData(); 
      } else { 
        $("#auth-view").removeClass("hide"); $("#login-area").removeClass("hide"); $("#panel-root").addClass("hide"); 
        $("#btn-refresh-dashboard, #last-updated-time").addClass("hide"); 
      } 
    };

    $("#btn-login").on("click", async () => { 
      clearMessage($("#login-msg")); 
      const pw = $("#pw").val() || ""; if (!pw) return showMessage($("#login-msg"), "Password required", "warning"); 
      const r = await apiFetch("/login", { method: "POST", body: { password: pw } }); 
      if (r.ok && r.json && r.json.ok) { 
        if (r.json.must_change) { $("#login-area").addClass("hide"); $("#force-change-area").removeClass("hide"); } 
        else await checkSession(); 
      } else showMessage($("#login-msg"), (r.json && r.json.error) ? r.json.error : "Authentication denied", "danger"); 
    });

    $("#btn-change-creds").on("click", async () => { 
      clearMessage($("#change-msg")); 
      const newPw = $("#new-pw").val() || "", newSec = $("#new-secret").val() || ""; 
      if (!newPw) return showMessage($("#change-msg"), "Secure password required", "warning"); 
      const r = await apiFetch("/change-credentials", { method: "POST", body: { new_password: newPw, new_secret_path: newSec } }); 
      if (r.ok && r.json && r.json.ok) { 
        showMessage($("#change-msg"), "Credentials locked. Initializing engine...", "success"); 
        setTimeout(() => {
            window.location.href = (r.json.secret_path && r.json.secret_path !== window.location.pathname.split("/")[1]) 
                ? window.location.origin + "/" + r.json.secret_path + "/panel/" 
                : window.location.href;
        }, 1000); 
      } else showMessage($("#change-msg"), (r.json && r.json.error) ? r.json.error : "Validation failed", "danger"); 
    });

    $("#btn-logout").on("click", async () => { await apiFetch("/logout", { method: "POST" }); location.reload(); });

    $(".nav-sidebar .nav-link").on("click", () => { 
      const offcanvasEl = document.getElementById("sidebarMenu"); 
      if(offcanvasEl) { const bsi = bootstrap.Offcanvas.getInstance(offcanvasEl); if(bsi && window.innerWidth < 992) bsi.hide(); } 
    });

    $("button[data-bs-toggle='tab']").on("shown.bs.tab", (e) => { 
      const targetId = $(e.target).data("bs-target"); 
      if (targetId === "#lookup") { 
        $("#btn-refresh-dashboard, #last-updated-time").addClass("hide"); 
      } else { 
        $("#btn-refresh-dashboard, #last-updated-time").removeClass("hide"); 
        loadAllData(); 
      } 
    });

    $("#lookup-provider").on("change", function() { if ($(this).val() === "custom") $("#lookup-custom-url-container").removeClass("hide"); else $("#lookup-custom-url-container").addClass("hide"); });
    $("#view-table-btn").on("click", function() { $(this).addClass("active btn-light").removeClass("btn-transparent text-muted"); $("#view-json-btn").removeClass("active btn-light").addClass("btn-transparent text-muted"); $("#lookup-table-view").removeClass("hide"); $("#lookup-json-view").addClass("hide"); });
    $("#view-json-btn").on("click", function() { $(this).addClass("active btn-light").removeClass("btn-transparent text-muted"); $("#view-table-btn").removeClass("active btn-light").addClass("btn-transparent text-muted"); $("#lookup-json-view").removeClass("hide"); $("#lookup-table-view").addClass("hide"); if (lastLookupResponse) $("#lookup-json-code").text(JSON.stringify(lastLookupResponse, null, 4)); });

    $("#lookup-btn").on("click", async function() { 
      clearMessage($("#lookup-msg")); $("#lookup-result-container").addClass("hide"); 
      const domain = $("#lookup-domain").val().trim(), type = $("#lookup-type").val(), provider_id = $("#lookup-provider").val(); 
      const custom_url = $("#lookup-custom-url").val().trim(), ecs_enabled = $("#lookup-ecs-switch").is(":checked"); 
      if (!domain) return showMessage($("#lookup-msg"), "Valid domain query required.", "warning"); 
      if (provider_id === "custom" && !custom_url) return showMessage($("#lookup-msg"), "Target DoH URL required.", "warning"); 

      const $btn = $(this); $btn.prop("disabled", true).html("<span class='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span> Translating..."); 
      const r = await apiFetch("/dns-lookup", { method: "POST", body: { domain: domain, type: type, provider_id: provider_id, custom_url: custom_url, ecs_enabled: ecs_enabled } }); 
      $btn.prop("disabled", false).html("<i class='bi bi-search me-1'></i> Resolve"); 

      if (r.ok && r.json && r.json.ok) { 
        const resp = r.json.response, lat = r.json.latency_ms; lastLookupResponse = resp; 
        const stMap = {0:"NOERROR", 1:"FORMERR", 2:"SERVFAIL", 3:"NXDOMAIN", 4:"NOTIMP", 5:"REFUSED"}; 
        const stText = stMap[resp.Status] || ("UNKNOWN ("+resp.Status+")"); 
        const badgeClass = resp.Status === 0 ? "bg-success-subtle text-success border-success-subtle" : "bg-danger-subtle text-danger border-danger-subtle"; 
        const dotClass = resp.Status === 0 ? "bg-success" : "bg-danger"; 
        $("#lookup-status").html("<span class='badge-pill-status " + badgeClass + "'><span class='status-dot " + dotClass + " me-1'></span> " + stText + "</span>"); 
        $("#lookup-latency").text(lat + " ms"); 
        
        const $tbody = $("#lookup-result-table tbody").empty(); 
        const typeMapRev = {1:"A", 28:"AAAA", 5:"CNAME", 16:"TXT", 15:"MX"}, badgeCls = {"A":"bg-primary-subtle text-primary border border-primary-subtle", "AAAA":"bg-success-subtle text-success border border-success-subtle", "CNAME":"bg-warning-subtle text-warning-emphasis border border-warning-subtle", "TXT":"bg-info-subtle text-info-emphasis border border-info-subtle", "MX":"bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle"}; 

        if (resp.Answer && resp.Answer.length > 0) { 
          resp.Answer.forEach(ans => { 
            const tName = typeMapRev[ans.type] || ans.type, bStyle = badgeCls[tName] || "bg-dark text-white border-dark"; 
            $tbody.append($("<tr>").append($("<td class='fw-medium text-body ps-3'>").text(ans.name)).append($("<td>").append($("<span>").addClass("badge rounded-pill " + bStyle).text(tName))).append($("<td>").html("<i class='bi bi-stopwatch text-muted'></i> " + ans.TTL)).append($("<td class='pe-3'>").addClass("text-break").css("max-width", "300px").append($("<code class='text-body border rounded-2 px-2 py-1 bg-body-tertiary'>").text(ans.data)))); 
          }); 
        } else $tbody.append($("<tr>").append($("<td>").attr("colspan", 4).addClass("text-center text-muted py-4").html("<i class='bi bi-inbox fs-4 d-block mb-2'></i> No records found."))); 
        
        if ($("#view-json-btn").hasClass("active")) $("#lookup-json-code").text(JSON.stringify(lastLookupResponse, null, 4)); 
        $("#lookup-result-container").removeClass("hide"); 
        setTimeout(() => { 
            const $t = $("#lookup-result-container"); 
            if ($t.length) $("#main-content").animate({ scrollTop: $t.offset().top - 20 }, 400); 
        }, 80); 
      } else showMessage($("#lookup-msg"), (r.json && r.json.error) ? r.json.error : "Lookup engine failed.", "danger"); 
    });

    $("#settings-save-btn").on("click", async () => { 
      clearMessage($("#settings-msg")); const ttlVal = parseInt($("#cache-ttl-input").val(), 10); 
      if (isNaN(ttlVal) || ttlVal < 1) return showMessage($("#settings-msg"), "Minimum 1s TTL required.", "danger"); 
      const r = await apiFetch("/settings", { method: "PUT", body: { cache_ttl: ttlVal, updated_at: globalSettingsUpdatedAt } }); 
      if (handleConflict(r, $("#settings-msg"))) return; 
      if (r.ok) { showMessage($("#settings-msg"), "Configuration applied globally.", "success"); loadAllData(); } 
      else showMessage($("#settings-msg"), (r.json && r.json.error) ? r.json.error : "Engine reject.", "danger"); 
    });

    const renderProvidersTable = () => { 
      const $tb = $("#prov-table tbody").empty(); 
      if (!allProviders.length) return $tb.append("<tr><td colspan='3' class='text-center text-muted py-4'><i class='bi bi-inbox fs-4 d-block mb-2'></i> No origins registered</td></tr>"); 
      allProviders.forEach(p => { 
        $tb.append($("<tr>").append($("<td class='fw-bold text-body ps-3'>").text(p.display_name)).append($("<td class='text-muted'>").text(p.url)).append($("<td class='text-end pe-3'>").append($("<button>").addClass("btn btn-sm btn-light border prov-edit me-2").attr("data-id", encodeURIComponent(p.id)).html("<i class='bi bi-pencil-square'></i>")).append($("<button>").addClass("btn btn-sm btn-outline-danger prov-delete").attr("data-id", encodeURIComponent(p.id)).html("<i class='bi bi-trash3-fill'></i>")))); 
      }); 
    };

    $(document).on("click", ".prov-delete", async function() { 
      const id = decodeURIComponent($(this).data("id")); const p = allProviders.find(x => x.id === id); 
      if (!confirm("Drop origin from database?")) return; 
      const r = await apiFetch("/providers/" + encodeURIComponent(id), { method: "DELETE", body: { updated_at: p ? p.updated_at : null } }); 
      if (handleConflict(r)) return; 
      if (r.ok) loadAllData(); else showMessage($("#prov-msg"), (r.json && r.json.error) ? r.json.error : "Drop failed", "danger"); 
    });

    $(document).on("click", ".prov-edit", function() { 
      const id = decodeURIComponent($(this).data("id")); const p = allProviders.find(x => x.id === id); 
      if (!p) { handleConflict({status: 409}, $("#prov-msg")); return; } 
      provEditingId = id; provEditingUpdatedAt = p.updated_at; $("#prov-name").val(p.display_name); $("#prov-url").val(p.url); 
      $("#prov-add").html("<i class='bi bi-cloud-arrow-up-fill me-1'></i> Update Origin"); $("#prov-cancel").removeClass("hide"); $("#prov-form-title").text("Edit Origin Provider"); 
    });

    $("#prov-add").on("click", async () => { 
      clearMessage($("#prov-msg")); 
      const name = $("#prov-name").val().trim(), url = $("#prov-url").val().trim(); 
      if (!name || !url) return showMessage($("#prov-msg"), "Identifier and URL required", "warning"); 
      let payload = { display_name: name, url: url, updated_at: provEditingUpdatedAt }; 
      let path = provEditingId ? "/providers/" + encodeURIComponent(provEditingId) : "/providers"; 
      let method = provEditingId ? "PUT" : "POST"; 
      let r = await apiFetch(path, { method: method, body: payload }); 
      if (handleConflict(r, $("#prov-msg"))) return; 
      if (r.ok && r.json && r.json.error === "live_test_failed") { 
        if (confirm("Target DoH ping timeout. Force injection into database?")) { payload.force = true; r = await apiFetch(path, { method: method, body: payload }); if (handleConflict(r, $("#prov-msg"))) return; } else return; 
      } 
      if (r.ok && r.json && r.json.ok) { showMessage($("#prov-msg"), provEditingId ? "Origin updated" : "Origin injected", "success"); loadAllData(); } 
      else showMessage($("#prov-msg"), (r.json && r.json.error) ? r.json.error : "Injection failed", "danger"); 
    });

    $("#prov-cancel").on("click", () => resetProvForm(true));

    const newRuleRow = (rule) => { 
      rule = rule || { type: "A", domain: "", targets: "", target: "", resolve_cname: false };
      const $div = $("<div>").addClass("rule-row bg-body p-3 border rounded-3 mb-2"); 
      const $tSel = $("<select>").addClass("form-select rule-type fw-bold text-primary").css("max-width", "110px").append("<option value='A'>A</option><option value='AAAA'>AAAA</option><option value='CNAME'>CNAME</option>"); 
      const $domInp = $("<input>").addClass("form-control rule-domain fw-medium").attr("placeholder", "*.example.com"); 
      const $tarInp = $("<input>").addClass("form-control rule-targets font-monospace text-muted"); 
      const ckId = "ck_" + Date.now() + Math.floor(Math.random()*1000); 
      const $fw = $("<div>").addClass("form-check form-switch ms-1 flatten-wrapper d-none bg-info-subtle border border-info-subtle rounded-pill px-2 py-1").attr("title", "Resolve Target back-end seamlessly...").append($("<input>").addClass("form-check-input rule-resolve-cname m-0 ms-1 me-2").attr({type:"checkbox", id:ckId}).css("cursor","pointer")).append($("<label>").addClass("form-check-label text-info-emphasis small fw-bold user-select-none pe-2").css({whiteSpace:"nowrap", cursor:"pointer"}).attr("for", ckId).text("Flatten")); 
      const $rm = $("<button>").addClass("btn btn-danger ms-1 rule-remove px-3").html("<i class='bi bi-trash'></i>"); 
      $tSel.val(rule.type); $domInp.val(rule.domain || ""); $tarInp.val(rule.type === "CNAME" ? rule.target : rule.targets); $fw.find(".rule-resolve-cname").prop("checked", !!rule.resolve_cname); 
      $tSel.on("change", function() { if ($(this).val() === "CNAME") { $fw.removeClass("d-none"); $tarInp.attr("placeholder", "CNAME Alias..."); } else { $fw.addClass("d-none"); $tarInp.attr("placeholder", "IP Addresses..."); } }).trigger("change"); 
      $rm.on("click", () => $div.remove()); return $div.append($tSel, $domInp, $tarInp, $fw, $rm); 
    };

    $("#add-rule-btn").on("click", () => $("#rules-container").append(newRuleRow()));

    const renderTemplatesTable = () => { 
      const $tb = $("#template-table tbody").empty(); 
      if (!allTemplates.length) return $tb.append("<tr><td colspan='3' class='text-center text-muted py-4'><i class='bi bi-inbox fs-4 d-block mb-2'></i> No templates configured</td></tr>"); 
      allTemplates.forEach(t => { 
        const $tr = $("<tr>").append($("<td class='fw-bold text-body ps-3 align-top pt-3'>").text(t.name)); 
        const $rulesTd = $("<td class='pt-3'>").addClass("small"); 
        (t.rules || []).forEach((ri, idx) => { 
          if (idx > 0) $rulesTd.append($("<hr class='my-2 border-secondary border-opacity-25'>")); 
          if (ri.type === "CNAME") { 
            $rulesTd.append($("<code class='text-body fw-bold'>").text(ri.domain)).append(" <i class='bi bi-arrow-right text-muted mx-1'></i> <span class='badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2'>CNAME</span> ").append($("<code class='text-muted'>").text(ri.target)); 
            if (ri.resolve_cname) $rulesTd.append(" ").append($("<span class='badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill'>Flattened</span>")); 
          } else { 
            $rulesTd.append($("<code class='text-body fw-bold'>").text(ri.domain)).append(" <i class='bi bi-arrow-right text-muted mx-1'></i> <span class='badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2'>" + ri.type + "</span> <span class='text-muted font-monospace'>[" + (ri.targets || []).join(", ") + "]</span>"); 
          } 
        }); 
        $tr.append($rulesTd).append($("<td class='text-end pe-3 align-top pt-3'>").append($("<button>").addClass("btn btn-sm btn-light border temp-edit me-2").attr("data-id", encodeURIComponent(t.id)).html("<i class='bi bi-pencil-square'></i>")).append($("<button>").addClass("btn btn-sm btn-outline-danger temp-delete").attr("data-id", encodeURIComponent(t.id)).html("<i class='bi bi-trash3-fill'></i>"))); 
        $tb.append($tr); 
      }); 
    };

    $(document).on("click", ".temp-delete", async function() { 
      if (!confirm("Drop entire template block?")) return; 
      const id = decodeURIComponent($(this).data("id")), t = allTemplates.find(x => x.id === id); 
      const r = await apiFetch("/templates/" + encodeURIComponent(id), { method: "DELETE", body: { updated_at: t ? t.updated_at : null } }); 
      if (handleConflict(r)) return; 
      if (r.ok) loadAllData(); else showMessage($("#template-msg"), (r.json && r.json.error) ? r.json.error : "Drop failed", "danger"); 
    });

    $(document).on("click", ".temp-edit", function() { 
      const id = decodeURIComponent($(this).data("id")), t = allTemplates.find(x => x.id === id); 
      if (!t) { handleConflict({status: 409}, $("#template-msg")); return; } 
      templateEditingId = id; templateEditingUpdatedAt = t.updated_at; $("#template-name").val(t.name); $("#rules-container").empty(); 
      (t.rules || []).forEach(rule => $("#rules-container").append(newRuleRow(rule.type === "CNAME" ? { type: "CNAME", domain: rule.domain, target: rule.target, resolve_cname: rule.resolve_cname } : { type: rule.type, domain: rule.domain, targets: (rule.targets || []).join(",") }))); 
      $("#template-create").html("<i class='bi bi-cloud-arrow-up-fill me-1'></i> Update Template"); $("#template-cancel").removeClass("hide"); $("#temp-form-title").text("Edit Template Container"); 
    });

    $("#template-create").on("click", async () => { 
      clearMessage($("#template-msg")); 
      const name = $("#template-name").val().trim(); if (!name) return showMessage($("#template-msg"), "Identifier required", "warning"); 
      const rules = []; let hasErr = false; 
      $("#rules-container .rule-row").each(function() { 
        const type = $(this).find(".rule-type").val(), domain = $(this).find(".rule-domain").val().trim(), tRaw = $(this).find(".rule-targets").val().trim(); 
        if(!domain) { showMessage($("#template-msg"), "Detected blank match domain", "danger"); hasErr = true; return false; } 
        rules.push(type === "CNAME" ? { type: type, domain: domain, target: tRaw, resolve_cname: $(this).find(".rule-resolve-cname").is(":checked") } : { type: type, domain: domain, targets: tRaw }); 
      }); 
      if (hasErr || !rules.length) return !hasErr && showMessage($("#template-msg"), "Define at least one execution rule.", "warning"); 
      const payload = { name: name, rules: rules, updated_at: templateEditingUpdatedAt }; 
      const r = await apiFetch(templateEditingId ? "/templates/" + encodeURIComponent(templateEditingId) : "/templates", { method: templateEditingId ? "PUT" : "POST", body: payload }); 
      if (handleConflict(r, $("#template-msg"))) return; 
      if (r.ok && r.json && r.json.ok) { showMessage($("#template-msg"), "Template block saved.", "success"); loadAllData(); } else showMessage($("#template-msg"), (r.json && r.json.error) ? r.json.error : "Logic rejection", "danger"); 
    });

    $("#template-cancel").on("click", () => resetTemplateForm(true));

    const checkRouterDuplicates = (router, templates) => { 
      const active = templates.filter(t => router.template_ids.includes(t.id)), seen = new Set(); let hasDup = false; 
      for (const t of active) { for (const r of t.rules || []) { const key = r.type + ":" + r.domain.toLowerCase(); if (seen.has(key)) { hasDup = true; break; } seen.add(key); } if (hasDup) break; } return hasDup; 
    };

    const renderRoutersTable = () => { 
      const $tb = $("#router-table tbody").empty(); 
      if (!allRouters.length) return $tb.append("<tr><td colspan='4' class='text-center text-muted py-4'><i class='bi bi-inbox fs-4 d-block mb-2'></i> No active endpoints mapped</td></tr>"); 
      allRouters.forEach(rt => { 
        const upnames = (rt.upstream_ids || []).map(id => { const p = allProviders.find(prov => prov.id === id); return p ? p.display_name : id; }).join(" <i class='bi bi-chevron-right text-muted small mx-1'></i> "); 
        const $tr = $("<tr>"); 
        const $tdP = $("<td class='ps-3'>").append($("<code class='text-body fw-bold fs-6'>").text(rt.custom_path)); 
        if (rt.ecs_enabled) $tdP.append(" ").append($("<span class='fw-semibold text-success ms-2 small'><i class='bi bi-globe me-1'></i> Enabled</span>")); 
        if (checkRouterDuplicates(rt, allTemplates)) $tdP.append(" ").append($("<span class='badge bg-warning text-dark border border-warning-subtle rounded-pill ms-1' style='cursor:help;' title='Duplicate rules. First match takes precedence.'><i class='bi bi-exclamation-triangle'></i> Conflict</span>")); 
        $tr.append($tdP).append($("<td class='small fw-medium'>").html(upnames)).append($("<td class='small text-muted font-monospace'>").text((rt.template_ids || []).length + " block(s)")).append($("<td class='text-end pe-3'>").append($("<button>").addClass("btn btn-sm btn-light border r-edit me-2").attr("data-id", encodeURIComponent(rt.id)).html("<i class='bi bi-pencil-square'></i>")).append($("<button>").addClass("btn btn-sm btn-outline-danger r-delete").attr("data-id", encodeURIComponent(rt.id)).html("<i class='bi bi-trash3-fill'></i>"))); 
        $tb.append($tr); 
      }); 
    };

    $(document).on("click", ".r-delete", async function() { 
      if (!confirm("Drop mapping endpoint?")) return; 
      const id = decodeURIComponent($(this).data("id")), ro = allRouters.find(x => x.id === id); 
      const r = await apiFetch("/routers/" + encodeURIComponent(id), { method: "DELETE", body: { updated_at: ro ? ro.updated_at : null } }); 
      if (handleConflict(r)) return; 
      if (r.ok) loadAllData(); else showMessage($("#router-msg"), (r.json && r.json.error) ? r.json.error : "Drop failed", "danger"); 
    });

    $(document).on("click", ".r-edit", function() { 
      const roId = decodeURIComponent($(this).data("id")), ro = allRouters.find(x => x.id === roId); 
      if (!ro) { handleConflict({status: 409}, $("#router-msg")); return; } 
      routerEditingId = ro.id; routerEditingUpdatedAt = ro.updated_at; $("#router-path").val(ro.custom_path); $("#router-ecs").prop("checked", !!ro.ecs_enabled); 
      $("#router-upstreams option").each(function() { $(this).prop("selected", ro.upstream_ids && ro.upstream_ids.includes($(this).val())); }); 
      $("#router-templates option").each(function() { $(this).prop("selected", ro.template_ids && ro.template_ids.includes($(this).val())); }); 
      $("#router-create").html("<i class='bi bi-cloud-arrow-up-fill me-1'></i> Update Endpoint"); $("#router-cancel").removeClass("hide"); $("#router-form-title").text("Edit Endpoint Configuration"); 
    });

    $("#router-create").on("click", async () => { 
      clearMessage($("#router-msg")); 
      const path = $("#router-path").val().trim(), upstreams = $("#router-upstreams").val() || [], tmpls = $("#router-templates").val() || [], ecs = $("#router-ecs").is(":checked"); 
      if (!path) return showMessage($("#router-msg"), "Mount path required", "warning"); 
      if (!upstreams.length) return showMessage($("#router-msg"), "Assign at least one fallback origin.", "warning"); 
      const payload = { custom_path: path, upstream_ids: upstreams, template_ids: tmpls, ecs_enabled: ecs, updated_at: routerEditingUpdatedAt }; 
      const rt = await apiFetch(routerEditingId ? "/routers/" + encodeURIComponent(routerEditingId) : "/routers", { method: routerEditingId ? "PUT" : "POST", body: payload }); 
      if (handleConflict(rt, $("#router-msg"))) return; 
      if (rt.ok) { showMessage($("#router-msg"), "Mapping linked.", "success"); loadAllData(); } else showMessage($("#router-msg"), (rt.json && rt.json.error) ? rt.json.error : "Err", "danger"); 
    });

    $("#router-cancel").on("click", () => resetRouterForm(true));

    const populateUpstreams = (providers) => { 
      const $u = $("#router-upstreams").empty(), $l = $("#lookup-provider").empty(); 
      providers.forEach(p => { $u.append($("<option>").val(p.id).text(p.display_name)); $l.append($("<option>").val(p.id).text(p.display_name)); }); 
      $l.append($("<option>").val("custom").addClass("fw-bold text-primary").text("Temporary DoH Origin...")); 
    };
    
    const populateTemplatesSelect = (templates) => { 
      const $t = $("#router-templates").empty(); 
      templates.forEach(t => $t.append($("<option>").val(t.id).text(t.name))); 
    };

    const renderOverviewDashboard = () => { 
      $("#stat-routers").text(allRouters.length); $("#stat-templates").text(allTemplates.length); 
      $("#stat-providers").text(allProviders.length); $("#stat-ttl").text((globalSettings.cache_ttl || 60) + "s"); 
      let totalRulesCount = 0; allTemplates.forEach(t => { totalRulesCount += (t.rules || []).length; }); 
      $("#stat-total-rules").text(totalRulesCount); 
      const $tbody = $("#quick-router-table tbody").empty(); 
      if (allRouters.length === 0) return $tbody.append("<tr><td colspan='4' class='text-center text-muted py-4'><i class='bi bi-inbox fs-4 d-block mb-2'></i> No active network endpoints mounted</td></tr>"); 
      allRouters.forEach(rt => { 
        const fullDohURL = window.location.origin + rt.custom_path, ecsEnabled = !!rt.ecs_enabled; 
        const $tr = $("<tr>"); 
        $tr.append($("<td class='ps-3'>").append($("<code class='text-body fw-bold'>").text(rt.custom_path))); 
        $tr.append($("<td>").append($("<span class='user-select-all small text-muted font-monospace'>").text(fullDohURL))); 
        $tr.append($("<td>").html("<span class='fw-semibold " + (ecsEnabled ? "text-success" : "text-muted") + " small'><i class='bi bi-globe me-1'></i> " + (ecsEnabled ? "Enabled" : "Disabled") + "</span>")); 
        const $copyBtn = $("<button>").addClass("btn btn-sm btn-outline-primary py-0 px-2 fw-medium copy-endpoint-btn").attr("data-url", fullDohURL).html("<i class='bi bi-clipboard'></i> Copy"); 
        $tr.append($("<td class='text-end pe-3'>").append($copyBtn)); 
        $tbody.append($tr); 
      }); 
    };

    const updateLastUpdatedTime = () => { 
      const now = new Date(), hh = String(now.getHours()).padStart(2, "0"), mm = String(now.getMinutes()).padStart(2, "0"), ss = String(now.getSeconds()).padStart(2, "0"); 
      $("#last-updated-time").text("Last updated: " + hh + ":" + mm + ":" + ss); 
    };

    $(document).on("click", "#btn-refresh-dashboard", async function() { 
      const $btn = $(this); $btn.prop("disabled", true).find("#refresh-icon").addClass("spin"); $btn.find("span").text("Syncing..."); 
      await loadAllData(); 
      $btn.prop("disabled", false).find("#refresh-icon").removeClass("spin"); $btn.find("span").text("Refresh Data"); 
    });

    $(document).on("click", ".copy-endpoint-btn", function() { 
      const url = $(this).data("url"), $btn = $(this); 
      navigator.clipboard.writeText(url).then(() => { 
        $btn.removeClass("btn-outline-primary").addClass("btn-success text-white border-success").html("<i class='bi bi-check-lg'></i> Copied"); 
        setTimeout(() => { 
            $btn.removeClass("btn-success text-white border-success").addClass("btn-outline-primary").html("<i class='bi bi-clipboard'></i> Copy"); 
        }, 1500); 
      }).catch(() => { alert("Manual copy required: " + url); }); 
    });

    const loadAllData = async () => { 
      const [pResp, tResp, rResp, sResp] = await Promise.all([ apiFetch("/providers"), apiFetch("/templates"), apiFetch("/routers"), apiFetch("/settings") ]); 
      allProviders = pResp.ok ? (pResp.json.providers || []) : []; allTemplates = tResp.ok ? (tResp.json.templates || []) : []; allRouters = rResp.ok ? (rResp.json.routers || []) : []; 
      if (sResp.ok && sResp.json && sResp.json.settings) { globalSettings = sResp.json.settings; globalSettingsUpdatedAt = globalSettings.updated_at; $("#cache-ttl-input").val(globalSettings.cache_ttl || 60); } 
      populateUpstreams(allProviders); populateTemplatesSelect(allTemplates); 
      renderProvidersTable(); renderTemplatesTable(); renderRoutersTable(); renderOverviewDashboard(); 
      updateLastUpdatedTime(); resetProvForm(false); resetTemplateForm(false); resetRouterForm(false); 
    };

    const escapeHtml = (s) => { return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\\"": "&quot;"}[c])); }; 
    $("#rules-container").append(newRuleRow()); checkSession();
  });
  </script>
</body>
</html>`;
}