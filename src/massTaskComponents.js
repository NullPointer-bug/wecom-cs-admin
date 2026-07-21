import { renderSidebar } from './components.js?v=20260715-nav5';
import { getTaskStatus } from './massTaskData.js?v=20260716-mock1';
import { renderMassContentDrawer } from './massContentDrawer.js?v=20260716-content1';

const taskStatusText = { pending: '待执行', running: '执行中', completed: '已完成' };

export function renderMassTaskPage(ctx) {
  const activeTask = ctx.drawer.open ? ctx.tasks.find((item) => item.id === ctx.drawer.taskId) : null;
  const remindEmployee = activeTask && ctx.remindModal.open ? activeTask.employees.find((item) => item.id === ctx.remindModal.employeeId) : null;
  return `<div class="app-shell ${ctx.navExpanded ? 'nav-expanded' : 'nav-collapsed'}">${renderSidebar('mass-tasks', ctx.navExpanded)}<main class="main-panel mass-page">
    <section class="page-head"><div><h1>企微群发任务管理</h1><p>查看企业微信客户群发任务、执行进度与员工执行明细</p></div></section>
    ${renderMassTaskSearch(ctx.filters)}${renderMassTaskToolbar(ctx.lastSyncAt, ctx.isSyncing)}${renderMassTaskTable(ctx)}
  </main></div>${activeTask ? renderMassTaskDrawer(activeTask, ctx.drawer, ctx) : ''}${renderMassContentDrawer({
    taskId: ctx.contentDrawer.taskId,
    visible: ctx.contentDrawer.open,
    tasks: ctx.tasks,
    preview: ctx.contentDrawer.preview,
  })}${remindEmployee ? renderReminderModal(remindEmployee) : ''}${ctx.toast ? `<div class="toast">${escapeHtml(ctx.toast)}</div>` : ''}`;
}

export function renderMassTaskSearch(filters) {
  return `<section class="panel search-panel mass-search compact-search">
    <label>任务名称 <input class="control" data-field="mass-name" value="${escapeHtml(filters.name)}" placeholder="请输入任务名称" /></label>
    <label>执行员工 <input class="control" data-field="mass-employee" value="${escapeHtml(filters.employee)}" placeholder="请输入企微或CRM员工姓名" /></label>
    <label>任务来源 <select class="control" data-field="mass-source" data-action="mass-source-filter"><option value="all" ${filters.source === 'all' ? 'selected' : ''}>全部</option><option value="crm" ${filters.source === 'crm' ? 'selected' : ''}>CRM创建</option><option value="wecom" ${filters.source === 'wecom' ? 'selected' : ''}>企微创建</option></select></label>
    <label>创建时间 <span class="range-controls"><input class="control" type="date" data-field="mass-start" value="${filters.start}" /><i>至</i><input class="control" type="date" data-field="mass-end" value="${filters.end}" /></span></label>
    <div class="search-actions"><button class="btn primary" data-action="mass-search">查询</button><button class="btn secondary" data-action="mass-reset">重置</button></div>
  </section>`;
}

function renderMassTaskToolbar(lastSyncAt, isSyncing) {
  return `<section class="toolbar-row mass-toolbar"><div></div><div class="sync-entry"><span>最后同步时间：${lastSyncAt}</span><button class="btn secondary strong" data-action="mass-sync" ${isSyncing ? 'disabled' : ''}>${isSyncing ? '同步中...' : '同步企微任务'}</button></div></section>`;
}

