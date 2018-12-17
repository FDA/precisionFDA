workflow single_task {
  call app_a
}

task app_a {

  String anything

  command {
    /usr/bin/run --anything "${anything}" && mv /data/out/* .
  }

  runtime {
    docker: "app_a:latest"
  }

  output {
    File my_file = select_first(glob("my_file/*"))
    String my_string = read_string("my_string")
  }
}
