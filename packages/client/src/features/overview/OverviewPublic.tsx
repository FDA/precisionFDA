import { Button } from '@/components/Button'
import { PageContainerMargin } from '@/components/Page/page.styles'
import { OverviewCenterSection, PageRow } from '@/components/Public/public-layout.styles'
import { usePageMeta } from '@/hooks/usePageMeta'
import NavigationBar, {
  NavigationBarBanner,
  NavigationBarPublicLandingTitle,
} from '../../components/NavigationBar/NavigationBar'
import PublicLayout from '../../layouts/PublicLayout'
import styles from './OverviewPublic.module.css'
import { PageOverviewMainBody } from './overview.styles'

export const OverviewPublic = () => {
  usePageMeta({ title: 'precisionFDA - Overview' })
  return (
    <PublicLayout mainScroll={false}>
      <NavigationBar user={null}>
        <PageContainerMargin>
          <NavigationBarBanner>
            <NavigationBarPublicLandingTitle />
          </NavigationBarBanner>
        </PageContainerMargin>
      </NavigationBar>
      <PageRow>
        <PageContainerMargin>
          <PageOverviewMainBody>
            <PrecisionFDALanding />
          </PageOverviewMainBody>
          <OverviewCenterSection>
            <div className={styles.infoRow}>
              <Button className={styles.infoButton} data-variant="primary" as="a" href="/docs" target="_blank">
                Learn more
              </Button>
              <a
                className={styles.feedbackLink}
                href="mailto:precisionfda@fda.hhs.gov"
                aria-label="Send feedback to the precisionFDA team via email"
              >
                Feedback
              </a>
            </div>
          </OverviewCenterSection>
        </PageContainerMargin>
      </PageRow>
    </PublicLayout>
  )
}

const PrecisionFDALanding = () => {
  return (
    <PageContainerMargin>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>precisionFDA</h1>
        <p className={styles.heroSubtitle}>
          A secure, collaborative, cloud-based high-performance computing environment advancing regulatory science and
          AI innovation for the FDA
        </p>
      </div>

      <section className={styles.contentSection}>
        <h2 className={styles.sectionTitle}>Everything You Need to Know</h2>
        <p className={styles.sectionSubtitle}>
          Discover how precisionFDA facilitates collaboration and accelerates scientific discovery
        </p>

        <div className={styles.sectionGrid}>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>What is precisionFDA?</h3>
            <p className={styles.featureDescription}>
              precisionFDA is a secure, collaborative, cloud-based high-performance computing environment that was
              launched by the U.S. Food and Drug Administration (FDA) to facilitate the collection, analysis, and
              application of data and new tools to support its mission.
            </p>
            <p className={styles.featureDescription}>
              The platform offers collaborative opportunities, capabilities, and initiatives to help inform regulatory
              science, speed the Agency's understanding of evolving science, and advance the ethical and responsible use
              of artificial intelligence (AI) to support the work of FDA regulators and scientists.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Who can become a user?</h3>
            <p className={styles.featureDescription}>
              FDA researchers and people who interface with FDA; for example, scientists in industry, academia, and
              government who may collaborate with the Agency through Research Collaboration Agreements (RCAs), Memoranda
              Of Understanding (MOUs), pilot programs, or partnerships.
            </p>
            <p className={styles.featureDescription}>
              Join our community of scientists participating in exciting{' '}
              <a className={styles.featureLink} href="/challenges">
                Challenges
              </a>{' '}
              and collaborative research initiatives.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Why become a user?</h3>
            <p className={styles.featureDescription}>
              precisionFDA offers a number of capabilities that facilitate collaborations between FDA researchers and
              those in the external scientific community. They include collaborative spaces in the cloud where
              participants can safely exchange large data sets, including sensitive or confidential data allowed under
              FEDRamp and FISMA moderate certification.
            </p>
            <p className={styles.featureDescription}>
              Access secure computational resources specifically configured to meet the most demanding technical
              computing requirements, software tools, and computational pipelines.
            </p>
          </div>

          <div className={styles.fullWidthCard}>
            <h3 className={styles.featureTitle}>How do I become a user?</h3>
            <p className={styles.featureDescription}>
              The best place to start is to{' '}
              <a className={styles.featureLink} href="/request-access">
                request access
              </a>{' '}
              in the upper right-hand corner of this page. Fill in the form and follow the instructions.
            </p>
            <p className={styles.featureDescription}>
              Your request will be reviewed and you will receive an email with further instructions to get you started
              on your precisionFDA journey.
            </p>

            <div className={styles.getStartedSection}>
              <h4 className={styles.getStartedTitle}>Get Started in 3 Simple Steps</h4>
              <div className={styles.stepsContainer}>
                <div className={styles.miniStepCard}>
                  <div className={styles.miniStepIcon}>1</div>
                  <h5 className={styles.miniStepTitle}>Request Access</h5>
                  <p className={styles.miniStepDescription}>
                    Click the &#34;Request Access&#34; button and fill out the application form
                  </p>
                </div>

                <div className={styles.miniArrow}>→</div>

                <div className={styles.miniStepCard}>
                  <div className={styles.miniStepIcon}>2</div>
                  <h5 className={styles.miniStepTitle}>Review Process</h5>
                  <p className={styles.miniStepDescription}>Your application will be reviewed promptly by our team</p>
                </div>

                <div className={styles.miniArrow}>→</div>

                <div className={styles.miniStepCard}>
                  <div className={styles.miniStepIcon}>3</div>
                  <h5 className={styles.miniStepTitle}>Start Collaborating</h5>
                  <p className={styles.miniStepDescription}>Receive access email and begin your research projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.ctaSection}>
        <h3 className={styles.ctaTitle}>Ready to Transform Your Research?</h3>
        <p className={styles.ctaSubtitle}>Join the precisionFDA and accelerate your scientific discoveries</p>
        <Button className={styles.signUpButton} data-variant={'primary'} as={'a'} href={'/request-access'}>
          Request Access Now
        </Button>
      </div>
    </PageContainerMargin>
  )
}
