# Contributing

## What should I know before I get started?

### Will the backend be open sourced?

***The short answer is no***. We originally intended for open source
contributions to help develop the ***offline*** tools, but anything related to
the backend will be confidential. We will not provide documentation of our api
or anything related.

### Design Decisions

We will make design decisions for major features internally. There are many
things to consider such as UI/UX and backend logistics. We'll always try our
best to hear out the community, but at the end of the day we'll call the shots.
Major changes to the application, especially ones that don't belong on our road
map will more than likely be rejected. We will try our best to keep an updated
roadmap.



## Development Guidelines

### Make the Branch Descriptive

Please use industry conventions for naming branches. Group tokens are a great
way to make your PR more descriptive. Here are some examples:

Here are some recommend group tokens:
* `bug/<description>` - fix a bug
* `feat/<description>` - add a feature
* `update/<description>` - update anything (general use)

### Follow Conventions

It's important that you follow the conventions set aside in the code. Specific
organization styles are intended to keep the project maintainable and scalable.
This includes things from file organization, module decoupling, to even small
pieces such as import statements and parameter orders. Important concepts such
as data stores, portals, and other rendering framework-related knowledge will
definitely help you here.

### Performance and Optimization

One of our major priorities is making sure that build size stays minimal. Any
noticeable hits to performance, be it build size or cpu usage, will be more
heavily reviewed.

### Fixing Bugs and Minor Optimizations

We're always busy planning out new features. Obscure bugs that we're not
already trying to squash or minor optimizations will have the highest
chance of being approved for merge.

## How Can I Contribute

### Check for Duplicates

Does a bug report or enhancement already have an issue created? Great! Stop there.

### Reporting Bugs

#### How Do I Submit A Good Bug Report

* Use a clear and descriptive title for the problem. The more words there are,
the better.

* Describe the exact steps to reproduce the problem; link attachments if
necessary.

* Explain the behavior you observed, and try to provide a possible explanation
if you can.

* Mention the version of the application or the commit id that this bug
occured on.


### Suggesting Enhancements

* Thoroughly describe your enhancement and how the application can benefit from
it.

* Provide clear use cases. If you can mock it up, even better. Try to cover
edge cases like errors encountered along the way and how to deal with them.
