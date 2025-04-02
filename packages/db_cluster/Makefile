
DB_PASSWORD := hello

prepare-conda-env:
	conda create -n pfda python=3.8
	conda activate pfda
	conda install pytest

prepare-venv:
	python3 -m venv .env
	source .env/bin/activate
	pip3 install -r requirements.txt

start-dbs:
	docker run --rm --name pfda_postgres_test -d -p 5433:5432 -e POSTGRES_PASSWORD=$(DB_PASSWORD) postgres:12.9
	docker run --rm --name pfda_mysql_test -p 3333:3306 -e MYSQL_ROOT_PASSWORD=$(DB_PASSWORD) -d mysql:8.0

stop-dbs:
	docker stop pfda_postgres_test
	docker stop pfda_mysql_test

connect-postgres:
	PGPASSWORD=$(DB_PASSWORD) psql -h localhost -p 5433 -d postgres -U postgres

connect-mysql:
	mysql -h 127.0.0.1 -P 3333 --protocol=tcp -u root -p$(DB_PASSWORD)

test:
	pytest -v tests
