import { useEffect, useState } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import { useRequest } from '../../hooks/use-request'
import Router from 'next/router'

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0)
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order ? order.id : null,
        },
        onSuccess: () => Router.push('/orders'),
    })

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date()
            setTimeLeft(Math.round(msLeft / 1000))
        }

        findTimeLeft()
        const timerId = setInterval(findTimeLeft, 1000)

        return () => {
            clearInterval(timerId)
        }
    }, [order])

    if (!order) {
        return <div>Loading...</div>
    }

    if (timeLeft < 0) {
        return <div>Order Expired</div>
    }

    return (
        <div>
            <h1>Order Details</h1>
            <p>Time left to pay: {timeLeft} seconds</p>
            <p>Order ID: {order.id}</p>
            <p>Ticket Title: {order.ticket.title}</p>
            <p>Ticket Price: {order.ticket.price}</p>
            <p>Status: {order.status}</p>
            {errors}
            <StripeCheckout
                token={({ id }) => doRequest({ token: id })}
                stripeKey="pk_test_51Sc5JnJ41CpzY99M3dE5NZAWDZcS2M4VwEiefKaGVWxJJ0lcjDXsPjzT029rStmdilSxcfq0vh7XPYyiFW4oLHT900MtoKuKAb"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
        </div>
    )
}

OrderShow.getInitialProps = async (context, client, currentUser) => {
    const { orderId } = context.query

    if (!orderId) {
        return {}
    }

    const { data } = await client.get(`/api/orders/${orderId}`)

    return { order: data }
}

export default OrderShow
