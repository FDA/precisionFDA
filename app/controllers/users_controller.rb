class UsersController < ApplicationController
  def index
    myself = User.find(@context.user_id)
    if myself.org_id.present?
      users = User.where(org_id: myself.org_id)
    else
      users = User.where(id: @context.user_id)
    end
    @users_grid = initialize_grid(users,{
      order: 'dxuser',
      order_direction: 'asc',
      include: :org,
      per_page: 100
    })
  end

  def show
    @user = User.find_by!(dxuser: params[:username])
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
              sheet.add_row [role, "", user.dxuser, user.first_name, user.last_name, user.email, user.created_at, user.last_login]
            end
            sheet.add_row
          end
        end
        p.workbook.add_worksheet(:name => "Requests") do |sheet|
          sheet.add_row ["time", "first name", "last name", "email", "organization", "self-represent?", "address", "phone", "duns", "research?", "clinical?", "has data?", "has software?", "reason" ]
          Invitation.find_each do |inv|
            row = []
            row << inv.created_at.strftime("%Y-%m-%d-%H:%M")
            row += [inv.first_name, inv.last_name, inv.email, inv.org, inv.singular, inv.address, inv.phone, inv.duns, inv.research_intent, inv.clinical_intent, inv.req_data, inv.req_software, inv.req_reason]
            sheet.add_row row
          end
        end
        filename = Time.now.strftime("precisionfda-report-%Y-%m-%d-%H:%M.xlsx")

        send_data p.to_stream.read, filename: filename, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        return
      end
    end
  end
end
