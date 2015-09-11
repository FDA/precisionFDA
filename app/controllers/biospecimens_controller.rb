class BiospecimensController < ApplicationController
  def index
    @toolbar = {
      fixed: [
        {icon: "fa fa-plus-square fa-fw", label: "Add Biospecimen", link: new_biospecimen_path}
      ]
    }

    @biospecimens = initialize_grid(Biospecimen,
      order: 'id',
      order_direction: 'desc',
      per_page: 100
    )
  end

  def show
    @biospecimen = Biospecimen.find_by("biospecimen.id = ?", params[:id])
  end

  def new
  end
end
