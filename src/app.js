import {
  LAST_SYNC_AT,
  cloneAccounts,
  cloneEmployees,
  createSyncedAccounts,
} from './mockData.js';
import {
  drawQr,
  drawQrCanvases,
  getSelectorCandidates,
  renderPage,
} from './components.js';

const TODAY = '2026-07-09';

const state = {
  accounts: cloneAccounts(),
  employees: cloneEmployees(),
  filters: {
    accountName: '',
    employeeName: '',
    status: 'all',
  },
  lastSyncAt: LAST_SYNC_AT,
  employeeDataUpdatedAt: LAST_SYNC_AT,
  isSyncing: false,
  drawer: {
    open: false,
    accountId: '',
    tab: 'basic',
    metricRange: { preset: 'today', start: TODAY, end: TODAY },
  },
  modal: null,
  selector: createSelectorState([], LAST_SYNC_AT),
  toast: '',
};

const app = document.querySelector('#app');

render();

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action !== 'close-drawer') event.stopPropagation();

  const handlers = {
    search: applySearch,
    'reset-search': resetSearch,
    'open-add-account': openAddAccount,
    'create-account': createAccount,
    'sync-wecom': syncWeCom,
    'open-detail': () => openDetail(target.dataset.id),
    'close-drawer': closeDrawer,
    'switch-tab': () => switchTab(target.dataset.tab),
    'open-edit-account': () => openEditAccount(target.dataset.id),
    'save-edit-account': saveEditAccount,
    'confirm-delete-account': () => confirmDeleteAccount(target.dataset.id),
    'confirm-action': confirmAction,
    'close-modal': closeModal,
    'metric-preset': () => setMetricPreset(target.dataset.preset),
    'apply-metric-range': applyMetricRange,
    'copy-link': () => copyAccessLink(target.dataset.id),
    'view-qr': () => viewQr(target.dataset.id),
    'download-qr': () => downloadQr(target.dataset.id),
    'open-employee-selector': () => openEmployeeSelector(target.dataset.id),
    'toggle-dept-expand': () => toggleDepartmentExpand(target.dataset.deptId),
    'select-current-candidates': selectCurrentCandidates,
    'clear-selected-employees': clearSelectedEmployees,
    'remove-selected-employee': () => removeSelectedEmployee(target.dataset.employeeId),
    'refresh-employee-list': refreshEmployeeList,
    'confirm-add-employees': confirmAddEmployees,
    'set-default-employee': () => setDefaultEmployee(target.dataset.id, target.dataset.employeeId),
    'confirm-remove-employee': () => confirmRemoveEmployee(target.dataset.id, target.dataset.employeeId),
  };

  handlers[action]?.();
});

document.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.dataset.action === 'toggle-dept-check') {
    toggleDepartmentCheck(target.dataset.deptId, target.checked);
    return;
  }
  if (target.dataset.action === 'toggle-candidate') {
    toggleCandidate(target.dataset.employeeId, target.checked);
    return;
  }
  if (target.id === 'account-form-avatar' && target.files?.[0]) {
    readAvatarFile(target.files[0]);
  }
});

document.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.dataset.field === 'employee-search') {
    state.selector.search = target.value;
    render({ focusField: target.dataset.field, caret: target.selectionStart ?? target.value.length });
  }
  if (target.dataset.field === 'dept-search') {
    state.selector.departmentSearch = target.value;
    render({ focusField: target.dataset.field, caret: target.selectionStart ?? target.value.length });
  }
});

function render(focus = null) {
  const filteredAccounts = getFilteredAccounts();
  app.innerHTML = renderPage({
    ...state,
    filteredAccounts,
  });
  drawQrCanvases(document);
  if (focus?.focusField) {
    const element = document.querySelector(`[data-field="${focus.focusField}"]`);
    if (element instanceof HTMLInputElement) {
      element.focus();
      element.setSelectionRange(focus.caret, focus.caret);
    }
  }
}

function getFilteredAccounts() {
  const employeeMap = new Map(state.employees.map((employee) => [employee.id, employee]));
  const accountKeyword = state.filters.accountName.trim();
  const employeeKeyword = state.filters.employeeName.trim();
  return state.accounts.filter((account) => {
    const matchAccount = !accountKeyword || account.name.includes(accountKeyword);
    const matchEmployee = !employeeKeyword || account.employeeIds.some((id) => employeeMap.get(id)?.name.includes(employeeKeyword));
    const matchStatus = state.filters.status === 'all' || account.status === state.filters.status;
    return matchAccount && matchEmployee && matchStatus;
  });
}

function applySearch() {
  state.filters = {
    accountName: readField('filter-account'),
    employeeName: readField('filter-employee'),
    status: readField('filter-status') || 'all',
  };
  render();
}

function resetSearch() {
  state.filters = { accountName: '', employeeName: '', status: 'all' };
  render();
}

function openAddAccount() {
  state.modal = {
    type: 'account-form',
    mode: 'add',
    data: { name: '', avatarImage: '' },
  };
  render();
}

