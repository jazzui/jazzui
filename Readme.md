![logo](/logo-name-full.png)

### Does your favorite mock-up tool output production ready code?
**Of course not,** that would take way too much time / effort! That's why we make mockups, so we can iterate quickly...

JazzUI makes it easier to get into the flexibility and precision of html/css while maintaining the quick iterative features of a traditional mockup tool. Plus more awesome.

![Main screenshot](/docs/screenshot.png)

## Where's the magic?

- jade = more concise html
- lesscss = more concise/flexible css
- angular = make everything awesome; poweful interaction
- bootstrap = pretty components w/o effort
- easily and succintly generate fixture data
- and *everything updates live*
- exports jade, less, and javascript files, ready to flesh out into the full-fledged app
- oh, and everything's in the browser. No server required.

## Does your favorite tool do:

### color variables?
Thanks to less, with the right setup you can re-theme the entire mockup with a single change. And the integrated HSV color picker makes doing so a breeze.

### rich interaction?
This is the big one that got me started on this project. There are a lot of great mockup tools out there for making something that *looks* a lot like what you have in your head, but without interaction, there's no way to know how it *feels* without scrapping your mockup and getting into code. Thanks to angular's rich directives and the power of CSS3, you can get far closer to the real look and feel of your final product, and JazzUI lets you see the results in real-time.

### flexible fixture generation?
How many times have you copy/pasted lorem ipsum text? Yeah, I have too. I created a library I call [xon](https://github.com/jaredly/xon) (fiXture Object Notation) that can dynamically generate anything from placeholder images to lists of objects (think mock server data) to lorem ipsum itself.

### can I say too much about html, css, and javascript?
Css is really well suited to styling things (and lesscss even more so); have you ever gone through your entire mockup, trying out a new "look" for your buttons? What would it look like with a little gradient, a dropshadow, and a different font?

Also, bootstrap 3 is built in, allowing you to go from zero to something that looks decent without much effort. But here again, you're not locked in to a particular look and feel; You can override the styles of anything with ease.

### painless collaboration / demoing?
Ok, so I don't have real-time collaboration yet =) but if you host it yourself, JazzUI has an "online" mode where everything syncs to a mongodb server, allowing for easy sharing of prototypes. And then you can demo from anywhere.

# Next Steps

## Things I want to implement

- allow the creation of angular directives w/ templates
- have multiple "templates" from which to start your prototype, that you can choose from on creation. Bootstrap has a few, and there could be more
- highlight nodes; you ctrl-click somewhere in the jade file, and it is highlighted in the preview
- "style this"; when editing the jade file, have some shortcut to take you right into less, styling that node. This would require a dropdown w/ choices of "what selector combination do you want". I think it would come in handy, though.
- [firebase](https://www.firebase.com/) integration? That could get really cool really fast
- edit files on your machine; that way you could export the prototype, start fleshing it out as a real app, but still jump back into JazzUI for new UI developments. Maybe using [node-webkit](https://github.com/rogerwang/node-webkit)

## Lower priority

- user management for the online version; right now everything is public
- export to a single html file -- this might require a server for the component(1) bundling.. or some gymnastics
- support for other frameworks; purecss, zurb foundation, semantic-ui, etc
- real-time collaboration would be cool, but I don't know how practical
- a bootstrap theme that feels more mockup-like; bolder lines, just shades of grey...

## Things other people might want

- stylus support (I actually started in stylus, but there's no easy-to-grab browser version)
- sass support; here again I ran into not-in-browser issues.
- coffeescript
- ??? let me know in the github issues, or even better Fork and Pull Request

## More Screenshots

### Demo mode

![demo screenshot](/docs/demo-screenshot.png)









