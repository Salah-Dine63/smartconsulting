"""
Equation_gen.py
  render_equation_b64(latex) -> base64 PNG via matplotlib (math slides)
  highlight_code(code)       -> HTML with syntax coloring
  detect_lang(code)          -> language string
  get_visual_svg(hint)       -> inline SVG for 12 topic types
"""

import math
import io
import base64
from typing import Optional

# ── matplotlib (optional) ───────────────────────────────────────────────────
try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib as mpl
    mpl.rcParams["mathtext.fontset"] = "cm"
    MATPLOTLIB_OK = True
except ImportError:
    MATPLOTLIB_OK = False


# ════════════════════════════════════════════════════════════════════════════
#  EQUATION RENDERING
# ════════════════════════════════════════════════════════════════════════════

def render_equation_b64(latex: str, fontsize: int = 42) -> Optional[str]:
    if not MATPLOTLIB_OK:
        return None
    try:
        fig, ax = plt.subplots(figsize=(9, 2.4))
        fig.patch.set_alpha(0.0)
        ax.patch.set_alpha(0.0)
        ax.axis("off")
        ax.text(0.5, 0.5, f"$\\displaystyle {latex}$",
                fontsize=fontsize, color="#E0DFFF",
                ha="center", va="center", transform=ax.transAxes)
        buf = io.BytesIO()
        fig.savefig(buf, format="png", transparent=True,
                    bbox_inches="tight", dpi=150, facecolor="none", pad_inches=0.15)
        plt.close(fig)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")
    except Exception:
        plt.close("all")
        return None


# ════════════════════════════════════════════════════════════════════════════
#  CODE SYNTAX HIGHLIGHTING
# ════════════════════════════════════════════════════════════════════════════

_KW = {
    "python": {
        "def","class","if","else","elif","for","while","return","import",
        "from","as","with","in","not","and","or","True","False","None",
        "lambda","yield","try","except","finally","raise","pass","break",
        "continue","global","nonlocal","del","assert","is","print","self",
    },
    "js": {
        "function","const","let","var","if","else","for","while","return",
        "class","import","export","from","new","this","true","false","null",
        "undefined","async","await","typeof","instanceof","switch","case",
        "default","break","continue","throw","try","catch","finally",
    },
    "java": {
        "public","private","protected","class","interface","extends","implements",
        "new","return","if","else","for","while","do","switch","case","default",
        "break","continue","void","int","double","float","boolean","String",
        "static","final","this","super","import","package","null","true","false",
    },
    "cpp": {
        "int","double","float","char","bool","void","string","auto","const",
        "return","if","else","for","while","do","class","struct","namespace",
        "using","include","new","delete","public","private","protected",
        "true","false","nullptr","this","virtual","override",
    },
}
_KW["javascript"] = _KW["js"]
_KW["c++"]        = _KW["cpp"]


def detect_lang(code: str) -> str:
    if any(k in code for k in ("def ", "import ", "elif ", "print(", "None")):
        return "python"
    if any(k in code for k in ("function ", "const ", "let ", "var ", "=>")):
        return "js"
    if any(k in code for k in ("public class", "System.out", "void main")):
        return "java"
    if any(k in code for k in ("#include", "cout ", "std::", "::")):
        return "cpp"
    return "python"


