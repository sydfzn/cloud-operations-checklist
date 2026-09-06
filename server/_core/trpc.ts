import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import type { AppRole } from "@shared/rbac";
import { hasPermission, normalizeAppRole, type Permission } from "@shared/rbac";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export function roleProcedure(...allowedRoles: AppRole[]) {
  return t.procedure.use(t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || !allowedRoles.includes(normalizeAppRole(ctx.user.role))) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Role required: ${allowedRoles.join(", ")}` });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }));
}

export const operatorProcedure = roleProcedure("admin", "lead", "operator");
export const leadProcedure = roleProcedure("admin", "lead");

export function permissionProcedure(permission: Permission) {
  return t.procedure.use(t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || !hasPermission(normalizeAppRole(ctx.user.role), permission)) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Permission required: ${permission}` });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }));
}

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
