

const graphQlPostTypeSchema = `
    type PostType {
        _id: ID
        name: String
        label: String
        type: String
        createdBy: User
        status: Status
        fields: [FieldList]
        createdAt: String
        updatedAt: String
    }

    input PostTypeInput {
        _id: ID
        type: String
        label: String
        createdBy: ID
        status: Status
        fields: [FieldListInput]
        createdAt: String
        updatedAt: String
        slug: String
    }

    type FieldList {
        field: [Field]
        selected: Boolean
    }

    input FieldListInput {
        field: [FieldInput]
        selected: Boolean
    }

    type Field {
        name: String
        label: String
        type: String
        createdAt: String
    }

    input FieldInput {
        name: String
        label: String
        type: String
        createdAt: String
    }

    extend type Query {
        fetchPostTypes: [PostType]
        fetchFields: [Field]
        fetchFieldsBasedOnPostType(postType: String, postTypeId: String): [FieldList]
    }

    extend type Mutation {
        addPostType(postType: PostTypeInput): PostType
        updatePostType(postType: PostTypeInput): PostType
        deletePostType(postId: String): Boolean
    }
`

module.exports = graphQlPostTypeSchema;