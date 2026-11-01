ALTER TABLE `visitors` ADD `speech` text;--> statement-breakpoint
ALTER TABLE `visitors` ADD `speech_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `visitors` ADD `speech_until` integer DEFAULT 0 NOT NULL;