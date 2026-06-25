## Structure

The backend uses Next.JS's route handler (App Router) to handle all routes.
The routes handles 4 main stages:

1. Authentication.
2. Authorization.
3. Input validation.
4. Processing the request.

Use comment dividers to separate these stages.

### Authentication

<!-- Insert Your Authentication Flow Here -->

### Authorization

<!-- Insert Your Authorization Flow Here -->

### Input Validation

* The input validation is handled by zod. Check the ./types file for input types, create it if it's not there.
* ALWAYS use zod safeParse, and return `ZodValidationError`.


### Processing the request
* All route handlers should be wrapped using `routeHandler` in the `src/utils/route-handlers.ts` file.
* Process the request and use `db` in the `src/lib/db/db.ts` file to query the database.
* If it's a complex update involving multiple tables, use the `runTransactionWithRetries` helper found in `src/lib/db/transactions.ts`
* Drizzle ORM is used to query the database.

## Error handling.
If an error occurs in any of the stages, throw using an error in `src/errors/next-errors.ts` file.
