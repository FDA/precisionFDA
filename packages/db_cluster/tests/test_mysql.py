import os
from typing import Type
import mysql.connector
import pathlib
import pytest
import sys
import re
from mysql.connector.errors import ProgrammingError
from dataclasses import dataclass

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.pfda_db_cluster_manager.resources.home.dnanexus.core import DBPermission
from app.pfda_db_cluster_manager.resources.home.dnanexus.mysql_manager import MySQLManager


TEST_VIEWER_USERNAME = "unittest_viewer"
TEST_VIEWER_PASSWORD = "hola2023"
TEST_CONTRIBUTOR_USERNAME = "unittest_contributor"
TEST_CONTRIBUTOR_PASSWORD = "hola2024"
TEST_USER_VIEWER = {
    'username': TEST_VIEWER_USERNAME, 
    'psw': TEST_VIEWER_PASSWORD,
    'role': DBPermission.VIEWER.value
    }
TEST_USER_CONTRIBUTOR = {
    'username': TEST_CONTRIBUTOR_USERNAME, 
    'psw': TEST_CONTRIBUTOR_PASSWORD,
    'role': DBPermission.CONTRIBUTOR.value
    }
TEST_USERS = [
    TEST_USER_VIEWER,
    TEST_USER_CONTRIBUTOR,
]

TEST_CONTRIBUTOR_TABLE = "contributor_table"


def create_admin_connection_mysql():
    return mysql.connector.connect(
        host="0.0.0.0",
        port=3333,
        user="root",
        password="hello",
        # raise_on_warnings=True
    )


def create_user_connection_mysql(user):
    return mysql.connector.connect(
        host="0.0.0.0",
        port=3333,
        user=user['username'],
        password=user['psw'],
        database="public",
        # raise_on_warnings=True
    )


