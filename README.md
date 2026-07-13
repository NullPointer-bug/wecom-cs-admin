# 企微客服账号管理

这是一个纯静态前端原型，用于展示和管理企微客服账号、接待员工、接入信息和会话指标。

## 项目结构

```text
.
├── index.html
├── netlify.toml
└── src
    ├── app.js
    ├── components.js
    ├── mockData.js
    └── styles.css
```

## 本地启动

项目使用原生 HTML/CSS/JavaScript，不需要安装依赖。因为入口脚本使用了 ES Module，建议通过本地静态服务访问：

```powershell
python -m http.server 5173
```

打开：

```text
http://127.0.0.1:5173/
```

## 部署

当前站点部署在 Netlify：

```text
https://wecom-cs-admin-20260709-1452.netlify.app
```

手动部署到已关联的 Netlify 站点：

```powershell
netlify deploy --prod --dir . --no-build
```

## 后续开发

后续新增菜单页时，可以继续在 `src` 下扩展页面渲染、状态管理和 mock 数据。当前项目是静态原型，页面数据来自 `src/mockData.js`，暂未接入后端接口或持久化存储。
