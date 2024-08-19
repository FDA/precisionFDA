/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Link } from 'react-router-dom'
import {
    DocBody,
    DocsTip,
    DocRow,
    RightSide,
    PageMap,
} from '../styles'
import { useScrollToHash } from '../../../hooks/useScrollToHash'

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
                    <Link to="/docs/creating-apps#app-own-assets">
                        Your own assets
                    </Link>{' '} in the precisionFDA documentation guide.
                </p>

                <p>
                    In order to upload the asset to precisionFDA you will need to download {' '}
                    <Link to="/docs/cli#download">
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

                <p>Write a short readme file describing the asset and save it as either .txt or .md file.
                    <DocsTip>
                        <span className="fa fa-lightbulb-o" aria-hidden="true"/>{' '}
                        <strong>TIP:</strong>
                        Use the Markdown syntax to format your readme.
                        For inspiration on how to write useful readme files, see some of the existing assets published
                        by the precisionFDA team, and consult {' '}
                        <Link to="/docs/creating-apps#app-own-assets">
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
                    In a Linux or Unix environment:
                </p>
                <p>
                    <code>
                        {
                            './pfda upload-asset -name NAME{.tar or .tar.gz} -root /PATH/TO/ROOT/FOLDER -readme README{.txt or .md} -key KEY'
                        }
                    </code>
                </p>
                <p>
                    In a Windows environment:
                </p>
                <p>
                    <code>
                        {
                            '"C:\\path\\to\\pfda\\executable\\pfda.exe" upload-asset -name my-asset.tar.gz -root "C:\\path\\to\\fake_root" -readme my-asset.txt -key KEY'
                        }
                    </code>
                </p>

                <p>
                    If you need help with CLI itself, please check our dedicated {' '}
                    <Link to="/docs/cli">
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
