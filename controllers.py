"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email

url_signer = URLSigner(session)

# Imports to load the json file.
from .settings import APP_FOLDER
import os
import json
JSON_FILE = os.path.join(APP_FOLDER, "data", "items.json")

@action('')
@action.uses(db, auth, 'homepage.html')
def homepage():
    return dict()

@action('collection')
@action.uses(db, auth, 'collection.html')
def collection():
    return dict(
        load_items_url = URL('load_items', signer=url_signer),
        local_storage_url = URL('local_storage', signer=url_signer),
    )

@action('collection-item/<item_id:int>')
@action.uses(db, auth, 'collection-item.html')
def item(item_id=None):
    assert item_id is not None

    if db(db.storage).isempty():
        db.storage.insert(
            # POST requests return json data. Retrieve it.
            curr_item_id=item_id,
        )
    else:
        db.storage.truncate()
        db.storage.insert(
            # POST requests return json data. Retrieve it.
            curr_item_id=item_id,
        )

    return dict(
        load_items_url = URL('load_items', signer=url_signer),
    )

@action('account')
@action.uses(db, auth, 'account.html')
def account():
    print("User:", get_user_email())
    return dict()

@action('account/edit')
@action.uses(db, auth, 'editaccount.html')
def editaccount():
    print("User:", get_user_email())
    return dict()

@action('account/favorites')
@action.uses(db, auth, 'favorites.html')
def favorites():
    print("User:", get_user_email())
    return dict()

@action('account/wishlist')
@action.uses(db, auth, 'wishlist.html')
def wishlist():
    print("User:", get_user_email())
    return dict()

@action('cart')
@action.uses(db, auth, 'cart.html')
def cart():
    print("User:", get_user_email())
    return dict()

@action('support-contact')
@action.uses(db, auth, 'supportcontact.html')
def supportcontact():
    print("User:", get_user_email())
    return dict()
    
# ****************************************************************************** #

@action('load_items', method=["GET", "POST"])
@action.uses(db, session)
def load_items():
    # Get the data from table.json.
    data = json.load(open(JSON_FILE))
    rows=[]
    
    if db(db.item).isempty():
        for x in data:
            db.item.insert(
                item_name=x['item_name'],
                item_description=x['item_description'],
                item_price=x['item_price'],
                item_image=x['item_image'],
                item_ratings_id=x['item_ratings_id'],
                item_reviews_id=x['item_reviews_id'],
                item_versions_id=x['item_versions_id'],
            )
    rows = db(db.item).select().as_list()
    return dict(rows=rows)

