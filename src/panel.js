export function renderPanelHTML() {
  return `<!doctype html>
<html lang="en" data-bs-theme="auto">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>DoH Proxy — Management Panel</title>

  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23198754%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27><path d=%27M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z%27></path><circle cx=%2712%27 cy=%2710%27 r=%273%27></circle><path d=%27M12 13v4%27></path></svg>">

  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  
  <!-- jQuery 3.7.1 CDN -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js" crossorigin="anonymous"></script>

  <style>
    html, body {
      scroll-behavior: smooth;
    }
    
    [data-bs-theme="dark"] {
      --bs-body-bg: #0d1117;
      --bs-body-color: #c9d1d9;
      --bs-card-bg: #161b22;
      --bs-card-border-color: rgba(255, 255, 255, 0.08);
      --bs-border-color: rgba(255, 255, 255, 0.12);
    }
    [data-bs-theme="light"] {
      --bs-body-bg: #f6f8fa;
      --bs-body-color: #24292f;
      --bs-card-bg: #ffffff;
      --bs-card-border-color: rgba(0, 0, 0, 0.1);
      --bs-border-color: rgba(0, 0, 0, 0.12);
    }
    
    body { min-height: 100vh; padding-bottom: 3rem; }
    .hide { display: none !important; }
    .rule-row { gap: .5rem; align-items: center; display:flex; margin-bottom:.5rem; flex-wrap:wrap;}
    .rule-row input, .rule-row select { flex: 1; }
    
    .card { border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .nav-tabs .nav-link { border-radius: 6px 6px 0 0; }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spin {
      animation: spin 1s linear infinite;
    }
  </style>
</head>
<body>

  <!-- Top Navbar -->
  <nav class="navbar navbar-expand-lg border-bottom mb-4 py-3 bg-body-tertiary">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none" href="#">
        <div class="bg-success bg-opacity-10 p-2 rounded-3 border border-success border-opacity-25 d-flex align-items-center justify-content-center text-success" style="width: 38px; height: 38px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><circle cx="12" cy="10" r="3"></circle><path d="M12 13v4"></path>
          </svg>
        </div>
        <div class="d-flex flex-column text-start">
          <span class="fs-6 lh-sm text-body">DoH Proxy</span>
          <span class="text-muted fw-normal" style="font-size: 0.75rem;">Secure DNS Routing</span>
        </div>
      </a>

      <!-- Navbar Right Actions -->
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <span id="last-updated-time" class="text-muted small hide">Last updated: --:--:--</span>
        <button id="btn-refresh-dashboard" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 hide">
          <svg id="refresh-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
          <span>Refresh Data</span>
        </button>

        <div id="auth-status" class="text-end"></div>
        
        <div class="dropdown">
          <button id="themeBtn" class="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">Theme</button>
          <ul class="dropdown-menu dropdown-menu-end shadow">
            <li><a class="dropdown-item d-flex align-items-center gap-2 theme-option" href="#" data-theme="auto"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-circle-half" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 0 8 1zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16"/></svg> Auto (System)</a></li>
            <li><a class="dropdown-item d-flex align-items-center gap-2 theme-option" href="#" data-theme="dark"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-moon-stars-fill" viewBox="0 0 16 16"><path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/><path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/></svg> Dark Mode</a></li>
            <li><a class="dropdown-item d-flex align-items-center gap-2 theme-option" href="#" data-theme="light"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-brightness-high-fill" viewBox="0 0 16 16"><path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/></svg> Light Mode</a></li>
          </ul>
        </div>
      </div>
    </div>
  </nav>

  <div class="container">
    <!-- Login Card -->
    <div id="login-area" class="card p-4 mb-3">
      <h2 class="h5">Sign In</h2>
      <p class="text-muted">Enter your password to access the panel.</p>
      <div class="mb-3"><label class="form-label">Password</label><input id="pw" type="password" class="form-control" /></div>
      <button id="btn-login" class="btn btn-primary">Sign in</button><div id="login-msg" class="mt-3"></div>
    </div>

    <!-- Force Change Credentials Card -->
    <div id="force-change-area" class="card p-4 mb-3 hide">
      <h2 class="h5 text-warning">Force: Change Password & Secret Path</h2>
      <p class="text-muted">Please update your initial generated credentials for security.</p>
      <div class="mb-3"><label class="form-label">New Password</label><input id="new-pw" type="password" class="form-control" /></div>
      <div class="mb-3"><label class="form-label">New Secret Path (optional, URL-safe)</label><input id="new-secret" type="text" class="form-control" placeholder="e.g. my-secret-123" /></div>
      <button id="btn-change-creds" class="btn btn-warning text-dark fw-semibold">Change Credentials</button>
      <div id="change-msg" class="mt-3"></div>
    </div>

    <!-- Master Admin Panel Root -->
    <div id="panel-root" class="hide">
      <ul class="nav nav-tabs" id="mainTabs" role="tablist">
        <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#overview">Overview</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#routers">Endpoints (Routers)</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#templates">DNS Rewrite Templates</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#providers">Upstream Providers</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#lookup">DNS Lookup</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#settings">Global Settings</button></li>
      </ul>

      <div class="tab-content mt-3">
        <!-- Tab 0: Overview -->
        <div class="tab-pane fade show active" id="overview" role="tabpanel">
          <div class="mb-4">
            <h2 class="h5 mb-0 fw-bold">Executive Dashboard</h2>
            <div class="form-text text-muted">A live summary of your active custom endpoints and routing upstream DNS layers.</div>
          </div>
          <div class="row g-3 mb-4">
            <div class="col-md-3 col-sm-6"><div class="card p-3 bg-body-tertiary border-0 shadow-sm text-center text-sm-start"><div class="text-muted small fw-medium">Active Endpoints</div><div class="h3 mb-0 fw-bold text-success mt-1" id="stat-routers">0</div></div></div>
            <div class="col-md-3 col-sm-6"><div class="card p-3 bg-body-tertiary border-0 shadow-sm text-center text-sm-start"><div class="text-muted small fw-medium">DNS Templates</div><div class="h3 mb-0 fw-bold text-primary mt-1" id="stat-templates">0</div></div></div>
            <div class="col-md-3 col-sm-6"><div class="card p-3 bg-body-tertiary border-0 shadow-sm text-center text-sm-start"><div class="text-muted small fw-medium">Upstream Providers</div><div class="h3 mb-0 fw-bold text-info mt-1" id="stat-providers">0</div></div></div>
            <div class="col-md-3 col-sm-6"><div class="card p-3 bg-body-tertiary border-0 shadow-sm text-center text-sm-start"><div class="text-muted small fw-medium">Global Cache TTL</div><div class="h3 mb-0 fw-bold text-warning mt-1" id="stat-ttl">60s</div></div></div>
          </div>
          <div class="row g-3">
            <div class="col-md-8">
              <div class="card p-3 h-100">
                <h3 class="h6 border-bottom pb-2 fw-bold text-body">Quick Endpoints List</h3>
                <div class="table-responsive">
                  <table class="table table-sm table-hover mb-0 align-middle" id="quick-router-table" style="font-size: 0.95rem;">
                    <thead><tr><th>Path</th><th>Full DoH URL</th><th>ECS</th><th style="width: 80px;">Action</th></tr></thead>
                    <tbody><tr><td colspan="4" class="text-muted py-3">Loading active endpoints...</td></tr></tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card p-3 h-100">
                <h3 class="h6 border-bottom pb-2 fw-bold text-body">System Status</h3>
                <ul class="list-group list-group-flush small mt-2">
                  <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent"><span class="text-muted">Proxy Status</span><span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">Online</span></li>
                  <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent"><span class="text-muted">Cloudflare KV Database</span><span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">Connected</span></li>
                  <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent"><span class="text-muted">Isolate Cache (Memory)</span><span class="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 rounded-pill">Active (5m TTL)</span></li>
                  <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent border-bottom-0 pb-0"><span class="text-muted">Active Domain Rewrites</span><span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-pill" id="stat-total-rules">0</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 1: Routers -->
        <div class="tab-pane fade" id="routers" role="tabpanel">
          <div class="card p-3 mb-3">
            <h3 class="h6" id="router-form-title">Create Endpoint</h3>
            <div class="mb-2"><input id="router-path" class="form-control" placeholder="/secure-dns/doh/"></div>
            <div class="form-check form-switch mb-3 mt-3">
              <input class="form-check-input" type="checkbox" role="switch" id="router-ecs" style="cursor: pointer;">
              <label class="form-check-label fw-semibold text-body" for="router-ecs" style="cursor: pointer;">Enable ECS for this Router</label>
              <div class="form-text mt-0">Help upstream servers return faster and geo-optimized IP addresses based on client location.</div>
            </div>
            <div class="mb-2">
              <label class="form-label small">Upstream Priority (Failover List)</label>
              <select id="router-upstreams" class="form-select" multiple size="4"></select>
              <div class="form-text">Hold Ctrl (Cmd) to select multiple. The order of selection dictates upstream priority.</div>
              <div class="alert alert-warning small mt-2 py-2 mb-0 border-warning border-opacity-50">
                <strong>Warning:</strong> Activating multiple upstream providers may slightly lower your privacy boundaries as DNS queries will be shared across different networks during failovers.
              </div>
            </div>
            <div class="mb-2">
              <label class="form-label small">DNS Templates</label>
              <select id="router-templates" class="form-select" multiple size="6"></select>
              <div class="form-text">Optional. Select templates to apply rule rewrites.</div>
            </div>
            <div class="d-flex gap-2">
              <button id="router-create" class="btn btn-success">Create Endpoint</button><button id="router-cancel" class="btn btn-secondary hide">Cancel</button>
            </div>
            <div id="router-msg" class="mt-2"></div>
          </div>
          <div class="card p-3"><h3 class="h6">Active Custom Endpoints</h3><div class="table-responsive"><table id="router-table" class="table table-sm"><thead><tr><th>Path</th><th>Upstream (Priority)</th><th>Rewrite Templates</th><th>Actions</th></tr></thead><tbody></tbody></table></div></div>
        </div>

        <!-- Tab 2: Templates -->
        <div class="tab-pane fade" id="templates" role="tabpanel">
          <div class="card p-3 mb-3">
            <h3 class="h6" id="temp-form-title">Create Template</h3>
            <div class="mb-3"><input id="template-name" class="form-control" placeholder="Template name (unique)"></div>
            <div class="alert alert-info py-2 small mb-3 border-info border-opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-info-circle-fill me-1 mb-1" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 1 0 8a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/></svg>
              <strong>Matching Rules:</strong> Use <code>*.example.com</code> to include the domain and all its subdomains. Otherwise, it will only match exactly. Exact matches have priority over wildcards.
            </div>
            <div id="rules-container" class="mb-2"></div>
            <div class="mb-2"><button id="add-rule-btn" class="btn btn-sm btn-outline-primary">Add Rule</button></div>
            <div>
              <button id="template-create" class="btn btn-success">Create Template</button><button id="template-cancel" class="btn btn-secondary hide">Cancel</button>
            </div><div id="template-msg" class="mt-2"></div>
          </div>
          <div class="card p-3"><h3 class="h6">Existing Templates</h3><div class="table-responsive"><table id="template-table" class="table table-sm"><thead><tr><th>Name</th><th>Rules</th><th>Actions</th></tr></thead><tbody></tbody></table></div></div>
        </div>

        <!-- Tab 3: Providers -->
        <div class="tab-pane fade" id="providers" role="tabpanel">
          <div class="card p-3 mb-3">
            <h3 class="h6" id="prov-form-title">Add Provider</h3>
            <div class="row g-2 mb-2">
              <div class="col-md-5"><input id="prov-name" class="form-control" placeholder="Display name (e.g. Cloudflare)"></div>
              <div class="col-md-5"><input id="prov-url" class="form-control" placeholder="https://example.com/dns-query"></div>
              <div class="col-md-2 d-flex gap-2">
                <button id="prov-add" class="btn btn-success w-100">Add</button><button id="prov-cancel" class="btn btn-secondary w-100 hide">Cancel</button>
              </div>
            </div><div id="prov-msg" class="mt-2"></div>
          </div>
          <div class="card p-3"><h3 class="h6">Upstream DNS Providers</h3><div class="table-responsive"><table id="prov-table" class="table table-sm"><thead><tr><th>Name</th><th>URL</th><th>Actions</th></tr></thead><tbody></tbody></table></div></div>
        </div>

        <!-- Tab 4: Live DNS Lookup Tool -->
        <div class="tab-pane fade" id="lookup" role="tabpanel">
          <div class="card p-4">
            <h3 class="h6 border-bottom pb-2">Live DNS Lookup</h3>
            <div class="row g-3 mt-2">
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Domain Name</label>
                <input type="text" id="lookup-domain" class="form-control" placeholder="e.g. ubuntu.com">
              </div>
              <div class="col-md-2">
                <label class="form-label small fw-semibold">Record Type</label>
                <select id="lookup-type" class="form-select">
                  <option value="A">A</option><option value="AAAA">AAAA</option><option value="CNAME">CNAME</option><option value="TXT">TXT</option><option value="MX">MX</option>
                </select>
              </div>
              <div class="col-md-5">
                <label class="form-label small fw-semibold">Target Provider</label>
                <select id="lookup-provider" class="form-select"></select>
              </div>
              <div class="col-md-2 d-flex align-items-end">
                <button id="lookup-btn" class="btn btn-primary w-100">Resolve</button>
              </div>
            </div>
            
            <div class="form-check form-switch mt-3">
              <input class="form-check-input" type="checkbox" role="switch" id="lookup-ecs-switch" style="cursor: pointer;">
              <label class="form-check-label small fw-semibold" for="lookup-ecs-switch" style="cursor: pointer;">Enable ECS (EDNS Client Subnet) for this lookup</label>
            </div>
            
            <div class="row g-3 mt-1 hide" id="lookup-custom-url-container">
              <div class="col-md-12">
                <label class="form-label small fw-semibold text-primary mt-2">Custom DoH URL</label>
                <input type="text" id="lookup-custom-url" class="form-control border-primary" placeholder="https://your-custom-doh.com/dns-query">
              </div>
            </div>
            
            <div id="lookup-msg" class="mt-3"></div>
            
            <div id="lookup-result-container" class="mt-4 hide">
              <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2 flex-wrap gap-2">
                <h4 class="h6 mb-0">Results</h4>
                <div class="d-flex align-items-center gap-3">
                  <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-secondary active" id="view-table-btn">Table</button>
                    <button type="button" class="btn btn-outline-secondary" id="view-json-btn">Raw JSON</button>
                  </div>
                  <div class="text-muted small border-start ps-3 d-flex gap-3">
                    <span id="lookup-status"></span>
                    <span>Latency: <span id="lookup-latency" class="badge bg-secondary rounded-pill px-2"></span></span>
                  </div>
                </div>
              </div>
              
              <div id="lookup-table-view">
                <div class="table-responsive">
                  <table class="table table-sm table-bordered mb-0" id="lookup-result-table">
                    <thead class="table-light"><tr><th>Name</th><th>Type</th><th>TTL</th><th>Data</th></tr></thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>

              <div id="lookup-json-view" class="hide">
                <pre class="bg-body-tertiary p-3 rounded border border-secondary border-opacity-25 mb-0" style="max-height: 400px; overflow-y: auto;"><code id="lookup-json-code"></code></pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 5: Global Settings -->
        <div class="tab-pane fade" id="settings" role="tabpanel">
          <div class="card p-4">
            <h3 class="h6 border-bottom pb-2">Global Settings</h3>
            <div class="mb-3 mt-3" style="max-width: 350px;">
              <label class="form-label fw-semibold small" for="cache-ttl-input">DNS Cache TTL (in seconds)</label>
              <input type="number" class="form-control" id="cache-ttl-input" min="1" max="86400" value="60">
              <div class="form-text mt-1">Set how long DNS responses should be cached on Cloudflare Edge (Default: 60 seconds).</div>
            </div>
            <div>
              <button id="settings-save-btn" class="btn btn-primary btn-sm px-3">Save Settings</button>
            </div>
            <div id="settings-msg" class="mt-3"></div>
          </div>
        </div>

      </div>

      <footer class="mt-5 border-top pt-3 d-flex justify-content-between align-items-center">
        <span class="text-muted small">DoH Proxy Admin Engine v4.3 (Parallel Sync)</span>
        <button id="btn-logout" class="btn btn-sm btn-outline-danger">Log out</button>
      </footer>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

  <script>
  $(function() {
    
    function applyTheme(mode) {
      const isAutoDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      $('html').attr('data-bs-theme', (!mode || mode === 'auto') ? (isAutoDark ? 'dark' : 'light') : mode);
      $('#themeBtn').text((!mode || mode === 'auto') ? '🌓 Auto' : (mode === 'dark' ? '🌙 Dark' : '☀️ Light'));
    }
    applyTheme(localStorage.getItem('doh_theme') || 'auto');
    $('.theme-option').on('click', function(e) {
      e.preventDefault(); const t = $(this).data('theme'); localStorage.setItem('doh_theme', t); applyTheme(t);
    });

    const API_BASE = window.location.origin + '/' + (window.location.pathname.split('/').filter(Boolean)[0] || '') + '/api';

    // State Variables
    let provEditingId = null, templateEditingId = null, routerEditingId = null;
    let provEditingUpdatedAt = null, templateEditingUpdatedAt = null, routerEditingUpdatedAt = null, globalSettingsUpdatedAt = null;
    let lastLookupResponse = null;
    let allProviders = [], allTemplates = [], allRouters = [], globalSettings = { cache_ttl: 60 };

    function showMessage($el, msg, type = 'info') { const t = type === 'info' ? 'secondary' : type; $el.empty().append($('<div>').addClass('alert alert-' + t + ' small mb-0').text(msg)); }
    function clearMessage($el) { $el.empty(); }

    async function apiFetch(path, opts = {}) {
      try {
        const res = await $.ajax({ url: API_BASE + path, method: opts.method || 'GET', contentType: 'application/json', data: opts.body ? JSON.stringify(opts.body) : undefined, xhrFields: { withCredentials: true } });
        return { ok: true, status: 200, json: res };
      } catch (err) {
        return { ok: false, status: err.status, json: err.responseJSON || { error: err.statusText } };
      }
    }

    function handleConflict(r, $msgContainer) {
       if (r.status === 409) {
           const msg = 'Data was modified or deleted in another session. The panel will now refresh with the latest data.';
           if ($msgContainer) showMessage($msgContainer, msg, 'warning');
           else alert(msg);
           loadAllData();
           return true;
       }
       return false;
    }

    function resetProvForm(clearMsg = true) { 
      provEditingId = null; provEditingUpdatedAt = null; 
      $('#prov-name, #prov-url').val(''); $('#prov-add').text('Add'); $('#prov-cancel').addClass('hide'); 
      $('#prov-form-title').text('Add Provider'); if (clearMsg) clearMessage($('#prov-msg')); 
    }

    function resetTemplateForm(clearMsg = true) { 
      templateEditingId = null; templateEditingUpdatedAt = null; 
      $('#template-name').val(''); $('#rules-container').empty().append(newRuleRow()); 
      $('#template-create').text('Create Template'); $('#template-cancel').addClass('hide'); 
      $('#temp-form-title').text('Create Template'); if (clearMsg) clearMessage($('#template-msg')); 
    }

    function resetRouterForm(clearMsg = true) { 
      routerEditingId = null; routerEditingUpdatedAt = null; 
      $('#router-path').val(''); $('#router-ecs').prop('checked', false); 
      $('#router-upstreams, #router-templates').val([]); $('#router-create').text('Create Endpoint'); 
      $('#router-cancel').addClass('hide'); $('#router-form-title').text('Create Endpoint'); if (clearMsg) clearMessage($('#router-msg')); 
    }

    async function checkSession() {
      const r = await apiFetch('/session');
      if (r.ok && r.json && r.json.authenticated) {
        $('#login-area, #force-change-area').addClass('hide'); $('#panel-root').removeClass('hide');
        $('#btn-refresh-dashboard, #last-updated-time').removeClass('hide');
        $('#auth-status').html('<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Signed in</span>');
        loadAllData();
      } else {
        $('#login-area').removeClass('hide'); $('#panel-root').addClass('hide');
        $('#btn-refresh-dashboard, #last-updated-time').addClass('hide');
        $('#auth-status').html('<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">Not signed in</span>');
      }
    }

    // Auth Flows
    $('#btn-login').on('click', async () => {
      clearMessage($('#login-msg'));
      const pw = $('#pw').val() || ''; if (!pw) return showMessage($('#login-msg'), 'Enter password', 'warning');
      const r = await apiFetch('/login', { method: 'POST', body: { password: pw } });
      if (r.ok && r.json && r.json.ok) { if (r.json.must_change) { $('#login-area').addClass('hide'); $('#force-change-area').removeClass('hide'); } else await checkSession(); } 
      else showMessage($('#login-msg'), r.json?.error || 'Login failed', 'danger');
    });

    $('#btn-change-creds').on('click', async () => {
      clearMessage($('#change-msg'));
      const newPw = $('#new-pw').val() || '', newSec = $('#new-secret').val() || '';
      if (!newPw) return showMessage($('#change-msg'), 'New password is required', 'warning');
      const r = await apiFetch('/change-credentials', { method: 'POST', body: { new_password: newPw, new_secret_path: newSec } });
      if (r.ok && r.json && r.json.ok) {
        showMessage($('#change-msg'), 'Credentials updated. Redirecting...', 'success');
        setTimeout(() => window.location.href = (r.json.secret_path && r.json.secret_path !== window.location.pathname.split('/')[1]) ? window.location.origin + '/' + r.json.secret_path + '/panel/' : window.location.href, 1000);
      } else showMessage($('#change-msg'), r.json?.error || 'Failed to update', 'danger');
    });

    $('#btn-logout').on('click', async () => { await apiFetch('/logout', { method: 'POST' }); location.reload(); });

    // Live DNS Lookup
    $('#lookup-provider').on('change', function() { if ($(this).val() === 'custom') $('#lookup-custom-url-container').removeClass('hide'); else $('#lookup-custom-url-container').addClass('hide'); });
    $('#view-table-btn').on('click', function() { $(this).addClass('active'); $('#view-json-btn').removeClass('active'); $('#lookup-table-view').removeClass('hide'); $('#lookup-json-view').addClass('hide'); });
    $('#view-json-btn').on('click', function() { $(this).addClass('active'); $('#view-table-btn').removeClass('active'); $('#lookup-json-view').removeClass('hide'); $('#lookup-table-view').addClass('hide'); if (lastLookupResponse) $('#lookup-json-code').text(JSON.stringify(lastLookupResponse, null, 4)); });

    $('#lookup-btn').on('click', async function() {
        clearMessage($('#lookup-msg')); $('#lookup-result-container').addClass('hide');
        const domain = $('#lookup-domain').val().trim(), type = $('#lookup-type').val(), provider_id = $('#lookup-provider').val();
        const custom_url = $('#lookup-custom-url').val().trim(), ecs_enabled = $('#lookup-ecs-switch').is(':checked');
        if (!domain) return showMessage($('#lookup-msg'), 'Domain is required.', 'warning');
        if (provider_id === 'custom' && !custom_url) return showMessage($('#lookup-msg'), 'Custom DoH URL is required.', 'warning');

        const $btn = $(this); $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Resolving...');
        const r = await apiFetch('/dns-lookup', { method: 'POST', body: { domain, type, provider_id, custom_url, ecs_enabled } });
        $btn.prop('disabled', false).text('Resolve');

        if (r.ok && r.json && r.json.ok) {
            const resp = r.json.response, lat = r.json.latency_ms; lastLookupResponse = resp;
            const stMap = {0:'NOERROR', 1:'FORMERR', 2:'SERVFAIL', 3:'NXDOMAIN', 4:'NOTIMP', 5:'REFUSED'};
            const stText = stMap[resp.Status] || ('UNKNOWN ('+resp.Status+')');
            const svgOk = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-check-circle-fill me-1 mb-1" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>';
            const svgErr = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-x-circle-fill me-1 mb-1" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.847 2.846a.5.5 0 0 0 .708.708L8 8.707l2.846 2.847a.5.5 0 0 0 .708-.708L8.707 8l2.847-2.846a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>';
            
            $('#lookup-status').html('<span class="' + (resp.Status === 0 ? 'text-success' : 'text-danger') + ' fw-bold">' + (resp.Status === 0 ? svgOk : svgErr) + 'Status: ' + stText + '</span>');
            $('#lookup-latency').text(lat + ' ms');
            
            const $tbody = $('#lookup-result-table tbody').empty();
            const typeMapRev = {1:'A', 28:'AAAA', 5:'CNAME', 16:'TXT', 15:'MX'}, badgeCls = {'A':'bg-primary', 'AAAA':'bg-success', 'CNAME':'bg-warning text-dark', 'TXT':'bg-info text-dark', 'MX':'bg-secondary'};

            if (resp.Answer && resp.Answer.length > 0) {
                resp.Answer.forEach(ans => {
                    const tName = typeMapRev[ans.type] || ans.type, bStyle = badgeCls[tName] || 'bg-dark';
                    $tbody.append($('<tr>').append($('<td>').text(ans.name)).append($('<td>').append($('<span>').addClass('badge ' + bStyle).text(tName))).append($('<td>').text(ans.TTL)).append($('<td>').addClass('text-break').css('max-width', '300px').append($('<code>').text(ans.data))));
                });
            } else $tbody.append($('<tr>').append($('<td>').attr('colspan', 4).addClass('text-center text-muted py-3').text('No records found.')));
            
            if ($('#view-json-btn').hasClass('active')) $('#lookup-json-code').text(JSON.stringify(lastLookupResponse, null, 4));
            $('#lookup-result-container').removeClass('hide');
            setTimeout(function() { var $t = $('#lookup-result-container'); if ($t.length) $('html, body').animate({ scrollTop: $t.offset().top - 20 }, 400); }, 80);
        } else showMessage($('#lookup-msg'), r.json?.error || 'Lookup failed.', 'danger');
    });

    // Global Settings
    $('#settings-save-btn').on('click', async () => {
      clearMessage($('#settings-msg')); const ttlVal = parseInt($('#cache-ttl-input').val(), 10);
      if (isNaN(ttlVal) || ttlVal < 1) return showMessage($('#settings-msg'), 'Please enter a valid TTL.', 'danger');
      const r = await apiFetch('/settings', { method: 'PUT', body: { cache_ttl: ttlVal, updated_at: globalSettingsUpdatedAt } });
      if (handleConflict(r, $('#settings-msg'))) return;
      if (r.ok) {
         showMessage($('#settings-msg'), 'Settings saved successfully.', 'success');
         await loadAllData(); // به‌روزرسانی همزمان کل داده‌های پنل و رندر جدید داشبورد
      } else showMessage($('#settings-msg'), r.json?.error || 'Failed to save.', 'danger');
    });

    // Providers
    function renderProvidersTable() {
      const $tb = $('#prov-table tbody').empty();
      if (!allProviders.length) return $tb.append('<tr><td colspan="3" class="text-muted">No providers configured</td></tr>');
      allProviders.forEach(p => {
        $tb.append($('<tr>').append($('<td>').text(p.display_name)).append($('<td>').text(p.url)).append($('<td>')
             .append($('<button>').addClass('btn btn-sm btn-primary prov-edit me-1').attr('data-id', encodeURIComponent(p.id)).text('Edit'))
             .append($('<button>').addClass('btn btn-sm btn-danger prov-delete').attr('data-id', encodeURIComponent(p.id)).text('Del'))));
      });
    }

    $(document).on('click', '.prov-delete', async function() {
      const id = decodeURIComponent($(this).data('id'));
      const p = allProviders.find(x => x.id === id);
      if (!confirm('Delete provider?')) return;
      const r = await apiFetch('/providers/' + encodeURIComponent(id), { method: 'DELETE', body: { updated_at: p?.updated_at } });
      if (handleConflict(r)) return;
      if (r.ok) loadAllData(); else showMessage($('#prov-msg'), r.json?.error || 'Delete failed', 'danger');
    });

    $(document).on('click', '.prov-edit', function() {
      const id = decodeURIComponent($(this).data('id'));
      const p = allProviders.find(x => x.id === id);
      if (!p) { handleConflict({status: 409}, $('#prov-msg')); return; }
      provEditingId = id; provEditingUpdatedAt = p.updated_at; $('#prov-name').val(p.display_name); $('#prov-url').val(p.url);
      $('#prov-add').text('Update'); $('#prov-cancel').removeClass('hide'); $('#prov-form-title').text('Edit Provider');
    });

    $('#prov-add').on('click', async () => {
      clearMessage($('#prov-msg'));
      const name = $('#prov-name').val().trim(), url = $('#prov-url').val().trim();
      if (!name || !url) return showMessage($('#prov-msg'), 'Name and URL required', 'warning');
      
      let payload = { display_name: name, url: url, updated_at: provEditingUpdatedAt };
      let path = provEditingId ? '/providers/' + encodeURIComponent(provEditingId) : '/providers';
      let method = provEditingId ? 'PUT' : 'POST';
      
      let r = await apiFetch(path, { method, body: payload });
      if (handleConflict(r, $('#prov-msg'))) return;

      if (r.ok && r.json?.error === 'live_test_failed') {
          if (confirm("The DoH server didn't respond correctly. Do you still want to add it?")) {
              payload.force = true;
              r = await apiFetch(path, { method, body: payload });
              if (handleConflict(r, $('#prov-msg'))) return;
          } else return;
      }
      if (r.ok && r.json?.ok) { showMessage($('#prov-msg'), provEditingId ? 'Updated' : 'Added', 'success'); loadAllData(); } 
      else showMessage($('#prov-msg'), r.json?.error || 'Failed to save', 'danger');
    });

    $('#prov-cancel').on('click', () => resetProvForm(true));

    // Templates
    function newRuleRow(rule = { type: 'A', domain: '', targets: '', target: '', resolve_cname: false }) {
      const $div = $('<div>').addClass('rule-row mb-3 pb-3 border-bottom');
      const $tSel = $('<select>').addClass('form-select rule-type').css('max-width', '140px').append('<option value="A">A</option><option value="AAAA">AAAA</option><option value="CNAME">CNAME</option>');
      const $domInp = $('<input>').addClass('form-control rule-domain').attr('placeholder', 'e.g. google.com or *.google.com');
      const $tarInp = $('<input>').addClass('form-control rule-targets');
      const ckId = 'ck_' + Date.now() + Math.floor(Math.random()*1000);
      const $fw = $('<div>').addClass('form-check form-switch ms-2 flatten-wrapper d-none').attr('title', 'Resolve Target back-end seamlessly...')
                  .append($('<input>').addClass('form-check-input rule-resolve-cname').attr({type:'checkbox', id:ckId}))
                  .append($('<label>').addClass('form-check-label text-muted small user-select-none').css({whiteSpace:'nowrap', cursor:'pointer'}).attr('for', ckId).text('Flatten CNAME'));
      const $rm = $('<button>').addClass('btn btn-outline-danger ms-2 rule-remove px-3').html('&times;');
      
      $tSel.val(rule.type); $domInp.val(rule.domain || ''); $tarInp.val(rule.type === 'CNAME' ? rule.target : rule.targets);
      $fw.find('.rule-resolve-cname').prop('checked', !!rule.resolve_cname);

      $tSel.on('change', function() {
         if ($(this).val() === 'CNAME') { $fw.removeClass('d-none'); $tarInp.attr('placeholder', 'CNAME Target Destination...'); }
         else { $fw.addClass('d-none'); $tarInp.attr('placeholder', 'Comma Separated IPs...'); }
      }).trigger('change');
      
      $rm.on('click', () => $div.remove()); return $div.append($tSel, $domInp, $tarInp, $fw, $rm);
    }

    $('#add-rule-btn').on('click', () => $('#rules-container').append(newRuleRow()));

    function renderTemplatesTable() {
      const $tb = $('#template-table tbody').empty();
      if (!allTemplates.length) return $tb.append('<tr><td colspan="3" class="text-muted">No templates configured</td></tr>');
      
      allTemplates.forEach(t => {
        const $tr = $('<tr>').append($('<td>').text(t.name));
        const $rulesTd = $('<td>');
        (t.rules || []).forEach((ri, idx) => {
          if (idx > 0) $rulesTd.append($('<br>'));
          if (ri.type === 'CNAME') {
             $rulesTd.append($('<code>').text(ri.domain)).append(' \u2192 CNAME ').append($('<code>').text(ri.target));
             if (ri.resolve_cname) $rulesTd.append(' ').append($('<span>').addClass('badge bg-secondary').text('Flattened'));
          } else { $rulesTd.append($('<code>').text(ri.domain)).append(' \u2192 ' + ri.type + ' [' + (ri.targets || []).join(', ') + ']'); }
        });
        $tr.append($rulesTd).append($('<td>')
             .append($('<button>').addClass('btn btn-sm btn-primary temp-edit me-1').attr('data-id', encodeURIComponent(t.id)).text('Edit'))
             .append($('<button>').addClass('btn btn-sm btn-danger temp-delete').attr('data-id', encodeURIComponent(t.id)).text('Del')));
        $tb.append($tr);
      });
    }

    $(document).on('click', '.temp-delete', async function() {
        if (!confirm('Delete template?')) return;
        const id = decodeURIComponent($(this).data('id'));
        const t = allTemplates.find(x => x.id === id);
        const r = await apiFetch('/templates/' + encodeURIComponent(id), { method: 'DELETE', body: { updated_at: t?.updated_at } });
        if (handleConflict(r)) return;
        if (r.ok) loadAllData(); else showMessage($('#template-msg'), r.json?.error || 'Delete failed', 'danger');
    });

    $(document).on('click', '.temp-edit', function() {
        const id = decodeURIComponent($(this).data('id'));
        const t = allTemplates.find(x => x.id === id);
        if (!t) { handleConflict({status: 409}, $('#template-msg')); return; }
        templateEditingId = id; templateEditingUpdatedAt = t.updated_at; $('#template-name').val(t.name); $('#rules-container').empty();
        (t.rules || []).forEach(rule => $('#rules-container').append(newRuleRow(rule.type === 'CNAME' ? { type: 'CNAME', domain: rule.domain, target: rule.target, resolve_cname: rule.resolve_cname } : { type: rule.type, domain: rule.domain, targets: (rule.targets || []).join(',') })));
        $('#template-create').text('Update'); $('#template-cancel').removeClass('hide'); $('#temp-form-title').text('Edit Template');
    });

    $('#template-create').on('click', async () => {
      clearMessage($('#template-msg'));
      const name = $('#template-name').val().trim(); if (!name) return showMessage($('#template-msg'), 'Template name required', 'warning');
      const rules = []; let hasErr = false;
      $('#rules-container .rule-row').each(function() {
        const type = $(this).find('.rule-type').val(), domain = $(this).find('.rule-domain').val().trim(), tRaw = $(this).find('.rule-targets').val().trim();
        if(!domain) { showMessage($('#template-msg'), 'Blank Domain', 'danger'); hasErr = true; return false; }
        rules.push(type === 'CNAME' ? { type, domain, target: tRaw, resolve_cname: $(this).find('.rule-resolve-cname').is(':checked') } : { type, domain, targets: tRaw });
      });
      if (hasErr || !rules.length) return !hasErr && showMessage($('#template-msg'), 'At least one rule is required', 'warning');

      const payload = { name, rules, updated_at: templateEditingUpdatedAt };
      const r = await apiFetch(templateEditingId ? '/templates/' + encodeURIComponent(templateEditingId) : '/templates', { method: templateEditingId ? 'PUT' : 'POST', body: payload });
      if (handleConflict(r, $('#template-msg'))) return;
      if (r.ok && r.json?.ok) { showMessage($('#template-msg'), 'Template saved successfully', 'success'); loadAllData(); } 
      else showMessage($('#template-msg'), r.json?.error || 'Action failed', 'danger');
    });

    $('#template-cancel').on('click', () => resetTemplateForm(true));

    // Routers
    function checkRouterDuplicates(router, templates) {
      const active = templates.filter(t => router.template_ids.includes(t.id));
      const seen = new Set(); let hasDup = false;
      for (const t of active) {
        for (const r of t.rules || []) { const key = r.type + ':' + r.domain.toLowerCase(); if (seen.has(key)) { hasDup = true; break; } seen.add(key); }
        if (hasDup) break;
      } return hasDup;
    }

    function renderRoutersTable() {
      const $tb = $('#router-table tbody').empty();
      if (!allRouters.length) return $tb.append('<tr><td colspan="4" class="text-muted">No endpoints configured</td></tr>');
      
      allRouters.forEach(rt => {
         const upnames = (rt.upstream_ids || []).map(id => { const p = allProviders.find(prov => prov.id === id); return p ? p.display_name : id; }).join(' \u2192 ');
         const $tr = $('<tr>');
         const $tdP = $('<td>').append($('<code>').text(rt.custom_path));
         if (rt.ecs_enabled) $tdP.append(' ').append($('<span>').addClass('badge bg-info-subtle text-info border border-info-subtle ms-1').text('ECS Enabled'));
         if (checkRouterDuplicates(rt, allTemplates)) $tdP.append(' ').append($('<span>').addClass('badge bg-warning text-dark border border-warning-subtle ms-1').attr({title:'Duplicate rule. First match takes effect.', style:'cursor:help;'}).text('⚠️ Duplicate'));
         
         $tr.append($tdP).append($('<td>').text(upnames)).append($('<td>').text((rt.template_ids || []).join(', ')))
            .append($('<td>').append($('<button>').addClass('btn btn-sm btn-primary r-edit me-1').attr('data-id', encodeURIComponent(rt.id)).text('Edit')).append($('<button>').addClass('btn btn-sm btn-danger r-delete').attr('data-id', encodeURIComponent(rt.id)).text('Del')));
         $tb.append($tr);
      });
    }

    $(document).on('click', '.r-delete', async function() {
      if (!confirm('Delete this endpoint?')) return;
      const id = decodeURIComponent($(this).data('id'));
      const ro = allRouters.find(x => x.id === id);
      const r = await apiFetch('/routers/' + encodeURIComponent(id), { method: 'DELETE', body: { updated_at: ro?.updated_at } });
      if (handleConflict(r)) return;
      if (r.ok) loadAllData(); else showMessage($('#router-msg'), r.json?.error || 'Delete failed', 'danger');
    });

    $(document).on('click', '.r-edit', function() {
      const roId = decodeURIComponent($(this).data('id'));
      const ro = allRouters.find(x => x.id === roId); 
      if (!ro) { handleConflict({status: 409}, $('#router-msg')); return; }
      
      routerEditingId = ro.id; routerEditingUpdatedAt = ro.updated_at; $('#router-path').val(ro.custom_path); $('#router-ecs').prop('checked', !!ro.ecs_enabled);
      $('#router-upstreams option').each(function() { $(this).prop('selected', ro.upstream_ids && ro.upstream_ids.includes($(this).val())); });
      $('#router-templates option').each(function() { $(this).prop('selected', ro.template_ids && ro.template_ids.includes($(this).val())); });
      $('#router-create').text('Update'); $('#router-cancel').removeClass('hide'); $('#router-form-title').text('Edit Endpoint');
    });

    $('#router-create').on('click', async () => {
      clearMessage($('#router-msg'));
      const path = $('#router-path').val().trim(), upstreams = $('#router-upstreams').val() || [], tmpls = $('#router-templates').val() || [], ecs = $('#router-ecs').is(':checked');
      if (!path) return showMessage($('#router-msg'), 'Path is required', 'warning');
      if (!upstreams.length) return showMessage($('#router-msg'), 'At least one upstream provider is required.', 'warning');
      
      const payload = { custom_path: path, upstream_ids: upstreams, template_ids: tmpls, ecs_enabled: ecs, updated_at: routerEditingUpdatedAt };
      const rt = await apiFetch(routerEditingId ? '/routers/' + encodeURIComponent(routerEditingId) : '/routers', { method: routerEditingId ? 'PUT' : 'POST', body: payload });
      if (handleConflict(rt, $('#router-msg'))) return;
      if (rt.ok) { showMessage($('#router-msg'), 'Saved successfully!', 'success'); loadAllData(); } else showMessage($('#router-msg'), rt.json?.error || 'Err', 'danger');
    });

    $('#router-cancel').on('click', () => resetRouterForm(true));

    function populateUpstreams(providers) {
       const $u = $('#router-upstreams').empty(), $l = $('#lookup-provider').empty();
       providers.forEach(p => { $u.append($('<option>').val(p.id).text(p.display_name)); $l.append($('<option>').val(p.id).text(p.display_name)); });
       $l.append($('<option>').val('custom').addClass('fw-bold text-primary').text('Custom DoH Server...'));
    }
    function populateTemplatesSelect(templates) {
       const $t = $('#router-templates').empty();
       templates.forEach(t => $t.append($('<option>').val(t.id).text(t.name)));
    }

    function renderOverviewDashboard() {
       $('#stat-routers').text(allRouters.length);
       $('#stat-templates').text(allTemplates.length);
       $('#stat-providers').text(allProviders.length);
       $('#stat-ttl').text((globalSettings.cache_ttl || 60) + 's');

       let totalRulesCount = 0;
       allTemplates.forEach(t => { totalRulesCount += (t.rules || []).length; });
       $('#stat-total-rules').text(totalRulesCount);

       const $tbody = $('#quick-router-table tbody').empty();
       if (allRouters.length === 0) return $tbody.append('<tr><td colspan="4" class="text-center text-muted py-3">No custom endpoints configured yet.</td></tr>');

       allRouters.forEach(rt => {
          const fullDohURL = window.location.origin + rt.custom_path;
          const $tr = $('<tr>');
          $tr.append($('<td>').append($('<code>').text(rt.custom_path)));
          $tr.append($('<td>').append($('<span class="user-select-all small text-muted">').text(fullDohURL)));
          const ecsEnabled = !!rt.ecs_enabled;
          $tr.append($('<td>').html('<span class="' + (ecsEnabled ? 'text-success' : 'text-secondary') + ' fw-semibold small">' + (ecsEnabled ? 'Enabled' : 'Disabled') + '</span>'));
          
          const $copyBtn = $('<button>').addClass('btn btn-sm btn-outline-primary py-0 px-2 fw-medium copy-endpoint-btn').attr('data-url', fullDohURL).text('Copy');
          $tr.append($('<td>').append($copyBtn));
          $tbody.append($tr);
       });
    }

    $(document).on('shown.bs.tab', 'button[data-bs-toggle="tab"]', function() {
       loadAllData();
    });

    function updateLastUpdatedTime() {
       const now = new Date(), hh = String(now.getHours()).padStart(2, '0'), mm = String(now.getMinutes()).padStart(2, '0'), ss = String(now.getSeconds()).padStart(2, '0');
       $('#last-updated-time').text('Last updated: ' + hh + ':' + mm + ':' + ss);
    }

    $(document).on('click', '#btn-refresh-dashboard', async function() {
       const $btn = $(this);
       $btn.prop('disabled', true).find('svg').addClass('spin'); 
       $btn.find('span').text('Refreshing...');
       await loadAllData();
       $btn.prop('disabled', false).find('svg').removeClass('spin');
       $btn.find('span').text('Refresh Data');
    });

    $(document).on('click', '.copy-endpoint-btn', function() {
       const url = $(this).data('url'), $btn = $(this);
       navigator.clipboard.writeText(url).then(() => {
          $btn.removeClass('btn-outline-primary').addClass('btn-success').text('Copied!');
          setTimeout(() => { $btn.removeClass('btn-success').addClass('btn-outline-primary').text('Copy'); }, 1500);
       }).catch(() => { alert('Failed to copy. Please manually copy: ' + url); });
    });

    // ۱. متد اصلی دریافت داده به صورت موازی (Promise.all) جهت رفع باگ تقدم و تاخر و نمایش سریع TTL واقعی
    async function loadAllData() {
      const [pResp, tResp, rResp, sResp] = await Promise.all([
         apiFetch('/providers'),
         apiFetch('/templates'),
         apiFetch('/routers'),
         apiFetch('/settings')
      ]);

      allProviders = pResp.ok ? pResp.json.providers || [] : [];
      allTemplates = tResp.ok ? tResp.json.templates || [] : [];
      allRouters   = rResp.ok ? rResp.json.routers || [] : [];

      if (sResp.ok && sResp.json?.settings) {
         globalSettings = sResp.json.settings;
         globalSettingsUpdatedAt = globalSettings.updated_at;
         $('#cache-ttl-input').val(globalSettings.cache_ttl || 60);
      }

      populateUpstreams(allProviders);
      populateTemplatesSelect(allTemplates);
      
      renderProvidersTable();
      renderTemplatesTable();
      renderRoutersTable();
      
      // رندر کامل داشبورد Overview پس از آماده بودن تمام داده‌ها (از جمله TTL)
      renderOverviewDashboard();
      updateLastUpdatedTime(); 

      // ریست هوشمندانه فرم‌ها بدون پاک کردن بنر پیام‌های موفقیت
      resetProvForm(false);
      resetTemplateForm(false);
      resetRouterForm(false);
    }

    function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

    $('#rules-container').append(newRuleRow()); checkSession();
  });
  </script>
</body>
</html>`;
}