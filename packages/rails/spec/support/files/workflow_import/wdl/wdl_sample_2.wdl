task bmtagger {
  
  input {
    File reads1
    File? reads2
    File index_tar_gz
    String? output_prefix
  }

  String index_tar = basename(index_tar_gz, ".gz")
  String db_name = basename(index_tar_gz, ".tar.gz")
  String for_reads_gz = basename(reads1)
  String for_reads = basename(reads1, ".gz")
  String rev_reads_gz = if defined(reads2) then basename(reads2) else ""
  String rev_reads = if defined(reads2) then basename(reads2, ".gz") else ""

  String default_output_prefix = select_first([
    output_prefix, basename(for_reads)
  ])

  command {
    set -euxo pipefail
    mkdir -p data/tmp
    mv ${index_tar_gz} "data/${index_tar}.gz"
    gunzip "data/${index_tar}.gz"
    tar xf "data/${index_tar}"
    mv ${reads1} ${reads2} data
    gunzip "data/${for_reads_gz}"

    if  [[ ! -z "${reads2}" ]]; then
    gunzip data/${rev_reads_gz}
    fi

    bmtagger.sh \
      -b "${db_name}.bitmask" \
      -x "${db_name}.srprism" \
      -T "data/tmp" \
      --extract \
      -q1 \
      -1 "data/${for_reads}" \
      ${ if defined(reads2) then "-2 data/${rev_reads}" else "" }\
      -o ${default_output_prefix}_clean

    gzip "${default_output_prefix}_clean_1.fastq"

    ${ if defined(reads2) then "gzip ${default_output_prefix}_clean_2.fastq" else "echo ${reads1}" }
  }

  runtime {
    docker: "quay.io/biocontainers/bmtagger:3.101--h470a237_4"
  }

  output {
    File clean_for_reads = "${default_output_prefix}_clean_1.fastq.gz"
    File? clean_rev_reads = "${default_output_prefix}_clean_2.fastq.gz"
  }
}

workflow multiple_tasks {
  File for_reads
  File rev_reads
  File index_tar_gz
  String? output_prefix

  call bmtagger {
    input:
      reads1 = for_reads,
      reads2 = rev_reads,
      index_tar_gz = index_tar_gz,
      output_prefix = output_prefix
  }

  output {
    File clean_for_reads = bmtagger.clean_for_reads
    File? clean_rev_reads = bmtagger.clean_rev_reads
  }
}
