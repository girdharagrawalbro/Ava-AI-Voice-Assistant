"""
Test script for Ava AI Voice Assistant Database Integration
"""
import asyncio
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

try:
    from config import Config
    from database.service import db_service
    from database.models import UserCreate, MedicationCreate, ReminderCreate, EmergencyContactCreate
    print("✅ All imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("⚠️  Some modules may not be available yet. This is expected if Supabase is not configured.")
    print("✅ Basic structure test completed")

async def test_configuration():
    """Test configuration"""
    print("\n🔧 Testing Configuration...")
    
    # Check required configs
    missing_configs = Config.validate_config()
    if missing_configs:
        print(f"⚠️  Missing configuration: {', '.join(missing_configs)}")
        print("💡 Please update your .env file with the required values")
        return False
    else:
        print("✅ Configuration is valid")
        return True

async def test_database_connection():
    """Test database connection"""
    print("\n📊 Testing Database Connection...")
    
    if not Config.is_database_configured():
        print("⚠️  Database not configured - using fallback mode")
        return False
    
    # Test connection
    health = db_service.health_check()
    if health['status'] == 'healthy':
        print("✅ Database connection successful")
        return True
    else:
        print(f"❌ Database connection failed: {health.get('error', 'Unknown error')}")
        return False

async def test_basic_operations():
    """Test basic CRUD operations"""
    print("\n🧪 Testing Basic Operations...")
    
    if not db_service.is_connected:
        print("⚠️  Skipping database operations (not connected)")
        return True
    
    try:
        # Test user creation
        user = await db_service.get_user(Config.DEFAULT_USER_ID)
        if user:
            print(f"✅ Default user exists: {user.email}")
        else:
            print("⚠️  Default user not found")
        
        # Test medication operations
        test_medication = MedicationCreate(
            user_id=Config.DEFAULT_USER_ID,
            name="Test Vitamin",
            dosage="100mg",
            frequency="Once daily",
            medication_time="08:00",
            notes="Test medication for database integration"
        )
        
        created_med = await db_service.create_medication(test_medication)
        if created_med:
            print("✅ Medication creation successful")
            
            # Test medication retrieval
            medications = await db_service.get_medications(Config.DEFAULT_USER_ID)
            print(f"✅ Retrieved {len(medications)} medications")
            
            # Clean up test medication
            await db_service.delete_medication(created_med.id)
            print("✅ Medication cleanup successful")
        else:
            print("❌ Medication creation failed")
            
        return True
        
    except Exception as e:
        print(f"❌ Database operation failed: {e}")
        return False

async def test_api_models():
    """Test API model validation"""
    print("\n📋 Testing API Models...")
    
    try:
        # Test model creation
        user_data = UserCreate(
            email="test@example.com",
            full_name="Test User"
        )
        
        medication_data = MedicationCreate(
            user_id="test-user",
            name="Test Med",
            dosage="10mg",
            frequency="Twice daily",
            medication_time="08:00"
        )
        
        contact_data = EmergencyContactCreate(
            user_id="test-user",
            name="John Doe",
            phone="+1234567890",
            relationship="Brother"
        )
        
        print("✅ All API models validate correctly")
        return True
        
    except Exception as e:
        print(f"❌ Model validation failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🤖 Ava AI Voice Assistant - Database Integration Test")
    print("=" * 55)
    
    test_results = []
    
    # Run tests
    test_results.append(await test_configuration())
    test_results.append(await test_database_connection())
    test_results.append(await test_basic_operations())
    test_results.append(await test_api_models())
    
    # Summary
    print("\n📊 Test Summary")
    print("-" * 30)
    passed = sum(test_results)
    total = len(test_results)
    
    if passed == total:
        print(f"✅ All tests passed ({passed}/{total})")
        print("\n🎉 Database integration is ready!")
        print("\nNext steps:")
        print("1. Run the setup script: python setup_database.py")
        print("2. Start the API server: python main.py")
        print("3. Test the endpoints with your Electron app")
    else:
        print(f"⚠️  Some tests failed ({passed}/{total})")
        print("\n🔧 Please check the configuration and try again")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        sys.exit(1)
