#Pickpocket

##Introduction

I hate the fact that my Pocket list grows larger and larger as I keep adding articles (manually as well as automatically via services such as ifttt) just because I have a few busy days and therefore cannot keep up with my list. For me, articles that are not read within a few days typicalls are not read at all. Pickpocket aims to automatically remove these items from the user's list using specific (configurable) criteria. Such criteria are:

 * lifespan (how old must an article be in order to be deleted)
 * source (black-/whitelist certain URLs)
 * tag (black-/whitelist certain tags)
 * favored / not favored

I will probably add other options while the development of Pickpocket advances.


##Tasks

 * :star: implement basic functionality in the main module, this includes:
   * :white_check_mark: authorization
   * automatic deletion via lifespan criteria
   * deployment via `now` or a similar service possible
 * (optional / later) create a CLI that allows Pickpocket to be run via terminal
 * add a killer application image (such as, a hand pickpocketing something from somewhere...)
 * implement delete-by-date feature
 * implement additional features:
    * whitelisting via tag/source/favored
    * ...
