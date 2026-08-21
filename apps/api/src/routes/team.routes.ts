import bcrypt from "bcryptjs";
import { Router } from "express";
import { asyncRoute, HttpError } from "../http";
import { query, transaction } from "../database/pool";

export const teamRouter = Router();
const roles = new Set(["admin", "member", "accountant"]);

function authorize(role?: string) {
  if (role !== "owner" && role !== "admin") throw new HttpError(403, "Only owners and admins can manage team members");
}

teamRouter.get("/", asyncRoute(async (req, res) => {
  const rows = await query<Record<string, unknown>>(
    `SELECT u.id,u.name,u.email,m.role,m.permissions,m.created_at
     FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.business_id=$1 ORDER BY m.created_at`,
    [req.auth!.businessId],
  );
  res.json({ success: true, data: rows });
}));

teamRouter.post("/", asyncRoute(async (req, res) => {
  authorize(req.auth!.role);
  const { name, email, password, role = "member" } = req.body;
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) throw new HttpError(400, "Name, email, and an 8-character temporary password are required");
  if (!roles.has(role)) throw new HttpError(400, "Invalid team role");
  const member = await transaction(async (client) => {
    const normalizedEmail = email.trim().toLowerCase();
    let user = (await client.query("SELECT id,name,email FROM users WHERE email=$1", [normalizedEmail])).rows[0];
    if (!user) user = (await client.query(
      "INSERT INTO users (name,email,password_hash,email_verified_at) VALUES ($1,$2,$3,now()) RETURNING id,name,email",
      [name.trim(), normalizedEmail, await bcrypt.hash(password, 12)],
    )).rows[0];
    const membership = await client.query(
      `INSERT INTO memberships (business_id,user_id,role) VALUES ($1,$2,$3)
       ON CONFLICT (business_id,user_id) DO NOTHING RETURNING role,permissions,created_at`,
      [req.auth!.businessId, user.id, role],
    );
    if (!membership.rows[0]) throw new HttpError(409, "This user already belongs to the business");
    return { ...user, ...membership.rows[0] };
  });
  res.status(201).json({ success: true, message: "Team member added", data: member });
}));

teamRouter.patch("/:userId", asyncRoute(async (req, res) => {
  authorize(req.auth!.role);
  const { name, role } = req.body;
  if (!name?.trim() || !roles.has(role)) throw new HttpError(400, "Name and a valid role are required");
  const rows = await transaction(async (client) => {
    const membership = await client.query(
      `UPDATE memberships SET role=$1 WHERE business_id=$2 AND user_id=$3 AND role!='owner' RETURNING user_id,role,permissions,created_at`,
      [role, req.auth!.businessId, req.params.userId],
    );
    if (!membership.rows[0]) throw new HttpError(404, "Editable team member not found");
    const user = await client.query("UPDATE users SET name=$1,updated_at=now() WHERE id=$2 RETURNING id,name,email", [name.trim(), req.params.userId]);
    return { ...user.rows[0], ...membership.rows[0] };
  });
  res.json({ success: true, message: "Team member updated", data: rows });
}));
