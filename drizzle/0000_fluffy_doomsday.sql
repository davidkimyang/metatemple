CREATE TABLE `visitors` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`x` real NOT NULL,
	`z` real NOT NULL,
	`yaw` real NOT NULL,
	`action` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `visitors_room_updated` ON `visitors` (`room`,`updated`);