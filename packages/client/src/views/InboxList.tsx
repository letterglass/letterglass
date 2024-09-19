import clsx from 'clsx';
import React from 'react';

import { TRPC } from '$api';
import styles from './InboxList.module.scss';

interface Props {
  selected?: string;
  onSelect?: (path: string) => void;
}

export const InboxList: React.FC<Props> = ({ selected, onSelect }) => {
  const inboxesQuery = TRPC.inboxes.all.useQuery();

  if (!inboxesQuery.data) {
    return 'Loading...';
  }

  return (
    <ul className={styles.list}>
      {inboxesQuery.data?.map(item => (
        <li
          role="button"
          key={item.path}
          className={clsx(styles.item, {
            [styles.selected]: selected === item.path,
          })}
          onClick={() => onSelect?.(item.path)}
        >
          {item.path}
        </li>
      ))}
    </ul>
  );
};
