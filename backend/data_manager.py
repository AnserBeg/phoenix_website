"""
Data Manager for Phoenix Trailers API
Handles data persistence, backup, and recovery
"""
import json
import shutil
from pathlib import Path
from datetime import datetime
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class DataManager:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.backup_dir = data_dir / "backups"
        self.backup_dir.mkdir(exist_ok=True)
        
        # File paths
        self.users_file = data_dir / "users.json"
        self.products_file = data_dir / "products.json"
        self.status_file = data_dir / "status.json"
        
        # Data storage
        self.users_db: Dict[str, Any] = {}
        self.products_db: Dict[str, Any] = {}
        self.status_checks_db: List[Dict[str, Any]] = []
        
    def load_data(self) -> None:
        """Load all data from JSON files"""
        try:
            self.users_db = self._load_json_file(self.users_file, {})
            self.products_db = self._load_json_file(self.products_file, {})
            self.status_checks_db = self._load_json_file(self.status_file, [])
            
            logger.info(f"Data loaded: {len(self.users_db)} users, {len(self.products_db)} products, {len(self.status_checks_db)} status checks")
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            # Try to load from backup if main files fail
            self._load_from_backup()
    
    def save_data(self) -> None:
        """Save all data to JSON files"""
        try:
            self._save_json_file(self.users_file, self.users_db)
            self._save_json_file(self.products_file, self.products_db)
            self._save_json_file(self.status_file, self.status_checks_db)
            
            # Create backup after successful save
            self._create_backup()
            logger.info("Data saved successfully")
        except Exception as e:
            logger.error(f"Error saving data: {e}")
    
    def _load_json_file(self, file_path: Path, default_value: Any) -> Any:
        """Load data from a JSON file with error handling"""
        try:
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    logger.info(f"Loaded data from {file_path}")
                    return data
            else:
                logger.warning(f"File {file_path} does not exist, using default")
                return default_value
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")
            return default_value
    
    def _save_json_file(self, file_path: Path, data: Any) -> None:
        """Save data to a JSON file with error handling"""
        try:
            # Ensure directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str)
            logger.info(f"Saved data to {file_path}")
        except Exception as e:
            logger.error(f"Error saving to {file_path}: {e}")
            raise
    
    def _create_backup(self) -> None:
        """Create a backup of all data files"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = self.backup_dir / f"backup_{timestamp}"
            backup_path.mkdir(exist_ok=True)
            
            # Copy all data files
            for file_path in [self.users_file, self.products_file, self.status_file]:
                if file_path.exists():
                    shutil.copy2(file_path, backup_path / file_path.name)
            
            # Keep only last 5 backups
            self._cleanup_old_backups()
            logger.info(f"Backup created at {backup_path}")
        except Exception as e:
            logger.error(f"Error creating backup: {e}")
    
    def _load_from_backup(self) -> None:
        """Try to load data from the most recent backup"""
        try:
            backups = sorted(self.backup_dir.glob("backup_*"), reverse=True)
            if backups:
                latest_backup = backups[0]
                logger.info(f"Attempting to restore from backup: {latest_backup}")
                
                # Restore from backup
                if (latest_backup / "users.json").exists():
                    self.users_db = self._load_json_file(latest_backup / "users.json", {})
                if (latest_backup / "products.json").exists():
                    self.products_db = self._load_json_file(latest_backup / "products.json", {})
                if (latest_backup / "status.json").exists():
                    self.status_checks_db = self._load_json_file(latest_backup / "status.json", [])
                
                logger.info("Data restored from backup")
            else:
                logger.warning("No backups available, using empty data")
        except Exception as e:
            logger.error(f"Error loading from backup: {e}")
    
    def _cleanup_old_backups(self, keep_count: int = 5) -> None:
        """Remove old backups, keeping only the most recent ones"""
        try:
            backups = sorted(self.backup_dir.glob("backup_*"), reverse=True)
            for backup in backups[keep_count:]:
                shutil.rmtree(backup)
                logger.info(f"Removed old backup: {backup}")
        except Exception as e:
            logger.error(f"Error cleaning up old backups: {e}")
    
    def get_data_summary(self) -> Dict[str, Any]:
        """Get a summary of current data state"""
        return {
            "data_dir": str(self.data_dir.absolute()),
            "backup_dir": str(self.backup_dir.absolute()),
            "users_count": len(self.users_db),
            "products_count": len(self.products_db),
            "status_checks_count": len(self.status_checks_db),
            "backup_count": len(list(self.backup_dir.glob("backup_*"))),
            "files_exist": {
                "users.json": self.users_file.exists(),
                "products.json": self.products_file.exists(),
                "status.json": self.status_file.exists()
            }
        }
