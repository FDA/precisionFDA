# rubocop:disable Metrics/BlockLength
# rubocop:disable Metrics/MethodLength
namespace :apps do
  TTYD_CODE = <<~CODE.freeze
    #!/bin/bash
    set -e -x -o pipefail
    ttyd -p 443 dx-su-contrib
  CODE

  JUPYTER_CODE = <<~CODE.freeze
    #!/usr/bin/env bash

    set -e

    TIMEOUT_FILE='/home/dnanexus/.dx.timeout'
    HOST_PORT=443

    function set_timeout() {
        # Saves the timeout date in the timeout file
        # The timeout date is the provided number of
        # seconds (in $timedelta_in_seconds) from now
        timedelta_in_seconds=$1
        current_timestamp=$(date +%s)
        timeout_in_seconds=$((current_timestamp + timedelta_in_seconds))
        timeout_to_set=$(date -d "@$timeout_in_seconds" +'%Y-%m-%d %H:%M:%S')
        echo $timeout_to_set > $TIMEOUT_FILE
    }

    function monitor_duration {
        # Loop until it's time to quit
        echo "Running session duration monitoring"
        while true; do
            utc_now_timestamp=$(date +%s)
            timeout_timestamp=$(date -f $TIMEOUT_FILE +'%s')
            if (( $utc_now_timestamp > $timeout_timestamp )); then
                echo "The dxjupyterlab session has finished"
                dx terminate $DX_JOB_ID
            fi
            sleep 15
        done
    }

    function check_server_running {
        # This function periodically checks if the JupyterLab server inside the docker container
        # is running. If it is, it stops checking and sets a property on the current job so that
        # that clients (e.g. UI) knows the main application in the https app is up.
        echo "Checking JupyterLab server state"
        while true; do
            if curl --fail --silent --connect-timeout 2 -o /dev/null localhost:$HOST_PORT/lab; then
                echo "DXJupyterLab Server is running"
                dx set_properties $DX_JOB_ID httpsAppState=running
                break
            fi
            sleep 5
        done
    }

    main() {

        DOCKER_IMAGE=dnanexus/dxjupyterlab-r:1.0.1
        if [[ "$feature" == "ML_IP" ]]; then
            DOCKER_IMAGE=dnanexus/dxjupyterlab-ml:1.0.1
        fi

        if [[ -n $imagename && -n $snapshot ]]; then
            echo "Error: Passing both image name and snapshot is not allowed"
            exit 1
        fi

        if ls /dev/nvidia* 1>/dev/null 2>&1; then
            DOCKER_IMAGE=dnanexus/dxjupyterlab-r-cuda:1.0.1
            if [[ "$feature" == "ML_IP" ]]; then
                DOCKER_IMAGE=dnanexus/dxjupyterlab-ml-cuda:1.0.1
            fi

        fi

        # Set the docker image name
        if [ -z $imagename ]; then
            imagename=$DOCKER_IMAGE
        fi

        # Set default sandbox duration (in minutes)
        if [ -z $duration ]; then
            duration=120
        fi

        # Job duration limit is set in the $TIMEOUT file
        echo "Setting session duration to $duration minutes"
        duration_in_seconds=$((duration * 60))
        set_timeout $duration_in_seconds

        check_server_running &
        monitor_duration &

        # Load docker image from the snapshot if it was provided
        if [[ -n $snapshot ]]; then
            echo "Downloading and loading the Docker snapshot $snapshot"
            out=$(dx cat "$snapshot" | docker load)
            echo $out
            imagename=${out#Loaded image: }
        fi

        if [[ -n $cmd ]]; then
            echo "Downloading inputs"
            dx-download-all-inputs --parallel --except snapshot

            mkdir -p /home/dnanexus/out/out
            if [[ "$in" != "" ]]; then
                mv -f -- "${in_path[@]}" /home/dnanexus/out/out
            fi
        fi

        # Start JupyterLab server or run a command in a docker container
        set -x
        docker run \
            -p $HOST_PORT:8888 \
            -v /home/dnanexus:/home/dnanexus \
            -v /var/run/docker.sock:/var/run/docker.sock \
            --name=dxjupyterlab_server \
            --init \
            $imagename \
            /opt/start_jupyterlab.sh "$cmd"
        set +x

        # Upload outputs
        if [[ -n $cmd ]]; then
            echo "Uploading output files to the project"
            # Remove original inputs from folder
            cd /home/dnanexus/out/out
            if [[ "$in" != "" ]]; then
                echo "removing paths_in"
                rm -f -- "${in_name[@]}"
            fi
            dx-upload-all-outputs --parallel
        fi
    }
  CODE

  INSTANCE_TYPES = {
    "baseline-4" => "mem1_ssd1_v2_x4",
  }.freeze

  def run(app_dxid)
    api = DNAnexusAPI.for_admin

    abort "Can't find public app '*#{app_dxid}*' in the Platform" unless app_dxid

    p "Found #{app_dxid} app in the Platform"

    app_info = api.app_describe(app_dxid)

    created_by = User.find_by(dxuser: app_info["createdBy"].sub(/^user-/, "")) ||
                 ENV["CREATED_BY"].present? && User.find_by(dxuser: ENV["CREATED_BY"]) ||
                 User.find_by(dxuser: ADMIN_USER.sub(/^user-/, ""))

    abort "Can't find createdBy user for the app" unless created_by

    app_scope = Scopes::SCOPE_PUBLIC

    instance_type = app_info.dig("runSpec", "systemRequirements").values.first["instanceType"]
    baseline = INSTANCE_TYPES.invert[instance_type] || "baseline-4"

    internet_access = app_info.dig("access", "network").first == "*"
    release = app_info.dig("runSpec", "release")

    input_spec = app_info["inputSpec"].select do |spec|
      is_supported = %w(string file int boolean float).include?(spec["class"])
      p "Unhandled class #{spec['class']}" unless is_supported
      is_supported
    end

    output_spec = app_info["outputSpec"].select do |spec|
      spec["class"] = spec["class"].sub(/^array:/, "")
      %w(string file int boolean float).include?(spec["class"])
    end

    packages = app_info.dig("runSpec", "execDepends").map do |package|
      if package["package_manager"].blank? && UBUNTU_PACKAGES[release].include?(package["name"])
        package["name"]
      end
    end.compact

    ActiveRecord::Base.transaction do
      assets = app_info.dig("runSpec", "bundledDepends").map do |asset_data|
        asset_dxid = asset_data.dig("id", "$dnanexus_link")
        asset_name = asset_data["name"]

        asset = Asset.find_by(dxid: asset_dxid)

        unless asset
          described = api.file_describe(asset_dxid)

          asset = Asset.create!(
            project: described["project"],
            dxid: asset_dxid,
            name: asset_name,
            state: described["state"],
            file_size: described["size"],
            user: created_by,
            scope: Scopes::SCOPE_PUBLIC,
          )

          asset.update!(parent_type: "Asset", parent_id: asset.id)
        end

        asset
      end.compact

      app_series = create_app_series(app_info["name"], created_by, app_scope)

      app = App.create!(
        dxid: app_dxid,
        version: app_info["version"],
        revision: 1,
        title: app_info["title"],
        readme: app_info["description"],
        user: created_by,
        scope: app_scope,
        app_series: app_series,
        input_spec: input_spec,
        output_spec: output_spec,
        internet_access: internet_access,
        instance_type: baseline,
        ordered_assets: assets.map(&:uid),
        packages: packages,
        code: code(app_info["title"]),
        assets: assets,
        release: app_info.dig("runSpec", "release"),
        entity_type: app_info["httpsApp"].present? ? App::TYPE_HTTPS : App::TYPE_REGULAR,
      )

      app_series.update!(latest_revision_app: app, latest_version_app: app)
    end
  end

  def code(app_title)
    case app_title
    when "ttyd" then TTYD_CODE
    when "DNAnexus JupyterLab Server" then JUPYTER_CODE
    else
      p "The code will be empty for this app."
    end
  end

  def create_app_series(app_name, user, app_scope)
    app_series_dxid = AppSeries.construct_dxid(user.username, app_name, app_scope)

    AppSeries.create_with(
      name: app_name,
      user: user,
      scope: app_scope,
    ).find_or_create_by!(
      dxid: app_series_dxid,
    )
  end

  desc "Transfer app from the Platform by ID"
  task :transfer, [:app_dxid] => :environment do |_, args|
    abort "Please provide APP DXID to transfer" unless args.app_dxid
    abort "App already exists in pFDA" if App.find_by(dxid: args.app_dxid)

    run(args.app_dxid)
  end
end
# rubocop:enable Metrics/BlockLength
# rubocop:enable Metrics/MethodLength