def _esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def highlight_code(code: str) -> str:
    """Returns HTML string with <span> syntax coloring."""
    lang = detect_lang(code)
    kws  = _KW.get(lang, _KW["python"])

    html_lines = []
    for raw in code.split("\n"):
        result = ""
        i = 0
        while i < len(raw):
            c = raw[i]

            # Comment  —  # for Python/JS,  // for C++/Java
            if c == "#" or (c == "/" and i+1 < len(raw) and raw[i+1] == "/"):
                result += f'<span class="cm">{_esc(raw[i:])}</span>'
                break

            # String (single or double quote, with escape handling)
            if c in ('"', "'"):
                q = c; j = i + 1
                while j < len(raw):
                    if raw[j] == "\\" : j += 2; continue
                    if raw[j] == q:     j += 1; break
                    j += 1
                result += f'<span class="str">{_esc(raw[i:j])}</span>'
                i = j; continue

            # Word (keyword / builtin / identifier / function-call)
            if c.isalpha() or c == "_":
                j = i
                while j < len(raw) and (raw[j].isalnum() or raw[j] == "_"):
                    j += 1
                word  = raw[i:j]
                after = raw[j] if j < len(raw) else ""
                if after == "(":
                    result += f'<span class="fn">{_esc(word)}</span>'
                elif word in kws:
                    result += f'<span class="kw">{_esc(word)}</span>'
                else:
                    result += _esc(word)
                i = j; continue

            # Number
            if c.isdigit() or (c == "." and i+1 < len(raw) and raw[i+1].isdigit()):
                j = i
                while j < len(raw) and (raw[j].isdigit() or raw[j] in ".xXabcdefABCDEF"):
                    j += 1
                result += f'<span class="num">{_esc(raw[i:j])}</span>'
                i = j; continue

            result += _esc(c)
            i += 1

        html_lines.append(result)
    return "\n".join(html_lines)


# ════════════════════════════════════════════════════════════════════════════
#  SVG VISUALS  (12 types)
# ════════════════════════════════════════════════════════════════════════════

_ANIM = "<defs><style>@keyframes fi{to{opacity:1}} @keyframes si{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}} @keyframes ri{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}</style></defs>"


# ── 1. Matrix ───────────────────────────────────────────────────────────────
def _matrix_svg() -> str:
    rows, cols = 3, 3
    cw, ch     = 74, 62
    px, py     = 44, 38
    W = cols * cw + px * 2 + 52
    H = rows * ch + py * 2

    labels = [["a₁₁","a₁₂","a₁₃"],["a₂₁","a₂₂","a₂₃"],["a₃₁","a₃₂","a₃₃"]]
    cells, d = "", 0.15
    for r in range(rows):
        for c in range(cols):
            x, y = px + 26 + c * cw, py + r * ch
            cells += (f'<g style="opacity:0;animation:fi .4s {d:.2f}s ease forwards">'
                      f'<rect x="{x}" y="{y}" width="{cw-8}" height="{ch-8}" rx="9" '
                      f'fill="rgba(127,119,221,0.08)" stroke="rgba(127,119,221,0.28)" stroke-width="1"/>'
                      f'<text x="{x+(cw-8)//2}" y="{y+(ch-8)//2+9}" text-anchor="middle" '
                      f'fill="#AFA9EC" font-family="Segoe UI,Arial" font-size="21">{labels[r][c]}</text>'
                      f'</g>')
            d += 0.07

    bh, by_, lx = rows * ch + 8, py - 4, px + 2
    rx_ = px + 26 + cols * cw + 4
    bs  = "fill:none;stroke:#7F77DD;stroke-width:3;stroke-linecap:round;opacity:0;animation:fi .4s .08s ease forwards"
    lb  = f'<path d="M{lx+14},{by_} L{lx},{by_} L{lx},{by_+bh} L{lx+14},{by_+bh}" style="{bs}"/>'
    rb  = f'<path d="M{rx_},{by_} L{rx_+14},{by_} L{rx_+14},{by_+bh} L{rx_},{by_+bh}" style="{bs}"/>'

    return f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">{_ANIM}{lb}{rb}{cells}</svg>'


