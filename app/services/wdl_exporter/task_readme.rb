module WdlExporter::TaskReadme

  def self.for(app)
    <<-EOH
##{app.name}

To execute this app locally, please ensure you have Docker (get.docker.com), Cromwell (https://github.com/broadinstitute/cromwell) and WDLTool (https://github.com/broadinstitute/wdltool) and run:

```
docker build . -t #{app.name}
java -jar /path/to/wdltool.jar inputs #{app.name}.wdl > inputs.json
java -jar /path/to/cromwell.jar run #{app.name}.wdl -i inputs.json
```

where inputs.json is a standard WDL input file definition (see https://software.broadinstitute.org/wdl/ for examples).

The output directory structure would be the following:

cromwell-workflow-logs/
cromwell-executions/single_task/<hash>/call-#{app.name}/execution/
cromwell-executions/single_task/<hash>/call-#{app.name}/execution/fetched_file/
cromwell-executions/single_task/<hash>/call-#{app.name}/execution/glob-<hash>/
cromwell-executions/single_task/<hash>/call-#{app.name}/execution/tmp/
    EOH
  end
end
