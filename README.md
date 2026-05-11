
# ChatGPT Local Saver

一个本地 ChatGPT 对话保存工具。

通过 Tampermonkey 抓取当前 ChatGPT 页面内容，把当前 ChatGPT 对话保存为本地文件。

本项目提供两种方式：

- 免 Python 版本：直接保存 HTML，适合新手和轻量使用
- Flask 版本：保存 Markdown + HTML，适合配合 Obsidian 做长期归档


## 推荐：免 Python 版本

如果你只是想把 ChatGPT 对话保存成 HTML，推荐使用 `tampermonkey-file-access.user.js`。

这个版本使用浏览器的 File System Access API，不需要 Python，不需要 Flask，也不需要启动本地服务。

感谢 syzgg 的指点。

### 特点

- 不需要运行 Python 服务
- 第一次使用时选择一个本地保存文件夹
- 之后点击按钮即可把当前 ChatGPT 对话保存为 `.html`
- 保存的 HTML 文件可以直接用浏览器打开


### 使用步骤

1. 使用 Chrome 或 Edge 浏览器。
2. 安装 Tampermonkey 扩展。
3. 新建用户脚本。
4. 将 `tampermonkey-file-access.user.js` 的内容复制进去并保存。
5. 打开或刷新 ChatGPT 页面。
6. 点击右下角的 `选择保存文件夹`。
7. 选择一个本地文件夹。
8. 之后点击 `保存 HTML`，即可保存当前对话。

### 注意事项

- File System Access API 主要支持 Chrome / Edge。
- Firefox / Safari 可能无法使用。
- 第一次选择文件夹必须由用户点击触发。
- 浏览器可能在清理缓存、切换站点权限或重启后要求重新选择文件夹。
- 这个版本只保存当前打开的 ChatGPT 对话，不能一次性导出所有历史对话。

## 进阶：Flask 版本

Flask 版本适合想同时保存 Markdown 和 HTML 的用户，尤其适合配合 Obsidian 做长期归档。

工作原理：

```text
ChatGPT 网页
    ↓
Tampermonkey 用户脚本
    ↓
http://127.0.0.1:5000/save
    ↓
Python Flask 本地服务
    ↓
保存为 Markdown / HTML 文件
```

### 环境要求

- Python 3
- Flask
- 浏览器
- Tampermonkey 扩展

安装 Flask：

```bash
pip install flask
```

### 使用方法

#### 1. 修改保存路径

如果你使用 Obsidian，打开 `save_chat.py`，修改：

```python
vault_dir = Path("D:/Obsidian/Sandy_Knowledge_Base")
```

改成你的 Obsidian Vault 路径。

如果你不使用 Obsidian，也可以改成任意普通文件夹：

```python
vault_dir = Path("D:/ChatGPT_Saves")
```

#### 2. 启动本地服务

在项目目录运行：

```bash
python save_chat.py
```

看到类似输出表示启动成功：

```text
Running on http://127.0.0.1:5000/
```

#### 3. 安装 Tampermonkey 脚本

1. 浏览器安装 Tampermonkey 扩展。
2. 新建用户脚本。
3. 将 `tampermonkey.user.js` 内容复制进去。
4. 保存并启用脚本。

打开 ChatGPT 页面后，右下角会出现按钮：

```text
保存到 Obsidian
```

点击按钮即可手动保存。脚本也会在页面内容变化后自动保存。

### 保存结果

默认会在保存目录下生成：

```text
对话标题.md
对话标题.html
```

示例：

```text
D:/Obsidian/Sandy_Knowledge_Base/编程问题/路径与权限问题.md
D:/Obsidian/Sandy_Knowledge_Base/编程问题/路径与权限问题.html
```

### 只保存 HTML

如果只想在 Flask 方案中保存 HTML，可以运行：

```bash
python save_html_only.py
```

默认保存目录为：

```text
D:/ChatGPT_HTML_Saves
```

可以在 `save_html_only.py` 中修改：

```python
save_dir = Path("D:/ChatGPT_HTML_Saves")
```

Tampermonkey 脚本不需要修改，因为它已经会发送 HTML 内容。



## Windows 一键启动

Flask 版本可以使用 `start.bat` 一键启动：

```bat
@echo off
title ChatGPT Local Saver
cd /d "%~dp0"
python save_chat.py
```

双击 `start.bat` 即可启动本地服务。

## Windows 开机自启动

如果使用 Flask 版本，可以设置开机自启动：

1. 按 `Win + R`。
2. 输入：

```text
shell:startup
```

3. 将 `start.bat` 的快捷方式放入打开的启动文件夹。

之后 Windows 登录后会自动启动保存服务。

## 注意事项

- 本工具只能保存当前打开过的 ChatGPT 对话。
- 不能一次性抓取账号里的所有历史会话。
- File System Access API 版本主要支持 Chrome / Edge。
- Flask 版本需要 Python 服务保持运行。
- 如果关闭 Python 服务窗口，Flask 版本会保存失败。
- ChatGPT 页面结构可能变化，若脚本失效，需要更新选择器或脚本逻辑。


## 常见问题

### 推荐新手用哪个版本？

推荐使用 `tampermonkey-file-access.user.js`。

它不需要 Python，也不需要启动本地服务，直接选择文件夹后就能保存 HTML。

### 为什么还保留 Flask 版本？

Flask 版本更适合长期归档，尤其是配合 Obsidian 使用时，可以同时保存 Markdown 和 HTML。

### 如果不用 Obsidian 可以使用吗？

可以。

Flask 版本不依赖 Obsidian，本质上只是把 Markdown 和 HTML 文件保存到普通文件夹。

主包只是最近被朋友种草了Obsidian而已，哈哈。

### HTML 文件怎么看？

直接用浏览器打开 `.html` 文件即可。

### 会上传我的聊天记录吗？

不会。

File System Access API 版本会把内容写入你选择的本地文件夹。  
Flask 版本只会把内容发送到本机：

```text
http://127.0.0.1:5000/save
```

然后保存到你设置的本地目录。

## License

MIT
