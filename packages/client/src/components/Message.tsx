import clsx from 'clsx';
import React from 'react';
import { Letter } from 'react-letter';

import styles from './Message.module.scss';

export interface LetterparserMailbox {
  name?: string;
  address: string;
  raw: string;
}

export interface LetterparserMail {
  subject?: string;
  to?: LetterparserMailbox[];
  cc?: LetterparserMailbox[];
  bcc?: LetterparserMailbox[];
  replyTo?: LetterparserMailbox[];
  date?: string;
  from?: LetterparserMailbox;

  /**
   * HTML email data.
   */
  html?: string;

  /**
   * Plaintext email data.
   */
  text?: string;

  /**
   * AMP for Email data.
   * More information: https://amp.dev/documentation/guides-and-tutorials/learn/email-spec/amp-email-structure/
   */
  amp?: string;
}

interface Props {
  message: LetterparserMail;
}

export const Message: React.FC<Props> = ({ message }) => {
  const recipients = [...(message.to || []), ...(message.cc || [])];
  const date = message.date ? new Date(message.date) : undefined;

  return (
    <div
      className={clsx(styles.message, {
        [styles.plain]: !message.html,
      })}
    >
      <div className={styles.header}>
        <div className={styles.left}>
          <div className={styles.sender}>
            <span className={styles.name}>{message.from?.name}</span>
            <span
              className={styles.address}
            >{`<${message.from?.address}>`}</span>
          </div>
          <div className={styles.recipients}>
            <span>to </span>
            {recipients.map((recipient, i) => (
              <span className={styles.recipient} key={i}>
                {recipient.name || recipient.address}
                {i !== recipients.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.date}>
            {date
              ? date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour12: false,
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : ''}
          </div>
        </div>
      </div>
      <div className={styles.body}>
        {message.html ? (
          <Letter text={message.text} html={message.html} />
        ) : (
          <pre>{message.text}</pre>
        )}
      </div>
    </div>
  );
};
