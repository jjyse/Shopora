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
        current_list: "",
        list_share_mode: false,
        submit_share_mode: false,
        share_list_email: "",

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

        // Data related to likes
        likes_enabled: false,
        likers_list: "",
        curr_row: 0,
        name: "",

        // Data related to google cloud storage
        file_name: null, // File name
        file_type: null, // File type
        file_date: null, // Date when file uploaded
        file_path: null, // Path of file in GCS
        file_size: null, // Size of uploaded file
        download_url: null, // URL to download a file
        uploading: false, // upload in progress
        deleting: false, // delete in progress
        delete_confirmation: false, // Show the delete confirmation thing.
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

            app.vue.uploading = true;
            let file_type = file.type;
            let file_name = file.name;
            let file_size = file.size;
            // Requests the upload URL.
            axios.post(obtain_gcs_url, {
                action: "PUT",
                mimetype: file_type,
                file_name: file_name
            }).then ((r) => {
                let upload_url = r.data.signed_url;
                let file_path = r.data.file_path;
                // Uploads the file, using the low-level interface.
                let req = new XMLHttpRequest();
                // We listen to the load event = the file is uploaded, and we call upload_complete.
                // That function will notify the server `of the location of the image.
                req.addEventListener("load", function () {
                    app.upload_complete(file_name, file_type, file_size, file_path);
                });
                // TODO: if you like, add a listener for "error" to detect failure.
                req.open("PUT", upload_url, true);
                req.send(file);
            });
        }
    };

    app.upload_complete = function (file_name, file_type, file_size, file_path) {
        // We need to let the server know that the upload was complete;
        axios.post(notify_url, {
            file_name: file_name,
            file_type: file_type,
            file_path: file_path,
            file_size: file_size,
        }).then( function (r) {
            app.vue.uploading = false;
            app.vue.file_name = file_name;
            app.vue.file_type = file_type;
            app.vue.file_path = file_path;
            app.vue.file_size = file_size;
            app.vue.file_date = r.data.file_date;
            app.vue.download_url = r.data.download_url;
        });
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
                if(app.vue.reviews[i].id == id){
                    app.vue.reviews.reverse().splice(i, 1);
                    app.vue.review_images.splice(i, 1);
                    app.enumerate(app.vue.reviews);
                    break;
                }
            }
        });
    }

    app.show_review_writing_mode = function(new_status){
        if (new_status == false) {
            app.vue.current_rating_display = 0;
        }
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

    // *************************** Liker methods ******************************

    app.reset_lists = function () {
        likers_list = "";
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

    app.get_likers_list = function(row_idx) {
        let id = app.vue.reviews[row_idx].id;

        axios.get(get_likerslist_url, {params: {id: id}}).then(function (response) {
            list = response.data.likers_names
            app.vue.likers_list = list
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

    app.remove_list_item = function(list_id){
        axios.post(remove_list_item_url,
            {
                list_id: list_id,
            })
        .then(function (response) {});

        for (let i=0; i<app.vue.lists.length; i++){
            if(app.vue.lists[i].list_id == list_id){
                app.vue.lists.splice(i, 1);
                break;
            }
        }
    };

    app.delete_list = function(list_name){

        axios.post(delete_list_url,
            {
                list_name: list_name,
            })
        .then(function (response) {});

        var newItems = app.vue.lists.filter(function(item) {
            return item.list_name !== list_name;
        });
        app.vue.lists=newItems;
    };

    app.set_list_share_mode = function(new_status){
        if (new_status == false) {
            app.vue.add_email = "";
        }
        app.vue.list_share_mode = new_status;
    };

    app.share_list = function(list_name, email) {
        axios.post(share_list_url,
            {
                list_name: list_name,
                email: email,
            })
        .then(function (response) {});
        app.vue.list_share_mode = false;
        app.vue.share_list_email = false;
    }

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
        share_list: app.share_list,

        set_stars: app.set_stars,
        stars_out: app.stars_out,
        stars_over: app.stars_over,

        like_post: app.like_post,
        unlike_post: app.unlike_post,
        set_curr_row: app.set_curr_row,
        set_liked_mode: app.set_liked_mode,
        get_likers_list: app.get_likers_list,
        set_likes_enabled: app.set_likes_enabled,
        reset_row: app.reset_row,
        reset_lists: app.reset_lists,
        set_list_share_mode: app.set_list_share_mode,


        remove_list_item: app.remove_list_item,
        delete_list: app.delete_list,

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
                    if (rows[i].likers != null) {
                        for (let j = 0; j < rows[i].likers.length; j++) {
                            if (rows[i].likers[j] == app.vue.add_email) {
                                rows[i].liked = true;
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
        // ************ Retrieving likers from database ***********
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