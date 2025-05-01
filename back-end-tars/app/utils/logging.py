import logging
import sys
from typing import Optional

def get_logger(name: str) -> logging.Logger:
    """Configure and return a logger for the given name"""
    logger = logging.getLogger(f"tars.{name}")
    
    # Only configure if it hasn't been configured yet
    if not logger.handlers:
        # Configure handler to print to stdout
        handler = logging.StreamHandler(sys.stdout)
        
        # Format the log messages with name and colors
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        
        # Add the handler to the logger
        logger.addHandler(handler)
        
        # Set level (could be configurable)
        logger.setLevel(logging.INFO)
        
        # Don't propagate to root logger
        logger.propagate = False
    
    return logger 