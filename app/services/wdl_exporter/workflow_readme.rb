module WdlExporter::WorkflowReadme

  def self.for(workflow)
    <<-EOH
##{workflow.name}

To execute this app locally, please ensure you have Docker (get.docker.com) and Cromwell (https://github.com/broadinstitute/cromwell) and run:

```
java -jar /path/to/cromwell.jar #{workflow.name}.wdl -i inputs.json
```

where inputs.json is a standard WDL input file definition (see https://software.broadinstitute.org/wdl/ for examples).
    EOH
  end

end
