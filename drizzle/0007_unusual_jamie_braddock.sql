CREATE TABLE `directoryUserMappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`directoryEmail` varchar(320) NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`role` enum('operator','lead','admin') NOT NULL DEFAULT 'operator',
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `directoryUserMappings_id` PRIMARY KEY(`id`),
	CONSTRAINT `directoryUserMappings_directoryEmail_unique` UNIQUE(`directoryEmail`)
);
