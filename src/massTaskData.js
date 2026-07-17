export const massTasks = [
  task('mt-001', '7月会员权益到期提醒', 'crm', '王小雨', '2026-07-14 09:10:26', '2026-07-14 11:32:08', 3260, 2980, 12,
    {
      items: [
        { type: 'text', text: '您好，您的会员权益将在本月底到期，\n请及时续费，继续享受会员专属服务。' },
        { type: 'image', localUrl: './assets/crm-local/member-renewal.svg', alt: '会员权益续费提醒' },
        { type: 'video', localUrl: './assets/crm-local/member-service.webm', posterUrl: './assets/crm-local/video-poster.svg', mimeType: 'video/webm' },
        { type: 'file', fileName: '会员服务使用手册.txt', fileSize: '165 B', localUrl: './assets/crm-local/会员服务使用手册.txt' },
        {
          type: 'link',
          url: 'https://example.com/member-renewal',
        },
        {
          type: 'miniprogram',
          coverUrl: './assets/crm-local/mini-program-cover.svg',
          title: '企业服务中心',
          appId: 'wx8f31a6c2d95e7b40',
          pagePath: 'pages/member/renewal/index',
        },
      ],
    },
    employees('mt-001', ['completed', 'completed_with_failures', 'running', 'pending', 'completed', 'completed'])),
  task('mt-002', '夏日新品活动通知', 'wecom', '系统管理员', '2026-07-12 14:05:18', '2026-07-13 18:20:42', 1680, 1680, 0,
    {
      text: '',
      attachments: [
        { type: 'image', syncStatus: 'ready', localUrl: './assets/crm-local/member-renewal.svg', alt: '夏日新品活动海报' },
      ],
    },
    employees('mt-002', ['completed', 'completed', 'completed', 'completed'])),
  task('mt-003', '重点客户服务回访', 'crm', '陈晨', '2026-07-11 10:30:00', '2026-07-14 08:48:13', 856, 789, 22,
    {
      text: '您好，为持续提升服务体验，诚邀您参与本次服务回访。\n以下是本次服务说明及相关资料。',
      attachments: [
        { type: 'image', syncStatus: 'ready', localUrl: './assets/crm-local/member-renewal.svg', alt: '会员服务说明图' },
        { type: 'video', syncStatus: 'ready', localUrl: './assets/crm-local/member-service.webm', posterUrl: './assets/crm-local/video-poster.svg', mimeType: 'video/webm' },
        { type: 'file', syncStatus: 'ready', fileName: '会员服务使用手册.txt', fileSize: '165 B', localUrl: './assets/crm-local/会员服务使用手册.txt' },
      ],
    },
    employees('mt-003', ['completed', 'partial', 'partial', 'completed', 'pending'])),
  task('mt-004', '会员服务入口更新', 'wecom', '系统管理员', '2026-07-10 16:42:55', '2026-07-10 16:45:02', 2100, 0, 0,
    {
      text: '',
      attachments: [
        {
          type: 'link',
          url: 'https://example.com/member-renewal',
        },
        {
          type: 'miniprogram',
          coverUrl: './assets/crm-local/mini-program-cover.svg',
          title: '企业服务中心',
          appId: 'wx8f31a6c2d95e7b40',
          pagePath: 'pages/member/renewal/index',
        },
      ],
    },
    employees('mt-004', ['pending', 'pending', 'pending'])),
  task('mt-005', '服务说明视频同步任务', 'crm', '赵敏', '2026-07-09 13:26:18', '2026-07-09 13:28:46', 980, 0, 0,
    {
      text: '',
      attachments: [
        { type: 'video', syncStatus: 'syncing' },
      ],
    },
    employees('mt-005', ['completed', 'completed_with_failures', 'completed', 'completed'])),
  task('mt-006', '客户资料文件补发任务', 'crm', '李思', '2026-07-08 10:12:09', '2026-07-08 10:16:21', 620, 0, 0,
    {
      text: '',
      attachments: [
        { type: 'file', syncStatus: 'failed', fileName: '客户服务资料包.zip' },
      ],
    },
    employees('mt-006', ['pending', 'pending', 'pending'])),
  task('mt-007', '历史异常群发任务', 'wecom', '系统管理员', '2026-07-07 09:42:31', '2026-07-07 09:45:08', 300, 300, 0,
    {
      text: '',
      attachments: [],
    },
    employees('mt-007', ['completed', 'completed', 'completed'])),
];

export function cloneMassTasks() { return JSON.parse(JSON.stringify(massTasks)); }

export function getDeliveryStatus({ expected, sent, failed }) {
  if (failed > 0) return 'partial';
  if (sent === 0) return 'pending';
  if (sent >= expected) return 'completed';
  return 'running';
}

