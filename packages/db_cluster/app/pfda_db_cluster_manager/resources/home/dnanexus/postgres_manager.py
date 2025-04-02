from core import DBPermission, DatabaseManager
import psycopg2

class PostgresManager(DatabaseManager):
    def connect(self, hostname, root_username, root_password):
        try:
            connection = psycopg2.connect(
                host=hostname,
                database="postgres",
                port=5432,
                user=root_username,
                password=root_password
            )
            return connection
        except Exception as e:
            print(f"Failed connecting to PostgreSQL: {e}")
            return None
        
    def is_first_run(self, cursor):
        cursor.execute(f"SELECT rolname FROM pg_roles WHERE rolname = '{DBPermission.CONTRIBUTOR.value}' OR rolname = '{DBPermission.VIEWER.value}';")
        return len(cursor.fetchall()) == 0

    def create_contributor_role(self, cursor):
        role_name = DBPermission.CONTRIBUTOR.value
        cursor.execute(f"""
            REVOKE ALL ON SCHEMA public FROM PUBLIC;
            CREATE ROLE {role_name};
            GRANT ALL ON SCHEMA public TO {role_name};
        """)
            #  GRANT CONNECT ON DATABASE postgres TO {role_name};
            # GRANT USAGE ON SCHEMA public TO {role_name};
            # GRANT CREATE ON SCHEMA public TO {role_name};
            # GRANT ALL ON ALL TABLES IN SCHEMA public TO {role_name};
            # GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO {role_name};
            # GRANT TRIGGER ON ALL TABLES IN SCHEMA public TO {role_name};
            # ALTER DEFAULT PRIVILEGES IN SCHEMA public
            #     GRANT ALL PRIVILEGES ON TABLES TO {role_name};
            # ALTER DEFAULT PRIVILEGES IN SCHEMA public
            #     GRANT ALL PRIVILEGES ON SEQUENCES TO {role_name};
    
    def create_viewer_role(self, cursor):
        role_name = DBPermission.VIEWER.value
        cursor.execute(f"""
            CREATE ROLE {role_name};
            GRANT CONNECT ON DATABASE postgres TO {role_name};
            GRANT USAGE ON SCHEMA public TO {role_name};
            GRANT SELECT ON ALL TABLES IN SCHEMA public TO {role_name};
            ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO {role_name};
        """)
    
    def prepare_db(self, cursor):
        cursor.execute(
            f"""
            CREATE OR REPLACE FUNCTION get_current_user() RETURNS event_trigger LANGUAGE plpgsql
            AS $$ 
			DECLARE
				usr text;
			BEGIN
				usr := current_user;
				PERFORM "set_owner_to_admin"(usr);
            END; 
			$$;

            CREATE OR REPLACE FUNCTION set_owner_to_admin(usr text) RETURNS VOID LANGUAGE plpgsql
            AS $$ 
			DECLARE
				old_user text;
			BEGIN
				old_user := usr;
				IF old_user <> 'postgres' THEN
                	EXECUTE 'REASSIGN OWNED BY "' || old_user || '" TO {DBPermission.CONTRIBUTOR.value};';
                    EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA public TO {DBPermission.VIEWER.value};';
				END IF;
            END; 
			$$ SECURITY DEFINER;

            CREATE EVENT TRIGGER set_owner_to_admin ON ddl_command_end
            WHEN TAG in ('CREATE ACCESS METHOD', 'CREATE AGGREGATE', 'CREATE CAST', 'CREATE COLLATION', 'CREATE CONVERSION', 'CREATE DOMAIN', 'CREATE EXTENSION', 'CREATE FOREIGN DATA WRAPPER', 'CREATE FOREIGN TABLE', 'CREATE FUNCTION', 'CREATE INDEX', 'CREATE LANGUAGE', 'CREATE MATERIALIZED VIEW', 'CREATE OPERATOR', 'CREATE OPERATOR CLASS', 'CREATE OPERATOR FAMILY', 'CREATE POLICY', 'CREATE PROCEDURE', 'CREATE PUBLICATION', 'CREATE RULE', 'CREATE SCHEMA', 'CREATE SEQUENCE', 'CREATE SERVER', 'CREATE STATISTICS', 'CREATE SUBSCRIPTION', 'CREATE TABLE', 'CREATE TABLE AS', 'CREATE TEXT SEARCH CONFIGURATION', 'CREATE TEXT SEARCH DICTIONARY', 'CREATE TEXT SEARCH PARSER', 'CREATE TEXT SEARCH TEMPLATE', 'CREATE TRIGGER', 'CREATE TYPE', 'CREATE USER MAPPING', 'CREATE VIEW')
            EXECUTE FUNCTION get_current_user();
        """
        )
        self.create_contributor_role(cursor)
        self.create_viewer_role(cursor)


    def user_exists(self, cursor, username):
        cursor.execute(f"""SELECT 1 FROM pg_roles WHERE rolname = '{username}';""")
        return cursor.fetchone() is not None

    def add_user(self, cursor, user):
        cursor.execute(f"""
                       CREATE USER "{user['username']}" WITH PASSWORD '{user['psw']}';
                       GRANT "{user['role']}" TO "{user['username']}";
                       """)

    def update_user(self, cursor, user):
        cursor.execute(f"""
                       ALTER USER "{user['username']}" WITH PASSWORD '{user['psw']}';
                       REASSIGN OWNED BY "{user['username']}" to {DBPermission.CONTRIBUTOR.value};
                       REVOKE "{DBPermission.CONTRIBUTOR.value}" FROM "{user['username']}";
                       REVOKE "{DBPermission.VIEWER.value}" FROM "{user['username']}";
                       GRANT "{user['role']}" TO "{user['username']}";
                       """)
    
    def remove_user(self, cursor, username):
        cursor.execute(f"""
                       REASSIGN OWNED BY "{username}" to {DBPermission.CONTRIBUTOR.value};
                       DROP OWNED BY "{username}";
                       DROP USER IF EXISTS "{username}";
                       """)

    def get_existing_users(self, cursor):
        cursor.execute("SELECT rolname FROM pg_roles WHERE rolcanlogin = TRUE AND rolname != 'root' AND rolsuper = FALSE;")
        return set(row[0] for row in cursor.fetchall())