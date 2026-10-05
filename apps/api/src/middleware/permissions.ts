import type { Request, Response, NextFunction } from "express";
import {
  MODULES,
  effectivePermissions,
  type Action,
  type Module,
} from "../lib/permissions";

/**
 * One gate in front of every /api/admin route, deciding from the path which
 * module a request belongs to and from the method what it is trying to do:
 * GET is view, DELETE is delete, anything else is edit.
 *
 * Keeping the map in one place means a new route cannot quietly go unguarded:
 * a path that matches nothing here is Super Admin only until it is added.
 */

type Rule =
  | { module: Module }
  /** Any signed-in staff member — their own profile, counts, notifications. */
  | { anyone: true }
  /** Read by any staff member, written only with the module's permission. */
  | { module: Module; readByAnyone: true }
  | { superOnly: true };

const LISTING_MODULES: Record<string, Module> = {
  lawyer: "lawyers",
  donor: "donors",
  hospital: "hospitals",
};

function ruleFor(path: string): Rule {
  const seg = path.split("/")[1] ?? "";
  switch (seg) {
    case "articles":
      return { module: "articles" };
    case "livetv":
      return { module: "liveTv" };
    case "breaking":
      return { module: "breaking" };
    // The article form, homepage builder and filters all need the list.
    case "categories":
      return { module: "categories", readByAnyone: true };
    case "homepage":
    case "section-articles":
      return { module: "homepage" };
    // The picker inside every form that takes a picture.
    case "media":
      return { module: "media", readByAnyone: true };
    case "epaper":
      return { module: "epaper" };
    case "subscribers":
      return { module: "newsletter" };
    case "seo":
      return { module: "seo" };
    case "settings":
      return { module: "settings" };
    case "lawyers":
      return { module: "lawyers" };
    case "donors":
      return { module: "donors" };
    case "hospitals":
      return { module: "hospitals" };
    case "listings": {
      const m = LISTING_MODULES[path.split("/")[2] ?? ""];
      return m ? { module: m } : { superOnly: true };
    }
    case "comments":
      return { module: "comments" };
    case "analytics":
      return { module: "dashboard" };
    case "ads":
      return { module: "ads" };
    case "me":
    case "my":
    case "notifications":
    case "pending-counts":
      return { anyone: true };
    default:
      return { superOnly: true };
  }
}

function actionFor(method: string): Action {
  if (method === "GET" || method === "HEAD") return "view";
  if (method === "DELETE") return "delete";
  return "edit";
}

const DENIED = "এই কাজের অনুমতি আপনার নেই";

export async function enforcePermissions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  if (user.role === "SUPER_ADMIN") return next();

  const rule = ruleFor(req.path);
  if ("anyone" in rule) return next();
  if ("superOnly" in rule) return res.status(403).json({ error: DENIED });

  const action = actionFor(req.method);
  if ("readByAnyone" in rule && action === "view") return next();

  try {
    const perms = await effectivePermissions(user);

    // Uploading a picture is part of editing whatever it is for, so anyone
    // allowed to edit any module may upload one.
    if (req.method === "POST" && req.path === "/media/upload") {
      if (MODULES.some((m) => perms[m].edit)) return next();
      return res.status(403).json({ error: DENIED });
    }

    if (perms[rule.module][action]) return next();
    res.status(403).json({ error: DENIED, module: rule.module, action });
  } catch (err) {
    next(err);
  }
}
