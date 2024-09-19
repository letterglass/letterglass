# letterglass

Work-in-progress IMAP/JMAP/SMTP email client written in React.js.

## Running

During the development phase only Gmail's OAuth2 authentication is supported.

Create an `.env.local` file in the root directory of this project with the following contents:

```
TEST_GMAIL_USER=user@gmail.com
TEST_GMAIL_TOKEN=token
```

You will need to obtain the token manually.
