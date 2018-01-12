Job.transaction do
  CHALLENGE_TOKEN = ARGV[0]         # runner provides token

  # Publish challenge app
  App.find_by!(dxid: "app-F5PBGj80846j3gBg0pz6VVG3").app_series.update!(scope: "public")
  App.find_by!(dxid: "app-F5PBGj80846j3gBg0pz6VVG3").update!(scope: "public")
  # check app scope
  raise unless App.find_by!(dxid: "app-F5PBGj80846j3gBg0pz6VVG3").app_series.scope == "public"
  raise unless App.find_by!(dxid: "app-F5PBGj80846j3gBg0pz6VVG3").scope == "public"

  challenge_bot = User.challenge_bot
  jobs = challenge_bot.jobs.where(state: "done").where.not(scope: "public")
  jobs_ids = jobs.ids
  jobs_count = jobs.count
  # Jobs
  jobs_published = 0
  if jobs.count > 0
    jobs.uniq.each do |job|
      job.with_lock do
        job.update!(scope: "public")
        jobs_published += 1
      end
    end
  end
  raise unless jobs_published == jobs_count
  raise unless challenge_bot.jobs.where(state: "done").where.not(scope: "public").count == 0

  # Files
  files = challenge_bot.user_files.where(parent_type: "Job", parent_id: jobs_ids).where.not(scope: "public")
  files_published = 0
  files_count = files.count

  if files.count > 0
    # Ensure API availability
    api = DNAnexusAPI.new(CHALLENGE_TOKEN)
    api.call("system", "greet")

    destination_project = CHALLENGE_BOT_PUBLIC_FILES_PROJECT

    projects = {}
    files.uniq.each do |file|
      raise "Source and destination collision for file #{file.id} (#{file.dxid})" if destination_project == file.project
      projects[file.project] = [] unless projects.has_key?(file.project)
      projects[file.project].push(file)
    end

    projects.each do |project, project_files|
      api.call(project, "clone", {objects: project_files.map(&:dxid), project: destination_project})
      UserFile.transaction do
        project_files.each do |file|
          file.reload
          file.update!(scope: "public", project: destination_project)
          files_published += 1
        end
      end
      api.call(project, "removeObjects", {objects: project_files.map(&:dxid)})
    end
  end

  raise unless files_published == files_count
  # check public files owned by challenge bot match count of public files output by challenge bot jobs
  raise unless challenge_bot.user_files.where(scope: "public").count == challenge_bot.jobs.where(scope: "public").map{|j| j.output_files.count}.sum
end
