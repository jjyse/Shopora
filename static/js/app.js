// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    // This is the Vue data.

    app.data = {
        // Data for retrieving items
        items: [],
        curr_item: [],

        // Data related to review writing
        review_post_mode: false,
        review_content: "",
        reviews: [],
        add_email: "",

        // Data related to review writing
        // add_mode: false,         (review_post_mode)
        likes_enabled: false,
        dislikes_enabled: false,
        // useremail: "",           (add_email)
        // post_content: "",        (review_content)
        // rows: [],                (reviews)
        likers_list: "",
        dislikers_list: "",
        curr_row: 0,
        name: "",
    };

    // *********************** Review writing methods *******************************
    app.set_mode = function(new_status){
        app.vue.review_post_mode = new_status;
    };

    app.add_review = function(){
        axios.post(add_review_url,
            {
                item_id: app.vue.curr_item[0].item_id,
                review_content: app.vue.review_content,
            })
            .then(function (response){
                app.vue.reviews.push({
                    id: response.data.id,
                    item_id: app.vue.curr_item[0].item_id,
                    review_content: app.vue.review_content,
                    reviewer_name: response.data.reviewer_name,
                    reviewer_email: response.data.reviewer_email,
                    liked: false,
                    disliked: false,
                });
                app.enumerate(app.vue.reviews);
                app.reset_review();
                app.set_mode(false);
            });
    };

    app.reset_review = function (){
        app.vue.review_content = "";
    };

    app.del_review = (review_idx) => {
        let id = app.vue.reviews[review_idx].id;
        axios.get(del_review_url, {params: {id: id}}).then(function ( response){
            for (let i=0; i<app.vue.reviews.length; i++){
                if(app.vue.reviews[i],id == id){
                    app.vue.reviews.reverse().splice(i, 1);
                    app.enumerate(app.vue.reviews);
                    break;
                }
            }
        })
    }

    app.enumerate = (a) => {
        // This adds an _idx field (THE ROW INDEX) to each element of the array.
        let k = 0;
        a.map((e) => {
            e._idx = k++;
        });
        return a;
    };

    // *************************** Likers/dislikers methods ******************************

    app.reset_lists = function () {
        likers_list = "";
        dislikers_list = "";
    };

    app.reset_row = function () {
        app.vue.curr_row = -1;
    };

    // app.set_add_mode = function (new_mode) {
    //     app.vue.add_mode = new_mode;
    // };

    app.set_curr_row = function (new_mode) {
        app.vue.curr_row = new_mode
    };

    app.set_likes_enabled = function (new_mode) {
        app.vue.likes_enabled = new_mode;
    };

    app.set_dislikes_enabled = function (new_mode) {
        app.vue.dislikes_enabled = new_mode;
    };

    app.like_post = function (row_idx) {
        let id = app.vue.reviews[row_idx].id;
        axios.get(add_liker_url, {params: {id: id, name: app.vue.name}}).then(function (response) {});
    };
    app.unlike_post = function (row_idx) {
        let id = app.vue.reviews[row_idx].id;
        axios.get(remove_liker_url, {params: {id: id, name: app.vue.name}}).then(function (response) {});
    };
    app.set_liked_mode = function (row_idx, new_mode) {
        app.vue.reviews[row_idx].liked = new_mode;
    };

    app.dislike_post = function (row_idx) {
        let id = app.vue.reviews[row_idx].id;
        axios.get(add_disliker_url, {params: {id: id, name: app.vue.name}}).then(function (response) {});
    };
    app.undislike_post = function (row_idx) {
        let id = app.vue.reviews[row_idx].id;
        axios.get(remove_disliker_url, {params: {id: id, name: app.vue.name}}).then(function (response) {});
    };
    app.set_disliked_mode = function (row_idx, new_mode) {
        app.vue.reviews[row_idx].disliked = new_mode;
    };

    /*
    app.reset_form = function () {
        app.vue.review_content = "";
    };

    app.add_post = function () {
        axios.post(add_post_url,
            {
                post_content: app.vue.post_content,
                name: app.vue.name
            }).then(function (response) {
            app.vue.rows.push({
                id: response.data.id,
                post_content: app.vue.post_content,
                user_email: app.vue.useremail,
                name: app.vue.name,
                liked: false,
                disliked: false,
            });
            app.enumerate(app.vue.rows);
            app.reset_form();
            app.set_add_mode(false);
        });
    };
    
    app.delete_post = function(row_idx) {
        let id = app.vue.rows[row_idx].id;
        axios.get(delete_post_url, {params: {id: id}}).then(function (response) {
            for (let i = 0; i < app.vue.rows.length; i++) {
                if (app.vue.rows[i].id === id) {
                    app.vue.rows.splice(i, 1);
                    app.enumerate(app.vue.rows);
                    break;
                }
            }
        });
    };
    */

    app.get_likers_list = function(row_idx) {
        let id = app.vue.reviews[row_idx].id;

        axios.get(get_likerslist_url, {params: {id: id}}).then(function (response) {
            list = response.data.likers_names
            /*
            string_list = ""
            for (let i = 0; i < list.length; i += 1) {
                if (i != list.length - 1) {
                    string_list += list[i] + ", ";
                } else {
                    string_list += list[i];
                }
            }
            app.vue.likers_list = string_list
            */
            app.vue.likers_list = list
        });
    };

    app.get_dislikers_list = function(row_idx) {
        let id = app.vue.reviews[row_idx].id;
        axios.get(get_dislikerslist_url, {params: {id: id}}).then(function (response) {
            list = response.data.dislikers_names
            /*
            string_list = ""
            for (let i = 0; i < list.length; i += 1) {
                if (i != list.length - 1) {
                    string_list += list[i] + ", ";
                } else {
                    string_list += list[i];
                }
            }
            app.vue.dislikers_list = string_list
            */
           app.vue.dislikers_list = list
        });
    };

    // ***********************************************************************************

    app.methods = {
        // Complete.
        set_mode: app.set_mode,
        add_review: app.add_review,
        reset_review: app.reset_review,
        del_review: app.del_review,

        like_post: app.like_post,
        unlike_post: app.unlike_post,
        dislike_post: app.dislike_post,
        undislike_post: app.undislike_post,
        set_curr_row: app.set_curr_row,
        set_liked_mode: app.set_liked_mode,
        set_disliked_mode: app.set_disliked_mode,
        get_likers_list: app.get_likers_list,
        get_dislikers_list: app.get_dislikers_list,
        set_likes_enabled: app.set_likes_enabled,
        set_dislikes_enabled: app.set_dislikes_enabled,
        reset_row: app.reset_row,
        reset_lists: app.reset_lists,

    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {

        // *************** Retrieving items from database ****************

        axios.get(load_items_url).then(function (response) {
            app.vue.items = response.data.rows;
        });
        axios.get(load_curr_item_url).then(function (response) {
            app.vue.curr_item = response.data.rows;
        });

        // ***************** Retrieving reviews from database **************
        axios.get(load_reviews_url)
            .then(function (response) {
                let rows = response.data.item_reviews;
                app.vue.add_email = response.data.email;

                for (let i = 0; i < rows.length; i++) {
                    rows[i].liked = false
                    rows[i].disliked = false
                    if (rows[i].likers != null) {
                        for (let j = 0; j < rows[i].likers.length; j++) {
                            if (rows[i].likers[j] == app.vue.add_email) {
                                rows[i].liked = true;
                                break;
                            }
                        }
                    }
                    if (rows[i].dislikers != null) {
                        for (let j = 0; j < rows[i].dislikers.length; j++) {
                            if (rows[i].dislikers[j] == app.vue.add_email) {
                                rows[i].disliked = true;
                                break;
                            }
                        }
                    }
                }
                // app.vue.rows = app.enumerate(response.data.rows);
                app.vue.reviews = app.enumerate(rows)
            });
        // ************ Retrieving likers/dislikers from database ***********
        axios.get(get_name_url).then(function (response) {
            app.vue.name = response.data.name;
        });


    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);