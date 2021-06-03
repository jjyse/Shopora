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
from .models import get_user_email, get_user

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

        upload_url = URL('upload_image', signer=url_signer),
        get_images_url = URL('get_images', signer=url_signer),
        load_user_lists_url = URL('load_user_lists', signer=url_signer),
        create_user_list_url = URL('create_user_list', signer=url_signer),

        get_rating_url = URL('get_rating', signer=url_signer),
        get_name_url = URL('get_name', signer=url_signer),
        add_liker_url = URL('add_liker', signer=url_signer),
        remove_liker_url = URL('remove_liker', signer=url_signer),
        get_likerslist_url = URL('get_likerslist', signer=url_signer),
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

        upload_url = URL('upload_image', signer=url_signer),
        get_images_url = URL('get_images', signer=url_signer),
        load_user_lists_url = URL('load_user_lists', signer=url_signer),
        create_user_list_url = URL('create_user_list', signer=url_signer),

        get_rating_url = URL('get_rating', signer=url_signer),
        get_name_url = URL('get_name', signer=url_signer),
        add_liker_url = URL('add_liker', signer=url_signer),
        remove_liker_url = URL('remove_liker', signer=url_signer),
        get_likerslist_url = URL('get_likerslist', signer=url_signer),
    )

@action('lists')
@action.uses(db, session, auth.user, 'lists.html')
def lists():
    print("User:", get_user_email())
    return dict()

@action('cart')
@action.uses(db, session, auth, 'cart.html')
def cart():
    print("User:", get_user_email())
    return dict(
        load_items_url = URL('load_items', signer=url_signer),
        load_curr_item_url = URL('load_curr_item', signer=url_signer),
        load_reviews_url = URL('load_reviews', signer=url_signer),
        add_review_url = URL('add_review', signer=url_signer),
        delete_review_url = URL('delete_review', signer=url_signer),

        upload_url = URL('upload_image', signer=url_signer),
        get_images_url = URL('get_images', signer=url_signer),
        load_user_lists_url = URL('load_user_lists', signer=url_signer),
        create_user_list_url = URL('create_user_list', signer=url_signer),

        remove_list_item_url = URL('remove_list_item', signer=url_signer),

        get_rating_url = URL('get_rating', signer=url_signer),
        get_name_url = URL('get_name', signer=url_signer),
        add_liker_url = URL('add_liker', signer=url_signer),
        remove_liker_url = URL('remove_liker', signer=url_signer),
        get_likerslist_url = URL('get_likerslist', signer=url_signer),
    )

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
        reviewer=get_user(),
        reviewer_name=name,
        reviewer_email=get_user_email(),
        rating=request.json.get('rating'),
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
    db(db.review_photos.item_reviews_id == id).delete()
    return "ok"

@action('get_rating')
@action.uses(url_signer.verify(), db)
def get_rating():
    review_id = request.params.get('review_id')
    row = db(db.item_reviews.id == review_id).select()
    for r in row:
        rating = r.rating if r is not None else 0
    return dict(rating=rating)

@action('upload_image', method="POST")
@action.uses(url_signer.verify(), db)
def upload_image():
    review_id = request.json.get("review_id")
    image = request.json.get("image")
    db.review_photos.insert(image=image, item_reviews_id=review_id)
    return "ok"

@action('get_images')
@action.uses(url_signer.verify(), db)
def get_images():
    rows = db(db.review_photos).select().as_list()
    return dict(rows=rows)

# ********************** Controllers for adding likes/dislikes to reviews *********************** #

@action('get_name')
@action.uses(url_signer.verify(), db)
def get_name():
    r = db(db.auth_user.email == get_user_email()).select().first()
    name = r.first_name + " " + r.last_name if r is not None else "Unknown"
    return dict(name=name)

@action('get_likerslist')
@action.uses(url_signer.verify(), db)
def get_likerslist():
    id = request.params.get('id')
    assert id is not None
    row = db(db.item_reviews.id == id).select().as_list()
    likerslist = row[0]["likers"]
    likers_names = ""
    if likerslist is not None:
        length = len(likerslist)
        for i in range(0, length):
            r = db(db.auth_user.email == likerslist[i]).select().first()
            name = r.first_name + " " + r.last_name if r is not None else "Unknown"
            likers_names += name
            if i != length - 1:
                likers_names += ", "
    # print(likers_names)
    return dict(likers_names=likers_names)

@action('add_liker')
@action.uses(url_signer.verify(), db)
def add_liker():
    id = request.params.get('id')
    assert id is not None
    useremail = get_user_email()
    likers = db(db.item_reviews.id == id).select().as_list()
    #print(likers)
    new_likers=likers[0]["likers"]
    if new_likers is None:
        new_likers = []
    if useremail not in new_likers:
        new_likers.append(useremail)
    db(db.item_reviews.id == id).update(likers=new_likers)

@action('remove_liker')
@action.uses(url_signer.verify(), db)
def remove_liker():
    id = request.params.get('id')
    assert id is not None
    useremail = get_user_email()
    likers = db(db.item_reviews.id == id).select().as_list()
    # print(likers)
    new_likers=likers[0]["likers"]
    if new_likers is not None and useremail in new_likers:
        new_likers.remove(useremail)
    db(db.item_reviews.id == id).update(likers=new_likers)

# ********************** Controllers for user lists *********************** #

@action('load_user_lists')
@action.uses(db, url_signer.verify())
def load_user_lists():
    rows = []
    
    for list_item in db(db.list.user == get_user).select():
        rows.append({
            "user_email": list_item.user_email,
            "list_name": list_item.list_name,
            "list_id": list_item.id,
            "item_id": list_item.item_id,
        })

    return dict(
        rows=rows,
    )

@action('create_user_list', method="POST")
@action.uses(db, url_signer.verify())
def create_user_list():
    id = db.list.insert(
        user=get_user,
        user_email=get_user_email(),
        list_name=request.json.get('list_name'),
        item_id=request.json.get('item_id'),
    )
    return dict(
        id=id,
    )

@action('remove_list_item', method="POST")
@action.uses(db, url_signer.verify())
def remove_list_item():
    list_id = request.json.get('list_id')
    assert list_id is not None

    db(db.list.id == list_id).delete()
    return "ok"
