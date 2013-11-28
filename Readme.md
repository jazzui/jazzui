
# Not your average prototypes

- Does your favorite mock-up tool output production ready code?
- Of course not, that would take way too much time / effort! That's why we make mockups, so we can iterate quickly...

JazzUI makes it easier to get into the flexibility and precision of html/css while still maintaining the quick iterative features of a traditional mockup tool. Plus more awesome.

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
Thanks to less, with the right setup you can the entire mockup with one change. And the integrated HSV color picker makes doing so a breeze.

### rich interaction?
This is the big one that got me started on this project. There are a lot of great mockup tools out there for making something that looks a lot like what you have in your head, but without interaction, there's no way to know how it *feels* without scrapping your mockup and getting into code. Thanks to angular's rich directives, and the power of CSS3, you can get far closer to the real look and feel of your final product, and JazzUI lets you see the results in real-time.

### flexible fixture generation?
How many times have you copy/pasted lorem ipsum text? Yeah, I have too. I created a library I call [xon](https://github.com/jaredly/xon) (fiXture Object Notation) that can dynamically generate anything from placeholder images to lists of objects (think mock server data) to lorem ipsum itself.

### can I say too much about html, css, and javascript?
Css is really well suited to styling things (and lesscss even more so); have you ever gone through your entire mockup, trying out a new "look" for your buttons? What would it look like with a little gradient, a dropshadow, and a different font?

Bootstrap is built in, allowing you to go from zero to something that looks decent without much effort. But here again, you're not locked in to a particular look and feel; You can override the styles of anything with ease.

### painless collaboration / demoing?
Ok, so I don't have real-time collaboration yet =) but if you host it yourself, JazzUI has an "online" mode where everything syncs to a mongodb server, allowing for easy sharing of prototypes. And then you can demo from anywhere.













