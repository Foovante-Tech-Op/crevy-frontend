CREATE TYPE "public"."assignment_type_enum" AS ENUM('primary', 'secondary');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'expired');--> statement-breakpoint
CREATE TYPE "public"."partner_status_enum" AS ENUM('pending', 'approved', 'suspended', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."partner_type_enum" AS ENUM('dMRV_provider', 'auditing_body', 'registry', 'channel');--> statement-breakpoint
CREATE TYPE "public"."developer_verification_status_enum" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."entity_type_enum" AS ENUM('individual', 'cooperative', 'company');--> statement-breakpoint
CREATE TYPE "public"."member_role_enum" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."boundary_collection_method_enum" AS ENUM('walked_gps', 'drawn_mobile', 'drawn_web', 'satellite_derived', 'buffered_centroid');--> statement-breakpoint
CREATE TYPE "public"."assessment_completion_enum" AS ENUM('not_started', 'in_progress', 'complete');--> statement-breakpoint
CREATE TYPE "public"."project_stage_enum" AS ENUM('registration', 'active', 'verification', 'completed');--> statement-breakpoint
CREATE TYPE "public"."project_status_enum" AS ENUM('draft', 'active', 'suspended', 'closed');--> statement-breakpoint
CREATE TYPE "public"."project_type_enum" AS ENUM('regenerative_agriculture', 'renewable_energy', 'agricultural_waste_management', 'water_projects', 'blue_carbon', 'biochar', 'agricultural_land_management', 'circular_bioeconomy', 'aquaculture', 'fisheries', 'other');--> statement-breakpoint
CREATE TYPE "public"."registry_status_enum" AS ENUM('admin_verified', 'dmrv_verified', 'registry_pending', 'registry_certified');--> statement-breakpoint
CREATE TYPE "public"."sector_enum" AS ENUM('green_economy', 'brown_economy', 'blue_economy');--> statement-breakpoint
CREATE TYPE "public"."project_participation_status_enum" AS ENUM('active', 'suspended', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."project_plot_status_enum" AS ENUM('enrolled', 'suspended', 'removed');--> statement-breakpoint
CREATE TYPE "public"."project_activity_status_enum" AS ENUM('planned', 'in_progress', 'completed', 'skipped', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."document_type_enum" AS ENUM('land_ownership', 'community_consent', 'site_access_authorization', 'national_id', 'site_photos');--> statement-breakpoint
CREATE TYPE "public"."assessment_module_key_enum" AS ENUM('project_identification', 'waste_stream', 'baseline_emissions', 'project_intervention', 'activity_data', 'carbon_market_readiness', 'mrv_readiness', 'verification_readiness');--> statement-breakpoint
CREATE TYPE "public"."assessment_status_enum" AS ENUM('not_started', 'in_progress', 'submitted');--> statement-breakpoint
CREATE TYPE "public"."site_type_enum" AS ENUM('processing_facility', 'energy_installation', 'water_body', 'coastal_zone');--> statement-breakpoint
CREATE TYPE "public"."mrv_ingestion_status_enum" AS ENUM('pending', 'processing', 'verified', 'flagged', 'failed');--> statement-breakpoint
CREATE TYPE "public"."geo_fence_status_enum" AS ENUM('valid', 'invalid');--> statement-breakpoint
CREATE TYPE "public"."verification_status_enum" AS ENUM('success', 'flagged', 'failed');--> statement-breakpoint
CREATE TYPE "public"."credit_status_enum" AS ENUM('available', 'reserved', 'sold', 'retired', 'invalidated');--> statement-breakpoint
CREATE TYPE "public"."emissions_scope_enum" AS ENUM('scope_1', 'scope_2', 'scope_3', 'removal');--> statement-breakpoint
CREATE TYPE "public"."transaction_status_enum" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_method_enum" AS ENUM('mobile_money', 'bank_transfer', 'cash');--> statement-breakpoint
CREATE TYPE "public"."payout_status_enum" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."record_type_enum" AS ENUM('platform_fee', 'refund', 'contract_payment', 'commission', 'correction');--> statement-breakpoint
CREATE TYPE "public"."contract_status_enum" AS ENUM('draft', 'active', 'inactive', 'completed', 'terminated', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."contract_type_enum" AS ENUM('project_of_ftake', 'farmer_of_ftake', 'spot_purchase', 'credit_forward', 'escrow_agreement', 'interim_agreement');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('periodic', 'on_demand');--> statement-breakpoint
CREATE TYPE "public"."audit_log_action_enum" AS ENUM('create', 'update', 'delete', 'approve', 'issue', 'transfer', 'retire', 'reject');--> statement-breakpoint
CREATE TABLE "permission" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource" varchar(100) NOT NULL,
	"action" varchar(100) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role_permission" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"granted_by" text,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permission_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"username" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"contact_number" text,
	"country_of_operation" text,
	"profile_completed" boolean,
	"default_currency_id" integer,
	"role_id" integer,
	"assigned_by" text,
	"assigned_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"registration_id" text,
	"carbon_neutrality_targets" jsonb,
	"tax_residence" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_registration_id_unique" UNIQUE("registration_id")
);
--> statement-breakpoint
CREATE TABLE "organization_member" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role_id" integer NOT NULL,
	"organization_id" uuid,
	"project_developer_id" uuid,
	"token" text NOT NULL,
	"invited_by" text NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "waitlist_registration" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(50),
	"organization_name" varchar(255) NOT NULL,
	"job_title" varchar(150) NOT NULL,
	"country" varchar(100) NOT NULL,
	"role_description" varchar(100) NOT NULL,
	"climate_sectors" jsonb NOT NULL,
	"use_cases" jsonb NOT NULL,
	"manages_projects" varchar(50) NOT NULL,
	"project_count" varchar(50),
	"hectares_managed" varchar(100),
	"primary_interest" varchar(150),
	"investment_budget" varchar(100),
	"biggest_challenge" text NOT NULL,
	"platform_value_expectation" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"review_notes" text,
	CONSTRAINT "waitlist_registration_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "currency" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" char(3) NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currency_code_unique" UNIQUE("code"),
	CONSTRAINT "currency_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "partner" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"partner_type" "partner_type_enum" NOT NULL,
	"contact_person" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" varchar(50),
	"country" varchar(100),
	"status" "partner_status_enum" DEFAULT 'pending' NOT NULL,
	"default_currency_id" integer,
	"has_data_sharing_agreement" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partner_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "project_developer" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"entity_type" "entity_type_enum" DEFAULT 'individual' NOT NULL,
	"name" varchar(255) NOT NULL,
	"verification_status" "developer_verification_status_enum" DEFAULT 'pending' NOT NULL,
	"onboarded_by" text,
	"onboarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"bank_details" jsonb,
	"momo_details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_developer_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "project_developer_member" (
	"id" uuid PRIMARY KEY NOT NULL,
	"developer_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "member_role_enum" DEFAULT 'owner' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_developer_member" UNIQUE("developer_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "farm_plot" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_developer_id" uuid NOT NULL,
	"country" varchar(100) NOT NULL,
	"region" varchar(100) NOT NULL,
	"village" varchar(100),
	"centroid" geometry(point),
	"boundary" geometry(point),
	"boundary_collection_method" "boundary_collection_method_enum",
	"area_hectares" numeric(10, 2) NOT NULL,
	"boundary_verified" boolean DEFAULT false NOT NULL,
	"device_id" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "farm_plot_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE TABLE "project_owner_assignment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_developer_id" uuid NOT NULL,
	"agent_id" text NOT NULL,
	"assigned_by" text NOT NULL,
	"partner_id" integer,
	"assignment_type" "assignment_type_enum" NOT NULL,
	"is_b2c_assignment" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"slug" varchar(255),
	"name" varchar(255),
	"project_type" "project_type_enum" NOT NULL,
	"project_stage" "project_stage_enum" DEFAULT 'registration' NOT NULL,
	"project_status" "project_status_enum" DEFAULT 'draft' NOT NULL,
	"registry_status" "registry_status_enum" DEFAULT 'admin_verified' NOT NULL,
	"sector" "sector_enum" DEFAULT 'green_economy' NOT NULL,
	"custom_project_type_label" varchar(255),
	"assessment_completion" "assessment_completion_enum" DEFAULT 'not_started' NOT NULL,
	"assigned_methodology_status" varchar(50) DEFAULT 'pending',
	"project_tags" jsonb DEFAULT '[]'::jsonb,
	"description" text,
	"sdgs" text[] DEFAULT '{}',
	"region" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"currency_id" integer NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_code_unique" UNIQUE("code"),
	CONSTRAINT "project_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "project_owner_enrollment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"project_developer_id" uuid NOT NULL,
	"joined_date" date NOT NULL,
	"participation_status" "project_participation_status_enum" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_plot" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"plot_id" uuid NOT NULL,
	"enrolled_area_hectares" numeric(10, 2) NOT NULL,
	"status" "project_plot_status_enum" DEFAULT 'enrolled' NOT NULL,
	"enrolled_date" date NOT NULL,
	"removed_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"activity_date" date NOT NULL,
	"activity_description" text,
	"activity_status" "project_activity_status_enum" DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_document" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"document_type" "document_type_enum" NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100),
	"uploaded_by" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_by" text,
	"verified_at" timestamp with time zone,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_assessment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"module_key" "assessment_module_key_enum" NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"status" "assessment_status_enum" DEFAULT 'not_started' NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"submitted_by" varchar(255),
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_project_assessment_module" UNIQUE("project_id","module_key")
);
--> statement-breakpoint
CREATE TABLE "project_assessment_score" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"carbon_readiness_score" integer,
	"data_quality_score" integer,
	"additionality_score" integer,
	"monitoring_capability_score" integer,
	"documentation_score" integer,
	"verification_readiness_score" integer,
	"baseline_waste_volume_tonnes" numeric(12, 3),
	"baseline_disposal_pathway" varchar(100),
	"baseline_methane_potential_tco2e" numeric(12, 6),
	"baseline_emissions_estimate_tco2e" numeric(12, 6),
	"projected_waste_diverted_tonnes" numeric(12, 3),
	"projected_methane_avoided_tco2e" numeric(12, 6),
	"projected_co2e_reduction_tco2e" numeric(12, 6),
	"primary_methodology" varchar(150),
	"alternative_methodology" varchar(150),
	"future_methodology_pathway" text,
	"calculation_trail" jsonb,
	"scoring_engine_version" varchar(50) NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_site" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"site_type" "site_type_enum" NOT NULL,
	"facility_name" varchar(255),
	"address" varchar(500),
	"centroid" geometry(point),
	"area_or_capacity" numeric(12, 3),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_sector_tag" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"sector" "sector_enum" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_project_sector_tag" UNIQUE("project_id","sector")
);
--> statement-breakpoint
CREATE TABLE "mrv_ingestion_event" (
	"id" uuid PRIMARY KEY NOT NULL,
	"cc_ingestion_id" varchar(100) NOT NULL,
	"project_id" uuid NOT NULL,
	"plot_id" uuid NOT NULL,
	"project_developer_id" uuid NOT NULL,
	"partner_id" integer NOT NULL,
	"device_id" varchar(100),
	"submission_timestamp" timestamp with time zone,
	"ingestion_status" "mrv_ingestion_status_enum" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mrv_ingestion_event_cc_ingestion_id_unique" UNIQUE("cc_ingestion_id")
);
--> statement-breakpoint
CREATE TABLE "mrv_verification_result" (
	"id" uuid PRIMARY KEY NOT NULL,
	"ingestion_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"verification_event_id" varchar(200) NOT NULL,
	"methodology_applied" varchar(100),
	"verification_status" "verification_status_enum" NOT NULL,
	"ai_model_id" varchar(100),
	"ai_confidence_score" numeric(5, 4),
	"is_anomalous" boolean DEFAULT false NOT NULL,
	"prediction_class" varchar(100),
	"geo_fence_status" "geo_fence_status_enum" NOT NULL,
	"hardware_integrity" varchar(50) NOT NULL,
	"gross_removals_tco2e" numeric(12, 6),
	"leakage_deduction" numeric(12, 6),
	"buffer_contribution" numeric(12, 6),
	"net_credits_issued" numeric(12, 6),
	"received_at" timestamp with time zone,
	CONSTRAINT "mrv_verification_result_verification_event_id_unique" UNIQUE("verification_event_id")
);
--> statement-breakpoint
CREATE TABLE "mrv_blockchain_anchor" (
	"id" uuid PRIMARY KEY NOT NULL,
	"result_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"network" varchar(100) NOT NULL,
	"contract_address" varchar(100) NOT NULL,
	"transaction_hash" varchar(255) NOT NULL,
	"block_height" bigint,
	"batch_id" varchar(100) NOT NULL,
	"vintage" smallint NOT NULL,
	"merkle_root" varchar(255) NOT NULL,
	"audit_uri" varchar(500) NOT NULL,
	"anchored_at" timestamp with time zone,
	CONSTRAINT "mrv_blockchain_anchor_result_id_unique" UNIQUE("result_id"),
	CONSTRAINT "mrv_blockchain_anchor_transaction_hash_unique" UNIQUE("transaction_hash"),
	CONSTRAINT "mrv_blockchain_anchor_batch_id_unique" UNIQUE("batch_id")
);
--> statement-breakpoint
CREATE TABLE "carbon_credit" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"serial_number_start" varchar(100) NOT NULL,
	"serial_number_end" varchar(100) NOT NULL,
	"total_amount" numeric(12, 6) NOT NULL,
	"available_amount" numeric(12, 6) NOT NULL,
	"credit_vintage" smallint NOT NULL,
	"credit_status" "credit_status_enum" DEFAULT 'available' NOT NULL,
	"mrv_batch_id" varchar(100) NOT NULL,
	"blockchain_tx_hash" varchar(255) NOT NULL,
	"current_owner_id" text NOT NULL,
	"registry" varchar(100),
	"is_additional" boolean DEFAULT false NOT NULL,
	"additional_reason" text,
	"emissions_scope" "emissions_scope_enum" NOT NULL,
	"generation_date" date,
	"verification_date" date,
	"issuance_date" date,
	"transaction_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_transaction" (
	"id" uuid PRIMARY KEY NOT NULL,
	"transaction_ref" varchar(100) NOT NULL,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"is_internal_sale" boolean DEFAULT false NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"price_per_credit" numeric(10, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"currency_id" integer NOT NULL,
	"transaction_status" "transaction_status_enum" DEFAULT 'pending' NOT NULL,
	"transaction_date" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_transaction_transaction_ref_unique" UNIQUE("transaction_ref")
);
--> statement-breakpoint
CREATE TABLE "credit_verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"verifier_partner_id" integer NOT NULL,
	"verification_event_id" varchar(200) NOT NULL,
	"methodology_applied" varchar(100),
	"verification_date" date NOT NULL,
	"verification_status" "verification_status_enum" NOT NULL,
	"verification_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_verification_verification_event_id_unique" UNIQUE("verification_event_id")
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"price_per_credit" numeric(12, 2) NOT NULL,
	"currency_id" integer NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout" (
	"id" uuid PRIMARY KEY NOT NULL,
	"payment_ref" varchar(100) NOT NULL,
	"project_developer_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"transaction_id" uuid NOT NULL,
	"payout_amount" numeric(12, 2) NOT NULL,
	"currency_id" integer NOT NULL,
	"payout_date" date NOT NULL,
	"payout_method" "payout_method_enum" NOT NULL,
	"payout_status" "payout_status_enum" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payout_payment_ref_unique" UNIQUE("payment_ref")
);
--> statement-breakpoint
CREATE TABLE "financial_record" (
	"id" uuid PRIMARY KEY NOT NULL,
	"transaction_id" uuid NOT NULL,
	"record_type" "record_type_enum" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency_id" integer NOT NULL,
	"date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contract" (
	"id" uuid PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"project_id" uuid NOT NULL,
	"project_developer_id" uuid NOT NULL,
	"plot_id" uuid NOT NULL,
	"contract_ref" varchar(100) NOT NULL,
	"contract_type" "contract_type_enum" NOT NULL,
	"contract_terms" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" "contract_status_enum" DEFAULT 'draft' NOT NULL,
	"committed_credits" numeric(12, 2),
	"carbon_estimated" numeric(12, 2),
	"methodology" varchar(100),
	"payment_terms" jsonb,
	"has_data_sharing_agreement" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "esg_report" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_user_id" text NOT NULL,
	"reporting_period_start" date NOT NULL,
	"reporting_period_end" date NOT NULL,
	"total_tco2e" numeric(18, 6) DEFAULT '0',
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"file_url" text,
	"report_type" "report_type" DEFAULT 'periodic' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retirement_certificate" (
	"id" uuid PRIMARY KEY NOT NULL,
	"credit_id" uuid NOT NULL,
	"company_user_id" text NOT NULL,
	"tco2e_amount" numeric(12, 6) NOT NULL,
	"file_url" text,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"actor_id" text,
	"action" "audit_log_action_enum" NOT NULL,
	"resource" varchar(100) NOT NULL,
	"resource_id" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" varchar(100),
	"user_agent" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "check_immutable_rows" CHECK (true)
);
--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_project_developer_id_project_developer_id_fk" FOREIGN KEY ("project_developer_id") REFERENCES "public"."project_developer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_default_currency_id_currency_id_fk" FOREIGN KEY ("default_currency_id") REFERENCES "public"."currency"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_developer" ADD CONSTRAINT "project_developer_onboarded_by_user_id_fk" FOREIGN KEY ("onboarded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_developer_member" ADD CONSTRAINT "project_developer_member_developer_id_project_developer_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."project_developer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_developer_member" ADD CONSTRAINT "project_developer_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_plot" ADD CONSTRAINT "farm_plot_project_developer_id_project_developer_id_fk" FOREIGN KEY ("project_developer_id") REFERENCES "public"."project_developer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_owner_assignment" ADD CONSTRAINT "project_owner_assignment_project_developer_id_project_developer_id_fk" FOREIGN KEY ("project_developer_id") REFERENCES "public"."project_developer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_owner_assignment" ADD CONSTRAINT "project_owner_assignment_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currency"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_owner_enrollment" ADD CONSTRAINT "project_owner_enrollment_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_owner_enrollment" ADD CONSTRAINT "project_owner_enrollment_project_developer_id_project_developer_id_fk" FOREIGN KEY ("project_developer_id") REFERENCES "public"."project_developer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_plot" ADD CONSTRAINT "project_plot_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_plot" ADD CONSTRAINT "project_plot_plot_id_farm_plot_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."farm_plot"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_activity" ADD CONSTRAINT "project_activity_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_document" ADD CONSTRAINT "project_document_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assessment" ADD CONSTRAINT "project_assessment_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assessment_score" ADD CONSTRAINT "project_assessment_score_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_site" ADD CONSTRAINT "project_site_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_sector_tag" ADD CONSTRAINT "project_sector_tag_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_ingestion_event" ADD CONSTRAINT "mrv_ingestion_event_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_ingestion_event" ADD CONSTRAINT "mrv_ingestion_event_plot_id_farm_plot_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."farm_plot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_ingestion_event" ADD CONSTRAINT "mrv_ingestion_event_project_developer_id_project_developer_id_fk" FOREIGN KEY ("project_developer_id") REFERENCES "public"."project_developer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_ingestion_event" ADD CONSTRAINT "mrv_ingestion_event_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_verification_result" ADD CONSTRAINT "mrv_verification_result_ingestion_id_mrv_ingestion_event_id_fk" FOREIGN KEY ("ingestion_id") REFERENCES "public"."mrv_ingestion_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_verification_result" ADD CONSTRAINT "mrv_verification_result_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_blockchain_anchor" ADD CONSTRAINT "mrv_blockchain_anchor_result_id_mrv_verification_result_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."mrv_verification_result"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_blockchain_anchor" ADD CONSTRAINT "mrv_blockchain_anchor_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_credit" ADD CONSTRAINT "carbon_credit_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_credit" ADD CONSTRAINT "carbon_credit_mrv_batch_id_mrv_blockchain_anchor_batch_id_fk" FOREIGN KEY ("mrv_batch_id") REFERENCES "public"."mrv_blockchain_anchor"("batch_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_credit" ADD CONSTRAINT "carbon_credit_transaction_id_credit_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."credit_transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currency"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_verification" ADD CONSTRAINT "credit_verification_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_verification" ADD CONSTRAINT "credit_verification_verifier_partner_id_partner_id_fk" FOREIGN KEY ("verifier_partner_id") REFERENCES "public"."partner"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_project_developer_id_project_developer_id_fk" FOREIGN KEY ("project_developer_id") REFERENCES "public"."project_developer"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_transaction_id_credit_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."credit_transaction"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currency"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_record" ADD CONSTRAINT "financial_record_transaction_id_credit_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."credit_transaction"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_record" ADD CONSTRAINT "financial_record_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currency"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract" ADD CONSTRAINT "contract_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract" ADD CONSTRAINT "contract_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract" ADD CONSTRAINT "contract_project_developer_id_project_developer_id_fk" FOREIGN KEY ("project_developer_id") REFERENCES "public"."project_developer"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract" ADD CONSTRAINT "contract_plot_id_project_plot_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."project_plot"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "esg_report" ADD CONSTRAINT "esg_report_company_user_id_user_id_fk" FOREIGN KEY ("company_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retirement_certificate" ADD CONSTRAINT "retirement_certificate_credit_id_carbon_credit_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."carbon_credit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retirement_certificate" ADD CONSTRAINT "retirement_certificate_company_user_id_user_id_fk" FOREIGN KEY ("company_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "waitlist_status_idx" ON "waitlist_registration" USING btree ("status");--> statement-breakpoint
CREATE INDEX "waitlist_status_id_idx" ON "waitlist_registration" USING btree ("status","id");--> statement-breakpoint
CREATE INDEX "waitlist_created_at_idx" ON "waitlist_registration" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_developer_member_user_id" ON "project_developer_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_farm_plot_developer_id" ON "farm_plot" USING btree ("project_developer_id");--> statement-breakpoint
CREATE INDEX "idx_farm_plot_boundary" ON "farm_plot" USING gist ("boundary");--> statement-breakpoint
CREATE INDEX "idx_farm_plot_centroid" ON "farm_plot" USING gist ("centroid");--> statement-breakpoint
CREATE INDEX "idx_project_owner_assignment_project_developer_id" ON "project_owner_assignment" USING btree ("project_developer_id");--> statement-breakpoint
CREATE INDEX "idx_project_owner_assignment_agent_id" ON "project_owner_assignment" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_project_type" ON "project" USING btree ("project_type");--> statement-breakpoint
CREATE INDEX "idx_project_status" ON "project" USING btree ("project_status");--> statement-breakpoint
CREATE INDEX "idx_project_registry_status" ON "project" USING btree ("registry_status");--> statement-breakpoint
CREATE INDEX "idx_project_code" ON "project" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_project_slug" ON "project" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_project_created_by" ON "project" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_project_document_project_id" ON "project_document" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_document_uploaded_by" ON "project_document" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "idx_project_document_project_type" ON "project_document" USING btree ("project_id","document_type");--> statement-breakpoint
CREATE INDEX "idx_project_document_unverified" ON "project_document" USING btree ("is_verified") WHERE is_verified = false;--> statement-breakpoint
CREATE INDEX "idx_project_assessment_project" ON "project_assessment" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_assessment_status" ON "project_assessment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_project_assessment_answers" ON "project_assessment" USING gin ("answers");--> statement-breakpoint
CREATE INDEX "idx_assessment_score_project" ON "project_assessment_score" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_assessment_score_calculated_at" ON "project_assessment_score" USING btree ("calculated_at");--> statement-breakpoint
CREATE INDEX "idx_project_site_project_id" ON "project_site" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_site_centroid" ON "project_site" USING gist ("centroid");--> statement-breakpoint
CREATE INDEX "idx_project_sector_tag_project" ON "project_sector_tag" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_sector_tag_sector" ON "project_sector_tag" USING btree ("sector");--> statement-breakpoint
CREATE INDEX "idx_carbon_credit_project" ON "carbon_credit" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_carbon_credit_status" ON "carbon_credit" USING btree ("credit_status");--> statement-breakpoint
CREATE INDEX "idx_carbon_credit_owner" ON "carbon_credit" USING btree ("current_owner_id");--> statement-breakpoint
CREATE INDEX "idx_carbon_credit_vintage" ON "carbon_credit" USING btree ("credit_vintage");--> statement-breakpoint
CREATE INDEX "idx_carbon_credit_batch" ON "carbon_credit" USING btree ("mrv_batch_id");--> statement-breakpoint
CREATE INDEX "idx_credit_txn_buyer" ON "credit_transaction" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "idx_credit_txn_seller" ON "credit_transaction" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "idx_credit_txn_status" ON "credit_transaction" USING btree ("transaction_status");--> statement-breakpoint
CREATE INDEX "idx_price_history_project" ON "price_history" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_price_history_price" ON "price_history" USING btree ("price_per_credit");--> statement-breakpoint
CREATE INDEX "idx_price_history_recorded" ON "price_history" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_payout_farmer" ON "payout" USING btree ("project_developer_id");--> statement-breakpoint
CREATE INDEX "idx_payout_project" ON "payout" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_payout_status" ON "payout" USING btree ("payout_status");--> statement-breakpoint
CREATE INDEX "idx_financial_record_transaction" ON "financial_record" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_financial_record_type" ON "financial_record" USING btree ("record_type");--> statement-breakpoint
CREATE INDEX "idx_financial_record_date" ON "financial_record" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_contract_ref" ON "contract" USING btree ("contract_ref");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_contract_ref_project" ON "contract" USING btree ("contract_ref","project_id");--> statement-breakpoint
CREATE INDEX "idx_contract_type" ON "contract" USING btree ("contract_type");--> statement-breakpoint
CREATE INDEX "idx_contract_status" ON "contract" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_contract_methodology" ON "contract" USING btree ("methodology");--> statement-breakpoint
CREATE INDEX "idx_audit_log_resource_id" ON "audit_log" USING btree ("resource","resource_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_actor" ON "audit_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_created_at" ON "audit_log" USING btree ("created_at" DESC NULLS LAST);