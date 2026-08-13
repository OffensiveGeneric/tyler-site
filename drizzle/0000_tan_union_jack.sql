CREATE TABLE `photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`filename` text NOT NULL,
	`title` text,
	`caption` text,
	`date_taken` text,
	`camera` text,
	`lens` text,
	`width` integer,
	`height` integer,
	`orientation` text,
	`featured` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photos_slug_unique` ON `photos` (`slug`);