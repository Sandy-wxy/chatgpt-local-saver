
# ChatGPT Local Saver

一个本地 ChatGPT 对话保存工具。

通过 Tampermonkey 抓取当前 ChatGPT 页面内容，再发送到本机 Python Flask 服务，自动保存为本地文件。

支持两种保存方式：

- Markdown
- HTML

## 功能

- 自动保存当前 ChatGPT 对话
- 右下角按钮手动保存
- 同一个对话保存到同一个文件
- 文件名使用 ChatGPT 对话标题
- 支持保存 `.md` 和 `.html`
- HTML 文件保留较好的阅读格式
- 代码块支持复制按钮
- 本地运行，不主动上传到第三方服务器

## 工作原理

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

## 项目结构

```text
chatgpt-local-saver/
├─ save_chat.py              # Markdown + HTML 保存服务
├─ save_html_only.py         # 仅保存 HTML 的服务
├─ tampermonkey.user.js      # Tampermonkey 用户脚本
├─ start.bat                 # Windows 一键启动脚本
├─ README.md
└─ .gitignore
```

## 环境要求

- Python 3
- Flask
- 浏览器
- Tampermonkey 扩展

安装 Flask：

```bash
pip install flask
```

## 使用方法

### 1. 修改保存路径

如果你使用 Obsidian，打开 `save_chat.py`，修改：

```python
vault_dir = Path("D:/Obsidian/Sandy_Knowledge_Base")
```

改成你的 Obsidian Vault 路径。

如果你不使用 Obsidian，也可以改成任意普通文件夹：

```python
vault_dir = Path("D:/ChatGPT_Saves")
```

### 2. 启动本地服务

在项目目录运行：

```bash
python save_chat.py
```

看到类似输出表示启动成功：

```text
Running on http://127.0.0.1:5000/
```

### 3. 安装 Tampermonkey 脚本

1. 浏览器安装 Tampermonkey 扩展
2. 新建用户脚本
3. 将 `tampermonkey.user.js` 内容复制进去
4. 保存并启用脚本

打开 ChatGPT 页面后，右下角会出现按钮：

```text
保存到 Obsidian
```

点击按钮即可手动保存。脚本也会在页面内容变化后自动保存。

## 保存结果

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



## 只保存 HTML

如果只想保存 HTML，可以运行：

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

可以使用 `start.bat`：

```bat
@echo off
title ChatGPT Local Saver
cd /d "%~dp0"
python save_chat.py
```

双击 `start.bat` 即可启动本地服务。

## Windows 开机自启动

1. 按 `Win + R`
2. 输入：

```text
shell:startup
```

3. 将 `start.bat` 的快捷方式放入打开的启动文件夹

之后 Windows 登录后会自动启动保存服务。

## 注意事项

- 本工具只能保存当前打开过的 ChatGPT 对话。
- 不能一次性抓取账号里的所有历史会话。
- Python 服务必须保持运行，浏览器脚本才能保存成功。
- 如果关闭 Python 服务窗口，保存会失败。
- 本工具只在本机 `127.0.0.1` 通信，不会主动上传到第三方服务器。
- ChatGPT 页面结构可能变化，若脚本失效，需要更新选择器或脚本逻辑。

## FAQ

### 为什么需要 Python 服务？

浏览器脚本不能直接随意写入本地文件。  
所以需要一个本机 Flask 服务接收内容，再写入本地文件夹。

### 如果不用 Obsidian 可以使用吗？

可以。主包最近被朋友种草了Obsidian而已，哈哈。

### HTML 文件怎么看？

直接用浏览器打开 `.html` 文件即可。




## License

MIT
