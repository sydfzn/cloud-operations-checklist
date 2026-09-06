# Microsoft SQL Server / SQL Server Express

The application currently keeps the managed MySQL/TiDB repository as its active runtime database. The SQL Server path is isolated so a self-hosted deployment can switch providers after migration verification.

## Configuration

Set the following values in the server environment:

```bash
DB_PROVIDER=mssql
MSSQL_CONNECTION_STRING=Server=localhost,1433;Database=CloudOperations;User Id=cloudops_app;Password=replace-me;Encrypt=true;TrustServerCertificate=true
```

For SQL Server Express, use the instance name when required:

```bash
MSSQL_CONNECTION_STRING=Server=localhost\\SQLEXPRESS;Database=CloudOperations;Trusted_Connection=True;TrustServerCertificate=True
```

The optional adapter is exposed by `server/mssql.ts`, and `server/database-provider.ts` resolves the shared repository contract. It returns no active MSSQL connection when `MSSQL_CONNECTION_STRING` is not configured, so the existing managed database remains unaffected until an explicit migration is performed.

The current MSSQL repository boundary covers customer listing, checklist run loading and item writes, review status reads, and publication-history reads. Customer CRUD, lead approval/publication writes, administration settings, and directory-management writes remain on the managed MySQL repository until their MSSQL write parity is implemented and verified. This is intentional and prevents an incomplete MSSQL migration from silently accepting governance changes.

## Bootstrap

1. Create an empty `CloudOperations` database.
2. Run `001_initial_schema.sql` in SQL Server Management Studio, Azure Data Studio, or `sqlcmd`.
3. Create a least-privilege application login and replace the example connection string with a secret-managed value.
4. Export customer and checklist records from the current database into the matching SQL Server tables.
5. Run the application test suite against the SQL Server environment before setting `DB_PROVIDER=mssql` for production.

The bootstrap SQL is idempotent for table creation. It does not seed customer, user, lead, recipient, checklist, or report data.

## Microsoft Entra

Microsoft Entra start and callback code remains in the separate `server/_core/entra.ts` module. It is intentionally disabled until tenant ID, client ID, client secret, redirect URI, and administrator consent are supplied. Database provider selection and identity-provider activation are independent configuration decisions.
