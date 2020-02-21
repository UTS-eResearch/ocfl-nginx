Changelog
=========

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased / 1.3.0] - 

- reinstated solr index as a configurable option
- fixed bug in which spaces in ids passed to solr were not being escaped correctly
- added ocfl_allow variable to control what sort of files are served
- added ocfl_referrer variable to lock down responses when called outside an iframe

## [1.2.0] - 2020-02-05

- Fixed bug which affected OCFL objects with multiple copies of the same file
- Added autoindex feature which allows directory-like views of contents of a path

## [1.1.3] - 2019-11-11

- Moved the licence query filter onto the solr proxy endpoint

## [1.1.2] - 2019-11-04

- Moved solr index feature into the master branch

## [1.1.0] - 2019-09-06

- Beta version of solr index

## [1.0.5] - 2019-08-16

- Allows switching versioning off so that only HEAD is served

## [1.0.4] - 2019-08-16

- Stable pairtree-only version
