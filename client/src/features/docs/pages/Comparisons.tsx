/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Link } from 'react-router-dom'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { DocBody, DocTable, DocRow, RightSide, PageMap } from '../styles'

export const Comparisons = () => {
  useScrollToHash()

  return (
    <DocRow>
      <DocBody>
        <h1>Comparisons</h1>

        <p>
          The concept of comparing two sets of variants (VCF files) is central
          to the exploration of regulatory science, and to the evaluation of NGS
          assays; it is therefore represented as a first-class entity on
          precisionFDA.
        </p>

        <p>
          The problem of comparing VCF files constitutes an active area of
          research. The precisionFDA building crew is represented in the Global
          Alliance for Genomics and Health (GA4GH) Benchmarking Task Team, which
          is expected to provide recommendations and/or software solutions for
          comparing VCFs and for counting, classifying, and reporting results.
          We are looking forward to incorporating that work into precisionFDA,
          when it becomes available. In the meantime, we have put together an
          initial VCF comparison framework which you can use as of now on
          precisionFDA. It is based on{' '}
          <a href="https://github.com/RealTimeGenomics/rtg-tools/releases/tag/3.5.1">
            vcfeval 3.5.1
          </a>{' '}
          by Real Time Genomics (
          <a href="http://biorxiv.org/content/biorxiv/early/2015/08/03/023754.full.pdf">
            Cleary et al., 2015
          </a>
          ), and conceptually resembles "Comparison Method #3" of{' '}
          <a href="https://github.com/ga4gh/benchmarking-tools/blob/c9026448db16798684d1b89404cee764389f43f6/doc/standards/GA4GHBenchmarkingDefinitionsandPerformanceStratification.md">
            the GA4GH benchmarking definitions
          </a>
          .
        </p>

        <p>
          This initial framework compares two variant sets; a <em>test set</em>{' '}
          and a <em>benchmark set</em>. The underlying comparison methodology is
          mostly symmetric with respect to each assignment; however, reporting
          of the results is based on the assumption that the benchmark set
          represents the truth, and that the test set represents predictions.
          Therefore, the results of a comparison constitute an implicit
          evaluation of the performance of whatever method was used to generate
          the predictions.
        </p>

        <h2 id="comparisons-new">Creating a new comparison</h2>

        <p>
          To create a new comparison, click "Run Comparison". Set up your
          comparison by choosing VCF (*.vcf or *.vcf.gz) files for your test and
          benchmark sets.
        </p>

        <p>
          The comparison currently only works with VCF files reported on the
          GRCh37 human assembly, using the "GRCh37/b37" naming conventions (i.e.
          chromosomes named 1, 2, ..., X, Y, and MT). It is{' '}
          <u>not compatible</u> with the "hg19" naming conventions (i.e. with
          chromosomes named chr1, chr2, ..., chrX, chrY and chrM). In addition,
          please note that the hg19 "chrM" sequence has different length and
          content that the GRCh37 "MT" sequence, so the two aren't comparable
          anyway.
        </p>

        <p>
          Once you have chosen the input files, the "Compare" button will light
          up in the center. Click it and enter a name for your comparison to
          launch the comparison process.
        </p>

        <h2 id="comparisons-bed">BED files</h2>

        <p>
          In addition to the VCF files, you may provide up to two BED files.
          These BED files dictate the genomic regions inside which you want the
          comparison to be performed. If no BED files are provided, the
          comparison will be performed across the whole genome, and will compare
          all entries of each of the test and benchmark variant files. If a BED
          file is provided (or if two BED files are provided, in which case
          their genomic regions will be intersected into a single set of
          regions), the comparison is only done within those regions, and all
          entries that are not within those regions are ignored.
        </p>

        <p>
          This is very important in cases such as when comparing an exome test
          set to a whole-genome benchmark set: without a BED file, the
          comparison will report a lot of false negatives, as it expects the
          test set to identify all the variants contained in the benchmark set
          across the whole genome.
        </p>

        <p>
          Similarly, if a whole-genome test set is compared against a smaller
          benchmark set without a BED file, the comparison will report a lot of
          false positives, as it expects the test set to not report any variants
          in regions that are outside of the benchmark set's scope.
        </p>

        <p>
          Popular benchmark sets (such as the NA12878 NISTv2.19 calls or the
          NA12878 Illumina Platinum Genome calls) typically come with their own
          associated BED file.
        </p>

        <p>
          If you are generating your own test set by applying some NGS
          methodology on a known biospecimen (such as NA12878), and want to run
          a comparison against a benchmark set, make sure to also provide a test
          set BED file (unless you are investigating the whole genome).
          Typically the BED file will contain the genomic coordinates of the
          enrichment kit you are using, or otherwise represent the genomic
          regions that you are investigating.
        </p>

        <h2 id="comparisons-results">Understanding comparison results</h2>

        <p>
          Once launching a comparison, it will be queued for execution in the
          cloud. Its state will change from "idle" to "runnable", then "running"
          and finally "done" or "failed". Behind the scenes, a virtual cloud
          computer will run the Real Time Genomics vcfeval software to compare
          the two variant sets. A comparison can fail if the input files are not
          in the right format, or if they are not using GRCh37 conventions, or
          due to other circumstances. Debugging failed comparisons is a feature
          planned for inclusion in an upcoming update; in the meantime, we have
          also published the comparison framework as an app. If your comparison
          fails, locate the "VCF Comparison" app in the "Featured Apps" section
          and run it with the same inputs as your failed comparison. You should
          be able to access the logs and see the exact source of failure. A
          successful comparison will report several metrics, including the
          following:
        </p>

        <DocTable>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Meaning / Formula</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>True positives</td>
              <td>
                The number of variants found in the benchmark set that match
                exactly the test set.
              </td>
            </tr>
            <tr>
              <td>False positives</td>
              <td>
                The number of variants found in the test set that did not match
                exactly the benchmark set.
              </td>
            </tr>
            <tr>
              <td>False negatives</td>
              <td>
                The number of variants found in the benchmark set that did not
                match exactly the test set.
              </td>
            </tr>
            <tr>
              <td>Precision (PPV)</td>
              <td>(true positives) / (true positives + false positives)</td>
            </tr>
            <tr>
              <td>Recall (sensitivity)</td>
              <td>(true positives) / (true positives + false negatives)</td>
            </tr>
            <tr>
              <td>F-measure</td>
              <td>2 * precision * recall / (precision + recall)</td>
            </tr>
          </tbody>
        </DocTable>

        <p>
          The VCF files produced by typical variant callers include an
          associated metric (reported individually for each variant) called "GQ"
          (genotype quality). It represents the Phred-scaled likelihood that the
          genotype call is wrong. The comparison framework explores how the
          results would change if we were to apply a certain GQ threshold.
          Typically, as the threshold is increased (i.e. when selecting only the
          highest quality variants), the precision is increased (as there fewer
          false positives) but the recall/sensitivity is decreased (as there are
          more false negatives). The comparison output includes a curve which
          shows how precision and sensitivity change when varying the threshold
          on the GQ score. The slope of the curve is sometimes indicative of the
          performance of the variation calling algorithm (however, this is still
          an area of debate).
        </p>

        <p>
          The comparison will also produce the following files. For simplicity,
          these files remain associated to the comparison and are managed as a
          unit along with the comparison -- they do not show up in the Files
          section of the website. These files are generated verbatim by the
          "vcfeval" program used in the comparison framework.
        </p>

        <DocTable>
          <thead>
            <tr>
              <th>File(s)</th>
              <th>Content</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>tp.vcf.gz, tp.vcf.gz.tbi</td>
              <td>
                The test set variants that were identified as true positives
              </td>
            </tr>
            <tr>
              <td>fp.vcf.gz, fp.vcf.gz.tbi</td>
              <td>
                The test set variants that were identified as false positives
              </td>
            </tr>
            <tr>
              <td>fn.vcf.gz, fn.vcf.gz.tbi</td>
              <td>
                The benchmark set variants that were identified as false
                negatives
              </td>
            </tr>
            <tr>
              <td>weighted_roc.tsv</td>
              <td>The points used to draw the curve</td>
            </tr>
            <tr>
              <td>vcfeval.log</td>
              <td>The log file produced by the vcfeval program</td>
            </tr>
            <tr>
              <td>summary.txt</td>
              <td>A summary of the comparison</td>
            </tr>
          </tbody>
        </DocTable>

        <h2 id="comparisons-visualize">Visualizing a comparison</h2>

        <p>
          By clicking on "Visualize comparison" you can launch a genome browser
          which includes two variant tracks; one for false positives and one for
          false negatives. You can navigate around the genome by typing
          chromosomal coordinates or gene names, and you can click on variants
          to look at their original VCF annotations. This feature is based on
          the open-source BioDalliance genome browser. Additional information on
          how to use it can be found at{' '}
          <a href="http://www.biodalliance.org/started.html">
            http://www.biodalliance.org/started.html
          </a>
          .
        </p>

        <h2 id="comparisons-ideas">Ideas for using comparisons</h2>

        <p>Assess reproducibility of an NGS test</p>
        <ul>
          <li>
            Conduct an NGS test twice on the same specimen, and get two VCF
            results.
          </li>
          <li>Upload these to precisionFDA and run a comparison.</li>
          <li>
            Although you need to arbitrarily specify one VCF as the benchmark
            set, you can still interpret the results in a way that is useful to
            assessing reproducibility; for example, the precision and recall
            values are proxies for "percentage of overlapping entries" or
            "positive percent agreement".
          </li>
        </ul>

        <p>Assess accuracy of an NGS test using a reference sample</p>
        <ul>
          <li>
            Order a reference sample (such as NA12878, available as{' '}
            <a
              target="_blank"
              href="https://www-s.nist.gov/srmors/view_detail.cfm?srm=8398"
              rel="noreferrer"
            >
              NIST RM 8398
            </a>
            )
          </li>
          <li>
            Conduct an NGS test and obtain a VCF file (and, if applicable, an
            associated BED file).
          </li>
          <li>
            Upload these to precisionFDA and run a comparison against the
            NA12878-NISTv2.19 benchmark set and/or the
            NA12878-Illumina-Platinum-Genome benchmark set.
          </li>
        </ul>

        <p>
          Assess accuracy of a mapping and variation calling pipeline using a
          reference sample
        </p>
        <ul>
          <li>
            Load your pipeline onto precisionFDA (see{' '}
            <Link to="/docs/apps">apps</Link>).
          </li>
          <li>
            Locate reads (FASTQ files) for a reference sample, such as
            NA12878-Garvan-Vial1.
          </li>
          <li>
            Run the pipeline using the FASTQ files as inputs and obtain a VCF
            file (and, if applicable, an associated BED file).
          </li>
          <li>
            Run a comparison against a benchmark set appropriate for that
            reference sample (such as the ones mentioned in the previous idea).
          </li>
        </ul>
      </DocBody>
      <RightSide>
        <PageMap>
          <li>
            <a href="#comparisons-new" data-turbolinks="false">
              Creating a new comparison
            </a>
          </li>
          <li>
            <a href="#comparisons-bed" data-turbolinks="false">
              BED files
            </a>
          </li>
          <li>
            <a href="#comparisons-results" data-turbolinks="false">
              Understanding comparison results
            </a>
          </li>
          <li>
            <a href="#comparisons-visualize" data-turbolinks="false">
              Visualizing a comparison
            </a>
          </li>
          <li>
            <a href="#comparisons-ideas" data-turbolinks="false">
              Ideas for using comparisons
            </a>
          </li>
        </PageMap>
      </RightSide>
    </DocRow>
  )
}
