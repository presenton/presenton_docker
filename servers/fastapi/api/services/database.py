from contextlib import contextmanager
import os
from sqlalchemy import create_engine
from sqlmodel import Session


sql_url = "sqlite:///" + os.path.join(os.getenv("APP_DATA_DIRECTORY"), "fastapi.db")
sql_engine = create_engine(sql_url, connect_args={"check_same_thread": False})


@contextmanager
def get_sql_session():
    session = Session(sql_engine)
    try:
        yield session
    finally:
        session.close()
