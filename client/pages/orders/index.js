const OrdersIndex = ({ orders }) => {
    const orderList = orders?.map((order) => {
        return (
            <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.ticket.title}</td>
                <td>{order.ticket.price}</td>
                <td>{order.status}</td>
            </tr>
        )
    })

    return (
        <div>
            <h1>My Orders</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Ticket</th>
                        <th>Price</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>{orderList}</tbody>
            </table>
        </div>
    )
}

OrdersIndex.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/orders')

    return { orders: data }
}

export default OrdersIndex
