CREATE TABLE `escalations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`owner` varchar(160) NOT NULL,
	`action` text NOT NULL,
	`priority` enum('P1/P2','P3','Advisory') NOT NULL DEFAULT 'P1/P2',
	`dueAt` varchar(32),
	`status` enum('open','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `escalations_id` PRIMARY KEY(`id`)
);
