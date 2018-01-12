module CwlExporter::WorkflowMakefile

  def self.for(workflow)
    workflow.apps.each_with_object("all:\n") do |app, content|
      content << "\tdocker build -f Dockerfile.#{app.name} -t #{app.name} .\n"
    end
  end

end
