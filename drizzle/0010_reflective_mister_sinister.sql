CREATE TABLE `lifecycleControlMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`checklistId` varchar(80) NOT NULL,
	`itemId` varchar(100) NOT NULL,
	`dueDate` varchar(10),
	`ownerMappingId` int,
	`ownerName` varchar(160),
	`ownerEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lifecycleControlMetadata_id` PRIMARY KEY(`id`)
);
