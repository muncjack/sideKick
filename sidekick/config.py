"""
This module manages the configuration (which is stored inside the host git repository)
"""

import logging
import json
import os

import wiki

__author__ = 'Stephen Brown'

log = logging.getLogger(__name__)

TYPE_STRING = 'string'
TYPE_INT = 'int'


class ConfigEntry(object):
    def __init__(self, key, name, default_value, var_type=TYPE_STRING):
        self.key = key
        self.name = name
        self.default_value = default_value
        self.var_type = var_type
        self._value = None

    @property
    def value(self):
        if self._value is not None:
            return self._value

        return self.default_value

    @value.setter
    def value(self, val):
        if self.var_type == TYPE_STRING:
            self._value = val
        elif self.var_type == TYPE_INT:
            self._value = int(val)
        else:
            raise Exception('Unhandled type: {}'.format(self.var_type))

    def validate(self, new_value):
        """
        Pass in the raw string from the form - you must strip it prior to passing in

        :returns Either an error message, or None if the value is valid
        """
        if new_value == '':
            return 'Required'
        
        if self.var_type == TYPE_STRING:
            # All strings are valid!
            return None
        elif self.var_type == TYPE_INT:
            try:
                int(new_value)
                return None
            except ValueError:
                return 'Invalid integer: {}'.format(new_value)
        else:
            raise Exception('Unhandled type: {}'.format(self.var_type))


IP_ADDRESS = ConfigEntry('ip_address', 'IP Address', '127.0.0.1')
PORT = ConfigEntry('port', 'Port', 8080, TYPE_INT)


ALL_ITEMS = [IP_ADDRESS, PORT]


def save_config():
    """
    Takes all of the config items and saves them to disk.  This will overwrite the previous
    values
    """
    config_filename = wiki.get_main_config_filename()
    config_dict = {}
    for item in ALL_ITEMS:
        config_dict[item.key] = item._value
    json_string = json.dumps(config_dict)
    print(config_filename)
    with open(config_filename, 'w') as f:
        f.write(json_string)


def load_config():
    config_filename = wiki.get_main_config_filename()
    if not os.path.exists(config_filename):
        print('No config to load')
        return
    
    print('Loading config file {}'.format(config_filename))

    config_dict = None
    with open(config_filename, 'r') as f:
        config_string = f.read()
        config_dict = json.loads(config_string)

    if not config_dict:
        raise Exception('Something went wrong!')

    for item in ALL_ITEMS:
        if item.key in config_dict:
            item.value = config_dict[item.key]

