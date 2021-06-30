Name: Joyce Seok
Project name: Shopora

# Shopora Specification
**Database (SQLite3):** 
\Shopora\models.py 
**Server (Py4web):** 
\Shopora\controllers.py 
 **Browser (Vue.js + Bulma css):** 
 \Shopora\static\js\app.js \Shopora\templates\
# Application Pages
**Homepage/Display page:** 
Route: /Shopora 
Purpose: Homepage, display 3 images using bulma carousel. 
**Sign In page:** 
Route: /Shopora/auth/login 
Purpose: Secure sign in using google ‘s oauth (REMOVED). 
**Create an account page:** 
Route: /Shopora/auth/register 
Purpose: Register for an account using py4web auth. 
**Items list page:** 
Route: /Shopora/collection 
Purpose: Display items for sale on the web app. Item selection leads to /Shopora/collection-item/#. 
**Item details page:** 
Route: /Shopora/collection/<item_id:int> 
Purpose: Displays information about the selected item along with options to add the item to a list, read reviews, write reviews, and add the item to cart. 
**Shopping cart page:** 
Route: /Shopora/cart 
Purpose: Displays items that have been added to the cart. Cart items may be removed, or the entire cart may be emptied. 
**Lists page:** 
Route: /Shopora/lists 
Purpose: Items added to a named list are displayed here. Lists can be deleted, shared with other users, or have their contents individually removed.
# Shopora implementation:
The three main features of Shopora are: 

 1. Present items for sale at Shopora.
2. Provide a ratings and reviews section for each item so that shoppers can make better purchasing decisions.
3.  Implement a list system so shoppers can organize items and share selected items with other shoppers. 

