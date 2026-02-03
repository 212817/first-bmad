ALTER TABLE "car_tags" DROP CONSTRAINT "car_tags_spot_id_parking_spots_id_fk";
--> statement-breakpoint
ALTER TABLE "parking_spots" ALTER COLUMN "latitude" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parking_spots" ALTER COLUMN "longitude" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "car_tags" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "car_tags" ADD COLUMN "name" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "car_tags" ADD COLUMN "color" varchar(7) DEFAULT '#3B82F6' NOT NULL;--> statement-breakpoint
ALTER TABLE "car_tags" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "parking_spots" ADD COLUMN "car_tag_id" uuid;--> statement-breakpoint
ALTER TABLE "car_tags" ADD CONSTRAINT "car_tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_spots" ADD CONSTRAINT "parking_spots_car_tag_id_car_tags_id_fk" FOREIGN KEY ("car_tag_id") REFERENCES "public"."car_tags"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_car_tags_user" ON "car_tags" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "car_tags" DROP COLUMN "spot_id";--> statement-breakpoint
ALTER TABLE "car_tags" DROP COLUMN "label";