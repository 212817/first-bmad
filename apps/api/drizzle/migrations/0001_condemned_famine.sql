ALTER TABLE "geocoding_cache" ADD COLUMN "address_query" text NOT NULL;--> statement-breakpoint
ALTER TABLE "geocoding_cache" ADD COLUMN "formatted_address" text;--> statement-breakpoint
CREATE INDEX "idx_geocache_address_query" ON "geocoding_cache" USING btree ("address_query");--> statement-breakpoint
ALTER TABLE "geocoding_cache" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "geocoding_cache" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "geocoding_cache" ADD CONSTRAINT "geocoding_cache_address_query_unique" UNIQUE("address_query");