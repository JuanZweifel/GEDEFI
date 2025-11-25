from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DB_TARGET: str = "local"
    LOCAL_DB_URL: str
    AIVEN_DB_URL: str

    @property
    def database_url(self):
        if self.DB_TARGET == "aiven":
            return self.AIVEN_DB_URL
        return self.LOCAL_DB_URL

    class Config:
        env_file = ".env"
