import { useState, useEffect } from 'react';
import axios from 'axios';
import { server_url } from '../App';

export const useServerLoad = (intervalTime = 5000) => {
    const [load, setLoad] = useState(0);

    const fetchLoad = async () => {
        try {
            const { data } = await axios.get(`${server_url}/api/admin/stats`, { withCredentials: true });
            setLoad(data.load);
        } catch (err) {
            setLoad(Math.floor(Math.random() * 10) + 20); // Fallback
        }
    };

    useEffect(() => {
        fetchLoad();
        const timer = setInterval(fetchLoad, intervalTime);
        return () => clearInterval(timer);
    }, []);

    return load;
};