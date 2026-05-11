// ==UserScript==
// @name         ChatGPT Auto Save HTML Direct
// @namespace    local.chatgpt.html.direct
// @version      2.0
// @description  Auto save ChatGPT conversation directly as HTML without Flask
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let dirHandle = null;
    let button = null;
    let saveTimer = null;
    let lastSavedContent = "";
    let isSaving = false;

    const AUTO_SAVE_DELAY = 8000;

    function escapeHtml(text) {
        return (text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function safeFilename(name) {
        return (name || "未命名对话")
            .replace(/[\\/:*?"<>|]/g, "_")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 80) || "未命名对话";
    }

    function getTitle() {
        let title = document.title || "未命名对话";

        title = title
            .replace(/^ChatGPT\s*[-|—]?\s*/i, "")
            .replace(/\s*[-|—]\s*ChatGPT$/i, "")
            .trim();

        return title || "未命名对话";
    }

    function getMessageNodes() {
        const main = document.querySelector("main");
        if (!main) {
            return [];
        }

        return Array.from(main.querySelectorAll("[data-message-author-role]"));
    }

    function cloneClean(node) {
        const clone = node.cloneNode(true);

        clone.querySelectorAll(
            "button, svg, script, style, noscript, textarea, input"
        ).forEach(el => el.remove());

        clone.querySelectorAll("[contenteditable]").forEach(el => {
            el.removeAttribute("contenteditable");
        });

        clone.querySelectorAll("*").forEach(el => {
            el.removeAttribute("data-testid");
        });

        return clone;
    }

    function getCodeLanguage(pre) {
        const code = pre.querySelector("code");
        const className = code?.className || "";

        const classMatch = className.match(/language-([a-zA-Z0-9_+-]+)/);
        if (classMatch) {
            return classMatch[1];
        }

        return "code";
    }

    function prepareCodeBlocks(content, messageIndex) {
        content.querySelectorAll("pre").forEach((pre, codeIndex) => {
            if (pre.closest(".saved-code-block")) {
                return;
            }

            const wrapper = document.createElement("div");
            wrapper.className = "saved-code-block";

            const header = document.createElement("div");
            header.className = "saved-code-header";

            const lang = document.createElement("span");
            lang.textContent = getCodeLanguage(pre);

            const copy = document.createElement("button");
            copy.className = "saved-copy-btn";
            copy.textContent = "复制";
            copy.setAttribute("data-copy-target", `code-${messageIndex}-${codeIndex}`);

            const codeId = `code-${messageIndex}-${codeIndex}`;
            pre.setAttribute("id", codeId);

            header.appendChild(lang);
            header.appendChild(copy);

            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(header);
            wrapper.appendChild(pre);
        });
    }

    function buildHtmlMessage(node, index) {
        const role = node.getAttribute("data-message-author-role");
        const clone = cloneClean(node);

        const content =
            clone.querySelector(".markdown") ||
            clone.querySelector("[class*='markdown']") ||
            clone;

        prepareCodeBlocks(content, index);

        const roleName = role === "user" ? "我" : "ChatGPT";
        const roleClass = role === "user" ? "user" : "assistant";

        return `
<section class="message ${roleClass}">
  <div class="role">${roleName}</div>
  <div class="content">${content.innerHTML}</div>
</section>`;
    }

    function buildFullHtml() {
        const title = getTitle();
        const now = new Date().toLocaleString();
        const url = location.href;
        const messages = getMessageNodes();

        const body = messages.map(buildHtmlMessage).join("\n");

        return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
:root {
    color-scheme: dark;
    --bg: #171717;
    --text: #ececec;
    --muted: #a8a8a8;
    --border: #383838;
    --soft: #242424;
    --user: #303030;
    --code-bg: #0f0f0f;
    --accent: #10a37f;
}

body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
    line-height: 1.75;
}

.page {
    max-width: 920px;
    margin: 0 auto;
    padding: 36px 24px 90px;
}

.header {
    border-bottom: 1px solid var(--border);
    padding-bottom: 18px;
    margin-bottom: 28px;
}

h1 {
    margin: 0 0 10px;
    font-size: 28px;
}

.meta {
    color: var(--muted);
    font-size: 14px;
}

.message {
    margin: 30px 0;
}

.role {
    color: var(--muted);
    font-weight: 700;
    margin-bottom: 10px;
}

.message.user .content {
    background: var(--user);
    border-radius: 18px;
    padding: 14px 18px;
    max-width: 78%;
    margin-left: auto;
}

.message.assistant .content {
    border-bottom: 1px solid var(--border);
    padding-bottom: 24px;
}

p {
    margin: 0 0 14px;
}

ul,
ol {
    padding-left: 1.5em;
}

li {
    margin: 6px 0;
}

code {
    font-family: Consolas, "JetBrains Mono", "Fira Code", monospace;
    background: var(--soft);
    border-radius: 5px;
    padding: 2px 5px;
}

.saved-code-block {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    margin: 16px 0;
}

.saved-code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #212121;
    color: var(--muted);
    font-size: 13px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
}

.saved-copy-btn {
    border: 1px solid var(--border);
    background: #2b2b2b;
    color: var(--text);
    border-radius: 6px;
    padding: 3px 10px;
    cursor: pointer;
}

.saved-copy-btn:hover {
    background: var(--accent);
    color: #fff;
}

pre {
    margin: 0;
    padding: 16px;
    overflow-x: auto;
    white-space: pre;
    tab-size: 4;
}

pre code {
    display: block;
    background: transparent !important;
    padding: 0 !important;
    border-radius: 0;
    white-space: pre !important;
    font-size: 14px;
    line-height: 1.65;
}

pre code * {
    white-space: pre !important;
}

a {
    color: #7ab7ff;
}

blockquote {
    border-left: 3px solid var(--border);
    margin: 14px 0;
    padding-left: 14px;
    color: var(--muted);
}

hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 26px 0;
}

img {
    max-width: 100%;
    border-radius: 10px;
}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">保存时间：${escapeHtml(now)}</div>
    <div class="meta">来源：<a href="${escapeHtml(url)}">${escapeHtml(url)}</a></div>
  </div>
  ${body}
</div>
<script>
document.addEventListener("click", async function (event) {
    const btn = event.target.closest(".saved-copy-btn");
    if (!btn) return;

    const id = btn.getAttribute("data-copy-target");
    const code = document.getElementById(id);
    if (!code) return;

    await navigator.clipboard.writeText(code.innerText);
    btn.textContent = "已复制";

    setTimeout(function () {
        btn.textContent = "复制";
    }, 1200);
});
</script>
</body>
</html>`;
    }

    function setButton(text, color) {
        if (!button) {
            return;
        }

        button.textContent = text;
        button.style.background = color;
    }

    async function chooseFolder() {
        if (!window.showDirectoryPicker) {
            alert("当前浏览器不支持 File System Access API。请使用 Chrome 或 Edge。");
            return false;
        }

        try {
            dirHandle = await window.showDirectoryPicker({
                mode: "readwrite",
                id: "chatgpt-html-saver"
            });

            setButton("保存 HTML", "#10a37f");
            alert("文件夹选择成功。之后会自动保存，也可以手动点击按钮保存。");

            await saveHtml(true);

            return true;
        } catch (error) {
            console.error(error);
            alert("你取消了文件夹选择，或浏览器拒绝了权限。");
            return false;
        }
    }

    async function saveHtml(manual = false) {
        if (isSaving) {
            return;
        }

        if (!dirHandle) {
            if (manual) {
                await chooseFolder();
            }
            return;
        }

        try {
            const title = getTitle();
            const filename = safeFilename(title) + ".html";
            const html = buildFullHtml();

            if (!manual && html === lastSavedContent) {
                return;
            }

            isSaving = true;
            setButton("保存中...", "#64748b");

            const fileHandle = await dirHandle.getFileHandle(filename, {
                create: true
            });

            const writable = await fileHandle.createWritable();
            await writable.write(html);
            await writable.close();

            lastSavedContent = html;

            setButton("已保存", "#16a34a");

            setTimeout(() => {
                setButton("保存 HTML", "#10a37f");
            }, 1500);
        } catch (error) {
            console.error(error);

            dirHandle = null;
            setButton("重新选择文件夹", "#dc2626");

            if (manual) {
                alert("保存失败。可能是浏览器权限失效，请重新选择文件夹。");
            }
        } finally {
            isSaving = false;
        }
    }

    function scheduleAutoSave() {
        if (!dirHandle) {
            return;
        }

        clearTimeout(saveTimer);

        saveTimer = setTimeout(() => {
            saveHtml(false);
        }, AUTO_SAVE_DELAY);
    }

    function createButton() {
        if (button) {
            return;
        }

        button = document.createElement("button");
        button.textContent = "选择保存文件夹";

        Object.assign(button.style, {
            position: "fixed",
            right: "20px",
            bottom: "20px",
            zIndex: "999999",
            padding: "10px 14px",
            border: "none",
            borderRadius: "8px",
            background: "#64748b",
            color: "#ffffff",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.18)"
        });

        button.onclick = () => saveHtml(true);

        document.body.appendChild(button);
    }

    function startObserver() {
        const observer = new MutationObserver(() => {
            scheduleAutoSave();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function start() {
        createButton();
        startObserver();

        console.log("ChatGPT direct HTML auto saver started.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
