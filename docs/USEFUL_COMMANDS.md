# Useful commands

If you use [OS-based setup](OS_BASED_SETUP.md), remove from each command the
`docker compose exec <container_name>` portion of the command when applicable.

## Ruby client

Get to rails console
`docker compose exec web bundle exec rails c`

Run database migration
`docker compose exec web bundle exec rake db:migrate`

Run all Ruby tests
`docker compose exec web bundle exec rspec`

Run specific test
`docker compose exec web bundle exec rspec spec/<path_to_spec>`

Run rubocop
`docker compose exec web bundle exec rubocop`

Run brakeman
`docker compose exec web brakeman -A --parser-timeout 30 -w2`

#### A couple commands that don't work in a docker container:

Run tests with Rspec Guard (doesn't work in docker container)
`bundle exec guard`

* To exit from Guard mode (doesn't work in docker container)
    * `exit`

* Check current code coverage
    * `open coverage/index.html`


## React Frontend

Run lint
`docker compose exec frontend yarn lint .`

Run all unit tests
`docker compose exec frontend yarn test`

Run specific unit tests
`docker compose exec frontend yarn test --testNamePattern=Challenge`

## Database

```bash
# Hook into db container
docker compose exec -it db bash
# Log in
mysql -uroot -p
# You should be able to find the password depending on your configuration
```

## TODO - missing

mention remaining rake tasks in this doc