export function renderMassTaskTable(ctx) {
  const { filteredTasks: tasks, statusCounts, statusFilter, pagination, total, totalPages } = ctx;
  const rows = tasks.map((task) => `<tr>
    <td><div class="task-name-action"><button class="task-name-link" data-action="mass-content" data-id="${task.id}" title="${escapeHtml(task.name)}">${escapeHtml(task.name)}</button><button class="task-view-icon" data-action="mass-content" data-id="${task.id}" title="查看群发内容" aria-label="查看群发内容">${eyeIcon()}</button></div></td>
    <td>${renderTaskSource(task.source)}</td><td>${renderTaskStatus(task)}</td><td>${renderEmployeeSummary(task.employees)}</td>
    <td class="number-cell">${formatNumber(task.expected)}</td><td class="number-cell success-text">${formatNumber(task.sent)}</td><td class="number-cell ${task.failed ? 'danger-text' : ''}">${formatNumber(task.failed)}</td>
    <td>${escapeHtml(task.creator)}</td><td class="muted time-cell">${task.createdAt}</td>
    <td class="sticky-action"><button class="link-button" data-action="mass-detail" data-id="${task.id}">详情</button></td>
  </tr>`).join('');
  return `<section class="panel table-panel mass-table-panel"><div class="panel-title-row mass-list-heading"><div class="panel-heading-left"><div class="panel-title"><span class="title-mark"></span>群发任务列表</div>${renderStatusTabs(statusCounts, statusFilter)}</div></div>
    <div class="table-wrap"><table class="data-table mass-table"><thead><tr><th>任务名称</th><th>任务来源</th><th>任务状态</th><th>执行员工</th><th>目标客户数</th><th>已发送客户数</th><th>失败客户数</th><th>创建人</th><th>创建时间</th><th class="sticky-action">操作</th></tr></thead><tbody>${rows || '<tr><td colspan="10"><div class="empty">暂无匹配的群发任务</div></td></tr>'}</tbody></table></div>
    ${renderPagination(pagination, total, totalPages)}
  </section>`;
}

function renderStatusTabs(counts, active) {
  const tabs = [['all','全部'],['running','执行中'],['pending','待执行'],['completed','已完成']];
  return `<div class="mass-status-tabs">${tabs.map(([value,label]) => `<button class="status-tab ${active === value ? 'active' : ''}" data-action="mass-status-filter" data-status="${value}">${label}<span>${counts[value] || 0}</span></button>`).join('')}</div>`;
}

function renderPagination(pagination, total, totalPages) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  return `<div class="pagination"><div class="pagination-total">共 ${total} 条</div><label>每页 <select data-action="mass-page-size"><option value="20" ${pagination.pageSize === 20 ? 'selected' : ''}>20</option><option value="50" ${pagination.pageSize === 50 ? 'selected' : ''}>50</option><option value="100" ${pagination.pageSize === 100 ? 'selected' : ''}>100</option></select> 条</label><div class="pagination-pages"><button data-action="mass-page" data-page="${pagination.page - 1}" ${pagination.page <= 1 ? 'disabled' : ''}>‹</button>${pages.map((page) => `<button class="${pagination.page === page ? 'active' : ''}" data-action="mass-page" data-page="${page}">${page}</button>`).join('')}<button data-action="mass-page" data-page="${pagination.page + 1}" ${pagination.page >= totalPages ? 'disabled' : ''}>›</button></div></div>`;
}

export function renderMassTaskDrawer(task, drawer, ctx) {
  return `<div class="drawer-mask" data-action="mass-close"></div><aside class="detail-drawer mass-drawer" aria-label="群发任务详情"><div class="drawer-head"><div class="drawer-task-main"><div class="task-icon">群</div><div class="drawer-title-row"><h2>${escapeHtml(task.name)}</h2></div></div><div class="drawer-actions"><span class="drawer-sync-time">最后同步时间：${escapeHtml(ctx.lastSyncAt)}</span><button class="btn secondary" data-action="mass-sync" ${ctx.isSyncing ? 'disabled' : ''}>${ctx.isSyncing ? '同步中...' : '同步企微任务'}</button><button class="btn secondary strong" data-action="mass-content" data-id="${task.id}">查看群发内容</button><button class="icon-btn close-btn" data-action="mass-close" aria-label="关闭">×</button></div></div><div class="drawer-body">
    <section class="metrics-section task-statistics compact-statistics"><h3>执行统计</h3><div class="statistics-inline grouped-statistics"><div class="statistics-category task-scope-category">任务范围</div><div class="statistics-category send-result-category">发送结果</div>${inlineMetric('参与员工数', `${task.employees.length}人`)}${inlineMetric('目标客户数', task.expected)}${inlineMetric('已发送客户数', task.sent, 'success-text')}${inlineMetric('失败客户数', task.failed, task.failed > 0 ? 'danger-text' : '')}${inlineMetric('待发送客户数', task.pending)}</div></section>
    <div class="drawer-section-stack">${renderTaskBasicInfo(task)}${renderTaskDetailTabs(task, drawer, ctx)}</div></div></aside>`;
}

