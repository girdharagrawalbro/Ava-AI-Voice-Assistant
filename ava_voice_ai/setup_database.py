"""
Setup and Database Initialization Script for Ava AI Voice Assistant
"""
import os
import sys
import asyncio
import logging
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

try:
    from config import Config
    from database.service import db_service
    from database.models import UserCreate, HealthTipCreate
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Please ensure all dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def initialize_database():
    """Initialize database with sample data"""
    logger.info("Starting database initialization...")
    
    # Check database configuration
    missing_configs = Config.validate_config()
    if missing_configs:
        logger.error(f"Missing required configuration: {', '.join(missing_configs)}")
        logger.error("Please check your .env file and ensure all required variables are set.")
        return False
    
    # Test database connection
    health = db_service.health_check()
    if health['status'] != 'healthy':
        logger.error(f"Database connection failed: {health.get('error', 'Unknown error')}")
        logger.error("Please check your Supabase configuration and ensure the database is accessible.")
        return False
    
    logger.info("Database connection successful!")
    
    # Create default user if it doesn't exist
    try:
        existing_user = await db_service.get_user(Config.DEFAULT_USER_ID)
        if not existing_user:
            user_data = UserCreate(
                email="user@example.com",
                full_name="Default User",
                timezone="UTC"
            )
            # Set the ID manually for the default user
            user_data_dict = user_data.dict()
            user_data_dict['id'] = Config.DEFAULT_USER_ID
            
            if db_service.client:
                result = db_service.client.table('users').insert(user_data_dict).execute()
                if result.data:
                    logger.info(f"Created default user with ID: {Config.DEFAULT_USER_ID}")
                else:
                    logger.warning("Failed to create default user")
        else:
            logger.info(f"Default user already exists: {existing_user.email}")
    except Exception as e:
        logger.warning(f"Error creating default user: {e}")
    
    # Initialize sample health tips if none exist
    try:
        existing_tips = await db_service.get_health_tips(limit=1)
        if not existing_tips:
            sample_tips = [
                {
                    "tip_content": "Drink at least 8 glasses of water daily to stay hydrated",
                    "category": "hydration",
                    "priority": 5,
                    "source": "WHO Guidelines"
                },
                {
                    "tip_content": "Take short walks every hour if you work at a desk",
                    "category": "exercise",
                    "priority": 4,
                    "source": "Mayo Clinic"
                },
                {
                    "tip_content": "Get 7-8 hours of sleep each night for optimal health",
                    "category": "sleep",
                    "priority": 5,
                    "source": "Sleep Foundation"
                },
                {
                    "tip_content": "Practice deep breathing exercises to reduce stress",
                    "category": "mental_health",
                    "priority": 3,
                    "source": "APA Guidelines"
                },
                {
                    "tip_content": "Eat at least 5 servings of fruits and vegetables daily",
                    "category": "nutrition",
                    "priority": 4,
                    "source": "CDC Guidelines"
                }
            ]
            
            for tip_data in sample_tips:
                try:
                    if db_service.client:
                        db_service.client.table('health_tips').insert(tip_data).execute()
                except Exception as e:
                    logger.warning(f"Error creating health tip: {e}")
            
            logger.info("Created sample health tips")
        else:
            logger.info(f"Health tips already exist ({len(existing_tips)} found)")
    except Exception as e:
        logger.warning(f"Error initializing health tips: {e}")
    
    logger.info("Database initialization completed!")
    return True

def check_environment():
    """Check if environment is properly configured"""
    logger.info("Checking environment configuration...")
    
    # Check if .env file exists
    env_file = project_root / '.env'
    if not env_file.exists():
        logger.warning(".env file not found. Creating from .env.example...")
        env_example = project_root / '.env.example'
        if env_example.exists():
            import shutil
            shutil.copy(env_example, env_file)
            logger.info("Created .env file from .env.example")
            logger.warning("Please edit .env file with your actual configuration values")
        else:
            logger.error(".env.example file not found. Please create .env file manually.")
            return False
    
    # Check configuration
    missing_configs = Config.validate_config()
    if missing_configs:
        logger.error(f"Missing or invalid configuration:")
        for config in missing_configs:
            logger.error(f"  - {config}")
        logger.error("Please update your .env file with the required values")
        return False
    
    logger.info("Environment configuration is valid!")
    return True

def check_dependencies():
    """Check if all required dependencies are installed"""
    logger.info("Checking dependencies...")
    
    # Map of package names to their import names
    required_packages = {
        'fastapi': 'fastapi',
        'uvicorn': 'uvicorn',
        'supabase': 'supabase',
        'google-generativeai': 'google.generativeai',
        'pydantic': 'pydantic',
        'python-dotenv': 'dotenv'
    }
    
    missing_packages = []
    for package_name, import_name in required_packages.items():
        try:
            __import__(import_name)
        except ImportError:
            missing_packages.append(package_name)
    
    if missing_packages:
        logger.error("Missing required packages:")
        for package in missing_packages:
            logger.error(f"  - {package}")
        logger.error("Please install missing packages: pip install -r requirements.txt")
        return False
    
    logger.info("All dependencies are installed!")
    return True

async def main():
    """Main setup function"""
    print("🤖 Ava AI Voice Assistant - Setup & Initialization")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Setup failed: Missing dependencies")
        sys.exit(1)
    
    # Check environment
    if not check_environment():
        print("\n❌ Setup failed: Environment configuration issues")
        sys.exit(1)
    
    # Initialize database
    print("\n📊 Initializing database...")
    if await initialize_database():
        print("\n✅ Setup completed successfully!")
        print("\nNext steps:")
        print("1. Start the API server: python main.py")
        print("2. Open the Electron app to use Ava AI")
        print("3. Configure your API keys in the .env file if you haven't already")
        print("\nDatabase Tables Created:")
        print("- users")
        print("- medications")
        print("- medication_logs")
        print("- reminders")
        print("- emergency_contacts")
        print("- health_records")
        print("- symptom_checks")
        print("- chat_sessions")
        print("- chat_messages")
        print("- audio_files")
        print("- health_tips")
        print("- user_health_tips")
    else:
        print("\n❌ Database initialization failed")
        print("Please check your Supabase configuration and try again")
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nSetup interrupted by user")
    except Exception as e:
        logger.error(f"Setup failed with error: {e}")
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)
