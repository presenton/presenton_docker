import os
from typing import Any, Optional
import redis
from redis.exceptions import RedisError


class RedisService:
    def __init__(self):
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", "6379"))
        self.redis_db = int(os.getenv("REDIS_DB", "0"))
        self.redis_password = os.getenv("REDIS_PASSWORD")
        self.client = self._create_client()

    def _create_client(self) -> redis.Redis:
        return redis.Redis(
            host=self.redis_host,
            port=self.redis_port,
            db=self.redis_db,
            password=self.redis_password,
            decode_responses=True,
        )

    def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        try:
            return self.client.set(key, value, ex=expire)
        except RedisError:
            return False

    def get(self, key: str) -> Optional[str]:
        try:
            return self.client.get(key)
        except RedisError:
            return None

    def delete(self, key: str) -> bool:
        try:
            return bool(self.client.delete(key))
        except RedisError:
            return False

    def exists(self, key: str) -> bool:
        try:
            return bool(self.client.exists(key))
        except RedisError:
            return False

    def set_hash(self, name: str, mapping: dict) -> bool:
        try:
            return self.client.hmset(name, mapping)
        except RedisError:
            return False

    def get_hash(self, name: str) -> Optional[dict]:
        try:
            return self.client.hgetall(name)
        except RedisError:
            return None

    def delete_hash(self, name: str, *fields: str) -> int:
        try:
            return self.client.hdel(name, *fields)
        except RedisError:
            return 0

    def set_list(self, name: str, values: list) -> bool:
        try:
            self.client.delete(name)
            if values:
                self.client.rpush(name, *values)
            return True
        except RedisError:
            return False

    def get_list(self, name: str, start: int = 0, end: int = -1) -> Optional[list]:
        try:
            return self.client.lrange(name, start, end)
        except RedisError:
            return None

    def add_to_set(self, name: str, *values: str) -> int:
        try:
            return self.client.sadd(name, *values)
        except RedisError:
            return 0

    def get_set(self, name: str) -> Optional[set]:
        try:
            return self.client.smembers(name)
        except RedisError:
            return None

    def remove_from_set(self, name: str, *values: str) -> int:
        try:
            return self.client.srem(name, *values)
        except RedisError:
            return 0

    def clear(self) -> bool:
        try:
            return self.client.flushdb()
        except RedisError:
            return False

    def close(self):
        try:
            self.client.close()
        except RedisError:
            pass
