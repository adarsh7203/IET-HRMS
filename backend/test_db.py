import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Load .env file explicitly from the current directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Testing connection to: {DATABASE_URL.split('@')[1] if DATABASE_URL else 'None'}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        print("Successfully connected to Supabase!")
except Exception as e:
    print(f"Connection failed: {e}")
