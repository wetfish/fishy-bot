DROP TABLE IF EXISTS `quotes`;
CREATE TABLE `quotes` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `quote` varchar(512) NOT NULL,
    `score` int(11) NOT NULL,
    `created_by` varchar(64) NULL DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT NOW(),
    `updated_at` timestamp NOT NULL DEFAULT NOW(),
    `deleted_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `votes`;
CREATE TABLE `votes` (
    `quote_id` int(11) NOT NULL,
    `voter` varchar(64) NOT NULL,
    `vote` int(1) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT NOW(),
    `updated_at` timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`quote_id`, `voter`)
) DEFAULT CHARSET=utf8;

