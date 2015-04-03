#TODO

1. **Fix socket.io stuff**. Tried to move into singleton but now isn't working. Look
into using express middleware to tie to sessions. This will eventually need to
be in some type of socket.io redis store so that notifications servers can scale
2. **User Creation**
  1. Create the user
  2. Create the account, tie to user
  3. Create the default group, tie to user, tie to account
3. **Group display in UI** - Search for groups by {$in: {user.groups}}
4. **Add callout to create first binger**
5. **Pingers** Start roughing out structure for autonomous, auto-scaling servers
this is going to be ugly [ICMP, HTTP, HTTPS, SMTP, IMAP, POP, FTP, DNS]
6. **Pinger Options**
  1. *HTTP* - Port, Username/Password, Root, Compare String
  2. *HTTPS* - Same as HTTP
  3. *ALL* - Check interval (slider)
7. **Confirm popus in ui**
  1. Confirm delete ASAP ... duh
