module CwlExporter::WorkflowReadme

  def self.for(workflow)
    <<-EOH
##{workflow.name}

To execute this app locally, please ensure you have Docker (get.docker.com) and cwltool ('pip install cwtool') and run:

```
make
sudo cwltool --no-match-user --no-read-only #{workflow.name}.cwl inputs.json
```

where inputs.json is a standard CWL input file definition (see 'A Gentle Guide to CWL' for examples).
    EOH
  end

end
