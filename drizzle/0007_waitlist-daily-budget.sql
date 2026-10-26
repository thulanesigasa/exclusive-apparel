CREATE TABLE `waitlist_email_budget` (
	`day` text PRIMARY KEY NOT NULL,
	`reserved` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `waitlist_email_control` (
	`id` text PRIMARY KEY NOT NULL,
	`paused_until` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
-- This trigger and the job claim are one SQLite statement/transaction. Every
-- attempt reserves two recipients, including ambiguous retries (fail closed).
CREATE TRIGGER waitlist_email_daily_limit BEFORE UPDATE OF attempts ON waitlist_email_jobs
WHEN NEW.attempts > OLD.attempts
BEGIN
 INSERT INTO waitlist_email_budget(day,reserved) VALUES(strftime('%Y-%m-%d','now'),0) ON CONFLICT(day) DO NOTHING;
 SELECT CASE WHEN (SELECT reserved FROM waitlist_email_budget WHERE day=strftime('%Y-%m-%d','now')) + 2 > 100 THEN RAISE(ABORT,'WAITLIST_DAILY_LIMIT') END;
 UPDATE waitlist_email_budget SET reserved=reserved+2 WHERE day=strftime('%Y-%m-%d','now');
END;
--> statement-breakpoint
-- On an existing installation we cannot reconstruct earlier provider usage.
-- Hold sending until the next UTC day rather than start a fresh allowance mid-day.
INSERT INTO waitlist_email_budget(day,reserved)
 SELECT strftime('%Y-%m-%d','now'),100 WHERE EXISTS(SELECT 1 FROM waitlist_email_jobs WHERE attempts>0)
 ON CONFLICT(day) DO NOTHING;
