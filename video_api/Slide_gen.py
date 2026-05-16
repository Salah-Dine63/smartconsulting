import os
import json
import asyncio
from typing import Optional, List
from playwright.async_api import async_playwright
from Equation_gen import render_equation_b64, get_visual_svg, highlight_code, detect_lang
from themes import get_theme, DEFAULT_THEME


SLIDE_W  = 1920
SLIDE_H  = 1080
THUMB_W  = 1280
THUMB_H  = 720


# ─────────────────────────────────────────────────────────────────────────────
#  Shared CSS injected into every slide
# ─────────────────────────────────────────────────────────────────────────────

_BASE_CSS = f"""
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:{SLIDE_W}px; height:{SLIDE_H}px; background:#06061a;
    font-family:'Segoe UI',Arial,sans-serif; overflow:hidden; position:relative;
  }}
  .bg-mesh {{
    position:absolute; inset:0;
    background:
      radial-gradient(ellipse 900px 700px at 5% 50%,  rgba(83,74,183,0.18)  0%,transparent 65%),
      radial-gradient(ellipse 600px 500px at 95% 15%, rgba(93,202,165,0.10) 0%,transparent 65%),
      radial-gradient(ellipse 500px 400px at 70% 95%, rgba(127,119,221,0.07) 0%,transparent 65%);
  }}
  .bg-grid {{
    position:absolute; inset:0;
    background-image:
      linear-gradient(rgba(127,119,221,0.045) 1px,transparent 1px),
      linear-gradient(90deg,rgba(127,119,221,0.045) 1px,transparent 1px);
    background-size:64px 64px;
  }}
  .edge-top {{
    position:absolute; top:0; left:0; right:0; height:3px;
    background:linear-gradient(90deg,#7F77DD,#5DCAA5,#7F77DD);
    box-shadow:0 0 24px rgba(127,119,221,0.7);
  }}
  .edge-left {{
    position:absolute; left:0; top:0; bottom:0; width:3px;
    background:linear-gradient(180deg,transparent 5%,#7F77DD 35%,#5DCAA5 65%,transparent 95%);
    box-shadow:0 0 20px rgba(127,119,221,0.5);
  }}
  .ring {{
    position:absolute; border-radius:50%;
    border:1px solid rgba(127,119,221,0.09);
    opacity:0; animation:fadein .4s ease forwards;
  }}
  .r1 {{ width:700px;height:700px;top:-250px;right:-100px;animation-delay:.05s; }}
  .r2 {{ width:480px;height:480px;top:-100px;right:60px;border-color:rgba(93,202,165,0.07);animation-delay:.1s; }}
  .r3 {{ width:240px;height:240px;bottom:80px;right:260px;animation-delay:.15s; }}
  .dot-grid {{
    position:absolute; top:90px; right:70px;
    display:grid; grid-template-columns:repeat(10,1fr); gap:20px;
    opacity:0; animation:fadein .5s .2s ease forwards;
  }}
  .fdot {{ width:3px;height:3px;border-radius:50%;background:rgba(127,119,221,0.4); }}
  .fdot:nth-child(3n) {{ background:rgba(93,202,165,0.35); }}
  .fdot:nth-child(7n) {{ background:rgba(127,119,221,0.6); }}
  .tag {{
    display:inline-flex; align-items:center; gap:10px;
    background:rgba(127,119,221,0.10); border:1px solid rgba(127,119,221,0.35);
    border-radius:100px; padding:8px 26px;
    font-size:19px; color:#AFA9EC; letter-spacing:0.12em; text-transform:uppercase;
    width:fit-content; margin-bottom:26px;
    opacity:0; transform:translateY(14px); animation:slideup .4s .05s ease forwards;
  }}
  .tag-dot {{ width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#7F77DD,#5DCAA5);box-shadow:0 0 8px rgba(127,119,221,.8); }}
  .title {{
    font-size:62px; font-weight:700;
    background:linear-gradient(135deg,#ffffff 0%,#ccc9f5 55%,#5DCAA5 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    line-height:1.18; margin-bottom:20px;
    opacity:0; transform:translateY(14px); animation:slideup .4s .12s ease forwards;
  }}
  .divider {{
    width:0; height:2px;
    background:linear-gradient(90deg,#7F77DD,#5DCAA5,transparent);
    border-radius:2px; margin-bottom:36px;
    box-shadow:0 0 14px rgba(127,119,221,.45);
    animation:growline .5s .28s ease forwards;
  }}
  .cards {{ display:flex; flex-direction:column; gap:16px; }}
  .card {{
    display:flex; align-items:center; gap:26px;
    background:rgba(127,119,221,0.055);
    border:1px solid rgba(127,119,221,0.18);
    border-left:3px solid var(--lb,#7F77DD);
    border-radius:18px; padding:18px 28px;
    opacity:0; transform:translateX(36px); animation:cardin .42s ease forwards;
    box-shadow:0 6px 32px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.04);
    position:relative; overflow:hidden;
  }}
  .card::before {{
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(127,119,221,.5) 40%,rgba(93,202,165,.3) 70%,transparent);
  }}
  .badge {{
    min-width:48px; height:48px; border-radius:13px;
    display:flex; align-items:center; justify-content:center;
    font-size:19px; font-weight:700; color:#fff; flex-shrink:0;
    box-shadow:0 4px 18px rgba(127,119,221,.45); letter-spacing:.05em;
  }}
  .card-text {{ font-size:34px; color:#dddcff; line-height:1.4; }}
  .slide-num {{
    position:absolute; bottom:28px; right:56px;
    font-size:20px; color:rgba(127,119,221,.45); font-family:monospace; letter-spacing:.12em;
  }}
  .progress-dots {{
    position:absolute; bottom:34px; left:50%; transform:translateX(-50%);
    display:flex; gap:10px; opacity:0; animation:fadein .4s .6s ease forwards;
  }}
  .pdot {{
    width:8px; height:8px; border-radius:50%;
    background:rgba(127,119,221,0.2); border:1px solid rgba(127,119,221,.3);
  }}
  .pdot.active {{
    background:linear-gradient(135deg,#7F77DD,#5DCAA5);
    box-shadow:0 0 10px rgba(127,119,221,.7); width:24px; border-radius:4px;
  }}
  .progress-bar {{
    position:absolute; bottom:0; left:0; height:3px;
    background:linear-gradient(90deg,#534AB7,#7F77DD,#5DCAA5);
    box-shadow:0 0 14px rgba(127,119,221,.6);
    opacity:0; animation:fadein .4s .3s ease forwards;
  }}
  @keyframes fadein  {{ to {{ opacity:1; }} }}
  @keyframes slideup {{ to {{ opacity:1; transform:translateY(0); }} }}
  @keyframes growline {{ to {{ width:460px; }} }}
  @keyframes cardin  {{ to {{ opacity:1; transform:translateX(0); }} }}
"""

