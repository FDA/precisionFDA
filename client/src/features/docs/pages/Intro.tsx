/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { DocBody, DocsTip } from '../styles'

export const Intro = () => {
  useScrollToHash()
  return (
    <DocBody>
      <h1>Introduction</h1>

      <p>
        Welcome to precisionFDA, the community platform for NGS assay evaluation
        and regulatory science exploration.
      </p>

      <p>
        We are excited to have you on board, and have prepared this guide to
        help you make the most out of the precisionFDA platform. We hope that
        this guide will answer many of your questions and provide you with
        additional insights to further empower you to use the system. If your
        favorite topic is not covered, please don't hesitate to{' '}
        <a href="mailto:precisionfda@fda.hhs.gov">contact us</a>, and we'll make
        sure to expand the guide accordingly.
      </p>

    <p>
      The first step to unlocking the features of precisionFDA is creating an
      account. You can sign up for a precisionFDA account by clicking "Request
      Access" on the front page, or by{' '}
      <a data-turbolinks="false" href="request_access_path" aria-label="Request access to precisionFDA">
        clicking here
      </a>
      . During the sign-up process, you will need a phone or other multi-factor
      authentication (MFA) device; you can find{' '}
      <a
        data-turbolinks="false"
        href="/pdfs/PrecisionFDA_Okta_Verify_MFA_instructions.pdf"
        target="_blank"
        aria-label="Instructions on setting up your device"
      >
        instructions on setting up your device by clicking here
      </a>
      .
    </p>

      {/* <p>
      Select a topic on the left to read more about it. We've also recorded
      short videos to demonstrate some aspects of the system, so make sure to
      check those as well.
    </p> */}

      <DocsTip>
        <strong>TIP:</strong> The precisionFDA platform is currently in
        production, and is expected to evolve and change over time. If you
        encounter an error page during your interaction with the site, we
        encourage you to{' '}
        <a href="mailto:precisionfda@fda.hhs.gov">report feedback</a> and tell
        us what you were trying to do at the time and how you got to the error
        page. We appreciate your help!
      </DocsTip>
    </DocBody>
  )
}
