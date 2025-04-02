import os
from typing import Type
import psycopg2
from psycopg2.extras import DictCursor
import pathlib
import pytest
import sys
from dataclasses import dataclass

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.pfda_db_cluster_manager.resources.home.dnanexus.core import DBPermission
from app.pfda_db_cluster_manager.resources.home.dnanexus.postgres_manager import PostgresManager


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


def create_admin_connection():
    conn = psycopg2.connect("host=localhost port=5433 dbname=postgres user=postgres password=hello")
    # conn.autocommit = True
    return conn


def create_user_connection(user):
    conn = psycopg2.connect(f"host=localhost port=5433 dbname=postgres user={user['username']} password={user['psw']}",
                           cursor_factory=DictCursor)
    # conn.autocommit = True
    return conn


class TestPostgresDBClusterManager:
    def test_create_roles(self):
        conn = create_admin_connection()
        manager = PostgresManager()
        with conn:
            with conn.cursor() as cur:
                manager.prepare_db(cur)
                for user in TEST_USERS:
                    manager.add_user(cur, user)
        conn.commit()

    @pytest.mark.parametrize("user", [TEST_USER_CONTRIBUTOR, TEST_USER_VIEWER])
    def test_cannot_create_roles(self, user):
        conn = create_user_connection(user)
        with pytest.raises(psycopg2.errors.InsufficientPrivilege):
            with conn.cursor() as cur:
                cur.execute("CREATE ROLE i_am_trying_to_hack_the_db")
        conn.commit()

    @pytest.mark.parametrize("user", [TEST_USER_CONTRIBUTOR, TEST_USER_VIEWER])
    def test_cannot_create_schema(self, user):
        conn = create_user_connection(user)
        with pytest.raises(psycopg2.errors.InsufficientPrivilege):
            with conn.cursor() as cur:
                cur.execute("CREATE SCHEMA schema_to_go_around_db_protection")     
        conn.commit()   

    def test_viewer_cannot_create_table(self):
        conn = create_user_connection(TEST_USER_VIEWER)
        with pytest.raises(psycopg2.errors.InsufficientPrivilege):
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE viewer_table (
                        id serial PRIMARY KEY,
                        random_number integer,
                        project_id text)
                    """)
        conn.commit() 

    def test_contributor_create_table(self):
        conn = create_user_connection(TEST_USER_CONTRIBUTOR)
        with conn.cursor() as cur:
            cur.execute(f"""
                CREATE TABLE {TEST_CONTRIBUTOR_TABLE} (
                    id serial PRIMARY KEY,
                    random_number integer,
                    project_id text)
                """)
        conn.commit() 

        with conn.cursor() as cur:
            cur.execute(f"SELECT * FROM pg_catalog.pg_tables WHERE tablename = '{TEST_CONTRIBUTOR_TABLE}'")
            result = cur.fetchall()
        conn.commit() 
        assert len(result) ==1 
        assert result[0]['schemaname'] == "public"
        assert result[0]['tableowner'] == "contributor"

    def test_contributor_write_to_table(self):
        conn = create_user_connection(TEST_USER_CONTRIBUTOR)
        with conn.cursor() as cur:
            cur.execute(f"""
                INSERT INTO {TEST_CONTRIBUTOR_TABLE} (random_number, project_id) VALUES (65535, 'project-ABCD');
            """)
        with conn.cursor() as cur:
            cur.execute(f"SELECT * FROM {TEST_CONTRIBUTOR_TABLE}")
            result = cur.fetchall()
        conn.commit() 
        assert result == [[1, 65535, 'project-ABCD']]

    def test_viewer_read_from_table(self):
        conn = create_user_connection(TEST_USER_VIEWER)
        with conn.cursor() as cur:
            cur.execute(f"SELECT * FROM {TEST_CONTRIBUTOR_TABLE}")
            result = cur.fetchall()
        conn.commit() 
        assert result == [[1, 65535, 'project-ABCD']]

    def test_viewer_cannot_write_to_table(self):
        conn = create_user_connection(TEST_USER_VIEWER)
        with pytest.raises(psycopg2.errors.InsufficientPrivilege):
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO {TEST_CONTRIBUTOR_TABLE} (random_number, project_id) VALUES (65535, 'project-ABCD');
                """)
        conn.commit() 

    def test_viewer_cannot_delete_from_table(self):
        conn = create_user_connection(TEST_USER_VIEWER)
        with pytest.raises(psycopg2.errors.InsufficientPrivilege):
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM {TEST_CONTRIBUTOR_TABLE} WHERE id = 1")

    def test_contributor_delete_from_table(self):
        conn = create_user_connection(TEST_USER_CONTRIBUTOR)
        with conn.cursor() as cur:
            cur.execute(f"DELETE FROM {TEST_CONTRIBUTOR_TABLE} WHERE id = 1")
        with conn.cursor() as cur:
            cur.execute(f"SELECT * FROM {TEST_CONTRIBUTOR_TABLE}")
            result = cur.fetchall()
        conn.commit() 
        assert len(result) == 0

    def test_change_viewer_to_contributor(self):
        admin_conn = create_admin_connection()
        manager = PostgresManager()
        TEST_USER_VIEWER['role'] = DBPermission.CONTRIBUTOR.value
        manager.update_user(admin_conn.cursor(), TEST_USER_VIEWER)
        admin_conn.commit()

        user_conn = create_user_connection(TEST_USER_VIEWER)
        with user_conn.cursor() as cur:
            cur.execute(f"""
                INSERT INTO {TEST_CONTRIBUTOR_TABLE} (random_number, project_id) VALUES (123, 'project-ROLE');
            """)
        with user_conn.cursor() as cur:
            cur.execute(f"SELECT * FROM {TEST_CONTRIBUTOR_TABLE}")
            result = cur.fetchall()
        user_conn.commit() 
        assert result == [[2, 123, 'project-ROLE']]

    def test_change_contributor_to_viewer(self):
        admin_conn = create_admin_connection()
        manager = PostgresManager()
        TEST_USER_CONTRIBUTOR['role'] = DBPermission.VIEWER.value
        manager.update_user(admin_conn.cursor(), TEST_USER_CONTRIBUTOR)
        admin_conn.commit()
        user_conn = create_user_connection(TEST_USER_CONTRIBUTOR)

        with pytest.raises(psycopg2.errors.InsufficientPrivilege):
            with user_conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO {TEST_CONTRIBUTOR_TABLE} (random_number, project_id) VALUES (666, 'project-NO');
                """)
        user_conn.commit()

        with pytest.raises(psycopg2.errors.InsufficientPrivilege):
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
        user_conn.commit()
        assert result == [[2, 123, 'project-ROLE']]



    def teardown_class(cls):
        conn = create_admin_connection()
        manager = PostgresManager()
        for user in TEST_USERS:
            manager.remove_user(conn.cursor(), user['username'])

        with conn.cursor() as cur:
            cur.execute("REVOKE ALL PRIVILEGES ON SCHEMA public FROM viewer")
            cur.execute("REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM viewer")
            cur.execute("DROP OWNED BY viewer")
            cur.execute("DROP ROLE IF EXISTS viewer")
            cur.execute(f"DROP TABLE {TEST_CONTRIBUTOR_TABLE}")
            cur.execute("REVOKE ALL PRIVILEGES ON SCHEMA public FROM contributor")
            cur.execute("REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM contributor")
            cur.execute("DROP OWNED BY contributor")
            cur.execute("DROP ROLE IF EXISTS contributor")
            cur.execute("DROP EVENT TRIGGER set_owner_to_admin;")
        conn.commit()
