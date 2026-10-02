CREATE TABLE `garages` (
	`user_id` text PRIMARY KEY NOT NULL,
	`pilot` integer DEFAULT 0 NOT NULL,
	`vehicle` integer DEFAULT 0 NOT NULL,
	`paint` text DEFAULT 'original' NOT NULL,
	`wheels` integer DEFAULT 0 NOT NULL,
	`spoiler` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `owned_items` (
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`item_id` integer NOT NULL,
	`acquired_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `kind`, `item_id`),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`coins` integer DEFAULT 600 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `race_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`track` integer NOT NULL,
	`mode` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`time` real,
	`position` integer,
	`stars` integer,
	`reward` integer,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_race_runs_user_started` ON `race_runs` (`user_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `race_records` (
	`user_id` text NOT NULL,
	`track` integer NOT NULL,
	`mode` text NOT NULL,
	`time` real NOT NULL,
	PRIMARY KEY(`user_id`, `track`, `mode`),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
