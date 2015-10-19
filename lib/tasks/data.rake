namespace :data do
  desc "Seed basic entities into the database"
  task seed_models: :environment do
    User.transaction do

      george = User.find_or_initialize_by(dxuser: "george.fdauser")
      george.update!(
        private_files_project: "project-BgbZ27Q0F3xvq3JgY02VGpb3",
        public_files_project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        private_comparisons_project: "project-BgbZ27Q0bYz6475PP42gjbP9",
        public_comparisons_project: "project-BgbZ2800zZqp0qk1Qj2VvKP2",
        open_files_count: 0,
        closing_files_count: 0,
        pending_comparisons_count: 0,
        pending_jobs_count: 0,
        schema_version: 1
      )

      dx = Org.find_or_initialize_by(handle: 'dnanexus')
      dx.update!(
        name: "DNAnexus, Inc.",
        admin_id: george.id
      )

      george.update!(
        org_id: dx.id
      )

      evan = User.find_or_initialize_by(dxuser: "eworley.fda")
      evan.update!(
        private_files_project: "project-Bgggq7Q0VvgYy1K3GbjpPfG5",
        public_files_project: "project-Bgggq7j003pzF4zY50967jQv",
        private_comparisons_project: "project-Bgggq7Q0fPx7Fj1JFxjZFYP3",
        public_comparisons_project: "project-Bgggq8009FP0KxQK809G6Bjg",
        open_files_count: 0,
        closing_files_count: 0,
        pending_comparisons_count: 0,
        pending_jobs_count: 0,
        org_id: dx.id,
        schema_version: 1
      )

      fahd = User.find_or_initialize_by(dxuser: "fahdoo_fda1")
      fahd.update!(
        private_files_project: "project-Bgj75980Y9XQKxQK809G6KGK",
        public_files_project: "project-Bgj759Q0XKbz5zzJ489Kb8gY",
        private_comparisons_project: "project-Bgj75980byj44J962j98g8qB",
        public_comparisons_project: "project-Bgj759Q0QXYVz65ZBJjpjPBz",
        open_files_count: 0,
        closing_files_count: 0,
        pending_comparisons_count: 0,
        pending_jobs_count: 0,
        org_id: dx.id,
        schema_version: 1
      )

      na12878 = Biospecimen.find_or_initialize_by(name: "NA12878")
      na12878.update!(description: "CEPH/Utah pedigree 1463, mother of proband", user_id: george.id)

      UserFile.unscoped.find_or_initialize_by(dxid: "file-Bb1FG900bZ430X20Zk86Y6V3").update!(
        project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        name: "SRR504516.vcf.gz",
        state: "closed",
        user_id: george.id,
        biospecimen_id: na12878.id,
        public: true,
        parent: george,
        file_size: 2307445
      )

      UserFile.unscoped.find_or_initialize_by(dxid: "file-Bb1FG9Q0bZ4Gvj6fYk858Py1").update!(
        project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        name: "SRR504516.vcf.gz.tbi",
        state: "closed",
        user_id: george.id,
        biospecimen_id: na12878.id,
        public: true,
        parent: george,
        file_size: 230078
      )

      UserFile.unscoped.find_or_initialize_by(dxid: "file-BgxXXV80y0y3z439qGf92VpJ").update!(
        project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        name: "NA12878-Garvan-Vial1.hc.vqsr.vcf.gz.tbi",
        state: "closed",
        user_id: george.id,
        biospecimen_id: na12878.id,
        public: true,
        parent: george,
        file_size: 1657263
      )

      UserFile.unscoped.find_or_initialize_by(dxid: "file-BgxXXq80ffYk1jkQpxXYgkxv").update!(
        project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        name: "NA12878-Garvan-Vial1.hc.vqsr.vcf.gz",
        state: "closed",
        user_id: george.id,
        biospecimen_id: na12878.id,
        public: true,
        parent: george,
        file_size: 265168616
      )

      UserFile.unscoped.find_or_initialize_by(dxid: "file-BgxXQQQ0109KGGkjvbgkkB4X").update!(
        project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        name: "NA12878-NISTv2.19.bed",
        state: "closed",
        user_id: george.id,
        biospecimen_id: na12878.id,
        public: true,
        parent: george,
        file_size: 76811421
      )

      UserFile.unscoped.find_or_initialize_by(dxid: "file-BgxXQY001095gqgxpVgf1g2Q").update!(
        project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        name: "NA12878-NISTv2.19.vcf.gz",
        state: "closed",
        user_id: george.id,
        biospecimen_id: na12878.id,
        public: true,
        parent: george,
        file_size: 344226513
      )

      UserFile.unscoped.find_or_initialize_by(dxid: "file-BgxXQq801099JpB8kVgZYzFb").update!(
        project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        name: "NA12878-NISTv2.19.vcf.gz.tbi",
        state: "closed",
        user_id: george.id,
        biospecimen_id: na12878.id,
        public: true,
        parent: george,
        file_size: 1476961
      )

      UserFile.unscoped.find_or_initialize_by(dxid: "file-Bb1FG900bZ430X20Zk86Y6V3").update!(
        project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        name: "SRR504516.vcf.gz",
        state: "closed",
        user_id: george.id,
        biospecimen_id: na12878.id,
        public: true,
        parent: george,
        file_size: 2307445
      )

      UserFile.unscoped.find_or_initialize_by(dxid: "file-Bb1FG9Q0bZ4Gvj6fYk858Py1").update!(
        project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        name: "SRR504516.vcf.gz.tbi",
        state: "closed",
        user_id: george.id,
        biospecimen_id: na12878.id,
        public: true,
        parent: george,
        file_size: 230078
      )

      App.find_or_initialize_by(title: "Example App 4 Debugging").update!(
        series: "-george.fdauser-debug",
        dxid: "app-BjPzf380zBFQBf9qg0X7BfBx",
        project: nil,
        version: "1.0.0",
        is_latest: true,
        is_applet: false,
        name: "debug",
        title: "Example App 4 Debugging",
        readme: "This is an example application. Here you would normally see a big README (format TBD; markdown or CKeditor?).",
        user_id: george.id,
        scope: "public",
        spec: {
          input_spec: [
            {
              "name": "required_file",
              "class": "file",
              "optional": false,
              "patterns": ["*.bed"],
              "label": "Required file",
              "help": "Enter here a file that we will use blah blah."
            },
            {
              "name": "optional_file",
              "class": "file",
              "optional": true,
              "patterns": ["*.bed"],
              "label": "Optional file",
              "help": "Enter here an optional file that we will use blah blah bloh. If you supply this file, we'll do this and that."
            },
            {
              "name": "required_number",
              "class": "int",
              "optional": false,
              "label": "Number of apples",
              "help": "How many apples would you like to eat?"
            },
            {
              "name": "required_default_number",
              "class": "int",
              "optional": false,
              "label": "Number of oranges",
              "default": 40,
              "help": "How many oranges would you like to eat?"
            },
            {
              "name": "optional_string",
              "class": "string",
              "optional": true,
              "label": "Prefix",
              "help": "Enter the prefix for the generated files"
            },
            {
              "name": "trim",
              "class": "boolean",
              "optional": false,
              "label": "Trim reads?",
              "help": "If selected, reads will be trimmed."
            },
            {
              "name": "required_string",
              "class": "string",
              "optional": false,
              "label": "Instrument",
              "help": "Choose the instrument you'd like to simulate",
              "choices": ["MiSeq", "HiSeq 2500"]
            }
          ],
          output_spec: [
            {
              "name": "fastq",
              "class": "file",
              "optional": false,
              "patterns": ["*.fastq.gz"],
              "label": "Generated fastq",
              "help": "The generated fastq file"
            },
            {
              "name": "fastq2",
              "class": "file",
              "optional": true,
              "patterns": ["*.fastq.gz"],
              "label": "Right generated fastq",
              "help": "The second generated fastq file (if at all)"
            }
          ],
          internet_access: false,
          instance_type: "baseline-4"
        },
        internal: {
          ordered_assets: [],
          packages: [],
          code: "#!/bin/bash\necho hello"
        }
      )

      App.find_or_initialize_by(series: "-george.fdauser-hive-insilico").update!(
        title: "HIVE Insilico for GRCh37",
        dxid: "app-BjX5P2001F27gX51vZb6BYpf",
        project: nil,
        version: "1.0.3",
        is_latest: true,
        is_applet: false,
        name: "hive-insilico",
        readme: "HIVE Insilico is a FASTQ generator that can simulate single- or paired-end sequencing from the GRCh37 human reference genome.",
        user_id: george.id,
        scope: "public",
        spec: {
          input_spec: [
            {
              "patterns": [ "*.vcf", "*.vcf.gz" ],
              "label": "Variants VCF",
              "help": "A VCF file with the variants to spike in to the simulated reads.",
              "name": "variants_vcf",
              "class": "file"
            },
            {
              "patterns": ["*.bed"],
              "class": "file",
              "name": "targets_bed",
              "label": "Targets BED",
              "optional": true,
              "help": "A BED file containing intervals in the reference genome from which to simulate reads."
            },
            {
              "name": "number_of_reads",
              "class": "int",
              "default": 1000000,
              "label": "Number of reads to generate",
              "help": "The number of reads (or read pairs, if paired-end is chosen) to generate."
            },
            {
              "name": "padding",
              "class": "int",
              "optional": true,
              "label": "Padding to add around targets",
              "help": "The number of bases to pad each target interval, to aid in simulation when targets are smaller than the read length."
            },
            {
              "name": "noise",
              "class": "int",
              "optional": true,
              "label": "Noise (%) to simulate",
              "help": "The amount of white noise to simulate. A value of 1 means that 1% of white noise will be added."
            },
            {
              "name": "read_length",
              "class": "int",
              "default": 100,
              "label": "Read length",
              "help": "The length of the reads to simulate.",
            },
            {
              "name": "paired_end",
              "class": "boolean",
              "default": true,
              "label": "Simulate paired-end reads?",
              "help": "If selected, the app will generate two FASTQ files, simulating a paired-end sequencing experiment.",
            },
            {
              "name": "min_paired_size",
              "label": "Minimum paired-end fragment size",
              "class": "int",
              "default": 180,
              "help": "The minimum size of the fragments to simulate paired-end sequencing from. (Subtracting two times the read length from this value will yield the minimum distance between the two reads.)"
            },
            {
              "name": "max_paired_size",
              "label": "Maximum paired-end fragment size",
              "class": "int",
              "default": 250,
              "help": "The maximum size of the fragments to simulate paired-end sequencing from. (Subtracting two times the read length from this value will yield the maximum distance between the two reads.)"
            },
            {
              "name": "output_prefix",
              "label": "Prefix for output files",
              "class": "string",
              "optional": true,
              "help": "A prefix to use when naming the output files."
            }
          ],
          output_spec: [
            {
              "name": "fastq",
              "class": "file",
              "optional": false,
              "patterns": ["*.fastq.gz"],
              "label": "Generated FASTQ",
              "help": "The generated fastq file"
            },
            {
              "name": "fastq2",
              "class": "file",
              "optional": true,
              "patterns": ["*.fastq.gz"],
              "label": "Second generated FASTQ",
              "help": "The second generated fastq file (if paired-end sequencing is selected)"
            }
          ],
          internet_access: false,
          instance_type: "baseline-8"
        },
        internal: {
          ordered_assets: [],
          packages: ["libmysqlclient18"],
          code: "#!/bin/bash\necho hello"
        }
      )

      App.find_or_initialize_by(series: "-george.fdauser-bwa-freebayes").update!(
        title: "BWA-MEM and FreeBayes",
        dxid: "app-BjX5k5Q0FVJ7gX51vZb6BYq0",
        project: nil,
        version: "1.0.0",
        is_latest: true,
        is_applet: false,
        name: "bwa-freebayes",
        readme: "A mapping and variation calling pipeline that uses the following steps:<p>&nbsp;</p><p><ul><li>BWA-MEM (v0.7.12-r1039), to map reads to the GRCh37 reference genome.</li><li>Bamsormadup (v2.0.8) to sort and deduplicate the mappings.</li><li>FreeBayes (v0.9.20) to call variants.</li></ul></p><p>This app supports several options. See each individual options's help for more information.</p>",
        user_id: george.id,
        scope: "public",
        spec: {
          input_spec: [
            {
              "name": "reads",
              "label": "Reads",
              "help": "A file, in gzipped FASTQ format, with the first read mates to be mapped.",
              "class": "file",
              "patterns": ["*.fq.gz", "*.fastq.gz"]
            },
            {
              "name": "reads2",
              "label": "Reads (second mates)",
              "help": "A file, in gzipped FASTQ format, with the second read mates to be mapped.",
              "class": "file",
              "optional": true,
              "patterns": ["*.fq.gz", "*.fastq.gz"]
            },
            {
              "name": "sample",
              "label": "Sample ID",
              "help": "A string (without spaces) describing the sample, which will appear in the read group information in the BAM file and in the sample information in the VCF file.",
              "class": "string"
            },
            {
              "name": "read_group_id",
              "label": "Read group ID",
              "help": "(Optional) A string (without spaces) denoting the read group id (usually a flowcell and a lane) which will appear in the read group information in the BAM file. If not given, the read group id will be assigned the same value as the sample id.",
              "class": "string",
              "optional": true
            },
            {
              "name": "mark_as_secondary",
              "label": "Mark shorter split hits as secondary?",
              "help": "If long reads are split among multiple locations in the genome (because different parts of the same read align to different locations), select this to mark the shorter ones as secondary alignments. This will ensure better compatibility with tools that are not designed for multiple primary split alignments. This will supply the '-M' option to 'bwa mem'.",
              "class": "boolean",
              "optional": true,
              "default": true
            },
            {
              "name": "standard_filters",
              "label": "Apply standard FreeBayes filters?",
              "help": "Select this to use stringent input base and mapping quality filters, which may reduce false positives. This will supply the '--standard-filters' option to FreeBayes.",
              "class": "boolean",
              "default": true
            },
            {
              "name": "normalize_variants",
              "label": "Normalize variants representation?",
              "help": "Select this to use 'bcftools norm' in order to normalize the variants representation, which may help with downstream compatibility.",
              "class": "boolean",
              "default": true
            },
            {
              "name": "parallelized",
              "label": "Perform FreeBayes parallelization?",
              "help": "Select this to parallelize freebayes using multiple threads. This will use the 'freebayes-parallel' script from the FreeBayes package, with a granularity of 3 million base pairs. WARNING: This option may be incompatible with certain advanced command-line options.",
              "class": "boolean",
              "default": true
            },
            {
              "name": "genotype_qualities",
              "label": "Report VCF genotype qualities?",
              "help": "Select this to have freebayes report genotype qualities.",
              "class": "boolean",
              "default": true
            }
          ],
          output_spec: [
            {
              "name": "sorted_bam",
              "label": "Sorted mappings",
              "help": "A coordinate-sorted BAM file with the resulting mappings.",
              "class": "file",
              "patterns": ["*.bam"]
            },
            {
              "name": "sorted_bai",
              "label": "Sorted mappings index",
              "help": "The associated BAM index file.",
              "class": "file",
              "patterns": ["*.bai"]
            },
            {
              "name": "variants_vcfgz",
              "label": "Variants",
              "help": "A bgzipped VCF file with the called variants.",
              "class": "file",
              "patterns": ["*.vcf.gz"]
            },
            {
              "name": "variants_tbi",
              "label": "Variants index",
              "help": "A tabix index (TBI) file with the associated variants index.",
              "class": "file",
              "patterns": ["*.tbi"]
            }
          ],
          internet_access: false,
          instance_type: "baseline-32"
        },
        internal: {
          ordered_assets: [],
          packages: [],
          code: "#!/bin/bash\necho hello"
        }
      )

    end
  end
end
