import React from 'react';

import { TRPC } from '$api';
import { Message } from '$components/Message';
import styles from './Thread.module.scss';

interface Props {
  path: string;
  threadId: string;
}

export const Thread: React.FC<Props> = ({ path, threadId }) => {
  const threadQuery = TRPC.threads.get.useQuery({ path, threadId });

  if (!threadQuery.data) {
    return 'Loading...';
  }

  return (
    <div className={styles.thread}>
      {threadQuery.data.map(message => (
        <Message message={message} key={message.uid} />
      ))}
    </div>
  );
};
