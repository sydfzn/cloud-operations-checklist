CREATE TABLE `checklistRunItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` int NOT NULL,
	`itemId` varchar(100) NOT NULL,
	`status` enum('open','done','blocked') NOT NULL DEFAULT 'open',
	`remarks` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklistRunItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklistRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`checklistId` varchar(80) NOT NULL,
	`runDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklistRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
