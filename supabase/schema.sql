
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."notification_type" AS ENUM (
    'like',
    'comment',
    'follow',
    'mention_post',
    'mention_comment'
);

ALTER TYPE "public"."notification_type" OWNER TO "postgres";

CREATE TYPE "public"."post_type" AS ENUM (
    'following',
    'program',
    'college',
    'campus',
    'all'
);

ALTER TYPE "public"."post_type" OWNER TO "postgres";

CREATE TYPE "public"."user_type" AS ENUM (
    'student',
    'faculty',
    'alumni'
);

ALTER TYPE "public"."user_type" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_user"("user_id" "uuid", "email" "text", "created_at" timestamp with time zone) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  declare
  encrypted_pw text;
BEGIN
  encrypted_pw := extensions.crypt(user_id::text, extensions.gen_salt('bf')::text);
  
  INSERT INTO auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', email, encrypted_pw, created_at, created_at, created_at, '{"provider":"email","providers":["email"]}', '{}', created_at, created_at, '', '', '', '');
  
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), user_id, user_id, format('{"sub":"%s","email":"%s"}', user_id::text, email)::jsonb, 'email', created_at, created_at, created_at);

  RETURN user_id;
END;
$$;

ALTER FUNCTION "public"."create_user"("user_id" "uuid", "email" "text", "created_at" timestamp with time zone) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."campuses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."campuses" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."colleges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "campus_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."colleges" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "thread_id" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."comments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."followees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "followee_id" "uuid" NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."followees" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."followers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "followee_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."followers" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."likes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "from_id" "uuid" NOT NULL,
    "to_id" "uuid" NOT NULL,
    "content_id" "uuid" DEFAULT "gen_random_uuid"(),
    "read" boolean DEFAULT false NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "trash" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."notifications" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "deleted_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "public"."post_type" NOT NULL
);

ALTER TABLE "public"."posts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."posts_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "order" smallint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."posts_images" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."programs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "college_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."programs" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."reported_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "comment_id" "uuid" NOT NULL,
    "reported_by_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."reported_comments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."reported_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "reported_by_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."reported_posts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."reported_problems" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "problem" "text" NOT NULL,
    "reported_by_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."reported_problems" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."reported_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reported_by_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."reported_users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."suggested_features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feature" "text" NOT NULL,
    "suggested_by_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."suggested_features" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "username" "text" NOT NULL,
    "email" character varying NOT NULL,
    "bio" "text",
    "link" "text",
    "image_name" "text",
    "deactivated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "public"."user_type" NOT NULL,
    "program_id" "uuid" NOT NULL,
    "verified_at" timestamp with time zone
);

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE ONLY "public"."campuses"
    ADD CONSTRAINT "campuses_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."colleges"
    ADD CONSTRAINT "colleges_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."followees"
    ADD CONSTRAINT "followees_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "followers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."posts_images"
    ADD CONSTRAINT "posts_images_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "programs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reported_comments"
    ADD CONSTRAINT "reported_comments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reported_posts"
    ADD CONSTRAINT "reported_post_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reported_problems"
    ADD CONSTRAINT "reported_problems_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reported_users"
    ADD CONSTRAINT "reported_users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."suggested_features"
    ADD CONSTRAINT "suggested_features_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");

CREATE INDEX "campuses_slug_idx" ON "public"."campuses" USING "btree" ("slug");

CREATE INDEX "colleges_campus_id_idx" ON "public"."colleges" USING "btree" ("campus_id");

CREATE INDEX "colleges_slug_idx" ON "public"."colleges" USING "btree" ("slug");

CREATE INDEX "comments_post_id_idx" ON "public"."comments" USING "btree" ("post_id");

CREATE INDEX "comments_post_id_user_id_idx" ON "public"."comments" USING "btree" ("post_id", "user_id");

CREATE INDEX "comments_thread_id_idx" ON "public"."comments" USING "btree" ("thread_id");

CREATE INDEX "comments_user_id_idx" ON "public"."comments" USING "btree" ("user_id");

CREATE INDEX "followees_followee_id_follower_id_idx" ON "public"."followees" USING "btree" ("followee_id", "follower_id");

CREATE INDEX "followees_followee_id_idx" ON "public"."followees" USING "btree" ("followee_id");

CREATE INDEX "followees_follower_id_idx" ON "public"."followees" USING "btree" ("follower_id");

CREATE INDEX "followers_followee_id_idx" ON "public"."followers" USING "btree" ("followee_id");

CREATE INDEX "followers_follower_id_followee_id_idx" ON "public"."followers" USING "btree" ("follower_id", "followee_id");

CREATE INDEX "followers_follower_id_idx" ON "public"."followers" USING "btree" ("follower_id");

CREATE INDEX "likes_post_id_idx" ON "public"."likes" USING "btree" ("post_id");

CREATE INDEX "likes_user_id_idx" ON "public"."likes" USING "btree" ("user_id");

CREATE INDEX "likes_user_id_post_id_idx" ON "public"."likes" USING "btree" ("user_id", "post_id");

CREATE INDEX "notifications_from_id_idx" ON "public"."notifications" USING "btree" ("from_id");

