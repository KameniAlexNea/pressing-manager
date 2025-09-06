import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

class FirebaseConfig:
    def __init__(self):
        self.init_firebase()

    def init_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            firebase_admin.get_app()
        except ValueError:
            # Firebase not initialized, so initialize it
            cred_dict = {
                "type": "service_account",
                "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
                "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
                "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
            }

            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)

# Global instance
firebase_config = FirebaseConfig()

async def verify_firebase_token(token: str) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    try:
        if not os.getenv("FIREBASE_PROJECT_ID"):
            return {"uid": "dev-user", "email": "dev@example.com"}
            
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
