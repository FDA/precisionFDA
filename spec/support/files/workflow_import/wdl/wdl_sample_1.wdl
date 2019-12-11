task bmtagger {
  File reads1
  File? reads2
  File index_tar_gz
  String? output_prefix

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

task trimmomatic {
  File for_reads
  File rev_reads
  File adapters_fa
  Int? seed_mismatches
  Int? palindrome_clip_threshold
  Int? simple_clip_threshold
  String? output_prefix

  Int default_seed_mismatches = select_first([seed_mismatches, 2])
  Int default_palindrome_clip_threshold = select_first([palindrome_clip_threshold, 30])
  Int default_simple_clip_threshold = select_first([simple_clip_threshold, 12])
  String default_output_prefix = select_first([
    output_prefix, basename(for_reads, ".fq.gz")
  ])

  command {
  trimmomatic \
    PE -phred33 ${for_reads} ${rev_reads} \
    ${default_output_prefix}_trimmed_1.fq.gz \
    ${default_output_prefix}_unpaired_1.fq.gz \
    ${default_output_prefix}_trimmed_2.fq.gz \
    ${default_output_prefix}_unpaired_2.fq.gz \
    ILLUMINACLIP:${adapters_fa}:${default_seed_mismatches}:${default_palindrome_clip_threshold}:${default_simple_clip_threshold}
  }

  runtime {
    docker: "broadinstitute/viral-ngs"
  }

  output {
    File trimmed_1_fastq_gz = "${default_output_prefix}_trimmed_1.fq.gz"
    File trimmed_2_fastq_gz = "${default_output_prefix}_trimmed_2.fq.gz"
    File unpaired_1_fastq_gz = "${default_output_prefix}_unpaired_1.fq.gz"
    File unpaired_2_fastq_gz = "${default_output_prefix}_unpaired_2.fq.gz"
  }
}

task last {
  File for_reads
  File rev_reads
  File ref_genome

  command {
    lastdb -uNEAR -R01 humandb ${ref_genome}
    lastal -Q1 humandb ${for_reads} ${rev_reads} | last-split > myalns.maf
    maf-convert sam myalns.maf > myalns.sam
    samtools view -S -b -T ${ref_genome} myalns.sam | samtools sort > myalns.sorted.bam
    samtools index myalns.sorted.bam
  }

  output {
    File maf = "myalns.maf"
    File bam = "myalns.sorted.bam"
    File bam_index = "myalns.sorted.bam.bai"
  }

  runtime {
    docker: "dxnishill/last"
  }
}

task picard_mark_dup {
  File input_bam
  String? output_prefix
  String default_output_prefix = select_first([
    output_prefix, basename(input_bam, ".bam")
  ])

  String docker_image = "quay.io/biocontainers/picard:2.20.6--0"

  command {
    set -x
    java -jar /usr/picard/picard.jar MarkDuplicates REMOVE_DUPLICATES=true I=${input_bam} O=${default_output_prefix}.mkdup.bam M=marked_dup_metrics.txt
  }

  runtime {
    docker: "broadinstitute/picard"
  }

  output {
    File output_bam = "${default_output_prefix}.mkdup.bam"
  }
}

task samtools_index {
  File input_bam
  String base = basename(input_bam)

  command {
    samtools index ${input_bam} ${base}.bai
  }

  output {
    File output_bam_index = "${base}.bai"
  }

  runtime {
    docker: "quay.io/biocontainers/samtools:1.6--h244ad75_4"
  }
}

task vphaser2 {
    File bam
    File bam_index

    command {
        mkdir /output
        OMP_NUM_THREADS=16 variant_caller -i ${bam} -o /output
        tar cf output.tar /output
    }

    output {
        File output_files = "output.tar"
    }

    runtime {
      docker: "quay.io/biocontainers/vphaser2:2.0--h43925dd_8"
    }
}

task snpEff {
  String ref_genome
  File vcf_in

  command {
    java -jar /opt/snpEff/snpEff.jar eff -v -formatEFF ${ref_genome} ${vcf_in} > snpEff_output.vcf
  }

  runtime {
    docker: "maxulysse/snpeff"
  }

  output {
    File vcf_output = select_first(glob("snpEff_output.vcf"))
  }
}

workflow multiple_tasks {
  File for_reads
  File rev_reads
  File index_tar_gz
  String? output_prefix

  # picard_markDuplicates
  File input_bam

  # trimmomatic
  #Array[File] fastq_gz
  File adapters_fa
  Int? seed_mismatches
  Int? palindrome_clip_threshold
  Int? simple_clip_threshold
  # String? output_prefix

  # last/lastal
  File ref_genome

  # snpEff
  String ref_genome_snpEff
  File vcf_in

  call bmtagger {
    input:
      reads1 = for_reads,
      reads2 = rev_reads,
      index_tar_gz = index_tar_gz,
      output_prefix = output_prefix
  }

  call trimmomatic {
    input:
      for_reads = bmtagger.clean_for_reads,
      rev_reads = bmtagger.clean_rev_reads,
      adapters_fa = adapters_fa,
      seed_mismatches = seed_mismatches,
      palindrome_clip_threshold = palindrome_clip_threshold,
      simple_clip_threshold = simple_clip_threshold,
      output_prefix = output_prefix
  }

  call last {
    input:
      for_reads = bmtagger.clean_for_reads,
      rev_reads = bmtagger.clean_rev_reads,
      ref_genome = ref_genome
  }

  call picard_mark_dup {
    input:
      input_bam = last.bam,
      output_prefix = output_prefix
  }

  call samtools_index {
    input:
      input_bam = picard_mark_dup.output_bam
   }

  call vphaser2 {
    input:
      bam = picard_mark_dup.output_bam,
      bam_index = samtools_index.output_bam_index
  }

  call snpEff {
    input:
      ref_genome = ref_genome_snpEff,
      vcf_in = vcf_in
  }

  output {
    File clean_for_reads = bmtagger.clean_for_reads
    File? clean_rev_reads = bmtagger.clean_rev_reads
    File output_bam = picard_mark_dup.output_bam
    File trimmed_1_fastq_gz = trimmomatic.trimmed_1_fastq_gz
    File trimmed_2_fastq_gz = trimmomatic.trimmed_2_fastq_gz
    File unpaired_1_fastq_gz = trimmomatic.unpaired_1_fastq_gz
    File unpaired_2_fastq_gz = trimmomatic.unpaired_2_fastq_gz
    File maf = last.maf
    File bam = last.bam
    File bam_index = last.bam_index
    File output_files = vphaser2.output_files
    File vcf_output = snpEff.vcf_output
  }
}