function createAccount() {
  const name = document.querySelector('#account-form-name')?.value.trim();
  if (!name) {
    showToast('请输入客服账号名称');
    return;
  }
  const stamp = String(Date.now()).slice(-8);
  const id = `acc-local-${Date.now()}`;
  state.accounts.unshift({
    id,
    name,
    wecomId: `wkf_hcrm_${stamp}`,
    source: 'HCRM创建',
    manageable: true,
    status: 'enabled',
    createdAt: '2026-07-09 16:12',
    lastContactAt: null,
    lastSyncAt: state.lastSyncAt,
    employeeIds: [],
    defaultEmployeeId: null,
    metricsSeed: 33,
    avatarColor: '#14b8a6',
    avatarImage: state.modal?.data?.avatarImage || '',
    accessLink: `https://work.weixin.qq.com/kfid/wkf_hcrm_${stamp}?from=hcrm`,
  });
  closeModal(false);
  showToast('客服账号创建成功');
}

function syncWeCom() {
  if (state.isSyncing) return;
  state.isSyncing = true;
  render();
  window.setTimeout(() => {
    const existingIds = new Set(state.accounts.map((account) => account.id));
    const newAccounts = createSyncedAccounts().filter((account) => !existingIds.has(account.id));
    state.accounts = [
      ...newAccounts,
      ...state.accounts.map((account, index) => {
        if (index > 4) return account;
        return {
          ...account,
          lastSyncAt: '2026-07-09 16:05:28',
          manageable: index === 3 ? true : account.manageable,
          name: index === 1 ? '企微接待主账号' : account.name,
        };
      }),
    ];
    state.lastSyncAt = '2026-07-09 16:05:28';
    state.employeeDataUpdatedAt = state.lastSyncAt;
    state.isSyncing = false;
    showToast(`企微数据同步完成，新增 ${newAccounts.length} 个账号，更新 5 个账号`);
  }, 900);
}

function openDetail(id) {
  state.drawer.open = true;
  state.drawer.accountId = id;
  state.drawer.tab = 'basic';
  state.drawer.metricRange = { preset: 'today', start: TODAY, end: TODAY };
  render();
}

function closeDrawer(event) {
  if (event?.target?.classList?.contains('detail-drawer')) return;
  state.drawer.open = false;
  state.drawer.accountId = '';
  render();
}

function switchTab(tab) {
  state.drawer.tab = tab;
  render();
}

function openEditAccount(id) {
  const account = findAccount(id);
  if (!account) return;
  state.modal = {
    type: 'account-form',
    mode: 'edit',
    accountId: id,
    data: { name: account.name, avatarImage: account.avatarImage || '' },
  };
  render();
}

function saveEditAccount() {
  const name = document.querySelector('#account-form-name')?.value.trim();
  if (!name) {
    showToast('请输入客服账号名称');
    return;
  }
  updateAccount(state.modal.accountId, (account) => ({
    ...account,
    name,
    avatarImage: state.modal?.data?.avatarImage || account.avatarImage,
  }));
  closeModal(false);
  showToast('客服账号已更新');
}

function confirmDeleteAccount(id) {
  const account = findAccount(id);
  if (!account || !account.manageable) return;
  state.modal = {
    type: 'confirm',
    title: '删除客服账号',
    message: `删除后，该客服账号将无法恢复，请谨慎操作。确认删除客服账号【${account.name}】？`,
    danger: true,
    confirm: { type: 'delete-account', id },
  };
  render();
}

function confirmAction() {
  const confirm = state.modal?.confirm;
  if (!confirm) return;
  if (confirm.type === 'delete-account') {
    state.accounts = state.accounts.filter((account) => account.id !== confirm.id);
    state.drawer.open = false;
    closeModal(false);
    showToast('客服账号已删除');
  }
  if (confirm.type === 'remove-employee') {
    const employee = state.employees.find((item) => item.id === confirm.employeeId);
    updateAccount(confirm.id, (account) => {
      const employeeIds = account.employeeIds.filter((id) => id !== confirm.employeeId);
      return {
        ...account,
        employeeIds,
        defaultEmployeeId: account.defaultEmployeeId === confirm.employeeId ? (employeeIds[0] || null) : account.defaultEmployeeId,
      };
    });
    closeModal(false);
    showToast(`${employee?.name || '员工'}已移除`);
  }
}

function setMetricPreset(preset) {
  const ranges = {
    today: { preset: 'today', start: TODAY, end: TODAY },
    yesterday: { preset: 'yesterday', start: '2026-07-08', end: '2026-07-08' },
    last7: { preset: 'last7', start: '2026-07-03', end: TODAY },
    last30: { preset: 'last30', start: '2026-06-10', end: TODAY },
  };
  state.drawer.metricRange = ranges[preset] || ranges.today;
  render();
}

function applyMetricRange() {
  const start = document.querySelector('[data-field="metric-start"]')?.value || TODAY;
  const end = document.querySelector('[data-field="metric-end"]')?.value || start;
  state.drawer.metricRange = {
    preset: 'custom',
    start: start <= end ? start : end,
    end: start <= end ? end : start,
  };
  render();
}

