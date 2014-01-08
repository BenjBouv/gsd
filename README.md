gsd
===

gsd is a meta todo list manager that lets you create your own kinds of categorizations and filter through them.

state
===

gsd is under development but it is relatively stable for everyday use. For instance, I locally use it to manage the developments tasks related to gsd, so it's bootstrapped.

install it
===

- ```npm install```
- modify `/server/config.coffee` to put the base URL of your website and change the cookieParser argument to any random string.
- ```npm start```
- GOTO localhost:3000

use it
===

gsd uses tags and two lists.

There are two lists: the **current** one and the list of **archived** todos. When an item is done and reviewed, it should get archived
so that the **current** list remains fast and not too much filled. The archived list serves as a reference for the
future.

Tag your todos (in the body itself) with ```#tag1 #tag2```. A list of tags is shown on the left to retrieve all
todos associated to a given tag. The preference towards tags instead of lists is that you can have several tags for a
single todo, making it possible to reference each todo at several conceptual levels in the same time.

There are a few other pre-implemented tags:

- `@home` marks the todo as having to be AT home to do it. Thus you can separate the possible things to do by the
  position where you're at. You can use any places and places are compiled in the left side list too.
- `p:1` marks the todo as having the priority one. You can use any priorities from 0 to 9. Tasks with priorities can be
  retrieved easily thanks to the left side list and are sorted from 0 to 9.

It is *Allen complete*, i.e. it allows you to implement GTD successfully.

advanced usage
===

The power of GSD is that it allows you to define your own tags. For this, use the Manage Meta-Tags link at the bottom
of the left side section, and play it along.

For instance, if you want to add a `:w` marker that means that a task belongs to the waiting list (i.e. it doesn't have
any actionable thing to do, but is here as a reminder), you do the following:
- Use the name "Waiting List". This name will show up on the left side list.
- Check "Is a switch". That indicates that only the presence of the marker is enough to mark a task as belonging to this
set. If you don't check it, it will work as the Tag marker for instance, i.e. you'll have to add something next to the
marker (and add a captured group in the regular expression).
- The regular expression is used to know whether a task belongs to this marker's set or not. In this case, you can use
  `:w`.
- The query string is the element that's used for querying in the top-left query field. For a switch, it should just be
  the same as the regexp. For a non-switch, it should just be the prefix of the marker (for instance, for #tags, it's
`#`).
- The order is an integer that defines in which order the element is placed in the left column. The closer to 0, the
  more in the top.

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
