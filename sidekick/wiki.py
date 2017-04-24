from __future__ import print_function
import os
import re
from os import listdir
import shutil
import subprocess

import mygit

wikiBaseFileDir = ''
wikiBaseAttchDir = ''
global deBugMsg


def startup(baseDir):
    print('DEBUG: runing wiki start up checks')
    global wikiBaseFileDir
    global wikiBaseAttchDir
    wikiBaseDir = os.path.join(baseDir, 'wiki')
    wikiBaseFileDir = os.path.join(wikiBaseDir, 'files')
    wikiBaseAttchDir = os.path.join(wikiBaseDir, 'attachements')
    if os.path.exists(baseDir) == False:
            print('SETUP: creating directories for wiki')
            os.makedirs(baseDir)
    if os.path.exists(wikiBaseFileDir) == False:
        os.makedirs(wikiBaseFileDir)
    if os.path.exists(wikiBaseAttchDir) == False:
        os.makedirs(wikiBaseAttchDir)
    global wikiRepo
    wikiRepo = mygit.startup(wikiBaseDir)
    return True


def deFang(reqStr):
    for char in ["\\", ";", "*", "?"]:
        reqStr = reqStr.replace(char, "")
    return reqStr


def webpath2ospath(webpath, t):
    if t == 'f':
        p = wikiBaseFileDir
    else:
        p = wikiBaseAttchDir
    webpath = deFang(webpath)
    return os.path.join(p, *webpath.split('/'))


def ospath2webpath(ospath):
    if wikiBaseFileDir in ospath:
        ospath = ospath.replace(wikiBaseFileDir, '')
    else:
        ospath = ospath.replace(wikiBaseAttchDir, '')
    if os.path.sep != '/':
        ospath = ospath.replace(os.path.sep, '/')
    if ospath == '':
        ospath = '/'
    return ospath


def GetFolderContent(current):
    folders = []
    files = []
    osPath = webpath2ospath(current, 'f')
    for item in listdir(osPath):
        if os.path.isdir(os.path.join(osPath, item)):
            folders.append(item)
        else:
            files.append(item)
    return {'path': current, 'folders': sorted(folders), 'files': sorted(files)}


def GetFile(filePath, filename):
    FullPath = webpath2ospath(filePath + '/' + filename, 'f')
    f = open(FullPath, 'r')
    str = f.read()
    f.close()
    return str


def saveFile(Path, fileName, blob):
    print("saveFile I have been called path: " + Path + " File: " + fileName)
    fullName = webpath2ospath(Path + '/' + fileName, 'f')
    Path = webpath2ospath(Path, 'f')
    print('file path is: ' + Path + ' FullName is: ' + fullName)
    if os.path.isdir(Path) == False:
        if os.path.exists(Path) == True:
            return "404 dir " + Path + " is a file"
        else:
            try:
                os.makedirs(Path)
            except:
                return "500 Failed  to crete dir in path: " + Path
                #    try:
    f = open(fullName, 'wb')
    f.write(blob.encode('utf-8').strip())
    f.close()
    wikiRepo.add(fullName)
    #    except:
    #        return "500 Failed to save data to file " + fileName + " in dir " + Path
    return True


def fileDel(filePath, fileName):
    f = webpath2ospath(filePath + '/' + fileName, 'f')
    a = webpath2ospath(filePath + '/' + fileName, 'a')
    print('file to be deleted is: ' + f + '\nattachements directory is: ' + a)
    recode = ''
    if os.path.exists(f):
        if os.path.exists(a):
            shutil.rmtree(a)
        os.remove(f)
    else:
        recode = 'unknown wiki entry : ' + filePath + '/' + fileName
    return recode


def fileRename(request):
    """
    I can't see how this can possibly work...

    Is this still used for anything?
    """
    print(request['oldpath'])
    op = webpath2ospath(request['oldpath'])
    np = webpath2ospath(request['newpath'])
    if op != np:
        if not os.path.exists(np):
            os.makedirs(Path)
    op = os.path.join(op, request['oldfile'])
    np = os.path.join(np, request['newfile'])
    subprocess.Popen(['git mv', op, np], stdout=subprocess.PIPE)
    wikiRepo.mv(oldfile, newfile)


def fileSearch(s):
    filefound = []
    print("DEBUG: " + s)
    for root, dirs, files in os.walk(wikiBaseFileDir, topdown=False):
        for name in files:
            print(os.path.join(root, name))
            f = open(os.path.join(root, name), 'r')
            content = f.read()
            f.close()
            if re.search(s, content, re.IGNORECASE):
                print("yes" + ospath2webpath(root))
                filefound.append([ospath2webpath(root), name])
    return filefound


def attachmentGet(fpath, fname, attach):
    fullPath = fpath + '/' + fname
    print('hello')
    return [webpath2ospath(fullPath, 'a'), deFang(attach)]


def gitStatus():
    resp = {}
#    print("--->DEBUG: call localstatus")
    (resp['Tracked'], resp['Untracked'], resp['pushRequired']) = wikiRepo.localStatus()
#    print("--->DEBUG: call localstatus", resp)
    resp['pullRequired'] = wikiRepo.remoteStatus()
#    print("--->DEBUG:  ", resp)
    return resp


def gitPull():
    return wikiRepo.pull()


def gitPush():
    return wikiRepo.push()


def gitAddCommitAll(msg):
    print("--------> DEBUG msg is: ", msg)
    # time to run git add all new files
    result = wikiRepo.add('-A')
    if result['status'] == 'OK':
        result['add'] = result['status']
        # run git commit all
        r2 = wikiRepo.commit(msg)
        result['output'] += r2['output']
        result['status'] = r2['status']
    return result

