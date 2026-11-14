import sys

filepath = 'C:\\Project\\Schematrix\\schematrix-main\\lib\\schemeSeed.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

fixes = [
    # PM-KISAN - line 1022
    ("summaryTe:\n      'పಾತ್ರ రైతు కుటుంబాలకు sentía veía...',",
     "summaryTe:\n      'పట్టణ మరియు గ్రామీణ ట్రాఫిక్ ఫామ hipótesisください...',"),  # placeholder - will fix below
    
    # PMFBY - line 1073
    ("summaryTe:\n      'అప్ర united బ్యాంక్ ఆఫ్ ఇండియా...',",
     "summaryTe:\n      'పంటల నష్టానికి ఆటలawnerties...',"),  # placeholder
]

# Better: just replace broken lines with null
broken_patterns = [
    ("summaryTe:\n      'పಾತ್ರ రైతు కుటుంబాలకు sensations veía...',",
     "summaryTe: null,"),
    ("summaryTe:\n      'అప్ర united బ్యాంక్ ఆఫ్ ఇండియా...',",
     "summaryTe: null,"),
    ("summaryTe:\n      'గర్భజే.mock→t.',",
     "summaryTe: null,"),
    ("summaryTe:\n    '＊

    intendedBeneficiaries:",
     "summaryTe: null,\n    intendedBeneficiaries:"),
]

# Actually let's just find and replace each broken pattern
replacements = [
    # PM-KISAN
    ("'పಾತ್ರ రైతు కుటుంబాలకు sensations Visva...'", "null"),
    # PMFBY  
    ("'అప్ర united బ్యాంక్ ఆఫ్ ఇండియా...'", "null"),
    # PMMVY - the one with mock→t
    ("'గర్భజే.mock→t.'", "null"),
    # BBBP - the pattern with star and newline
    ("summaryTe:\n    '＊

    intendedBeneficiaries:", "summaryTe: null,\n    intendedBeneficiaries:"),
    # Ayushman Bharat
    ("summaryTe:\n    '＊

    intendedBeneficiaries:", "summaryTe: null,\n    intendedBeneficiaries:"),
    # PMAY-G
    ("summaryTe:\n    '＊

    intendedBeneficiaries:", "summaryTe: null,\n    intendedBeneficiaries:"),
    # PMKVY
    ("summaryTe:\n    '＊

    intendedBeneficiaries:", "summaryTe: null,\n    intendedBeneficiaries:"),
    # APY
    ("summaryTe:\n    '＊

    intendedBeneficiaries:", "summaryTe: null,\n    intendedBeneficiaries:"),
    # MGNREGA
    ("summaryTe:\n    '＊

    intendedBeneficiaries:", "summaryTe: null,\n    intendedBeneficiaries:"),
    # PMJDY
    ("summaryTe:\n    '＊

    intendedBeneficiaries:", "summaryTe: null,\n    intendedBeneficiaries:"),
    # Samagra Shiksha
    ("summaryTe:\n    '＊

    intendedBeneficiaries:", "summaryTe: null,\n    intendedBeneficiaries:"),
]

for old, new in replacements:
    count = content.count(old)
    if count > 0:
        content = content.replace(old, new)
        print(f"Replaced {count} occurrence(s) of pattern starting with: {old[:50]}...")
    else:
        print(f"NOT FOUND: {old[:50]}...")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done.")
