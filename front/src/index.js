const url = 'http://localhost:3000/graphql';

const getFetchOptions = (requestBody) => {
    return {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        method: 'POST'
    }
}

const createPost = async e => {
    e.preventDefault();
    const title = document.querySelector('#title').value;
    const body = document.querySelector('#body').value;

    const requestBody = {query: `mutation{createPost(postInput:{title:"${title}",body:"${body}"}){_id title body}}`};

    try{
        const result = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `what ${state.login.token}`
            },
            body: JSON.stringify(requestBody),
            method: 'POST'
        });

        const res = await result.json();
        initHTML();
    } catch (err){
        console.log(err);
    }
}

const removePost = async e => {
    const _id = e.target.parentElement.getAttribute('data-id');

    const requestBody = {
        query: `mutation{removePost(_id:"${_id}"){_id title body error}}`
    };

    try{
        const result = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `what ${state.login.token}`
            },
            body: JSON.stringify(requestBody),
            method: 'POST'
        });
        const res = await result.json();
        if(res.data.removePost.error == 'Unauthorized')
            return;
        // remove post from state
        for(let i = 0; i < state.posts.length; i++)
            if(state.posts[i]._id == _id)
                state.posts.splice(i, 1);
        app.innerHTML = '';
        displayPosts(state.posts);
    } catch (err){
        console.log(err);
    }
}

const loadPosts = async e => {
    if(!state.loggedIn)
        app.innerHTML = `
            <h1>You need to be logged in to view posts</h1>
        `
    else{
        const requestBody = {
            query: `query{posts{_id title body creator{_id username posts{_id title body creator{_id username} createdAt}} createdAt}}`
        }
        try{
            const result = await fetch(url, getFetchOptions(requestBody));
            const res = await result.json();
            state.posts = res.data.posts;
            app.innerHTML = '';
            displayPosts(state.posts);
        } catch (err){
            console.log(err);
        }
    }
}

const createUser = async e => {
    e.preventDefault();
    const username = document.querySelector('#username').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value
    const confirmPassword = document.querySelector('#confirm-password').value

    if(!(username != '' && email != '' && password != '' && confirmPassword != '')){
            document.querySelector('#success').innerHTML = 'All fields are required!';
            return;
       }
    if(password != confirmPassword){
        document.querySelector('#success').innerHTML = 'Passwords do not match!';
        return;
    }

    const requestBody = {query: `mutation{createUser(userInput:{username:"${username}",password:"${password}"}){ _id username password }}`};

    try{
        const result = await fetch(url, getFetchOptions(requestBody));
        const res = await result.json();
        if(res.data.createUser != null || res.data.createUser != undefined)
            document.querySelector('#success').innerHTML = 'User created!';
        else
            document.querySelector('#success').innerHTML = 'An error occurred while creating user!';
    } catch (err){
        if(err == 'TypeError: Failed to fetch')
            document.querySelector('#success').innerHTML = 'An error occurred while creating user!';
    }
}

const login = async e => {
    e.preventDefault();
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value

    if(!(username != '' && password != '')){
        document.querySelector('#success').innerHTML = 'All fields are required!';
        return;
    }

    const requestBody = {query: `query{login(username:"${username}",password:"${password}"){userId username token expiresIn}}`};

    try{
        const result = await fetch(url, getFetchOptions(requestBody));
        if(result.status == 500){
            document.querySelector('#success').innerHTML = 'Wrong username or password!';
            return;
        }
        const res = await result.json();
        state.loggedIn = !state.loggedIn;
        state.login = res.data.login;
        initHTML();
    } catch (err){
        console.log(err);
        if(err == 'TypeError: Failed to fetch')
            console.log('Hello World');
    }
}

const signout = (e) => {
    state.loggedIn = false;
    state.login = null;
    initHTML();
    loadPosts();
}

const logo = document.querySelector('#logo');
logo.addEventListener('click', loadPosts);