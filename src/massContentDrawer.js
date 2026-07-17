export function renderMassContentDrawer({
  taskId,
  visible,
  tasks,
  preview = null,
  closeAction = 'mass-content-close',
}) {
  if (!visible) return '';
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return '';

  const items = getOrderedContent(task.message);

  return `
    <div class="content-drawer-mask" data-action="${closeAction}"></div>
    <aside class="content-drawer" aria-label="群发内容">
      <header class="mass-content-head">
        <h2 title="${escapeHtml(task.name)}">${escapeHtml(task.name)}</h2>
        <button class="icon-btn close-btn" data-action="${closeAction}" aria-label="关闭">×</button>
      </header>
      <div class="mass-content-body">
        <section class="mass-content-section">
          <h3>群发内容</h3>
          ${items.length
            ? `<div class="mass-content-list">${items.map(renderContentItem).join('')}</div>`
            : renderEmptyContent()}
        </section>
      </div>
    </aside>
    ${preview ? renderPreview(preview) : ''}
  `;
}

function getOrderedContent(message = {}) {
  if (Array.isArray(message.items)) return message.items;
  const items = [];
  if (typeof message.text === 'string' && message.text.trim()) {
    items.push({ type: 'text', text: message.text });
  }
  if (Array.isArray(message.attachments)) items.push(...message.attachments);
  return items;
}

function renderContentItem(item) {
  const renderer = {
    text: renderTextItem,
    image: renderImageItem,
    video: renderVideoItem,
    file: renderFileItem,
    link: renderLinkItem,
    miniprogram: renderMiniProgramItem,
  }[item.type];
  return renderer ? renderer(item) : '';
}

function renderTextItem(item) {
  return `<article class="mass-content-card mass-text-card">${escapeHtml(item.text)}</article>`;
}

function renderImageItem(item) {
  if (!item.localUrl) return renderUnavailableItem('图片素材暂不可用');
  return `
    <article class="mass-content-card mass-action-card">
      <div class="mass-image-thumb">
        <img src="${escapeHtml(item.localUrl)}" alt="${escapeHtml(item.alt || '群发图片')}" onerror="this.hidden=true;this.nextElementSibling.hidden=false" />
        <span class="mass-thumb-failed" hidden>${imageIcon()}<em>图片加载失败</em></span>
      </div>
      ${renderActions(
        `<button class="btn secondary compact" data-action="mass-media-preview" data-kind="image" data-url="${escapeHtml(item.localUrl)}">预览</button>`,
        `<a class="btn secondary compact" href="${escapeHtml(item.localUrl)}" download>下载</a>`
      )}
    </article>
  `;
}

function renderVideoItem(item) {
  if (!item.localUrl) return renderUnavailableItem('视频素材暂不可用');
  return `
    <article class="mass-content-card mass-action-card">
      <div class="mass-video-thumb">
        ${item.posterUrl
          ? `<img src="${escapeHtml(item.posterUrl)}" alt="" />`
          : `<span>${videoIcon()}</span>`}
        <i>${playIcon()}</i>
      </div>
      ${renderActions(
        `<button class="btn secondary compact" data-action="mass-media-preview" data-kind="video" data-url="${escapeHtml(item.localUrl)}" data-mime="${escapeHtml(item.mimeType || 'video/mp4')}">预览</button>`,
        `<a class="btn secondary compact" href="${escapeHtml(item.localUrl)}" download>下载</a>`
      )}
    </article>
  `;
}

function renderFileItem(item) {
  if (!item.localUrl) return renderUnavailableItem('文件素材暂不可用');
  return `
    <article class="mass-content-card mass-action-card">
      <div class="mass-file-main">
        ${fileIcon(item.fileName)}
        <div class="mass-file-copy">
          <h4 title="${escapeHtml(item.fileName || '未命名文件')}">${escapeHtml(item.fileName || '未命名文件')}</h4>
          ${item.fileSize ? `<p>${escapeHtml(item.fileSize)}</p>` : ''}
        </div>
      </div>
      ${renderActions(
        `<button class="btn secondary compact" data-action="mass-file-preview">预览</button>`,
        `<a class="btn secondary compact" href="${escapeHtml(item.localUrl)}" download="${escapeHtml(item.fileName || '')}">下载</a>`
      )}
    </article>
  `;
}

function renderLinkItem(item) {
  return `
    <article class="mass-content-card mass-web-card mass-link-card">
      ${item.url ? `<a class="mass-plain-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.url)}</a>` : '<span class="muted">—</span>'}
    </article>
  `;
}

function renderMiniProgramItem(item) {
  return `
    <article class="mass-content-card mass-miniprogram-item">
      <div class="mass-miniprogram-thumb">
        ${item.coverUrl
          ? `<img src="${escapeHtml(item.coverUrl)}" alt="" onerror="this.hidden=true;this.nextElementSibling.hidden=false" /><span hidden>${miniProgramIcon()}</span>`
          : `<span>${miniProgramIcon()}</span>`}
      </div>
      <div class="mass-miniprogram-copy">
        <h4>${escapeHtml(item.title || '未命名小程序')}</h4>
        ${item.appId ? `<p><span>AppID：</span>${escapeHtml(item.appId)}</p>` : ''}
        ${item.pagePath ? `<p><span>页面路径：</span>${escapeHtml(item.pagePath)}</p>` : ''}
      </div>
    </article>
  `;
}

function renderActions(previewButton, downloadButton) {
  return `<div class="mass-card-actions">${previewButton}${downloadButton}</div>`;
}

function renderUnavailableItem(text) {
  return `<article class="mass-content-card mass-unavailable-card">${escapeHtml(text)}</article>`;
}

function renderEmptyContent() {
  return `
    <div class="mass-content-empty">
      <span>${emptyIcon()}</span>
      <p>暂无可展示的群发内容</p>
    </div>
  `;
}

function renderPreview(preview) {
  const content = preview.kind === 'video'
    ? `<video controls autoplay preload="metadata"><source src="${escapeHtml(preview.url)}" type="${escapeHtml(preview.mime || 'video/mp4')}" /></video>`
    : `<img src="${escapeHtml(preview.url)}" alt="群发图片预览" />`;
  return `
    <div class="mass-preview-mask" data-action="mass-media-preview-close">
      <button class="mass-preview-close" data-action="mass-media-preview-close" aria-label="关闭预览">×</button>
      <div class="mass-preview-stage">${content}</div>
    </div>
  `;
}

function fileIcon(fileName) {
  const extension = String(fileName || '').split('.').pop().toUpperCase().slice(0, 4);
  return `<span class="file-glyph"><i>${escapeHtml(extension || 'FILE')}</i></span>`;
}

function imageIcon() {
  return '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m5.5 17 4.5-4 3 2.5 2.5-2 3 3"/></svg>';
}

function videoIcon() {
  return '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>';
}

function playIcon() {
  return '<svg viewBox="0 0 24 24"><path d="m9 7 8 5-8 5z"/></svg>';
}

function miniProgramIcon() {
  return '<svg viewBox="0 0 24 24"><path d="M8.5 7.5a4.5 4.5 0 1 0 0 9c1.2 0 2.3-.5 3.1-1.3"/><path d="M15.5 8.5a3.5 3.5 0 1 1-2.5 6"/></svg>';
}

function emptyIcon() {
  return '<svg viewBox="0 0 24 24"><path d="M5 4.5h10l4 4V19.5H5z"/><path d="M15 4.5v4h4M8 13h8M8 16h5"/></svg>';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));
}
