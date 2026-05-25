import {
  ChangeSetType,
  type EntityManager,
  type EventSubscriber,
  type FlushEventArgs,
} from "@mikro-orm/core";

import { AuditLog, AuditOperation } from "./entity/audit-log.js";

/** Auto-bumped on every flush; carry no audit signal. */
const NOISE_FIELDS = new Set(["updatedAt", "version"]);

interface PendingAudit {
  entityName: string;
  entityRef: { id?: number };
  operation: AuditOperation;
  changes: Record<string, unknown>;
}

const toAuditOperation = (type: ChangeSetType): AuditOperation | null => {
  switch (type) {
    case ChangeSetType.CREATE:
      return AuditOperation.Create;
    // UPDATE_EARLY / DELETE_EARLY are MikroORM's ordering variants of UPDATE /
    // DELETE (used when a row must be processed before others). Same entity,
    // just earlier in the flush — not duplicates of the regular types.
    case ChangeSetType.UPDATE:
    case ChangeSetType.UPDATE_EARLY:
      return AuditOperation.Update;
    case ChangeSetType.DELETE:
    case ChangeSetType.DELETE_EARLY:
      return AuditOperation.Delete;
    default:
      return null;
  }
};

/**
 * Writes an AuditLog row for every entity create / update / delete.
 *
 * Two-phase approach:
 *  - onFlush captures changeset metadata into a per-EM buffer (entity ref,
 *    operation, changed fields).
 *  - afterFlush drains the buffer via `em.insert(AuditLog, ...)` — a native
 *    INSERT that bypasses the UoW. By that point the parent INSERT/UPDATE/
 *    DELETE has already run, so auto-increment ids are populated. `em.insert`
 *    respects the EM's transactionContext, so when called inside an outer
 *    `em.transactional(...)` the audit row joins that transaction and
 *    commits/rolls back atomically with the original change.
 *
 * Why not the docs' `em.create() + uow.computeChangeSet()` pattern? It works
 * for UPDATE/DELETE but for CREATE the auto-increment id isn't known during
 * onFlush. The MikroORM docs explicitly warn against `em.flush()` (throws) and
 * `em.persist()` (undefined behavior) inside hooks. `em.insert` is the only
 * native path that sidesteps those constraints.
 */
export class AuditSubscriber implements EventSubscriber {
  // WeakMap keyed by EM so concurrent flushes on different forks don't share state.
  private readonly buffers = new WeakMap<EntityManager, PendingAudit[]>();

  onFlush(args: FlushEventArgs): void {
    const { em, uow } = args;
    let buffer: PendingAudit[] | undefined;

    for (const cs of uow.getChangeSets()) {
      if (cs.entity instanceof AuditLog) continue;

      const operation = toAuditOperation(cs.type);
      if (operation === null) continue;

      let changes: Record<string, unknown> = {};
      if (operation === AuditOperation.Update) {
        for (const [k, v] of Object.entries(cs.payload)) {
          if (!NOISE_FIELDS.has(k)) changes[k] = v;
        }
        if (Object.keys(changes).length === 0) continue;
      } else if (operation === AuditOperation.Create) {
        for (const [k, v] of Object.entries(cs.payload)) {
          if (k !== "version") changes[k] = v;
        }
      }

      if (!buffer) {
        buffer = [];
        this.buffers.set(em, buffer);
      }
      buffer.push({
        entityName: cs.entity.constructor.name,
        entityRef: cs.entity as { id?: number },
        operation,
        changes,
      });
    }
  }

  async afterFlush(args: FlushEventArgs): Promise<void> {
    const buffer = this.buffers.get(args.em);
    if (!buffer || buffer.length === 0) return;
    this.buffers.delete(args.em);

    for (const p of buffer) {
      const entityId = p.entityRef.id;
      if (entityId === undefined) continue;
      const now = new Date();
      await args.em.insert(AuditLog, {
        createdAt: now,
        updatedAt: now,
        version: 1,
        entityName: p.entityName,
        entityId,
        operation: p.operation,
        changes: p.changes,
      } as unknown as AuditLog);
    }
  }
}
