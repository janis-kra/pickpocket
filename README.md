#Pickpocket

##Introduction

I hate the fact that my Pocket list grows larger and larger as I keep adding articles (manually as well as automatically via services such as ifttt) just because I have one or more busy days and therefore cannot keep up with my list. Pickpocket aims to automatically remove unread items matching specific (configurable) criteria from the user's list in order to retain a slim list. Such criteria are:

 * lifespan (how old must an article be in order to be deleted)
 * source (black-/whitelist certain URLs)
 * tag (black-/whitelist certain tags) 
 * favored / not favored

I will probably add other options while the development of Pickpocket advances.

##Usage

node pickpocket.js *deletion-threshold*  

Where the deletion threshold is the age (in days) that your items must reach in order to be deleted by Pickpocket.

###Examples

Delete everything older than a year:
>*node pickpocket.js 365*  

Never delete anything:
>*node pickpocket.js 0*  

##Dependencies

 * [open](https://github.com/jjrdn/node-open)

##Tasks

 * add a killer application image (such as, a hand pickpocketing something from somewhere...)
 * implement delete-by-date feature
 * implement additional features:
    * whitelisting via tag/source/favored
    * more to come (probably)