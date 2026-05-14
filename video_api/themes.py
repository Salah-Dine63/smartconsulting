"""
themes.py — 5 color palettes for slide rendering.

Usage:
    from themes import get_theme, list_themes, DEFAULT_THEME
"""

# Each theme needs these exact keys so _apply_theme can do
# reliable string-substitution against the default CSS.
THEMES: dict[str, dict[str, str]] = {

    # ── 1. Dark Purple (default) ────────────────────────────────────────────
    "dark-purple": {
        "bg":               "#06061a",
        "bg_rgb":           "6,6,26",
        "primary":          "#7F77DD",
        "primary_rgb":      "127,119,221",
        "secondary":        "#5DCAA5",
        "secondary_rgb":    "93,202,165",
        "dark":             "#534AB7",
        "dark_rgb":         "83,74,183",
        "text_accent":      "#AFA9EC",
        "text_accent_rgb":  "175,169,236",
        "light_primary":    "#ccc9f5",
        "card_text":        "#dddcff",
    },

    # ── 2. Ocean ─────────────────────────────────────────────────────────────
    "ocean": {
        "bg":               "#020d1a",
        "bg_rgb":           "2,13,26",
        "primary":          "#0EA5E9",
        "primary_rgb":      "14,165,233",
        "secondary":        "#06B6D4",
        "secondary_rgb":    "6,182,212",
        "dark":             "#0284C7",
        "dark_rgb":         "2,132,199",
        "text_accent":      "#7DD3FC",
        "text_accent_rgb":  "125,211,252",
        "light_primary":    "#BAE6FD",
        "card_text":        "#E0F4FF",
    },

    # ── 3. Corporate ─────────────────────────────────────────────────────────
    "corporate": {
        "bg":               "#080818",
        "bg_rgb":           "8,8,24",
        "primary":          "#3B82F6",
        "primary_rgb":      "59,130,246",
        "secondary":        "#F59E0B",
        "secondary_rgb":    "245,158,11",
        "dark":             "#2563EB",
        "dark_rgb":         "37,99,235",
        "text_accent":      "#93C5FD",
        "text_accent_rgb":  "147,197,253",
        "light_primary":    "#BFDBFE",
        "card_text":        "#EFF6FF",
    },

    # ── 4. Minimal ───────────────────────────────────────────────────────────
    "minimal": {
        "bg":               "#0c0c0c",
        "bg_rgb":           "12,12,12",
        "primary":          "#E5E5E5",
        "primary_rgb":      "229,229,229",
        "secondary":        "#888888",
        "secondary_rgb":    "136,136,136",
        "dark":             "#B0B0B0",
        "dark_rgb":         "176,176,176",
        "text_accent":      "#C0C0C0",
        "text_accent_rgb":  "192,192,192",
        "light_primary":    "#D0D0D0",
        "card_text":        "#F0F0F0",
    },

    # ── 5. Forest ────────────────────────────────────────────────────────────
    "forest": {
        "bg":               "#061208",
        "bg_rgb":           "6,18,8",
        "primary":          "#22C55E",
        "primary_rgb":      "34,197,94",
        "secondary":        "#86EFAC",
        "secondary_rgb":    "134,239,172",
        "dark":             "#16A34A",
        "dark_rgb":         "22,163,74",
        "text_accent":      "#BBF7D0",
        "text_accent_rgb":  "187,247,208",
        "light_primary":    "#D1FAE5",
        "card_text":        "#F0FDF4",
    },
}

DEFAULT_THEME = "dark-purple"


def get_theme(name: str) -> dict[str, str]:
    """Return palette dict for *name*, falling back to default."""
    return THEMES.get(name, THEMES[DEFAULT_THEME])


def list_themes() -> list[str]:
    return list(THEMES.keys())
