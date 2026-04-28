import { getDbConnection } from "./db";

export async function getPriceId(email: string) {
  const sql = await getDbConnection();
  const query = await sql`
    SELECT price_id FROM users WHERE email = ${email} AND status = 'active'
  `;
  return query?.[0]?.price_id || null;
}

export async function getOrCreateDbUserId({
  clerkUserId,
  email,
  fullName,
}: {
  clerkUserId: string;
  email: string;
  fullName?: string;
}) {
  const sql = await getDbConnection();

  const [user] = await sql`
    INSERT INTO users (email, full_name, customer_id, status)
    VALUES (${email}, ${fullName}, ${clerkUserId}, 'active')
    ON CONFLICT (email)
    DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id;
  `;

  return user.id; // ✅ UUID
}