export function getTaskStatus({ expected, pending }) {
  if (pending >= expected) return 'pending';
  if (pending > 0) return 'running';
  return 'completed';
}

function task(id, name, source, creator, createdAt, updatedAt, expected, sent, failed, message, staff) {
  return { id, name, source, creator, createdAt, updatedAt, expected, sent, failed, pending: Math.max(expected - sent - failed, 0), message, employees: staff };
}

function employees(seed, profiles) {
  const names = ['张艺予', '朱桂花', '李思', '胡芳芳', '王静', '刘红霞'];
  const departments = ['客服部', '客服部', '咨询部', '客服部', '咨询部', '华东销售组'];
  return profiles.map((profile, index) => {
    const expected = 360 + index * 47;
    const failed = profile === 'partial' || profile === 'completed_with_failures' ? 8 + index : 0;
    const sent = profile === 'completed' ? expected : profile === 'completed_with_failures' ? expected - failed : profile === 'running' ? expected - 80 : profile === 'partial' ? expected - failed - 34 : 0;
    const pending = Math.max(expected - sent - failed, 0);
    return {
      id: `${seed}-emp-${index}`, name: names[index], crmName: index === 4 ? null : names[index], department: departments[index],
      color: ['#38bdf8', '#60a5fa', '#a78bfa', '#f59e0b', '#22c55e', '#fb7185'][index], expected, sent, failed, pending,
      sentAt: sent ? `2026-07-${String(12 + (index % 3)).padStart(2, '0')} ${String(9 + index).padStart(2, '0')}:18:26` : null,
      customerDetails: customerDetails(names[index], profile, index),
    };
  });
}

function customerDetails(employeeName, profile, index) {
  const sentAt = `2026-07-${String(12 + (index % 3)).padStart(2, '0')} ${String(9 + index).padStart(2, '0')}:18:26`;
  const colors = ['#38bdf8', '#a78bfa', '#f59e0b', '#22c55e', '#fb7185'];
  const rows = [
    customer(`${employeeName}好友A`, '王小敏', '敏敏', '女', `${employeeName}客户A`, colors[0], 'sent', sentAt, '', quotaFor(index, 0)),
    customer(`${employeeName}好友B`, '', '李先生', '男', `${employeeName}客户B`, colors[1], profile === 'pending' ? 'pending' : 'sent', profile === 'pending' ? null : sentAt, '', quotaFor(index, 1)),
    customer(`${employeeName}好友C`, '陈老师', '', '未知', index % 2 ? null : `${employeeName}客户C`, colors[2], profile === 'completed' || profile === 'completed_with_failures' ? 'sent' : 'pending', profile === 'completed' || profile === 'completed_with_failures' ? sentAt : null, '', quotaFor(index, 2)),
  ];
  if (profile === 'partial' || profile === 'completed_with_failures') {
    const reason = index % 2 === 0 ? '客户已不是该员工好友，消息无法送达。' : '客户已收到企业其他群发消息，达到接收上限，本次消息发送失败。';
    rows.push(customer(`${employeeName}好友D`, '周经理', '周总', '男', `${employeeName}客户D`, colors[3], 'failed', sentAt, reason, quotaFor(index, 3)));
  }
  if (index === 0 && profile === 'completed') {
    rows.push(customer(`${employeeName}好友D`, '周经理', '周总', '男', `${employeeName}客户D`, colors[3], 'failed', sentAt, '因客户不是好友导致发送失败', quotaFor(index, 3)));
  }
  if (profile === 'running') rows.push(customer(`${employeeName}好友D`, '', '小周', '女', null, colors[4], 'pending', null, '', quotaFor(index, 3)));
  if (profile === 'pending') rows[0] = { ...rows[0], status: 'pending', sentAt: null };
  return rows;
}

function quotaFor(employeeIndex, rowIndex) {
  const scenarios = [
    { period: '今日', used: 0, limit: 1 },
    { period: '今日', used: 1, limit: 1 },
    { period: '本周', used: 5, limit: 7 },
    { period: '本周', used: 7, limit: 7 },
    { period: '本月', used: 12, limit: 31 },
    { period: '本月', used: 31, limit: 31 },
    null,
  ];
  const quota = scenarios[(employeeIndex * 3 + rowIndex) % scenarios.length];
  return quota ? { ...quota } : null;
}

function customer(wecomName, remarkName, nickname, gender, crmName, avatarColor, status, sentAt, failureReason = '', quota = null) {
  const boundCrmName = crmName ? ['小美宝妈', '李女士', '胡小姐', '周先生'][Math.abs(wecomName.length + remarkName.length) % 4] : null;
  return { wecomName, remarkName, nickname, gender, crmName, boundCrmName, avatarColor, status, sentAt, failureReason, quota };
}
