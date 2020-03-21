const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post{
        _id: ID
        title: String
        body: String
        creator: User
        createdAt: String
        updatedAt: String
        error: String
    }

    type User{
        _id: ID!
        username: String!
        password: String
        posts: [Post]!
    }
    
    type AuthData{
        userId: ID!
        username: String!
        token: String!
        expiresIn: Int!
    }

    input PostInput{
        title: String!
        body: String!
    }

    input UserInput{
        username: String!
        password: String!
    }

    type RootQuery{
        posts: [Post!]!
        login(username: String!, password: String!): AuthData!
        user(_id: ID!): User!
    }

    type RootMutation{
        createUser(userInput: UserInput): User
        createPost(postInput: PostInput): Post
        removePost(_id: ID!): Post
    }

    schema{
        query: RootQuery
        mutation: RootMutation
    }
`)