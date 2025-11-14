# Get the actual branch (from ENV if set)
GIT_REVISION = ENV["GIT_REVISION"].presence || `git rev-parse HEAD`.strip rescue "N/A"
GIT_BRANCH = ENV["GIT_BRANCH"].presence || `git rev-parse --abbrev-ref HEAD`.strip rescue "N/A"