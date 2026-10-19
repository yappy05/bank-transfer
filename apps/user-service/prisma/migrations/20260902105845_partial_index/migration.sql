-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_login_key";

--Partial
CREATE UNIQUE INDEX ON "users" ("email") where "deleted_at" is null;
CREATE UNIQUE INDEX ON "users" ("login") where "deleted_at" is null;