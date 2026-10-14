CREATE TABLE `support_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`order_id` text,
	`order_item_id` text,
	`requested_size` text DEFAULT '' NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`reply` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `support_request_key` ON `support_requests` (`request_key`);--> statement-breakpoint
CREATE INDEX `support_order` ON `support_requests` (`order_id`);--> statement-breakpoint
CREATE INDEX `support_status` ON `support_requests` (`status`,`created_at`);