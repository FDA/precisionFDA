task app_a {

  String anything

  command {
    /usr/bin/run --anything "${anything}" && mv /data/out/* .
  }
  
  runtime {
    docker: "repository/name"
  }
  
  output {
    File my_file = select_first(glob("my_file/*"))
    String my_string = read_string("my_string")
  } 
}
