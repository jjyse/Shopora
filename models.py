"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *

def get_user():
    return auth.current_user.get('id') if auth.current_user else None

def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later

db.define_table('storage',
    Field('curr_item_id'),
)

db.define_table('user_info',
    Field('user_name', requires=IS_NOT_EMPTY(), ondelete="SET NULL"),
    Field('user_email', requires=IS_NOT_EMPTY(), ondelete="SET NULL"),
    Field('user_favorites'),
    Field('user_wishlist'),
    Field('user_lists'),
)

db.define_table('item',
    Field('item_name', requires=IS_NOT_EMPTY()),
    Field('item_description'),
    Field('item_price'),
    Field('item_image'),
)

db.define_table('item_reviews',
    Field('item_id', 'reference item'),
    Field('review_content'),
    Field('rating', 'integer', default=0),
    # Field('rater', 'reference auth_user', default=get_user) # User doing the rating.
    Field('reviewer_name'),
    Field('reviewer_email'),
    Field('likers', type='list:string'), 
    Field('dislikers', type='list:string'),
)

db.commit()
