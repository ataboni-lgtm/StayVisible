## Schema:
* ALWAYS use doublePrecision for floating point columes. This is due to the fact that JS numbers can't fit a full `float`. The numbers we are working with are very small and `float` is not needed.

## Migrations.
* DO NOT generate migration files. The migrations will be handled via Drizzle.