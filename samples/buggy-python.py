# Buggy Python Sample
# Used for testing CodeLens AI language detection and pattern scanner

API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotHardcodeThisToken"

def calculate_order_total(items, discount_code):
    # Poor single letter naming & magic numbers
    p = 100
    if discount_code == "WELCOME50":
        total = p - 50
    else:
        total = p

    # Redundant self assignment
    total = total
    return total
