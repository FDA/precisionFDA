---
title: Licenses
---

The licensing feature of precisionFDA allows you to protect datasets or software by requiring that users agree to a license agreement before they can access those items. You can use this feature to contribute datasets or software associated with usage restrictions, limited consent, publication embargoes, or other legal policies.

To enable this feature, select "Manage Licenses" under your profile, and click "Create a License". Enter a title for the license you are creating, and fill in the license text. The content of the license is written using [Markdown syntax](https://jonschlinkert.github.io/remarkable/demo/), and you can switch between editing the Markdown content and previewing the result. When you are done, click "Save and Submit". **NOTE:** the license text is publicly viewable, so you don't need to publish the license -- it is public already.

To associate a file with a license, navigate to a file you own and click "Attach License", then select one of your licenses. This will enable protection of the file under this license, and users will have to accept the license before they can open the file, download it, or make an authorized URL for it.

To associate software with a license, navigate to an app asset you own and click "Attach License", then select one of your licenses. This will enable protection of the particular app asset and of all apps that make use of it. Users will have to accept the license before they can download the app asset, or before they can run any app that uses it.

Since apps can use multiple assets, it is possible for an app to prompt users to accept multiple licenses when they try to run the app, if there are multiple licenses involved.

If multiple items are protected under the same license, users only need to accept the license once.

The attachment of licenses to items is independent of the publishing of items. You still need to publish files or apps if you want other precisionFDA users to be able to reach them. Licensing is only an orthogonal protection that pertains specifically to the Download and Run actions.

To see who has accepted your license, select "Manage Licenses" under your profile, and click the license. The "licensed users" tab shows a list of users who have accepted. You can revoke individual users, or even reset the whole list.

The [GATK-3.5](https://precision.fda.gov/app_assets/file-BvYzqJQ03vv66X10j8XgG21x) app asset is an example of the licensing feature in action. After accepting the precisionFDA-specific GATK license agreement, you will be able to run apps that use it, or make and run your own GATK apps.