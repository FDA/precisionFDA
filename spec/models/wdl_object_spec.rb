require "rails_helper"

RSpec.describe WDLObject, type: :model do
  subject(:wdl_object) { described_class.new(raw) }
  subject(:wdl_object2) { described_class.new(raw2) }

  let(:raw) { File.read(Rails.root.join("spec/support/files/workflow_import/wdl/wdl_sample_1.wdl")) }
  let(:raw2) { File.read(Rails.root.join("spec/support/files/workflow_import/wdl/wdl_sample_2.wdl")) }

  describe "#valid?" do
    context "when WDL is correct" do
      it "is valid" do
        expect(wdl_object).to be_valid
      end
    end

    context "when WDL doesn't include workflow section" do
      it "is not valid" do
        wdl_object.instance_variable_set(:@workflow, nil)
        expect(wdl_object).to be_invalid
      end
    end

    context "when WDL doesn't include any task section" do
      it "is not valid" do
        wdl_object.instance_variable_set(:@tasks, [])
        expect(wdl_object).to be_invalid
      end
    end

    context "when any task is invalid" do
      it "is not valid" do
        wdl_object.tasks.first.instance_variable_set(:@name, nil)
        expect(wdl_object).to be_invalid
      end
    end

    context "when workflow is invalid" do
      it "is not valid" do
        wdl_object.workflow.instance_variable_set(:@name, nil)
        expect(wdl_object).to be_invalid
      end
    end

    context "when call statements do not match task names" do
      it "is not valid" do
        new_tasks = wdl_object.tasks[0..-2]
        wdl_object.instance_variable_set(:@tasks, new_tasks)
        expect(wdl_object).to be_invalid
      end
    end
  end

  describe "#workflow" do
    it "creates a valid workflow" do
      expect(wdl_object.workflow).to be_valid
    end
  end

  describe "#tasks" do
    subject(:tasks) { wdl_object.tasks }

    it "creates valid tasks" do
      expect(tasks).to all(be_valid)
    end

    it "creates 7 tasks" do
      expect(tasks.size).to eq(7)
    end

    it "sets correct links between inputs/outputs" do
      actual_links = tasks.each_with_object({}) do |task, tasks_memo|
        tasks_memo[task.name.to_sym] =
          task.inputs.each_with_object({}) do |input, inputs_memo|
            inputs_memo[input.name.to_sym] =
              [input.linked_task.try(:name), input.linked_output.try(:name)]
          end
      end

      expect(actual_links).to include(inputs_outputs_expected_mapping)
    end

    it "sorts tasks in accordance with call statements" do
      task_names = tasks.map(&:name)
      call_names = wdl_object.workflow.calls.map(&:name)

      expect(task_names).to eq(call_names)
    end

    it "sets correct next/prev links between tasks" do
      actual_links = tasks.each_with_object({}) do |task, memo|
        memo[task.name.to_sym] = {
          prev: task.prev_task.try(:name),
          next: task.next_task.try(:name),
        }
      end

      expect(actual_links.size).to eq(7)
      expect(actual_links).to include(prev_next_tasks_expected_mapping)
    end

    def prev_next_tasks_expected_mapping
      {
        bmtagger: { prev: nil, next: "trimmomatic" },
        trimmomatic: { prev: "bmtagger", next: "last" },
        last: { prev: "trimmomatic", next: "picard_mark_dup" },
        picard_mark_dup: { prev: "last", next: "samtools_index" },
        samtools_index: { prev: "picard_mark_dup", next: "vphaser2" },
        vphaser2: { prev: "samtools_index", next: "snpEff" },
        snpEff: { prev: "vphaser2", next: nil },
      }
    end

    def inputs_outputs_expected_mapping # rubocop:disable Metrics/MethodLength
      {
        bmtagger: hash_including(
          reads1: [nil, nil],
          reads2: [nil, nil],
          index_tar_gz: [nil, nil],
          output_prefix: [nil, nil],
        ),
        trimmomatic: hash_including(
          for_reads: %w(bmtagger clean_for_reads),
          rev_reads: %w(bmtagger clean_rev_reads),
          adapters_fa: [nil, nil],
          seed_mismatches: [nil, nil],
          palindrome_clip_threshold: [nil, nil],
          simple_clip_threshold: [nil, nil],
          output_prefix: [nil, nil],
        ),
        last: hash_including(
          for_reads: %w(bmtagger clean_for_reads),
          rev_reads: %w(bmtagger clean_rev_reads),
          ref_genome: [nil, nil],
        ),
        picard_mark_dup: hash_including(
          input_bam: %w(last bam),
          output_prefix: [nil, nil],
        ),
        samtools_index: hash_including(
          input_bam: %w(picard_mark_dup output_bam),
        ),
        vphaser2: hash_including(
          bam: %w(picard_mark_dup output_bam),
          bam_index: %w(samtools_index output_bam_index),
        ),
        snpEff: hash_including(
          ref_genome: [nil, nil],
          vcf_in: [nil, nil],
        ),
      }
    end
  end

  describe "#to_s" do
    it "includes workflow" do
      wdl = wdl_object.to_s

      expect(wdl).to include("workflow multiple_tasks")
    end

    context "when task names are passed" do
      it "includes only those tasks" do
        wdl = wdl_object.to_s(%w(trimmomatic samtools_index))

        expect(wdl).to include(
          "task trimmomatic",
          "task samtools_index",
        )

        expect(wdl).not_to include(
          "task bmtagger",
          "task last",
          "task picard_mark_dup",
          "task vphaser2",
          "task snpEff",
        )
      end

      it "includes only related calls" do
        wdl = wdl_object.to_s(%w(picard_mark_dup last))

        expect(wdl).to include(
          "call picard_mark_dup",
          "call last",
        )

        expect(wdl).not_to include(
          "call bmtagger",
          "call samtools_index",
          "call trimmomatic",
          "call vphaser2",
          "call snpEff",
        )
      end
    end

    context "when nothing is passed" do
      it "includes all tasks" do
        wdl = wdl_object.to_s

        expect(wdl).to include(
          "task bmtagger",
          "task trimmomatic",
          "task last",
          "task picard_mark_dup",
          "task samtools_index",
          "task vphaser2",
          "task snpEff",
        )
      end

      it "includes all calls" do
        wdl = wdl_object.to_s

        expect(wdl).to include(
          "call bmtagger",
          "call trimmomatic",
          "call last",
          "call picard_mark_dup",
          "call samtools_index",
          "call vphaser2",
          "call snpEff",
        )
      end
    end
  end

  describe "parsing of inputs for sample 2 (inputs wrapped in input)" do
    subject(:tasks) { wdl_object2.tasks }

    it "test inputs' values" do
      inputs = tasks[0].inputs.to_s

      expect(inputs).to include(
        "File reads1",
        "File? reads2",
        "File index_tar_gz",
        "String? output_prefix",
      )
    end
  end
end
