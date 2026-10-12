CREATE TABLE `points` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL UNIQUE,
	`points` integer NOT NULL,
	`words` integer NOT NULL
);
