-- MySQL dump 10.13  Distrib 8.0.34, for Linux (x86_64)
--
-- Host: gsrs-dev-db.cyy6pahwar0b.us-west-2.rds.amazonaws.com    Database: ixginas20230708
-- ------------------------------------------------------
-- Server version	5.5.5-10.6.14-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `LONG_SEQ_ID`
--

DROP TABLE IF EXISTS `LONG_SEQ_ID`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LONG_SEQ_ID` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_batch_processingjob`
--

DROP TABLE IF EXISTS `ix_batch_processingjob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_acl` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `perm` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_acl_group`
--

DROP TABLE IF EXISTS `ix_core_acl_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_acl_group` (
  `ix_core_acl_id` bigint(20) NOT NULL,
  `ix_core_group_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_acl_id`,`ix_core_group_id`),
  KEY `c_37918c15` (`ix_core_group_id`),
  CONSTRAINT `c_37918c15` FOREIGN KEY (`ix_core_group_id`) REFERENCES `ix_core_group` (`id`),
  CONSTRAINT `c_8334ae69` FOREIGN KEY (`ix_core_acl_id`) REFERENCES `ix_core_acl` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_acl_principal`
--

DROP TABLE IF EXISTS `ix_core_acl_principal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_acl_principal` (
  `ix_core_acl_id` bigint(20) NOT NULL,
  `ix_core_principal_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_acl_id`,`ix_core_principal_id`),
  KEY `c_0563d198` (`ix_core_principal_id`),
  CONSTRAINT `c_0563d198` FOREIGN KEY (`ix_core_principal_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_edb5bbb8` FOREIGN KEY (`ix_core_acl_id`) REFERENCES `ix_core_acl` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_acl_seq`
--

DROP TABLE IF EXISTS `ix_core_acl_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_acl_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_attribute`
--

DROP TABLE IF EXISTS `ix_core_attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_attribute` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `value` varchar(1024) DEFAULT NULL,
  `namespace_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `i_2e0d49bb` (`namespace_id`),
  CONSTRAINT `c_5de71e45` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_backup`
--

DROP TABLE IF EXISTS `ix_core_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_backup` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `namespace_id` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `refid` varchar(255) DEFAULT NULL,
  `kind` varchar(255) DEFAULT NULL,
  `data` longblob DEFAULT NULL,
  `sha1` varchar(255) DEFAULT NULL,
  `compressed` tinyint(1) DEFAULT 0,
  `version` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `c_2884574a` (`refid`),
  KEY `i_abc97ed9` (`namespace_id`),
  CONSTRAINT `c_d73bb54b` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5158265 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_backup_seq`
--

DROP TABLE IF EXISTS `ix_core_backup_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_backup_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_curation`
--

DROP TABLE IF EXISTS `ix_core_curation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_curation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `curator_id` bigint(20) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `i_c639b9b3` (`curator_id`),
  CONSTRAINT `c_a6783131` FOREIGN KEY (`curator_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_db_gsrs_version`
--

DROP TABLE IF EXISTS `ix_core_db_gsrs_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_edit` (
  `id` varchar(40) NOT NULL,
  `created` bigint(20) DEFAULT NULL,
  `refid` varchar(255) DEFAULT NULL,
  `kind` varchar(255) DEFAULT NULL,
  `batch` varchar(64) DEFAULT NULL,
  `editor_id` bigint(20) DEFAULT NULL,
  `path` varchar(1024) DEFAULT NULL,
  `comments` longtext DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `old_value` longtext DEFAULT NULL,
  `new_value` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `i_7aee51ce` (`editor_id`),
  KEY `refid_core_edit_index` (`refid`),
  KEY `kind_core_edit_index` (`kind`),
  CONSTRAINT `c_12a5334f` FOREIGN KEY (`editor_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_etag`
--

DROP TABLE IF EXISTS `ix_core_etag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_etag` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `namespace_id` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `etag` varchar(16) DEFAULT NULL,
  `uri` varchar(4000) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `sha1` varchar(40) DEFAULT NULL,
  `total` int(11) DEFAULT NULL,
  `count` int(11) DEFAULT NULL,
  `skip` int(11) DEFAULT NULL,
  `top` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `query` varchar(2048) DEFAULT NULL,
  `filter` varchar(4000) DEFAULT NULL,
  `version` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `c_116a77ea` (`etag`),
  KEY `i_2713cf1c` (`namespace_id`),
  CONSTRAINT `c_d104ddaf` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36300825 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_etag_seq`
--

DROP TABLE IF EXISTS `ix_core_etag_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_etag_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_etagref`
--

DROP TABLE IF EXISTS `ix_core_etagref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_etagref` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `etag_id` bigint(20) DEFAULT NULL,
  `ref_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `i_5e1fe842` (`etag_id`),
  CONSTRAINT `c_aa5f10b2` FOREIGN KEY (`etag_id`) REFERENCES `ix_core_etag` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_event`
--

DROP TABLE IF EXISTS `ix_core_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_event` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `url` varchar(1024) DEFAULT NULL,
  `start_time` bigint(20) DEFAULT NULL,
  `end_time` bigint(20) DEFAULT NULL,
  `unit` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_event_link`
--

DROP TABLE IF EXISTS `ix_core_event_link`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_event_link` (
  `ix_core_event_id` bigint(20) NOT NULL,
  `ix_core_xref_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_event_id`,`ix_core_xref_id`),
  KEY `c_80f406a0` (`ix_core_xref_id`),
  CONSTRAINT `c_80f406a0` FOREIGN KEY (`ix_core_xref_id`) REFERENCES `ix_core_xref` (`id`),
  CONSTRAINT `c_98366c6b` FOREIGN KEY (`ix_core_event_id`) REFERENCES `ix_core_event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_event_prop`
--

DROP TABLE IF EXISTS `ix_core_event_prop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_event_prop` (
  `ix_core_event_id` bigint(20) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_event_id`,`ix_core_value_id`),
  KEY `c_2d292e00` (`ix_core_value_id`),
  CONSTRAINT `c_2d292e00` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `c_32e7a523` FOREIGN KEY (`ix_core_event_id`) REFERENCES `ix_core_event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_figure`
--

DROP TABLE IF EXISTS `ix_core_figure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_figure` (
  `dtype` varchar(10) NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `caption` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `url` varchar(1024) DEFAULT NULL,
  `data` longblob DEFAULT NULL,
  `data_size` int(11) DEFAULT NULL,
  `sha1` varchar(140) DEFAULT NULL,
  `parent_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `i_bcc29d98` (`parent_id`),
  CONSTRAINT `c_933ce9dc` FOREIGN KEY (`parent_id`) REFERENCES `ix_core_figure` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_filedata`
--

DROP TABLE IF EXISTS `ix_core_filedata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_filedata` (
  `dtype` varchar(10) NOT NULL,
  `id` varchar(40) NOT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `data` longblob DEFAULT NULL,
  `data_size` bigint(20) DEFAULT NULL,
  `sha1` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_group`
--

DROP TABLE IF EXISTS `ix_core_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_group` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `c_3aa2c124` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_group_principal`
--

DROP TABLE IF EXISTS `ix_core_group_principal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_group_principal` (
  `ix_core_group_id` bigint(20) NOT NULL,
  `ix_core_principal_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_group_id`,`ix_core_principal_id`),
  KEY `c_045e1ef9` (`ix_core_principal_id`),
  CONSTRAINT `c_045e1ef9` FOREIGN KEY (`ix_core_principal_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_2223dcea` FOREIGN KEY (`ix_core_group_id`) REFERENCES `ix_core_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_group_seq`
--

DROP TABLE IF EXISTS `ix_core_group_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_group_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_investigator`
--

DROP TABLE IF EXISTS `ix_core_investigator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_investigator` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `pi_id` bigint(20) DEFAULT NULL,
  `organization_id` bigint(20) DEFAULT NULL,
  `role` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `i_1bcd7f25` (`organization_id`),
  CONSTRAINT `c_71245644` FOREIGN KEY (`organization_id`) REFERENCES `ix_core_organization` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_journal`
--

DROP TABLE IF EXISTS `ix_core_journal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_journal` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `issn` varchar(10) DEFAULT NULL,
  `volume` varchar(255) DEFAULT NULL,
  `issue` varchar(255) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `month` varchar(10) DEFAULT NULL,
  `title` varchar(1024) DEFAULT NULL,
  `iso_abbr` varchar(255) DEFAULT NULL,
  `factor` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_key_user_list`
--

DROP TABLE IF EXISTS `ix_core_key_user_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_key_user_list` (
  `id` bigint(20) NOT NULL,
  `entity_key` varchar(255) DEFAULT NULL,
  `list_name` varchar(255) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ukbomijjxdp2cmjttgrnqtoucvo` (`entity_key`,`list_name`,`user_id`),
  KEY `fk7q0vtv7ajevho6v75n57jy0dj` (`user_id`),
  CONSTRAINT `fk7q0vtv7ajevho6v75n57jy0dj` FOREIGN KEY (`user_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_namespace`
--

DROP TABLE IF EXISTS `ix_core_namespace`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_namespace` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  `location` varchar(1024) DEFAULT NULL,
  `modifier` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `c_2b9ef5c1` (`name`),
  KEY `i_b77ca179` (`owner_id`),
  CONSTRAINT `c_d7342e64` FOREIGN KEY (`owner_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_namespace_seq`
--

DROP TABLE IF EXISTS `ix_core_namespace_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_namespace_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_organization`
--

DROP TABLE IF EXISTS `ix_core_organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_organization` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `duns` varchar(10) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(128) DEFAULT NULL,
  `zipcode` varchar(64) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `fips` varchar(3) DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_payload`
--

DROP TABLE IF EXISTS `ix_core_payload`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_payload` (
  `id` varchar(40) NOT NULL,
  `namespace_id` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `name` varchar(1024) DEFAULT NULL,
  `sha1` varchar(40) DEFAULT NULL,
  `mime_type` varchar(128) DEFAULT NULL,
  `capacity` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `i_14e619fc` (`namespace_id`),
  CONSTRAINT `c_3f780616` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_payload_property`
--

DROP TABLE IF EXISTS `ix_core_payload_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_payload_property` (
  `ix_core_payload_id` varchar(40) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_payload_id`,`ix_core_value_id`),
  KEY `c_c378137b` (`ix_core_value_id`),
  CONSTRAINT `c_99d3e052` FOREIGN KEY (`ix_core_payload_id`) REFERENCES `ix_core_payload` (`id`),
  CONSTRAINT `c_c378137b` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_predicate`
--

DROP TABLE IF EXISTS `ix_core_predicate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_predicate` (
  `dtype` varchar(10) NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `namespace_id` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `subject_id` bigint(20) DEFAULT NULL,
  `predicate` varchar(255) NOT NULL,
  `version` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `i_ea60b9c5` (`namespace_id`),
  KEY `i_f051e6a6` (`subject_id`),
  CONSTRAINT `c_8380c650` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`),
  CONSTRAINT `c_c61aacd9` FOREIGN KEY (`subject_id`) REFERENCES `ix_core_xref` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_predicate_object`
--

DROP TABLE IF EXISTS `ix_core_predicate_object`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_predicate_object` (
  `ix_core_predicate_id` bigint(20) NOT NULL,
  `ix_core_xref_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_predicate_id`,`ix_core_xref_id`),
  KEY `c_9e293820` (`ix_core_xref_id`),
  CONSTRAINT `c_8e0804d7` FOREIGN KEY (`ix_core_predicate_id`) REFERENCES `ix_core_predicate` (`id`),
  CONSTRAINT `c_9e293820` FOREIGN KEY (`ix_core_xref_id`) REFERENCES `ix_core_xref` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_predicate_property`
--

DROP TABLE IF EXISTS `ix_core_predicate_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_predicate_property` (
  `ix_core_predicate_id` bigint(20) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_predicate_id`,`ix_core_value_id`),
  KEY `c_62edfd42` (`ix_core_value_id`),
  CONSTRAINT `c_62edfd42` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `c_6b1b65df` FOREIGN KEY (`ix_core_predicate_id`) REFERENCES `ix_core_predicate` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_principal`
--

DROP TABLE IF EXISTS `ix_core_principal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_principal` (
  `dtype` varchar(10) NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `namespace_id` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `provider` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `uri` varchar(1024) DEFAULT NULL,
  `selfie_id` bigint(20) DEFAULT NULL,
  `version` bigint(20) NOT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `forename` varchar(255) DEFAULT NULL,
  `initials` varchar(255) DEFAULT NULL,
  `prefname` varchar(255) DEFAULT NULL,
  `suffix` varchar(20) DEFAULT NULL,
  `affiliation` longtext DEFAULT NULL,
  `orcid` varchar(255) DEFAULT NULL,
  `institution_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `c_117ea9e1` (`username`),
  KEY `i_d3ad08f2` (`namespace_id`),
  KEY `i_087afcf1` (`selfie_id`),
  KEY `i_c164584e` (`institution_id`),
  CONSTRAINT `c_16a08d9e` FOREIGN KEY (`institution_id`) REFERENCES `ix_core_organization` (`id`),
  CONSTRAINT `c_8fbeac5e` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`),
  CONSTRAINT `c_a2c06c5d` FOREIGN KEY (`selfie_id`) REFERENCES `ix_core_figure` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10037 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_principal_seq`
--

DROP TABLE IF EXISTS `ix_core_principal_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_principal_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_procjob`
--

DROP TABLE IF EXISTS `ix_core_procjob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_procjob` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `status` int(11) DEFAULT NULL,
  `job_start` bigint(20) DEFAULT NULL,
  `job_stop` bigint(20) DEFAULT NULL,
  `message` longtext DEFAULT NULL,
  `statistics` longtext DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  `payload_id` varchar(40) DEFAULT NULL,
  `last_update` datetime DEFAULT NULL,
  `version` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `i_cdaeb7ec` (`owner_id`),
  KEY `i_015ac682` (`payload_id`),
  CONSTRAINT `c_f3fe89eb` FOREIGN KEY (`owner_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_fe6f1c1b` FOREIGN KEY (`payload_id`) REFERENCES `ix_core_payload` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_procjob_key`
--

DROP TABLE IF EXISTS `ix_core_procjob_key`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_procjob_key` (
  `ix_core_procjob_id` bigint(20) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  `keys_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_procjob_id`,`ix_core_value_id`),
  KEY `c_437a9cfc` (`ix_core_value_id`),
  CONSTRAINT `c_437a9cfc` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `c_67a7c278` FOREIGN KEY (`ix_core_procjob_id`) REFERENCES `ix_core_procjob` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_procjob_seq`
--

DROP TABLE IF EXISTS `ix_core_procjob_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_procjob_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_procrec`
--

DROP TABLE IF EXISTS `ix_core_procrec`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_procrec` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rec_start` bigint(20) DEFAULT NULL,
  `rec_stop` bigint(20) DEFAULT NULL,
  `name` varchar(128) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `message` longtext DEFAULT NULL,
  `xref_id` bigint(20) DEFAULT NULL,
  `job_id` bigint(20) DEFAULT NULL,
  `last_update` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `i_208a1bba` (`xref_id`),
  KEY `i_caa0d4b8` (`job_id`),
  CONSTRAINT `c_75776597` FOREIGN KEY (`job_id`) REFERENCES `ix_core_procjob` (`id`),
  CONSTRAINT `c_a187d219` FOREIGN KEY (`xref_id`) REFERENCES `ix_core_xref` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6411033 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_procrec_prop`
--

DROP TABLE IF EXISTS `ix_core_procrec_prop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_procrec_prop` (
  `ix_core_procrec_id` bigint(20) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  `properties_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_procrec_id`,`ix_core_value_id`),
  KEY `c_13ac23dd` (`ix_core_value_id`),
  KEY `fkjg8tmtxlf4d2vnb90e6i7exg0` (`properties_id`),
  CONSTRAINT `c_13ac23dd` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `c_633c0170` FOREIGN KEY (`ix_core_procrec_id`) REFERENCES `ix_core_procrec` (`id`),
  CONSTRAINT `fkjg8tmtxlf4d2vnb90e6i7exg0` FOREIGN KEY (`properties_id`) REFERENCES `ix_core_value` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_procrec_seq`
--

DROP TABLE IF EXISTS `ix_core_procrec_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_procrec_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_pubauthor`
--

DROP TABLE IF EXISTS `ix_core_pubauthor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_pubauthor` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `position` int(11) DEFAULT NULL,
  `is_last` tinyint(1) DEFAULT 0,
  `correspondence` tinyint(1) DEFAULT 0,
  `author_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `i_962a3366` (`author_id`),
  CONSTRAINT `c_6fb86703` FOREIGN KEY (`author_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_publication`
--

DROP TABLE IF EXISTS `ix_core_publication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_publication` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pmid` bigint(20) DEFAULT NULL,
  `pmcid` varchar(255) DEFAULT NULL,
  `title` longtext DEFAULT NULL,
  `pages` varchar(255) DEFAULT NULL,
  `doi` varchar(255) DEFAULT NULL,
  `abstract_text` longtext DEFAULT NULL,
  `journal_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `c_d2188a90` (`pmid`),
  UNIQUE KEY `c_388c2569` (`pmcid`),
  KEY `i_773c6776` (`journal_id`),
  CONSTRAINT `c_35349138` FOREIGN KEY (`journal_id`) REFERENCES `ix_core_journal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_publication_author`
--

DROP TABLE IF EXISTS `ix_core_publication_author`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_publication_author` (
  `ix_core_publication_id` bigint(20) NOT NULL,
  `ix_core_pubauthor_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_publication_id`,`ix_core_pubauthor_id`),
  KEY `c_9f462072` (`ix_core_pubauthor_id`),
  CONSTRAINT `c_6954fa07` FOREIGN KEY (`ix_core_publication_id`) REFERENCES `ix_core_publication` (`id`),
  CONSTRAINT `c_9f462072` FOREIGN KEY (`ix_core_pubauthor_id`) REFERENCES `ix_core_pubauthor` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_publication_figure`
--

DROP TABLE IF EXISTS `ix_core_publication_figure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_publication_figure` (
  `ix_core_publication_id` bigint(20) NOT NULL,
  `ix_core_figure_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_publication_id`,`ix_core_figure_id`),
  KEY `c_229b7533` (`ix_core_figure_id`),
  CONSTRAINT `c_01454ae4` FOREIGN KEY (`ix_core_publication_id`) REFERENCES `ix_core_publication` (`id`),
  CONSTRAINT `c_229b7533` FOREIGN KEY (`ix_core_figure_id`) REFERENCES `ix_core_figure` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_publication_keyword`
--

DROP TABLE IF EXISTS `ix_core_publication_keyword`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_publication_keyword` (
  `ix_core_publication_id` bigint(20) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_publication_id`,`ix_core_value_id`),
  KEY `c_aebecf49` (`ix_core_value_id`),
  CONSTRAINT `c_aebecf49` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `c_c0cadd3d` FOREIGN KEY (`ix_core_publication_id`) REFERENCES `ix_core_publication` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_publication_mesh`
--

DROP TABLE IF EXISTS `ix_core_publication_mesh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_publication_mesh` (
  `ix_core_publication_id` bigint(20) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_publication_id`,`ix_core_value_id`),
  KEY `c_00f5160e` (`ix_core_value_id`),
  CONSTRAINT `c_00f5160e` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `c_5c0daa3c` FOREIGN KEY (`ix_core_publication_id`) REFERENCES `ix_core_publication` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_session`
--

DROP TABLE IF EXISTS `ix_core_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_session` (
  `id` varchar(40) NOT NULL,
  `profile_id` bigint(20) DEFAULT NULL,
  `created` bigint(20) DEFAULT NULL,
  `accessed` bigint(20) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `expired` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `i_3e903ae6` (`profile_id`),
  CONSTRAINT `c_1a9538dc` FOREIGN KEY (`profile_id`) REFERENCES `ix_core_userprof` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_stitch`
--

DROP TABLE IF EXISTS `ix_core_stitch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_stitch` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `impl` varchar(1024) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_stitch_attribute`
--

DROP TABLE IF EXISTS `ix_core_stitch_attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_stitch_attribute` (
  `ix_core_stitch_id` bigint(20) NOT NULL,
  `ix_core_attribute_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_stitch_id`,`ix_core_attribute_id`),
  KEY `c_01938a37` (`ix_core_attribute_id`),
  CONSTRAINT `c_01938a37` FOREIGN KEY (`ix_core_attribute_id`) REFERENCES `ix_core_attribute` (`id`),
  CONSTRAINT `c_c9d83c50` FOREIGN KEY (`ix_core_stitch_id`) REFERENCES `ix_core_stitch` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_structure`
--

DROP TABLE IF EXISTS `ix_core_structure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_structure` (
  `dtype` varchar(10) NOT NULL,
  `id` varchar(40) NOT NULL,
  `created` datetime DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `digest` varchar(128) DEFAULT NULL,
  `molfile` longtext DEFAULT NULL,
  `smiles` longtext DEFAULT NULL,
  `formula` varchar(255) DEFAULT NULL,
  `stereo` varchar(255) DEFAULT NULL,
  `optical` int(11) DEFAULT NULL,
  `atropi` int(11) DEFAULT NULL,
  `stereo_comments` longtext DEFAULT NULL,
  `stereo_centers` int(11) DEFAULT NULL,
  `defined_stereo` int(11) DEFAULT NULL,
  `ez_centers` int(11) DEFAULT NULL,
  `charge` int(11) DEFAULT NULL,
  `mwt` double DEFAULT NULL,
  `count` int(11) DEFAULT NULL,
  `version` bigint(20) NOT NULL,
  `internal_references` longtext DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `record_access` varbinary(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `i_97f0d7b1` (`created_by_id`),
  KEY `i_86d0302b` (`last_edited_by_id`),
  CONSTRAINT `c_d4a49424` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_f0993eb0` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_structure_link`
--

DROP TABLE IF EXISTS `ix_core_structure_link`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_structure_link` (
  `ix_core_structure_id` varchar(40) NOT NULL,
  `ix_core_xref_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_structure_id`,`ix_core_xref_id`),
  KEY `c_40d92d08` (`ix_core_xref_id`),
  CONSTRAINT `c_40d92d08` FOREIGN KEY (`ix_core_xref_id`) REFERENCES `ix_core_xref` (`id`),
  CONSTRAINT `c_55f5450b` FOREIGN KEY (`ix_core_structure_id`) REFERENCES `ix_core_structure` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_structure_property`
--

DROP TABLE IF EXISTS `ix_core_structure_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_structure_property` (
  `ix_core_structure_id` varchar(40) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_structure_id`,`ix_core_value_id`),
  KEY `c_72b2a857` (`ix_core_value_id`),
  KEY `property_structure_id_index` (`ix_core_structure_id`),
  KEY `property_value_id_index` (`ix_core_value_id`),
  CONSTRAINT `c_634d3d46` FOREIGN KEY (`ix_core_structure_id`) REFERENCES `ix_core_structure` (`id`),
  CONSTRAINT `c_72b2a857` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_timeline`
--

DROP TABLE IF EXISTS `ix_core_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_timeline` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_timeline_event`
--

DROP TABLE IF EXISTS `ix_core_timeline_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_timeline_event` (
  `ix_core_timeline_id` bigint(20) NOT NULL,
  `ix_core_event_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_timeline_id`,`ix_core_event_id`),
  KEY `c_f4784b80` (`ix_core_event_id`),
  CONSTRAINT `c_2c85a4b0` FOREIGN KEY (`ix_core_timeline_id`) REFERENCES `ix_core_timeline` (`id`),
  CONSTRAINT `c_f4784b80` FOREIGN KEY (`ix_core_event_id`) REFERENCES `ix_core_event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_user_saved_list`
--

DROP TABLE IF EXISTS `ix_core_user_saved_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_user_saved_list` (
  `id` bigint(20) NOT NULL,
  `list` longtext DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uknftwibs7mebodwpavq6ub0lqh` (`name`,`user_id`),
  KEY `fkhd1bc5m9wxca27lxoexqjfwei` (`user_id`),
  CONSTRAINT `fkhd1bc5m9wxca27lxoexqjfwei` FOREIGN KEY (`user_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_userprof`
--

DROP TABLE IF EXISTS `ix_core_userprof`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_userprof` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `namespace_id` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `user_id` bigint(20) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 0,
  `hashp` varchar(255) DEFAULT NULL,
  `salt` varchar(255) DEFAULT NULL,
  `system_auth` tinyint(1) DEFAULT 0,
  `roles_json` longtext DEFAULT NULL,
  `apikey` varchar(255) DEFAULT NULL,
  `version` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `i_278ce9be` (`namespace_id`),
  KEY `i_b7398fef` (`user_id`),
  CONSTRAINT `c_3fac3cac` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`),
  CONSTRAINT `c_91de8ced` FOREIGN KEY (`user_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10014 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
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
/*!50003 CREATE*/ /*!50003 TRIGGER ix_core_userprof_update_roles BEFORE UPDATE ON ix_core_userprof
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
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_userprof_prop` (
  `ix_core_userprof_id` bigint(20) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_userprof_id`,`ix_core_value_id`),
  KEY `c_cc1c20b1` (`ix_core_value_id`),
  CONSTRAINT `c_74285f69` FOREIGN KEY (`ix_core_userprof_id`) REFERENCES `ix_core_userprof` (`id`),
  CONSTRAINT `c_cc1c20b1` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_userprof_seq`
--

DROP TABLE IF EXISTS `ix_core_userprof_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_userprof_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_value`
--

DROP TABLE IF EXISTS `ix_core_value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_value` (
  `dtype` varchar(10) NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `label` varchar(255) DEFAULT NULL,
  `term` varchar(255) DEFAULT NULL,
  `href` longtext DEFAULT NULL,
  `major_topic` tinyint(1) DEFAULT 0,
  `heading` varchar(1024) DEFAULT NULL,
  `text` longtext DEFAULT NULL,
  `data` longblob DEFAULT NULL,
  `data_size` int(11) DEFAULT NULL,
  `sha1` varchar(40) DEFAULT NULL,
  `mime_type` varchar(32) DEFAULT NULL,
  `intval` bigint(20) DEFAULT NULL,
  `numval` double DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `lval` double DEFAULT NULL,
  `rval` double DEFAULT NULL,
  `average` double DEFAULT NULL,
  `strval` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `value_label_index` (`label`),
  KEY `value_term_index` (`term`)
) ENGINE=InnoDB AUTO_INCREMENT=54371927 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_value_seq`
--

DROP TABLE IF EXISTS `ix_core_value_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_value_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_xref`
--

DROP TABLE IF EXISTS `ix_core_xref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_xref` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `namespace_id` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `refid` varchar(40) NOT NULL,
  `kind` varchar(255) NOT NULL,
  `version` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `i_8bbd04dc` (`namespace_id`),
  KEY `xref_refid_index` (`refid`),
  KEY `xref_kind_index` (`kind`),
  CONSTRAINT `c_76da580e` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5153780 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_xref_property`
--

DROP TABLE IF EXISTS `ix_core_xref_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_xref_property` (
  `ix_core_xref_id` bigint(20) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_core_xref_id`,`ix_core_value_id`),
  KEY `c_07052a0b` (`ix_core_value_id`),
  CONSTRAINT `c_07052a0b` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `c_c56225d5` FOREIGN KEY (`ix_core_xref_id`) REFERENCES `ix_core_xref` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_core_xref_seq`
--

DROP TABLE IF EXISTS `ix_core_xref_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_core_xref_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_agentmod`
--

DROP TABLE IF EXISTS `ix_ginas_agentmod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_agentmod` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `agent_modification_process` varchar(255) DEFAULT NULL,
  `agent_modification_role` varchar(255) DEFAULT NULL,
  `agent_modification_type` varchar(255) DEFAULT NULL,
  `agent_substance_uuid` varchar(40) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  `modification_group` varchar(255) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_e8fec8b0` (`created_by_id`),
  KEY `i_797c3291` (`last_edited_by_id`),
  KEY `i_90654d9b` (`owner_uuid`),
  KEY `i_916a29a3` (`agent_substance_uuid`),
  KEY `i_8048764d` (`amount_uuid`),
  CONSTRAINT `c_09a65704` FOREIGN KEY (`agent_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `c_60a9acb3` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_modifications` (`uuid`),
  CONSTRAINT `c_d284f5d7` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_d5922695` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `c_fbcb8c5e` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_amount`
--

DROP TABLE IF EXISTS `ix_ginas_amount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_amount` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `average` double DEFAULT NULL,
  `high_limit` double DEFAULT NULL,
  `high` double DEFAULT NULL,
  `low_limit` double DEFAULT NULL,
  `low` double DEFAULT NULL,
  `units` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_numeric_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approval_id` varchar(10) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_9044f8e6` (`created_by_id`),
  KEY `i_1396ad0a` (`last_edited_by_id`),
  CONSTRAINT `c_172b3d49` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_48c42eee` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_code`
--

DROP TABLE IF EXISTS `ix_ginas_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_code` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `code_system` varchar(255) DEFAULT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `comments` longtext DEFAULT NULL,
  `code_text` longtext DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `url` longtext DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_edc5bb41` (`created_by_id`),
  KEY `i_aa0faf44` (`last_edited_by_id`),
  KEY `i_1e97fd27` (`owner_uuid`),
  KEY `code_index` (`code`),
  KEY `code_system_index` (`code_system`),
  KEY `code_code_system_index` (`code`,`code_system`),
  KEY `ix_ix_ginas_code_code` (`code`),
  KEY `ix_ix_ginas_code_code_system` (`code_system`),
  KEY `ix_ix_ginas_code_type` (`type`),
  KEY `ix_ix_ginas_code_owner` (`owner_uuid`),
  CONSTRAINT `c_1d85e0b8` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_31873b2b` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `c_7c279009` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_component`
--

DROP TABLE IF EXISTS `ix_ginas_component`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_component` (
  `dtype` varchar(10) NOT NULL,
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `substance_uuid` varchar(40) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_1204b09e` (`created_by_id`),
  KEY `i_992c5a03` (`last_edited_by_id`),
  KEY `i_c5a4340b` (`substance_uuid`),
  KEY `i_ec7c7e9a` (`amount_uuid`),
  CONSTRAINT `c_175162da` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_358de474` FOREIGN KEY (`substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `c_966c1285` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `c_c2cfb61d` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_controlled_vocab`
--

DROP TABLE IF EXISTS `ix_ginas_controlled_vocab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_controlled_vocab` (
  `dtype` varchar(10) NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `namespace_id` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `domain` varchar(255) DEFAULT NULL,
  `vocabulary_term_type` varchar(255) DEFAULT NULL,
  `editable` tinyint(1) DEFAULT 0,
  `filterable` tinyint(1) DEFAULT 0,
  `version` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `c_5afb2826` (`domain`),
  KEY `i_f95f237a` (`namespace_id`),
  CONSTRAINT `c_b23afb26` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4397 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_controlled_vocab_core_value`
--

DROP TABLE IF EXISTS `ix_ginas_controlled_vocab_core_value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_controlled_vocab_core_value` (
  `ix_ginas_controlled_vocab_id` bigint(20) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_ginas_controlled_vocab_id`,`ix_core_value_id`),
  KEY `c_ac65921f` (`ix_core_value_id`),
  CONSTRAINT `c_ac65921f` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `c_d583143a` FOREIGN KEY (`ix_ginas_controlled_vocab_id`) REFERENCES `ix_ginas_controlled_vocab` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_controlled_vocab_seq`
--

DROP TABLE IF EXISTS `ix_ginas_controlled_vocab_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_controlled_vocab_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_definition`
--

DROP TABLE IF EXISTS `ix_ginas_definition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_glycosylation` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `c_glycosylation_sites_uuid` varchar(40) DEFAULT NULL,
  `n_glycosylation_sites_uuid` varchar(40) DEFAULT NULL,
  `o_glycosylation_sites_uuid` varchar(40) DEFAULT NULL,
  `glycosylation_type` varchar(255) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_f243b84a` (`created_by_id`),
  KEY `i_e6735e70` (`last_edited_by_id`),
  KEY `i_a41ea995` (`c_glycosylation_sites_uuid`),
  KEY `i_e167ac5a` (`n_glycosylation_sites_uuid`),
  KEY `i_6caedade` (`o_glycosylation_sites_uuid`),
  CONSTRAINT `c_22d42e85` FOREIGN KEY (`c_glycosylation_sites_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `c_8ddb40b1` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_b1b38f93` FOREIGN KEY (`n_glycosylation_sites_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `c_b501c304` FOREIGN KEY (`o_glycosylation_sites_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `c_d9f835a6` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_linkage`
--

DROP TABLE IF EXISTS `ix_ginas_linkage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_linkage` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `linkage` varchar(255) DEFAULT NULL,
  `site_container_uuid` varchar(40) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_69e7b2a7` (`created_by_id`),
  KEY `i_5c50e6ba` (`last_edited_by_id`),
  KEY `i_31291300` (`owner_uuid`),
  KEY `i_3eff1028` (`site_container_uuid`),
  CONSTRAINT `c_a8c5dc9e` FOREIGN KEY (`site_container_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `c_ae6b03c1` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_ca67400b` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_de82d9a4` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_nucleicacid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_material`
--

DROP TABLE IF EXISTS `ix_ginas_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_material` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  `monomer_substance_uuid` varchar(40) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `defining` tinyint(1) DEFAULT 0,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_57660fad` (`created_by_id`),
  KEY `i_6b6bb6e1` (`last_edited_by_id`),
  KEY `i_6dc373fb` (`owner_uuid`),
  KEY `i_2cb0b2dd` (`amount_uuid`),
  KEY `i_7c19cf3c` (`monomer_substance_uuid`),
  CONSTRAINT `c_228619ce` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_8be1479b` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_polymer` (`uuid`),
  CONSTRAINT `c_e02e47e1` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_e72e3a1f` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `c_eede4a4e` FOREIGN KEY (`monomer_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_mixture`
--

DROP TABLE IF EXISTS `ix_ginas_mixture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_mixture` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `parent_substance_uuid` varchar(40) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_873527b2` (`created_by_id`),
  KEY `i_046c8793` (`last_edited_by_id`),
  KEY `i_8589cf27` (`parent_substance_uuid`),
  CONSTRAINT `c_4b599f1d` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_c531797e` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_e140e14f` FOREIGN KEY (`parent_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_modifications`
--

DROP TABLE IF EXISTS `ix_ginas_modifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_modifications` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_cd4ce51a` (`created_by_id`),
  KEY `i_9f57a27d` (`last_edited_by_id`),
  CONSTRAINT `c_d0121858` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_db44363c` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_moiety`
--

DROP TABLE IF EXISTS `ix_ginas_moiety`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_moiety` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `structure_id` varchar(40) DEFAULT NULL,
  `count_uuid` varchar(40) DEFAULT NULL,
  `inner_uuid` varchar(255) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `c_ce8c5912` (`inner_uuid`),
  KEY `i_59b3b423` (`created_by_id`),
  KEY `i_521b68cd` (`last_edited_by_id`),
  KEY `i_9b5117f0` (`owner_uuid`),
  KEY `i_9448f241` (`structure_id`),
  KEY `i_c7272b24` (`count_uuid`),
  KEY `moiety_owner_index` (`owner_uuid`),
  CONSTRAINT `c_1e35889c` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `c_4a0fd12e` FOREIGN KEY (`count_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `c_6c4e84d5` FOREIGN KEY (`structure_id`) REFERENCES `ix_core_structure` (`id`),
  CONSTRAINT `c_79e8cf95` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_b45ca216` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_name`
--

DROP TABLE IF EXISTS `ix_ginas_name`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_name` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `full_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `std_name` longtext DEFAULT NULL,
  `type` varchar(32) DEFAULT NULL,
  `domains` longtext DEFAULT NULL,
  `languages` longtext DEFAULT NULL,
  `name_jurisdiction` longtext DEFAULT NULL,
  `preferred` tinyint(1) DEFAULT 0,
  `display_name` tinyint(1) DEFAULT 0,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_d0a3e858` (`created_by_id`),
  KEY `i_e6a2fb51` (`last_edited_by_id`),
  KEY `i_25e68980` (`owner_uuid`),
  KEY `name_index` (`name`),
  KEY `name_owner_index` (`owner_uuid`),
  CONSTRAINT `c_3cdaab27` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_52348b70` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `c_d3d75121` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_nameorg`
--

DROP TABLE IF EXISTS `ix_ginas_nameorg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_nameorg` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `name_org` varchar(255) NOT NULL,
  `deprecated_date` datetime DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_0af6ec35` (`created_by_id`),
  KEY `i_9a2588f9` (`last_edited_by_id`),
  KEY `i_14ebb953` (`owner_uuid`),
  KEY `nameorg_owner_index` (`owner_uuid`),
  CONSTRAINT `c_17af48a9` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_name` (`uuid`),
  CONSTRAINT `c_4d1f3b68` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_7104c31d` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_note`
--

DROP TABLE IF EXISTS `ix_ginas_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_note` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `note` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_9cf176b5` (`created_by_id`),
  KEY `i_53803677` (`last_edited_by_id`),
  KEY `i_236d20c3` (`owner_uuid`),
  KEY `note_owner_index` (`owner_uuid`),
  CONSTRAINT `c_520232f3` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `c_81b64cae` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_e6509aec` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_nucleicacid`
--

DROP TABLE IF EXISTS `ix_ginas_nucleicacid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_nucleicacid` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `modifications_uuid` varchar(40) DEFAULT NULL,
  `nucleic_acid_type` varchar(255) DEFAULT NULL,
  `nucleic_acid_sub_type` varchar(255) DEFAULT NULL,
  `sequence_origin` varchar(255) DEFAULT NULL,
  `sequence_type` varchar(255) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_c8ea3507` (`created_by_id`),
  KEY `i_b8ebab65` (`last_edited_by_id`),
  KEY `i_a1392a03` (`modifications_uuid`),
  CONSTRAINT `c_959b9999` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_bb280648` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_eeb5efc7` FOREIGN KEY (`modifications_uuid`) REFERENCES `ix_ginas_modifications` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_nucleicacid_subunits`
--

DROP TABLE IF EXISTS `ix_ginas_nucleicacid_subunits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_nucleicacid_subunits` (
  `ix_ginas_nucleicacid_uuid` varchar(40) NOT NULL,
  `ix_ginas_subunit_uuid` varchar(40) NOT NULL,
  PRIMARY KEY (`ix_ginas_nucleicacid_uuid`,`ix_ginas_subunit_uuid`),
  KEY `c_2d109af2` (`ix_ginas_subunit_uuid`),
  CONSTRAINT `c_2d109af2` FOREIGN KEY (`ix_ginas_subunit_uuid`) REFERENCES `ix_ginas_subunit` (`uuid`),
  CONSTRAINT `c_5de01eee` FOREIGN KEY (`ix_ginas_nucleicacid_uuid`) REFERENCES `ix_ginas_nucleicacid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_otherlinks`
--

DROP TABLE IF EXISTS `ix_ginas_otherlinks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_otherlinks` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `linkage_type` varchar(255) DEFAULT NULL,
  `site_container_uuid` varchar(40) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_fd4e4062` (`created_by_id`),
  KEY `i_a755aebd` (`last_edited_by_id`),
  KEY `i_a90e8053` (`owner_uuid`),
  KEY `i_995b649a` (`site_container_uuid`),
  CONSTRAINT `c_11058b93` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_protein` (`uuid`),
  CONSTRAINT `c_5e78f982` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_a0829419` FOREIGN KEY (`site_container_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `c_ff3037e8` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_parameter`
--

DROP TABLE IF EXISTS `ix_ginas_parameter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_parameter` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `referenced_substance_uuid` varchar(40) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `value_uuid` varchar(40) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_a0c76346` (`created_by_id`),
  KEY `i_bc65cddb` (`last_edited_by_id`),
  KEY `i_97bca746` (`owner_uuid`),
  KEY `i_75718d16` (`referenced_substance_uuid`),
  KEY `i_b9a77f65` (`value_uuid`),
  CONSTRAINT `c_a24936da` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_bc99c270` FOREIGN KEY (`value_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `c_bd1f6900` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_e991be08` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_property` (`uuid`),
  CONSTRAINT `c_f176d1eb` FOREIGN KEY (`referenced_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_physicalmod`
--

DROP TABLE IF EXISTS `ix_ginas_physicalmod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_physicalmod` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `physical_modification_role` varchar(255) DEFAULT NULL,
  `modification_group` varchar(255) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_0b062bce` (`created_by_id`),
  KEY `i_7c71774f` (`last_edited_by_id`),
  KEY `i_023e1ac8` (`owner_uuid`),
  CONSTRAINT `c_6d989fc6` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_744c488c` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_c141927f` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_modifications` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_physicalpar`
--

DROP TABLE IF EXISTS `ix_ginas_physicalpar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_physicalpar` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `parameter_name` varchar(255) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_212447c4` (`created_by_id`),
  KEY `i_75c04a35` (`last_edited_by_id`),
  KEY `i_082ca133` (`owner_uuid`),
  KEY `i_1eb217f4` (`amount_uuid`),
  CONSTRAINT `c_034e2f7c` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_b595e4ba` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_dc5bce39` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `c_e0845807` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_physicalmod` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_polymer`
--

DROP TABLE IF EXISTS `ix_ginas_polymer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_polymer` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `classification_uuid` varchar(40) DEFAULT NULL,
  `display_structure_id` varchar(40) DEFAULT NULL,
  `idealized_structure_id` varchar(40) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_508683b0` (`created_by_id`),
  KEY `i_8356da61` (`last_edited_by_id`),
  KEY `i_3e38b877` (`classification_uuid`),
  KEY `i_3c66be92` (`display_structure_id`),
  KEY `i_48e4a01f` (`idealized_structure_id`),
  CONSTRAINT `c_2cda8114` FOREIGN KEY (`display_structure_id`) REFERENCES `ix_core_structure` (`id`),
  CONSTRAINT `c_5f9c7f23` FOREIGN KEY (`classification_uuid`) REFERENCES `polymer_classification` (`uuid`),
  CONSTRAINT `c_a83467a2` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_d21ee884` FOREIGN KEY (`idealized_structure_id`) REFERENCES `ix_core_structure` (`id`),
  CONSTRAINT `c_d85112ff` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_property`
--

DROP TABLE IF EXISTS `ix_ginas_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_property` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `property_type` varchar(255) DEFAULT NULL,
  `value_uuid` varchar(40) DEFAULT NULL,
  `referenced_substance_uuid` varchar(40) DEFAULT NULL,
  `defining` tinyint(1) DEFAULT 0,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_6f12c2a9` (`created_by_id`),
  KEY `i_7a9b0f71` (`last_edited_by_id`),
  KEY `i_434f1898` (`owner_uuid`),
  KEY `i_dc5306ee` (`value_uuid`),
  KEY `i_18c70ecb` (`referenced_substance_uuid`),
  KEY `property_owner_index` (`owner_uuid`),
  CONSTRAINT `c_1824202b` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_1f9e699f` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `c_3a23d2a9` FOREIGN KEY (`referenced_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `c_5330547a` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_ef8b2c10` FOREIGN KEY (`value_uuid`) REFERENCES `ix_ginas_amount` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_protein`
--

DROP TABLE IF EXISTS `ix_ginas_protein`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_protein` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `protein_type` varchar(255) DEFAULT NULL,
  `protein_sub_type` varchar(255) DEFAULT NULL,
  `sequence_origin` varchar(255) DEFAULT NULL,
  `sequence_type` varchar(255) DEFAULT NULL,
  `disulf_json` longtext DEFAULT NULL,
  `glycosylation_uuid` varchar(40) DEFAULT NULL,
  `modifications_uuid` varchar(40) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_c07043ef` (`created_by_id`),
  KEY `i_32cafedb` (`last_edited_by_id`),
  KEY `i_75436589` (`glycosylation_uuid`),
  KEY `i_fcca9817` (`modifications_uuid`),
  CONSTRAINT `c_3e88fd93` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_4f44d62a` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_a6fb4ff8` FOREIGN KEY (`modifications_uuid`) REFERENCES `ix_ginas_modifications` (`uuid`),
  CONSTRAINT `c_bcc47a8d` FOREIGN KEY (`glycosylation_uuid`) REFERENCES `ix_ginas_glycosylation` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_protein_subunit`
--

DROP TABLE IF EXISTS `ix_ginas_protein_subunit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_protein_subunit` (
  `ix_ginas_protein_uuid` varchar(40) NOT NULL,
  `ix_ginas_subunit_uuid` varchar(40) NOT NULL,
  PRIMARY KEY (`ix_ginas_protein_uuid`,`ix_ginas_subunit_uuid`),
  KEY `c_0f1fc6ff` (`ix_ginas_subunit_uuid`),
  CONSTRAINT `c_0f1fc6ff` FOREIGN KEY (`ix_ginas_subunit_uuid`) REFERENCES `ix_ginas_subunit` (`uuid`),
  CONSTRAINT `c_819d6150` FOREIGN KEY (`ix_ginas_protein_uuid`) REFERENCES `ix_ginas_protein` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_reference`
--

DROP TABLE IF EXISTS `ix_ginas_reference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_reference` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `citation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `doc_type` varchar(255) DEFAULT NULL,
  `document_date` datetime DEFAULT NULL,
  `public_domain` tinyint(1) DEFAULT 0,
  `tags` longtext DEFAULT NULL,
  `uploaded_file` varchar(1024) DEFAULT NULL,
  `id` varchar(255) DEFAULT NULL,
  `url` longtext DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_2ba5b3d5` (`created_by_id`),
  KEY `i_80ef682b` (`last_edited_by_id`),
  KEY `i_3ccbbc1c` (`owner_uuid`),
  KEY `ref_id_index` (`id`),
  KEY `ref_owner_index` (`owner_uuid`),
  CONSTRAINT `c_071569ce` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `c_cbd3863e` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_df17ffc0` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_relationship`
--

DROP TABLE IF EXISTS `ix_ginas_relationship`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_relationship` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  `comments` longtext DEFAULT NULL,
  `interaction_type` varchar(255) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `related_substance_uuid` varchar(40) DEFAULT NULL,
  `mediator_substance_uuid` varchar(40) DEFAULT NULL,
  `originator_uuid` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_1e1d5825` (`created_by_id`),
  KEY `i_61241701` (`last_edited_by_id`),
  KEY `i_47b6e4f0` (`owner_uuid`),
  KEY `i_b5235fc5` (`amount_uuid`),
  KEY `i_39d89a99` (`related_substance_uuid`),
  KEY `i_4195462c` (`mediator_substance_uuid`),
  KEY `interaction_index` (`interaction_type`),
  KEY `qualification_index` (`qualification`),
  KEY `type_index` (`type`),
  KEY `relate_originate_index` (`originator_uuid`),
  KEY `rel_owner_index` (`owner_uuid`),
  CONSTRAINT `c_337c9ac9` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_62502be5` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_936c0c00` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `c_a3fdf047` FOREIGN KEY (`related_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `c_d433b684` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `c_e4bb9034` FOREIGN KEY (`mediator_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_site_lob`
--

DROP TABLE IF EXISTS `ix_ginas_site_lob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_site_lob` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `sites_short_hand` longtext DEFAULT NULL,
  `sites_json` longtext DEFAULT NULL,
  `site_count` bigint(20) DEFAULT NULL,
  `site_type` varchar(255) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_3215d1f7` (`created_by_id`),
  KEY `i_2d4558ef` (`last_edited_by_id`),
  CONSTRAINT `c_0fd266c8` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_70f007e0` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_ssg1`
--

DROP TABLE IF EXISTS `ix_ginas_ssg1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_ssg1` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_c7f61a0d` (`created_by_id`),
  KEY `i_043f1e31` (`last_edited_by_id`),
  CONSTRAINT `c_13cf7618` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_1763863d` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_strucdiv`
--

DROP TABLE IF EXISTS `ix_ginas_strucdiv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_strucdiv` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `source_material_class` varchar(255) DEFAULT NULL,
  `source_material_type` varchar(255) DEFAULT NULL,
  `source_material_state` varchar(255) DEFAULT NULL,
  `organism_family` varchar(255) DEFAULT NULL,
  `organism_genus` varchar(255) DEFAULT NULL,
  `organism_species` varchar(255) DEFAULT NULL,
  `organism_author` varchar(255) DEFAULT NULL,
  `part_location` varchar(255) DEFAULT NULL,
  `part` longtext DEFAULT NULL,
  `infra_specific_type` varchar(255) DEFAULT NULL,
  `infra_specific_name` varchar(255) DEFAULT NULL,
  `developmental_stage` varchar(255) DEFAULT NULL,
  `fraction_name` varchar(255) DEFAULT NULL,
  `fraction_material_type` varchar(255) DEFAULT NULL,
  `paternal_uuid` varchar(40) DEFAULT NULL,
  `maternal_uuid` varchar(40) DEFAULT NULL,
  `parent_substance_uuid` varchar(40) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_2d8cf3af` (`created_by_id`),
  KEY `i_9f0fd61b` (`last_edited_by_id`),
  KEY `i_b8220566` (`paternal_uuid`),
  KEY `i_ce3e8a36` (`maternal_uuid`),
  KEY `i_feb57d17` (`parent_substance_uuid`),
  CONSTRAINT `c_59e96282` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_7bf1c14b` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_d4abc04c` FOREIGN KEY (`parent_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `c_efc8abcb` FOREIGN KEY (`maternal_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`),
  CONSTRAINT `c_f9c74f43` FOREIGN KEY (`paternal_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_structuralmod`
--

DROP TABLE IF EXISTS `ix_ginas_structuralmod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_structuralmod` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `structural_modification_type` varchar(255) DEFAULT NULL,
  `location_type` varchar(255) DEFAULT NULL,
  `residue_modified` varchar(255) DEFAULT NULL,
  `site_container_uuid` varchar(40) DEFAULT NULL,
  `extent` varchar(255) DEFAULT NULL,
  `extent_amount_uuid` varchar(40) DEFAULT NULL,
  `molecular_fragment_uuid` varchar(40) DEFAULT NULL,
  `moleculare_fragment_role` varchar(255) DEFAULT NULL,
  `modification_group` varchar(255) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_7d778ca2` (`created_by_id`),
  KEY `i_f48ed7eb` (`last_edited_by_id`),
  KEY `i_cb2f3eab` (`owner_uuid`),
  KEY `i_54af7999` (`site_container_uuid`),
  KEY `i_91129afe` (`extent_amount_uuid`),
  KEY `i_488d4d1a` (`molecular_fragment_uuid`),
  CONSTRAINT `c_2144c64c` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_633ba313` FOREIGN KEY (`site_container_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `c_d6fed8e4` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_modifications` (`uuid`),
  CONSTRAINT `c_d9a4a985` FOREIGN KEY (`extent_amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `c_f6bac92e` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_fbb8858e` FOREIGN KEY (`molecular_fragment_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_substance`
--

DROP TABLE IF EXISTS `ix_ginas_substance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_substance` (
  `dtype` varchar(10) NOT NULL,
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `definition_type` int(11) DEFAULT NULL,
  `definition_level` int(11) DEFAULT NULL,
  `class` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `approved_by_id` bigint(20) DEFAULT NULL,
  `approved` datetime DEFAULT NULL,
  `change_reason` varchar(255) DEFAULT NULL,
  `modifications_uuid` varchar(40) DEFAULT NULL,
  `approval_id` varchar(10) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  `structure_id` varchar(40) DEFAULT NULL,
  `mixture_uuid` varchar(40) DEFAULT NULL,
  `nucleic_acid_uuid` varchar(40) DEFAULT NULL,
  `polymer_uuid` varchar(40) DEFAULT NULL,
  `protein_uuid` varchar(40) DEFAULT NULL,
  `specified_substance_uuid` varchar(40) DEFAULT NULL,
  `structurally_diverse_uuid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_017dd520` (`created_by_id`),
  KEY `i_fa710fd0` (`last_edited_by_id`),
  KEY `i_501769c0` (`approved_by_id`),
  KEY `i_3062c782` (`modifications_uuid`),
  KEY `i_5f8e95e3` (`structure_id`),
  KEY `i_bd94d543` (`mixture_uuid`),
  KEY `i_57ae22d0` (`nucleic_acid_uuid`),
  KEY `i_ce536a5e` (`polymer_uuid`),
  KEY `i_23563b9c` (`protein_uuid`),
  KEY `i_47e7be29` (`specified_substance_uuid`),
  KEY `i_7b7cc8b8` (`structurally_diverse_uuid`),
  KEY `sub_approval_index` (`approval_id`),
  KEY `sub_dtype_index` (`dtype`),
  CONSTRAINT `c_032cfcd1` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_1ca5b4ff` FOREIGN KEY (`modifications_uuid`) REFERENCES `ix_ginas_modifications` (`uuid`),
  CONSTRAINT `c_254367aa` FOREIGN KEY (`polymer_uuid`) REFERENCES `ix_ginas_polymer` (`uuid`),
  CONSTRAINT `c_2a618519` FOREIGN KEY (`nucleic_acid_uuid`) REFERENCES `ix_ginas_nucleicacid` (`uuid`),
  CONSTRAINT `c_58b246cd` FOREIGN KEY (`approved_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_6a75f028` FOREIGN KEY (`structure_id`) REFERENCES `ix_core_structure` (`id`),
  CONSTRAINT `c_8c408528` FOREIGN KEY (`structurally_diverse_uuid`) REFERENCES `ix_ginas_strucdiv` (`uuid`),
  CONSTRAINT `c_a38cec20` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_abe2e656` FOREIGN KEY (`specified_substance_uuid`) REFERENCES `ix_ginas_ssg1` (`uuid`),
  CONSTRAINT `c_c9363aed` FOREIGN KEY (`protein_uuid`) REFERENCES `ix_ginas_protein` (`uuid`),
  CONSTRAINT `c_e3fbf5c3` FOREIGN KEY (`mixture_uuid`) REFERENCES `ix_ginas_mixture` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_substance_mix_comp`
--

DROP TABLE IF EXISTS `ix_ginas_substance_mix_comp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_substance_mix_comp` (
  `ix_ginas_mixture_uuid` varchar(40) NOT NULL,
  `ix_ginas_component_uuid` varchar(40) NOT NULL,
  PRIMARY KEY (`ix_ginas_mixture_uuid`,`ix_ginas_component_uuid`),
  KEY `c_0b03e134` (`ix_ginas_component_uuid`),
  CONSTRAINT `c_0b03e134` FOREIGN KEY (`ix_ginas_component_uuid`) REFERENCES `ix_ginas_component` (`uuid`),
  CONSTRAINT `c_0cedb7b8` FOREIGN KEY (`ix_ginas_mixture_uuid`) REFERENCES `ix_ginas_mixture` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_substance_ss_comp`
--

DROP TABLE IF EXISTS `ix_ginas_substance_ss_comp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_substance_ss_comp` (
  `ix_ginas_ssg1_uuid` varchar(40) NOT NULL,
  `ix_ginas_component_uuid` varchar(40) NOT NULL,
  PRIMARY KEY (`ix_ginas_ssg1_uuid`,`ix_ginas_component_uuid`),
  KEY `c_fdd7602a` (`ix_ginas_component_uuid`),
  CONSTRAINT `c_a5b1f22a` FOREIGN KEY (`ix_ginas_ssg1_uuid`) REFERENCES `ix_ginas_ssg1` (`uuid`),
  CONSTRAINT `c_fdd7602a` FOREIGN KEY (`ix_ginas_component_uuid`) REFERENCES `ix_ginas_component` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_substance_tags`
--

DROP TABLE IF EXISTS `ix_ginas_substance_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_substance_tags` (
  `ix_ginas_substance_uuid` varchar(40) NOT NULL,
  `ix_core_value_id` bigint(20) NOT NULL,
  PRIMARY KEY (`ix_ginas_substance_uuid`,`ix_core_value_id`),
  KEY `c_995ed877` (`ix_core_value_id`),
  CONSTRAINT `c_52663f1e` FOREIGN KEY (`ix_ginas_substance_uuid`) REFERENCES `ix_ginas_substance` (`uuid`),
  CONSTRAINT `c_995ed877` FOREIGN KEY (`ix_core_value_id`) REFERENCES `ix_core_value` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_substanceref`
--

DROP TABLE IF EXISTS `ix_ginas_substanceref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_substanceref` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `ref_pname` varchar(1024) DEFAULT NULL,
  `refuuid` varchar(128) DEFAULT NULL,
  `substance_class` varchar(255) DEFAULT NULL,
  `approval_id` varchar(32) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_72eceab6` (`created_by_id`),
  KEY `i_e935f847` (`last_edited_by_id`),
  KEY `ref_uuid_index` (`refuuid`),
  KEY `sub_ref_index` (`refuuid`),
  CONSTRAINT `c_9b338593` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_bc0dcaaa` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_subunit`
--

DROP TABLE IF EXISTS `ix_ginas_subunit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_subunit` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `sequence` longtext DEFAULT NULL,
  `subunit_index` int(11) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_848760c5` (`created_by_id`),
  KEY `i_3f6a6aa5` (`last_edited_by_id`),
  CONSTRAINT `c_77fe4be4` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_f5925ba9` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_sugar`
--

DROP TABLE IF EXISTS `ix_ginas_sugar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_sugar` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `sugar` varchar(255) DEFAULT NULL,
  `site_container_uuid` varchar(40) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_a4bffe4a` (`created_by_id`),
  KEY `i_68c29fda` (`last_edited_by_id`),
  KEY `i_9359fa3c` (`owner_uuid`),
  KEY `i_a7509a91` (`site_container_uuid`),
  CONSTRAINT `c_1b8dcc24` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_1bdc9737` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_40a4802c` FOREIGN KEY (`site_container_uuid`) REFERENCES `ix_ginas_site_lob` (`uuid`),
  CONSTRAINT `c_9e3fbfd1` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_nucleicacid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_unit`
--

DROP TABLE IF EXISTS `ix_ginas_unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_unit` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `owner_uuid` varchar(40) DEFAULT NULL,
  `amap_id` bigint(20) DEFAULT NULL,
  `amount_uuid` varchar(40) DEFAULT NULL,
  `attachment_count` int(11) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `structure` longtext DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `attachmentMap` longtext DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_e1fe74d1` (`created_by_id`),
  KEY `i_083bb113` (`last_edited_by_id`),
  KEY `i_e89dda2c` (`owner_uuid`),
  KEY `i_bece0bd4` (`amap_id`),
  KEY `i_3d103a81` (`amount_uuid`),
  CONSTRAINT `c_47464e5a` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_4f784205` FOREIGN KEY (`amount_uuid`) REFERENCES `ix_ginas_amount` (`uuid`),
  CONSTRAINT `c_9bc432b1` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_dc716ff8` FOREIGN KEY (`amap_id`) REFERENCES `ix_core_value` (`id`),
  CONSTRAINT `c_f269116f` FOREIGN KEY (`owner_uuid`) REFERENCES `ix_ginas_polymer` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_vocabulary_term`
--

DROP TABLE IF EXISTS `ix_ginas_vocabulary_term`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_vocabulary_term` (
  `dtype` varchar(10) NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `namespace_id` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `owner_id` bigint(20) DEFAULT NULL,
  `value` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `display` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `filters` longtext DEFAULT NULL,
  `hidden` tinyint(1) DEFAULT 0,
  `selected` tinyint(1) DEFAULT 0,
  `version` bigint(20) NOT NULL,
  `system_category` varchar(255) DEFAULT NULL,
  `regex` varchar(255) DEFAULT NULL,
  `fragment_structure` varchar(255) DEFAULT NULL,
  `simplified_structure` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `i_c9edf351` (`namespace_id`),
  KEY `i_e7c81616` (`owner_id`),
  KEY `vocabulary_term_owner_index` (`owner_id`),
  CONSTRAINT `c_26a25a8c` FOREIGN KEY (`owner_id`) REFERENCES `ix_ginas_controlled_vocab` (`id`),
  CONSTRAINT `c_a94727e8` FOREIGN KEY (`namespace_id`) REFERENCES `ix_core_namespace` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=106722 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_ginas_vocabulary_term_seq`
--

DROP TABLE IF EXISTS `ix_ginas_vocabulary_term_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_ginas_vocabulary_term_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_import_data`
--

DROP TABLE IF EXISTS `ix_import_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_import_mapping` (
  `mapping_id` varchar(40) NOT NULL,
  `data_location` varchar(255) DEFAULT NULL,
  `entity_class` varchar(255) DEFAULT NULL,
  `instance_id` varchar(40) DEFAULT NULL,
  `mapping_key` varchar(255) DEFAULT NULL,
  `qualifier` varchar(255) DEFAULT NULL,
  `record_id` varchar(40) DEFAULT NULL,
  `mapping_value` varchar(512) DEFAULT NULL,
  `instanceId` varchar(40) DEFAULT NULL,
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
/*!50503 SET character_set_client = utf8mb4 */;
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
  PRIMARY KEY (`record_id`),
  UNIQUE KEY `UK_b3wth3q98eiauf3rngwjybxve` (`instance_id`),
  KEY `idx_ix_import_metadata_entity_class_name` (`entity_class_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ix_import_raw`
--

DROP TABLE IF EXISTS `ix_import_raw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ix_import_validation` (
  `validation_id` varchar(40) NOT NULL,
  `validation_date` datetime(6) DEFAULT NULL,
  `validation_json` longtext DEFAULT NULL,
  `validation_message` varchar(2048) DEFAULT NULL,
  `validation_type` int(11) DEFAULT NULL,
  `entity_class_name` varchar(255) DEFAULT NULL,
  `instance_id` varchar(40) DEFAULT NULL,
  `version` int(11) NOT NULL,
  `instanceId` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`validation_id`),
  KEY `idx_ix_import_validation_entity_class_name` (`entity_class_name`),
  KEY `idx_ix_import_validation_version` (`version`),
  KEY `idx_ix_import_validation_instance_id` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `play_evolutions`
--

DROP TABLE IF EXISTS `play_evolutions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `play_evolutions` (
  `id` int(11) NOT NULL,
  `hash` varchar(255) NOT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `apply_script` longtext DEFAULT NULL,
  `revert_script` longtext DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `last_problem` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `polymer_classification`
--

DROP TABLE IF EXISTS `polymer_classification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `polymer_classification` (
  `uuid` varchar(40) NOT NULL,
  `current_version` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `last_edited` datetime DEFAULT NULL,
  `last_edited_by_id` bigint(20) DEFAULT NULL,
  `deprecated` tinyint(1) DEFAULT 0,
  `record_access` varbinary(255) DEFAULT NULL,
  `internal_references` longtext DEFAULT NULL,
  `polymer_class` varchar(255) DEFAULT NULL,
  `polymer_geometry` varchar(255) DEFAULT NULL,
  `polymer_subclass` longtext DEFAULT NULL,
  `source_type` varchar(255) DEFAULT NULL,
  `parent_substance_uuid` varchar(40) DEFAULT NULL,
  `internal_version` bigint(20) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `i_ed48cb35` (`created_by_id`),
  KEY `i_7009c842` (`last_edited_by_id`),
  KEY `i_a11b724a` (`parent_substance_uuid`),
  CONSTRAINT `c_37c0d602` FOREIGN KEY (`last_edited_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_86d29a3e` FOREIGN KEY (`created_by_id`) REFERENCES `ix_core_principal` (`id`),
  CONSTRAINT `c_99019ebe` FOREIGN KEY (`parent_substance_uuid`) REFERENCES `ix_ginas_substanceref` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-24  2:53:09
