import { departments } from './mockData.js?v=20260715-nav5';

export function renderPage(ctx) {
  const {
    accounts,
    filteredAccounts,
    employees,
    filters,
    lastSyncAt,
    isSyncing,
    drawer,
    modal,
    toast,
  } = ctx;
  const employeeMap = toMap(employees);
  const activeAccount = drawer.open ? accounts.find((item) => item.id === drawer.accountId) : null;

  return `
    <div class="app-shell ${ctx.navExpanded ? 'nav-expanded' : 'nav-collapsed'}">
      ${renderSidebar('accounts', ctx.navExpanded)}
      <main class="main-panel">
        <section class="page-head">
          <div>
            <h1>企微客服账号管理</h1>
            <p>统一查看企微客服账号、管理权限、接待员工与接入信息</p>
          </div>
        </section>
        ${renderSearchPanel(filters)}
        ${renderToolbar(lastSyncAt, isSyncing)}
        ${renderCustomerServiceAccountTable(filteredAccounts, employeeMap)}
      </main>
    </div>
    ${activeAccount ? renderCustomerServiceAccountDrawer(activeAccount, employeeMap, drawer, lastSyncAt) : ''}
    ${renderModal(modal, ctx)}
    ${toast ? `<div class="toast">${escapeHtml(toast)}</div>` : ''}
  `;
}

