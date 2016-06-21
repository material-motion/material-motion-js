#!/usr/bin/env python
#
# Copyright 2016 The Material Motion Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

'''
Doing the minimum possible to pass the current host:port combo to container.html

Normally, I'd do this with cherrypy, but I'm using webapp2 to avoid adding
dependencies just to serve an HTML file with a string replaced.

Based heavily on https://cloud.google.com/appengine/docs/python/gettingstartedpython27/generating-dynamic-content-templates#using_jinja2_templates
'''

import webapp2
import jinja2
import os

JINJA_ENVIRONMENT = jinja2.Environment(
  loader = jinja2.FileSystemLoader(os.path.dirname(__file__)),
  extensions = ['jinja2.ext.autoescape'],
  autoescape = True,
)

IS_LOCAL = os.getenv('SERVER_SOFTWARE', '').startswith('Development')

class ContainerServer(webapp2.RequestHandler):
  def get(self, *args):
    template = JINJA_ENVIRONMENT.get_template('container.html')
    self.response.write(
      template.render(
        {
          # webpack-dev-server will only serve from one path, even if it can build
          # to many.  The compiled material-motion.js is in dist to make it easy
          # for consumers to find.  To avoid cluttering that folder, the other JS
          # files are in static.
          #
          # Therefore, we have two constants, one for DIST and one for STATIC.
          # https://github.com/webpack/webpack-dev-server/issues/150
          "STATIC_JS_PATH": 'http://localhost:8081/' if IS_LOCAL else '/static/',
          "DIST_JS_PATH": 'http://localhost:8081/' if IS_LOCAL else '/dist/',
        }
      )
    )

app = webapp2.WSGIApplication(
  [
    ('(.*)/', ContainerServer)
  ],
  debug = IS_LOCAL
)
