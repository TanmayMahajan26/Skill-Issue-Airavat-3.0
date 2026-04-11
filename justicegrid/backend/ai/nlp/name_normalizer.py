"""
Conservative name matching across transliterations.
NEVER auto-merges uncertain matches — flags for human review.
"""
from dataclasses import dataclass
from typing import Dict


@dataclass
class MatchResult:
    action: str  # "AUTO_MATCH", "HUMAN_REVIEW", "NO_MATCH"
    confidence: float
    normalized_a: str
    normalized_b: str


def _levenshtein_distance(s1: str, s2: str) -> int:
    """Compute Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return _levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    prev_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        curr_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev_row[j + 1] + 1
            deletions = curr_row[j] + 1
            substitutions = prev_row[j] + (c1 != c2)
            curr_row.append(min(insertions, deletions, substitutions))
        prev_row = curr_row

    return prev_row[-1]


def normalize_name(name: str) -> str:
    """Basic normalization: lowercase, remove titles, standardize spacing."""
    name = name.lower().strip()
    # Remove common Indian titles/prefixes
    for title in ["shri", "smt", "mr", "mrs", "ms", "dr", "adv", "sri",
                   "श्री", "श्रीमती", "ശ്രീ", "திரு"]:
        name = name.replace(title + " ", "").replace(title + ".", "")
    # Standardize common abbreviations
    name = name.replace("mohd.", "mohammed").replace("mohd ", "mohammed ")
    name = name.replace("md.", "mohammed").replace("md ", "mohammed ")
    name = name.replace("w/o", "").replace("s/o", "").replace("d/o", "")
    # Remove extra whitespace
    name = " ".join(name.split())
    return name


def match_names(name_a: str, name_b: str) -> Dict:
    """
    Match two names across transliterations.
    Called by Laptop A: POST /api/v1/nlp/name-match

    Returns: {"action": "AUTO_MATCH|HUMAN_REVIEW|NO_MATCH", "confidence": 0.xx}
    """
    norm_a = normalize_name(name_a)
    norm_b = normalize_name(name_b)

    # Exact match after normalization
    if norm_a == norm_b:
        return {"action": "AUTO_MATCH", "confidence": 1.0,
                "normalized_a": norm_a, "normalized_b": norm_b}

    # Edit distance similarity
    max_len = max(len(norm_a), len(norm_b), 1)
    edit_score = 1 - (_levenshtein_distance(norm_a, norm_b) / max_len)

    # Phonetic similarity (compare individual name parts)
    parts_a = norm_a.split()
    parts_b = norm_b.split()

    # Compare individual name parts
    if len(parts_a) == len(parts_b) and len(parts_a) > 0:
        part_scores = []
        for pa, pb in zip(parts_a, parts_b):
            dist = _levenshtein_distance(pa, pb)
            part_scores.append(1 - dist / max(len(pa), len(pb), 1))
        phonetic_score = sum(part_scores) / len(part_scores)
    else:
        phonetic_score = edit_score * 0.8  # Penalty for different number of name parts

    # Combined score
    score = 0.6 * phonetic_score + 0.4 * edit_score

    # CONSERVATIVE thresholds — NEVER auto-merge uncertain cases
    if score > 0.95:
        action = "AUTO_MATCH"
    elif score > 0.70:
        action = "HUMAN_REVIEW"  # Flag for human, NEVER auto-merge
    else:
        action = "NO_MATCH"

    return {
        "action": action,
        "confidence": round(score, 3),
        "normalized_a": norm_a,
        "normalized_b": norm_b,
    }


# --- Test ---
if __name__ == "__main__":
    test_pairs = [
        ("Shri Rajesh Kumar", "Rajesh Kumar"),
        ("Mohammed Ali", "Mohd. Ali"),
        ("Priya Sharma", "Priya Sharma"),
        ("Ramesh Yadav", "Ramesh Yadav"),
        ("Suresh Patil", "Suresha Patel"),
        ("Amit Singh", "Rohit Verma"),
    ]

    for a, b in test_pairs:
        result = match_names(a, b)
        print(f"  {a:25s} vs {b:25s} -> {result['action']:15s} (conf: {result['confidence']:.3f})")
