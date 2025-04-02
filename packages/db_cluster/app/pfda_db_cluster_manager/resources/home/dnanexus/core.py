from abc import ABC, abstractmethod
from enum import Enum

class DBPermission(str, Enum):
    CONTRIBUTOR = 'contributor'
    VIEWER = 'viewer'

class DatabaseManager(ABC):

    @abstractmethod
    def connect(self, hostname, root_username, root_password):
        pass

    @abstractmethod
    def is_first_run(self, cursor):
        pass

    @abstractmethod
    def prepare_db(self, cursor):
        pass

    @abstractmethod
    def user_exists(self, cursor, username):
        pass

    @abstractmethod
    def add_user(self, cursor, user):
        pass

    @abstractmethod
    def update_user(self, cursor, user):
        pass

    @abstractmethod
    def remove_user(self, cursor, username, space_lead):
        pass

    @abstractmethod
    def get_existing_users(self, cursor):
        pass