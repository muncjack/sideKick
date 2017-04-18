# sideKick
git backed markdown wiki


About:
======

The idea:
--------
Run a micro wiki service on your workstation with the content stored in a git repository, with a remote repo as the master (the master can even be on github).

Why:
---
This tool was created make my life better as a sysadmin. The main problem Sysadmins have is documentation.

When you are in the thick of it you need a simple way to document all that is done. In some case the management what to see the documentation, in a lot of cases sysadmin will have a directory full of text file and scripts. Than provided you all the information needed, but the management wants you to have a loads of word documents *(they get out of sync very quickly)*. The first (text file) is easy to search the second is heavy and slow and work can cut and pasting.

This tool bridges the gap, you write all the documentation in text and it looks great without to much work. **The second advantage** is the the content is under version control and a copy is stored locally so you always have a copy when your servers are down. This means that if you have a remote data center you can take the documentation with you even update on the fly.


Status:
-------
* to be done
>+ view edit history of a file
>+ a gui tool to links to documents with in the wiki
>+ a gui tool for managing attachements 
>+ the ability to delete documents
>+ document rename

* completed so far
>+ created basic interface
>+ choose markdown engine (javascript marked)
>+ document tree view side panel
>+ able to load a file into the view and edit it
>+ git support pull push commit ......
>+ the ability to save documents
>+ the ability to create documents

+ Nice to have in the future
>+ IP range management
>+ password managment
>+ code key words highlighting


