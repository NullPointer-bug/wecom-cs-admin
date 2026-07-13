export const LAST_SYNC_AT = '2026-07-09 15:54:52';

export const departments = [
  {
    id: 'corp',
    name: '企业总部',
    children: [
      { id: 'consulting', name: '咨询部', children: [] },
      { id: 'service', name: '客服部', children: [] },
      {
        id: 'sales',
        name: '销售部',
        children: [
          { id: 'sales-east', name: '华东销售组', children: [] },
          { id: 'sales-south', name: '华南销售组', children: [] },
        ],
      },
      { id: 'marketing', name: '市场部', children: [] },
      { id: 'after-sales', name: '售后服务部', children: [] },
      { id: 'operation', name: '运营支持部', children: [] },
    ],
  },
];

const departmentPathMap = {
  corp: '企业总部',
  consulting: '企业总部 / 咨询部',
  service: '企业总部 / 客服部',
  sales: '企业总部 / 销售部',
  'sales-east': '企业总部 / 销售部 / 华东销售组',
  'sales-south': '企业总部 / 销售部 / 华南销售组',
  marketing: '企业总部 / 市场部',
  'after-sales': '企业总部 / 售后服务部',
  operation: '企业总部 / 运营支持部',
};

export const employees = [
  employee('emp-001', '张艺语', 'zhangyiyu01', 'service', '张艺语', '#38bdf8'),
  employee('emp-002', '朱桂花', 'zhuguihua02', 'service', '朱桂花', '#60a5fa'),
  employee('emp-003', '李思', 'lisi03', 'consulting', '李思', '#a78bfa'),
  employee('emp-004', '胡芳芳', 'hufangfang04', 'service', '胡芳芳', '#f59e0b'),
  employee('emp-005', '王静', 'wangjing05', 'consulting', '王静', '#22c55e'),
  employee('emp-006', '刘红霞', 'liuhongxia06', 'sales-east', '刘红霞', '#fb7185'),
  employee('emp-007', '周凯', 'zhoukai07', 'sales-south', '周凯', '#0ea5e9'),
  employee('emp-008', '陈若雪', 'chenruoxue08', 'service', '陈若雪', '#14b8a6'),
  employee('emp-009', '小晓', 'xiaoxiao09', 'consulting', '小晓', '#10b981'),
  employee('emp-010', '小花', 'xiaohua10', 'service', '小花', '#34d399'),
  employee('emp-011', '莉莉', 'lili11', 'marketing', '莉莉', '#2dd4bf'),
  employee('emp-012', '小思', 'xiaosi12', 'after-sales', null, '#fb923c'),
  employee('emp-013', '小满', 'xiaoman13', 'after-sales', null, '#facc15'),
  employee('emp-014', '芳芳', 'fangfang14', 'service', '芳芳', '#fb923c'),
  employee('emp-015', '小康', 'xiaokang15', 'operation', '康宁', '#3b82f6'),
  employee('emp-016', '小军', 'xiaojun16', 'sales-east', '军明', '#2563eb'),
  employee('emp-017', '赵晨', 'zhaochen17', 'consulting', '赵晨', '#06b6d4'),
  employee('emp-018', '孙浩', 'sunhao18', 'sales', '孙浩', '#0f766e'),
  employee('emp-019', '吴岚', 'wulan19', 'marketing', '吴岚', '#f97316'),
  employee('emp-020', '钱嘉', 'qianjia20', 'after-sales', null, '#84cc16'),
  employee('emp-021', '郑欣', 'zhengxin21', 'service', '郑欣', '#ec4899'),
  employee('emp-022', '冯远', 'fengyuan22', 'sales-south', '冯远', '#8b5cf6'),
  employee('emp-023', '马宁', 'maning23', 'consulting', null, '#64748b'),
  employee('emp-024', '罗可', 'luoke24', 'operation', '罗可', '#0284c7'),
  employee('emp-025', '魏青', 'weiqing25', 'marketing', '魏青', '#16a34a'),
  employee('emp-026', '宋然', 'songran26', 'service', null, '#eab308'),
  employee('emp-027', '叶舟', 'yezhou27', 'after-sales', '叶舟', '#dc2626'),
  employee('emp-028', '梁夏', 'liangxia28', 'sales-east', '梁夏', '#7c3aed'),
  employee('emp-029', '唐棠', 'tangtang29', 'consulting', '唐棠', '#0891b2'),
  employee('emp-030', '何澄', 'hecheng30', 'operation', null, '#94a3b8'),
  employee('emp-031', '林雅', 'linya31', 'marketing', '林雅', '#ea580c'),
  employee('emp-032', '顾言', 'guyan32', 'sales-south', '顾言', '#059669'),
  employee('emp-033', '白露', 'bailu33', 'service', '白露', '#475569'),
  employee('emp-034', '邵琪', 'shaoqi34', 'consulting', null, '#0d9488'),
  employee('emp-035', '任一鸣', 'renyiming35', 'after-sales', '任一鸣', '#f43f5e'),
  employee('emp-036', '许诺', 'xunuo36', 'sales', null, '#155e75'),
];

