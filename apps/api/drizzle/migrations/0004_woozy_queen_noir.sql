CREATE TABLE "share_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(32) NOT NULL,
	"spot_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "share_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_spot_id_parking_spots_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."parking_spots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_share_tokens_token" ON "share_tokens" USING btree ("token");