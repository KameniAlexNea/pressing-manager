#!/usr/bin/env python3
"""
Script to generate random test data for the pressing manager application using Firebase Firestore.
Usage: python generate_test_data.py <user_id> [num_records]
"""

import sys
import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.crud import create_item


# Sample data for generating realistic test data
FIRST_NAMES = [
    "Jean", "Marie", "Pierre", "Sophie", "Michel", "Isabelle", "Philippe", "Nathalie",
    "Alain", "Catherine", "François", "Sylvie", "Patrick", "Monique", "Christian", "Nicole",
    "Daniel", "Christine", "André", "Martine", "Bernard", "Jacqueline", "Louis", "Anne",
    "Robert", "Valérie", "Paul", "Stéphanie", "Jacques", "Sandrine"
]

LAST_NAMES = [
    "Dubois", "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand",
    "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David",
    "Bertrand", "Roux", "Vincent", "Fournier", "Morel", "Girard", "André", "Lefèvre",
    "Mercier", "Dupont", "Lambert", "Bonnet", "François", "Martinez"
]

CLOTHING_TYPES = [
    "Chemise", "Pantalon", "Jupe", "Robe", "Veste", "Manteau", "Pull", "T-shirt",
    "Short", "Blouse", "Costume", "Tailleur", "Jean", "Sweat-shirt", "Cardigan",
    "Blazer", "Poncho", "Echarpe", "Chapeau", "Gants"
]

DESCRIPTIONS = [
    "À laver délicatement", "Tâches difficiles", "Très sale", "Nettoyage normal",
    "Pressage important", "Détachage nécessaire", "À repasser", "Urgent",
    "Client régulier", "Article fragile", "À traiter rapidement"
]

PHONE_PREFIXES = ["06", "07"]


def generate_phone_number() -> str:
    """Generate a realistic French phone number."""
    prefix = random.choice(PHONE_PREFIXES)
    number = ''.join(random.choices('0123456789', k=8))
    return f"{prefix}{number}"


def generate_owner_name() -> str:
    """Generate a random owner name."""
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    return f"{first_name} {last_name}"


def generate_clothing_items() -> List[Dict[str, Any]]:
    """Generate a list of clothing items for an order."""
    num_items = random.randint(1, 5)
    items = []

    for _ in range(num_items):
        item = {
            "type": random.choice(CLOTHING_TYPES),
            "qty": random.randint(1, 3),
            "notes": random.choice(DESCRIPTIONS) if random.random() < 0.3 else ""
        }
        items.append(item)

    return items


def generate_random_item(user_id: str) -> Dict[str, Any]:
    """Generate a single random clothing item."""
    # Generate dates
    date_received = datetime.now() - timedelta(days=random.randint(0, 30))
    date_promised = date_received + timedelta(days=random.randint(1, 7))

    # Random status with realistic distribution
    status_weights = [('received', 0.4), ('cleaned', 0.4), ('delivered', 0.2)]
    status = random.choices([s[0] for s in status_weights], weights=[s[1] for s in status_weights])[0]

    # Set dates based on status
    date_cleaned = None
    date_delivered = None

    if status in ['cleaned', 'delivered']:
        date_cleaned = date_received + timedelta(days=random.randint(1, 3))

    if status == 'delivered':
        date_delivered = date_cleaned + timedelta(days=random.randint(0, 2))

    # Generate price and payment
    price = round(random.uniform(5, 50), 2)
    amount_given = None
    if random.random() < 0.8:  # 80% of items are paid
        amount_given = price if random.random() < 0.9 else round(price + random.uniform(0, 10), 2)

    item_data = {
        "id": f"{user_id}_{uuid.uuid4().hex[:8].upper()}",
        "owner": generate_owner_name(),
        "contact": generate_phone_number(),
        "price": price,
        "amount_given": amount_given,
        "status": status,
        "date_received": date_received,
        "date_promised": date_promised,
        "date_cleaned": date_cleaned,
        "date_delivered": date_delivered,
        "description": random.choice(DESCRIPTIONS) if random.random() < 0.4 else None,
        "notes": random.choice(DESCRIPTIONS) if random.random() < 0.2 else None,
        "items": generate_clothing_items(),
        "image": None,  # No images for test data
        "user_id": user_id,  # Add user_id for Firebase organization
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    return item_data


def save_to_firebase(items: List[Dict[str, Any]], user_id: str):
    """Save items to Firebase Firestore using CRUD functions."""
    try:
        saved_count = 0
        for item_data in items:
            result = create_item(item_data)
            if result:
                saved_count += 1
            else:
                print(f"❌ Failed to save item {item_data['id']}")

        if saved_count == len(items):
            return True
        else:
            print(f"⚠️  Only saved {saved_count}/{len(items)} items")
            return False
    except Exception as e:
        print(f"❌ Error saving to Firebase: {e}")
        return False


def main():
    """Main function to generate test data."""
    if len(sys.argv) < 2:
        print("Usage: python generate_test_data.py <user_id> [num_records]")
        print("Example: python generate_test_data.py TEST_USER 25")
        sys.exit(1)

    user_id = sys.argv[1]
    num_records = int(sys.argv[2]) if len(sys.argv) > 2 else 10

    print(f"Generating {num_records} test records for user: {user_id}")
    print("📍 Target: Firebase Firestore collection 'clothing_items' (via CRUD)")
    print("=" * 60)

    try:
        created_items = []

        for i in range(num_records):
            item_data = generate_random_item(user_id)
            created_items.append(item_data)

            if (i + 1) % 5 == 0:
                print(f"Generated {i + 1}/{num_records} items...")

        # Try to save to Firebase
        if save_to_firebase(created_items, user_id):
            print(f"\n✅ Successfully created {len(created_items)} test items in Firebase Firestore!")
        else:
            print(f"\n📋 Generated {len(created_items)} test items (preview mode)")

        print("\nSample items created:")
        for item in created_items[:3]:  # Show first 3 items
            print(f"  - {item['id']}: {item['owner']} - {item['status']} - {item['price']}€")

        if len(created_items) > 3:
            print(f"  ... and {len(created_items) - 3} more items")

        print(f"\n User ID: {user_id}")

    except Exception as e:
        print(f"❌ Error generating test data: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
