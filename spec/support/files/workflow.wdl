import "app_a.wdl" as app_a
import "app_b.wdl" as app_b

workflow test_workflow {

  String any_a
  String any_b

  call app_a.app_a {
    input: any_a=any_a
  }
  call app_b.app_b {
    input: any_b=any_b, file_b=app_a.out_a
  }

  output {
    File out_b = app_b.out_b
  } 
}