function renderTaskDetailTabs(task, drawer, ctx) {
  const activeTab = drawer.tab === 'customers' ? 'customers' : 'employees';
  return `<section class="task-detail-tabs-section"><div class="tabs task-detail-tabs" role="tablist"><button class="tab ${activeTab === 'employees' ? 'active' : ''}" data-action="mass-detail-tab" data-tab="employees" role="tab" aria-selected="${activeTab === 'employees'}">执行员工明细 <span class="tab-count">${task.employees.length}</span></button><button class="tab ${activeTab === 'customers' ? 'active' : ''}" data-action="mass-detail-tab" data-tab="customers" role="tab" aria-selected="${activeTab === 'customers'}">客户发送明细 <span class="tab-count">${formatNumber(ctx.customerRecordTotal)}</span></button></div><div class="tab-body">${activeTab === 'customers' ? renderCustomerExecutionTab(ctx) : renderEmployeeExecutionTab(ctx)}</div></section>`;
}

export function renderTaskBasicInfo(task) {
  const fields = [['任务名称',task.name],['任务来源',task.source],['任务状态',taskStatusText[getTaskStatus(task)]],['创建人',task.creator],['创建时间',task.createdAt]];
  return `<section class="info-section"><h3>基本信息</h3><div class="detail-grid">${fields.map(([label,value]) => `<div class="detail-item"><div class="detail-label">${label}</div><div class="detail-value">${label === '任务来源' ? renderTaskSource(value) : escapeHtml(value)}</div></div>`).join('')}</div></section>`;
}

export function renderEmployeeExecutionTab(ctx) {
  const employees = ctx.filteredEmployees;
  const rows = employees.map((employee) => {
    const status = getTaskStatus(employee);
    return `<tr><td><div class="employee-cell"><span class="avatar employee-avatar" style="--avatar-color:${employee.color}">${employee.name.slice(-1)}</span><b>${escapeHtml(employee.name)}</b></div></td><td>${employee.crmName ? escapeHtml(employee.crmName) : '<span class="tag warning">未映射</span>'}</td><td>${escapeHtml(employee.department)}</td><td class="number-cell">${formatNumber(employee.expected)}</td><td class="number-cell success-text">${formatNumber(employee.sent)}</td><td class="number-cell ${employee.failed > 0 ? 'danger-text' : ''}">${formatNumber(employee.failed)}</td><td>${renderEmployeeStatus(employee)}</td><td><div class="employee-actions">${status !== 'completed' ? `<button class="link-button" data-action="mass-employee-remind" data-id="${employee.id}">提醒发送</button>` : ''}<button class="link-button" data-action="mass-employee-detail" data-id="${employee.id}">查看明细</button></div></td></tr>`;
  }).join('');
  return `<section class="info-section employee-execution"><div class="employee-execution-title summary-only"><span class="panel-extra">共 ${ctx.employeeTotal} 名员工</span></div><div class="employee-search-row"><input class="control" data-field="mass-employee-detail-search" value="${escapeHtml(ctx.employeeFilters.keyword)}" placeholder="请输入企微员工姓名 / CRM员工姓名" /><button class="btn primary" data-action="mass-employee-search">查询</button><button class="btn secondary" data-action="mass-employee-reset">重置</button></div><div class="employee-filter-row"><div class="customer-status-tabs">${renderEmployeeStatusTabs(ctx.employeeStatusCounts, ctx.employeeFilters.status)}</div></div><div class="table-wrap light"><table class="data-table employee-table"><thead><tr><th>企微员工</th><th>CRM员工</th><th>企微部门</th><th>目标客户数</th><th>已发送客户数</th><th>失败客户数</th><th>发送状态</th><th>操作</th></tr></thead><tbody>${rows || '<tr><td colspan="8"><div class="empty">暂无匹配的员工</div></td></tr>'}</tbody></table></div>${renderEmployeePagination(ctx.employeePagination, ctx.employeeTotal, ctx.employeeTotalPages)}</section>`;
}