_DOTS_HTML = '<div class="fdot"></div>' * 60


# ─────────────────────────────────────────────────────────────────────────────
#  Theme injection
# ─────────────────────────────────────────────────────────────────────────────

def _apply_theme(html: str, theme_name: str) -> str:
    """Replace every hard-coded default color with the chosen theme's palette."""
    if not theme_name or theme_name == DEFAULT_THEME:
        return html

    default = get_theme(DEFAULT_THEME)
    target  = get_theme(theme_name)

    # ordered so longer/more-specific strings come first (avoids partial clashes)
    pairs = [
        (default["light_primary"],    target["light_primary"]),
        (default["card_text"],        target["card_text"]),
        (default["text_accent"],      target["text_accent"]),
        (default["text_accent_rgb"],  target["text_accent_rgb"]),
        (default["dark"],             target["dark"]),
        (default["dark_rgb"],         target["dark_rgb"]),
        (default["primary"],          target["primary"]),
        (default["primary_rgb"],      target["primary_rgb"]),
        (default["secondary"],        target["secondary"]),
        (default["secondary_rgb"],    target["secondary_rgb"]),
        (default["bg"],               target["bg"]),
        (default["bg_rgb"],           target["bg_rgb"]),
    ]
    for old, new in pairs:
        html = html.replace(old, new)
    return html


