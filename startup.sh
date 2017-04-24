#!/bin/bash 
set -x
WORKING_DIR=$(dirname $0)
if [ -n "$WORKING_DIR" ]
  then
    cd $WORKING_DIR
fi

if [ -f ./env/bin/activate ]
  then
    echo activating virtualenv
    . ./env/bin/activate
  else
    if which virtualenv
      then
        virtualenv env
        . ./env/bin/activate
    elif [ -f ~/bin/virtualenv ] 
      then
        ~/bin/virtualenv env
        . ./env/bin/activate
    fi 
fi

if [ -n "$VIRTUAL_ENV" ]
  then
    FREEZE="`pip freeze`"
    if [ "$FREEZE" == "${FREEZE/Flask/}" ]
      then
        pip install flask
    fi
elif ! python -c 'import flask' > /dev/null
  then
    echo -e "\n\tFlask is required if you in ubuntu install the python flask package or install virtualenv"
    exit 1
fi


python sidekick/sidekick.py

