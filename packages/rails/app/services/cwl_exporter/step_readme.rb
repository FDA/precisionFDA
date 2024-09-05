module CwlExporter::StepReadme

  def self.for(app)
    <<-EOH
##{app.name}

To execute this app locally, please ensure you have Docker (get.docker.com) and cwltool ('pip install cwtool') and run:

```
docker build . -t #{app.name}
cwltool --copy-outputs --no-match-user --no-read-only #{app.name}.cwl inputs.json
```

where inputs.json is a standard CWL input file definition (see 'A Gentle Guide to CWL' for examples).
    EOH
  end

end
