DROP TABLE IF EXISTS `greetings`;
CREATE TABLE `greetings` (
  `user` varchar(64) NOT NULL,
  `greeting` varchar(512),
  PRIMARY KEY (`user`)
) DEFAULT CHARSET=utf8;