# ── 2. Vector space ─────────────────────────────────────────────────────────
def _vector_svg() -> str:
    S = 320; cx = cy = S // 2; al = 118
    grid = "".join(
        f'<circle cx="{cx+gx*38}" cy="{cy-gy*38}" r="2" fill="rgba(127,119,221,0.14)"/>'
        for gx in range(-3, 4) for gy in range(-3, 4)
    )
    axes = (f'<line x1="{cx-al}" y1="{cy}" x2="{cx+al}" y2="{cy}" stroke="rgba(127,119,221,0.28)" stroke-width="1.5"/>'
            f'<line x1="{cx}" y1="{cy+al}" x2="{cx}" y2="{cy-al}" stroke="rgba(127,119,221,0.28)" stroke-width="1.5"/>'
            f'<polygon points="{cx+al},{cy} {cx+al-9},{cy-4} {cx+al-9},{cy+4}" fill="rgba(127,119,221,0.4)"/>'
            f'<polygon points="{cx},{cy-al} {cx-4},{cy-al+9} {cx+4},{cy-al+9}" fill="rgba(127,119,221,0.4)"/>'
            f'<text x="{cx+al+6}" y="{cy+5}" fill="rgba(127,119,221,0.55)" font-size="19" font-family="Segoe UI">x</text>'
            f'<text x="{cx+6}" y="{cy-al-4}" fill="rgba(127,119,221,0.55)" font-size="19" font-family="Segoe UI">y</text>')
    arrows = ""
    for vx, vy, color, lbl, d in [(88,-76,"#7F77DD","v₁",0.25),(68,62,"#5DCAA5","v₂",0.42),(-52,-46,"#AFA9EC","v₃",0.60)]:
        ex, ey = cx + vx, cy + vy
        arrows += (f'<g style="opacity:0;animation:si .5s {d}s ease forwards">'
                   f'<line x1="{cx}" y1="{cy}" x2="{ex}" y2="{ey}" stroke="{color}" stroke-width="2.5" stroke-linecap="round"/>'
                   f'<circle cx="{ex}" cy="{ey}" r="5" fill="{color}"/>'
                   f'<text x="{ex+8}" y="{ey-4}" fill="{color}" font-size="19" font-family="Segoe UI">{lbl}</text></g>')
    return (f'<svg width="{S}" height="{S}" xmlns="http://www.w3.org/2000/svg">'
            f'{_ANIM}{grid}{axes}{arrows}</svg>')


# ── 3. Function graph ────────────────────────────────────────────────────────
def _graph_svg() -> str:
    W, H = 340, 280; cx, cy = W // 2, H // 2 + 20; sx, sy = 38, 28
    pts   = " L ".join(f"{cx+i*sx},{cy-(i*i)*sy//4}" for i in range(-4, 5))
    axes  = (f'<line x1="24" y1="{cy}" x2="{W-16}" y2="{cy}" stroke="rgba(127,119,221,0.28)" stroke-width="1.5"/>'
             f'<line x1="{cx}" y1="{H-16}" x2="{cx}" y2="18" stroke="rgba(127,119,221,0.28)" stroke-width="1.5"/>'
             f'<text x="{W-12}" y="{cy+5}" fill="rgba(127,119,221,0.5)" font-size="18" font-family="Segoe UI">x</text>'
             f'<text x="{cx+6}" y="16" fill="rgba(127,119,221,0.5)" font-size="18" font-family="Segoe UI">y</text>')
    curve = (f'<path d="M {pts}" fill="none" stroke="#7F77DD" stroke-width="3"'
             f' stroke-linecap="round" stroke-linejoin="round"'
             f' style="opacity:0;animation:fi .9s .2s ease forwards"/>'
             f'<text x="{cx+sx*3+6}" y="{cy-(9*sy//4)-8}" fill="#AFA9EC" font-size="20" font-family="Segoe UI"'
             f' style="opacity:0;animation:fi .5s .8s ease forwards">f(x) = x²</text>')
    return f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">{_ANIM}{axes}{curve}</svg>'


