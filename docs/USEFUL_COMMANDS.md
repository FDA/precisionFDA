# Some useful commands

If you use [docker-based setup](DOCKER_BASED_SETUP.md), prepend each command 
with `docker-compose exec web` (unless it's written that it does not work).

* Get to rails console
    * `bundle exec rails c`

* Run a migration
    * `bundle exec rake db:migrate`

* Run all tests
    * `bundle exec rspec`

* Run specific test
    * `bundle exec rspec spec/<path_to_spec>`

* Run rubocop
    * `bundle rubocop`

* Run tests with Rspec Guard (doesn't work in docker container)
    * `bundle exec guard`

* To exit from Guard mode (doesn't work in docker container)
    * `exit`

* Check current code coverage
    * `open coverage/index.html`
