// app/login/page.jsx
'use client'; // Required for client-side features like useState

import { useState } from 'react';
import { Input } from '@/components/ui/input'; // Adjust path based on your setup
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Next.js navigation hook

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Placeholder for Flask /login endpoint
            const response = await axios.post('http://localhost:5001/login', {
                email,
                password,
            });
            console.log('Login successful:', response.data);
            router.push('/'); // Redirect to home (demo) page
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
            <div className='w-full max-w-md bg-white rounded-lg shadow-md p-6'>
                <h1 className='text-2xl font-bold text-slate-900 mb-6 text-center'>
                    Login
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className='flex flex-col gap-4'
                >
                    <div>
                        <label
                            htmlFor='email'
                            className='block text-sm font-medium text-slate-700 mb-1'
                        >
                            Email
                        </label>
                        <Input
                            id='email'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Enter your email'
                            className='w-full'
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor='password'
                            className='block text-sm font-medium text-slate-700 mb-1'
                        >
                            Password
                        </label>
                        <Input
                            id='password'
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Enter your password'
                            className='w-full'
                            required
                        />
                    </div>

                    {error && (
                        <p className='text-red-600 text-sm text-center'>
                            {error}
                        </p>
                    )}

                    <Button
                        type='submit'
                        disabled={loading}
                        className='bg-slate-700 hover:bg-slate-800 text-white mt-2'
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
