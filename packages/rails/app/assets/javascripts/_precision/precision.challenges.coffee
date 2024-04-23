window.Precision ||= {}

window.Precision.challenges =
  suggestions: [
    {
      title: "Truth Challenge (HG001)"
      name: "NA12878-NISTv2.19"
      benchmark:
        VCF:
          uid: "file-Bk50V4Q0qVb65P0v2VPbfYPZ-1"
          name: "NA12878-NISTv2.19.vcf.gz"
        BED:
          uid: "file-Bk50V4Q0qVb4p8J8kkXpYZ4P-1"
          name: "NA12878-NISTv2.19.bed"
    },
    {
      title: "Truth Challenge (HG001)"
      name: "NA12878-GIABv3.2"
      benchmark:
        VCF:
          uid: "file-Bx46ZqQ04Pz5Bq3x20pkBXP4-1"
          name: "NA12878_GIAB_highconf_CG-IllFB-IllGATKHC-Ion-Solid_ALLCHROM_v3.2_highconf.vcf.gz"
        BED:
          uid: "file-Bx46ZZQ0YKk7G2PZ74pZVKkk-1"
          name: "NA12878_GIAB_highconf_CG-IllFB-IllGATKHC-Ion-Solid_ALLCHROM_v3.2_highconf.bed"
    },
    {
      title: "Truth Challenge (HG002)"
      name: "HG002-GIABv3.2"
      benchmark:
        VCF:
          uid: "file-Bx46Z4j0JVxzxjZQ9Gj23Fgj-1"
          name: "HG002_GIAB_highconf_IllFB-IllGATKHC-CG-Ion-Solid_CHROM1-22_v3.2_highconf.vcf.gz"
        BED:
          uid: "file-Bx46Z0j0ZJGKx8PZ14pXJ3kg-1"
          name: "HG002_GIAB_highconf_IllFB-IllGATKHC-CG-Ion-Solid_CHROM1-22_v3.2_highconf.bed"
    }
  ]
