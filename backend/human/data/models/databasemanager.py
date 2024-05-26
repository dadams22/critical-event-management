from sqlalchemy.orm import Session
from sqlalchemy import Engine


class DatabaseManager:
    def __init__(self, engine: Engine):
        self.engine = engine

    def create_session(self) -> Session:
        return Session(self.engine)