async function copyAccessLink(id) {
  const account = findAccount(id);
  if (!account) return;
  try {
    await navigator.clipboard.writeText(account.accessLink);
  } catch {
    const input = document.createElement('textarea');
    input.value = account.accessLink;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
  showToast('链接已复制');
}

function viewQr(id) {
  state.modal = { type: 'qr', accountId: id };
  render();
}

function downloadQr(id) {
  const account = findAccount(id);
  const canvas = document.createElement('canvas');
  canvas.width = 260;
  canvas.height = 260;
  drawQr(canvas, id);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${account?.name || '客服账号'}-接入二维码.png`;
  link.click();
}

function openEmployeeSelector(accountId) {
  const account = findAccount(accountId);
  if (!account || !account.manageable) return;
  state.selector = createSelectorState(account.employeeIds, state.employeeDataUpdatedAt);
  state.modal = { type: 'employee-selector', accountId };
  render();
}

function toggleDepartmentExpand(id) {
  const expanded = new Set(state.selector.expandedDepartmentIds);
  expanded.has(id) ? expanded.delete(id) : expanded.add(id);
  state.selector.expandedDepartmentIds = [...expanded];
  render();
}

function toggleDepartmentCheck(id, checked) {
  const ids = new Set(state.selector.departmentIds);
  checked ? ids.add(id) : ids.delete(id);
  state.selector.departmentIds = [...ids];
  render();
}

function toggleCandidate(id, checked) {
  const selected = new Set(state.selector.selectedIds);
  checked ? selected.add(id) : selected.delete(id);
  state.selector.selectedIds = [...selected].filter((employeeId) => !state.selector.disabledIds.includes(employeeId));
  render();
}

function selectCurrentCandidates() {
  const selected = new Set(state.selector.selectedIds);
  getSelectorCandidates(state.employees, state.selector)
    .filter((employee) => !state.selector.disabledIds.includes(employee.id))
    .forEach((employee) => selected.add(employee.id));
  state.selector.selectedIds = [...selected];
  render();
}

function clearSelectedEmployees() {
  state.selector.selectedIds = [];
  render();
}

function removeSelectedEmployee(employeeId) {
  state.selector.selectedIds = state.selector.selectedIds.filter((id) => id !== employeeId);
  render();
}

function refreshEmployeeList() {
  state.employeeDataUpdatedAt = '2026-07-09 16:06:36';
  state.selector.updatedAt = state.employeeDataUpdatedAt;
  showToast('员工列表已刷新');
}

function confirmAddEmployees() {
  const accountId = state.modal?.accountId;
  const selectedIds = state.selector.selectedIds;
  if (!accountId || !selectedIds.length) return;
  updateAccount(accountId, (account) => {
    const employeeIds = [...new Set([...account.employeeIds, ...selectedIds])];
    return {
      ...account,
      employeeIds,
      defaultEmployeeId: account.defaultEmployeeId || employeeIds[0],
    };
  });
  closeModal(false);
  state.drawer.tab = 'employees';
  showToast(`已添加 ${selectedIds.length} 名接待员工`);
}

function setDefaultEmployee(accountId, employeeId) {
  updateAccount(accountId, (account) => ({
    ...account,
    defaultEmployeeId: employeeId,
  }));
  showToast('默认接待员工已更新');
}

function confirmRemoveEmployee(accountId, employeeId) {
  const employee = state.employees.find((item) => item.id === employeeId);
  state.modal = {
    type: 'confirm',
    title: '移除接待员工',
    message: `确认将“${employee?.name || ''}”从当前客服账号的接待员工中移除？`,
    danger: false,
    confirm: { type: 'remove-employee', id: accountId, employeeId },
  };
  render();
}

function closeModal(shouldRender = true) {
  state.modal = null;
  if (shouldRender) render();
}

function showToast(message) {
  state.toast = message;
  render();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    state.toast = '';
    render();
  }, 2200);
}

function readAvatarFile(file) {
  if (state.modal?.data) {
    state.modal.data.name = document.querySelector('#account-form-name')?.value || state.modal.data.name || '';
  }
  const reader = new FileReader();
  reader.onload = () => {
    if (!state.modal?.data) return;
    state.modal.data.avatarImage = String(reader.result || '');
    render();
  };
  reader.readAsDataURL(file);
}

function readField(field) {
  const element = document.querySelector(`[data-field="${field}"]`);
  return element?.value || '';
}

function findAccount(id) {
  return state.accounts.find((account) => account.id === id);
}

function updateAccount(id, updater) {
  state.accounts = state.accounts.map((account) => account.id === id ? updater(account) : account);
}

function createSelectorState(disabledIds = [], updatedAt = LAST_SYNC_AT) {
  return {
    departmentIds: [],
    expandedDepartmentIds: ['corp', 'sales'],
    departmentSearch: '',
    search: '',
    selectedIds: [],
    disabledIds: [...disabledIds],
    updatedAt,
  };
}
