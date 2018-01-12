GIT_REVISION = `git rev-parse HEAD`.strip rescue 'N/A'
GIT_BRANCH = `git rev-parse --abbrev-ref HEAD`.strip rescue 'N/A'
