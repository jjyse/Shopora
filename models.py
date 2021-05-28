"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later

db.define_table('item',
    Field('item_name', requires=IS_NOT_EMPTY()),
    Field('item_description'),
    Field('item_price'),
    Field('item_image'),
    Field('item_ratings_id'),
    Field('item_reviews_id'),
    Field('item_versions_id'),
)

db.define_table('user',
    Field('user_name', requires=IS_NOT_EMPTY()),
    Field('user_email', requires=IS_NOT_EMPTY()),
)

db.define_table('user_info',
    Field('user_id', 'reference user'),
    Field('user_name', requires=IS_NOT_EMPTY(), ondelete="SET NULL"),
    Field('user_email', requires=IS_NOT_EMPTY(), ondelete="SET NULL"),
    Field('user_favorites', ondelete="SET NULL"),
    Field('user_wishlist', ondelete="SET NULL"),
    Field('user_lists', ondelete="SET NULL"),
)

db.define_table('item_ratings',
    Field('item_id', 'reference item'),
    Field('item_ratings_id', ondelete="SET NULL"),
)

db.define_table('item_reviews',
    Field('item_id', 'reference item'),
    Field('item_reviews_id', ondelete="SET NULL"),
)

db.define_table('item_versions',
    Field('item_id', 'reference item'),
    Field('item_versions_id', ondelete="SET NULL"),
)

db.define_table('storage',
    Field('curr_item_id'),
)


db.commit()
