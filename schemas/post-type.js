const { gql } = require('apollo-server-lambda');

const graphQlPostTypeSchema = `
    type PostType {
        _id: ID
        name: String
        label: String
        type: String
        description: [descriptionBlocks]
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
        description: [InputdescriptionBlock]
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

    type FieldInput {
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
        editPostType(postType: PostTypeInput): PostType
    }
`

module.exports = gql(graphQlPostTypeSchema);