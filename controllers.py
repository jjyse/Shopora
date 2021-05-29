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

@action('index')
@action.uses(db, auth, 'index.html')
def index():
    return dict()

@action('collection')
@action.uses(db, session, auth, 'collection.html')
def collection():
    return dict(
        load_items_url = URL('load_items', signer=url_signer),
        load_curr_item_url = URL('load_curr_item', signer=url_signer),
        load_reviews_url = URL('load_reviews', signer=url_signer),
        add_review_url = URL('add_review', signer=url_signer),
        delete_review_url = URL('delete_review', signer=url_signer),
    )

@action('collection-item/<item_id:int>')
@action.uses(db, session, auth, 'collection-item.html')
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
        load_curr_item_url = URL('load_curr_item', signer=url_signer),
        load_reviews_url = URL('load_reviews', signer=url_signer),
        add_review_url = URL('add_review', signer=url_signer),
        delete_review_url = URL('delete_review', signer=url_signer),
    )

@action('account')
@action.uses(db, session, auth.user, 'account.html')
def account():
    print("User:", get_user_email())
    return dict()

@action('account/edit')
@action.uses(db, session, auth.user, 'editaccount.html')
def editaccount():
    print("User:", get_user_email())
    return dict()

@action('account/favorites')
@action.uses(db, session, auth.user, 'favorites.html')
def favorites():
    print("User:", get_user_email())
    return dict()

@action('account/wishlist')
@action.uses(db, session, auth.user, 'wishlist.html')
def wishlist():
    print("User:", get_user_email())
    return dict()

@action('cart')
@action.uses(db, session, auth, 'cart.html')
def cart():
    print("User:", get_user_email())
    return dict()

@action('support-contact')
@action.uses(db, session, auth, 'supportcontact.html')
def supportcontact():
    print("User:", get_user_email())
    return dict()
    
# **************************** Controllers for items ********************************* #

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
            )
    rows = db(db.item).select().as_list()
    return dict(rows=rows)

@action('load_curr_item', method=["GET", "POST"])
@action.uses(db, session)
def load_curr_item():
    num = 0
    rows = []
    curr_item = []

    rows = db(db.storage).select()
    for row in rows:
        num = row.curr_item_id

    for row in db(db.item.id == num).select():
        curr_item = [{
            "item_id": row.id,
            "item_name": row.item_name,
            "item_description": row.item_description,
            "item_price": row.item_price,
            "item_image": row.item_image,
        }]

    return dict(rows=curr_item)

# **************************** Controllers for item reviews **************************** #

@action('load_reviews')
@action.uses(db, url_signer.verify())
def load_reviews():
    item_reviews = db(db.item_reviews).select().as_list()
    email = get_user_email()
    return dict(
        item_reviews=item_reviews,
        email=email
    )


@action('add_review', method="POST")
@action.uses(url_signer.verify(), db)
def add_review():
    name=""

    user = db(db.auth_user.email == get_user_email()).select()
    for r in user:
        name = r['first_name'] + " " + r['last_name']

    id = db.item_reviews.insert(
        item_id=request.json.get('item_id'),
        review_content=request.json.get('review_content'),
        reviewer_name=name,
        reviewer_email=get_user_email()
    )
    email = get_user_email()
    return dict(
        id=id,
        reviewer_name=name,
        reviewer_email=email,
    )

@action('delete_review')
@action.uses(url_signer.verify(), db)
def delete_review():
    id = request.params.get('id')
    assert id is not None
    db(db.item_reviews.id == id).delete()
    return "ok"
