from flask import Flask, request
from pathlib import Path
from datetime import datetime
import re

app = Flask(__name__)

vault_dir = Path("D:/Obsidian/Sandy_Knowledge_Base")
vault_dir.mkdir(parents=True, exist_ok=True)


@app.route("/")
def index():
    return {
        "status": "running",
        "message": "save_chat service is running. POST to /save."
    }


def safe_filename(name):
    name = name.strip() or "未命名对话"
    name = re.sub(r'[\\/:*?"<>|]', "_", name)
    name = re.sub(r"\s+", " ", name)
    return name[:80]


def classify_topic(content):
    keywords = {
        "编程问题": ["python", "c++", "ascend", "cuda", "编译", "op_api", "bash", "g++"],
        "学习笔记": ["学习", "笔记", "教程", "知识点"],
        "日常问答": []
    }

    lower = content.lower()

    for folder, words in keywords.items():
        for word in words:
            if word.lower() in lower:
                return folder

    return "日常问答"


@app.route("/save", methods=["POST"])
def save_chat():
    data = request.json or {}

    title = data.get("title", "未命名对话")
    markdown = data.get("markdown", "")
    html = data.get("html", "")

    if not markdown.strip() and not html.strip():
        return {"status": "empty", "message": "no content"}

    folder_name = classify_topic(markdown + html)
    folder_path = vault_dir / folder_name
    folder_path.mkdir(parents=True, exist_ok=True)

    filename_base = safe_filename(title)
    md_file = folder_path / f"{filename_base}.md"
    html_file = folder_path / f"{filename_base}.html"

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if markdown.strip():
        md_content = f"""# {title}

保存时间：{now}

HTML 阅读版：[[{filename_base}.html]]

---

{markdown.strip()}
"""
        with open(md_file, "w", encoding="utf-8") as f:
            f.write(md_content)

    if html.strip():
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html)

    return {
        "status": "saved",
        "folder": folder_name,
        "markdown_file": str(md_file),
        "html_file": str(html_file),
        "title": title
    }


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
