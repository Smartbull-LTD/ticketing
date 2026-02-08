import { useEffect } from 'react'
import { useRequest } from '../../hooks/use-request'

export default () => {
    const { doRequest } = useRequest({
        url: '/api/users/signout',
        method: 'post',
        onSuccess: () => (window.location.href = '/'),
    })

    useEffect(() => {
        doRequest()
    }, [])

    return <div>Signing you out...</div>
}
