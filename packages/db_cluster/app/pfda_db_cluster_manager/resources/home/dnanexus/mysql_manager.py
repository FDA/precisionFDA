from core import DBPermission, DatabaseManager
import mysql.connector

class MySQLManager(DatabaseManager):
    def connect(self, hostname, root_username, root_password):
        try:
            connection = mysql.connector.connect(
                host=hostname,
                port=3306,
                # database='public',
                user=root_username,
                password=root_password
            )
            return connection
        except Exception as e:
            print(f"Failed connecting to MySQL: {e}")
            return None
        
    def is_first_run(self, cursor):
        cursor.execute(f"SELECT user FROM mysql.user WHERE user = '{DBPermission.CONTRIBUTOR.value}' OR user = '{DBPermission.VIEWER.value}';")
        return len(cursor.fetchall()) == 0
    
    def create_contributor_role(self, cursor):
        role_name = DBPermission.CONTRIBUTOR.value
        res = cursor.execute(f"""
            CREATE ROLE IF NOT EXISTS '{role_name}';
            GRANT ALL ON public.* TO '{role_name}';
        """, multi=True)
        for cur in res:
            if cur.with_rows:
                cur.fetchall()
    
    def create_viewer_role(self, cursor):
        role_name = DBPermission.VIEWER.value
        res = cursor.execute(f"""
            CREATE ROLE IF NOT EXISTS '{role_name}';
            GRANT SELECT ON public.* TO '{role_name}';
        """, multi=True)
        for cur in res:
            if cur.with_rows:
                cur.fetchall()

    def prepare_db(self, cursor):
        cursor.execute("CREATE SCHEMA IF NOT EXISTS public;")
        self.create_contributor_role(cursor)
        self.create_viewer_role(cursor)
    
    def user_exists(self, cursor, username):
        cursor.execute(f"SELECT 1 FROM mysql.user WHERE user = '{username}';")
        return cursor.fetchone() is not None
    
    def add_user(self, cursor, user):
        res = cursor.execute(f"""
                       CREATE USER `{user['username']}` IDENTIFIED BY '{user['psw']}';
                       GRANT "{user['role']}" TO `{user['username']}`;
                       SET DEFAULT ROLE {user['role']} TO `{user['username']}`;
                       """, multi=True)
        for cur in res:
            if cur.with_rows:
                cur.fetchall()
    
    def update_user(self, cursor, user):
        res = cursor.execute(f"""
                       ALTER USER `{user['username']}` IDENTIFIED BY '{user['psw']}';
                       REVOKE "{DBPermission.CONTRIBUTOR.value}" FROM `{user['username']}`;
                       REVOKE "{DBPermission.VIEWER.value}" FROM `{user['username']}`;
                       GRANT "{user['role']}" TO `{user['username']}`;
                       SET DEFAULT ROLE {user['role']} TO `{user['username']}`;
                       """, multi=True)
        for cur in res:
            if cur.with_rows:
                cur.fetchall()
    
    def remove_user(self, cursor, username):
        cursor.execute(f"DROP USER IF EXISTS `{username}`;")
    
    def get_existing_users(self, cursor):
        cursor.execute(f"SELECT user from mysql.user WHERE host = '%' AND super_priv = 'N' AND user NOT IN ('{DBPermission.CONTRIBUTOR.value}','{DBPermission.VIEWER.value}','AWS_SAGEMAKER_ACCESS', 'AWS_LAMBDA_ACCESS', 'AWS_COMPREHEND_ACCESS', 'AWS_LOAD_S3_ACCESS', 'rds_superuser_role', 'AWS_SELECT_S3_ACCESS', 'root', 'mysql.infoschema', 'mysql.session', 'mysql.sys');")
        return set(row[0] for row in cursor.fetchall())