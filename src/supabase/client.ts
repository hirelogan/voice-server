import type { Database } from "../types/db"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

export const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