function renderEmployeeStatusTabs(counts, active) {
  const tabs = [['all','全部'],['pending','待执行'],['running','执行中'],['completed','已完成']];
  return tabs.map(([value,label]) => `<button class="status-tab ${active === value ? 'active' : ''}" data-action="mass-employee-status" data-status="${value}">${label}<span>${counts[value] || 0}</span></button>`).join('');
}

function renderEmployeePagination(pagination, total, totalPages) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  return `<div class="pagination employee-pagination"><div class="pagination-total">共 ${total} 条</div><label>每页 <select data-action="mass-employee-page-size"><option value="20" ${pagination.pageSize === 20 ? 'selected' : ''}>20</option><option value="50" ${pagination.pageSize === 50 ? 'selected' : ''}>50</option><option value="100" ${pagination.pageSize === 100 ? 'selected' : ''}>100</option></select> 条</label><div class="pagination-pages"><button data-action="mass-employee-page" data-page="${pagination.page - 1}" ${pagination.page <= 1 ? 'disabled' : ''}>‹</button>${pages.map((page) => `<button class="${pagination.page === page ? 'active' : ''}" data-action="mass-employee-page" data-page="${page}">${page}</button>`).join('')}<button data-action="mass-employee-page" data-page="${pagination.page + 1}" ${pagination.page >= totalPages ? 'disabled' : ''}>›</button></div></div>`;
}

function renderReminderModal(employee) {
  return `<div class="modal-mask"><div class="modal confirm-modal"><div class="modal-head"><h3>提醒发送</h3><button class="icon-btn close-btn" data-action="mass-remind-cancel" aria-label="关闭">×</button></div><div class="confirm-body">确认提醒“${escapeHtml(employee.name)}”处理当前群发任务中尚未发送的客户？</div><div class="modal-foot"><button class="btn secondary" data-action="mass-remind-cancel">取消</button><button class="btn primary" data-action="mass-remind-confirm">确认提醒</button></div></div></div>`;
}

function renderCustomerExecutionTab(ctx) {
  const rows = ctx.filteredCustomers.map((item) => `<tr><td><div class="customer-cell"><span class="avatar customer-avatar" style="--avatar-color:${item.avatarColor}">${item.wecomName.slice(-1)}</span><span class="customer-name" title="${escapeHtml(item.wecomName)}">${escapeHtml(item.wecomName)}</span></div></td><td>${escapeHtml(item.remarkName || '—')}</td><td>${escapeHtml(item.gender || '未知')}</td><td><div class="employee-cell customer-employee-cell"><span class="avatar employee-avatar" style="--avatar-color:${item.employeeColor}">${item.employeeName.slice(-1)}</span><b>${escapeHtml(item.employeeName)}</b></div></td><td>${renderCustomerQuota(item.quota)}</td><td>${renderCustomerStatus(item.status)}</td><td class="time-cell">${item.sentAt || '—'}</td><td><span class="failure-reason" title="${escapeHtml(item.status === 'failed' ? item.failureReason : '')}">${escapeHtml(item.status === 'failed' ? item.failureReason : '—')}</span></td><td>${item.boundCrmName ? `<span class="crm-customer-link">${escapeHtml(item.boundCrmName)}</span>` : '—'}</td></tr>`).join('');
  return `<section class="info-section customer-detail-section"><div class="customer-query-row"><label>执行员工<input class="control" data-field="mass-customer-employee-search" value="${escapeHtml(ctx.customerFilters.employeeKeyword)}" placeholder="请输入企微员工姓名 / CRM员工姓名" /></label><label>客户<input class="control" data-field="mass-customer-search" value="${escapeHtml(ctx.customerFilters.keyword)}" placeholder="请输入CRM客户姓名 / 企微客户昵称 / 企微备注姓名" /></label><div class="customer-query-actions"><button class="btn primary" data-action="mass-customer-search">查询</button><button class="btn secondary" data-action="mass-customer-reset">重置</button></div></div><div class="customer-filter-row"><div class="customer-status-tabs">${renderCustomerStatusTabs(ctx.customerStatusCounts, ctx.customerFilters.status)}</div></div><div class="table-wrap light"><table class="data-table customer-detail-table"><thead><tr><th>企微客户昵称</th><th>客户备注</th><th>性别</th><th>执行员工</th><th>群发接收额度</th><th>发送状态</th><th>发送时间</th><th>失败原因</th><th>绑定CRM客户</th></tr></thead><tbody>${rows || '<tr><td colspan="9"><div class="empty">暂无匹配的客户</div></td></tr>'}</tbody></table></div>${renderCustomerPagination(ctx.customerPagination, ctx.customerTotal, ctx.customerTotalPages)}</section>`;
}

