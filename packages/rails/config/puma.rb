environment ENV["RAILS_ENV"] || "production"
threads    2, 16
port       3000
workers    ENV.fetch("WEB_CONCURRENCY", 4).to_i

preload_app!

before_fork do
  Auditor.init!
  ActiveRecord::Base.connection.disconnect! if defined?(ActiveRecord::Base)
end

on_worker_boot do
  # disconnect any inherited connections
  ActiveRecord::Base.connection_pool.disconnect! if defined?(ActiveRecord::Base)

  # re‑establish using YAML settings
  ActiveRecord::Base.establish_connection

  Rails.logger.info "Puma worker #{Process.pid} DB pool size = #{ActiveRecord::Base.connection_pool.size}"
end
