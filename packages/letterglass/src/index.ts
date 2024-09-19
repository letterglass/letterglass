import { resolve } from 'path';

import { initTRPC } from '@trpc/server';
import * as dotenv from 'dotenv-flow';
import { ImapFlow, MailboxLockObject, MailboxObject } from 'imapflow';
import { extract, extractHeaders, LetterparserMail } from 'letterparser';
import { z } from 'zod';

dotenv.config({
  path: resolve('../../'),
});

const client = new ImapFlow({
  host: 'imap.gmail.com',
  port: 993,
  secure: true,
  auth: {
    user: process.env.TEST_GMAIL_USER!,
    accessToken: process.env.TEST_GMAIL_TOKEN,
  },
});
client.connect();

export interface TRPCContext {
  nothing?: boolean;
}

export type Mail = { uid: number } & LetterparserMail;

export const t = initTRPC.context<TRPCContext>().create();

let lastLock: MailboxLockObject | undefined = undefined;

async function selectMailbox(path: string): Promise<MailboxObject> {
  if (typeof client.mailbox !== 'object' || client.mailbox.path !== path) {
    console.log('new mailbox path');
    if (lastLock) {
      console.log('changed, releasing');
      lastLock.release();
    }
    lastLock = await client.getMailboxLock(path);
  }

  if (typeof client.mailbox !== 'object') {
    throw new Error('Unable to open mailbox');
  }

  return client.mailbox;
}

export const router = t.router({
  inboxes: {
    all: t.procedure.query(async () => {
      const inboxes = await client.list();
      return inboxes.map(inbox => ({
        path: inbox.path,
      }));
    }),
  },
  threads: {
    all: t.procedure
      .input(
        z.object({
          path: z.string(),
        }),
      )
      .query(async ({ input: { path } }) => {
        const mailbox = await selectMailbox(path);
        const last = mailbox.exists;
        if (!last) {
          return [];
        }

        const allMessages = await client.fetchAll(`1:*`, {
          uid: true,
          threadId: true,
        });

        const threads: Record<string, number[]> = {};
        const unsorted: number[] = [];

        for (const message of allMessages) {
          const { threadId, uid } = message;
          if (threadId) {
            if (threads[threadId]) {
              threads[threadId].push(uid);
            } else {
              threads[threadId] = [uid];
            }
          } else {
            unsorted.push(uid);
          }
        }

        const toFetch: {
          threadId?: string;
          subject?: string;
          uids: number[];
        }[] = [];
        for (const threadId of Object.keys(threads)) {
          toFetch.push({
            threadId,
            uids: threads[threadId].sort((a, b) => a - b),
          });
        }
        for (const uid of unsorted) {
          toFetch.push({
            uids: [uid],
          });
        }
        // Sort by highest UID
        toFetch.sort(
          (a, b) => b.uids[b.uids.length - 1] - a.uids[a.uids.length - 1],
        );
        const paginated = toFetch.slice(0, 50);

        const messages = await client.fetchAll(
          `${paginated.map(item => item.uids[0]).join(',')}`,
          {
            uid: true,
            headers: true,
          },
          { uid: true },
        );

        for (const message of messages) {
          const item = paginated.find(item => item.uids.includes(message.uid));
          if (item) {
            const extracted = extractHeaders(message.headers.toString('utf8'));
            item.subject = extracted.subject;
          }
        }

        return paginated;
      }),
    get: t.procedure
      .input(
        z.object({
          path: z.string(),
          threadId: z.string(),
        }),
      )
      .query(async ({ input: { path, threadId } }) => {
        await selectMailbox(path);
        const uids = await client.search(
          { threadId },
          {
            uid: true,
          },
        );

        const messages = await client.fetchAll(
          `${uids.join(',')}`,
          {
            uid: true,
            source: true,
          },
          { uid: true },
        );

        return messages.map(message => ({
          uid: message.uid,
          ...extract(message.source.toString('utf8')),
        })) as Mail[];
      }),
  },
  messages: {
    all: t.procedure
      .input(
        z.object({
          path: z.string(),
        }),
      )
      .query(async ({ input: { path } }) => {
        const mailbox = await selectMailbox(path);
        const last = mailbox.exists;
        if (!last) {
          return [];
        }

        const end = last;
        const start = Math.max(1, end - 50);
        const messages = await client.fetchAll(`${start}:${end}`, {
          uid: true,
          headers: true,
        });

        return messages.reverse().map(message => {
          const extracted = extractHeaders(message.headers.toString('utf8'));

          return {
            uid: message.uid,
            ...extracted,
          };
        }) as Mail[];
      }),
    get: t.procedure
      .input(
        z.object({
          path: z.string(),
          uid: z.number(),
        }),
      )
      .query(async ({ input: { path, uid } }) => {
        await selectMailbox(path);
        const messages = await client.fetchAll(
          `${uid}`,
          {
            uid: true,
            source: true,
          },
          { uid: true },
        );

        if (!messages[0]) {
          throw new Error('Message not found');
        }

        return {
          uid: messages[0].uid,
          ...extract(messages[0].source.toString('utf8')),
        } as Mail;
      }),
  },
});

export type Router = typeof router;
