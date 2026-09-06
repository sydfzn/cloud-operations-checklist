SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_users PRIMARY KEY,
    openId NVARCHAR(64) NOT NULL CONSTRAINT UQ_users_openId UNIQUE,
    name NVARCHAR(255) NULL,
    email NVARCHAR(320) NULL,
    loginMethod NVARCHAR(64) NULL,
    role NVARCHAR(32) NOT NULL CONSTRAINT DF_users_role DEFAULT N'operator',
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_users_createdAt DEFAULT SYSUTCDATETIME(),
    updatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_users_updatedAt DEFAULT SYSUTCDATETIME(),
    lastSignedIn DATETIME2(3) NOT NULL CONSTRAINT DF_users_lastSignedIn DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_users_role CHECK (role IN (N'user', N'admin', N'lead', N'operator', N'customer_viewer'))
  );
END;
GO

IF OBJECT_ID(N'dbo.customers', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.customers (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_customers PRIMARY KEY,
    name NVARCHAR(180) NOT NULL,
    code NVARCHAR(40) NOT NULL CONSTRAINT UQ_customers_code UNIQUE,
    primaryContactName NVARCHAR(160) NULL,
    primaryContactEmail NVARCHAR(320) NULL,
    status NVARCHAR(32) NOT NULL CONSTRAINT DF_customers_status DEFAULT N'draft',
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_customers_createdAt DEFAULT SYSUTCDATETIME(),
    updatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_customers_updatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_customers_status CHECK (status IN (N'draft', N'active', N'archived'))
  );
END;
GO

IF OBJECT_ID(N'dbo.directoryUserMappings', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.directoryUserMappings (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_directoryUserMappings PRIMARY KEY,
    directoryEmail NVARCHAR(320) NOT NULL CONSTRAINT UQ_directoryUserMappings_email UNIQUE,
    displayName NVARCHAR(160) NOT NULL,
    role NVARCHAR(32) NOT NULL,
    active BIT NOT NULL CONSTRAINT DF_directoryUserMappings_active DEFAULT 1,
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_directoryUserMappings_createdAt DEFAULT SYSUTCDATETIME(),
    updatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_directoryUserMappings_updatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_directoryUserMappings_role CHECK (role IN (N'operator', N'lead', N'admin'))
  );
END;
GO

IF OBJECT_ID(N'dbo.customerAccounts', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.customerAccounts (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_customerAccounts PRIMARY KEY,
    customerId INT NOT NULL,
    provider NVARCHAR(40) NOT NULL,
    accountName NVARCHAR(160) NOT NULL,
    accountIdentifier NVARCHAR(160) NULL,
    serviceScope NVARCHAR(500) NULL,
    environment NVARCHAR(80) NULL,
    region NVARCHAR(100) NULL,
    criticality NVARCHAR(32) NOT NULL CONSTRAINT DF_customerAccounts_criticality DEFAULT N'standard',
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_customerAccounts_createdAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_customerAccounts_customer FOREIGN KEY (customerId) REFERENCES dbo.customers(id),
    CONSTRAINT CK_customerAccounts_criticality CHECK (criticality IN (N'critical', N'high', N'standard'))
  );
END;
GO

IF OBJECT_ID(N'dbo.customerLeads', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.customerLeads (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_customerLeads PRIMARY KEY,
    customerId INT NOT NULL,
    userId INT NULL,
    directoryUserMappingId INT NULL,
    directoryEmail NVARCHAR(320) NOT NULL,
    displayName NVARCHAR(160) NOT NULL,
    role NVARCHAR(32) NOT NULL CONSTRAINT DF_customerLeads_role DEFAULT N'primary',
    active BIT NOT NULL CONSTRAINT DF_customerLeads_active DEFAULT 1,
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_customerLeads_createdAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_customerLeads_customer FOREIGN KEY (customerId) REFERENCES dbo.customers(id),
    CONSTRAINT FK_customerLeads_user FOREIGN KEY (userId) REFERENCES dbo.users(id),
    CONSTRAINT FK_customerLeads_mapping FOREIGN KEY (directoryUserMappingId) REFERENCES dbo.directoryUserMappings(id),
    CONSTRAINT CK_customerLeads_role CHECK (role IN (N'primary', N'backup'))
  );
END;
GO

IF OBJECT_ID(N'dbo.customerRecipients', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.customerRecipients (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_customerRecipients PRIMARY KEY,
    customerId INT NOT NULL,
    name NVARCHAR(160) NULL,
    email NVARCHAR(320) NOT NULL,
    active BIT NOT NULL CONSTRAINT DF_customerRecipients_active DEFAULT 1,
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_customerRecipients_createdAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_customerRecipients_customer FOREIGN KEY (customerId) REFERENCES dbo.customers(id)
  );
END;
GO

IF OBJECT_ID(N'dbo.customerChecklistAssignments', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.customerChecklistAssignments (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_customerChecklistAssignments PRIMARY KEY,
    customerId INT NOT NULL,
    checklistId NVARCHAR(80) NOT NULL,
    active BIT NOT NULL CONSTRAINT DF_customerChecklistAssignments_active DEFAULT 1,
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_customerChecklistAssignments_createdAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_customerChecklistAssignments UNIQUE (customerId, checklistId),
    CONSTRAINT FK_customerChecklistAssignments_customer FOREIGN KEY (customerId) REFERENCES dbo.customers(id)
  );
END;
GO

IF OBJECT_ID(N'dbo.checklistRuns', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.checklistRuns (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_checklistRuns PRIMARY KEY,
    userId INT NOT NULL,
    customerId INT NOT NULL,
    checklistId NVARCHAR(80) NOT NULL,
    runDate DATE NOT NULL,
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_checklistRuns_createdAt DEFAULT SYSUTCDATETIME(),
    updatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_checklistRuns_updatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_checklistRuns_user FOREIGN KEY (userId) REFERENCES dbo.users(id),
    CONSTRAINT FK_checklistRuns_customer FOREIGN KEY (customerId) REFERENCES dbo.customers(id),
    CONSTRAINT UQ_checklistRuns UNIQUE (userId, customerId, checklistId, runDate)
  );
END;
GO

IF OBJECT_ID(N'dbo.checklistRunItems', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.checklistRunItems (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_checklistRunItems PRIMARY KEY,
    runId INT NOT NULL,
    itemId NVARCHAR(100) NOT NULL,
    status NVARCHAR(16) NOT NULL CONSTRAINT DF_checklistRunItems_status DEFAULT N'open',
    remarks NVARCHAR(MAX) NULL,
    updatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_checklistRunItems_updatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_checklistRunItems_run FOREIGN KEY (runId) REFERENCES dbo.checklistRuns(id),
    CONSTRAINT UQ_checklistRunItems UNIQUE (runId, itemId),
    CONSTRAINT CK_checklistRunItems_status CHECK (status IN (N'open', N'done', N'blocked'))
  );
END;
GO

IF OBJECT_ID(N'dbo.reviewApprovals', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.reviewApprovals (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_reviewApprovals PRIMARY KEY,
    customerId INT NOT NULL,
    checklistId NVARCHAR(80) NOT NULL,
    runDate DATE NOT NULL,
    leadUserId INT NOT NULL,
    status NVARCHAR(24) NOT NULL,
    notes NVARCHAR(MAX) NULL,
    approvedAt DATETIME2(3) NULL,
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_reviewApprovals_createdAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_reviewApprovals_customer FOREIGN KEY (customerId) REFERENCES dbo.customers(id),
    CONSTRAINT FK_reviewApprovals_lead FOREIGN KEY (leadUserId) REFERENCES dbo.users(id),
    CONSTRAINT CK_reviewApprovals_status CHECK (status IN (N'pending', N'approved', N'rejected'))
  );
END;
GO

IF OBJECT_ID(N'dbo.reportPublications', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.reportPublications (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_reportPublications PRIMARY KEY,
    customerId INT NOT NULL,
    checklistId NVARCHAR(80) NOT NULL,
    runDate DATE NOT NULL,
    approvedByUserId INT NOT NULL,
    status NVARCHAR(24) NOT NULL CONSTRAINT DF_reportPublications_status DEFAULT N'queued',
    recipientCount INT NOT NULL CONSTRAINT DF_reportPublications_recipientCount DEFAULT 0,
    publishedAt DATETIME2(3) NULL,
    errorMessage NVARCHAR(2000) NULL,
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_reportPublications_createdAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_reportPublications_customer FOREIGN KEY (customerId) REFERENCES dbo.customers(id),
    CONSTRAINT FK_reportPublications_approvedBy FOREIGN KEY (approvedByUserId) REFERENCES dbo.users(id),
    CONSTRAINT CK_reportPublications_status CHECK (status IN (N'queued', N'sent', N'failed'))
  );
END;
GO

IF OBJECT_ID(N'dbo.escalations', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.escalations (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_escalations PRIMARY KEY,
    userId INT NOT NULL,
    owner NVARCHAR(160) NOT NULL,
    action NVARCHAR(MAX) NOT NULL,
    priority NVARCHAR(24) NOT NULL,
    dueAt DATETIME2(3) NULL,
    status NVARCHAR(16) NOT NULL CONSTRAINT DF_escalations_status DEFAULT N'open',
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_escalations_createdAt DEFAULT SYSUTCDATETIME(),
    updatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_escalations_updatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_escalations_user FOREIGN KEY (userId) REFERENCES dbo.users(id),
    CONSTRAINT CK_escalations_priority CHECK (priority IN (N'P1/P2', N'P3', N'Advisory')),
    CONSTRAINT CK_escalations_status CHECK (status IN (N'open', N'closed'))
  );
END;
GO

IF OBJECT_ID(N'dbo.adminSettings', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.adminSettings (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_adminSettings PRIMARY KEY,
    settingKey NVARCHAR(160) NOT NULL CONSTRAINT UQ_adminSettings_key UNIQUE,
    settingValue NVARCHAR(MAX) NULL,
    updatedByUserId INT NULL,
    createdAt DATETIME2(3) NOT NULL CONSTRAINT DF_adminSettings_createdAt DEFAULT SYSUTCDATETIME(),
    updatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_adminSettings_updatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_adminSettings_user FOREIGN KEY (updatedByUserId) REFERENCES dbo.users(id)
  );
END;
GO
