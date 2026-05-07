import re
import unicodedata

_URL_RE = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)


def clean_text(text: str) -> str:
    if text is None:
        return ""
    text = str(text)

    # Unicode normalization
    text = unicodedata.normalize("NFKC", text)

    # URL cleaning
    text = _URL_RE.sub(" ", text)

    # Lowercase
    text = text.lower()

    # Punctuation cleaning -> keep alnum and spaces
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Whitespace normalization
    text = re.sub(r"\s+", " ", text).strip()

    return text