export const accounts = [
  account('acc-001', '小晓客服', 'wkf_20260709001', 'HCRM创建', true, 'enabled', '2026-05-18 09:24', '2026-07-09 14:45', ['emp-009', 'emp-010', 'emp-011'], 'emp-009', 37, '#22c55e'),
  account('acc-002', '企微接待一号', 'wkf_20260709002', 'HCRM创建', true, 'disabled', '2026-04-28 13:40', null, ['emp-012'], 'emp-012', 22, '#0ea5e9'),
  account('acc-003', '售前咨询组', 'wkf_20260709003', '企微创建', true, 'enabled', '2026-03-11 08:35', '2026-07-08 17:20', ['emp-001', 'emp-003', 'emp-017', 'emp-029'], 'emp-001', 64, '#14b8a6'),
  account('acc-004', '售后问题处理', 'wkf_20260709004', '企微创建', false, 'enabled', '2026-02-21 15:16', '2026-07-07 10:11', ['emp-020', 'emp-027', 'emp-035'], 'emp-027', 51, '#f97316'),
  account('acc-005', '客户成功服务', 'wkf_20260709005', 'HCRM创建', true, 'enabled', '2026-06-01 10:02', '2026-07-09 11:12', [], null, 46, '#38bdf8'),
  account('acc-006', '市场活动客服', 'wkf_20260709006', '企微创建', false, 'disabled', '2026-01-09 12:31', null, ['emp-019', 'emp-025'], 'emp-025', 18, '#f59e0b'),
  account('acc-007', '华东销售接待', 'wkf_20260709007', '企微创建', true, 'enabled', '2026-04-07 09:11', '2026-07-09 09:30', ['emp-006', 'emp-016', 'emp-028'], 'emp-006', 73, '#2563eb'),
  account('acc-008', '华南销售接待', 'wkf_20260709008', 'HCRM创建', true, 'enabled', '2026-04-18 16:22', '2026-07-06 18:02', ['emp-007', 'emp-022', 'emp-032'], 'emp-007', 55, '#059669'),
  account('acc-009', '运营支持客服', 'wkf_20260709009', 'HCRM创建', true, 'disabled', '2026-06-12 11:45', '2026-07-02 13:18', ['emp-015', 'emp-024', 'emp-030'], 'emp-024', 29, '#64748b'),
  account('acc-010', '新人引导客服', 'wkf_20260709010', '企微创建', false, 'enabled', '2026-05-05 08:28', '2026-07-03 16:48', ['emp-021', 'emp-026', 'emp-033'], 'emp-021', 31, '#ec4899'),
  account('acc-011', '产品答疑客服', 'wkf_20260709011', 'HCRM创建', true, 'enabled', '2026-03-27 14:09', null, ['emp-023', 'emp-034'], 'emp-023', 44, '#8b5cf6'),
  account('acc-012', '企业微信入口', 'wkf_20260709012', '企微创建', false, 'enabled', '2026-02-02 10:50', '2026-07-08 21:06', ['emp-018', 'emp-036'], 'emp-018', 25, '#155e75'),
  account('acc-013', '重点客户通道', 'wkf_20260709013', 'HCRM创建', true, 'enabled', '2026-06-20 09:19', '2026-07-09 15:01', ['emp-004', 'emp-005', 'emp-008', 'emp-014'], 'emp-004', 88, '#dc2626'),
  account('acc-014', '线索咨询客服', 'wkf_20260709014', '企微创建', true, 'enabled', '2026-06-26 17:03', null, ['emp-002'], 'emp-002', 36, '#60a5fa'),
];

export function createSyncedAccounts() {
  return [
    account('acc-sync-001', '企微同步客服A', 'wkf_sync_2026070901', '企微创建', true, 'enabled', '2026-07-09 16:01', null, ['emp-031', 'emp-034'], 'emp-031', 42, '#0d9488'),
    account('acc-sync-002', '企微同步客服B', 'wkf_sync_2026070902', '企微创建', false, 'enabled', '2026-07-09 16:01', '2026-07-09 16:02', ['emp-030'], 'emp-030', 21, '#ea580c'),
  ];
}

export function cloneAccounts() {
  return JSON.parse(JSON.stringify(accounts));
}

export function cloneEmployees() {
  return JSON.parse(JSON.stringify(employees));
}

export function getDepartmentPath(departmentId) {
  return departmentPathMap[departmentId] || departmentId;
}

function employee(id, name, userId, departmentId, crmName, color) {
  return {
    id,
    name,
    userId,
    departmentId,
    departmentPath: departmentPathMap[departmentId],
    crmName,
    color,
  };
}

function account(id, name, wecomId, source, manageable, status, createdAt, lastContactAt, employeeIds, defaultEmployeeId, metricsSeed, avatarColor) {
  return {
    id,
    name,
    wecomId,
    source,
    manageable,
    status,
    createdAt,
    lastContactAt,
    lastSyncAt: LAST_SYNC_AT,
    employeeIds,
    defaultEmployeeId,
    metricsSeed,
    avatarColor,
    avatarImage: '',
    accessLink: `https://work.weixin.qq.com/kfid/${wecomId}?from=hcrm`,
  };
}
