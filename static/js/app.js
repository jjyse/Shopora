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

        // Data related to lists
        lists: [],
        list_names: [],
        create_new_list_mode: false,
        new_list_name: "",

        // Data related to review writing
        review_writing_mode: false,
        review_post_mode: false,
        review_content: "",
        reviews: [],
        add_email: "",
        current_rating_display: 0,
        num_stars: 0,
        image: null,
        review_images: [],
        show_reviews: false,

        // Data related to likes/dislikes
        likes_enabled: false,
        dislikes_enabled: false,
        likers_list: "",
        dislikers_list: "",
        curr_row: 0,
        name: "",
    };

    // *********************** Review writing methods *******************************
    app.set_mode = function(new_status){
        if (new_status == false) {
            app.vue.current_rating_display = 0;
            app.vue.num_stars = 0;
            app.vue.image = null;
        }
        app.vue.review_post_mode = new_status;
    };

    app.add_review = function(){
        axios.post(add_review_url,
            {
                item_id: app.vue.curr_item[0].item_id,
                review_content: app.vue.review_content,
                rating: app.vue.num_stars,
            })
            .then(function (response){
                app.vue.reviews.push({
                    id: response.data.id,
                    item_id: app.vue.curr_item[0].item_id,
                    review_content: app.vue.review_content,
                    reviewer_name: response.data.reviewer_name,
                    reviewer_email: response.data.reviewer_email,
                    num_stars_display: app.vue.num_stars,
                    rating: app.vue.num_stars,
                    liked: false,
                    disliked: false,
                });
                if (app.vue.image != null) {
                    axios.post(upload_url,
                        {
                            review_id: response.data.id,
                            image: app.vue.image,
                        });
                    app.vue.review_images.push({
                        id: response.data.id,
                        image: app.vue.image,
                    });
                }
                app.enumerate(app.vue.reviews);
                app.reset_review();
                app.set_mode(false);
            });
    };

    app.set_stars = (num_stars) => {
        app.vue.num_stars = num_stars;
    };

    app.stars_out = function (){
        app.vue.current_rating_display = app.vue.num_stars;
    };

    app.stars_over = (num_stars) => {
        app.vue.current_rating_display = num_stars;
    };

    app.upload_file = function (event) {
        let input = event.target;
        let file = input.files[0];
        if (file) {
            let reader = new FileReader();
            reader.addEventListener("load", function () {
                app.vue.image = reader.result;
            });
            reader.readAsDataURL(file);
        }
    };

    app.reset_review = function (){
        app.vue.review_content = "";
        app.vue.num_stars = 0;
        app.vue.current_rating_display = 0;
    };

    app.delete_review = (review_idx) => {
        let id = app.vue.reviews[review_idx].id;
        axios.get(delete_review_url, {params: {id: id}}).then(function ( response){
            for (let i=0; i<app.vue.reviews.length; i++){
                if(app.vue.reviews[i],id == id){
                    app.vue.reviews.reverse().splice(i, 1);
                    app.vue.review_images.splice(i, 1);
                    app.enumerate(app.vue.reviews);
                    break;
                }
            }
        });
    }

    app.show_review_writing_mode = function(new_status){
        app.vue.review_writing_mode = new_status;
    };

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

    app.get_likers_list = function(row_idx) {
        let id = app.vue.reviews[row_idx].id;

        axios.get(get_likerslist_url, {params: {id: id}}).then(function (response) {
            list = response.data.likers_names
            app.vue.likers_list = list
        });
    };

    app.get_dislikers_list = function(row_idx) {
        let id = app.vue.reviews[row_idx].id;
        axios.get(get_dislikerslist_url, {params: {id: id}}).then(function (response) {
            list = response.data.dislikers_names
            app.vue.dislikers_list = list
        });
    };

    // *************************** User list methods *************************************

    app.reset_list = function (){
        app.vue.new_list_name = "";
    };

    app.set_create_new_list_mode = function(new_status){
        if (new_status == true) {
            app.vue.list_names = app.get_list_names(app.vue.lists);
        }
        app.vue.create_new_list_mode = new_status;
    };

    app.create_list = function(list_name){

        if (list_name != "") {

            axios.post(create_user_list_url,
                {
                    list_name: list_name,
                    item_id: app.vue.curr_item[0].item_id,
                })
                .then(function (response){
                    // Not reactive for some reason
                    /*
                    app.vue.lists.push({
                        user_email: app.vue.add_email,
                        list_id: response.data.id,
                        list_name: list_name,
                        item_id: app.vue.curr_item[0].item_id,
                    });
                    */
                });
            app.vue.lists.push({
                user_email: app.vue.add_email,
                list_name: list_name,
                item_id: app.vue.curr_item[0].item_id,
            });
            // app.enumerate(lists);

        }
        app.set_create_new_list_mode(false);
        app.reset_list();
    };

    app.get_list_names = function(arr) {
        let list_names = [];
        for (let i = 0; i < arr.length; i++) {
            list_names.push(arr[i].list_name)
        }
        return [...new Set(list_names)];
    };

    app.show_reviews_mode = function(new_status){
        app.vue.show_reviews = new_status;
    };

    // ***********************************************************************************

    app.methods = {
        // Complete.
        set_mode: app.set_mode,
        add_review: app.add_review,
        reset_review: app.reset_review,
        delete_review: app.delete_review,

        upload_file: app.upload_file,
        create_list: app.create_list,
        set_create_new_list_mode: app.set_create_new_list_mode,
        reset_list: app.reset_list,
        get_list_names: app.get_list_names,
        show_reviews_mode: app.show_reviews_mode,
        show_review_writing_mode: app.show_review_writing_mode,

        set_stars: app.set_stars,
        stars_out: app.stars_out,
        stars_over: app.stars_over,

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
        axios.get(load_user_lists_url).then(function (response) {
            app.vue.lists = response.data.rows;
        });
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
                    axios.get(get_rating_url, {params: {"review_id": rows[i].id}})
                        .then((result) => {
                            rows[i].rating = result.data.rating;
                            rows[i].num_stars_display = result.data.rating;
                        });
                }
                app.vue.reviews = app.enumerate(rows)
            });
        // ************ Retrieving likers/dislikers from database ***********
        axios.get(get_name_url).then(function (response) {
            app.vue.name = response.data.name;
        });
        // ************ Retrieving review images from database ***********
        axios.get(get_images_url).then(function (response) {
            app.vue.review_images = response.data.rows;
        });

    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);