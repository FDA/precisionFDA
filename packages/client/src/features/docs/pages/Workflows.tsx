/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Link } from 'react-router-dom'
import { DocBody, DocRow, DocsTip, PageMap, RightSide } from '../styles'
import create from '../images/create.png'
import stages from '../images/stages.png'
import diagramgrid from '../images/diagram_grid.png'
import configureapps from '../images/configure_apps.png'
import selectoutputs from '../images/select_outputs.png'
import finish from '../images/finish.png'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { OutdatedDocsApps } from '../common'

export const Workflows = () => {
  useScrollToHash()
  return (
    <DocRow>
      <DocBody>
        <OutdatedDocsApps />
        <h1>Workflows</h1>

        <p>
          <strong>Workflows</strong> on precisionFDA allow multiple applications
          to be chained together, with the output from one application serving
          as the input for the next. A workflow is an object, just like an app.
          You can build a unique workflow, save it, and rerun it as many times
          as you choose. Workflows can be edited to update app versions, add or
          remove apps, and make other configuration changes whenever you choose
          to do so.
        </p>

        <h2 id="workflow-create">Creating a Workflow</h2>
        <div className="bs-docs-section">
          <p>
            To create a workflow, navigate to the Workflows page and select{' '}
            <strong>Create Workflow</strong>.
          </p>
        </div>
        <img width="100%" src={create} alt="Create workflow page" />
        <div className="bs-docs-section">
          <p>
            On this page, you can choose a <strong>name</strong> and{' '}
            <strong>title</strong> for the workflow. Note that, just like an app
            name, the workflow name is{' '}
            <strong>permanent and cannot be changed later.</strong>
          </p>
        </div>
        <h2 id="workflow-add-apps">Add apps to a Workflow</h2>
        <div className="bs-docs-section">
          <p>
            To add apps to the workflow, click on <strong>Add Stage</strong>.
            You may add either public apps, private apps, or a combination of
            the two.
          </p>
        </div>

        <img width="100%" src={stages} alt="Add Stages modal popup" />
        <div className="bs-docs-section">
          <p>
            Workflows are <strong>private</strong> by default, so private apps
            may be used in a workflow. You may select which revision of an app
            you choose to add to the workflow by using the dropdown menu. Click
            the <strong>Add</strong> button next to an app to add it to the
            workflow.
          </p>
          <p>
            After apps have been added to the workflow, they will appear on the{' '}
            <strong>workflow diagram grid</strong>. Each app is shown as a box,
            which is highlighted to show whether it is properly configured
            (green) or needs additional attention (red).
          </p>
        </div>

        <img width="100%" src={diagramgrid} alt="Apps on workflow grid" />
        <h2 id="workflow-configure-apps">Configure a Workflow's apps</h2>
        <div className="bs-docs-section">
          <p>
            To configure each app in a workflow, click the{' '}
            <strong>app name</strong>. You must specify the source of each input
            to that app for it to be properly configured.
          </p>
        </div>

        <img
          width="100%"
          src={configureapps}
          alt="Configue workflow app modal popup"
        />
        <div className="bs-docs-section">
          <p>
            Each input can either come from another app in the workflow, or can
            be set as required workflow input by using the checkbox. All inputs
            that are set as required workflow input must be specified when you
            run the workflow (similar to how you specify inputs when running an
            app).
          </p>
          <p>
            Because workflows are linear, inputs to the first app in the
            workflow must be set as required workflow input. Inputs to later
            apps further downstream in the workflow can either be set as
            required inputs, or can come from the output of previous apps.
          </p>
          <p>
            To set an app input as the output from a previous app, click the
            blue <strong>Set</strong> button on the right. This will bring up a
            list of all outputs from other apps in the workflow. You may select
            the desired output by clicking <strong>Select</strong>.
          </p>
        </div>
        <img width="100%" src={selectoutputs} alt="Select app output page" />
        <div className="bs-docs-section">
          <p>
            Once an app in a workflow is properly configured, the highlighted
            box around the app will change from red to green. Similarly, the
            color of the funnels that indicate inputs and outputs for that app
            will change from red to green as they are configured. For a workflow
            to run successfully, all required inputs must be green.
          </p>
          <p>
            To remove an app from a workflow, you may click the{' '}
            <strong>small X</strong> in a circle in the upper-right corner of
            that app's box.
          </p>
          <p>
            You may add documentation and additional information about the
            workflow in the <strong>Readme tab</strong>.
          </p>
        </div>

        <img width="100%" src={finish} alt="Finished app configuration" />

        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong>
          After you have created a workflow, it can be executed from the
          Workflows page, just like running an app. A workflow can be edited to
          create a new revision; apps may be added, removed, and inputs and/or
          outputs may be changed. After a workflow has run, all outputs are
          provided in the output location.
        </DocsTip>

        <h2 id="workflow-publish">Publishing/Moving Workflows to Spaces</h2>

        <p>
          A workflow may be published/moved to a group, review, or verification
          space. See the <Link to="/docs/spaces">Spaces</Link> documentation for
          details.
        </p>
      </DocBody>
      <RightSide>
        <PageMap>
          <li>
            <a href="#workflow-create" data-turbolinks="false">
              Creating a Workflow
            </a>
          </li>
          <li>
            <a href="#workflow-add-apps" data-turbolinks="false">
              Add apps to a Workflow
            </a>
          </li>
          <li>
            <a href="#workflow-configure-apps" data-turbolinks="false">
              Configure a Workflow's apps
            </a>
          </li>
          <li>
            <a href="#workflow-publish" data-turbolinks="false">
              Publish a Workflow
            </a>
          </li>
        </PageMap>
      </RightSide>
    </DocRow>
  )
}