# ─────────────────────────────────────────────────────────────────────────────
#  Slide HTML builders
# ─────────────────────────────────────────────────────────────────────────────

def _tag_label(slide_num: int, total: int) -> str:
    if slide_num == 1:       return "Introduction"
    if slide_num == total:   return "Summary"
    return f"Part {slide_num - 1}"


def _badge_gradient(slide_num: int, total: int) -> str:
    if slide_num == 1:     return "linear-gradient(135deg,#7F77DD,#534AB7)"
    if slide_num == total: return "linear-gradient(135deg,#5DCAA5,#3a9e82)"
    return "linear-gradient(135deg,#7F77DD,#5DCAA5)"


def _left_border(slide_num: int, total: int) -> str:
    return "#5DCAA5" if slide_num == total else "#7F77DD"


def build_slide_html(slide: dict, total: int,
                     eq_b64_list: Optional[List[str]] = None,
                     visual_svg: str = "",
                     code_html: str = "",
                     lang: str = "python",
                     theme: str = DEFAULT_THEME) -> str:

    sn       = slide["slide_number"]
    title    = slide["title"]
    bullets  = slide["bullets"]
    progress = int((sn / total) * 100)
    tag      = _tag_label(sn, total)
    bg       = _badge_gradient(sn, total)
    lb       = _left_border(sn, total)

    has_right = bool(eq_b64_list or visual_svg or code_html)

    # ── bullet cards ──
    cards_html = ""
    for i, bullet in enumerate(bullets):
        delay = 0.35 + i * 0.12
        cards_html += f"""
        <div class="card" style="animation-delay:{delay:.2f}s;--lb:{lb}">
          <div class="badge" style="background:{bg}">{i+1:02d}</div>
          <div class="card-text">{bullet}</div>
        </div>"""

    # ── progress dots ──
    prog_dots = "".join(
        f'<div class="pdot{"  active" if i+1 == sn else ""}"></div>'
        for i in range(total)
    )

    # ── right panel (code OR equations + visual) ──
    right_panel = ""
    if has_right:
        if code_html:
            # Code block — macOS-style window
            right_panel = f"""
        <div class="right-col">
          <div class="code-panel" style="animation-delay:0.35s">
            <div class="code-header">
              <div class="dots">
                <span class="d r"></span><span class="d y"></span><span class="d g"></span>
              </div>
              <span class="lang-label">{lang}</span>
            </div>
            <pre class="code-body">{code_html}</pre>
          </div>
        </div>"""
        else:
            eq_blocks = ""
            for idx, b64 in enumerate(eq_b64_list or []):
                d = 0.40 + idx * 0.15
                eq_blocks += f'<div class="eq-box" style="animation-delay:{d:.2f}s"><img src="data:image/png;base64,{b64}" alt="eq"/></div>'
            vis_block = f'<div class="vis-box" style="animation-delay:0.65s">{visual_svg}</div>' if visual_svg else ""
            right_panel = f"""
        <div class="right-col">
          {eq_blocks}
          {vis_block}
        </div>"""

    # ── layout: single or two-column ──
    if has_right:
        layout_css = """
        .content {
          position:absolute; top:65px; left:110px; right:80px; bottom:65px;
          display:flex; flex-direction:row; align-items:center; gap:44px;
        }
        .left-col { flex:0 0 54%; display:flex; flex-direction:column; justify-content:center; }
        .right-col {
          flex:1; display:flex; flex-direction:column;
          justify-content:center; gap:22px; min-width:0;
        }
        .eq-box {
          background:rgba(127,119,221,0.06); border:1px solid rgba(127,119,221,0.22);
          border-radius:20px; padding:22px 18px;
          display:flex; justify-content:center; align-items:center;
          box-shadow:0 4px 28px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.04);
          position:relative; overflow:hidden;
          opacity:0; transform:translateX(30px); animation:cardin .45s ease forwards;
        }
        .eq-box::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(127,119,221,0.5),transparent);
        }
        .eq-box img { max-width:100%; max-height:160px; display:block; }
        .vis-box {
          background:rgba(127,119,221,0.035); border:1px solid rgba(127,119,221,0.15);
          border-radius:20px; padding:18px;
          display:flex; justify-content:center; align-items:center;
          opacity:0; transform:translateX(30px); animation:cardin .45s ease forwards;
        }
        .dot-grid { display:none; }
        /* ── code block ── */
        .code-panel {
          background:rgba(0,0,0,0.45); border:1px solid rgba(127,119,221,0.28);
          border-radius:16px; overflow:hidden;
          opacity:0; transform:translateX(30px); animation:cardin .45s ease forwards;
        }
        .code-header {
          background:rgba(127,119,221,0.08); border-bottom:1px solid rgba(127,119,221,0.18);
          padding:13px 18px; display:flex; align-items:center; gap:8px;
        }
        .dots { display:flex; gap:8px; }
        .d { width:12px; height:12px; border-radius:50%; }
        .d.r { background:#FF5F57; } .d.y { background:#FEBC2E; } .d.g { background:#28C840; }
        .lang-label { margin-left:8px; font-size:16px; color:rgba(175,169,236,0.55); font-family:monospace; }
        .code-body {
          padding:20px 24px; font-family:'Cascadia Code','Consolas','Courier New',monospace;
          font-size:22px; line-height:1.65; white-space:pre; overflow:hidden;
          color:#E0DFFF;
        }
        .kw  { color:#C792EA; }
        .str { color:#C3E88D; }
        .cm  { color:#546E7A; font-style:italic; }
        .fn  { color:#82AAFF; }
        .num { color:#F78C6C; }
        """
        content_inner = f"""
        <div class="left-col">
          <div class="tag"><div class="tag-dot"></div>{tag}</div>
          <div class="title">{title}</div>
          <div class="divider"></div>
          <div class="cards">{cards_html}</div>
        </div>
        {right_panel}"""
    else:
        layout_css = """
        .content {
          position:absolute; top:70px; left:110px; right:90px; bottom:70px;
          display:flex; flex-direction:column; justify-content:center;
        }
        """
        content_inner = f"""
        <div class="tag"><div class="tag-dot"></div>{tag}</div>
        <div class="title">{title}</div>
        <div class="divider"></div>
        <div class="cards">{cards_html}</div>"""

    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
{_BASE_CSS}
{layout_css}
</style></head>
<body>
  <div class="bg-mesh"></div><div class="bg-grid"></div>
  <div class="edge-top"></div><div class="edge-left"></div>
  <div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div>
  <div class="dot-grid">{_DOTS_HTML}</div>
  <div class="content">{content_inner}</div>
  <div class="slide-num">{sn:02d} / {total:02d}</div>
  <div class="progress-dots">{prog_dots}</div>
  <div class="progress-bar" style="width:{progress}%"></div>
