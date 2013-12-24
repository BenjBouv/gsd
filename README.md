gsd
===

gsd is another todo-list management that limits features to spend the least amount of time in the system.

state
===

gsd is under development but it is relatively stable for everyday use. For instance, I locally use it to manage the developments tasks related to gsd, so it's bootstrapped.

install it
===

- ```npm install```
- ```npm start```
- yep, that's all
- GOTO localhost:3000

use it
===

gsd uses tags and two lists.

There are two lists: the **current** one and the list of **archived** todos. When an item is done and reviewed, it should get archived
so that the **current** list remains fast.

Tag your todos (in the body itself) with ```@tag1 @tag2``` to tag them. A list of tags is shown in the left to retrieve all
todos associated to a given tag. The preference towards tags instead of lists is that you can have several tags for a
single todo, making it possible to reference each todo at several conceptual levels in the same time.

gsd is a recursive acronym for "go back to work and stop spending so much time on your todo-list system". It is
*Allen complete*, i.e. it allows you to implement GTD successfully (by using "NextAction" tags, priority tags, location
tags, and so on).

participate
===

- Fork
- (facultative) Create an issue to discuss the topic of your proposed work
- Create a branch on your repo with your improvements
- Pull request
- Get rich and famous

licence
===

MIT License.

(c) Benjamin Bouvier 2013
