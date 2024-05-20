module WdlExporter::WorkflowReadme

  def self.for(workflow)
    <<-EOH
##{workflow.name}

To execute this app locally, please ensure you have Docker (get.docker.com), Cromwell (https://github.com/broadinstitute/cromwell) and WDLTool (https://github.com/broadinstitute/wdltool) and run:

```
docker build . -t #{workflow.name}
java -jar /path/to/wdltool.jar inputs #{workflow.name}.wdl > inputs.json
java -jar /path/to/cromwell.jar run #{workflow.name}.wdl -i inputs.json
```

where inputs.json is a standard WDL input file definition (see https://software.broadinstitute.org/wdl/ for examples).

The output directory structure would be the following:

cromwell-workflow-logs/
cromwell-executions/#{workflow.name}/<hash>/call-<app1>/execution/
cromwell-executions/#{workflow.name}/<hash>/call-<app2>/execution/
....
cromwell-executions/#{workflow.name}/<hash>/call-<appN>/execution/
    EOH
  end
end
