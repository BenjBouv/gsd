gsd
===

gsd is another todo-list management that limits features to spend the least amount of time in the program itself.

state
===

gsd is under development but it is relatively stable for everyday use. For instance, I locally use it to manage the developments tasks related to gsd, so it's bootstrapped.

install it
===

- ```npm install```
- ```npm start```
- modify `/server/config.coffee` to put the audience of your website and change the cookieParser argument to any random string.
- GOTO localhost:3000

use it
===

gsd uses tags and two lists.

There are two lists: the **current** one and the list of **archived** todos. When an item is done and reviewed, it should get archived
so that the **current** list remains fast and not too empty. The archived list serves as a reference.

Tag your todos (in the body itself) with ```#tag1 #tag2``` to tag them. A list of tags is shown in the left to retrieve all
todos associated to a given tag. The preference towards tags instead of lists is that you can have several tags for a
single todo, making it possible to reference each todo at several conceptual levels in the same time.

There are a few other pre-implemented tags:

- `:w` marks a todo as "Waiting For" (something), which means it can't be done now as it's waiting for some external
  input before. This way, you can separate the next actionnable things from the things that are stuck by something you
don't have control on.
- `@home` marks the todo as having to be AT home to do it. Thus you can separate the possible things to do by the
  position where you're at. You can use any places and places are compiled in the left side list too.
- `p:1` marks the todo as having the priority one. You can use any priorities from 0 to 9. Tasks with priorities can be
  retrieved easily thanks to the left side list and are sorted from 0 to 9.

It is *Allen complete*, i.e. it allows you to implement GTD successfully.

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
