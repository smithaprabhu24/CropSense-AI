"""
CropSense AI – Translation Generator Tool
Reads translations/translations.txt (pipe-delimited: key|en|kn|te|hi|ta)
Verifies:
  1. Missing translations in any language
  2. Wrong language scripts (validates unicode code blocks)
  3. Duplicate translation keys
Generates frontend/js/translations.js ES6 module.
"""

import sys
import re
from pathlib import Path

# Ensure UTF-8 output on Windows terminals
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent.parent
SOURCE_FILE = BASE_DIR / "translations" / "translations.txt"
OUTPUT_FILE = BASE_DIR / "frontend" / "js" / "translations.js"

LANGUAGES = ["en", "kn", "te", "hi", "ta"]

# Unicode ranges for script verification
UNICODE_RANGES = {
    "kn": (0x0C80, 0x0CFF),  # Kannada
    "te": (0x0C00, 0x0C7F),  # Telugu
    "hi": (0x0900, 0x097F),  # Devanagari
    "ta": (0x0B80, 0x0BFF),  # Tamil
}


def is_script_valid(text: str, lang: str) -> bool:
    """Check if regional language text contains characters from the expected unicode range."""
    if lang == "en":
        return True
    # Allow numbers, spaces, punctuation, Latin loan acronyms like SDGs, AI, APMC, PIN
    cleaned = re.sub(r"[\s\d\.,!?:;\-\(\)\'\"\/\\~%₹#@★A-Za-z]+", "", text)
    if not cleaned:
        return True
    low, high = UNICODE_RANGES[lang]
    regional_chars = sum(1 for c in cleaned if low <= ord(c) <= high)
    return (regional_chars / len(cleaned)) >= 0.5


def generate():
    if not SOURCE_FILE.exists():
        print(f"Error: Source file {SOURCE_FILE} not found!")
        sys.exit(1)

    print(f"Reading translations from: {SOURCE_FILE}")
    translations = {}
    seen_keys = set()
    errors = []

    with open(SOURCE_FILE, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, start=1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            parts = [p.strip() for p in line.split("|")]
            if len(parts) != 6:
                errors.append(f"Line {line_num}: Invalid column count ({len(parts)}). Expected 6 (key|en|kn|te|hi|ta).")
                continue

            key, en, kn, te, hi, ta = parts

            # 1. Duplicate check
            if key in seen_keys:
                errors.append(f"Line {line_num}: Duplicate translation key '{key}'.")
            seen_keys.add(key)

            row = {"en": en, "kn": kn, "te": te, "hi": hi, "ta": ta}

            # 2. Missing translation check
            for lang in LANGUAGES:
                if not row[lang]:
                    errors.append(f"Line {line_num} [{key}]: Missing translation for '{lang}'.")

            # 3. Script validation
            for lang in ["kn", "te", "hi", "ta"]:
                if row[lang] and not is_script_valid(row[lang], lang):
                    errors.append(f"Line {line_num} [{key}]: Text for '{lang}' may contain incorrect script: '{row[lang]}'")

            translations[key] = row

    if errors:
        print("\n[!] Translation Verification Warnings/Errors:")
        for err in errors:
            print(f"  * {err}")
    else:
        print("\n[OK] Verification Passed: No missing translations, script errors, or duplicate keys.")

    # Export to JavaScript ES6 Module
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        out.write("/**\n")
        out.write(" * CropSense AI – Compiled Multilingual Translation Dictionary\n")
        out.write(" * Automatically generated from translations/translations.txt\n")
        out.write(" */\n\n")
        out.write("const T = {\n")
        for k, v in translations.items():
            en_esc = v["en"].replace('"', '\\"')
            kn_esc = v["kn"].replace('"', '\\"')
            te_esc = v["te"].replace('"', '\\"')
            hi_esc = v["hi"].replace('"', '\\"')
            ta_esc = v["ta"].replace('"', '\\"')
            out.write(f'  "{k}": {{ en: "{en_esc}", kn: "{kn_esc}", te: "{te_esc}", hi: "{hi_esc}", ta: "{ta_esc}" }},\n')
        out.write("};\n\n")
        out.write("export default T;\n")

    print(f"Generated {len(translations)} translation keys into: {OUTPUT_FILE}")


if __name__ == "__main__":
    generate()
