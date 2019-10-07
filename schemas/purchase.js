
const { gql } = require('apollo-server-lambda');

const graphQlPurchaseSchema = `
    type Transaction {
        _id: ID!
        id: String
        status: String
        purchase_units: [PurchasedUnit]
        purchasedBy: User
        purchase_id: String
        sessionId: String
    }
    
    input TransactionInput {
        _id: ID
        id: String
        status: String
        purchase_units: [PurchasedUnitInput]
        purchasedBy: ID
        purchase_id: String
        sessionId: String
    }

    type PurchasedUnit {
        name: String
        amount: Float
        purchasedBy: User
        transaction_id: Transaction
        reference_id: Product
        status: String
        sessionId: String
    }

    input PurchasedUnitInput {
        name: String
        amount: Float
        purchasedBy: ID
        transaction_id: ID
        reference_id: ID
        sessionId: String
    }

    type AddTransactionResponse {
        purchasedUnits: [PurchasedUnit]
    }


    extend type Query {
        getPurchasedUnitsByUserId(userId: String): [PurchasedUnit]
    }


    extend type Mutation {
        addTransaction(transaction: TransactionInput): AddTransactionResponse
    }
`

module.exports = gql(graphQlPurchaseSchema);

