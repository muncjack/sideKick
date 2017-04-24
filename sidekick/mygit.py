from __future__ import print_function
import os
import subprocess
import shutil


class startup:
    def __init__(self, gitroot):
        # set the default to no git support :-(
        self.mode = 'disabled'
        self.gitroot = gitroot
        # setup the cmd in case we are ussing git cli
        self.gitcmd = ['git', '--work-tree=' + self.gitroot, '--git-dir=' + self.gitroot + os.path.sep + '.git']
        print(self.gitcmd)
        try:
            # this line has a typo to force cli temporarly
            import dulwichdd  # noqa
            self.mode = 'CMD'
        except ImportError:
            try:
                subprocess.check_call(self.gitcmd + ['status'])
                self.mode = 'CMD'
            except:
                print(":-(  not git")
        print("git mode is: " + self.mode)
        
    # this will return a list of file that need commiting
    def localStatus(self):
        fileUntracked = []
        fileTracked = []
        pushRequired = 0
        if self.mode == 'CMD':
            print('working in CMD mode2')
            CMD = subprocess.Popen(self.gitcmd + ['status', '-uno', '-u'], stdout=subprocess.PIPE)
            r = CMD.communicate()
            for line in r[0].split('\n'):
                if '\tmodified:' in line or '#\tNew file:' in line or '#\tdeleted:' in line:
                    fileTracked.append(line.replace('#\t', ''))
                elif '\t' in line:
                    fileUntracked.append(line.replace('#\t', ''))
            if 'Your branch is ahead of' in r[0]:
                pushRequired = 1
            # this in case the git repo diverge ....
            if ' have diverged,' in r[0]:
                pushRequired = -1
            
        elif self.mode == 'dulwich':
            print('working in dulwch mode')
        else:
            print('not in git mode')
        return [fileTracked, fileUntracked, pushRequired]

    # this will will check if a pull or push is required
    def remoteStatus(self):
        action = -1
        if self.mode == 'CMD':
            print('working in CMD mode')
            CMD = subprocess.Popen(self.gitcmd + ['remote', 'update'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            r = CMD.communicate()[0]
            if CMD.returncode == 0:
                CMD = subprocess.Popen(self.gitcmd + ['status', '-uno', '-u'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                r = CMD.communicate()[0]
                if CMD.returncode == 0:
                    print("DEBUG git:" + r)
                    if 'Your branch is behind' in r:
                        action = 1
                    else:
                        action = 0
        elif self.mode == 'dulwich':
            print('working in dulwch mode')
            
        else:
            print('not in git mode')
        return action
    
    def pull(self):
        result = {}
        if self.mode == 'CMD':
            print('working in CMD mode')
            CMD = subprocess.Popen(self.gitcmd + ['pull'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            result['output'] = ''.join(CMD.communicate())
            if CMD.returncode == 0:
                result['status'] = 'OK'
            else:
                result['status'] = 'Failed'
        elif self.mode == 'dulwich':
            print('working in dulwch mode')
        else:
            print('not in git mode')
        return result

    def push(self):
        result = {}
        if self.mode == 'CMD':
            print('working in CMD mode')
            CMD = subprocess.Popen(self.gitcmd + ['push'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            result['output'] = ''.join(CMD.communicate())
            if CMD.returncode == 0:
                result['status'] = 'OK'
            else:
                result['status'] = 'Failed'
        elif self.mode == 'dulwich':
            print('working in dulwch mode')
        else:
            print('not in git mode')
        return result
    
    def add(self, f):
        result = {}
        if self.mode == 'CMD':
            print('working in CMD mode: ' + ' '.join(map(str, self.gitcmd)) + ' add ' + f)
            CMD = subprocess.Popen(self.gitcmd + ['add', f], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            result['output'] = ''.join(CMD.communicate())
            if CMD.returncode == 0:
                result['status'] = 'OK'
            else:
                result['status'] = 'Failed'
        elif self.mode == 'dulwich':
            print('working in dulwch mode')
        else:
            print('not in git mode')
        return result
    
    def mv(self, old, new):
        status = -1
        if self.mode == 'CMD':
            print('working in CMD mode')
            status = subprocess.call(self.gitcmd + ['mv', old, new])
        elif self.mode == 'dulwich':
            print('working in dulwch mode')
        else:
            print('not in git mode')
            shutil.move(old, new)
        return status
        
    def commit(self, msg):
        result = {}
        if self.mode == 'CMD':
            print('working in CMD mode')
            CMD = subprocess.Popen(self.gitcmd + ['commit', '-am', '"' + msg + '"'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            result['output'] = ''.join(CMD.communicate())
            if CMD.returncode == 0:
                result['status'] = 'OK'
            else:
                result['status'] = 'Failed'
        elif self.mode == 'dulwich':
            print('working in dulwch mode')
        return result
    
    def clone(self):
        print("time to do a clone....")
        status = -1
        return status
    
    def setup(self, remote):
        print("time to init the local repo")
        status = -1
        os.environ
        return status
    
    
    