export function renderCustomerServiceAccountTable(accounts, employeeMap) {
  const rows = accounts.map((account, index) => {
    const employeeSummary = buildEmployeeSummary(account.employeeIds, employeeMap);
    return `
      <tr>
        <td class="index-cell">${index + 1}</td>
        <td>
          <div class="account-cell">
            ${renderAvatar(account)}
            <span class="single-line">${escapeHtml(account.name)}</span>
          </div>
        </td>
        <td>
          <span class="employee-summary" title="${escapeHtml(employeeSummary.full)}">${escapeHtml(employeeSummary.short)}</span>
        </td>
        <td>${renderStatus(account.status)}</td>
        <td class="muted">${escapeHtml(account.createdAt)}</td>
        <td class="muted">${account.lastContactAt ? escapeHtml(formatDateTimeToSecond(account.lastContactAt)) : '—'}</td>
        <td><button class="link-button" data-action="open-detail" data-id="${account.id}">详情</button></td>
      </tr>
    `;
  }).join('');

  return `
    <section class="panel table-panel">
      <div class="panel-title-row">
        <div class="panel-title"><span class="title-mark"></span>客服账号列表</div>
        <div class="panel-extra">共 ${accounts.length} 条数据</div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th class="index-cell"></th>
              <th>客服账号</th>
              <th>接待员工</th>
              <th>账号状态</th>
              <th>创建时间</th>
              <th>最后沟通时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="7"><div class="empty">暂无匹配的客服账号</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export function renderCustomerServiceAccountDrawer(account, employeeMap, drawer, lastSyncAt) {
  const currentEmployees = account.employeeIds.map((id) => employeeMap.get(id)).filter(Boolean);
  return `
    <div class="drawer-mask" data-action="close-drawer"></div>
    <aside class="detail-drawer" aria-label="客服账号详情">
      <div class="drawer-head">
        <div class="drawer-account-main">
          ${renderAvatar(account, 'large')}
          <div class="drawer-account-text">
            <div class="drawer-title-row">
              <h2>${escapeHtml(account.name)}</h2>
              ${renderManageableTag(account.manageable)}
              ${renderStatusTag(account.status)}
              <span class="tag soft">${escapeHtml(account.source)}</span>
            </div>
            <div class="subtle">企微客服账号 ID：${escapeHtml(account.wecomId)}</div>
          </div>
        </div>
        <div class="drawer-actions">
          ${account.manageable ? `
            <button class="btn secondary" data-action="open-edit-account" data-id="${account.id}">编辑</button>
            <button class="btn danger" data-action="confirm-delete-account" data-id="${account.id}">删除</button>
          ` : `
            <div class="readonly-hint">当前客服账号暂不可通过 HCRM 管理，仅支持查看。</div>
          `}
        </div>
      </div>
      <div class="drawer-body">
        ${renderAccountMetrics(account, drawer.metricRange)}
        <div class="tabs">
          <button class="tab ${drawer.tab === 'basic' ? 'active' : ''}" data-action="switch-tab" data-tab="basic">客服账号信息</button>
          <button class="tab ${drawer.tab === 'employees' ? 'active' : ''}" data-action="switch-tab" data-tab="employees">接待员工</button>
        </div>
        <div class="tab-body">
          ${drawer.tab === 'employees'
            ? renderReceptionEmployeeTable(account, currentEmployees)
            : renderAccountBasicInfo(account, lastSyncAt)}
        </div>
      </div>
    </aside>
  `;
}

export function renderAccountMetrics(account, metricRange) {
  const values = calculateMetricValues(account, metricRange);
  const period = formatMetricPeriod(metricRange);
  return `
    <section class="metrics-section">
      <div class="section-head">
        <h3>会话指标</h3>
        <div class="date-filter">
          <div class="quick-group">
            ${quickButton('today', '今日', metricRange)}
            ${quickButton('yesterday', '昨日', metricRange)}
            ${quickButton('last7', '近7天', metricRange)}
            ${quickButton('last30', '近30天', metricRange)}
          </div>
          <input class="date-input" type="date" data-field="metric-start" value="${metricRange.start}" />
          <span class="date-separator">至</span>
          <input class="date-input" type="date" data-field="metric-end" value="${metricRange.end}" />
          <button class="btn secondary compact" data-action="apply-metric-range">查询</button>
        </div>
      </div>
      <div class="metric-grid">
        <div class="metric-box">
          <div class="metric-name">咨询客户数</div>
          <div class="metric-value">${values.customers}</div>
          <div class="metric-period">${period}</div>
        </div>
        <div class="metric-box">
          <div class="metric-name">对话条数</div>
          <div class="metric-value">${values.messages}</div>
          <div class="metric-period">${period}</div>
        </div>
      </div>
    </section>
  `;
}

export function renderAccountBasicInfo(account, lastSyncAt) {
  const fields = [
    ['客服账号名称', account.name],
    ['企微客服账号 ID', account.wecomId],
    ['账号来源', account.source],
    ['管理权限', account.manageable ? '可管理' : '不可管理'],
    ['账号状态', account.status === 'enabled' ? '可用' : '已删除'],
    ['创建时间', account.createdAt],
    ['最后沟通时间', account.lastContactAt ? formatDateTimeToSecond(account.lastContactAt) : '—'],
    ['最后同步时间', account.lastSyncAt || lastSyncAt],
  ];

  return `
    <section class="info-section">
      <h3>基本信息</h3>
      <div class="detail-grid">
        ${fields.map(([label, value]) => `
          <div class="detail-item">
            <div class="detail-label">${escapeHtml(label)}</div>
            <div class="detail-value">${escapeHtml(value)}</div>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="info-section">
      <h3>接入信息</h3>
      <div class="access-layout">
        <div class="access-link-block">
          <div class="detail-label">接入链接</div>
          <div class="copy-line">
            <span class="access-link">${escapeHtml(account.accessLink)}</span>
            <button class="btn secondary compact" data-action="copy-link" data-id="${account.id}">复制</button>
          </div>
        </div>
        <div class="qr-block">
          <canvas class="qr-canvas" width="128" height="128" data-qr="${escapeHtml(account.id)}"></canvas>
          <div class="qr-actions">
            <button class="link-button" data-action="view-qr" data-id="${account.id}">查看大图</button>
            <button class="link-button" data-action="download-qr" data-id="${account.id}">下载二维码</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderReceptionEmployeeTable(account, employees) {
  const rows = employees.map((employee) => `
    <tr>
      <td>
        <div class="employee-cell">
          ${renderEmployeeAvatar(employee)}
          <div>
            <div>${escapeHtml(employee.name)}</div>
            <div class="subtle">UserID：${escapeHtml(employee.userId)}</div>
          </div>
        </div>
      </td>
      <td><span class="single-line department-text" title="${escapeHtml(employee.departmentPath)}">${escapeHtml(employee.departmentPath)}</span></td>
      <td>${employee.crmName ? escapeHtml(employee.crmName) : '<span class="tag neutral">未映射</span>'}</td>
      <td>
        ${account.defaultEmployeeId === employee.id
          ? '<span class="tag primary">默认接待</span>'
          : account.manageable
            ? `<button class="link-button" data-action="set-default-employee" data-id="${account.id}" data-employee-id="${employee.id}">设为默认</button>`
            : '<span class="subtle">—</span>'}
      </td>
      <td>
        ${account.manageable
          ? `<button class="link-button danger-text" data-action="confirm-remove-employee" data-id="${account.id}" data-employee-id="${employee.id}">移除</button>`
          : '<span class="subtle">—</span>'}
      </td>
    </tr>
  `).join('');

  return `
    <section class="info-section">
      <div class="employee-table-head">
        <h3>
          接待员工 <span class="count-text">共 ${employees.length} 人</span>
          <span class="employee-tip">未设置默认接待时，转人工客户将进入排队，不会自动分配给接待员工。</span>
        </h3>
        ${account.manageable ? `<button class="btn primary" data-action="open-employee-selector" data-id="${account.id}">添加接待员工</button>` : ''}
      </div>
      <div class="table-wrap light">
        <table class="data-table employee-table">
          <thead>
            <tr>
              <th>企微员工</th>
              <th>所属部门</th>
              <th>CRM员工</th>
              <th>默认接待</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="5"><div class="empty">当前暂无接待员工</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export function renderEmployeeSelector(ctx) {
  const { employees, selector } = ctx;
  const candidates = getSelectorCandidates(employees, selector);
  const selectedEmployees = selector.selectedIds.map((id) => employees.find((item) => item.id === id)).filter(Boolean);
  const hasCandidate = candidates.length > 0;

  return `
    <div class="selector-shell">
      <div class="selector-toolbar">
        <span>员工数据更新时间：${escapeHtml(selector.updatedAt)}</span>
        <button class="link-button" data-action="refresh-employee-list">刷新列表</button>
      </div>
      <div class="selector-grid">
        <section class="selector-col dept-col">
          <div class="selector-title">部门筛选</div>
          <input class="selector-input" data-field="dept-search" value="${escapeHtml(selector.departmentSearch)}" placeholder="搜索部门" />
          <div class="dept-tree">${renderDepartmentTree(departments, selector)}</div>
        </section>
        <section class="selector-col candidate-col">
          <div class="selector-title-row">
            <div class="selector-title">候选员工</div>
            <button class="link-button" data-action="select-current-candidates" ${hasCandidate ? '' : 'disabled'}>全选当前筛选结果</button>
          </div>
          <input class="selector-input" data-field="employee-search" value="${escapeHtml(selector.search)}" placeholder="搜索员工姓名 / UserID" />
          <div class="candidate-list">
            ${hasCandidate ? candidates.map((employee) => renderCandidateEmployee(employee, selector)).join('') : `
              <div class="selector-empty">未找到匹配员工。如企微刚新增或调整员工，请先同步企微数据后重试。</div>
            `}
          </div>
        </section>
        <section class="selector-col selected-col">
          <div class="selector-title-row">
            <div class="selector-title">已选 ${selectedEmployees.length} 人</div>
            <button class="link-button" data-action="clear-selected-employees" ${selectedEmployees.length ? '' : 'disabled'}>清空</button>
          </div>
          <div class="selected-list">
            ${selectedEmployees.map((employee) => `
              <div class="selected-item">
                ${renderEmployeeAvatar(employee)}
                <div class="selected-info">
                  <div>${escapeHtml(employee.name)}</div>
                  <div class="subtle single-line" title="${escapeHtml(employee.departmentPath)}">${escapeHtml(employee.departmentPath)}</div>
                </div>
                <button class="icon-btn" title="移除" data-action="remove-selected-employee" data-employee-id="${employee.id}">×</button>
              </div>
            `).join('') || '<div class="selector-empty small">暂无已选员工</div>'}
          </div>
        </section>
      </div>
    </div>
  `;
}

export function getSelectorCandidates(employees, selector) {
  const deptIds = expandDepartmentIds(selector.departmentIds || []);
  const keyword = (selector.search || '').trim().toLowerCase();
  const deptMatched = deptIds.length
    ? employees.filter((employee) => deptIds.includes(employee.departmentId))
    : employees;

  return deptMatched.filter((employee) => {
    if (!keyword) return true;
    return employee.name.toLowerCase().includes(keyword) || employee.userId.toLowerCase().includes(keyword);
  });
}

function expandDepartmentIds(selectedIds) {
  const selected = new Set(selectedIds);
  const expanded = new Set();

  function walk(nodes, parentSelected = false) {
    nodes.forEach((node) => {
      const isSelected = parentSelected || selected.has(node.id);
      if (isSelected) expanded.add(node.id);
      if (node.children?.length) walk(node.children, isSelected);
    });
  }

  walk(departments);
  return [...expanded];
}

export function drawQrCanvases(root = document) {
  root.querySelectorAll('canvas[data-qr]').forEach((canvas) => {
    drawQr(canvas, canvas.dataset.qr || 'qr');
  });
}

export function drawQr(canvas, seed) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cells = 25;
  const cell = size / cells;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#111827';
  drawFinder(ctx, 1, 1, cell);
  drawFinder(ctx, cells - 8, 1, cell);
  drawFinder(ctx, 1, cells - 8, cell);
  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      const inFinder = (x < 8 && y < 8) || (x > cells - 9 && y < 8) || (x < 8 && y > cells - 9);
      if (inFinder) continue;
      const bit = ((x * 13 + y * 17 + hash + ((x ^ y) * 7)) % 5) < 2;
      if (bit) ctx.fillRect(x * cell, y * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
}

function renderModal(modal, ctx) {
  if (!modal) return '';
  if (modal.type === 'account-form') return renderAccountFormModal(modal);
  if (modal.type === 'confirm') return renderConfirmModal(modal);
  if (modal.type === 'qr') return renderQrModal(modal);
  if (modal.type === 'employee-selector') {
    return `
      <div class="modal-mask">
        <div class="modal selector-modal">
          <div class="modal-head">
            <h3>选择企微员工</h3>
            <button class="icon-btn close-btn" title="关闭" data-action="close-modal">×</button>
          </div>
          ${renderEmployeeSelector(ctx)}
          <div class="modal-foot">
            <button class="btn secondary" data-action="close-modal">取消</button>
            <button class="btn primary" data-action="confirm-add-employees" ${ctx.selector.selectedIds.length ? '' : 'disabled'}>
              添加已选员工（${ctx.selector.selectedIds.length}）
            </button>
          </div>
        </div>
      </div>
    `;
  }
  return '';
}

function renderAccountFormModal(modal) {
  const isEdit = modal.mode === 'edit';
  const data = modal.data || {};
  return `
    <div class="modal-mask">
      <div class="modal form-modal">
        <div class="modal-head">
          <h3>${isEdit ? '编辑客服账号' : '新增客服账号'}</h3>
          <button class="icon-btn close-btn" title="关闭" data-action="close-modal">×</button>
        </div>
        <div class="form-body">
          <label class="form-field">
            <span>客服账号名称 <b>*</b></span>
            <input id="account-form-name" value="${escapeHtml(data.name || '')}" placeholder="请输入客服账号名称" />
          </label>
          <label class="form-field">
            <span>客服头像</span>
            <div class="upload-row">
              <div class="upload-preview">
                ${data.avatarImage ? `<img src="${data.avatarImage}" alt="客服头像预览" />` : '<span>头像</span>'}
              </div>
              <div>
                <input id="account-form-avatar" type="file" accept="image/*" />
                <div class="form-tip">支持上传图片，Demo 中仅本地预览。</div>
              </div>
            </div>
          </label>
        </div>
        <div class="modal-foot">
          <button class="btn secondary" data-action="close-modal">取消</button>
          <button class="btn primary" data-action="${isEdit ? 'save-edit-account' : 'create-account'}">${isEdit ? '保存' : '创建'}</button>
        </div>
      </div>
    </div>
  `;
}

function renderConfirmModal(modal) {
  return `
    <div class="modal-mask">
      <div class="modal confirm-modal">
        <div class="modal-head">
          <h3>${escapeHtml(modal.title)}</h3>
          <button class="icon-btn close-btn" title="关闭" data-action="close-modal">×</button>
        </div>
        <div class="confirm-body ${modal.danger ? 'danger-zone' : ''}">
          ${escapeHtml(modal.message)}
        </div>
        <div class="modal-foot">
          <button class="btn secondary" data-action="close-modal">取消</button>
          <button class="btn ${modal.danger ? 'danger' : 'primary'}" data-action="confirm-action">确认</button>
        </div>
      </div>
    </div>
  `;
}

function renderQrModal(modal) {
  return `
    <div class="modal-mask">
      <div class="modal qr-modal">
        <div class="modal-head">
          <h3>接入二维码</h3>
          <button class="icon-btn close-btn" title="关闭" data-action="close-modal">×</button>
        </div>
        <div class="qr-large-wrap">
          <canvas class="qr-canvas large" width="260" height="260" data-qr="${escapeHtml(modal.accountId)}"></canvas>
        </div>
        <div class="modal-foot">
          <button class="btn secondary" data-action="close-modal">关闭</button>
          <button class="btn primary" data-action="download-qr" data-id="${escapeHtml(modal.accountId)}">下载二维码</button>
        </div>
      </div>
    </div>
  `;
}

export function renderSidebar(activePage = 'accounts', expanded = false) {
  const sections = [
    ['首页', ['工作台']],
    ['市场', ['活动线索', '客户池']],
    ['客服', ['客服记录', '在线接待']],
    ['企微', ['企微活码', '欢迎语', '内容库', '企微管理']],
  ];
  return `
    <aside class="side-rail">
      ${!expanded ? '<button class="nav-toggle collapsed-toggle" data-action="toggle-navigation" aria-label="展开菜单">›</button>' : ''}
      ${sections.map(([name]) => `<div class="rail-item ${name === '企微' ? 'active' : ''}"><span class="rail-icon"></span><b>${name}</b></div>`).join('')}
    </aside>
    <aside class="sub-nav ${expanded ? 'expanded' : ''}">
      ${expanded ? '<button class="nav-toggle expanded-toggle" data-action="toggle-navigation" aria-label="收起菜单">‹</button>' : ''}
      <div class="sub-nav-title">企微管理</div>
      <a>企微客户群</a>
      <a class="${activePage === 'accounts' ? 'active' : ''}" href="#accounts" data-action="navigate-page" data-page="accounts">企微客服账号管理</a>
      <a class="${activePage === 'mass-tasks' ? 'active' : ''}" href="#mass-tasks" data-action="navigate-page" data-page="mass-tasks">企微群发任务管理</a>
      <a>会话内容监测</a><a>分配记录</a><a>朋友圈管理</a>
      <div class="sub-nav-title muted-title">企微客服排班</div>
      <a>排班列表</a>
    </aside>
  `;
}

function renderSearchPanel(filters) {
  return `
    <section class="panel search-panel">
      <label>客服账号 <input class="control" data-field="filter-account" value="${escapeHtml(filters.accountName)}" placeholder="请输入" /></label>
      <label>接待员工 <input class="control" data-field="filter-employee" value="${escapeHtml(filters.employeeName)}" placeholder="请输入" /></label>
      <label>账号状态
        <select class="control" data-field="filter-status">
          ${option('all', '全部', filters.status)}
          ${option('enabled', '有效', filters.status)}
          ${option('disabled', '已删除', filters.status)}
        </select>
      </label>
      <div class="search-actions">
        <button class="btn primary" data-action="search">查询</button>
        <button class="btn secondary" data-action="reset-search">重置</button>
      </div>
    </section>
  `;
}

function renderToolbar(lastSyncAt, isSyncing) {
  return `
    <section class="toolbar-row">
      <div class="toolbar-left">
        <button class="btn primary" data-action="open-add-account">新增客服账号</button>
        <button class="btn secondary strong" data-action="sync-wecom" ${isSyncing ? 'disabled' : ''}>${isSyncing ? '同步中...' : '同步企微数据'}</button>
      </div>
      <div class="sync-info">最后同步时间：${escapeHtml(lastSyncAt)}</div>
    </section>
  `;
}

function renderManageableTag(manageable) {
  return manageable
    ? '<span class="tag primary">可管理</span>'
    : '<span class="tag warning" title="当前客服账号暂未授权 HCRM 管理，仅支持查看。">不可管理</span>';
}

function renderStatus(status) {
  return `<span class="status-dot ${status === 'enabled' ? 'on' : 'off'}"></span>${status === 'enabled' ? '有效' : '已删除'}`;
}

function renderStatusTag(status) {
  return `<span class="tag ${status === 'enabled' ? 'success' : 'neutral'}">${status === 'enabled' ? '有效' : '已删除'}</span>`;
}

function formatDateTimeToSecond(value) {
  const text = String(value || '');
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(text) ? `${text}:00` : text;
}

function renderAvatar(account, size = '') {
  const text = account.name ? account.name.slice(0, 1) : '客';
  if (account.avatarImage) {
    return `<span class="avatar ${size}"><img src="${account.avatarImage}" alt="" /></span>`;
  }
  return `<span class="avatar ${size}" style="--avatar-color:${account.avatarColor || '#14b8a6'}">${escapeHtml(text)}</span>`;
}

function renderEmployeeAvatar(employee) {
  return `<span class="avatar employee-avatar" style="--avatar-color:${employee.color || '#14b8a6'}">${escapeHtml(employee.name.slice(0, 1))}</span>`;
}

function buildEmployeeSummary(ids, employeeMap) {
  const names = ids.map((id) => employeeMap.get(id)?.name).filter(Boolean);
  if (!names.length) return { short: '0人 · 未配置', full: '未配置' };
  const extra = names.length > 2 ? ` +${names.length - 2}` : '';
  return {
    short: `${names.length}人 · ${names.slice(0, 2).join('、')}${extra}`,
    full: names.join('、'),
  };
}

function renderDepartmentTree(nodes, selector, depth = 0) {
  const keyword = (selector.departmentSearch || '').trim();
  return nodes.map((node) => {
    const childHtml = node.children?.length ? renderDepartmentTree(node.children, selector, depth + 1) : '';
    const selfMatches = !keyword || node.name.includes(keyword);
    const childMatches = !keyword || childHtml.trim().length > 0;
    if (!selfMatches && !childMatches) return '';
    const expanded = selector.expandedDepartmentIds.includes(node.id) || Boolean(keyword) || depth === 0;
    const checked = selector.departmentIds.includes(node.id);
    return `
      <div class="dept-node" style="--depth:${depth}">
        <div class="dept-line">
          ${node.children?.length ? `<button class="tree-toggle" data-action="toggle-dept-expand" data-dept-id="${node.id}">${expanded ? '−' : '+'}</button>` : '<span class="tree-spacer"></span>'}
          <label>
            <input type="checkbox" data-action="toggle-dept-check" data-dept-id="${node.id}" ${checked ? 'checked' : ''} />
            ${escapeHtml(node.name)}
          </label>
        </div>
        ${expanded ? `<div>${childHtml}</div>` : ''}
      </div>
    `;
  }).join('');
}

function renderCandidateEmployee(employee, selector) {
  const disabled = selector.disabledIds.includes(employee.id);
  const selected = selector.selectedIds.includes(employee.id);
  return `
    <label class="candidate-item ${disabled ? 'disabled' : ''}">
      <input type="checkbox" data-action="toggle-candidate" data-employee-id="${employee.id}" ${selected ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
      ${renderEmployeeAvatar(employee)}
      <div class="candidate-main">
        <div class="candidate-name-row">
          <span>${escapeHtml(employee.name)}</span>
          ${disabled ? '<span class="tag neutral">已添加</span>' : ''}
        </div>
        <div class="subtle">${escapeHtml(employee.departmentPath)}</div>
        <div class="subtle">UserID：${escapeHtml(employee.userId)}</div>
        <div class="subtle">CRM员工：${employee.crmName ? escapeHtml(employee.crmName) : '未映射'}</div>
      </div>
    </label>
  `;
}

function quickButton(preset, label, range) {
  return `<button class="quick-btn ${range.preset === preset ? 'active' : ''}" data-action="metric-preset" data-preset="${preset}">${label}</button>`;
}

function calculateMetricValues(account, range) {
  const days = Math.max(1, dayDiff(range.start, range.end) + 1);
  const seed = account.metricsSeed || 20;
  return {
    customers: seed * days + (range.preset === 'yesterday' ? 6 : 14),
    messages: seed * days * 3 + (range.preset === 'last30' ? 86 : 31),
  };
}

function formatMetricPeriod(range) {
  if (range.start === range.end) return range.start;
  return `${range.start} 至 ${range.end}`;
}

function dayDiff(start, end) {
  const startTime = new Date(`${start}T00:00:00`).getTime();
  const endTime = new Date(`${end}T00:00:00`).getTime();
  return Math.round((endTime - startTime) / 86400000);
}

function option(value, label, selected) {
  return `<option value="${value}" ${value === selected ? 'selected' : ''}>${label}</option>`;
}

function toMap(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function drawFinder(ctx, x, y, cell) {
  ctx.fillRect(x * cell, y * cell, cell * 7, cell * 7);
  ctx.fillStyle = '#fff';
  ctx.fillRect((x + 1) * cell, (y + 1) * cell, cell * 5, cell * 5);
  ctx.fillStyle = '#111827';
  ctx.fillRect((x + 2) * cell, (y + 2) * cell, cell * 3, cell * 3);
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
