require "cwl_exporter/workflow"

class CwlExporter

  def initialize(token)
    @token = token
  end

  def workflow_export(workflow)
    TarballBuilder.build do |tar|
      tar.add_file("README.md", WorkflowReadme.for(workflow))
      tar.add_file("#{workflow.name}.cwl", Workflow.new(workflow))

      workflow.apps.each do |app|
        tar.add_file("#{app.name}.cwl", Step.new(app))
        tar.add_file("Dockerfile.#{app.name}", app.to_docker(token))
      end

      tar.add_file("Makefile", WorkflowMakefile.for(workflow))
    end
  end

  def app_export(app)
    TarballBuilder.build do |tar|
      tar.add_file("README.md", StepReadme.for(app))
      tar.add_file("#{app.name}.cwl", Step.new(app))
      tar.add_file("Dockerfile", app.to_docker(token))
    end
  end

  private

  attr_reader :token

end
