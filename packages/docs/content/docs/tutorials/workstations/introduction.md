---
title: Introduction
---

This hands-on tutorial presents design patterns for collaborative data science using the featured precisionFDA pfda-ttyd, pfda-jupyterLab, and guacmole interactive workstation apps, and precisionFDA Databases. Through the development of the tutorial assets, precisionFDA’s powerful capabilities for secure sharing and analysis of FISMA-Moderate authorized data are clearly demonstrated, and users will be empowered to develop their own collaborative regulatory data science use cases.

As always, keep in mind that all of these workstations, notebooks, and databases are strictly within the sole provenance of the user that launched them, and that in compliance with  precisionFDA’s FISMA authorization, the ability to deliver multi-user web services or databases is specifically not supported on precisionFDA. 

Users can however use the power of the cloud to efficiently achieve their collaborative data science and bioinformatics objectives, and use the regulatory-grade platform to share the tools and results with full chain of provenance tracking. For cross-cutting analysis across FDA datasets, users will need to bring their data into the FDA's Intelligent Data Lifecycle Ecosystem (FiDLE).

## Learning Objectives

Through this hands-on tutorial you will:
- Use the precisionFDA command line utility (pfda) to programmatically transfer files to and from precisionFDA and workstations and notebooks.
- Configure ttyd workstations to present multiple web services on ports 8080 using a reverse proxy for secure browser-based access with a rich UI.
- Launch a data analysis ttyd workstation with a local PostgreSQL database server, psql command line database client, pgadmin GUI database client, and RStudio configured with PostgreSQL access.
- Launch a SAS Studio workstation using a pfda-ttyd snapshot.
- Launch a KNIME Analytics Platform guacamole workstation with a local PostgreSQL database server, psql command line database client, and pgadmin GUI database client.
- Launch a precisionFDA Database cluster and access it from the data analysis workstation using psql and pgadmin to configure and install a database on the cluster from DDL and delimited data files.
- Use pgadmin to backup the cluster database to a precisionFDA file.
- Use pgadmin to restore the database backup to the data analysis workstation local database.
- Access the cluster and the workstation local databases from RStudio.
- Launch a jupyterLab workstation with a local PostgreSQL database server, and psql command line database client, and an example Python database analysis notebook.
- Launch a series of epidemiology-related Jupyter notebooks and use papermill to execute a long-running notebook non-interactively,
- Use pgadmin to restore the database backup to the jupyterLab workstation local database.
- Access the cluster and the workstation local databases from a Python notebook.
