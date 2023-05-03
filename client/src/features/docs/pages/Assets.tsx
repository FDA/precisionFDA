/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Link } from 'react-router-dom'
import {
    DocBody,
    DocTable,
    DocsTip,
    DocRow,
    RightSide,
    PageMap,
} from '../styles'
import exportScreenshot from '../images/export_screenshot.png'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { OutdatedDocs } from '../common'

export const Assets = () => {
    useScrollToHash()
    return (
        <DocRow>
            <DocBody>
                <h1>Assets</h1>

                <p>
                    Assets are simply tarballs that get uncompressed in the root folder of the computer where an app
                    runs.
                    Therefore, create a fake root folder and assemble your files underneath it.
                    For additional details, see {' '}
                    <Link to="creating-apps#app-own-assets">
                        Your own assets
                    </Link>{' '} in the precisionFDA documentation guide.
                </p>

                <p>
                    In order to upload the asset to precisionFDA you will need to download {' '}
                    <Link to="cli#download">
                        pFDA CLI
                    </Link> first.
                </p>

                <h1 id="create">Creating new assets</h1>
                <p>
                    Prepare your asset's content like follows: <br/> place binaries in <code>fake_root/usr/bin</code>, and
                    working directory files in <code>fake_root/work/</code>. <br /> Example:
                    <code>
                        <ul>
                            <li>/ fake_root </li>
                            <ul>
                                <li>
                                    / fake_root / work # this is the "home" directory of a running app
                                </li>
                            <li>
                                / fake_root / usr / bin # this is in the $PATH on an app, where binaries can be placed
                            </li>
                            </ul>
                        </ul>
                    </code>
                </p>

                <DocsTip>
                    <span className="fa fa-lightbulb-o" aria-hidden="true"/>{' '}
                    <strong>TIP:</strong> Need to compile binaries in a compatible environment?
                    Download the <strong><a
                    href="https://pfda-production-static-files.s3.amazonaws.com/vmi/precisionFDA-dev-50GB-vm-II-nopass-ssh.ova"
                    target="_blank">precisionFDA virtual machine image</a></strong> and load it into <strong><a
                    href={"https://www.virtualbox.org/wiki/Downloads"}
                    data-turbolinks="false">VirtualBox</a></strong> to instantiate an environment similar to the one
                    that apps get when they run on the cloud.
                    Power on the machine, and SSH into localhost (port 2222) as the <code>ubuntu</code> user (no
                    password is required to log in).
                </DocsTip>

                <p>Write a short readme file describing the asset and save it as either .txt or .md file.
                    <DocsTip>
                        <span className="fa fa-lightbulb-o" aria-hidden="true"/>{' '}
                        <strong>TIP:</strong>
                        Use the Markdown syntax to format your readme.
                        For inspiration on how to write useful readme files, see some of the existing assets published
                        by the precisionFDA team, and consult {' '}
                        <Link to="creating-apps#app-own-assets">
                            Your own assets
                        </Link>{' '} in the precisionFDA documentation guide for a markdown template.
                    </DocsTip>
                </p>

                <h1 id="cli-upload">Upload to precisionFDA</h1>
                <p>
                    To upload an asset to precisionFDA, prepare a folder path of the asset
                    contents and a readme file, and run the following command with the
                    desired asset name (must end in .tar or .tar.gz)
                </p>
                <p>
                    <code>
                        {
                            './pfda upload-asset -name NAME{.tar or .tar.gz} -root /PATH/TO/ROOT/FOLDER -readme README{.txt or .md}> -key KEY'
                        }
                    </code>
                </p>

                <p>
                    If you need help with CLI itself, please check our dedicated {' '}
                    <Link to="cli">
                        CLI docs
                    </Link>{' '} page.
                </p>

            </DocBody>
            <RightSide>
                <PageMap>
                    <li>
                        <a href="#create" data-turbolinks="false">Create own assets</a>
                    </li>
                    <li>
                        <a href="#cli-upload" data-turbolinks="false">Upload asset with CLI</a>
                    </li>
                </PageMap>
            </RightSide>

        </DocRow>
    )
}
