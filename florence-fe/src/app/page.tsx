'use client';

import { useState } from 'react';
import axios from 'axios';

export function Home() {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: any) => {
        setImage(e.target.files[0]);
        setResult(null); // Reset result when new image is selected
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!image) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post(
                'http://localhost:5001/predict',
                formData
            );
            console.log(response);
            setResult(response.data.result);
        } catch (error) {
            console.error('Error:', error);
            setResult({ error: 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='App'>
            <h1>Florence-2 Demo</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                />
                <button
                    type='submit'
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Get Result'}
                </button>
            </form>

            {image && (
                <div>
                    <h2>Preview:</h2>
                    <img
                        src={URL.createObjectURL(image)}
                        alt='Uploaded'
                        style={{ maxWidth: '300px' }}
                    />
                </div>
            )}

            {result && (
                <div>
                    <h2>Result:</h2>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default Home;
