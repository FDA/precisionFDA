---
title: Assets
---

Assets are simply tarballs that get uncompressed in the root folder of the computer where an app runs. Therefore, create a fake root folder and assemble your files underneath it. For additional details, see [Your own assets](/guides/creating-apps#your-own-assets) in the precisionFDA documentation guide.

In order to upload the asset to precisionFDA you will need to download [pFDA CLI](/guides/cli#download-the-cli) first.

# Creating new assets

Prepare your asset's content like follows:  
place binaries in `fake_root/usr/bin`, and working directory files in `fake_root/work/`.  
Example:

- `/ fake_root`
  - `/ fake_root / work # this is the "home" directory of a running app`
  - `/ fake_root / usr / bin # this is in the $PATH on an app, where binaries can be placed`

Write a short readme file describing the asset and save it as either .txt or .md file.

> [!info] Tip
> Use the Markdown syntax to format your readme. For inspiration on how to write useful readme files, see some of the existing assets published by the precisionFDA team, and consult [Your own assets](/guides/creating-apps#your-own-assets) in the precisionFDA documentation guide for a markdown template.

# Upload to precisionFDA

To upload an asset to precisionFDA, prepare a folder path of the asset contents and a readme file, and run the following command with the desired asset name (must end in .tar or .tar.gz)

In a Linux or Unix environment:

`./pfda upload-asset -name NAME{.tar or .tar.gz} -root /PATH/TO/ROOT/FOLDER -readme README{.txt or .md} -key KEY`

In a Windows environment:

`"C:\path\to\pfda\executable\pfda.exe" upload-asset -name my-asset.tar.gz -root "C:\path\to\fake_root" -readme my-asset.txt -key KEY`

If you need help with CLI itself, please check our dedicated [CLI docs](/guides/cli) page.
