from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str

    # Optional SMTP settings for email notifications
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 1025
    NOTIFICATION_EMAIL: str | None = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()  # type: ignore[call-arg]