function renderCustomerStatusTabs(counts, active) {
  const tabs = [['all','全部'],['pending','待发送'],['sent','已发送'],['failed','发送失败']];
  return tabs.map(([value,label]) => `<button class="status-tab ${active === value ? 'active' : ''}" data-action="mass-customer-status" data-status="${value}">${label}<span>${counts[value] || 0}</span></button>`).join('');
}

function renderCustomerPagination(pagination, total, totalPages) {
  const pages = getVisiblePages(pagination.page, totalPages);
  return `<div class="pagination"><div class="pagination-total">共 ${total} 条</div><label>每页 <select data-action="mass-customer-page-size"><option value="20" ${pagination.pageSize === 20 ? 'selected' : ''}>20</option><option value="50" ${pagination.pageSize === 50 ? 'selected' : ''}>50</option><option value="100" ${pagination.pageSize === 100 ? 'selected' : ''}>100</option></select> 条</label><div class="pagination-pages"><button data-action="mass-customer-page" data-page="${pagination.page - 1}" ${pagination.page <= 1 ? 'disabled' : ''}>‹</button>${pages.map((page) => page === 'ellipsis' ? '<span class="pagination-ellipsis">…</span>' : `<button class="${pagination.page === page ? 'active' : ''}" data-action="mass-customer-page" data-page="${page}">${page}</button>`).join('')}<button data-action="mass-customer-page" data-page="${pagination.page + 1}" ${pagination.page >= totalPages ? 'disabled' : ''}>›</button></div></div>`;
}

function getVisiblePages(current, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  if (current >= totalPages - 3) return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', totalPages];
}

function renderEmployeeSummary(employees) { const names = employees.map((item) => item.name); const short = `${names.length}人 · ${names.slice(0,2).join('、')}${names.length > 2 ? ` +${names.length - 2}` : ''}`; return `<span class="employee-summary" title="${escapeHtml(names.join('、'))}">${escapeHtml(short)}</span>`; }
function renderTaskStatus(data) { const status = getTaskStatus(data); return `<span class="task-status ${status}"><i></i>${taskStatusText[status]}</span>`; }
function renderEmployeeStatus(data) { const status = getTaskStatus(data); return `<span class="task-status ${status}"><i></i>${taskStatusText[status]}</span>`; }
function renderCustomerStatus(status) { const label = { pending: '待发送', sent: '已发送', failed: '发送失败' }[status]; const cls = status === 'sent' ? 'success' : status === 'failed' ? 'danger-tag' : 'neutral'; return `<span class="tag ${cls}">${label}</span>`; }
function renderTaskSource(source) { const isWecom = source === 'wecom'; return `<span class="source-tag ${isWecom ? 'wecom' : 'crm'}">${isWecom ? '企微创建' : 'CRM创建'}</span>`; }
function renderCustomerQuota(quota) { if (!quota) return '<span class="quota-empty">—</span>'; const reached = quota.used >= quota.limit; return `<div class="quota-value ${reached ? 'limit-reached' : ''}"><div>${escapeHtml(quota.period)} <span class="quota-count">${formatNumber(quota.used)} / ${formatNumber(quota.limit)}</span></div>${reached ? '<span class="quota-limit-tag">已达上限</span>' : ''}</div>`; }
function metric(name, value, cls='') { return `<div class="metric-box"><div class="metric-name">${name}</div><div class="metric-value ${cls}">${typeof value === 'number' ? formatNumber(value) : value}</div></div>`; }
function inlineMetric(name, value, cls='') { return `<div class="statistic-item"><div class="metric-name">${name}</div><div class="metric-value ${cls}">${typeof value === 'number' ? formatNumber(value) : value}</div></div>`; }
function eyeIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.6"/></svg>'; }
function formatNumber(value) { return Number(value).toLocaleString('zh-CN'); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
