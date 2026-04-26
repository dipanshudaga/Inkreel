CREATE TABLE `diary_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`media_id` text,
	`episode_id` text,
	`logged_date` text NOT NULL,
	`action_type` text,
	`amount_progressed` integer,
	`rating` real,
	`review_text` text,
	`rewatch_reread` integer DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `episodes` (
	`id` text PRIMARY KEY NOT NULL,
	`media_id` text,
	`season_number` integer,
	`episode_number` integer,
	`title` text,
	`air_date` text,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`sub_type` text,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`tmdb_id` integer,
	`anilist_id` integer,
	`google_books_id` text,
	`isbn13` text,
	`bgg_id` integer,
	`poster_url` text,
	`backdrop_url` text,
	`year` integer,
	`creator` text,
	`description` text,
	`genres` text,
	`duration` integer,
	`page_count` integer,
	`min_players` integer,
	`max_players` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_slug_unique` ON `media` (`slug`);--> statement-breakpoint
CREATE TABLE `tracking_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`media_id` text,
	`status` text,
	`rating` real,
	`is_liked` integer DEFAULT 0,
	`progress` integer,
	`total_expected` integer,
	`owned` integer DEFAULT 0,
	`started_at` text,
	`finished_at` text,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`image` text,
	`password` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);