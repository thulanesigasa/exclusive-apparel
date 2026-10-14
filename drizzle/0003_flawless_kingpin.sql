CREATE TABLE `customer_sessions` (
	`id_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`sealed` text NOT NULL,
	`expires` integer NOT NULL,
	`recovery` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_user` ON `customer_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expiry` ON `customer_sessions` (`expires`);