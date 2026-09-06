CREATE TABLE `adminSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(120) NOT NULL,
	`settingValue` text,
	`updatedByUserId` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminSettings_settingKey_unique` UNIQUE(`settingKey`)
);
