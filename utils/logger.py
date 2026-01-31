"""
Logging configuration for the trading bot.
"""
import logging
import sys
from datetime import datetime
from pathlib import Path

_loggers: dict[str, logging.Logger] = {}


def setup_logger(
    name: str = "tradingbot",
    level: int = logging.INFO,
    log_to_file: bool = True,
    log_dir: str = "logs",
) -> logging.Logger:
    """
    Set up and configure a logger.

    Args:
        name: Logger name
        level: Logging level
        log_to_file: Whether to log to file
        log_dir: Directory for log files

    Returns:
        Configured logger instance
    """
    if name in _loggers:
        return _loggers[name]

    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.handlers = []

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_format = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)

    # File handler
    if log_to_file:
        log_path = Path(log_dir)
        log_path.mkdir(exist_ok=True)

        date_str = datetime.now().strftime("%Y-%m-%d")
        file_handler = logging.FileHandler(
            log_path / f"{name}_{date_str}.log", encoding="utf-8"
        )
        file_handler.setLevel(level)
        file_format = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        file_handler.setFormatter(file_format)
        logger.addHandler(file_handler)

    _loggers[name] = logger
    return logger


def get_logger(name: str = "tradingbot") -> logging.Logger:
    """
    Get an existing logger or create a new one.

    Args:
        name: Logger name

    Returns:
        Logger instance
    """
    if name in _loggers:
        return _loggers[name]
    return setup_logger(name)
