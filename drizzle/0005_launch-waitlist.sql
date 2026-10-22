CREATE TABLE `waitlist_signups` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`interest` text DEFAULT 'Everyone' NOT NULL,
	`product_id` text DEFAULT '' NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `waitlist_email` ON `waitlist_signups` (`email`);--> statement-breakpoint
CREATE INDEX `waitlist_created` ON `waitlist_signups` (`created_at`,`id`);