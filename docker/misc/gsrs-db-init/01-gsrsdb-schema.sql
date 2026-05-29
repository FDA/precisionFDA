-- MariaDB dump 10.19  Distrib 10.6.15-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: ixginas_local
-- ------------------------------------------------------
-- Server version	10.6.15-MariaDB-1:10.6.15+maria~ubu2004

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Sequence structure for `LONG_SEQ_ID`
--

DROP SEQUENCE IF EXISTS `LONG_SEQ_ID`;
CREATE SEQUENCE `LONG_SEQ_ID` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`LONG_SEQ_ID`, 1, 0);

--
-- Sequence structure for `db_gsrs_version_seq`
--

DROP SEQUENCE IF EXISTS `db_gsrs_version_seq`;
CREATE SEQUENCE `db_gsrs_version_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`db_gsrs_version_seq`, 1, 0);

--
-- Sequence structure for `ix_core_acl_seq`
--

DROP SEQUENCE IF EXISTS `ix_core_acl_seq`;
CREATE SEQUENCE `ix_core_acl_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_core_acl_seq`, 1, 0);

--
-- Sequence structure for `ix_core_backup_seq`
--

DROP SEQUENCE IF EXISTS `ix_core_backup_seq`;
CREATE SEQUENCE `ix_core_backup_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_core_backup_seq`, 1001, 0);

--
-- Sequence structure for `ix_core_etag_seq`
--

DROP SEQUENCE IF EXISTS `ix_core_etag_seq`;
CREATE SEQUENCE `ix_core_etag_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_core_etag_seq`, 2001, 0);

--
-- Sequence structure for `ix_core_group_seq`
--

DROP SEQUENCE IF EXISTS `ix_core_group_seq`;
CREATE SEQUENCE `ix_core_group_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_core_group_seq`, 1001, 0);

--
-- Sequence structure for `ix_core_namespace_seq`
--

DROP SEQUENCE IF EXISTS `ix_core_namespace_seq`;
CREATE SEQUENCE `ix_core_namespace_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_core_namespace_seq`, 1, 0);

--
-- Sequence structure for `ix_core_principal_seq`
--

DROP SEQUENCE IF EXISTS `ix_core_principal_seq`;
CREATE SEQUENCE `ix_core_principal_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_core_principal_seq`, 1001, 0);

--
-- Sequence structure for `ix_core_procjob_seq`
--

DROP SEQUENCE IF EXISTS `ix_core_procjob_seq`;
CREATE SEQUENCE `ix_core_procjob_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_core_procjob_seq`, 1001, 0);

--
-- Sequence structure for `ix_core_procrec_seq`
--

DROP SEQUENCE IF EXISTS `ix_core_procrec_seq`;
CREATE SEQUENCE `ix_core_procrec_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_core_procrec_seq`, 1001, 0);

--
-- Sequence structure for `ix_core_userprof_seq`
--

DROP SEQUENCE IF EXISTS `ix_core_userprof_seq`;
CREATE SEQUENCE `ix_core_userprof_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_core_userprof_seq`, 1001, 0);

--
-- Sequence structure for `ix_core_value_seq`
--

DROP SEQUENCE IF EXISTS `ix_core_value_seq`;
CREATE SEQUENCE `ix_core_value_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_core_value_seq`, 1001, 0);

--
-- Sequence structure for `ix_core_xref_seq`
--

DROP SEQUENCE IF EXISTS `ix_core_xref_seq`;
CREATE SEQUENCE `ix_core_xref_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_core_xref_seq`, 1, 0);

--
-- Sequence structure for `ix_ginas_controlled_vocab_seq`
--

DROP SEQUENCE IF EXISTS `ix_ginas_controlled_vocab_seq`;
CREATE SEQUENCE `ix_ginas_controlled_vocab_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_ginas_controlled_vocab_seq`, 1001, 0);

--
-- Sequence structure for `ix_ginas_vocabulary_term_seq`
--

DROP SEQUENCE IF EXISTS `ix_ginas_vocabulary_term_seq`;
CREATE SEQUENCE `ix_ginas_vocabulary_term_seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB;
SELECT SETVAL(`ix_ginas_vocabulary_term_seq`, 4001, 0);

--
-- Table structure for table `ix_batch_processingjob`
--

