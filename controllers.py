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

@action('')
@action.uses(db, auth, 'homepage.html')
def homepage():
    print("User:", get_user_email())
    return dict(
    )

@action('collection')
@action.uses(db, auth, 'collection.html')
def collection():
    print("User:", get_user_email())
    return dict()

@action('collection/<item_id:int>')
@action.uses(db, auth, 'item.html')
def item():
    print("User:", get_user_email())
    return dict()

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