# ── 4. Formula decoration ────────────────────────────────────────────────────
def _formula_svg() -> str:
    return ('<svg width="320" height="260" xmlns="http://www.w3.org/2000/svg">'
            + _ANIM +
            '<defs><radialGradient id="rg" cx="50%" cy="50%" r="50%">'
            '<stop offset="0%" stop-color="rgba(127,119,221,0.18)"/>'
            '<stop offset="100%" stop-color="rgba(127,119,221,0)"/>'
            '</radialGradient></defs>'
            '<circle cx="160" cy="130" r="110" fill="url(#rg)" style="opacity:0;animation:fi .5s .1s ease forwards"/>'
            '<circle cx="160" cy="130" r="95"  fill="none" stroke="rgba(127,119,221,0.14)" stroke-width="1" style="opacity:0;animation:fi .5s .2s ease forwards"/>'
            '<circle cx="160" cy="130" r="68"  fill="none" stroke="rgba(93,202,165,0.11)"  stroke-width="1" style="opacity:0;animation:fi .5s .3s ease forwards"/>'
            '<circle cx="160" cy="130" r="40"  fill="none" stroke="rgba(127,119,221,0.2)"  stroke-width="1" style="opacity:0;animation:fi .5s .4s ease forwards"/>'
            '</svg>')


# ── 5. Neural network ────────────────────────────────────────────────────────
def _neural_svg() -> str:
    W, H = 380, 310
    layers = [(58, [70,148,226]), (190, [48,116,184,252]), (322, [118,212])]
    colors = ["#7F77DD", "#5DCAA5", "#AFA9EC"]

    lines = ""
    for i in range(len(layers) - 1):
        x1, ys1 = layers[i]; x2, ys2 = layers[i+1]
        for y1 in ys1:
            for y2 in ys2:
                lines += (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"'
                          f' stroke="rgba(127,119,221,0.18)" stroke-width="1.2"/>')

    nodes, d = "", 0.10
    for li, (x, ys) in enumerate(layers):
        col = colors[li]
        for y in ys:
            nodes += (f'<circle cx="{x}" cy="{y}" r="14"'
                      f' fill="rgba(127,119,221,0.10)" stroke="{col}" stroke-width="2"'
                      f' style="opacity:0;animation:fi .4s {d:.2f}s ease forwards"/>')
            d += 0.06

    lbls = "".join(
        f'<text x="{x}" y="282" text-anchor="middle" fill="rgba(175,169,236,0.5)"'
        f' font-size="15" font-family="Segoe UI,Arial">{lbl}</text>'
        for (x, _), lbl in zip(layers, ["Input", "Hidden", "Output"])
    )
    return f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">{_ANIM}{lines}{nodes}{lbls}</svg>'


# ── 6. Bar chart ─────────────────────────────────────────────────────────────
def _chart_svg() -> str:
    W, H   = 360, 280
    base_y = H - 44
    bars   = [(48,130,"#7F77DD"),(100,190,"#5DCAA5"),(152,95,"#AFA9EC"),
              (204,210,"#7F77DD"),(256,158,"#5DCAA5")]
    rects  = ""
    for idx, (x, h, color) in enumerate(bars):
        d = 0.12 + idx * 0.10
        rects += (f'<rect x="{x}" y="{base_y-h}" width="40" height="{h}" rx="7"'
                  f' fill="{color}" fill-opacity=".82"'
                  f' style="opacity:0;transform:translateY(12px);animation:ri .45s {d:.2f}s ease forwards"/>')
    axes = (f'<line x1="32" y1="10" x2="32" y2="{base_y}" stroke="rgba(127,119,221,0.28)" stroke-width="1.5"/>'
            f'<line x1="32" y1="{base_y}" x2="{W-10}" y2="{base_y}" stroke="rgba(127,119,221,0.28)" stroke-width="1.5"/>')
    return f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">{_ANIM}{axes}{rects}</svg>'