DROP TABLE IF EXISTS `ix_batch_processingjob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_batch_processingjob` (
  `id` varchar(40) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `completed_record_count` int(11) NOT NULL,
  `data` longtext DEFAULT NULL,
  `finish_date` datetime(6) DEFAULT NULL,
  `job_status` varchar(255) DEFAULT NULL,
  `results` longtext DEFAULT NULL,
  `start_date` datetime(6) DEFAULT NULL,
  `status_message` varchar(255) DEFAULT NULL,
  `total_records` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_acl`
--

DROP TABLE IF EXISTS `ix_core_acl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_acl` (
  `id` bigint(20) NOT NULL,
  `perm` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_acl_group`
--

DROP TABLE IF EXISTS `ix_core_acl_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_acl_group` (
  `ix_core_acl_id` bigint(20) NOT NULL,
  `ix_core_group_id` bigint(20) NOT NULL,
  KEY `fkffablaywfq4inuntnok9otle` (`ix_core_group_id`),
  KEY `fk8a5l9ehfusnoigq1r4robs2da` (`ix_core_acl_id`),
  CONSTRAINT `fk8a5l9ehfusnoigq1r4robs2da` FOREIGN KEY (`ix_core_acl_id`) REFERENCES `ix_core_acl` (`id`),
  CONSTRAINT `fkffablaywfq4inuntnok9otle` FOREIGN KEY (`ix_core_group_id`) REFERENCES `ix_core_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_acl_principal`
--

DROP TABLE IF EXISTS `ix_core_acl_principal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_acl_principal` (
  `ix_core_acl_id` bigint(20) NOT NULL,
  `ix_core_principal_id` bigint(20) NOT NULL,
  KEY `fkpf5d4mu9td8et6k5pgt78jma8` (`ix_core_principal_id`),
  KEY `fkc9bo2bwjfcf7djff6coigl2b1` (`ix_core_acl_id`),
  CONSTRAINT `fkc9bo2bwjfcf7djff6coigl2b1` FOREIGN KEY (`ix_core_acl_id`) REFERENCES `ix_core_acl` (`id`),
  CONSTRAINT `fkpf5d4mu9td8et6k5pgt78jma8` FOREIGN KEY (`ix_core_principal_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_backup`
--

DROP TABLE IF EXISTS `ix_core_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_backup` (
  `id` bigint(20) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `deprecated` bit(1) NOT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `compressed` bit(1) NOT NULL,
  `data` longblob DEFAULT NULL,
  `kind` varchar(255) DEFAULT NULL,
  `refid` varchar(255) DEFAULT NULL,
  `sha1` varchar(255) DEFAULT NULL,
  `namespace_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6n0ebodjb5t7yoxowli7t5qud` (`refid`),
  KEY `fknulpohkjr0e7imml16hnmcl2c` (`namespace_id`),
  CONSTRAINT `fknulpohkjr0e7imml16hnmcl2c` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_db_gsrs_version`
--

DROP TABLE IF EXISTS `ix_core_db_gsrs_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_db_gsrs_version` (
  `id` bigint(20) NOT NULL,
  `entity` varchar(255) NOT NULL,
  `hash` varchar(255) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `version_info` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_edit`
--

DROP TABLE IF EXISTS `ix_core_edit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_edit` (
  `id` varchar(40) NOT NULL,
  `batch` varchar(64) DEFAULT NULL,
  `comments` longtext DEFAULT NULL,
  `created` bigint(20) DEFAULT NULL,
  `kind` varchar(255) DEFAULT NULL,
  `new_value` longtext DEFAULT NULL,
  `old_value` longtext DEFAULT NULL,
  `path` varchar(1024) DEFAULT NULL,
  `refid` varchar(255) DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `editor_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `refid_core_edit_index` (`refid`),
  KEY `kind_core_edit_index` (`kind`),
  KEY `fkj2b3ncg8uek4q4tjua17gvkgi` (`editor_id`),
  CONSTRAINT `fkj2b3ncg8uek4q4tjua17gvkgi` FOREIGN KEY (`editor_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_etag`
--

DROP TABLE IF EXISTS `ix_core_etag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_etag` (
  `id` bigint(20) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `deprecated` bit(1) NOT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `count` int(11) DEFAULT NULL,
  `etag` varchar(16) DEFAULT NULL,
  `filter` varchar(4000) DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `query` varchar(2048) DEFAULT NULL,
  `sha1` varchar(40) DEFAULT NULL,
  `skip` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `top` int(11) DEFAULT NULL,
  `total` int(11) DEFAULT NULL,
  `uri` varchar(4000) DEFAULT NULL,
  `namespace_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_hvark3ftc0xax8dcbjuftcn7v` (`etag`),
  KEY `fk22kqxphqlg1d1hmsi2wtm6k0c` (`namespace_id`),
  CONSTRAINT `fk22kqxphqlg1d1hmsi2wtm6k0c` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_figure`
--

DROP TABLE IF EXISTS `ix_core_figure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_figure` (
  `DTYPE` varchar(31) NOT NULL,
  `id` bigint(20) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `data` longblob DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `sha1` varchar(140) DEFAULT NULL,
  `data_size` int(11) DEFAULT NULL,
  `url` varchar(1024) DEFAULT NULL,
  `parent_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk911xrg14bag2m8e096i9d75lu` (`parent_id`),
  CONSTRAINT `fk911xrg14bag2m8e096i9d75lu` FOREIGN KEY (`parent_id`) REFERENCES `ix_core_figure` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_filedata`
--

DROP TABLE IF EXISTS `ix_core_filedata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_filedata` (
  `DTYPE` varchar(31) NOT NULL,
  `id` varchar(40) NOT NULL,
  `data` longblob DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `sha1` varchar(140) DEFAULT NULL,
  `data_size` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_group`
--

DROP TABLE IF EXISTS `ix_core_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_group` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_pm62da77mybok0t03dd0a9oum` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_group_principal`
--

DROP TABLE IF EXISTS `ix_core_group_principal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_group_principal` (
  `ix_core_group_id` bigint(20) NOT NULL,
  `ix_core_principal_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_group_id`,`ix_core_principal_id`),
  KEY `fkp21u3ryjg094idoi9alrg90p7` (`ix_core_principal_id`),
  CONSTRAINT `fk1voeekm54sy5sc3et2fqo0unx` FOREIGN KEY (`ix_core_group_id`) REFERENCES `ix_core_group` (`id`),
  CONSTRAINT `fkp21u3ryjg094idoi9alrg90p7` FOREIGN KEY (`ix_core_principal_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_key_user_list`
--

DROP TABLE IF EXISTS `ix_core_key_user_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_key_user_list` (
  `id` bigint(20) NOT NULL,
  `entity_key` varchar(255) DEFAULT NULL,
  `kind` varchar(255) DEFAULT NULL,
  `list_name` varchar(255) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ukq0ipvkfn4lc8e88hi3900bytv` (`entity_key`,`list_name`,`user_id`,`kind`),
  KEY `fk7q0vtv7ajevho6v75n57jy0dj` (`user_id`),
  CONSTRAINT `fk7q0vtv7ajevho6v75n57jy0dj` FOREIGN KEY (`user_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_namespace`
--

DROP TABLE IF EXISTS `ix_core_namespace`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_namespace` (
  `id` bigint(20) NOT NULL,
  `location` varchar(1024) DEFAULT NULL,
  `modifier` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_t3wv0p58vflh5n2vnj6rjan75` (`name`),
  KEY `fkdgo5yjubgilh1nauv1t69gslx` (`owner_id`),
  CONSTRAINT `fkdgo5yjubgilh1nauv1t69gslx` FOREIGN KEY (`owner_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_payload`
--

DROP TABLE IF EXISTS `ix_core_payload`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_payload` (
  `id` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `mime_type` varchar(128) DEFAULT NULL,
  `name` varchar(1024) DEFAULT NULL,
  `sha1` varchar(40) DEFAULT NULL,
  `capacity` bigint(20) DEFAULT NULL,
  `namespace_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fkd150c5llpyncrqgpmqvvj8c9g` (`namespace_id`),
  CONSTRAINT `fkd150c5llpyncrqgpmqvvj8c9g` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_payload_property`
--

DROP TABLE IF EXISTS `ix_core_payload_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_payload_property` (
  `ix_core_payload_id` varchar(40) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  KEY `fki6ubcj55u3pq0gm70ay7umle1` (`ix_core_value_id`),
  KEY `fk6j2diflggrmws0k3suo8ms215` (`ix_core_payload_id`),
  CONSTRAINT `fk6j2diflggrmws0k3suo8ms215` FOREIGN KEY (`ix_core_payload_id`) REFERENCES `ix_core_payload` (`id`),
  CONSTRAINT `fki6ubcj55u3pq0gm70ay7umle1` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_principal`
--

DROP TABLE IF EXISTS `ix_core_principal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_principal` (
  `DTYPE` varchar(31) NOT NULL,
  `id` bigint(20) NOT NULL,
  `is_admin` bit(1) DEFAULT NULL,
  `created` datetime(6) DEFAULT NULL,
  `deprecated` bit(1) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `uri` varchar(1024) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `selfie_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_p8p720bdp9bkws54yip7x1t47` (`username`),
  KEY `fk6th1516rd9u5crfw7r12qtypk` (`selfie_id`),
  CONSTRAINT `fk6th1516rd9u5crfw7r12qtypk` FOREIGN KEY (`selfie_id`) REFERENCES `ix_core_figure` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_procjob`
--

DROP TABLE IF EXISTS `ix_core_procjob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_procjob` (
  `id` bigint(20) NOT NULL,
  `last_update` datetime(6) DEFAULT NULL,
  `message` longtext DEFAULT NULL,
  `job_start` bigint(20) DEFAULT NULL,
  `statistics` longtext DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `job_stop` bigint(20) DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  `payload_id` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fkkx6oorfim5n6bhuy3j8wogyl5` (`owner_id`),
  KEY `fkoxadf72bp8jsiuh1v42gx1t71` (`payload_id`),
  CONSTRAINT `fkkx6oorfim5n6bhuy3j8wogyl5` FOREIGN KEY (`owner_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkoxadf72bp8jsiuh1v42gx1t71` FOREIGN KEY (`payload_id`) REFERENCES `ix_core_payload` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_procjob_key`
--

DROP TABLE IF EXISTS `ix_core_procjob_key`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_procjob_key` (
  `ix_core_procjob_id` bigint(20) NOT NULL,
  `keys_id` bigint(20) NOT NULL,
  KEY `fkr2mo13ikjb3bfw91uuwf7n5aw` (`keys_id`),
  KEY `fk70h2uyrhvkuo84bwag5vljg9s` (`ix_core_procjob_id`),
  CONSTRAINT `fk70h2uyrhvkuo84bwag5vljg9s` FOREIGN KEY (`ix_core_procjob_id`) REFERENCES `ix_core_procjob` (`id`),
  CONSTRAINT `fkr2mo13ikjb3bfw91uuwf7n5aw` FOREIGN KEY (`keys_id`) REFERENCES `ix_core_value` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_procrec`
--

DROP TABLE IF EXISTS `ix_core_procrec`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_procrec` (
  `id` bigint(20) NOT NULL,
  `last_update` datetime(6) DEFAULT NULL,
  `message` longtext DEFAULT NULL,
  `name` varchar(128) DEFAULT NULL,
  `rec_start` bigint(20) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `rec_stop` bigint(20) DEFAULT NULL,
  `job_id` bigint(20) DEFAULT NULL,
  `xref_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fkpsv2ie5f4qjkar6kgis359efe` (`job_id`),
  KEY `fkabpfcuyjcycb86bmc06xps4j6` (`xref_id`),
  CONSTRAINT `fkabpfcuyjcycb86bmc06xps4j6` FOREIGN KEY (`xref_id`) REFERENCES `ix_core_xref` (`id`),
  CONSTRAINT `fkpsv2ie5f4qjkar6kgis359efe` FOREIGN KEY (`job_id`) REFERENCES `ix_core_procjob` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_procrec_prop`
--

DROP TABLE IF EXISTS `ix_core_procrec_prop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_procrec_prop` (
  `ix_core_procrec_id` bigint(20) NOT NULL,
  `properties_id` bigint(20) NOT NULL,
  KEY `fkjg8tmtxlf4d2vnb90e6i7exg0` (`properties_id`),
  KEY `fktnw4u7w89a21880hmtva47pta` (`ix_core_procrec_id`),
  CONSTRAINT `fkjg8tmtxlf4d2vnb90e6i7exg0` FOREIGN KEY (`properties_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `fktnw4u7w89a21880hmtva47pta` FOREIGN KEY (`ix_core_procrec_id`) REFERENCES `ix_core_procrec` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_session`
--

DROP TABLE IF EXISTS `ix_core_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_session` (
  `id` varchar(40) NOT NULL,
  `accessed` bigint(20) NOT NULL,
  `created` bigint(20) NOT NULL,
  `expired` bit(1) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `profile_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fkfxn2t6y3dre527h1eymkt8lur` (`profile_id`),
  CONSTRAINT `fkfxn2t6y3dre527h1eymkt8lur` FOREIGN KEY (`profile_id`) REFERENCES `ix_core_userprof` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_structure`
--

DROP TABLE IF EXISTS `ix_core_structure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_structure` (
  `DTYPE` varchar(31) NOT NULL,
  `id` varchar(40) NOT NULL,
  `atropi` int(11) DEFAULT NULL,
  `charge` int(11) DEFAULT NULL,
  `count` int(11) DEFAULT NULL,
  `created` datetime(6) DEFAULT NULL,
  `defined_stereo` int(11) DEFAULT NULL,
  `deprecated` bit(1) NOT NULL,
  `digest` varchar(128) DEFAULT NULL,
  `ez_centers` int(11) DEFAULT NULL,
  `formula` varchar(255) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `molfile` longtext DEFAULT NULL,
  `mwt` double DEFAULT NULL,
  `optical` int(11) DEFAULT NULL,
  `smiles` longtext DEFAULT NULL,
  `stereo_centers` int(11) DEFAULT NULL,
  `stereo` varchar(255) DEFAULT NULL,
  `stereo_comments` longtext DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fksobht0ese9794r3q9k1q6i7gp` (`created_by_id`),
  KEY `fk37rfonx9x7vmkwsru7dxxqhhk` (`last_edited_by_id`),
  CONSTRAINT `fk37rfonx9x7vmkwsru7dxxqhhk` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fksobht0ese9794r3q9k1q6i7gp` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_structure_link`
--

DROP TABLE IF EXISTS `ix_core_structure_link`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_structure_link` (
  `ix_core_structure_id` varchar(40) NOT NULL,
  `ix_core_xref_id` bigint(20) NOT NULL,
  KEY `fkdca3xgv2a5p344i74yc7sk89v` (`ix_core_xref_id`),
  KEY `fk44si68uocnubt6vaobd4mgmmy` (`ix_core_structure_id`),
  CONSTRAINT `fk44si68uocnubt6vaobd4mgmmy` FOREIGN KEY (`ix_core_structure_id`) REFERENCES `ix_core_structure` (`id`),
  CONSTRAINT `fkdca3xgv2a5p344i74yc7sk89v` FOREIGN KEY (`ix_core_xref_id`) REFERENCES `ix_core_xref` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_structure_property`
--

DROP TABLE IF EXISTS `ix_core_structure_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_structure_property` (
  `ix_core_structure_id` varchar(40) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  KEY `property_structure_id_index` (`ix_core_structure_id`),
  KEY `property_value_id_index` (`ix_core_value_id`),
  CONSTRAINT `fk4n49941jj4uufoosy5n1g9rg6` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `fkok4h9jsov59dh00wnrmsnd12x` FOREIGN KEY (`ix_core_structure_id`) REFERENCES `ix_core_structure` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_user_saved_list`
--

DROP TABLE IF EXISTS `ix_core_user_saved_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_user_saved_list` (
  `id` bigint(20) NOT NULL,
  `kind` varchar(255) DEFAULT NULL,
  `list` longtext DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ukg72w8umh72yn9lnpxxycln5jd` (`name`,`user_id`,`kind`),
  KEY `fkhd1bc5m9wxca27lxoexqjfwei` (`user_id`),
  CONSTRAINT `fkhd1bc5m9wxca27lxoexqjfwei` FOREIGN KEY (`user_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_userprof`
--

DROP TABLE IF EXISTS `ix_core_userprof`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_userprof` (
  `id` bigint(20) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `deprecated` bit(1) NOT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `active` bit(1) NOT NULL,
  `hashp` varchar(255) DEFAULT NULL,
  `apikey` varchar(255) DEFAULT NULL,
  `ROLES_JSON` longtext DEFAULT NULL,
  `salt` varchar(255) DEFAULT NULL,
  `system_auth` bit(1) NOT NULL,
  `namespace_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fks5bqupbwldu7843qnt8tuntnu` (`namespace_id`),
  KEY `fknq0obnfqd9j3uh1uxdqn3ouq7` (`user_id`),
  CONSTRAINT `fknq0obnfqd9j3uh1uxdqn3ouq7` FOREIGN KEY (`user_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fks5bqupbwldu7843qnt8tuntnu` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER ix_core_userprof_update_roles BEFORE UPDATE ON ix_core_userprof
FOR EACH ROW
BEGIN
  IF NEW.roles_json IS NULL THEN
    SET NEW.roles_json = '["Query","Updater","SuperUpdate","DataEntry","SuperDataEntry"]';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ix_core_userprof_prop`
--

DROP TABLE IF EXISTS `ix_core_userprof_prop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_userprof_prop` (
  `ix_core_userprof_id` bigint(20) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  KEY `fknfow9qqryxbxgppprcum5khf8` (`ix_core_value_id`),
  KEY `fklloqe5wbjywhajh4tw6ilfnvg` (`ix_core_userprof_id`),
  CONSTRAINT `fklloqe5wbjywhajh4tw6ilfnvg` FOREIGN KEY (`ix_core_userprof_id`) REFERENCES `ix_core_userprof` (`id`),
  CONSTRAINT `fknfow9qqryxbxgppprcum5khf8` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_value`
--

DROP TABLE IF EXISTS `ix_core_value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_value` (
  `DTYPE` varchar(31) NOT NULL,
  `id` bigint(20) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `intval` bigint(20) DEFAULT NULL,
  `average` double DEFAULT NULL,
  `lval` double DEFAULT NULL,
  `rval` double DEFAULT NULL,
  `data` longblob DEFAULT NULL,
  `mime_type` varchar(32) DEFAULT NULL,
  `sha1` varchar(40) DEFAULT NULL,
  `data_size` int(11) DEFAULT NULL,
  `strval` varchar(1024) DEFAULT NULL,
  `href` longtext DEFAULT NULL,
  `term` varchar(255) DEFAULT NULL,
  `numval` double DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `heading` varchar(1024) DEFAULT NULL,
  `major_topic` bit(1) DEFAULT NULL,
  `text` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `value_label_index` (`label`),
  KEY `value_term_index` (`term`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_xref`
--

DROP TABLE IF EXISTS `ix_core_xref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_xref` (
  `id` bigint(20) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `deprecated` bit(1) NOT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `kind` varchar(255) NOT NULL,
  `refid` varchar(40) NOT NULL,
  `namespace_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `xref_refid_index` (`refid`),
  KEY `xref_kind_index` (`kind`),
  KEY `fk6g9t8ugidjwe166t5nk7x2wqm` (`namespace_id`),
  CONSTRAINT `fk6g9t8ugidjwe166t5nk7x2wqm` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_xref_property`
--

DROP TABLE IF EXISTS `ix_core_xref_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_core_xref_property` (
  `ix_core_xref_id` bigint(20) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  KEY `fkaucrto6dcvyyq1n6jo332gqsf` (`ix_core_value_id`),
  KEY `fkmr6or6lteb684kq2e1dgsxl1w` (`ix_core_xref_id`),
  CONSTRAINT `fkaucrto6dcvyyq1n6jo332gqsf` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `fkmr6or6lteb684kq2e1dgsxl1w` FOREIGN KEY (`ix_core_xref_id`) REFERENCES `ix_core_xref` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_agentmod`
--

DROP TABLE IF EXISTS `ix_ginas_agentmod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_agentmod` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `agent_modification_process` varchar(255) DEFAULT NULL,
  `agent_modification_role` varchar(255) DEFAULT NULL,
  `agent_modification_type` varchar(255) DEFAULT NULL,
  `modification_group` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `agent_substance_uuid` varchar(40) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk837ol47m9wstcu74fp5toniam` (`created_by_id`),
  KEY `fk2prhrnc5vlo55jxu1rxgpfdw1` (`last_edited_by_id`),
  KEY `fk2x5f4lw85tpkym1r3urwp2u3w` (`agent_substance_uuid`),
  KEY `fki7hwi4cyu1hi7yjo2ddwkig51` (`amount_uuid`),
  KEY `fk9ybw4linkblw3p4u25cq6qs0d` (`owner_uuid`),
  CONSTRAINT `fk2prhrnc5vlo55jxu1rxgpfdw1` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fk2x5f4lw85tpkym1r3urwp2u3w` FOREIGN KEY (`agent_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `fk837ol47m9wstcu74fp5toniam` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fk9ybw4linkblw3p4u25cq6qs0d` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_modifications` (`uuid`),
  CONSTRAINT `fki7hwi4cyu1hi7yjo2ddwkig51` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_amount`
--

DROP TABLE IF EXISTS `ix_ginas_amount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_amount` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `approval_id` varchar(10) DEFAULT NULL,
  `average` double DEFAULT NULL,
  `high` double DEFAULT NULL,
  `high_limit` double DEFAULT NULL,
  `low` double DEFAULT NULL,
  `low_limit` double DEFAULT NULL,
  `non_numeric_value` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `units` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fkqsmrbuknll0fmv6jthf4cycy5` (`created_by_id`),
  KEY `fk9leptgx7incy9twmrwcpeo2bm` (`last_edited_by_id`),
  CONSTRAINT `fk9leptgx7incy9twmrwcpeo2bm` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkqsmrbuknll0fmv6jthf4cycy5` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_code`
--

DROP TABLE IF EXISTS `ix_ginas_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_code` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `code_system` varchar(255) DEFAULT NULL,
  `code_text` longtext DEFAULT NULL,
  `comments` longtext DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `url` longtext DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `ix_ix_ginas_code_code` (`code`),
  KEY `ix_ix_ginas_code_code_system` (`code_system`),
  KEY `ix_ix_ginas_code_type` (`type`),
  KEY `ix_ix_ginas_code_owner` (`owner_uuid`),
  KEY `fkfwn6blkrhusg1xhrue0u820p` (`created_by_id`),
  KEY `fkpio633txjf8p5soyujcrtbx9v` (`last_edited_by_id`),
  CONSTRAINT `fke9p0ygr5drc93bxry80f9y215` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `fkfwn6blkrhusg1xhrue0u820p` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkpio633txjf8p5soyujcrtbx9v` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_component`
--

DROP TABLE IF EXISTS `ix_ginas_component`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_component` (
  `DTYPE` varchar(31) NOT NULL,
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `substance_uuid` varchar(40) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fkodvtp4qvwc7nyfr3lbc893o6m` (`created_by_id`),
  KEY `fkbbvqudmdnm60le1imuwb2uj5x` (`last_edited_by_id`),
  KEY `fkql4nn094peyvxrwctj1ga2wp2` (`substance_uuid`),
  KEY `fksqa51pxp5tbk6vyu34qbr8c5u` (`amount_uuid`),
  CONSTRAINT `fkbbvqudmdnm60le1imuwb2uj5x` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkodvtp4qvwc7nyfr3lbc893o6m` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkql4nn094peyvxrwctj1ga2wp2` FOREIGN KEY (`substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `fksqa51pxp5tbk6vyu34qbr8c5u` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_controlled_vocab`
--

DROP TABLE IF EXISTS `ix_ginas_controlled_vocab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_controlled_vocab` (
  `DTYPE` varchar(31) NOT NULL,
  `id` bigint(20) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `deprecated` bit(1) NOT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `editable` bit(1) NOT NULL,
  `filterable` bit(1) NOT NULL,
  `vocabulary_term_type` varchar(255) DEFAULT NULL,
  `namespace_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_ytqxax1bcj99cxs7tos6l26k` (`domain`),
  KEY `fk68jp62s2i2745esqr9px9s5a2` (`namespace_id`),
  CONSTRAINT `fk68jp62s2i2745esqr9px9s5a2` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_definition`
--

DROP TABLE IF EXISTS `ix_ginas_definition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_definition` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `definition` longtext DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk4kcslc98jcqx137enxl5fgs5t` (`created_by_id`),
  KEY `fk9wxg9p9i1bi7qoxfcu9gkg9og` (`last_edited_by_id`),
  CONSTRAINT `fk4kcslc98jcqx137enxl5fgs5t` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fk9wxg9p9i1bi7qoxfcu9gkg9og` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_glycosylation`
--

DROP TABLE IF EXISTS `ix_ginas_glycosylation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_glycosylation` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `glycosylation_type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `c_glycosylation_sites_uuid` varchar(40) DEFAULT NULL,
  `n_glycosylation_sites_uuid` varchar(40) DEFAULT NULL,
  `o_glycosylation_sites_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk6dapjdumuglm11xxawpupefqm` (`created_by_id`),
  KEY `fkpglm1avjx8n78aom78j3ju3bf` (`last_edited_by_id`),
  KEY `fkqiim2s89ddjuxbkhpv3xa023j` (`c_glycosylation_sites_uuid`),
  KEY `fkffabrw84stgayaui9g1a4wk1g` (`n_glycosylation_sites_uuid`),
  KEY `fkmt1ufykgpny0dlxj36h6tgxwr` (`o_glycosylation_sites_uuid`),
  CONSTRAINT `fk6dapjdumuglm11xxawpupefqm` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkffabrw84stgayaui9g1a4wk1g` FOREIGN KEY (`n_glycosylation_sites_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `fkmt1ufykgpny0dlxj36h6tgxwr` FOREIGN KEY (`o_glycosylation_sites_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `fkpglm1avjx8n78aom78j3ju3bf` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkqiim2s89ddjuxbkhpv3xa023j` FOREIGN KEY (`c_glycosylation_sites_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_linkage`
--

DROP TABLE IF EXISTS `ix_ginas_linkage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_linkage` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `linkage` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `site_container_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fkq619bp0y4e8y3c6efgyp2k8ux` (`created_by_id`),
  KEY `fkfctm6wmaejthxy8y5gtbaqd80` (`last_edited_by_id`),
  KEY `fkotqo99g96i7epg4s384xushll` (`owner_uuid`),
  KEY `fkaao7lfx6xsyc4l1cpmsga4vre` (`site_container_uuid`),
  CONSTRAINT `fkaao7lfx6xsyc4l1cpmsga4vre` FOREIGN KEY (`site_container_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `fkfctm6wmaejthxy8y5gtbaqd80` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkotqo99g96i7epg4s384xushll` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_nucleicacid` (`uuid`),
  CONSTRAINT `fkq619bp0y4e8y3c6efgyp2k8ux` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_material`
--

DROP TABLE IF EXISTS `ix_ginas_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_material` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `defining` bit(1) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  `monomer_substance_uuid` varchar(40) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk6ts531mold2ibya0c038hebea` (`created_by_id`),
  KEY `fkpab2df5aaru3riy5vxd86uve3` (`last_edited_by_id`),
  KEY `fkipvr7dsgmt37oig421t41o385` (`amount_uuid`),
  KEY `fkegxevel4526aib74sesmtu25e` (`monomer_substance_uuid`),
  KEY `fkuvsb9isctq5ela0dqy2hhwti` (`owner_uuid`),
  CONSTRAINT `fk6ts531mold2ibya0c038hebea` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkegxevel4526aib74sesmtu25e` FOREIGN KEY (`monomer_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `fkipvr7dsgmt37oig421t41o385` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `fkpab2df5aaru3riy5vxd86uve3` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkuvsb9isctq5ela0dqy2hhwti` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_polymer` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_mixture`
--

DROP TABLE IF EXISTS `ix_ginas_mixture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_mixture` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `parent_substance_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk4tqay4hgaqpm3sq8rx9184jat` (`created_by_id`),
  KEY `fkjfwb6hqmtuoadhdx7wpkhxaju` (`last_edited_by_id`),
  KEY `fko0yqo20vk9l8tqybgp75o23km` (`parent_substance_uuid`),
  CONSTRAINT `fk4tqay4hgaqpm3sq8rx9184jat` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkjfwb6hqmtuoadhdx7wpkhxaju` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fko0yqo20vk9l8tqybgp75o23km` FOREIGN KEY (`parent_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_modifications`
--

DROP TABLE IF EXISTS `ix_ginas_modifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_modifications` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fknt72fojjxifrwa7bfwjw8cpm5` (`created_by_id`),
  KEY `fkpod9b4pm2tw1e4llfvayoivw4` (`last_edited_by_id`),
  CONSTRAINT `fknt72fojjxifrwa7bfwjw8cpm5` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkpod9b4pm2tw1e4llfvayoivw4` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_moiety`
--

DROP TABLE IF EXISTS `ix_ginas_moiety`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_moiety` (
  `inner_uuid` varchar(255) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `uuid` varchar(40) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `count_uuid` varchar(40) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `structure_id` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`inner_uuid`),
  UNIQUE KEY `UK_8cr4axbsithvjxcfhnltaejsp` (`uuid`),
  KEY `moiety_owner_index` (`owner_uuid`),
  KEY `fkkw3ljg8rkiv07pcn0o0n3o02a` (`created_by_id`),
  KEY `fk3a5dgbi1pmatnvuta5a4wy3aq` (`last_edited_by_id`),
  KEY `fkf0mktcfnu1ly1x7ubmf41lh2n` (`count_uuid`),
  KEY `fkc3r993grtkv5al4opvpv554ga` (`structure_id`),
  CONSTRAINT `fk3a5dgbi1pmatnvuta5a4wy3aq` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fk8olyp6rpiq8yxtuk3mxsnbels` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `fkc3r993grtkv5al4opvpv554ga` FOREIGN KEY (`structure_id`) REFERENCES `ix_core_structure` (`id`),
  CONSTRAINT `fkf0mktcfnu1ly1x7ubmf41lh2n` FOREIGN KEY (`count_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `fkkw3ljg8rkiv07pcn0o0n3o02a` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_name`
--

DROP TABLE IF EXISTS `ix_ginas_name`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_name` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `display_name` bit(1) NOT NULL,
  `domains` longtext DEFAULT NULL,
  `full_name` longtext DEFAULT NULL,
  `languages` longtext DEFAULT NULL,
  `name` varchar(1024) NOT NULL,
  `name_jurisdiction` longtext DEFAULT NULL,
  `preferred` bit(1) NOT NULL,
  `std_name` longtext DEFAULT NULL,
  `type` varchar(32) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `name_index` (`name`(768)),
  KEY `name_owner_index` (`owner_uuid`),
  KEY `fklhhdrsy7v2qr1amwmw0981mv2` (`created_by_id`),
  KEY `fkgwls3gldgeqmgliev3kcvhjml` (`last_edited_by_id`),
  CONSTRAINT `fkeqm42ow1b2o1c3uhu3d1k2efm` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `fkgwls3gldgeqmgliev3kcvhjml` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fklhhdrsy7v2qr1amwmw0981mv2` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_nameorg`
--

DROP TABLE IF EXISTS `ix_ginas_nameorg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_nameorg` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `deprecated_date` datetime(6) DEFAULT NULL,
  `name_org` varchar(255) NOT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `nameorg_owner_index` (`owner_uuid`),
  KEY `fkk77bj1lax07ocd00s3sfmn6ot` (`created_by_id`),
  KEY `fkm5w47bga21kw55x56q7jbbguj` (`last_edited_by_id`),
  CONSTRAINT `fkk77bj1lax07ocd00s3sfmn6ot` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkm5w47bga21kw55x56q7jbbguj` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkqtmeq2vb6siyu40vxnw4c8vq` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_name` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_note`
--

DROP TABLE IF EXISTS `ix_ginas_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_note` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `note` longtext DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `note_owner_index` (`owner_uuid`),
  KEY `fkge1aq2fv84ucy1ilwx97vpuwu` (`created_by_id`),
  KEY `fkpg2o4yxwwlbbw1rro1c5df60` (`last_edited_by_id`),
  CONSTRAINT `fkge1aq2fv84ucy1ilwx97vpuwu` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkj3nrt8342rqojj5d4k24w5tgm` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `fkpg2o4yxwwlbbw1rro1c5df60` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_nucleicacid`
--

DROP TABLE IF EXISTS `ix_ginas_nucleicacid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_nucleicacid` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `nucleic_acid_sub_type` varchar(255) DEFAULT NULL,
  `nucleic_acid_type` varchar(255) DEFAULT NULL,
  `sequence_origin` varchar(255) DEFAULT NULL,
  `sequence_type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `modifications_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fkm9yv3dunytjgyjfiq6r503lyr` (`created_by_id`),
  KEY `fk6jk9rw9co4676wg98pvseggxc` (`last_edited_by_id`),
  KEY `fkck0ay4di4y12vsqd9gqw4qh4b` (`modifications_uuid`),
  CONSTRAINT `fk6jk9rw9co4676wg98pvseggxc` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkck0ay4di4y12vsqd9gqw4qh4b` FOREIGN KEY (`modifications_uuid`) REFERENCES `ix_ginas_modifications` (`uuid`),
  CONSTRAINT `fkm9yv3dunytjgyjfiq6r503lyr` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_nucleicacid_subunits`
--

DROP TABLE IF EXISTS `ix_ginas_nucleicacid_subunits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_nucleicacid_subunits` (
  `ix_ginas_nucleicacid_uuid` varchar(40) NOT NULL,
  `ix_ginas_subunit_uuid` varchar(40) NOT NULL,
  KEY `fkjun57ycd07jv8oe3h8566r488` (`ix_ginas_subunit_uuid`),
  KEY `fkdby8ustw4fo38x6e98cg814td` (`ix_ginas_nucleicacid_uuid`),
  CONSTRAINT `fkdby8ustw4fo38x6e98cg814td` FOREIGN KEY (`ix_ginas_nucleicacid_uuid`) REFERENCES `ix_ginas_nucleicacid` (`uuid`),
  CONSTRAINT `fkjun57ycd07jv8oe3h8566r488` FOREIGN KEY (`ix_ginas_subunit_uuid`) REFERENCES `ix_ginas_subunit` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_otherlinks`
--

DROP TABLE IF EXISTS `ix_ginas_otherlinks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_otherlinks` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `linkage_type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `site_container_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk9sukhdr4s0yje92m8hp82hitx` (`created_by_id`),
  KEY `fkigwh0j2irewbpsb1xgael3pim` (`last_edited_by_id`),
  KEY `fkdub4td7p5ki0u4dl83j4u9ysr` (`owner_uuid`),
  KEY `fk5nj85bcu54jc56se3hm4q3chm` (`site_container_uuid`),
  CONSTRAINT `fk5nj85bcu54jc56se3hm4q3chm` FOREIGN KEY (`site_container_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `fk9sukhdr4s0yje92m8hp82hitx` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkdub4td7p5ki0u4dl83j4u9ysr` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_protein` (`uuid`),
  CONSTRAINT `fkigwh0j2irewbpsb1xgael3pim` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_parameter`
--

DROP TABLE IF EXISTS `ix_ginas_parameter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_parameter` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `referenced_substance_uuid` varchar(40) DEFAULT NULL,
  `value_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fklbuqth4cgx61sh4rcci2mdl1o` (`created_by_id`),
  KEY `fklj93g1oplslasut6r924dft2l` (`last_edited_by_id`),
  KEY `fk9ixg1ch1e0hueyta2dh4vlidg` (`owner_uuid`),
  KEY `fkdxnyu34iqqponnw4bnj9hk8rb` (`referenced_substance_uuid`),
  KEY `fkix1d880p7x7v51quhcre616af` (`value_uuid`),
  CONSTRAINT `fk9ixg1ch1e0hueyta2dh4vlidg` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_property` (`uuid`),
  CONSTRAINT `fkdxnyu34iqqponnw4bnj9hk8rb` FOREIGN KEY (`referenced_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `fkix1d880p7x7v51quhcre616af` FOREIGN KEY (`value_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `fklbuqth4cgx61sh4rcci2mdl1o` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fklj93g1oplslasut6r924dft2l` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_physicalmod`
--

DROP TABLE IF EXISTS `ix_ginas_physicalmod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_physicalmod` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `modification_group` varchar(255) DEFAULT NULL,
  `physical_modification_role` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk32ojpkiiy03fk8ro0eyclrbkh` (`created_by_id`),
  KEY `fk23yuiouuyqodtlxmjxopv0ybf` (`last_edited_by_id`),
  KEY `fkd8fg9mm0ilkfdii08s5qsonde` (`owner_uuid`),
  CONSTRAINT `fk23yuiouuyqodtlxmjxopv0ybf` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fk32ojpkiiy03fk8ro0eyclrbkh` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkd8fg9mm0ilkfdii08s5qsonde` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_modifications` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_physicalpar`
--

DROP TABLE IF EXISTS `ix_ginas_physicalpar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_physicalpar` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `parameter_name` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fkrfgl3mys5n5wiknd32enb7hmb` (`created_by_id`),
  KEY `fkd1w1xyqt12divo39phpoi2113` (`last_edited_by_id`),
  KEY `fk4ce1vbnehe206ru4gctnlkidh` (`amount_uuid`),
  KEY `fk1e30fjxi7rv1m875713tges77` (`owner_uuid`),
  CONSTRAINT `fk1e30fjxi7rv1m875713tges77` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_physicalmod` (`uuid`),
  CONSTRAINT `fk4ce1vbnehe206ru4gctnlkidh` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `fkd1w1xyqt12divo39phpoi2113` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkrfgl3mys5n5wiknd32enb7hmb` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_polymer`
--

DROP TABLE IF EXISTS `ix_ginas_polymer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_polymer` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `classification_uuid` varchar(40) DEFAULT NULL,
  `display_structure_id` varchar(40) DEFAULT NULL,
  `idealized_structure_id` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk8axkm0cbpwpc43krkhw8y6tad` (`created_by_id`),
  KEY `fk5o81f597yvub0mf1b6cnqx8ev` (`last_edited_by_id`),
  KEY `fktn8tft3hwqnpv8tkfhtbh5jsm` (`classification_uuid`),
  KEY `fkcd56mdyyo9bvrrd80w0y8iixl` (`display_structure_id`),
  KEY `fk264hsvr9c8q3w1e51j99ua2d0` (`idealized_structure_id`),
  CONSTRAINT `fk264hsvr9c8q3w1e51j99ua2d0` FOREIGN KEY (`idealized_structure_id`) REFERENCES `ix_core_structure` (`id`),
  CONSTRAINT `fk5o81f597yvub0mf1b6cnqx8ev` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fk8axkm0cbpwpc43krkhw8y6tad` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkcd56mdyyo9bvrrd80w0y8iixl` FOREIGN KEY (`display_structure_id`) REFERENCES `ix_core_structure` (`id`),
  CONSTRAINT `fktn8tft3hwqnpv8tkfhtbh5jsm` FOREIGN KEY (`classification_uuid`) REFERENCES `polymer_classification` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_property`
--

DROP TABLE IF EXISTS `ix_ginas_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_property` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `defining` bit(1) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `property_type` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `referenced_substance_uuid` varchar(40) DEFAULT NULL,
  `value_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `property_owner_index` (`owner_uuid`),
  KEY `fktla10hxba7smca0g675soamsq` (`created_by_id`),
  KEY `fkafltirwo87s1so6vigtf1s8mn` (`last_edited_by_id`),
  KEY `fkoh8nhvrowpdthcxj69pwkke9t` (`referenced_substance_uuid`),
  KEY `fkpbekqdofak8ol2fq92f5onn1t` (`value_uuid`),
  CONSTRAINT `fkafltirwo87s1so6vigtf1s8mn` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkoh8nhvrowpdthcxj69pwkke9t` FOREIGN KEY (`referenced_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `fkpbekqdofak8ol2fq92f5onn1t` FOREIGN KEY (`value_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `fkrlu3e72lq9y59122xd75q51vt` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `fktla10hxba7smca0g675soamsq` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_protein`
--

DROP TABLE IF EXISTS `ix_ginas_protein`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_protein` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `disulf_json` longtext DEFAULT NULL,
  `protein_sub_type` varchar(255) DEFAULT NULL,
  `protein_type` varchar(255) DEFAULT NULL,
  `sequence_origin` varchar(255) DEFAULT NULL,
  `sequence_type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `glycosylation_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk6ay15bqty5r2xmk13a4ld75rm` (`created_by_id`),
  KEY `fkpovxe3t3ycsa1x6xivr20ukbh` (`last_edited_by_id`),
  KEY `fkec7ms0paeosyymbpsnbu5pjfb` (`glycosylation_uuid`),
  CONSTRAINT `fk6ay15bqty5r2xmk13a4ld75rm` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkec7ms0paeosyymbpsnbu5pjfb` FOREIGN KEY (`glycosylation_uuid`) REFERENCES `ix_ginas_glycosylation` (`uuid`),
  CONSTRAINT `fkpovxe3t3ycsa1x6xivr20ukbh` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_protein_subunit`
--

DROP TABLE IF EXISTS `ix_ginas_protein_subunit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_protein_subunit` (
  `ix_ginas_protein_uuid` varchar(40) NOT NULL,
  `ix_ginas_subunit_uuid` varchar(40) NOT NULL,
  KEY `fklk7qxuwt9o7g8k6rphr5jj7ey` (`ix_ginas_subunit_uuid`),
  KEY `fk39xyg6fxghld06apb91xc1xt6` (`ix_ginas_protein_uuid`),
  CONSTRAINT `fk39xyg6fxghld06apb91xc1xt6` FOREIGN KEY (`ix_ginas_protein_uuid`) REFERENCES `ix_ginas_protein` (`uuid`),
  CONSTRAINT `fklk7qxuwt9o7g8k6rphr5jj7ey` FOREIGN KEY (`ix_ginas_subunit_uuid`) REFERENCES `ix_ginas_subunit` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_reference`
--

DROP TABLE IF EXISTS `ix_ginas_reference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_reference` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `citation` longtext DEFAULT NULL,
  `doc_type` varchar(255) DEFAULT NULL,
  `document_date` datetime(6) DEFAULT NULL,
  `id` varchar(255) DEFAULT NULL,
  `public_domain` bit(1) NOT NULL,
  `tags` longtext DEFAULT NULL,
  `uploaded_file` varchar(1024) DEFAULT NULL,
  `url` longtext DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `ref_id_index` (`id`),
  KEY `ref_owner_index` (`owner_uuid`),
  KEY `fkpv1epn9el8d1fpqct4px1nio7` (`created_by_id`),
  KEY `fk975dqn3b674b23ga0igmmct25` (`last_edited_by_id`),
  CONSTRAINT `fk975dqn3b674b23ga0igmmct25` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkk7kui3q4qm7pwdq679ibkyi5h` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `fkpv1epn9el8d1fpqct4px1nio7` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_relationship`
--

DROP TABLE IF EXISTS `ix_ginas_relationship`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_relationship` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `comments` longtext DEFAULT NULL,
  `interaction_type` varchar(255) DEFAULT NULL,
  `originator_uuid` varchar(255) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  `mediator_substance_uuid` varchar(40) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `related_substance_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `interaction_index` (`interaction_type`),
  KEY `qualification_index` (`qualification`),
  KEY `type_index` (`type`),
  KEY `relate_originate_index` (`originator_uuid`),
  KEY `rel_owner_index` (`owner_uuid`),
  KEY `fk70gmjxu8uevujxd4uetj6nfm3` (`created_by_id`),
  KEY `fkmsd9lm6ayae7qbwp1iv50ftbb` (`last_edited_by_id`),
  KEY `fk492eul84p3uecmkpqmd8ujvkb` (`amount_uuid`),
  KEY `fksim8mqlrevhpl0aa0hrdh3wwe` (`mediator_substance_uuid`),
  KEY `fkb6yhrsc7dprxg0apyknpue5ij` (`related_substance_uuid`),
  CONSTRAINT `fk492eul84p3uecmkpqmd8ujvkb` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `fk70gmjxu8uevujxd4uetj6nfm3` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkb6yhrsc7dprxg0apyknpue5ij` FOREIGN KEY (`related_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `fkmsd9lm6ayae7qbwp1iv50ftbb` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkr1msd0rheudj2srgokqrftrek` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `fksim8mqlrevhpl0aa0hrdh3wwe` FOREIGN KEY (`mediator_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_site_lob`
--

DROP TABLE IF EXISTS `ix_ginas_site_lob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_site_lob` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `site_count` bigint(20) NOT NULL,
  `site_type` varchar(255) DEFAULT NULL,
  `sites_json` longtext DEFAULT NULL,
  `sites_short_hand` longtext DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fkfbc7le8ehsxj39t2yikmmy3py` (`created_by_id`),
  KEY `fkh2cg1v3f9ha8t0w4l8iprib2g` (`last_edited_by_id`),
  CONSTRAINT `fkfbc7le8ehsxj39t2yikmmy3py` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkh2cg1v3f9ha8t0w4l8iprib2g` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_ssg1`
--

DROP TABLE IF EXISTS `ix_ginas_ssg1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_ssg1` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk3tljtp4q2e94j2q27hgnnhse4` (`created_by_id`),
  KEY `fkle7gsf4fuf75tsrvksgvkjc25` (`last_edited_by_id`),
  CONSTRAINT `fk3tljtp4q2e94j2q27hgnnhse4` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkle7gsf4fuf75tsrvksgvkjc25` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_strucdiv`
--

DROP TABLE IF EXISTS `ix_ginas_strucdiv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_strucdiv` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `developmental_stage` varchar(255) DEFAULT NULL,
  `fraction_material_type` varchar(255) DEFAULT NULL,
  `fraction_name` varchar(255) DEFAULT NULL,
  `infra_specific_name` varchar(255) DEFAULT NULL,
  `infra_specific_type` varchar(255) DEFAULT NULL,
  `organism_author` varchar(255) DEFAULT NULL,
  `organism_family` varchar(255) DEFAULT NULL,
  `organism_genus` varchar(255) DEFAULT NULL,
  `organism_species` varchar(255) DEFAULT NULL,
  `part` longtext DEFAULT NULL,
  `part_location` varchar(255) DEFAULT NULL,
  `source_material_class` varchar(255) DEFAULT NULL,
  `source_material_state` varchar(255) DEFAULT NULL,
  `source_material_type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `maternal_uuid` varchar(40) DEFAULT NULL,
  `paternal_uuid` varchar(40) DEFAULT NULL,
  `parent_substance_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fkqpk4af5q91r4nsm521kd57298` (`created_by_id`),
  KEY `fk4epq4o38ci57y71dxu7ootl41` (`last_edited_by_id`),
  KEY `fkhh72pwq35aaqgv370uavhtnjh` (`maternal_uuid`),
  KEY `fk6lcu1945kbaxi6fmir3qt5ugk` (`paternal_uuid`),
  KEY `fk27p7qapsxr5d2efscf8k7521` (`parent_substance_uuid`),
  CONSTRAINT `fk27p7qapsxr5d2efscf8k7521` FOREIGN KEY (`parent_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `fk4epq4o38ci57y71dxu7ootl41` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fk6lcu1945kbaxi6fmir3qt5ugk` FOREIGN KEY (`paternal_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `fkhh72pwq35aaqgv370uavhtnjh` FOREIGN KEY (`maternal_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `fkqpk4af5q91r4nsm521kd57298` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_structuralmod`
--

DROP TABLE IF EXISTS `ix_ginas_structuralmod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_structuralmod` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `extent` varchar(255) DEFAULT NULL,
  `location_type` varchar(255) DEFAULT NULL,
  `modification_group` varchar(255) DEFAULT NULL,
  `moleculare_fragment_role` varchar(255) DEFAULT NULL,
  `residue_modified` varchar(255) DEFAULT NULL,
  `structural_modification_type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `extent_amount_uuid` varchar(40) DEFAULT NULL,
  `molecular_fragment_uuid` varchar(40) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `site_container_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fkndd0pxjud610e953hg730emw` (`created_by_id`),
  KEY `fk1ysjs1dx6uo8flj8rkiscscx4` (`last_edited_by_id`),
  KEY `fktkmtm9vpmaklmypp3jad1pspp` (`extent_amount_uuid`),
  KEY `fk6n3mtotuwqi717fr2evp3dfxi` (`molecular_fragment_uuid`),
  KEY `fkoi4vt2lg0x2v3s4urckwjb3s3` (`owner_uuid`),
  KEY `fkb94sjca6cclvcwtx2osvdeuu` (`site_container_uuid`),
  CONSTRAINT `fk1ysjs1dx6uo8flj8rkiscscx4` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fk6n3mtotuwqi717fr2evp3dfxi` FOREIGN KEY (`molecular_fragment_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `fkb94sjca6cclvcwtx2osvdeuu` FOREIGN KEY (`site_container_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `fkndd0pxjud610e953hg730emw` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkoi4vt2lg0x2v3s4urckwjb3s3` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_modifications` (`uuid`),
  CONSTRAINT `fktkmtm9vpmaklmypp3jad1pspp` FOREIGN KEY (`extent_amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_substance`
--

DROP TABLE IF EXISTS `ix_ginas_substance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_substance` (
  `DTYPE` varchar(31) NOT NULL,
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `approval_id` varchar(20) DEFAULT NULL,
  `approved` datetime(6) DEFAULT NULL,
  `change_reason` varchar(255) DEFAULT NULL,
  `definition_level` int(11) DEFAULT NULL,
  `definition_type` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `class` int(11) DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `approved_by_id` bigint(20) DEFAULT NULL,
  `modifications_uuid` varchar(40) DEFAULT NULL,
  `structure_id` varchar(40) DEFAULT NULL,
  `specified_substance_uuid` varchar(40) DEFAULT NULL,
  `nucleic_acid_uuid` varchar(40) DEFAULT NULL,
  `polymer_uuid` varchar(40) DEFAULT NULL,
  `structurally_diverse_uuid` varchar(40) DEFAULT NULL,
  `protein_uuid` varchar(40) DEFAULT NULL,
  `mixture_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `sub_approval_index` (`approval_id`),
  KEY `sub_dtype_index` (`DTYPE`),
  KEY `fka9b6lpf9y3l0t04rviskjs8o1` (`created_by_id`),
  KEY `fk9hlo5n1alfg4rgloypq8agc3e` (`last_edited_by_id`),
  KEY `fkmb0vxvmui506xtkh18lw1ucym` (`approved_by_id`),
  KEY `fk30b2jg1r8dr4ibvt3f4h7ui3b` (`modifications_uuid`),
  KEY `fkau9cajhw1nffg9w1vh0am4ls4` (`structure_id`),
  KEY `fkd29meikxu3elfx1w5dket3ia5` (`specified_substance_uuid`),
  KEY `fk8lglxcodtpv6nj0wbw61cpdk9` (`nucleic_acid_uuid`),
  KEY `fkncdqbv3ilcg21bws3e3y0xwg4` (`polymer_uuid`),
  KEY `fkhrs798kf99tmayeg8hjbo9vdl` (`structurally_diverse_uuid`),
  KEY `fkcw3qqer4es16onh3qgcuf6jb8` (`protein_uuid`),
  KEY `fkekk08a5uheng9eocf61xo4m2l` (`mixture_uuid`),
  CONSTRAINT `fk30b2jg1r8dr4ibvt3f4h7ui3b` FOREIGN KEY (`modifications_uuid`) REFERENCES `ix_ginas_modifications` (`uuid`),
  CONSTRAINT `fk8lglxcodtpv6nj0wbw61cpdk9` FOREIGN KEY (`nucleic_acid_uuid`) REFERENCES `ix_ginas_nucleicacid` (`uuid`),
  CONSTRAINT `fk9hlo5n1alfg4rgloypq8agc3e` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fka9b6lpf9y3l0t04rviskjs8o1` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkau9cajhw1nffg9w1vh0am4ls4` FOREIGN KEY (`structure_id`) REFERENCES `ix_core_structure` (`id`),
  CONSTRAINT `fkcw3qqer4es16onh3qgcuf6jb8` FOREIGN KEY (`protein_uuid`) REFERENCES `ix_ginas_protein` (`uuid`),
  CONSTRAINT `fkd29meikxu3elfx1w5dket3ia5` FOREIGN KEY (`specified_substance_uuid`) REFERENCES `ix_ginas_ssg1` (`uuid`),
  CONSTRAINT `fkekk08a5uheng9eocf61xo4m2l` FOREIGN KEY (`mixture_uuid`) REFERENCES `ix_ginas_mixture` (`uuid`),
  CONSTRAINT `fkhrs798kf99tmayeg8hjbo9vdl` FOREIGN KEY (`structurally_diverse_uuid`) REFERENCES `ix_ginas_strucdiv` (`uuid`),
  CONSTRAINT `fkmb0vxvmui506xtkh18lw1ucym` FOREIGN KEY (`approved_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkncdqbv3ilcg21bws3e3y0xwg4` FOREIGN KEY (`polymer_uuid`) REFERENCES `ix_ginas_polymer` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_substance_mix_comp`
--

DROP TABLE IF EXISTS `ix_ginas_substance_mix_comp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_substance_mix_comp` (
  `ix_ginas_mixture_uuid` varchar(40) NOT NULL,
  `ix_ginas_component_uuid` varchar(40) NOT NULL,
  KEY `fkjsfcmh12rru7tls24cbkbmb0t` (`ix_ginas_component_uuid`),
  KEY `fkpubptahgdm25hadwlf3pwlfap` (`ix_ginas_mixture_uuid`),
  CONSTRAINT `fkjsfcmh12rru7tls24cbkbmb0t` FOREIGN KEY (`ix_ginas_component_uuid`) REFERENCES `ix_ginas_component` (`uuid`),
  CONSTRAINT `fkpubptahgdm25hadwlf3pwlfap` FOREIGN KEY (`ix_ginas_mixture_uuid`) REFERENCES `ix_ginas_mixture` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_substance_ss_comp`
--

DROP TABLE IF EXISTS `ix_ginas_substance_ss_comp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_substance_ss_comp` (
  `ix_ginas_ssg1_uuid` varchar(40) NOT NULL,
  `ix_ginas_component_uuid` varchar(40) NOT NULL,
  KEY `fkb8ofx08elpr455o7a72rrr9tm` (`ix_ginas_component_uuid`),
  KEY `fkaf57kow6qnxnp2ya35n21jiyo` (`ix_ginas_ssg1_uuid`),
  CONSTRAINT `fkaf57kow6qnxnp2ya35n21jiyo` FOREIGN KEY (`ix_ginas_ssg1_uuid`) REFERENCES `ix_ginas_ssg1` (`uuid`),
  CONSTRAINT `fkb8ofx08elpr455o7a72rrr9tm` FOREIGN KEY (`ix_ginas_component_uuid`) REFERENCES `ix_ginas_component` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_substance_tags`
--

DROP TABLE IF EXISTS `ix_ginas_substance_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_substance_tags` (
  `ix_ginas_substance_uuid` varchar(40) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  KEY `fkjlsvy9nlwl3vf5mvhcvf0y80k` (`ix_core_value_id`),
  KEY `fk2hyjvdeqia2qiemoagh6yjq6b` (`ix_ginas_substance_uuid`),
  CONSTRAINT `fk2hyjvdeqia2qiemoagh6yjq6b` FOREIGN KEY (`ix_ginas_substance_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `fkjlsvy9nlwl3vf5mvhcvf0y80k` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_substanceref`
--

DROP TABLE IF EXISTS `ix_ginas_substanceref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_substanceref` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `approval_ID` varchar(32) DEFAULT NULL,
  `ref_pname` varchar(1024) DEFAULT NULL,
  `refuuid` varchar(128) DEFAULT NULL,
  `substance_class` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `sub_ref_index` (`refuuid`),
  KEY `fko2bjxrp2qi847appx7ecf65vc` (`created_by_id`),
  KEY `fkm6qbi1moehd7wqh9w2ip412us` (`last_edited_by_id`),
  CONSTRAINT `fkm6qbi1moehd7wqh9w2ip412us` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fko2bjxrp2qi847appx7ecf65vc` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_subunit`
--

DROP TABLE IF EXISTS `ix_ginas_subunit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_subunit` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `sequence` longtext DEFAULT NULL,
  `subunit_index` int(11) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk7kjfdjus3twoyg4vd2jp367n6` (`created_by_id`),
  KEY `fk9pyegqu1n4ekd45fdmitw12t7` (`last_edited_by_id`),
  CONSTRAINT `fk7kjfdjus3twoyg4vd2jp367n6` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fk9pyegqu1n4ekd45fdmitw12t7` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_sugar`
--

DROP TABLE IF EXISTS `ix_ginas_sugar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_sugar` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `sugar` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `site_container_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fke6ndxx94bjimsgux4lygsh51f` (`created_by_id`),
  KEY `fk1p4pfd811kxxjqfxbiuu9sknv` (`last_edited_by_id`),
  KEY `fkkx0aeyak8r0byugf719kqu7ms` (`owner_uuid`),
  KEY `fkpx5dhn0168ipbpu04xgmby97y` (`site_container_uuid`),
  CONSTRAINT `fk1p4pfd811kxxjqfxbiuu9sknv` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fke6ndxx94bjimsgux4lygsh51f` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkkx0aeyak8r0byugf719kqu7ms` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_nucleicacid` (`uuid`),
  CONSTRAINT `fkpx5dhn0168ipbpu04xgmby97y` FOREIGN KEY (`site_container_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_unit`
--

DROP TABLE IF EXISTS `ix_ginas_unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_unit` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `attachmentMap` longtext DEFAULT NULL,
  `attachment_count` int(11) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `structure` longtext DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `amap_id` bigint(20) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fkl4qe419byvtxe3epgd4a50glc` (`created_by_id`),
  KEY `fknbsd63mfulnly1dtk7f6vxcq4` (`last_edited_by_id`),
  KEY `fkq8b5gi5r7thxi8vyrli5lrtu2` (`amap_id`),
  KEY `fk2x4h6n93ud35rtm5nxt7xrcmw` (`amount_uuid`),
  KEY `fkf3rxpagehygabef32q3kn4am` (`owner_uuid`),
  CONSTRAINT `fk2x4h6n93ud35rtm5nxt7xrcmw` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `fkf3rxpagehygabef32q3kn4am` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_polymer` (`uuid`),
  CONSTRAINT `fkl4qe419byvtxe3epgd4a50glc` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fknbsd63mfulnly1dtk7f6vxcq4` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkq8b5gi5r7thxi8vyrli5lrtu2` FOREIGN KEY (`amap_id`) REFERENCES `ix_core_value` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_vocabulary_term`
--

DROP TABLE IF EXISTS `ix_ginas_vocabulary_term`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_ginas_vocabulary_term` (
  `DTYPE` varchar(31) NOT NULL,
  `id` bigint(20) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `deprecated` bit(1) NOT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `description` varchar(4000) DEFAULT NULL,
  `display` varchar(3000) DEFAULT NULL,
  `filters` longtext DEFAULT NULL,
  `hidden` bit(1) NOT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `regex` varchar(3000) DEFAULT NULL,
  `selected` bit(1) NOT NULL,
  `term_value` varchar(3000) DEFAULT NULL,
  `system_category` varchar(255) DEFAULT NULL,
  `fragment_structure` varchar(255) DEFAULT NULL,
  `simplified_structure` varchar(255) DEFAULT NULL,
  `namespace_id` bigint(20) DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vocabulary_term_owner_index` (`owner_id`),
  KEY `fk3t5cvdqdtqn0eqc1654fbxhqt` (`namespace_id`),
  CONSTRAINT `fk3t5cvdqdtqn0eqc1654fbxhqt` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`),
  CONSTRAINT `fkbk04rq7l3tav8pey5rm2j14hm` FOREIGN KEY (`owner_id`) REFERENCES `ix_ginas_controlled_vocab` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_import_data`
--

DROP TABLE IF EXISTS `ix_import_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_import_data` (
  `instance_id` varchar(40) NOT NULL,
  `data` longtext DEFAULT NULL,
  `entity_class_name` varchar(255) DEFAULT NULL,
  `record_id` varchar(40) DEFAULT NULL,
  `save_date` datetime(6) DEFAULT NULL,
  `version` int(11) NOT NULL,
  PRIMARY KEY (`instance_id`),
  KEY `idx_ix_import_data_entity_class_name` (`entity_class_name`),
  KEY `idx_ix_import_data_version` (`version`),
  KEY `idx_ix_import_data_record_id` (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_import_mapping`
--

DROP TABLE IF EXISTS `ix_import_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_import_mapping` (
  `mapping_id` varchar(40) NOT NULL,
  `data_location` varchar(255) DEFAULT NULL,
  `entity_class` varchar(255) DEFAULT NULL,
  `instance_id` varchar(40) DEFAULT NULL,
  `mapping_key` varchar(255) DEFAULT NULL,
  `qualifier` varchar(255) DEFAULT NULL,
  `record_id` varchar(40) DEFAULT NULL,
  `mapping_value` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`mapping_id`),
  KEY `idx_ix_import_mapping_key` (`mapping_key`),
  KEY `idx_ix_import_mapping_value` (`mapping_value`),
  KEY `idx_ix_import_mapping_instance_id` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_import_metadata`
--

DROP TABLE IF EXISTS `ix_import_metadata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_import_metadata` (
  `record_id` varchar(40) NOT NULL,
  `data_format` varchar(255) DEFAULT NULL,
  `entity_class_name` varchar(255) DEFAULT NULL,
  `import_adapter` varchar(255) DEFAULT NULL,
  `import_status` int(11) DEFAULT NULL,
  `import_type` int(11) DEFAULT NULL,
  `instance_id` varchar(40) DEFAULT NULL,
  `process_status` int(11) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `source_name` varchar(255) DEFAULT NULL,
  `validation_status` int(11) DEFAULT NULL,
  `version` int(11) NOT NULL,
  `version_creation_date` datetime(6) DEFAULT NULL,
  `version_status` int(11) DEFAULT NULL,
  `imported_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`record_id`),
  UNIQUE KEY `UK_b3wth3q98eiauf3rngwjybxve` (`instance_id`),
  KEY `idx_ix_import_metadata_entity_class_name` (`entity_class_name`),
  KEY `fkn75dm5x09m6wvk7uq5q74do9c` (`imported_by_id`),
  CONSTRAINT `fkn75dm5x09m6wvk7uq5q74do9c` FOREIGN KEY (`imported_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_import_raw`
--

DROP TABLE IF EXISTS `ix_import_raw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_import_raw` (
  `record_id` varchar(40) NOT NULL,
  `raw_data` longblob DEFAULT NULL,
  `record_format` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_import_validation`
--

DROP TABLE IF EXISTS `ix_import_validation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ix_import_validation` (
  `validation_id` varchar(40) NOT NULL,
  `validation_date` datetime(6) DEFAULT NULL,
  `validation_json` longtext DEFAULT NULL,
  `validation_message` varchar(2048) DEFAULT NULL,
  `validation_type` int(11) DEFAULT NULL,
  `entity_class_name` varchar(255) DEFAULT NULL,
  `instance_id` varchar(40) DEFAULT NULL,
  `version` int(11) NOT NULL,
  PRIMARY KEY (`validation_id`),
  KEY `idx_ix_import_validation_entity_class_name` (`entity_class_name`),
  KEY `idx_ix_import_validation_version` (`version`),
  KEY `idx_ix_import_validation_instance_id` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `polymer_classification`
--

DROP TABLE IF EXISTS `polymer_classification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `polymer_classification` (
  `uuid` varchar(40) NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `current_version` int(11) NOT NULL,
  `deprecated` bit(1) NOT NULL,
  `internal_version` bigint(20) DEFAULT NULL,
  `last_edited` datetime(6) DEFAULT NULL,
  `record_access` mediumblob DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `polymer_class` varchar(255) DEFAULT NULL,
  `polymer_geometry` varchar(255) DEFAULT NULL,
  `polymer_subclass` longtext DEFAULT NULL,
  `source_type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `parent_substance_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `fk9tp2yhc5vdofsdnx5cit45hdy` (`created_by_id`),
  KEY `fk6bup6ku2dri7cl4rgno4fd6dd` (`last_edited_by_id`),
  KEY `fkl3chbblh2guqlw9ikn9grc3vb` (`parent_substance_uuid`),
  CONSTRAINT `fk6bup6ku2dri7cl4rgno4fd6dd` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fk9tp2yhc5vdofsdnx5cit45hdy` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `fkl3chbblh2guqlw9ikn9grc3vb` FOREIGN KEY (`parent_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'ixginas_local'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-21 13:18:49
