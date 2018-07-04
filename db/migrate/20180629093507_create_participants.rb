class CreateParticipants < ActiveRecord::Migration

  def up
    create_table :participants do |t|
      t.string :title
      t.string :image_url
      t.references :node, foreign_key: true
      t.boolean :public
      t.integer :kind, default: 0
      t.integer :position, default: 0

      t.timestamps null: false
    end
    migrate_data
  end

  def down
    drop_table :participants
  end

  def migrate_data
    Participant.create!(
      [
        { title: "Personalis", image_url: "/participants/personalis.png", kind: :org },
        { title: "Seracare", image_url: "/participants/seracare.png", kind: :org },
        { title: "Sequenom", image_url: "/participants/sequenom.png", kind: :org },
        { title: "Emory Genetics Lab", image_url: "/participants/emory.png", kind: :org },
        { title: "Roche", image_url: "/participants/roche.png", kind: :org },
        { title: "NIH", image_url: "/participants/nih.png", kind: :org },
        { title: "Broad Institute", image_url: "/participants/broad.png", kind: :org },
        { title: "DNAnexus", image_url: "/participants/dnanexus.png", kind: :org },
        { title: "Edico Genome", image_url: "/participants/edico.png", kind: :org },
        { title: "Macrogen", image_url: "/participants/macrogen.png", kind: :org },
        { title: "Human Longevity Inc.", image_url: "/participants/humanlongevity.png", kind: :org },
        { title: "Crystal Genetics", image_url: "/participants/crystal_genetics.png", kind: :org },
        { title: "Illumina", image_url: "/participants/illumina.png", kind: :org },
        { title: "23andMe", image_url: "/participants/23andme.png", kind: :org },
        { title: "GeneDx", image_url: "/participants/genedx.png", kind: :org },
        { title: "NIST", image_url: "/participants/nist.png", kind: :org },
        { title: "White House Office of Science and Technology Policy", image_url: "/participants/ostp.png", kind: :org },
        { title: "American Heart Association", image_url: "/participants/aha.png", kind: :org },
        { title: "Baylor College of Medicine", image_url: "/participants/baylor.png", kind: :org },
        { title: "Garvan", image_url: "/participants/garvan.png", kind: :org },
        { title: "US House of Representatives", image_url: "/participants/us-house-of-representatives.png", kind: :org },
        { title: "Natera", image_url: "/participants/natera.png", kind: :org },
        { title: "PharmGKB", image_url: "/participants/pharmgkb.png", kind: :org },
        { title: "Qiagen", image_url: "/participants/qiagen.png", kind: :org },
        { title: "Counsyl", image_url: "/participants/counsyl.png", kind: :org },
        { title: "Intel", image_url: "/participants/intel.png", kind: :org },
        { title: "Blueprint Genetics", image_url: "/participants/blueprint_genetics.png", kind: :org },
        { title: "Centers for Disease Control and Prevention", image_url: "/participants/cdc.png", kind: :org },
        { title: "Dr. Lester Carter", image_url: "/participants/lester_carter.jpg", kind: :person },
        { title: "Dr. Euan Ashley", image_url: "/participants/euan_ashley.jpg", kind: :person },
        { title: "Dr. Teri Klein", image_url: "/participants/teri_klein.jpg", kind: :person },
        { title: "Dr. Dennis P. Wall", image_url: "/participants/dennis_wall.jpg", kind: :person },
        { title: "Rachel Goldfeder", image_url: "/participants/rachel_goldfeder.png", kind: :person },
        { title: "Hans Nelsen", image_url: "/participants/hans_nelsen.jpg", kind: :person },
        { title: "Dr. Russ Altman", image_url: "/participants/russ_altman.jpg", kind: :person },
        { title: "Dr. Peter Tonellato", image_url: "/participants/peter_tonellato.jpg", kind: :person },
        { title: "Mark Woon", image_url: "/participants/mark_woon.jpg", kind: :person },
        { title: "Dr. Snehit Prabhu", image_url: "/participants/snehit_prabhu.jpg", kind: :person },
        { title: "Dr. Mark Wright", image_url: "/participants/mark_wright.jpg", kind: :person },
      ]
    )
  end

end