# ── 7. Finance / line chart ──────────────────────────────────────────────────
def _finance_svg() -> str:
    W, H = 380, 270
    # Stock-like points — general upward trend (lower y = higher visually)
    raw  = [210,220,200,215,190,205,175,185,160,170,148,162,140,152,128]
    xs   = [int(20 + i * (W - 40) / (len(raw)-1)) for i in range(len(raw))]
    pts  = " L ".join(f"{x},{y}" for x, y in zip(xs, raw))
    # Trend line (first to last point)
    trend = f'<line x1="{xs[0]}" y1="{raw[0]}" x2="{xs[-1]}" y2="{raw[-1]}" stroke="rgba(93,202,165,0.5)" stroke-width="1.5" stroke-dasharray="6,4" style="opacity:0;animation:fi .5s .6s ease forwards"/>'
    # Fill area under curve
    fill_pts = f"M {xs[0]},{H-20} L " + pts + f" L {xs[-1]},{H-20} Z"
    fill = f'<path d="{fill_pts}" fill="rgba(127,119,221,0.06)" style="opacity:0;animation:fi .6s .1s ease forwards"/>'
    line = (f'<path d="M {pts}" fill="none" stroke="#7F77DD" stroke-width="2.5"'
            f' stroke-linecap="round" style="opacity:0;animation:fi .7s .2s ease forwards"/>')
    dot  = f'<circle cx="{xs[-1]}" cy="{raw[-1]}" r="5" fill="#5DCAA5" style="opacity:0;animation:fi .4s .8s ease forwards"/>'
    axes = (f'<line x1="16" y1="{H-20}" x2="{W-10}" y2="{H-20}" stroke="rgba(127,119,221,0.25)" stroke-width="1.5"/>'
            f'<text x="{xs[-1]+8}" y="{raw[-1]+5}" fill="#5DCAA5" font-size="16" font-family="Segoe UI" style="opacity:0;animation:fi .4s .9s ease forwards">▲</text>')
    return f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">{_ANIM}{fill}{line}{trend}{dot}{axes}</svg>'


# ── 8. Physics wave ──────────────────────────────────────────────────────────
def _wave_svg() -> str:
    W, H  = 380, 260
    cy    = H // 2
    amp   = 70
    freq  = 2.0
    pts   = " L ".join(
        f"{int(10 + i * (W-20) / 199)},{int(cy - amp * math.sin(freq * math.pi * i / 99))}"
        for i in range(200)
    )
    wave   = (f'<path d="M {pts}" fill="none" stroke="#7F77DD" stroke-width="3"'
              f' stroke-linecap="round" style="opacity:0;animation:fi .9s .2s ease forwards"/>')
    axis   = (f'<line x1="10" y1="{cy}" x2="{W-10}" y2="{cy}"'
              f' stroke="rgba(127,119,221,0.25)" stroke-width="1.5"/>')
    # Amplitude annotation
    xm   = W // 4
    ann_a = (f'<line x1="{xm}" y1="{cy}" x2="{xm}" y2="{cy-amp}"'
             f' stroke="rgba(93,202,165,0.5)" stroke-width="1.5" stroke-dasharray="4,3"'
             f' style="opacity:0;animation:fi .5s .7s ease forwards"/>'
             f'<text x="{xm+6}" y="{cy-amp//2}" fill="#5DCAA5" font-size="18" font-family="Segoe UI"'
             f' style="opacity:0;animation:fi .5s .8s ease forwards">A</text>')
    # Wavelength annotation
    lam_x1, lam_x2 = int(W*0.12), int(W*0.12 + (W-20)/freq)
    ann_l = (f'<line x1="{lam_x1}" y1="{cy+amp+18}" x2="{lam_x2}" y2="{cy+amp+18}"'
             f' stroke="rgba(175,169,236,0.45)" stroke-width="1.5"'
             f' style="opacity:0;animation:fi .5s .9s ease forwards"/>'
             f'<text x="{(lam_x1+lam_x2)//2-8}" y="{cy+amp+36}" fill="rgba(175,169,236,0.7)"'
             f' font-size="18" font-family="Segoe UI"'
             f' style="opacity:0;animation:fi .5s 1s ease forwards">λ</text>')
    return f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">{_ANIM}{axis}{wave}{ann_a}{ann_l}</svg>'


