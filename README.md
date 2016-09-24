#Pickpocket

##Introduction

I hate the fact that my Pocket list grows larger and larger as I keep adding articles (manually as well as automatically via services such as ifttt) just because I have a few busy days and therefore cannot keep up with my list. For me, articles that are not read within a few days typicalls are not read at all. Pickpocket aims to automatically remove these items from the user's list using specific (configurable) criteria. Such criteria are:

 * lifespan (how old must an article be in order to be deleted)
 * source (black-/whitelist certain URLs)
 * tag (black-/whitelist certain tags)
 * favored / not favored

I will probably add other options while the development of Pickpocket advances.

### Undo archiving

If pickpocket archived an item *foo* that you are totally gonna read sometime in the future - no problem. In any pocket app, go to your archive and re-add it. Also, the item will not be archived by pickpocket again in the near future, because the `time_added` for *foo* is now automatically set to the current time (not the one it was originally added on).

## features

 * authorization via `authorize` function
 * archive overdue articles via lifespan and favorited / non-favorited criteria
  * adds a dedicated *archived by pickpocket* tag to items that are archived by pickpocket (this way you have an immediate feedback that pickpocket is poking around in your pocket account)

## todo

 * whitelisting via tag
 * whitelisting via source

## see also

 * [pickpocket-cli](https://github.com/janis-kra/pickpocket-cli) that allows Pickpocket to be run via terminal
 * [pickpocket-webservice](https://github.com/janis-kra/pickpocket-webservice) that allows Pickpocket to be deployed as a REST-webservice
