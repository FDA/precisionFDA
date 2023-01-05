/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { DocBody, DocRow } from '../styles'

export const Tutorials = () => (
  <DocRow>
    <DocBody>
      <h1>Tutorials</h1>
      Click the following links to download the most up-to-date tutorials on how to use PrecisionFDA.

      <ul>
        <li>
          <a
            href="/pdfs/Tutorial_-_Apps_and_Workflows_-_20221130.pdf"
            data-turbolinks="false"
            target="_blank"
            aria-label="Tutorial on apps and workflows"
          >
            Tutorial - Apps and Workflows.pdf
          </a>
        </li>
        <li>
          <a
            href="/pdfs/Tutorial_-_Workstations_and_Databases_-_20221130.pdf"
            data-turbolinks="false"
            target="_blank"
            aria-label="Tutorial on workstations and databases"
          >
            Tutorial - Workstations and Databases.pdf
          </a>
        </li>
      </ul>
    </DocBody>
  </DocRow>
)
