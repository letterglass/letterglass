import clsx from 'clsx';
import React from 'react';

import { TRPC } from '$api';
import styles from './ThreadList.module.scss';

interface Props {
  path: string;
  selected?: string;
  onSelect?: (uid: string) => void;
}

export const ThreadList: React.FC<Props> = ({ path, selected, onSelect }) => {
  const threadsQuery = TRPC.threads.all.useQuery({ path });

  if (!threadsQuery.data) {
    return 'Loading...';
  }

  return (
    <ul className={styles.list}>
      {threadsQuery.data?.map(item => (
        <li
          role="button"
          key={item.threadId}
          className={clsx(styles.item, {
            [styles.selected]: selected === item.threadId,
          })}
          onClick={() => onSelect?.(item.threadId!)}
        >
          {item.subject}
        </li>
      ))}
    </ul>
  );
};