class TestMySQLDBClusterManager:
    def test_create_roles(self):
        conn = create_admin_connection_mysql()
        manager = MySQLManager()
        with conn:
            with conn.cursor() as cur:
                manager.prepare_db(cur)
                for user in TEST_USERS:
                    manager.add_user(cur, user)
            conn.commit()

    @pytest.mark.parametrize("user", [TEST_USER_CONTRIBUTOR, TEST_USER_VIEWER])
    def test_cannot_create_roles(self, user):
        conn = create_user_connection_mysql(user)
        with pytest.raises(ProgrammingError, match=re.escape('1227 (42000): Access denied; you need (at least one of) the CREATE USER, CREATE ROLE privilege(s) for this operation')):
            with conn.cursor() as cur:
                cur.execute("CREATE ROLE i_am_trying_to_hack_the_db")
            conn.commit()

    @pytest.mark.parametrize("user", [TEST_USER_CONTRIBUTOR, TEST_USER_VIEWER])
    def test_cannot_create_schema(self, user):
        conn = create_user_connection_mysql(user)
        with pytest.raises(ProgrammingError, match=re.escape(f"1044 (42000): Access denied for user '{user['username']}'@'%' to database 'schema_to_go_around_db_protection'")):
            with conn.cursor() as cur:
                cur.execute("CREATE SCHEMA schema_to_go_around_db_protection")
            conn.commit()     

    def test_viewer_cannot_create_table(self):
        conn = create_user_connection_mysql(TEST_USER_VIEWER)
        with pytest.raises(ProgrammingError, match=re.escape("1142 (42000): CREATE command denied to user 'unittest_viewer'@'172.17.0.1' for table 'viewer_table'")):
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE viewer_table (
                        id serial PRIMARY KEY,
                        random_number integer,
                        project_id text)
                    """)
            conn.commit()

    def test_contributor_create_table(self):
        user_conn = create_user_connection_mysql(TEST_USER_CONTRIBUTOR)
        with user_conn.cursor() as cur:
            cur.execute(f"""
                CREATE TABLE {TEST_CONTRIBUTOR_TABLE} (
                    id serial PRIMARY KEY,
                    random_number integer,
                    project_id text)
                """)
            user_conn.commit()
        
        admin_conn = create_admin_connection_mysql()
        with admin_conn.cursor() as cur:
            cur.execute(f"SELECT * FROM information_schema.tables WHERE TABLE_NAME = '{TEST_CONTRIBUTOR_TABLE}'")
            result = cur.fetchall()
        admin_conn.commit()
        assert len(result) == 1 
        assert result[0][1] == "public"
        # assert result[0]['tableowner'] == TEST_USER_CONTRIBUTOR.username    ## There is no such thing as TABLE_OWNER in MySQL

    def test_contributor_write_to_table(self):
        conn = create_user_connection_mysql(TEST_USER_CONTRIBUTOR)
        with conn.cursor() as cur:
            cur.execute(f"""
                INSERT INTO {TEST_CONTRIBUTOR_TABLE} (random_number, project_id) VALUES (65535, 'project-ABCD');
            """)
        conn.commit()
        with conn.cursor() as cur:
            cur.execute(f"SELECT * FROM {TEST_CONTRIBUTOR_TABLE}")
            result = cur.fetchall()
        conn.commit()
        assert result == [(1, 65535, 'project-ABCD')]

    def test_viewer_read_from_table(self):
        conn = create_user_connection_mysql(TEST_USER_VIEWER)
        with conn.cursor() as cur:
            cur.execute(f"SELECT * FROM {TEST_CONTRIBUTOR_TABLE};")
            result = cur.fetchall()
        conn.commit()
        assert result == [(1, 65535, 'project-ABCD')]

    def test_viewer_cannot_write_to_table(self):
        conn = create_user_connection_mysql(TEST_USER_VIEWER)
        with pytest.raises(ProgrammingError, match=re.escape("1142 (42000): INSERT command denied to user 'unittest_viewer'@'172.17.0.1' for table 'contributor_table'")):
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO {TEST_CONTRIBUTOR_TABLE} (random_number, project_id) VALUES (65535, 'project-ABCD');
                """)
            conn.commit()

    def test_viewer_cannot_delete_from_table(self):
        conn = create_user_connection_mysql(TEST_USER_VIEWER)
        with pytest.raises(ProgrammingError, match=re.escape("1142 (42000): DELETE command denied to user 'unittest_viewer'@'172.17.0.1' for table 'contributor_table'")):
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM {TEST_CONTRIBUTOR_TABLE} WHERE id = 1")
            conn.commit()

    def test_contributor_delete_from_table(self):
        conn = create_user_connection_mysql(TEST_USER_CONTRIBUTOR)
        with conn.cursor() as cur:
            cur.execute(f"DELETE FROM {TEST_CONTRIBUTOR_TABLE} WHERE id = 1")
        conn.commit()
        with conn.cursor() as cur:
            cur.execute(f"SELECT * FROM {TEST_CONTRIBUTOR_TABLE}")
            result = cur.fetchall()
        conn.commit()
        assert len(result) == 0

    def test_change_viewer_to_contributor(self):
        admin_conn = create_admin_connection_mysql()
        manager = MySQLManager()
        TEST_USER_VIEWER["role"] = DBPermission.CONTRIBUTOR.value
        manager.update_user(admin_conn.cursor(), TEST_USER_VIEWER)
        admin_conn.commit()

        user_conn = create_user_connection_mysql(TEST_USER_VIEWER)
        with user_conn.cursor() as cur:
            cur.execute(f"""
                INSERT INTO {TEST_CONTRIBUTOR_TABLE} (random_number, project_id) VALUES (123, 'project-ROLE');
            """)
        user_conn.commit()
        with user_conn.cursor() as cur:
            cur.execute(f"SELECT * FROM {TEST_CONTRIBUTOR_TABLE}")
            result = cur.fetchall()
        assert result == [(2, 123, 'project-ROLE')]
        
    def test_change_contributor_to_viewer(self):
        admin_conn = create_admin_connection_mysql()
        manager = MySQLManager()
        TEST_USER_CONTRIBUTOR["role"] = DBPermission.VIEWER.value
        manager.update_user(admin_conn.cursor(), TEST_USER_CONTRIBUTOR)
        admin_conn.commit()

        user_conn = create_user_connection_mysql(TEST_USER_CONTRIBUTOR)
        with pytest.raises(ProgrammingError, match=re.escape("1142 (42000): INSERT command denied to user 'unittest_contributor'@'172.17.0.1' for table 'contributor_table'")):
            with user_conn.cursor() as cur:
                cur.execute(f"INSERT INTO {TEST_CONTRIBUTOR_TABLE} (random_number, project_id) VALUES (12345, 'project-FAIL');")
            user_conn.commit()

        with pytest.raises(ProgrammingError, match=re.escape("1142 (42000): CREATE command denied to user 'unittest_contributor'@'172.17.0.1' for table 'viewer_table'")):
            with user_conn.cursor() as cur:
                cur.execute(f"""
                    CREATE TABLE viewer_table (
                        id serial PRIMARY KEY,
                        random_number integer,
                        project_id text)
                """)
            user_conn.commit()
            
        with user_conn.cursor() as cur:
            cur.execute(f"SELECT * FROM {TEST_CONTRIBUTOR_TABLE}")
            result = cur.fetchall()
        assert result == [(2, 123, 'project-ROLE')]

    def teardown_class(cls):
        conn = create_admin_connection_mysql()

        manager = MySQLManager()
        for user in TEST_USERS:
            manager.remove_user(conn.cursor(), user['username'])
            
        with conn.cursor() as cur:
            cur.execute("USE public;")
            cur.execute("DROP ROLE IF EXISTS viewer;")
            cur.execute(f"DROP TABLE IF EXISTS {TEST_CONTRIBUTOR_TABLE};")
            cur.execute("DROP ROLE IF EXISTS contributor;")
            cur.execute("DROP DATABASE public;")
        conn.commit()

        
