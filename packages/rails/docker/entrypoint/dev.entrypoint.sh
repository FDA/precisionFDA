#!/usr/bin/env bash
set -euo pipefail

# Need to check bundler version as well, because ruby image come with "incorrect" pre-installed bundler
if ! command -v bundler >/dev/null || [[ "$(bundler -v)" != "Bundler version ${BUNDLER_VERSION}" ]]; then
  gem install bundler -v "${BUNDLER_VERSION}"
fi

# Bind-mounted: don't clobber a developer-customized database.yml on every restart.
[[ -f config/database.yml ]] || cp config/database.sample.yml config/database.yml

# Reinstall gems and bower assets only when their manifests change, detected via a
# fingerprint marker kept in the persisted gem cache volume. Bumped dependency
# manifests reinstall automatically; no flag to flip.
RUBY_DEPS_MARKER=/usr/local/bundle/.pfda-ruby-bower-deps.sha
RUBY_DEPS_FINGERPRINT="$(sha256sum Gemfile.lock bower.json | sha256sum | cut -d' ' -f1)"
if [[ "$(cat "$RUBY_DEPS_MARKER" 2>/dev/null || true)" == "$RUBY_DEPS_FINGERPRINT" ]]; then
  echo "Ruby and bower deps unchanged (dependency fingerprint match) — skipping bundle install and bower install"
else
  bundle check || bundle install
  bower install --allow-root
  echo "$RUBY_DEPS_FINGERPRINT" > "$RUBY_DEPS_MARKER"
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
