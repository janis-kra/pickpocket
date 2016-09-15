#Pickpocket

##Introduction

I hate the fact that my Pocket list grows larger and larger as I keep adding articles (manually as well as automatically via services such as ifttt) just because I have a few busy days and therefore cannot keep up with my list. For me, articles that are not read within a few days typicalls are not read at all. Pickpocket aims to automatically remove these items from the user's list using specific (configurable) criteria. Such criteria are:

 * lifespan (how old must an article be in order to be deleted)
 * source (black-/whitelist certain URLs)
 * tag (black-/whitelist certain tags)
 * favored / not favored

I will probably add other options while the development of Pickpocket advances.

### Undo feature

If pickpocket archived an item *foo* that you are totally gonna read sometime in the future - no problem. In any pocket app, go to your archive and re-add it. Also, the item will not be archived by pickpocket again in the near future, because the `time_added` for *foo* is now automatically set to the current time (not the one it was originally added on).

##Tasks

 * :star: implement basic functionality in the main module, this includes:
   * :white_check_mark: authorization
   * :white_check_mark: archive via lifespan criteria
 * (optional / later) create a CLI that allows Pickpocket to be run via terminal
   * deployment via `now` or a similar service possible
 * add a killer application image (such as, a hand pickpocketing something from somewhere...)
 * :white_check_mark: implement delete-by-date feature
 * implement additional features:
    * whitelisting via tag/source/favored
    * ...