# ── 9. Binary / decision tree ────────────────────────────────────────────────
def _tree_svg() -> str:
    W, H = 380, 300
    nodes_pos = [
        (190, 36),
        (100, 118), (280, 118),
        (55, 200), (145, 200), (235, 200), (325, 200),
    ]
    edges = [(0,1),(0,2),(1,3),(1,4),(2,5),(2,6)]
    colors = ["#7F77DD","#5DCAA5","#5DCAA5","#AFA9EC","#AFA9EC","#AFA9EC","#AFA9EC"]

    edge_svg = ""
    for i, (a, b) in enumerate(edges):
        x1,y1 = nodes_pos[a]; x2,y2 = nodes_pos[b]
        edge_svg += (f'<line x1="{x1}" y1="{y1+14}" x2="{x2}" y2="{y2-14}"'
                     f' stroke="rgba(127,119,221,0.25)" stroke-width="1.5"'
                     f' style="opacity:0;animation:fi .4s {0.05+i*0.06:.2f}s ease forwards"/>')

    node_svg = ""
    for i, (x, y) in enumerate(nodes_pos):
        d = 0.20 + i * 0.07
        node_svg += (f'<circle cx="{x}" cy="{y}" r="14"'
                     f' fill="rgba(127,119,221,0.10)" stroke="{colors[i]}" stroke-width="2"'
                     f' style="opacity:0;animation:fi .4s {d:.2f}s ease forwards"/>')

    return f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">{_ANIM}{edge_svg}{node_svg}</svg>'


# ── 10. Process flowchart ────────────────────────────────────────────────────
def _flow_svg() -> str:
    W, H  = 380, 240
    steps = [("Input", 40), ("Process", 155), ("Output", 270)]
    rects = ""
    arrows = ""
    for i, (lbl, x) in enumerate(steps):
        d = 0.10 + i * 0.18
        color = ["#7F77DD","#5DCAA5","#AFA9EC"][i]
        rects += (f'<g style="opacity:0;animation:fi .4s {d:.2f}s ease forwards">'
                  f'<rect x="{x}" y="95" width="90" height="50" rx="12"'
                  f' fill="rgba(127,119,221,0.08)" stroke="{color}" stroke-width="1.8"/>'
                  f'<text x="{x+45}" y="125" text-anchor="middle" fill="{color}"'
                  f' font-size="20" font-family="Segoe UI,Arial">{lbl}</text>'
                  f'</g>')
        if i < len(steps) - 1:
            ax1 = x + 90; ax2 = steps[i+1][1]
            ad  = d + 0.15
            arrows += (f'<g style="opacity:0;animation:fi .4s {ad:.2f}s ease forwards">'
                       f'<line x1="{ax1}" y1="120" x2="{ax2}" y2="120"'
                       f' stroke="rgba(127,119,221,0.4)" stroke-width="1.8"/>'
                       f'<polygon points="{ax2},{120} {ax2-10},{115} {ax2-10},{125}"'
                       f' fill="rgba(127,119,221,0.5)"/>'
                       f'</g>')
    return f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">{_ANIM}{arrows}{rects}</svg>'


