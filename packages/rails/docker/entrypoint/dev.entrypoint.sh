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

# Cheap pending-migration check: one MySQL query instead of a full Rails boot.
# Returns 0 (setup needed) when the DB/schema is unreachable or any migration
# in db/migrate is missing from schema_migrations.
db_setup_needed() {
  local cfg host user pass name applied f v
  cfg="$(ruby -ryaml -rerb -e '
    c = YAML.load(ERB.new(File.read("config/database.yml")).result, aliases: true)
    c = c.fetch(ENV.fetch("RAILS_ENV", "development"))
    puts [c["host"], c["username"], c["password"], c["database"]].join("\t")
  ' 2>/dev/null)" || return 0
  IFS=$'\t' read -r host user pass name <<<"$cfg"
  applied="$(MYSQL_PWD="$pass" mysql -h "$host" -u "$user" -N -B \
    -e 'SELECT version FROM schema_migrations' "$name" 2>/dev/null)" || return 0
  for f in db/migrate/[0-9]*.rb; do
    v="${f##*/}"
    v="${v%%_*}"
    grep -qx "$v" <<<"$applied" || return 0
  done
  return 1
}

if [[ "${SKIP_DB_SETUP:-0}" == "0" || "${PFDA_DB_INIT_ONLY:-0}" == "1" ]]; then
  # One rake invocation = one Rails env boot for all three tasks.
  # db:prepare sets up or migrates; the data tasks are idempotent (no-op once seeded).
  bundle exec rake db:prepare db:generate_mock_data user:generate_test_users
elif db_setup_needed; then
  # SKIP_DB_SETUP=1 skips the mock data / test user seeding, but pending
  # migrations are always applied so the app doesn't 500 after a git pull.
  echo "Pending migrations detected — running db:prepare despite SKIP_DB_SETUP=1"
  bundle exec rake db:prepare
else
  echo "Database schema up to date — skipping db setup (SKIP_DB_SETUP=1)"
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
