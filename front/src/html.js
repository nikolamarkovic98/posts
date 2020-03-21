// everytime I load an html component, I am setting a view and then adding events...
const app = document.querySelector('#app');
const userInfo = document.querySelector('#user-info');

let state = {
    loggedIn: false,
    login: null,
    posts: null
};

const addEvent = (signs) => {
    signs.forEach(sign => {
        switch(sign){
            case 'signup':
                const signupButton = document.querySelector('#signup');
                signupButton.addEventListener('click', createUser);
                break;
            case 'signin':
                const signinButton = document.querySelector('#signin');
                signinButton.addEventListener('click', login);
                break;
            case 'createPost':
                const createPostButton = document.querySelector('#create-post');
                createPostButton.addEventListener('click', createPost);
                break;
            case 'removePost':
                const removePostButtonList = document.querySelectorAll(`.remove-post`);
                removePostButtonList.forEach(button => button.addEventListener('click', removePost));
                break;
            case 'showUserProfile':
                const getUserButtonList = document.querySelectorAll('.username');
                getUserButtonList.forEach(button => button.addEventListener('click', showUserProfile));
                break;
        }
    });
}

const loadSignUpHTML = () => {
    app.innerHTML = `
        <div>
            <h1>SignUp</h1>
            <form>
                <input type="text" id="username" placeholder="Your username" />
                <input type="email" id="email" placeholder="Your email" />
                <input type="password" id="password" placeholder="Your password" />
                <input type="password" id="confirm-password" placeholder="Confirm password" />
                <button type="submit" class="btn" id="signup">SignUp</button>
                <p id="success"></p>
            </form>
        </div>
    `;

    addEvent(['signup']);
}

const loadSignInHTML = () => {
    app.innerHTML = `
        <div>
            <h1>SignIn</h1>
            <form>
                <input type="test" id="username" placeholder="Your username" />
                <input type="password" id="password" placeholder="Your password" />
                <button type="submit" class="btn" id="signin">SignIn</button>
                <p id="success"></p>
            </form>
        </div>
    `;

    addEvent(['signin'])
}

const loadCreatePostHTML = e => {
    app.innerHTML = `
        <div>
            <h1>Create Post</h1>
            <form>
                <input type="text" id="title" placeholder="Title">
                <textarea id="body"></textarea>
                <button type="submit" class="btn" id="create-post">Create</button>
            </form>
        </div>
    `

    addEvent(['createPost'])
}

const showUserProfile = e => {
    // i can either fetch entirely new user object or I can find it from posts already...
    const postId = e.target.parentElement.getAttribute('data-id');
    let creator;
    // find creator of post
    for(let i = 0; i < state.posts.length; i++)
        if(state.posts[i]._id == postId)
            creator = state.posts[i].creator;
    app.innerHTML = `
        <div class="user">
            <h1>${creator.username}</h1>
        </div>
    `;
    displayPosts(creator.posts);
}

const displayPost = post => {
    const date = new Date(post.createdAt);
    app.innerHTML += `
        <div class="post" data-id="${post._id}">
            <p class="username">${post.creator.username}</p>
            <hr>
            <h2>${post.title}</h2>
            <p class="info">
                ${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} | 
                ${date.getHours()}:${date.getMinutes()}
            </p>
            <p>${post.body}</p>
            <button class="remove-post btn btn-remove-post">&#10005;</button>
        </div>
    `
}

const displayPosts = (posts) => {
    if(posts.length == 0)
        app.innerHTML = '<h1>There are no posts yet';
    else{
        posts.forEach(displayPost);
        addEvent(['removePost', 'showUserProfile']);
    }
}

const initHTML = () => {
    if(!state.loggedIn){
        userInfo.innerHTML = `
            <ul>
                <li id="load-signup" class="btn sign-btn">SignUp</li>
                <li id="load-signin" class="btn sign-btn">SignIn</li>
            </ul>
        `;
        const signupButton = document.querySelector('#load-signup');
        signupButton.addEventListener('click', loadSignUpHTML);
        const signinButton = document.querySelector('#load-signin');
        signinButton.addEventListener('click', loadSignInHTML);
    } else {
        userInfo.innerHTML = `
            <ul>
                <li>
                    ${state.login.username} | &#8595;
                    <ul>
                        <li id="create">Create Post</li>
                        <hr>
                        <li id="signout">SignOut</li>
                    </ul>
                </li>
            </ul>
        `
        const signoutButton = document.querySelector('#signout');
        signoutButton.addEventListener('click', signout);
        const createPostButton = document.querySelector('#create');
        createPostButton.addEventListener('click', loadCreatePostHTML);
    }
    
    loadPosts();
}

window.onload = () => {
    initHTML();
}