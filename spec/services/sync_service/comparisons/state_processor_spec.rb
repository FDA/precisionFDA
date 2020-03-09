describe SyncService::Comparisons::StateProcessor do
  subject(:processor) { described_class.new(api) }

  let(:outputs) { { "results" => [] } }
  let(:api) { instance_double(DNAnexusAPI, system_describe_data_objects: outputs) }
  let(:comparison) { create(:comparison, user: user, state: Comparison::STATE_PENDING) }

  describe("#call") do
    let(:user) { create(:user) }

    context "when comparison's state equals to job's state" do
      let(:comparison) { create(:comparison, user: user, state: Job::STATE_DONE) }
      let(:job_result) { { "state" => Job::STATE_DONE } }

      it "does nothing" do
        expect(processor.call(user, job_result, comparison)).to eq(nil)
      end
    end

    context "when job's state is failed" do
      let(:job_result) { { "state" => Job::STATE_FAILED } }

      it "raises error" do
        expect { processor.call(user, job_result, comparison) }.
          to raise_error(SyncService::Comparisons::JobFailedError)
      end
    end

    context "when job's state is done" do
      let(:job_result) do
        {
          "state" => Job::STATE_DONE,
          "output" => { "meta" => nil },
        }
      end

      context "when meta is empty" do
        it "raises an error" do
          expect { processor.call(user, job_result, comparison) }.
            to raise_error(SyncService::Comparisons::EmptyMetaError)
        end
      end

      context "when meta is not empty" do
        let(:file_1) { "file_1" }
        let(:file_2) { "file_2" }
        let(:dxid_1) { "dxid_1" }
        let(:dxid_2) { "dxid_2" }
        let(:output_ids) { [dxid_1, dxid_2] }

        let(:meta) do
          {
            "weighted_roc" => {
              "data" => [],
            },
          }
        end

        let(:job_result) do
          {
            "state" => Job::STATE_DONE,
            "output" => {
              "meta" => meta,
              file_1 => {
                "$dnanexus_link" => dxid_1,
              },
              file_2 => {
                "$dnanexus_link" => dxid_2,
              },
            },
          }
        end

        let(:outputs) do
          {
            "results" => [
              {
                "describe" => {
                  "state" => UserFile::STATE_CLOSED,
                  "name" => "name_1",
                  "size" => "size_1",
                },
              },
              {
                "describe" => {
                  "state" => UserFile::STATE_CLOSED,
                  "name" => "name_2",
                  "size" => "size_2",
                },
              },
            ],
          }
        end

        it "gets file descriptions from the platform" do
          processor.call(user, job_result, comparison)

          expect(api).to have_received(:system_describe_data_objects).with(output_ids)
        end

        context "when description contains not closed file" do
          let(:outputs) do
            {
              "results" => [
                {
                  "describe" => {
                    "state" => UserFile::STATE_CLOSED,
                    "name" => "name_1",
                    "size" => "size_1",
                  },
                },
                {
                  "describe" => {
                    "state" => UserFile::STATE_OPEN,
                    "name" => "name_2",
                    "size" => "size_2",
                  },
                },
              ],
            }
          end

          it "raises an error" do
            expect { processor.call(user, job_result, comparison) }.
              to raise_error(SyncService::Comparisons::InvalidFileStateError)
          end
        end

        context "when outputs do not contain non-closed files" do
          let(:built_file_1) do
            {
              dxid: dxid_1,
              project: user.private_comparisons_project,
              name: "name_1",
              state: UserFile::STATE_CLOSED,
              description: file_1,
              user_id: user.id,
              scope: UserFile::SCOPE_PRIVATE,
              file_size: "size_1",
            }
          end

          let(:built_file_2) do
            {
              dxid: dxid_2,
              project: user.private_comparisons_project,
              name: "name_2",
              state: UserFile::STATE_CLOSED,
              description: file_2,
              user_id: user.id,
              scope: UserFile::SCOPE_PRIVATE,
              file_size: "size_2",
            }
          end

          it "returns correct result" do
            meta, files = processor.call(user, job_result, comparison)

            expect(meta).to eq(meta)
            expect(files.size).to eq(2)
            expect(files).to eq([built_file_1, built_file_2])
          end
        end
      end
    end
  end
end
