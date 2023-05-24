namespace :sidekiq do
  def inspect
    # See queues
    puts "Sidekiq::Queue.all"
    queues = Sidekiq::Queue.all

    # See all jobs in all queues
    queues.each do |q|
      puts "Queue size: #{q.size}"

      jobs = Sidekiq.redis { |r| r.lrange "queue:#{q}", 0, -1 }
      puts "Jobs:"
      puts jobs
    end

    puts "Sidekiq::ScheduledSet"
    scheduled = Sidekiq::ScheduledSet.new.select
    puts "ScheduledSet size: #{scheduled.size}"
    scheduled.map do |job|
      p job
    end
  end

  task inspect: :environment do
    inspect
  end
end
