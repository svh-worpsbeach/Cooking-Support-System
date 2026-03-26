"""
Database configuration module for the Cooking Management System.
Supports multiple database backends with easy switching between environments.
"""

import os
from enum import Enum
from typing import Optional
from pydantic_settings import BaseSettings


class DatabaseType(str, Enum):
    """Supported database types."""
    SQLITE = "sqlite"
    DB2 = "db2"
    POSTGRESQL = "postgresql"
    MYSQL = "mysql"


class Settings(BaseSettings):
    """Application settings with database configuration."""
    
    # Database Configuration
    database_type: DatabaseType = DatabaseType.SQLITE
    
    # SQLite Configuration
    sqlite_database: str = "./cooking.db"
    
    # DB2 Configuration
    db2_host: str = "localhost"
    db2_port: int = 50000
    db2_database: str = "COOKDB"
    db2_user: str = "db2inst1"
    db2_password: str = "db2inst1-pwd"
    
    # PostgreSQL Configuration
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_database: str = "cooking_db"
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    
    # MySQL Configuration
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_database: str = "cooking_db"
    mysql_user: str = "root"
    mysql_password: str = "root"
    
    # Connection Pool Settings
    pool_size: int = 10
    max_overflow: int = 20
    pool_pre_ping: bool = True
    
    # Logging
    echo_sql: bool = False
    
    # CORS Configuration
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    def get_database_url(self) -> str:
        """
        Generate the database URL based on the configured database type.
        
        Returns:
            str: SQLAlchemy database URL
        """
        if self.database_type == DatabaseType.SQLITE:
            return f"sqlite:///{self.sqlite_database}"
        
        elif self.database_type == DatabaseType.DB2:
            return (
                f"db2+ibm_db://{self.db2_user}:{self.db2_password}"
                f"@{self.db2_host}:{self.db2_port}/{self.db2_database}"
            )
        
        elif self.database_type == DatabaseType.POSTGRESQL:
            return (
                f"postgresql://{self.postgres_user}:{self.postgres_password}"
                f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_database}"
            )
        
        elif self.database_type == DatabaseType.MYSQL:
            return (
                f"mysql+pymysql://{self.mysql_user}:{self.mysql_password}"
                f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}"
            )
        
        else:
            raise ValueError(f"Unsupported database type: {self.database_type}")
    
    def get_engine_kwargs(self) -> dict:
        """
        Get database engine configuration based on database type.
        
        Returns:
            dict: Engine configuration parameters
        """
        if self.database_type == DatabaseType.SQLITE:
            return {
                "connect_args": {"check_same_thread": False},
                "echo": self.echo_sql
            }
        else:
            return {
                "pool_pre_ping": self.pool_pre_ping,
                "pool_size": self.pool_size,
                "max_overflow": self.max_overflow,
                "echo": self.echo_sql
            }
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Get CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Create global settings instance
settings = Settings()

# Made with Bob
