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
    // UPDATE_EARLY / DELETE_EARLY are MikroORM's ordering variants of UPDATE / DELETE
    // (used when a row must be processed before others, e.g. unique-constraint juggling).
    // They are not duplicates of the regular types — same entity, just earlier in the flush.
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
 * Writes an AuditLog row for every create / update / delete in the EM.
 *
 * We capture changeset data in `onFlush` but defer writing the audit rows to
 * `afterFlush` via a forked EM. Reason: for CREATE rows the entity's
 * auto-increment id isn't assigned until the INSERT runs (mid-flush), and
 * MikroORM forbids re-flushing the same UoW from inside its own flush. A fork
 * gives us a clean UoW to write into. Trade-off: audit rows are written in a
 * separate transaction immediately after — not strictly atomic with the
 * original change, but adequate for a single-user desktop app.
 */
export class AuditSubscriber implements EventSubscriber {
  // WeakMap keyed by the flushing EM so concurrent flushes on different forks
  // never share a buffer. WeakMap because we don't manage EM lifetimes.
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

    // Forked EM so we don't recurse into the same in-progress flush.
    const fork = args.em.fork();
    for (const p of buffer) {
      const entityId = p.entityRef.id;
      if (entityId === undefined) continue;
      fork.persist(
        fork.create(AuditLog, {
          entityName: p.entityName,
          entityId,
          operation: p.operation,
          changes: p.changes,
        } as unknown as AuditLog),
      );
    }
    await fork.flush();
  }
}