</body></html>"""
    return _apply_theme(html, theme)


# ─────────────────────────────────────────────────────────────────────────────
#  Intro / Outro / Thumbnail HTML builders  (unchanged from previous version)
# ─────────────────────────────────────────────────────────────────────────────

def build_intro_html(title: str, theme: str = DEFAULT_THEME) -> str:
    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  *{{margin:0;padding:0;box-sizing:border-box;}}
  body{{width:{SLIDE_W}px;height:{SLIDE_H}px;background:#06061a;
       font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;
       display:flex;align-items:center;justify-content:center;flex-direction:column;position:relative;}}
  .bg-mesh{{position:absolute;inset:0;background:
    radial-gradient(ellipse 1100px 900px at 50% 50%,rgba(83,74,183,.22) 0%,transparent 58%),
    radial-gradient(ellipse 400px 300px at 15% 85%,rgba(93,202,165,.1) 0%,transparent 60%);}}
  .bg-grid{{position:absolute;inset:0;
    background-image:linear-gradient(rgba(127,119,221,.045) 1px,transparent 1px),
      linear-gradient(90deg,rgba(127,119,221,.045) 1px,transparent 1px);
    background-size:64px 64px;}}
  .et{{position:absolute;top:0;left:0;right:0;height:3px;
       background:linear-gradient(90deg,#7F77DD,#5DCAA5,#7F77DD);
       box-shadow:0 0 28px rgba(127,119,221,.8);}}
  .eb{{position:absolute;bottom:0;left:0;right:0;height:3px;
       background:linear-gradient(90deg,#5DCAA5,#7F77DD,#5DCAA5);
       box-shadow:0 0 28px rgba(93,202,165,.6);}}
  .label{{position:relative;z-index:1;font-size:22px;color:#5DCAA5;
          letter-spacing:.28em;text-transform:uppercase;margin-bottom:32px;
          opacity:0;animation:fadein .5s .15s ease forwards;}}
  .title{{position:relative;z-index:1;font-size:92px;font-weight:700;
          background:linear-gradient(135deg,#fff 0%,#ccc9f5 55%,#5DCAA5 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          text-align:center;max-width:1500px;line-height:1.18;
          opacity:0;transform:translateY(24px);animation:slideup .7s .3s ease forwards;}}
  .line{{position:relative;z-index:1;width:0;height:2px;margin-top:44px;
         background:linear-gradient(90deg,#7F77DD,#5DCAA5,transparent);
         border-radius:2px;box-shadow:0 0 16px rgba(127,119,221,.55);
         animation:growline .7s .55s ease forwards;}}
  @keyframes fadein{{to{{opacity:1}}}}
  @keyframes slideup{{to{{opacity:1;transform:translateY(0)}}}}
  @keyframes growline{{to{{width:700px}}}}
</style></head>
<body>
  <div class="bg-mesh"></div><div class="bg-grid"></div>
  <div class="et"></div><div class="eb"></div>
  <div class="label">Now Learning</div>
  <div class="title">{title}</div>
  <div class="line"></div>
</body></html>"""
    return _apply_theme(html, theme)