CREATE INDEX "notifications_to_id_idx" ON "public"."notifications" USING "btree" ("to_id");

CREATE INDEX "notifications_type_idx" ON "public"."notifications" USING "btree" ("type");

CREATE INDEX "posts_images_id_post_id_idx" ON "public"."posts_images" USING "btree" ("id", "post_id");

CREATE INDEX "posts_images_post_id_idx" ON "public"."posts_images" USING "btree" ("post_id");

CREATE INDEX "posts_type_idx" ON "public"."posts" USING "btree" ("type");

CREATE INDEX "posts_user_id_idx" ON "public"."posts" USING "btree" ("user_id");

CREATE INDEX "programs_college_id_idx" ON "public"."programs" USING "btree" ("college_id");

CREATE INDEX "programs_slug_idx" ON "public"."programs" USING "btree" ("slug");

ALTER TABLE ONLY "public"."colleges"
    ADD CONSTRAINT "public_colleges_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "public_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "public_comments_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."comments"("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "public_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."followees"
    ADD CONSTRAINT "public_followees_followee_id_fkey" FOREIGN KEY ("followee_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."followees"
    ADD CONSTRAINT "public_followees_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "public_followers_followee_id_fkey" FOREIGN KEY ("followee_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "public_followers_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "public_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");

ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "public_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "public_notifications_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "public_notifications_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."posts_images"
    ADD CONSTRAINT "public_posts_images_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "public_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "public_programs_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id");

ALTER TABLE ONLY "public"."reported_comments"
    ADD CONSTRAINT "public_reported_comments_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id");

ALTER TABLE ONLY "public"."reported_comments"
    ADD CONSTRAINT "public_reported_comments_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."reported_posts"
    ADD CONSTRAINT "public_reported_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");

ALTER TABLE ONLY "public"."reported_posts"
    ADD CONSTRAINT "public_reported_post_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."reported_problems"
    ADD CONSTRAINT "public_reported_problems_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."reported_users"
    ADD CONSTRAINT "public_reported_users_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."reported_users"
    ADD CONSTRAINT "public_reported_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."suggested_features"
    ADD CONSTRAINT "public_suggested_features_suggested_by_id_fkey" FOREIGN KEY ("suggested_by_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "public_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "public_users_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id");

ALTER TABLE "public"."campuses" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."colleges" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."followees" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."followers" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts_images" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."programs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reported_comments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reported_posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reported_problems" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reported_users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."suggested_features" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."create_user"("user_id" "uuid", "email" "text", "created_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."create_user"("user_id" "uuid", "email" "text", "created_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user"("user_id" "uuid", "email" "text", "created_at" timestamp with time zone) TO "service_role";

GRANT ALL ON TABLE "public"."campuses" TO "anon";
GRANT ALL ON TABLE "public"."campuses" TO "authenticated";
GRANT ALL ON TABLE "public"."campuses" TO "service_role";

GRANT ALL ON TABLE "public"."colleges" TO "anon";
GRANT ALL ON TABLE "public"."colleges" TO "authenticated";
GRANT ALL ON TABLE "public"."colleges" TO "service_role";

GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";

GRANT ALL ON TABLE "public"."followees" TO "anon";
GRANT ALL ON TABLE "public"."followees" TO "authenticated";
GRANT ALL ON TABLE "public"."followees" TO "service_role";

GRANT ALL ON TABLE "public"."followers" TO "anon";
GRANT ALL ON TABLE "public"."followers" TO "authenticated";
GRANT ALL ON TABLE "public"."followers" TO "service_role";

GRANT ALL ON TABLE "public"."likes" TO "anon";
GRANT ALL ON TABLE "public"."likes" TO "authenticated";
GRANT ALL ON TABLE "public"."likes" TO "service_role";

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";

GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";

GRANT ALL ON TABLE "public"."posts_images" TO "anon";
GRANT ALL ON TABLE "public"."posts_images" TO "authenticated";
GRANT ALL ON TABLE "public"."posts_images" TO "service_role";

GRANT ALL ON TABLE "public"."programs" TO "anon";
GRANT ALL ON TABLE "public"."programs" TO "authenticated";
GRANT ALL ON TABLE "public"."programs" TO "service_role";

GRANT ALL ON TABLE "public"."reported_comments" TO "anon";
GRANT ALL ON TABLE "public"."reported_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."reported_comments" TO "service_role";

GRANT ALL ON TABLE "public"."reported_posts" TO "anon";
GRANT ALL ON TABLE "public"."reported_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."reported_posts" TO "service_role";

GRANT ALL ON TABLE "public"."reported_problems" TO "anon";
GRANT ALL ON TABLE "public"."reported_problems" TO "authenticated";
GRANT ALL ON TABLE "public"."reported_problems" TO "service_role";

GRANT ALL ON TABLE "public"."reported_users" TO "anon";
GRANT ALL ON TABLE "public"."reported_users" TO "authenticated";
GRANT ALL ON TABLE "public"."reported_users" TO "service_role";

GRANT ALL ON TABLE "public"."suggested_features" TO "anon";
GRANT ALL ON TABLE "public"."suggested_features" TO "authenticated";
GRANT ALL ON TABLE "public"."suggested_features" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;