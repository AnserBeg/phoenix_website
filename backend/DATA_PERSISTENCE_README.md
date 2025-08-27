# Data Persistence Solution for Phoenix Trailers API

## Problem
Products and other data were disappearing between builds/deployments on Railway due to ephemeral storage.

## Solution
We've implemented a robust data persistence system using:

1. **JSON File Storage**: Data is stored in local JSON files
2. **DataManager Class**: Centralized data handling with error recovery
3. **Automatic Backups**: Timestamped backups are created on each save
4. **Startup Recovery**: Data is automatically loaded on server startup

## File Structure
```
backend/
├── data/
│   ├── users.json          # User accounts
│   ├── products.json       # Product catalog
│   ├── status.json         # Status check history
│   └── backups/            # Automatic backups
│       ├── backup_20240101_120000/
│       └── backup_20240101_130000/
├── data_manager.py         # Data persistence logic
├── server.py               # Main API server
└── test_data_persistence.py # Test script
```

## How It Works

### 1. Data Loading
- On startup, the server loads data from JSON files
- If files don't exist, empty data structures are created
- If loading fails, the system attempts to restore from backups

### 2. Data Saving
- All data changes are immediately saved to JSON files
- After each save, an automatic backup is created
- Only the last 5 backups are kept to manage disk space

### 3. Error Recovery
- If the main data files become corrupted, backups are used
- The system logs all operations for debugging
- Graceful fallbacks prevent crashes

## Railway Deployment Considerations

### Current Limitation
Railway uses ephemeral storage by default, which means:
- Data files are lost on each deployment
- Backups are also lost between deployments
- This is a platform limitation, not a code issue

### Solutions for Production

#### Option 1: Railway Volumes (Recommended)
Add persistent volumes to your Railway project:
```bash
# In Railway dashboard or CLI
railway volume create data-storage
railway volume mount data-storage /app/backend/data
```

#### Option 2: External Database
Migrate to a persistent database:
- PostgreSQL (Railway supports this)
- MongoDB Atlas
- Supabase

#### Option 3: Cloud Storage
Use cloud storage for data:
- AWS S3
- Google Cloud Storage
- Cloudinary

## Testing Data Persistence

Run the test script to verify everything works:
```bash
cd backend
python test_data_persistence.py
```

## Debugging

### Check Data Status
Visit `/api/debug/data` to see:
- File existence status
- Data counts
- Backup information

### Check Uploads
Visit `/api/debug/uploads` to see:
- Upload directory status
- File listings

### Common Issues

1. **Data Directory Missing**
   - Ensure `backend/data/` directory exists
   - Check file permissions

2. **JSON File Corruption**
   - Check backup files in `data/backups/`
   - Restore from most recent backup

3. **Permission Errors**
   - Ensure the server has write access to `data/` directory
   - Check file ownership

## Monitoring

The system logs:
- Data loading operations
- Save operations
- Backup creation
- Error conditions

Check the server logs for any data-related issues.

## Future Improvements

1. **Database Migration**: Move to PostgreSQL for production
2. **Cloud Backups**: Sync backups to cloud storage
3. **Data Validation**: Add schema validation for JSON data
4. **Compression**: Compress backup files to save space
5. **Scheduled Backups**: Create backups on a schedule, not just on save

## Support

If you continue to experience data loss:
1. Check the debug endpoints
2. Review server logs
3. Verify Railway volume configuration
4. Consider migrating to a persistent database