# ── 11. Signal / square wave (engineering) ───────────────────────────────────
def _signal_svg() -> str:
    W, H  = 380, 240
    cy    = H // 2
    hi    = cy - 70
    lo    = cy + 30
    periods = [(30,110),(110,190),(190,270),(270,350)]
    path_d  = f"M 20,{lo} L 20,{lo}"

    for lx, rx in periods:
        mid = (lx + rx) // 2
        path_d += f" L {lx},{lo} L {lx},{hi} L {mid},{hi} L {mid},{lo} L {rx},{lo}"
    path_d += f" L {W-20},{lo}"

    wave   = (f'<path d="{path_d}" fill="none" stroke="#7F77DD" stroke-width="3"'
              f' stroke-linecap="square" style="opacity:0;animation:fi .8s .2s ease forwards"/>')
    axis   = (f'<line x1="16" y1="{lo}" x2="{W-10}" y2="{lo}"'
              f' stroke="rgba(127,119,221,0.22)" stroke-width="1.5"/>')
    labels = (f'<text x="8" y="{hi+5}" fill="rgba(93,202,165,0.6)" font-size="17" font-family="Segoe UI" style="opacity:0;animation:fi .4s .7s ease forwards">1</text>'
              f'<text x="8" y="{lo+5}" fill="rgba(175,169,236,0.5)" font-size="17" font-family="Segoe UI" style="opacity:0;animation:fi .4s .8s ease forwards">0</text>')
    return f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">{_ANIM}{axis}{wave}{labels}</svg>'


# ── 12. AI / brain concept ───────────────────────────────────────────────────
def _brain_svg() -> str:
    """Stylized connected node cluster suggesting AI cognition."""
    W, H = 360, 300
    nodes = [
        (180,60,"#7F77DD",16),(100,130,"#5DCAA5",12),(260,130,"#AFA9EC",12),
        (60,220,"#7F77DD",10),(140,210,"#5DCAA5",10),(220,215,"#AFA9EC",10),
        (300,220,"#7F77DD",10),(180,175,"#5DCAA5",18),
    ]
    edges = [(0,1),(0,2),(1,3),(1,4),(2,5),(2,6),(0,7),(1,7),(2,7),(4,7),(5,7)]
    edge_svg = ""
    for i, (a, b) in enumerate(edges):
        x1,y1,_,_ = nodes[a]; x2,y2,_,_ = nodes[b]
        edge_svg += (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"'
                     f' stroke="rgba(127,119,221,0.2)" stroke-width="1.2"'
                     f' style="opacity:0;animation:fi .4s {0.05+i*.04:.2f}s ease forwards"/>')
    node_svg = ""
    for i, (x, y, col, r) in enumerate(nodes):
        d = 0.25 + i * 0.07
        node_svg += (f'<circle cx="{x}" cy="{y}" r="{r}"'
                     f' fill="rgba(127,119,221,0.12)" stroke="{col}" stroke-width="2"'
                     f' style="opacity:0;animation:fi .5s {d:.2f}s ease forwards"/>')
    return f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">{_ANIM}{edge_svg}{node_svg}</svg>'


# ════════════════════════════════════════════════════════════════════════════
#  DISPATCHER
# ════════════════════════════════════════════════════════════════════════════

def get_visual_svg(hint: str) -> str:
    h = (hint or "").lower().strip()
    dispatch = {
        "matrix":                  _matrix_svg,
        "vector":  _vector_svg,  "vectors": _vector_svg,  "space":  _vector_svg,
        "graph":   _graph_svg,   "function": _graph_svg,  "curve":  _graph_svg,  "plot": _graph_svg,
        "formula": _formula_svg,
        "neural":  _neural_svg,  "network": _neural_svg,  "ai":     _brain_svg,  "brain": _brain_svg,
        "chart":   _chart_svg,   "bar":     _chart_svg,   "data":   _chart_svg,  "statistics": _chart_svg,
        "finance": _finance_svg, "stock":   _finance_svg, "trend":  _finance_svg,
        "wave":    _wave_svg,    "physics": _wave_svg,    "signal": _signal_svg, "circuit": _signal_svg,
        "tree":    _tree_svg,    "graph_tree": _tree_svg,
        "flow":    _flow_svg,    "process": _flow_svg,    "pipeline": _flow_svg,
    }
    fn = dispatch.get(h)
    return fn() if fn else _formula_svg()
