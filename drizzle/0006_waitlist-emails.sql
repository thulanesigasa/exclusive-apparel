CREATE TABLE `waitlist_email_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`signup_id` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`first_attempt` integer DEFAULT 0 NOT NULL,
	`next_attempt` integer DEFAULT 0 NOT NULL,
	`last_error` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`signup_id`) REFERENCES `waitlist_signups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `waitlist_job_signup` ON `waitlist_email_jobs` (`signup_id`);--> statement-breakpoint
CREATE INDEX `waitlist_job_pending` ON `waitlist_email_jobs` (`status`,`next_attempt`);--> statement-breakpoint
ALTER TABLE `waitlist_signups` ADD `surname` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `waitlist_signups` ADD `phone` text DEFAULT '' NOT NULL;