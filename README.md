# 开发者工具箱 Dev Toolkit

一个 Chrome 浏览器扩展（Manifest V3），聚合前端开发者日常最常用的四个小工具：

- **JSON**：格式化、压缩、校验（含节点统计）
- **时间戳**：秒/毫秒自动识别，时间戳 ↔ 日期互转，含 UTC 与相对时间
- **编解码**：Base64（UTF-8 安全）、URL 编码/解码
- **取色器**：原生 `EyeDropper` 页面取色 + `<input type="color">`，HEX/RGB/HSL 实时换算

纯本地运行，**零权限、零网络请求**，不收集任何数据。

## 本地安装（开发者模式）

1. 打开 Chrome，地址栏输入 `chrome://extensions/`
2. 右上角打开「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择本目录（`dev-toolkit/`）
5. 点击工具栏的拼图图标 → 固定「开发者工具箱」即可使用

## 目录结构

```
dev-toolkit/
├── manifest.json        # MV3 配置
├── popup.html           # 弹窗结构
├── popup.css            # 样式
├── popup.js             # 逻辑（无框架、无构建）
├── icons/               # 图标（16/48/128）
└── scripts/gen-icons.mjs # 图标生成脚本（纯 Node）
```

## 技术要点

- 无框架、无构建，加载即用
- `EyeDropper` API + `input[type=color]` 双取色方案
- Base64 编码基于 `TextEncoder`，正确处理中文
- 时间戳自动识别秒/毫秒，日期解析兼容 Safari

## 上架 Chrome Web Store（可选）

需要一次性 $5 的 Google 开发者账号。注册后：

1. 将 `manifest.json`、`popup.*`、`icons/` 打成 zip
2. 在 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) 上传 zip
3. 填写商店信息、隐私说明（可声明"不收集任何数据"）、截图后提交审核

## License

MIT
