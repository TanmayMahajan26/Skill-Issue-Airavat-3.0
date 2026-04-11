"""
Dialect detection from phone number prefix → region → dialect.
Maps Indian phone number prefixes to states and recommended dialects.
"""
from typing import Dict

# Phone prefix → state/region mapping (STD codes and mobile prefixes)
PHONE_PREFIX_MAP = {
    # UP
    "522": {"state": "Uttar Pradesh", "region": "Lucknow", "dialect": "Awadhi"},
    "532": {"state": "Uttar Pradesh", "region": "Varanasi", "dialect": "Bhojpuri"},
    "542": {"state": "Uttar Pradesh", "region": "Allahabad", "dialect": "Awadhi"},
    "512": {"state": "Uttar Pradesh", "region": "Kanpur", "dialect": "Hindi"},
    "551": {"state": "Uttar Pradesh", "region": "Gorakhpur", "dialect": "Bhojpuri"},
    # Bihar
    "612": {"state": "Bihar", "region": "Patna", "dialect": "Bhojpuri"},
    "621": {"state": "Bihar", "region": "Darbhanga", "dialect": "Maithili"},
    "631": {"state": "Bihar", "region": "Gaya", "dialect": "Magahi"},
    # Rajasthan
    "141": {"state": "Rajasthan", "region": "Jaipur", "dialect": "Rajasthani"},
    "291": {"state": "Rajasthan", "region": "Jodhpur", "dialect": "Marwari"},
    "151": {"state": "Rajasthan", "region": "Bikaner", "dialect": "Marwari"},
    # Maharashtra
    "20": {"state": "Maharashtra", "region": "Pune", "dialect": "Marathi"},
    "22": {"state": "Maharashtra", "region": "Mumbai", "dialect": "Marathi"},
    "712": {"state": "Maharashtra", "region": "Nagpur", "dialect": "Marathi"},
    # Tamil Nadu
    "44": {"state": "Tamil Nadu", "region": "Chennai", "dialect": "Tamil"},
    "422": {"state": "Tamil Nadu", "region": "Madurai", "dialect": "Tamil"},
    # West Bengal
    "33": {"state": "West Bengal", "region": "Kolkata", "dialect": "Bengali"},
    # Gujarat
    "79": {"state": "Gujarat", "region": "Ahmedabad", "dialect": "Gujarati"},
    # Karnataka
    "80": {"state": "Karnataka", "region": "Bangalore", "dialect": "Kannada"},
    # Telangana
    "40": {"state": "Telangana", "region": "Hyderabad", "dialect": "Telugu"},
    # Odisha
    "674": {"state": "Odisha", "region": "Bhubaneswar", "dialect": "Odia"},
    # Punjab
    "172": {"state": "Punjab", "region": "Chandigarh", "dialect": "Punjabi"},
    "161": {"state": "Punjab", "region": "Ludhiana", "dialect": "Punjabi"},
}

# Dialect → recommended language code mapping
DIALECT_TO_LANG = {
    "Hindi": "hi",
    "Bhojpuri": "hi",    # Bhojpuri speakers → Hindi with simplified terms
    "Awadhi": "hi",
    "Maithili": "hi",
    "Magahi": "hi",
    "Rajasthani": "hi",
    "Marwari": "hi",
    "Marathi": "mr",
    "Tamil": "ta",
    "Bengali": "bn",
    "Telugu": "te",
    "Kannada": "kn",
    "Gujarati": "gu",
    "Odia": "or",
    "Punjabi": "pa",
}


def detect_dialect(phone_number: str) -> Dict:
    """
    Detect probable dialect from phone number.

    Input: phone number string (with or without country code)
    Output: {dialect, region, state, recommended_language}
    """
    # Normalize: remove +91, spaces, dashes
    phone = phone_number.strip().replace(" ", "").replace("-", "")
    if phone.startswith("+91"):
        phone = phone[3:]
    elif phone.startswith("91") and len(phone) > 10:
        phone = phone[2:]
    elif phone.startswith("0"):
        phone = phone[1:]

    # Try matching STD code prefixes (longest match first)
    for prefix_len in [3, 2]:
        prefix = phone[:prefix_len]
        if prefix in PHONE_PREFIX_MAP:
            info = PHONE_PREFIX_MAP[prefix]
            dialect = info["dialect"]
            return {
                "dialect": dialect,
                "region": info["region"],
                "state": info["state"],
                "recommended_language": DIALECT_TO_LANG.get(dialect, "hi"),
                "confidence": "HIGH" if prefix_len >= 3 else "MEDIUM",
            }

    # Default to Hindi
    return {
        "dialect": "Hindi",
        "region": "Unknown",
        "state": "Unknown",
        "recommended_language": "hi",
        "confidence": "LOW",
    }


# --- Test ---
if __name__ == "__main__":
    test_numbers = [
        "+91 532 2401234",   # Varanasi → Bhojpuri
        "091-141-2345678",   # Jaipur → Rajasthani
        "044-28001234",      # Chennai → Tamil
        "+91 612 2341234",   # Patna → Bhojpuri
        "9876543210",        # Unknown → Hindi default
    ]

    for num in test_numbers:
        result = detect_dialect(num)
        print(f"  {num:25s} -> {result['dialect']:12s} ({result['region']}, {result['state']})")
