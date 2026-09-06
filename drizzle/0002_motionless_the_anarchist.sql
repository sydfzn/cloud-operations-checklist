CREATE TABLE `customerAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`provider` varchar(40) NOT NULL,
	`accountName` varchar(160) NOT NULL,
	`accountIdentifier` varchar(160),
	`environment` varchar(80),
	`region` varchar(100),
	`criticality` enum('critical','high','standard') NOT NULL DEFAULT 'standard',
	`status` enum('active','retired') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('primary','backup') NOT NULL DEFAULT 'primary',
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerLeads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`code` varchar(40) NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`primaryContactName` varchar(160),
	`primaryContactEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `reportPublications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`checklistId` varchar(80) NOT NULL,
	`runDate` varchar(10) NOT NULL,
	`approvalId` int NOT NULL,
	`publishedByUserId` int NOT NULL,
	`recipientCount` int NOT NULL DEFAULT 0,
	`deliveryStatus` enum('queued','sent','failed') NOT NULL DEFAULT 'queued',
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reportPublications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reportRecipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(160),
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reportRecipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviewApprovals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`checklistId` varchar(80) NOT NULL,
	`runDate` varchar(10) NOT NULL,
	`leadUserId` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`notes` text,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviewApprovals_id` PRIMARY KEY(`id`)
);