def build_outro_html(title: str, theme: str = DEFAULT_THEME) -> str:
    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  *{{margin:0;padding:0;box-sizing:border-box;}}
  body{{width:{SLIDE_W}px;height:{SLIDE_H}px;background:#06061a;
       font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;
       display:flex;align-items:center;justify-content:center;flex-direction:column;position:relative;}}
  .bg-mesh{{position:absolute;inset:0;background:
    radial-gradient(ellipse 1100px 900px at 50% 50%,rgba(93,202,165,.16) 0%,transparent 58%),
    radial-gradient(ellipse 400px 300px at 10% 90%,rgba(83,74,183,.1) 0%,transparent 60%);}}
  .bg-grid{{position:absolute;inset:0;
    background-image:linear-gradient(rgba(127,119,221,.04) 1px,transparent 1px),
      linear-gradient(90deg,rgba(127,119,221,.04) 1px,transparent 1px);
    background-size:64px 64px;}}
  .et{{position:absolute;top:0;left:0;right:0;height:3px;
       background:linear-gradient(90deg,#5DCAA5,#7F77DD,#5DCAA5);
       box-shadow:0 0 28px rgba(93,202,165,.7);}}
  .thanks{{position:relative;z-index:1;font-size:26px;color:#5DCAA5;
           letter-spacing:.2em;text-transform:uppercase;margin-bottom:36px;
           opacity:0;animation:fadein .5s .15s ease forwards;}}
  .title{{position:relative;z-index:1;font-size:82px;font-weight:700;
          background:linear-gradient(135deg,#fff 0%,#ccc9f5 60%,#5DCAA5 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          text-align:center;max-width:1400px;line-height:1.18;
          opacity:0;transform:translateY(20px);animation:slideup .6s .3s ease forwards;}}
  .line{{position:relative;z-index:1;width:0;height:2px;margin-top:40px;margin-bottom:36px;
         background:linear-gradient(90deg,#5DCAA5,#7F77DD,transparent);
         border-radius:2px;box-shadow:0 0 14px rgba(93,202,165,.45);
         animation:growline .6s .45s ease forwards;}}
  .sub{{position:relative;z-index:1;font-size:30px;color:rgba(175,169,236,.65);
        letter-spacing:.06em;opacity:0;animation:fadein .5s .6s ease forwards;}}
  @keyframes fadein{{to{{opacity:1}}}}
  @keyframes slideup{{to{{opacity:1;transform:translateY(0)}}}}
  @keyframes growline{{to{{width:600px}}}}
</style></head>
<body>
  <div class="bg-mesh"></div><div class="bg-grid"></div><div class="et"></div>
  <div class="thanks">Thank you for watching</div>
  <div class="title">{title}</div>
  <div class="line"></div>
  <div class="sub">Keep learning. Keep growing.</div>
</body></html>"""
    return _apply_theme(html, theme)


def build_thumbnail_html(title: str, slide_count: int,
                         theme: str = DEFAULT_THEME) -> str:
    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  *{{margin:0;padding:0;box-sizing:border-box;}}
  body{{width:{THUMB_W}px;height:{THUMB_H}px;background:#06061a;
       font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;position:relative;
       display:flex;align-items:center;}}
  .bg-mesh{{position:absolute;inset:0;background:
    radial-gradient(ellipse 800px 600px at 25% 50%,rgba(83,74,183,.28) 0%,transparent 55%),
    radial-gradient(ellipse 500px 400px at 85% 30%,rgba(93,202,165,.14) 0%,transparent 55%);}}
  .bg-grid{{position:absolute;inset:0;
    background-image:linear-gradient(rgba(127,119,221,.06) 1px,transparent 1px),
      linear-gradient(90deg,rgba(127,119,221,.06) 1px,transparent 1px);
    background-size:48px 48px;}}
  .el{{position:absolute;left:0;top:0;bottom:0;width:8px;
       background:linear-gradient(180deg,#7F77DD,#5DCAA5);
       box-shadow:0 0 32px rgba(127,119,221,.9);}}
  .et{{position:absolute;top:0;left:0;right:0;height:4px;
       background:linear-gradient(90deg,#7F77DD,#5DCAA5);
       box-shadow:0 0 20px rgba(127,119,221,.8);}}
  .r1{{position:absolute;width:500px;height:500px;top:-180px;right:-80px;
       border-radius:50%;border:1px solid rgba(127,119,221,.08);}}
  .content{{position:relative;z-index:1;padding:0 72px;display:flex;flex-direction:column;gap:22px;}}
  .badge{{display:inline-flex;align-items:center;gap:10px;
          background:rgba(127,119,221,.14);border:1px solid rgba(127,119,221,.38);
          border-radius:100px;padding:8px 22px;font-size:16px;color:#AFA9EC;
          letter-spacing:.12em;text-transform:uppercase;width:fit-content;}}
  .bdot{{width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,#7F77DD,#5DCAA5);
         box-shadow:0 0 8px rgba(127,119,221,.8);}}
  .title{{font-size:58px;font-weight:700;
          background:linear-gradient(135deg,#fff 0%,#ccc9f5 60%,#5DCAA5 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          line-height:1.15;max-width:960px;}}
  .meta{{font-size:20px;color:rgba(175,169,236,.55);letter-spacing:.06em;}}
</style></head>
<body>
  <div class="bg-mesh"></div><div class="bg-grid"></div>
  <div class="el"></div><div class="et"></div><div class="r1"></div>
  <div class="content">
    <div class="badge"><div class="bdot"></div>Full Lesson</div>
    <div class="title">{title}</div>
    <div class="meta">{slide_count} slides &nbsp;·&nbsp; AI-generated</div>
  </div>
</body></html>"""
    return _apply_theme(html, theme)


# ─────────────────────────────────────────────────────────────────────────────
#  Playwright rendering
# ─────────────────────────────────────────────────────────────────────────────

async def render_one(browser, slide: dict, total: int, html_dir: str,
                     output_dir: str, theme: str = DEFAULT_THEME):
    num      = slide["slide_number"]
    out_path = os.path.join(output_dir, f"slide_{num:03d}.png")

    if os.path.exists(out_path):
        print(f"  Skipping slide_{num:03d}.png (cached)")
        return

    # Code block (takes priority over equations + visual)
    raw_code  = (slide.get("code") or "").strip()
    code_html = highlight_code(raw_code) if raw_code else ""
    lang      = detect_lang(raw_code)    if raw_code else "code"

    # Equations (only rendered when no code)
    eq_b64_list = []
    if not code_html:
        for latex in slide.get("equations", []):
            b64 = render_equation_b64(latex)
            if b64:
                eq_b64_list.append(b64)

    # SVG visual (only when no code)
    visual_hint = slide.get("visual", "none")
    visual_svg  = ""
    if not code_html and visual_hint not in ("none", ""):
        visual_svg = get_visual_svg(visual_hint)

    html_content = build_slide_html(slide, total, eq_b64_list, visual_svg,
                                    code_html, lang, theme=theme)

    html_path = os.path.join(html_dir, f"slide_{num:03d}.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    page = await browser.new_page(viewport={"width": SLIDE_W, "height": SLIDE_H})
    await page.goto(f"file:///{os.path.abspath(html_path)}")
    await page.wait_for_timeout(1200)
    await page.screenshot(path=out_path, full_page=False)
    await page.close()
    print(f"  Rendered: slide_{num:03d}.png")


async def render_extra(browser, html: str, out_path: str,
                       width: int = SLIDE_W, height: int = SLIDE_H,
                       wait_ms: int = 1000):
    if os.path.exists(out_path):
        print(f"  Skipping {os.path.basename(out_path)} (cached)")
        return

    html_path = out_path.replace(".png", "_tmp.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    page = await browser.new_page(viewport={"width": width, "height": height})
    await page.goto(f"file:///{os.path.abspath(html_path)}")
    await page.wait_for_timeout(wait_ms)
    await page.screenshot(path=out_path, full_page=False)
    await page.close()
    print(f"  Rendered: {os.path.basename(out_path)}")


async def render_slides(script_path: str, output_dir: str,
                        theme: str = DEFAULT_THEME):
    with open(script_path, "r", encoding="utf-8") as f:
        script = json.load(f)

    slides = script["slides"]
    total  = len(slides)
    title  = script["title"]
    os.makedirs(output_dir, exist_ok=True)

    html_dir = os.path.join(output_dir, "_html")
    os.makedirs(html_dir, exist_ok=True)

    print(f"Rendering {total} slides + intro/outro/thumbnail for: {title}  [theme: {theme}]\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        await asyncio.gather(*[
            render_one(browser, slide, total, html_dir, output_dir, theme=theme)
            for slide in slides
        ])

        await render_extra(browser, build_intro_html(title, theme=theme),
                           os.path.join(output_dir, "intro.png"))
        await render_extra(browser, build_outro_html(title, theme=theme),
                           os.path.join(output_dir, "outro.png"))
        await render_extra(browser, build_thumbnail_html(title, total, theme=theme),
                           os.path.join(output_dir, "thumbnail.png"),
                           width=THUMB_W, height=THUMB_H, wait_ms=800)

        await browser.close()

    print(f"\nAll assets saved to: {output_dir}")


def generate_slides(
    script_path: str = "output/script.json",
    output_dir:  str = "output/slides",
    theme:       str = DEFAULT_THEME,
):
    asyncio.run(render_slides(script_path, output_dir, theme=theme))


if __name__ == "__main__":
    generate_slides()
