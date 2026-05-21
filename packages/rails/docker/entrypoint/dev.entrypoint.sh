#!/usr/bin/env bash
set -euo pipefail

# Need to check bundler version as well, because ruby image come with "incorrect" pre-installed bundler
if ! command -v bundler >/dev/null || [[ "$(bundler -v)" != "Bundler version ${BUNDLER_VERSION}" ]]; then
  gem install bundler -v "${BUNDLER_VERSION}"
fi

# Bind-mounted: don't clobber a developer-customized database.yml on every restart.
[[ -f config/database.yml ]] || cp config/database.sample.yml config/database.yml

if [[ "${SKIP_RUBY_DEPS_SETUP:-0}" == "0" ]]; then
  bundle check || bundle install
  bower install --allow-root
fi

if [[ "${SKIP_DB_SETUP:-0}" == "0" ]]; then
  # One rake invocation = one Rails env boot for all three tasks.
  # db:prepare sets up or migrates; the data tasks are idempotent (no-op once seeded).
  bundle exec rake db:prepare db:generate_mock_data user:generate_test_users
fi

if [[ "${PFDA_DB_INIT_ONLY:-0}" == "1" ]]; then
  echo "DB initialization complete"
  exit 0
fi

if [[ -f /key.pem && -f /cert.pem ]]; then
  exec bundle exec thin --debug start --ssl --ssl-key-file /key.pem --ssl-cert-file /cert.pem
else
  exec bundle exec thin --ssl --debug start
fi
