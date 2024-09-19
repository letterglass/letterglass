import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';

import styles from './App.module.scss';
import { InboxList } from './views/InboxList';
import { Thread } from './views/Thread';
import { ThreadList } from './views/ThreadList';

export const App: React.FC = observer(() => {
  const [path, setPath] = useState<string>();
  const [threadId, setThreadId] = useState<string>();

  return (
    <div className={styles.grid}>
      <InboxList
        selected={path}
        onSelect={path => {
          setPath(path);
          setThreadId(undefined);
        }}
      />
      {!!path && (
        <ThreadList path={path} selected={threadId} onSelect={setThreadId} />
      )}
      {!!path && typeof threadId === 'string' && (
        <Thread path={path} threadId={threadId} />
      )}
    </div>
  );
});
