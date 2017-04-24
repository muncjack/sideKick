#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
SideKick Wiki by Peder Pedersen

Main python file - run this to run the wiki server
"""

from __future__ import print_function
import os

from flask import Flask, render_template, request, jsonify, send_from_directory

import wiki

__author__ = 'Peder Pedersen'

app = Flask(__name__)
# don't let flask use all the systems memory limit max file size to 16MB
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024


# Regular flask view function - Sijax is unavailable here
@app.route("/")
def index():
    app.logger.debug("DEBUG ----> ")
    parameters = {'pagemode': 'wiki'}
    if 'pagemode' in request.args:
        parameters = request.args
        if 'attachment' in request.args:
            # this is the part that outputs the attachment
            # blob = webapp.fileDownload(fileid)
            # mimetype = 'application/octet-stream'
            # response = make_response(blob)
            # print(response)
            # response.headers["Content-Disposition"] = "attachment; filename=data.tar"
            # return responce
            (l, f) = wiki.attachmentGet(parameters['filePath'], parameters['fileName'], parameters['attachment'])
            return send_from_directory(l, f)
    app.logger.debug(parameters)
    return render_template('index.html', parameters=parameters)


@app.route("/body/<bname>")
def bodyGet(bname):
    return render_template('body-' + bname + '.html')


@app.route("/wiki/GetFolder", methods=['GET', 'POST'])
def GetFolder():
    if 'application/json' in request.headers['Content-Type']:
        app.logger.debug("requesting --> " + request.json['path'])
        return jsonify(wiki.GetFolderContent(request.json['path']))
    else:
        return "415 Unsupported Media Type ;) ......."


@app.route("/wiki/fileRename", methods=['GET', 'POST'])
def wikiFileRename():
    app.logger.debug("header is :" + request.headers['Content-Type'])
    if 'application/json' in request.headers['Content-Type']:
        wiki.fileRename(request.json)
    return ""


@app.route("/wiki/GetFileJ", methods=['GET', 'POST'])
def wikiGetFileJ():
    result = []
    app.logger.debug("starting wikiGetFile")
    app.logger.debug(request.json)
    result = request.json
    app.logger.debug(jsonify(result))
    resp = jsonify(result)
    if result['filePath'] != '' or result['fileName'] != '':
        app.logger.debug("Get file blob")
        app.logger.debug(result)
        result['blob'] = wiki.GetFile(result['filePath'], result['fileName'])
        resp = jsonify(result)
        resp.status_code = 200
    else:
        resp.status_code = 500
    app.logger.debug(resp)
    return resp


@app.route('/wiki/updateFile', methods=['POST'])
def WikiUpdateFile():
    app.logger.debug("header is :" + request.headers['Content-Type'])
    #    if request.headers['Content-Type'] == 'application/json':
    if 'application/json' in request.headers['Content-Type']:
        app.logger.debug("we have a file to save :-)")
        app.logger.debug(request.json)
        p = request.json['path']
        f = request.json['file']
        b = request.json['blob']
        app.logger.debug("calling wiki save function")
        wiki.saveFile(p, f, b)
        resp = jsonify({'status': 'OK'})
        resp.status_code = 200
        return resp
    else:
        return "415 Unsupported Media Type ;) ......."


@app.route('/wiki/search', methods=['POST'])
def WikiSearch():
    result = []
    app.logger.debug("Wiki search starting")
    app.logger.debug("header is :" + request.headers['Content-Type'])
    app.logger.debug(request.json)
    if 'application/json' in request.headers['Content-Type']:
        files = wiki.fileSearch(request.json['searchStr'])
        result = {'status': 'OK'}
        result['filelist'] = files
        app.logger.debug(result)
        return jsonify(result)
    else:
        return "415 Unsupported Media Type ;) ......."


@app.route('/wiki/GetAttachement', methods=['POST'])
def WikiGetAttachements():
    
    return "To Be implemented"


@app.route('/wiki/PutAttachement', methods=['POST'])
def WikiPutAttachements():
    return "To Be implemented"
    # this is just a place holder


@app.route('/wiki/fileDelete', methods=['POST'])
def WikiFileDelete():
    resp = jsonify({'status': 'Fail', 'messages': 'missing patameter'})
    if request.json['path'] != '' and request.json['file'] != '':
        result = wiki.fileDel(request.json['path'], request.json['file'])
        if result == '':
            resp = jsonify({'status': 'OK'})
        else:
            resp = jsonify({'status': 'ERROR', 'message': result})
    return resp


@app.route('/wiki/git', methods=['POST'])
def WikiGit():
    resp = {}
    # print(request.headers)
    if 'application/json' in request.headers['Content-Type']:
        app.logger.debug("git requesting --> ")
        if 'status' == request.json['action']:
            resp = wiki.gitStatus()
            return jsonify(resp)
        elif request.json['action'] == 'pull':
            resp = wiki.gitPull()
        elif request.json['action'] == 'commit all':
            resp = wiki.gitAddCommitAll(request.json['msg'])
        elif request.json['action'] == 'push':
            resp = wiki.gitPush()
        else:
            return "500 Mssing param ;-) ......."
    else:
        return "415 Unsupported Media Type ;-) ......."
    return jsonify(resp)

if __name__ == '__main__':
    # get the wiki to do it's start-up/setup
    if 'HOME' in os.environ.keys():
        wiki.startup(os.path.join(os.environ['HOME'], '.sideKick', 'default'))
    else:
        wiki.startup(os.path.join(os.environ['USERPROFILE'], '.sideKick', 'default'))

    if 'SIDEKICK_PORT' in os.environ.keys():
        serverPort = os.environ['SIDEKICK_PORT']
    else:
        serverPort = 8080

    if 'SIDEKICK_IP' in os.environ.keys():
        serverIP = os.environ['SIDEKICK_IP']
    else:
        serverIP = '127.0.0.1'
        
    if 'SIDEKICK_DEBUG' in os.environ.keys():
        serverDebug = os.environ['SIDEKICK_DEBUG']
    else:
        serverDebug = False

    app.logger.debug('web server port is: ' + str(serverPort))
    app.logger.debug('web server ip is: ' + serverIP)
    app.run(debug=serverDebug, port=serverPort, host=serverIP)
    
    print("start-up done.")
