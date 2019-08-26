workflow single_task {
  call app_a
}

task app_a {
  String in_string
  Boolean in_boolean
  File in_file

  command {
    /usr/bin/run --in_string "${in_string}" --in_boolean "${in_boolean}" --in_file "${in_file}" && mv /data/out/* .
  }

  runtime {
    docker: "app_a:latest"
  }

  output {
    File out_file = select_first(glob("out_file/*"))
    String out_string = read_string("out_string")
  }
}
