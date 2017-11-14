class WdlExporter

  def export(app, dockerfile, name)
    TarballBuilder.build do |tar|
      add_file(tar, "README.md", readme(name))
      add_file(tar, "#{name}.wdl", Task.new(app).to_s)
      add_file(tar, "Dockerfile", dockerfile)
    end
  end

  def add_file(tar, filename, content, mode = 777)
    tar.add_file filename, mode do |tf|
      tf.write content
    end
  end

  def readme(name)
    <<-EOH
##{name}

To execute this app locally, please ensure you have Docker (get.docker.com) and Cromwell (https://github.com/broadinstitute/cromwell) and run:

```
java -jar /path/to/cromwell.jar #{name}.wdl -i inputs.json
```

where inputs.json is a standard WDL input file definition (see https://software.broadinstitute.org/wdl/ for examples).
    EOH
  end

end
