ALTER TABLE `visitors` ADD `slot` integer;--> statement-breakpoint
ALTER TABLE `visitors` ADD `cushion` integer;--> statement-breakpoint
ALTER TABLE `visitors` ADD `joined` integer;--> statement-breakpoint
ALTER TABLE `visitors` ADD `event` text;--> statement-breakpoint
ALTER TABLE `visitors` ADD `event_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `visitors` ADD `bow_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `visitors_updated` ON `visitors` (`updated`);--> statement-breakpoint
CREATE UNIQUE INDEX `visitors_room_slot` ON `visitors` (`room`,`slot`);--> statement-breakpoint
CREATE UNIQUE INDEX `visitors_room_cushion` ON `visitors` (`room`,`cushion`);