import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

declare global {
    var getCookie: (userId?: string) => string[]
}

jest.mock('../nats-wrapper')

process.env.STRIPE_KEY = 'sk_test_YOUR_STRIPE_KEY'

let mongo: any

beforeAll(async () => {
    process.env.JWT_KEY = 'testjwtkey'
    mongo = await MongoMemoryServer.create()
    const mongoUri = mongo.getUri()
    await mongoose.connect(mongoUri)
})

beforeEach(async () => {
    jest.clearAllMocks()
    if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections()

        for (let collection of collections) {
            await collection.deleteMany({})
        }
    }
})

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})

global.getCookie = (userId?: string) => {
    // Build a JWT payload.  {id, email}
    const payload = {
        id: userId || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
    }
    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!)

    // Build session object. {jwt: MY_JWT}
    const session = { jwt: token }

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session)

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64')

    // return a string thats the cookie with the encoded data
    return [`session=${base64}`]
}
