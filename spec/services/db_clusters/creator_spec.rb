require "rails_helper"

describe DbClusters::Creator do
  let(:user) { create(:user) }
  let(:api) { instance_double(DNAnexusAPI) }

  describe "#call" do
    let(:opts) do
      {
        user: user,
        project: "project-1234567",
        scope: Scopes::SCOPE_PRIVATE,
        name: "Test",
        engine: DbCluster::ENGINE_MYSQL,
        engineVersion: "5.7.12",
        dxInstanceClass: DbCluster::DX_INSTANCE_CLASSES.keys.first,
        description: "description",
        adminPassword: "password",
      }
    end

    let(:describe_response) do
      {
        id: "dbcluster-123",
        project: opts[:project],
        name: opts[:name],
        status: "creating",
        statusAsOf: 1.minute.ago.to_i * 1000, # milliseconds
        engine: opts[:engine],
        engineVersion: opts[:engineVersion],
        dxInstanceClass: opts[:dxInstanceClass],
      }
    end

    it "creates DB cluster in the platforma and stores it in the database" do
      allowed_params_for_new = DXClient::Endpoints::DbClusters::DB_CLUSTER_NEW_ALLOWED_PARAMS

      allow(api).to receive(:dbcluster_new).
        with(opts.slice(*allowed_params_for_new)).
        and_return({ id: describe_response[:id] })

      allow(api).to receive(:dbcluster_describe).with(describe_response[:id]).
        and_return(describe_response)

      expect { described_class.call(api, opts) }.to change(DbCluster, :count).by(1)
    end
  end
end
