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
            href="/pdfs/Tuturial_-_Apps_and_Workflows_-_20221130.pdf"
            data-turbolinks="false"
            target="_blank"
            aria-label="Tutorial on apps and workflows"
          >
            Tuturial - Apps and Workflows.pdf
          </a>
        </li>
        <li>
          <a
            href="/pdfs/Tuturial_-_Workstations_and_Databases_-_20221130.pdf"
            data-turbolinks="false"
            target="_blank"
            aria-label="Tutorial on workstations and databases"
          >
            Tuturial - Workstations and Databases.pdf
          </a>
        </li>
      </ul>
    </DocBody>
  </DocRow>
)
