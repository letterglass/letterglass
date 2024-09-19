import clsx from 'clsx';
import React from 'react';

import { TRPC } from '$api';
import styles from './MessageList.module.scss';

interface Props {
  path: string;
  selected?: number;
  onSelect?: (uid: number) => void;
}

export const MessageList: React.FC<Props> = ({ path, selected, onSelect }) => {
  const messagesQuery = TRPC.messages.all.useQuery({ path });

  if (!messagesQuery.data) {
    return 'Loading...';
  }

  return (
    <ul className={styles.list}>
      {messagesQuery.data?.map(item => (
        <li
          role="button"
          key={item.uid}
          className={clsx(styles.item, {
            [styles.selected]: selected === item.uid,
          })}
          onClick={() => onSelect?.(item.uid)}
        >
          {item.uid} - {item.subject}
        </li>
      ))}
    </ul>
  );
};
