class UsersController < ApplicationController
  skip_before_action :require_login,     only: [:show]
  before_action :require_login_or_guest, only: [:show]

  def show
    @user = User.find_by!(dxuser: params[:username])

    @counts = {
      notes: @user.notes.accessible_by_public.order(id: :desc).count,
      files: @user.real_files.accessible_by_public.count,
      comparisons: @user.comparisons.accessible_by_public.count,
      apps: @user.app_series.accessible_by_public.count
    }

    if !params.has_key?(:tab)
      if @counts[:notes] > 0
        params[:tab] = 'notes'
      elsif @counts[:files] > 0
        params[:tab] = 'files'
      elsif @counts[:comparisons] > 0
        params[:tab] = 'comparisons'
      elsif @counts[:apps] > 0
        params[:tab] = 'apps'
      end
    end

    if params[:tab] == 'notes' && @counts[:notes] > 0
      @notes = @user.notes.accessible_by_public.order(id: :desc)
    elsif params[:tab] == 'files' && @counts[:files] > 0
      @files_grid = initialize_grid(@user.real_files.accessible_by_public, {
        name: 'files',
        order: 'user_files.created_at',
        order_direction: 'desc',
        per_page: 25,
        include: [:user, {user: :org}]
      })
    elsif params[:tab] == 'comparisons' && @counts[:comparisons] > 0
      @comparisons_grid = initialize_grid(@user.comparisons.accessible_by_public, {
        name: 'comparisons',
        order: 'comparisons.id',
        order_direction: 'desc',
        per_page: 25,
        include: [:user, {user: :org}]
      })
    elsif params[:tab] == 'apps' && @counts[:apps] > 0
      @apps_grid = initialize_grid(@user.app_series.accessible_by_public.joins(:latest_version_app), {
        name: 'apps',
        order: 'apps.created_at',
        order_direction: 'desc',
        per_page: 25,
        include: [{user: :org}, :latest_version_app]
      })
    end
  end

  def report
    @user = User.find_by!(dxuser: params[:username])
    unless @context.user_id == @user.id && @user.can_run_reports?
      redirect_to user_path(params[:username])
      return
    end
    Axlsx::Package.new do |p|
      p.use_autowidth = true
      Time.use_zone ActiveSupport::TimeZone.new('America/New_York') do
        p.workbook.add_worksheet(:name => "Users") do |sheet|
          sheet.add_row ["", "", "username", "first name", "last name", "email", "provisioned at", "last login"]
          Org.order(:name).all.each do |org|
            ["name", "handle", "address", "phone"].each do |label|
              sheet.add_row ["Organization #{label}:", org.send(label)]
            end
            users = [org.admin] + org.users.order(:dxuser).all.reject { |u| u.id == org.admin_id }
            users.each do |user|
              role = user.id == org.admin_id ? "Admin:" : "Member:"
              sheet.add_row [role, "", user.dxuser, user.first_name, user.last_name, user.email, user.created_at.strftime("%Y-%m-%d %H:%M"), user.last_login ? user.last_login.strftime("%Y-%m-%d %H:%M") : ""]
            end
            sheet.add_row
          end
        end
        p.workbook.add_worksheet(:name => "Requests") do |sheet|
          sheet.add_row ["time", "first name", "last name", "email", "organization", "self-represent?", "address", "phone", "duns", "research?", "clinical?", "has data?", "has software?", "reason" ]
          Invitation.find_each do |inv|
            row = []
            row << inv.created_at.strftime("%Y-%m-%d %H:%M")
            row += [inv.first_name, inv.last_name, inv.email, inv.org, inv.singular, inv.address, inv.phone, inv.duns, inv.research_intent, inv.clinical_intent, inv.req_data, inv.req_software, inv.req_reason]
            sheet.add_row row
          end
        end
        filename = Time.current.strftime("precisionfda-report-%Y-%m-%d.xlsx")

        send_data p.to_stream.read, filename: filename, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        return
      end
    end
  end
end
