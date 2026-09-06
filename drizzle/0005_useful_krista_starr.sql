CREATE TABLE `customerChecklistAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`checklistId` varchar(80) NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerChecklistAssignments_id` PRIMARY KEY(`id`)
);
