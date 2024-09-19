import React from 'react';

import { TRPC } from '$api';
import { Message } from '$components/Message';
import styles from './MessageView.module.scss';

interface Props {
  path: string;
  uid: number;
}

export const MessageView: React.FC<Props> = ({ path, uid }) => {
  const messageQuery = TRPC.messages.get.useQuery({ path, uid });

  if (!messageQuery.data) {
    return 'Loading...';
  }

  return (
    <div className={styles.messageView}>
      <Message message={messageQuery.data} />
    </div>
  );
};
